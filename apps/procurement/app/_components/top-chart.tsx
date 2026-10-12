'use client'

import { useState } from 'react'

/* The top 15 of several rankings in one chart: a tab picks the ranking,
   each entry a column, its figure on top and its name under it. */

export type TopRanking = {
	key: string
	tab: string
	note: string
	format: 'peso' | 'count'
	items: { label: string; value: number; href?: string }[]
}

const peso = (n: number) =>
	n >= 1e9 ? `₱${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `₱${(n / 1e6).toFixed(1)}M` : `₱${Math.round(n).toLocaleString('en-PH')}`

export function TopChart({ title, rankings }: { title: string; rankings: TopRanking[] }) {
	const [key, setKey] = useState(rankings[0]!.key)
	const r = rankings.find((x) => x.key === key)!
	const max = Math.max(...r.items.map((i) => i.value), 1)
	const show = (v: number) => (r.format === 'peso' ? peso(v) : v.toLocaleString('en-PH'))

	return (
		<figure className='m-0'>
			<div className='flex flex-wrap items-center justify-between gap-x-10 gap-y-4'>
				<div>
					<h2 className='text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>{title}</h2>
					<p className='mt-2 text-[14px] leading-6 text-[var(--ink-3)]'>{r.note}</p>
				</div>
				<div role='tablist' aria-label='Ranking' className='-mx-4 flex max-w-[calc(100%+2rem)] gap-1 overflow-x-auto px-4 sm:mx-0 sm:max-w-full sm:px-0'>
					{rankings.map((x) => (
						<button
							key={x.key}
							type='button'
							role='tab'
							aria-selected={x.key === key}
							onClick={() => setKey(x.key)}
							className={`shrink-0 cursor-pointer px-3.5 py-2 text-[13.5px] font-semibold transition ${
								x.key === key ? 'bg-[var(--accent)] text-white' : 'bg-[var(--paper-2)] text-[var(--ink-2)] hover:text-[var(--ink)]'
							}`}
						>
							{x.tab}
						</button>
					))}
				</div>
			</div>

			<div className='-mx-4 mt-10 overflow-x-auto px-4 sm:mx-0 sm:px-0'>
				<ol className='grid min-w-[80rem] grid-cols-15 gap-x-1.5 lg:min-w-0'>
					{r.items.map((item, i) => {
						const label = item.href ? (
							<a href={item.href} className='hover:text-[var(--accent)]'>
								{item.label}
							</a>
						) : (
							item.label
						)
						return (
							<li key={item.label} className='group flex min-w-0 flex-col'>
								<div className='flex h-64 flex-col justify-end border-b border-[var(--rule)]'>
									<span className='num mb-1.5 text-center text-[11px] font-semibold text-[var(--ink-2)]'>{show(item.value)}</span>
									<span
										title={`${item.label}: ${show(item.value)}`}
										className='bg-[var(--accent)] transition-opacity group-hover:opacity-80'
										style={{ height: `${Math.max((item.value / max) * 85, 1)}%` }}
									/>
								</div>
								<p className='num mt-2 text-center text-[10.5px] text-[var(--ink-mute)]'>{i + 1}</p>
								<p className='mt-1 line-clamp-4 text-center break-words text-[10px] tracking-[-0.01em] font-semibold leading-[1.35] text-[var(--ink)]' title={item.label}>
									{label}
								</p>
							</li>
						)
					})}
				</ol>
			</div>
		</figure>
	)
}
