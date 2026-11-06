import file from '../../../../datasets/development-plan/scorecard.json'

/* ============================================================
   The development plan scorecard

   The 2nd Bangsamoro Development Plan 2023–2028's targets, each
   beside the latest figure published for it. Researched from the
   plan, its Midterm Update and the Bangsamoro Development Reports,
   with the latest figures from PSA and the ministries; every value
   carries its source. See datasets/development-plan/scorecard.json.
   ============================================================ */

type Sourced = { value: number; year: number; source: string; note?: string | null; /** Where another of the plan's own documents prints a different figure for the same year. */ elsewhere?: string }
type Goal = { low: number; high: number; year: number }

export type Indicator = {
	id: string
	area: string
	name: string
	/** What it measures, in a sentence a resident needs no glossary for. */
	explain: string
	unit: string
	direction: 'up' | 'down'
	baseline: Sourced | null
	target: (Goal & { text: string | null; source: string }) | null
	/** The plan's annual targets on the way, where it published them. */
	interim: Goal[]
	latest: Sourced
	/** False where the target and the latest figure measure different things. */
	comparable: boolean
	note: string
}

type Plan = { title: string; url: string; listing_url: string; midterm_update: { title: string; url: string }; progress_reports: { title: string; url: string }[] }

const data = file as unknown as { note: string; plan: Plan; indicators: Indicator[]; gaps: string[] }

export const plan = data.plan
export const scorecardNote = data.note
export const scorecardGaps = data.gaps
export const indicators = data.indicators

/** The areas in the order a resident reads them: money in the house first, then the economy around it. */
export const AREAS = ['Poverty and income', 'Jobs', 'Economy', 'Education', 'Health', 'Water, sanitation and electricity', 'Roads', 'Peace and security', 'Governance'] as const

export type Status = 'met' | 'short' | 'no-target' | 'not-compared'

/** Judged against the target for the latest figure's own year where the plan set one, else its end target. */
export function judge(indicator: Indicator): { status: Status; against: Goal | null } {
	if (!indicator.target) return { status: 'no-target', against: null }
	if (!indicator.comparable) return { status: 'not-compared', against: null }
	const against = indicator.interim.find((goal) => goal.year === indicator.latest.year) ?? indicator.target
	const met = indicator.direction === 'up' ? indicator.latest.value >= against.low : indicator.latest.value <= against.high
	return { status: met ? 'met' : 'short', against }
}

export const STATUS_LABEL: Record<Status, string> = {
	met: 'Target met',
	short: 'Short of target',
	'no-target': 'No target published',
	'not-compared': 'Not comparable',
}

const num = (value: number) => value.toLocaleString('en-PH', { maximumFractionDigits: value < 10 ? 2 : 1 })

/** A figure in its unit, as a reader would say it: 12.8%, ₱5.0 billion, 386 km, 5.1 per 1,000. */
export function formatValue(value: number, unit: string) {
	if (unit === '%') return `${num(value)}%`
	if (unit === 'PHP') return `₱${(value / 1e9).toLocaleString('en-PH', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} billion`
	if (unit === 'km') return `${Math.round(value).toLocaleString('en-PH')} km`
	if (unit.startsWith('per ')) return `${num(value)} ${unit.replace(' live births', '')}`
	return `${num(value)} ${unit.replace(/\s*\(.*\)/, '').replace(' per year', '')}`
}

/** The figure without its unit where the unit is words (per 1,000, barangays): for a row whose card already names it. */
export const formatBare = (value: number, unit: string) => (unit === '%' || unit === 'PHP' || unit === 'km' ? formatValue(value, unit) : num(value))

export function formatGoalBare(goal: Goal, unit: string) {
	if (unit === '%' || unit === 'PHP' || unit === 'km') return formatGoal(goal, unit)
	return goal.low === goal.high ? num(goal.low) : `${num(goal.low)}–${num(goal.high)}`
}

export function formatGoal(goal: Goal, unit: string) {
	if (goal.low === goal.high) return formatValue(goal.low, unit)
	return unit === '%' ? `${num(goal.low)}–${num(goal.high)}%` : `${formatValue(goal.low, unit)} to ${formatValue(goal.high, unit)}`
}

/** The verdict as a sentence a reader does not have to work out: how far from the target, and which way. */
export function gapText(indicator: Indicator, status: Status, against: Goal | null): string | null {
	if (!against) return null
	const { value } = indicator.latest
	const up = indicator.direction === 'up'
	const goal = `the ${against.year} target of ${formatGoal(against, indicator.unit)}`
	const by = (d: number) => {
		// One decimal reads as a gap; two only where one would round a real gap (0.04) to nothing.
		const r = d < 0.1 ? Math.round(d * 100) / 100 : Math.round(d * 10) / 10
		return indicator.unit === '%' ? `${num(r)} ${r === 1 ? 'point' : 'points'}` : formatValue(r, indicator.unit)
	}
	if (against.low !== against.high && value >= against.low && value <= against.high) return `Within ${goal}`
	if (status === 'met') {
		const d = up ? value - against.low : against.high - value
		return d === 0 ? `On ${goal}` : `${by(d)} better than ${goal}`
	}
	return `${by(up ? against.low - value : value - against.high)} ${up ? 'below' : 'above'} ${goal}`
}

/** The plan begins in 2023; its baselines are the years just before. Progress is set against the years since. */
export const PLAN_START = 2023

export type Progress = {
	/** The furthest target the plan published: 2028 where it printed one, else its last annual target. */
	end: Goal
	/** How far from the start toward that target: 0 at the start, 1 on it; below 0 means further away than at the start. */
	share: number
	/** How much of the time to that target had passed by the latest figure's year. */
	elapsed: number
	/** The start already met the target, so the task was to stay there: share is then 1 (still there) or -1 (slipped). */
	hold: boolean
}

/** The way come from the start toward the furthest target, beside the time gone. Null where there is no start, no target,
    or the two measure different things. */
export function progress(indicator: Indicator): Progress | null {
	const end = indicator.target
	if (!end || !indicator.baseline || !indicator.comparable) return null
	const up = indicator.direction === 'up'
	const aim = up ? end.low : end.high
	const start = indicator.baseline.value
	const meets = (v: number) => (up ? v >= aim : v <= aim)
	const hold = meets(start)
	return {
		end,
		hold,
		share: hold ? (meets(indicator.latest.value) ? 1 : -1) : (indicator.latest.value - start) / (aim - start),
		elapsed: Math.min(1, Math.max(0, (indicator.latest.year - (PLAN_START - 1)) / (end.year - (PLAN_START - 1)))),
	}
}

