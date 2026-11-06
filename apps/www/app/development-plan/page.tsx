import type { Metadata } from 'next'
import { GetInvolved } from '../_components/get-involved'
import { SiteHeader } from '../_components/site-header'
import { AREAS, formatBare, formatGoalBare, formatValue, gapText, indicators, judge, plan, scorecardGaps, scorecardNote, STATUS_LABEL, type Indicator, type Status } from '../_lib/development-plan'
import { pageMeta } from '../_lib/seo'

export const metadata: Metadata = pageMeta({
	title: 'Development plan scorecard',
	description:
		'The targets of the 2nd Bangsamoro Development Plan 2023–2028 — poverty, jobs, the economy, schools, health, water, roads and peace — each beside the latest published figure and its source.',
	path: '/development-plan',
})

const PLAN_YEARS = [2023, 2024, 2025, 2026, 2027, 2028]

const TONE: Record<Status, string> = { met: 'badge-done', short: 'badge-move', 'no-target': 'badge-idle', 'not-compared': 'badge-idle' }

const linkClass = 'underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]'
/** A source as a short link: the document's own name where it is one of the plan's, else the site. */
const sourceName = (url: string) =>
	url.includes(plan.url.split('/view')[0])
		? 'the plan'
		: url.includes(plan.midterm_update.url.split('/view')[0])
			? 'the Midterm Update'
			: (plan.progress_reports.find((r) => url.includes(r.url.split('/view')[0]))?.title ?? new URL(url.split(' ')[0]).hostname.replace(/^www\./, ''))
const href = (url: string) => url.split(' ')[0]

/** The plan through time (user decision: bars were hard to read): years left to right, where it started, where it is now
    in the verdict's colour, and each target as a crimson mark at its year — a solid line for the way come, a dashed one
    for the way still to go. */
const POINT_TONE: Record<Status, string> = {
	met: 'var(--tone-done-fg)',
	short: 'var(--tone-move-fg)',
	'no-target': 'var(--ink-3)',
	'not-compared': 'var(--ink-3)',
}

function Timeline({ indicator, status, goals }: { indicator: Indicator; status: Status; goals: { low: number; high: number; year: number }[] }) {
	const { latest, baseline, unit } = indicator
	const W = 320
	const H = 132
	const [left, right, top, bottom] = [14, 58, 20, 24]
	const years = [baseline?.year, latest.year, ...goals.map((goal) => goal.year)].filter((y): y is number => y != null)
	const y0 = Math.min(...years)
	const y1 = Math.max(...years) === y0 ? y0 + 1 : Math.max(...years)
	const values = [latest.value, ...(baseline ? [baseline.value] : []), ...goals.flatMap((goal) => [goal.low, goal.high])]
	const lo = Math.min(...values)
	const hi = Math.max(...values)
	const pad = (hi - lo) * 0.3 || Math.abs(hi) * 0.25 || 1
	const d0 = lo >= 0 ? Math.max(0, lo - pad) : lo - pad
	const d1 = hi + pad
	const x = (year: number) => left + ((year - y0) / (y1 - y0)) * (W - left - right)
	const y = (value: number) => top + (1 - (value - d0) / (d1 - d0)) * (H - top - bottom)
	const end = goals.reduce<(typeof goals)[number] | null>((last, goal) => (!last || goal.year >= last.year ? goal : last), null)
	const tone = POINT_TONE[status]
	const shared = goals.some((goal) => goal.year === latest.year)
	const label = { fontSize: 10.5, fontFamily: 'var(--font-display)' }

	return (
		<svg viewBox={`0 0 ${W} ${H}`} className='mt-3 block h-auto w-full overflow-visible' role='img' aria-label={`${indicator.name}: ${formatValue(latest.value, unit)} in ${latest.year}`}>
			<line x1={left} x2={W - right} y1={H - bottom} y2={H - bottom} stroke='var(--rule)' />
			{[...new Set(years)].map((year) => (
				<text key={year} x={x(year)} y={H - 7} textAnchor='middle' fill='var(--ink-3)' style={label}>
					{year}
				</text>
			))}

			{goals.map((goal) => (
				<g key={goal.year}>
					<rect
						x={x(goal.year) - 6}
						y={y(goal.high) - (goal.high === goal.low ? 1.5 : 0)}
						width={12}
						height={Math.max(3, y(goal.low) - y(goal.high))}
						fill='color-mix(in oklab, var(--accent) 22%, transparent)'
						stroke='var(--accent)'
						strokeWidth={1.2}
					/>
					<text x={x(goal.year) + 10} y={y((goal.low + goal.high) / 2) + 3.5} fill='var(--accent)' style={{ ...label, fontWeight: 700 }}>
						{formatGoalBare(goal, unit)}
					</text>
				</g>
			))}

			{baseline ? <line x1={x(baseline.year)} y1={y(baseline.value)} x2={x(latest.year)} y2={y(latest.value)} stroke='var(--ink-3)' strokeWidth={1.5} /> : null}
			{end && status === 'short' ? (
				<line x1={x(latest.year)} y1={y(latest.value)} x2={x(end.year) - 6} y2={y((end.low + end.high) / 2)} stroke='var(--accent)' strokeWidth={1.5} strokeDasharray='3 3' />
			) : null}

			{baseline ? (
				<g>
					<circle cx={x(baseline.year)} cy={y(baseline.value)} r={3.5} fill='var(--paper)' stroke='var(--ink-3)' strokeWidth={1.5} />
					<text x={x(baseline.year)} y={y(baseline.value) + 15} textAnchor='middle' fill='var(--ink-3)' style={label}>
						{formatBare(baseline.value, unit)}
					</text>
				</g>
			) : null}
			<circle cx={x(latest.year)} cy={y(latest.value)} r={5} fill={tone} stroke='var(--paper)' strokeWidth={2} />
			{/* Beside the point, not above it, where a target stands in the same year and its band would take the label. */}
			<text
				x={shared ? x(latest.year) - 8 : x(latest.year)}
				y={y(latest.value) - (shared ? 8 : 10)}
				textAnchor={shared ? 'end' : 'middle'}
				fill={tone}
				style={{ ...label, fontWeight: 800 }}
			>
				{formatBare(latest.value, unit)}
			</text>
		</svg>
	)
}

