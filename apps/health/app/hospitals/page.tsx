import type { Metadata } from 'next'
import { Masthead, peso } from '../_components/parts'
import { PROCUREMENT } from '../_lib/bids'
import { BUDGET_URL, budgetHospitals, mapSource, mappedHospitals, years } from '../_lib/health'

export const metadata: Metadata = {
	title: 'Hospitals',
	description: 'Every hospital the Bangsamoro budget funds by name, what it was given each year, and the hospitals mapped on OpenStreetMap.',
}

const H2 = 'text-[1.5rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const TH = 'px-3 py-2.5 text-left font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
const TD = 'px-3 py-2 align-top'

/** "₱445.7M" without the sign, for a table of them. */
const short = (n: number) => peso(n).replace('₱', '')

export default function HospitalsPage() {
	// The FY 2020 Act names none; a column of dashes says nothing the note under the table does not.
	const cols = years.map((y, i) => ({ y, i })).filter(({ i }) => budgetHospitals.some((h) => h.series[i] != null))
	return (
		<>
			<Masthead
				kicker='Health · Bangsamoro'
				name='Hospitals'
				note={`The ${budgetHospitals.length} hospitals the General Appropriations Acts fund by name under the Ministry of Health, FY ${years[0]} to FY ${years.at(-1)}, and those mapped on OpenStreetMap.`}
			/>

			<section className='bb-container bb-section'>
				<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-16'>
					<h2 className={H2}>In the budget</h2>
					<p className='max-w-[38rem] text-[0.875rem] leading-6 text-[var(--ink-3)] lg:text-right'>
						What each year&rsquo;s Act gives each hospital, in pesos, largest in FY {years.at(-1)} first. A dash is a year the Act
						does not name it. Where a hospital buys on PhilGEPS, its name links to its notices.
					</p>
				</div>
				<div className='mt-8 overflow-x-auto border-y border-[var(--rule)]'>
					<table className='w-full min-w-[54rem] text-[0.84375rem]'>
						<thead className='border-b border-[var(--rule)]'>
							<tr>
								<th className={TH}>Hospital</th>
								{cols.map(({ y }) => (
									<th key={y} className={`${TH} !text-right`}>{y}</th>
								))}
							</tr>
						</thead>
						<tbody className='divide-y divide-[var(--rule-soft)]'>
							{budgetHospitals.map((h) => (
								<tr key={h.key}>
									<td className={`${TD} font-semibold text-[var(--ink)]`}>
										{h.buyer ? (
											<a href={`${PROCUREMENT}/${h.buyer.slug}`} className='rule-link'>
												{h.name}
											</a>
										) : (
											h.name
										)}
									</td>
									{cols.map(({ y, i }) => {
										const v = h.series[i]
										return (
											<td key={y} className={`${TD} num text-right ${i === h.series.length - 1 ? 'font-semibold text-[var(--ink)]' : 'text-[var(--ink-2)]'}`}>
												{v == null ? <span className='text-[var(--ink-mute)]'>–</span> : short(v)}
											</td>
										)
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<p className='mt-6 max-w-[48rem] text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
					The FY 2020 Act funds the ministry&rsquo;s hospitals in bulk rather than by name. Two hospitals renamed on being upgraded
					are shown under their new names: Tamparan District, now Provincial, and Unayan Municipal, now District. The Acts still
					fund Sulu&rsquo;s hospitals, which are listed as printed. Every line, with its page, is in the{' '}
					<a href={BUDGET_URL} className='rule-link'>
						Budget workspace
					</a>
					.
				</p>
			</section>

			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container bb-section'>
					<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-16'>
						<h2 className={H2}>On the map</h2>
						<p className='max-w-[38rem] text-[0.875rem] leading-6 text-[var(--ink-3)] lg:text-right'>
							Hospitals, government and private, that volunteers have mapped and named on OpenStreetMap, outside Sulu. Only what
							has been mapped, so not a complete list.
						</p>
					</div>
					<ul className='mt-8 grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-3'>
						{mappedHospitals.map((h) => (
							<li key={h.osm} className='bg-[var(--paper)] p-4'>
								<a href={`https://www.openstreetmap.org/${h.osm}`} target='_blank' rel='noreferrer' className='rule-link text-[0.90625rem] font-semibold'>
									{h.name}
								</a>
								<span className='mt-1 block text-[0.78125rem] text-[var(--ink-3)]'>{h.townName}</span>
							</li>
						))}
					</ul>
					<p className='mt-6 text-[0.75rem] text-[var(--ink-3)]'>
						Map data © OpenStreetMap contributors, {mapSource.license}, via the{' '}
						<a href={mapSource.url} className='rule-link'>
							Humanitarian OpenStreetMap Team
						</a>
						.
					</p>
				</div>
			</section>
		</>
	)
}
