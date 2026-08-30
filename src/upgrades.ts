import type { CompanionStaticUpgradeScript } from '@companion-module/base'
import type { ModuleConfig } from './config.js'
import { formatAirTime } from './format.js'

function plainNumber(raw: unknown): number | undefined {
	if (typeof raw === 'number' && Number.isFinite(raw)) {
		return raw
	}
	if (typeof raw === 'string' && raw.trim() !== '') {
		const n = Number(raw)
		return Number.isFinite(n) ? n : undefined
	}
	if (raw && typeof raw === 'object' && 'value' in raw && 'isExpression' in raw) {
		const wrapped = raw as { value: unknown; isExpression: boolean }
		if (!wrapped.isExpression && typeof wrapped.value === 'number' && Number.isFinite(wrapped.value)) {
			return wrapped.value
		}
	}
	return undefined
}

/**
 * Convert the old air3_time `seconds` number option to a `time` clock string.
 */
const upgradeAir3TimeToClock: CompanionStaticUpgradeScript<ModuleConfig> = (_context, props) => {
	const updatedActions = []

	for (const action of props.actions) {
		if (action.actionId !== 'air3_time') {
			continue
		}
		if (action.options.time !== undefined) {
			continue
		}
		const seconds = plainNumber(action.options.seconds)
		action.options.time = { value: formatAirTime(seconds ?? 0), isExpression: false }
		delete action.options.seconds
		updatedActions.push(action)
	}

	return {
		updatedConfig: null,
		updatedActions,
		updatedFeedbacks: [],
	}
}

/**
 * Existing connections created before 1.0.0 have no WebSocket fields.
 * Companion will not save the connection while a missing number field is empty.
 */
const upgradeAddWebsocketConfig: CompanionStaticUpgradeScript<ModuleConfig> = (_context, props) => {
	if (!props.config) {
		return { updatedConfig: null, updatedActions: [], updatedFeedbacks: [] }
	}

	const incoming = props.config as ModuleConfig & { useWebSocket?: boolean; wsPort?: string | number | null }
	const config: ModuleConfig = { ...incoming }
	let changed = false

	if (incoming.useWebSocket === undefined) {
		config.useWebSocket = true
		changed = true
	}

	const rawWsPort: unknown = incoming.wsPort
	if (rawWsPort === undefined || rawWsPort === null) {
		config.wsPort = ''
		changed = true
	} else if (typeof rawWsPort === 'number') {
		config.wsPort = rawWsPort > 0 ? String(rawWsPort) : ''
		changed = true
	}

	return {
		updatedConfig: changed ? config : null,
		updatedActions: [],
		updatedFeedbacks: [],
	}
}

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig>[] = [
	upgradeAir3TimeToClock,
	upgradeAddWebsocketConfig,
]
