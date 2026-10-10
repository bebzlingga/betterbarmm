'use client'

import { ArrowUpRightIcon, CheckIcon } from '@phosphor-icons/react'
import { useState } from 'react'

export type DisclosureCell = { href: string; posted: string }

const COLUMNS = [
	{ key: 'year', label: 'Year' },
	{ key: 'q1', label: 'Q1' },
	{ key: 'q2', label: 'Q2' },
	{ key: 'q3', label: 'Q3' },
	{ key: 'q4', label: 'Q4' },
] as const

/** One table of a unit's Full Disclosure postings, with a button per year. */
export function DisclosureTable({
	years,
	documents,
	quarterly,
	byYear,
	portal,
}: {
	/** Newest first. */
	years: number[]
	documents: { id: number; label: string }[]
	/** Documents posted by the quarter; the rest are annual. */
	quarterly: number[]
	/** `${document}:${column}` -> the posting, for each year. */
	byYear: Record<number, Record<string, DisclosureCell>>
	/** The town's filtered report on DILG's portal; each document name links into it. */
	portal?: string
}) {
	const [year, setYear] = useState(years[0])
	const cells = byYear[year] ?? {}
	const posted = documents.filter((doc) => COLUMNS.some((c) => cells[`${doc.id}:${c.key}`])).length
	const applies = (doc: number, key: string) => (key === 'year' ? !quarterly.includes(doc) : quarterly.includes(doc))

	return (
		<div className='mt-12'>
			<div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-[var(--brass-line)] pb-3'>
				<div role='group' aria-label='Year' className='flex flex-wrap gap-1'>
					{years.map((y) => (
						<button
							key={y}
							type='button'
							aria-pressed={y === year}
							onClick={() => setYear(y)}
							className={`num cursor-pointer px-3 py-1.5 font-mono text-[11px] font-semibold tracking-[0.1em] transition ${
								y === year
									? 'bg-[var(--paper-2)] text-[var(--ink)]'
									: 'text-[var(--ink-3)] hover:text-[var(--ink)]'
							}`}
						>
							{y}
						</button>
					))}
				</div>
				<p className='text-[12.5px] text-[var(--ink-3)]'>
					<span className='num font-semibold text-[var(--ink)]'>{posted}</span> of {documents.length} documents
					posted for {year}
				</p>
			</div>

			<p aria-hidden='true' className='mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)] sm:hidden'>
				Swipe for every quarter &rarr;
			</p>
			{/* `relative` keeps the ticks' screen-reader labels inside the scroll
			    box; positioned outside it they widen the page. */}
			<div className='relative mt-2 overflow-x-auto sm:mt-4'>
				<table className='w-full min-w-[34rem] border-collapse text-[13.5px]'>
					<thead>
						<tr>
							<th className='sticky left-0 z-[1] bg-[var(--paper)] py-2 pr-4 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
								Document
							</th>
							{COLUMNS.map((c) => (
								<th
									key={c.key}
									className='w-16 py-2 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'
								>
									{c.label}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{documents.map((doc) => (
							<tr key={doc.id} className='group/row border-t border-[var(--rule-soft)] transition-colors hover:bg-[var(--paper-2)]'>
								<th
									scope='row'
									className='sticky left-0 z-[1] bg-[var(--paper)] py-3.5 pr-4 text-left font-normal transition-colors group-hover/row:bg-[var(--paper-2)] leading-6 text-[var(--ink)]'
								>
									{portal ? (
										<a
											href={`${portal}&document_filter=${doc.id}&docperiod_filter=on&year_filter=${year}&quarter_filter=0`}
											target='_blank'
											rel='noreferrer'
											className='group inline-flex items-baseline gap-1 transition hover:text-[var(--accent)]'
										>
											{doc.label}
											<ArrowUpRightIcon
												size={11}
												className='shrink-0 text-[var(--ink-mute)] group-hover:text-[var(--accent)]'
												aria-hidden='true'
											/>
										</a>
									) : (
										doc.label
									)}
								</th>
								{COLUMNS.map((c) => {
									const cell = cells[`${doc.id}:${c.key}`]
									if (!cell && !applies(doc.id, c.key)) return <td key={c.key} />
									return (
										<td key={c.key} className='py-3.5 text-center'>
											{cell ? (
												<a
													href={cell.href}
													target='_blank'
													rel='noreferrer'
													title={cell.posted ? `Posted ${cell.posted}` : 'Posted'}
													className='inline-flex size-7 items-center justify-center text-[var(--accent)] transition hover:bg-[var(--paper-3)]'
												>
													<CheckIcon size={15} weight='bold' aria-hidden='true' />
													<span className='sr-only'>
														{doc.label}, {c.key === 'year' ? year : `${c.label} ${year}`}: open DILG’s file
													</span>
												</a>
											) : (
												<span className='text-[var(--ink-display)]' aria-label='Not on the portal'>
													—
												</span>
											)}
										</td>
									)
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}
