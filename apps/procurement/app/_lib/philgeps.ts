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
	funds: string[]
	/** ref, modern, date, entity, category, abc, title, mode, class, status, awards, fund, closing, open */
	notices: [string, 0 | 1, string | null, number, number | null, number | null, string | null, number | null, number | null, number | null, [number, number | null, string | null, string | null][], number | null, string | null, 0 | 1][]
}

/* ---- Broad groups ---------------------------------------------------------
   PhilGEPS files a notice under one of about 200 business categories. These
   ten groups gather them so a reader can filter by what kind of thing was
   bought. Rules run in order; the first match wins. A few categories whose
   words mislead are placed by hand. */

const GROUP_RULES: [string, RegExp][] = [
	['Health and medicine', /medic|drug|hospital|laborator|diagnostic|radiolog|dental|health|personal care/i],
	['Food and catering', /food|grocer|cater|rice|dairy|restaurant|kitchen|beverage/i],
	['Agriculture and fisheries', /agricult|fertili|seed|live animal|animal feed|veterinar|pest control prod|fish/i],
	['IT and communications', /information tech|computer|internet|telecom|communication|systems integration|electronic|broadcast|audio and visual|automation|cabling/i],
	['Vehicles, fuel and transport', /vehicle|motor|transport|aviation|marine|cargo|fuel|traffic|maritime|navigation/i],
	['Construction and infrastructure', /construct|hardware|concrete|road|building|contractor|engineering|survey|well drill|transmission|water service|water and waste|metal fab|architect|lifting|landscap|fixtures|plumb|pipe|paint|drilling/i],
	['Travel, lodging and events', /hotel|lodging|travel|event/i],
	['Office and school supplies', /office|printing supplies|paper|book|education|signage|furniture|token|giveaway|flag|newspaper|arts and crafts|photograph|microfilm|textile|garment|bedcloth|bag/i],
	['Services', /service|consult|lease|rental|advertis|repair|maintenance|laundry|public relations|reproduction|waste/i],
	['Equipment and machinery', /machin|equipment|tool|appliance|aircondition|electrical|power gen|pump|fire fight|safety|lamp|instrument|security/i],
]

const GROUP_OVERRIDES: Record<string, string> = {
	'Lease and Rental of Property or Building': 'Services',
	'Sale of Property or Building': 'Services',
	'Transportation and Communications Services': 'Vehicles, fuel and transport',
	'Travel, Food, Lodging and Entertainment Services': 'Travel, lodging and events',
	'Print and Broadcast and Aerial Advertising': 'Services',
	'Education and Training Services': 'Services',
	'Photography Services': 'Services',
	'Environmental Health/Safety Equipment': 'Equipment and machinery',
	'Engineering and Laboratory Testing Equipment': 'Equipment and machinery',
}

export const OTHER = 'General merchandise and other'
export const groups = [...GROUP_RULES.map(([name]) => name), OTHER]

export function groupOf(category: string | null): string {
	if (!category || category === 'None') return OTHER
	return GROUP_OVERRIDES[category] ?? GROUP_RULES.find(([, rule]) => rule.test(category))?.[0] ?? OTHER
}

/* ---- How it was bought ---------------------------------------------------
   PhilGEPS writes each mode several ways, old law and new; these gather them
   into the families the law names. Most older notices carry no mode at all. */

const MODE_RULES: [string, RegExp][] = [
	['Public bidding', /public bidding|competitive bidding/i],
	['Small value procurement', /small value/i],
	['Shopping', /shopping/i],
	['Direct contracting', /direct contracting/i],
	['Direct acquisition', /direct acquisition/i],
	['Negotiated: emergency', /emergency/i],
	['Negotiated: lease of property', /lease/i],
	['Negotiated: agency to agency', /agency to agency/i],
	['Negotiated: two failed biddings', /two failed/i],
	['Negotiated: community participation', /community participation|sagip saka/i],
	['Negotiated: other', /negotiated|^NP\b/i],
	['Limited source bidding', /limited source/i],
	['Repeat order', /repeat order/i],
]
export const NOT_PUBLISHED = 'Not published'
export const modeGroups = [...MODE_RULES.map(([name]) => name), 'Other', NOT_PUBLISHED]
const modeOf = (mode: string | null) => (mode ? (MODE_RULES.find(([, r]) => r.test(mode))?.[0] ?? 'Other') : NOT_PUBLISHED)

/** "Regular Agency Fund (01000000)" as "Regular Agency Fund". */
const fundOf = (fund: string | null) => (fund ? fund.replace(/\s*\(\d+\)\s*$/, '') : NOT_PUBLISHED)

