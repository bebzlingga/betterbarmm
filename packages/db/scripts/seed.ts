/**
 * Load the dataset files into the `records` table.
 *
 *     bun db:seed                        every collection
 *     bun db:seed legislation            one workspace
 *     bun db:seed legislation/readings   one collection
 *
 * Upserts by key, so it is safe to re-run. It overwrites database edits that
 * have not been pulled into the files yet — run `bun db:pull` first.
 */
import { readRows } from './files'
import { markSynced, selectedCollections, serviceClient } from './client'

const db = serviceClient()
const BATCH = 200

for (const def of selectedCollections()) {
	const rows = readRows(def)
	for (let i = 0; i < rows.length; i += BATCH) {
		const { error } = await db.from('records').upsert(
			rows.slice(i, i + BATCH).map((row) => ({
				workspace: def.workspace,
				collection: def.collection,
				key: row.key,
				title: def.title(row.data),
				data: row.data,
				position: row.position,
			})),
		)
		if (error) throw new Error(`${def.workspace}/${def.collection}: ${error.message}`)
	}
	await markSynced(db, def)
	console.log(`${def.workspace}/${def.collection}: ${rows.length} records`)
}
