'use client'

import { CheckIcon, ImagesIcon, ShareNetworkIcon, XIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { PhotoCredit } from './explore-card'

/* ============================================================
   A place's photographs, laid out the way a listing opens

   One large photograph and four smaller ones beside it, rounded as a
   block; on a phone, one photograph that swipes. "Show all photos"
   opens every one of them, full width, each with its caption and its
   credit — a native <dialog>, so Escape closes it and the page
   behind is inert.
   ============================================================ */

export type GalleryPhoto = {
	thumb: string
	large: string
	style: React.CSSProperties | null
	caption: string
	author: string
	license: string
	page: string
	width: number
	height: number
	/** A wide copy for the full-width header, where the page has one. */
	wide?: string
}

/**
 * The photographs, as a mosaic, or (given `hero`) as a page's full-width header: the first photograph behind the
 * page's own words, with "all photos" and its credit at the top right. Either way the button opens the same viewer.
 */
export function PlaceGallery({ name, photos, hero }: { name: string; photos: GalleryPhoto[]; hero?: React.ReactNode }) {
	const dialog = useRef<HTMLDialogElement>(null)
	const [open, setOpen] = useState(false)

	useEffect(() => {
		if (!open) return
		const root = document.documentElement
		const previous = root.style.overflow
		root.style.overflow = 'hidden'
		return () => {
			root.style.overflow = previous
		}
	}, [open])

	const show = (i = 0) => {
		dialog.current?.showModal()
		setOpen(true)
		requestAnimationFrame(() => document.getElementById(`photo-${i}`)?.scrollIntoView({ block: 'start' }))
	}

	/* The viewer (user decision: match the Discover look): the dark ground of a destination's header, a glass bar
	   with the name and a round close, and every photograph rounded at a wide measure, numbered in the header's gold,
	   its caption and credit under it. */
	const viewer = (
	<dialog
		ref={dialog}
		onClose={() => setOpen(false)}
		aria-label={`Photographs of ${name}`}
		className='m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-[#0b1014] p-0 text-white backdrop:bg-black/60'
	>
		<div className='sticky top-0 z-10 border-b border-white/10 bg-[#0b1014]/80 backdrop-blur-xl'>
			<div className='bb-container flex h-20 items-center justify-between gap-6'>
				<div className='min-w-0'>
					<p className='font-[family-name:var(--font-display)] text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[#f1c453]'>
						{photos.length} {photos.length === 1 ? 'photograph' : 'photographs'}
					</p>
					<p className='truncate font-[family-name:var(--font-display)] text-[1.25rem] font-extrabold tracking-[-0.02em]'>{name}</p>
				</div>
				<button
					type='button'
					onClick={() => dialog.current?.close()}
					aria-label='Close photos'
					className='grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-[#10161b]'
				>
					<XIcon size={18} weight='bold' />
				</button>
			</div>
		</div>
		<div className='mx-auto flex max-w-5xl flex-col gap-14 px-4 py-10 lg:gap-20 lg:py-16'>
			{photos.map((photo, i) => (
				<figure key={photo.large} id={`photo-${i}`} className='m-0 scroll-mt-28'>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={photo.large} alt={photo.caption} loading='lazy' width={photo.width} height={photo.height} className='h-auto w-full rounded-[var(--dv-r)] bg-white/5' />
					<figcaption className='mt-5 flex gap-5'>
						<span className='font-[family-name:var(--font-display)] text-[1.5rem] font-extrabold leading-none tracking-[-0.03em] text-[#f1c453]'>{String(i + 1).padStart(2, '0')}</span>
						<span className='min-w-0'>
							<span className='block text-[0.9375rem] leading-relaxed text-white/85'>{photo.caption}</span>
							<a href={photo.page} target='_blank' rel='noreferrer' className='mt-1 inline-block text-[0.75rem] text-white/45 hover:text-white'>
								Photo: {photo.author} · {photo.license}
							</a>
						</span>
					</figcaption>
				</figure>
			))}
		</div>
	</dialog>
	)

	if (hero) {
		const first = photos[0]
		return (
			<>
				<header className={`dv-hero ${first ? 'pl-hero' : 'pl-hero-bare'}`}>
					{first ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={first.wide ?? first.large} alt={first.caption} fetchPriority='high' className='absolute inset-0 -z-[2] size-full object-cover' />
					) : null}
					<span aria-hidden='true' className='dv-hero-shade' />
					{hero}
					{first ? (
						/* A preview of the photographs, bottom right (user decision): up to three thumbnails, the last carrying
						   the count; any of them opens the viewer at that photograph. Below a wide screen it sits under the words. */
						<div className='bb-container flex flex-col items-start gap-2 pb-8 lg:absolute lg:bottom-28 lg:right-[var(--dv-gutter)] lg:mx-0 lg:w-auto lg:max-w-none lg:items-end lg:!p-0'>
							<div className='flex gap-2'>
								{photos.slice(0, 3).map((photo, i, shown) => {
									const last = i === shown.length - 1
									return (
										<button
											key={photo.large}
											type='button'
											onClick={() => show(i)}
											aria-label={last ? `See all ${photos.length} photos` : `Open photo ${i + 1} of ${photos.length}`}
											className='group/thumb relative h-16 w-20 cursor-pointer overflow-hidden rounded-xl border-2 border-white/70 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] transition hover:-translate-y-0.5 hover:border-white lg:h-20 lg:w-28'
										>
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img src={photo.thumb} alt='' loading='lazy' className='size-full object-cover transition duration-300 group-hover/thumb:scale-105' />
											{last ? (
												<span className='absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/45 text-white backdrop-blur-[1px]'>
													<ImagesIcon size={18} weight='bold' aria-hidden='true' />
													<span className='text-[0.75rem] font-semibold'>{photos.length > 3 ? `+${photos.length - 2}` : photos.length === 1 ? 'View' : `All ${photos.length}`}</span>
												</span>
											) : null}
										</button>
									)
								})}
							</div>
							<a href={first.page} target='_blank' rel='noreferrer' className='max-w-[20rem] truncate text-[0.6875rem] text-white/65 hover:text-white'>
								Photo: {first.author} · {first.license}
							</a>
						</div>
					) : (
						<p className='dv-slide-cap !flex items-center gap-2 text-white/60'>
							<ImagesIcon size={16} aria-hidden='true' />
							No free photograph of {name} yet
						</p>
					)}
				</header>
				{viewer}
			</>
		)
	}

	// No photograph of the place itself: a placeholder, never another place's (user decision).
	if (!photos.length)
		return (
			<div className='flex h-[min(40vh,18rem)] flex-col items-center justify-center gap-3 bg-[var(--paper-2)] text-[var(--ink-mute)]'>
				<ImagesIcon size={36} weight='duotone' aria-hidden='true' />
				<span className='text-[0.875rem]'>No free photograph of {name} yet</span>
			</div>
		)

	const tiles = photos.length >= 5 ? photos.slice(0, 5) : photos.slice(0, Math.min(photos.length, 2))
	return (
		<>
			{/* Phone: one at a time, swiped. */}
			<div className='-mx-6 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden'>
				{photos.map((photo, i) => (
					<div key={photo.large} className='relative aspect-[4/3] w-full shrink-0 snap-center overflow-hidden'>
						<button type='button' onClick={() => show(i)} aria-label={`Open photo ${i + 1} of ${photos.length}`} className='block size-full'>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={photo.thumb} alt={photo.caption} loading={i ? 'lazy' : 'eager'} style={photo.style ?? undefined} className='size-full object-cover' />
						</button>
						<span className='pointer-events-none absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-[0.75rem] font-semibold text-white'>
							{i + 1} / {photos.length}
						</span>
						<PhotoCredit photo={photo} className='absolute bottom-3 left-3' />
					</div>
				))}
			</div>

			{/* From sm: the mosaic — one large and four small, or two side by side, or one. Each tile carries its credit. */}
			<div className={`relative hidden h-[min(60vh,28rem)] gap-2 overflow-hidden sm:grid ${tiles.length === 5 ? 'grid-cols-4 grid-rows-2' : tiles.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
				{tiles.map((photo, i) => (
					<div key={photo.large} className={`group relative overflow-hidden ${i === 0 && tiles.length === 5 ? 'col-span-2 row-span-2' : ''}`}>
						<button type='button' onClick={() => show(i)} aria-label={`Open photo ${i + 1} of ${photos.length}`} className='block size-full cursor-pointer'>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={i === 0 ? photo.large : photo.thumb} alt={photo.caption} loading={i ? 'lazy' : 'eager'} style={photo.style ?? undefined} className='size-full object-cover transition duration-300 group-hover:brightness-90' />
						</button>
						<PhotoCredit photo={photo} className='absolute bottom-2.5 left-2.5' />
					</div>
				))}
				<button
					type='button'
					onClick={() => show(0)}
					className='absolute bottom-4 right-4 inline-flex cursor-pointer items-center gap-2 border border-[var(--ink)] bg-[var(--paper)] px-4 py-2.5 font-[family-name:var(--font-display)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)]'
				>
					<ImagesIcon size={14} weight='bold' aria-hidden='true' />
					Show all photos
				</button>
			</div>

			{viewer}

		</>
	)
}

/** Share a place: the device's own sheet where there is one, otherwise the link copied. */
export function ShareButton({ name, className }: { name: string; className?: string }) {
	const [copied, setCopied] = useState(false)
	return (
		<button
			type='button'
			onClick={async () => {
				const url = window.location.href
				try {
					if (navigator.share) await navigator.share({ title: name, url })
					else {
						await navigator.clipboard.writeText(url)
						setCopied(true)
						setTimeout(() => setCopied(false), 2000)
					}
				} catch {
					// The reader closed the share sheet.
				}
			}}
			className={
				className ??
				'inline-flex h-9 cursor-pointer items-center gap-2 border border-[var(--rule)] px-3 font-[family-name:var(--font-display)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[var(--ink)]'
			}
		>
			{copied ? <CheckIcon size={14} weight='bold' aria-hidden='true' /> : <ShareNetworkIcon size={14} weight='bold' aria-hidden='true' />}
			{copied ? 'Link copied' : 'Share'}
		</button>
	)
}
