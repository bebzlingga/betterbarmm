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
import { writeRows } from './files'
import { fetchRecords, markSynced, selectedCollections, serviceClient } from './client'

const db = serviceClient()

for (const def of selectedCollections()) {
	const rows = await fetchRecords(db, def)
	if (!rows.length) {
		console.log(`${def.workspace}/${def.collection}: nothing in the database, skipped`)
		continue
	}
	const wrote = writeRows(def, rows)
	await markSynced(db, def)
	console.log(`${def.workspace}/${def.collection}: ${rows.length} records${wrote ? ', file updated' : ''}`)
}
