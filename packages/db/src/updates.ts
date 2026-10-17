/**
 * Proposed updates: what the last fetch found, waiting for an editor.
 * See migrations/0003_updates.sql for the flow.
 */

type Item = Record<string, unknown>

export type Proposal = {
	id: number
	run_id: string
	kind: 'record' | 'file'
	workspace: string | null
	collection: string | null
	key: string | null
	title: string
	action: 'insert' | 'update' | 'delete' | null
	before: Item | null
	after: Item | null
	position: number | null
	file_path: string | null
	storage_path: string | null
	summary: string
	status: 'pending' | 'approved' | 'rejected' | 'superseded' | 'published'
	created_at: string
	decided_at: string | null
	decided_by_email: string
	published_at: string | null
}

/** JSON with object keys sorted, so two values compare equal whatever their key order. */
export const canonical = (value: unknown): string =>
	JSON.stringify(value, (_k, v) =>
		v && typeof v === 'object' && !Array.isArray(v)
			? Object.fromEntries(Object.keys(v).sort().map((k) => [k, (v as Item)[k]]))
			: v,
	)

export type Change = {
	key: string
	action: 'insert' | 'update' | 'delete'
	before: Item | null
	after: Item | null
	position: number | null
}

/**
 * What it would take to turn `current` (the records the site holds) into
 * `fetched` (what the source says now), record by record. Order changes alone
 * are not changes. A new record is given a position halfway between the
 * existing records around it at the source, so it lands in the same place in
 * the file without renumbering the rest.
 */
export function diffRecords(
	current: { key: string; data: Item; position: number }[],
	fetched: { key: string; data: Item }[],
): Change[] {
	const now = new Map(current.map((r) => [r.key, r]))
	const seen = new Set<string>()
	const changes: Change[] = []
	const positions = current.map((r) => r.position)
	const lowest = positions.length ? Math.min(...positions) : 0
	const highest = positions.length ? Math.max(...positions) : 0
	// The position of the nearest existing record after index i at the source.
	const nextExisting: (number | null)[] = []
	for (let i = fetched.length - 1, next: number | null = null; i >= 0; i--) {
		nextExisting[i] = next
		const old = now.get(fetched[i]!.key)
		if (old) next = old.position
	}
	let prev: number | null = null
	fetched.forEach((row, i) => {
		seen.add(row.key)
		const old = now.get(row.key)
		if (old === undefined) {
			const next = nextExisting[i] ?? null
			const position = prev != null && next != null ? (prev + next) / 2 : prev != null ? Math.max(prev, highest) + 1 : (next ?? lowest) - 1
			changes.push({ key: row.key, action: 'insert', before: null, after: row.data, position })
			prev = position
			return
		}
		prev = old.position
		if (canonical(old.data) !== canonical(row.data))
			changes.push({ key: row.key, action: 'update', before: old.data, after: row.data, position: null })
	})
	for (const r of current)
		if (!seen.has(r.key)) changes.push({ key: r.key, action: 'delete', before: r.data, after: null, position: null })
	return changes
}

/** Top-level fields that differ, in the record's own names. */
export function changedFields(before: unknown, after: unknown): string[] {
	const a = (before ?? {}) as Item
	const b = (after ?? {}) as Item
	return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => canonical(a[k]) !== canonical(b[k]))
}

/** One line for a record change: "status: Filed → Adopted", or the fields that changed. */
export function summarizeChange(change: Pick<Change, 'action' | 'before' | 'after'>): string {
	if (change.action === 'insert') return 'New'
	if (change.action === 'delete') return 'No longer listed at the source'
	const fields = changedFields(change.before, change.after)
	const scalar = (v: unknown) => v == null || ['string', 'number', 'boolean'].includes(typeof v)
	const parts = fields.slice(0, 4).map((f) => {
		const a = change.before?.[f]
		const b = change.after?.[f]
		if (scalar(a) && scalar(b) && String(a ?? '').length <= 60 && String(b ?? '').length <= 60)
			return `${f}: ${a ?? '—'} → ${b ?? '—'}`
		return f
	})
	return parts.join('; ') + (fields.length > 4 ? ` +${fields.length - 4} more` : '')
}
