import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildWsUrl, resolveWsPort } from './ws.ts'

describe('resolveWsPort', () => {
	it('uses HTTP port + 1 when wsPort is 0, empty, or unset', () => {
		assert.equal(resolveWsPort(8010, 0), 8011)
		assert.equal(resolveWsPort(8010, ''), 8011)
		assert.equal(resolveWsPort(8010, undefined), 8011)
		assert.equal(resolveWsPort(8010, -1), 8011)
	})

	it('honours an explicit WebSocket port', () => {
		assert.equal(resolveWsPort(8010, 9000), 9000)
	})

	it('falls back to 8011 when HTTP+1 would overflow', () => {
		assert.equal(resolveWsPort(65535, 0), 8011)
	})
})

describe('buildWsUrl', () => {
	it('builds ws://host:http+1 by default', () => {
		assert.equal(buildWsUrl('127.0.0.1', 8010, 0), 'ws://127.0.0.1:8011')
		assert.equal(buildWsUrl('127.0.0.1', 8010, ''), 'ws://127.0.0.1:8011')
		assert.equal(buildWsUrl(' studio.local ', 8010, 0), 'ws://studio.local:8011')
	})
})
