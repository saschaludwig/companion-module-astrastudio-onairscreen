import { DEFAULT_HTTP_PORT } from './config.js'

export const DEFAULT_WS_RECONNECT_MS = 3000

/**
 * WebSocket port: 0 / unset / empty means HTTP port + 1 (OnAirScreen default).
 * If HTTP+1 would overflow 65535, fall back to 8011 like OnAirScreen.
 */
export function parseWsPort(raw: unknown): number {
	if (raw === undefined || raw === null || raw === '') {
		return 0
	}
	if (typeof raw === 'number') {
		if (!Number.isFinite(raw) || raw <= 0) {
			return 0
		}
		return Math.min(65535, Math.floor(raw))
	}
	if (typeof raw === 'string') {
		const n = Number(raw.trim())
		if (!Number.isFinite(n) || n <= 0) {
			return 0
		}
		return Math.min(65535, Math.floor(n))
	}
	return 0
}

export function resolveWsPort(httpPort: number, wsPort: unknown): number {
	const explicit = parseWsPort(wsPort)
	if (explicit > 0) {
		return explicit
	}
	const auto = httpPort + 1
	return auto > 65535 ? DEFAULT_HTTP_PORT + 1 : auto
}

export function buildWsUrl(host: string, httpPort: number, wsPort: unknown): string {
	const trimmedHost = host.trim()
	return `ws://${trimmedHost}:${resolveWsPort(httpPort, wsPort)}`
}
