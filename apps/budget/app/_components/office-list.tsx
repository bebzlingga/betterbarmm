'use client'

import { ArrowUpRightIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { percent, type Office } from '@betterbarmm/budget-data'
import { YearLink } from './year-link'
import { useMemo, useState } from 'react'
import { ExpenseSplit } from './budget-parts'
import { Money } from './money'
import { HEAD_ROW, ROW, SUB, TABLE, TD, TD_NUM, TH, TH_NUM } from './table'

/* ============================================================
   All 44 offices, filtered in the browser

   One list with a field over it rather than a paginated table.
   Forty-four rows is small enough to ship whole and filter on
   every keystroke, and a reader who has to page through four
   screens to find the Ministry of Health has been given a
   worse tool than Ctrl+F.

   The three groups the Act divides the money into are chips
   rather than tabs, because a reader usually wants all of them
   and the chips say what the groups are even when none is
   pressed — which is itself most of what this page has to
   teach.
   ============================================================ */

/* The chips group by what an office is, not by the part of the Act it is
   printed in.

   They used to filter on `budgetGroup` and rename it in the label, which put
   all 25 rows of "Bangsamoro Government Budget" behind a chip reading
   "Ministries" — and only 15 of them are ministries. The other ten are the
   offices, authorities, boards and one advisory body filed under a ministry or
   under the Chief Minister, and a reader pressing "Ministries" was being told
   the Bangsamoro Board of Investments is one.

   The Act's own grouping is not lost: the home page still lists the three
   budget groups under their own names. Here the question a chip answers is
   "what kind of body is this", which is the one a reader scanning 44 rows is
   actually asking.

   The three are exhaustive and do not overlap — 15 + 21 + 8 = 44 — so a
   pressed chip always accounts for every row it hides. */
const GROUPS = [
	{ key: 'ministry', label: 'Ministries', match: (office: Office) => office.officeType === 'Ministry' },
	{
		key: 'other',
		label: 'Other offices',
		match: (office: Office) =>
			office.officeType !== 'Ministry' && office.budgetGroup !== 'Special Purpose Fund',
	},
	{
		key: 'fund',
		label: 'Special funds',
		match: (office: Office) => office.budgetGroup === 'Special Purpose Fund',
	},
] as const

export function OfficeList({ offices }: { offices: Office[] }) {
	const [query, setQuery] = useState('')
	const [group, setGroup] = useState<string | null>(null)

	const shown = useMemo(() => {
		const term = query.trim().toLowerCase()
		const match = GROUPS.find((one) => one.key === group)?.match
		return offices.filter(
			(office) => (!match || match(office)) && (!term || office.haystack.includes(term)),
		)
	}, [offices, query, group])

	return (
		<div>
			<div className='flex flex-col gap-5 pb-8 lg:flex-row lg:items-center lg:justify-between'>
				<label className='finder-field max-w-md'>
					<MagnifyingGlassIcon className='size-4 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
					<span className='sr-only'>Filter offices</span>
					<input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						type='search'
						autoComplete='off'
						spellCheck={false}
						placeholder='Health, education, roads…'
						className='min-w-0 flex-1 bg-transparent text-[0.90625rem] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
					/>
				</label>

				<div className='flex flex-wrap gap-2'>
					{GROUPS.map((one) => (
						<button
							key={one.key}
							type='button'
							aria-pressed={group === one.key}
							onClick={() => setGroup((current) => (current === one.key ? null : one.key))}
							className='chip chip-field'
						>
							{one.label}
							<span className='chip-count'>{offices.filter(one.match).length}</span>
						</button>
					))}
				</div>
			</div>

			<p aria-live='polite' className='sr-only'>
				{shown.length} of {offices.length} offices
			</p>

			{/* A table (user decision): the office, how its money divides, the amount and its share of the budget, one
			    column each. The split needs room, so it comes in at `lg`; the share at `sm`. */}
			<div>
				<table className={TABLE}>
					<caption className='sr-only'>Every office in the Act</caption>
					<thead>
						<tr className={HEAD_ROW}>
							<th scope='col' className={TH}>
								Office
							</th>
							<th scope='col' className={`${TH} hidden lg:table-cell`}>
								How it divides
							</th>
							<th scope='col' className={TH_NUM}>
								Amount
							</th>
							<th scope='col' className={`${TH_NUM} hidden sm:table-cell`}>
								Of the budget
							</th>
						</tr>
					</thead>
					<tbody>
						{shown.map((office) => (
							<tr key={office.slug} className={ROW}>
								<th scope='row' className={`${TD} font-normal`}>
									<YearLink
										href={`/offices/${office.slug}`}
										className='inline-flex items-baseline gap-2 text-[0.96875rem] font-bold leading-snug tracking-[-0.02em] text-[var(--ink)] transition hover:text-[var(--accent)]'
									>
										{office.name}
										<ArrowUpRightIcon className='size-3.5 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
									</YearLink>
									<span className={SUB}>
										{office.officeType}
										{office.parent ? ` · under ${office.parent.name}` : ''}
									</span>
								</th>
								<td className={`${TD} hidden w-[22rem] lg:table-cell`}>
									<ExpenseSplit totals={office.totals} layout='inline' />
								</td>
								<td className={TD_NUM}>
									<Money amount={office.totals.total} />
								</td>
								<td className={`${TD_NUM} hidden font-mono text-[0.75rem] text-[var(--brass)] sm:table-cell`}>{percent(office.share)}</td>
							</tr>
						))}
					</tbody>
				</table>

				{shown.length === 0 ? (
					<p className='py-16 text-center text-[0.84375rem] leading-7 text-[var(--ink-3)]'>
						No office matches “{query.trim()}”
						{group ? ' in that group' : ''}. The Act names offices formally — try “education” rather
						than “schools”, or search the{' '}
						<YearLink href='/programs' className='rule-link'>
							programs
						</YearLink>{' '}
						instead, where the money is described by what it does.
					</p>
				) : null}
			</div>
		</div>
	)
}
