import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Skeleton, SkeletonLine } from '@betterbarmm/editorial'
import { legsForArea, travelAreas } from '@betterbarmm/travel-data'
import { EXPLORE_KINDS, explorePlaces } from '@betterbarmm/travel-data/explore'
import { AirplaneTiltIcon, ArrowRightIcon, BedIcon, BoatIcon, CalendarCheckIcon, CarIcon, ForkKnifeIcon, ImagesIcon, PathIcon, SunHorizonIcon } from '@phosphor-icons/react/ssr'
import Image from 'next/image'
import { Explorer } from './_components/explorer'
import { SectionHead } from './_components/travel-parts'
import { toCard } from './_lib/cards'
import { photosForArea } from './_lib/media'
import { GUIDE_PAGES } from './_lib/guide'

export const metadata: Metadata = {
	title: 'Travel & Places',
	description:
		'Islands, beaches, mosques, lakes, falls and heritage sites across the Bangsamoro, with photographs, what to do and eat, how to get there and what to know first.',
}

/* ============================================================
   Travel & Places: the front page is the places (user decision)

   Browsed the way stays are browsed — a search, a row of categories,
   photo cards, a map a button away — and drawn in the estate's own
   style (user decision): the crimson masthead, square ruled cards,
   brass capitals, display type. Under it, the guide's practical
   half, and the line every page here has to carry: this is written,
   not an official record.
   ============================================================ */

const PLAN = [
	{ href: '/routes', label: 'Getting around', note: 'Flights, ferries and roads between the areas', icon: PathIcon },
	{ href: '/stays', label: 'Where to sleep', note: 'Where lodging actually exists, area by area', icon: BedIcon },
	{ href: '/food', label: 'What to eat', note: 'Maranao, Maguindanaon, Tausug and Sama dishes', icon: ForkKnifeIcon },
	{ href: '/plan', label: 'Plan a trip', note: 'Permits, dress, prayer times, festivals, safety', icon: CalendarCheckIcon },
]

/** The explorer's own shape while it hydrates: the band with its words (they are static), the field and the
    ways in in grey, the categories, the cards. */
