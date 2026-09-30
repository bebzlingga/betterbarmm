import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LineReveal, OkirRule, Rise, SectionHead, Stagger, StaggerItem } from '@betterbarmm/editorial'
import { areaHref, findProvince } from '@betterbarmm/lgu-data'
import {
	festivalsForArea,
	findTravelArea,
	itinerariesForArea,
	legsForArea,
	lguForArea,
	LODGING_KIND_LABEL,
	lodgingCaveat,
	lodgingForArea,
	NOTABLE_STAYS_CAVEAT,
	placesInArea,
	PLACE_KIND_LABEL,
	pointForArea,
	pointsInArea,
	travelAreas,
} from '@betterbarmm/travel-data'
import { Caution, Footing, GateList, TravelBreadcrumb, TravelMasthead } from '../_components/travel-parts'
import { TravelMap } from '../_components/travel-map'
import { PhotoFigure, PhotoStrip } from '../_components/photo-figure'
import { photoForPlace, photosForArea } from '../_lib/media'

/**
 * Static routes win over this one, so `/places`, `/food`, `/stays` and `/plan`
 * are never matched here. Only the seven area slugs are prerendered; anything
 * else falls through to `notFound` below.
 */
export function generateStaticParams() {
	return travelAreas.map((area) => ({ area: area.slug }))
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ area: string }>
}): Promise<Metadata> {
	const { area: slug } = await params
	const area = findTravelArea(slug)
	if (!area) return { title: 'Area not found' }

	return {
		title: `${area.name} — traveling the Bangsamoro`,
		description: `${area.tagline} How to get there, what to see, where to sleep, and the security picture for ${area.name} specifically.`,
	}
}

