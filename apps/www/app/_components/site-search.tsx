'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import type { SearchHit } from '../_lib/search-index'

/* One box for every workspace. Results arrive grouped by what they are. */

export function SiteSearch({ initial = '' }: { initial?: string }) {
	const [q, setQ] = useState(initial)
	const [data, setData] = useState<{ hits: SearchHit[]; total: number } | null>(null)

	useEffect(() => {
		const url = new URL(window.location.href)
		if (q) url.searchParams.set('q', q)
		else url.searchParams.delete('q')
		window.history.replaceState(null, '', url)
		if (!q.trim()) return setData(null)
		const controller = new AbortController()
		const timer = setTimeout(() => {
			fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
				.then((r) => r.json())
				.then(setData)
				.catch(() => {})
		}, 200)
		return () => {
			clearTimeout(timer)
			controller.abort()
		}
	}, [q])

	const groups = new Map<string, SearchHit[]>()
	for (const h of data?.hits ?? []) groups.set(h.kind, [...(groups.get(h.kind) ?? []), h])

	return (
		<div>
			<label className='flex max-w-[40rem] items-center gap-3 border border-[var(--rule)] bg-[var(--paper)] px-4 py-3.5'>
				<MagnifyingGlassIcon size={20} className='text-[var(--ink-3)]' aria-hidden='true' />
				<input
					type='search'
					value={q}
					onChange={(e) => setQ(e.target.value)}
					placeholder='A town, a law, a member, an office, a supplier'
					aria-label='Search every workspace'
					className='w-full bg-transparent text-[1rem] outline-none placeholder:text-[var(--ink-mute)]'
					autoFocus
				/>
			</label>
			{data ? (
				<p className='mt-4 text-[0.8125rem] text-[var(--ink-3)]'>
					{data.total ? `${data.total.toLocaleString('en-PH')} found${data.total > data.hits.length ? `, the best ${data.hits.length} shown` : ''}` : 'Nothing by that name.'}
				</p>
			) : null}
			<div className='mt-10 grid gap-x-16 gap-y-12 lg:grid-cols-2'>
				{[...groups].map(([kind, hits]) => (
					<section key={kind}>
						<h2 className='bb-label'>{kind}</h2>
						<ul className='mt-3'>
							{hits.map((h) => (
								<li key={h.href + h.title} className='border-t border-[var(--rule)] py-3'>
									<a href={h.href} className='text-[0.9375rem] font-semibold leading-6 text-[var(--ink)] hover:text-[var(--accent)]'>
										{h.title}
									</a>
									<p className='mt-0.5 text-[0.78125rem] text-[var(--ink-3)]'>{h.detail}</p>
								</li>
							))}
						</ul>
					</section>
				))}
			</div>
		</div>
	)
}
