import fs from 'node:fs'
import path from 'node:path'

/* ============================================================
   Who buys, on PhilGEPS

   The offices whose bid notices the Procurement workspace records,
   counted: how many notices, what they were budgeted at, and what
   was awarded. The notices themselves stay in that workspace; each
   office here links to its page there, whose address is built the
   same way (the office's name, slugged, in the record's order).
   ============================================================ */

export const PROCUREMENT = 'https://procurement.betterbarmm.com'

export type Buyer = { name: string; slug: string; notices: number; abc: number; awarded: number; first: string | null; last: string | null }

type Raw = { columns: string[]; entities: { name: string }[]; notices: unknown[][] }

const slugify = (name: string) =>
	name
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 80)

function load(): Raw | null {
	const roots = [process.cwd(), path.join(process.cwd(), '..'), path.join(process.cwd(), '../..')]
	const file = roots.map((r) => path.join(r, 'datasets/procurement/philgeps.json')).find((f) => fs.existsSync(f))
	return file ? (JSON.parse(fs.readFileSync(file, 'utf8')) as Raw) : null
}

/** Every office whose name matches, most notices first. */
export function buyers(match: RegExp): Buyer[] {
	const raw = load()
	if (!raw) return []
	const c = (n: string) => raw.columns.indexOf(n)
	const used = new Set<string>()
	const out = raw.entities.map((e) => {
		let slug = slugify(e.name)
		while (used.has(slug)) slug += '-2'
		used.add(slug)
		return { name: e.name.replace(/\s+/g, ' ').trim(), slug, notices: 0, abc: 0, awarded: 0, first: null as string | null, last: null as string | null }
	})
	for (const n of raw.notices) {
		const b = out[n[c('entity')] as number]!
		if (!match.test(b.name)) continue
		const date = n[c('date')] as string | null
		b.notices += 1
		b.abc += (n[c('abc')] as number | null) ?? 0
		b.awarded += ((n[c('awards')] as [number, number | null][]) ?? []).reduce((s, a) => s + (a[1] ?? 0), 0)
		if (date && (!b.first || date < b.first)) b.first = date
		if (date && (!b.last || date > b.last)) b.last = date
	}
	return out.filter((b) => b.notices > 0).sort((a, b) => b.notices - a.notices)
}
