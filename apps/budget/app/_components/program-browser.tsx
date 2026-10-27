'use client'

import { MagnifyingGlassIcon, PlusIcon } from '@phosphor-icons/react'
import { EXPENSE_CLASSES, percent, type ProgramRow, type Sector } from '@betterbarmm/budget-data'
import { FilterMenu } from './filter-menu'
import { useCarriedYear, YearLink } from './year-link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { Money } from './money'
import { HEAD_ROW, ROW, SUB, TABLE, TD, TD_NUM, TH, TH_NUM } from './table'

/* ============================================================
   246 programs, filtered in the browser

   The whole list ships with the page and is filtered on every
   keystroke. It is a few dozen kilobytes and it means the field
   answers instantly, offline, and without a round trip on a phone
   on a slow connection — which is most of the readers this is
   for.

   The query lives in `?q=` as well as in state so a result can be
   linked to: the assistant, the finder and the office pages all
   send readers here with a term already in it, and a page that
   dropped it on arrival would show every row and no explanation.
   ============================================================ */

/** How many rows are drawn before the "show the rest" button. */
const PAGE = 40

export function ProgramBrowser({
	programs,
	sectors,
}: {
	programs: ProgramRow[]
	/** All of them: a menu can hold thirty-eight where a row of chips could not. */
	sectors: Sector[]
}) {
	const router = useRouter()
	const params = useSearchParams()
	const fy = useCarriedYear()
	const [query, setQuery] = useState(params.get('q') ?? '')
	const [shownCount, setShownCount] = useState(PAGE)
	/* The sectors ticked in the menu. Held as tags, not names: a row carries
	   the taxonomy's own string and the menu prints the shortened one beside
	   it. */
	const [picked, setPicked] = useState<Set<string>>(new Set())
	/* The rows a reader has opened. */
	const [opened, setOpened] = useState<Set<string>>(new Set())
	const toggleRow = (id: string) =>
		setOpened((current) => {
			const next = new Set(current)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})

	// Keep the address bar in step, without a navigation per keystroke. The
	// history entry is replaced rather than pushed: twenty keystrokes should
	// not be twenty presses of the back button.
	useEffect(() => {
		const id = setTimeout(() => {
			/* Both parameters, not just the one being typed. This rewrites the
			   whole query string, so building it from `q` alone dropped the
			   reader's `?fy=` and sent them back to the current year on the first
			   keystroke. */
			const next = new URLSearchParams()
			if (query.trim()) next.set('q', query.trim())
			if (fy) next.set('fy', fy)
			const search = next.toString()
			router.replace(`/programs${search ? `?${search}` : ''}`, { scroll: false })
		}, 250)
		return () => clearTimeout(id)
	}, [query, fy, router])

	/* The sub-programs under each program, by the parent's path.
	   `program_path` is the Act's own "Parent > Child", and a parent's printed
	   total is the sum of its children — School-Based Management and Operations
	   is ₱21.1bn and its fifteen division lines come to ₱21.1bn — so the list
	   inside a row is a breakdown of it and not a second helping of the same
	   money. */
	const children = useMemo(() => {
		const index = new Map<string, ProgramRow[]>()
		for (const row of programs) {
			const cut = row.path.lastIndexOf(' > ')
			if (cut < 0) continue
			const parent = row.path.slice(0, cut)
			index.set(parent, [...(index.get(parent) ?? []), row])
		}
		for (const rows of index.values()) rows.sort((one, other) => other.total - one.total)
		return index
	}, [programs])

	const hits = useMemo(() => {
		const term = query.trim().toLowerCase()
		return programs.filter(
			(program) =>
				(!term || program.haystack.includes(term)) &&
				(picked.size === 0 || program.tags.some((tag) => picked.has(tag))),
		)
	}, [programs, query, picked])

	/* Counted against the whole list rather than against what the field has
	   already narrowed: a menu whose numbers moved as the reader typed would be
	   telling them what they have left, not what they could ask for. */
	const options = useMemo(
		() =>
			sectors
				.map((sector) => ({
					value: sector.tag,
					label: sector.name,
					count: programs.filter((program) => program.tags.includes(sector.tag)).length,
				}))
				.filter((one) => one.count > 0),
		[sectors, programs],
	)

	const toggle = (tag: string) => {
		setPicked((current) => {
			const next = new Set(current)
			if (next.has(tag)) next.delete(tag)
			else next.add(tag)
			return next
		})
		setShownCount(PAGE)
	}

	const shown = hits.slice(0, shownCount)
	const found = hits.reduce((sum, program) => sum + program.total, 0)

	return (
		<div>
			<div className='flex flex-col gap-5 pb-8 lg:flex-row lg:items-center lg:justify-between'>
				<label className='finder-field max-w-xl'>
					<MagnifyingGlassIcon className='size-4 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
					<span className='sr-only'>Search programs</span>
					<input
						value={query}
						onChange={(event) => {
							setQuery(event.target.value)
							setShownCount(PAGE)
						}}
						type='search'
						autoComplete='off'
						spellCheck={false}
						placeholder='Scholarship, madrasah, irrigation, halal…'
						className='min-w-0 flex-1 bg-transparent text-[0.90625rem] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
					/>
				</label>

				{/* A menu rather than a row of chips (user decision), which buys the
				    thing chips could not do here: a chip wrote its own name into the
				    search box, so a reader could hold exactly one sector at a time and
				    "scholarships across health and education" was not a question the
				    page could be asked. Several boxes tick at once, the field goes back
				    to being only a field, and all thirty-eight fit where eight did.

				    On the field's own row and ranged right, which is where the office
				    and sector lists put theirs too — a filter belongs beside
				    the thing it filters, not on a line of its own beneath it. */}
				<FilterMenu
					label='Sector'
					options={options}
					selected={picked}
					onToggle={toggle}
					onClear={() => {
						setPicked(new Set())
						setShownCount(PAGE)
					}}
				/>
			</div>

			{/* A count and a sum, because "82 programs match" is a different fact
			    from "and they come to ₱12 billion", and a reader searching a budget
			    for a sector wants the second one. */}
			<p
				aria-live='polite'
				className='mt-5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'
			>
				<span className='money text-[var(--ink)]'>{hits.length}</span> of {programs.length}{' '}
				programs
				{query.trim() ? (
					<>
						{' '}
						· <span className='money text-[var(--brass)]'><Money amount={found} /></span> between them
					</>
				) : null}
			</p>

			{/* A table (user decision). A row still opens in place (user decision on the shape): the name is a button
			    that unfolds a full-width row under it with the classes, the lines and where the rest is printed. */}
			<div className='mt-3'>
				<table className={TABLE}>
					<caption className='sr-only'>Programs in the Act</caption>
					<thead>
						<tr className={HEAD_ROW}>
							<th scope='col' className={TH}>
								Program
							</th>
							<th scope='col' className={`${TH} hidden lg:table-cell`}>
								Office
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
						{shown.map((program) => {
							/* Both of these are on the row already — the class figures are the
							   three numbers the list ships for every program, and the children
							   are other rows of the same list. Nothing is fetched to open a row. */
							const parts = EXPENSE_CLASSES.map((one) => ({
								...one,
								amount: program[one.key],
								share: program.total ? (program[one.key] / program.total) * 100 : 0,
							})).filter((one) => one.amount > 0)
							const under = children.get(program.path) ?? []
							const biggest = Math.max(...under.map((one) => one.total), 1)
							const isOpen = opened.has(program.id)

							return (
								<Fragment key={program.id}>
									<tr className={`${ROW} ${isOpen ? 'border-b-0 bg-[var(--paper-2)]' : ''}`}>
										<th scope='row' className={`${TD} font-normal`}>
											<button
												type='button'
												aria-expanded={isOpen}
												aria-controls={`program-${program.id}`}
												onClick={() => toggleRow(program.id)}
												className='group/row flex w-full cursor-pointer items-start gap-2.5 text-left'
											>
												<PlusIcon
													weight='bold'
													className={`mt-1 size-3 shrink-0 text-[var(--ink-3)] transition group-hover/row:text-[var(--accent)] ${isOpen ? 'rotate-45' : ''}`}
													aria-hidden='true'
												/>
												<span className='min-w-0'>
													<span className='block text-[0.90625rem] font-semibold leading-snug tracking-[-0.01em] text-[var(--ink)] transition group-hover/row:text-[var(--accent)]'>
														{program.path}
													</span>
													<span className={SUB}>
														{program.level === 'sub_program' ? 'Sub-program' : 'Program'}
														{program.costStructure ? ` · ${program.costStructure}` : ''}
														{under.length > 0 ? ` · ${under.length} sub-${under.length === 1 ? 'program' : 'programs'}` : ''}
														<span className='lg:hidden'> · {program.office}</span>
													</span>
												</span>
											</button>
										</th>
										<td className={`${TD} hidden w-[16rem] text-[0.78125rem] leading-snug text-[var(--ink-2)] lg:table-cell`}>
											{program.office}
											<span className={SUB}>{program.sector}</span>
										</td>
										<td className={TD_NUM}>
											<Money amount={program.total} />
										</td>
										<td className={`${TD_NUM} hidden font-mono text-[0.75rem] text-[var(--brass)] sm:table-cell`}>{percent(program.share, 2)}</td>
									</tr>
									{isOpen ? (
										<tr id={`program-${program.id}`} className='border-b border-[var(--rule-soft)] bg-[var(--paper-2)]'>
											<td colSpan={4}>
										<div className='pb-9 pl-5 pt-2 lg:pl-8'>
											<div className='flex items-baseline justify-between gap-6'>
												<p className='bb-label leading-none'>What the money is</p>
												<p className='money font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]'>
													{parts.length} {parts.length === 1 ? 'class' : 'classes'}
												</p>
											</div>

											{/* The three expense classes, drawn against this program's own
											    total. Each row carries its name, its length and its figure,
											    so the color is never the only thing telling them apart. */}
											<dl className='mt-5'>
												{parts.map((one) => (
													<div
														key={one.key}
														className='grid items-center gap-x-6 gap-y-2 border-t border-[var(--rule)] py-3.5 first:border-t-0 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,10rem)]'
													>
														<dt className='flex items-center gap-2 text-[0.8125rem] font-semibold text-[var(--ink)]'>
															<span
																aria-hidden='true'
																className='size-2.5 shrink-0 rotate-45'
																style={{ background: one.tone }}
															/>
															{one.label}
														</dt>
														<dd className='rank-track'>
															<div
																className='rank-bar'
																style={{ width: `${Math.max(1, one.share)}%`, background: one.tone }}
																aria-hidden='true'
															/>
														</dd>
														<dd className='money money-light flex items-baseline justify-between gap-3 text-[0.8125rem] text-[var(--ink)] sm:justify-end'>
															<Money amount={one.amount} />
															<span className='font-mono text-[0.625rem] uppercase tracking-[0.1em] text-[var(--ink-3)]'>
																{percent(one.share)}
															</span>
														</dd>
													</div>
												))}
											</dl>

											{under.length > 0 ? (
												<>
													<div className='mt-8 flex items-baseline justify-between gap-6'>
														<p className='bb-label leading-none'>What it is divided into</p>
														<p className='money font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]'>
															{under.length} {under.length === 1 ? 'line' : 'lines'} ·{' '}
															<Money amount={under.reduce((sum, one) => sum + one.total, 0)} />
														</p>
													</div>

													<dl className='mt-5'>
														{under.map((one) => (
															<div
																key={one.id}
																className='grid items-center gap-x-6 gap-y-2 border-t border-[var(--rule)] py-3 first:border-t-0 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,10rem)]'
															>
																<dt className='text-[0.8125rem] leading-snug text-[var(--ink-2)]'>
																	{one.name}
																</dt>
																<dd className='rank-track'>
																	<div
																		className='rank-bar'
																		style={{ width: `${Math.max(1, (one.total / biggest) * 100)}%` }}
																		aria-hidden='true'
																	/>
																</dd>
																<dd className='money money-light text-[0.8125rem] text-[var(--ink)] sm:text-right'>
																	<Money amount={one.total} />
																</dd>
															</div>
														))}
													</dl>
												</>
											) : null}

											{/* Where the rest of this row's money is described. The Act prints
											    the object items — salaries, fuel, equipment — per office and
											    never per program, so this says where they are rather than
											    splitting an office's tree across its programs. */}
											<p className='mt-7 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-[var(--rule)] pt-5 text-[0.78125rem] leading-6 text-[var(--ink-3)]'>
												<YearLink href={`/offices/${program.officeSlug}`} className='rule-link'>
													{program.office}
												</YearLink>
												<span aria-hidden='true'>·</span>
												<YearLink href={`/sectors/${program.sectorSlug}`} className='rule-link'>
													{program.sector}
												</YearLink>
												<span aria-hidden='true'>·</span>
												<span>
													Printed on page {program.sourcePage} of the Act. The object items behind
													these figures — salaries, fuel, equipment — are printed per office, on
													the office’s page.
												</span>
											</p>
										</div>
											</td>
										</tr>
									) : null}
								</Fragment>
							)
						})}
					</tbody>
				</table>

				{hits.length === 0 ? (
					<p className='py-16 text-center text-[0.84375rem] leading-7 text-[var(--ink-3)]'>
						No program in the Act says “{query.trim()}”. It names things formally and often in
						the plural — “Scholarship” rather than “student aid”, “Farm-to-Market” rather than
						“roads”. Try one word rather than a phrase.
					</p>
				) : null}
			</div>

			{shownCount < hits.length ? (
				/* Centerd, as on the projects browser: it is the one control under a
				   column of rows, and ranged left it read as the start of another row
				   rather than as the end of the list. `bb-btn` is inline-flex, so the
				   centring goes on a wrapper — `mx-auto` on the button would do
				   nothing. */
				<div className='mt-8 flex justify-center'>
					<button
						type='button'
						onClick={() => setShownCount((current) => current + PAGE * 2)}
						className='bb-btn bb-btn-ghost'
					>
						Show the remaining {hits.length - shownCount}
					</button>
				</div>
			) : null}
		</div>
	)
}