/* ---- Where a notice stands ------------------------------------------------ */
export const stages = ['Open for bids', 'Awarded', 'Failed', 'No award recorded'] as const
export type Stage = (typeof stages)[number]

export type Award = { awardee: string; amount: number | null; date: string | null; contractNo: string | null }

export type Notice = {
	ref: string
	date: string | null
	year: number | null
	entity: number
	category: string | null
	/** One of `groups`, from the category. */
	group: string
	abc: number | null
	title: string | null
	mode: string | null
	classification: string | null
	status: string | null
	awards: Award[]
	/** One of `modeGroups`. */
	modeGroup: string
	/** Source of funds, modernized PhilGEPS only; otherwise NOT_PUBLISHED. */
	fund: string
	/** Last day to bid, modernized PhilGEPS only. */
	closing: string | null
	stage: Stage
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

const today = new Date().toISOString().slice(0, 10)

export const notices: Notice[] = raw.notices.map(([ref, , date, entity, category, abc, title, mode, cls, status, awards, fund, closing, open]) => ({
	ref,
	date,
	year: date ? Number(date.slice(0, 4)) : null,
	entity,
	category: category == null ? null : raw.categorys[category],
	group: groupOf(category == null ? null : raw.categorys[category]),
	abc,
	title,
	mode: mode == null ? null : raw.modes[mode],
	classification: cls == null ? null : raw.classes[cls],
	status: status == null ? null : raw.statuss[status],
	awards: awards.map(([awardee, amount, awardDate, contractNo]) => ({ awardee: raw.awardees[awardee], amount, date: awardDate, contractNo })),
	modeGroup: modeOf(mode == null ? null : raw.modes[mode]),
	fund: fundOf(fund == null ? null : raw.funds[fund]),
	closing: closing ?? null,
	stage: awards.length || (status != null && raw.statuss[status] === 'Awarded')
		? 'Awarded'
		: open && (!closing || closing >= today)
			? 'Open for bids'
			: status != null && /fail/i.test(raw.statuss[status]!)
				? 'Failed'
				: 'No award recorded',
}))

/** The sources of funds that appear, most used first, NOT_PUBLISHED last. */
export const funds = (() => {
	const tally = new Map<string, number>()
	for (const n of notices) if (n.fund !== NOT_PUBLISHED) tally.set(n.fund, (tally.get(n.fund) ?? 0) + 1)
	return [...[...tally.entries()].sort((a, b) => b[1] - a[1]).map(([f]) => f), NOT_PUBLISHED]
})()

/** Notices still taking bids, soonest closing first. */
export const openNotices = notices.filter((n) => n.stage === 'Open for bids').sort((a, b) => (a.closing ?? '').localeCompare(b.closing ?? ''))

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
	const by = new Map<
		string,
		{ name: string; awards: number; amount: number; entities: Set<number>; last: string | null; byGroup: Map<string, number> }
	>()
	for (const n of notices)
		for (const a of n.awards) {
			const s = by.get(a.awardee) ?? { name: a.awardee, awards: 0, amount: 0, entities: new Set<number>(), last: null, byGroup: new Map() }
			s.awards += 1
			s.amount += a.amount ?? 0
			s.entities.add(n.entity)
			s.byGroup.set(n.group, (s.byGroup.get(n.group) ?? 0) + (a.amount ?? 0) + 1)
			if (a.date && (!s.last || a.date > s.last)) s.last = a.date
			by.set(a.awardee, s)
		}
	// A supplier's category is the group it won the most money in.
	return [...by.values()]
		.map(({ byGroup, ...s }) => ({ ...s, group: [...byGroup.entries()].sort((x, y) => y[1] - x[1])[0]?.[0] ?? OTHER }))
		.sort((x, y) => y.amount - x.amount)
})()

export type NoticeQuery = {
	entity?: number
	q?: string
	year?: number
	group?: string
	supplier?: string
	stage?: string
	mode?: string
	fund?: string
	page?: number
}

export const PAGE = 50

/** One page of notices, newest first, with the totals of everything matched. */
export function searchNotices({ entity, q, year, group, supplier, stage, mode, fund, page = 1 }: NoticeQuery) {
	const words = (q ?? '').toLowerCase().split(/\s+/).filter(Boolean)
	const who = supplier?.toLowerCase()
	const matched = notices.filter((n) => {
		if (entity != null && n.entity !== entity) return false
		if (year != null && n.year !== year) return false
		if (group && n.group !== group) return false
		if (stage && n.stage !== stage) return false
		if (mode && n.modeGroup !== mode) return false
		if (fund && n.fund !== fund) return false
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
