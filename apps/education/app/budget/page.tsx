import type { Metadata } from 'next'
import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import { Figures, Masthead, YearBars, peso } from '../_components/parts'
import { PROCUREMENT } from '../_lib/bids'
import { BUDGET_URL, educationBuyers, latest, latestYear, programSeries, programs, spending, years } from '../_lib/education'

export const metadata: Metadata = {
	title: 'Budget',
	description: 'What each year’s General Appropriations Act of the Bangsamoro gives the Ministry of Basic, Higher and Technical Education, what the money is for, and who buys for the schools.',
}

const H2 = 'text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const NOTE = 'max-w-[38rem] text-[0.875rem] leading-6 text-[var(--ink-3)] lg:text-right'
const TH = 'px-3 py-2.5 text-left font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
const TD = 'px-3 py-2.5 align-top'

export default function BudgetPage() {
	const share = spending.at(-1)!.share
	const madaris = programSeries(/madaris/i)
	const ahme = programSeries(/scholarship/i)
	const top = programs[0]?.total ?? 1

	return (
		<>
			<Masthead
				kicker='Education · Bangsamoro'
				name='The education budget'
				chart
				note={`What each year’s General Appropriations Act of the Bangsamoro gives the Ministry of Basic, Higher and Technical Education, FY ${years[0]} to FY ${latestYear}, what the money is for, and who buys for the schools.`}
			>
				<YearBars bars={spending.map((s) => ({ year: s.year, value: s.total }))} caption='The ministry’s appropriation, each year' />
			</Masthead>

			<Figures
				title={`FY ${latestYear}`}
				note='From the General Appropriations Act. An appropriation is what was set aside, not what was spent.'
				years={years}
				items={[
					{ value: peso(latest.totals.total), label: 'Appropriated to the ministry', series: spending.map((s) => s.total) },
					{ value: `${share.toFixed(1)}%`, label: 'Of the regional budget', series: spending.map((s) => s.share) },
					{ value: peso(madaris.at(-1)!), label: 'Madaris education', series: madaris },
					{ value: peso(ahme.at(-1)!), label: 'AHME scholarships', series: ahme },
				]}
			/>

			{/* ---- Where the money goes ---- */}
			<section className='bb-container bb-section'>
				<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-16'>
					<h2 className={H2}>Where the FY {latestYear} money goes</h2>
					<p className={NOTE}>
						The ministry&rsquo;s programs, largest first. Open one to see what the Act lists under it. Administration and support (
						{peso(latest.totals.total - programs.reduce((s, p) => s + p.total, 0))}) are left out.
					</p>
				</div>
				<ul className='mt-10 divide-y divide-[var(--rule-soft)] border-y border-[var(--rule)]'>
					{programs.map((p) => (
						<li key={p.name}>
							<details className='group'>
								<summary className='grid cursor-pointer list-none gap-x-6 gap-y-2 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(8rem,22rem)_7rem] sm:items-center [&::-webkit-details-marker]:hidden'>
									<span className='text-[0.9375rem] font-semibold text-[var(--ink)] group-open:text-[var(--accent)]'>
										{p.name}
										{p.children?.length ? <span className='ml-2 font-mono text-[0.625rem] text-[var(--ink-3)]'>{p.children.length} lines</span> : null}
									</span>
									<span className='h-2 bg-[var(--paper-2)]'>
										<span className='block h-full bg-[var(--accent)]' style={{ width: `${Math.max((p.total / top) * 100, 0.5)}%` }} />
									</span>
									<span className='num text-right text-[0.875rem] font-semibold text-[var(--ink)]'>{peso(p.total)}</span>
								</summary>
								{p.children?.length ? (
									<ul className='mb-4 ml-4 border-l border-[var(--rule)] pl-4'>
										{p.children.map((c) => (
											<li key={c.name} className='flex justify-between gap-6 py-1.5 text-[0.84375rem] text-[var(--ink-2)]'>
												<span>{c.name}</span>
												<span className='num shrink-0'>{peso(c.total)}</span>
											</li>
										))}
									</ul>
								) : null}
							</details>
						</li>
					))}
				</ul>
				<a href={BUDGET_URL} className='rule-link mt-6 inline-flex items-center gap-1.5 text-[0.875rem]'>
					Every line, with the page of the Act, in the Budget workspace
					<ArrowUpRightIcon size={13} weight='bold' aria-hidden='true' />
				</a>
			</section>

			{/* ---- Who buys ---- */}
			<section className='bb-container bb-section'>
				<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-16'>
					<h2 className={H2}>Who buys for the schools</h2>
					<p className={NOTE}>
						The education offices that post bid notices on PhilGEPS, from the Procurement workspace&rsquo;s record since 2019.
						The budgeted amount is what the notices set aside; awarded is what the contracts on them were signed for.
					</p>
				</div>
				<div className='mt-10 overflow-x-auto border-y border-[var(--rule)]'>
					<table className='w-full min-w-[40rem] text-[0.875rem]'>
						<thead className='border-b border-[var(--rule)]'>
							<tr>
								<th className={TH}>Office</th>
								<th className={`${TH} !text-right`}>Notices</th>
								<th className={`${TH} !text-right`}>Budgeted</th>
								<th className={`${TH} !text-right`}>Awarded</th>
								<th className={`${TH} !text-right`}>Years</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-[var(--rule-soft)]'>
							{educationBuyers.map((b) => (
								<tr key={b.slug}>
									<td className={TD}>
										<a href={`${PROCUREMENT}/${b.slug}`} className='rule-link'>
											{b.name}
										</a>
									</td>
									<td className={`${TD} num text-right`}>{b.notices.toLocaleString('en-PH')}</td>
									<td className={`${TD} num text-right`}>{peso(b.abc)}</td>
									<td className={`${TD} num text-right`}>{b.awarded ? peso(b.awarded) : '–'}</td>
									<td className={`${TD} num whitespace-nowrap text-right text-[var(--ink-3)]`}>
										{b.first?.slice(0, 4)}
										{b.last && b.last.slice(0, 4) !== b.first?.slice(0, 4) ? `–${b.last.slice(2, 4)}` : ''}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</>
	)
}
