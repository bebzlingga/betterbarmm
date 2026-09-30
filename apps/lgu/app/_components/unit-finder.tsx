'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE } from '@betterbarmm/editorial'
import { formatNumber, searchUnits, type LguIndexEntry } from '@betterbarmm/lgu-data'
import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

/* ============================================================
   Finding your own town

   A directory of 108 units with no way in but a province menu asks the
   reader to already know which province they live in — which is the
   easy half of the question, and not the half anyone arrives with. So
   this is one overlay, mounted once around the whole workspace, opened
   from anywhere by the button in the header or by pressing "/".

   It searches barangay names too. A reader who knows their barangay and
   not their municipality is the common case in the Special Geographic
   Area, where eight municipalities were carved out of towns whose names
   people still use.
   ============================================================ */

type FinderContext = { open: () => void }

const Context = createContext<FinderContext | null>(null)

export function useUnitFinder(): FinderContext {
	const value = useContext(Context)
	if (!value) throw new Error('useUnitFinder must be used inside <UnitFinder>')
	return value
}

/** One hit. The matched line is the unit; the line under it says where it is. */
function Hit({
	entry,
	active,
	onSelect,
	onHover,
}: {
	entry: LguIndexEntry
	active: boolean
	onSelect: () => void
	onHover: () => void
}) {
	return (
		<button
			type='button'
			role='option'
			aria-selected={active}
			onClick={onSelect}
			onMouseMove={onHover}
			data-active={active}
			className='finder-hit'
		>
			<span className='min-w-0 flex-1 text-left'>
				<span className='block truncate text-[15px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
					{entry.name}
					{entry.unit.isCapital ? (
						<span className='ml-2 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>
							Capital
						</span>
					) : null}
				</span>
				<span className='mt-1 block truncate font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
					{entry.unit.isCity ? 'City' : 'Municipality'} · {entry.province.name}
					{entry.unit.alsoKnownAs ? ` · also ${entry.unit.alsoKnownAs}` : ''}
				</span>
			</span>

			<span className='num shrink-0 text-right text-[11.5px] text-[var(--ink-3)]'>
				{entry.unit.population == null ? '—' : formatNumber(entry.unit.population)}
				<span className='ml-1 text-[var(--ink-mute)]'>people</span>
			</span>
		</button>
	)
}

/**
 * The overlay itself, plus the context that lets any button open it.
 *
 * Results are recomputed on every keystroke over the whole region without an
 * index or a request — 108 units is small enough that anything cleverer would
 * be slower to load than it saves. The list is capped at eight so the panel
 * never grows past the fold on a phone.
 */
