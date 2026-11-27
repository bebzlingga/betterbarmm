import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Skeleton, SkeletonLine } from '@betterbarmm/editorial'
import { legsForArea, travelAreas } from '@betterbarmm/travel-data'
import { EXPLORE_KINDS, exploreEats, explorePlaces } from '@betterbarmm/travel-data/explore'
import { AirplaneTiltIcon, ArrowRightIcon, BedIcon, BoatIcon, CalendarCheckIcon, CarIcon, ForkKnifeIcon, PathIcon, SunHorizonIcon, CompassIcon as CompassIconSsr } from '@phosphor-icons/react/ssr'
import { Explorer } from './_components/explorer'
import { PageHero, heroFromPlace, type HeroPhoto } from './_components/page-hero'
import { Rail } from './_components/rail'
import { StayCard } from './_components/stay-card'
import { SectionHead } from './_components/travel-parts'
import { toCard } from './_lib/cards'
import { commonsThumb } from './_lib/commons'
import { DESTINATIONS } from './_lib/discover'
import { GUIDE_PAGES } from './_lib/guide'

export const metadata: Metadata = {
	title: 'Travel & Places',
	description:
		'Islands, beaches, mosques, lakes, falls and heritage sites across the Bangsamoro, with photographs, what to do and eat, how to get there and what to know first.',
}

/* ============================================================
   Travel & Places: the front page is the places (user decision)

   Browsed the way stays are browsed — a search, a row of categories,
   photo cards — in the Discover look (user decision): the region's
   photographs turning under the navigation, rounded cards, chips.
   Under it, the guide's practical half, the areas as photo cards, and
   the line every page here has to carry: this is written, not an
   official record.
   ============================================================ */

const PLAN = [
	{ href: '/routes', label: 'Getting around', note: 'Flights, ferries and roads between the areas', icon: PathIcon },
	{ href: '/stays', label: 'Where to sleep', note: 'Where lodging actually exists, area by area', icon: BedIcon },
	{ href: '/food', label: 'What to eat', note: 'Maranao, Maguindanaon, Tausug and Sama dishes', icon: ForkKnifeIcon },
	{ href: '/plan', label: 'Plan a trip', note: 'Permits, dress, prayer times, festivals, safety', icon: CalendarCheckIcon },
]

const GETTING_HERE = [
	{ href: '/flights', label: 'Flights', note: 'Into Cotabato and Tawi-Tawi, or the cities next door, with a fare search for every route', icon: AirplaneTiltIcon },
	{ href: '/ferries', label: 'Ferries & boats', note: 'Zamboanga to Basilan, Jolo and Bongao, between the islands, and across to Sabah', icon: BoatIcon },
]

/** The header's photographs (four at most, as the turning is timed): wide and sharp enough for the full width. */
const HERO_SHOTS: [string, number][] = [
	['panampangan-island', 0],
	['lake-lanao', 1],
	['grand-mosque-cotabato', 0],
	['malamawi-island', 0],
]

const HERO = {
	kicker: 'Travel & Places',
	title: 'Places worth the journey',
	lede: `${explorePlaces.length} islands, beaches, mosques, lakes, falls and heritage sites across the seven areas, each with what to do, what to eat, how to get there and what to know first.`,
}

