import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GUIDE_PAGES } from '../_lib/guide'

import { itineraries, travelAreas } from '@betterbarmm/travel-data'
import { GuideLayout, GuideSection, TravelMasthead } from '../_components/travel-parts'
import { photosForArea } from '../_lib/media'

export const metadata: Metadata = {
	title: 'Routes',
	description:
		'Four trips through BARMM that actually work with the transport that exists — the Tawi-Tawi week, Cotabato and the coast, the Lake Lanao circuit, and Basilan from Zamboanga.',
}

const areaName = new Map(travelAreas.map((area) => [area.slug, area.name]))

/* Routes, as plain reading (user decision): each trip a heading, who it suits, its days in order and what tends to go
   wrong, in one column — no map beside it. The guide's text is unchanged. */
export default function RoutesPage() {
	if (!GUIDE_PAGES) notFound()
	return (
		<>
			<TravelMasthead
				kicker='The guide'
				name='Routes'
				note='Given a week, where do you go? Each route uses transport that actually exists, so none covers the whole region: Tawi-Tawi and Lanao del Sur are reached through different cities on different islands.'
			/>

			<GuideLayout toc={[...itineraries.map((r) => ({ id: r.slug, title: r.name })), { id: 'nothing-booked', title: 'Nothing here is booked' }]}>
				{itineraries.map((route) => (
					<GuideSection
						key={route.slug}
						id={route.slug}
						title={route.name}
						photo={route.areas.flatMap(photosForArea)[0]}
						lede={`${route.nights}, based in ${route.base} · ${route.areas.map((slug) => areaName.get(slug) ?? slug).join(', ')}`}
					>
						<p>{route.forWhom}</p>
						{route.days.map((day) => (
							<div key={day.label}>
								<h3>
									{day.label} <span className='font-normal text-[var(--ink-3)]'>· {day.where}</span>
								</h3>
								<p>{day.what}</p>
							</div>
						))}
						<h3>What is most likely to go wrong</h3>
						<p>{route.watchFor}</p>
					</GuideSection>
				))}

				<GuideSection id='nothing-booked' title='Nothing here is booked'>
					<p>
						These are routes, not products. No transport on them is reserved, scheduled or guaranteed, the boats in
						particular run on weather rather than on timetables, and any of these plans will be rearranged by a sea that is
						up. Read{' '}
						<Link href='/plan' className='rule-link'>
							the planning page
						</Link>{' '}
						before you commit to dates, and take local advice on the areas the week you travel.
					</p>
				</GuideSection>
			</GuideLayout>
		</>
	)
}
