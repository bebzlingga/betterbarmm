'use client'

import { FunnelIcon, XIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { statusToneClass } from '../_lib/labels'
import { recordHref } from '../_lib/categories'
import type { FilterOption, LegislationDataset, LegislationRecord } from '../_lib/legislation-data'

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

export function RecordBrowser({ dataset }: { dataset: LegislationDataset }) {
	const { records, category } = dataset
	const router = useRouter()

	const [query, setQuery] = useState('')
	const [filters, setFilters] = useState<ActiveFilters>(emptyFilters)
	const [sort, setSort] = useState<SortKey>('number-desc')
	// Closed by default: the list is what a reader came for, and it gets the
	// full width until they ask to narrow it. The button says what is behind it.
	const [filtersOpen, setFiltersOpen] = useState(false)
	const [pageCount, setPageCount] = useState(1)

	// Deferring the query keeps typing responsive while the list re-filters.
	const deferredQuery = useDeferredValue(query)

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

	/* Narrowing the list starts it again from the top: the rows a reader has
	   already paged past are not the rows their new query is about.
	 *
	 * Done during render rather than in an effect. An effect keyed on the query
	 * fires after the browser has already been handed a page of the wrong
	 * length, so React renders twice and commits the first one — the cascade it
	 * warns about. Comparing against what was last seen resets the count in the
	 * same pass that changes the list. The three are compared by identity,
	 * exactly as the effect's dependency array did. */
	const [lastView, setLastView] = useState({ query: deferredQuery, filters, sort })
	if (
		lastView.query !== deferredQuery ||
		lastView.filters !== filters ||
		lastView.sort !== sort
	) {
		setLastView({ query: deferredQuery, filters, sort })
		setPageCount(1)
	}

	const shown = Math.min(pageCount * PAGE_SIZE, visibleRecords.length)
	const remaining = visibleRecords.length - shown
	const isStale = query !== deferredQuery

	return (
		<>
			{/* Less air above the search than below it: the masthead already closes
			    with its own bottom padding, and stacked the two ran to nearly a
			    hundred pixels of nothing between the description and the field. */}
			<section className='bb-container pb-12 pt-6 sm:pt-12'>
				{/* The facets live in a column of their own, opened from the button
				    beside the search: on a registry they are half the point, and the
				    column sticks while the list scrolls past it.

				    The track changes width without a transition, and only the panel
				    animates. Animating the column too meant the list was being
				    re-flowed for the whole 300ms it took to open — every row rewrapping
				    line by line — which reads as the page resizing its own contents
				    rather than as a panel opening beside them. The list takes its new
				    width in one step and stays still; the panel is the thing that
				    moves, and it moves in the axis it actually grows in.

				    Only the column gap is the wide-screen one — a row gap of six rem
				    between the controls and the list is meaningless on a two-track
				    layout where they sit in the same column. There is no row gap at
				    all: the filter panel collapses to nothing rather than unmounting,
				    and a gap either side of a zero-height row is dead space above the
				    list whenever the filters are shut. The blocks carry their own
				    margins instead. */}
				<div
					className={`grid grid-cols-1 ${
						filtersOpen
							? 'lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-x-24 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] xl:gap-x-32'
							: 'lg:grid-cols-[minmax(0,0rem)_minmax(0,1fr)] lg:gap-x-0 xl:grid-cols-[minmax(0,0rem)_minmax(0,1fr)] xl:gap-x-0'
					}`}
				>
					{/* The three blocks are placed explicitly rather than by source
					    order, because the order that reads is not the same at both
					    layouts. Stacked, the panel has to open *below* the button that
					    opens it: with the panel first, tapping Filters pushed the button
					    out from under the reader's own thumb and drove the list off the
					    bottom of the screen. In two tracks the filters are a column
					    beside everything, so they span both rows. */}

					{/* ---- Search, then the list it searches ----

					    The row leads on a phone and heads column two on a wide screen. */}
					<div className='order-1 min-w-0 lg:order-none lg:col-start-2 lg:row-start-1'>
						{/* Stacked, the search takes the full width on its own line and the
						    two controls that act on it share the line below — a full-width
						    bar carrying nothing but a funnel glyph read as a broken field
						    rather than as a button. From `sm` the three sit on one row,
						    with the toggle where the column it controls begins.

						    The search field takes 60% of that row rather than all of it —
						    a full-width box over a list of short rows reads heavier than
						    the thing it searches. */}
						<div className='grid grid-cols-2 gap-2.5 sm:grid-cols-[auto_60%_1fr] sm:items-center'>
							<button
								type='button'
								onClick={() => setFiltersOpen((current) => !current)}
								aria-expanded={filtersOpen}
								aria-controls='record-filters'
								className='bb-btn bb-btn-ghost btn-field order-2 h-11 shrink-0 sm:order-none'
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
								Filters
								{activeCount > 0 ? (
									<span className='num inline-flex size-[18px] items-center justify-center rounded-full bg-[var(--ink)] text-[11px] text-[var(--paper)]'>
										{activeCount}
									</span>
								) : null}
							</button>

							<label className='relative order-1 col-span-2 block sm:order-none sm:col-span-1'>
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
							<label className='relative order-3 block sm:order-none sm:w-52 sm:justify-self-end'>
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
					</div>

					{/* ---- The filters themselves ----

					    The sticky element carries no overflow of its own: clipping it
					    would make it its own scrollport and sticky would stop tracking
					    the page. The wrapper inside does the clipping instead. */}
					<aside
						id='record-filters'
						aria-hidden={!filtersOpen}
						className='order-2 lg:order-none lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-24 lg:self-start'
					>
						<div
							className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
								filtersOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
							}`}
						>
							{/* No heading over these: the chips say what they are, and the
							    "Clear search and filters" link over the list already resets
							    them.

							    Six groups of chips is most of a phone screen, so open it
							    scrolls within a cap rather than burying the results it is
							    there to narrow. */}
							{/* The space above the panel is padding inside the collapsing row rather
							    than a margin on the column, so it closes with the panel instead of
							    vanishing the moment the button is pressed and dropping the list by
							    its own height.

							    Pinned to the width of its own track from `lg`. The track collapses to
							    nothing in one step, and a panel sized by that track would rewrap every
							    chip into a zero-width column while it was still fading out. Given a
							    width of its own it is simply clipped by the row above it. */}
							<div
								className={`grid min-h-0 gap-6 pt-7 lg:max-h-[calc(100vh-8rem)] lg:w-80 lg:pr-1 lg:pt-0 xl:w-96 ${
									filtersOpen
										? 'max-h-[60vh] overflow-y-auto overscroll-contain lg:max-h-[calc(100vh-8rem)]'
										: 'overflow-hidden'
								}`}
							>
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

					{/* ---- The list itself ----

					    Follows the controls on a phone and sits under them in column
					    two on a wide screen. */}
					<div className='order-3 min-w-0 lg:order-none lg:col-start-2 lg:row-start-2'>

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
								<p className='meta-sm'>Open a row for the full record</p>
							)}
						</div>

						{/* ---- Rows ----

						    Laid out like the rows on a member's profile: what it is and
						    where it stands on one line, the name under it, the date down
						    the right edge so a list reads as a chronology. */}
						<div>
							{visibleRecords.slice(0, shown).map((record, index) => (
								<Link
									key={record.id}
									href={recordHref(record) ?? '#'}
									style={{ '--row-index': index } as React.CSSProperties}
									// The date sits down the right edge so a list reads as a
									// chronology — but it is a fixed column against a title that
									// has to wrap, and on a phone it took a third of the row and
									// left the measure's name in a four-word gutter. Stacked, the
									// title gets the width and the date follows it as a caption.
									className='row row-in grid w-full cursor-pointer grid-cols-1 items-start gap-1.5 py-6 text-left sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-16 sm:py-8 lg:gap-24'
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
																// The row itself leads to this bill; the act is
																// somewhere else entirely. The row is an anchor,
																// so the default has to be stopped as well as the
																// bubbling.
																event.preventDefault()
																event.stopPropagation()
																router.push(`/acts/${record.becameActNumber}`)
															}}
															onKeyDown={(event) => {
																if (event.key !== 'Enter' && event.key !== ' ') return
																event.preventDefault()
																event.stopPropagation()
																router.push(`/acts/${record.becameActNumber}`)
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
										    on the measure's own page. */}
										<h2 className='item-title item-title-lg mt-2 text-[var(--ink)]'>
											{record.title}
										</h2>
									</div>

									<div className='flex items-center gap-3 sm:justify-end'>
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
								</Link>
							))}

							{remaining > 0 ? (
								<div className='flex flex-col items-center gap-2 pt-8'>
									<button
										type='button'
										onClick={() => setPageCount((current) => current + 1)}
										className='bb-btn bb-btn-ghost'
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
									<p className='mx-auto mt-2 max-w-md bb-body text-[var(--ink-3)]'>
										Try a broader search term, or clear a filter or two. The registry doesn&rsquo;t
										yet cover {category.label.toLowerCase()} outside{' '}
										{dataset.metadata.coverage.toLowerCase()}.
									</p>
									<button type='button' onClick={clearAll} className='bb-btn bb-btn-ghost mt-6'>
										Clear everything
									</button>
								</div>
							) : null}
						</div>
					</div>
				</div>
			</section>
		</>
	)
}
