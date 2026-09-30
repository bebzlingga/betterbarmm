import Image from 'next/image'
import type { TravelPhoto } from '../_lib/media'

/* ============================================================
   A photograph, with what it owes

   The credit line is not decoration and it is not optional. Every
   image here is used under a license that requires attribution and a
   link to the source, so the caption block is part of the license
   compliance rather than part of the design — which is why it is
   rendered on the page and not hidden behind a hover.

   `alt` and `caption` say different things on purpose. Alt describes
   the frame for someone who cannot see it; the caption says what the
   picture means for the trip. A screen reader that got the caption
   twice would learn nothing about the photograph.
   ============================================================ */

export function PhotoFigure({
	photo,
	priority = false,
	/** Fill the column at full width, or sit as a smaller inset. */
	size = 'full',
	className = '',
}: {
	photo: TravelPhoto
	priority?: boolean
	size?: 'full' | 'inset'
	className?: string
}) {
	return (
		<figure className={`tv-figure ${className}`}>
			<div className='tv-figure-frame'>
				<Image
					src={photo.src}
					alt={photo.alt}
					placeholder='blur'
					priority={priority}
					sizes={
						size === 'full'
							? '(max-width: 1024px) 100vw, 720px'
							: '(max-width: 1024px) 100vw, 380px'
					}
					className='tv-figure-img'
				/>
				{photo.place ? <span className='tv-figure-place'>{photo.place}</span> : null}
			</div>

			<figcaption className='tv-figure-caption'>
				{photo.caption}
				<span className='tv-figure-credit'>
					{photo.credit} · {photo.license} ·{' '}
					<a href={photo.source} target='_blank' rel='noreferrer' className='rule-link-quiet'>
						Source
					</a>
				</span>
			</figcaption>
		</figure>
	)
}

/** A row of photographs, for an area page's gallery. */
export function PhotoStrip({ photos }: { photos: TravelPhoto[] }) {
	if (!photos.length) return null

	return (
		<div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
			{photos.map((photo, index) => (
				<PhotoFigure key={photo.source} photo={photo} size='inset' priority={index === 0} />
			))}
		</div>
	)
}
