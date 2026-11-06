import type { Metadata } from 'next'
import { GetInvolved } from '../_components/get-involved'
import { SiteHeader } from '../_components/site-header'
import { AREAS, formatBare, formatGoalBare, formatValue, indicators, judge, plan, scorecardGaps, scorecardNote, STATUS_LABEL, type Indicator, type Status } from '../_lib/development-plan'
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

/** Latest beside target beside start, as bars on one scale (user decision: a dot against a band was hard to read). The
    latest bar takes the verdict's colour; a target range is solid to its near end and paler to its far one. */
const BAR_TONE: Record<Status, string> = {
	met: 'bg-[var(--tone-done-fg)]',
	short: 'bg-[var(--tone-move-fg)]',
	'no-target': 'bg-[var(--ink-3)]',
	'not-compared': 'bg-[var(--ink-3)]',
}

function Bars({ indicator, status, goals }: { indicator: Indicator; status: Status; goals: { low: number; high: number; year: number }[] }) {
	const { latest, baseline, unit } = indicator
	const values = [latest.value, baseline?.value ?? 0, ...goals.map((goal) => goal.high)]
	// A large share runs on 0–100, so 42% reads as under half; a small one (3.9% unemployment) and every other unit run
	// to the largest value in play, or the bars are too short to compare.
	const most = Math.max(...values)
	// A lone bar has nothing to compare against, so a share of it runs on 0–100 too.
	const lone = !goals.length && !baseline
	const top = unit === '%' && (most > 50 || lone) && most <= 100 ? 100 : most * 1.1 || 1
	const width = (v: number) => `max(2px, ${Math.min(100, (v / top) * 100)}%)`
	const row = (key: string, label: string, year: number, text: string, bar: React.ReactNode, strong = false) => (
		<div key={key} className='grid grid-cols-[3.75rem_minmax(0,1fr)_5.5rem] items-center gap-3'>
			<span className='text-[0.75rem] leading-tight text-[var(--ink-3)]'>
				{label}
				<span className='block tabular-nums text-[var(--ink-mute)]'>{year}</span>
			</span>
			<span className='relative h-2.5 bg-[var(--paper-2)]'>{bar}</span>
			<span className={`text-right text-[0.8125rem] tabular-nums ${strong ? 'font-semibold text-[var(--ink)]' : 'text-[var(--ink-2)]'}`}>{text}</span>
		</div>
	)
	return (
		<div className='mt-5 grid gap-2.5'>
			{row('latest', 'Latest', latest.year, formatBare(latest.value, unit), <span className={`absolute inset-y-0 left-0 ${BAR_TONE[status]}`} style={{ width: width(latest.value) }} />, true)}
			{goals.map((goal) =>
				row(
					`target-${goal.year}`,
					'Target',
					goal.year,
					formatGoalBare(goal, unit),
					<>
						<span className='absolute inset-y-0 left-0 bg-[var(--accent)]' style={{ width: width(goal.low) }} />
						{goal.high > goal.low ? (
							<span className='absolute inset-y-0 left-0 bg-[color-mix(in_oklab,var(--accent)_35%,transparent)]' style={{ width: width(goal.high) }} />
						) : null}
					</>,
				),
			)}
			{baseline ? row('start', 'Start', baseline.year, formatBare(baseline.value, unit), <span className='absolute inset-y-0 left-0 bg-[var(--rule)]' style={{ width: width(baseline.value) }} />) : null}
			<p className='text-right text-[0.75rem] text-[var(--ink-3)]'>{indicator.direction === 'up' ? 'Higher is better' : 'Lower is better'}</p>
		</div>
	)
}

function Card({ indicator }: { indicator: Indicator }) {
	const { status, against } = judge(indicator)
	const { latest, baseline, target, unit } = indicator
	const endDiffers = target && against && (against.year !== target.year || against.low !== target.low || against.high !== target.high)
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

			<Bars indicator={indicator} status={status} goals={[...(against ? [against] : []), ...(target && (endDiffers || !against) ? [target] : [])]} />

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
