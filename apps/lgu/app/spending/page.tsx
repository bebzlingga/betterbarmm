import type { Metadata } from 'next'
import Link from 'next/link'
import { Rise, SectionHead } from '@betterbarmm/editorial'
import { areaSpending, pesoCell, spentIn, thinlyTagged } from '@betterbarmm/lgu-data'
import { LguBreadcrumb, LguMasthead } from '../_components/lgu-parts'

export const metadata: Metadata = {
	title: 'What the region spends where',
	description:
		'Bangsamoro construction appropriated into each province and area, FY 2020 to FY 2026, read off the itemised projects in the seven enacted Acts.',
}

/* ============================================================
   What the region spends where

   The table the workspace has wanted since the directory went up,
   and the closest thing to a per-area budget that can honestly be
   drawn: a local government unit's own appropriation sits in its
   own ordinance and nobody publishes those together.

   So this is the other direction — the Bangsamoro Government's
   money landing in a place. It is read off the one part of a
   budget that carries a location, the itemised construction, and
   it is labeled as what it is at the top of the page rather than
   left to be mistaken for a town's budget.
   ============================================================ */

const YEARS = areaSpending.years

export default function SpendingPage() {
	const grand = areaSpending.areas.reduce((sum, area) => sum + area.total, 0)
	const thin = YEARS.filter(thinlyTagged)

	return (
		<>
			<LguMasthead
				brand
				breadcrumb={<LguBreadcrumb trail={[]}>Spending</LguBreadcrumb>}
				kicker='The money · Bangsamoro'
				name='What the region builds, and where.'
				note='Every itemised construction project in the seven enacted Bangsamoro Acts, summed by the area it names. This is regional money landing in a place — not that place’s own budget.'
			/>

			<section className='bb-container bb-section'>
				<SectionHead
					index='01'
					eyebrow={`FY ${YEARS[0]} to FY ${YEARS[YEARS.length - 1]}`}
					size='sm'
					title={`${pesoCell(grand)},`}
					titleMuted='across eight areas.'
					lead='Amounts as each Act appropriated them. Areas are reconciled to their present names — the region was redrawn inside this span, and every spelling the Acts used is kept under the row.'
				/>

				<div className='mt-12 -mx-6 overflow-x-auto px-6 lg:-mx-8 lg:px-8'>
					<table className='w-full min-w-[54rem] border-collapse text-[14.5px]'>
						<caption className='sr-only'>
							Bangsamoro construction appropriated into each area, in billions of pesos, by
							fiscal year
						</caption>
						<thead>
							<tr className='border-b border-[var(--ink)]'>
								<th scope='col' className='bb-label py-4 pr-4 text-left align-bottom'>
									Area
								</th>
								{YEARS.map((year) => (
									<th
										key={year}
										scope='col'
										className='num py-4 pl-5 text-right align-bottom font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
									>
										{/* The flag goes above the year, not below it. Below, it took the
										    baseline and pushed "FY 2023" up a line on its own, so the one
										    column that needed reading carefully was the one whose year had
										    drifted out of the row. */}
										{thinlyTagged(year) ? (
											<span className='block text-[9px] font-normal leading-4 text-[var(--accent)]'>
												barely tagged
											</span>
										) : null}
										FY {year}
									</th>
								))}
								<th
									scope='col'
									className='num py-4 pl-5 text-right align-bottom font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brass)]'
								>
									Total
								</th>
							</tr>
						</thead>

						<tbody>
							{areaSpending.areas.map((area) => (
								<tr key={area.name} className='border-b border-[var(--rule-soft)] transition-colors duration-150 hover:bg-[var(--paper-2)]'>
									<th scope='row' className='py-5 pr-4 text-left font-normal'>
										<span className='block text-[15px] font-semibold text-[var(--ink)]'>
											{area.name}
										</span>
										{area.note ? (
											<span className='mt-0.5 block text-[11px] leading-5 text-[var(--ink-3)]'>
												{area.note}
											</span>
										) : area.printedAs.length > 1 ? (
											<span className='mt-0.5 block text-[11px] leading-5 text-[var(--ink-mute)]'>
												Printed as {area.printedAs.join(', ')}
											</span>
										) : null}
									</th>

									{YEARS.map((year) => {
										const cell = area.years[String(year)]
										return (
											<td
												key={year}
												className='num py-5 pl-5 text-right text-[13px] tabular-nums text-[var(--ink-2)]'
												title={
													cell && cell.projects > 0
														? `${cell.projects} project${cell.projects === 1 ? '' : 's'}`
														: 'Nothing tagged to this area in this Act'
												}
											>
												{pesoCell(cell?.amount)}
											</td>
										)
									})}

									<td className='num py-5 pl-5 text-right text-[13px] font-semibold tabular-nums text-[var(--ink)]'>
										{pesoCell(area.total)}
									</td>
								</tr>
							))}
						</tbody>

						<tfoot>
							<tr className='border-t-2 border-[var(--brass)]'>
								<th scope='row' className='py-5 pr-4 text-left'>
									<span className='bb-label'>All areas</span>
								</th>
								{YEARS.map((year) => (
									<td
										key={year}
										className='num py-5 pl-5 text-right text-[13px] font-semibold tabular-nums text-[var(--ink)]'
									>
										{pesoCell(spentIn(year))}
									</td>
								))}
								<td className='num py-5 pl-5 text-right text-[13px] font-semibold tabular-nums text-[var(--accent)]'>
									{pesoCell(grand)}
								</td>
							</tr>
						</tfoot>
					</table>
				</div>

				<p className='mt-5 text-[12px] leading-6 text-[var(--ink-3)]'>
					Hover a figure for the number of projects behind it. A dash is an Act that tagged
					nothing to that area, which is not the same as nothing being built there.
				</p>
			</section>

			{/* ---- What this is not ---- */}
			<section className='bb-container border-t border-[var(--rule)] bb-section-bottom'>
				<Rise distance={14}>
					<div className='grid gap-x-14 gap-y-8 lg:grid-cols-2'>
						<div>
							<h2 className='bb-display-sm text-[var(--ink)]'>This is not a town’s budget.</h2>
							<p className='mt-5 text-[13.5px] leading-7 text-[var(--ink-2)]'>
								It is the Bangsamoro Government appropriating construction into a place. A local
								government unit’s own budget — its National Tax Allotment, its local taxes, what
								its council actually voted — sits in its own appropriations ordinance, and
								nothing publishes those together: not MILG, not the region, not DBM. Until
								something does, no honest table of them can be drawn here.
							</p>
							<p className='mt-4 text-[13.5px] leading-7 text-[var(--ink-2)]'>
								Where that money is supposed to go once it arrives —{' '}
								<Link href='/how-it-works' className='rule-link'>
									the floors and ceilings the Code sets
								</Link>{' '}
								— is on its own page.
							</p>
						</div>

						<div>
							<h3 className='bb-label'>Two things to read the table with</h3>
							<ul className='mt-5'>
								<li className='border-b border-[var(--rule-soft)] py-3.5'>
									<p className='text-[13px] font-semibold text-[var(--ink)]'>
										FY {thin.join(' and FY ')} barely tagged anything
									</p>
									<p className='mt-1 text-[12.5px] leading-6 text-[var(--ink-3)]'>
										That Act names a province on{' '}
										{areaSpending.areasTaggedPerYear[String(thin[0] ?? '')] ?? 0} areas where the
										others name seven or eight. The column is thin because of what was printed,
										not because of what was built.
									</p>
								</li>
								<li className='border-b border-[var(--rule-soft)] py-3.5'>
									<p className='text-[13px] font-semibold text-[var(--ink)]'>
										The region was redrawn inside the span
									</p>
									<p className='mt-1 text-[12.5px] leading-6 text-[var(--ink-3)]'>
										Maguindanao became Del Norte and Del Sur, Lanao del Sur is printed as one
										province and as two districts in different years, and Sulu was removed by the
										Supreme Court. Rows are reconciled to the present names with every printed
										spelling kept.
									</p>
								</li>
							</ul>

							<p className='mt-6 text-[12px] leading-6 text-[var(--ink-3)]'>
								Read from the seven enacted Acts.{' '}
								<a
									href='https://budget.betterbarmm.com'
									target='_blank'
									rel='noreferrer'
									className='rule-link'
								>
									The budget workspace
								</a>{' '}
								holds every project line behind these totals.
							</p>
						</div>
					</div>
				</Rise>
			</section>
		</>
	)
}
