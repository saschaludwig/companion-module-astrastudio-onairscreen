import type { SomeCompanionConfigField } from '@companion-module/base'

export const DEFAULT_HTTP_PORT = 8010
export const DEFAULT_POLL_INTERVAL_MS = 500
export const DEFAULT_REQUEST_TIMEOUT_MS = 2500
export const DEFAULT_USE_WEBSOCKET = true
export const DEFAULT_WS_PORT = ''

export type ModuleConfig = {
	host: string
	port: number
	pollInterval: number
	useWebSocket: boolean
	/** Empty string means HTTP port + 1. A number string is an explicit override. */
	wsPort: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'OnAirScreen IP / Hostname',
			width: 8,
			default: '127.0.0.1',
		},
		{
			type: 'number',
			id: 'port',
			label: 'HTTP Port',
			width: 4,
			min: 1,
			max: 65535,
			default: DEFAULT_HTTP_PORT,
			tooltip: 'OnAirScreen HTTP port (Settings → Network). Default 8010.',
		},
		{
			type: 'checkbox',
			id: 'useWebSocket',
			label: 'Use WebSocket for live status',
			width: 8,
			default: DEFAULT_USE_WEBSOCKET,
			tooltip:
				'Connect to OnAirScreen WebSocket (HTTP port + 1) for live LED/text and 1s AIR ticks. Falls back to HTTP poll if the socket is down.',
		},
		{
			type: 'textinput',
			id: 'wsPort',
			label: 'WebSocket Port',
			width: 4,
			default: DEFAULT_WS_PORT,
			tooltip:
				'Leave empty to use HTTP port + 1 (8011 when HTTP is 8010). Set a port only if OnAirScreen is not using that mapping.',
		},
		{
			type: 'number',
			id: 'pollInterval',
			label: 'Poll interval (ms)',
			width: 4,
			min: 100,
			max: 10000,
			default: DEFAULT_POLL_INTERVAL_MS,
			tooltip:
				'HTTP /api/status interval used when WebSocket is off or disconnected. 500 ms keeps AIR times close to the studio display.',
		},
	]
}
