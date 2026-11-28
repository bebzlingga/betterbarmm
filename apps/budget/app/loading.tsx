'use client'

import { Skeleton, SkeletonLine } from '@betterbarmm/editorial'
import { usePathname } from 'next/navigation'

/* What a page shows while it streams in, in its own shape (user decision: the travel look, as the registry's): the
   crimson header under the clear bars, its lines in white, then what sits under it at the same spacing the page uses
   (`--bt-under`). The front page: the year chart on a card, the four figures, then a table. An office or a sector:
   the way back, three figure cards (the peso figure wide), then its line chart. The lists (offices, sectors, programs,
   projects, revenue): a chart, the filter pills and the table as a rounded card. The questions: the header centred with
   its search, then its groups. The guides (the process, the sources): panels. */
const LIST = /^\/(offices|sectors|programs|projects|revenue)$/

/** A table as the workspace draws it (`.bt-table`): a rounded card, its head on a warm tint, soft rules between rows. */
function TableSkeleton({ rows = 7 }: { rows?: number }) {
	return (
		<div className='overflow-hidden rounded-[var(--dv-r)] border border-[var(--rule)]'>
			<div className='flex justify-between gap-6 border-b border-[var(--rule)] bg-[color-mix(in_srgb,var(--accent)_5%,var(--paper))] px-6 py-4'>
				<SkeletonLine className='text-[0.6875rem]' width='6rem' />
				<SkeletonLine className='text-[0.6875rem]' width='5rem' />
			</div>
			{Array.from({ length: rows }, (_, i) => (
				<div key={i} className='flex items-center justify-between gap-6 border-b border-[var(--rule-soft)] px-6 py-4 last:border-b-0'>
					<div className='min-w-0 flex-1'>
						<SkeletonLine className='text-[1.0625rem]' width='min(22rem, 70%)' />
						<SkeletonLine className='mt-1 text-[0.8125rem]' width='min(30rem, 85%)' />
					</div>
					<SkeletonLine className='text-[0.9375rem]' width='6rem' />
				</div>
			))}
		</div>
	)
}

function Cards({ n, wideFirst = false }: { n: number; wideFirst?: boolean }) {
	return (
		<div className='grid grid-cols-2 gap-3 lg:flex'>
			{Array.from({ length: n }, (_, i) => (
				<Skeleton key={i} className={`h-28 rounded-[var(--dv-r)] lg:min-w-[12rem] lg:flex-1 ${wideFirst && i === 0 ? 'col-span-2 lg:flex-[2]' : ''}`} />
			))}
		</div>
	)
}

export default function Loading() {
	const path = usePathname()
	const home = path === '/'
	const faq = path === '/faq'
	const record = /^\/(offices|sectors)\/[^/]+$/.test(path)
	const list = LIST.test(path)

	return (
		<div role='status'>
			<span className='sr-only'>Loading…</span>
			<header aria-hidden='true' className='dv-hero brand-bg bb-lattice'>
				<div className={`bb-container relative flex flex-col justify-end ${faq ? 'items-center text-center' : ''}`}>
					<div className={`flex gap-3 ${faq ? 'justify-center' : ''}`}>
						{record ? <Skeleton className='h-7 w-24 rounded-full' /> : null}
						<SkeletonLine className='text-[0.75rem]' width='12rem' />
					</div>
					<div className='pg-hero-title mt-4 w-full !max-w-none'>
						<SkeletonLine width={faq ? 'min(40rem, 90%)' : 'min(30rem, 75%)'} />
					</div>
					<div className='mt-5 w-full max-w-3xl text-[1.0625rem] leading-relaxed'>
						<SkeletonLine width='92%' />
						<SkeletonLine width='60%' />
					</div>
					{faq ? <Skeleton className='mx-auto mt-8 h-14 w-full max-w-[40rem] rounded-full' /> : null}
				</div>
			</header>

			<div className='bb-container grid gap-[var(--bt-under)] pb-24 pt-[var(--bt-under)]'>
				{faq ? (
					<div className='mx-auto grid w-full max-w-[64rem] gap-8'>
						{Array.from({ length: 3 }, (_, i) => (
							<Skeleton key={i} className='h-64 w-full rounded-[var(--dv-r)]' />
						))}
					</div>
				) : home ? (
					<>
						<Skeleton className='h-72 w-full rounded-[var(--dv-r)]' />
						<Cards n={4} />
						<TableSkeleton rows={4} />
					</>
				) : record ? (
					<>
						<Cards n={3} wideFirst />
						<div>
							<SkeletonLine className='text-[0.6875rem]' width='7rem' />
							<SkeletonLine className='dv-title mt-2' width='min(18rem, 60%)' />
							<Skeleton className='mt-8 h-72 w-full rounded-[var(--dv-r)]' />
						</div>
					</>
				) : list ? (
					<>
						<Skeleton className='h-64 w-full rounded-[var(--dv-r)]' />
						<div>
							<div className='mb-8 flex flex-wrap gap-3'>
								<Skeleton className='h-12 min-w-0 flex-1 rounded-full' />
								<Skeleton className='h-12 w-28 rounded-full' />
								<Skeleton className='h-12 w-36 rounded-full' />
							</div>
							<TableSkeleton />
						</div>
					</>
				) : (
					<div className='grid gap-5 md:grid-cols-2'>
						{Array.from({ length: 4 }, (_, i) => (
							<div key={i} className='rounded-[var(--dv-r)] border border-[var(--rule)] p-7'>
								<SkeletonLine className='dv-title' width='60%' />
								<div className='mt-4 text-[0.9375rem] leading-7'>
									<SkeletonLine width='95%' />
									<SkeletonLine width='88%' />
									<SkeletonLine width='70%' />
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
