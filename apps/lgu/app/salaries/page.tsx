import type { Metadata } from 'next'
import Link from 'next/link'
import { lguReferences } from '@betterbarmm/lgu-data'
import { DocLayout } from '../_components/doc-layout'
import type { TocItem } from '../_components/doc-toc'
import { LguMasthead } from '../_components/lgu-parts'

export const metadata: Metadata = {
	title: 'Salaries and benefits',
	description:
		'What the Bangsamoro Local Governance Code pays a governor, a mayor, a council member and a barangay captain, what limits a local payroll, and the benefits that come with the post.',
}

/* ============================================================
   Salaries and benefits

   Read from the Code's compensation sections (ss. 424, 485-522)
   and IRR arts. 45 and 187, each cited. The Code fixes a salary
   grade, not a peso figure: the amount follows the national salary
   schedule, adjusted for the unit's income class, and is set by
   the unit's own ordinance within the cap on personal services.
   ============================================================ */

/* Step 1 of the 2026 salary schedule, EO 64 s. 2024, third tranche (also
   DBM NBC 601 and Annex A-1 of LBC 172): the most an LGU may pay in 2026. */
const SG_2026: Record<number, number> = {
	10: 26_917,
	14: 38_764,
	24: 102_603,
	25: 116_643,
	26: 131_807,
	27: 148_940,
	28: 167_129,
	30: 210_718,
}

type Pay = {
	position: string
	level: string
	grade: number
	atLeast?: boolean
	/** Representation allowance a month; the transportation allowance is the same again. LBC 157, 1st class. */
	ra: number
	cite: string
	note?: string
}

const ELECTED: Pay[] = [
	{ level: 'Province', position: 'Governor', grade: 30, atLeast: true, ra: 12_500, cite: 's. 517' },
	{ level: 'Province', position: 'Vice-Governor', grade: 28, ra: 11_500, cite: 's. 519' },
	{ level: 'Province', position: 'Sangguniang Panlalawigan member', grade: 27, atLeast: true, ra: 9_500, cite: 's. 522' },
	{ level: 'City', position: 'City Mayor', grade: 30, atLeast: true, ra: 11_500, cite: 's. 505' },
	{ level: 'City', position: 'City Vice-Mayor', grade: 26, ra: 10_000, cite: 's. 507', note: 'SG 28 in a highly urbanised city' },
	{ level: 'City', position: 'Sangguniang Panlungsod member', grade: 25, ra: 8_500, cite: 's. 510', note: 'SG 27 in a highly urbanised city' },
	{ level: 'Municipality', position: 'Municipal Mayor', grade: 27, atLeast: true, ra: 9_000, cite: 's. 485' },
	{ level: 'Municipality', position: 'Municipal Vice-Mayor', grade: 25, ra: 8_550, cite: 's. 487' },
	{ level: 'Municipality', position: 'Sangguniang Bayan member', grade: 24, atLeast: true, ra: 7_650, cite: 's. 490' },
]

/* What every salaried official may also receive, at the ceiling DBM sets; the
   sanggunian decides whether, and may pay less, uniformly. */
const PERA = 2_000
const CASH_GIFT = 5_000
const PEI = 5_000
const MEDICAL = 7_000

/** Salary for 12 months and the two bonuses, RATA and PERA for 12, and the yearly grants. */
const yearly = (row: Pay) => SG_2026[row.grade] * 14 + row.ra * 2 * 12 + PERA * 12 + CASH_GIFT + PEI + MEDICAL

const peso = (value: number) => `₱${value.toLocaleString('en-PH')}`

const BENEFITS: { benefit: string; amount: string; source: string }[] = [
	{ benefit: 'Personnel Economic Relief Allowance (PERA)', amount: '₱2,000 a month', source: 'DBM Budget Circular 2009-3' },
	{
		benefit: 'Representation and transportation allowance (RATA)',
		amount: 'Up to the rate for the post and the unit’s class, each allowance; representation only if given a government vehicle',
		source: 'DBM Local Budget Circular 157 (2024)',
	},
	{ benefit: 'Mid-year bonus', amount: 'One month’s basic pay, from 15 May', source: 'DBM Budget Circular 2017-2' },
	{ benefit: 'Year-end bonus', amount: 'One month’s basic pay, with the November payroll', source: 'DBM Budget Circulars 2016-4 and 2024-3' },
	{ benefit: 'Cash gift', amount: '₱5,000, with the year-end bonus', source: 'DBM Budget Circular 2016-4' },
	{ benefit: 'Productivity Enhancement Incentive (PEI)', amount: 'Up to ₱5,000 (FY 2025)', source: 'DBM Circular Letter 2025-13; Budget Circular 2017-4' },
	{ benefit: 'Medical allowance', amount: 'Up to ₱7,000 a year', source: 'EO 64 s. 2024; DBM Budget Circular 2024-6' },
	{
		benefit: 'Uniform or clothing allowance',
		amount: 'Up to ₱7,000 a year in FY 2024; later years follow each year’s budget act',
		source: 'DBM Budget Circular 2024-1',
	},
	{
		benefit: 'Performance-Based Bonus',
		amount: 'Up to 65% of a month’s pay, only if the unit enrols and qualifies (a Seal of Good Local Governance is required)',
		source: 'DILG-DBM JMC 2025-001',
	},
]

