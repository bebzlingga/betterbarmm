import type { Metadata } from 'next'
import { ChangeCard, groupByMeasure } from '../_components/change-card'
import { BandSectionTitle, RegistryBand } from '../_components/registry-band'
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
			<section className='bb-container py-[clamp(3.75rem,7vw,6.5rem)]'>
				{[...weeks].map(([week, list]) => {
					const measures = groupByMeasure(list)
					return (
						<section key={week} className='mt-16 first:mt-0'>
							<BandSectionTitle
								title={`Week of ${LONG.format(at(week))}`}
								count={measures.length}
								lead={`${list.length} ${list.length === 1 ? 'step' : 'steps'} across ${measures.length} ${measures.length === 1 ? 'measure' : 'measures'}`}
							/>
							<ul className='mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
								{measures.map((measure) => (
									<ChangeCard key={measure.key} measure={measure} />
								))}
							</ul>
						</section>
					)
				})}
			</section>
		</>
	)
}
