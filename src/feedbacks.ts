import { combineRgb } from '@companion-module/base'
import type ModuleInstance from './main.js'
import { isAir3Toth, isAirOn, isLedOn, isSilence, isWarnActive, SLOT_NUMBERS, type SlotNumber } from './status.js'

export type FeedbacksSchema = {
	led_on: {
		type: 'boolean'
		options: {
			led: SlotNumber
		}
	}
	air_on: {
		type: 'boolean'
		options: {
			air: SlotNumber
		}
	}
	air3_toth: {
		type: 'boolean'
		options: Record<string, never>
	}
	silence: {
		type: 'boolean'
		options: Record<string, never>
	}
	warn_active: {
		type: 'boolean'
		options: Record<string, never>
	}
}

const ACTIVE_STYLE = {
	bgcolor: combineRgb(255, 0, 0),
	color: combineRgb(255, 255, 255),
}

function asSlot(value: number): SlotNumber {
	return SLOT_NUMBERS.find((item) => item === value) ?? 1
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		led_on: {
			name: 'LED is on',
			type: 'boolean',
			defaultStyle: ACTIVE_STYLE,
			options: [
				{
					id: 'led',
					type: 'dropdown',
					label: 'LED',
					default: 1,
					choices: SLOT_NUMBERS.map((n) => ({ id: n, label: `LED ${n}` })),
				},
			],
			callback: (feedback) => {
				if (!self.lastStatus) {
					return false
				}
				return isLedOn(self.lastStatus, asSlot(feedback.options.led))
			},
		},
		air_on: {
			name: 'AIR timer is running',
			type: 'boolean',
			defaultStyle: ACTIVE_STYLE,
			options: [
				{
					id: 'air',
					type: 'dropdown',
					label: 'AIR',
					default: 1,
					choices: SLOT_NUMBERS.map((n) => ({
						id: n,
						label: n === 1 ? 'AIR 1 (MIC)' : `AIR ${n}`,
					})),
				},
			],
			callback: (feedback) => {
				if (!self.lastStatus) {
					return false
				}
				return isAirOn(self.lastStatus, asSlot(feedback.options.air))
			},
		},
		air3_toth: {
			name: 'AIR3 top-of-hour is active',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 153, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				if (!self.lastStatus) {
					return false
				}
				return isAir3Toth(self.lastStatus)
			},
		},
		silence: {
			name: 'Silence alarm is active',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				if (!self.lastStatus) {
					return false
				}
				return isSilence(self.lastStatus)
			},
		},
		warn_active: {
			name: 'WARN is not empty',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 165, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				if (!self.lastStatus) {
					return false
				}
				return isWarnActive(self.lastStatus)
			},
		},
	})
}
