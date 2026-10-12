/**
 * Write approved work into datasets/, for the publish job to commit.
 *
 *     bun db:publish                  write the files; list what was published in .publish.json
 *     bun db:publish --mark           after the commit is pushed: mark those proposals published
 *
 * Approved record proposals are already in `records` (approving wrote them),
 * so a collection with one — or with an editor's edit since it was last
 * synced — is pulled into its file as `db:pull` would. Approved file
 * proposals are downloaded and written over their dataset file; only the
 * newest per file counts.
 */
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { COLLECTIONS } from '../src/collections'
import { fetchRecords, markSynced, serviceClient } from './client'
import { DATASETS, writeRows } from './files'

const db = serviceClient()
const LEDGER = resolve(import.meta.dir, '../../../.publish.json')

if (process.argv[2] === '--mark') {
	if (!existsSync(LEDGER)) process.exit(0)
	const { ids } = JSON.parse(readFileSync(LEDGER, 'utf8')) as { ids: number[] }
	for (let i = 0; i < ids.length; i += 200) {
		const { error } = await db
			.from('proposals')
			.update({ status: 'published', published_at: new Date().toISOString() })
			.in('id', ids.slice(i, i + 200))
		if (error) throw new Error(error.message)
	}
	unlinkSync(LEDGER)
	console.log(`marked ${ids.length} proposals published`)
	process.exit(0)
}

const { data: approved, error } = await db
	.from('proposals')
	.select('id, kind, workspace, collection, file_path, storage_path, created_at')
	.eq('status', 'approved')
	.order('created_at', { ascending: true })
if (error) throw new Error(error.message)

const ids: number[] = []
const touched: string[] = []

// ---- Records: every collection with an approved change or an unsynced edit ----
const { data: synced } = await db.from('sync_state').select('name, at')
const syncedAt = new Map((synced ?? []).map((s) => [s.name as string, s.at as string]))
for (const def of COLLECTIONS) {
	const name = `${def.workspace}/${def.collection}`
	const mine = (approved ?? []).filter((p) => p.kind === 'record' && p.workspace === def.workspace && p.collection === def.collection)
	const { data: last } = await db
		.from('records')
		.select('updated_at')
		.eq('workspace', def.workspace)
		.eq('collection', def.collection)
		.order('updated_at', { ascending: false })
		.limit(1)
		.maybeSingle()
	const edited = last && syncedAt.has(name) && last.updated_at > syncedAt.get(name)!
	if (!mine.length && !edited) continue
	const rows = await fetchRecords(db, def)
	if (!rows.length) continue
	if (writeRows(def, rows)) touched.push(name)
	await markSynced(db, def)
	ids.push(...mine.map((p) => p.id as number))
}

// ---- Files: the newest approved version of each ----
const newest = new Map<string, { id: number; storage_path: string }>()
for (const p of (approved ?? []).filter((p) => p.kind === 'file')) {
	newest.set(p.file_path as string, { id: p.id as number, storage_path: p.storage_path as string })
	ids.push(p.id as number) // older approved versions are settled by the newest
}
for (const [path, p] of newest) {
	const { data, error } = await db.storage.from('proposals').download(p.storage_path)
	if (error || !data) throw new Error(`download ${p.storage_path}: ${error?.message}`)
	writeFileSync(join(DATASETS, path), Buffer.from(await data.arrayBuffer()))
	touched.push(path)
}

writeFileSync(LEDGER, JSON.stringify({ ids }))
console.log(touched.length ? `published: ${touched.join(', ')}` : 'nothing to publish')
