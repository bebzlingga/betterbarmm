'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { DataTable, type DataColumn, type DataRow } from './data-table'

/* ============================================================
   Every LGU ranked on its own money

   One table, one year, one level at a time. Provinces and towns
   are kept apart because a province's figures are a different size
   of thing, and a ranking that mixed them would only rank that.
   ============================================================ */

export type StatsUnit = {
	key: string
	name: string
	href: string
	level: 'province' | 'town'
	meta: string
	population: number | null
}

/** Values per unit per year, in the order of `fields`. A year the unit did not report is absent. */
export type StatsData = Record<string, Record<string, (number | null)[]>>

const COLUMNS: DataColumn[] = [
	{ key: 'localSources', label: 'Local taxes and fees', format: 'peso' },
	{ key: 'perPerson', label: 'Local revenue per person', format: 'peso', hideBelow: 'sm' },
	{ key: 'nta', label: 'NTA', format: 'peso', hideBelow: 'md' },
	{ key: 'ntaDependency', label: 'NTA share of income', format: 'pct', hideBelow: 'lg' },
	{ key: 'operatingIncome', label: 'Total income', format: 'peso', hideBelow: 'md' },
	{ key: 'operatingExpenditures', label: 'Spending', format: 'peso', hideBelow: 'lg' },
	{ key: 'capitalOutlay', label: 'Capital outlay', format: 'peso', hideBelow: 'lg' },
	{ key: 'borrowings', label: 'Borrowed', format: 'peso', hideBelow: 'lg' },
]

function Choice<T extends string>({
	label,
	value,
	options,
	onChange,
}: {
	label: string
	value: T
	options: [T, string][]
	onChange: (value: T) => void
}) {
	return (
		<div role='radiogroup' aria-label={label} className='flex flex-wrap items-center gap-1.5'>
			<span className='mr-2 text-[13px] text-[var(--ink-3)]'>{label}</span>
			{options.map(([key, text]) => (
				<button
					key={key}
					type='button'
					role='radio'
					aria-checked={value === key}
					onClick={() => onChange(key)}
					className={`cursor-pointer border px-3 py-1.5 text-[13px] font-medium transition ${
						value === key
							? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]'
							: 'border-[var(--rule)] text-[var(--ink-2)] hover:border-[var(--ink)]'
					}`}
				>
					{text}
				</button>
			))}
		</div>
	)
}

export function StatsExplorer({
	years,
	fields,
	units,
	data,
}: {
	years: number[]
	fields: string[]
	units: StatsUnit[]
	data: StatsData
}) {
	const [year, setYear] = useState(String(years.at(-1)))
	const [query, setQuery] = useState('')

	const rows = useMemo<DataRow[]>(
		() =>
			units
				.filter((unit) => data[unit.key]?.[year])
				.map((unit) => {
					const values = data[unit.key]![year]!
					const field = Object.fromEntries(fields.map((name, i) => [name, values[i] ?? null]))
					const local = field.localSources
					return {
						key: unit.key,
						href: unit.href,
						name: unit.name,
						meta: unit.meta,
						values: {
							...field,
							perPerson: local != null && unit.population ? local / unit.population : null,
						},
					}
				}),
		[units, fields, data, year],
	)

	const total = units.length

	return (
		<div>
			<div className='flex flex-col gap-3 border-y border-[var(--rule)] py-4 lg:flex-row lg:items-center lg:justify-between'>
				<label className='flex w-full max-w-md items-center gap-3 border-b border-[var(--rule)] py-2'>
					<MagnifyingGlassIcon className='size-4 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
					<span className='sr-only'>Filter provinces, cities and municipalities</span>
					<input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						type='search'
						autoComplete='off'
						spellCheck={false}
						placeholder='Filter by name or province'
						className='min-w-0 flex-1 bg-transparent text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
					/>
				</label>
				<Choice label='Fiscal year' value={year} options={years.map((y) => [String(y), String(y)])} onChange={setYear} />
			</div>

			<p className='mt-4 text-[13px] text-[var(--ink-3)]'>
				{rows.length} of {total} reported for FY {year}
				{rows.length < total ? '; the rest filed nothing that year and are left out' : ''}.
				{year === String(years.at(-1)) ? ' This year is BLGF’s preliminary release.' : ''}
			</p>

			<div className='mt-6'>
				<DataTable
					// Remount on a new year so the ranking reopens on its measure.
					key={year}
					caption={`Provinces, cities and municipalities ranked by their finances, FY ${year}`}
					nameLabel='Province, city or municipality'
					query={query}
					columns={COLUMNS}
					rows={rows}
					initialSort={{ key: 'localSources', down: true }}
					ranked
				/>
			</div>
		</div>
	)
}
