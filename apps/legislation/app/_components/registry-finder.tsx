'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE } from '@betterbarmm/editorial'
import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { SearchHit } from '../api/search/route'

/* ============================================================
   Finding a measure or a member

   One overlay around the whole registry, opened by the button in the
   header or by pressing "/". The registry is too large to ship to the
   browser, so each pause in typing asks /api/search.
   ============================================================ */

const Context = createContext<{ open: () => void } | null>(null)

export function RegistryFinder({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const [isOpen, setIsOpen] = useState(false)
	const [query, setQuery] = useState('')
	const [hits, setHits] = useState<SearchHit[]>([])
	const [loading, setLoading] = useState(false)
	const [cursor, setCursor] = useState(0)
	const inputRef = useRef<HTMLInputElement>(null)

	const open = useCallback(() => setIsOpen(true), [])
	const close = useCallback(() => {
		setIsOpen(false)
		setQuery('')
		setHits([])
		setCursor(0)
	}, [])

	// A short pause before asking, and a late answer to an old query dropped.
	useEffect(() => {
		const q = query.trim()
		if (q.length < 2) return setHits([])
		const controller = new AbortController()
		setLoading(true)
		const timer = setTimeout(() => {
			fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
				.then((response) => response.json())
				.then((data: { hits: SearchHit[] }) => {
					setHits(data.hits)
					setCursor(0)
					setLoading(false)
				})
				.catch(() => {})
		}, 150)
		return () => {
			clearTimeout(timer)
			controller.abort()
		}
	}, [query])

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null
			if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) return
			if (event.key === '/' || (event.key === 'k' && (event.metaKey || event.ctrlKey))) {
				event.preventDefault()
				setIsOpen(true)
			}
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [])

	useEffect(() => {
		if (isOpen) inputRef.current?.focus()
	}, [isOpen])

	useEffect(() => {
		if (!isOpen) return
		const previous = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = previous
		}
	}, [isOpen])

	const go = (hit: SearchHit) => {
		close()
		router.push(hit.href)
	}

	const onFieldKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Escape') return close()
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			return setCursor((c) => (hits.length ? (c + 1) % hits.length : 0))
		}
		if (event.key === 'ArrowUp') {
			event.preventDefault()
			return setCursor((c) => (hits.length ? (c - 1 + hits.length) % hits.length : 0))
		}
		if (event.key === 'Enter' && hits[cursor]) {
			event.preventDefault()
			go(hits[cursor])
		}
	}

	const value = useMemo(() => ({ open }), [open])
	const typed = query.trim().length >= 2

	return (
		<Context.Provider value={value}>
			{children}

			<AnimatePresence>
				{isOpen ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2, ease: EASE }}
						className='fixed inset-0 z-50 bg-[rgba(12,12,11,0.52)] backdrop-blur-[3px]'
						onMouseDown={(event) => {
							if (event.target === event.currentTarget) close()
						}}
					>
						<motion.div
							role='dialog'
							aria-modal='true'
							aria-label='Search the registry'
							initial={{ opacity: 0, y: -10, scale: 0.99 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -8, scale: 0.99 }}
							transition={{ duration: 0.24, ease: EASE }}
							className='mx-auto mt-[12vh] w-[min(38rem,calc(100vw-2rem))] border border-[var(--ink)] bg-[var(--paper)] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.6)]'
						>
							<span aria-hidden='true' className='block h-px bg-[var(--brass)]' />

							<div className='flex items-center gap-3 border-b border-[var(--rule)] px-5 py-4'>
								<MagnifyingGlassIcon className='size-4 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
								<input
									ref={inputRef}
									value={query}
									onChange={(event) => setQuery(event.target.value)}
									onKeyDown={onFieldKeyDown}
									type='search'
									autoComplete='off'
									spellCheck={false}
									role='combobox'
									aria-expanded={hits.length > 0}
									aria-controls='finder-results'
									placeholder='Bill, act, resolution or member…'
									className='min-w-0 flex-1 bg-transparent text-[16px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
								/>
								<kbd className='hidden shrink-0 border border-[var(--rule)] px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-mute)] sm:block'>
									Esc
								</kbd>
							</div>

							<div id='finder-results' role='listbox' className='max-h-[52vh] overflow-y-auto'>
								{typed
									? hits.map((hit, index) => (
											<button
												key={hit.href}
												type='button'
												role='option'
												aria-selected={index === cursor}
												data-active={index === cursor}
												onClick={() => go(hit)}
												onMouseMove={() => setCursor(index)}
												className='finder-hit'
											>
												<span className='min-w-0 flex-1 text-left'>
													<span className='block truncate text-[15px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
														{hit.title}
													</span>
													<span className='mt-1 block truncate font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
														{hit.meta}
													</span>
												</span>
												<span className='shrink-0 text-right text-[11.5px] text-[var(--ink-3)]'>{hit.kind}</span>
											</button>
										))
									: null}

								{typed && !loading && hits.length === 0 ? (
									<p className='px-5 py-8 text-center text-[13.5px] leading-6 text-[var(--ink-3)]'>
										Nothing in the registry matches “{query.trim()}”.
									</p>
								) : null}

								{!typed ? (
									<p className='px-5 py-8 text-center text-[13.5px] leading-6 text-[var(--ink-3)]'>
										Type two letters. A number works too: “BAA 49”, “Bill 468”.
									</p>
								) : null}
							</div>

							<div className='flex items-center justify-between gap-4 border-t border-[var(--rule)] px-5 py-3 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
								<span>Bills, acts, resolutions and members</span>
								<span className='hidden sm:block'>↑↓ to move · ↵ to open</span>
							</div>
						</motion.div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</Context.Provider>
	)
}

/** The header's search button. */
export function FinderTrigger({ className = '' }: { className?: string }) {
	const context = useContext(Context)
	if (!context) throw new Error('FinderTrigger must be used inside <RegistryFinder>')
	return (
		<button
			type='button'
			onClick={context.open}
			aria-label='Search the registry'
			className={`inline-flex size-9 cursor-pointer items-center justify-center text-[var(--ink-3)] transition hover:text-[var(--ink)] ${className}`}
		>
			<MagnifyingGlassIcon className='size-4' aria-hidden='true' />
		</button>
	)
}
