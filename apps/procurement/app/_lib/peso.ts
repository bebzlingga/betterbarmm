import fs from 'node:fs'
import path from 'node:path'
import { entities, entityTotals, type Entity } from './philgeps'

/* ============================================================
   Follow the peso

   What each regional office was given in the Bangsamoro budget, set
   beside what it put out to bid and what PhilGEPS records it awarded.

   The budget side is maintenance and other operating expenses plus
   capital outlay: the money an office buys things with. Personnel
   services, salaries, are not procured, so they are left out.

   Offices are matched by name. PhilGEPS files a ministry's district and
   provincial offices separately ("Ministry of Public Works - BARMM Sulu
   1st DEO"); each counts toward its ministry.
   ============================================================ */

type Totals = { personnel_services: number; mooe: number; capital_outlays: number; total: number }
type Agency = { name: string; totals: Totals }

const STOP = new Set(['OF', 'THE', 'AND', 'IN', 'FOR', 'A'])

/** A name reduced to its words: no punctuation, no small words, no plurals. */
function norm(name: string) {
	return name
		.toUpperCase()
		.replace(/BANGSMORO/g, 'BANGSAMORO') // PhilGEPS's spelling of the Transition Authority
		.replace(/['’]/g, '')
		.replace(/[^A-Z0-9 ]/g, ' ')
		.split(/\s+/)
		.filter((w) => w && !STOP.has(w))
		.map((w) => (w.length > 3 && w.endsWith('S') && !w.endsWith('SS') ? w.slice(0, -1) : w))
		.join(' ')
}

/** Offices the budget lists under two names over the years, as one. */
const SAME_OFFICE: Record<string, string> = {
	[norm('Ministry of Social Services')]: norm('Ministry of Social Services and Development'),
	[norm('Office of the Wali')]: norm('Office of the Wali of Bangsamoro'),
}

function budgetFiles() {
	const roots = [process.cwd(), path.join(process.cwd(), '..'), path.join(process.cwd(), '../..')]
	const dir = roots.map((r) => path.join(r, 'datasets/budget')).find((d) => fs.existsSync(d))
	if (!dir) throw new Error('datasets/budget not found')
	return fs
		.readdirSync(dir)
		.filter((f) => /^BAA\d+_FY\d{4}_budget\.json$/.test(f))
		.map((f) => ({ year: Number(f.match(/FY(\d{4})/)![1]), file: path.join(dir, f) }))
		.sort((a, b) => a.year - b.year)
}

export type PesoRow = {
	key: string
	name: string
	/** Year → what the office can buy with (MOOE + capital outlay). */
	budget: Record<number, number>
	/** Year → approved budget of the notices its offices posted. */
	bid: Record<number, number>
	/** Year → contracts PhilGEPS records as awarded on those notices. */
	awarded: Record<number, number>
	offices: Pick<Entity, 'slug' | 'name'>[]
}

export const pesoYears = budgetFiles().map((f) => f.year)

export const pesoRows: PesoRow[] = (() => {
	const rows = new Map<string, PesoRow>()
	for (const { year, file } of budgetFiles()) {
		const { agencies } = JSON.parse(fs.readFileSync(file, 'utf8')) as { agencies: Agency[] }
		for (const a of agencies) {
			const key = SAME_OFFICE[norm(a.name)] ?? norm(a.name)
			const row = rows.get(key) ?? { key, name: a.name, budget: {}, bid: {}, awarded: {}, offices: [] }
			row.name = a.name // the newest year's spelling
			row.budget[year] = (row.budget[year] ?? 0) + a.totals.mooe + a.totals.capital_outlays
			rows.set(key, row)
		}
	}

	// Each PhilGEPS office to the longest budget name its own name starts with.
	const keys = [...rows.keys()]
	for (const e of entities) {
		const n = norm(e.name)
		const key = keys.filter((k) => n === k || n.startsWith(`${k} `)).sort((a, b) => b.length - a.length)[0]
		if (!key) continue
		const row = rows.get(key)!
		row.offices.push({ slug: e.slug, name: e.name })
		for (const [y, t] of Object.entries(entityTotals[e.index]!.byYear)) {
			row.bid[+y] = (row.bid[+y] ?? 0) + t.abc
			row.awarded[+y] = (row.awarded[+y] ?? 0) + t.contracts
		}
	}

	// Each ministry's offices largest first, so its link goes to the main one.
	const bidOf = (slug: string) => entityTotals[entities.find((e) => e.slug === slug)!.index]!.all.abc
	for (const r of rows.values()) r.offices.sort((a, b) => bidOf(b.slug) - bidOf(a.slug))

	return [...rows.values()]
		.filter((r) => r.offices.length)
		.sort((a, b) => Object.values(b.budget).reduce((s, v) => s + v, 0) - Object.values(a.budget).reduce((s, v) => s + v, 0))
})()
