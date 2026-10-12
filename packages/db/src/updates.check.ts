/** `bun packages/db/src/updates.check.ts` — fails loudly if the diffing breaks. */
import assert from 'node:assert/strict'
import { diffRecords, summarizeChange } from './updates'

const current = [
	{ key: '827', data: { number: 827, status: 'Filed', title: 'A' }, position: 0 },
	{ key: '598', data: { status: 'Referred', number: 598 }, position: 1 },
	{ key: '1', data: { number: 1 }, position: 2 },
]
const fetched = [
	{ key: '830', data: { number: 830 } },
	{ key: '827', data: { title: 'A', number: 827, status: 'Adopted' } },
	{ key: '826', data: { number: 826 } }, // between 827 and 598
	{ key: '598', data: { number: 598, status: 'Referred' } }, // same, keys reordered
	{ key: '2', data: { number: 2 } }, // after the last
]
const changes = diffRecords(current, fetched)
assert.deepEqual(
	changes.map((c) => [c.key, c.action, c.position]),
	[['830', 'insert', -1], ['827', 'update', null], ['826', 'insert', 0.5], ['2', 'insert', 3], ['1', 'delete', null]],
)
assert.equal(summarizeChange(changes[1]!), 'status: Filed → Adopted')
assert.equal(summarizeChange(changes[0]!), 'New')
assert.equal(summarizeChange({ action: 'update', before: { h: [1] }, after: { h: [1, 2] } }), 'h')
console.log('updates: ok')
