import scorecard from '../../../../datasets/development-plan/scorecard.json'

/* ============================================================
   Health against the plan

   The 2nd Bangsamoro Development Plan's health targets, and the
   water and sanitation ones beside them, each next to the latest
   figure published for it (datasets/development-plan/scorecard.json,
   the same record as betterbarmm.com/plan). Nothing is computed but
   the reading: whether the latest figure is already past the target
   or still short of it.
   ============================================================ */

type Point = { value: number; year: number; source?: string; note?: string | null }
type Target = { low: number; high: number; text: string | null; year: number; source?: string }
type Indicator = { id: string; area: string; name: string; explain?: string; unit: string; direction: 'up' | 'down'; baseline: Point | null; target: Target | null; latest: Point | null }

const AREAS = new Set(['Health', 'Water, sanitation and electricity'])
const SKIP = new Set(['household-electrification'])

export type Reading = 'past' | 'short' | 'none'

export const indicators = (scorecard.indicators as unknown as Indicator[])
	.filter((i) => AREAS.has(i.area) && !SKIP.has(i.id))
	.map((i) => {
		const t = i.target
		const v = i.latest?.value
		const reading: Reading = !t || v == null ? 'none' : i.direction === 'up' ? (v >= t.low ? 'past' : 'short') : v <= t.high ? 'past' : 'short'
		return { ...i, explain: i.explain ?? null, reading }
	})

export type PlanIndicator = (typeof indicators)[number]

export const plan = scorecard.plan as { title: string; url: string; midterm_update: { title: string; url: string } }

/** "41.06" with its unit, as a reader says it. */
export function fmt(i: Pick<Indicator, 'unit'>, v: number) {
	const n = v.toLocaleString('en-PH', { maximumFractionDigits: 2 })
	return i.unit === '%' ? `${n}%` : n
}

/** The unit after the figure, where it is not a percentage. */
export const per = (i: Pick<Indicator, 'unit'>) => (i.unit === '%' ? '' : i.unit)

/** The first link in a source line. */
export const linkOf = (s?: string) => s?.match(/https?:\/\/\S+/)?.[0]?.replace(/[),.]+$/, '') ?? null
