'use client'

import { ArrowUpRightIcon, CaretDownIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { peso, type Sector } from '@betterbarmm/budget-data'
import { YearLink } from './year-link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SectorIcon } from './sector-icon'

/* ============================================================
   All 38 sectors, filtered and sorted in the browser

   The same shape as the office list: a field over the list and
   the controls on one row, because 38 rows is small enough to
   ship whole and filter on every keystroke.

   The search reads the name and the description, not the name
   alone. A reader looking for water types "water", and the
   sector that answers them is called Water, Sanitation &
   Hygiene — but somebody looking for schools types "schools",
   which appears only in Education's description.
   ============================================================ */

const SORTS = [
	{ key: 'amount', label: 'Largest', by: (a: Sector, b: Sector) => b.total - a.total },
	{ key: 'lines', label: 'Most lines', by: (a: Sector, b: Sector) => b.count - a.count },
	{ key: 'name', label: 'A–Z', by: (a: Sector, b: Sector) => a.name.localeCompare(b.name) },
] as const

/**
 * The sort as a menu of its own rather than a native `select` (user decision).
 *
 * The same trigger and the same panel as the project browser's filters, so the
 * two controls on this estate open the same way — `.filter-trigger` is already
 * built to the search field's box, and the panel is the browser's own chrome.
 * Closes on Escape or a pointer landing outside it, because a menu that only
 * shuts by clicking its own trigger reads as broken.
 *
 * One choice, not several: the trigger carries the order currently in force, so
 * the control still says what it is doing while it is shut.
 */
function SortMenu({ sort, onPick }: { sort: string; onPick: (key: string) => void }) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)
	const current = SORTS.find((one) => one.key === sort) ?? SORTS[0]

	useEffect(() => {
		if (!open) return
		const onPointerDown = (event: PointerEvent) => {
			if (!ref.current?.contains(event.target as Node)) setOpen(false)
		}
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false)
		}
		document.addEventListener('pointerdown', onPointerDown)
		document.addEventListener('keydown', onKeyDown)
		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			document.removeEventListener('keydown', onKeyDown)
		}
	}, [open])

	return (
		<div ref={ref} className='relative'>
			<button
				type='button'
				aria-expanded={open}
				aria-haspopup='listbox'
				onClick={() => setOpen((was) => !was)}
				className='filter-trigger'
			>
				<span className='bb-label'>Sort</span>
				<span className='text-[var(--ink)]'>{current?.label}</span>
				<CaretDownIcon size={12} weight='bold' aria-hidden='true' />
			</button>

			{open ? (
				/* `z-20`, under the sticky nav's `z-30` — above the rows it covers,
				   below the chrome that should stay on top of page furniture. */
				<div
					role='listbox'
					aria-label='Sort sectors'
					className='absolute right-0 top-full z-20 mt-2 w-[13rem] border border-[var(--ink)] bg-[var(--paper)] p-1 text-left shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)]'
				>
					<span aria-hidden='true' className='absolute inset-x-0 top-0 h-px bg-[var(--brass)]' />

					{SORTS.map((one) => (
						<button
							key={one.key}
							type='button'
							role='option'
							aria-selected={one.key === sort}
							onClick={() => {
								onPick(one.key)
								setOpen(false)
							}}
							className={`block w-full px-3 py-2 text-left text-[13.5px] transition hover:bg-[var(--paper-2)] hover:text-[var(--ink)] ${
								one.key === sort
									? 'font-semibold text-[var(--ink)]'
									: 'text-[var(--ink-2)]'
							}`}
						>
							{one.label}
						</button>
					))}
				</div>
			) : null}
		</div>
	)
}

