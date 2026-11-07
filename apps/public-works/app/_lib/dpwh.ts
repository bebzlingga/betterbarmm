import fs from 'node:fs'
import path from 'node:path'

/* ============================================================
   DPWH's own projects inside the Bangsamoro

   Read from datasets/public-works/dpwh.json, which
   datasets/public-works/scripts/build_dpwh.py builds from the DPWH
   Transparency Portal. DPWH has no regional office in BARMM, so these
   are the projects the offices around it built inside the region,
   placed in a town by their coordinates or by the town their
   description names. The Act-funded projects are works.ts.
   ============================================================ */

export type Bidder = { name: string; won: boolean }

export type NationalWork = {
	id: string
	name: string
	category: string | null
	status: string | null
	progress: number | null
	/** The contract cost the portal shows. */
	cost: number | null
	/** Approved budget for the contract, as bid out. */
	abc: number | null
	award: number | null
	contractor: string | null
	bidders: Bidder[]
	year: number | null
	advertised: string | null
	start: string | null
	end: string | null
	funds: string | null
	program: string | null
	/** The implementing office, e.g. "Region X" or "Cotabato City DEO". */
	office: string
	region: string | null
	area: string
	areaName: string
	town: { slug: string; name: string }
	/** How the town was found: its point, its description, or both agreeing. */
	located: 'coordinates' | 'name' | 'both'
	lat: number | null
	lon: number | null
	docs: Partial<Record<'advertisement' | 'noticeOfAward' | 'contractAgreement' | 'noticeToProceed' | 'programOfWork' | 'engineeringDesign', string>>
	images: number
	live: string | null
}

type Dataset = { generatedAt: string; source: { label: string; href: string; via: string; viaHref: string }; note: string; dropped: Record<string, number>; projects: NationalWork[] }

function root() {
	const roots = [process.cwd(), path.join(process.cwd(), '..'), path.join(process.cwd(), '../..')]
	const r = roots.find((r) => fs.existsSync(path.join(r, 'datasets/public-works')))
	if (!r) throw new Error('datasets/public-works not found')
	return r
}

export const dpwh: Dataset = JSON.parse(fs.readFileSync(path.join(root(), 'datasets/public-works/dpwh.json'), 'utf8'))
export const nationalWorks = dpwh.projects

const fold = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()

export const nationalYears = [...new Set(nationalWorks.map((w) => w.year).filter((y): y is number => y != null))].sort()
const counted = (values: (string | null)[]) => {
	const n = new Map<string, number>()
	for (const v of values) if (v) n.set(v, (n.get(v) ?? 0) + 1)
	return [...n.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k)
}
/** The portal's own categories, most common first; the rare ones (program codes) are left to search. */
export const nationalCategories = counted(nationalWorks.map((w) => w.category)).filter((c) => nationalWorks.filter((w) => w.category === c).length >= 20)
export const nationalStatuses = counted(nationalWorks.map((w) => w.status))
export const nationalAreas = [...new Map(nationalWorks.map((w) => [w.areaName, w.area])).entries()]
	.map(([name, slug]) => ({ name, slug }))
	.sort((a, b) => a.name.localeCompare(b.name))
export const nationalOffices = counted(nationalWorks.map((w) => w.office))

export type NationalQuery = { q?: string; year?: number; area?: string; category?: string; status?: string; office?: string; sort?: 'cost' | 'year' }

export function matchNational({ q, year, area, category, status, office, sort = 'year' }: NationalQuery) {
	const terms = fold(q ?? '').split(/\s+/).filter(Boolean)
	return nationalWorks
		.filter((w) => {
			if (year && w.year !== year) return false
			if (area && w.areaName !== area) return false
			if (category && w.category !== category) return false
			if (status && w.status !== status) return false
			if (office && w.office !== office) return false
			if (terms.length) {
				const hay = fold(`${w.name} ${w.id} ${w.town.name} ${w.areaName} ${w.contractor ?? ''} ${w.bidders.map((b) => b.name).join(' ')}`)
				if (!terms.every((t) => hay.includes(t))) return false
			}
			return true
		})
		.sort((a, b) => (sort === 'cost' ? (b.cost ?? 0) - (a.cost ?? 0) : (b.year ?? 0) - (a.year ?? 0) || (b.cost ?? 0) - (a.cost ?? 0)))
}

export const PAGE = 40

export function searchNational(query: NationalQuery & { page?: number }) {
	const matched = matchNational(query)
	const page = query.page ?? 1
	return {
		count: matched.length,
		total: matched.reduce((s, w) => s + (w.cost ?? 0), 0),
		ongoing: matched.filter((w) => w.status === 'On-Going').length,
		page,
		pages: Math.max(1, Math.ceil(matched.length / PAGE)),
		rows: matched.slice((page - 1) * PAGE, page * PAGE),
	}
}

export const nationalQuery = (p: URLSearchParams): NationalQuery => ({
	q: p.get('q')?.slice(0, 200) ?? undefined,
	year: Number(p.get('year')) || undefined,
	area: p.get('area') ?? undefined,
	category: p.get('category') ?? undefined,
	status: p.get('status') ?? undefined,
	office: p.get('office') ?? undefined,
	sort: p.get('sort') === 'cost' ? 'cost' : 'year',
})
