import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { Masthead } from '../_components/parts'
import { fmt, indicators, linkOf, per, plan, type PlanIndicator } from '../_lib/plan'

export const metadata: Metadata = {
	title: 'Against the plan',
	description: 'The 2nd Bangsamoro Development Plan’s targets for mothers’ and children’s deaths, immunisation, stunting, safe water and sanitation, each beside the latest published figure.',
}

const READING = {
	past: { label: 'Past the target', className: 'bg-[var(--ink)] text-[var(--paper)]' },
	short: { label: 'Short of the target', className: 'border border-[var(--accent)] text-[var(--accent)]' },
	none: { label: 'No target published', className: 'border border-[var(--rule)] text-[var(--ink-3)]' },
} as const

function Card({ i }: { i: PlanIndicator }) {
	const r = READING[i.reading]
	const src = linkOf(i.latest?.source) ?? linkOf(i.target?.source)
	return (
		<article className='flex h-full flex-col border border-[var(--rule)] bg-[var(--paper)] p-6'>
			<div className='flex items-start justify-between gap-4'>
				<h3 className='text-[1.0625rem] font-extrabold leading-snug tracking-[-0.01em] text-[var(--ink)]'>{i.name}</h3>
				<span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.71875rem] font-semibold ${r.className}`}>{r.label}</span>
			</div>
			{i.explain ? <p className='mt-2 text-[0.84375rem] leading-6 text-[var(--ink-2)]'>{i.explain}</p> : null}
			<dl className='mt-5 grid grid-cols-3 gap-4 border-t border-[var(--rule)] pt-4'>
				<div>
					<dt className='text-[0.71875rem] text-[var(--ink-3)]'>Latest{i.latest ? `, ${i.latest.year}` : ''}</dt>
					<dd className='num mt-1 font-[family-name:var(--font-display)] text-[1.75rem] font-black leading-none tracking-[-0.03em] text-[var(--ink)]'>{i.latest ? fmt(i, i.latest.value) : '–'}</dd>
				</div>
				<div>
					<dt className='text-[0.71875rem] text-[var(--ink-3)]'>Target{i.target ? `, ${i.target.year}` : ''}</dt>
					<dd className='num mt-1 font-[family-name:var(--font-display)] text-[1.75rem] font-black leading-none tracking-[-0.03em] text-[var(--ink-2)]'>
						{i.target ? (i.target.text ?? fmt(i, i.direction === 'up' ? i.target.low : i.target.high)) : '–'}
					</dd>
				</div>
				<div>
					<dt className='text-[0.71875rem] text-[var(--ink-3)]'>Start{i.baseline ? `, ${i.baseline.year}` : ''}</dt>
					<dd className='num mt-1 font-[family-name:var(--font-display)] text-[1.75rem] font-black leading-none tracking-[-0.03em] text-[var(--ink-3)]'>{i.baseline ? fmt(i, i.baseline.value) : '–'}</dd>
				</div>
			</dl>
			{per(i) ? <p className='mt-2 text-[0.75rem] text-[var(--ink-3)]'>{per(i)}</p> : null}
			{i.latest?.note ? <p className='mt-4 text-[0.78125rem] leading-6 text-[var(--ink-3)]'>{i.latest.note}</p> : null}
			{src ? (
				<a href={src} target='_blank' rel='noreferrer' className='rule-link mt-auto inline-flex items-center gap-1 self-start pt-4 text-[0.78125rem]'>
					Source
					<ArrowUpRightIcon size={12} weight='bold' aria-hidden='true' />
				</a>
			) : null}
		</article>
	)
}

export default function PlanPage() {
	const short = indicators.filter((i) => i.reading === 'short').length
	const health = indicators.filter((i) => i.area === 'Health')
	const water = indicators.filter((i) => i.area !== 'Health')
	return (
		<>
			<Masthead
				kicker='Health · Bangsamoro'
				name='Against the plan'
				note={`The targets the 2nd Bangsamoro Development Plan sets for health, water and sanitation, each beside the latest figure published for it. ${short} of ${indicators.filter((i) => i.reading !== 'none').length} with a target are still short of it.`}
			/>
			<section className='bb-container bb-section'>
				<h2 className='text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>Mothers and children</h2>
				<div className='mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
					{health.map((i) => (
						<Card key={i.id} i={i} />
					))}
				</div>
				<h2 className='mt-16 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>Water and sanitation</h2>
				<div className='mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
					{water.map((i) => (
						<Card key={i.id} i={i} />
					))}
				</div>
				<p className='mt-12 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
					The plan publishes end-of-plan targets only for the economy, jobs and poverty; for health it reprints yearly targets from a
					results matrix BPDA has not released, so each target here is the latest year it gives. A target and its latest figure can be a
					year apart. &ldquo;Past the target&rdquo; reads only the direction the plan wants: lower for deaths and stunting, higher for
					immunisation, water and sanitation. From{' '}
					<a href={plan.url} className='rule-link'>
						{plan.title}
					</a>{' '}
					and its{' '}
					<a href={plan.midterm_update.url} className='rule-link'>
						midterm update
					</a>
					, as gathered for{' '}
					<a href='https://betterbarmm.com/plan' className='rule-link'>
						the plan scorecard
					</a>
					.
				</p>
			</section>
		</>
	)
}
