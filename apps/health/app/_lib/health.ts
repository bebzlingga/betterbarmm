import fs from 'node:fs'
import path from 'node:path'
import { budgetFor, FISCAL_YEARS, LATEST_YEAR, type ProgramLine } from '@betterbarmm/budget-data'
import { lguProvinces } from '@betterbarmm/lgu-data'
import { buyers, type Buyer } from './bids'

/* ============================================================
   Health in the Bangsamoro

   Three records, each kept as its publisher printed it:

     · the money: what each year's General Appropriations Act of the
       Bangsamoro gives the Ministry of Health, program by program and
       hospital by hospital, from the Budget workspace;
     · the facilities: the Department of Health's count of facilities
       of each type in each town, January 2021, and the hospitals
       OpenStreetMap has mapped (datasets/health/facilities.json);
     · who buys: the ministry, its hospitals and its health offices on
       PhilGEPS, from the Procurement workspace.
   ============================================================ */

export const OFFICE = 'ministry-of-health'
export const BUDGET_URL = `https://budget.betterbarmm.com/offices/${OFFICE}`

/** Oldest year first, as a chart reads. */
export const years = [...FISCAL_YEARS].reverse()

export const spending = years.map((year) => {
	const office = budgetFor(year).findOffice(OFFICE)!
	return { year, total: office.totals.total, share: office.share }
})

export const latestYear = LATEST_YEAR
export const latest = budgetFor(LATEST_YEAR).findOffice(OFFICE)!

const operations = (year: number) => budgetFor(year).findOffice(OFFICE)!.programs.find((p) => /^Operations/i.test(p.name))?.children ?? []

/** What the ministry does with the money: the programs under Operations, largest first. */
export const programs: ProgramLine[] = [...operations(LATEST_YEAR)].sort((a, b) => b.total - a.total)

/** Every line whose name matches, each year, at whatever depth the Act prints it. A match is not looked inside. */
export function lineSeries(name: RegExp): number[] {
	const sum = (lines: ProgramLine[]): number => lines.reduce((s, l) => s + (name.test(l.name) ? l.total : sum(l.children ?? [])), 0)
	return years.map((year) => sum(operations(year)))
}

/* ---- The hospitals in the budget ---------------------------------------
   The Act names each hospital the ministry runs, with its own amount. Names
   are matched across years once punctuation, titles and initials are set
   aside; two hospitals renamed on being upgraded are joined by hand. */

const hospitalKey = (name: string) =>
	name
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z ]/g, ' ')
		.replace(/\b(dr|al|haj|hadji|jr|sr|t|b)\b/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()

const RENAMED: Record<string, string> = {
	'tamparan district hospital': 'tamparan provincial hospital',
	'unayan municipal hospital': 'unayan district hospital',
}

export type BudgetHospital = { key: string; name: string; series: (number | null)[]; latest: number | null; buyer: Buyer | null }

const IS_HOSPITAL = /hospital|medical cent(er|re)|sanitarium|infirmary/i

export const healthBuyers = buyers(/MINISTRY OF HEALTH|HOSPITAL|HEALTH OFFICE|SANITARIUM/i)

export const budgetHospitals: BudgetHospital[] = (() => {
	const found = new Map<string, { name: string; byYear: Record<number, number> }>()
	const walk = (lines: ProgramLine[], year: number) => {
		for (const l of lines) {
			if (IS_HOSPITAL.test(l.name)) {
				let key = hospitalKey(l.name)
				key = RENAMED[key] ?? key
				const h = found.get(key) ?? found.set(key, { name: l.name, byYear: {} }).get(key)!
				h.byYear[year] = (h.byYear[year] ?? 0) + l.total
				if (year >= Math.max(...Object.keys(h.byYear).map(Number))) h.name = l.name
			} else walk(l.children ?? [], year)
		}
	}
	for (const year of years) walk(operations(year), year)
	const buyerFor = (key: string) => healthBuyers.find((b) => hospitalKey(b.name.replace(/\s+-\s+.*$/, '')) === key) ?? null
	return [...found.entries()]
		.map(([key, h]) => ({
			key,
			name: h.name,
			series: years.map((y) => h.byYear[y] ?? null),
			latest: h.byYear[LATEST_YEAR] ?? null,
			buyer: buyerFor(key),
		}))
		.sort((a, b) => (b.latest ?? -1) - (a.latest ?? -1))
})()

/* ---- The facilities ---------------------------------------------------- */

type Counts = Record<string, number>
export type TownCounts = { area: string; town: string; townName: string; government: Counts; private: Counts }
export type MappedHospital = { osm: string; name: string; operator: string | null; area: string | null; town: string | null; townName: string | null; lat: number; lon: number }

type FacilitiesFile = {
	types: string[]
	counts: { source: { title: string; publisher: string; asOf: string; url: string; via: string }; towns: TownCounts[] }
	hospitals: { source: { title: string; publisher: string; license: string; url: string }; note: string; list: MappedHospital[] }
}

function readFacilities(): FacilitiesFile {
	const roots = [process.cwd(), path.join(process.cwd(), '..'), path.join(process.cwd(), '../..')]
	const file = roots.map((r) => path.join(r, 'datasets/health/facilities.json')).find((f) => fs.existsSync(f))
	if (!file) throw new Error('datasets/health/facilities.json not found')
	return JSON.parse(fs.readFileSync(file, 'utf8')) as FacilitiesFile
}

const facilities = readFacilities()
export const countsSource = facilities.counts.source
export const townCounts = facilities.counts.towns
export const mappedHospitals = facilities.hospitals.list
export const mapSource = facilities.hospitals.source

/** The DOH's types, gathered into the columns a reader looks for. */
export const KINDS: { label: string; types: string[] }[] = [
	{ label: 'Barangay health stations', types: ['Barangay Health Station'] },
	{ label: 'Rural and city health units', types: ['Rural Health Unit', 'Municipal Health Office', 'City Health Office', 'Provincial Health Office'] },
	{ label: 'Birthing homes', types: ['Birthing Home'] },
	{ label: 'Hospitals', types: ['Hospital'] },
	{ label: 'Infirmaries', types: ['Infirmary'] },
]
const listed = new Set(KINDS.flatMap((k) => k.types))
export const OTHER = 'Other'

/** A town's (or an area's) facilities of one kind, government and private apart. */
export function kindCount(rows: TownCounts[], kind: string): { government: number; private: number } {
	const types = kind === OTHER ? null : KINDS.find((k) => k.label === kind)!.types
	const pick = (c: Counts) => Object.entries(c).reduce((s, [t, n]) => s + ((types ? types.includes(t) : !listed.has(t)) ? n : 0), 0)
	return { government: rows.reduce((s, r) => s + pick(r.government), 0), private: rows.reduce((s, r) => s + pick(r.private), 0) }
}

export const KIND_LABELS = [...KINDS.map((k) => k.label), OTHER]

export const facilityAreas = lguProvinces.map((p) => {
	const rows = townCounts.filter((t) => t.area === p.slug)
	return { slug: p.slug, name: p.name, rows, towns: p.municipalities.length }
})

export const facilityTotal = (() => {
	const sum = (k: 'government' | 'private') => townCounts.reduce((s, t) => s + Object.values(t[k]).reduce((a, b) => a + b, 0), 0)
	return { government: sum('government'), private: sum('private') }
})()
