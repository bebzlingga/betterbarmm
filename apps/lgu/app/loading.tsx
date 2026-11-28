'use client'

import { Skeleton, SkeletonLine } from '@betterbarmm/editorial'
import { usePathname } from 'next/navigation'

/* What a page shows while it streams in, in its own shape (user decision: the travel look, as the registry's): the
   crimson header under the clear bars, its lines in white, then the page's body. The front page and an area or a
   municipality: their figures on cards under the header, then cards. The tables (officials, the money): the filter
   pills and the rows. The guides: cards. */
const GUIDE = /^\/(what-each-level-does|devolution|local-budgets|salaries|governance-code|ordinances)(\/|$)/
const TABLE = /^\/(officials|finances|nta|lgsf|audits|regional-budget)$/

export default function Loading() {
	const path = usePathname()
	const table = TABLE.test(path)
	const guide = GUIDE.test(path)
	const unit = !table && !guide

	return (
		<div role='status'>
			<span className='sr-only'>Loading…</span>
			<header aria-hidden='true' className='dv-hero brand-bg bb-lattice'>
				<div className='bb-container relative flex min-h-[inherit] flex-col justify-end'>
					<SkeletonLine className='text-[0.75rem]' width='12rem' />
					<div className='pg-hero-title mt-4 w-full !max-w-none'>
						<SkeletonLine width='min(34rem, 80%)' />
					</div>
					<div className='mt-5 w-full max-w-3xl text-[1.0625rem] leading-relaxed'>
						<SkeletonLine width='92%' />
						<SkeletonLine width='60%' />
					</div>
				</div>
			</header>

			{unit ? (
				<div className='bb-container grid grid-cols-2 gap-3 pt-12 md:grid-cols-5 lg:pt-16'>
					{Array.from({ length: 5 }, (_, i) => (
						<Skeleton key={i} className='h-32 rounded-[var(--dv-r)]' />
					))}
				</div>
			) : null}

			<div className='bb-container pb-24 pt-14'>
				{table ? (
					<>
						<div className='mb-8 flex flex-wrap gap-3'>
							<Skeleton className='h-12 w-48 rounded-full' />
							<Skeleton className='h-12 min-w-0 flex-1 rounded-full' />
							<Skeleton className='h-12 w-40 rounded-full' />
						</div>
						<Skeleton className='h-[28rem] w-full rounded-[var(--dv-r)]' />
					</>
				) : (
					<div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
						{Array.from({ length: 6 }, (_, i) => (
							<div key={i} className='rounded-[var(--dv-r)] border border-[var(--rule)] p-6'>
								<SkeletonLine className='text-[0.75rem]' width='40%' />
								<div className='mt-3 text-[1.25rem] leading-snug'>
									<SkeletonLine width='70%' />
								</div>
								<div className='mt-4 text-[0.875rem] leading-6'>
									<SkeletonLine width='95%' />
									<SkeletonLine width='80%' />
								</div>
								<div className='mt-6 grid grid-cols-2 gap-2'>
									<Skeleton className='h-14 rounded-xl' />
									<Skeleton className='h-14 rounded-xl' />
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
