import { combineRgb, type CompanionPresetDefinitions, type CompanionPresetSection } from '@companion-module/base'
import type { ModuleSchema } from './main.js'
import type ModuleInstance from './main.js'
import { SLOT_NUMBERS } from './status.js'

const INACTIVE_COLOR = combineRgb(85, 85, 85)
const INACTIVE_BG = combineRgb(34, 34, 34)
const ACTIVE_COLOR = combineRgb(255, 255, 255)
const ACTIVE_BG = combineRgb(255, 0, 0)
const TOTH_BG = combineRgb(255, 153, 0)
const RESET_BG = combineRgb(0, 80, 160)
const WARN_BG = combineRgb(255, 165, 0)
const SILENCE_BG = combineRgb(255, 255, 0)
const TEXT_BG = combineRgb(40, 40, 40)

export function UpdatePresets(self: ModuleInstance): void {
	const structure: CompanionPresetSection[] = [
		{
			id: 'leds',
			name: 'LEDs',
			definitions: [
				{
					id: 'leds_group',
					name: 'LEDs',
					description: 'Toggle studio LEDs. Caption and colour follow OnAirScreen.',
					type: 'simple',
					presets: ['led1', 'led2', 'led3', 'led4'],
				},
			],
		},
		{
			id: 'air',
			name: 'AIR timers',
			definitions: [
				{
					id: 'air_group',
					name: 'AIR timers',
					description: 'AIR1 is the microphone. Buttons show the OnAirScreen caption and live elapsed/remaining time.',
					type: 'simple',
					presets: ['air1', 'air2', 'air3', 'air4', 'air3_toth', 'air3_reset', 'air4_reset'],
				},
			],
		},
		{
			id: 'texts',
			name: 'Texts / Alarms',
			definitions: [
				{
					id: 'texts_group',
					name: 'Texts / Alarms',
					description: 'Live NOW / NEXT / WARN, clear WARN, and silence alarm.',
					type: 'simple',
					presets: ['now_display', 'next_display', 'warn_display', 'warn_clear', 'silence'],
				},
			],
		},
	]

	const presets: CompanionPresetDefinitions<ModuleSchema> = {}

	for (const n of SLOT_NUMBERS) {
		presets[`led${n}`] = {
			type: 'simple',
			name: `LED ${n} toggle`,
			style: {
				text: `$(oas:led${n}_text)`,
				size: 'auto',
				color: INACTIVE_COLOR,
				bgcolor: INACTIVE_BG,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'led',
							options: { led: n, state: 'TOGGLE' },
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'led_on',
					options: { led: n },
					style: {
						color: ACTIVE_COLOR,
						bgcolor: ACTIVE_BG,
					},
				},
			],
		}

		presets[`air${n}`] = {
			type: 'simple',
			name: `AIR ${n} toggle`,
			style: {
				text: `$(oas:air${n}_text)\\n$(oas:air${n}_time)`,
				size: 'auto',
				color: INACTIVE_COLOR,
				bgcolor: INACTIVE_BG,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'air',
							options: { air: n, state: 'TOGGLE' },
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'air_on',
					options: { air: n },
					style: {
						color: ACTIVE_COLOR,
						bgcolor: ACTIVE_BG,
					},
				},
			],
		}
	}

	presets['air3_toth'] = {
		type: 'simple',
		name: 'AIR3 top-of-hour',
		style: {
			text: 'TOTH\\n$(oas:air3_time)',
			size: 'auto',
			color: INACTIVE_COLOR,
			bgcolor: INACTIVE_BG,
			show_topbar: false,
		},
		steps: [
			{
				down: [
					{
						actionId: 'air3_toh',
						options: { state: 'TOGGLE' },
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'air3_toth',
				options: {},
				style: {
					color: combineRgb(0, 0, 0),
					bgcolor: TOTH_BG,
				},
			},
		],
	}

	presets['air3_reset'] = {
		type: 'simple',
		name: 'Reset AIR3',
		style: {
			text: 'Reset\\nAIR3',
			size: 'auto',
			color: ACTIVE_COLOR,
			bgcolor: RESET_BG,
			show_topbar: false,
		},
		steps: [
			{
				down: [
					{
						actionId: 'air_reset',
						options: { air: 3 },
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['air4_reset'] = {
		type: 'simple',
		name: 'Reset AIR4',
		style: {
			text: 'Reset\\nAIR4',
			size: 'auto',
			color: ACTIVE_COLOR,
			bgcolor: RESET_BG,
			show_topbar: false,
		},
		steps: [
			{
				down: [
					{
						actionId: 'air_reset',
						options: { air: 4 },
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['now_display'] = {
		type: 'simple',
		name: 'NOW display',
		style: {
			text: 'NOW\\n$(oas:now)',
			size: 'auto',
			color: ACTIVE_COLOR,
			bgcolor: TEXT_BG,
			show_topbar: false,
		},
		steps: [{ down: [], up: [] }],
		feedbacks: [],
	}

	presets['next_display'] = {
		type: 'simple',
		name: 'NEXT display',
		style: {
			text: 'NEXT\\n$(oas:next)',
			size: 'auto',
			color: ACTIVE_COLOR,
			bgcolor: TEXT_BG,
			show_topbar: false,
		},
		steps: [{ down: [], up: [] }],
		feedbacks: [],
	}

	presets['warn_display'] = {
		type: 'simple',
		name: 'WARN display',
		style: {
			text: 'WARN\\n$(oas:warn)',
			size: 'auto',
			color: combineRgb(0, 0, 0),
			bgcolor: INACTIVE_BG,
			show_topbar: false,
		},
		steps: [{ down: [], up: [] }],
		feedbacks: [
			{
				feedbackId: 'warn_active',
				options: {},
				style: {
					color: combineRgb(0, 0, 0),
					bgcolor: WARN_BG,
				},
			},
		],
	}

	presets['warn_clear'] = {
		type: 'simple',
		name: 'Clear WARN',
		style: {
			text: 'Clear\\nWARN',
			size: 'auto',
			color: ACTIVE_COLOR,
			bgcolor: RESET_BG,
			show_topbar: false,
		},
		steps: [
			{
				down: [
					{
						actionId: 'warn',
						options: { priority: 0, text: '' },
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'warn_active',
				options: {},
				style: {
					color: combineRgb(0, 0, 0),
					bgcolor: WARN_BG,
				},
			},
		],
	}

	presets['silence'] = {
		type: 'simple',
		name: 'Silence alarm',
		style: {
			text: 'Silence\\n$(oas:silence)',
			size: 'auto',
			color: combineRgb(0, 0, 0),
			bgcolor: INACTIVE_BG,
			show_topbar: false,
		},
		steps: [{ down: [], up: [] }],
		feedbacks: [
			{
				feedbackId: 'silence',
				options: {},
				style: {
					color: combineRgb(0, 0, 0),
					bgcolor: SILENCE_BG,
				},
			},
		],
	}

	self.setPresetDefinitions(structure, presets)
}
