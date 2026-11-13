import fs from 'node:fs'
import path from 'node:path'
import { budgetFor, FISCAL_YEARS, LATEST_YEAR, type ProgramLine } from '@betterbarmm/budget-data'
import { lguProvinces } from '@betterbarmm/lgu-data'
import { SCHOOL_TYPES, type MapSchool } from './school-types'

/* ============================================================
   Education in the Bangsamoro

   Two records, each kept as its publisher printed it:

     · the money: what each year's General Appropriations Act of the
       Bangsamoro gives the Ministry of Basic, Higher and Technical
       Education, program by program, from the Budget workspace;
     · the schools: every school on the Department of Education's list
       for the latest school year, with its learners each year, and the
       madaris and colleges OpenStreetMap and Wikipedia add, placed in the
       directory's towns (datasets/education/schools.json);
     · what the ministry says: MBHTE's published figures, as it and the
       Parliament stated them (datasets/education/mbhte-figures.json).
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
	/** DepEd's sector: Public, Private, or a state or local college's school. Null for a school DepEd does not list. */
	sector: 'Public' | 'Private' | 'State or local college' | null
	/** The district and the schools division DepEd files it under ("Talitay District", "Maguindanao II Schools Division"). */
	district: string | null
	division: string | null
	founded: number | null
	/** Learners in the latest school year DepEd publishes (see `enrolmentYears`). */
	pupils: number | null
	/** Learners in each school year DepEd's files cover, oldest first ("2023-24"). */
	enrolment: Record<string, number>
	/** From the 2019 masterlist: pupils in 2012–13 and 2015–16. */
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

type SchoolsFile = {
	source: { title: string; url: string; publisher: string; retrieved: string; licence: string }
	/** The 2019 masterlist, for where each school stands, its founding and its older pupil counts. */
	pins: { title: string; url: string; via: string; publisher: string; gives: string }
	years: string[]
	note: string
	notOnTheLatestList: { id: string; name: string; town: string }[]
	schools: School[]
}

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
export const pinsSource = schoolsFile.pins
/** On DepEd's 2019 list but not its latest: closed, merged, or renumbered past matching. */
export const goneSince2019 = schoolsFile.notOnTheLatestList

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
	pupils: s.pupils,
	exact: isExact(s),
	lat: s.lat!,
	lon: s.lon!,
	image: s.image ? { url: s.image.url, author: s.image.author, license: s.image.license, page: s.image.page } : null,
})
export const mapSchools = schools.filter((s) => s.lat != null && s.lon != null).map(toMapSchool)

/** The school years DepEd's files cover, oldest first, and the latest ("2025-26"), as "2025–26" for reading. */
export const enrolmentYears: string[] = schoolsFile.years
export const latestSY = enrolmentYears.at(-1)!.replace('-', '–')
export const syLabel = (y: string) => y.replace('-', '–')

/** Learners in the latest school year, every school DepEd lists, and the total. */
export const pupilsTotal = schools.reduce((n, s) => n + (s.pupils ?? 0), 0)

/** Learners in each school year, across the schools DepEd lists that year. */
export const enrolmentByYear = enrolmentYears.map((y) => ({ year: y, learners: schools.reduce((n, s) => n + (s.enrolment[y] ?? 0), 0) }))

/** A school's district and division as one line: "Talitay District, Maguindanao II Schools Division". */
export const districtLabel = (s: Pick<School, 'district' | 'division'>) => (s.district && s.division ? `${s.district}, ${s.division}` : (s.district ?? s.division))

/** The schools with the most pupils, largest first. */
export const largestSchools = [...schools].filter((s) => s.pupils).sort((a, b) => b.pupils! - a.pupils!)