function Card({ indicator }: { indicator: Indicator }) {
	const { status, against } = judge(indicator)
	const { latest, baseline, target, unit } = indicator
	const endDiffers = target && against && (against.year !== target.year || against.low !== target.low || against.high !== target.high)
	const gap = gapText(indicator, status, against)
	return (
		<article className='flex flex-col border border-[var(--rule)] bg-[var(--paper)] p-5'>
			<div className='flex items-start justify-between gap-3'>
				<h3 className='text-[0.9375rem] font-semibold leading-snug text-[var(--ink)]'>{indicator.name}</h3>
				<span className={`badge ${TONE[status]} shrink-0`}>{STATUS_LABEL[status]}</span>
			</div>

			<p className='mt-4 flex items-baseline gap-2'>
				<span className='font-[family-name:var(--font-display)] text-[1.875rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'>
					{formatValue(latest.value, unit)}
				</span>
				<span className='text-[0.8125rem] text-[var(--ink-3)]'>in {latest.year}</span>
			</p>

			{gap ? <p className={`mt-3 text-[0.8125rem] font-semibold leading-snug ${status === 'met' ? 'text-[var(--tone-done-fg)]' : status === 'short' ? 'text-[var(--tone-move-fg)]' : 'text-[var(--ink-3)]'}`}>{gap}</p> : null}
			<Timeline indicator={indicator} status={status} goals={[...(against ? [against] : []), ...(target && (endDiffers || !against) ? [target] : [])]} />
			<p className='mt-1 text-right text-[0.75rem] text-[var(--ink-3)]'>{indicator.direction === 'up' ? 'Higher is better' : 'Lower is better'}</p>

			{/* Shown, not folded (user decision): a reader holding the plan's own report sees a different number. */}
			{latest.elsewhere ? (
				<p className='mt-4 border-l-2 border-[var(--brass)] pl-3 text-[0.75rem] leading-[1.55] text-[var(--ink-3)]'>{latest.elsewhere}</p>
			) : null}

			<details className='group mt-auto pt-4'>
				<summary className='cursor-pointer list-none text-[0.75rem] font-semibold text-[var(--ink-3)] hover:text-[var(--accent)]'>
					<span className='group-open:hidden'>About this figure and its sources</span>
					<span className='hidden group-open:inline'>Hide</span>
				</summary>
				<div className='mt-3 space-y-2 text-[0.78125rem] leading-[1.6] text-[var(--ink-3)]'>
					{indicator.note ? <p>{indicator.note}</p> : null}
					{latest.note ? <p>{latest.note}</p> : null}
					<p>
						Latest:{' '}
						<a href={href(latest.source)} target='_blank' rel='noreferrer' className={linkClass}>
							{sourceName(latest.source)}
						</a>
						{target ? (
							<>
								{' '}· Target:{' '}
								<a href={href(target.source)} target='_blank' rel='noreferrer' className={linkClass}>
									{sourceName(target.source)}
								</a>
							</>
						) : null}
						{baseline ? (
							<>
								{' '}· Start:{' '}
								<a href={href(baseline.source)} target='_blank' rel='noreferrer' className={linkClass}>
									{sourceName(baseline.source)}
								</a>
							</>
						) : null}
					</p>
				</div>
			</details>
		</article>
	)
}

