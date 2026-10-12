/**
 * File what a fresh fetch found as proposals for an editor to approve. Run by
 * the nightly job after the fetch scripts have rewritten files in datasets/
 * (on the job's own checkout — it never commits).
 *
 *     bun db:propose <run-id> legislation/proposed-index legislation/bills-index
 *         compares each collection's file with the records the site holds and
 *         files one proposal per new, changed or vanished record
 *
 *     bun db:propose <run-id> --file procurement/philgeps.json --summary "562 new notices, 87 open"
 *         uploads a regenerated dataset whole and files it as one proposal
 *
 * A record already waiting with the same change is left as it is; a newer
 * change to it supersedes the older one; a change an editor already rejected
 * is not filed again.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { canonical, diffRecords, summarizeChange } from '../src/updates'
import { collectionsMatching, fetchRecords, serviceClient } from './client'
import { DATASETS, readRows } from './files'

const [runId, ...args] = process.argv.slice(2)
if (!runId || !args.length) {
	console.error('Usage: bun db:propose <run-id> <workspace[/collection]>... | --file <path> --summary <text>')
	process.exit(1)
}

const db = serviceClient()
const BATCH = 200

if (args[0] === '--file') {
	const path = args[1]
	const summary = args[args.indexOf('--summary') + 1] ?? ''
	if (!path) throw new Error('--file needs a path under datasets/')
	const storagePath = `${runId}/${path}`
	const upload = await db.storage
		.from('proposals')
		.upload(storagePath, readFileSync(join(DATASETS, path)), { contentType: 'application/json', upsert: true })
	if (upload.error) throw new Error(`upload ${path}: ${upload.error.message}`)
	await db.from('proposals').update({ status: 'superseded' }).eq('kind', 'file').eq('file_path', path).eq('status', 'pending')
	const { error } = await db
		.from('proposals')
		.insert({ run_id: runId, kind: 'file', file_path: path, storage_path: storagePath, title: path, summary })
	if (error) throw new Error(`proposal for ${path}: ${error.message}`)
	console.log(`${path}: filed — ${summary}`)
	process.exit(0)
}

for (const def of args.flatMap(collectionsMatching)) {
	const name = `${def.workspace}/${def.collection}`
	const current = await fetchRecords(db, def)
	if (!current.length) {
		// Every record would look new. The collection has to be seeded first.
		console.log(`${name}: not in the database yet — run \`bun db:seed ${name}\`; skipped`)
		continue
	}
	const changes = diffRecords(current, readRows(def))
	if (!changes.length) {
		console.log(`${name}: no changes`)
		continue
	}

	// What is already waiting, and what was last decided, for these records.
	const keys = changes.map((c) => c.key)
	const earlier = new Map<string, { id: number; status: string; after: unknown; action: string }>()
	for (let i = 0; i < keys.length; i += BATCH) {
		const { data, error } = await db
			.from('proposals')
			.select('id, key, status, after, action, created_at')
			.eq('kind', 'record')
			.eq('workspace', def.workspace)
			.eq('collection', def.collection)
			.in('key', keys.slice(i, i + BATCH))
			.in('status', ['pending', 'rejected'])
			.order('created_at', { ascending: true })
		if (error) throw new Error(`${name}: ${error.message}`)
		for (const p of data ?? []) earlier.set(p.key as string, p as never) // the newest wins
	}

	const same = (a: unknown, b: unknown) => canonical(a ?? null) === canonical(b ?? null)
	const fresh = changes.filter((c) => {
		const p = earlier.get(c.key)
		return !(p && p.action === c.action && same(p.after, c.after))
	})
	const superseded = fresh.map((c) => earlier.get(c.key)).filter((p) => p?.status === 'pending').map((p) => p!.id)
	for (let i = 0; i < superseded.length; i += BATCH) {
		const { error } = await db.from('proposals').update({ status: 'superseded' }).in('id', superseded.slice(i, i + BATCH))
		if (error) throw new Error(`${name}: ${error.message}`)
	}
	for (let i = 0; i < fresh.length; i += BATCH) {
		const { error } = await db.from('proposals').insert(
			fresh.slice(i, i + BATCH).map((c) => ({
				run_id: runId,
				kind: 'record',
				workspace: def.workspace,
				collection: def.collection,
				key: c.key,
				title: def.title((c.after ?? c.before)!),
				action: c.action,
				before: c.before,
				after: c.after,
				position: c.position,
				summary: summarizeChange(c),
			})),
		)
		if (error) throw new Error(`${name}: ${error.message}`)
	}
	console.log(`${name}: ${changes.length} changes, ${fresh.length} filed (${changes.length - fresh.length} already waiting or rejected)`)
}
