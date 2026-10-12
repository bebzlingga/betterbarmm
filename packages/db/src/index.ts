import { createClient } from '@supabase/supabase-js'

export * from './collections'
export * from './updates'

/** The workspaces an explainer can belong to — the same ones the site is split into. */
export const EXPLAINER_CATEGORIES = [
	{ value: 'legislation', label: 'Legislation' },
	{ value: 'budget', label: 'Budget' },
	{ value: 'election', label: 'Election' },
	{ value: 'lgu', label: 'Local government' },
	{ value: 'travel', label: 'Travel' },
	{ value: 'general', label: 'General' },
] as const

export type ExplainerCategory = (typeof EXPLAINER_CATEGORIES)[number]['value']

export const categoryLabel = (value: string) =>
	EXPLAINER_CATEGORIES.find((category) => category.value === value)?.label ?? value

export type Explainer = {
	id: string
	slug: string
	title: string
	summary: string
	/** Markdown. */
	body: string
	category: ExplainerCategory
	tags: string[]
	status: 'draft' | 'published'
	published_at: string | null
	created_at: string
	updated_at: string
}

export type RecordRow = {
	workspace: string
	collection: string
	key: string
	data: Record<string, unknown>
	position: number
	updated_at: string
}

export type Revision = {
	id: number
	entity: 'record' | 'explainer'
	workspace: string | null
	collection: string | null
	key: string | null
	explainer_id: string | null
	title: string
	action: 'insert' | 'update' | 'delete'
	/** The whole row before the change; null for an insert. */
	before: Record<string, unknown> | null
	/** The whole row after the change; null for a delete. */
	after: Record<string, unknown> | null
	changed_by_email: string
	changed_at: string
}

export type Profile = {
	id: string
	email: string
	name: string
	role: 'admin' | 'editor' | 'viewer'
	/** May approve social posts (admins always may). */
	can_approve_posts?: boolean
	created_at: string
}

export type SocialStatus = 'draft' | 'in_review' | 'scheduled' | 'posted' | 'failed'

export type SocialPost = {
	id: string
	body: string
	link: string | null
	image_path: string | null
	platforms: string[]
	status: SocialStatus
	scheduled_at: string | null
	author_id: string | null
	author_email: string
	reviewer_id: string | null
	reviewer_email: string
	review_note: string
	results: Record<string, { id?: string; url?: string; error?: string }>
	submitted_at: string | null
	decided_at: string | null
	posted_at: string | null
	created_at: string
	updated_at: string
}

/** Lowercase, hyphenated, ASCII — what the explainers table accepts as a slug. */
export const slugify = (value: string) =>
	value
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')

export const hasSupabaseEnv = () =>
	Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

/**
 * A read-only client for public pages. It carries no session, so row-level
 * security limits it to what anyone may see — published explainers and records.
 * Returns null when the project's keys are not configured, so a page can show
 * an empty state instead of failing the build.
 */
export function createPublicClient() {
	if (!hasSupabaseEnv()) return null
	return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
		auth: { persistSession: false },
	})
}

/** Published explainers, newest first. */
export async function listPublishedExplainers(): Promise<Explainer[]> {
	const db = createPublicClient()
	if (!db) return []
	const { data, error } = await db
		.from('explainers')
		.select('*')
		.eq('status', 'published')
		.order('published_at', { ascending: false })
	if (error) throw new Error(`Could not load explainers: ${error.message}`)
	return (data ?? []) as Explainer[]
}

export async function getPublishedExplainer(slug: string): Promise<Explainer | null> {
	const db = createPublicClient()
	if (!db) return null
	const { data, error } = await db
		.from('explainers')
		.select('*')
		.eq('status', 'published')
		.eq('slug', slug)
		.maybeSingle()
	if (error) throw new Error(`Could not load explainer: ${error.message}`)
	return (data as Explainer | null) ?? null
}
