import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
	FOOTING_LABEL,
	LODGING_KIND_LABEL,
	festivalsForArea,
	findTravelArea,
	itinerariesForArea,
	legsForArea,
	lodgingForArea,
	towns,
	travelAreas,
} from '@betterbarmm/travel-data'
import { airportLabel, airports, ferries, flightSearchUrl, flights } from '@betterbarmm/travel-data/transport'
import { explorePlaces } from '@betterbarmm/travel-data/explore'
import {
	AirplaneTiltIcon,
	ArrowRightIcon,
	ArrowUpRightIcon,
	BedIcon,
	BoatIcon,
	CalendarStarIcon,
	CarIcon,
	CompassIcon,
	MapTrifoldIcon,
	NavigationArrowIcon,
	ShieldWarningIcon,
	SignpostIcon,
	SunHorizonIcon,
	TranslateIcon,
} from '@phosphor-icons/react/ssr'
import { PageHero, heroFromPlace, type HeroPhoto } from '../../_components/page-hero'
import { findDestination } from '../../_lib/discover'

/* ============================================================
   A travel guide for one area (user decision: a guide per province,
   under Getting here)

   The practical half of a trip, in one place: how to get in (the
   journey legs, the airports that serve the area and who flies into
   them, the boats), how to get around, where to sleep, when to go,
   the security picture, and the trips the guide has written. Every
   line is the guide's own data (`travel-data`); fares link out.
   ============================================================ */

