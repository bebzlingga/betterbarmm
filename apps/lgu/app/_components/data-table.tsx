'use client'

import { CaretDownIcon, CaretUpIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

/* ============================================================
   A list of places as a table

   The directory's lists — the seven areas, a province's towns — are
   the same few measures for every row, read down the column to
   compare. A table does that; a grid of cards makes the reader hold
   each card's figures in their head to compare it with the next.

   Rows come in flat and serializable (this sorts and filters in the
   browser), so formatting is named by a string rather than passed
   as a function.
   ============================================================ */

export type DataColumn = {
	key: string
	label: string
	format: 'int' | 'peso' | 'area' | 'text'
	/** Hidden below this width; the row's `mobile` line carries what matters of it. */
	hideBelow?: 'sm' | 'md' | 'lg'
}

export type DataRow = {
	key: string
	href: string
	name: string
	/** One quiet line under the name — "Capital · Component city". */
	meta?: string
	/** A sentence about the row, shown under the name on a wide screen. */
	detail?: string
	/** Shown under the name only where the columns that hold it are hidden. */
	mobile?: string
	values: Record<string, number | string | null>
}

const HIDE = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell' }

function display(value: number | string | null, format: DataColumn['format']): string {
	if (value == null || value === '') return '—'
	if (typeof value === 'string') return value
	if (format === 'peso') {
		if (value >= 1e9) return `₱${(value / 1e9).toFixed(2)}B`
		if (value >= 1e6) return `₱${(value / 1e6).toFixed(1)}M`
		return `₱${Math.round(value).toLocaleString('en-PH')}`
	}
	if (format === 'area') return Math.round(value).toLocaleString('en-PH')
	return value.toLocaleString('en-PH')
}

export function DataTable({
	columns,
	rows,
	nameLabel,
	filterLabel,
	caption,
}: {
	columns: DataColumn[]
	rows: DataRow[]
	/** The first column's heading — "Area", "City or municipality". */
	nameLabel: string
	/** Set to offer a filter field — "towns in Lanao del Sur". */
	filterLabel?: string
	caption: string
}) {
	const [sort, setSort] = useState<{ key: string; down: boolean }>({ key: 'name', down: false })
	const [query, setQuery] = useState('')

	const shown = useMemo(() => {
		const q = query.trim().toLowerCase()
		const kept = q
			? rows.filter((row) =>
					[row.name, row.meta, row.mobile, ...Object.values(row.values)]
						.filter((part) => typeof part === 'string')
						.some((part) => (part as string).toLowerCase().includes(q)),
				)
			: rows
		const value = (row: DataRow) => (sort.key === 'name' ? row.name : row.values[sort.key])
		return [...kept].sort((a, b) => {
			const x = value(a)
			const y = value(b)
			// A row with no figure sinks either way: it is not the smallest.
			if (x == null) return 1
			if (y == null) return -1
			const order = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))
			return sort.down ? -order : order
		})
	}, [rows, query, sort])

	// Figures open largest first, names A to Z — what a reader means by "sort".
	const by = (key: string, numeric: boolean) =>
		setSort((now) => (now.key === key ? { key, down: !now.down } : { key, down: numeric }))

	const head = (key: string, label: string, numeric: boolean, className = '') => {
		const active = sort.key === key
		const Icon = active && sort.down ? CaretDownIcon : CaretUpIcon
		return (
			<th
				key={key}
				scope='col'
				aria-sort={active ? (sort.down ? 'descending' : 'ascending') : 'none'}
				className={`py-3 font-normal ${numeric ? 'pl-4 text-right' : 'pr-4 text-left'} ${className}`}
			>
				<button
					type='button'
					onClick={() => by(key, numeric)}
					// The caret sits on the inner side, so a figure column's label ends
					// flush with the figures under it.
					className={`inline-flex cursor-pointer items-center gap-1 text-[12px] font-semibold transition hover:text-[var(--ink)] ${
						numeric ? 'flex-row-reverse' : ''
					} ${active ? 'text-[var(--ink)]' : 'text-[var(--ink-3)]'}`}
				>
					{label}
					<Icon size={11} weight='bold' className={active ? 'opacity-100' : 'opacity-0'} aria-hidden='true' />
				</button>
			</th>
		)
	}

	return (
		<div>
			{filterLabel ? (
				<label className='mb-1 flex max-w-md items-center gap-3 border-b border-[var(--rule)] py-3'>
					<MagnifyingGlassIcon className='size-4 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
					<span className='sr-only'>Filter {filterLabel}</span>
					<input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						type='search'
						autoComplete='off'
						spellCheck={false}
						placeholder={`Filter ${rows.length} ${filterLabel}`}
						className='min-w-0 flex-1 bg-transparent text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
					/>
					{query ? (
						<span className='num shrink-0 text-[12px] text-[var(--ink-3)]'>
							{shown.length} of {rows.length}
						</span>
					) : null}
				</label>
			) : null}

			<table className='w-full border-collapse'>
				<caption className='sr-only'>{caption}</caption>
				<thead>
					<tr className='border-b border-[var(--ink)]'>
						{head('name', nameLabel, false)}
						{columns.map((column) =>
							head(column.key, column.label, column.format !== 'text', column.hideBelow ? HIDE[column.hideBelow] : ''),
						)}
					</tr>
				</thead>
				<tbody>
					{shown.map((row) => (
						<tr key={row.key} className='border-b border-[var(--rule-soft)] align-top transition-colors hover:bg-[var(--paper-2)]'>
							<th scope='row' className='py-3.5 pr-4 text-left font-normal'>
								<Link
									href={row.href}
									className='text-[15px] font-semibold leading-snug text-[var(--ink)] underline-offset-4 hover:text-[var(--accent)] hover:underline'
								>
									{row.name}
								</Link>
								{row.meta ? <p className='mt-0.5 text-[12.5px] text-[var(--ink-3)]'>{row.meta}</p> : null}
								{row.mobile ? <p className='mt-0.5 text-[12.5px] text-[var(--ink-2)] md:hidden'>{row.mobile}</p> : null}
								{row.detail ? (
									<p className='mt-2 hidden max-w-xl text-[13px] leading-6 text-[var(--ink-2)] lg:block'>{row.detail}</p>
								) : null}
							</th>
							{columns.map((column) => (
								<td
									key={column.key}
									className={`py-3.5 ${
										column.format === 'text'
											? 'pr-4 text-left text-[14px] text-[var(--ink-2)]'
											: 'num pl-4 text-right text-[14px] tabular-nums text-[var(--ink)]'
									} ${column.hideBelow ? HIDE[column.hideBelow] : ''}`}
								>
									{display(row.values[column.key] ?? null, column.format)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>

			{shown.length === 0 ? (
				<p className='py-10 text-center text-[13.5px] text-[var(--ink-3)]'>Nothing here matches “{query.trim()}”.</p>
			) : null}
		</div>
	)
}
