import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '../_components/page-header'
import { getChanges, mondayOf, stageTone, type Change } from '../_lib/changes'
import { statusToneClass } from '../_lib/labels'

export const metadata: Metadata = {
	title: 'What changed',
	description: 'Every step a bill or resolution took in the Bangsamoro Parliament, and every act ratified, newest first, week by week.',
}

/* ============================================================
   What changed, week by week

   The last eight weeks that saw any movement, counted back from the newest
   step on record rather than from today, so a quiet stretch between
   captures doesn't leave the page blank. Each step links to its measure.
   ============================================================ */

const WEEKS = 8
const DAY = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const LONG = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const at = (iso: string) => new Date(`${iso}T00:00:00Z`)

export default function LatestPage() {
	const changes = getChanges()
	const weeks = new Map<string, Change[]>()
	for (const change of changes) {
		const week = mondayOf(change.date)
		if (!weeks.has(week) && weeks.size >= WEEKS) break
		weeks.set(week, [...(weeks.get(week) ?? []), change])
	}

	return (
		<>
			<PageHeader
				emphasis='brand'
				align='left'
				size='compact'
				eyebrow={changes[0] ? `Newest step on record: ${LONG.format(at(changes[0].date))}` : 'Nothing recorded yet'}
				title='What changed in Parliament.'
				description='Every step a bill or resolution took, and every act ratified, newest first.'
			/>
			<section className='bb-container py-[clamp(3rem,6vw,5rem)]'>
				{[...weeks].map(([week, list]) => (
					<section key={week} className='mb-14'>
						<h2 className='flex items-baseline gap-3 border-b border-[var(--rule)] pb-3 text-[1.125rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
							Week of {LONG.format(at(week))}
							<span className='num text-[0.8125rem] font-semibold text-[var(--ink-mute)]'>{list.length} {list.length === 1 ? 'step' : 'steps'}</span>
						</h2>
						<ol className='mt-2 divide-y divide-[var(--rule)]'>
							{list.map((change, i) => (
								<li key={i} className='grid gap-1 py-3 sm:grid-cols-[11rem_24rem_minmax(0,1fr)] sm:items-center sm:gap-5'>
									<span className='num text-[0.8125rem] text-[var(--ink-3)]'>{DAY.format(at(change.date))}</span>
									<span className='flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.875rem]'>
										<span className={`${statusToneClass[stageTone(change.stage)]} whitespace-normal text-left`}>{change.stage}</span>
										{change.note ? <span className='badge badge-plain badge-idle'>{change.note}</span> : null}
									</span>
									<span className='min-w-0 text-[0.875rem] text-[var(--ink-2)]'>
										{change.href ? (
											<Link href={change.href} className='font-semibold text-[var(--ink)] hover:text-[var(--accent)]'>
												{change.label}
											</Link>
										) : (
											<span className='font-semibold text-[var(--ink)]'>{change.label}</span>
										)}{' '}
										<span className='line-clamp-1'>{change.title}</span>
									</span>
								</li>
							))}
						</ol>
					</section>
				))}
			</section>
		</>
	)
}
