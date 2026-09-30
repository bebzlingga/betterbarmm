'use client'

import { ArrowUpRightIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { formatNumber } from '@betterbarmm/lgu-data'
import Link from 'next/link'
import { useMemo, useState } from 'react'

/**
 * One unit as the province page needs it — flat and serializable, because this
 * list is filtered in the browser and the whole dataset object cannot cross
 * that boundary.
 */
export type UnitCard = {
	name: string
	href: string
	isCity: boolean
	isCapital: boolean
	cityClass?: string
	formedFrom?: string
	mayor: string | null
	population: number | null
	barangays: number
}

/**
 * Every city and municipality in a province, filterable.
 *
 * Lanao del Sur has forty units. A reader arriving from a search result and
 * scanning for their own town in a forty-item grid is doing work a field can
 * do for them, so the field is here — and it matches barangay names as well as
 * unit names, because half the time the reader knows the village.
 *
 * The field only appears once a list is long enough to need one. On Tawi-Tawi's
 * eleven it would be furniture.
 */
export function UnitGrid({
	units,
	label,
	searchable,
}: {
	units: UnitCard[]
	/** What the count is counting — "municipalities in Basilan". */
	label: string
	searchable?: boolean
}) {
	const [query, setQuery] = useState('')

	const shown = useMemo(() => {
		const q = query.trim().toLowerCase()
		if (!q) return units
		return units.filter(
			(unit) =>
				unit.name.toLowerCase().includes(q) ||
				(unit.mayor?.toLowerCase().includes(q) ?? false) ||
				(unit.formedFrom?.toLowerCase().includes(q) ?? false),
		)
	}, [units, query])

	return (
		<div>
			{searchable ? (
				<label className='mb-2 flex items-center gap-3 border-b border-[var(--rule)] py-3'>
					<MagnifyingGlassIcon className='size-4 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
					<span className='sr-only'>Filter {label}</span>
					<input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						type='search'
						autoComplete='off'
						spellCheck={false}
						placeholder={`Filter ${units.length} ${label}…`}
						className='min-w-0 flex-1 bg-transparent text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
					/>
					{query ? (
						<span className='num shrink-0 text-[11.5px] text-[var(--ink-3)]'>
							{shown.length} of {units.length}
						</span>
					) : null}
				</label>
			) : null}

			{/* One border per cell on two sides only, with the grid clipping the
			    overhang. The nth-child rules this replaces had to be restated for
			    every breakpoint and broke the moment a row was short. */}
			<div className='-ml-px -mt-px grid overflow-hidden sm:grid-cols-2 xl:grid-cols-3'>
				{shown.map((unit) => (
					<Link
						key={unit.href}
						href={unit.href}
						className='group flex min-w-0 flex-col border-l border-t border-[var(--rule)] p-5 transition hover:bg-[var(--paper-2)]'
					>
						<div className='flex items-start justify-between gap-3'>
							<h3 className='min-w-0 text-[16px] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
								{unit.name}
							</h3>
							<ArrowUpRightIcon
								className='mt-1 size-3.5 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
								aria-hidden='true'
							/>
						</div>

						{unit.isCapital || unit.isCity || unit.formedFrom ? (
							<div className='mt-2 flex flex-wrap items-center gap-x-2 gap-y-1'>
								{unit.isCapital ? (
									<span className='badge badge-plain badge-early'>Capital</span>
								) : null}
								{unit.isCity ? (
									<span className='badge badge-plain badge-committee'>
										{unit.cityClass ?? 'City'}
									</span>
								) : null}
								{unit.formedFrom ? <span className='meta-sm'>from {unit.formedFrom}</span> : null}
							</div>
						) : null}

						<p className='mt-3 flex-1 text-[13px] leading-5'>
							{unit.mayor ? (
								<>
									<span className='font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>
										Mayor{' '}
									</span>
									<span className='font-semibold text-[var(--ink)]'>{unit.mayor}</span>
								</>
							) : (
								<span className='text-[var(--ink-mute)]'>No canvass on record</span>
							)}
						</p>

						<dl className='mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-[var(--rule-soft)] pt-3 text-[12px] text-[var(--ink-3)]'>
							<div className='flex gap-1.5'>
								<dt className='sr-only'>Population</dt>
								<dd className='num font-semibold text-[var(--ink)]'>
									{formatNumber(unit.population)}
								</dd>
								<span aria-hidden='true'>people</span>
							</div>
							<div className='flex gap-1.5'>
								<dt className='sr-only'>Barangays</dt>
								<dd className='num font-semibold text-[var(--ink)]'>{unit.barangays}</dd>
								<span aria-hidden='true'>barangays</span>
							</div>
						</dl>
					</Link>
				))}
			</div>

			{shown.length === 0 ? (
				<p className='border-t border-[var(--rule)] py-10 text-center text-[13.5px] text-[var(--ink-3)]'>
					Nothing here matches “{query.trim()}”.
				</p>
			) : null}
		</div>
	)
}
