import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { findTravelArea } from '@betterbarmm/travel-data'
import {
	AREA_NAME,
	EXPLORE_KIND_ONE,
	craftsFor,
	explorePlaces,
	findExplorePlace,
	nearbyPlaces,
	staysInArea,
	townFor,
	type ExploreImage,
} from '@betterbarmm/travel-data/explore'
import {
	ArrowSquareOutIcon,
	BedIcon,
	CaretRightIcon,
	CheckCircleIcon,
	ForkKnifeIcon,
	NavigationArrowIcon,
	PathIcon,
	ShieldWarningIcon,
	SunIcon,
	YarnIcon,
} from '@phosphor-icons/react/ssr'
import { ExploreCard, HeartButton, PhotoCredit } from '../../_components/explore-card'
import { TravelMasthead } from '../../_components/travel-parts'
import { KIND_ICON } from '../../_components/kind-icon'
import { PlaceGallery, ShareButton, type GalleryPhoto } from '../../_components/place-gallery'
import { StayCard } from '../../_components/stay-card'
import { toCard } from '../../_lib/cards'
import { GUIDE_PAGES, TOWN_PAGES } from '../../_lib/guide'
import { whereLine } from '../../_lib/where'
import { commonsThumb, cropStyle } from '../../_lib/commons'

/* ============================================================
   One place, laid out as a listing (user decision)

   The photographs first, then two columns: on the left what the
   place is, its highlights, what to do and to eat there, what to know
   before going, where it is and what the text rests on; on the right
   a card that stays in view with the practical half — when to go, how
   to get there, directions, the town guide and where to sleep.

   No booking, price or rating: the card plans a visit, it does not
   sell one.
   ============================================================ */

export function generateStaticParams() {
	return explorePlaces.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const place = findExplorePlace((await params).slug)
	if (!place) return { title: 'Place not found' }
	const image = place.images[0]
	return {
		title: `${place.name} · ${AREA_NAME[place.area]}`,
		description: place.summary,
		alternates: { canonical: `/places/${place.slug}` },
		openGraph: image ? { images: [{ url: commonsThumb(image.url, 1280, image.width) }] } : undefined,
	}
}

/** "langyaw.com" for a source link's label. */
const host = (url: string) => {
	try {
		return new URL(url).hostname.replace(/^www\./, '')
	} catch {
		return url
	}
}

function Divider() {
	return <hr className='my-10 border-[var(--rule)]' />
}

