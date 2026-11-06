import type { Metadata } from 'next'
import { ferries } from '@betterbarmm/travel-data/transport'
import { ArrowRightIcon, BoatIcon, ClockIcon } from '@phosphor-icons/react/ssr'
import { SectionHead, TravelMasthead } from '../_components/travel-parts'

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
				kicker='Getting here'
				name='Ferries & boats'
				note='The island provinces are reached by sea as often as by air, and between their own islands only by sea. Boats run on the weather as much as on the timetable.'
			/>

			<section>
				<div className='bb-container py-[clamp(3.75rem,7vw,6.5rem)]'>
					{ports.map((port, index) => (
						<div key={port} className={index ? 'mt-14' : ''}>
							<SectionHead title={`From ${port}`} />
							<div className='mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
								{ferries
									.filter((f) => f.from === port)
									.map((route, i) => (
										<div key={i} className='tv-card'>
											<p className='tv-kind flex items-center gap-1.5'>
												<BoatIcon size={14} weight='duotone' className='text-[var(--brass)]' aria-hidden='true' />
												{KIND[route.kind] ?? route.kind}
											</p>
											<p className='mt-3 flex items-center gap-2 font-[family-name:var(--font-display)] text-[1.125rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
												{route.from}
												<ArrowRightIcon size={14} weight='bold' className='text-[var(--ink-3)]' aria-hidden='true' />
												{route.to}
											</p>
											{route.duration || route.frequency ? (
												<p className='mt-2 flex items-center gap-1.5 text-[0.84375rem] text-[var(--ink-2)]'>
													<ClockIcon size={14} className='text-[var(--ink-3)]' aria-hidden='true' />
													{[route.duration, route.frequency].filter(Boolean).join(' · ')}
												</p>
											) : null}
											{route.operators.length ? (
												<p className='mt-3 text-[0.84375rem] text-[var(--ink-3)]'>
													<span className='text-[var(--ink-2)]'>Sailed by</span> {route.operators.join(', ')}
												</p>
											) : null}
											{route.note ? <p className='mt-3 text-[0.8125rem] leading-[1.55] text-[var(--ink-3)]'>{route.note}</p> : null}
											<a href={route.source} target='_blank' rel='noopener' className='mt-4 inline-block text-[0.75rem] text-[var(--ink-3)] underline-offset-2 hover:text-[var(--accent)] hover:underline'>
												Source · {route.asOf}
											</a>
										</div>
									))}
							</div>
						</div>
					))}

					<p className='mt-16 border-t border-[var(--rule)] pt-6 text-[0.8125rem] leading-[1.7] text-[var(--ink-3)]'>
						Routes are taken from the operators’ own pages and dated reports. Sailings are cancelled when the sea is up, and
						the coast guard can hold every boat in port; ask at the terminal the day before, and buy tickets there or from the
						operator. Nothing is booked or sold here.
					</p>
				</div>
			</section>
		</>
	)
}
