import fs from 'node:fs'
import path from 'node:path'

/* ============================================================
   PhilGEPS, for BARMM

   Every bid notice a procuring entity PhilGEPS files under BARMM
   posted since 2019, and the contracts awarded on them. Written by
   datasets/procurement/scripts/fetch_philgeps.py.

   Read from disk once per server, not bundled: 127,000 notices are
   too many to ship in a page, so pages get totals and the notices
   reach the browser a page at a time through /api/notices.
   ============================================================ */

type Raw = {
	generatedAt: string
	note: string
	source: { label: string; href: string }[]
	entities: { name: string; type: string; unit: string | null }[]
	categorys: string[]
	modes: string[]
	classes: string[]
	statuss: string[]
	awardees: string[]
	/** ref, modern, date, entity, category, abc, title, mode, class, status, awards */
	notices: [string, 0 | 1, string | null, number, number | null, number | null, string | null, number | null, number | null, number | null, [number, number | null, string | null, string | null][]][]
}

export type Award = { awardee: string; amount: number | null; date: string | null; contractNo: string | null }

export type Notice = {
	ref: string
	date: string | null
	year: number | null
	entity: number
	category: string | null
	abc: number | null
	title: string | null
	mode: string | null
	classification: string | null
	status: string | null
	awards: Award[]
}

export type Entity = {
	index: number
	slug: string
	name: string
	type: string
	/** LGU directory key, for a province, city or town. */
	unit: string | null
}

function load(): Raw {
	const roots = [process.cwd(), path.join(process.cwd(), '..'), path.join(process.cwd(), '../..')]
	for (const root of roots) {
		const file = path.join(root, 'datasets/procurement/philgeps.json')
		if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8')) as Raw
	}
	throw new Error('datasets/procurement/philgeps.json not found')
}

const slugify = (name: string) =>
	name
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 80)

const raw = load()

export const meta = { generatedAt: raw.generatedAt, note: raw.note, source: raw.source }

export const entities: Entity[] = (() => {
	const used = new Set<string>()
	return raw.entities.map((e, index) => {
		let slug = slugify(e.name)
		while (used.has(slug)) slug += '-2'
		used.add(slug)
		return { index, slug, name: e.name.replace(/\s+/g, ' ').trim(), type: e.type, unit: e.unit }
	})
})()

export const entityBySlug = new Map(entities.map((e) => [e.slug, e]))

export const notices: Notice[] = raw.notices.map(([ref, , date, entity, category, abc, title, mode, cls, status, awards]) => ({
	ref,
	date,
	year: date ? Number(date.slice(0, 4)) : null,
	entity,
	category: category == null ? null : raw.categorys[category],
	abc,
	title,
	mode: mode == null ? null : raw.modes[mode],
	classification: cls == null ? null : raw.classes[cls],
	status: status == null ? null : raw.statuss[status],
	awards: awards.map(([awardee, amount, awardDate, contractNo]) => ({ awardee: raw.awardees[awardee], amount, date: awardDate, contractNo })),
}))

export const years = [...new Set(notices.map((n) => n.year).filter((y): y is number => y != null))].sort()

export type Totals = { notices: number; abc: number; awards: number; contracts: number }

const blank = (): Totals => ({ notices: 0, abc: 0, awards: 0, contracts: 0 })

function add(t: Totals, n: Notice) {
	t.notices += 1
	t.abc += n.abc ?? 0
	t.awards += n.awards.length
	t.contracts += n.awards.reduce((s, a) => s + (a.amount ?? 0), 0)
}

/** Totals for every entity, by year and overall. */
export const entityTotals: { all: Totals; byYear: Record<number, Totals> }[] = (() => {
	const out = entities.map(() => ({ all: blank(), byYear: {} as Record<number, Totals> }))
	for (const n of notices) {
		const t = out[n.entity]!
		add(t.all, n)
		if (n.year != null) add((t.byYear[n.year] ??= blank()), n)
	}
	return out
})()

export const regionByYear: Record<number, Totals> = (() => {
	const out: Record<number, Totals> = {}
	for (const n of notices) if (n.year != null) add((out[n.year] ??= blank()), n)
	return out
})()

export const regionTotals: Totals = (() => {
	const t = blank()
	for (const n of notices) add(t, n)
	return t
})()

/** Suppliers by contracts won, largest first. */
export const suppliers = (() => {
	const by = new Map<string, { name: string; awards: number; amount: number; entities: Set<number>; last: string | null }>()
	for (const n of notices)
		for (const a of n.awards) {
			const s = by.get(a.awardee) ?? { name: a.awardee, awards: 0, amount: 0, entities: new Set<number>(), last: null }
			s.awards += 1
			s.amount += a.amount ?? 0
			s.entities.add(n.entity)
			if (a.date && (!s.last || a.date > s.last)) s.last = a.date
			by.set(a.awardee, s)
		}
	return [...by.values()].sort((x, y) => y.amount - x.amount)
})()

export type NoticeQuery = {
	entity?: number
	q?: string
	year?: number
	supplier?: string
	awarded?: boolean
	page?: number
}

export const PAGE = 50

/** One page of notices, newest first, with the totals of everything matched. */
export function searchNotices({ entity, q, year, supplier, awarded, page = 1 }: NoticeQuery) {
	const words = (q ?? '').toLowerCase().split(/\s+/).filter(Boolean)
	const who = supplier?.toLowerCase()
	const matched = notices.filter((n) => {
		if (entity != null && n.entity !== entity) return false
		if (year != null && n.year !== year) return false
		if (awarded && !n.awards.length) return false
		if (who && !n.awards.some((a) => a.awardee.toLowerCase() === who)) return false
		if (words.length) {
			const text = `${n.ref} ${n.title ?? ''} ${n.category ?? ''} ${entities[n.entity]!.name} ${n.awards.map((a) => a.awardee).join(' ')}`.toLowerCase()
			if (!words.every((w) => text.includes(w))) return false
		}
		return true
	})
	const totals = blank()
	for (const n of matched) add(totals, n)
	return {
		totals,
		page,
		pages: Math.max(1, Math.ceil(matched.length / PAGE)),
		rows: matched.slice((page - 1) * PAGE, page * PAGE).map((n) => ({
			...n,
			entityName: entities[n.entity]!.name,
			entitySlug: entities[n.entity]!.slug,
		})),
	}
}

export type NoticeRow = ReturnType<typeof searchNotices>['rows'][number]

/** The largest values of a tally, as label and value, largest first. */
function top(tally: Map<string, number>, count = 10) {
	return [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, count).map(([label, value]) => ({ label, value }))
}

/** What BARMM offices buy most, by approved budget. */
export const topCategories = (() => {
	const tally = new Map<string, number>()
	for (const n of notices) if (n.category) tally.set(n.category, (tally.get(n.category) ?? 0) + (n.abc ?? 0))
	return top(tally)
})()
