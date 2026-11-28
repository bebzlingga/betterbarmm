import { ImagesIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { cropStyle } from '../_lib/commons'
import { GROUP, PROVINCE, commonsThumb, creditOf, type Craft } from '../_lib/crafts'
import { PhotoCredit } from './discover-figure'

/** A craft as a card: its first photo, or a placeholder where there is none.
 *  replace: inside the dialog, so moving between crafts keeps one history entry.
 *  plain: no card, the photo (rounded) and its words on the ground.
 *  bb-frame is only for the credit to slide out on hover; its own ground is overridden.
 *  The photo's credit is a link of its own, so it sits beside the card's link, over the photo, not inside it. */
export function CraftCard({ c, replace = false, plain = false }: { c: Craft; replace?: boolean; plain?: boolean }) {
	const img = c.images[0]
	return (
		<div
			className={`bb-frame group relative ${plain ? 'bg-transparent!' : 'h-full overflow-hidden rounded-[1.25rem] border border-[var(--rule)] bg-[var(--paper)]! transition duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--ink)_30%,var(--rule))] hover:shadow-[0_24px_48px_-30px_rgba(0,0,0,0.5)]'}`}
		>
			<Link href={`/crafts/${c.slug}`} replace={replace} className='block'>
				<span className={`relative block aspect-[4/3] overflow-hidden bg-[var(--paper-2)] ${plain ? 'rounded-2xl' : ''}`}>
					{img ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={commonsThumb(img.url, 960, img.width)} alt='' loading='lazy' style={cropStyle(img, 4 / 3) ?? { objectPosition: img.focus }} className='size-full object-cover transition duration-500 group-hover:scale-[1.03]' />
					) : (
						// No photo of the craft yet: a placeholder (user decision), not a picture of something else.
						<span className='flex size-full flex-col items-center justify-center gap-2 text-[var(--ink-mute)]'>
							<ImagesIcon size={32} weight='duotone' aria-hidden='true' />
							<span className='text-[0.75rem]'>No photo yet</span>
						</span>
					)}
				</span>
				<span className={`block ${plain ? 'pt-4' : 'p-5'}`}>
					<span className='font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]'>
						{GROUP[c.group]} · {PROVINCE[c.province]}
					</span>
					<span className='mt-1.5 block font-[family-name:var(--font-display)] text-[1.1875rem] font-bold leading-snug tracking-[-0.02em] text-[var(--ink)] group-hover:text-[var(--accent)]'>{c.name}</span>
					<span className='mt-0.5 block text-[0.8125rem] italic text-[var(--ink-3)]'>{c.local_name}</span>
				</span>
			</Link>
			{img ? (
				<span className={`pointer-events-none absolute inset-x-0 top-0 aspect-[4/3] overflow-hidden [&>a]:pointer-events-auto ${plain ? 'rounded-2xl' : ''}`}>
					<PhotoCredit photo={creditOf(img)} />
				</span>
			) : null}
		</div>
	)
}
