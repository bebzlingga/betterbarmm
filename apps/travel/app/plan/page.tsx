import Link from 'next/link'
import type { Metadata } from 'next'
import { OkirRule, SectionHead } from '@betterbarmm/editorial'
import { areaPoints, festivals, gatewayPoints, legs, planSections, travelAreas } from '@betterbarmm/travel-data'
import { TravelMap } from '../_components/travel-map'
import { Caution, Footing, GateList, TravelBreadcrumb, TravelMasthead } from '../_components/travel-parts'

export const metadata: Metadata = {
	title: 'Plan a trip',
	description:
		'Getting to BARMM, the security picture area by area, manners in a Muslim region, when to go, money and connectivity, language, permissions, and health.',
}

export default function PlanPage() {
	return (
		<>
			<TravelMasthead
				breadcrumb={<TravelBreadcrumb>Plan a trip</TravelBreadcrumb>}
				kicker={`${planSections.length} things to settle first`}
				name='Plan a trip'
				note='The practical half of the guide, and the answers to the questions a first-time visitor actually asks — several of which nobody publishes a straight answer to.'
			>
				<div className='mt-10 flex flex-wrap gap-2 border-t border-[var(--brass-line)] pt-8'>
					{planSections.map((section) => (
						<a key={section.slug} href={`#${section.slug}`} className='bb-chip'>
							{section.title}
						</a>
					))}
				</div>
			</TravelMasthead>

			{planSections.map((section, index) => (
				<section
					key={section.slug}
					id={section.slug}
					className={`bb-section ${index % 2 === 1 ? 'bb-section-top' : ''}`}
				>
					<div className='bb-container'>
						<SectionHead
							index={String(index + 1).padStart(2, '0')}
							eyebrow={section.lede}
							title={section.title}
							size='sm'
						/>

						<div className='mt-10 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16'>
							<div className='bb-prose max-w-2xl'>
								{section.body.map((paragraph) => (
									<p key={paragraph.slice(0, 40)}>{paragraph}</p>
								))}
							</div>

							<div className='lg:pt-2'>
								<GateList label='In short' items={section.points ?? []} />

								{/* The gateways are the one thing on this page a map answers
								    faster than a paragraph: four of the six are outside the
								    region, which is the whole reason people arrive wrong. */}
								{section.slug === 'getting-here' ? (
									<div className='mt-8 grid gap-6'>
										<TravelMap
											points={[...gatewayPoints, ...areaPoints]}
											caption='The ways in (brass diamonds) against the seven areas. Zamboanga, Iligan, Laguindingan and Davao are outside BARMM and are how most people arrive. Approximate coordinates with a true scale bar; not for navigation.'
										/>

										<div>
											<p className='bb-label'>Every leg, and how long it takes</p>
											<dl className='mt-3.5 grid gap-2.5'>
												{legs.map((leg) => (
													<div
														key={`${leg.from}-${leg.to}-${leg.mode}`}
														className='border-b border-[var(--rule-soft)] pb-2.5'
													>
														<div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1'>
															<dt className='text-[13.5px] text-[var(--ink-2)]'>
																{leg.from} → {leg.to}
																<span className='ml-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--brass)]'>
																	{leg.mode}
																</span>
															</dt>
															<dd className='text-[13px] text-[var(--ink-3)]'>{leg.duration}</dd>
														</div>
														{leg.note ? (
															<p className='mt-1.5 text-[12.5px] leading-6 text-[var(--ink-mute)]'>
																{leg.note}
															</p>
														) : null}
													</div>
												))}
											</dl>
										</div>
									</div>
								) : null}

								{/* The security section is the one place where the general
								    answer is actively misleading, so it hands the reader
								    straight to the seven specific ones. */}
								{section.slug === 'safety' ? (
									<div className='mt-8 grid gap-2.5'>
										<p className='bb-label'>The picture, area by area</p>
										{travelAreas.map((area) => (
											<Link
												key={area.slug}
												href={`/${area.slug}`}
												className='flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule-soft)] py-2.5 text-[14px] text-[var(--ink-2)] transition hover:text-[var(--ink)]'
											>
												{area.name}
												<Footing footing={area.footing} />
											</Link>
										))}
									</div>
								) : null}
							</div>
						</div>
					</div>
				</section>
			))}

			{/* ---- The calendar ---------------------------------------------- */}
			<section className='bb-section bb-section-top'>
				<div className='bb-container'>
					<SectionHead
						index={String(planSections.length + 1).padStart(2, '0')}
						eyebrow='What is on, and when'
						title='The calendar'
						titleMuted='moves, and so should your booking.'
						lead='The Islamic observances carry no fixed date because they have none — the Hijri calendar is lunar and shifts about 11 days earlier each Gregorian year. The civil festivals are fixed and are given their month.'
						size='sm'
					/>

					<div className='mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2 xl:grid-cols-3'>
						{festivals.map((festival) => (
							<div key={festival.name} className='border-t border-[var(--brass-line)] pt-6'>
								<p className='item-title'>{festival.name}</p>
								<p className='mt-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>
									{festival.when}
								</p>
								<p className='mt-3 text-[13.5px] leading-6 text-[var(--ink-2)]'>{festival.what}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className='bb-section'>
				<div className='bb-container'>
					<OkirRule />
					<div className='mt-10 grid gap-5 lg:grid-cols-2'>
						<Caution label='This is not advice'>
							Nothing here is legal, medical or security advice, and none of it has been verified on
							the ground. Advisories change, roads change, and the person in the town you are going
							to knows more than this page does. Where a decision matters, this guide points at who
							publishes the current position rather than paraphrasing it into staleness.
						</Caution>

						<Caution label='Tell someone where you are going'>
							Signal disappears on the outer islands and thins on the Lake Lanao circuit. Leave your
							route and your expected return with someone before you lose it, rather than after —
							and contact the area&rsquo;s tourism office, which is normal courtesy here and is the
							single most useful thing a visitor can do.
						</Caution>
					</div>
				</div>
			</section>
		</>
	)
}
