import type { Metadata } from 'next'
import Link from 'next/link'
import { OkirRule, Rise, SectionHead } from '@betterbarmm/editorial'
import { lguReferences } from '@betterbarmm/lgu-data'
import { LguMasthead, LguBreadcrumb } from '../_components/lgu-parts'

export const metadata: Metadata = {
	title: 'The two codes',
	description:
		'How the Bangsamoro Local Governance Code of 2023 differs from the national Local Government Code of 1991 — what changed for local government inside BARMM, and what did not.',
}

/* ============================================================
   The two codes

   The workspace used to credit RA 7160 with creating the offices
   and devolving the services, which is what the rest of the
   country runs on and is not what these units run on. Correcting
   the attribution raised the obvious next question — if not that
   code, then what, and how different is it — and this is the page
   for it.

   Written against both texts rather than summarised from one. The
   Bangsamoro side is cited to its own section throughout, because
   every claim here is checkable and a comparison nobody can check
   is an opinion.
   ============================================================ */

type Difference = {
	subject: string
	national: string
	bangsamoro: string
	/** Where in the Bangsamoro code it says so. */
	basis: string
}

/** Where the two codes genuinely part company. */
const DIFFERENCES: Difference[] = [
	{
		subject: 'Who supervises the unit',
		national:
			'The President supervises local government units through the DILG, and a province answers upward to Malacañang.',
		bangsamoro:
			'The Chief Minister supervises them through the Ministry of the Interior and Local Government. A complaint against a provincial or highly urbanised city official is filed with the Office of the Chief Minister, and a governor’s leave is approved there — not in Manila.',
		basis: 'Code ss. 55, 196 · IRR art. 196',
	},
	{
		subject: 'What a barangay captain is paid',
		national:
			'A punong barangay gets an honorarium of not less than ₱1,000 a month and a sangguniang barangay member ₱600 — figures set in 1991 and never raised.',
		bangsamoro:
			'Not less than ₱5,000 a month for the punong barangay, up to the first step of salary grade 14; not less than ₱3,000 for council members, the secretary, the treasurer and the SK chairperson. Where a barangay cannot afford it, the Bangsamoro Government subsidises the difference through MILG.',
		basis: 'Code s. 424 · IRR art. 45',
	},
	{
		subject: 'Political dynasties',
		national: 'No prohibition. The constitutional ban has never been given a statute.',
		bangsamoro:
			'A candidate related within the second civil degree to an incumbent elective official of the same unit is disqualified, and declares in the certificate of candidacy that they are not. It does not bite until the May 2028 elections.',
		basis: 'Code ss. 45(g), 595 · IRR arts. 184, 690',
	},
	{
		subject: 'Training as a condition of office',
		national: 'Encouraged, and attached to nothing.',
		bangsamoro:
			'Every newly elected official must complete an eight-hour onboarding program on assuming office and continuing training within two years. Skipping it deliberately is a ground for discipline and disqualifies the official from the next election until it is done. Also from May 2028.',
		basis: 'Code ss. 43, 595 · IRR art. 99',
	},
	{
		subject: 'Who fills a vacant council seat',
		national:
			'The President appoints to a provincial board or a highly urbanised city council; the Governor to a component city or municipal council.',
		bangsamoro:
			'The Chief Minister appoints to a sangguniang panlalawigan or the council of a highly urbanised or independent component city. Below that the chain is the same — the governor for a sangguniang bayan, the mayor for a sangguniang barangay.',
		basis: 'Code s. 50 · IRR art. 192',
	},
	{
		subject: 'What a violation costs',
		national:
			'The general penalty runs to a fine in the low thousands — the figures have not moved since 1991.',
		bangsamoro:
			'Imprisonment of one to six months or a fine of not less than ₱40,000 and not more than ₱1,200,000, or both, and dismissal with perpetual disqualification where the offender holds office.',
		basis: 'Code s. 574 · IRR art. 415',
	},
	{
		subject: 'Custom and tradition',
		national:
			'Customs and traditions may be resorted to in barangay dispute settlement, and little beyond that.',
		bangsamoro:
			'Where neither law nor jurisprudence applies, the customs and traditions of the place may be resorted to as a general rule of interpretation — not confined to the barangay, and sitting alongside the Code’s declared principle of moral governance.',
		basis: 'Code ss. 2, 5 · IRR art. 5',
	},
	{
		subject: 'Who is at the council table',
		national: 'The sangguniang barangay is the punong barangay and seven elected members.',
		bangsamoro:
			'The same seven, with the Code additionally providing for an indigenous peoples or settler representative among those it pays, so a community that would otherwise go unheard has a seat rather than a hearing.',
		basis: 'Code s. 424',
	},
	{
		subject: 'The Special Geographic Area',
		national: 'Nothing. The area was in North Cotabato when the code was written.',
		bangsamoro:
			'The 63 barangays that voted to join in 2019 are provided for directly, and until a province is constituted for them their eight new municipalities may levy the real property tax and the professional tax, which ordinarily belong to a province.',
		basis: 'Code ss. 600, 601 · IRR arts. 691–693',
	},
]

