import { combineRgb, type CompanionPresetDefinitions, type CompanionPresetSection } from '@companion-module/base'
import type { ModuleSchema } from './main.js'
import type ModuleInstance from './main.js'
import { SLOT_NUMBERS, type SlotNumber } from './status.js'

const INACTIVE_COLOR = combineRgb(85, 85, 85)
const INACTIVE_BG = combineRgb(34, 34, 34)
const ACTIVE_COLOR = combineRgb(255, 255, 255)
const ACTIVE_BG = combineRgb(255, 0, 0)
const TOTH_BG = combineRgb(255, 153, 0)
const RESET_BG = combineRgb(0, 80, 160)

const AIR_BUTTON_LABELS: Record<SlotNumber, string> = {
	1: 'MIC',
	2: 'Phone',
	3: 'Timer',
	4: 'Stream',
}

export function UpdatePresets(self: ModuleInstance): void {
	const structure: CompanionPresetSection[] = [
		{
			id: 'leds',
			name: 'LEDs',
			definitions: [
				{
					id: 'leds_group',
					name: 'LEDs',
					description: 'Toggle studio LEDs. Colour follows OnAirScreen status.',
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
					description: 'AIR1 is the microphone (MIC). Buttons show live elapsed/remaining time.',
					type: 'simple',
					presets: ['air1', 'air2', 'air3', 'air4', 'air3_toth', 'air3_reset', 'air4_reset'],
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
			name: `${AIR_BUTTON_LABELS[n]} (AIR${n}) toggle`,
			style: {
				text: `${AIR_BUTTON_LABELS[n]}\\n$(oas:air${n}_time)`,
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

	self.setPresetDefinitions(structure, presets)
}
