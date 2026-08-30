import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { buildStatusUrl, fetchJson } from './api.js'
import {
	DEFAULT_HTTP_PORT,
	DEFAULT_POLL_INTERVAL_MS,
	DEFAULT_USE_WEBSOCKET,
	GetConfigFields,
	type ModuleConfig,
} from './config.js'
import { UpdateVariableDefinitions, type VariablesSchema } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions, type ActionsSchema } from './actions.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { connectionStatusMessage, emptyStatus, parseStatus, statusToVariableValues, type OasStatus } from './status.js'
import { buildWsUrl, DEFAULT_WS_RECONNECT_MS, parseWsPort } from './ws.js'

export type ModuleSchema = {
	config: ModuleConfig
	secrets: undefined
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export { UpgradeScripts }

export default class ModuleInstance extends InstanceBase<ModuleSchema> {
	config!: ModuleConfig // Setup in init()
	lastStatus: OasStatus | null = null

	private pollTimer: ReturnType<typeof setInterval> | undefined
	private pollInFlight = false
	private pendingRefresh = false
	private wasConnected = false
	private destroyed = false

	private websocket: WebSocket | undefined
	private wsConnected = false
	private wsClosing = false
	private wsReconnectTimer: ReturnType<typeof setTimeout> | undefined

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = this.normalizeConfig(config)

		this.updateActions()
		this.updateFeedbacks()
		this.updatePresets()
		this.updateVariableDefinitions()
		this.setVariableValues(statusToVariableValues(emptyStatus()))

		this.startTransport()
	}

	async destroy(): Promise<void> {
		this.destroyed = true
		this.stopTransport()
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = this.normalizeConfig(config)
		this.startTransport()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	/**
	 * Re-read /api/status immediately (used after actions). Queues a follow-up
	 * poll if one is already in flight so the button state is not skipped.
	 */
	async refreshStatus(): Promise<void> {
		if (this.destroyed) {
			return
		}
		if (this.pollInFlight) {
			this.pendingRefresh = true
			return
		}

		this.pollInFlight = true
		try {
			const json = await fetchJson(buildStatusUrl(this.config.host, this.config.port))
			this.applyParsedStatus(parseStatus(json))
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			if (this.wsConnected) {
				this.log('warn', `HTTP status refresh failed (WebSocket still connected): ${message}`)
			} else {
				if (this.wasConnected) {
					this.log('warn', `Lost connection to OnAirScreen: ${message}`)
				}
				this.wasConnected = false
				this.updateStatus(InstanceStatus.Disconnected, message)
			}
		} finally {
			this.pollInFlight = false
			if (this.pendingRefresh) {
				this.pendingRefresh = false
				void this.refreshStatus()
			}
		}
	}

	private normalizeConfig(config: ModuleConfig): ModuleConfig {
		const port = Number(config.port)
		const pollInterval = Number(config.pollInterval)
		const wsPortRaw = config.wsPort
		const wsPortNumber = parseWsPort(wsPortRaw)
		return {
			host: (config.host ?? '').trim() || '127.0.0.1',
			port: Number.isFinite(port) && port > 0 ? Math.floor(port) : DEFAULT_HTTP_PORT,
			pollInterval:
				Number.isFinite(pollInterval) && pollInterval >= 100 ? Math.floor(pollInterval) : DEFAULT_POLL_INTERVAL_MS,
			useWebSocket: config.useWebSocket ?? DEFAULT_USE_WEBSOCKET,
			wsPort: wsPortNumber > 0 ? String(wsPortNumber) : '',
		}
	}

	private startTransport(): void {
		this.stopTransport()

		if (!this.config.host) {
			this.updateStatus(InstanceStatus.BadConfig, 'Host is required')
			return
		}

		this.updateStatus(InstanceStatus.Connecting)
		void this.refreshStatus()
		this.startPolling()

		if (this.config.useWebSocket) {
			this.connectWebSocket()
		}
	}

	private stopTransport(): void {
		this.stopPolling()
		this.disconnectWebSocket()
	}

	private startPolling(): void {
		this.stopPolling()
		this.pollTimer = setInterval(() => {
			void this.refreshStatus()
		}, this.config.pollInterval)
	}

	private stopPolling(): void {
		if (this.pollTimer) {
			clearInterval(this.pollTimer)
			this.pollTimer = undefined
		}
	}

	private applyParsedStatus(status: OasStatus): void {
		if (this.destroyed) {
			return
		}
		this.lastStatus = status
		this.setVariableValues(statusToVariableValues(status))
		this.checkAllFeedbacks()
		if (!this.wasConnected) {
			this.log('info', `Connected to OnAirScreen at ${this.config.host}:${this.config.port}`)
		}
		this.wasConnected = true
		this.updateStatus(InstanceStatus.Ok, connectionStatusMessage(status) ?? null)
	}

	private connectWebSocket(): void {
		if (this.destroyed || !this.config.useWebSocket) {
			return
		}

		this.disconnectWebSocket()
		this.wsClosing = false

		const url = buildWsUrl(this.config.host, this.config.port, this.config.wsPort)
		let socket: WebSocket
		try {
			socket = new WebSocket(url)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.log('warn', `WebSocket connect failed (${url}): ${message}`)
			this.startPolling()
			this.scheduleWsReconnect()
			return
		}

		this.websocket = socket

		socket.addEventListener('open', () => {
			if (this.websocket !== socket) {
				return
			}
			this.wsConnected = true
			this.stopPolling()
			this.log('info', `WebSocket connected at ${url}`)
		})

		socket.addEventListener('message', (event) => {
			if (this.websocket !== socket) {
				return
			}
			try {
				const json: unknown = JSON.parse(String(event.data))
				this.applyParsedStatus(parseStatus(json))
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error)
				this.log('warn', `Invalid WebSocket status JSON: ${message}`)
			}
		})

		socket.addEventListener('close', () => {
			if (this.websocket !== socket) {
				return
			}
			this.wsConnected = false
			this.websocket = undefined
			if (this.wsClosing || this.destroyed || !this.config.useWebSocket) {
				return
			}
			this.log('warn', 'WebSocket disconnected; falling back to HTTP poll')
			this.startPolling()
			this.scheduleWsReconnect()
		})

		socket.addEventListener('error', () => {
			if (this.websocket !== socket) {
				return
			}
			this.log('warn', `WebSocket error at ${url}`)
		})
	}

	private disconnectWebSocket(): void {
		this.clearWsReconnect()
		this.wsClosing = true
		this.wsConnected = false
		if (this.websocket) {
			this.websocket.close()
			this.websocket = undefined
		}
	}

	private scheduleWsReconnect(): void {
		this.clearWsReconnect()
		this.wsReconnectTimer = setTimeout(() => {
			this.wsReconnectTimer = undefined
			if (!this.destroyed && this.config.useWebSocket && !this.wsConnected) {
				this.connectWebSocket()
			}
		}, DEFAULT_WS_RECONNECT_MS)
	}

	private clearWsReconnect(): void {
		if (this.wsReconnectTimer) {
			clearTimeout(this.wsReconnectTimer)
			this.wsReconnectTimer = undefined
		}
	}
}
