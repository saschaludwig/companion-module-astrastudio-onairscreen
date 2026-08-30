import type ModuleInstance from './main.js'
import { sendCommand } from './api.js'
import { SLOT_NUMBERS, type SlotNumber } from './status.js'

export type ToggleState = 'ON' | 'OFF' | 'TOGGLE'
export type TextField = 'NOW' | 'NEXT' | 'WARN'
export type ResetAir = 3 | 4

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
			seconds: number
		}
	}
	set_text: {
		options: {
			field: TextField
			text: string
		}
	}
	raw_command: {
		options: {
			command: string
		}
	}
}

const TOGGLE_CHOICES = [
	{ id: 'TOGGLE', label: 'Toggle' },
	{ id: 'ON', label: 'On' },
	{ id: 'OFF', label: 'Off' },
]

const LED_CHOICES = SLOT_NUMBERS.map((n) => ({ id: n, label: `LED ${n}` }))
const AIR_CHOICES = SLOT_NUMBERS.map((n) => ({
	id: n,
	label: n === 1 ? 'AIR 1 (MIC)' : `AIR ${n}`,
}))

async function send(self: ModuleInstance, command: string): Promise<void> {
	try {
		await sendCommand(self.config.host, self.config.port, command)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		self.log('error', `Command "${command}" failed: ${message}`)
	}
}

function asSlot(value: number): SlotNumber {
	return SLOT_NUMBERS.find((item) => item === value) ?? 1
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
				await send(self, `LED${asSlot(event.options.led)}:${event.options.state}`)
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
				await send(self, `AIR${asSlot(event.options.air)}:${event.options.state}`)
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
				const air = event.options.air === 4 ? 4 : 3
				await send(self, `AIR${air}:RESET`)
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
				await send(self, `AIR3TOH:${event.options.state}`)
			},
		},
		air3_time: {
			name: 'Set AIR3 time',
			description: 'Set the radio timer (AIR3) to a number of seconds',
			options: [
				{
					id: 'seconds',
					type: 'number',
					label: 'Seconds',
					default: 0,
					min: 0,
					max: 359999,
				},
			],
			callback: async (event) => {
				const seconds = Math.max(0, Math.floor(event.options.seconds))
				await send(self, `AIR3TIME:${seconds}`)
			},
		},
		set_text: {
			name: 'Set text field',
			description: 'Set NOW, NEXT, or WARN',
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
				await send(self, `${event.options.field}:${event.options.text}`)
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
	})
}
