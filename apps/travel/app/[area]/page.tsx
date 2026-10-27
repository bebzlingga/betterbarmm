import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GUIDE_PAGES, TOWN_PAGES } from '../_lib/guide'


/** A place to stay's name with the words every hotel shares taken out, so two spellings of one hotel match. */
const stayKey = (name: string) =>
	name
		.toLowerCase()
		.replace(/&/g, 'and')
		.replace(/\b(the|hotel|suites?|and|restaurant|convention|center|centre|cotabato|city)\b/g, '')
		.replace(/[^a-z0-9]/g, '')
import { areaHref, findProvince } from '@betterbarmm/lgu-data'
import {
	festivalsForArea,
	findTravelArea,
	itinerariesForArea,
	legsForArea,
	lguForArea,
	lodgingCaveat,
	lodgingForArea,
	townsInArea,
	travelAreas,
} from '@betterbarmm/travel-data'
import { explorePlaces, staysInArea } from '@betterbarmm/travel-data/explore'
import type { Icon } from '@phosphor-icons/react'
import {
	AirplaneTiltIcon,
	ArrowRightIcon,
	BusIcon,
	CarIcon,
	FirstAidIcon,
	InfoIcon,
	MoneyIcon,
	ShieldCheckIcon,
	TShirtIcon,
	WifiHighIcon,
	CalendarCheckIcon,
	ForkKnifeIcon,
	NavigationArrowIcon,
	PathIcon,
	ShieldWarningIcon,
	SignpostIcon,
	SunHorizonIcon,
	TranslateIcon,
} from '@phosphor-icons/react/ssr'
import { WayList } from '../_components/travel-parts'
import { cityGuide, type CityPlace } from '@betterbarmm/travel-data/cities'
import Image from 'next/image'
import { photosForArea } from '../_lib/media'
import { cotabatoPhotos } from '../_lib/city-photos'
import { ExploreCard } from '../_components/explore-card'
import { StayCard } from '../_components/stay-card'
import { toCard } from '../_lib/cards'

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


	const lodging = lodgingForArea(area.slug)
	const province = lguForArea(area)
	const directoryProvince = findProvince(area.slug)
	// A city with a full guide (Cotabato City) uses this same page (user decision); its lists fill the sections below.
	const guide = cityGuide(area.slug)
	// The area's festivals, less any the city guide already lists among its events.
	const guideEvents = new Set((guide?.events ?? []).map((event) => event.name.toLowerCase()))
	const areaFestivals = festivalsForArea(area.slug).filter((festival) => festival.area !== 'region' && !guideEvents.has(festival.name.toLowerCase()))
	// The header photograph: the area's lead, except where its city guide holds a better one for the purpose (Cotabato
	// City's lead is the Government Center at night, too dark to carry the title; the guide's aerial view is not).
	const lead = (guide ? cotabatoPhotos.drone : undefined) ?? photosForArea(area.slug)[0]
	const routes = itinerariesForArea(area.slug)
	const towns = townsInArea(area.slug)
	const areaLegs = legsForArea(area.slug)
	const firstLeg = areaLegs[0]
	const things = explorePlaces.filter((p) => p.area === area.slug).map(toCard)
	const stays = staysInArea(area.slug)
	const shownStays = new Set(stays.map((stay) => stayKey(stay.name)))
	// The city guide's further places to stay: only those it found open — listed on a booking site or with an active page
	// when it was compiled — since several of the others have closed (user decision). Names are compared loosely, so
	// "The Paragon Hotel & Restaurant" is not listed again beside the card for "Paragon Hotel and Restaurant".
	const moreStays = (guide?.stay ?? []).filter((place) => place.status === 'open' && !shownStays.has(stayKey(place.name)))
	// The season's first sentence is the answer; the rest of it is in the section below.
	const bestTime = area.whenToGo.split(/(?<=\.)\s/)[0]!


	return (
		<>
			{/* The header on the area's own photograph (user decision); where the guide holds none, the dark ground alone. */}
			<header className='relative isolate overflow-hidden bg-[#1c1a17] text-white'>
				{lead ? (
					<Image src={lead.src} alt={lead.alt} fill priority sizes='100vw' placeholder='blur' className='-z-10 object-cover' />
				) : null}
				<span aria-hidden='true' className='absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(12,10,8,0.92)_0%,rgba(12,10,8,0.6)_50%,rgba(12,10,8,0.25)_100%)]' />
				<div className='bb-container flex min-h-[clamp(20rem,42vw,30rem)] flex-col justify-end pb-10 pt-24 lg:pb-12'>
					<p className='!font-[family-name:var(--font-display)] text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[#f1c453]'>Area guide</p>
					<h1 className='bb-display-md mt-3 text-white'>{area.name}</h1>
					<p className='mt-4 max-w-2xl text-[1rem] leading-7 text-white/85'>{area.tagline}</p>

				</div>
				{lead ? (
					<a href={lead.source} target='_blank' rel='noreferrer' className='absolute bottom-3 right-4 text-[0.6875rem] text-white/60 hover:text-white'>
						{lead.credit} · {lead.license}
					</a>
				) : null}
			</header>

			{/* ---- The three things a visitor asks first, under the photograph (user decision), in place of the section bar ---- */}
			<div className='border-b border-[var(--rule)]'>
				<dl className='bb-container flex flex-wrap gap-x-16 gap-y-6 py-7'>
					{/* How most visitors arrive: the area's first journey leg, or its first way in where it has none. */}
					<Fact icon={NavigationArrowIcon} label='Getting there'>
						{firstLeg ? (
							<>
								{firstLeg.from} → {firstLeg.to}
								<span className='block text-[0.78125rem] text-[var(--ink-3)]'>
									By {firstLeg.mode === 'air' ? 'air' : firstLeg.mode === 'sea' ? 'sea' : 'road'}, {firstLeg.duration.charAt(0).toLowerCase() + firstLeg.duration.slice(1)}
								</span>
							</>
						) : (
							<span className='block max-w-[24rem]'>{area.gettingThere[0]?.split(/(?<=\.)\s/)[0]}</span>
						)}
					</Fact>
					<Fact icon={SunHorizonIcon} label='Best time'>
						<span className='block max-w-[24rem]'>{bestTime}</span>
					</Fact>
					<Fact icon={TranslateIcon} label='Languages'>
						{area.languages.join(', ')}
						<span className='block text-[0.78125rem] text-[var(--ink-3)]'>Filipino and English widely understood</span>
					</Fact>
				</dl>
			</div>

			<div className='bb-container pb-20'>
				{/* ---- Overview: the picture, three facts, what the place is ---- */}
				<AreaSection id='overview' first>

					{/* All of it, at the full width (user decision: no "read more"). */}
					<div className='bb-prose !max-w-none'>
						{area.intro.map((paragraph, index) => (
							<p key={paragraph.slice(0, 40)} className={index === 0 ? 'bb-dropcap' : undefined}>
								{paragraph}
							</p>
						))}
					</div>
				</AreaSection>

				{/* ---- Things to do: the places, as the Explore cards ---- */}
				{things.length ? (
					<AreaSection
						id='things-to-do'
						title='Things to do'
						lede={`${things.length} ${things.length === 1 ? 'place' : 'places'} to see in ${area.name}.`}
						aside={
							things.length > 8 ? (
								<Link href={`/?area=${area.slug}`} className='rule-link text-[0.84375rem] font-semibold text-[var(--ink)]'>
									See all {things.length}
								</Link>
							) : null
						}
					>
						<div className='grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-[48px]'>
							{things.slice(0, 8).map((place) => (
								<ExploreCard key={place.slug} place={place} />
							))}
						</div>
					</AreaSection>
				) : null}

				{/* ---- Getting there and around ---- */}
				<AreaSection id='getting-there' title='Getting there and around'>
					<div className='grid gap-12 lg:grid-cols-2 lg:gap-14'>
						<WayList label='Getting there' icon={NavigationArrowIcon} items={area.gettingThere} />
						<WayList label='Getting around' icon={SignpostIcon} items={area.gettingAround} />
					</div>
					{areaLegs.length ? (
						<div className='mt-12'>
							<p className='bb-label'>How long it takes</p>
							<dl className='mt-4 grid gap-x-14 sm:grid-cols-2'>
								{areaLegs.map((leg) => (
									<div key={`${leg.from}-${leg.to}-${leg.mode}`} className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2'>
										<dt className='text-[0.875rem] text-[var(--ink-2)]'>
											{leg.from} → {leg.to}
											<span className='ml-2 font-mono text-[0.59375rem] uppercase tracking-[0.14em] text-[var(--brass)]'>{leg.mode}</span>
										</dt>
										<dd className='text-[0.84375rem] text-[var(--ink-3)]'>{leg.duration}</dd>
									</div>
								))}
							</dl>
						</div>
					) : null}
				</AreaSection>

				{/* ---- Where to stay: the places by name, then the short version of how it works ---- */}
				{stays.length || lodging || moreStays.length ? (
					<AreaSection id='where-to-stay' title='Where to stay' lede={lodging?.booking}>
						{stays.length ? (
							<ul className='grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-[48px]'>
								{stays.map((stay) => (
									<StayCard key={stay.name} stay={stay} />
								))}
							</ul>
						) : null}
						{moreStays.length ? (
							<div className='mt-12'>
								<h3 className='font-[family-name:var(--font-display)] text-[1.125rem] font-extrabold tracking-[-0.015em] text-[var(--ink)]'>
									{moreStays.length} more places to stay
								</h3>
								<p className='mt-1.5 text-[0.84375rem] text-[var(--ink-3)]'>
									Listed on a booking site or with an active page of their own as of {guide ? new Date(guide.generatedAt).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) : 'the last check'}. Confirm before you go.
								</p>
								<CityList items={moreStays} />
							</div>
						) : null}
						{lodging ? (
							<div className='mt-14'>
								<h3 className='font-[family-name:var(--font-display)] text-[1.125rem] font-extrabold tracking-[-0.015em] text-[var(--ink)]'>How lodging works in {area.name}</h3>
								<div className='bb-prose mt-4 !max-w-none'>
									{lodging.situation.map((paragraph) => (
										<p key={paragraph.slice(0, 40)}>{paragraph}</p>
									))}
									<h3>What to expect</h3>
									<ul>
										{lodging.expect.map((item) => (
											<li key={item}>{item}</li>
										))}
									</ul>
									<h3>When it fills up</h3>
									<p>{lodging.fillsUp}</p>
									<p className='text-[0.875rem] text-[var(--ink-3)]'>{lodgingCaveat}</p>
								</div>
							</div>
						) : null}
					</AreaSection>
				) : null}

				{/* ---- Where to eat: the city guide's dishes and places ---- */}
				{guide?.eat.length ? (
					<AreaSection id='where-to-eat' title='Where to eat' lede={`${guide.eat.length} places to eat in ${area.name}, and the dishes to look for.`}>
						{guide.dishes.length ? (
							<div className='grid gap-x-12 gap-y-6 sm:grid-cols-2 lg:grid-cols-3'>
								{guide.dishes.map((dish) => (
									<div key={dish.name}>
										<h3 className='flex items-center gap-2.5 font-[family-name:var(--font-display)] text-[1rem] font-extrabold tracking-[-0.015em] text-[var(--ink)]'>
											<ForkKnifeIcon size={18} weight='duotone' className='text-[var(--brass)]' aria-hidden='true' />
											{dish.name}
										</h3>
										<p className='mt-1.5 text-[0.875rem] leading-[1.65] text-[var(--ink-2)]'>{dish.note}</p>
										{dish.whereToTry.length ? <p className='mt-1 text-[0.8125rem] text-[var(--ink-3)]'>Try it at {dish.whereToTry.join(', ')}</p> : null}
									</div>
								))}
							</div>
						) : null}
						<div className={guide.dishes.length ? 'mt-14' : ''}>
							<h3 className='font-[family-name:var(--font-display)] text-[1.125rem] font-extrabold tracking-[-0.015em] text-[var(--ink)]'>Places to eat</h3>
							<CityList items={guide.eat} />
						</div>
					</AreaSection>
				) : null}

				{/* ---- Before you go: safety, the calendar, a suggested route ---- */}
				<AreaSection id='before-you-go' title='Before you go'>
					{/* A row each, as Good to know (user decision): the topic and its icon on the left, the detail beside it. */}
					<div className='grid gap-y-8'>
						<div className='grid gap-x-12 gap-y-2 md:grid-cols-[16rem_minmax(0,1fr)]'>
							<h3 className='flex items-start gap-2.5 font-[family-name:var(--font-display)] text-[1.0625rem] font-extrabold tracking-[-0.015em] text-[var(--ink)]'>
								<ShieldWarningIcon size={20} weight='duotone' className='mt-0.5 text-[var(--accent)]' aria-hidden='true' />
								Safety
							</h3>
							<div>
								<p className='text-[0.9375rem] leading-[1.7] text-[var(--ink-2)]'>{area.safety}</p>
							</div>
						</div>
						<div className='grid gap-x-12 gap-y-2 md:grid-cols-[16rem_minmax(0,1fr)]'>
							<h3 className='flex items-start gap-2.5 font-[family-name:var(--font-display)] text-[1.0625rem] font-extrabold tracking-[-0.015em] text-[var(--ink)]'>
								<CalendarCheckIcon size={20} weight='duotone' className='mt-0.5 text-[var(--accent)]' aria-hidden='true' />
								When to go
							</h3>
							<div>
								<p className='text-[0.9375rem] leading-[1.7] text-[var(--ink-2)]'>{area.whenToGo}</p>
								{guide?.events.map((event) => (
									<p key={event.name} className='mt-3 text-[0.875rem] leading-[1.7] text-[var(--ink-2)]'>
										<strong className='font-semibold text-[var(--ink)]'>{event.name}</strong>
										<span className='text-[var(--ink-3)]'> · {event.when}.</span> {event.note}
									</p>
								))}
								{areaFestivals.map((festival) => (
									<p key={festival.name} className='mt-3 text-[0.875rem] leading-[1.7] text-[var(--ink-2)]'>
										<strong className='font-semibold text-[var(--ink)]'>{festival.name}</strong>
										<span className='text-[var(--ink-3)]'> · {festival.when}.</span> {festival.what}
									</p>
								))}
							</div>
						</div>
						{routes.length ? (
							<div className='grid gap-x-12 gap-y-2 md:grid-cols-[16rem_minmax(0,1fr)]'>
								<h3 className='flex items-start gap-2.5 font-[family-name:var(--font-display)] text-[1.0625rem] font-extrabold tracking-[-0.015em] text-[var(--ink)]'>
									<PathIcon size={20} weight='duotone' className='mt-0.5 text-[var(--accent)]' aria-hidden='true' />
									{routes.length === 1 ? 'A route through here' : 'Routes through here'}
								</h3>
								<div>
									{routes.map((route, index) => (
										<div key={route.slug} className={index ? 'mt-5' : ''}>
											{GUIDE_PAGES ? (
												<Link href={`/routes#${route.slug}`} className='font-semibold text-[var(--ink)] rule-link'>
													{route.name}
												</Link>
											) : (
												<p className='text-[0.9375rem] font-semibold text-[var(--ink)]'>{route.name}</p>
											)}
											<p className='mt-0.5 text-[0.8125rem] text-[var(--ink-3)]'>
												{route.nights}, based in {route.base}
											</p>
											<p className='mt-1.5 text-[0.875rem] leading-[1.7] text-[var(--ink-2)]'>{route.forWhom}</p>
										</div>
									))}
								</div>
							</div>
						) : null}
					</div>
				</AreaSection>

				{/* ---- Good to know: the city guide's practical tips ---- */}
				{guide?.practical.length ? (
					<AreaSection id='good-to-know' title='Good to know'>
						{/* A row each (user decision): the topic and its icon on the left, the tip beside it. */}
						<div className='grid gap-y-8'>
							{guide.practical.map((tip) => {
								const TipIcon = tipIcon(tip.topic)
								return (
								<div key={tip.topic + tip.text.slice(0, 20)} className='grid gap-x-12 gap-y-2 md:grid-cols-[16rem_minmax(0,1fr)]'>
									<h3 className='flex items-start gap-2.5 font-[family-name:var(--font-display)] text-[1rem] font-extrabold tracking-[-0.015em] text-[var(--ink)]'>
										<TipIcon size={20} weight='duotone' className='mt-0.5 shrink-0 text-[var(--accent)]' aria-hidden='true' />
										{tip.topic}
									</h3>
									<p className='max-w-[60rem] text-[0.9375rem] leading-[1.7] text-[var(--ink-2)]'>{tip.text}</p>
								</div>
								)
							})}
						</div>
					</AreaSection>
				) : null}

				{/* ---- Town by town ---- */}
				{towns.length ? (
					<AreaSection
						id='towns'
						title='Town by town'
						lede={`${towns.length} ${towns.length === 1 ? 'city or municipality' : 'cities and municipalities'}${TOWN_PAGES ? ', each with its own guide' : ''}.`}
						aside={
							province && directoryProvince ? (
								<a href={`https://lgu.betterbarmm.com${areaHref(directoryProvince)}`} className='rule-link inline-flex items-center gap-1.5 text-[0.84375rem] font-semibold text-[var(--ink)]'>
									Population and officials
									<ArrowRightIcon size={13} weight='bold' aria-hidden='true' />
								</a>
							) : null
						}
					>
						<ul className='grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3'>
							{towns.map(({ unit, town }) => (
								<li key={unit.slug}>
									{TOWN_PAGES ? (
										<Link href={`/${area.slug}/${unit.slug}`} className='group flex items-baseline justify-between gap-3 py-3'>
											<span className='text-[0.9375rem] font-semibold text-[var(--ink)] transition group-hover:text-[var(--accent)]'>{unit.name}</span>
											<span className='shrink-0 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--ink-3)]'>
												{!town ? 'Not yet researched' : town.coverage === 'none' ? 'Little online' : `${town.whereToGo.length} ${town.whereToGo.length === 1 ? 'place' : 'places'} · ${town.stay.length} ${town.stay.length === 1 ? 'stay' : 'stays'}`}
											</span>
										</Link>
									) : (
										<div className='flex items-baseline justify-between gap-3 py-3'>
											<span className='text-[0.9375rem] font-semibold text-[var(--ink)]'>{unit.name}</span>
											<span className='shrink-0 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--ink-3)]'>
												{!town ? 'Not yet researched' : town.coverage === 'none' ? 'Little online' : `${town.whereToGo.length} ${town.whereToGo.length === 1 ? 'place' : 'places'} · ${town.stay.length} ${town.stay.length === 1 ? 'stay' : 'stays'}`}
											</span>
										</div>
									)}
								</li>
							))}
						</ul>
					</AreaSection>
				) : null}
			</div>
		</>
	)
}

