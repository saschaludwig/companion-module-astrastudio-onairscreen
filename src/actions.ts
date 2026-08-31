import type ModuleInstance from './main.js'
import { sendCommand } from './api.js'
import {
	air3TimeFromClock,
	air3TohCommand,
	airCommand,
	airResetCommand,
	ledCommand,
	textFieldCommand,
	warnCommand,
	lufsIntegratedCommand,
	type ResetAir,
	type TextField,
	type ToggleState,
	type LufsState,
	type WarnPriority,
} from './commands.js'
import { SLOT_NUMBERS, type SlotNumber } from './status.js'

export type ActionsSchema = {
	led: {
		options: {
			led: SlotNumber
			state: ToggleState
		}
	}
	air: {
		options: {
			air: SlotNumber
			state: ToggleState
		}
	}
	air_reset: {
		options: {
			air: ResetAir
		}
	}
	air3_toh: {
		options: {
			state: ToggleState
		}
	}
	air3_time: {
		options: {
			time: string
		}
	}
	set_text: {
		options: {
			field: TextField
			text: string
		}
	}
	warn: {
		options: {
			priority: WarnPriority
			text: string
		}
	}
	raw_command: {
		options: {
			command: string
		}
	}
	lufs_integrated: {
		options: {
			state: LufsState
		}
	}
}

const TOGGLE_CHOICES = [
	{ id: 'TOGGLE', label: 'Toggle' },
	{ id: 'ON', label: 'On' },
	{ id: 'OFF', label: 'Off' },
]

const LUFS_CHOICES = [
	{ id: 'TOGGLE', label: 'Toggle' },
	{ id: 'START', label: 'Start (reset)' },
	{ id: 'STOP', label: 'Stop' },
	{ id: 'RESET', label: 'Reset (hide if stopped)' },
]

const LED_CHOICES = SLOT_NUMBERS.map((n) => ({ id: n, label: `LED ${n}` }))
const AIR_CHOICES = SLOT_NUMBERS.map((n) => ({
	id: n,
	label: n === 1 ? 'AIR 1 (MIC)' : `AIR ${n}`,
}))

const WARN_PRIORITY_CHOICES = [
	{ id: 0, label: '0 — Normal / Legacy (WARN:text)' },
	{ id: 1, label: '1 — Medium (WARN:1:text)' },
	{ id: 2, label: '2 — High (WARN:2:text)' },
]

async function send(self: ModuleInstance, command: string): Promise<void> {
	try {
		await sendCommand(self.config.host, self.config.port, command)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		self.log('error', `Command "${command}" failed: ${message}`)
		throw error
	}
	await self.refreshStatus()
}

function asSlot(value: number | string): SlotNumber {
	const n = Number(value)
	return SLOT_NUMBERS.find((item) => item === n) ?? 1
}

function asWarnPriority(value: number | string): WarnPriority {
	const n = Number(value)
	if (n === 1 || n === 2) {
		return n
	}
	return 0
}

function asTextField(value: string): TextField {
	if (value === 'NEXT' || value === 'WARN') {
		return value
	}
	return 'NOW'
}

function asLufsState(value: string): LufsState {
	if (value === 'START' || value === 'STOP' || value === 'RESET') {
		return value
	}
	return 'TOGGLE'
}

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		led: {
			name: 'LED',
			description: 'Switch LED 1–4 on, off, or toggle',
			options: [
				{
					id: 'led',
					type: 'dropdown',
					label: 'LED',
					default: 1,
					choices: LED_CHOICES,
				},
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'TOGGLE',
					choices: TOGGLE_CHOICES,
				},
			],
			callback: async (event) => {
				await send(self, ledCommand(asSlot(event.options.led), event.options.state))
			},
		},
		air: {
			name: 'AIR timer',
			description: 'Start, stop, or toggle AIR 1–4 (AIR1 = microphone)',
			options: [
				{
					id: 'air',
					type: 'dropdown',
					label: 'AIR',
					default: 1,
					choices: AIR_CHOICES,
				},
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'TOGGLE',
					choices: TOGGLE_CHOICES,
				},
			],
			callback: async (event) => {
				await send(self, airCommand(asSlot(event.options.air), event.options.state))
			},
		},
		air_reset: {
			name: 'Reset AIR timer',
			description: 'Reset AIR3 or AIR4 to 0:00',
			options: [
				{
					id: 'air',
					type: 'dropdown',
					label: 'AIR',
					default: 3,
					choices: [
						{ id: 3, label: 'AIR 3' },
						{ id: 4, label: 'AIR 4' },
					],
				},
			],
			callback: async (event) => {
				const air: ResetAir = Number(event.options.air) === 4 ? 4 : 3
				await send(self, airResetCommand(air))
			},
		},
		air3_toh: {
			name: 'AIR3 top-of-hour',
			description: 'Start, stop, or toggle the AIR3 top-of-hour countdown',
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'TOGGLE',
					choices: TOGGLE_CHOICES,
				},
			],
			callback: async (event) => {
				await send(self, air3TohCommand(event.options.state))
			},
		},
		air3_time: {
			name: 'Set AIR3 time',
			description: 'Set the radio timer (AIR3) as m:ss (e.g. 2:05) or as raw seconds',
			options: [
				{
					id: 'time',
					type: 'textinput',
					label: 'Time (m:ss or seconds)',
					default: '0:00',
					tooltip: 'Examples: 2:05, 0:30, or 125',
				},
			],
			callback: async (event) => {
				await send(self, air3TimeFromClock(event.options.time))
			},
		},
		set_text: {
			name: 'Set text field',
			description: 'Set NOW, NEXT, or WARN (WARN uses priority 0)',
			options: [
				{
					id: 'field',
					type: 'dropdown',
					label: 'Field',
					default: 'NOW',
					choices: [
						{ id: 'NOW', label: 'NOW' },
						{ id: 'NEXT', label: 'NEXT' },
						{ id: 'WARN', label: 'WARN' },
					],
				},
				{
					id: 'text',
					type: 'textinput',
					label: 'Text',
					default: '',
				},
			],
			callback: async (event) => {
				await send(self, textFieldCommand(asTextField(event.options.field), event.options.text))
			},
		},
		warn: {
			name: 'WARN',
			description: 'Set or clear a warning. Empty text clears that priority (WARN:, WARN:1:, WARN:2:).',
			options: [
				{
					id: 'priority',
					type: 'dropdown',
					label: 'Priority',
					default: 0,
					choices: WARN_PRIORITY_CHOICES,
				},
				{
					id: 'text',
					type: 'textinput',
					label: 'Text (empty = clear)',
					default: '',
				},
			],
			callback: async (event) => {
				await send(self, warnCommand(asWarnPriority(event.options.priority), event.options.text))
			},
		},
		raw_command: {
			name: 'Raw command',
			description: 'Send a raw COMMAND:VALUE string (CONF, WARN:1:, etc.)',
			options: [
				{
					id: 'command',
					type: 'textinput',
					label: 'Command',
					default: 'LED1:TOGGLE',
				},
			],
			callback: async (event) => {
				await send(self, event.options.command)
			},
		},
		lufs_integrated: {
			name: 'Loudness I+LRA',
			description: 'Start, stop, toggle, or reset I + LRA (reset restarts if running, hides markers if stopped)',
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'TOGGLE',
					choices: LUFS_CHOICES,
				},
			],
			callback: async (event) => {
				await send(self, lufsIntegratedCommand(asLufsState(event.options.state)))
			},
		},
	})
}
