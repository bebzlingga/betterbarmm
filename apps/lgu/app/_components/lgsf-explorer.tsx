'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { DataTable, type DataColumn, type DataRow } from './data-table'
import { Select } from './stats-explorer'

/* Every support-fund project, filtered here: all of them fit in the browser. */

export type LgsfRow = {
	key: string
	href: string
	project: string
	lgu: string
	area: string
	barangay: string | null
	program: string
	year: number
	saro: number | null
	nca: number | null
}

const COLUMNS: DataColumn[] = [
	{ key: 'lgu', label: 'Local government', format: 'text', hideBelow: 'md' },
	{ key: 'year', label: 'Year', format: 'text', hideBelow: 'md' },
	{ key: 'program', label: 'Program', format: 'text', hideBelow: 'lg' },
	{ key: 'saro', label: 'Allotted', format: 'peso' },
	{ key: 'nca', label: 'Released', format: 'peso', hideBelow: 'sm' },
]

const peso = (n: number) => (n >= 1e9 ? `₱${(n / 1e9).toFixed(2)}B` : `₱${(n / 1e6).toFixed(1)}M`)

export function LgsfExplorer({
	rows,
	years,
	programs,
}: {
	rows: LgsfRow[]
	years: number[]
	programs: { code: string; name: string }[]
}) {
	const [query, setQuery] = useState('')
	const [year, setYear] = useState('')
	const [program, setProgram] = useState('')
	const [area, setArea] = useState('')
	const areas = [...new Set(rows.map((r) => r.area))].sort()

	const kept = useMemo(() => {
		const q = query.trim().toLowerCase()
		return rows.filter(
			(r) =>
				(!year || String(r.year) === year) &&
				(!program || r.program === program) &&
				(!area || r.area === area) &&
				(!q || `${r.project} ${r.lgu} ${r.barangay ?? ''}`.toLowerCase().includes(q)),
		)
	}, [rows, query, year, program, area])

	const table: DataRow[] = kept.map((r) => ({
		key: r.key,
		href: r.href,
		name: r.project,
		meta: r.lgu === r.area ? undefined : r.area,
		mobile: `${r.lgu} · FY ${r.year} · ${r.program}`,
		values: { lgu: r.lgu, year: String(r.year), program: r.program, saro: r.saro, nca: r.nca },
	}))

	const allotted = kept.reduce((t, r) => t + (r.saro ?? 0), 0)
	const released = kept.reduce((t, r) => t + (r.nca ?? 0), 0)

	return (
		<div>
			<div className='grid grid-cols-2 gap-3 pb-6 lg:grid-cols-[minmax(0,1fr)_9rem_15rem_14rem] lg:items-end lg:gap-4 lg:pb-10'>
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
							placeholder='Project, town or barangay'
							className='min-w-0 flex-1 bg-transparent text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
						/>
					</span>
				</label>
				<Select label='Year' value={year} onChange={setYear} options={[['', 'All years'], ...years.map((y): [string, string] => [String(y), `FY ${y}`])]} />
				<Select label='Program' value={program} onChange={setProgram} options={[['', 'All programs'], ...programs.map((p): [string, string] => [p.code, p.name])]} />
				<Select label='Province' value={area} onChange={setArea} options={[['', 'All provinces and areas'], ...areas.map((a): [string, string] => [a, a])]} />
			</div>

			<p className='mb-4 text-[13px] text-[var(--ink-3)]'>
				<span className='num font-semibold text-[var(--ink)]'>{kept.length}</span> projects ·{' '}
				<span className='num font-semibold text-[var(--ink)]'>{peso(allotted)}</span> allotted ·{' '}
				<span className='num font-semibold text-[var(--ink)]'>{peso(released)}</span> released
			</p>

			<DataTable
				caption='Local Government Support Fund projects of BARMM local governments'
				nameLabel='Project'
				query=''
				columns={COLUMNS}
				rows={table}
				initialSort={{ key: 'saro', down: true }}
			/>
		</div>
	)
}