/** One section of an area page: an anchor for the bar above, a heading and a line under it, and what it holds. */
function AreaSection({
	id,
	title,
	lede,
	aside,
	first = false,
	children,
}: {
	id: string
	title?: string
	lede?: string
	aside?: React.ReactNode
	first?: boolean
	children: React.ReactNode
}) {
	return (
		<section id={id} className={`scroll-mt-[calc(var(--sticky-top,0px)+1.5rem)] ${first ? 'pt-14 lg:pt-16' : 'mt-16 border-t border-[var(--rule)] pt-14'}`}>
			{title ? (
				<div className='mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-2'>
					<div>
						<h2 className='font-[family-name:var(--font-display)] text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>{title}</h2>
						{lede ? <p className='mt-2 max-w-[52rem] text-[0.9375rem] leading-7 text-[var(--ink-3)]'>{lede}</p> : null}
					</div>
					{aside}
				</div>
			) : null}
			{children}
		</section>
	)
}

/** A fact in the row under the header: an icon, its label, its value. */
function Fact({ icon: Glyph, label, children }: { icon: Icon; label: string; children: React.ReactNode }) {
	return (
		<div className='flex gap-3.5'>
			<Glyph size={24} weight='duotone' className='mt-0.5 shrink-0 text-[var(--brass)]' aria-hidden='true' />
			<div>
				<dt className='tv-kind'>{label}</dt>
				<dd className='mt-1 text-[0.9375rem] leading-snug text-[var(--ink)]'>{children}</dd>
			</div>
		</div>
	)
}

