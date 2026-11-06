import type { Metadata } from 'next'
import { Rise, SectionHead } from '@betterbarmm/editorial'
import { budgetFor, percent, peso } from '@betterbarmm/budget-data'
import { revenueYears } from '@betterbarmm/budget-data/revenue'
import { Masthead, StatRow } from '../_components/budget-parts'
import { Money } from '../_components/money'
import { HEAD_ROW, ROW, TABLE, TD, TD_NUM, TH, TH_NUM } from '../_components/table'
import { YearBands } from '../_components/year-bands'

export const metadata: Metadata = {
	title: 'Where the money comes from',
	description:
		'The annual block grant, the Special Development Fund and the share in national taxes the national budget sets aside for the Bangsamoro each year, beside what the region’s own Act spends.',
}

/* ============================================================
   Where the money comes from

   The other side of the Act. Every other page here is what the
   region spends; this is what the national General
   Appropriations Act sets aside for it, year by year, read from
   DBM's own pages of each GAA. The Acts name their sources in
   Section 1 but never split them, so the national side is the
   only one that can be printed to the peso.
   ============================================================ */

const SOURCES = [
	{ key: 'grant', label: 'Annual block grant', tone: 'var(--src-grant)' },
	{ key: 'sdf', label: 'Special Development Fund', tone: 'var(--src-sdf)' },
	{ key: 'tax', label: 'Share in national taxes', tone: 'var(--src-tax)' },
] as const

const rows = revenueYears.map((year) => ({ ...year, act: budgetFor(year.year).budget }))
const latest = rows[rows.length - 1]!
const first = rows[0]!
const grantShare = (row: (typeof rows)[number]) => (row.blockGrant / row.act.total) * 100

export default function RevenuePage() {
	return (
		<>
			<Masthead
				kicker='Revenue'
				title='Where the money'
				titleMuted='comes from.'
				lead={
					<p>
						Most of it from Manila, by formula. The national budget sets aside three amounts for the region each
						year, and the largest, the annual block grant, alone came to {percent(grantShare(latest))} of what the FY{' '}
						{latest.year} Act spends. It has grown {percent((latest.blockGrant / first.blockGrant - 1) * 100)} since FY{' '}
						{first.year}.
					</p>
				}
			>
				<StatRow
					stats={[
						{ value: latest.blockGrant, label: `Block grant, FY ${latest.year}`, money: true },
						{ value: latest.national, label: 'All three amounts', money: true },
						{ value: Math.round(grantShare(latest) * 10) / 10, decimals: 1, suffix: '%', label: 'Of the Act, from the grant' },
					]}
				/>
			</Masthead>

			{/* ---- Year by year ---- */}
			<section className='bb-container section-band'>
				<SectionHead
					index='01'
					eyebrow='Year by year'
					size='sm'
					title='Seven years,'
					titleMuted='three amounts.'
					lead='What the national budget set aside for the region each year, split by kind. The grant is most of it every year; the other two are a tenth or less.'
				/>

				<YearBands
					legend={[...SOURCES]}
					rows={[...rows].reverse().map((row) => ({
						year: row.year,
						bands: [
							{ ...SOURCES[0], amount: row.blockGrant },
							{ ...SOURCES[1], amount: row.specialDevelopmentFund },
							{ ...SOURCES[2], amount: row.taxShare },
						],
						note: `Grant ${percent(grantShare(row))} of the Act`,
					}))}
				/>

				{/* Exact figures (user decision: every amount as printed), each year linked to the pages it was read from. */}
				<div className='mt-14 overflow-x-auto lg:-mx-8 lg:px-8'>
					<table className={`${TABLE} min-w-[52rem]`}>
						<caption className='sr-only'>What the national budget set aside for the region, by year</caption>
						<thead>
							<tr className={HEAD_ROW}>
								<th scope='col' className={TH}>Year</th>
								<th scope='col' className={TH_NUM}>Block grant</th>
								<th scope='col' className={TH_NUM}>Development Fund</th>
								<th scope='col' className={TH_NUM}>Tax share</th>
								<th scope='col' className={TH_NUM}>From Manila</th>
								<th scope='col' className={TH_NUM}>The region’s Act</th>
							</tr>
						</thead>
						<tbody>
							{[...rows].reverse().map((row) => (
								<tr key={row.year} className={ROW}>
									<th scope='row' className={`${TD} font-normal`}>
										<a href={row.source} target='_blank' rel='noreferrer' className='money font-mono text-[0.75rem] font-semibold text-[var(--ink)] hover:text-[var(--accent)]'>
											FY {row.year}
										</a>
									</th>
									<td className={TD_NUM}><Money amount={row.blockGrant} /></td>
									<td className={TD_NUM}><Money amount={row.specialDevelopmentFund} /></td>
									<td className={TD_NUM}><Money amount={row.taxShare} /></td>
									<td className={`${TD_NUM} font-semibold`}><Money amount={row.national} /></td>
									<td className={TD_NUM}><Money amount={row.act.total} /></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<p className='mt-4 text-[0.75rem] leading-6 text-[var(--ink-3)]'>
					Each year links to DBM’s pages of that year’s national General Appropriations Act. In FY 2020 and FY 2021
					Manila set aside more than the region’s Act spent: neither Act carries the Special Development Fund.
				</p>
			</section>

			{/* ---- The three amounts ---- */}
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container section-band'>
					<SectionHead
						index='02'
						eyebrow='What each one is'
						size='sm'
						title='A formula, a fund'
						titleMuted='and a share.'
					/>
					<Rise distance={12}>
						<dl className='mt-8 grid gap-x-14 gap-y-8 text-[0.9375rem] leading-8 text-[var(--ink-2)] lg:grid-cols-3'>
							<div>
								<dt className='font-semibold text-[var(--ink)]'>Annual block grant</dt>
								<dd className='mt-2'>
									5% of the national government’s net collections from internal revenue taxes and customs, from the
									third year before. It is set by the Organic Law, not negotiated, and the national budget appropriates
									it automatically: FY {latest.year}’s grant of {peso(latest.blockGrant)} follows the collections of{' '}
									{latest.year - 3}.
								</dd>
							</div>
							<div>
								<dt className='font-semibold text-[var(--ink)]'>Special Development Fund</dt>
								<dd className='mt-2'>
									₱5 billion a year for 10 years, for rebuilding the communities the conflict left behind. It is released
									only against the Bangsamoro Development Plan, and spent the way the plan says.
								</dd>
							</div>
							<div>
								<dt className='font-semibold text-[var(--ink)]'>Share in national taxes</dt>
								<dd className='mt-2'>
									Of the national taxes, fees and charges collected inside the region, 75% is the region’s. For the
									first 10 years the national government’s 25% goes to the region too. The amount in the budget is an
									estimate: it is released only as collections are certified.
								</dd>
							</div>
						</dl>
					</Rise>
					<p className='mt-10 border-t border-[var(--rule)] pt-5 text-[0.875rem] leading-7 text-[var(--ink-3)]'>
						<strong className='font-semibold text-[var(--ink)]'>What is not here.</strong> Section 1 of the FY{' '}
						{latest.year} Act says its money also comes from the region’s own taxes, fees and charges, and from earlier
						years’ appropriations left unspent. It does not say how much of each, and the region does not publish its own
						collections, so the gap between the last two columns above cannot be split any further.
					</p>
				</div>
			</section>
		</>
	)
}
