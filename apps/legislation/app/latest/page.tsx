import type { Metadata } from 'next'
import { ChangeCard, groupByMeasure } from '../_components/change-card'
import { CalendarBlankIcon } from '@phosphor-icons/react/ssr'
import { RegistryBand } from '../_components/registry-band'
import { getChanges, mondayOf, type Change } from '../_lib/changes'

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
			<RegistryBand
				label={changes[0] ? `Newest step on record: ${LONG.format(at(changes[0].date))}` : 'Nothing recorded yet'}
				title='Latest updates'
				lead='Every step a bill or resolution took, and every act ratified, newest first: one card a measure, with each step it took that week.'
			/>
			{/* Each week a band of its own, paper and the warm wash in turn (user decision: the travel look), counted from the
			    last so the one above the closing ask's warm band is paper. */}
			{[...weeks].map(([week, list], i) => {
				const measures = groupByMeasure(list)
				return (
					<section key={week} className={(weeks.size - 1 - i) % 2 ? 'tv-wash' : ''}>
						<div className='bb-container py-16 lg:py-24'>
							<div className='flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
								<div className='flex items-center gap-4'>
									<span className='grid size-12 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'>
										<CalendarBlankIcon size={24} weight='duotone' aria-hidden='true' />
									</span>
									<h2 className='dv-title'>Week of {LONG.format(at(week))}</h2>
								</div>
								<p className='flex flex-wrap gap-2'>
									<span className='dv-pill !px-3.5 !py-1.5 !text-[0.8125rem]'>
										{measures.length} {measures.length === 1 ? 'measure' : 'measures'}
									</span>
									<span className='dv-pill !px-3.5 !py-1.5 !text-[0.8125rem]'>
										{list.length} {list.length === 1 ? 'step' : 'steps'}
									</span>
								</p>
							</div>
							<ul className='mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
								{measures.map((measure) => (
									<ChangeCard key={measure.key} measure={measure} />
								))}
							</ul>
						</div>
					</section>
				)
			})}
		</>
	)
}
