import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
	connectionStatusMessage,
	isAir3Toth,
	isAirOn,
	isLedAutoflash,
	isLedOn,
	isLedTimedflash,
	isSilence,
	isLufsIntegrated,
	isWarnActive,
	parseStatus,
	statusToVariableValues,
} from './status.ts'

const SAMPLE = {
	leds: {
		'1': { status: true, text: 'ON AIR', autoflash: false, timedflash: false },
		'2': { status: false, text: 'PHONE', autoflash: true, timedflash: false },
		'3': { status: false, text: 'DOORBELL' },
		'4': { status: true, text: 'EAS ACTIVE', autoflash: false, timedflash: true },
	},
	air: {
		'1': { status: true, seconds: 125, text: 'Mic', topOfHour: false },
		'2': { status: false, seconds: 0, text: 'Phone', topOfHour: false },
		'3': { status: true, seconds: 59, text: 'TOTH Timer', topOfHour: true },
		'4': { status: false, seconds: 12, text: 'Stream', topOfHour: false },
	},
	texts: { now: 'Song', next: 'Next Song', warn: 'SILENCE' },
	warnings: [{ text: 'SILENCE', priority: 0 }],
	silence: true,
	lufsIntegrated: true,
	version: '0.9.9beta2',
	instance: 'Studio-1',
}

describe('parseStatus', () => {
	it('reads Python json.dumps string keys "1".."4"', () => {
		const status = parseStatus(SAMPLE)
		assert.equal(status.leds[1].status, true)
		assert.equal(status.leds[1].text, 'ON AIR')
		assert.equal(status.leds[1].autoflash, false)
		assert.equal(status.leds[2].autoflash, true)
		assert.equal(status.leds[4].timedflash, true)
		assert.equal(status.air[1].seconds, 125)
		assert.equal(status.air[3].topOfHour, true)
		assert.equal(status.now, 'Song')
		assert.equal(status.instance, 'Studio-1')
		assert.equal(status.version, '0.9.9beta2')
	})

	it('also accepts numeric keys', () => {
		const status = parseStatus({
			leds: { 1: { status: false, text: 'LED1' } },
			air: { 3: { status: true, seconds: 8, text: 'Timer', topOfHour: false } },
		})
		assert.equal(status.leds[1].text, 'LED1')
		assert.equal(status.air[3].seconds, 8)
		assert.equal(status.air[3].status, true)
	})

	it('defaults missing slots and fields', () => {
		const status = parseStatus({})
		assert.equal(status.leds[4].status, false)
		assert.equal(status.leds[4].autoflash, false)
		assert.equal(status.leds[4].timedflash, false)
		assert.equal(status.air[2].seconds, 0)
		assert.equal(status.silence, false)
		assert.equal(status.lufsIntegrated, false)
		assert.equal(status.warn, '')
	})
})

describe('status helpers', () => {
	it('reports LED, AIR, TOTH, silence, and WARN', () => {
		const status = parseStatus(SAMPLE)
		assert.equal(isLedOn(status, 1), true)
		assert.equal(isLedOn(status, 2), false)
		assert.equal(isLedAutoflash(status, 2), true)
		assert.equal(isLedAutoflash(status, 1), false)
		assert.equal(isLedTimedflash(status, 4), true)
		assert.equal(isLedTimedflash(status, 1), false)
		assert.equal(isAirOn(status, 1), true)
		assert.equal(isAirOn(status, 2), false)
		assert.equal(isAir3Toth(status), true)
		assert.equal(isSilence(status), true)
		assert.equal(isLufsIntegrated(status), true)
		assert.equal(isWarnActive(status), true)
	})

	it('treats empty warn and no warnings as inactive', () => {
		const status = parseStatus({ texts: { warn: '  ' }, warnings: [] })
		assert.equal(isWarnActive(status), false)
	})
})

describe('statusToVariableValues', () => {
	it('exposes formatted AIR time and boolean strings', () => {
		const values = statusToVariableValues(parseStatus(SAMPLE))
		assert.equal(values.led1_status, 'true')
		assert.equal(values.led1_text, 'ON AIR')
		assert.equal(values.led2_autoflash, 'true')
		assert.equal(values.led4_timedflash, 'true')
		assert.equal(values.led1_autoflash, 'false')
		assert.equal(values.air1_seconds, '125')
		assert.equal(values.air1_time, '2:05')
		assert.equal(values.air3_toth, 'true')
		assert.equal(values.now, 'Song')
		assert.equal(values.next, 'Next Song')
		assert.equal(values.warn, 'SILENCE')
		assert.equal(values.silence, 'true')
		assert.equal(values.lufs_integrated, 'true')
		assert.equal(values.instance, 'Studio-1')
		assert.equal(values.version, '0.9.9beta2')
	})
})

describe('connectionStatusMessage', () => {
	it('joins instance and version', () => {
		assert.equal(connectionStatusMessage(parseStatus(SAMPLE)), 'Studio-1 · 0.9.9beta2')
		assert.equal(connectionStatusMessage(parseStatus({ instance: 'A', version: '' })), 'A')
		assert.equal(connectionStatusMessage(parseStatus({})), undefined)
	})
})