/** A note from the place's text: a title, the detail, and where it comes from. */
function Note({ title, detail, source }: { title: string; detail: string; source: string }) {
	return (
		<li>
			<p className='!font-[family-name:var(--font-display)] text-[0.96875rem] font-bold leading-snug tracking-[-0.01em] text-[var(--ink)]'>{title}</p>
			<p className='mt-1 text-[0.90625rem] leading-[1.6] text-[var(--ink-2)]'>{detail}</p>
			{source && source !== 'guide' ? (
				<a href={source} target='_blank' rel='noreferrer' className='mt-1.5 inline-block font-mono text-[0.625rem] uppercase tracking-[0.12em] text-[var(--ink-3)] hover:text-[var(--accent)]'>
					{host(source)}
				</a>
			) : (
				<span className='mt-1.5 inline-block font-mono text-[0.625rem] uppercase tracking-[0.12em] text-[var(--ink-mute)]'>From the guide</span>
			)}
		</li>
	)
}

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
	const place = findExplorePlace((await params).slug)
	if (!place) notFound()

	const area = findTravelArea(place.area)
	const town = townFor(place)
	const stays = staysInArea(place.area)
	const nearby = nearbyPlaces(place, 8)
	const crafts = craftsFor(place).slice(0, 4)
	const town1 = place.municipality.split(/,| \(| —/)[0]
	const KindGlyph = KIND_ICON[place.kind]

	const gallery = (img: ExploreImage): GalleryPhoto => ({
		thumb: commonsThumb(img.url, 960, img.width),
		large: commonsThumb(img.url, 1280, img.width),
		style: cropStyle(img, 4 / 3),
		caption: img.caption,
		author: img.author,
		license: img.license,
		page: img.page,
		width: img.width,
		height: img.height,
	})
	const photos = place.images.map(gallery)

	const directions = place.point
		? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${town1}`)}`
		: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${AREA_NAME[place.area]}`)}`

	return (
		<>
		{/* The workspace's own masthead: the crimson band, the kind and the town over the name (user decision: the estate's style). */}
		<TravelMasthead
			compact
			kicker={`${EXPLORE_KIND_ONE[place.kind]} · ${whereLine({ municipality: place.municipality, areaName: AREA_NAME[place.area] ?? place.area })}`}
			name={place.name}
			note={place.also_known_as?.length ? `Also known as ${place.also_known_as.join(', ')}.` : place.summary}
		/>
		<div className='bb-container pb-24 pt-8 lg:pt-10'>
			{/* ---- Back to the list, and what to do with this place ---- */}
			<div className='flex flex-wrap items-center justify-between gap-x-8 gap-y-3'>
				<nav aria-label='Breadcrumb' className='flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-[var(--ink-3)]'>
					<Link href='/' className='rule-link'>
						Explore
					</Link>
					<CaretRightIcon size={11} aria-hidden='true' />
					<Link href={`/?area=${place.area}`} className='rule-link'>
						{AREA_NAME[place.area]}
					</Link>
				</nav>
				<div className='flex items-center gap-2'>
					<ShareButton name={place.name} />
					<span className='inline-flex items-center border border-[var(--rule)] pr-3 transition hover:border-[var(--ink)]'>
						<HeartButton slug={place.slug} name={place.name} size={15} className='size-8' />
						<span className='font-[family-name:var(--font-display)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink)]'>Save</span>
					</span>
				</div>
			</div>

			<div className='mt-5'>
				<PlaceGallery name={place.name} photos={photos} />
			</div>

			<div className='mt-8 grid gap-x-16 gap-y-10 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_23rem]'>
				<div className='min-w-0'>
					<p className='bb-label'>The place</p>
					<h2 className='mt-3 font-[family-name:var(--font-display)] text-[1.375rem] font-extrabold leading-snug tracking-[-0.025em] text-[var(--ink)]'>
						{EXPLORE_KIND_ONE[place.kind]} in {town1 === AREA_NAME[place.area] ? town1 : `${town1}, ${AREA_NAME[place.area]}`}
					</h2>
					<p className='mt-2 text-[1rem] leading-[1.6] text-[var(--ink-2)]'>{place.summary}</p>

					<Divider />

					{/* ---- Highlights ---- */}
					<ul className='space-y-6'>
						<li className='flex gap-5'>
							<KindGlyph size={26} className='shrink-0 text-[var(--brass)]' aria-hidden='true' />
							<div>
								<p className='text-[0.96875rem] font-semibold text-[var(--ink)]'>{EXPLORE_KIND_ONE[place.kind]}</p>
								<p className='mt-1.5 text-[0.875rem] leading-[1.6] text-[var(--ink-3)]'>
									{place.from_guide ? 'One of the guide’s own places.' : 'Traced to its sources since the guide was written.'}
								</p>
							</div>
						</li>
						{place.best_time ? (
							<li className='flex gap-5'>
								<SunIcon size={26} className='shrink-0 text-[var(--brass)]' aria-hidden='true' />
								<div>
									<p className='text-[0.96875rem] font-semibold text-[var(--ink)]'>When to go</p>
									<p className='mt-1.5 text-[0.875rem] leading-[1.6] text-[var(--ink-3)]'>{place.best_time}</p>
								</div>
							</li>
						) : null}
						{area ? (
							<li className='flex gap-5'>
								<ShieldWarningIcon size={26} className='shrink-0 text-[var(--brass)]' aria-hidden='true' />
								<div>
									<p className='text-[0.96875rem] font-semibold text-[var(--ink)]'>Safety in {area.name}</p>
									<p className='mt-1.5 text-[0.875rem] leading-[1.6] text-[var(--ink-3)]'>{area.safety}</p>
								</div>
							</li>
						) : null}
					</ul>

					<Divider />

					{/* ---- About ---- */}
					<h2 className='font-[family-name:var(--font-display)] text-[1.375rem] font-extrabold leading-snug tracking-[-0.025em] text-[var(--ink)]'>About this place</h2>
					<div className='mt-4 space-y-4 text-[1rem] leading-[1.7] text-[var(--ink-2)]'>
						{place.detail.slice(0, 2).map((para) => (
							<p key={para.slice(0, 40)}>{para}</p>
						))}
					</div>
					{place.detail.length > 2 ? (
						<details className='group mt-4'>
							<summary className='inline-flex cursor-pointer list-none items-center gap-1 text-[0.9375rem] font-semibold text-[var(--ink)] underline underline-offset-2 [&::-webkit-details-marker]:hidden'>
								<span className='group-open:hidden'>Show more</span>
								<span className='hidden group-open:inline'>Show less</span>
								<CaretRightIcon size={13} weight='bold' className='transition group-open:rotate-90' aria-hidden='true' />
							</summary>
							<div className='mt-4 space-y-4 text-[1rem] leading-[1.7] text-[var(--ink-2)]'>
								{place.detail.slice(2).map((para) => (
									<p key={para.slice(0, 40)}>{para}</p>
								))}
							</div>
						</details>
					) : null}

					{/* ---- What to do, what to eat ---- */}
					{place.do?.length ? (
						<>
							<Divider />
							<h2 className='font-[family-name:var(--font-display)] text-[1.375rem] font-extrabold leading-snug tracking-[-0.025em] text-[var(--ink)]'>What to do</h2>
							<ul className='mt-6 grid gap-7'>
								{place.do.map((note) => (
									<Note key={note.title} {...note} />
								))}
							</ul>
						</>
					) : null}

					{place.eat?.length ? (
						<>
							<Divider />
							<h2 className='flex items-center gap-3 font-[family-name:var(--font-display)] text-[1.375rem] font-extrabold leading-snug tracking-[-0.025em] text-[var(--ink)]'>
								<ForkKnifeIcon size={22} aria-hidden='true' />
								What to eat
							</h2>
							<ul className='mt-6 grid gap-7'>
								{place.eat.map((note) => (
									<Note key={note.title} {...note} />
								))}
							</ul>
						</>
					) : null}

					{/* ---- Before you go ---- */}
					{place.before_you_go.length ? (
						<>
							<Divider />
							<h2 className='font-[family-name:var(--font-display)] text-[1.375rem] font-extrabold leading-snug tracking-[-0.025em] text-[var(--ink)]'>Before you go</h2>
							<ul className='mt-6 space-y-4'>
								{place.before_you_go.map((line) => (
									<li key={line.slice(0, 40)} className='flex gap-4 text-[0.96875rem] leading-[1.6] text-[var(--ink-2)]'>
										<CheckCircleIcon size={22} className='mt-0.5 shrink-0 text-[var(--brass)]' aria-hidden='true' />
										{line}
									</li>
								))}
							</ul>
						</>
					) : null}

					{/* ---- Where you'll be ---- */}
					<Divider />
					<h2 className='font-[family-name:var(--font-display)] text-[1.375rem] font-extrabold leading-snug tracking-[-0.025em] text-[var(--ink)]'>Where you’ll be</h2>
					<p className='mt-2 text-[0.9375rem] text-[var(--ink-2)]'>
						{place.municipality}, {AREA_NAME[place.area]}
					</p>
					{/* The map is hidden for now (user decision): most points are town centres or approximate, and a pin in the
					    sea reads as a mistake. PlaceMap is kept for when the points are surveyed. */}

					{/* ---- Sources ---- */}
					{place.sources.length ? (
						<>
							<Divider />
							<h2 className='font-[family-name:var(--font-display)] text-[1.375rem] font-extrabold leading-snug tracking-[-0.025em] text-[var(--ink)]'>Sources</h2>
							<ul className='mt-4 flex flex-wrap gap-2'>
								{place.sources.map((url) => (
									<li key={url}>
										<a
											href={url}
											target='_blank'
											rel='noreferrer'
											className='chip chip-field'
										>
											{host(url)}
											<ArrowSquareOutIcon size={12} aria-hidden='true' />
										</a>
									</li>
								))}
							</ul>
						</>
					) : null}
				</div>

				{/* ---- The card that stays in view ---- */}
				<aside className='lg:pt-1'>
					<div className='sticky top-[calc(var(--sticky-top,0px)+1.5rem)] border border-[var(--rule)] border-t-2 border-t-[var(--brass)] bg-[var(--paper)] p-6 transition-[top] duration-300'>
						<p className='bb-label'>Plan your visit</p>

						<dl className='mt-5 divide-y divide-[var(--rule)] border-y border-[var(--rule)] text-[0.84375rem]'>
							{place.best_time ? (
								<div className='py-3'>
									<dt className='tv-kind'>When</dt>
									<dd className='mt-0.5 leading-snug text-[var(--ink-2)]'>{place.best_time}</dd>
								</div>
							) : null}
							{place.getting_there ? (
								<div className='py-3'>
									<dt className='tv-kind'>Getting there</dt>
									<dd className='mt-0.5 leading-snug text-[var(--ink-2)]'>{place.getting_there}</dd>
								</div>
							) : null}
						</dl>

						<a
							href={directions}
							target='_blank'
							rel='noreferrer'
							className='bb-btn bb-btn-solid mt-5 w-full justify-center !py-3.5'
						>
							<NavigationArrowIcon size={14} weight='fill' aria-hidden='true' />
							Get directions
						</a>

						<div className='mt-3 grid gap-2'>
							{town && TOWN_PAGES ? (
								<Link
									href={`/${town.area}/${town.slug}`}
									className='flex items-center justify-between gap-3 border border-[var(--rule)] px-4 py-3 text-[0.84375rem] font-semibold text-[var(--ink)] transition hover:border-[var(--accent)]'
								>
									<span className='flex items-center gap-2.5'>
										<PathIcon size={17} aria-hidden='true' />
										{town.name} town guide
									</span>
									<CaretRightIcon size={13} aria-hidden='true' />
								</Link>
							) : null}
							<a
								href='#stays'
								className='flex items-center justify-between gap-3 border border-[var(--rule)] px-4 py-3 text-[0.84375rem] font-semibold text-[var(--ink)] transition hover:border-[var(--accent)]'
							>
								<span className='flex items-center gap-2.5'>
									<BedIcon size={17} aria-hidden='true' />
									Where to sleep nearby
								</span>
								<CaretRightIcon size={13} aria-hidden='true' />
							</a>
						</div>

						<p className='mt-5 text-[0.75rem] leading-snug text-[var(--ink-3)]'>
							A guide, not a booking: nothing here is sold or reserved.
						</p>
					</div>
				</aside>
			</div>

			{/* ---- Crafts made here (user decision: connect the crafts) ---- */}
			{crafts.length ? (
				<section className='mt-16 border-t border-[var(--rule)] pt-12'>
					<div className='flex flex-wrap items-baseline justify-between gap-4'>
						<h2 className='font-[family-name:var(--font-display)] text-[1.375rem] font-extrabold leading-snug tracking-[-0.025em] text-[var(--ink)]'>Crafts made in {town1}</h2>
						<a href='https://betterbarmm.com/crafts' className='rule-link text-[0.84375rem] font-semibold text-[var(--ink)]'>
							Every craft of the region
						</a>
					</div>
					<ul className='mt-6 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-[48px]'>
						{crafts.map((craft) => (
							<li key={craft.slug} className='relative'>
								<a href={`https://betterbarmm.com/crafts/${craft.slug}`} className='tv-card group h-full !p-0'>
									<span className='relative block aspect-[4/3] overflow-hidden bg-[var(--paper-2)]'>
										{craft.image ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={commonsThumb(craft.image.url, 500, craft.image.width)} alt={craft.image.caption} loading='lazy' className='size-full object-cover' />
										) : (
											<span className='flex size-full items-center justify-center text-[var(--ink-mute)]'>
												<YarnIcon size={32} weight='duotone' aria-hidden='true' />
											</span>
										)}
									</span>
									<span className='flex flex-1 flex-col p-5'>
										<span className='tv-kind'>{craft.group}</span>
										<span className='mt-1.5 font-[family-name:var(--font-display)] text-[1rem] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)]'>{craft.name}</span>
										<span className='mt-1 line-clamp-3 text-[0.8125rem] leading-[1.55] text-[var(--ink-3)]'>{craft.summary}</span>
									</span>
								</a>
								{/* The credit beside the link, not inside it (a link inside a link is not allowed), on a box the photo's
								    own shape, so it sits on the photo's corner. */}
								{craft.image ? (
									<span className='pointer-events-none absolute inset-x-0 top-0 aspect-[4/3] [&>a]:pointer-events-auto'>
										<PhotoCredit
											photo={{ author: craft.image.author, license: craft.image.license, page: craft.image.page }}
											className='absolute bottom-2.5 left-2.5'
										/>
									</span>
								) : null}
							</li>
						))}
					</ul>
				</section>
			) : null}

			{/* ---- Where to sleep ---- */}
			<section id='stays' className='mt-16 scroll-mt-[calc(var(--sticky-top,0px)+1.5rem)] border-t border-[var(--rule)] pt-12'>
				<h2 className='font-[family-name:var(--font-display)] text-[1.375rem] font-extrabold leading-snug tracking-[-0.025em] text-[var(--ink)]'>Where to sleep in {AREA_NAME[place.area]}</h2>
				{stays.length ? (
					<>
						<ul className='mt-6 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-[48px]'>
							{stays.map((stay) => (
								<StayCard key={stay.name} stay={stay} />
							))}
						</ul>
						<p className='mt-4 text-[0.8125rem] text-[var(--ink-3)]'>
							Named where a public source names them; no rates or availability. Ask the place directly.{' '}
							{GUIDE_PAGES ? (
								<Link href='/stays' className='underline underline-offset-2 hover:text-[var(--ink)]'>
									Lodging across the region
								</Link>
							) : null}
						</p>
					</>
				) : (
					<p className='mt-3 text-[0.9375rem] text-[var(--ink-2)]'>
						No lodging here is named by a public source yet.
						{GUIDE_PAGES ? (
							<>
								{' '}
								<Link href='/stays' className='font-semibold underline underline-offset-2'>
									See where visitors to {AREA_NAME[place.area]} usually stay
								</Link>
								.
							</>
						) : (
							' Ask the area’s tourism office, or stay in its main town.'
						)}
					</p>
				)}
			</section>

			{/* ---- More to see ---- */}
			<section className='mt-16 border-t border-[var(--rule)] pt-12'>
				<div className='flex flex-wrap items-baseline justify-between gap-4'>
					<h2 className='font-[family-name:var(--font-display)] text-[1.375rem] font-extrabold leading-snug tracking-[-0.025em] text-[var(--ink)]'>More to see nearby</h2>
					<Link href={`/?area=${place.area}`} className='rule-link text-[0.84375rem] font-semibold text-[var(--ink)]'>
						Everything in {AREA_NAME[place.area]}
					</Link>
				</div>
				<div className='mt-6 grid grid-cols-1 gap-x-8 gap-y-12 lg:gap-x-[48px] lg:gap-y-14 sm:grid-cols-2 lg:grid-cols-4'>
					{nearby.slice(0, 4).map((p) => (
						<ExploreCard key={p.slug} place={toCard(p)} />
					))}
				</div>
			</section>
		</div>
		</>
	)
}
