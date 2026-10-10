import { ArrowUpRightIcon, CheckIcon } from '@phosphor-icons/react/ssr'
import { fdpp, type FdppPosting } from '@betterbarmm/lgu-data/fdpp'

/* ============================================================
   The full disclosure tab

   What one province, city or municipality has posted to DILG's
   Full Disclosure Policy Portal: a year to a table, the policy's
   documents down the side and the periods they cover across, a
   tick where something is posted and a link to DILG's file. A
   dash is a period with nothing on the portal, and the note says
   that is all it means.
   ============================================================ */

const COLUMNS = [
	{ key: 'year', label: 'Year' },
	{ key: 'q1', label: 'Q1' },
	{ key: 'q2', label: 'Q2' },
	{ key: 'q3', label: 'Q3' },
	{ key: 'q4', label: 'Q4' },
] as const

const column = (posting: FdppPosting) => (posting.period.quarter ? `q${posting.period.quarter}` : 'year')

/* Which documents come quarterly, read off every unit's postings: a cell a
   document never has (Q2 of the annual budget) is left blank, not dashed. */
const QUARTERLY = new Set(
	Object.values(fdpp.units).flatMap((rows) => rows.filter((p) => p.period.quarter).map((p) => p.document)),
)
const applies = (doc: number, key: string) => (key === 'year' ? !QUARTERLY.has(doc) : QUARTERLY.has(doc))

export function LguDisclosure({ unitKey, name }: { unitKey: string; name: string }) {
	const postings = fdpp.units[unitKey] ?? []
	const years = [...new Set(postings.map((p) => p.period.year).filter((y): y is number => y != null))].sort((a, b) => b - a)

	return (
		<div>
			<p className='max-w-[48rem] text-[15px] leading-8 text-[var(--ink-2)]'>
				Under DILG’s Full Disclosure Policy, every province, city and municipality must post its budget, its
				procurement plans, its quarterly statements and how it used its development and disaster funds, in three
				conspicuous places and on DILG’s portal. This is what {name} has put on the portal since 2023.
			</p>
			{/* The portal filters by its own province and town ids, which it hands out
			    only to signed-in users, so the closest public link is the region. */}
			<a
				href={`${fdpp.source[0].href}/index?region_filter=19`}
				target='_blank'
				rel='noreferrer'
				className='mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-4 transition hover:text-[var(--accent)]'
			>
				All BARMM postings on DILG’s portal
				<ArrowUpRightIcon size={13} aria-hidden='true' />
			</a>

			{years.length === 0 ? (
				<p className='mt-10 bg-[var(--paper-2)] px-6 py-5 text-[15px] leading-7 text-[var(--ink-2)]'>
					Nothing from {name} has been put on the portal since 2023.
				</p>
			) : (
				years.map((year) => {
					const cells = new Map<string, FdppPosting>()
					for (const posting of postings) {
						if (posting.period.year !== year) continue
						const key = `${posting.document}:${column(posting)}`
						if (!cells.has(key)) cells.set(key, posting)
					}
					const rows = fdpp.documents.filter((doc) => COLUMNS.some((c) => cells.has(`${doc.id}:${c.key}`)))

					return (
						<div key={year} className='mt-14'>
							<h3 className='bb-label block w-full border-b border-[var(--brass-line)] pb-3'>
								For {year} · {rows.length} of {fdpp.documents.length} documents
							</h3>
							<p aria-hidden='true' className='mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)] sm:hidden'>
								Swipe for every quarter &rarr;
							</p>
							{/* `relative` keeps the ticks' screen-reader labels inside the
							    scroll box; positioned outside it they widen the page. */}
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
										{fdpp.documents.map((doc) => (
											<tr key={doc.id} className='border-t border-[var(--rule-soft)]'>
												<th
													scope='row'
													className='sticky left-0 z-[1] bg-[var(--paper)] py-2.5 pr-4 text-left font-normal leading-6 text-[var(--ink)]'
												>
													{doc.label}
												</th>
												{COLUMNS.map((c) => {
													const posting = cells.get(`${doc.id}:${c.key}`)
													if (!posting && !applies(doc.id, c.key)) return <td key={c.key} />
													return (
														<td key={c.key} className='py-2.5 text-center'>
															{posting ? (
																<a
																	href={`${fdpp.download}${posting.id}`}
																	target='_blank'
																	rel='noreferrer'
																	title={`Posted${posting.posted.year ? ` ${posting.posted.quarter ? `Q${posting.posted.quarter} ` : ''}${posting.posted.year}` : ''}`}
																	className='inline-flex size-7 items-center justify-center text-[var(--accent)] transition hover:bg-[var(--paper-2)]'
																>
																	<CheckIcon size={15} weight='bold' aria-hidden='true' />
																	<span className='sr-only'>
																		{doc.label}, {c.label === 'Year' ? year : `${c.label} ${year}`}: open DILG’s file
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
				})
			)}

			<p className='mt-10 text-[12.5px] leading-6 text-[var(--ink-3)]'>
				A tick opens the file DILG holds; a dash means nothing is on the portal for that period, not that the
				document was never produced. Annual documents sit under Year, quarterly ones under their quarter. From{' '}
				<a href={fdpp.source[0].href} target='_blank' rel='noreferrer' className='rule-link'>
					{fdpp.source[0].label}
					<ArrowUpRightIcon size={11} className='ml-0.5 inline' aria-hidden='true' />
				</a>
				, read {fdpp.generatedAt}.
			</p>
		</div>
	)
}
