/* ============================================================
   Build the year-on-year series

   Run: npx tsx packages/budget-data/src/build-trend.mts
   Out: datasets/budget/trend.json

   Why a build step and not a runtime import: the seven-year
   extract is 8MB, and this reduces it to the four hundred
   integers two charts actually draw. Importing the source to
   read them would put the whole file in the bundle.

   Why the acronym and not the name: offices are keyed by a code
   that is stable across Acts — BTA, OCM, MBHTE — while their
   printed names drift with punctuation ("Ministry of Finance and
   Budget and Management" in FY 2021, "Ministry of Finance, and
   Budget and Management" in FY 2026). The code is the join; the
   normalised name is only used once, to attach a code to the slug
   this workspace already uses for that office.

   What is checked before anything is written:
     - every office's FY 2026 figure must equal the one
       `budget-data` carries, which is checked against the Act line
       by line. A join that disagrees is a wrong join, so the
       script fails rather than emitting it.
     - FY 2020 is dropped. Its year-level `total_budget` reads
       65.91 — a failed PDF text layer — and while the per-office
       rows for that year are sound, only 20 of 35 offices have
       one. A region line that cannot start where the office lines
       start is worse than both starting at 2021.
   ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs'
import { offices } from './index.ts'

const SOURCE = 'datasets/budget/barmm_fy2020_2026.min.json'
const OUT = 'datasets/budget/trend.json'
const FROM = 2021

type Year = {
	total_budget?: number
	offices?: Record<string, { name?: string; total_appropriations?: number }>
	special_purpose_funds?: Record<string, { name?: string; total_appropriations?: number }>
}

const raw = JSON.parse(readFileSync(SOURCE, 'utf8')) as { years: Record<string, Year> }
const norm = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const years = Object.keys(raw.years)
	.map(Number)
	.filter((year) => year >= FROM)
	.sort()

/* ---- Every office the extract knows, by its stable code ---- */
const byCode = new Map<string, { names: Set<string>; totals: Map<number, number> }>()
for (const [key, year] of Object.entries(raw.years)) {
	const fy = Number(key)
	for (const group of [year.offices, year.special_purpose_funds]) {
		for (const [code, office] of Object.entries(group ?? {})) {
			const entry = byCode.get(code) ?? { names: new Set<string>(), totals: new Map<number, number>() }
			if (office.name) entry.names.add(norm(office.name))
			const total = office.total_appropriations
			// `> 1000` throws out the failed-extraction values: a real
			// appropriation for an office is never a two-figure number of pesos.
			if (typeof total === 'number' && total > 1000) entry.totals.set(fy, Math.round(total))
			byCode.set(code, entry)
		}
	}
}

/* ---- Attach each code to the slug this workspace uses ---- */
const out: Record<string, [number, number][]> = {}
const problems: string[] = []
let joined = 0

for (const office of offices) {
	const name = norm(office.name)
	const hit = [...byCode.values()].find((entry) => entry.names.has(name))
	if (!hit) continue

	const checked = hit.totals.get(2026)
	if (checked != null && Math.abs(checked - Math.round(office.totals.total)) > 1) {
		problems.push(
			`${office.slug}: extract says ${checked}, the Act says ${Math.round(office.totals.total)}`,
		)
		continue
	}

	const series = years
		.filter((year) => hit.totals.has(year))
		.map((year) => [year, hit.totals.get(year)!] as [number, number])

	// One point is not a trend. IMPACT, for instance, exists only in FY 2026.
	if (series.length >= 3) {
		out[office.slug] = series
		joined++
	}
}

/* ---- The region's own line ---- */
out.region = years
	.map((year) => [year, Math.round(raw.years[String(year)]?.total_budget ?? 0)] as [number, number])
	.filter(([, total]) => total > 1000)

if (problems.length) {
	console.error(`refusing to write ${OUT} — ${problems.length} figure(s) disagree with the Act:`)
	for (const problem of problems) console.error('  ', problem)
	process.exit(1)
}

writeFileSync(OUT, `${JSON.stringify(out, null, '\t')}\n`)
console.log(
	`${OUT} — region ${out.region.length} years, ${joined} of ${offices.length} offices with a series`,
)
