import { parseAirTimeToSeconds } from './format.js'
import type { SlotNumber } from './status.js'

export type ToggleState = 'ON' | 'OFF' | 'TOGGLE'
export type TextField = 'NOW' | 'NEXT' | 'WARN'
export type ResetAir = 3 | 4
export type WarnPriority = 0 | 1 | 2

export function ledCommand(led: SlotNumber, state: ToggleState): string {
	return `LED${led}:${state}`
}

export function airCommand(air: SlotNumber, state: ToggleState): string {
	return `AIR${air}:${state}`
}

export function airResetCommand(air: ResetAir): string {
	return `AIR${air}:RESET`
}

export function air3TohCommand(state: ToggleState): string {
	return `AIR3TOH:${state}`
}

export function air3TimeCommand(seconds: number): string {
	const total = Math.max(0, Math.floor(seconds))
	return `AIR3TIME:${total}`
}

export function air3TimeFromClock(time: string): string {
	return air3TimeCommand(parseAirTimeToSeconds(time))
}

export function textFieldCommand(field: TextField, text: string): string {
	return `${field}:${text}`
}

/**
 * WARN:text (priority 0), WARN:1:text / WARN:2:text.
 * Empty text clears that priority (WARN:, WARN:1:, WARN:2:).
 */
export function warnCommand(priority: WarnPriority, text: string): string {
	if (priority === 0) {
		return text === '' ? 'WARN:' : `WARN:${text}`
	}
	return text === '' ? `WARN:${priority}:` : `WARN:${priority}:${text}`
}

export { parseAirTimeToSeconds }
