'use client'

import { Skeleton, SkeletonLine } from '@betterbarmm/editorial'
import { usePathname } from 'next/navigation'

/* What a page shows while it streams in, in its own shape (user decision: the travel look, as legislation's): the
   crimson header under the clear bars, its lines in white, then the page's body. The front page: the header, its
   figures under it, then cards. A school: its long name, the text and a side panel. The lists: the filter pills and
   the cards. Every other page: cards. */
const RECORD = /^\/schools\/[^/]+$/
const LIST = /^\/(schools|services|needs)$/
const PEOPLE = /^$/

export default function Loading() {
	const path = usePathname()
	const home = path === '/'
	const record = RECORD.test(path)
	const list = LIST.test(path)
	const people = PEOPLE.test(path)

	return (
		<div role='status'>
			<span className='sr-only'>Loading…</span>
			<header aria-hidden='true' className='dv-hero brand-bg bb-lattice'>
				<div className='bb-container relative flex min-h-[inherit] flex-col justify-end'>
					{record ? (
						<div className='flex gap-2'>
							<SkeletonLine className='text-[0.75rem]' width='9rem' />
							<Skeleton className='h-6 w-24 rounded-full' />
						</div>
					) : (
						<SkeletonLine className='text-[0.75rem]' width='12rem' />
					)}
					<div className={`pg-hero-title mt-4 w-full !max-w-none ${record ? 'pg-hero-title-sm' : ''}`}>
						<SkeletonLine width={record ? 'min(56rem, 92%)' : 'min(34rem, 80%)'} />
						{record ? <SkeletonLine width='min(40rem, 70%)' /> : null}
					</div>
					<div className='mt-5 w-full max-w-3xl text-[1.0625rem] leading-relaxed'>
						<SkeletonLine width='92%' />
						<SkeletonLine width='60%' />
					</div>
				</div>
			</header>

			{home ? (
				<div className='bb-container grid grid-cols-2 gap-3 pt-12 md:grid-cols-4 lg:pt-16'>
					{Array.from({ length: 4 }, (_, i) => (
						<Skeleton key={i} className='h-36 rounded-[var(--dv-r)]' />
					))}
				</div>
			) : null}

			{record ? (
				<div className='bb-container grid gap-12 pb-24 pt-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16'>
					<div>
						<Skeleton className='h-16 w-full rounded-full' />
						{Array.from({ length: 3 }, (_, i) => (
							<div key={i} className='mt-12'>
								<SkeletonLine className='text-[1.125rem]' width='14rem' />
								<div className='mt-4 text-[0.9375rem] leading-7'>
									<SkeletonLine width='96%' />
									<SkeletonLine width='90%' />
									<SkeletonLine width='70%' />
								</div>
							</div>
						))}
					</div>
					<div className='grid content-start gap-4'>
						<Skeleton className='h-12 w-full rounded-full' />
						<Skeleton className='h-48 w-full rounded-[var(--dv-r)]' />
						<Skeleton className='h-72 w-full rounded-[var(--dv-r)]' />
					</div>
				</div>
			) : (
				<div className='bb-container pb-24 pt-14'>
					{list ? (
						<div className='mb-10 flex flex-wrap gap-3'>
							<Skeleton className='h-12 w-28 rounded-full' />
							<Skeleton className='h-12 min-w-0 flex-1 rounded-full' />
							<Skeleton className='h-12 w-44 rounded-full' />
						</div>
					) : null}
					<div className={`grid gap-5 ${people ? 'sm:grid-cols-2 lg:grid-cols-4' : list ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
						{Array.from({ length: people ? 8 : 6 }, (_, i) => (
							<div key={i} className='rounded-[var(--dv-r)] border border-[var(--rule)] p-6'>
								{people ? <Skeleton className='mb-5 size-16 rounded-full' /> : null}
								<SkeletonLine className='text-[0.75rem]' width='40%' />
								<div className='mt-3 text-[1.0625rem] leading-snug'>
									<SkeletonLine width='92%' />
									<SkeletonLine width='70%' />
								</div>
								<div className='mt-5 flex gap-2'>
									<Skeleton className='h-6 w-20 rounded-full' />
									<Skeleton className='h-6 w-24 rounded-full' />
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
