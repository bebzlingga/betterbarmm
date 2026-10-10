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

type Pay = { position: string; level: string; grade: string; cite: string; note?: string }

const ELECTED: Pay[] = [
	{ level: 'Province', position: 'Governor', grade: 'At least SG 30', cite: 's. 517' },
	{ level: 'Province', position: 'Vice-Governor', grade: 'SG 28', cite: 's. 519' },
	{ level: 'Province', position: 'Sangguniang Panlalawigan member', grade: 'At least SG 27', cite: 's. 522' },
	{ level: 'City', position: 'City Mayor', grade: 'At least SG 30', cite: 's. 505' },
	{ level: 'City', position: 'City Vice-Mayor', grade: 'SG 26', cite: 's. 507', note: 'SG 28 in a highly urbanised city' },
	{ level: 'City', position: 'Sangguniang Panlungsod member', grade: 'SG 25', cite: 's. 510', note: 'SG 27 in a highly urbanised city' },
	{ level: 'Municipality', position: 'Municipal Mayor', grade: 'At least SG 27', cite: 's. 485' },
	{ level: 'Municipality', position: 'Municipal Vice-Mayor', grade: 'SG 25', cite: 's. 487' },
	{ level: 'Municipality', position: 'Sangguniang Bayan member', grade: 'At least SG 24', cite: 's. 490' },
]

const BARANGAY: { position: string; pay: string }[] = [
	{ position: 'Punong Barangay', pay: 'At least ₱5,000 a month, up to the first step of SG 14' },
	{
		position: 'Sangguniang Barangay members, the secretary, the treasurer and the SK chairperson',
		pay: 'At least ₱3,000 a month, up to the first step of SG 10',
	},
	{ position: 'Barangay tanods and purok leaders', pay: 'At least ₱1,000 a month' },
	{
		position: 'Child development center teachers, barangay health workers, nutrition scholars and farm technicians',
		pay: 'At least ₱1,000 a month',
	},
	{ position: 'Lupon tagapamayapa members', pay: 'An honorarium per hearing, no more than ₱2,000 a month in all' },
	{ position: 'All of the above', pay: 'A year-end bonus of at least ₱1,000' },
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
				narrow
				summary='The Bangsamoro Local Governance Code sets the salary grade of every elected local official and the least a barangay official must be paid. The peso amount follows the national salary schedule, and each local government fixes it by ordinance, within a cap on how much of its income may go to salaries.'
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
						The salary grade each elected post is paid at. “At least” means the Code sets a floor and the unit may
						pay more.
					</p>
					<div className='mt-6 overflow-x-auto'>
						<table className={TABLE}>
							<thead>
								<tr className={HEAD}>
									<th className={TH}>Position</th>
									<th className={TH}>Level</th>
									<th className={`${TH} text-right`}>Salary grade</th>
								</tr>
							</thead>
							<tbody>
								{ELECTED.map((row) => (
									<tr key={row.position} className={ROW}>
										<td className={`${TD} font-medium text-[var(--ink)]`}>
											{row.position}
											<span className='block text-[12.5px] font-normal text-[var(--ink-3)]'>
												{row.note ? `${row.note} · ` : ''}Code {row.cite}
											</span>
										</td>
										<td className={TD}>{row.level}</td>
										<td className={`${TD} whitespace-nowrap text-right font-semibold text-[var(--ink)]`}>{row.grade}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
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
