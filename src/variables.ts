import type ModuleInstance from './main.js'

export type VariablesSchema = {
	led1_status: string
	led1_text: string
	led1_autoflash: string
	led1_timedflash: string
	led2_status: string
	led2_text: string
	led2_autoflash: string
	led2_timedflash: string
	led3_status: string
	led3_text: string
	led3_autoflash: string
	led3_timedflash: string
	led4_status: string
	led4_text: string
	led4_autoflash: string
	led4_timedflash: string
	air1_status: string
	air1_seconds: string
	air1_time: string
	air1_text: string
	air2_status: string
	air2_seconds: string
	air2_time: string
	air2_text: string
	air3_status: string
	air3_seconds: string
	air3_time: string
	air3_text: string
	air4_status: string
	air4_seconds: string
	air4_time: string
	air4_text: string
	air3_toth: string
	now: string
	next: string
	warn: string
	silence: string
	instance: string
	version: string
}

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions({
		led1_status: { name: 'LED 1 on (true/false)' },
		led1_text: { name: 'LED 1 label' },
		led1_autoflash: { name: 'LED 1 autoflash enabled (true/false)' },
		led1_timedflash: { name: 'LED 1 timedflash enabled (true/false)' },
		led2_status: { name: 'LED 2 on (true/false)' },
		led2_text: { name: 'LED 2 label' },
		led2_autoflash: { name: 'LED 2 autoflash enabled (true/false)' },
		led2_timedflash: { name: 'LED 2 timedflash enabled (true/false)' },
		led3_status: { name: 'LED 3 on (true/false)' },
		led3_text: { name: 'LED 3 label' },
		led3_autoflash: { name: 'LED 3 autoflash enabled (true/false)' },
		led3_timedflash: { name: 'LED 3 timedflash enabled (true/false)' },
		led4_status: { name: 'LED 4 on (true/false)' },
		led4_text: { name: 'LED 4 label' },
		led4_autoflash: { name: 'LED 4 autoflash enabled (true/false)' },
		led4_timedflash: { name: 'LED 4 timedflash enabled (true/false)' },
		air1_status: { name: 'AIR 1 running (true/false)' },
		air1_seconds: { name: 'AIR 1 seconds' },
		air1_time: { name: 'AIR 1 time (m:SS)' },
		air1_text: { name: 'AIR 1 label' },
		air2_status: { name: 'AIR 2 running (true/false)' },
		air2_seconds: { name: 'AIR 2 seconds' },
		air2_time: { name: 'AIR 2 time (m:SS)' },
		air2_text: { name: 'AIR 2 label' },
		air3_status: { name: 'AIR 3 running (true/false)' },
		air3_seconds: { name: 'AIR 3 seconds' },
		air3_time: { name: 'AIR 3 time (m:SS)' },
		air3_text: { name: 'AIR 3 label' },
		air4_status: { name: 'AIR 4 running (true/false)' },
		air4_seconds: { name: 'AIR 4 seconds' },
		air4_time: { name: 'AIR 4 time (m:SS)' },
		air4_text: { name: 'AIR 4 label' },
		air3_toth: { name: 'AIR3 top-of-hour active (true/false)' },
		now: { name: 'NOW text' },
		next: { name: 'NEXT text' },
		warn: { name: 'WARN text' },
		silence: { name: 'Silence alarm (true/false)' },
		instance: { name: 'OnAirScreen instance name' },
		version: { name: 'OnAirScreen version' },
	})
}
