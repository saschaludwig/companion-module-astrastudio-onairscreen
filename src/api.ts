import { DEFAULT_HTTP_PORT, DEFAULT_REQUEST_TIMEOUT_MS } from './config.js'

export type FetchLike = typeof fetch

export function buildBaseUrl(host: string, port: number): string {
	const trimmedHost = host.trim()
	const safePort = Number.isFinite(port) && port > 0 ? port : DEFAULT_HTTP_PORT
	return `http://${trimmedHost}:${safePort}`
}

export function buildStatusUrl(host: string, port: number): string {
	return `${buildBaseUrl(host, port)}/api/status`
}

export function buildCommandUrl(host: string, port: number, command: string): string {
	return `${buildBaseUrl(host, port)}/api/command?cmd=${encodeURIComponent(command)}`
}

export async function fetchJson(
	url: string,
	timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
	fetchImpl: FetchLike = fetch,
): Promise<unknown> {
	const response = await fetchImpl(url, {
		method: 'GET',
		signal: AbortSignal.timeout(timeoutMs),
	})
	if (!response.ok) {
		throw new Error(`HTTP ${response.status} ${response.statusText}`)
	}
	return response.json()
}

export async function sendCommand(
	host: string,
	port: number,
	command: string,
	timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
	fetchImpl: FetchLike = fetch,
): Promise<void> {
	const url = buildCommandUrl(host, port, command)
	const response = await fetchImpl(url, {
		method: 'GET',
		signal: AbortSignal.timeout(timeoutMs),
	})
	if (!response.ok) {
		throw new Error(`HTTP ${response.status} ${response.statusText}`)
	}
}
