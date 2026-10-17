import { ArrowLeftIcon, ArrowRightIcon, RssIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'
import { pageMeta } from '../_lib/seo'
import { PROC, addDays, latestDay, mondayOf, week, type MeasureEvent } from '../_lib/weekly'
import { GetInvolved } from '../_components/get-involved'

export const metadata: Metadata = pageMeta({
	title: 'This week',
	description: 'What moved in the Bangsamoro this week: bills filed and read, resolutions adopted, laws signed, bids posted and contracts awarded.',
	path: '/this-week',
})

const H2 = 'text-[1.5rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const peso = (n: number) => (n >= 1e9 ? `₱${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `₱${(n / 1e6).toFixed(1)}M` : `₱${Math.round(n).toLocaleString('en-PH')}`)
const day = (iso: string, opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' }) =>
	new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' })

function Events({ items }: { items: MeasureEvent[] }) {
	return (
		<ul className='mt-5'>
			{items.map((e, i) => (
				<li key={`${e.href}-${e.stage}-${i}`} className='grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-5 border-t border-[var(--rule)] py-3.5'>
					<span className='text-[12.5px] text-[var(--ink-3)]'>{day(e.date, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
					<div>
						<p className='text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--brass)]'>
							{e.kind} {e.number} · {e.stage}
						</p>
						<a href={e.href} className='mt-1 block text-[15px] font-semibold leading-6 text-[var(--ink)] hover:text-[var(--accent)]'>
							{e.title}
						</a>
					</div>
				</li>
			))}
		</ul>
	)
}

export default async function ThisWeekPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
	const { week: asked } = await searchParams
	// On a Monday or Tuesday the new week has barely started: open on the one just finished.
	const current = mondayOf(addDays(latestDay, -2))
	const monday = asked && /^\d{4}-\d{2}-\d{2}$/.test(asked) ? mondayOf(asked) : current
	const w = week(monday)
	const moved = w.events.filter((e) => !w.filed.includes(e) && !w.adopted.includes(e))
	const isCurrent = monday === current

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='this-week' />
			<Masthead
				brand
				label={isCurrent ? 'The latest week' : 'Week of'}
				lines={[`${day(w.monday)} – ${day(w.sunday, { month: 'long', day: 'numeric', year: 'numeric' })}`]}
				standfirst='What moved in the Bangsamoro: each stage Parliament recorded, each law signed, each bid notice posted and contract awarded on PhilGEPS — read from the records themselves.'
				facts={[
					{ value: String(w.filed.length), label: 'Measures filed' },
					{ value: String(w.adopted.length), label: 'Adopted or signed' },
					{ value: w.notices.count.toLocaleString('en-PH'), label: `Bids posted · ${peso(w.notices.budget)}` },
					{ value: w.awards.count.toLocaleString('en-PH'), label: `Awards · ${peso(w.awards.amount)}` },
				]}
			/>

			<nav className='bb-container flex flex-wrap items-center justify-between gap-4 border-b border-[var(--rule)] py-5 text-[14px]'>
				<Link href={`/this-week?week=${addDays(monday, -7)}`} className='inline-flex items-center gap-2 font-semibold hover:text-[var(--accent)]'>
					<ArrowLeftIcon size={14} weight='bold' aria-hidden='true' /> Week before
				</Link>
				<a href='/this-week/feed.xml' className='inline-flex items-center gap-2 text-[13px] text-[var(--ink-3)] hover:text-[var(--accent)]'>
					<RssIcon size={14} aria-hidden='true' /> Get it every week by RSS
				</a>
				{monday >= mondayOf(latestDay) ? (
					<span />
				) : (
					<Link href={`/this-week?week=${addDays(monday, 7)}`} className='inline-flex items-center gap-2 font-semibold hover:text-[var(--accent)]'>
						Week after <ArrowRightIcon size={14} weight='bold' aria-hidden='true' />
					</Link>
				)}
			</nav>

			<div className='bb-container bb-section grid gap-x-20 gap-y-16 lg:grid-cols-2'>
				<section>
					<h2 className={H2}>In Parliament</h2>
					{w.events.length ? (
						<>
							{w.adopted.length ? (
								<>
									<p className='bb-label mt-6'>Adopted or signed</p>
									<Events items={w.adopted} />
								</>
							) : null}
							{w.filed.length ? (
								<>
									<p className='bb-label mt-8'>Filed</p>
									<Events items={w.filed} />
								</>
							) : null}
							{moved.length ? (
								<>
									<p className='bb-label mt-8'>Moved</p>
									<Events items={moved} />
								</>
							) : null}
						</>
					) : (
						<p className='mt-4 text-[15px] text-[var(--ink-3)]'>Parliament recorded no stage this week.</p>
					)}
				</section>

				<section>
					<h2 className={H2}>In procurement</h2>
					<p className='mt-3 text-[14.5px] leading-7 text-[var(--ink-2)]'>
						BARMM offices posted <strong>{w.notices.count.toLocaleString('en-PH')}</strong> bid notices worth <strong>{peso(w.notices.budget)}</strong>.{' '}
						{w.awards.count ? (
							<>
								PhilGEPS records <strong>{w.awards.count.toLocaleString('en-PH')}</strong> contracts awarded worth <strong>{peso(w.awards.amount)}</strong>.
							</>
						) : (
							'PhilGEPS has published no awards dated this week yet; they reach its public data weeks later.'
						)}
					</p>
					{w.notices.largest.length ? (
						<>
							<p className='bb-label mt-8'>Largest bids posted</p>
							<ul className='mt-3'>
								{w.notices.largest.map((n) => (
									<li key={n.ref} className='flex items-baseline justify-between gap-5 border-t border-[var(--rule)] py-3'>
										<div className='min-w-0'>
											<p className='text-[14.5px] font-semibold leading-6'>{n.title}</p>
											<a href={`${PROC}/${n.officeSlug}`} className='text-[12.5px] text-[var(--ink-3)] hover:text-[var(--accent)]'>
												{n.office}
											</a>
										</div>
										<span className='shrink-0 text-[14px] font-semibold tabular-nums'>{n.budget != null ? peso(n.budget) : '—'}</span>
									</li>
								))}
							</ul>
						</>
					) : null}
					{w.awards.largest.length ? (
						<>
							<p className='bb-label mt-8'>Largest awards</p>
							<ul className='mt-3'>
								{w.awards.largest.map((a, i) => (
									<li key={`${a.ref}-${i}`} className='flex items-baseline justify-between gap-5 border-t border-[var(--rule)] py-3'>
										<div className='min-w-0'>
											<p className='text-[14.5px] font-semibold leading-6'>{a.supplier}</p>
											<p className='text-[12.5px] text-[var(--ink-3)]'>
												{a.title} · {a.office}
											</p>
										</div>
										<span className='shrink-0 text-[14px] font-semibold tabular-nums'>{a.amount != null ? peso(a.amount) : '—'}</span>
									</li>
								))}
							</ul>
						</>
					) : null}
					{w.closing.length ? (
						<>
							<p className='bb-label mt-8'>Open, closing the week after</p>
							<ul className='mt-3'>
								{w.closing.map((n) => (
									<li key={n.ref} className='flex items-baseline justify-between gap-5 border-t border-[var(--rule)] py-3'>
										<div className='min-w-0'>
											<p className='text-[14.5px] font-semibold leading-6'>{n.title}</p>
											<p className='text-[12.5px] text-[var(--ink-3)]'>{n.office}</p>
										</div>
										<span className='shrink-0 text-right text-[13px]'>
											<span className='block font-semibold tabular-nums'>{n.budget != null ? peso(n.budget) : ''}</span>
											<span className='text-[12px] text-[var(--accent)]'>Closes {day(n.closing!)}</span>
										</span>
									</li>
								))}
							</ul>
						</>
					) : null}
					<a href={`${PROC}/notices`} className='mt-6 inline-block text-[13px] font-semibold text-[var(--accent)]'>
						Every bid notice →
					</a>
				</section>
			</div>
			<GetInvolved />
		</main>
	)
}
