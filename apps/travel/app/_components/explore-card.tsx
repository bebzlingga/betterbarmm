'use client'

import { CaretLeftIcon, CaretRightIcon, HeartIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useRef, useState } from 'react'
import type { CardPhoto, CardPlace } from '../_lib/cards'
import { whereLine } from '../_lib/where'
import { useSaved } from '../_lib/saved'
import { KIND_ICON } from './kind-icon'

/* ============================================================
   A place as a card: browsed like a stays listing, drawn in the
   estate's own style (user decision) — a square photograph, the brass
   kind line, the display title and the summary

   The photographs are a row that scrolls sideways and snaps, so a
   thumb swipes through them on a phone and arrows step through them
   on a desktop; the dots say which one is showing. The heart keeps
   the place in this browser. Each photo carries its credit in the
   corner, as its licence asks.

   The frame holds the picture's link and, beside it rather than
   inside it, the heart, the arrows and the credit: a link inside a
   link is not allowed, and each of those does something else.

   No price and no rating: there are none to show.
   ============================================================ */

export function HeartButton({ slug, name, className = '', size = 20 }: { slug: string; name: string; className?: string; size?: number }) {
	const { has, toggle } = useSaved()
	const on = has(slug)
	return (
		<button
			type='button'
			aria-pressed={on}
			aria-label={on ? `Remove ${name} from saved` : `Save ${name}`}
			onClick={(e) => {
				e.preventDefault()
				e.stopPropagation()
				toggle(slug)
			}}
			className={`grid cursor-pointer place-items-center transition active:scale-90 ${className}`}
		>
			<HeartIcon
				size={size}
				weight='fill'
				className={`drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition ${on ? 'text-[var(--accent)]' : 'text-black/40'}`}
				style={on ? undefined : { stroke: 'white', strokeWidth: 16 }}
			/>
		</button>
	)
}

/** The credit a free licence asks for: the author and the licence, linked to the file. */
export function PhotoCredit({ photo, className = '' }: { photo: Pick<CardPhoto, 'author' | 'license' | 'page'>; className?: string }) {
	return (
		<a
			href={photo.page}
			target='_blank'
			rel='noreferrer'
			title={`Photo: ${photo.author} · ${photo.license}`}
			className={`group/credit inline-flex h-5 max-w-[calc(100%-1.5rem)] items-center gap-1 overflow-hidden bg-black/50 px-1.5 text-[0.625rem] font-medium text-white/90 backdrop-blur-sm ${className}`}
		>
			<span aria-hidden='true'>&#9432;</span>
			<span className='hidden truncate group-hover/credit:inline group-focus-visible/credit:inline'>
				{photo.author} · {photo.license}
			</span>
			<span className='sr-only'>
				Photo by {photo.author}, {photo.license}. Open the source file.
			</span>
		</a>
	)
}

export function ExploreCard({ place, priority = false }: { place: CardPlace; priority?: boolean }) {
	const strip = useRef<HTMLAnchorElement>(null)
	const [index, setIndex] = useState(0)
	const count = place.photos.length
	const href = `/places/${place.slug}`
	const KindGlyph = KIND_ICON[place.kind]

	// Called only from a click, never during render: the ref is read when the photo row is there.
	const step = (dir: 1 | -1) => {
		const el = strip.current
		if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' })
	}

	return (
		<article className='group/card min-w-0'>
			<div className='relative aspect-[4/3] overflow-hidden bg-[var(--paper-3)]'>
				{count ? (
					<Link
						ref={strip}
						href={href}
						tabIndex={-1}
						aria-hidden='true'
						onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
						className='flex size-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
					>
						{place.photos.map((photo, i) => (
							<span key={photo.src} className='relative block size-full shrink-0 snap-center overflow-hidden'>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={photo.src}
									srcSet={photo.srcSet}
									sizes='(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 92vw'
									alt=''
									loading={priority && i === 0 ? 'eager' : 'lazy'}
									draggable={false}
									style={photo.style ?? undefined}
									className='size-full object-cover transition duration-500 group-hover/card:scale-[1.03]'
								/>
							</span>
						))}
					</Link>
				) : (
					/* No photograph of the place itself: a placeholder, not another place's (user decision). */
					<Link href={href} tabIndex={-1} aria-hidden='true' className='flex size-full flex-col items-center justify-center gap-2 text-[var(--ink-mute)]'>
						<KindGlyph size={34} weight='duotone' />
						<span className='text-[0.75rem]'>No photo yet</span>
					</Link>
				)}

				<HeartButton slug={place.slug} name={place.name} className='absolute right-2 top-2 size-8' />

				{count > 1 ? (
					<>
						<button
							type='button'
							aria-label='Previous photo'
							onClick={() => step(-1)}
							className={`absolute left-3 top-1/2 hidden size-8 -translate-y-1/2 cursor-pointer place-items-center bg-[var(--paper)]/90 text-[var(--ink)] opacity-0 shadow transition hover:bg-[var(--paper)] group-hover/card:opacity-100 md:grid ${index === 0 ? 'invisible' : ''}`}
						>
							<CaretLeftIcon size={14} weight='bold' />
						</button>
						<button
							type='button'
							aria-label='Next photo'
							onClick={() => step(1)}
							className={`absolute right-3 top-1/2 hidden size-8 -translate-y-1/2 cursor-pointer place-items-center bg-[var(--paper)]/90 text-[var(--ink)] opacity-0 shadow transition hover:bg-[var(--paper)] group-hover/card:opacity-100 md:grid ${index === count - 1 ? 'invisible' : ''}`}
						>
							<CaretRightIcon size={14} weight='bold' />
						</button>
						<span className='pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5' aria-hidden='true'>
							{place.photos.map((photo, i) => (
								<span key={photo.src} className={`size-1.5 shadow-[0_0_2px_rgba(0,0,0,0.4)] transition ${i === index ? 'bg-white' : 'bg-white/55'}`} />
							))}
						</span>
					</>
				) : null}

				{count ? <PhotoCredit photo={place.photos[index] ?? place.photos[0]!} className='absolute bottom-2.5 left-2.5' /> : null}
			</div>

			<Link href={href} className='block pt-4'>
				<p className='tv-kind truncate'>
					{place.kindLabel} · {whereLine(place)}
				</p>
				<h3 className='mt-1.5 font-[family-name:var(--font-display)] text-[1.0625rem] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)] transition group-hover/card:text-[var(--accent)]'>
					{place.name}
				</h3>
				<p className='mt-1 line-clamp-2 text-[0.84375rem] leading-[1.55] text-[var(--ink-3)]'>{place.summary}</p>
				{place.bestTime ? <p className='mt-2 truncate text-[0.75rem] text-[var(--ink-mute)]'>Best: {place.bestTime}</p> : null}
			</Link>
		</article>
	)
}
