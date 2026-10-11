/**
 * Write the database's records back into the dataset files, so edits made in
 * the admin reach the workspaces through the usual commit and deploy.
 *
 *     bun db:pull                        every collection
 *     bun db:pull legislation/readings   one collection
 *
 * Unchanged records keep their exact original text, so `git diff` shows only
 * what was edited in the admin.
 */
import { writeRows, type Row } from './files'
import { markSynced, selectedCollections, serviceClient } from './client'

const db = serviceClient()
const PAGE = 1000

for (const def of selectedCollections()) {
	const rows: Row[] = []
	for (let from = 0; ; from += PAGE) {
		const { data, error } = await db
			.from('records')
			.select('key, data, position')
			.eq('workspace', def.workspace)
			.eq('collection', def.collection)
			.order('position')
			.order('key')
			.range(from, from + PAGE - 1)
		if (error) throw new Error(`${def.workspace}/${def.collection}: ${error.message}`)
		rows.push(...(data as Row[]))
		if (!data || data.length < PAGE) break
	}
	if (!rows.length) {
		console.log(`${def.workspace}/${def.collection}: nothing in the database, skipped`)
		continue
	}
	const wrote = writeRows(def, rows)
	await markSynced(db, def)
	console.log(`${def.workspace}/${def.collection}: ${rows.length} records${wrote ? ', file updated' : ''}`)
}
