import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import { Stagger, StaggerItem } from '@betterbarmm/editorial'
import Image from 'next/image'
import Link from 'next/link'
import type { DiscoverPhoto } from './discover-media'

export type ChapterCard = {
	href: string
	title: string
	blurb: string
	photo: DiscoverPhoto
	/** What the reader will find there. */
	contains?: string[]
}

/**
 * The primer's chapters as one bento: the first chapter large, the other 4 in a
 * 2 × 2 beside it, so all 5 are on one screen at once rather than in a row that
 * runs off the edge. Every card is a photograph with its name, blurb and what it
 * holds set on it.
 */
export function DiscoverGrid({ cards }: { cards: ChapterCard[] }) {
	return (
		<Stagger gap={0.08} className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2'>
			{cards.map((card, index) => (
				<StaggerItem
					key={card.href}
					className={index === 0 ? 'sm:col-span-2 lg:row-span-2' : ''}
				>
					<ChapterTile card={card} index={index} feature={index === 0} />
				</StaggerItem>
			))}
		</Stagger>
	)
}

export function ChapterTile({
	card,
	index,
	feature = false,
	wide = false,
	label,
}: {
	card: ChapterCard
	index: number
	feature?: boolean
	/** Full width and short: the next chapter at the foot of one. */
	wide?: boolean
	/** A line over the title — "Up next". */
	label?: string
}) {
	return (
		<Link
			href={card.href}
			className={`group bb-zoom relative isolate flex h-full overflow-hidden rounded-[1.25rem] bg-[var(--paper-3)] ${
				wide ? 'min-h-[22rem] lg:min-h-[26rem]' : feature ? 'min-h-[26rem] lg:min-h-[38rem]' : 'min-h-[18rem]'
			}`}
		>
			<Image
				src={card.photo.src}
				alt=''
				fill
				sizes={feature ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw'}
				placeholder='blur'
				className='-z-1 object-cover'
			/>
			<span aria-hidden='true' className='absolute inset-0 -z-1 bg-gradient-to-t from-black/90 via-black/40 to-black/5' />

			<span className='flex w-full flex-col justify-between p-5 sm:p-6'>
				<span className='flex items-start justify-between gap-4'>
					<span className='bb-locator static!'>{String(index + 1).padStart(2, '0')}</span>
					<span className='grid size-9 place-items-center rounded-full border border-white/30 text-white transition duration-300 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)]'>
						<ArrowUpRightIcon className='size-4' weight='bold' aria-hidden='true' />
					</span>
				</span>

				<span className='block'>
					{label ? (
						<span className='mb-3 block font-[family-name:var(--font-display)] text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[#f1c453]'>
							{label}
						</span>
					) : null}
					<span
						className={`block font-extrabold leading-none tracking-[-0.035em] text-white ${
							feature || wide ? 'text-[clamp(2rem,4vw,3.25rem)]' : 'text-[1.5rem]'
						}`}
					>
						{card.title}
					</span>
					<span className={`mt-3 block text-white/80 ${feature || wide ? 'max-w-md bb-body' : 'text-[0.875rem] leading-[1.55]'}`}>
						{card.blurb}
					</span>
					{card.contains?.length ? (
						<span className='mt-4 flex flex-wrap gap-1.5'>
							{card.contains.map((item) => (
								<span
									key={item}
									className='rounded-full border border-white/25 bg-black/30 px-2.5 py-1 font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-white'
								>
									{item}
								</span>
							))}
						</span>
					) : null}
				</span>
			</span>
		</Link>
	)
}
