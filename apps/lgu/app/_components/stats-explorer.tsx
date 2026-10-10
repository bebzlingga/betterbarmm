'use client'

import { CaretDownIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { useCallback, useMemo, useState } from 'react'
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
	/** The province or area it sits in (a province is its own). */
	area: string
	type: 'Province' | 'City' | 'Municipality'
	/** Income class, 2024 reclassification. */
	klass: string | null
}

/** Values per unit per year, in the order of `fields`. A year the unit did not report is absent. */
export type StatsData = Record<string, Record<string, (number | null)[]>>

const COLUMNS: DataColumn[] = [
	{ key: 'localSources', label: 'Local taxes and fees', format: 'peso' },
	{ key: 'nta', label: 'NTA', format: 'peso', hideBelow: 'md' },
	{ key: 'ntaDependency', label: 'NTA share', format: 'pct', hideBelow: 'lg' },
	{ key: 'operatingIncome', label: 'Total income', format: 'peso', hideBelow: 'md' },
	{ key: 'operatingExpenditures', label: 'Spending', format: 'peso', hideBelow: 'lg' },
	{ key: 'capitalOutlay', label: 'Capital outlay', format: 'peso', hideBelow: 'lg' },
	{ key: 'borrowings', label: 'Borrowed', format: 'peso', hideBelow: 'lg' },
]

/** A labelled native select: keyboard, screen readers and phones handle it for free. */
function Select({
	label,
	value,
	options,
	onChange,
}: {
	label: string
	value: string
	options: [string, string][]
	onChange: (value: string) => void
}) {
	return (
		<label className='flex min-w-0 flex-col gap-1'>
			<span className='text-[12px] text-[var(--ink-3)]'>{label}</span>
			{/* The browser's own arrow sits against the edge and differs per
			    browser; this one is the site's, inset like the search icon. */}
			<span className='relative'>
				<select
					value={value}
					onChange={(event) => onChange(event.target.value)}
					className='h-10 w-full min-w-0 cursor-pointer appearance-none truncate border border-[var(--rule)] bg-[var(--paper-2)] pl-3 pr-9 text-[14px] text-[var(--ink)] outline-none transition hover:border-[var(--ink)] focus:border-[var(--ink)]'
				>
					{options.map(([key, text]) => (
						<option key={key} value={key}>
							{text}
						</option>
					))}
				</select>
				<CaretDownIcon
					size={11}
					weight='bold'
					aria-hidden='true'
					className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)]'
				/>
			</span>
		</label>
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
	const [area, setArea] = useState('')
	const [klass, setKlass] = useState('')
	const [type, setType] = useState('')

	const areas = [...new Set(units.map((unit) => unit.area))].sort()
	const classes = [...new Set(units.map((unit) => unit.klass).filter((k): k is string => !!k))].sort()
	const matches = useCallback(
		(unit: StatsUnit) => (!area || unit.area === area) && (!klass || unit.klass === klass) && (!type || unit.type === type),
		[area, klass, type],
	)

	const rows = useMemo<DataRow[]>(
		() =>
			units
				.filter((unit) => matches(unit) && data[unit.key]?.[year])
				.map((unit) => {
					const values = data[unit.key]![year]!
					const field = Object.fromEntries(fields.map((name, i) => [name, values[i] ?? null]))
					return {
						key: unit.key,
						href: unit.href,
						name: unit.name,
						meta: unit.meta,
						values: field,
					}
				}),
		[units, fields, data, year, matches],
	)


	return (
		<div>
			<div className='pb-6 lg:pb-10 grid grid-cols-2 gap-3 lg:grid-cols-[minmax(0,1fr)_15rem_9rem_9rem_8rem] lg:items-end lg:gap-4'>
				<label className='col-span-2 flex w-full min-w-0 max-w-[26rem] flex-col gap-1 lg:col-span-1'>
					<span className='text-[12px] text-[var(--ink-3)]'>Search</span>
					<span className='flex h-10 items-center gap-3 border border-[var(--rule)] bg-[var(--paper-2)] px-3 focus-within:border-[var(--ink)]'>
						<MagnifyingGlassIcon className='size-4 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
						<input
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							type='search'
							autoComplete='off'
							spellCheck={false}
							placeholder='Name of a province, city or town'
							className='min-w-0 flex-1 bg-transparent text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
						/>
					</span>
				</label>
				<Select label='Province' value={area} onChange={setArea} options={[['', 'All provinces and areas'], ...areas.map((a): [string, string] => [a, a])]} />
				<Select
					label='Type'
					value={type}
					onChange={setType}
					options={[['', 'All types'], ['Province', 'Province'], ['City', 'City'], ['Municipality', 'Municipality']]}
				/>
				<Select label='Income class' value={klass} onChange={setKlass} options={[['', 'All classes'], ...classes.map((k): [string, string] => [k, `${k} class`])]} />
				<Select label='Fiscal year' value={year} onChange={setYear} options={[...years].reverse().map((y): [string, string] => [String(y), `FY ${y}`])} />
			</div>


			<div className='mt-4'>
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
