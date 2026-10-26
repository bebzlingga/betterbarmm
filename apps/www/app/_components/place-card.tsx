import Link from 'next/link'
import { commonsThumb, cropStyle } from '../_lib/commons'
import { AREA, KIND_ONE, type Place } from '../_lib/places'
import { PhotoCredit } from './discover-figure'

/** A place as a card: its first photograph (credited on it), or a wash of its colours where there is none. */
export function PlaceCard({ p, replace = false }: { p: Place; replace?: boolean }) {
	const img = p.images[0]
	return (
		<div className='bb-frame group relative bg-transparent!'>
			<Link href={`/places/${p.slug}`} replace={replace} scroll={false} className='block'>
				<span className='relative block aspect-[4/3] overflow-hidden bg-[#dfe9e6]'>
					{img ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={commonsThumb(img.url, 960)} alt='' loading='lazy' style={cropStyle(img, 4 / 3) ?? undefined} className='size-full object-cover transition duration-500 group-hover:scale-[1.03]' />
					) : (
						<span className='flex size-full items-end p-4' style={{ background: `linear-gradient(135deg, ${p.colors.join(', ') || '#1f5a6b, #7fb3a8'})` }}>
							<span className='text-[0.8125rem] font-semibold text-white/85'>No free photograph yet</span>
						</span>
					)}
				</span>
				<span className='block pt-4'>
					<span className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[#1f6f78]'>
						{KIND_ONE[p.kind]} · {AREA[p.area]}
					</span>
					<span className='mt-1 block text-[1.125rem] font-extrabold leading-snug tracking-[-0.01em] text-[#13303a] group-hover:text-[#1f6f78]'>{p.name}</span>
					<span className='mt-1 line-clamp-2 block text-[0.84375rem] leading-[1.55] text-[#4d6670]'>{p.summary}</span>
				</span>
			</Link>
			{img ? (
				<span className='pointer-events-none absolute inset-x-0 top-0 aspect-[4/3] overflow-hidden [&>a]:pointer-events-auto'>
					<PhotoCredit photo={{ credit: img.author, license: img.license, source: img.page }} />
				</span>
			) : null}
		</div>
	)
}
