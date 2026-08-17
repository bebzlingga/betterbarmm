'use client'

import { FunnelIcon, XIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { statusToneClass } from '../_lib/labels'
import type { FilterOption, LegislationDataset, LegislationRecord } from '../_lib/legislation-data'
import { RecordDetail } from './record-detail'

type SortKey = 'newest' | 'oldest' | 'number-desc' | 'number-asc'

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
	{ value: 'number-desc', label: 'Highest number first' },
	{ value: 'number-asc', label: 'Lowest number first' },
	{ value: 'newest', label: 'Most recent first' },
	{ value: 'oldest', label: 'Oldest first' },
]

/** How many chips to show before a group collapses behind "Show all". */
const CHIP_LIMIT = 8

/**
 * How many rows are rendered at a time.
 *
 * A category runs to a thousand records, and a reader looking for one of them
 * narrows or searches rather than scrolling past all of it. Rendering the
 * whole list costs layout on every keystroke for rows nobody reaches, so the
 * list grows a page at a time instead.
 */
const PAGE_SIZE = 30

type FilterGroupKey = 'kinds' | 'statuses' | 'sectors' | 'types' | 'sessions' | 'years'

type ActiveFilters = Record<FilterGroupKey, Set<string>>

const emptyFilters = (): ActiveFilters => ({
	kinds: new Set(),
	statuses: new Set(),
	sectors: new Set(),
	types: new Set(),
	sessions: new Set(),
	years: new Set(),
})

function FilterGroup({
	label,
	options,
	selected,
	onToggle,
}: {
	label: string
	options: FilterOption[]
	selected: Set<string>
	onToggle: (value: string) => void
}) {
	const [expanded, setExpanded] = useState(false)

	if (options.length === 0) return null

	const visible = expanded ? options : options.slice(0, CHIP_LIMIT)
	const hiddenCount = options.length - visible.length

	return (
		<div className='grid gap-3'>
			<p className='label label-strong'>{label}</p>
			<div className='flex flex-wrap gap-2'>
				{visible.map((option) => (
					<button
						key={option.value}
						type='button'
						aria-pressed={selected.has(option.value)}
						onClick={() => onToggle(option.value)}
						className='chip'
					>
						{option.label}
						<span className='chip-count'>{option.count}</span>
					</button>
				))}

				{hiddenCount > 0 ? (
					<button type='button' onClick={() => setExpanded(true)} className='chip border-dashed'>
						+{hiddenCount} more
					</button>
				) : null}
			</div>
		</div>
	)
}

