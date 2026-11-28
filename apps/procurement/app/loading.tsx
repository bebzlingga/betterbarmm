'use client'

import { Skeleton, SkeletonLine } from '@betterbarmm/editorial'
import { usePathname } from 'next/navigation'

/* What a page shows while it streams in, in its own shape (user decision: the travel look, as legislation's): the
   crimson header under the clear bars, then the page's body. The front page and an office: the year chart on a card
   beside the words, the figures as cards under it. The lists: the filter pills and the rows. Every other page: a
   column of text. */
const GUIDE = new Set(['/how-it-works', '/sources', '/patterns', '/follow-the-peso'])

export default function Loading() {
	const path = usePathname()
	const list = path === '/notices' || path === '/suppliers'
	const supplier = path.startsWith('/suppliers/')
	const guide = GUIDE.has(path)
	const office = !list && !supplier && !guide

	return (
		<div role='status'>
			<span className='sr-only'>Loading…</span>
			<header aria-hidden='true' className='dv-hero brand-bg bb-lattice'>
				<div className={`bb-container relative flex min-h-[inherit] flex-col justify-end ${office ? 'lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center lg:gap-14' : ''}`}>
					<div>
						<SkeletonLine className='text-[0.75rem]' width='12rem' />
						<div className={`pg-hero-title mt-4 w-full !max-w-none ${supplier ? 'pg-hero-title-sm' : ''}`}>
							<SkeletonLine width='min(30rem, 80%)' />
						</div>
						<div className='mt-5 w-full max-w-3xl text-[1.0625rem] leading-relaxed'>
							<SkeletonLine width='92%' />
							<SkeletonLine width='60%' />
						</div>
					</div>
					{office ? <Skeleton className='mt-10 h-64 w-full rounded-[var(--dv-r)] lg:mt-0' /> : null}
				</div>
			</header>

			<div className='bb-container pb-24 pt-14'>
				{list ? (
					<div className='mb-10 flex flex-wrap gap-3'>
						<Skeleton className='h-12 min-w-0 flex-1 rounded-full' />
						<Skeleton className='h-12 w-44 rounded-full' />
						<Skeleton className='h-12 w-44 rounded-full' />
					</div>
				) : null}
				{office ? (
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
						{Array.from({ length: 4 }, (_, i) => (
							<Skeleton key={i} className='h-44 rounded-[var(--dv-r)]' />
						))}
					</div>
				) : guide ? (
					<div className='max-w-3xl'>
						{Array.from({ length: 3 }, (_, i) => (
							<div key={i} className='mt-10 first:mt-0'>
								<SkeletonLine className='text-[1.5rem]' width='16rem' />
								<div className='mt-4 text-[0.9375rem] leading-7'>
									<SkeletonLine width='96%' />
									<SkeletonLine width='90%' />
									<SkeletonLine width='70%' />
								</div>
							</div>
						))}
					</div>
				) : (
					<Skeleton className='h-[28rem] w-full rounded-[var(--dv-r)]' />
				)}
			</div>
		</div>
	)
}
