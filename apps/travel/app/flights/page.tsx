import type { Metadata } from 'next'
import { heroFromTravelPhoto } from '../_components/page-hero'
import { travelPhotos } from '../_lib/media'
import Link from 'next/link'
import { travelAreas } from '@betterbarmm/travel-data'
import { airportLabel as label, airports, flights, flightSearchUrl } from '@betterbarmm/travel-data/transport'
import { AirplaneTiltIcon } from '@phosphor-icons/react/ssr'
import { RouteTicket } from '../_components/route-ticket'
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

	const ordered = [...airports].sort((a, b) => Number(b.inBarmm) - Number(a.inBarmm))
	const codeOf = (code: string) => airports.find((a) => a.code === code)

	return (
		<>
			<TravelMasthead
				photos={[heroFromTravelPhoto(travelPhotos.budBongao)]}
				kicker='Getting here'
				name='Flights'
				note='Three airports sit inside the region or at its edge, and four cities next to it carry most travelers in. Search a route for every airline’s fares; this site sells no tickets.'
			/>

			{/* ---- The fare search, centred on the line between the photograph and the page (user decision): a layer of no
			    height, the panel pulled up by half its own height, so it sits on the line whatever its height. Below a wide screen the fields stack and it
			    would cover the header's words, so there it follows the photograph instead. ---- */}
			<div className='bb-container relative z-10 pt-8 lg:h-0 lg:pt-0'>
				<div className='rounded-[1.75rem] lg:-translate-y-1/2 bg-[var(--paper)] p-4 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.55)]'>
					<FlightSearch
						origins={origins.map((code) => ({ code, label: label(code) }))}
						destinations={destinations.map((a) => ({ code: a.code, label: label(a.code) }))}
					/>
				</div>
			</div>

			{/* ---- The airports: the region's own as dark cards, the gateway cities lighter ---- */}
			<section className='dv-section bb-container'>
				<SectionHead title='The airports' lead='The ones in the region first, then the cities next door that most trips start from.' />
				<div className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{ordered.map((airport) => (
						<div
							key={airport.code}
							className={`flex flex-col rounded-[var(--dv-r)] p-6 ${airport.inBarmm ? 'bg-[var(--ink)] text-[var(--paper)]' : 'border border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)]'}`}
						>
							<div className='flex items-start justify-between gap-3'>
								<span className='font-[family-name:var(--font-display)] text-[2.75rem] font-extrabold leading-none tracking-[-0.04em]'>{airport.code}</span>
								<span
									className={`rounded-full px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] ${airport.inBarmm ? 'bg-[#f1c453] text-[#1a1408]' : 'bg-[var(--paper-2)] text-[var(--ink-3)]'}`}
								>
									{airport.inBarmm ? 'In the region' : 'Gateway'}
								</span>
							</div>
							<p className='mt-4 font-semibold'>{airport.name}</p>
							<p className={`text-[0.84375rem] ${airport.inBarmm ? 'opacity-65' : 'text-[var(--ink-3)]'}`}>{airport.city}</p>
							<p className={`mt-3 flex-1 text-[0.875rem] leading-relaxed ${airport.inBarmm ? 'opacity-80' : 'text-[var(--ink-2)]'}`}>{airport.note}</p>
							{airport.serves.length ? (
								<div className='mt-5 flex flex-wrap gap-1.5'>
									{airport.serves.map((slug) =>
										areaName.has(slug) ? (
											<Link
												key={slug}
												href={`/guide/${slug}`}
												className={`rounded-full px-3 py-1 text-[0.75rem] font-semibold transition ${airport.inBarmm ? 'bg-white/10 hover:bg-white/20' : 'border border-[var(--rule)] hover:border-[var(--ink)]'}`}
											>
												{areaName.get(slug)}
											</Link>
										) : null,
									)}
								</div>
							) : null}
						</div>
					))}
				</div>
			</section>

			{/* ---- Who flies where: each route a ticket, grouped by the airport it flies into ---- */}
			<section className='dv-section tv-wash'>
				<div className='bb-container'>
					<SectionHead title='Who flies where' lead='Every scheduled route into these airports, with the airlines on it. Timetables change by season; the search shows the current ones.' />
					{byDestination.map(({ airport, routes }) => (
						<div key={airport.code} className='mt-12'>
							<h3 className='flex items-center gap-2.5 font-[family-name:var(--font-display)] text-[1.25rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
								<span className='grid size-9 place-items-center rounded-full bg-[var(--accent)] text-white'>
									<AirplaneTiltIcon size={18} weight='fill' aria-hidden='true' />
								</span>
								Into {airport.name}
							</h3>
							<ul className='mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
								{routes.map((route, i) => (
									<RouteTicket
										key={i}
										mode='air'
										from={route.from}
										to={route.to}
										fromSub={codeOf(route.from)?.short ?? label(route.from).replace(/ \(\w+\)$/, '')}
										toSub={codeOf(route.to)?.short}
										carriers={route.airlines}
										duration={route.duration}
										frequency={route.frequency}
										note={route.note}
										action={{ href: flightSearchUrl(route.from, route.to), label: 'Fares' }}
									/>
								))}
							</ul>
						</div>
					))}

					<p className='mt-16 border-t border-[var(--rule)] pt-6 text-[0.8125rem] leading-[1.7] text-[var(--ink-3)]'>
					Routes are taken from the airlines’ own pages and dated reports, each as of the month it was read; a route can be added or dropped within a season. Fares, seats and
					timetables are the airlines’, shown by the search. Nothing is booked or sold here.
					</p>
				</div>
			</section>
		</>
	)
}
