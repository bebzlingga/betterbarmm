import Link from 'next/link'
import { cropStyle } from '../_lib/commons'
import { GROUP, PROVINCE, commonsThumb, creditOf, type Craft } from '../_lib/crafts'
import { PhotoCredit } from './discover-figure'

/** A craft as a card: its first photo, or a wash of its colours where there is none.
 *  replace: inside the dialog, so moving between crafts keeps one history entry.
 *  plain: no card, the photo and its words on the ground, square-cornered.
 *  bb-frame is only for the credit to slide out on hover; its own ground is overridden.
 *  The photo's credit is a link of its own, so it sits beside the card's link, over the photo, not inside it. */
export function CraftCard({ c, replace = false, plain = false }: { c: Craft; replace?: boolean; plain?: boolean }) {
	const img = c.images[0]
	return (
		<div
			className={`bb-frame group relative ${plain ? 'bg-transparent!' : 'overflow-hidden rounded-[6px] bg-white!'}`}
		>
			<Link href={`/crafts/${c.slug}`} replace={replace} className='block'>
				<span className='relative block aspect-[4/3] overflow-hidden bg-[#e9ddd0]'>
					{img ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={commonsThumb(img.url, 960, img.width)} alt='' loading='lazy' style={cropStyle(img, 4 / 3) ?? { objectPosition: img.focus }} className='size-full object-cover transition duration-500 group-hover:scale-[1.03]' />
					) : (
						<span className='block size-full' style={{ background: `linear-gradient(135deg, ${c.colors.join(', ')})` }} />
					)}
				</span>
				<span className={`block ${plain ? 'pt-4' : 'p-5'}`}>
					<span className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a6a4f]'>
						{GROUP[c.group]} · {PROVINCE[c.province]}
					</span>
					<span className='mt-1 block font-[family-name:var(--font-craft)] text-[19px] font-bold leading-snug text-[#3b2419] group-hover:text-[#7b4a35]'>{c.name}</span>
					<span className='mt-0.5 block text-[13px] italic text-[#8a6d5c]'>{c.local_name}</span>
				</span>
			</Link>
			{img ? (
				<span className='pointer-events-none absolute inset-x-0 top-0 aspect-[4/3] overflow-hidden [&>a]:pointer-events-auto'>
					<PhotoCredit photo={creditOf(img)} />
				</span>
			) : null}
		</div>
	)
}
