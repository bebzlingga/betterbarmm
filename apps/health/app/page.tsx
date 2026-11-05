import Link from 'next/link'
import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import { Figures, Masthead, YearBars, peso } from './_components/parts'
import { PROCUREMENT } from './_lib/bids'
import { BUDGET_URL, KIND_LABELS, budgetHospitals, countsSource, facilityAreas, facilityTotal, healthBuyers, kindCount, latest, latestYear, lineSeries, programs, spending, years } from './_lib/health'

const H2 = 'text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const NOTE = 'max-w-[38rem] text-[0.875rem] leading-6 text-[var(--ink-3)] lg:text-right'
const TH = 'px-3 py-2.5 text-left font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
const TD = 'px-3 py-2.5 align-top'

const asOf = new Date(`${countsSource.asOf}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })

export default function HealthHome() {
	const share = spending.at(-1)!.share
	const hospitalCount = years.map((_, i) => budgetHospitals.filter((h) => h.series[i] != null).length)
	const bhw = lineSeries(/barangay health workers/i)
	const top = Math.max(...programs.flatMap((p) => (p.children?.length ? p.children : [p]).map((c) => c.total)), 1)

	return (
		<>
			<Masthead
				kicker='Health · Bangsamoro'
				name='Care in the Bangsamoro'
				chart
				note={`What each year’s General Appropriations Act of the Bangsamoro gives the Ministry of Health, FY ${years[0]} to FY ${latestYear}, the hospitals it funds by name, and the facilities in every town.`}
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
					{ value: String(hospitalCount.at(-1)), label: 'Hospitals funded by name', series: hospitalCount },
					{ value: peso(bhw.at(-1)!), label: 'Barangay health workers', series: bhw },
				]}
			/>

			{/* ---- Where the money goes ---- */}
			<section className='bb-container bb-section'>
				<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-16'>
					<h2 className={H2}>Where the FY {latestYear} money goes</h2>
					<p className={NOTE}>
						The ministry&rsquo;s two programs and what the Act lists under each, largest first. Administration and support (
						{peso(latest.totals.total - programs.reduce((s, p) => s + p.total, 0))}) are left out.
					</p>
				</div>
				<div className='mt-10 grid gap-10 lg:grid-cols-2'>
					{programs.map((p) => (
						<section key={p.name}>
							<h3 className='flex items-baseline justify-between gap-4 border-b border-[var(--rule)] pb-2'>
								<span className='text-[1rem] font-bold text-[var(--ink)]'>{p.name}</span>
								<span className='num text-[0.9375rem] font-bold text-[var(--ink)]'>{peso(p.total)}</span>
							</h3>
							<ul className='divide-y divide-[var(--rule-soft)]'>
								{[...(p.children ?? [])]
									.sort((a, b) => b.total - a.total)
									.map((c) => (
										<li key={c.name} className='grid grid-cols-[minmax(0,1fr)_5rem_4.5rem] items-center gap-3 py-2 text-[0.8125rem]'>
											<span className='text-[var(--ink-2)]'>{c.name}</span>
											<span className='h-1.5 bg-[var(--paper-2)]'>
												<span className='block h-full bg-[var(--accent)]' style={{ width: `${Math.max((c.total / top) * 100, 1)}%` }} />
											</span>
											<span className='num text-right text-[var(--ink)]'>{peso(c.total)}</span>
										</li>
									))}
							</ul>
						</section>
					))}
				</div>
				<div className='mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[0.875rem]'>
					<Link href='/hospitals' className='rule-link'>
						Each hospital, year by year
					</Link>
					<a href={BUDGET_URL} className='rule-link inline-flex items-center gap-1.5'>
						Every line, with the page of the Act, in the Budget workspace
						<ArrowUpRightIcon size={13} weight='bold' aria-hidden='true' />
					</a>
				</div>
			</section>

			{/* ---- The facilities ---- */}
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container bb-section'>
					<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-16'>
						<h2 className={H2}>{facilityTotal.government.toLocaleString('en-PH')} government facilities on the registry</h2>
						<p className={NOTE}>
							The Department of Health&rsquo;s count, by area, as of {asOf}, with {facilityTotal.private} private ones besides
							(in brackets). A count, not a list: the registry does not say which are working today.
						</p>
					</div>
					<div className='mt-10 overflow-x-auto border border-[var(--rule)] bg-[var(--paper)]'>
						<table className='w-full min-w-[48rem] text-[0.875rem]'>
							<thead className='border-b border-[var(--rule)]'>
								<tr>
									<th className={TH}>Area</th>
									{KIND_LABELS.map((k) => (
										<th key={k} className={`${TH} !text-right`}>{k}</th>
									))}
								</tr>
							</thead>
							<tbody className='divide-y divide-[var(--rule-soft)]'>
								{facilityAreas.map((a) => (
									<tr key={a.slug}>
										<td className={TD}>
											{a.rows.length ? (
												<Link href={`/facilities?area=${a.slug}`} className='rule-link font-semibold'>
													{a.name}
												</Link>
											) : (
												<span className='font-semibold text-[var(--ink-3)]'>{a.name}</span>
											)}
										</td>
										{KIND_LABELS.map((k) => {
											const n = kindCount(a.rows, k)
											return (
												<td key={k} className={`${TD} num text-right`}>
													{n.government || n.private ? n.government.toLocaleString('en-PH') : '–'}
													{n.private ? <span className='ml-1 text-[var(--ink-3)]'>({n.private})</span> : null}
												</td>
											)
										})}
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<Link href='/facilities' className='rule-link mt-6 inline-block text-[0.875rem]'>
						Every town
					</Link>
				</div>
			</section>

			{/* ---- Who buys ---- */}
			<section className='bb-container bb-section'>
				<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-16'>
					<h2 className={H2}>Who buys for health</h2>
					<p className={NOTE}>
						The ministry, its hospitals and the provincial health offices that post bid notices on PhilGEPS, from the
						Procurement workspace&rsquo;s record since 2019. Budgeted is what the notices set aside; awarded is what the
						contracts on them were signed for.
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
							{healthBuyers.map((b) => (
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