export function RecordBrowser({
	dataset,
	memberSlugs,
}: {
	dataset: LegislationDataset
	memberSlugs?: Record<string, string>
}) {
	const { records, category } = dataset
	const router = useRouter()

	const [query, setQuery] = useState('')
	const [filters, setFilters] = useState<ActiveFilters>(emptyFilters)
	const [sort, setSort] = useState<SortKey>('number-desc')
	// Closed by default: the list is what a reader came for, and it gets the
	// full width until they ask to narrow it. The button says what is behind it.
	const [filtersOpen, setFiltersOpen] = useState(false)
	const [selected, setSelected] = useState<LegislationRecord | null>(null)
	const [pageCount, setPageCount] = useState(1)

	// Deferring the query keeps typing responsive while the list re-filters.
	const deferredQuery = useDeferredValue(query)

	/* --- deep linking: ?focus=<number> opens a record, and opening one
	   updates the URL so any record can be shared or bookmarked. --- */

	useEffect(() => {
		const focus = new URLSearchParams(window.location.search).get('focus')
		if (!focus) return

		const match = records.find((record) => String(record.number) === focus)
		if (match) setSelected(match)
	}, [records])

	const openRecord = useCallback((record: LegislationRecord) => {
		setSelected(record)
		const params = new URLSearchParams(window.location.search)
		params.set('focus', String(record.number))
		window.history.replaceState(null, '', `?${params.toString()}`)
	}, [])

	const closeRecord = useCallback(() => {
		setSelected(null)
		const params = new URLSearchParams(window.location.search)
		params.delete('focus')
		const search = params.toString()
		window.history.replaceState(null, '', search ? `?${search}` : window.location.pathname)
	}, [])

	/* --- filtering --- */

	const toggleFilter = useCallback((group: FilterGroupKey, value: string) => {
		setFilters((current) => {
			const next = new Set(current[group])
			if (next.has(value)) next.delete(value)
			else next.add(value)
			return { ...current, [group]: next }
		})
	}, [])

	const activeCount = useMemo(
		() => Object.values(filters).reduce((total, set) => total + set.size, 0),
		[filters],
	)

	const clearAll = useCallback(() => {
		setQuery('')
		setFilters(emptyFilters())
	}, [])

	const visibleRecords = useMemo(() => {
		const needle = deferredQuery.trim().toLowerCase()

		const filtered = records.filter((record) => {
			if (needle && !record.searchText.includes(needle)) return false

			// Which of Parliament's lists it came from — adopted or proposed.
			if (filters.kinds.size > 0 && !filters.kinds.has(record.category)) return false

			if (filters.statuses.size > 0 && !filters.statuses.has(record.status)) return false
			if (filters.years.size > 0 && !filters.years.has(record.year)) return false
			if (filters.sessions.size > 0 && !(record.session && filters.sessions.has(record.session)))
				return false

			// Tag groups match if the record carries ANY of the selected tags.
			if (filters.sectors.size > 0 && !record.sectors.some((tag) => filters.sectors.has(tag.value)))
				return false

			if (filters.types.size > 0 && !record.types.some((tag) => filters.types.has(tag.value)))
				return false

			return true
		})

		const sorted = [...filtered]

		switch (sort) {
			case 'number-asc':
				sorted.sort((left, right) => left.number - right.number)
				break
			case 'newest':
				sorted.sort((left, right) => (right.dateIso ?? '').localeCompare(left.dateIso ?? ''))
				break
			case 'oldest':
				sorted.sort((left, right) => (left.dateIso ?? '').localeCompare(right.dateIso ?? ''))
				break
			default:
				sorted.sort((left, right) => right.number - left.number)
		}

		return sorted
	}, [deferredQuery, filters, records, sort])

	// Narrowing the list starts it again from the top: the rows a reader has
	// already paged past are not the rows their new query is about.
	useEffect(() => {
		setPageCount(1)
	}, [deferredQuery, filters, sort])

	const shown = Math.min(pageCount * PAGE_SIZE, visibleRecords.length)
	const remaining = visibleRecords.length - shown
	const isStale = query !== deferredQuery

	return (
		<>
			<section className='mx-auto max-w-[88rem] px-6 py-12 lg:px-8'>
				{/* Filters stand open in a column of their own rather than behind a
				    toggle: on a registry the facets are half the point, and seeing
				    what can be narrowed is what tells a reader the list is narrowable
				    at all. The column sticks while the list scrolls past it, and the
				    button beside the search folds it away for a reader who would
				    rather have the width. */}
				{/* Both axes animate, because the column is a column on a wide screen
				    and a stacked block on a narrow one: the track width closes to
				    nothing at `lg`, and everywhere the inner wrapper collapses its
				    own row from `1fr` to `0fr`. */}
				<div
					className={`grid gap-10 transition-[grid-template-columns,column-gap] duration-300 ease-out ${
						filtersOpen
							? 'lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-24 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] xl:gap-32'
							: 'lg:grid-cols-[minmax(0,0rem)_minmax(0,1fr)] lg:gap-0 xl:grid-cols-[minmax(0,0rem)_minmax(0,1fr)] xl:gap-0'
					}`}
				>
					{/* ---- Column one: filters ----

					    The sticky element carries no overflow of its own: clipping it
					    would make it its own scrollport and sticky would stop tracking
					    the page. The wrapper inside does the clipping instead. */}
					<aside
						id='record-filters'
						aria-hidden={!filtersOpen}
						className='lg:sticky lg:top-24 lg:self-start'
					>
						<div
							className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
								filtersOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
							}`}
						>
							{/* No heading over these: the chips say what they are, and the
							    "Clear search and filters" link over the list already resets
							    them. */}
							<div className='grid min-h-0 gap-6 overflow-hidden lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-1'>
								{/* Only on a view that reads more than one of Parliament's lists,
							    where it is the first question a reader has: adopted, or still
							    pending. Empty everywhere else, and an empty group renders
							    nothing. */}
								<FilterGroup
									label='Adopted or proposed'
									options={dataset.kinds}
									selected={filters.kinds}
									onToggle={(value) => toggleFilter('kinds', value)}
								/>
								<FilterGroup
									label='Status'
									options={dataset.statuses}
									selected={filters.statuses}
									onToggle={(value) => toggleFilter('statuses', value)}
								/>
								<FilterGroup
									label='Sector'
									options={dataset.sectors}
									selected={filters.sectors}
									onToggle={(value) => toggleFilter('sectors', value)}
								/>
								<FilterGroup
									label='Measure type'
									options={dataset.types}
									selected={filters.types}
									onToggle={(value) => toggleFilter('types', value)}
								/>
								<FilterGroup
									label='Session'
									options={dataset.sessions}
									selected={filters.sessions}
									onToggle={(value) => toggleFilter('sessions', value)}
								/>
								<FilterGroup
									label='Year'
									options={dataset.years}
									selected={filters.years}
									onToggle={(value) => toggleFilter('years', value)}
								/>
							</div>
						</div>
					</aside>

					{/* ---- Column two: search, then the list it searches ---- */}
					<div className='min-w-0'>
						{/* The search field takes 60% of the row rather than all of it —
						    a full-width box over a list of short rows reads heavier than
						    the thing it searches. The filter toggle sits to its left,
						    where the column it controls begins. */}
						<div className='grid gap-2.5 sm:grid-cols-[auto_60%_1fr] sm:items-center'>
							<button
								type='button'
								onClick={() => setFiltersOpen((current) => !current)}
								aria-expanded={filtersOpen}
								aria-controls='record-filters'
								className='btn btn-quiet btn-field h-11 shrink-0'
							>
								{/* The icon says what the button will do next: a funnel to
								    open the facets, a cross to put them away. */}
								{filtersOpen ? (
									<XIcon size={15} weight='bold' aria-hidden='true' />
								) : (
									<FunnelIcon
										size={15}
										weight={activeCount > 0 ? 'fill' : 'regular'}
										aria-hidden='true'
									/>
								)}
								<span className='hidden sm:inline'>Filters</span>
								{activeCount > 0 ? (
									<span className='num inline-flex size-[18px] items-center justify-center rounded-full bg-[var(--ink)] text-[11px] text-[var(--paper)]'>
										{activeCount}
									</span>
								) : null}
							</button>

							<label className='relative block'>
								<span className='sr-only'>Search {category.label}</span>
								<svg
									className='pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--ink-mute)]'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									aria-hidden='true'
								>
									<circle cx='11' cy='11' r='7' />
									<path d='m20 20-3.5-3.5' />
								</svg>
								<input
									value={query}
									onChange={(event) => setQuery(event.target.value)}
									onKeyDown={(event) => {
										if (event.key === 'Escape') setQuery('')
									}}
									placeholder={`Search ${category.label.toLowerCase()} by number, title, sector, or author`}
									className='field field-search'
								/>
							</label>

							{/* Pushed to the far edge of the row, away from the search — it
							    orders the list rather than narrowing it. */}
							<label className='relative block sm:w-52 sm:justify-self-end'>
								<span className='sr-only'>Sort</span>
								<select
									value={sort}
									onChange={(event) => setSort(event.target.value as SortKey)}
									className='field field-select cursor-pointer appearance-none'
								>
									{SORT_OPTIONS.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
								<svg
									className='pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--ink-mute)]'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
									aria-hidden='true'
								>
									<path d='m6 9 6 6 6-6' />
								</svg>
							</label>
						</div>

						{/* ---- Result summary ---- */}
						<div className='mt-8 flex flex-col justify-between gap-2 border-b border-[var(--rule)] pb-3 sm:flex-row sm:items-center'>
							<p className={`meta ${isStale ? 'opacity-50' : ''} transition-opacity`}>
								<span className='num font-medium text-[var(--ink)]'>
									{visibleRecords.length.toLocaleString()}
								</span>{' '}
								of {records.length.toLocaleString()} {category.label.toLowerCase()}
								{remaining > 0 ? (
									<span className='text-[var(--ink-mute)]'>
										{' '}
										· showing <span className='num'>{shown.toLocaleString()}</span>
									</span>
								) : null}
							</p>

							{activeCount > 0 || query ? (
								<button
									type='button'
									onClick={clearAll}
									className='w-fit cursor-pointer text-[13px] text-[var(--ink-3)] underline decoration-[var(--rule)] underline-offset-4 transition hover:text-[var(--ink)] hover:decoration-[var(--accent)]'
								>
									Clear search and filters
								</button>
							) : (
								<p className='meta-sm'>Select a row for the full record</p>
							)}
						</div>

						{/* ---- Rows ----

						    Laid out like the rows on a member's profile: what it is and
						    where it stands on one line, the name under it, the date down
						    the right edge so a list reads as a chronology. */}
						<div>
							{visibleRecords.slice(0, shown).map((record, index) => (
								<button
									key={record.id}
									type='button'
									onClick={() => openRecord(record)}
									style={{ '--row-index': index } as React.CSSProperties}
									className='row row-in grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-start gap-6 py-8 text-left sm:gap-16 lg:gap-24'
								>
									<div className='min-w-0'>
										<div className='flex flex-wrap items-center gap-x-2 gap-y-1.5'>
											<span className='num text-[13px] font-medium text-[var(--ink-3)]'>
												{record.numberLabel}
												{/* A bill that passed is still the same measure under a new
												    number, so the act rides in the bill's own designation
												    rather than as a note further down the row. */}
												{record.becameActNumber !== undefined ? (
													<>
														{' ('}
														<span
															role='link'
															tabIndex={0}
															onClick={(event) => {
																// The row itself opens this bill; the act is
																// somewhere else entirely.
																event.stopPropagation()
																router.push(`/acts?focus=${record.becameActNumber}`)
															}}
															onKeyDown={(event) => {
																if (event.key !== 'Enter' && event.key !== ' ') return
																event.preventDefault()
																event.stopPropagation()
																router.push(`/acts?focus=${record.becameActNumber}`)
															}}
															className='rule-link cursor-pointer'
														>
															BAA {record.becameActNumber}
														</span>
														{')'}
													</>
												) : null}
											</span>
											<span className={statusToneClass[record.statusTone]}>
												{record.statusShort}
											</span>
											{/* What it is about, beside where it stands — both are labels
											    on the measure, so they share the one line above the name. */}
											{record.sectors.map((tag) => (
												<span key={tag.value} className='badge badge-plain badge-idle'>
													{tag.label}
												</span>
											))}
										</div>

										{/* The full official name is what identifies a measure, so the
										    row carries that alone. The registry's short name for it is
										    still in the record dialog. */}
										<h2 className='item-title item-title-lg mt-2 text-[var(--ink)]'>
											{record.title}
										</h2>
									</div>

									<div className='flex items-center gap-3'>
										<span className='meta-sm shrink-0'>{record.dateDisplay}</span>
										<svg
											className='row-arrow hidden size-4 sm:block'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
											aria-hidden='true'
										>
											<path d='M5 12h14M13 6l6 6-6 6' />
										</svg>
									</div>
								</button>
							))}

							{remaining > 0 ? (
								<div className='flex flex-col items-center gap-2 pt-8'>
									<button
										type='button'
										onClick={() => setPageCount((current) => current + 1)}
										className='btn btn-quiet'
									>
										Show {Math.min(PAGE_SIZE, remaining)} more
										<svg
											className='size-3.5'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
											aria-hidden='true'
										>
											<path d='m6 9 6 6 6-6' />
										</svg>
									</button>
									{/* What is left says whether narrowing is worth it — "812 more"
									    is an argument for using the filters. */}
									<p className='meta-sm'>
										<span className='num'>{remaining.toLocaleString()}</span> more below
									</p>
								</div>
							) : null}

							{visibleRecords.length === 0 ? (
								<div className='py-20 text-center'>
									<p className='font-title text-base font-medium text-[var(--ink)]'>
										Nothing matches this view.
									</p>
									<p className='mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ink-3)]'>
										Try a broader search term, or clear a filter or two. The registry doesn&rsquo;t
										yet cover {category.label.toLowerCase()} outside{' '}
										{dataset.metadata.coverage.toLowerCase()}.
									</p>
									<button type='button' onClick={clearAll} className='btn btn-quiet mt-6'>
										Clear everything
									</button>
								</div>
							) : null}
						</div>
					</div>
				</div>
			</section>

			{selected ? (
				<RecordDetail record={selected} memberSlugs={memberSlugs} onClose={closeRecord} />
			) : null}
		</>
	)
}
