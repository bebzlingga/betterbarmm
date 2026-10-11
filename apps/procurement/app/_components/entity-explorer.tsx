'use client'

import { useMemo, useState } from 'react'
import { DataTable, type DataColumn, type DataRow } from './data-table'
import { SearchField, Select } from './controls'

/* Every procuring entity, ranked; the filters run here, since 274 rows of
   yearly totals are small enough to ship whole. */

/** notices, approved budget, awards, contract amount */
type Figures = [number, number, number, number]

export type EntityRow = {
	slug: string
	name: string
	type: string
	all: Figures
	byYear: Record<string, Figures>
}

const COLUMNS: DataColumn[] = [
	{ key: 'type', label: 'Type', format: 'text', hideBelow: 'lg' },
	{ key: 'notices', label: 'Notices', format: 'int', hideBelow: 'md' },
	{ key: 'abc', label: 'Approved budget', format: 'peso' },
	{ key: 'awards', label: 'Awards', format: 'int', hideBelow: 'lg' },
	{ key: 'contracts', label: 'Contracts', format: 'peso', hideBelow: 'sm' },
]

export function EntityExplorer({ rows, years }: { rows: EntityRow[]; years: number[] }) {
	const [query, setQuery] = useState('')
	const [type, setType] = useState('')
	const [year, setYear] = useState('')
	const types = [...new Set(rows.map((r) => r.type))].sort()

	const table = useMemo<DataRow[]>(
		() =>
			rows
				.filter((r) => (!type || r.type === type) && (!year || r.byYear[year]))
				.map((r) => {
					const [notices, abc, awards, contracts] = year ? r.byYear[year]! : r.all
					return {
						key: r.slug,
						href: `/${r.slug}`,
						name: r.name,
						mobile: r.type,
						values: { type: r.type, notices, abc, awards, contracts },
					}
				}),
		[rows, type, year],
	)

	return (
		<div>
			<div className='grid grid-cols-2 gap-3 pb-6 lg:grid-cols-[minmax(0,26rem)_1fr_16rem_10rem] lg:items-end lg:gap-4 lg:pb-10'>
				<div className='col-span-2 lg:col-span-1'>
					<SearchField value={query} onChange={setQuery} placeholder='Office, province, town or hospital' />
				</div>
				<span className='hidden lg:block' />
				<Select label='Type' value={type} onChange={setType} options={[['', 'All types'], ...types.map((t): [string, string] => [t, t])]} />
				<Select label='Year' value={year} onChange={setYear} options={[['', 'All years'], ...[...years].reverse().map((y): [string, string] => [String(y), String(y)])]} />
			</div>
			<DataTable
				key={year}
				caption='BARMM procuring entities on PhilGEPS, ranked by approved budget'
				nameLabel='Procuring entity'
				query={query}
				columns={COLUMNS}
				rows={table}
				initialSort={{ key: 'abc', down: true }}
				ranked
			/>
		</div>
	)
}
