import type { Metadata } from 'next'
import Link from 'next/link'
import { travelAreas } from '@betterbarmm/travel-data'
import { airportLabel as label, airports, flights, flightSearchUrl } from '@betterbarmm/travel-data/transport'
import { AirplaneTiltIcon, ArrowRightIcon, ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import { FlightSearch } from '../_components/flight-search'
import { SectionHead, TravelMasthead } from '../_components/travel-parts'

export const metadata: Metadata = {
	title: 'Flights',
	description: 'The airports that serve the Bangsamoro and the cities next to it, who flies to each, and a fare search for the route.',
}

const areaName = new Map(travelAreas.map((area) => [area.slug, area.name]))

/* Flights (user decision: a full travel site, flights included). The search hands off to Google Flights; under it the
   airports, then every route into them with who flies it. Sourced, in datasets/travel/transport.json. */
export default function FlightsPage() {
	const destinations = airports.filter((a) => flights.some((f) => f.to === a.code))
	const origins = [...new Set(flights.map((f) => f.from))]
	const byDestination = destinations
		.map((airport) => ({ airport, routes: flights.filter((f) => f.to === airport.code) }))
		.sort((a, b) => Number(b.airport.inBarmm) - Number(a.airport.inBarmm))

	return (
		<>
			<TravelMasthead
				kicker='Getting here'
				name='Flights'
				note='Three airports sit inside the region or at its edge, and four cities next to it carry most travelers in. Search a route for every airline’s fares; this site sells no tickets.'
			>
				<FlightSearch
					origins={origins.map((code) => ({ code, label: label(code) }))}
					destinations={destinations.map((a) => ({ code: a.code, label: label(a.code) }))}
				/>
			</TravelMasthead>

			<section>
				<div className='bb-container py-[clamp(3.75rem,7vw,6.5rem)]'>
					<SectionHead title='The airports' lead='The ones in the region first, then the cities next door that most trips start from.' />
					<div className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
						{[...airports].sort((a, b) => Number(b.inBarmm) - Number(a.inBarmm)).map((airport) => (
							<div key={airport.code} className='tv-card'>
								<div className='flex items-baseline justify-between gap-3'>
									<span className='font-[family-name:var(--font-display)] text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'>
										{airport.code}
									</span>
									<span className='tv-kind'>{airport.inBarmm ? 'In the region' : 'Gateway'}</span>
								</div>
								<p className='mt-3 font-semibold text-[var(--ink)]'>{airport.name}</p>
								<p className='text-[0.84375rem] text-[var(--ink-3)]'>{airport.city}</p>
								<p className='mt-3 text-[0.84375rem] leading-[1.55] text-[var(--ink-2)]'>{airport.note}</p>
								{airport.serves.length ? (
									<p className='mt-3 flex flex-wrap gap-1.5'>
										{airport.serves.map((slug) =>
											areaName.has(slug) ? (
												<Link key={slug} href={`/${slug}`} className='badge badge-plain hover:text-[var(--accent)]'>
													{areaName.get(slug)}
												</Link>
											) : null,
										)}
									</p>
								) : null}
							</div>
						))}
					</div>

					<SectionHead title='Who flies where' lead='Every scheduled route into these airports, with the airlines on it. Timetables change by season; the search shows the current ones.' className='mt-16' />
					<div className='mt-8 grid gap-10'>
						{byDestination.map(({ airport, routes }) => (
							<div key={airport.code}>
								<h3 className='flex items-center gap-2 font-[family-name:var(--font-display)] text-[1.125rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
									<AirplaneTiltIcon size={18} weight='duotone' className='text-[var(--brass)]' aria-hidden='true' />
									Into {airport.name}
								</h3>
								<ul className='mt-3 border-t border-[var(--ink)]'>
									{routes.map((route, i) => (
										<li
											key={i}
											className='grid gap-x-6 gap-y-1 border-b border-[var(--rule)] py-4 sm:grid-cols-[19rem_minmax(0,1fr)_13rem_auto] sm:items-center'
										>
											<span className='flex items-center gap-2 font-semibold text-[var(--ink)]'>
												{label(route.from)}
												<ArrowRightIcon size={12} weight='bold' className='text-[var(--ink-3)]' aria-hidden='true' />
												{label(route.to)}
											</span>
											<span className='min-w-0 text-[0.84375rem] text-[var(--ink-2)]'>
												{route.airlines.join(', ')}
												{route.note ? <span className='block text-[0.78125rem] text-[var(--ink-3)]'>{route.note}</span> : null}
											</span>
											<span className='text-[0.8125rem] text-[var(--ink-3)]'>
												{[route.duration, route.frequency].filter(Boolean).join(' · ') || '—'}
											</span>
											<a
												href={flightSearchUrl(route.from, route.to)}
												target='_blank'
												rel='noopener'
												className='inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-[var(--ink)] hover:text-[var(--accent)]'
											>
												Fares <ArrowUpRightIcon size={12} weight='bold' aria-hidden='true' />
											</a>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>

					<p className='mt-16 border-t border-[var(--rule)] pt-6 text-[0.8125rem] leading-[1.7] text-[var(--ink-3)]'>
						Routes are taken from the airlines’ own pages and dated reports, each as of the month it was read; a route can be
						added or dropped within a season. Fares, seats and timetables are the airlines’, shown by the search. Nothing is
						booked or sold here.
					</p>
				</div>
			</section>
		</>
	)
}
