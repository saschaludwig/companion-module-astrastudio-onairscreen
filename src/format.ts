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

export function boolToVariable(value: boolean): string {
	return value ? 'true' : 'false'
}