/* The development plan scorecard (user decision: the plan's targets beside the latest figures, so it can be checked).
   A card a target: the latest figure large, the target it is judged against, where it started, and the sources. */
export default function DevelopmentPlanPage() {
	const judged = indicators.map((indicator) => judge(indicator).status)
	const count = (status: Status) => judged.filter((s) => s === status).length
	const parts = [
		{ label: 'Target met', n: count('met'), tone: 'bg-[#a8e0b8]' },
		{ label: 'Short of target', n: count('short'), tone: 'bg-[var(--brass)]' },
		{ label: 'No target to judge', n: count('no-target') + count('not-compared'), tone: 'bg-white/30' },
	]
	const latestYear = Math.max(...indicators.map((indicator) => indicator.latest.year))
	const thisYear = new Date().getFullYear()
	const planYear = thisYear - 2022

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader />

			<section className='brand-bg bb-lattice relative overflow-hidden'>
				{/* Two columns (user decision: the right half stood empty and the counts read as a table): the claim on the
				    left, and on the right the whole scorecard as one divided bar, with where the plan is in its six years. */}
				<div className='bb-container relative grid w-full gap-10 py-14 md:py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center lg:gap-16'>
					<div>
						<p className='bb-label'>Development plan scorecard</p>
						<h1 className='mt-3 text-[clamp(2.1rem,4.4vw,3.4rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-[var(--ink)]'>
							The plan’s targets, and where the region stands.
						</h1>
						<p className='mt-5 max-w-[40rem] text-[0.96875rem] leading-[1.7] text-[var(--ink-2)]'>
							The{' '}
							<a href={plan.url} target='_blank' rel='noreferrer' className={linkClass}>
								2nd Bangsamoro Development Plan 2023–2028
							</a>{' '}
							sets targets for poverty, jobs, the economy, schools, health, water, roads and peace. Each is set here beside the
							latest figure published for it, with both sources a click away.
						</p>
					</div>

					<div className='border border-[var(--rule)] bg-[var(--paper-2)] p-6 md:p-7'>
						<p className='flex items-baseline justify-between gap-4'>
							<span className='font-[family-name:var(--font-display)] text-[2.75rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'>
								{indicators.length}
							</span>
							<span className='text-right text-[0.8125rem] text-[var(--ink-3)]'>targets tracked, latest figures to {latestYear}</span>
						</p>
						<div className='mt-5 flex h-3 gap-[2px] overflow-hidden rounded-[2px]' aria-hidden='true'>
							{parts.map((part) => (
								<span key={part.label} className={part.tone} style={{ flexGrow: part.n }} />
							))}
						</div>
						<dl className='mt-4 grid grid-cols-3 gap-3'>
							{parts.map((part) => (
								<div key={part.label}>
									<dd className='font-[family-name:var(--font-display)] text-[1.5rem] font-extrabold leading-none text-[var(--ink)]'>{part.n}</dd>
									<dt className='mt-1.5 flex items-center gap-1.5 text-[0.75rem] text-[var(--ink-3)]'>
										<span className={`size-2 shrink-0 rounded-full ${part.tone}`} />
										{part.label}
									</dt>
								</div>
							))}
						</dl>

						<div className='mt-6 border-t border-[var(--rule)] pt-5'>
							<p className='flex items-baseline justify-between text-[0.75rem] text-[var(--ink-3)]'>
								<span>The plan’s six years</span>
								<span>{planYear <= 6 ? `Year ${planYear} of 6` : 'Ended 2028'}</span>
							</p>
							<div className='mt-2 grid grid-cols-6 gap-[3px]' aria-hidden='true'>
								{PLAN_YEARS.map((year) => (
									<span key={year} className='flex flex-col gap-1'>
										<span className={`h-1.5 rounded-[1px] ${year < thisYear ? 'bg-[var(--brass)]' : year === thisYear ? 'bg-[color-mix(in_oklab,var(--brass)_55%,transparent)]' : 'bg-white/15'}`} />
										<span className={`text-[0.625rem] tabular-nums ${year === thisYear ? 'font-semibold text-[var(--ink)]' : 'text-[var(--ink-mute)]'}`}>{year}</span>
									</span>
								))}
							</div>
						</div>
					</div>
				</div>
				<div className='bb-weave' aria-hidden='true' />
			</section>

			<section className='bb-container bb-section'>
				{AREAS.map((area) => {
					const here = indicators.filter((indicator) => indicator.area === area)
					if (!here.length) return null
					return (
						<div key={area} className='mb-14 last:mb-0'>
							<h2 className='border-b border-[var(--ink)] pb-3 text-[1.5rem] font-extrabold tracking-[-0.03em] text-[var(--ink)]'>{area}</h2>
							<div className='mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
								{here.map((indicator) => (
									<Card key={indicator.id} indicator={indicator} />
								))}
							</div>
						</div>
					)
				})}

				{/* One column, full width (user decision); the documents as a grid of cards. */}
				<div className='mt-16 border-t border-[var(--rule)] pt-6 text-[0.8125rem] leading-[1.7] text-[var(--ink-3)]'>
					<p className='font-semibold text-[var(--ink-2)]'>How this is judged</p>
					<p className='mt-1'>
						{scorecardNote} A figure is judged against the target for its own year where the plan set one, and against the end target
						otherwise; “met” means it has reached the target, not that it will stay there. Figures are as published, with their own
						definitions: several changed during the plan, and Sulu left the region in 2024, so a later figure may cover fewer
						provinces than the start.
					</p>

					<p className='mt-10 font-semibold text-[var(--ink-2)]'>The documents</p>
					<ul className='mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
						{[
							{ kind: 'The plan', title: plan.title, url: plan.url },
							{ kind: 'Midterm update', title: plan.midterm_update.title, url: plan.midterm_update.url },
							...plan.progress_reports.map((report) => ({ kind: 'Progress report', title: report.title, url: report.url })),
						].map((doc) => (
							<li key={doc.url}>
								<a href={doc.url} target='_blank' rel='noreferrer' className='group flex h-full flex-col border border-[var(--rule)] p-4 transition hover:border-[var(--accent)]'>
									<span className='font-[family-name:var(--font-display)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>{doc.kind}</span>
									<span className='mt-2 flex-1 text-[0.875rem] font-semibold leading-snug text-[var(--ink)] group-hover:text-[var(--accent)]'>{doc.title}</span>
									<span className='mt-3 text-[0.75rem] font-semibold text-[var(--ink-3)] group-hover:text-[var(--accent)]'>Open ↗</span>
								</a>
							</li>
						))}
					</ul>
					<p className='mt-3'>
						All listed on BPDA’s{' '}
						<a href={plan.listing_url} target='_blank' rel='noreferrer' className={linkClass}>
							Knowledge Portal
						</a>
						.
					</p>

					{/* Always open (user decision). */}
					<p className='mt-10 font-semibold text-[var(--ink-2)]'>What is missing</p>
					<ul className='mt-2 list-disc space-y-1 pl-5'>
						{scorecardGaps.map((gap) => (
							<li key={gap.slice(0, 40)}>{gap}</li>
						))}
					</ul>
				</div>
			</section>
			<GetInvolved />
		</main>
	)
}
