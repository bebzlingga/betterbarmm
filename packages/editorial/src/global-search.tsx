'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'

/* ============================================================
   Search, from anywhere in the estate

   The strip's "Search" opens a box over the page (or ⌘K / Ctrl+K)
   that asks the landing site's index — every town, law, member,
   office and supplier — and lists the best matches as you type.
   The full /search page is one link away for the rest.
   ============================================================ */

type Hit = { kind: string; title: string; detail: string; href: string }

export function GlobalSearch({ base = '' }: { base?: string }) {
	const dialog = useRef<HTMLDialogElement>(null)
	const [q, setQ] = useState('')
	const [data, setData] = useState<{ hits: Hit[]; total: number } | null>(null)
	const [active, setActive] = useState(0)

	const open = () => {
		dialog.current?.showModal()
	}

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault()
				open()
			}
		}
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [])

	useEffect(() => {
		setActive(0)
		if (!q.trim()) return setData(null)
		// Off the landing site the index is another origin; in development, its dev server.
		const api = base && /^(localhost|127\.)/.test(window.location.hostname) ? 'http://localhost:3010' : base
		const controller = new AbortController()
		const timer = setTimeout(() => {
			fetch(`${api}/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
				.then((r) => r.json())
				.then((d: { hits: Hit[]; total: number }) => setData({ hits: d.hits.slice(0, 8), total: d.total }))
				.catch(() => {})
		}, 180)
		return () => {
			clearTimeout(timer)
			controller.abort()
		}
	}, [q, base])

	const hits = data?.hits ?? []
	const all = `${base}/search?q=${encodeURIComponent(q)}`

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault()
			if (hits.length) setActive((i) => (i + (e.key === 'ArrowDown' ? 1 : hits.length - 1)) % hits.length)
		} else if (e.key === 'Enter' && q.trim()) {
			e.preventDefault()
			window.location.href = hits[active]?.href ?? all
		}
	}

	return (
		<>
			<button
				type='button'
				onClick={open}
				title='Search (⌘K)'
				className='utility-bar-link cursor-pointer [font:inherit] [letter-spacing:inherit] [text-transform:inherit]'
			>
				<MagnifyingGlassIcon size={13} weight='bold' aria-hidden='true' />
				Search
			</button>

			<dialog
				ref={dialog}
				aria-label='Search every workspace'
				// A click on the backdrop lands on the dialog itself. It sits in the utility bar, whose
				// semibold capitals it would otherwise inherit; titles and labels set their own weight.
				onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
				className='m-0 mx-auto mt-[12vh] w-[min(40rem,calc(100vw-2rem))] max-w-none border border-[var(--ink)] bg-[var(--paper)] p-0 text-[var(--ink)] font-normal normal-case tracking-normal shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)] backdrop:bg-black/45'
			>
				<label className='flex items-center gap-3 border-b border-[var(--rule)] px-4 py-3.5'>
					<MagnifyingGlassIcon size={18} className='shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
					<input
						type='search'
						value={q}
						onChange={(e) => setQ(e.target.value)}
						onKeyDown={onKeyDown}
						placeholder='A town, a law, a member, an office, a supplier'
						aria-label='Search every workspace'
						className='w-full bg-transparent text-[16px] outline-none placeholder:text-[var(--ink-mute)]'
						autoFocus
					/>
					<kbd className='hidden shrink-0 border border-[var(--rule)] px-1.5 text-[10px] text-[var(--ink-mute)] sm:inline'>Esc</kbd>
				</label>

				{hits.length ? (
					<ul className='max-h-[55vh] overflow-y-auto p-1'>
						{hits.map((h, i) => (
							<li key={h.href + h.title}>
								<a
									href={h.href}
									onMouseEnter={() => setActive(i)}
									className={`flex items-baseline justify-between gap-4 px-3 py-2.5 ${i === active ? 'bg-[var(--paper-2)]' : ''}`}
								>
									<span className='min-w-0'>
										<span className='block truncate text-[14px] font-semibold text-[var(--ink)]'>{h.title}</span>
										<span className='block truncate text-[12px] text-[var(--ink-3)]'>{h.detail}</span>
									</span>
									<span className='shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]'>{h.kind}</span>
								</a>
							</li>
						))}
					</ul>
				) : (
					<p className='px-6 py-7 text-[13.5px] leading-[1.6] text-[var(--ink-3)]'>
						{data ? 'Nothing by that name.' : 'Every workspace at once: towns and barangays, laws, members, budget and procurement offices, suppliers.'}
					</p>
				)}

				{data && data.total > hits.length ? (
					<a href={all} className='block border-t border-[var(--rule)] px-4 py-3 text-[12.5px] font-semibold text-[var(--accent)]'>
						All {data.total.toLocaleString('en-PH')} results →
					</a>
				) : null}
			</dialog>
		</>
	)
}
