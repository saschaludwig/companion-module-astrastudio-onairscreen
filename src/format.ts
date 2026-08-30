/**
 * Format elapsed/remaining seconds like OnAirScreen AIR labels: m:SS
 * Example: 125 -> "2:05", 5 -> "0:05"
 */
export function formatAirTime(seconds: number): string {
	const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
	const minutes = Math.floor(total / 60)
	const remainder = total % 60
	return `${minutes}:${remainder.toString().padStart(2, '0')}`
}

const MAX_AIR3_SECONDS = 359999
const CLOCK_PATTERN = /^(\d+):(\d{1,2})$/
const SECONDS_PATTERN = /^\d+$/

/**
 * Parse AIR3 time from `m:ss` (or `mm:ss`) or a raw seconds integer.
 * Throws if the value is empty, has seconds > 59, or is otherwise invalid.
 */
export function parseAirTimeToSeconds(input: string): number {
	const trimmed = input.trim()
	if (trimmed === '') {
		throw new Error('AIR3 time is empty')
	}

	const clock = CLOCK_PATTERN.exec(trimmed)
	if (clock) {
		const minutes = Number(clock[1])
		const seconds = Number(clock[2])
		if (seconds > 59) {
			throw new Error(`Invalid AIR3 time "${input}": seconds must be 0-59`)
		}
		const total = minutes * 60 + seconds
		if (total > MAX_AIR3_SECONDS) {
			throw new Error(`Invalid AIR3 time "${input}": maximum is ${formatAirTime(MAX_AIR3_SECONDS)}`)
		}
		return total
	}

	if (SECONDS_PATTERN.test(trimmed)) {
		const total = Number(trimmed)
		if (total > MAX_AIR3_SECONDS) {
			throw new Error(`Invalid AIR3 time "${input}": maximum is ${MAX_AIR3_SECONDS} seconds`)
		}
		return total
	}

	throw new Error(`Invalid AIR3 time "${input}": use m:ss or seconds`)
}

export function boolToVariable(value: boolean): string {
	return value ? 'true' : 'false'
}
