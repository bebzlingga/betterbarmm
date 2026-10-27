'use client'

import { ArrowLeftIcon, CheckIcon, ImagesIcon, ShareNetworkIcon } from '@phosphor-icons/react'
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
}

export function PlaceGallery({ name, photos }: { name: string; photos: GalleryPhoto[] }) {
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

			<dialog
				ref={dialog}
				onClose={() => setOpen(false)}
				aria-label={`Photographs of ${name}`}
				className='m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-[var(--paper)] p-0 text-[var(--ink)] backdrop:bg-black/40'
			>
				<div className='sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-[var(--rule)] bg-[var(--paper)] px-4 lg:px-8'>
					<button
						type='button'
						onClick={() => dialog.current?.close()}
						aria-label='Close photos'
						className='grid size-9 cursor-pointer place-items-center border border-[var(--rule)] transition hover:border-[var(--ink)]'
					>
						<ArrowLeftIcon size={18} weight='bold' />
					</button>
					<p className='!font-[family-name:var(--font-display)] text-[0.9375rem] font-extrabold tracking-[-0.02em]'>
						{name} · {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
					</p>
				</div>
				<div className='mx-auto flex max-w-3xl flex-col gap-10 px-4 py-8 lg:py-12'>
					{photos.map((photo, i) => (
						<figure key={photo.large} id={`photo-${i}`} className='m-0 scroll-mt-20'>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={photo.large} alt={photo.caption} loading='lazy' width={photo.width} height={photo.height} className='h-auto w-full' />
							<figcaption className='mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-[0.8125rem] leading-snug'>
								<span className='text-[var(--ink-2)]'>{photo.caption}</span>
								<a href={photo.page} target='_blank' rel='noreferrer' className='font-mono text-[0.625rem] uppercase tracking-[0.12em] text-[var(--ink-3)] hover:text-[var(--accent)]'>
									{photo.author} · {photo.license}
								</a>
							</figcaption>
						</figure>
					))}
				</div>
			</dialog>

		</>
	)
}

/** Share a place: the device's own sheet where there is one, otherwise the link copied. */
export function ShareButton({ name }: { name: string }) {
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
			className='inline-flex h-9 cursor-pointer items-center gap-2 border border-[var(--rule)] px-3 font-[family-name:var(--font-display)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[var(--ink)]'
		>
			{copied ? <CheckIcon size={14} weight='bold' aria-hidden='true' /> : <ShareNetworkIcon size={14} weight='bold' aria-hidden='true' />}
			{copied ? 'Link copied' : 'Share'}
		</button>
	)
}
