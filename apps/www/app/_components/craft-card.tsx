import Link from 'next/link'
import { GROUP, PROVINCE, commonsThumb, type Craft } from '../_lib/crafts'

/** A craft as a card: its first photo, or a wash of its colours where there is none. */
export function CraftCard({ c }: { c: Craft }) {
	const img = c.images[0]
	return (
		<Link href={`/crafts/${c.slug}`} className='group block overflow-hidden rounded-[6px] bg-white shadow-[0_12px_30px_-18px_rgba(60,30,15,0.45)] transition hover:shadow-[0_18px_40px_-16px_rgba(60,30,15,0.55)]'>
			<span className='block aspect-[4/3] overflow-hidden bg-[#e9ddd0]'>
				{img ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={commonsThumb(img.url, 960)} alt='' loading='lazy' style={{ objectPosition: img.focus }} className='size-full object-cover transition duration-500 group-hover:scale-[1.03]' />
				) : (
					<span className='block size-full' style={{ background: `linear-gradient(135deg, ${c.colors.join(', ')})` }} />
				)}
			</span>
			<span className='block p-5'>
				<span className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a6a4f]'>
					{GROUP[c.group]} · {PROVINCE[c.province]}
				</span>
				<span className='mt-1 block font-[family-name:var(--font-craft)] text-[19px] font-bold leading-snug text-[#3b2419] group-hover:text-[#7b4a35]'>{c.name}</span>
				<span className='mt-0.5 block text-[13px] italic text-[#8a6d5c]'>{c.local_name}</span>
			</span>
		</Link>
	)
}