export function generateStaticParams() {
	return travelAreas.map((area) => ({ area: area.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ area: string }> }): Promise<Metadata> {
	const area = findTravelArea((await params).area)
	if (!area) return { title: 'Not found' }
	return { title: `Travel guide: ${area.name}`, description: `How to get to ${area.name}, get around, where to sleep, when to go and what to know about safety.` }
}

const MODE_ICON = { air: AirplaneTiltIcon, sea: BoatIcon, road: CarIcon } as const
const MODE_LABEL = { air: 'By air', sea: 'By sea', road: 'By road' } as const

/** A section of the guide: a heading with its glyph, a line under it, and its content. */
function Part({ id, icon: Glyph, title, lede, children }: { id: string; icon: typeof CompassIcon; title: string; lede?: string; children: React.ReactNode }) {
	return (
		<section id={id} className='scroll-mt-8 border-t border-[var(--rule)] py-14 first:border-t-0 first:pt-0 lg:py-16'>
			<div className='flex items-center gap-3'>
				<span className='grid size-11 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'>
					<Glyph size={22} weight='duotone' aria-hidden='true' />
				</span>
				<h2 className='dv-title !text-[clamp(1.5rem,2.6vw,2rem)]'>{title}</h2>
			</div>
			{lede ? <p className='dv-lede max-w-2xl'>{lede}</p> : null}
			<div className='mt-7'>{children}</div>
		</section>
	)
}

export default async function GuidePage({ params }: { params: Promise<{ area: string }> }) {
	const { area: slug } = await params
	const area = findTravelArea(slug)
	if (!area) notFound()

	const legs = legsForArea(slug)
	const doors = airports.filter((a) => a.serves.includes(slug))
	const intoDoors = flights.filter((f) => doors.some((a) => a.code === f.to))
	// The boats: a route naming the area or one of its towns.
	const townNames = towns.filter((t) => t.area === slug).map((t) => t.name.replace(/^City of | City$/g, ''))
	const boats = ferries.filter((f) => [area.name, ...townNames].some((n) => n.length > 3 && `${f.from} ${f.to}`.includes(n)))
	const lodging = lodgingForArea(slug)
	const festivals = festivalsForArea(slug).filter((f) => f.area === slug)
	const trips = itinerariesForArea(slug)
	const destination = findDestination(slug)
	const photos = explorePlaces
		.filter((p) => p.area === slug && p.images[0] && p.images[0].width > p.images[0].height)
		.slice(0, 3)
		.map((p) => heroFromPlace(p))
		.filter((p): p is HeroPhoto => Boolean(p))

	const contents = [
		{ id: 'getting-there', label: 'Getting there' },
		{ id: 'getting-around', label: 'Getting around' },
		...(lodging ? [{ id: 'sleep', label: 'Where to sleep' }] : []),
		{ id: 'when', label: 'When to go' },
		{ id: 'safety', label: 'Safety' },
		...(trips.length ? [{ id: 'trips', label: 'Trips' }] : []),
	]

	return (
		<>
			<PageHero photos={photos} kicker='Travel guide' title={area.name} lede={area.tagline}>
				<div className='mt-7 flex flex-wrap gap-2'>
					<span className='dv-chip !px-3.5 !py-1.5 !text-[0.8125rem]'>{FOOTING_LABEL[area.footing]}</span>
					<span className='dv-chip !px-3.5 !py-1.5 !text-[0.8125rem]'>
						<NavigationArrowIcon size={14} weight='bold' aria-hidden='true' />
						Base: {area.base}
					</span>
				</div>
			</PageHero>

			<div className='bb-container grid gap-x-16 gap-y-10 py-[clamp(4.5rem,9vw,8rem)] lg:grid-cols-[14rem_minmax(0,1fr)]'>
				{/* ---- The contents, in view while the page is read ---- */}
				<aside className='lg:sticky lg:top-8 lg:self-start'>
					<p className='text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>In this guide</p>
					<ul className='mt-3 flex flex-wrap gap-2 lg:block lg:space-y-1'>
						{contents.map((c) => (
							<li key={c.id}>
								<a href={`#${c.id}`} className='block rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[0.875rem] text-[var(--ink-2)] transition hover:text-[var(--accent)] lg:rounded-none lg:border-0 lg:px-0 lg:py-1.5'>
									{c.label}
								</a>
							</li>
						))}
					</ul>
					<div className='mt-8 hidden space-y-2 lg:block'>
						<Link href={destination ? `/discover/${slug}` : `/${slug}`} className='tv-card group !flex-row items-center gap-3 !p-4 text-[0.875rem] font-semibold text-[var(--ink)]'>
							<CompassIcon size={18} weight='duotone' className='text-[var(--accent)]' aria-hidden='true' />
							{destination ? `Discover ${area.name}` : 'The area guide'}
						</Link>
						<Link href={`/?area=${slug}`} className='tv-card group !flex-row items-center gap-3 !p-4 text-[0.875rem] font-semibold text-[var(--ink)]'>
							<MapTrifoldIcon size={18} weight='duotone' className='text-[var(--accent)]' aria-hidden='true' />
							Places to see
						</Link>
					</div>
				</aside>

				<div className='min-w-0'>
					{/* ---- Getting there ---- */}
					<Part id='getting-there' icon={NavigationArrowIcon} title='Getting there' lede={area.gettingThere[0]}>
						{legs.length ? (
							<ol className='dv-route'>
								{legs.map((leg) => {
									const Glyph = MODE_ICON[leg.mode]
									return (
										<li key={`${leg.from}-${leg.to}`}>
											<span className='dv-route-dot'>
												<Glyph size={17} weight='duotone' aria-hidden='true' />
											</span>
											<p className='text-[0.9375rem] leading-relaxed text-[var(--ink-2)]'>
												<span className='font-semibold text-[var(--ink)]'>
													{leg.from} → {leg.to}
												</span>
												<span className='text-[var(--ink-3)]'>
													{' '}
													· {MODE_LABEL[leg.mode]}, {leg.duration.charAt(0).toLowerCase() + leg.duration.slice(1)}
												</span>
												{leg.note ? <span className='block text-[0.875rem] text-[var(--ink-3)]'>{leg.note}</span> : null}
											</p>
										</li>
									)
								})}
							</ol>
						) : null}

						{area.gettingThere.length > 1 ? (
							<ul className='mt-8 space-y-3 text-[0.9375rem] leading-relaxed text-[var(--ink-2)]'>
								{area.gettingThere.slice(1).map((line) => (
									<li key={line} className='flex gap-3'>
										<span aria-hidden='true' className='mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-[var(--accent)]' />
										{line}
									</li>
								))}
							</ul>
						) : null}

						{/* The airports that are the way in, and who flies into them. */}
						{doors.length ? (
							<div className='mt-10 grid gap-4 md:grid-cols-2'>
								{doors.map((a) => {
									const into = intoDoors.filter((f) => f.to === a.code)
									return (
										<div key={a.code} className='dv-panel'>
											<div className='flex items-baseline justify-between gap-4'>
												<p className='font-[family-name:var(--font-display)] text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'>{a.code}</p>
												<span className='text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[var(--ink-3)]'>{a.inBarmm ? 'In the region' : 'Gateway'}</span>
											</div>
											<p className='mt-2 font-semibold text-[var(--ink)]'>{a.name}</p>
											<p className='text-[0.875rem] text-[var(--ink-3)]'>{a.city}</p>
											{into.length ? (
												<ul className='mt-4 divide-y divide-[var(--rule)] border-t border-[var(--rule)]'>
													{into.map((f) => (
														<li key={`${f.from}-${f.to}-${f.airlines.join()}`}>
															<a href={flightSearchUrl(f.from, f.to)} target='_blank' rel='noreferrer' className='group flex items-center gap-3 py-3 text-[0.875rem]'>
																<AirplaneTiltIcon size={15} weight='duotone' className='shrink-0 text-[var(--accent)]' aria-hidden='true' />
																<span className='min-w-0 flex-1'>
																	<span className='font-semibold text-[var(--ink)]'>{airportLabel(f.from)}</span>
																	<span className='block text-[0.8125rem] text-[var(--ink-3)]'>
																		{f.airlines.join(', ')}
																		{f.duration ? ` · ${f.duration}` : ''}
																	</span>
																</span>
																<span className='inline-flex shrink-0 items-center gap-1 text-[0.8125rem] font-semibold text-[var(--ink-2)] group-hover:text-[var(--accent)]'>
																	Fares <ArrowUpRightIcon size={13} weight='bold' aria-hidden='true' />
																</span>
															</a>
														</li>
													))}
												</ul>
											) : null}
										</div>
									)
								})}
							</div>
						) : null}

						{/* The boats that call here. */}
						{boats.length ? (
							<div className='mt-10'>
								<h3 className='dv-panel-title flex items-center gap-2'>
									<BoatIcon size={20} weight='duotone' className='text-[var(--accent)]' aria-hidden='true' />
									By sea
								</h3>
								<ul className='mt-4 grid gap-3 md:grid-cols-2'>
									{boats.map((f) => (
										<li key={`${f.from}-${f.to}-${f.operators.join()}`} className='dv-panel !p-5'>
											<p className='font-semibold text-[var(--ink)]'>
												{f.from} → {f.to}
											</p>
											<p className='mt-1 text-[0.8125rem] text-[var(--ink-3)]'>
												{f.kind}
												{f.duration ? ` · ${f.duration}` : ''}
												{f.frequency ? ` · ${f.frequency}` : ''}
											</p>
											<p className='mt-2 text-[0.875rem] text-[var(--ink-2)]'>{f.operators.join(', ')}</p>
										</li>
									))}
								</ul>
							</div>
						) : null}

						<div className='mt-8 flex flex-wrap gap-3'>
							<Link href='/flights' className='dv-pill'>
								<AirplaneTiltIcon size={16} weight='duotone' className='text-[var(--accent)]' aria-hidden='true' />
								All flights
							</Link>
							<Link href='/ferries' className='dv-pill'>
								<BoatIcon size={16} weight='duotone' className='text-[var(--accent)]' aria-hidden='true' />
								All ferries &amp; boats
							</Link>
						</div>
					</Part>

					{/* ---- Getting around ---- */}
					<Part id='getting-around' icon={SignpostIcon} title='Getting around'>
						<ul className='space-y-3 text-[0.9375rem] leading-relaxed text-[var(--ink-2)]'>
							{area.gettingAround.map((line) => (
								<li key={line} className='flex gap-3'>
									<span aria-hidden='true' className='mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-[var(--accent)]' />
									{line}
								</li>
							))}
						</ul>
						<p className='mt-6 flex items-start gap-3 text-[0.9375rem] text-[var(--ink-2)]'>
							<TranslateIcon size={20} weight='duotone' className='mt-0.5 shrink-0 text-[var(--accent)]' aria-hidden='true' />
							<span>
								<span className='font-semibold text-[var(--ink)]'>Languages: </span>
								{area.languages.join(', ')}. Filipino and English are widely understood.
							</span>
						</p>
					</Part>

					{/* ---- Where to sleep ---- */}
					{lodging ? (
						<Part id='sleep' icon={BedIcon} title='Where to sleep' lede={`Most visitors base themselves in ${lodging.base}.`}>
							<div className='space-y-4 text-[0.9375rem] leading-relaxed text-[var(--ink-2)]'>
								{lodging.situation.map((p) => (
									<p key={p.slice(0, 40)}>{p}</p>
								))}
							</div>
							<div className='mt-6 flex flex-wrap gap-2'>
								{lodging.kinds.map((k) => (
									<span key={k} className='dv-pill !cursor-default hover:!border-[var(--rule)] hover:!bg-transparent'>
										{LODGING_KIND_LABEL[k]}
									</span>
								))}
							</div>
							<div className='mt-8 grid gap-4 md:grid-cols-2'>
								<div className='dv-panel'>
									<h3 className='dv-panel-title'>Booking</h3>
									<p className='mt-2 text-[0.9375rem] leading-relaxed text-[var(--ink-2)]'>{lodging.booking}</p>
									<h3 className='dv-panel-title mt-6'>When rooms fill up</h3>
									<p className='mt-2 text-[0.9375rem] leading-relaxed text-[var(--ink-2)]'>{lodging.fillsUp}</p>
								</div>
								<div className='dv-panel'>
									<h3 className='dv-panel-title'>What to expect</h3>
									<ul className='mt-2 space-y-2 text-[0.9375rem] leading-relaxed text-[var(--ink-2)]'>
										{lodging.expect.map((e) => (
											<li key={e}>{e}</li>
										))}
									</ul>
								</div>
							</div>
							{lodging.notableStays.length ? (
								<ul className='mt-6 divide-y divide-[var(--rule)] border-y border-[var(--rule)]'>
									{lodging.notableStays.map((s) => (
										<li key={s.name} className='py-4'>
											<p className='font-semibold text-[var(--ink)]'>
												{s.name} <span className='font-normal text-[var(--ink-3)]'>· {s.town}</span>
											</p>
											<p className='mt-1 text-[0.875rem] text-[var(--ink-2)]'>{s.note}</p>
										</li>
									))}
								</ul>
							) : null}
						</Part>
					) : null}

					{/* ---- When to go ---- */}
					<Part id='when' icon={SunHorizonIcon} title='When to go'>
						<p className='max-w-3xl text-[1rem] leading-relaxed text-[var(--ink-2)]'>{area.whenToGo}</p>
						{festivals.length ? (
							<ul className='mt-6 grid gap-4 md:grid-cols-2'>
								{festivals.map((f) => (
									<li key={f.name} className='dv-panel flex gap-4'>
										<CalendarStarIcon size={24} weight='duotone' className='shrink-0 text-[var(--accent)]' aria-hidden='true' />
										<span>
											<span className='block font-semibold text-[var(--ink)]'>{f.name}</span>
											<span className='block text-[0.8125rem] font-semibold text-[var(--accent)]'>{f.when}</span>
											<span className='mt-1 block text-[0.875rem] leading-relaxed text-[var(--ink-2)]'>{f.what}</span>
										</span>
									</li>
								))}
							</ul>
						) : null}
					</Part>

					{/* ---- Safety ---- */}
					<Part id='safety' icon={ShieldWarningIcon} title='Safety'>
						<div className='dv-panel dv-panel-warn'>
							<p className='text-[1rem] leading-relaxed text-[var(--ink-2)]'>{area.safety}</p>
						</div>
					</Part>

					{/* ---- The trips the guide has written ---- */}
					{trips.length ? (
						<Part id='trips' icon={MapTrifoldIcon} title='Trips' lede='Routes the guide has written through this area.'>
							{/* One trip to a row, at the full width (user decision). */}
							<div className='grid gap-4'>
								{trips.map((t) => (
									<div key={t.slug} className='dv-panel'>
										<p className='text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[var(--accent)]'>{t.nights}</p>
										<p className='mt-1 font-[family-name:var(--font-display)] text-[1.125rem] font-bold text-[var(--ink)]'>{t.name}</p>
										<p className='mt-1 text-[0.875rem] text-[var(--ink-3)]'>{t.forWhom}</p>
										<ol className='mt-4 space-y-2 text-[0.875rem] leading-snug text-[var(--ink-2)]'>
											{t.days.map((d) => (
												<li key={d.label}>
													<span className='font-semibold text-[var(--ink)]'>{d.label}</span> · {d.where}: {d.what}
												</li>
											))}
										</ol>
										<p className='mt-4 border-t border-[var(--rule)] pt-3 text-[0.8125rem] text-[var(--ink-3)]'>Watch for: {t.watchFor}</p>
									</div>
								))}
							</div>
						</Part>
					) : null}

					{/* ---- The other guides ---- */}
					<div className='mt-6 border-t border-[var(--rule)] pt-10'>
						<p className='text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>Other travel guides</p>
						<div className='mt-4 flex flex-wrap gap-2'>
							{travelAreas
								.filter((a) => a.slug !== slug)
								.map((a) => (
									<Link key={a.slug} href={`/guide/${a.slug}`} className='dv-pill'>
										{a.name}
										<ArrowRightIcon size={14} weight='bold' className='text-[var(--ink-mute)]' aria-hidden='true' />
									</Link>
								))}
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
