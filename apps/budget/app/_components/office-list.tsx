'use client'

import { ArrowUpRightIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { percent, peso, type Office } from '@betterbarmm/budget-data'
import { YearLink } from './year-link'
import { useMemo, useState } from 'react'
import { ExpenseSplit } from './budget-parts'

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
						className='min-w-0 flex-1 bg-transparent text-[14.5px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
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

			{/* No top margin: the first row brings 2.25rem of its own `py-9`, and
			    the controls above already close on `pb-5`. Stacked, the three read as
			    a break between the field and the list rather than as one block. */}
			<div>
				{shown.map((office) => (
					<YearLink
						key={office.slug}
						href={`/offices/${office.slug}`}
						className='group grid items-center gap-x-10 gap-y-4 border-t border-[var(--rule)] py-7 transition first:border-t-0 hover:bg-[var(--paper-2)] lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)_minmax(0,11rem)]'
					>
						<div className='min-w-0'>
							{/* `leading-none`: 10px text in a 15px inherited line box put a
							    few pixels above the caps that nothing balances at the foot. */}
							<p className='bb-label leading-none'>
								{office.officeType}
								{office.parent ? ` · under ${office.parent.name}` : ''}
							</p>
							<h2 className='mt-2.5 flex items-baseline gap-2 text-[1.15rem] font-bold leading-tight tracking-[-0.03em] text-[var(--ink)] transition duration-500 group-hover:text-[var(--accent)]'>
								{office.name}
								<ArrowUpRightIcon
									className='size-3.5 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
									aria-hidden='true'
								/>
							</h2>
						</div>

						{/* The split, and only the split. A length-against-the-largest bar
						    was drawn above it here too, and the two read as one chart with
						    a stray line over it — they encode different things, and the
						    amount the length bar stood for is printed in full one column
						    to the right. It stays on the home page, where ten rows are
						    being compared and no total is repeated beside each. */}
						<div>
							<ExpenseSplit totals={office.totals} layout='inline' />
						</div>

						<div className='lg:text-right'>
							<p className='money text-[1.05rem] font-bold tracking-[-0.02em] text-[var(--ink)]'>
								{peso(office.totals.total)}
							</p>
							<p className='money mt-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brass)]'>
								{percent(office.share)} of the budget
							</p>
						</div>
					</YearLink>
				))}

				{shown.length === 0 ? (
					<p className='border-t border-[var(--rule)] py-16 text-center text-[13.5px] leading-7 text-[var(--ink-3)]'>
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
