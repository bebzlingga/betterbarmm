import type { Metadata } from 'next'
import { heroFromTravelPhoto } from '../_components/page-hero'
import { travelPhotos } from '../_lib/media'
import { ferries } from '@betterbarmm/travel-data/transport'
import { BoatIcon } from '@phosphor-icons/react/ssr'
import { RouteTicket } from '../_components/route-ticket'
import { TravelMasthead } from '../_components/travel-parts'

export const metadata: Metadata = {
	title: 'Ferries & boats',
	description: 'The sea routes into Basilan and Tawi-Tawi and between the islands: who sails them, what kind of boat, and how long they take.',
}

const KIND: Record<string, string> = {
	'fast craft': 'Fast craft',
	RORO: 'RORO',
	conventional: 'Conventional ferry',
	mixed: 'Fast craft and RORO',
	'pump boat': 'Pump boat',
}

/* Ferries (user decision: a full travel site). Each route a card: where from and to, the kind of boat, how long, how
   often, who sails it. Sourced, in datasets/travel/transport.json. */
export default function FerriesPage() {
	const ports = [...new Set(ferries.map((f) => f.from))]

	return (
		<>
			<TravelMasthead
				photos={[heroFromTravelPhoto(travelPhotos.panampangan)]}
				kicker='Getting here'
				name='Ferries & boats'
				note='The island provinces are reached by sea as often as by air, and between their own islands only by sea. Boats run on the weather as much as on the timetable.'
			/>


			{/* ---- Port by port: each route a ticket ---- */}
			<section className='dv-section bb-container'>
				{ports.map((port, index) => {
					const routes = ferries.filter((f) => f.from === port)
					return (
						<div key={port} className={index ? 'mt-16' : ''}>
							<div className='flex flex-wrap items-end justify-between gap-3'>
								<h2 className='flex items-center gap-3 font-[family-name:var(--font-display)] text-[clamp(1.5rem,2.6vw,2rem)] font-extrabold tracking-[-0.025em] text-[var(--ink)]'>
									<span className='grid size-10 place-items-center rounded-full bg-[var(--accent)] text-white'>
										<BoatIcon size={20} weight='fill' aria-hidden='true' />
									</span>
									From {port}
								</h2>
								<p className='text-[0.875rem] text-[var(--ink-3)]'>
									{routes.length} {routes.length === 1 ? 'route' : 'routes'}
								</p>
							</div>
							<ul className='mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
								{routes.map((route, i) => (
									<RouteTicket
										key={i}
										mode='sea'
										from={route.from}
										to={route.to}
										kind={KIND[route.kind] ?? route.kind}
										carriers={route.operators}
										duration={route.duration}
										frequency={route.frequency}
										note={route.note}
										action={{ href: route.source, label: `Source · ${route.asOf}` }}
									/>
								))}
							</ul>
						</div>
					)
				})}

				<p className='mt-16 border-t border-[var(--rule)] pt-6 text-[0.8125rem] leading-[1.7] text-[var(--ink-3)]'>
					Routes are taken from the operators’ own pages and dated reports. Sailings are cancelled when the sea is up, and the coast guard can hold every boat in port; ask at the
					terminal the day before, and buy tickets there or from the operator. Nothing is booked or sold here.
				</p>
			</section>
		</>
	)
}
