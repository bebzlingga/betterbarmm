import { placesInArea, travelAreas, type Place } from '@betterbarmm/travel-data'
import centresFile from '../../../../datasets/accidents/municipality-centres.json'
import { localGovernments } from './directory'
import { PROVINCE, crafts, festivals, type Craft, type Sourced } from './crafts'
import { officeBySlug, slugify } from './services'

/* Where the crafts are, tied to the rest of the site: each town a craft names, found
   on the map and in the Directory; the festivals and places near it; and the
   programmes that help the people who make it. Server-only: it reads the Directory. */

type Centre = { province: string; municipality: string; slug: string; lat: number; lon: number }
const centres = centresFile.centres as Centre[]

/** A town name as the sources write it, folded: "Marawi City", "Tandubas (Ungos Matata)" and "Marawi" all agree. */
const fold = (s: string) =>
	s
		.toLowerCase()
		.replace(/\(.*?\)/g, '')
		.replace(/\bcity of\b|\bcity\b/g, '')
		.replace(/[^a-z0-9]/g, '')

// The undivided Maguindanao of older sources covers both of today's provinces.
const provinceNames = (slug: string) => (slug === 'maguindanao' ? ['Maguindanao del Norte', 'Maguindanao del Sur'] : [PROVINCE[slug] ?? slug])

const hrefs = new Map(localGovernments.flatMap((g) => g.units.map((u) => [`${fold(g.name)}|${fold(u.name)}`, u.href] as const)))

export type Town = { name: string; province: string; lat: number; lon: number; href: string | null }

/** A town a craft names, matched to the region's towns; the craft's own province wins a tie. */
export function findTown(name: string, provinceSlug: string): Town | null {
	const k = fold(name)
	const hits = centres.filter((c) => fold(c.municipality) === k)
	if (!hits.length) return null
	const own = provinceNames(provinceSlug).map(fold)
	const c = hits.find((h) => own.includes(fold(h.province))) ?? hits[0]!
	return { name: c.municipality, province: c.province, lat: c.lat, lon: c.lon, href: hrefs.get(`${fold(c.province)}|${fold(c.municipality)}`) ?? null }
}

/** Each town the craft names, linked where the Directory has it; a name not matched stays plain. */
export const craftTowns = (c: Craft) => c.towns.map((t) => ({ label: t, town: findTown(t, c.province) }))

/** A province's centre: the mean of its towns'. */
function provinceCentre(slug: string) {
	const names = provinceNames(slug).map(fold)
	const pts = centres.filter((c) => names.includes(fold(c.province)))
	if (!pts.length) return null
	return { lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length, lon: pts.reduce((s, p) => s + p.lon, 0) / pts.length }
}

export type MapPoint = { key: string; label: string; sub: string; lat: number; lon: number; town: boolean; href: string | null; crafts: { slug: string; name: string }[] }

/** One dot per town where a craft is made; a craft that names no town sits faint on its province's centre. */
export function craftMap(): MapPoint[] {
	const pts = new Map<string, MapPoint>()
	const add = (key: string, base: Omit<MapPoint, 'crafts'>, c: Craft) => {
		const p = pts.get(key) ?? { ...base, crafts: [] }
		if (!p.crafts.some((x) => x.slug === c.slug)) p.crafts.push({ slug: c.slug, name: c.name })
		pts.set(key, p)
	}
	for (const c of crafts) {
		const towns = craftTowns(c).filter((t) => t.town)
		for (const { town } of towns) add(`t:${town!.province}|${town!.name}`, { key: `t:${town!.province}|${town!.name}`, label: town!.name, sub: town!.province, lat: town!.lat, lon: town!.lon, town: true, href: town!.href }, c)
		if (!towns.length) {
			const at = provinceCentre(c.province)
			if (at) add(`p:${c.province}`, { key: `p:${c.province}`, label: PROVINCE[c.province] ?? c.province, sub: 'Town not named', ...at, town: false, href: null }, c)
		}
	}
	return [...pts.values()]
}

/** The festivals held in the craft's towns or province, other than those already listed where to see it. */
export function festivalsFor(c: Craft): Sourced[] {
	const towns = c.towns.map(fold)
	const provs = provinceNames(c.province).map(fold)
	const seen = new Set(c.where_to_see.map((w) => w.name))
	return festivals.filter((f) => {
		if (seen.has(f.name)) return false
		const [town, prov] = (f.place ?? '').split(',').map((s) => fold(s))
		return towns.includes(town ?? '') || provs.includes(prov ?? town ?? '')
	})
}

/** Places to see in the towns the craft names, from the travel guide. */
export function placesFor(c: Craft): Place[] {
	const towns = new Set(c.towns.map(fold))
	if (!towns.size) return []
	return travelAreas.flatMap((a) => placesInArea(a.slug)).filter((p) => towns.has(fold(p.municipality)))
}

/* The programmes and services that help the people who make these crafts, as the offices themselves list them.
   Each is checked against the services data, so a renamed or dropped one falls out rather than linking nowhere. */
const SUPPORT: { office: string; kind: 'program' | 'service'; name: string; why: string }[] = [
	{ office: 'bangsamoro-commission-for-the-preservation-of-cultural-heritage', kind: 'program', name: 'School of Living Traditions', why: 'Where masters teach the young a craft that is fading.' },
	{ office: 'bangsamoro-commission-for-the-preservation-of-cultural-heritage', kind: 'program', name: 'Cultural Mapping', why: 'The commission’s record of a town’s heritage, crafts among it.' },
	{ office: 'ministry-of-trade-investments-and-tourism', kind: 'program', name: 'Barangay Micro Business Enterprise (BMBE) registration assistance', why: 'Registers a small workshop, which brings tax relief.' },
	{ office: 'ministry-of-trade-investments-and-tourism', kind: 'program', name: 'Community-based tourism support', why: 'For a weaving village or a brass town that takes visitors.' },
	{ office: 'ministry-of-science-and-technology', kind: 'service', name: 'Conduct of Technology Needs Assessment (TNA) for MSMEs Upgrading', why: 'A look at a workshop’s tools and process, the first step to new equipment.' },
	{ office: 'ministry-of-science-and-technology', kind: 'service', name: 'Request to Join Promotional Events as Exhibitor', why: 'A place for a maker’s table at the ministry’s fairs.' },
	{ office: 'ministry-of-agriculture-fisheries-and-agrarian-reform', kind: 'service', name: 'Market Development (buyer and seller matching, trade fairs)', why: 'Buyer matching and fair space, for crafts from farm materials such as pandan and rattan.' },
]

export const makerSupport = SUPPORT.flatMap((s) => {
	const o = officeBySlug(s.office)
	const list = s.kind === 'program' ? o?.programs : o?.services
	if (!o || !list?.some((x) => x.name === s.name)) return []
	return [{ name: s.name, why: s.why, office: o.acronym ?? o.name, href: `/services/${o.slug}#${s.kind}-${slugify(s.name)}` }]
})
