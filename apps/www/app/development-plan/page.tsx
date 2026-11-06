import type { Metadata } from 'next'
import { GetInvolved } from '../_components/get-involved'
import { SiteHeader } from '../_components/site-header'
import { AREAS, formatGoal, formatValue, indicators, judge, plan, scorecardGaps, scorecardNote, STATUS_LABEL, type Indicator, type Status } from '../_lib/development-plan'
import { pageMeta } from '../_lib/seo'

export const metadata: Metadata = pageMeta({
	title: 'Development plan scorecard',
	description:
		'The targets of the 2nd Bangsamoro Development Plan 2023–2028 — poverty, jobs, the economy, schools, health, water, roads and peace — each beside the latest published figure and its source.',
	path: '/development-plan',
})

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

/** Where the latest figure sits between zero and the largest value in play, with the target as a band and the start
    as a tick. Direction is told by the words beside it, not by the bar. */
function Gauge({ indicator, against }: { indicator: Indicator; against: { low: number; high: number } | null }) {
	const values = [indicator.latest.value, indicator.baseline?.value ?? 0, against?.high ?? 0, indicator.target?.high ?? 0]
	// A share runs on its own 0–100 scale, so 42% reads as under half; other units run to the largest value in play.
	const top = indicator.unit === '%' && Math.max(...values) <= 100 ? 100 : Math.max(...values) * 1.12 || 1
	const at = (v: number) => `${Math.min(100, (v / top) * 100)}%`
	return (
		<div className='relative mt-5 h-2 bg-[var(--paper-3)]' aria-hidden='true'>
			{against ? (
				<span
					className='absolute inset-y-0 bg-[color-mix(in_oklab,var(--brass)_45%,transparent)]'
					style={{ left: at(against.low), width: `max(3px, calc(${at(against.high)} - ${at(against.low)}))` }}
				/>
			) : null}
			{indicator.baseline ? <span className='absolute -top-1 h-4 w-px bg-[var(--ink-3)]' style={{ left: at(indicator.baseline.value) }} /> : null}
			<span className='absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--paper)] bg-[var(--ink)]' style={{ left: at(indicator.latest.value) }} />
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

			<Gauge indicator={indicator} against={against ?? (target && indicator.comparable ? target : null)} />

			<dl className='mt-4 grid gap-1 text-[0.8125rem] leading-[1.5] text-[var(--ink-2)]'>
				{against ? (
					<div className='flex justify-between gap-3'>
						<dt className='text-[var(--ink-3)]'>Target for {against.year}</dt>
						<dd className='text-right font-semibold'>{formatGoal(against, unit)}</dd>
					</div>
				) : null}
				{target && (endDiffers || !against) ? (
					<div className='flex justify-between gap-3'>
						<dt className='text-[var(--ink-3)]'>Target for {target.year}</dt>
						<dd className='text-right font-semibold'>{formatGoal(target, unit)}</dd>
					</div>
				) : null}
				{baseline ? (
					<div className='flex justify-between gap-3'>
						<dt className='text-[var(--ink-3)]'>Where it started</dt>
						<dd className='text-right'>
							{formatValue(baseline.value, unit)} in {baseline.year}
						</dd>
					</div>
				) : null}
				<div className='flex justify-between gap-3'>
					<dt className='text-[var(--ink-3)]'>Better is</dt>
					<dd className='text-right'>{indicator.direction === 'up' ? 'higher' : 'lower'}</dd>
				</div>
			</dl>

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

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader />

			<section className='brand-bg bb-lattice relative overflow-hidden'>
				<div className='bb-container relative w-full py-14 md:py-20'>
					<div className='max-w-[52rem]'>
						<p className='bb-label'>Development plan scorecard</p>
						<h1 className='mt-2 text-[clamp(2.1rem,4.4vw,3.4rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-[var(--ink)]'>
							The plan’s targets, and where the region stands.
						</h1>
						<p className='mt-3 text-[0.96875rem] leading-[1.65] text-[var(--ink-2)]'>
							The{' '}
							<a href={plan.url} target='_blank' rel='noreferrer' className={linkClass}>
								2nd Bangsamoro Development Plan 2023–2028
							</a>{' '}
							sets targets for poverty, jobs, the economy, schools, health, water, roads and peace. Each is set here beside the
							latest figure published for it, with both sources a click away.
						</p>
					</div>

					<dl className='mt-10 grid max-w-[52rem] grid-cols-2 gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-4'>
						{(
							[
								['Indicators', indicators.length],
								['Target met', count('met')],
								['Short of target', count('short')],
								['No target to judge', count('no-target') + count('not-compared')],
							] as const
						).map(([label, value]) => (
							<div key={label} className='brand-bg px-4 py-4'>
								<dd className='font-[family-name:var(--font-display)] text-[1.75rem] font-extrabold leading-none text-[var(--ink)]'>{value}</dd>
								<dt className='mt-1.5 text-[0.75rem] text-[var(--ink-3)]'>{label}</dt>
							</div>
						))}
					</dl>
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

				<div className='mt-16 grid gap-4 border-t border-[var(--rule)] pt-6 text-[0.8125rem] leading-[1.7] text-[var(--ink-3)] lg:grid-cols-2 lg:gap-12'>
					<div>
						<p className='font-semibold text-[var(--ink-2)]'>How this is judged</p>
						<p className='mt-1'>
							{scorecardNote} A figure is judged against the target for its own year where the plan set one, and against the end target
							otherwise; “met” means it has reached the target, not that it will stay there. Figures are as published, with their own
							definitions: several changed during the plan, and Sulu left the region in 2024, so a later figure may cover fewer
							provinces than the start.
						</p>
					</div>
					<div>
						<p className='font-semibold text-[var(--ink-2)]'>The documents</p>
						<ul className='mt-1 space-y-1'>
							<li>
								<a href={plan.url} target='_blank' rel='noreferrer' className={linkClass}>
									{plan.title}
								</a>
							</li>
							<li>
								<a href={plan.midterm_update.url} target='_blank' rel='noreferrer' className={linkClass}>
									{plan.midterm_update.title}
								</a>
							</li>
							{plan.progress_reports.map((report) => (
								<li key={report.url}>
									<a href={report.url} target='_blank' rel='noreferrer' className={linkClass}>
										{report.title}
									</a>
								</li>
							))}
							<li>
								Listed on BPDA’s{' '}
								<a href={plan.listing_url} target='_blank' rel='noreferrer' className={linkClass}>
									Knowledge Portal
								</a>
								.
							</li>
						</ul>
						<details className='mt-3'>
							<summary className='cursor-pointer font-semibold text-[var(--ink-2)] hover:text-[var(--accent)]'>What is missing</summary>
							<ul className='mt-2 list-disc space-y-1 pl-5'>
								{scorecardGaps.map((gap) => (
									<li key={gap.slice(0, 40)}>{gap}</li>
								))}
							</ul>
						</details>
					</div>
				</div>
			</section>
			<GetInvolved />
		</main>
	)
}