/* Highest share of the national schedule a unit may pay by default, by income
   class (EO 64 s. 4; LBC 160, 165, 172). Any unit may instead adopt the full
   schedule, if it applies it to every post and stays within its payroll cap. */
const CLASSES = [
	{ cls: '1st class', pc: '100%', mun: '90%' },
	{ cls: '2nd class', pc: '95%', mun: '85%' },
	{ cls: '3rd class', pc: '90%', mun: '80%' },
	{ cls: '4th class', pc: '85%', mun: '75%' },
	{ cls: '5th class', pc: '80%', mun: '70%' },
]

const BARANGAY: { position: string; pay: string }[] = [
	{ position: 'Punong Barangay', pay: 'At least ₱5,000 a month, and up to ₱38,764 (the first step of SG 14 in 2026)' },
	{
		position: 'Sangguniang Barangay members, the secretary, the treasurer and the SK chairperson',
		pay: 'At least ₱3,000 a month, and up to ₱26,917 (the first step of SG 10 in 2026)',
	},
	{ position: 'Barangay tanods and purok leaders', pay: 'At least ₱1,000 a month' },
	{
		position: 'Child development center teachers, barangay health workers, nutrition scholars and farm technicians',
		pay: 'At least ₱1,000 a month',
	},
	{ position: 'Lupon tagapamayapa members', pay: 'An honorarium per hearing, no more than ₱2,000 a month in all' },
	{
		position: 'All of the above',
		pay: 'A year-end bonus of at least ₱1,000. The barangay council may instead grant one month’s honorarium and the ₱5,000 cash gift',
	},
]

const BARANGAY_BENEFITS = [
	'Insurance coverage, with premiums of no more than 1% of the barangay’s appropriations.',
	'Free medical care under the Universal Health Care Act.',
	'No tuition for their dependent children at state colleges and universities.',
	'Civil service eligibility based on their years of barangay service.',
	'Preference in government appointments after their term.',
]

const SK_BENEFITS = [
	'No tuition or matriculation fees at state colleges and universities.',
	'Exemption from the NSTP civic welfare training service.',
	'Excused from class while attending SK meetings and barangay council sessions.',
	'PhilHealth coverage paid by the national government.',
	'A monthly honorarium from SK funds, no more than the chairperson’s, with honoraria and other personal services capped at 25% of the SK fund.',
]

const TOC: TocItem[] = [
	{ id: 'introduction', label: 'How local officials are paid', depth: 1 },
	{ id: 'elected', label: 'Elected officials', depth: 1 },
	{ id: 'allowances', label: 'Allowances and bonuses', depth: 1 },
	{ id: 'class', label: 'Why one town pays less than another', depth: 1 },
	{ id: 'barangay', label: 'Barangay officials and workers', depth: 1 },
	{ id: 'limits', label: 'What limits the payroll', depth: 1 },
	{ id: 'benefits', label: 'Benefits', depth: 1 },
	{ id: 'barangay-benefits', label: 'Barangay officials', depth: 2 },
	{ id: 'sk-benefits', label: 'Sangguniang Kabataan officials', depth: 2 },
]

const H2 = 'scroll-mt-32 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const H3 = 'scroll-mt-32 mt-10 text-[1.1rem] font-semibold tracking-[-0.01em] text-[var(--ink)]'
const P = 'mt-5 text-[15px] leading-7 text-[var(--ink-2)]'
const TABLE = 'w-full min-w-[34rem] border-collapse text-left text-[14px]'
const HEAD = 'border-b border-[var(--ink)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
const TH = 'py-3 pr-4 font-semibold'
const ROW = 'border-b border-[var(--rule-soft)] align-top transition-colors hover:bg-[var(--paper-2)]'
const TD = 'py-3.5 pr-4 leading-6 text-[var(--ink-2)]'

const label = (id: string) => TOC.find((item) => item.id === id)!.label

