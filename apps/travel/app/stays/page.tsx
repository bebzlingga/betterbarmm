import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GUIDE_PAGES } from '../_lib/guide'

import { areaLodging, LODGING_KIND_LABEL, lodgingCaveat, NOTABLE_STAYS_CAVEAT, travelAreas } from '@betterbarmm/travel-data'
import { GuideLayout, GuideSection, TravelMasthead } from '../_components/travel-parts'
import { photosForArea } from '../_lib/media'

export const metadata: Metadata = {
	title: 'Where to sleep',
	description:
		'How lodging actually works across BARMM — what exists in each area, how it is booked when the booking sites do not cover it, and what a room is likely to be like.',
}

const areaNames = new Map(travelAreas.map((area) => [area.slug, area.name]))

/* Where to sleep, as plain reading (user decision): each area a heading and its lodging described in one column —
   the kinds there are, how to book, what to expect, when it fills up, the names you will hear — with no chips, boxes or
   side panels. The guide's text is unchanged. */
export default function StaysPage() {
	if (!GUIDE_PAGES) notFound()
	return (
		<>
			<TravelMasthead
				kicker='The guide'
				name='Where to sleep'
				note='This describes how lodging works in each area rather than listing establishments with rates and phone numbers that would be stale within a season. Outside Cotabato City the booking sites barely cover this region, and a property’s absence from them says nothing about whether it exists or is any good.'
			/>

			<GuideLayout
				toc={[...areaLodging.map((e) => ({ id: e.area, title: areaNames.get(e.area) ?? e.area })), { id: 'before-you-book', title: 'Before you book' }]}
			>
				{areaLodging.map((entry) => (
					<GuideSection
						key={entry.area}
						id={entry.area}
						title={areaNames.get(entry.area) ?? entry.area}
						photo={photosForArea(entry.area)[0]}
						lede={`Base: ${entry.base} · ${entry.kinds.map((kind) => LODGING_KIND_LABEL[kind]).join(', ')}`}
					>
						{entry.situation.map((paragraph) => (
							<p key={paragraph.slice(0, 40)}>{paragraph}</p>
						))}

						<h3>Booking</h3>
						<p>{entry.booking}</p>

						{entry.expect.length ? (
							<>
								<h3>What to expect</h3>
								<ul>
									{entry.expect.map((item) => (
										<li key={item}>{item}</li>
									))}
								</ul>
							</>
						) : null}

						<h3>When it fills up</h3>
						<p>{entry.fillsUp}</p>

						{entry.notableStays.length ? (
							<>
								<h3>Names you will hear</h3>
								<ul>
									{entry.notableStays.map((stay) => (
										<li key={stay.name}>
											<strong className='font-semibold text-[var(--ink)]'>{stay.name}</strong>, {stay.town} ({LODGING_KIND_LABEL[stay.kind].toLowerCase()}): {stay.note}
										</li>
									))}
								</ul>
							</>
						) : null}
					</GuideSection>
				))}

				<GuideSection id='before-you-book' title='Before you book'>
					<p>{lodgingCaveat}</p>
					<p>{NOTABLE_STAYS_CAVEAT}</p>
					<p>
						There are no prices here. Not because they are secret: a number written once and read a year later is worse than
						no number, and the ranges that would be honest across a region this varied are wide enough to be useless. Ask
						when you book — everyone will tell you, and the answer will be current.
					</p>
				</GuideSection>
			</GuideLayout>
		</>
	)
}
