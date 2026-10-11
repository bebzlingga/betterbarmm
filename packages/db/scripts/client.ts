import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { COLLECTIONS, type CollectionDef } from '../src/collections'

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
