import type { SomeCompanionConfigField } from '@companion-module/base'

export const DEFAULT_HTTP_PORT = 8010
export const DEFAULT_POLL_INTERVAL_MS = 500
export const DEFAULT_REQUEST_TIMEOUT_MS = 2500

export type ModuleConfig = {
	host: string
	port: number
	pollInterval: number
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
			type: 'number',
			id: 'pollInterval',
			label: 'Poll interval (ms)',
			width: 4,
			min: 100,
			max: 10000,
			default: DEFAULT_POLL_INTERVAL_MS,
			tooltip: 'How often to read /api/status. 500 ms keeps AIR times close to the studio display.',
		},
	]
}