/** Each town: its schools, its pupils, and pupils per school, the busiest first. */
export const townLoads = (() => {
	const towns = new Map<string, { area: string; town: string; townName: string; schools: number; pupils: number; counted: number }>()
	for (const s of schools) {
		const t = towns.get(s.town) ?? towns.set(s.town, { area: s.area, town: s.town, townName: s.townName, schools: 0, pupils: 0, counted: 0 }).get(s.town)!
		t.schools += 1
		if (s.pupils) {
			t.pupils += s.pupils
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
	const rank = largestSchools.findIndex((s) => s.pupils! <= pupils)
	const share = rank / largestSchools.length
	return share < 0.1 ? 'Among the largest tenth of schools in the region' : share < 0.5 ? 'Larger than most schools in the region' : 'Smaller than most schools in the region'
}

/* ---- Divisions and districts ------------------------------------------- */

export type District = { name: string; full: string; schools: number; pupils: number; towns: string[] }
export type Division = { name: string; area: string; schools: number; pupils: number; districts: District[] }

/** The schools divisions and districts DepEd files each school under, with each district's schools and learners. */
export const divisions: Division[] = (() => {
	const map = new Map<string, { name: string; area: string; districts: Map<string, { name: string; full: string; schools: number; pupils: number; towns: Set<string> }> }>()
	for (const s of schools) {
		if (!s.district || !s.division) continue
		const { district, division } = s as { district: string; division: string }
		const full = districtLabel(s)!
		const dv = map.get(division) ?? map.set(division, { name: division, area: s.area, districts: new Map() }).get(division)!
		const dt = dv.districts.get(district) ?? dv.districts.set(district, { name: district, full, schools: 0, pupils: 0, towns: new Set() }).get(district)!
		dt.schools += 1
		dt.pupils += s.pupils ?? 0
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

/* ---- How learners are doing --------------------------------------------
   The development plan's education results, each with its latest published
   figure, from the scorecard on betterbarmm.com
   (datasets/development-plan/scorecard.json). Nothing is recomputed here
   but whether the figure has reached the plan's target. */

type Sourced = { value: number; year: number; source: string; note?: string | null }
type Indicator = {
	id: string
	area: string
	name: string
	explain: string
	unit: string
	direction: 'up' | 'down'
	baseline: Sourced | null
	target: { low: number; high: number; year: number; text: string | null; source: string } | null
	latest: Sourced
	comparable: boolean
	note: string
}

export const PLAN_URL = 'https://betterbarmm.com/development-plan'

export type Outcome = Indicator & {
	/** 'met' or 'short' against the plan's target; 'none' where it published none. */
	status: 'met' | 'short' | 'none'
	/** A line on the figure: against the target where there is one, against the baseline where not. */
	verdict: string
}

const readJson = <T>(rel: string): T | null => {
	const roots = [process.cwd(), path.join(process.cwd(), '..'), path.join(process.cwd(), '../..')]
	const file = roots.map((r) => path.join(r, rel)).find((f) => fs.existsSync(f))
	return file ? (JSON.parse(fs.readFileSync(file, 'utf8')) as T) : null
}

/** "81.0%", or "160 barangays". */
export const outcomeValue = (i: Pick<Indicator, 'unit'>, v: number) => (i.unit === '%' ? `${v.toFixed(1)}%` : `${v.toLocaleString('en-PH')} ${i.unit.replace(/\s*\(.*\)$/, '')}`)

export const outcomes: Outcome[] = (readJson<{ indicators: Indicator[] }>('datasets/development-plan/scorecard.json')?.indicators ?? [])
	.filter((i) => i.area === 'Education')
	.map((i) => {
		const { latest, target, baseline } = i
		const reached = target ? (i.direction === 'up' ? latest.value >= target.low : latest.value <= target.high) : null
		const pts = (a: number, b: number) => (i.unit === '%' ? `${Math.abs(a - b).toFixed(1)} points` : Math.abs(a - b).toLocaleString('en-PH'))
		const verdict = target
			? reached
				? `Past the plan’s ${target.year} target of ${outcomeValue(i, target.low)}`
				: `${pts(target.low, latest.value)} short of the plan’s ${target.year} target of ${outcomeValue(i, target.low)}`
			: baseline
				? `${latest.value >= baseline.value ? 'Up' : 'Down'} from ${outcomeValue(i, baseline.value)} in ${baseline.year}; the plan published no target`
				: 'The plan published no target'
		return { ...i, status: target ? (reached ? 'met' : 'short') : 'none', verdict } as Outcome
	})

/* ---- In the news -------------------------------------------------------
   The headlines about schools, students and teachers from the site's news
   record (datasets/news/weeks), newest first, without the ones struck. */

export type Story = { url: string; title: string; source: string; published_at: string; image?: string | null }

const EDUCATION_WORDS =
	/\b(schools?|teachers?|teaching|students?|learners?|pupils?|MBHTE|education(al)?|scholars?(hips?)?|madaris|madrasah|literacy|classrooms?|universit(y|ies)|colleges?|TESDA|TVET|graduates?|graduation|enrol(l)?ment|campus)\b/i

export function educationNews(n = 6): Story[] {
	const index = readJson<{ dropped: { url: string }[]; weeks: string[] }>('datasets/news/index.json')
	if (!index) return []
	const struck = new Set(index.dropped.map((d) => d.url))
	const seen = new Set<string>()
	const out: Story[] = []
	for (const week of index.weeks) {
		const file = readJson<{ items: Story[] }>(`datasets/news/weeks/${week}.json`)
		for (const s of file?.items ?? []) {
			const key = s.title.toLowerCase().replace(/\W+/g, ' ').trim()
			if (struck.has(s.url) || seen.has(key) || !EDUCATION_WORDS.test(s.title)) continue
			seen.add(key)
			out.push(s)
		}
	}
	return out.sort((a, b) => b.published_at.localeCompare(a.published_at)).slice(0, n)
}

/* ---- Towns, for the Schools page's index ------------------------------- */

/** Each area's towns with their schools counted, in the directory's order of areas and by name within each. */
export function townIndex(list: School[]) {
	return schoolAreas
		.map((a) => {
			const towns = new Map<string, { town: string; townName: string; count: number }>()
			for (const s of list) {
				if (s.area !== a.slug) continue
				const t = towns.get(s.town) ?? towns.set(s.town, { town: s.town, townName: s.townName, count: 0 }).get(s.town)!
				t.count += 1
			}
			const sorted = [...towns.values()].sort((x, y) => x.townName.localeCompare(y.townName))
			return { slug: a.slug, name: a.name, total: sorted.reduce((n, t) => n + t.count, 0), towns: sorted }
		})
		.filter((a) => a.total)
}

/* ---- What the ministry says --------------------------------------------
   MBHTE publishes no dataset, so these are its figures as it and the
   Parliament have stated them, each with who said it and where
   (datasets/education/mbhte-figures.json). Kept as said, not reconciled
   with DepEd's counts, which cover less.
   ------------------------------------------------------------------------ */

export type MinistryFigure = {
	topic: string
	label: string
	value: number
	unit?: string
	of?: number
	scope?: string
	saidBy: string
	source: { outlet: string; title: string; date: string; url: string }
}

export const ministryFigures: MinistryFigure[] = readJson<{ figures: MinistryFigure[] }>('datasets/education/mbhte-figures.json')?.figures ?? []

/** A figure as it reads: "44.04%", "1,330 of 2,289", "1,258,253". */
export const ministryValue = (f: MinistryFigure) =>
	f.unit === '%' ? `${f.value}%` : `${f.value.toLocaleString('en-PH')}${f.of ? ` of ${f.of.toLocaleString('en-PH')}` : ''}`
