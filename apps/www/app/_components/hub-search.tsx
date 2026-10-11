'use client'

import { ArrowUpRightIcon, MagnifyingGlassIcon, SparkleIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'

/* ============================================================
   The front page's search

   One field over what the site can open directly — the workspaces,
   the Discover chapters, the seven areas and every town (barangay
   names find their town) — and, for anything else, a question to Jo.
   The index is built on the server and handed down small.
   ============================================================ */

export type HubEntry = { name: string; sub: string; href: string; keys: string }

/** Hands a question to Jo, the assistant docked on every page. */
const askJo = (question: string) => window.dispatchEvent(new CustomEvent('betterbarmm:ask', { detail: question }))

export function HubSearch({
	index,
	quickLinks,
	canAsk,
}: {
	index: HubEntry[]
	quickLinks: { label: string; href: string }[]
	/** Jo is switched on; otherwise there is no "Ask Jo" row. */
	canAsk: boolean
}) {
	const [query, setQuery] = useState('')
	const [cursor, setCursor] = useState(0)

	const hits = useMemo(() => {
		const q = query.trim().toLowerCase()
		if (q.length < 2) return []
		return index
			.map((e) => {
				const name = e.name.toLowerCase()
				const rank = name.startsWith(q) ? 0 : name.includes(q) ? 1 : e.keys.includes(q) ? 2 : -1
				return { e, rank }
			})
			.filter((x) => x.rank >= 0)
			.sort((a, b) => a.rank - b.rank)
			.slice(0, 6)
			.map((x) => x.e)
	}, [index, query])

	// With Jo on, the last row is always "Ask Jo", so there is somewhere to go.
	const rows = query.trim().length >= 2 ? hits.length + (canAsk ? 1 : 0) : 0

	const go = (i: number) => {
		const hit = hits[i]
		if (hit) window.location.href = hit.href
		else if (canAsk) askJo(query)
	}

	return (
		<div className='w-full max-w-[42rem]'>
			<div className='relative'>
			<label className='flex h-16 items-center gap-3 rounded-2xl bg-white px-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.6)] ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-[var(--brass)]'>
				<MagnifyingGlassIcon size={22} className='shrink-0 text-neutral-500' aria-hidden='true' />
				<span className='sr-only'>Search BetterBARMM</span>
				<input
					value={query}
					onChange={(event) => {
						setQuery(event.target.value)
						setCursor(0)
					}}
					onKeyDown={(event) => {
						if (!rows) return
						if (event.key === 'ArrowDown') {
							event.preventDefault()
							setCursor((c) => (c + 1) % rows)
						} else if (event.key === 'ArrowUp') {
							event.preventDefault()
							setCursor((c) => (c - 1 + rows) % rows)
						} else if (event.key === 'Enter') {
							event.preventDefault()
							go(cursor)
						}
					}}
					type='search'
					autoComplete='off'
					placeholder='Search a town, a topic, or ask a question…'
					className='min-w-0 flex-1 bg-transparent text-[16px] text-neutral-900 outline-none placeholder:text-neutral-500 [&::-webkit-search-cancel-button]:hidden'
				/>
			</label>

			{rows ? (
				<ul role='listbox' className='absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-2xl bg-white py-2 text-left shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/5'>
					{hits.map((hit, i) => (
						<li key={hit.href} role='option' aria-selected={cursor === i}>
							<a
								href={hit.href}
								onMouseMove={() => setCursor(i)}
								data-active={cursor === i}
								className='flex items-center justify-between gap-4 px-5 py-3 data-[active=true]:bg-neutral-100'
							>
								<span className='min-w-0'>
									<span className='block truncate text-[15px] font-semibold text-neutral-900'>{hit.name}</span>
									<span className='block truncate text-[12.5px] text-neutral-500'>{hit.sub}</span>
								</span>
								<ArrowUpRightIcon size={16} className='shrink-0 text-neutral-400' aria-hidden='true' />
							</a>
						</li>
					))}
					{canAsk ? (
					<li role='option' aria-selected={cursor === hits.length}>
						<button
							type='button'
							onClick={() => askJo(query)}
							onMouseMove={() => setCursor(hits.length)}
							data-active={cursor === hits.length}
							className='flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left data-[active=true]:bg-neutral-100'
						>
							<SparkleIcon size={18} weight='fill' className='shrink-0 text-[#8f2318]' aria-hidden='true' />
							<span className='min-w-0 truncate text-[15px] text-neutral-900'>
								Ask Jo: <span className='font-semibold'>&ldquo;{query.trim()}&rdquo;</span>
							</span>
						</button>
					</li>
					) : null}
				</ul>
			) : null}
			</div>

			<div className='mt-5 flex flex-wrap justify-center gap-2'>
				{quickLinks.map((link) => (
					<a
						key={link.href}
						href={link.href}
						className='rounded-full bg-white/15 px-4 py-2 text-[13px] font-semibold text-white backdrop-blur transition hover:bg-white/25'
					>
						{link.label}
					</a>
				))}
			</div>
		</div>
	)
}