export function SectorList({ sectors }: { sectors: Sector[] }) {
	const [query, setQuery] = useState('')
	const [sort, setSort] = useState<string>('amount')

	// Against the largest of all 38, not the largest of what survives the
	// filter. Measured against the filtered set, every bar would stretch as the
	// reader typed and a sector's length would mean something different with
	// each keystroke.
	const biggest = useMemo(() => Math.max(...sectors.map((sector) => sector.total), 1), [sectors])

	const shown = useMemo(() => {
		const term = query.trim().toLowerCase()
		const by = SORTS.find((one) => one.key === sort)?.by
		const hits = term
			? sectors.filter(
					(sector) =>
						sector.name.toLowerCase().includes(term) ||
						sector.description.toLowerCase().includes(term),
				)
			: sectors
		return by ? [...hits].sort(by) : hits
	}, [sectors, query, sort])

	return (
		<div>
			<div className='flex flex-col gap-5 pb-8 lg:flex-row lg:items-center lg:justify-between'>
				<label className='finder-field max-w-md'>
					<MagnifyingGlassIcon className='size-4 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
					<span className='sr-only'>Filter sectors</span>
					<input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						type='search'
						autoComplete='off'
						spellCheck={false}
						placeholder='Water, schools, roads…'
						className='min-w-0 flex-1 bg-transparent text-[14.5px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
					/>
				</label>

				<SortMenu sort={sort} onPick={setSort} />
			</div>

			{/* The count comes off the page but not out of the document: `aria-live`
			    is how a reader who cannot see the list learns that typing changed
			    it. */}
			<p aria-live='polite' className='sr-only'>
				{shown.length} of {sectors.length} sectors
			</p>

			<div>
				{shown.map((sector) => (
					<YearLink
						key={sector.slug}
						href={`/sectors/${sector.slug}`}
						/* `py-7`, the measure every list page on this workspace uses — the
						   offices, the programs and the projects included. A reader moving
						   between them should not feel the rhythm change. */
						className='group grid items-center gap-x-10 gap-y-4 border-t border-[var(--rule)] py-7 transition first:border-t-0 hover:bg-[var(--paper-2)] lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)_minmax(0,11rem)]'
					>
						{/* The mark in a column of its own rather than inline in the heading.
						    At 1.25rem, set on the same line as a 1.15rem bold name, it read
						    as a bullet; given its own track it reads as the sector's mark,
						    and the name starts on one left edge down the whole list whatever
						    glyph sits beside it.

						    A flex row, not a fourth grid track: the row collapses to one
						    column below `lg`, where a track would strand the icon alone on a
						    line above its own name. */}
						<div className='flex min-w-0 items-center gap-5'>
							<SectorIcon
								slug={sector.slug}
								className='size-6 shrink-0 text-[var(--brass)] transition duration-500 group-hover:text-[var(--accent)]'
							/>

							<div className='min-w-0'>
								<h2 className='flex items-center gap-2.5 text-[1.15rem] font-bold leading-tight tracking-[-0.03em] text-[var(--ink)] transition duration-500 group-hover:text-[var(--accent)]'>
									{sector.name}
									<ArrowUpRightIcon
										className='size-3.5 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
										aria-hidden='true'
									/>
								</h2>
								<p className='mt-2 text-[12.5px] leading-6 text-[var(--ink-3)]'>
									{sector.description}
								</p>
							</div>
						</div>

						{/* Drawn against the largest sector rather than the whole budget: the
						    sectors overlap, so a bar measured against ₱114 billion would
						    invite adding them up. This one only claims that education is
						    larger than health. */}
						<div className='rank-track rank-track-lg'>
							<div
								className='rank-bar rank-bar-lg'
								style={{ width: `${Math.max(1.5, (sector.total / biggest) * 100)}%` }}
								aria-hidden='true'
							/>
						</div>

						<div className='lg:text-right'>
							<p className='money text-[1.05rem] font-bold tracking-[-0.02em] text-[var(--ink)]'>
								{sector.total > 0 ? peso(sector.total) : '—'}
							</p>
							<p className='money mt-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brass)]'>
								{sector.count} {sector.count === 1 ? 'line' : 'lines'} in program rows
							</p>
						</div>
					</YearLink>
				))}

				{shown.length === 0 ? (
					<p className='py-16 text-center text-[13.5px] leading-7 text-[var(--ink-3)]'>
						No sector matches “{query.trim()}”. The list is 38 sectors wide — try “water”,
						“health” or “roads”, or search the{' '}
						<YearLink href='/programs' className='rule-link'>
							programs
						</YearLink>{' '}
						instead, where every line the Act names is searchable by its own words.
					</p>
				) : null}
			</div>
		</div>
	)
}
