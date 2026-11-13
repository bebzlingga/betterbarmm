'use client'

import type { ReactNode } from 'react'

/* ============================================================
   The list beside a map

   Every map dialog on the estate (schools, incidents, the budget's
   projects) keeps a list of what is on the map down its left side.
   One look for all of them: a fixed head with the count and the way
   back to the whole region, groups that stick to the top as they
   scroll past (a town, a month), and light rows with a marker, a name,
   a line under it and a figure on the right. The chosen row carries a
   crimson bar on its left edge, as the dot on the map carries a ring.
   ============================================================ */

/** The panel: the head stays put, the list under it scrolls. */
export function MapList({ head, children, className = '' }: { head: ReactNode; children: ReactNode; className?: string }) {
	return (
		<aside className={`flex min-h-0 flex-col bg-[var(--paper)] ${className}`}>
			<div className='shrink-0 border-b border-[var(--rule)] px-5 py-4'>{head}</div>
			<div className='min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-color:var(--rule)_transparent] [scrollbar-width:thin]'>{children}</div>
		</aside>
	)
}

/** The head: how many are on the map, of how many, and an action on the right. `noun` is the plural: "95 / of 276 incidents on the map". */
export function MapListHead({ count, noun, of, action }: { count: number; noun: string; of?: number; action?: ReactNode }) {
	const n = (x: number) => x.toLocaleString('en-PH')
	return (
		<div className='flex items-end justify-between gap-4'>
			<p className='min-w-0'>
				<span className='num block font-[family-name:var(--font-display)] text-[1.75rem] font-black leading-none tracking-[-0.03em] text-[var(--ink)]'>{n(count)}</span>
				<span className='mt-1.5 block text-[0.75rem] text-[var(--ink-3)]'>
					{of !== undefined && of !== count ? `of ${n(of)} ` : ''}
					{noun} on the map
				</span>
			</p>
			{action ? <div className='shrink-0 text-[0.78125rem] font-semibold'>{action}</div> : null}
		</div>
	)
}

/** A group of rows under a heading that sticks to the top while its rows scroll by. */
export function MapListGroup({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
	return (
		<section>
			<h3 className='sticky top-0 z-[1] flex items-baseline justify-between gap-3 border-b border-[var(--rule-soft)] bg-[var(--paper-2)] px-5 py-1.5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
				<span className='truncate'>{title}</span>
				{count !== undefined ? <span className='num shrink-0 font-normal'>{count}</span> : null}
			</h3>
			<ul>{children}</ul>
		</section>
	)
}

/** One row: marker, name, the line under it, and a figure on the right. */
export function MapListRow({
	marker,
	title,
	meta,
	figure,
	current = false,
	onClick,
}: {
	marker?: ReactNode
	title: ReactNode
	meta?: ReactNode
	figure?: ReactNode
	current?: boolean
	onClick: () => void
}) {
	return (
		<li className='border-b border-[var(--rule-soft)] last:border-b-0'>
			<button
				type='button'
				onClick={onClick}
				aria-current={current ? 'true' : undefined}
				className='grid w-full cursor-pointer grid-cols-[1.25rem_minmax(0,1fr)_auto] items-start gap-x-3 px-5 py-2.5 text-left transition-colors hover:bg-[var(--paper-2)] aria-[current=true]:bg-[var(--paper-2)] aria-[current=true]:shadow-[inset_3px_0_0_var(--accent)]'
			>
				<span className='flex h-5 items-center justify-center'>{marker}</span>
				<span className='min-w-0'>
					<span className='block text-[0.8125rem] font-semibold leading-5 text-[var(--ink)]'>{title}</span>
					{meta ? <span className='mt-0.5 block truncate text-[0.6875rem] leading-4 text-[var(--ink-3)]'>{meta}</span> : null}
				</span>
				{figure !== undefined && figure !== null ? <span className='num pl-2 text-right text-[0.75rem] font-bold leading-5 text-[var(--ink)]'>{figure}</span> : <span />}
			</button>
		</li>
	)
}

/** The line closing a list cut short, or saying it is empty. */
export function MapListNote({ children }: { children: ReactNode }) {
	return <p className='px-5 py-6 text-center text-[0.75rem] leading-5 text-[var(--ink-3)]'>{children}</p>
}
