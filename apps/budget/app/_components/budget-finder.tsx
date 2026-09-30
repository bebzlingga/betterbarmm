'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE } from '@betterbarmm/editorial'
import { budget, peso, searchBudget, type Hit } from '@betterbarmm/budget-data'
import { useRouter } from 'next/navigation'
import { carriedYearNow, withYear } from './year-link'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

/* ============================================================
   Finding the money you came for

   A budget of 44 offices, 246 programs, 207 rules and 258 named
   projects has no useful front door but a search box. A menu of
   ministries asks the reader to already know which ministry builds
   roads, which is the hard half of the question and not the half
   anybody arrives with — they arrive with "scholarship", "Marawi",
   "hospital".

   So: one overlay, mounted once around the whole workspace, opened
   from anywhere by the button in the header or by pressing "/". It
   searches every kind at once and says which kind each hit is,
   because "Health Facilities Enhancement" being a program rather
   than an office is most of what a reader needs to know about it.
   ============================================================ */

type FinderContext = { open: () => void }

const Context = createContext<FinderContext | null>(null)

export function useBudgetFinder(): FinderContext {
	const value = useContext(Context)
	if (!value) throw new Error('useBudgetFinder must be used inside <BudgetFinder>')
	return value
}

const KIND: Record<Hit['type'], string> = {
	sector: 'Sector',
	office: 'Office',
	program: 'Program',
	provision: 'Rule',
	project: 'Project',
}

function HitRow({
	hit,
	active,
	onSelect,
	onHover,
}: {
	hit: Hit
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
					{hit.title}
				</span>
				<span className='mt-1 block truncate font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
					{KIND[hit.type]} · {hit.where}
				</span>
			</span>

			{/* Most provisions state no figure of their own — they are a rule about
			    money counted elsewhere, and an invented total would be worse than
			    a blank. */}
			<span className='money shrink-0 text-right text-[12px] font-semibold text-[var(--ink-2)]'>
				{hit.amount == null ? '—' : peso(hit.amount)}
			</span>
		</button>
	)
}

/**
 * The overlay, plus the context that lets any button open it.
 *
 * Results are recomputed on every keystroke over the whole Act, without an
 * index or a request. That is 555 rows of substring matching — small enough
 * that anything cleverer would take longer to download than it saves. Capped
 * at eight so the panel never runs past the fold on a phone.
 */
export function BudgetFinder({ children }: { children: React.ReactNode }) {
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

	const hits = useMemo(() => searchBudget(query), [query])

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

	const go = (hit: Hit) => {
		close()
		// The result opens in the year the reader is in, not the year the index
		// happens to be built from.
		router.push(withYear(hit.href, carriedYearNow()))
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
							aria-label='Search the budget'
							initial={{ opacity: 0, y: -10, scale: 0.99 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -8, scale: 0.99 }}
							transition={{ duration: 0.24, ease: EASE }}
							className='mx-auto mt-[12vh] w-[min(40rem,calc(100vw-2rem))] border border-[var(--ink)] bg-[var(--paper)] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.6)]'
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
									aria-controls='budget-finder-results'
									placeholder='Health, scholarship, Marawi, bridges…'
									className='min-w-0 flex-1 bg-transparent text-[16px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
								/>
								<kbd className='hidden shrink-0 border border-[var(--rule)] px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-mute)] sm:block'>
									Esc
								</kbd>
							</div>

							<div id='budget-finder-results' role='listbox' className='max-h-[52vh] overflow-y-auto'>
								{hits.map((hit, index) => (
									<HitRow
										key={`${hit.type}-${hit.href}-${hit.title}`}
										hit={hit}
										active={index === cursor}
										onSelect={() => go(hit)}
										onHover={() => setCursor(index)}
									/>
								))}

								{query.trim().length >= 2 && hits.length === 0 ? (
									<p className='px-5 py-8 text-center text-[13.5px] leading-6 text-[var(--ink-3)]'>
										Nothing in the FY {budget.fiscalYear} Act matches “{query.trim()}”. Only this
										one fiscal year is here, and the Act names things in its own words — try
										“scholarship” rather than “student aid”.
									</p>
								) : null}

								{query.trim().length < 2 ? (
									<p className='px-5 py-8 text-center text-[13.5px] leading-6 text-[var(--ink-3)]'>
										Type two letters. Sectors, offices, programs, the rules attached to them
										and the {budget.projectCount} named construction projects are all searched at
										once — a province finds the projects in it, “bridge” finds every bridge.
									</p>
								) : null}
							</div>

							<div className='flex items-center justify-between gap-4 border-t border-[var(--rule)] px-5 py-3 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
								<span>
									{budget.sectorCount} sectors · {budget.officeCount + budget.fundCount} offices ·{' '}
									{budget.programCount} programs · {budget.provisionCount} rules ·{' '}
									{budget.projectCount} projects
								</span>
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
	const { open } = useBudgetFinder()

	if (variant === 'field') {
		return (
			<button type='button' onClick={open} className={`finder-field ${className}`}>
				<MagnifyingGlassIcon className='size-4 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
				<span className='flex-1 text-left text-[14.5px] text-[var(--ink-mute)]'>
					Search an office, a program, or a project near you
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
			aria-label='Search the budget'
			className='inline-flex size-9 cursor-pointer items-center justify-center border border-[var(--rule)] text-[var(--ink-3)] transition hover:border-[var(--ink)] hover:text-[var(--ink)]'
		>
			<MagnifyingGlassIcon className='size-4' aria-hidden='true' />
		</button>
	)
}
