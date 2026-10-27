'use client'

import { ArrowUpRightIcon, CaretDownIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { type Sector } from '@betterbarmm/budget-data'
import { YearLink } from './year-link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SectorIcon } from './sector-icon'
import { Money } from './money'
import { HEAD_ROW, ROW, SUB, TABLE, TD, TD_NUM, TH, TH_NUM } from './table'

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
							className={`block w-full px-3 py-2 text-left text-[0.84375rem] transition hover:bg-[var(--paper-2)] hover:text-[var(--ink)] ${
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
						className='min-w-0 flex-1 bg-transparent text-[0.90625rem] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
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

			{/* A table (user decision): the sector, its length against the largest, the lines and the amount. */}
			<div>
				<table className={TABLE}>
					<caption className='sr-only'>Every sector in the Act</caption>
					<thead>
						<tr className={HEAD_ROW}>
							<th scope='col' className={TH}>
								Sector
							</th>
							<th scope='col' className={`${TH} hidden lg:table-cell`}>
								<span className='sr-only'>Against the largest</span>
							</th>
							<th scope='col' className={`${TH_NUM} hidden sm:table-cell`}>
								Lines
							</th>
							<th scope='col' className={TH_NUM}>
								Amount
							</th>
						</tr>
					</thead>
					<tbody>
						{shown.map((sector) => (
							<tr key={sector.slug} className={ROW}>
								<th scope='row' className={`${TD} font-normal`}>
									<span className='flex items-start gap-4'>
										<SectorIcon slug={sector.slug} className='mt-0.5 size-5 shrink-0 text-[var(--brass)]' />
										<span className='min-w-0'>
											<YearLink
												href={`/sectors/${sector.slug}`}
												className='inline-flex items-baseline gap-2 text-[0.96875rem] font-bold leading-snug tracking-[-0.02em] text-[var(--ink)] transition hover:text-[var(--accent)]'
											>
												{sector.name}
												<ArrowUpRightIcon className='size-3.5 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
											</YearLink>
											<span className={SUB}>{sector.description}</span>
										</span>
									</span>
								</th>
								{/* Drawn against the largest sector rather than the whole budget: the sectors overlap, so a bar
								    measured against the total would invite adding them up. */}
								<td className={`${TD} hidden w-[16rem] pt-[1.35rem] lg:table-cell`}>
									<div className='rank-track'>
										<div className='rank-bar' style={{ width: `${Math.max(1.5, (sector.total / biggest) * 100)}%` }} aria-hidden='true' />
									</div>
								</td>
								<td className={`${TD_NUM} hidden font-mono text-[0.75rem] text-[var(--ink-3)] sm:table-cell`}>{sector.count}</td>
								<td className={TD_NUM}>{sector.total > 0 ? <Money amount={sector.total} /> : '—'}</td>
							</tr>
						))}
					</tbody>
				</table>

				{shown.length === 0 ? (
					<p className='py-16 text-center text-[0.84375rem] leading-7 text-[var(--ink-3)]'>
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
