import { ArrowRightIcon, MapTrifoldIcon } from '@phosphor-icons/react/ssr'
import { barmmBoundaries } from '@betterbarmm/lgu-data'

/* ============================================================
   A map page's way in, on the right of its header (user decision: the
   map always on the right, on the preparedness cards' cream ground)

   The region drawn from the PSA outlines the front page's map uses, the
   page's own figure under it and a button. It is one link to `#map`: the
   page's map dialog listens for the hash and opens. No marks are drawn
   on it, since they would need the map's projection; a card that only
   looked like the data would not be the data.
   ============================================================ */

export function RegionMapCard({ corner, value, caption, children }: { corner: string; value: string; caption: string; children?: React.ReactNode }) {
	const { viewBox, areas, outside, land } = barmmBoundaries
	return (
		<a
			href='#map'
			className='group relative block overflow-hidden rounded-[1.5rem] bg-[#f6f1ea] p-5 text-[#191713] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.55)] transition duration-300 hover:-translate-y-1 sm:p-6'
		>
			<span aria-hidden='true' className='absolute inset-0 bg-[radial-gradient(55%_60%_at_60%_45%,rgba(240,140,60,0.22),transparent_70%)]' />
			<span className='relative flex items-center justify-between gap-3'>
				<span className='inline-flex items-center gap-1.5 rounded-full bg-[#191713]/[0.07] px-3 py-1.5 text-[0.75rem] font-semibold'>
					<MapTrifoldIcon size={13} weight='bold' aria-hidden='true' />
					Interactive map
				</span>
				<span className='text-[0.75rem] text-[#5c574c]'>{corner}</span>
			</span>
			<svg viewBox={viewBox} preserveAspectRatio='xMidYMid meet' aria-hidden='true' className='relative mx-auto mt-2 block h-36 w-full sm:h-44'>
				<path d={land} fillRule='nonzero' fill='rgba(25,23,19,0.07)' />
				{outside.map((area) => (
					<path key={area.slug} d={area.d} fillRule='nonzero' fill='rgba(25,23,19,0.13)' />
				))}
				{areas.map((area) => (
					<path key={area.slug} d={area.d} fillRule='nonzero' fill='#d4472f' stroke='#f6f1ea' strokeWidth={1.2} className='transition-[fill] duration-300 group-hover:fill-[#b8341f]' />
				))}
			</svg>
			{children}
			<span className='relative mt-2 flex flex-wrap items-end justify-between gap-4'>
				<span>
					<span className='num block font-[family-name:var(--font-display)] text-[1.875rem] font-extrabold leading-none tracking-[-0.03em]'>{value}</span>
					<span className='mt-1 block text-[0.8125rem] text-[#5c574c]'>{caption}</span>
				</span>
				<span className='inline-flex items-center gap-2 rounded-full bg-[#191713] px-5 py-2.5 font-[family-name:var(--font-display)] text-[0.875rem] font-semibold text-white transition group-hover:bg-[#8a2418]'>
					Open the map
					<ArrowRightIcon size={15} weight='bold' className='transition group-hover:translate-x-0.5' aria-hidden='true' />
				</span>
			</span>
		</a>
	)
}
