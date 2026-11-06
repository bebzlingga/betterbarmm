import file from '../../../../datasets/development-plan/scorecard.json'

/* ============================================================
   The development plan scorecard

   The 2nd Bangsamoro Development Plan 2023–2028's targets, each
   beside the latest figure published for it. Researched from the
   plan, its Midterm Update and the Bangsamoro Development Reports,
   with the latest figures from PSA and the ministries; every value
   carries its source. See datasets/development-plan/scorecard.json.
   ============================================================ */

type Sourced = { value: number; year: number; source: string; note?: string | null }
type Goal = { low: number; high: number; year: number }

export type Indicator = {
	id: string
	area: string
	name: string
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

export function formatGoal(goal: Goal, unit: string) {
	if (goal.low === goal.high) return formatValue(goal.low, unit)
	return unit === '%' ? `${num(goal.low)}–${num(goal.high)}%` : `${formatValue(goal.low, unit)} to ${formatValue(goal.high, unit)}`
}
