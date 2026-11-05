import fs from 'node:fs'
import path from 'node:path'
import { budgetFor, FISCAL_YEARS, LATEST_YEAR, type ProgramLine } from '@betterbarmm/budget-data'
import { lguProvinces } from '@betterbarmm/lgu-data'
import { buyers } from './bids'
import { SCHOOL_TYPES, type MapSchool } from './school-types'

/* ============================================================
   Education in the Bangsamoro

   Two records, each kept as its publisher printed it:

     · the money: what each year's General Appropriations Act of the
       Bangsamoro gives the Ministry of Basic, Higher and Technical
       Education, program by program, from the Budget workspace;
     · the schools: the public schools on the Department of
       Education's 2019 masterlist, and the private schools, madaris,
       colleges and universities OpenStreetMap names, placed in the
       directory's towns (datasets/education/schools.json).

   And who buys for the ministry, from the Procurement workspace.
   ============================================================ */

export const OFFICE = 'ministry-of-basic-higher-and-technical-education'
export const BUDGET_URL = `https://budget.betterbarmm.com/offices/${OFFICE}`

/** Oldest year first, as a chart reads. */
export const years = [...FISCAL_YEARS].reverse()

export const spending = years.map((year) => {
	const office = budgetFor(year).findOffice(OFFICE)!
	return { year, total: office.totals.total, share: office.share }
})

export const latestYear = LATEST_YEAR
export const latest = budgetFor(LATEST_YEAR).findOffice(OFFICE)!

/** A program's amount each year, by its name. The Acts write names differently from year to year
    (in capitals in FY 2021; madaris as two programs in FY 2020), so lines that match are summed. */
export function programSeries(name: RegExp): number[] {
	return years.map((year) => {
		const ops = budgetFor(year).findOffice(OFFICE)!.programs.find((p) => /^Operations/i.test(p.name))
		return (ops?.children ?? []).filter((c) => name.test(c.name)).reduce((s, c) => s + c.total, 0)
	})
}

/** What the ministry does with the money: the programs under Operations, largest first. */
export const programs: ProgramLine[] = [...(latest.programs.find((p) => p.name === 'Operations')?.children ?? [])].sort((a, b) => b.total - a.total)

/* ---- The schools ------------------------------------------------------- */

export type School = {
	id: string
	name: string
	level: string
	/** Its kind, for the map's colours and the filters. */
	type: string
	management: 'Public' | 'Private' | 'Not stated'
	/** Where it is listed: DepEd's masterlist, OpenStreetMap, or Wikipedia's list of colleges (and a few school articles). */
	source: 'deped' | 'openstreetmap' | 'wikipedia'
	area: string
	town: string
	townName: string
	district: string | null
	founded: number | null
	pupils2012: number | null
	pupils2015: number | null
	lat: number | null
	lon: number | null
	/** Where the pin comes from: the masterlist, OpenStreetMap, Wikidata, or only the town's centre. */
	placed: 'masterlist' | 'openstreetmap' | 'wikidata' | 'town' | null
	osm?: string
	/** The page it was added from, for a school added by hand. */
	url?: string
	/** A line about it from that page. */
	note?: string
	image?: { url: string; page: string; author: string; license: string; width: number; height: number; caption: string }
}

type SchoolsFile = { source: { title: string; url: string; via: string; publisher: string }; note: string; schools: School[] }

function readSchools(): SchoolsFile {
	const roots = [process.cwd(), path.join(process.cwd(), '..'), path.join(process.cwd(), '../..')]
	const file = roots.map((r) => path.join(r, 'datasets/education/schools.json')).find((f) => fs.existsSync(f))
	if (!file) throw new Error('datasets/education/schools.json not found')
	return JSON.parse(fs.readFileSync(file, 'utf8')) as SchoolsFile
}

export const areaNameOf = (slug: string) => lguProvinces.find((p) => p.slug === slug)?.name ?? slug

