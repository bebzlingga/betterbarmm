import Link from 'next/link'
import type { Metadata } from 'next'
import { SectionHead } from '@betterbarmm/editorial'
import {
	areaLodging,
	LODGING_KIND_LABEL,
	lodgingCaveat,
	NOTABLE_STAYS_CAVEAT,
	travelAreas,
} from '@betterbarmm/travel-data'
import { Caution, GateList, TravelBreadcrumb, TravelMasthead } from '../_components/travel-parts'

export const metadata: Metadata = {
	title: 'Where to sleep',
	description:
		'How lodging actually works across BARMM — what exists in each area, how it is booked when the booking sites do not cover it, and what a room is likely to be like.',
}

const areaNames = new Map(travelAreas.map((area) => [area.slug, area.name]))

export default function StaysPage() {
	return (
		<>
			<TravelMasthead
				breadcrumb={<TravelBreadcrumb>Where to sleep</TravelBreadcrumb>}
				kicker='Lodging across the seven areas'
				name='Where to sleep'
				note='Built the opposite way round from the usual: this describes how lodging works in each area rather than listing establishments with rates and phone numbers that would be stale within a season. Outside Cotabato City the booking sites barely cover this region, and a property’s absence from them says nothing about whether it exists or is any good.'
			>
				<div className='mt-10 border-t border-[var(--brass-line)] pt-8'>
					<Caution label='Verify before you travel'>{lodgingCaveat}</Caution>
				</div>
			</TravelMasthead>

			{areaLodging.map((entry, index) => (
				<section
					key={entry.area}
					id={entry.area}
					className={`bb-section ${index % 2 === 1 ? 'bb-section-top' : ''}`}
				>
					<div className='bb-container'>
						<SectionHead
							index={String(index + 1).padStart(2, '0')}
							eyebrow={`Base · ${entry.base}`}
							title={areaNames.get(entry.area) ?? entry.area}
							aside={
								<Link href={`/${entry.area}`} className='rule-link-quiet'>
									The area guide
								</Link>
							}
							size='sm'
						/>

						<div className='mt-10 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16'>
							<div>
								<div className='flex flex-wrap items-center gap-2'>
									{entry.kinds.map((kind) => (
										<span key={kind} className='bb-chip'>
											{LODGING_KIND_LABEL[kind]}
										</span>
									))}
								</div>

								<div className='bb-prose mt-6 max-w-2xl'>
									{entry.situation.map((paragraph) => (
										<p key={paragraph.slice(0, 40)}>{paragraph}</p>
									))}
								</div>
							</div>

							<div className='grid content-start gap-7'>
								<div>
									<p className='bb-label'>Booking</p>
									<p className='mt-3 text-[14px] leading-7 text-[var(--ink-2)]'>{entry.booking}</p>
								</div>

								<GateList label='What to expect' items={entry.expect} />

								<div>
									<p className='bb-label'>When it fills up</p>
									<p className='mt-3 text-[14px] leading-7 text-[var(--ink-2)]'>{entry.fillsUp}</p>
								</div>
							</div>
						</div>

						{entry.notableStays.length ? (
							<div className='mt-12 border-t border-[var(--brass-line)] pt-9'>
								<p className='bb-label'>Names you will hear</p>
								<div className='mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
									{entry.notableStays.map((stay) => (
										<article key={stay.name} className='tv-card h-full'>
											<span className='tv-kind'>{LODGING_KIND_LABEL[stay.kind]}</span>
											<h3 className='item-title-lg mt-3'>{stay.name}</h3>
											<p className='mt-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
												{stay.town}
											</p>
											<p className='mt-3.5 flex-1 text-[13.5px] leading-7 text-[var(--ink-2)]'>
												{stay.note}
											</p>
										</article>
									))}
								</div>
							</div>
						) : null}
					</div>
				</section>
			))}

			<section className='bb-section bb-section-top'>
				<div className='bb-container'>
					<Caution label='Not a recommendation'>{NOTABLE_STAYS_CAVEAT}</Caution>
				</div>
			</section>

			<section className='bb-section'>
				<div className='bb-container'>
					<Caution label='Why there are no prices here'>
						Not because they are secret. A number written once and read a year later is worse than no
						number, and the ranges that would be honest across a region this varied are wide enough
						to be useless. Ask when you book — everyone will tell you, and the answer will be current.
					</Caution>
				</div>
			</section>
		</>
	)
}
