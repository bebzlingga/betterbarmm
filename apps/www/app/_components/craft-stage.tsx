'use client'

import { Skeleton } from '@betterbarmm/editorial'
import { CubeIcon, ImagesIcon } from '@phosphor-icons/react'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { commonsThumb, contentAspect, cropStyle } from '../_lib/commons'
import { PhotoCredit } from './discover-figure'
import { toneVars } from '../_lib/craft-tone'
import type { CraftImage, CraftModel } from '../_lib/crafts'

/* The craft's main picture and the rail beside it: the object in three
   dimensions first when there is a model of it, then each photograph,
   every photo credited as its licence asks. */

const Scene = dynamic(() => import('./craft-scene'), {
	ssr: false,
	loading: () => <Skeleton className='absolute inset-0 rounded-none' />,
})

export function CraftStage({ name, model, images, className = '' }: { name: string; model: CraftModel | null; images: CraftImage[]; className?: string }) {
	// -1 is the model; 0… are the photos.
	const [at, setAt] = useState(model ? -1 : 0)
	const photo = at >= 0 ? images[at] : undefined
	const tiles = [...(model ? [-1] : []), ...images.map((_, i) => i)]
	const ref = useRef<HTMLDivElement>(null)
	// The photo whose file has arrived: a new one stays hidden until then, so the frame never shows the old
	// picture in the new shape, or an empty box, mid-switch.
	const [ready, setReady] = useState<string | null>(null)

	// Fetch the other photos as soon as the craft opens, so a switch is usually instant.
	useEffect(() => {
		for (const i of images.slice(1)) new Image().src = i.url
	}, [images])

	// Repaint the card in the colours of the photo now on show (the model keeps the first photo's).
	useEffect(() => {
		const card = ref.current?.closest<HTMLElement>('[data-craft-tone]')
		if (!card) return
		for (const [k, v] of Object.entries(toneVars(images[Math.max(0, at)]?.tone))) card.style.setProperty(k, v)
	}, [at, images])

	return (
		<div ref={ref} className={`flex flex-col gap-4 lg:flex-row ${className}`}>
			<figure className='relative flex min-h-0 flex-1 flex-col'>
				<div className='relative grid min-h-[18rem] flex-1 place-items-center [container-type:size]'>
					{photo ? (
						// The frame is the picture's own size, the largest that fits, so the credit sits on its corner.
						<span
							key={photo.url}
							className='bb-frame relative overflow-hidden rounded-[4px] shadow-[0_30px_60px_-20px_rgba(60,30,15,0.55)]'
							style={{ aspectRatio: contentAspect(photo), width: `min(100cqw, 100cqh * ${contentAspect(photo)})` }}
						>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={photo.url}
								alt={photo.caption || name}
								style={cropStyle(photo, contentAspect(photo)) ?? undefined}
								// A file already in the cache may finish before React listens, so check on mount as well as on load.
								ref={(el) => {
									if (el?.complete && el.naturalWidth) setReady(photo.url)
								}}
								onLoad={() => setReady(photo.url)}
								className={`size-full object-cover transition-opacity duration-300 ${ready === photo.url ? 'opacity-100' : 'opacity-0'}`}
							/>
							<PhotoCredit photo={{ credit: photo.author, license: photo.license, source: photo.page }} />
						</span>
					) : model ? (
						<Scene model={model} label={name} />
					) : (
						// No free photo yet: a placeholder (user decision), not a picture of something else.
						<span className='flex aspect-[4/3] w-full max-w-md flex-col items-center justify-center gap-3 rounded-[4px] bg-[#efe6dc] text-[#a8907f]'>
							<ImagesIcon size={40} weight='duotone' aria-hidden='true' />
							<span className='text-[0.875rem]'>No free photo of {name} yet</span>
						</span>
					)}
				</div>
				<figcaption className='mt-3 min-h-8 text-[0.71875rem] leading-4 text-[#8a6d5c] lg:ml-auto lg:max-w-[22rem] lg:text-right'>
					{photo ? (
						<span className='line-clamp-2'>{photo.caption}</span>
					) : model ? (
						'A study of its form, drawn here rather than scanned from one piece. Drag to turn it.'
					) : (
						'No freely licensed photo of it found yet.'
					)}
				</figcaption>
			</figure>

			{tiles.length > 1 ? (
				<ul className='flex shrink-0 gap-3 lg:w-20 lg:flex-col lg:justify-center' aria-label='Views'>
					{tiles.map((i) => {
						const on = i === at
						return (
							<li key={i}>
								<button
									type='button'
									onClick={() => setAt(i)}
									aria-pressed={on}
									aria-label={i < 0 ? 'Turn it in three dimensions' : `Photo ${i + 1}`}
									className={`relative flex size-16 items-center justify-center overflow-hidden rounded-[4px] bg-white shadow-[0_8px_18px_-8px_rgba(60,30,15,0.45)] outline-offset-2 transition ${on ? 'outline-2 outline-[#9a6a4f]' : 'opacity-75 hover:opacity-100'}`}
								>
									{i < 0 ? (
										<span className='flex flex-col items-center text-[#7b4a35]'>
											<CubeIcon size={22} weight='duotone' aria-hidden='true' />
											<span className='font-mono text-[0.59375rem] font-bold tracking-[0.12em]'>3D</span>
										</span>
									) : (
										// eslint-disable-next-line @next/next/no-img-element
										<img src={commonsThumb(images[i]!.url, 250)} alt='' loading='lazy' style={cropStyle(images[i]!, 1) ?? undefined} className='size-full object-cover' />
									)}
								</button>
							</li>
						)
					})}
				</ul>
			) : null}
		</div>
	)
}
