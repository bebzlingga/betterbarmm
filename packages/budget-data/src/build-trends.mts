/* ============================================================
   Build the year-on-year series, three ways

   Run: npx tsx packages/budget-data/src/build-trends.mts
   Out: datasets/budget/trends.json

   Supersedes `build-trend.mts`, which joined the old 8MB
   seven-year extract to the one Act this workspace then held.
   Every Act is extracted now, so the series are read off them
   directly: no code-to-slug join to get wrong, FY 2020 included
   rather than dropped, and every office covered instead of the
   thirty-one that file could match.

   Why a file at all, when the pages could derive this from the
   same import: a chart wants four hundred integers, not seven
   Acts. Deriving it server-side would be free, but nothing that
   runs in the browser could touch it, and the file is worth
   publishing in its own right — "what has this ministry been
   given since 2020" is a question the Act cannot answer and
   this can.

   Three groupings, and they do not mean the same thing:

     · offices — a real partition, and only if the attached
       agencies are in it. The Act prints a parent ministry's
       total EXCLUDING its attached agencies, so leaving those
       out loses ₱942m in FY 2026 alone. With every entity in,
       one year of office lines sums to that year's Act to the
       centavo — the check script asserts it.
     · sectors — overlapping by design. A program tagged both
       Health and Infrastructure is counted under each, so these
       must never be summed across sectors.
     · areas — infrastructure projects only, not whole budgets.
       It is where the Act says a road is being built, which is
       the only part of the budget that carries a place at all.
       These series are the shortest and the least continuous,
       because the region itself was redrawn inside the span:
       Maguindanao I and II become Del Norte and Del Sur in FY
       2024, Sulu I and II stop after FY 2022, and the Special
       Geographic Area is printed under two names. They are
       keyed by the name each Act prints, so a renamed province
       is two lines and not one — joining them would be a claim
       about the map rather than a reading of the Act.

   A missing year is a missing point, never a zero: an office
   the Act had not created yet was not given nothing, it did not
   exist. The check script asserts the shape this writes.
   ============================================================ */
import { writeFileSync } from 'node:fs'
import { FISCAL_YEARS, budgetFor, slugify } from './index.ts'

const OUT = 'datasets/budget/trends.json'

/** Oldest first: a series is read left to right. */
const YEARS = [...FISCAL_YEARS].sort((a, b) => a - b)

type Point = [year: number, total: number]
type Line = { slug: string; name: string; series: Point[] }

/** Collect one grouping across every year, keyed by slug. */
function lines(of: (fy: number) => { slug: string; name: string; total: number }[]): Line[] {
	const found = new Map<string, Line>()

	for (const fy of YEARS) {
		for (const row of of(fy)) {
			const line = found.get(row.slug) ?? { slug: row.slug, name: row.name, series: [] }
			line.series.push([fy, round(row.total)])
			// The latest year's spelling wins: names drift between Acts, and the
			// newest is the one the rest of the workspace prints.
			line.name = row.name
			found.set(row.slug, line)
		}
	}

	/* Everything is kept, including a line with one point. Dropping those made
	   the offices stop summing to their year — five funds exist in FY 2026 only
	   and carry ₱27 billion between them — and a file that quietly omits a
	   quarter of a budget is worse than a chart that has to skip a line. The
	   chart already declines to draw fewer than two points. */
	return [...found.values()].sort(
		(a, b) => (b.series.at(-1)?.[1] ?? 0) - (a.series.at(-1)?.[1] ?? 0),
	)
}

/** Centavos are in the Acts and are noise in a chart, but the totals keep them. */
const round = (amount: number) => Math.round(amount * 100) / 100

const offices = lines((fy) =>
	budgetFor(fy).offices.map((one) => ({
		slug: one.slug,
		name: one.name,
		total: one.totals.total,
	})),
)

const sectors = lines((fy) =>
	budgetFor(fy)
		.sectors.filter((one) => one.total > 0)
		.map((one) => ({ slug: one.slug, name: one.name, total: one.total })),
)

const areas = lines((fy) =>
	budgetFor(fy).projectsByProvince.map((one) => ({
		slug: slugify(one.province),
		name: one.province,
		total: one.total,
	})),
)

const region: Point[] = YEARS.map((fy) => [fy, round(budgetFor(fy).budget.total)])

/* Written only if it agrees with the Acts. A series that disagrees with the
   figure the page prints beside it is worse than no series: the chart is the
   part a reader believes without checking. */
for (const line of offices) {
	const [fy, total] = line.series.at(-1)!
	const office = budgetFor(fy).findOffice(line.slug)
	if (!office) throw new Error(`${line.slug}: no such office in FY ${fy}`)
	if (round(office.totals.total) !== total)
		throw new Error(`${line.slug}: FY ${fy} says ${office.totals.total}, series says ${total}`)
}

const latest = YEARS.at(-1)!
if (region.at(-1)![1] !== round(budgetFor(latest).budget.total))
	throw new Error('the region line does not end where the latest Act does')

writeFileSync(
	OUT,
	`${JSON.stringify(
		{
			meta: {
				generated_on: new Date().toISOString().slice(0, 10),
				years: YEARS,
				source: 'The seven enacted Acts, FY 2020 to FY 2026, as extracted for this workspace.',
				notes: [
					'A missing year is a missing point, never a zero: the office or sector did not exist in that Act.',
					'offices[] is a partition: one year of office lines sums to that year of the Act. Attached agencies are separate lines, because a parent ministry\'s printed total excludes them.',
					'A line may hold a single point, where the Act prints that office in one year only. It is kept so the partition holds; a chart should skip it rather than draw one column.',
					'sectors[] overlaps by design: a row tagged two sectors is counted under both, so these must never be summed across sectors.',
					'areas[] covers the itemised infrastructure projects only, not whole budgets.',
					'Area names are the ones each Act prints. The region was redrawn inside this span — Maguindanao I and II become Del Norte and Del Sur, Sulu stops appearing after FY 2022 — so a renamed area is two series rather than one continuous line.',
					'Amounts are as printed in each Act, to the centavo, with nothing reconciled between years.',
				],
			},
			region,
			offices,
			sectors,
			areas,
		},
		null,
		'\t',
	)}\n`,
)

console.log(
	`trends.json — ${YEARS.length} years, ${offices.length} offices, ${sectors.length} sectors, ${areas.length} areas`,
)
