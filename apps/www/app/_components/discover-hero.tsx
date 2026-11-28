import { ArrowDownIcon, ArrowLeftIcon } from '@phosphor-icons/react/ssr'
import type { DiscoverPhotoKey } from './discover-media'
import { PhotoHero, photosFor } from './photo-hero'
import Link from 'next/link'

/**
 * The opening of Discover and of every chapter in it, in the travel look (user decision, replacing the words-only
 * band): the region's photographs turning under the words, a chapter's own photograph first.
 */
export function DiscoverHero({
	kicker,
	/** The title, broken by hand; a second line is set in the muted tone. */
	lines,
	standfirst,
	backHref,
	backLabel,
	scrollTo,
	scrollLabel = 'Start reading',
	/** What the page holds, as chips under the standfirst. */
	chips,
	/** Anything extra beside the scroll cue — a count. */
	footnote,
	size = 'chapter',
	photos,
}: {
	kicker: string
	lines: string[]
	standfirst: string
	backHref?: string
	backLabel?: string
	/** Fragment the scroll cue jumps to. */
	scrollTo?: string
	scrollLabel?: string
	chips?: string[]
	footnote?: React.ReactNode
	/** `index` is the larger cut used once, at the front of Discover. */
	size?: 'index' | 'chapter'
	/** The header's photographs; left out, three of the region's chosen by the title. */
	photos?: DiscoverPhotoKey[]
}) {
	return (
		<PhotoHero
			showPhotos
			photos={photos ?? photosFor(lines.join(' '))}
			tall={size === 'index'}
			kicker={
				backHref ? (
					<Link href={backHref} className='inline-flex items-center gap-2 text-white/70 transition hover:text-white'>
						<ArrowLeftIcon className='size-3.5' aria-hidden='true' />
						{backLabel}
						<span className='text-white/40'>·</span>
						<span className='text-[#f1c453]'>{kicker}</span>
					</Link>
				) : (
					kicker
				)
			}
			title={lines.map((line, i) => (
				<span key={i} className={i > 0 ? 'text-white/55' : undefined}>
					{i ? ' ' : ''}
					{line}
				</span>
			))}
			lede={standfirst}
		>
			{chips?.length ? (
				<ul className='mt-6 flex flex-wrap gap-2'>
					{chips.map((c) => (
						<li key={c} className='dv-chip'>
							{c}
						</li>
					))}
				</ul>
			) : null}
			{scrollTo ? (
				<div className='mt-9 flex flex-wrap items-center gap-x-8 gap-y-4'>
					<a href={scrollTo} className='dv-btn dv-btn-light'>
						{scrollLabel}
						<ArrowDownIcon className='size-4' weight='bold' aria-hidden='true' />
					</a>
					{footnote ? <span className='text-[0.875rem] text-white/70'>{footnote}</span> : null}
				</div>
			) : null}
		</PhotoHero>
	)
}

/** The chapter cut: the numbered kicker, the way back to the index, and what the chapter holds. */
export function DiscoverChapterHero({
	chapter,
	title,
	standfirst,
	chips,
	backHref = '/discover',
	backLabel = 'All chapters',
	scrollTo,
	photo,
}: {
	chapter: string
	title: string
	standfirst: string
	chips?: string[]
	backHref?: string
	backLabel?: string
	scrollTo?: string
	/** The chapter's own photograph, shown first. */
	photo?: DiscoverPhotoKey
}) {
	return (
		<DiscoverHero
			photos={photo ? [photo, ...photosFor(title)] : undefined}
			kicker={chapter}
			lines={[title]}
			standfirst={standfirst}
			chips={chips}
			backHref={backHref}
			backLabel={backLabel}
			scrollTo={scrollTo}
		/>
	)
}