/** What did not change, which is most of it. */
const SAME = [
	'A three-year term and a three-term limit, at every level including the barangay.',
	'The ladder itself — province, city or municipality, barangay — and which services sit on which rung.',
	'The rule that doubt about a power is resolved in favor of the unit, and a tax ordinance against the unit that wrote it.',
	'Automatic succession: the vice takes over, then the highest-ranking council member.',
	'Recall on loss of confidence, on the same signature thresholds and the same once-per-term limit.',
	'The katarungang pambarangay, its lupon of 10 to 20, and the certificate to file action.',
	'Civil service coverage for appointive staff, and the Commission on Audit over the money.',
]

export default function TwoCodesPage() {
	return (
		<>
			<LguMasthead
				brand
				breadcrumb={<LguBreadcrumb trail={[]}>The two codes</LguBreadcrumb>}
				kicker='The law · Bangsamoro'
				name='Which code these units actually run on.'
				note='Local government in the Philippines runs on the Local Government Code of 1991. Inside BARMM it does not — or not first. The Bangsamoro Local Governance Code of 2023 is the code that creates these offices, fixes their terms and their pay, and devolves the services, and the national one applies only where the Bangsamoro one is silent. Most of it is the same. This is the part that is not.'
			/>

			{/* ---- Which one applies ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='01'
					eyebrow='Which one applies'
					size='sm'
					title='Not a replacement,'
					titleMuted='and not a supplement either.'
					lead='A regional law cannot repeal a national one, and BAA 49 does not try. What it repealed is Muslim Mindanao Autonomy Act 25 — the ARMM local government code it succeeded. RA 7160 remains on the books and remains the law inside BARMM for anything the Bangsamoro code does not reach.'
				/>

				<div className='mt-10 grid gap-x-14 gap-y-8 text-[13.5px] leading-7 text-[var(--ink-2)] lg:grid-cols-3'>
					<div className='border-t border-[var(--accent)] pt-5'>
						<h3 className='text-[14.5px] font-semibold text-[var(--ink)]'>
							Bangsamoro Autonomy Act 49
						</h3>
						<p className='mt-3'>
							The Bangsamoro Local Governance Code of 2023, enacted 28 September 2023 by the
							Bangsamoro Transition Authority. 605 sections in four books. It governs every
							province, city, municipality and barangay in the region.
						</p>
					</div>
					<div className='border-t border-[var(--brass-line)] pt-5'>
						<h3 className='text-[14.5px] font-semibold text-[var(--ink)]'>Its implementing rules</h3>
						<p className='mt-3'>
							Promulgated 30 September 2025 by MILG. 696 articles setting out how the Code is
							carried out — the procedures, the deadlines, the rate tables. Where an article and
							the Code disagree, the Code wins.
						</p>
					</div>
					<div className='border-t border-[var(--rule)] pt-5'>
						<h3 className='text-[14.5px] font-semibold text-[var(--ink)]'>
							Republic Act 7160
						</h3>
						<p className='mt-3'>
							The national Local Government Code of 1991. Still in force here, but suppletory:
							it answers what the Bangsamoro code does not ask. Most of its architecture survives
							inside BAA 49 because BAA 49 was written from it.
						</p>
					</div>
				</div>
			</section>

			<OkirRule />

			{/* ---- Where they part ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='02'
					eyebrow='Where they part'
					size='sm'
					title='Nine places'
					titleMuted='the answer is different.'
					lead='Each row is the same question put to both codes. The Bangsamoro answer is cited to the section that carries it, so any of these can be checked against the text rather than taken on trust.'
				/>

				<div className='mt-12'>
					{DIFFERENCES.map((row, index) => (
						<div key={row.subject} className='border-t border-[var(--brass-line)] pt-6 mt-10 first:mt-0'>
							<div className='flex items-baseline gap-4'>
								<span className='num font-mono text-[11px] font-semibold text-[var(--brass)]'>
									{String(index + 1).padStart(2, '0')}
								</span>
								<h3 className='text-[16px] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
									{row.subject}
								</h3>
							</div>

							<div className='mt-5 grid gap-x-12 gap-y-6 lg:grid-cols-2'>
								<div>
									<p className='font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-mute)]'>
										Nationally · RA 7160
									</p>
									<p className='mt-2 text-[13.5px] leading-7 text-[var(--ink-3)]'>
										{row.national}
									</p>
								</div>
								<div className='border-l-2 border-[var(--accent)] pl-5'>
									<p className='font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]'>
										In BARMM · BAA 49
									</p>
									<p className='mt-2 text-[13.5px] leading-7 text-[var(--ink-2)]'>
										{row.bangsamoro}
									</p>
									<p className='mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
										{row.basis}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* ---- What did not change ---- */}
			<section className='bb-container border-t border-[var(--rule)] bb-section-bottom'>
				<SectionHead
					index='03'
					eyebrow='What did not change'
					size='sm'
					title='Most of it'
					titleMuted='is the same law.'
					lead='The differences above are the interesting part and not the bulk of it. BAA 49 was drafted from RA 7160 and keeps its structure almost entirely, which is why a treasurer or an assessor moving into the region finds the job recognizable.'
				/>

				<ul className='mt-10 grid gap-x-12 sm:grid-cols-2'>
					{SAME.map((item) => (
						<li
							key={item}
							className='flex items-baseline gap-3 border-b border-[var(--rule-soft)] py-3 text-[13.5px] leading-7 text-[var(--ink-2)]'
						>
							<span
								aria-hidden='true'
								className='mt-1.5 size-1.5 shrink-0 rotate-45 bg-[var(--brass)]'
							/>
							{item}
						</li>
					))}
				</ul>

				<Rise distance={14}>
					<p className='mt-12 border-t border-[var(--brass-line)] pt-6 text-[12.5px] leading-6 text-[var(--ink-3)]'>
						The Bangsamoro side of every row is read from{' '}
						<a
							href={lguReferences.localGovernanceCode.href}
							target='_blank'
							rel='noreferrer'
							className='rule-link'
						>
							{lguReferences.localGovernanceCode.label}
						</a>{' '}
						and its{' '}
						<a
							href={lguReferences.implementingRules.href}
							target='_blank'
							rel='noreferrer'
							className='rule-link'
						>
							implementing rules
						</a>
						; the national side from{' '}
						<a
							href={lguReferences.nationalCode.href}
							target='_blank'
							rel='noreferrer'
							className='rule-link'
						>
							{lguReferences.nationalCode.label}
						</a>
						. What each rung of government does with these powers is on{' '}
						<Link href='/how-it-works' className='rule-link'>
							How it works
						</Link>
						.
					</p>
				</Rise>
			</section>
		</>
	)
}
