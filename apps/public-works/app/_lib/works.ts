import fs from 'node:fs'
import path from 'node:path'
import { lguProvinces } from '@betterbarmm/lgu-data'

/* ============================================================
   Public works, FY 2020 to FY 2026

   Every infrastructure project the Bangsamoro General Appropriations
   Acts itemise under the Ministry of Public Works, read from the
   budget workspace's extraction of each Act. Three things are added:

     · what kind of work it is, from the words of its name;
     · the town it is in, where its name says so;
     · the PhilGEPS bid notice that is probably it, matched by the
       distinctive words of its name, its year and its amount.

   The third is a likely match, not a certain one, and is labelled so.
   ============================================================ */

export type Work = {
	id: string
	year: number
	name: string
	amount: number
	sourcePage: number | null
	/** The heading the Act lists it under, e.g. "Lanao Del Sur I". */
	heading: string
	/** Directory province slug, or null where the area has left the region (Sulu). */
	area: string | null
	areaName: string
	town: { slug: string; name: string } | null
	kinds: string[]
	notice: { ref: string; title: string; date: string; budget: number | null; office: string; officeSlug: string } | null
}

/* ---- Where the Act's heading puts it ---- */
const HEADINGS: [RegExp, string | null, string][] = [
	[/^basilan/i, 'basilan', 'Basilan'],
	[/^cotabato city/i, 'cotabato-city', 'Cotabato City'],
	[/^lanao/i, 'lanao-del-sur', 'Lanao del Sur'],
	[/^maguindanao del norte/i, 'maguindanao-del-norte', 'Maguindanao del Norte'],
	[/^maguindanao del sur/i, 'maguindanao-del-sur', 'Maguindanao del Sur'],
	// Before the 2022 split: the old province's districts. The town decides.
	[/^maguindanao/i, 'maguindanao', 'Maguindanao'],
	[/^special geographic/i, 'special-geographic-area', 'Special Geographic Area'],
	[/^tawi/i, 'tawi-tawi', 'Tawi-Tawi'],
	[/^sulu/i, null, 'Sulu'],
]

/* ---- What kind of work ---- */
const KINDS: [string, RegExp][] = [
	['Road', /\broad|street|highway|con(c)?reting of|pavement|asphalt/i],
	['Bridge', /\bbridge\b|box culvert/i],
	['Footbridge', /footbridge|foot bridge|pierhead/i],
	['Water', /water system|water supply|water tank|level ii|level iii|deep well|spring development|rainwater/i],
	['Flood control', /flood|riverbank|river bank|riverwall|lakewall|slope protection|drainage|canal|seawall|sea wall|revetment|shore protection|dike/i],
	['Building', /building|center|centre|hall|school|classroom|madrasah|masjid|mosque|market|gymnasium|clinic|hospital|terminal|office/i],
	['Port', /\bport\b|wharf|jetty|causeway/i],
	['Lighting', /solar|street ?light/i],
]

const fold = (s: string) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function root() {
	const roots = [process.cwd(), path.join(process.cwd(), '..'), path.join(process.cwd(), '../..')]
	const r = roots.find((r) => fs.existsSync(path.join(r, 'datasets/budget')))
	if (!r) throw new Error('datasets/ not found')
	return r
}

/* ---- Places a project's name can name ---- */
// Sulu's towns: no longer in the directory, which follows the region since 2024.
const SULU_TOWNS = ['Banguingui', 'Hadji Panglima Tahil', 'Indanan', 'Jolo', 'Kalingalan Caluang', 'Lugus', 'Luuk', 'Maimbung', 'Old Panamao', 'Omar', 'Pandami', 'Panglima Estino', 'Pangutaran', 'Parang', 'Pata', 'Patikul', 'Siasi', 'Talipao', 'Tapul', 'Tongkil']
// The North Cotabato towns the Special Geographic Area's barangays were taken from.
const SGA_PARENTS = ['Midsayap', 'Pikit', 'Pigcawayan', 'Kabacan', 'Aleosan', 'Carmen']

/* The towns, longest name first so "Datu Odin Sinsuat" beats "Datu". A place
   the name gives outranks the heading the Act files it under: the extraction
   puts some pages under the wrong province (a dike in Midsayap under
   Tawi-Tawi, a boulevard in Jolo under Basilan). */
