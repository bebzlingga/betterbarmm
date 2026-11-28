'use client'

import { Skeleton, SkeletonLine } from '@betterbarmm/editorial'
import { usePathname } from 'next/navigation'

/* What a page shows while it streams in, in its own shape (as travel's do): the dark header under the clear bars,
   its lines in white (the ink re-pointed), then the page's books as covers. The front page: the header centred with
   its search, then the shelves bar. A book: the short header with its cover beside the lines. Every other page: the
   header ranged left. */
export default function Loading() {
	const path = usePathname()
	const home = path === '/'
	const book = path.startsWith('/books/')

	return (
		<div role='status'>
			<span className='sr-only'>Loading…</span>
			<header aria-hidden='true' className={`dv-hero ${home ? 'dv-hero-tall' : book ? 'dv-hero-short' : ''}`} style={{ '--ink': '#fff', '--paper': 'rgb(255 255 255 / 0.25)' } as React.CSSProperties}>
				<div
					className={`bb-container relative min-h-[inherit] ${
						home
							? 'flex flex-col items-center justify-center pb-16 pt-[calc(var(--tv-nav-h)+3rem)] text-center'
							: book
								? 'grid content-end gap-10 pb-16 pt-[calc(var(--tv-nav-h)+4rem)] md:grid-cols-[minmax(0,14rem)_1fr] md:items-start md:gap-14 md:pb-20 lg:grid-cols-[minmax(0,16rem)_1fr]'
								: 'flex flex-col justify-end pb-16 pt-[calc(var(--tv-nav-h)+4rem)] md:pb-20'
					}`}
				>
					{book ? <Skeleton className='aspect-[2/3] w-[11rem] rounded-[1rem] md:w-full' /> : null}
					<div className={home ? 'w-full' : ''}>
						{book ? (
							<div className='flex gap-2'>
								<Skeleton className='h-7 w-20 rounded-full' />
								<Skeleton className='h-7 w-14 rounded-full' />
							</div>
						) : (
							<SkeletonLine className='text-[0.75rem]' width='8rem' />
						)}
						<div className={`pg-hero-title ${book ? 'pg-hero-title-sm mt-5' : 'mt-4'} w-full !max-w-none`}>
							<SkeletonLine width={home ? 'min(46rem, 90%)' : 'min(30rem, 75%)'} />
						</div>
						<div className={`mt-5 w-full max-w-2xl text-[1.0625rem] leading-relaxed ${home ? 'mx-auto' : ''}`}>
							<SkeletonLine width='92%' />
							<SkeletonLine width='60%' />
						</div>
						{home ? <Skeleton className='mx-auto mt-9 h-16 w-full max-w-2xl rounded-full' /> : null}
						{book ? (
							<div className='mt-8 flex gap-2.5'>
								<Skeleton className='h-12 w-48 rounded-full' />
								<Skeleton className='h-12 w-28 rounded-full' />
							</div>
						) : null}
					</div>
				</div>
			</header>

			{/* The shelves bar under the header, on the front page and the books. */}
			{home || path === '/books' ? (
				<div className='border-b border-[var(--rule)]'>
					<div className='bb-container flex gap-9 overflow-hidden pb-3 pt-5'>
						{Array.from({ length: 12 }, (_, i) => (
							<div key={i} className='flex shrink-0 flex-col items-center gap-2'>
								<Skeleton className='size-[22px]' />
								<SkeletonLine className='text-[0.59375rem]' width='4rem' />
							</div>
						))}
					</div>
				</div>
			) : null}

			<div className='bb-container pb-24 pt-14'>
				<div className='grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 xl:grid-cols-6 xl:gap-x-10'>
					{Array.from({ length: 6 }, (_, i) => (
						<div key={i}>
							<Skeleton className='aspect-[2/3] w-full rounded-[1rem]' />
							<SkeletonLine className='mt-3.5 text-[0.625rem]' width='50%' />
							<SkeletonLine className='mt-2 text-[1.0625rem] leading-snug' width='85%' />
							<SkeletonLine className='mt-1 text-[0.8125rem]' width='60%' />
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
