'use client'

import { Skeleton, SkeletonLine } from '@betterbarmm/editorial'
import { usePathname } from 'next/navigation'
import { ElectionShell } from './_components/election-shell'

/* What a page shows while it streams in, in its own shape (user decision: the travel look, as the legislation
   workspace's): the crimson header under the clear bars, its lines in white, then the page's body. Pages that lead
   with figures (the election, the result, the candidates) show their cards under the header; the candidates a filter
   row of pills and cards with portraits; a party its mark beside the header's lines. Each page wraps itself in the
   shell, so the skeleton does too, or the bar would vanish while the next page loads. */
export default function Loading() {
	const path = usePathname()
	const party = path.startsWith('/parties/')
	const candidates = path.startsWith('/candidates')
	const figures = path === '/' || path.startsWith('/results') || candidates

	return (
		<ElectionShell>
			<div role='status'>
				<span className='sr-only'>Loading…</span>
				<header aria-hidden='true' className='dv-hero brand-bg bb-lattice'>
					<div className={`bb-container relative flex min-h-[inherit] flex-col justify-end ${party ? 'lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center lg:gap-14' : ''}`}>
						<div>
							<SkeletonLine className='text-[0.75rem]' width='12rem' />
							<div className='pg-hero-title mt-4 w-full !max-w-none'>
								<SkeletonLine width='min(34rem, 80%)' />
								<SkeletonLine width='min(26rem, 60%)' />
							</div>
							<div className='mt-5 w-full max-w-3xl text-[1.0625rem] leading-relaxed'>
								<SkeletonLine width='92%' />
								<SkeletonLine width='60%' />
							</div>
						</div>
						{party ? <Skeleton className='mt-10 size-[11.5rem] rounded-[1.75rem] lg:mt-0 lg:size-[12.5rem] lg:justify-self-end' /> : null}
					</div>
				</header>

				{figures ? (
					<div className={`bb-container grid gap-4 pt-12 sm:grid-cols-2 lg:pt-16 ${candidates ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
						{Array.from({ length: candidates ? 4 : 3 }, (_, i) => (
							<Skeleton key={i} className='h-36 rounded-[var(--dv-r)]' />
						))}
					</div>
				) : null}

				<div className='bb-container pb-24 pt-16'>
					{candidates ? (
						<div className='mb-10 flex flex-wrap gap-3'>
							<Skeleton className='h-12 min-w-0 flex-1 rounded-full' />
							<Skeleton className='h-12 w-44 rounded-full' />
							<Skeleton className='h-12 w-44 rounded-full' />
						</div>
					) : (
						<div className='mb-10'>
							<SkeletonLine className='text-[0.75rem]' width='8rem' />
							<SkeletonLine className='mt-3 text-[2.5rem] leading-tight' width='min(28rem, 70%)' />
						</div>
					)}
					<div className={`grid gap-5 ${candidates ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
						{Array.from({ length: candidates ? 8 : 6 }, (_, i) => (
							<div key={i} className='rounded-[var(--dv-r)] border border-[var(--rule)] p-6'>
								{candidates ? <Skeleton className='mb-5 size-16 rounded-full' /> : null}
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
			</div>
		</ElectionShell>
	)
}