function Section({ id, children }: { id: string; children: React.ReactNode }) {
	return (
		<section className='mt-20 first:mt-0'>
			<h2 id={id} className={H2}>
				{label(id)}
			</h2>
			{children}
		</section>
	)
}

function List({ items }: { items: string[] }) {
	return (
		<ul className='mt-4'>
			{items.map((item) => (
				<li key={item} className='border-b border-[var(--rule-soft)] py-3 text-[15px] leading-7 text-[var(--ink-2)]'>
					{item}
				</li>
			))}
		</ul>
	)
}

export default function SalariesPage() {
	return (
		<>
			<LguMasthead kicker='The guide · Bangsamoro' name='Salaries and benefits' />

			<DocLayout
				toc={TOC}
				measure='max-w-[58rem]'
				summary='The Bangsamoro Local Governance Code sets the salary grade of every elected local official and the least a barangay official must be paid. The peso amount follows the national salary schedule: in 2026 a governor or city mayor may be paid up to ₱210,718 a month, a municipal mayor up to ₱148,940. Each local government fixes its own rates by ordinance, within a cap on how much of its income may go to salaries.'
			>
				<Section id='introduction'>
					<p className={P}>
						Every government salary in the Philippines sits on a ladder of salary grades, from 1 at the bottom to
						33 at the top, each with its own peso amount on the national salary schedule. The Code puts each
						elected local office on a grade: a governor or a city mayor at salary grade 30 at least, a municipal
						mayor at 27 at least.
					</p>
					<p className={P}>
						The peso figure itself is not in the Code. Each province, city and municipality fixes its officials’
						pay by ordinance, within the limits of the national Salary Standardization Law and the cap on
						spending for personnel (IRR art. 187). Barangay officials are different: they receive honoraria, not
						salaries, at rates the Code sets directly (Sec. 424).
					</p>
				</Section>

				<Section id='elected'>
					<p className={P}>
						The most each elected post may be paid in 2026: its salary grade on the national schedule, and its
						representation and transportation allowance (RATA) at the rate for a first class unit. The yearly
						figure adds the two bonuses, PERA and the other yearly grants below, each at its ceiling.
					</p>
					<div className='mt-6 overflow-x-auto'>
						<table className='w-full min-w-[44rem] border-collapse text-left text-[14px]'>
							<thead>
								<tr className={HEAD}>
									<th className={TH}>Position</th>
									<th className={`${TH} text-right`}>Salary grade</th>
									<th className={`${TH} text-right`}>Salary a month</th>
									<th className={`${TH} text-right`}>RATA a month</th>
									<th className={`${TH} text-right`}>A year, at most</th>
								</tr>
							</thead>
							<tbody>
								{ELECTED.map((row) => (
									<tr key={row.position} className={ROW}>
										<td className={`${TD} font-medium text-[var(--ink)]`}>
											{row.position}
											<span className='block text-[12.5px] font-normal text-[var(--ink-3)]'>
												{row.level} · {row.note ? `${row.note} · ` : ''}Code {row.cite}
											</span>
										</td>
										<td className={`${TD} whitespace-nowrap text-right`}>
											{row.atLeast ? 'At least ' : ''}SG {row.grade}
										</td>
										<td className={`${TD} num whitespace-nowrap text-right font-semibold text-[var(--ink)]`}>
											{peso(SG_2026[row.grade])}
										</td>
										<td className={`${TD} num whitespace-nowrap text-right`}>{peso(row.ra * 2)}</td>
										<td className={`${TD} num whitespace-nowrap text-right font-semibold text-[var(--accent)]`}>
											{peso(yearly(row))}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<p className='mt-4 text-[12.5px] leading-6 text-[var(--ink-3)]'>
						Salary is step 1 of the 2026 schedule (Executive Order 64, s. 2024, third tranche); a unit may move to it
						only after a year on the 2025 rates, so many still pay less. RATA is the representation and the
						transportation allowance together, at the first class rate (DBM LBC 157); a city counts as a component
						city. A year, at most, is 14 months’ salary, 12 of RATA and PERA, the ₱5,000 cash gift, a ₱5,000 PEI and
						the ₱7,000 medical allowance; it leaves out the clothing allowance and any Performance-Based Bonus.
					</p>
				</Section>

				<Section id='allowances'>
					<p className={P}>
						On top of the salary, the national rules let a local government pay its officials and employees the
						allowances and bonuses below. Each is a ceiling: the sanggunian decides whether to pay it, from the
						unit’s own funds and within its payroll cap, and may pay less if it pays everyone the same rate.
					</p>
					<div className='mt-6 overflow-x-auto'>
						<table className={TABLE}>
							<thead>
								<tr className={HEAD}>
									<th className={TH}>Benefit</th>
									<th className={TH}>Amount</th>
									<th className={TH}>Set by</th>
								</tr>
							</thead>
							<tbody>
								{BENEFITS.map((row) => (
									<tr key={row.benefit} className={ROW}>
										<td className={`${TD} font-medium text-[var(--ink)]`}>{row.benefit}</td>
										<td className={TD}>{row.amount}</td>
										<td className={`${TD} text-[13px] text-[var(--ink-3)]`}>{row.source}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Section>

				<Section id='class'>
					<p className={P}>
						The national schedule is the most a local government may pay, not what it must. By default it pays a
						share of the schedule set by its income class, lower for a smaller unit and lower again for a
						municipality. It may instead adopt the full schedule, as long as it pays every post on it and stays
						within its payroll cap, or a lower uniform rate if it cannot afford its own.
					</p>
					<div className='mt-6 overflow-x-auto'>
						<table className='w-full max-w-xl border-collapse text-left text-[14px]'>
							<thead>
								<tr className={HEAD}>
									<th className={TH}>Income class</th>
									<th className={`${TH} text-right`}>Province or city</th>
									<th className={`${TH} text-right`}>Municipality</th>
								</tr>
							</thead>
							<tbody>
								{CLASSES.map((row) => (
									<tr key={row.cls} className={ROW}>
										<td className={`${TD} font-medium text-[var(--ink)]`}>{row.cls}</td>
										<td className={`${TD} num text-right`}>{row.pc}</td>
										<td className={`${TD} num text-right`}>{row.mun}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<p className='mt-4 text-[12.5px] leading-6 text-[var(--ink-3)]'>
						Share of the national salary schedule, from EO 64 s. 2024 sec. 4 and DBM Local Budget Circulars 160, 165
						and 172. A special city pays the full schedule. RATA steps down by class the same way (LBC 157). Each
						unit’s class is on its{' '}
						<Link href='/finances' className='rule-link'>
							finances
						</Link>
						.
					</p>
				</Section>

				<Section id='barangay'>
					<p className={P}>
						What a barangay must pay the people who run it, each month. The barangay pays from its own funds; where
						it cannot afford the punong barangay’s honorarium, the Bangsamoro Government makes up the difference
						through the Ministry of the Interior and Local Government (Sec. 424; IRR art. 45).
					</p>
					<div className='mt-6 overflow-x-auto'>
						<table className={TABLE}>
							<thead>
								<tr className={HEAD}>
									<th className={TH}>Position</th>
									<th className={TH}>Honorarium</th>
								</tr>
							</thead>
							<tbody>
								{BARANGAY.map((row) => (
									<tr key={row.position} className={ROW}>
										<td className={`${TD} font-medium text-[var(--ink)]`}>{row.position}</td>
										<td className={TD}>{row.pay}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Section>

				<Section id='limits'>
					<p className={P}>
						A local government cannot simply raise everyone’s pay. What it spends on personnel, salaries and
						allowances together, may not be more than 45% of its regular income from the year before if it is a
						first to third class province, city or municipality, or 55% if it is fourth class or lower (Sec. 349).
						A barangay’s cap is 55% of the income it actually collected from local sources the year before (Sec.
						355). No official may be paid twice for the same work unless a law allows it (Sec. 107).
					</p>
					<p className={P}>
						What each local government actually spent is on its{' '}
						<Link href='/finances' className='rule-link'>
							finances
						</Link>
						.
					</p>
				</Section>

				<Section id='benefits'>
					<h3 id='barangay-benefits' className={H3}>
						{label('barangay-benefits')}
					</h3>
					<p className={P}>On top of the honorarium (Sec. 424):</p>
					<List items={BARANGAY_BENEFITS} />

					<h3 id='sk-benefits' className={H3}>
						{label('sk-benefits')}
					</h3>
					<p className={P}>SK officials in good standing (Sec. 465):</p>
					<List items={SK_BENEFITS} />

					<p className='mt-14 border-t border-[var(--rule)] pt-6 text-[13px] leading-6 text-[var(--ink-3)]'>
						Read from the Code and its implementing rules, section by section. Where this page and the Act differ,
						the Act is right. Read{' '}
						<a href={lguReferences.localGovernanceCode.href} target='_blank' rel='noreferrer' className='rule-link'>
							{lguReferences.localGovernanceCode.label}
						</a>{' '}
						and its{' '}
						<a href={lguReferences.implementingRules.href} target='_blank' rel='noreferrer' className='rule-link'>
							implementing rules
						</a>
						.
					</p>
				</Section>
			</DocLayout>
		</>
	)
}
