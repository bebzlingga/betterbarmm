'use client'

import { useMemo, useState } from 'react'
import { DataTable, type DataColumn, type DataRow } from './data-table'
import { SearchField, Select } from '@betterbarmm/editorial'

/* Every supplier, filtered here: 1,850 small rows are cheap to ship. */

export type SupplierRow = { name: string; slug: string; group: string; awards: number; offices: number; last: string | null; amount: number }

const COLUMNS: DataColumn[] = [
	{ key: 'group', label: 'Category', format: 'text', hideBelow: 'lg' },
	{ key: 'awards', label: 'Awards', format: 'int', hideBelow: 'md' },
	{ key: 'offices', label: 'Offices', format: 'int', hideBelow: 'lg' },
	{ key: 'last', label: 'Latest award', format: 'date', hideBelow: 'lg' },
	{ key: 'amount', label: 'Awarded', format: 'peso' },
]

const SIZES: [string, string, (n: number) => boolean][] = [
	['', 'Any number of awards', () => true],
	['1', 'One award', (n) => n === 1],
	['2-9', '2 to 9 awards', (n) => n >= 2 && n <= 9],
	['10+', '10 or more awards', (n) => n >= 10],
]

export function SupplierExplorer({ rows, groups }: { rows: SupplierRow[]; groups: string[] }) {
	const [query, setQuery] = useState('')
	const [group, setGroup] = useState('')
	const [year, setYear] = useState('')
	const [size, setSize] = useState('')
	const years = useMemo(() => [...new Set(rows.map((r) => r.last?.slice(0, 4)).filter((y): y is string => !!y))].sort().reverse(), [rows])
	const counts = useMemo(() => {
		const c = new Map<string, number>()
		for (const r of rows) c.set(r.group, (c.get(r.group) ?? 0) + 1)
		return c
	}, [rows])
	const fits = SIZES.find(([k]) => k === size)![2]

	const table = useMemo<DataRow[]>(
		() =>
			rows
				.filter((r) => (!group || r.group === group) && (!year || r.last?.startsWith(year)) && fits(r.awards))
				.map((r) => ({
					key: r.name,
					href: `/suppliers/${r.slug}`,
					name: r.name,
					mobile: `${r.group} · ${r.awards} award${r.awards === 1 ? '' : 's'}`,
					values: { group: r.group, awards: r.awards, offices: r.offices, last: r.last, amount: Math.round(r.amount) },
				})),
		[rows, group, year, fits],
	)

	return (
		<div>
			<div className='grid grid-cols-2 gap-3 pb-6 lg:grid-cols-[minmax(0,22rem)_1fr_16rem_10rem_12rem] lg:items-end lg:gap-4 lg:pb-8'>
				<div className='col-span-2 lg:col-span-1'>
					<SearchField value={query} onChange={setQuery} placeholder='Supplier name' />
				</div>
				<span className='hidden lg:block' />
				<Select
					label='Category'
					value={group}
					onChange={setGroup}
					options={[['', 'All categories'], ...groups.filter((g) => counts.get(g)).map((g): [string, string] => [g, `${g} (${counts.get(g)})`])]}
				/>
				<Select label='Latest award' value={year} onChange={setYear} options={[['', 'Any year'], ...years.map((y): [string, string] => [y, y])]} />
				<Select label='Awards' value={size} onChange={setSize} options={SIZES.map(([k, l]): [string, string] => [k, l])} />
			</div>
			<DataTable
				key={`${group}-${year}-${size}`}
				caption='Suppliers awarded contracts by BARMM government offices'
				nameLabel='Supplier'
				query={query}
				columns={COLUMNS}
				rows={table}
				initialSort={{ key: 'amount', down: true }}
				ranked
			/>
		</div>
	)
}
