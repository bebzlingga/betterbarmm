import Link from 'next/link'
import { EXPLORE_KIND_ONE, type ExplorePlace } from '@betterbarmm/travel-data/explore'
import { ArrowRightIcon, MapPinIcon } from '@phosphor-icons/react/ssr'
import { HeartButton } from './explore-card'
import { KIND_ICON } from './kind-icon'
import { commonsThumb } from '../_lib/commons'

/* The travel-app pieces the Discover and place pages share (user decision): a photograph's credit on a dark tab, and a
   place as a tall rounded photo card. Their styles are the `dv-` rules in globals.css. */

export function Credit({ photo, className = '' }: { photo: { author: string; license: string; page: string }; className?: string }) {
	return (
		<a href={photo.page} target='_blank' rel='noreferrer' className={`dv-credit ${className}`}>
			Photo: {photo.author} · {photo.license}
		</a>
	)
}

/** A place as a tall photo card: the picture, its kind and town on a glass chip, the name over the foot. */
export function PlaceCard({ place, wide = false }: { place: ExplorePlace; wide?: boolean }) {
	const img = place.images[0]
	const Glyph = KIND_ICON[place.kind]
	return (
		<article className={`dv-card group ${wide ? 'dv-card-wide' : ''}`}>
			{img ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img src={commonsThumb(img.url, 960, img.width)} alt='' loading='lazy' className='dv-card-img' />
			) : (
				<span className='grid size-full place-items-center bg-[var(--paper-3)] text-[var(--ink-mute)]'>
					<Glyph size={40} weight='duotone' />
				</span>
			)}
			<span aria-hidden='true' className='dv-card-shade' />
			<span className='dv-chip absolute left-5 top-5'>
				<Glyph size={13} weight='bold' aria-hidden='true' />
				{EXPLORE_KIND_ONE[place.kind]}
			</span>
			<HeartButton slug={place.slug} name={place.name} className='absolute right-4 top-4 size-9' />
			<div className='absolute inset-x-0 bottom-0 p-7'>
				<p className='flex items-center gap-1 text-[0.75rem] font-medium text-white/80'>
					<MapPinIcon size={13} weight='fill' aria-hidden='true' />
					{place.municipality}
				</p>
				<h3 className='mt-1 font-[family-name:var(--font-display)] text-[1.375rem] font-bold leading-tight tracking-[-0.02em] text-white'>
					<Link href={`/places/${place.slug}`} className='after:absolute after:inset-0'>
						{place.name}
					</Link>
				</h3>
				<p className='mt-1.5 line-clamp-2 text-[0.84375rem] leading-snug text-white/80'>{place.summary}</p>
			</div>
			{img ? <Credit photo={img} className='dv-card-credit absolute bottom-0 right-0 z-[1]' /> : null}
		</article>
	)
}

/** The card at the end of a rail: four of the area's photographs as a mosaic under a shade, and where it goes. */
export function SeeAllCard({ href, title, note, places = [], images, external = false }: { href: string; title: string; note: string; places?: ExplorePlace[]; images?: string[]; /** Opens in a new tab (another workspace's page). */ external?: boolean }) {
	// The mosaic: the given photographs, or the first of each of the given places'.
	const tiles = (images ?? places.filter((p) => p.images.length).map((p) => commonsThumb(p.images[0]!.url, 500, p.images[0]!.width))).slice(0, 4)
	return (
		<Link href={href} className='dv-card group' {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
			<span aria-hidden='true' className='absolute inset-0 -z-[1] grid grid-cols-2 grid-rows-2 gap-0.5'>
				{tiles.map((src) => (
					// eslint-disable-next-line @next/next/no-img-element
					<img key={src} src={src} alt='' loading='lazy' className='size-full object-cover transition duration-700 group-hover:scale-105' />
				))}
			</span>
			<span aria-hidden='true' className='absolute inset-0 -z-[1] bg-[linear-gradient(to_top,rgba(8,12,16,0.92)_0%,rgba(8,12,16,0.55)_45%,rgba(8,12,16,0.25)_100%)]' />
			<span className='absolute inset-x-0 bottom-0 p-7 text-white'>
				<span className='grid size-11 place-items-center rounded-full bg-white text-[#10161b] transition group-hover:translate-x-1'>
					<ArrowRightIcon size={20} weight='bold' aria-hidden='true' />
				</span>
				<span className='mt-4 block font-[family-name:var(--font-display)] text-[1.5rem] font-bold leading-tight tracking-[-0.02em]'>{title}</span>
				<span className='mt-1 block text-[0.875rem] text-white/80'>{note}</span>
			</span>
		</Link>
	)
}
