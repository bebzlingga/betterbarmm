'use client'

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
	const [level, setLevel] = useState<'town' | 'province'>('town')

	const rows = useMemo<DataRow[]>(
		() =>
			units
				.filter((unit) => unit.level === level && data[unit.key]?.[year])
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
		[units, fields, data, year, level],
	)

	const total = units.filter((unit) => unit.level === level).length

	return (
		<div>
			<div className='flex flex-col gap-3 border-y border-[var(--rule)] py-4 lg:flex-row lg:items-center lg:justify-between'>
				<Choice
					label='Level'
					value={level}
					options={[
						['town', 'Cities and municipalities'],
						['province', 'Provinces'],
					]}
					onChange={setLevel}
				/>
				<Choice label='Fiscal year' value={year} options={years.map((y) => [String(y), String(y)])} onChange={setYear} />
			</div>

			<p className='mt-4 text-[13px] text-[var(--ink-3)]'>
				{rows.length} of {total} reported for FY {year}
				{rows.length < total ? '; the rest filed nothing that year and are left out' : ''}.
				{year === String(years.at(-1)) ? ' This year is BLGF’s preliminary release.' : ''}
			</p>

			<div className='mt-6'>
				<DataTable
					// Remount on a new level or year so the ranking reopens on its measure.
					key={`${level}-${year}`}
					caption={`${level === 'town' ? 'Cities and municipalities' : 'Provinces'} ranked by their finances, FY ${year}`}
					nameLabel={level === 'town' ? 'City or municipality' : 'Province'}
					filterLabel={level === 'town' ? 'cities and municipalities' : undefined}
					columns={COLUMNS}
					rows={rows}
					initialSort={{ key: 'localSources', down: true }}
					ranked
				/>
			</div>
		</div>
	)
}
