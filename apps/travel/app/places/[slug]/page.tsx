import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
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
	CompassIcon,
	CaretRightIcon,
	CheckIcon,
	ForkKnifeIcon,
	NavigationArrowIcon,
	PathIcon,
	YarnIcon,
} from '@phosphor-icons/react/ssr'
import type { Icon } from '@phosphor-icons/react'
import { HeartButton } from '../../_components/explore-card'
import { PlaceCard, SeeAllCard } from '../../_components/discover-card'
import { Rail } from '../../_components/rail'
import { KIND_ICON } from '../../_components/kind-icon'
import { PlaceGallery, ShareButton, type GalleryPhoto } from '../../_components/place-gallery'
import { StayCard } from '../../_components/stay-card'
import { TOWN_PAGES } from '../../_lib/guide'
import { findDestination } from '../../_lib/discover'
import { commonsThumb, cropStyle } from '../../_lib/commons'

/* ============================================================
   One place, laid out as a travel app's listing (user decision: the Discover look, a page rather than a dialog,
   so each place keeps its own address, card and back button)

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

/** A thing to do or to eat as a numbered row: the number, its glyph, the title and detail, and where it comes from. */
function Note({ n, title, detail, source, icon: Glyph }: { n: number; title: string; detail: string; source: string; icon: Icon }) {
	return (
		<li className='grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-4 border-b border-[var(--rule)] py-6 sm:grid-cols-[3.5rem_minmax(0,1fr)]'>
			<span className='font-[family-name:var(--font-display)] text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--accent)] sm:text-[2.25rem]'>
				{String(n).padStart(2, '0')}
			</span>
			<div>
				<p className='flex items-center gap-2 font-[family-name:var(--font-display)] text-[1.125rem] font-bold leading-snug tracking-[-0.01em] text-[var(--ink)]'>
					<Glyph size={18} weight='duotone' className='shrink-0 text-[var(--accent)]' aria-hidden='true' />
					{title}
				</p>
				<p className='mt-1.5 text-[0.9375rem] leading-[1.65] text-[var(--ink-2)]'>{detail}</p>
				{source && source !== 'guide' ? (
					<a href={source} target='_blank' rel='noreferrer' className='mt-2 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-[var(--ink-3)] hover:text-[var(--accent)]'>
						{host(source)} <ArrowSquareOutIcon size={11} aria-hidden='true' />
					</a>
				) : (
					<span className='mt-2 inline-block text-[0.75rem] text-[var(--ink-mute)]'>From the guide</span>
				)}
			</div>
		</li>
	)
}

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
	const place = findExplorePlace((await params).slug)
	if (!place) notFound()

	const town = townFor(place)
	const stays = staysInArea(place.area)
	const nearby = nearbyPlaces(place, 8)
	const crafts = craftsFor(place).slice(0, 4)
	const town1 = place.municipality.split(/,| \(| —/)[0]
	const KindGlyph = KIND_ICON[place.kind]

	const gallery = (img: ExploreImage): GalleryPhoto => ({
		thumb: commonsThumb(img.url, 960, img.width),
		large: commonsThumb(img.url, 1280, img.width),
		wide: commonsThumb(img.url, 1920, img.width),
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
		<div className='dv'>
			{/* ---- The place's first photograph across the page, the navs clear over it (user decision) ---- */}
			<PlaceGallery
				name={place.name}
				photos={photos}
				hero={
					<>
					<div className='absolute inset-x-0 top-[calc(var(--tv-nav-h)+1.25rem)] z-[1]'>
						<div className='bb-container'>
						<nav aria-label='Breadcrumb' className='flex flex-wrap items-center gap-2 text-[0.8125rem] text-white/75'>
							<Link href='/' className='hover:text-white'>
								Explore
							</Link>
							<span aria-hidden='true'>/</span>
							<Link href={findDestination(place.area) ? `/discover/${place.area}` : `/?area=${place.area}`} className='hover:text-white'>
								{AREA_NAME[place.area]}
							</Link>
						</nav>
						</div>
					</div>
					<div className='bb-container relative flex min-h-[inherit] flex-col justify-end pb-16 pt-[calc(var(--tv-nav-h)+5rem)] md:pb-28'>
						<span className='dv-chip w-fit'>
							<KindGlyph size={13} weight='bold' aria-hidden='true' />
							{EXPLORE_KIND_ONE[place.kind]}
						</span>
						<h1 className='mt-4 max-w-4xl font-[family-name:var(--font-display)] text-[clamp(2.5rem,6.5vw,5.25rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-white'>
							{place.name}
						</h1>
						<p className='mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-white/90'>
							{place.summary}
							{place.also_known_as?.length ? <span className='block text-[0.875rem] text-white/70'>Also known as {place.also_known_as.join(', ')}.</span> : null}
						</p>
						<div className='mt-7 flex flex-wrap gap-3'>
							<a href={directions} target='_blank' rel='noreferrer' className='dv-btn dv-btn-light'>
								<NavigationArrowIcon size={17} weight='fill' aria-hidden='true' />
								Get directions
							</a>
							<ShareButton name={place.name} className='dv-btn dv-btn-glass cursor-pointer' />
							<HeartButton slug={place.slug} name={place.name} size={17} label='Save' className='dv-btn dv-btn-glass' />
						</div>
					</div>
					</>
				}
			/>

			<div className='bb-container grid gap-x-16 gap-y-12 pb-16 pt-16 lg:grid-cols-[minmax(0,1fr)_22rem] lg:pb-28 lg:pt-28'>
				<div className='min-w-0'>
					{/* ---- About ---- */}
					<h2 className='dv-title'>About this place</h2>
					<div className='mt-5 space-y-4 text-[1.0625rem] leading-[1.75] text-[var(--ink-2)]'>
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
							<div className='mt-4 space-y-4 text-[1.0625rem] leading-[1.75] text-[var(--ink-2)]'>
								{place.detail.slice(2).map((para) => (
									<p key={para.slice(0, 40)}>{para}</p>
								))}
							</div>
						</details>
					) : null}

					{/* ---- Things to do here (user decision: redesigned): a numbered list on hairlines, what to do then what to eat ---- */}
					{place.do?.length || place.eat?.length ? (
						<div className='mt-16'>
							<h2 className='dv-title'>Things to do here</h2>
							<ol className='mt-6 border-t border-[var(--rule)]'>
								{[...(place.do ?? []).map((n) => ({ ...n, icon: CompassIcon })), ...(place.eat ?? []).map((n) => ({ ...n, icon: ForkKnifeIcon }))].map((note, n) => (
									<Note key={note.title} n={n + 1} {...note} />
								))}
							</ol>
						</div>
					) : null}

					{/* ---- Before you go (user decision: no security warnings here): a checklist on the warm wash ---- */}
					{place.before_you_go.length ? (
						<div className='tv-wash mt-16 rounded-[1.75rem] p-7 md:p-10'>
							<h2 className='dv-title !text-[clamp(1.5rem,2.4vw,2rem)]'>Before you go</h2>
							<ul className='mt-6 grid gap-x-10 gap-y-5 md:grid-cols-2'>
								{place.before_you_go.map((line) => (
									<li key={line.slice(0, 40)} className='flex gap-3.5 text-[0.9375rem] leading-[1.65] text-[var(--ink-2)]'>
										<span className='mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-white'>
											<CheckIcon size={14} weight='bold' aria-hidden='true' />
										</span>
										{line}
									</li>
								))}
							</ul>
						</div>
					) : null}

					{/* ---- Sources ---- */}
					{place.sources.length ? (
						<div className='mt-14'>
							<h2 className='text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>Sources</h2>
							<ul className='mt-3 flex flex-wrap gap-2'>
								{place.sources.map((url) => (
									<li key={url}>
										<a href={url} target='_blank' rel='noreferrer' className='dv-pill !py-1.5 !text-[0.8125rem]'>
											{host(url)}
											<ArrowSquareOutIcon size={12} aria-hidden='true' />
										</a>
									</li>
								))}
							</ul>
						</div>
					) : null}
				</div>

				{/* ---- The card that stays in view: the practical half ---- */}
				<aside>
					<div className='dv-panel sticky top-[calc(var(--sticky-top,0px)+1.5rem)] !p-6 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.35)] transition-[top] duration-300'>
						<p className='font-[family-name:var(--font-display)] text-[1.25rem] font-bold tracking-[-0.02em] text-[var(--ink)]'>Plan your visit</p>
						<dl className='mt-4 space-y-4 text-[0.875rem]'>
							<div>
								<dt className='text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[var(--ink-3)]'>Where</dt>
								<dd className='mt-1 leading-snug text-[var(--ink)]'>
									{place.municipality}, {AREA_NAME[place.area]}
								</dd>
							</div>
							{place.best_time ? (
								<div>
									<dt className='text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[var(--ink-3)]'>When</dt>
									<dd className='mt-1 leading-snug text-[var(--ink)]'>{place.best_time}</dd>
								</div>
							) : null}
							{place.getting_there ? (
								<div>
									<dt className='text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[var(--ink-3)]'>Getting there</dt>
									<dd className='mt-1 leading-snug text-[var(--ink)]'>{place.getting_there}</dd>
								</div>
							) : null}
						</dl>
						<a href={directions} target='_blank' rel='noreferrer' className='dv-btn mt-6 w-full justify-center bg-[var(--ink)] text-[var(--paper)]'>
							<NavigationArrowIcon size={16} weight='fill' aria-hidden='true' />
							Get directions
						</a>
						<div className='mt-3 grid gap-2'>
							{town && TOWN_PAGES ? (
								<Link href={`/${town.area}/${town.slug}`} className='dv-next !py-3 text-[0.875rem] font-semibold text-[var(--ink)]'>
									<span className='flex items-center gap-2.5'>
										<PathIcon size={17} aria-hidden='true' />
										{town.name} town guide
									</span>
									<CaretRightIcon size={13} aria-hidden='true' />
								</Link>
							) : null}
							<a href='#stays' className='dv-next !py-3 text-[0.875rem] font-semibold text-[var(--ink)]'>
								<span className='flex items-center gap-2.5'>
									<BedIcon size={17} aria-hidden='true' />
									Where to sleep nearby
								</span>
								<CaretRightIcon size={13} aria-hidden='true' />
							</a>
						</div>
						<p className='mt-5 text-[0.75rem] leading-snug text-[var(--ink-3)]'>A guide, not a booking: nothing here is sold or reserved.</p>
					</div>
				</aside>
			</div>

			{/* ---- Crafts made here (user decision: connect the crafts) ---- */}
			{crafts.length ? (
				<Rail title={`Crafts made in ${town1}`} lede='Made in this town; every craft of the region is on the crafts page.'>
					{crafts.map((craft) => (
						<a key={craft.slug} href={`https://betterbarmm.com/crafts/${craft.slug}`} target='_blank' rel='noreferrer' className='dv-card group !aspect-[4/5]'>
							{craft.image ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={commonsThumb(craft.image.url, 500, craft.image.width)} alt={craft.image.caption} loading='lazy' className='dv-card-img' />
							) : (
								<span className='grid size-full place-items-center text-[var(--ink-mute)]'>
									<YarnIcon size={36} weight='duotone' aria-hidden='true' />
								</span>
							)}
							<span aria-hidden='true' className='dv-card-shade' />
							<span className='absolute inset-x-0 bottom-0 p-5'>
								<span className='block text-[0.75rem] font-medium text-white/75'>{craft.group}</span>
								<span className='mt-1 block font-[family-name:var(--font-display)] text-[1.25rem] font-bold leading-tight text-white'>{craft.name}</span>
								<span className='mt-1 line-clamp-2 text-[0.8125rem] leading-snug text-white/80'>{craft.summary}</span>
							</span>
						</a>
					))}
				</Rail>
			) : null}

			{/* ---- Where to sleep ---- */}
			<div id='stays' className='scroll-mt-[calc(var(--sticky-top,0px)+1.5rem)]'>
				{/* A rule above it, at the content's width (user decision). */}
				<div aria-hidden='true' className='bb-container'>
					<div className='border-t border-[var(--rule)]' />
				</div>
				{stays.length ? (
					<Rail title={`Where to sleep in ${AREA_NAME[place.area]}`} lede='Named where a public source names them; no rates or availability. Ask the place directly.'>
						{stays.map((stay) => (
							<ul key={stay.name} className='dv-rail-item'>
								<StayCard stay={stay} />
							</ul>
						))}
					</Rail>
				) : (
					<section className='dv-section bb-container'>
						<h2 className='dv-title'>Where to sleep in {AREA_NAME[place.area]}</h2>
						<p className='dv-lede'>No lodging here is named by a public source yet. Ask the area’s tourism office, or stay in its main town.</p>
					</section>
				)}
			</div>

			{/* ---- More to see ---- */}
			<div className='tv-wash'>
				<Rail title='More to see nearby' lede={`The closest places in this guide, and everything else in ${AREA_NAME[place.area]}.`}>
					{nearby.map((p) => (
						<PlaceCard key={p.slug} place={p} />
					))}
					<SeeAllCard href={`/?area=${place.area}`} title={`Everything in ${AREA_NAME[place.area]}`} note='On the map and in the list' places={explorePlaces.filter((p) => p.area === place.area && p.slug !== place.slug && !nearby.includes(p))} />
				</Rail>
			</div>
		</div>
	)
}
