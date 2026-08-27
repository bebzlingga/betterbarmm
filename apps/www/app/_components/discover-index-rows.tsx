import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import Image from 'next/image'
import Link from 'next/link'
import type { DiscoverPhoto } from './discover-media'

export type DiscoverIndexRow = {
	slug: string
	word: string
	blurb: string
	/** What the reader will actually find there — printed as a short list. */
	contains: string[]
	photo: DiscoverPhoto
}

/**
 * The chapters as an index rather than a card grid.
 *
 * One row per chapter: a number, the word at display size, and — while the
 * pointer is on the row — the photograph of that chapter washed in behind it.
 * The picture is still doing the job it was always here for, which is putting
 * the subject in front of the reader at the moment they are deciding whether to
 * click, without spending five permanent slots of vertical space on thumbnails.
 *
 * It used to be a card that followed the cursor. That reads as a portfolio
 * flourish: the picture is a separate object hovering over the page, the eye
 * tracks it instead of the row, and the row it belongs to is the one thing it
 * is not touching. Behind the row, faded, and masked so the left side stays
 * clean under the word, it says the same thing about the same row without
 * asking to be looked at.
 *
 * All of it is CSS hover on the row, which is why nothing here is a client
 * component any more — no pointer tracking, no springs, no state for which row
 * is active.
 *
 * On touch, where there is no hover at all, the row keeps its own inline
 * thumbnail.
 */
export function DiscoverIndexRows({ rows }: { rows: DiscoverIndexRow[] }) {
	return (
		<div>
			{rows.map((row, index) => (
				<Link key={row.slug} href={`/discover/${row.slug}`} className='bb-row group isolate'>
					<span className='bb-row-bg' aria-hidden='true'>
						<Image
							src={row.photo.src}
							alt=''
							fill
							sizes='(min-width: 1024px) 80vw, 100vw'
							placeholder='blur'
							className='object-cover'
						/>
					</span>

					<span className='bb-row-num num w-10 shrink-0 self-start pt-2 text-[12px] font-semibold text-[var(--brass)] sm:w-14'>
						{String(index + 1).padStart(2, '0')}
					</span>

					<span className='min-w-0'>
						<span className='bb-row-word block'>{row.word}</span>

						<span className='mt-3 block max-w-xl bb-body text-[var(--ink-2)]'>{row.blurb}</span>

						<span className='bb-row-contains mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5'>
							{row.contains.map((item) => (
								<span key={item} className='bb-chip'>
									{item}
								</span>
							))}
						</span>
					</span>

					{/* The touch fallback for the wash: a real thumbnail in the row,
					    hidden wherever hover can actually run. */}
					<span className='bb-frame relative block h-24 w-20 shrink-0 self-start sm:h-28 sm:w-24 [@media(hover:hover)_and_(pointer:fine)]:hidden'>
						<Image
							src={row.photo.src}
							alt=''
							sizes='96px'
							placeholder='blur'
							className='size-full object-cover'
						/>
					</span>

					<ArrowUpRightIcon
						className='hidden size-7 shrink-0 self-start text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)] [@media(hover:hover)_and_(pointer:fine)]:block'
						aria-hidden='true'
					/>
				</Link>
			))}
		</div>
	)
}