/** The explorer's own shape while it hydrates: the header (static) with the search in grey, the chips, the cards. */
function ExplorerSkeleton({ photos }: { photos: (HeroPhoto | null)[] }) {
	return (
		<div role='status' aria-busy='true'>
			<span className='sr-only'>Loading places…</span>
			<PageHero photos={photos} kicker={HERO.kicker} title={HERO.title} lede={HERO.lede} center>
				<Skeleton className='mx-auto mt-9 h-16 w-full max-w-2xl rounded-full' />
			</PageHero>
			<div className='border-b border-[var(--rule)]'>
				<div className='bb-container flex gap-7 overflow-hidden pb-3 pt-4 lg:justify-center'>
					{Array.from({ length: 13 }, (_, i) => (
						<div key={i} className='flex shrink-0 flex-col items-center gap-2'>
							<Skeleton className='size-[22px]' />
							<SkeletonLine className='font-[family-name:var(--font-display)] text-[0.59375rem] uppercase' width='3rem' />
						</div>
					))}
				</div>
			</div>
			<div className='bb-container pb-24 pt-14 lg:pt-16'>
				<div className='grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-[48px] lg:gap-y-14 xl:grid-cols-4'>
					{Array.from({ length: 8 }, (_, i) => (
						<div key={i}>
							<Skeleton className='aspect-[4/3] w-full rounded-[1.25rem]' />
							<div className='pt-4'>
								<SkeletonLine className='tv-kind' width='55%' />
								<SkeletonLine className='mt-1.5 text-[1.0625rem] leading-snug' width='80%' />
								<SkeletonLine className='mt-1 text-[0.84375rem] leading-[1.55]' width='95%' />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default function TravelHome() {
	const places = explorePlaces.map(toCard)
	// Places to eat for the front page's row: one from each area first, photographed ones first.
	const byPhoto = [...exploreEats].sort((a, b) => Number(!!b.image) - Number(!!a.image))
	const firstOfArea = byPhoto.filter((eat) => byPhoto.find((other) => other.area === eat.area) === eat)
	const eatsShown = [...new Set([...firstOfArea, ...byPhoto])].slice(0, 10)
	const areas = travelAreas.map((area) => ({ slug: area.slug, name: area.name }))
	const photos = HERO_SHOTS.map(([slug, image]) => heroFromPlace(explorePlaces.find((p) => p.slug === slug), image))

	return (
		<>
			{/* The explorer reads its filters from the address bar, so it waits on a Suspense boundary. */}
			<Suspense fallback={<ExplorerSkeleton photos={photos} />}>
				<Explorer hero={HERO} photos={photos} places={places} areas={areas} kinds={EXPLORE_KINDS.map(({ key, label }) => ({ key, label }))} />
			</Suspense>

			{/* ---- The practical half, on the warm wash ---- */}
			<div className='tv-wash'>
				{GUIDE_PAGES ? (
					<section className='dv-section bb-container'>
						<SectionHead title='Plan the trip,' titleMuted='before you go.' />
						<div className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
							{PLAN.map(({ href, label, note, icon: Glyph }) => (
								<Link key={href} href={href} className='tv-card group'>
									<Glyph size={26} weight='duotone' className='text-[var(--accent)]' aria-hidden='true' />
									<span className='mt-4 block font-[family-name:var(--font-display)] text-[1.0625rem] font-bold tracking-[-0.02em] text-[var(--ink)]'>{label}</span>
									<span className='mt-1 block text-[0.875rem] leading-snug text-[var(--ink-3)]'>{note}</span>
								</Link>
							))}
						</div>
					</section>
				) : null}

				{/* Getting here (user decision: a full travel site, flights included): the two ways in, each its own page. The row
				    under it brings its own padding, so this section has none at its foot. */}
				<section className='dv-section bb-container !pb-0'>
					<SectionHead title='Getting here' lead='By air into Cotabato or Tawi-Tawi, or by sea from Zamboanga and between the islands.' />
					<div className='mt-8 grid gap-4 sm:grid-cols-2'>
						{GETTING_HERE.map(({ href, label, note, icon: Glyph }) => (
							<Link key={href} href={href} className='tv-card group !flex-row items-center gap-5'>
								<span className='grid size-14 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'>
									<Glyph size={28} weight='duotone' aria-hidden='true' />
								</span>
								<span className='min-w-0 flex-1'>
									<span className='block font-[family-name:var(--font-display)] text-[1.25rem] font-bold tracking-[-0.02em] text-[var(--ink)]'>{label}</span>
									<span className='mt-1 block text-[0.875rem] leading-snug text-[var(--ink-3)]'>{note}</span>
								</span>
								<ArrowRightIcon size={18} weight='bold' className='shrink-0 text-[var(--ink-3)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)]' aria-hidden='true' />
							</Link>
						))}
					</div>
					{/* A travel guide for each area (user decision). */}
					<p className='mt-10 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>Travel guides, area by area</p>
					<div className='mt-4 flex flex-wrap gap-2'>
						{travelAreas.map((a) => (
							<Link key={a.slug} href={`/guide/${a.slug}`} className='dv-pill bg-[var(--paper)]'>
								<CompassIconSsr size={16} weight='duotone' className='text-[var(--accent)]' aria-hidden='true' />
								{a.name}
							</Link>
						))}
					</div>
					{/* The rule closing the section, at the content's width (user decision), above the row that follows. */}
					<div aria-hidden='true' className='mt-[clamp(4.5rem,9vw,8rem)] border-t border-[var(--rule)]' />
				</section>

				{/* Halal places to eat (user decision): a row here, the rest on their own page. */}
				{eatsShown.length ? (
					<Rail title='Where to eat' lede={`Halal kitchens, cafés and bakeries across the region; all ${exploreEats.length} are on their own page.`}>
						{eatsShown.map((eat) => (
							<ul key={eat.name} className='dv-rail-item'>
								<StayCard stay={eat} />
							</ul>
						))}
						<Link href='/eat' className='dv-card group !aspect-auto flex w-[min(80vw,19rem)] flex-col justify-center rounded-[1.25rem] border border-[var(--rule)] bg-[var(--paper)] p-8'>
							<span className='font-[family-name:var(--font-display)] text-[1.25rem] font-bold text-[var(--ink)]'>All {exploreEats.length} places to eat</span>
							<span className='mt-1 text-[0.875rem] text-[var(--ink-3)]'>Area by area</span>
							<ArrowRightIcon size={22} weight='bold' className='mt-5 text-[var(--ink)] transition group-hover:translate-x-1' aria-hidden='true' />
						</Link>
					</Rail>
				) : null}
			</div>

			{/* ---- The seven areas, as photo cards ---- */}
			<section className='dv-section bb-container'>
				<SectionHead title='Where to go, area by area' lead='Seven areas that share a government and little else about the mechanics of getting there.' />
				{/* The seven areas as tall photo panels (user decision): the one under the pointer, or the first, opens wide with
				    what the area is, how much is here, how to get in and when to go; the rest stand as strips named up their side.
				    Below a wide screen they stack, every one open. */}
				<div className='tv-accordion mt-10'>
					{travelAreas.map((area, i) => {
						const own = explorePlaces.filter((p) => p.area === area.slug)
						const cover = own.find((p) => p.images.length)?.images[0]
						const leg = legsForArea(area.slug)[0]
						const Way = leg?.mode === 'air' ? AirplaneTiltIcon : leg?.mode === 'sea' ? BoatIcon : CarIcon
						const destination = DESTINATIONS.some((d) => d.slug === area.slug)
						const best = area.whenToGo.split(/(?<=\.)\s/)[0]
						return (
							<Link key={area.slug} href={destination ? `/discover/${area.slug}` : `/${area.slug}`} className='tv-panel group'>
								{cover ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img decoding='async' src={commonsThumb(cover.url, 960, cover.width)} alt='' loading='lazy' className='tv-panel-img' />
								) : null}
								<span aria-hidden='true' className='tv-panel-shade' />
								<span aria-hidden='true' className='tv-panel-num'>{String(i + 1).padStart(2, '0')}</span>
								{/* Shut: the name up the strip. */}
								<span aria-hidden='true' className='tv-panel-spine'>
									{area.name}
								</span>
								{/* Open: everything. */}
								<span className='tv-panel-body'>
									<span className='flex flex-wrap gap-2'>
										<span className='dv-chip'>
											{own.length} {own.length === 1 ? 'place' : 'places'}
										</span>
										{leg ? (
											<span className='dv-chip'>
												<Way size={13} weight='bold' aria-hidden='true' />
												{leg.from} → {leg.to}, {leg.duration.split(/[;,(]/)[0]!.trim().toLowerCase()}
											</span>
										) : null}
									</span>
									<span className='mt-4 block font-[family-name:var(--font-display)] text-[clamp(1.75rem,2.6vw,2.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white'>
										{area.name}
									</span>
									<span className='mt-2 block max-w-md text-[0.9375rem] leading-snug text-white/85'>{area.tagline}</span>
									<span className='mt-3 flex max-w-md items-start gap-2 text-[0.8125rem] leading-snug text-white/70'>
										<SunHorizonIcon size={16} weight='duotone' className='mt-px shrink-0 text-[#f1c453]' aria-hidden='true' />
										{best}
									</span>
									<span className='mt-5 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-white'>
										{destination ? 'Discover' : 'The area guide'}
										<ArrowRightIcon size={15} weight='bold' className='transition group-hover:translate-x-1' aria-hidden='true' />
									</span>
								</span>
							</Link>
						)
					})}
				</div>

				{/* The line every page here has to carry. Full width (user decision). */}
				<p className='mt-16 border-t border-[var(--rule)] pt-6 text-[0.8125rem] leading-[1.7] text-[var(--ink-3)]'>
					This guide is written, not an official record: places, food and practicalities described from general knowledge
					of the region and checked against its sources, with no invented prices, ratings or hours. Several foreign
					governments advise against travel to parts or all of the Bangsamoro; each place says what applies to it. Check
					locally before you go. Photographs are free-licence files from Wikimedia Commons, credited on each picture.
				</p>
			</section>
		</>
	)
}