/** Pinned where it stands, rather than at its town's centre. */
export const isExact = (s: Pick<School, 'placed'>) => s.placed != null && s.placed !== 'town'

/** Where a school not on DepEd's list is listed, for the list and the card. */
export const SOURCE_LABEL: Record<School['source'], string> = { deped: 'DepEd', openstreetmap: 'OpenStreetMap', wikipedia: 'Wikipedia' }

const schoolsFile = readSchools()
export const schools = schoolsFile.schools
export const schoolsSource = schoolsFile.source

export const TYPES = SCHOOL_TYPES.map((t) => t.label).filter((t) => schools.some((s) => s.type === t))

/** The directory's areas, in its order, each with its schools counted by kind. */
export const schoolAreas = lguProvinces.map((p) => {
	const here = schools.filter((s) => s.area === p.slug)
	return {
		slug: p.slug,
		name: p.name,
		total: here.length,
		byType: Object.fromEntries(TYPES.map((t) => [t, here.filter((s) => s.type === t).length])) as Record<string, number>,
	}
})

export const countBy = (key: 'source' | 'management' | 'type', value: string) => schools.filter((s) => s[key] === value).length

export const schoolById = new Map(schools.map((s) => [s.id, s]))

/* ---- Histories ----------------------------------------------------------
   For the schools whose story is on the record: a few paragraphs, each
   drawn from the sources listed under it (datasets/education/school-histories.json). */

export type SchoolHistory = { id: string; name: string; history: string[]; founded: string | null; sources: { title: string; url: string }[] }

export const historyById: Map<string, SchoolHistory> = (() => {
	const roots = [process.cwd(), path.join(process.cwd(), '..'), path.join(process.cwd(), '../..')]
	const file = roots.map((r) => path.join(r, 'datasets/education/school-histories.json')).find((f) => fs.existsSync(f))
	if (!file) return new Map()
	const list = (JSON.parse(fs.readFileSync(file, 'utf8')) as { schools: SchoolHistory[] }).schools
	return new Map(list.filter((h) => schoolById.has(h.id)).map((h) => [h.id, h]))
})()

/** What the map needs of a school, and no more: it travels to the browser. */
export const toMapSchool = (s: School): MapSchool => ({
	id: s.id,
	name: s.name,
	type: s.type,
	level: s.level,
	management: s.management,
	area: s.area,
	areaName: areaNameOf(s.area),
	townName: s.townName,
	pupils: s.pupils2015,
	exact: isExact(s),
	lat: s.lat!,
	lon: s.lon!,
	image: s.image ? { url: s.image.url, author: s.image.author, license: s.image.license, page: s.image.page } : null,
})
export const mapSchools = schools.filter((s) => s.lat != null && s.lon != null).map(toMapSchool)

/** Pupils enrolled, as the 2019 list records them for school year 2015–16, and the total. */
export const pupilsTotal = schools.reduce((n, s) => n + (s.pupils2015 ?? 0), 0)

/** The schools with the most pupils, largest first. */
export const largestSchools = [...schools].filter((s) => s.pupils2015).sort((a, b) => b.pupils2015! - a.pupils2015!)

/** Each town: its schools, its pupils, and pupils per school, the busiest first. */
export const townLoads = (() => {
	const towns = new Map<string, { area: string; town: string; townName: string; schools: number; pupils: number; counted: number }>()
	for (const s of schools) {
		const t = towns.get(s.town) ?? towns.set(s.town, { area: s.area, town: s.town, townName: s.townName, schools: 0, pupils: 0, counted: 0 }).get(s.town)!
		t.schools += 1
		if (s.pupils2015) {
			t.pupils += s.pupils2015
			t.counted += 1
		}
	}
	return [...towns.values()]
		.map((t) => ({ ...t, perSchool: t.counted ? Math.round(t.pupils / t.counted) : 0 }))
		.sort((a, b) => b.perSchool - a.perSchool)
})()

