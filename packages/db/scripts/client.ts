import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { COLLECTIONS, type CollectionDef } from '../src/collections'
import type { Row } from './files'

/** A service-role client: scripts run on a trusted machine and bypass row-level security. */
export function serviceClient() {
	const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY
	if (!url || !key) {
		console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (in .env at the repo root).')
		process.exit(1)
	}
	return createClient(url, key, { auth: { persistSession: false } })
}

/** `bun db:seed legislation/readings` limits a run to one collection; no argument means all. */
export function selectedCollections(): CollectionDef[] {
	const only = process.argv[2]
	if (!only) return COLLECTIONS
	const [workspace, collection] = only.split('/')
	const picked = COLLECTIONS.filter((c) => c.workspace === workspace && (!collection || c.collection === collection))
	if (!picked.length) {
		console.error(`No collection matches "${only}".`)
		process.exit(1)
	}
	return picked
}

/** Record that this collection's file and database rows now agree; the admin counts edits since. */
export async function markSynced(db: SupabaseClient, def: CollectionDef) {
	const { error } = await db
		.from('sync_state')
		.upsert({ name: `${def.workspace}/${def.collection}`, at: new Date().toISOString() })
	if (error) throw new Error(`sync_state: ${error.message}`)
}

/** Every record the database holds for a collection, in file order. */
export async function fetchRecords(db: SupabaseClient, def: CollectionDef): Promise<Row[]> {
	const PAGE = 1000
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
	return rows
}

/** `legislation` or `legislation/readings` → the collections it names. */
export function collectionsMatching(spec: string): CollectionDef[] {
	const [workspace, collection] = spec.split('/')
	return COLLECTIONS.filter((c) => c.workspace === workspace && (!collection || c.collection === collection))
}