/** A city guide's places as a compact list: the name, its kind and street, and the note from its source. */
function CityList({ items }: { items: CityPlace[] }) {
	return (
		<ul className='mt-5 grid gap-x-12 gap-y-2 sm:grid-cols-2 lg:grid-cols-3'>
			{items.map((item) => (
				<li key={item.id} className='py-3'>
					<p className='!font-[family-name:var(--font-display)] text-[0.9375rem] font-extrabold leading-snug tracking-[-0.015em] text-[var(--ink)]'>
						{item.website ? (
							<a href={item.website} target='_blank' rel='noreferrer' className='hover:text-[var(--accent)]'>
								{item.name}
							</a>
						) : (
							item.name
						)}
					</p>
					<p className='mt-0.5 font-mono text-[0.59375rem] uppercase tracking-[0.12em] text-[var(--brass)]'>
						{item.kind}
						{item.halal ? ' · halal' : ''}
					</p>
					{item.area ? <p className='mt-1 text-[0.78125rem] text-[var(--ink-3)]'>{item.area}</p> : null}
					<p className='mt-1.5 text-[0.84375rem] leading-[1.6] text-[var(--ink-2)]'>{item.note}</p>
				</li>
			))}
		</ul>
	)
}

/** A practical tip's icon, read off its topic. */
const TIP_ICONS: [RegExp, Icon][] = [
	[/air/i, AirplaneTiltIcon],
	[/road/i, CarIcon],
	[/around|transport/i, BusIcon],
	[/money|cash|atm/i, MoneyIcon],
	[/connect|signal|sim|internet/i, WifiHighIcon],
	[/dress|conduct|manner/i, TShirtIcon],
	[/safety|checkpoint/i, ShieldCheckIcon],
	[/emergenc|hospital|health/i, FirstAidIcon],
]
const tipIcon = (topic: string): Icon => TIP_ICONS.find(([pattern]) => pattern.test(topic))?.[1] ?? InfoIcon

