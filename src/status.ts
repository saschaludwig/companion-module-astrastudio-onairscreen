import { boolToVariable, formatAirTime } from './format.js'

export const SLOT_NUMBERS = [1, 2, 3, 4] as const
export type SlotNumber = (typeof SLOT_NUMBERS)[number]

export type LedStatus = {
	status: boolean
	text: string
}

export type AirStatus = {
	status: boolean
	seconds: number
	text: string
	topOfHour: boolean
}

export type OasStatus = {
	leds: Record<SlotNumber, LedStatus>
	air: Record<SlotNumber, AirStatus>
	now: string
	next: string
	warn: string
	warnings: unknown[]
	silence: boolean
	instance: string
	version: string
}

const EMPTY_LED: LedStatus = { status: false, text: '' }
const EMPTY_AIR: AirStatus = { status: false, seconds: 0, text: '', topOfHour: false }

export function emptyStatus(): OasStatus {
	return {
		leds: { 1: { ...EMPTY_LED }, 2: { ...EMPTY_LED }, 3: { ...EMPTY_LED }, 4: { ...EMPTY_LED } },
		air: { 1: { ...EMPTY_AIR }, 2: { ...EMPTY_AIR }, 3: { ...EMPTY_AIR }, 4: { ...EMPTY_AIR } },
		now: '',
		next: '',
		warn: '',
		warnings: [],
		silence: false,
		instance: '',
		version: '',
	}
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return undefined
	}
	return value as Record<string, unknown>
}

function readSlot(container: unknown, n: SlotNumber): unknown {
	const rec = asRecord(container)
	if (!rec) {
		return undefined
	}
	if (Object.prototype.hasOwnProperty.call(rec, String(n))) {
		return rec[String(n)]
	}
	if (Object.prototype.hasOwnProperty.call(rec, n)) {
		return rec[n as unknown as string]
	}
	return undefined
}

function asBool(value: unknown): boolean {
	if (typeof value === 'boolean') {
		return value
	}
	if (typeof value === 'number') {
		return value !== 0
	}
	if (typeof value === 'string') {
		const lowered = value.trim().toLowerCase()
		return lowered === 'true' || lowered === '1' || lowered === 'on'
	}
	return false
}

function asString(value: unknown): string {
	if (typeof value === 'string') {
		return value
	}
	if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
		return String(value)
	}
	return ''
}

function asSeconds(value: unknown): number {
	const n = typeof value === 'number' ? value : Number(value)
	if (!Number.isFinite(n)) {
		return 0
	}
	return Math.max(0, Math.floor(n))
}

function parseLed(value: unknown): LedStatus {
	const rec = asRecord(value)
	if (!rec) {
		return { ...EMPTY_LED }
	}
	return {
		status: asBool(rec.status),
		text: asString(rec.text),
	}
}

function parseAir(value: unknown): AirStatus {
	const rec = asRecord(value)
	if (!rec) {
		return { ...EMPTY_AIR }
	}
	return {
		status: asBool(rec.status),
		seconds: asSeconds(rec.seconds),
		text: asString(rec.text),
		topOfHour: asBool(rec.topOfHour),
	}
}

/**
 * Parse GET /api/status JSON. Python json.dumps uses string keys "1".."4" for leds and air.
 */
export function parseStatus(raw: unknown): OasStatus {
	const root = asRecord(raw) ?? {}
	const texts = asRecord(root.texts) ?? {}
	const status = emptyStatus()

	for (const n of SLOT_NUMBERS) {
		status.leds[n] = parseLed(readSlot(root.leds, n))
		status.air[n] = parseAir(readSlot(root.air, n))
	}

	status.now = asString(texts.now)
	status.next = asString(texts.next)
	status.warn = asString(texts.warn)
	status.warnings = Array.isArray(root.warnings) ? root.warnings : []
	status.silence = asBool(root.silence)
	status.instance = asString(root.instance)
	status.version = asString(root.version)
	return status
}

export function isLedOn(status: OasStatus, n: SlotNumber | number): boolean {
	const slot = SLOT_NUMBERS.find((item) => item === n)
	return slot ? status.leds[slot].status : false
}

export function isAirOn(status: OasStatus, n: SlotNumber | number): boolean {
	const slot = SLOT_NUMBERS.find((item) => item === n)
	return slot ? status.air[slot].status : false
}

export function isAir3Toth(status: OasStatus): boolean {
	return status.air[3].topOfHour
}

export function isSilence(status: OasStatus): boolean {
	return status.silence
}

export function isWarnActive(status: OasStatus): boolean {
	return status.warn.trim() !== '' || status.warnings.length > 0
}

export function statusToVariableValues(status: OasStatus): Record<string, string> {
	const values: Record<string, string> = {
		air3_toth: boolToVariable(isAir3Toth(status)),
		now: status.now,
		next: status.next,
		warn: status.warn,
		silence: boolToVariable(status.silence),
		instance: status.instance,
		version: status.version,
	}

	for (const n of SLOT_NUMBERS) {
		const led = status.leds[n]
		const air = status.air[n]
		values[`led${n}_status`] = boolToVariable(led.status)
		values[`led${n}_text`] = led.text
		values[`air${n}_status`] = boolToVariable(air.status)
		values[`air${n}_seconds`] = String(air.seconds)
		values[`air${n}_time`] = formatAirTime(air.seconds)
		values[`air${n}_text`] = air.text
	}

	return values
}