/** Distance in kilometres between two points, near enough at this latitude. */
const km = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
	const r = Math.PI / 180
	return Math.hypot((b.lon - a.lon) * r * Math.cos(((a.lat + b.lat) / 2) * r), (b.lat - a.lat) * r) * 6371
}

/** The schools nearest one that is pinned where it stands, nearest first, with the distance. A school placed only
    at its town is left out of both ends: its distance would be the town's, not its own. */
export function nearbySchools(school: School, n = 6): { school: School; km: number }[] {
	const { lat, lon } = school
	if (lat == null || lon == null || school.placed === 'town') return []
	return schools
		.filter((s) => s.id !== school.id && s.lat != null && s.lon != null && s.placed !== 'town')
		.map((s) => ({ school: s, km: km({ lat, lon }, { lat: s.lat!, lon: s.lon! }) }))
		.sort((a, b) => a.km - b.km)
		.slice(0, n)
}

/** How many schools are pinned where they are, and how many only at their town. */
export const placedCounts = {
	exact: schools.filter(isExact).length,
	town: schools.filter((s) => s.placed === 'town').length,
}

/** A school's size against the region's: how it is described on its page. */
export function sizeOf(pupils: number | null): string | null {
	if (!pupils) return null
	const rank = largestSchools.findIndex((s) => s.pupils2015! <= pupils)
	const share = rank / largestSchools.length
	return share < 0.1 ? 'Among the largest tenth of schools in the region' : share < 0.5 ? 'Larger than most schools in the region' : 'Smaller than most schools in the region'
}

/* ---- Divisions and districts ------------------------------------------- */

export type District = { name: string; full: string; schools: number; pupils: number; towns: string[] }
export type Division = { name: string; area: string; schools: number; pupils: number; districts: District[] }

/** The schools divisions and districts the masterlist files each public school under ("Tuburan District of Basilan
    Schools Division"; the city's are "District I Cotabato City Schools Division"), with each district's schools and pupils. */
export const divisions: Division[] = (() => {
	const parse = (d: string) => {
		const full = d.replace(/, Department of Education$/, '')
		const m = full.match(/^(District [IVX]+) (.+ Schools Division)$/) ?? full.match(/^(.+? District) (?:of )?(.+ Schools Division)$/)
		return { full, district: m?.[1] ?? full, division: m?.[2] ?? full }
	}
	const map = new Map<string, { name: string; area: string; districts: Map<string, { name: string; full: string; schools: number; pupils: number; towns: Set<string> }> }>()
	for (const s of schools) {
		if (!s.district) continue
		const { full, district, division } = parse(s.district)
		const dv = map.get(division) ?? map.set(division, { name: division, area: s.area, districts: new Map() }).get(division)!
		const dt = dv.districts.get(district) ?? dv.districts.set(district, { name: district, full, schools: 0, pupils: 0, towns: new Set() }).get(district)!
		dt.schools += 1
		dt.pupils += s.pupils2015 ?? 0
		dt.towns.add(s.townName)
	}
	return [...map.values()]
		.map((dv) => {
			const districts = [...dv.districts.values()].map((d) => ({ ...d, towns: [...d.towns].sort() })).sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }))
			return { name: dv.name, area: dv.area, districts, schools: districts.reduce((n, d) => n + d.schools, 0), pupils: districts.reduce((n, d) => n + d.pupils, 0) }
		})
		.sort((a, b) => areaOrder(a.area) - areaOrder(b.area) || a.name.localeCompare(b.name, 'en', { numeric: true }))
})()
function areaOrder(slug: string) {
	return Math.max(0, lguProvinces.findIndex((p) => p.slug === slug))
}

/* ---- Who buys ---------------------------------------------------------- */

/** The ministry, its schools divisions, Cotabato City's division and the schools that buy on their own. */
export const educationBuyers = buyers(/BASIC,? HIGHER|SCHOOLS? DIVISION|DEPARTMENT OF EDUCATION - DIVISION OF COTABATO|UPI AGRICULTURAL|BANGSAMORO SCIENCE HIGH/i)
