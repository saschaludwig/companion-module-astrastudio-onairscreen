import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { boolToVariable, formatAirTime, parseAirTimeToSeconds } from './format.ts'

describe('formatAirTime', () => {
	it('formats like OnAirScreen int(seconds/60):seconds%60:02d', () => {
		assert.equal(formatAirTime(125), '2:05')
		assert.equal(formatAirTime(5), '0:05')
		assert.equal(formatAirTime(0), '0:00')
		assert.equal(formatAirTime(60), '1:00')
		assert.equal(formatAirTime(3599), '59:59')
		assert.equal(formatAirTime(3600), '60:00')
	})

	it('floors fractional seconds and rejects negatives', () => {
		assert.equal(formatAirTime(125.9), '2:05')
		assert.equal(formatAirTime(-3), '0:00')
		assert.equal(formatAirTime(Number.NaN), '0:00')
		assert.equal(formatAirTime(Number.POSITIVE_INFINITY), '0:00')
	})
})

describe('boolToVariable', () => {
	it('uses true/false strings', () => {
		assert.equal(boolToVariable(true), 'true')
		assert.equal(boolToVariable(false), 'false')
	})
})

describe('parseAirTimeToSeconds', () => {
	it('parses m:ss and raw seconds', () => {
		assert.equal(parseAirTimeToSeconds('2:05'), 125)
		assert.equal(parseAirTimeToSeconds('0:00'), 0)
		assert.equal(parseAirTimeToSeconds('0:30'), 30)
		assert.equal(parseAirTimeToSeconds('125'), 125)
		assert.equal(parseAirTimeToSeconds(' 2:05 '), 125)
	})

	it('rejects empty, seconds over 59, and junk', () => {
		assert.throws(() => parseAirTimeToSeconds(''), /empty/)
		assert.throws(() => parseAirTimeToSeconds('2:60'), /0-59/)
		assert.throws(() => parseAirTimeToSeconds('abc'), /m:ss or seconds/)
	})
})
