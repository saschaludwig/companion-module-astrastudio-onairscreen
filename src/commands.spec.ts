import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildCommandUrl } from './api.ts'
import {
	air3TimeCommand,
	air3TimeFromClock,
	air3TohCommand,
	airCommand,
	airResetCommand,
	lufsIntegratedCommand,
	ledCommand,
	textFieldCommand,
	warnCommand,
} from './commands.ts'

describe('command strings', () => {
	it('builds LED, AIR, reset, TOTH, and text commands', () => {
		assert.equal(ledCommand(1, 'ON'), 'LED1:ON')
		assert.equal(ledCommand(4, 'TOGGLE'), 'LED4:TOGGLE')
		assert.equal(airCommand(1, 'OFF'), 'AIR1:OFF')
		assert.equal(airResetCommand(3), 'AIR3:RESET')
		assert.equal(airResetCommand(4), 'AIR4:RESET')
		assert.equal(air3TohCommand('TOGGLE'), 'AIR3TOH:TOGGLE')
		assert.equal(lufsIntegratedCommand('START'), 'LUFSI:START')
		assert.equal(lufsIntegratedCommand('STOP'), 'LUFSI:STOP')
		assert.equal(lufsIntegratedCommand('TOGGLE'), 'LUFSI:TOGGLE')
		assert.equal(lufsIntegratedCommand('RESET'), 'LUFSI:RESET')
		assert.equal(air3TimeCommand(125), 'AIR3TIME:125')
		assert.equal(textFieldCommand('NOW', 'Song'), 'NOW:Song')
	})

	it('builds WARN commands for priority 0/1/2 and clear', () => {
		assert.equal(warnCommand(0, 'Hello'), 'WARN:Hello')
		assert.equal(warnCommand(0, ''), 'WARN:')
		assert.equal(warnCommand(1, 'Medium'), 'WARN:1:Medium')
		assert.equal(warnCommand(2, 'High'), 'WARN:2:High')
		assert.equal(warnCommand(1, ''), 'WARN:1:')
		assert.equal(warnCommand(2, ''), 'WARN:2:')
	})

	it('turns m:ss into AIR3TIME seconds', () => {
		assert.equal(air3TimeFromClock('2:05'), 'AIR3TIME:125')
		assert.equal(air3TimeFromClock('125'), 'AIR3TIME:125')
	})
})

describe('buildCommandUrl', () => {
	it('encodes COMMAND:VALUE on the cmd query parameter', () => {
		assert.equal(buildCommandUrl('127.0.0.1', 8010, 'LED1:ON'), 'http://127.0.0.1:8010/api/command?cmd=LED1%3AON')
		assert.equal(
			buildCommandUrl('studio.local', 8010, warnCommand(1, 'Hello World')),
			'http://studio.local:8010/api/command?cmd=WARN%3A1%3AHello%20World',
		)
	})
})
