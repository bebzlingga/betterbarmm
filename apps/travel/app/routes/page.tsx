import Link from 'next/link'
import type { Metadata } from 'next'
import { SectionHead } from '@betterbarmm/editorial'
import { itineraries, placePoints, pointForArea, travelAreas } from '@betterbarmm/travel-data'
import { Caution, TravelBreadcrumb, TravelMasthead } from '../_components/travel-parts'
import { TravelMap } from '../_components/travel-map'

export const metadata: Metadata = {
	title: 'Routes',
	description:
		'Four trips through BARMM that actually work with the transport that exists — the Tawi-Tawi week, Cotabato and the coast, the Lake Lanao circuit, and Basilan from Zamboanga.',
}

const areaName = new Map(travelAreas.map((area) => [area.slug, area.name]))

export default function RoutesPage() {
	return (
		<>
			<TravelMasthead
				breadcrumb={<TravelBreadcrumb>Routes</TravelBreadcrumb>}
				kicker={`${itineraries.length} trips`}
				name='Routes'
				note='Given a week, where do you go? Each of these is built from the transport that exists rather than from what would be nice — which is also why there is no single route covering the whole region. Tawi-Tawi and Lanao del Sur are reached through different cities on different islands; stringing them together buys you three flights and two days of transit.'
			/>

			{itineraries.map((route, index) => {
				// The route's own map: every place in the areas it covers, with the
				// base emphasised, so the shape of the trip is visible before the days.
				const points = route.areas.flatMap((slug) => {
					const inArea = placePoints.filter((point) => point.area === slug)
					const areaPoint = pointForArea(slug)
					return inArea.length ? inArea : areaPoint ? [areaPoint] : []
				})

				return (
					<section
						key={route.slug}
						id={route.slug}
						className={`bb-section ${index % 2 === 0 ? 'bb-section-top' : ''}`}
					>
						<div className='bb-container'>
							<SectionHead
								index={String(index + 1).padStart(2, '0')}
								eyebrow={`${route.nights} · base ${route.base}`}
								title={route.name}
								lead={route.forWhom}
								aside={
									<span className='flex flex-wrap gap-2'>
										{route.areas.map((slug) => (
											<Link key={slug} href={`/${slug}`} className='rule-link-quiet'>
												{areaName.get(slug) ?? slug}
											</Link>
										))}
									</span>
								}
								size='sm'
							/>

							<div className='mt-10 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16'>
								<div>
									{route.days.map((day) => (
										<div key={day.label} className='tv-day'>
											<p className='bb-label'>{day.label}</p>
											<p className='item-title mt-2'>{day.where}</p>
											<p className='mt-2.5 text-[14px] leading-7 text-[var(--ink-2)]'>{day.what}</p>
										</div>
									))}
								</div>

								<div className='grid content-start gap-6'>
									<TravelMap
										points={points}
										caption={`${route.name} — the places it passes through. Approximate coordinates with a true scale bar; not for navigation.`}
									/>

									<Caution label='What is most likely to go wrong'>{route.watchFor}</Caution>
								</div>
							</div>
						</div>
					</section>
				)
			})}

			<section className='bb-section'>
				<div className='bb-container'>
					<Caution label='Nothing here is booked'>
						These are routes, not products. No transport on them is reserved, scheduled or guaranteed,
						the boats in particular run on weather rather than on timetables, and any of these plans
						will be rearranged by a sea that is up. Read{' '}
						<Link href='/plan' className='rule-link'>
							the planning page
						</Link>{' '}
						before you commit to dates, and take local advice on the areas the week you travel.
					</Caution>
				</div>
			</section>
		</>
	)
}
