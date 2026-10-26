'use client'

import { ArrowLeftIcon, ArrowRightIcon, XIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { commonsThumb, cropStyle } from '../_lib/commons'
import type { CraftImage } from '../_lib/crafts'

/* Every photograph of a place as a grid; a click opens it full size in a
   second dialog over the first, with its caption and credit. The arrow keys
   and the buttons move through them, and Escape or a click on the dark
   ground closes only the photograph, leaving the place open beneath. */

export function PlaceGallery({ images, name }: { images: CraftImage[]; name: string }) {
	const [at, setAt] = useState<number | null>(null)
	const ref = useRef<HTMLDialogElement>(null)
	const img = at === null ? null : images[at]

	useEffect(() => {
		const d = ref.current
		if (!d) return
		if (at !== null && !d.open) d.showModal()
		if (at === null && d.open) d.close()
	}, [at])

	const step = (by: number) => setAt((i) => (i === null ? i : (i + by + images.length) % images.length))

	return (
		<>
			<ul className='grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-8'>
				{images.map((im, i) => (
					<li key={im.url}>
						<button type='button' onClick={() => setAt(i)} className='group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden bg-[#dfe9e6]' aria-label={`Open photograph ${i + 1} of ${images.length}: ${im.caption || name}`}>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={commonsThumb(im.url, 500)} alt='' loading='lazy' style={cropStyle(im, 4 / 3) ?? undefined} className='size-full object-cover transition duration-500 group-hover:scale-[1.04]' />
						</button>
					</li>
				))}
			</ul>

			<dialog
				ref={ref}
				aria-label={img?.caption || name}
				onCancel={(e) => {
					// Escape closes the photograph only, not the place beneath it.
					e.preventDefault()
					e.stopPropagation()
					setAt(null)
				}}
				onKeyDown={(e) => {
					if (e.key === 'ArrowRight') step(1)
					if (e.key === 'ArrowLeft') step(-1)
				}}
				onClick={(e) => {
					if (e.target === e.currentTarget) setAt(null)
				}}
				className='fixed inset-0 z-[70] m-0! h-dvh! w-full! max-h-none! max-w-none! border-0! bg-transparent p-0! outline-none backdrop:bg-black/90'
			>
				{img ? (
					<div className='pointer-events-none flex h-full flex-col items-center justify-center gap-4 p-4 sm:p-10'>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={commonsThumb(img.url, 1280)} alt={img.caption || name} className='pointer-events-auto max-h-[80dvh] max-w-full object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]' />
						<p className='pointer-events-auto max-w-3xl text-center text-[0.84375rem] leading-[1.55] text-white/85'>
							{img.caption ? <span className='block'>{img.caption}</span> : null}
							<a href={img.page} target='_blank' rel='noreferrer' className='text-white/60 underline decoration-white/30 underline-offset-4 hover:text-white'>
								{img.author} · {img.license}
							</a>
							{images.length > 1 ? <span className='ml-3 tabular-nums text-white/50'>{(at ?? 0) + 1} / {images.length}</span> : null}
						</p>
					</div>
				) : null}
				<button type='button' onClick={() => setAt(null)} aria-label='Close the photograph' className='absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-white/95 text-[#13303a] hover:bg-white'>
					<XIcon size={22} weight='bold' aria-hidden='true' />
				</button>
				{images.length > 1 ? (
					<>
						<button type='button' onClick={() => step(-1)} aria-label='Previous photograph' className='absolute top-1/2 left-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 sm:left-6'>
							<ArrowLeftIcon size={22} weight='bold' aria-hidden='true' />
						</button>
						<button type='button' onClick={() => step(1)} aria-label='Next photograph' className='absolute top-1/2 right-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 sm:right-6'>
							<ArrowRightIcon size={22} weight='bold' aria-hidden='true' />
						</button>
					</>
				) : null}
			</dialog>
		</>
	)
}