const towns = [
	...lguProvinces.flatMap((p) => p.municipalities.map((m) => ({ area: p.slug as string | null, areaName: p.name, slug: m.slug as string | null, name: m.name }))),
	...SULU_TOWNS.map((name) => ({ area: null, areaName: 'Sulu', slug: null, name })),
	...SGA_PARENTS.map((name) => ({ area: 'special-geographic-area', areaName: 'Special Geographic Area', slug: null, name })),
]
	.map((t) => ({ ...t, pattern: new RegExp(`\\b${fold(t.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[\s-]+/g, '[\\s-]+')}\\b`) }))
	.sort((a, b) => b.name.length - a.name.length)

/* ---- PhilGEPS: the Ministry of Public Works' notices that have titles ---- */
type Notice = { ref: string; date: string; title: string; budget: number | null; office: string; officeSlug: string; words: Set<string> }

const slugify = (name: string) =>
	name
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 80)

const words = (s: string) => new Set((fold(s).match(/[a-z0-9]+/g) ?? []).filter((w) => w.length > 2 && !/^\d+$/.test(w)))

function readNotices(): Notice[] {
	const file = path.join(root(), 'datasets/procurement/philgeps.json')
	if (!fs.existsSync(file)) return []
	const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as { columns: string[]; entities: { name: string }[]; notices: unknown[][] }
	const c = (n: string) => raw.columns.indexOf(n)
	const used = new Set<string>()
	const slugs = raw.entities.map((e) => {
		let s = slugify(e.name.replace(/\s+/g, ' ').trim())
		while (used.has(s)) s += '-2'
		used.add(s)
		return s
	})
	return raw.notices
		.filter((n) => n[c('title')] && /PUBLIC WORKS/i.test(raw.entities[n[c('entity')] as number]!.name))
		.map((n) => {
			const e = n[c('entity')] as number
			return {
				ref: n[c('ref')] as string,
				date: n[c('date')] as string,
				title: n[c('title')] as string,
				budget: n[c('abc')] as number | null,
				office: raw.entities[e]!.name,
				officeSlug: slugs[e]!,
				words: words(n[c('title')] as string),
			}
		})
}

type RawProject = { project: string; amount: number; source_page?: number }

