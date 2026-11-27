import Link from 'next/link'
import { MapPinIcon } from '@phosphor-icons/react/ssr'
import type { ExplorePlace } from '@betterbarmm/travel-data/explore'
import { commonsSrcSet, commonsThumb } from '../_lib/commons'
import type { TravelPhoto } from '../_lib/media'

/* ============================================================
   A travel page's header, as the Discover pages draw it (user
   decision: every page in the workspace in that look)

   One photograph across the page, or several that turn, under a
   dark wash; the navigation runs clear over it. Each photograph's
   name and credit sit bottom right, turning with it. The page's own
   words, and anything it passes (a search, a button), sit bottom left
   or centred.
   ============================================================ */

export type HeroPhoto = { src: string; srcSet?: string; alt: string; label: string; credit: string; page: string; href?: string }

/** One of the guide's own credited photographs (`_lib/media`). */
export const heroFromTravelPhoto = (p: TravelPhoto): HeroPhoto => ({
	src: p.src.src,
	alt: p.alt,
	label: p.place ?? '',
	credit: `${p.credit} · ${p.license}`,
	page: p.source,
})

/** One of a place's photographs, at the full width, linking to the place. */
export function heroFromPlace(place: ExplorePlace | undefined, image = 0): HeroPhoto | null {
	const img = place?.images[image]
	return place && img
		? { src: commonsThumb(img.url, 1920, img.width), srcSet: commonsSrcSet(img.url, img.width), alt: `${place.name}, ${place.municipality}`, label: place.name, credit: `${img.author} · ${img.license}`, page: img.page, href: `/places/${place.slug}` }
		: null
}

export function PageHero({
	photos,
	kicker,
	title,
	lede,
	center = false,
	tall = false,
	children,
}: {
	photos: (HeroPhoto | null)[]
	kicker?: string
	title: React.ReactNode
	lede?: React.ReactNode
	/** The words centred, as the explorer's search is. */
	center?: boolean
	/** The full first screen, as a destination's is; otherwise a little shorter so the page shows under it. */
	tall?: boolean
	children?: React.ReactNode
}) {
	// At most four: the turning is timed for two, three or four photographs (dv-fade-2, -3 and dv-fade in globals.css).
	const shown = photos.filter((p): p is HeroPhoto => Boolean(p)).slice(0, 4)
	const n = shown.length
	// One photograph holds still; several turn, each for seven seconds.
	const turn = (i: number) =>
		(n > 1 ? { '--i': i, '--n': n, ...(n < 4 ? { animationName: `dv-fade-${n}` } : {}) } : { animation: 'none', opacity: 1 }) as React.CSSProperties

	return (
		<header className={`dv-hero ${tall ? '' : 'pg-hero'}`}>
			{shown.map((p, i) => (
				<figure key={p.src} className='dv-slide' style={turn(i)}>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img decoding='async' src={p.src} srcSet={p.srcSet} sizes='100vw' alt={p.alt} fetchPriority={i === 0 ? 'high' : 'low'} className='dv-slide-img' style={n > 1 ? undefined : { animation: 'none' }} />
				</figure>
			))}
			<span aria-hidden='true' className='dv-hero-shade' />
			{shown.map((p, i) => (
				<p key={p.src} data-first={i === 0 || undefined} className='dv-slide-cap dv-cap' style={turn(i)}>
					{!p.label ? null : p.href ? (
						<Link href={p.href} className='inline-flex items-center gap-1.5 font-semibold text-white/60 hover:text-white'>
							<MapPinIcon size={14} weight='fill' aria-hidden='true' />
							{p.label}
						</Link>
					) : (
						<span className='inline-flex items-center gap-1.5 font-semibold text-white/60'>
							<MapPinIcon size={14} weight='fill' aria-hidden='true' />
							{p.label}
						</span>
					)}
					<a href={p.page} target='_blank' rel='noreferrer' className='text-[0.6875rem] text-white/40 hover:text-white/80'>
						Photo: {p.credit}
					</a>
				</p>
			))}

			{/* Centred words sit in the middle of the photograph below the bars; the others sit at its foot. */}
			<div
				className={`bb-container relative flex min-h-[inherit] flex-col ${center ? 'items-center justify-center pb-16 pt-[calc(var(--tv-nav-h)+3rem)] text-center' : 'justify-end pb-16 pt-[calc(var(--tv-nav-h)+4rem)] md:pb-24'}`}
			>
				{kicker ? <p className='font-[family-name:var(--font-display)] text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[#f1c453]'>{kicker}</p> : null}
				<h1 className={`pg-hero-title mt-4 ${center ? 'mx-auto' : ''}`}>{title}</h1>
				{lede ? <p className={`mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-white/85 md:text-[1.125rem] ${center ? 'mx-auto' : ''}`}>{lede}</p> : null}
				{children}
			</div>
		</header>
	)
}
