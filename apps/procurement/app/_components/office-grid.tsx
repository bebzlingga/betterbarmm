'use client'

import { ArrowUpRightIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { EntityRow } from './entity-explorer'
import { SearchField, Select } from './controls'

/* Every office as a card: what it put out to bid and what it awarded. */

const peso = (n: number) =>
	n >= 1e9 ? `₱${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `₱${(n / 1e6).toFixed(1)}M` : `₱${Math.round(n).toLocaleString('en-PH')}`

const SORTS: [string, string, number][] = [
	['abc', 'Largest approved budget', 1],
	['notices', 'Most notices', 0],
	['contracts', 'Largest amount awarded', 3],
	['awards', 'Most contracts awarded', 2],
]

const FIRST = 24

export function OfficeGrid({ rows, years }: { rows: EntityRow[]; years: number[] }) {
	const [query, setQuery] = useState('')
	const [type, setType] = useState('')
	const [year, setYear] = useState('')
	const [sort, setSort] = useState('abc')
	const [all, setAll] = useState(false)
	const types = useMemo(() => [...new Set(rows.map((r) => r.type))].sort(), [rows])

	const shown = useMemo(() => {
		const q = query.trim().toLowerCase()
		const by = SORTS.find(([k]) => k === sort)![2]
		return rows
			.map((r) => ({ r, f: year ? r.byYear[year] : r.all }))
			.filter(({ r, f }) => f && (!type || r.type === type) && (!q || r.name.toLowerCase().includes(q)))
			.sort((a, b) => b.f![by] - a.f![by])
	}, [rows, query, type, year, sort])

	return (
		<div>
			<div className='grid grid-cols-2 gap-3 pb-8 lg:grid-cols-[minmax(0,22rem)_1fr_16rem_9rem_14rem] lg:items-end lg:gap-4'>
				<div className='col-span-2 lg:col-span-1'>
					<SearchField value={query} onChange={setQuery} placeholder='Office, province, town or hospital' />
				</div>
				<span className='hidden lg:block' />
				<Select label='Type' value={type} onChange={setType} options={[['', 'All types'], ...types.map((t): [string, string] => [t, t])]} />
				<Select label='Year' value={year} onChange={setYear} options={[['', 'All years'], ...[...years].reverse().map((y): [string, string] => [String(y), String(y)])]} />
				<Select label='Sort by' value={sort} onChange={setSort} options={SORTS.map(([k, l]): [string, string] => [k, l])} />
			</div>

			<p className='mb-5 text-[13px] text-[var(--ink-3)]'>
				<span className='num font-semibold text-[var(--ink)]'>{shown.length}</span> offices
			</p>

			<div className='grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-3'>
				{(all ? shown : shown.slice(0, FIRST)).map(({ r, f }) => {
					const [notices, abc, awards, contracts] = f!
					const share = abc ? Math.min(contracts / abc, 1) : 0
					return (
						<Link
							key={r.slug}
							href={`/${r.slug}`}
							className='group flex flex-col border border-[var(--rule)] bg-[var(--paper)] p-5 transition hover:border-[var(--accent)] hover:bg-[var(--paper-2)]'
						>
							<div className='flex items-start justify-between gap-3'>
								<span className='text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>{r.type}</span>
								<ArrowUpRightIcon className='size-4 shrink-0 text-[var(--ink-3)] transition group-hover:text-[var(--accent)]' aria-hidden='true' />
							</div>
							<h3 className='mt-2 line-clamp-2 min-h-[2.75rem] text-[15px] font-bold leading-snug text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
								{r.name}
							</h3>
							<dl className='mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[var(--rule)] pt-4'>
								{[
									['Notices', notices.toLocaleString('en-PH')],
									['Approved budget', peso(abc)],
									['Awarded', awards.toLocaleString('en-PH')],
									['Awarded amount', peso(contracts)],
								].map(([label, value]) => (
									<div key={label}>
										<dd className='num text-[16px] font-bold text-[var(--ink)]'>{value}</dd>
										<dt className='text-[11.5px] text-[var(--ink-3)]'>{label}</dt>
									</div>
								))}
							</dl>
							<div className='mt-4' title={`${Math.round(share * 100)}% of its approved budget awarded`}>
								<div className='h-1.5 bg-[var(--paper-3)]'>
									<div className='h-full bg-[var(--accent)]' style={{ width: `${share * 100}%` }} />
								</div>
								<p className='mt-1.5 text-[11px] text-[var(--ink-mute)]'>{Math.round(share * 100)}% of its approved budget awarded</p>
							</div>
						</Link>
					)
				})}
			</div>

			{shown.length > FIRST && !all ? (
				<div className='mt-8 flex justify-center'>
					<button type='button' onClick={() => setAll(true)} className='bb-btn bb-btn-ghost cursor-pointer'>
						Show all {shown.length}
					</button>
				</div>
			) : null}
		</div>
	)
}