function ExplorerSkeleton({ head }: { head: React.ReactNode }) {
	return (
		<div role='status' aria-busy='true'>
			<span className='sr-only'>Loading places…</span>
			<section className='brand-bg bb-lattice relative overflow-hidden'>
				<div className='bb-container relative py-16 text-center lg:py-24'>
					{head}
					<Skeleton className='mx-auto mt-8 h-14 max-w-2xl' />
					{GUIDE_PAGES ? (
						<div className='mt-6 flex flex-wrap justify-center gap-2'>
							{[7.5, 8, 7, 6.5].map((w) => (
								<Skeleton key={w} className='h-[2.1rem] rounded-full' style={{ width: `${w}rem` }} />
							))}
						</div>
					) : null}
				</div>
			</section>
			<div className='border-b border-[var(--rule)]'>
				<div className='bb-container flex gap-7 overflow-hidden pb-3 pt-4'>
					{Array.from({ length: 13 }, (_, i) => (
						<div key={i} className='flex shrink-0 flex-col items-center gap-2'>
							<Skeleton className='size-[22px]' />
							<SkeletonLine className='font-[family-name:var(--font-display)] text-[0.59375rem] uppercase' width='3rem' />
						</div>
					))}
				</div>
			</div>
			<div className='bb-container pb-20 pt-12 lg:pt-14'>
				<div className='grid grid-cols-1 gap-x-8 gap-y-12 lg:gap-x-[48px] lg:gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
					{Array.from({ length: 8 }, (_, i) => (
						<div key={i}>
							<Skeleton className='aspect-[4/3] w-full' />
							<div className='pt-4'>
								<SkeletonLine className='tv-kind' width='55%' />
								<SkeletonLine className='mt-1.5 text-[1.0625rem] leading-snug' width='80%' />
								<SkeletonLine className='mt-1 text-[0.84375rem] leading-[1.55]' width='95%' />
								<SkeletonLine className='text-[0.84375rem] leading-[1.55]' width='60%' />
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
	const areas = travelAreas.map((area) => ({ slug: area.slug, name: area.name }))
	const head = (
		<>
			<p className='bb-label'>Travel &amp; Places</p>
			<h1 className='bb-display-md mt-4 text-[var(--ink)]'>Places worth the journey</h1>
			<p className='mx-auto mt-4 max-w-xl text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
				{places.length} islands, beaches, mosques, lakes, falls and heritage sites across the seven areas, each with what to do,
				what to eat, how to get there and what to know first.
			</p>
		</>
	)

	return (
		<>
			{/* The explorer reads its filters from the address bar, so it waits on a Suspense boundary. Its header is the
			    directory's (user decision): these words, centred on the brand band, over the search. */}
			<Suspense fallback={<ExplorerSkeleton head={head} />}>
				<Explorer head={head} places={places} areas={areas} kinds={EXPLORE_KINDS.map(({ key, label }) => ({ key, label }))} />
			</Suspense>

			{/* ---- The practical half ---- */}
			<section className='border-t border-[var(--rule)] bg-[var(--paper-2)]'>
				<div className='bb-container py-[clamp(3.75rem,7vw,6.5rem)]'>
					{GUIDE_PAGES ? (
						<>
					<SectionHead title='Plan the trip,' titleMuted='before you go.' />
					<div className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8'>
						{PLAN.map(({ href, label, note, icon: Glyph }) => (
							<Link key={href} href={href} className='tv-card group'>
								<Glyph size={24} className='text-[var(--brass)]' aria-hidden='true' />
								<span className='mt-4 block font-[family-name:var(--font-display)] text-[1rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
									{label}
								</span>
								<span className='mt-1 block text-[0.84375rem] leading-snug text-[var(--ink-3)]'>{note}</span>
							</Link>
						))}
					</div>

						</>
					) : null}

					<SectionHead title='Where to go,' titleMuted='area by area.' className={GUIDE_PAGES ? 'mt-16' : ''} />
					{/* A simple guide to the seven areas (user decision), improved: each row a picture to know it by, what it
					    is and how much the guide holds there, how you get in (by plane, boat or road), and when to go. */}
					<ul className='mt-8 border-t border-[var(--ink)]'>
						{travelAreas.map((area, index) => {
							const leg = legsForArea(area.slug)[0]
							const best = area.whenToGo.split(/(?<=\.)\s/)[0]
							const placesHere = explorePlaces.filter((p) => p.area === area.slug)
							const [lead] = photosForArea(area.slug)
							const Way = leg?.mode === 'air' ? AirplaneTiltIcon : leg?.mode === 'sea' ? BoatIcon : CarIcon
							return (
								<li key={area.slug} className='border-b border-[var(--rule)]'>
									<Link
										href={`/${area.slug}`}
										className='group grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-5 gap-y-4 py-6 lg:grid-cols-[2rem_6rem_minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)_1.25rem] lg:items-center lg:gap-x-8'
									>
										<span className='hidden font-mono text-[0.75rem] font-semibold text-[var(--ink-mute)] lg:block'>{String(index + 1).padStart(2, '0')}</span>
										<span className='relative block aspect-square overflow-hidden bg-[var(--paper-3)] lg:aspect-[4/3]'>
											{lead ? (
												<Image src={lead.src} alt='' fill sizes='6rem' placeholder='blur' className='object-cover transition duration-500 group-hover:scale-[1.05]' />
											) : (
												<span className='flex size-full items-center justify-center text-[var(--ink-mute)]'>
													<ImagesIcon size={22} weight='duotone' aria-hidden='true' />
												</span>
											)}
										</span>
										<span className='min-w-0'>
											<span className='block font-[family-name:var(--font-display)] text-[1.1875rem] font-extrabold tracking-[-0.02em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
												{area.name}
											</span>
											<span className='mt-1 block text-[0.84375rem] leading-[1.5] text-[var(--ink-3)]'>{area.tagline}</span>
											<span className='mt-2 block font-mono text-[0.625rem] uppercase tracking-[0.12em] text-[var(--brass)]'>
												{placesHere.length} {placesHere.length === 1 ? 'place' : 'places'} to see
											</span>
										</span>
										<span className='col-span-2 flex gap-3 lg:col-span-1'>
											<Way size={20} weight='duotone' className='mt-0.5 shrink-0 text-[var(--brass)]' aria-hidden='true' />
											<span className='text-[0.84375rem] leading-[1.5] text-[var(--ink-2)]'>
												<span className='tv-kind block'>Getting there</span>
												{leg ? (
													<>
														{leg.from} → {leg.to}
														<span className='block text-[0.78125rem] text-[var(--ink-3)]'>
															By {leg.mode}, {leg.duration.charAt(0).toLowerCase()}
															{leg.duration.slice(1)}
														</span>
													</>
												) : (
													area.gettingThere[0]?.split(/(?<=\.)\s/)[0]
												)}
											</span>
										</span>
										<span className='col-span-2 flex gap-3 lg:col-span-1'>
											<SunHorizonIcon size={20} weight='duotone' className='mt-0.5 shrink-0 text-[var(--brass)]' aria-hidden='true' />
											<span className='text-[0.84375rem] leading-[1.5] text-[var(--ink-2)]'>
												<span className='tv-kind block'>Best time</span>
												{best}
											</span>
										</span>
										<ArrowRightIcon size={14} weight='bold' className='hidden text-[var(--ink-3)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)] lg:block' aria-hidden='true' />
									</Link>
								</li>
							)
						})}
					</ul>

					{/* The line every page here has to carry. Full width (user decision). */}
					<p className='mt-16 border-t border-[var(--rule)] pt-6 text-[0.8125rem] leading-[1.7] text-[var(--ink-3)]'>
						This guide is written, not an official record: places, food and practicalities described from general knowledge
						of the region and checked against its sources, with no invented prices, ratings or hours. Several foreign
						governments advise against travel to parts or all of the Bangsamoro; each place says what applies to it. Check
						locally before you go. Photographs are free-licence files from Wikimedia Commons, credited on each picture.
					</p>
				</div>
			</section>
		</>
	)
}
