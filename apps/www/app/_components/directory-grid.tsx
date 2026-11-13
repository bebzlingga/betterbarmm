'use client'

import { useState, type ReactNode } from 'react'

/** The directory's topic chips and its grid: the cards come rendered from the server, this only picks which show. */
export function DirectoryGrid({
	topics,
	items,
}: {
	topics: { key: string; title: string; count: number }[]
	items: { key: string; topic: string; wide?: boolean; node: ReactNode }[]
}) {
	const [active, setActive] = useState('all')
	const shown = active === 'all' ? items : items.filter((i) => i.topic === active)
	const chips = [{ key: 'all', title: 'Everything', count: items.length }, ...topics]
	return (
		<div>
			<div role='tablist' aria-label='Filter by topic' className='-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0'>
				{chips.map((c) => {
					const on = c.key === active
					return (
						<button
							key={c.key}
							type='button'
							role='tab'
							aria-selected={on}
							onClick={() => setActive(c.key)}
							className={`inline-flex shrink-0 cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2 text-[0.8125rem] font-semibold transition duration-200 ${
								on
									? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]'
									: 'border-[var(--rule)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)]'
							}`}
						>
							{c.title}
							<span className={`font-mono text-[0.6875rem] tabular-nums ${on ? 'text-[var(--paper)]/60' : 'text-[var(--ink-mute)]'}`}>{c.count}</span>
						</button>
					)
				})}
			</div>
			<ul className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
				{shown.map((i) => (
					<li key={i.key} className={i.wide ? 'sm:col-span-2' : undefined}>
						{i.node}
					</li>
				))}
			</ul>
		</div>
	)
}