export default async function AreaPage({ params }: { params: Promise<{ area: string }> }) {
	const { area: slug } = await params
	const area = findTravelArea(slug)
	if (!area) notFound()

	const areaPlaces = placesInArea(area.slug)
	const lodging = lodgingForArea(area.slug)
	const province = lguForArea(area)
	const directoryProvince = findProvince(area.slug)
	const areaFestivals = festivalsForArea(area.slug).filter((festival) => festival.area !== 'region')
	const photos = photosForArea(area.slug)
	const [lead, ...gallery] = photos
	const routes = itinerariesForArea(area.slug)

	// The area's own places, plus its dot on the region map, so the locator
	// shows where in the Bangsamoro this is as well as what is in it.
	const areaLegs = legsForArea(area.slug)
	const areaPoint = pointForArea(area.slug)
	const localPoints = pointsInArea(area.slug)
	const mapPoints = areaPoint && !localPoints.length ? [areaPoint] : localPoints

	return (
		<>
			<TravelMasthead
				breadcrumb={<TravelBreadcrumb>{area.name}</TravelBreadcrumb>}
				badges={<Footing footing={area.footing} />}
				kicker={`Base · ${area.base}`}
				name={area.name}
				note={area.tagline}
			>
				<Rise delay={0.35} distance={14}>
					<div className='mt-10 grid gap-x-10 gap-y-6 border-t border-[var(--brass-line)] pt-8 sm:grid-cols-2 lg:grid-cols-4'>
						<div>
							<p className='bb-label'>When to go</p>
							<p className='mt-2.5 text-[13.5px] leading-6 text-[var(--ink-2)]'>{area.whenToGo}</p>
						</div>
						<div>
							<p className='bb-label'>Languages</p>
							<p className='mt-2.5 text-[13.5px] leading-6 text-[var(--ink-2)]'>
								{area.languages.join(', ')}
								<span className='text-[var(--ink-3)]'> · Filipino and English widely understood</span>
							</p>
						</div>
						<div>
							<p className='bb-label'>Known for</p>
							<p className='mt-2.5 text-[13.5px] leading-6 text-[var(--ink-2)]'>
								{area.knownFor.join(' · ')}
							</p>
						</div>
						{/* The census figures are the directory's, not this guide's, and the
						    link says so — a traveler who wants to know how big a place is
						    should end up on the record rather than on a number retyped here. */}
						{province && directoryProvince ? (
							<div>
								<p className='bb-label'>In the directory</p>
								<p className='mt-2.5 text-[13.5px] leading-6 text-[var(--ink-2)]'>
									{province.municipalities.length}{' '}
									{province.municipalities.length === 1 ? 'unit' : 'cities and municipalities'}.{' '}
									<a
										href={`https://lgu.betterbarmm.com${areaHref(directoryProvince)}`}
										className='rule-link'
									>
										Population, land area and officials
									</a>
									.
								</p>
							</div>
						) : null}
					</div>
				</Rise>
			</TravelMasthead>

			{/* ---- What the place is ---------------------------------------- */}
			<section className='bb-section'>
				<div className='bb-container'>
					<div className='grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16'>
						<div className='bb-prose max-w-2xl'>
							{area.intro.map((paragraph, index) => (
								<p key={paragraph.slice(0, 40)} className={index === 0 ? 'bb-dropcap' : undefined}>
									{paragraph}
								</p>
							))}
						</div>

						<div className='grid content-start gap-5'>
							{lead ? <PhotoFigure photo={lead} priority size='inset' /> : null}

							<Caution label='Security in this area'>{area.safety}</Caution>

							{areaFestivals.length ? (
								<div className='border border-[var(--rule)] p-5'>
									<p className='bb-label'>What is on</p>
									<div className='mt-4 grid gap-4'>
										{areaFestivals.map((festival) => (
											<div key={festival.name}>
												<p className='item-title'>{festival.name}</p>
												<p className='mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>
													{festival.when}
												</p>
												<p className='mt-2 text-[13.5px] leading-6 text-[var(--ink-3)]'>
													{festival.what}
												</p>
											</div>
										))}
									</div>
								</div>
							) : null}
						</div>
					</div>
				</div>
			</section>

			{/* ---- Getting there and around --------------------------------- */}
			<section className='bb-section bb-section-top'>
				<div className='bb-container'>
					<SectionHead
						index='01'
						eyebrow='The journey'
						title='Getting there,'
						titleMuted='and getting around once you have.'
						size='sm'
					/>

					<div className='mt-10 grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14'>
						<div className='grid content-start gap-9'>
							<GateList label='Getting there' items={area.gettingThere} />
							<GateList label='Getting around' items={area.gettingAround} />
						</div>

						<div className='grid content-start gap-6'>
							<TravelMap
								points={mapPoints}
								focus={areaPoint?.slug}
								caption={`${area.name} and the places in this guide. A locator drawn from approximate coordinates — about a kilometer — with a true scale bar. There is no coastline because this site holds none it can vouch for. Not for navigation.`}
							/>

							{areaLegs.length ? (
								<div>
									<p className='bb-label'>How long it takes</p>
									<dl className='mt-3.5 grid gap-2.5'>
										{areaLegs.map((leg) => (
											<div
												key={`${leg.from}-${leg.to}-${leg.mode}`}
												className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--rule-soft)] pb-2.5'
											>
												<dt className='text-[13.5px] text-[var(--ink-2)]'>
													{leg.from} → {leg.to}
													<span className='ml-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--brass)]'>
														{leg.mode}
													</span>
												</dt>
												<dd className='text-[13px] text-[var(--ink-3)]'>{leg.duration}</dd>
											</div>
										))}
									</dl>
								</div>
							) : null}
						</div>
					</div>
				</div>
			</section>

			{/* ---- The gallery ---------------------------------------------- */}
			{gallery.length ? (
				<section className='bb-section'>
					<div className='bb-container'>
						<p className='bb-label'>{area.name}, photographed</p>
						<div className='mt-8'>
							<PhotoStrip photos={gallery} />
						</div>
					</div>
				</section>
			) : (
				<section className='bb-section'>
					<div className='bb-container'>
						<Caution label='No photographs of this area'>
							This guide holds no freely licensed photograph of {area.name} that it could use and
							credit properly, so it shows none rather than borrowing a picture of somewhere else.
							If you have one you would license openly,{' '}
							<a href='https://betterbarmm.com/contribute' className='rule-link'>
								the project would take it
							</a>
							.
						</Caution>
					</div>
				</section>
			)}

			{/* ---- Places ---------------------------------------------------- */}
			{areaPlaces.length ? (
				<section className='bb-section'>
					<div className='bb-container'>
						<SectionHead
							index='02'
							eyebrow='What there is to see'
							title={`${areaPlaces.length} ${areaPlaces.length === 1 ? 'place' : 'places'}`}
							titleMuted='in this area.'
							aside={
								<Link href='/places' className='rule-link-quiet'>
									All places
								</Link>
							}
							size='sm'
						/>

						<Stagger className='mt-10 grid gap-8'>
							{areaPlaces.map((place) => (
								<StaggerItem key={place.slug}>
									<article className='border-t border-[var(--brass-line)] pt-8'>
										<div className='grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-14'>
											<div>
												<div className='flex flex-wrap items-center gap-x-3 gap-y-1.5'>
													<span className='tv-kind'>{PLACE_KIND_LABEL[place.kind]}</span>
													{place.signature ? (
														<span className='badge badge-plain !text-[9.5px]'>Signature</span>
													) : null}
													<span className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
														{place.municipality}
													</span>
												</div>

												<h3 className='section-title-sm mt-3'>{place.name}</h3>

												{place.alsoKnownAs?.length ? (
													<p className='mt-1.5 text-[13px] italic text-[var(--ink-3)]'>
														Also {place.alsoKnownAs.join(', ')}
													</p>
												) : null}

												<div className='bb-prose mt-5'>
													{place.detail.map((paragraph) => (
														<p key={paragraph.slice(0, 40)}>{paragraph}</p>
													))}
												</div>
											</div>

											<div className='grid content-start gap-8 lg:pt-10'>
												{photoForPlace(place.slug) ? (
													<PhotoFigure photo={photoForPlace(place.slug)!} size='inset' />
												) : null}
												<GateList label='Before you go' items={place.beforeYouGo} />
											</div>
										</div>
									</article>
								</StaggerItem>
							))}
						</Stagger>
					</div>
				</section>
			) : null}

			{/* ---- Where to sleep -------------------------------------------- */}
			{lodging ? (
				<section className='bb-section bb-section-top'>
					<div className='bb-container'>
						<SectionHead
							index={areaPlaces.length ? '03' : '02'}
							eyebrow='Where to sleep'
							title='What actually exists'
							titleMuted='and how it is booked.'
							aside={
								<Link href='/stays' className='rule-link-quiet'>
									Lodging across the region
								</Link>
							}
							size='sm'
						/>

						<div className='mt-10 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16'>
							<div>
								<div className='flex flex-wrap items-center gap-2'>
									{lodging.kinds.map((kind) => (
										<span key={kind} className='bb-chip'>
											{LODGING_KIND_LABEL[kind]}
										</span>
									))}
								</div>

								<div className='bb-prose mt-6 max-w-2xl'>
									{lodging.situation.map((paragraph) => (
										<p key={paragraph.slice(0, 40)}>{paragraph}</p>
									))}
								</div>
							</div>

							<div className='grid content-start gap-7'>
								<div>
									<p className='bb-label'>Booking</p>
									<p className='mt-3 text-[14px] leading-7 text-[var(--ink-2)]'>{lodging.booking}</p>
								</div>

								<GateList label='What to expect' items={lodging.expect} />

								<div>
									<p className='bb-label'>When it fills up</p>
									<p className='mt-3 text-[14px] leading-7 text-[var(--ink-2)]'>{lodging.fillsUp}</p>
								</div>

								<Caution label='Verify before you travel'>{lodgingCaveat}</Caution>
							</div>
						</div>

						{lodging.notableStays.length ? (
							<div className='mt-14 border-t border-[var(--brass-line)] pt-10'>
								<p className='bb-label'>Names you will hear</p>

								<div className='mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
									{lodging.notableStays.map((stay) => (
										<article key={stay.name} className='tv-card h-full'>
											<span className='tv-kind'>{LODGING_KIND_LABEL[stay.kind]}</span>
											<h4 className='item-title-lg mt-3'>{stay.name}</h4>
											<p className='mt-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
												{stay.town}
											</p>
											<p className='mt-3.5 flex-1 text-[13.5px] leading-7 text-[var(--ink-2)]'>
												{stay.note}
											</p>
										</article>
									))}
								</div>

								<div className='mt-7'>
									<Caution label='Not a recommendation'>{NOTABLE_STAYS_CAVEAT}</Caution>
								</div>
							</div>
						) : null}
					</div>
				</section>
			) : null}

			{/* ---- Routes ---------------------------------------------------- */}
			{routes.length ? (
				<section className='bb-section'>
					<div className='bb-container'>
						<SectionHead
							index='04'
							eyebrow='Putting it together'
							title={routes.length === 1 ? 'A route through here' : 'Routes through here'}
							aside={
								<Link href='/routes' className='rule-link-quiet'>
									All routes
								</Link>
							}
							size='sm'
						/>

						<div className='mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14'>
							{routes.map((route) => (
								<div key={route.slug}>
									<Link href={`/routes#${route.slug}`} className='section-title-sm rule-link-quiet'>
										{route.name}
									</Link>
									<p className='mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>
										{route.nights} · base {route.base}
									</p>
									<p className='mt-4 text-[14px] leading-7 text-[var(--ink-2)]'>{route.forWhom}</p>
								</div>
							))}
						</div>
					</div>
				</section>
			) : null}

			{/* ---- Onward ---------------------------------------------------- */}
			<section className='bb-section'>
				<div className='bb-container'>
					<OkirRule />
					<div className='mt-10'>
						<p className='bb-label'>The other areas</p>
						<LineReveal
							lines={['Six more, and none of them', 'travels like this one.']}
							className='bb-display-sm mt-5 text-[var(--ink)]'
						/>
						<div className='mt-8 flex flex-wrap gap-2.5'>
							{travelAreas
								.filter((other) => other.slug !== area.slug)
								.map((other) => (
									<Link key={other.slug} href={`/${other.slug}`} className='bb-btn bb-btn-ghost'>
										{other.name}
									</Link>
								))}
						</div>
					</div>
				</div>
			</section>
		</>
	)
}
