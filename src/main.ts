import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { buildStatusUrl, fetchJson } from './api.js'
import { DEFAULT_HTTP_PORT, DEFAULT_POLL_INTERVAL_MS, GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions, type VariablesSchema } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions, type ActionsSchema } from './actions.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { emptyStatus, parseStatus, statusToVariableValues, type OasStatus } from './status.js'

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
	private wasConnected = false

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = this.normalizeConfig(config)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updatePresets() // export Presets
		this.updateVariableDefinitions() // export variable definitions
		this.setVariableValues(statusToVariableValues(emptyStatus()))

		this.startPolling()
	}

	async destroy(): Promise<void> {
		this.stopPolling()
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = this.normalizeConfig(config)
		this.startPolling()
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

	private normalizeConfig(config: ModuleConfig): ModuleConfig {
		const port = Number(config.port)
		const pollInterval = Number(config.pollInterval)
		return {
			host: (config.host ?? '').trim() || '127.0.0.1',
			port: Number.isFinite(port) && port > 0 ? Math.floor(port) : DEFAULT_HTTP_PORT,
			pollInterval:
				Number.isFinite(pollInterval) && pollInterval >= 100 ? Math.floor(pollInterval) : DEFAULT_POLL_INTERVAL_MS,
		}
	}

	private startPolling(): void {
		this.stopPolling()

		if (!this.config.host) {
			this.updateStatus(InstanceStatus.BadConfig, 'Host is required')
			return
		}

		this.updateStatus(InstanceStatus.Connecting)
		void this.pollOnce()
		this.pollTimer = setInterval(() => {
			void this.pollOnce()
		}, this.config.pollInterval)
	}

	private stopPolling(): void {
		if (this.pollTimer) {
			clearInterval(this.pollTimer)
			this.pollTimer = undefined
		}
	}

	private async pollOnce(): Promise<void> {
		if (this.pollInFlight) {
			return
		}
		this.pollInFlight = true
		try {
			const json = await fetchJson(buildStatusUrl(this.config.host, this.config.port))
			this.lastStatus = parseStatus(json)
			this.setVariableValues(statusToVariableValues(this.lastStatus))
			this.checkAllFeedbacks()
			if (!this.wasConnected) {
				this.log('info', `Connected to OnAirScreen at ${this.config.host}:${this.config.port}`)
			}
			this.wasConnected = true
			this.updateStatus(InstanceStatus.Ok)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			if (this.wasConnected) {
				this.log('warn', `Lost connection to OnAirScreen: ${message}`)
			}
			this.wasConnected = false
			this.updateStatus(InstanceStatus.Disconnected, message)
		} finally {
			this.pollInFlight = false
		}
	}
}