export function UnitFinder({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const [isOpen, setIsOpen] = useState(false)
	const [query, setQuery] = useState('')
	const [cursor, setCursor] = useState(0)
	const inputRef = useRef<HTMLInputElement>(null)

	const open = useCallback(() => setIsOpen(true), [])
	const close = useCallback(() => {
		setIsOpen(false)
		setQuery('')
		setCursor(0)
	}, [])

	const hits = useMemo(() => searchUnits(query), [query])

	// "/" opens the finder from anywhere, the way a search field on a reference
	// site is expected to. Guarded so it does not steal the key from someone
	// typing a slash into a field.
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null
			const typing =
				target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
			if (typing) return

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

	// The page behind a modal should not scroll under it.
	useEffect(() => {
		if (!isOpen) return
		const previous = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = previous
		}
	}, [isOpen])

	const go = (entry: LguIndexEntry) => {
		close()
		router.push(entry.href)
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
						/* A literal dark wash rather than one mixed from --ink: --ink
					   inverts with the theme, and a scrim built from it turns into a
					   sheet of light over a dark page. */
						className='fixed inset-0 z-50 bg-[rgba(12,12,11,0.52)] backdrop-blur-[3px]'
						onMouseDown={(event) => {
							if (event.target === event.currentTarget) close()
						}}
					>
						<motion.div
							role='dialog'
							aria-modal='true'
							aria-label='Find a city or municipality'
							initial={{ opacity: 0, y: -10, scale: 0.99 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -8, scale: 0.99 }}
							transition={{ duration: 0.24, ease: EASE }}
							className='mx-auto mt-[12vh] w-[min(38rem,calc(100vw-2rem))] border border-[var(--ink)] bg-[var(--paper)] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.6)]'
						>
							<span aria-hidden='true' className='block h-px bg-[var(--brass)]' />

							<div className='flex items-center gap-3 border-b border-[var(--rule)] px-5 py-4'>
								<MagnifyingGlassIcon
									className='size-4 shrink-0 text-[var(--ink-3)]'
									aria-hidden='true'
								/>
								<input
									ref={inputRef}
									value={query}
									onChange={(event) => {
										setQuery(event.target.value)
										setCursor(0)
									}}
									onKeyDown={onFieldKeyDown}
									type='search'
									autoComplete='off'
									spellCheck={false}
									role='combobox'
									aria-expanded={hits.length > 0}
									aria-controls='finder-results'
									placeholder='Town, city, or barangay…'
									className='min-w-0 flex-1 bg-transparent text-[16px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
								/>
								<kbd className='hidden shrink-0 border border-[var(--rule)] px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-mute)] sm:block'>
									Esc
								</kbd>
							</div>

							<div id='finder-results' role='listbox' className='max-h-[52vh] overflow-y-auto'>
								{hits.map((entry, index) => (
									<Hit
										key={entry.href}
										entry={entry}
										active={index === cursor}
										onSelect={() => go(entry)}
										onHover={() => setCursor(index)}
									/>
								))}

								{query.trim().length >= 2 && hits.length === 0 ? (
									<p className='px-5 py-8 text-center text-[13.5px] leading-6 text-[var(--ink-3)]'>
										Nothing in the directory matches “{query.trim()}”. Sulu is not in BARMM and is
										not here; barangay-only names may be spelled differently in PSA&rsquo;s record.
									</p>
								) : null}

								{query.trim().length < 2 ? (
									<p className='px-5 py-8 text-center text-[13.5px] leading-6 text-[var(--ink-3)]'>
										Type two letters. Barangay names count too — search the village and the town
										that holds it comes up.
									</p>
								) : null}
							</div>

							<div className='flex items-center justify-between gap-4 border-t border-[var(--rule)] px-5 py-3 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
								<span>108 cities and municipalities</span>
								<span className='hidden sm:block'>↑↓ to move · ↵ to open</span>
							</div>
						</motion.div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</Context.Provider>
	)
}

/**
 * The way in, wherever it is placed.
 *
 * `variant='field'` draws it as the search box it opens, which is what the
 * home page wants above the fold; `variant='icon'` is the header's compact
 * form. Both are buttons rather than inputs — a real field here would take
 * focus and then have to hand it to the overlay's field, which loses the first
 * keystroke on a slow phone.
 */
export function FinderTrigger({
	variant = 'icon',
	className = '',
}: {
	variant?: 'icon' | 'field'
	className?: string
}) {
	const { open } = useUnitFinder()

	if (variant === 'field') {
		return (
			<button type='button' onClick={open} className={`finder-field ${className}`}>
				<MagnifyingGlassIcon className='size-4 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
				<span className='flex-1 text-left text-[14.5px] text-[var(--ink-mute)]'>
					Find your city, municipality or barangay
				</span>
				<kbd className='hidden shrink-0 border border-[var(--rule)] px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-mute)] sm:block'>
					/
				</kbd>
			</button>
		)
	}

	return (
		<button
			type='button'
			onClick={open}
			aria-label='Find a city or municipality'
			className={`inline-flex size-9 cursor-pointer items-center justify-center border border-[var(--rule)] text-[var(--ink-3)] transition hover:border-[var(--ink)] hover:text-[var(--ink)] ${className}`}
		>
			<MagnifyingGlassIcon className='size-4' aria-hidden='true' />
		</button>
	)
}
