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
			<div role='tablist' aria-label='Filter by topic' className='seg'>
				{chips.map((c) => {
					const on = c.key === active
					return (
						<button
							key={c.key}
							type='button'
							role='tab'
							aria-selected={on}
							onClick={() => setActive(c.key)}
							className='seg-tab'
						>
							{c.title}
							<span className='seg-count'>{c.count}</span>
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
