'use client'

import { FunnelIcon, XIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import type { MemberFilterOption, RosterDataset, RosterMember } from '../_lib/members-data'
import { MemberAvatar } from './member-avatar'

type SortKey = 'name' | 'measures' | 'phases'

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
	{ value: 'name', label: 'Surname A–Z' },
	{ value: 'measures', label: 'Most measures credited' },
	{ value: 'phases', label: 'Longest serving' },
]

type FilterGroupKey = 'phases' | 'roles' | 'representations'

type ActiveFilters = Record<FilterGroupKey, Set<string>>

const emptyFilters = (): ActiveFilters => ({
	phases: new Set(),
	roles: new Set(),
	representations: new Set(),
})

/** Mirrors the record browser's chip group so both lists feel like one tool. */
function FilterGroup({
	label,
	options,
	selected,
	onToggle,
	limit = 8,
}: {
	label: string
	options: MemberFilterOption[]
	selected: Set<string>
	onToggle: (value: string) => void
	limit?: number
}) {
	const [expanded, setExpanded] = useState(false)

	if (options.length === 0) return null

	const visible = expanded ? options : options.slice(0, limit)
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

function roleMatches(member: RosterMember, selected: Set<string>): boolean {
	const title = member.roleTitle?.toLowerCase() ?? ''

	for (const value of selected) {
		if (value === 'Member' && !member.roleTitle) return true
		if (value !== 'Member' && title.includes(value.toLowerCase())) return true
	}

	return false
}

export function MemberBrowser({ dataset }: { dataset: RosterDataset }) {
	const { members } = dataset

	const [query, setQuery] = useState('')
	const [filters, setFilters] = useState<ActiveFilters>(emptyFilters)
	const [sort, setSort] = useState<SortKey>('name')
	// Closed by default: the roster is what a reader came for, and it gets the
	// full width until they ask to narrow it. The button says what is behind it.
	const [filtersOpen, setFiltersOpen] = useState(false)
	const [creditedOnly, setCreditedOnly] = useState(false)

	const deferredQuery = useDeferredValue(query)

	const toggleFilter = useCallback((group: FilterGroupKey, value: string) => {
		setFilters((current) => {
			const next = new Set(current[group])
			if (next.has(value)) next.delete(value)
			else next.add(value)
			return { ...current, [group]: next }
		})
	}, [])

	const activeCount = useMemo(
		() =>
			Object.values(filters).reduce((total, set) => total + set.size, 0) + (creditedOnly ? 1 : 0),
		[creditedOnly, filters],
	)

	const clearAll = useCallback(() => {
		setQuery('')
		setFilters(emptyFilters())
		setCreditedOnly(false)
	}, [])

	const visibleMembers = useMemo(() => {
		const needle = deferredQuery.trim().toLowerCase()

		const filtered = members.filter((member) => {
			if (needle && !member.searchText.includes(needle)) return false
			if (creditedOnly && member.measureCount === 0) return false

			// Filtering matches the grouping — by the sitting a member is listed
			// under, not every sitting they ever served in. Otherwise a chip would
			// pull people into sections they don't belong to.
			if (filters.phases.size > 0 && !filters.phases.has(member.parliamentKey)) return false

			if (filters.roles.size > 0 && !roleMatches(member, filters.roles)) return false

			if (
				filters.representations.size > 0 &&
				!(member.representation && filters.representations.has(member.representation))
			)
				return false

			return true
		})

		const sorted = [...filtered]

		switch (sort) {
			case 'measures':
				sorted.sort(
					(left, right) =>
						right.measureCount - left.measureCount ||
						left.rosterName.localeCompare(right.rosterName),
				)
				break
			case 'phases':
				sorted.sort(
					(left, right) =>
						right.phases.length - left.phases.length ||
						left.rosterName.localeCompare(right.rosterName),
				)
				break
			default:
				sorted.sort((left, right) => left.rosterName.localeCompare(right.rosterName))
		}

		return sorted
	}, [creditedOnly, deferredQuery, filters, members, sort])

	// Each member appears under their most recent sitting only, so a member of
	// all three parliaments is listed once, under the third.
	const groups = useMemo(
		() =>
			dataset.parliaments
				.map((parliament) => ({
					parliament,
					members: visibleMembers.filter((member) => member.parliamentKey === parliament.key),
				}))
				.filter((group) => group.members.length > 0),
		[dataset.parliaments, visibleMembers],
	)

	const isStale = query !== deferredQuery

	// Three cells across while the filter column is open, four once it folds
	// away — the column takes about a fifth of the page, and packing more than
	// three into what is left squeezed the longer names onto four lines.
	const cellGrid = filtersOpen
		? 'min-[520px]:grid-cols-2 lg:grid-cols-3'
		: 'min-[520px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'

	return (
		<section className='mx-auto max-w-[88rem] px-6 py-12 lg:px-8'>
			{/* Laid out like the registry: the facets stand open in a column of
			    their own, the roster reads beside them, and the button by the
			    search folds the column away for a reader who wants the width.
			    Both axes animate, because the column is a column on a wide screen
			    and a stacked block on a narrow one. */}
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
					id='member-filters'
					aria-hidden={!filtersOpen}
					className='lg:sticky lg:top-24 lg:self-start'
				>
					<div
						className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
							filtersOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
						}`}
					>
						<div className='grid min-h-0 gap-6 overflow-hidden lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-1'>
							<FilterGroup
								label='Parliament'
								options={dataset.parliaments.map((parliament) => ({
									value: parliament.key,
									label: parliament.label,
									count: parliament.count,
								}))}
								selected={filters.phases}
								onToggle={(value) => toggleFilter('phases', value)}
							/>
							<FilterGroup
								label='Role'
								options={dataset.roles}
								selected={filters.roles}
								onToggle={(value) => toggleFilter('roles', value)}
							/>
							<FilterGroup
								label='Represents'
								options={dataset.representations}
								selected={filters.representations}
								onToggle={(value) => toggleFilter('representations', value)}
								limit={12}
							/>

							<div className='grid gap-3'>
								<p className='label label-strong'>Authorship</p>
								<div className='flex flex-wrap gap-2'>
									<button
										type='button'
										aria-pressed={creditedOnly}
										onClick={() => setCreditedOnly((current) => !current)}
										className='chip'
									>
										Credited on a measure
										<span className='chip-count'>{dataset.stats.withMeasures}</span>
									</button>
								</div>
								<p className='text-[13px] leading-5 text-[var(--ink-mute)]'>
									{dataset.stats.withMeasures} of {dataset.stats.total} members can be linked to a
									measure, drawn from the {dataset.stats.measuresCredited} measures whose authors
									this registry records. An empty profile means those measure pages haven&rsquo;t
									been read yet, not that the member filed nothing.
								</p>
							</div>
						</div>
					</div>
				</aside>

				{/* ---- Column two: search, then the roster it searches ---- */}
				<div className='min-w-0'>
					{/* The search field takes 60% of the row rather than all of it —
					    a full-width box over a grid of short cells reads heavier than
					    the thing it searches. The filter toggle sits to its left,
					    where the column it controls begins. */}
					<div className='grid gap-2.5 sm:grid-cols-[auto_60%_1fr] sm:items-center'>
						<button
							type='button'
							onClick={() => setFiltersOpen((current) => !current)}
							aria-expanded={filtersOpen}
							aria-controls='member-filters'
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
							<span className='sr-only'>Search members</span>
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
								placeholder='Search members by name, role, or province'
								className='field field-search'
							/>
						</label>

						{/* Pushed to the far edge of the row, away from the search — it
						    orders the roster rather than narrowing it. */}
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

					{/* ---- Result summary ----

					    Only while a search or filter is on. Sitting idle it said
					    nothing a reader couldn't see — the roster is right there, and
					    every group heading already counts itself. Narrowed, the count
					    is the whole point, and the way back out has to be next to it. */}
					{activeCount > 0 || query ? (
						<div className='mt-8 flex flex-col justify-between gap-2 border-b border-[var(--rule)] pb-3 sm:flex-row sm:items-center'>
							<p className={`meta ${isStale ? 'opacity-50' : ''} transition-opacity`}>
								<span className='num font-medium text-[var(--ink)]'>
									{visibleMembers.length.toLocaleString()}
								</span>{' '}
								of {members.length.toLocaleString()} members
							</p>

							<button
								type='button'
								onClick={clearAll}
								className='w-fit cursor-pointer text-[13px] text-[var(--ink-3)] underline decoration-[var(--rule)] underline-offset-4 transition hover:text-[var(--ink)] hover:decoration-[var(--accent)]'
							>
								Clear search and filters
							</button>
						</div>
					) : null}

					{/* ---- Grouped grid ---- */}
					<div>
						{groups.map((group) => (
							<section key={group.parliament.key} className='mt-10 first:mt-8'>
								<div className='flex items-baseline justify-between gap-4 border-b border-[var(--rule)] pb-4'>
									<div className='min-w-0'>
										<h2 className='item-title text-[var(--ink)]'>{group.parliament.label}</h2>
										<p className='meta-sm mt-0.5'>{group.parliament.description}</p>
									</div>
									<p className='meta-sm shrink-0'>
										{group.members.length.toLocaleString()}{' '}
										{group.members.length === 1 ? 'member' : 'members'}
									</p>
								</div>

								<div className={`mt-6 grid gap-2 ${cellGrid}`}>
									{group.members.map((member, index) => (
										<Link
											key={member.slug}
											href={`/members/${member.slug}`}
											style={{ '--row-index': index } as React.CSSProperties}
											className='cell row-in flex flex-col p-4'
										>
											{/* The sitting is the section heading, so it isn't repeated here. */}
											<MemberAvatar name={member.displayName} src={member.photoUrl} />

											<h2 className='item-title item-title-lg mt-3.5 text-[var(--ink)]'>
												{member.displayName}
											</h2>

											{/* Office first, then the authorship split — the two things that set
									    one member apart from the next, read as one row under the name.
									    "as principal" rather than "principal author" because the number
									    counts measures, not people. A position can name two offices
									    ("MSSD Minister / Deputy Floor Leader"); each gets its own badge. */}
											{member.roleTitle || member.measureCount > 0 ? (
												<div className='mt-2 flex flex-wrap gap-1.5'>
													{member.roleTitle
														?.split('/')
														.map((part) => part.trim())
														.filter(Boolean)
														.map((role) => (
															<span key={role} className='badge badge-plain badge-role'>
																{role}
															</span>
														))}
													{member.principalCount > 0 ? (
														<span className='badge badge-plain badge-done'>
															{member.principalCount} as principal
														</span>
													) : null}
													{member.coAuthorCount > 0 ? (
														<span className='badge badge-plain badge-early'>
															{member.coAuthorCount} as co-author
														</span>
													) : null}
												</div>
											) : null}

											{/* Pinned to the bottom so cells line up regardless of role length. */}
											<div className='mt-auto pt-4'>
												{member.representation ? (
													<p className='text-[13px] leading-5 text-[var(--ink-3)]'>
														{member.representation}
													</p>
												) : null}
												<p className='meta-sm mt-0.5'>{member.termOfOffice}</p>
											</div>
										</Link>
									))}
								</div>
							</section>
						))}

						{visibleMembers.length === 0 ? (
							<div className='py-20 text-center'>
								<p className='font-title text-base font-medium text-[var(--ink)]'>
									Nothing matches this view.
								</p>
								<p className='mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ink-3)]'>
									Try a broader search term, or clear a filter or two.
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
	)
}
