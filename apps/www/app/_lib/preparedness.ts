import data from '../../../../datasets/preparedness/exposure.json'
import populationFile from '../../../../datasets/preparedness/population.json'
import lguFile from '../../../../datasets/lgu/barmm-lgu.json'
import { localGovernments } from './directory'

/* ============================================================
   Disaster risk and preparedness

   Every barangay of the region against Project NOAH's three hazard maps —
   flood for a 100-year rain, landslide, and storm surge at the worst
   advisory level — as the km² of it in each hazard class. The maps
   themselves are vector tiles the page draws; this is the arithmetic,
   done once offline (datasets/preparedness/scripts/build_hazards.py).

   NOAH's maps are a model of what could happen, not a record of what
   has. They are shared under the Open Database License, as this is.
   ============================================================ */

import { HAZARDS, PROVINCE_NAMES, type HazardId } from './preparedness-shared'

export { CLASS_COLORS, CLASS_LABELS, HAZARDS, PROVINCE_NAMES, type HazardId } from './preparedness-shared'

type Classes = [number, number, number]
export type Barangay = {
	psgc: string
	name: string
	town: string
	town_psgc: string
	prov: string
	area: number
	/** A point inside it, [lon, lat], and its bounds [west, south, east, north]. */
	at: [number, number]
	bbox: [number, number, number, number]
	/** PSA's 2024 census count, or null where the PSGC has none (three Special Geographic Area barangays PSA has since moved). */
	pop?: number | null
} & Record<HazardId, Classes>

const population = populationFile.population as Record<string, number>
export const barangays = (data.barangays as unknown as Barangay[]).map((b) => ({ ...b, pop: population[b.psgc] ?? null }))
export const populationMeta = { note: populationFile.note as string }
export const preparednessMeta = { generatedAt: data.generatedAt as string, note: data.note as string, licence: data.licence as string }

/** "City of Lamitan" and "Lamitan City" agree. */
const fold = (s: string | null) => (s ?? '').toLowerCase().replace(/\bcity of\b|\bcity\b/g, '').replace(/[^a-z0-9]/g, '')
const directoryHref = new Map(localGovernments.flatMap((g) => g.units.map((u) => [`${g.slug}|${fold(u.name)}`, u.href] as const)))

export type AreaSummary = {
	key: string
	name: string
	prov: string
	href: string | null
	area: number
	barangays: number
	/** km² in each class, per hazard. */
	km2: Record<HazardId, Classes>
	/** Barangays with at least a tenth of their land in the high class, per hazard. */
	highBarangays: Record<HazardId, number>
	/** People (2024) in those barangays, and in all of the area's barangays with a count. */
	highPeople: Record<HazardId, number>
	pop: number
}

const HIGH_SHARE = 0.1

function summarize(key: string, name: string, prov: string, list: Barangay[], href: string | null): AreaSummary {
	const km2 = { flood: [0, 0, 0], landslide: [0, 0, 0], surge: [0, 0, 0] } as Record<HazardId, Classes>
	const highBarangays = { flood: 0, landslide: 0, surge: 0 }
	const highPeople = { flood: 0, landslide: 0, surge: 0 }
	for (const b of list)
		for (const h of HAZARDS) {
			for (let c = 0; c < 3; c++) km2[h.id][c] += b[h.id][c]
			if (b.area && b[h.id][2] / b.area >= HIGH_SHARE) {
				highBarangays[h.id]++
				highPeople[h.id] += b.pop ?? 0
			}
		}
	const pop = list.reduce((s, b) => s + (b.pop ?? 0), 0)
	return { key, name, prov, href, area: list.reduce((s, b) => s + b.area, 0), barangays: list.length, km2, highBarangays, highPeople, pop }
}

const byTown = new Map<string, (typeof barangays)[number][]>()
for (const b of barangays) byTown.set(b.town_psgc, [...(byTown.get(b.town_psgc) ?? []), b])

export const towns: AreaSummary[] = [...byTown.entries()].map(([psgc, list]) => {
	const b = list[0]!
	// Cotabato City is a town of its own province in the Directory.
	const href = directoryHref.get(`${b.prov}|${fold(b.town)}`) ?? null
	return summarize(psgc, b.town, b.prov, list, href)
})

export const provinces: AreaSummary[] = Object.entries(PROVINCE_NAMES).map(([slug, name]) =>
	summarize(slug, name, slug, barangays.filter((b) => b.prov === slug), `/directory/lgu/${slug}`),
)

export const region = summarize('barmm', 'BARMM', 'barmm', barangays, null)

/** The region's barangays as PSA's code lists them today (2,185). The hazard maps measure the 2,182 the
 *  boundary file draws; three Special Geographic Area barangays were made or moved after it. */
export const officialBarangays = lguFile.totals.barangays as number

/** Share of an area's land in a hazard's class (0-based), or in medium and high together. */
export const share = (a: { area: number; km2: Record<HazardId, Classes> }, h: HazardId, cls: 0 | 1 | 2) => (a.area ? a.km2[h][cls] / a.area : 0)
export const shareMedHigh = (a: { area: number; km2: Record<HazardId, Classes> }, h: HazardId) => (a.area ? (a.km2[h][1] + a.km2[h][2]) / a.area : 0)
