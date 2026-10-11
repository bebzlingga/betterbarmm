'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { DataTable, type DataColumn, type DataRow } from './data-table'
import { Select } from './stats-explorer'

/* ============================================================
   Every elected local official, one term at a time

   The term is in the URL, so only one term's officials reach the
   browser; the other filters and the search run here.
   ============================================================ */

export type OfficialRow = {
	key: string
	name: string
	position: string
	lgu: string
	href: string
	area: string
	level: 'Province' | 'City' | 'Municipality'
	party: string | null
	votes: number | null
	/** Share of the vote, 0–100. */
	pct: number | null
}

const COLUMNS: DataColumn[] = [
	{ key: 'position', label: 'Position', format: 'text' },
	{ key: 'lgu', label: 'Local government', format: 'text', hideBelow: 'md' },
	{ key: 'party', label: 'Party', format: 'text', hideBelow: 'sm' },
	{ key: 'votes', label: 'Votes', format: 'int', hideBelow: 'md' },
	{ key: 'share', label: 'Share', format: 'pct', hideBelow: 'lg' },
]

export function OfficialsExplorer({
	terms,
	term,
	officials,
}: {
	terms: { id: string; label: string }[]
	term: string
	officials: OfficialRow[]
}) {
	const router = useRouter()
	const [query, setQuery] = useState('')
	const [area, setArea] = useState('')
	const [level, setLevel] = useState('')
	const [position, setPosition] = useState('')
	const [party, setParty] = useState('')

	const areas = [...new Set(officials.map((o) => o.area))].sort()
	const positions = [...new Set(officials.map((o) => o.position))]
	const parties = [...new Set(officials.map((o) => o.party).filter((p): p is string => !!p))].sort()

	const rows = useMemo<DataRow[]>(
		() =>
			officials
				.filter(
					(o) =>
						(!area || o.area === area) &&
						(!level || o.level === level) &&
						(!position || o.position === position) &&
						(!party || o.party === party),
				)
				.map((o) => ({
					key: o.key,
					href: o.href,
					name: o.name,
					mobile: `${o.position}, ${o.lgu}`,
					values: {
						position: o.position,
						lgu: o.lgu,
						party: o.party,
						votes: o.votes,
						share: o.pct == null ? null : o.pct / 100,
					},
				})),
		[officials, area, level, position, party],
	)

	return (
		<div>
			<div className='grid grid-cols-2 gap-3 pb-6 lg:grid-cols-[minmax(0,1fr)_8rem_13rem_9rem_11rem_9rem] lg:items-end lg:gap-4 lg:pb-10'>
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
							placeholder='Name, town or party'
							className='min-w-0 flex-1 bg-transparent text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
						/>
					</span>
				</label>
				<Select
					label='Term'
					value={term}
					onChange={(next) => router.push(`/officials?term=${next}`, { scroll: false })}
					options={terms.map((t): [string, string] => [t.id, t.label])}
				/>
				<Select label='Province' value={area} onChange={setArea} options={[['', 'All provinces and areas'], ...areas.map((a): [string, string] => [a, a])]} />
				<Select
					label='Level'
					value={level}
					onChange={setLevel}
					options={[['', 'All levels'], ['Province', 'Province'], ['City', 'City'], ['Municipality', 'Municipality']]}
				/>
				<Select label='Position' value={position} onChange={setPosition} options={[['', 'All positions'], ...positions.map((p): [string, string] => [p, p])]} />
				<Select label='Party' value={party} onChange={setParty} options={[['', 'All parties'], ...parties.map((p): [string, string] => [p, p])]} />
			</div>

			<p className='mt-2 text-[13px] text-[var(--ink-3)]'>
				<span className='num font-semibold text-[var(--ink)]'>{rows.length.toLocaleString('en-PH')}</span> officials
			</p>

			<div className='mt-4'>
				<DataTable
					key={term}
					caption={`Elected local officials, ${terms.find((t) => t.id === term)?.label ?? term}`}
					nameLabel='Name'
					query={query}
					columns={COLUMNS}
					rows={rows}
					initialSort={{ key: 'lgu', down: false }}
				/>
			</div>
		</div>
	)
}