export const works: Work[] = (() => {
	const dir = path.join(root(), 'datasets/budget')
	const files = fs
		.readdirSync(dir)
		.filter((f) => /^BAA\d+_FY\d{4}_budget\.json$/.test(f))
		.map((f) => ({ year: Number(f.match(/FY(\d{4})/)![1]), file: path.join(dir, f) }))
		.sort((a, b) => a.year - b.year)

	const out: Work[] = []
	for (const { year, file } of files) {
		const { agencies } = JSON.parse(fs.readFileSync(file, 'utf8')) as {
			agencies: { infrastructure_projects?: { by_province: { province: string; projects: RawProject[] }[] } }[]
		}
		let i = 0
		for (const a of agencies)
			for (const group of a.infrastructure_projects?.by_province ?? [])
				for (const p of group.projects) {
					const [, area, areaName] = HEADINGS.find(([re]) => re.test(group.province)) ?? [null, null, group.province]
					const text = fold(p.project)
					// Its heading's own towns first (old Maguindanao's sit in either new
					// province), then any town anywhere.
					const inHeading = (t: (typeof towns)[number]) =>
						area === 'maguindanao' ? Boolean(t.area?.startsWith('maguindanao')) : area === null ? t.areaName === 'Sulu' : t.area === area
					// Moved out of its heading only on the town the Act gives as its location,
					// after the last comma ("…, Patikul"): a sitio called Parang is not Parang.
					const tail = text.includes(',') ? text.slice(text.lastIndexOf(',') + 1) : ''
					// Parang is a town in Sulu and in Maguindanao del Norte; outside a
					// Maguindanao heading it is Sulu's.
					const cross = towns.filter((t) => t.pattern.test(tail))
					const place =
						towns.find((t) => inHeading(t) && t.pattern.test(text)) ??
						(cross.length > 1 && !/maguindanao/i.test(group.province) ? cross.find((t) => t.areaName === 'Sulu') : undefined) ??
						cross[0]
					const town = place?.slug ? { slug: place.slug, name: place.name } : null
					out.push({
						id: `${year}-${++i}`,
						year,
						name: p.project.replace(/\s+/g, ' ').trim(),
						amount: p.amount,
						sourcePage: p.source_page ?? null,
						heading: group.province,
						area: place ? place.area : area === 'maguindanao' ? null : area,
						areaName: place?.areaName ?? areaName,
						town,
						kinds: KINDS.filter(([, re]) => re.test(p.project)).map(([k]) => k).slice(0, 2),
						notice: null,
					})
				}
	}

	// ---- Likely bid notices ----
	// Words common to many project names ("road", "barangay", "phase") say
	// nothing about which project is which; only the rarer ones are compared.
	const frequency = new Map<string, number>()
	for (const w of out) for (const t of words(w.name)) frequency.set(t, (frequency.get(t) ?? 0) + 1)
	const distinctive = (s: Set<string>) => new Set([...s].filter((t) => (frequency.get(t) ?? 0) <= out.length * 0.015))
	const notices = readNotices()
	const byWord = new Map<string, Notice[]>()
	for (const n of notices) for (const t of distinctive(n.words)) byWord.set(t, [...(byWord.get(t) ?? []), n])
	for (const w of out) {
		const mine = distinctive(words(w.name))
		if (mine.size < 2) continue
		let best: Notice | null = null
		let score = 0
		for (const n of new Set([...mine].flatMap((t) => byWord.get(t) ?? []))) {
			const year = Number(n.date.slice(0, 4))
			// Bid out in its own year or the next, for no more than its budget and not a sliver of it.
			if (year !== w.year && year !== w.year + 1) continue
			if (n.budget != null && (n.budget > w.amount * 1.1 || n.budget < w.amount * 0.5)) continue
			const s = [...mine].filter((t) => n.words.has(t)).length / mine.size
			if (s > score) [best, score] = [n, s]
		}
		if (best && score >= 0.8)
			w.notice = { ref: best.ref, title: best.title, date: best.date, budget: best.budget, office: best.office, officeSlug: best.officeSlug }
	}
	return out
})()

export const workYears = [...new Set(works.map((w) => w.year))].sort()
export const workKinds = KINDS.map(([k]) => k)
export const workAreas = [...new Map(works.map((w) => [w.areaName, w.area])).entries()]
	.map(([name, slug]) => ({ name, slug }))
	.sort((a, b) => a.name.localeCompare(b.name))

export type WorkQuery = { q?: string; year?: number; area?: string; kind?: string; notice?: boolean; sort?: 'amount' | 'year' }

/** Every project the query matches: by amount, or newest first. */
export function matchWorks({ q, year, area, kind, notice, sort = 'amount' }: WorkQuery) {
	const terms = fold(q ?? '').split(/\s+/).filter(Boolean)
	return works
		.filter((w) => {
			if (year && w.year !== year) return false
			if (area && w.areaName !== area) return false
			if (kind && !w.kinds.includes(kind)) return false
			if (notice && !w.notice) return false
			if (terms.length) {
				const hay = fold(`${w.name} ${w.town?.name ?? ''} ${w.areaName} ${w.notice?.ref ?? ''}`)
				if (!terms.every((t) => hay.includes(t))) return false
			}
			return true
		})
		.sort((a, b) => (sort === 'year' ? b.year - a.year || b.amount - a.amount : b.amount - a.amount))
}

export const PAGE = 40

export function searchWorks(query: WorkQuery & { page?: number }) {
	const matched = matchWorks(query)
	const page = query.page ?? 1
	return {
		count: matched.length,
		total: matched.reduce((s, w) => s + w.amount, 0),
		withNotice: matched.filter((w) => w.notice).length,
		page,
		pages: Math.max(1, Math.ceil(matched.length / PAGE)),
		rows: matched.slice((page - 1) * PAGE, page * PAGE),
	}
}

/** The explorer's filters, read off a URL. */
export const worksQuery = (p: URLSearchParams): WorkQuery => ({
	q: p.get('q')?.slice(0, 200) ?? undefined,
	year: Number(p.get('year')) || undefined,
	area: p.get('area') ?? undefined,
	kind: p.get('kind') ?? undefined,
	notice: p.get('notice') === '1',
	sort: p.get('sort') === 'year' ? 'year' : 'amount',
})
