import type { Metadata } from 'next'
import { DocLayout } from '../_components/doc-layout'
import type { TocItem } from '../_components/doc-toc'
import { Masthead } from '../_components/parts'

export const metadata: Metadata = {
	title: 'How procurement works',
	description:
		'How the Bangsamoro government buys: the law it follows, who decides, the steps of a public bidding, the other ways an office may buy, and the amounts that trigger each rule.',
}

/* ============================================================
   How procurement works

   A plain-language guide to RA 12009 and its rules, read from the
   Official Gazette text, with the RA 9184 figures it replaced where
   a reader of older notices will meet them. Every rule names the
   section it comes from.
   ============================================================ */

const H2 = 'text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const H3 = 'mt-10 text-[1.1rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'
const P = 'mt-4 text-[15px] leading-7 text-[var(--ink-2)]'
const CITE = 'mt-3 text-[12.5px] leading-5 text-[var(--ink-3)]'

const IRR = 'https://www.officialgazette.gov.ph/downloads/2025/02feb/20250210-IRR-RA-12009-FRM.pdf'
const ACT = 'https://lawphil.net/statutes/repacts/ra2024/ra_12009_2024.html'
const OLD_IRR = 'https://www.gppb.gov.ph/wp-content/uploads/2024/07/Updated-2016-Revised-IRR-of-RA-No.-9184-as-of-19-July-2024.pdf'
const BAA_85 = 'https://parliament.bangsamoro.gov.ph/wp-content/uploads/2025/12/BAA-85-FY-2026-GENERAL-APPROPRIATIONS-ACT-OF-THE-BANGSAMORO.pdf'
const BAA_84 = 'https://parliament.bangsamoro.gov.ph/wp-content/uploads/2025/12/BAA-No.-84.pdf'
const BAA_13 = 'https://parliament.bangsamoro.gov.ph/wp-content/uploads/2022/03/BA-Act-No.13-Bangsamoro-Administrative-Code-Proofread-04052021-3-33pm.pdf'

const contents: TocItem[] = [
	{ id: 'law', label: 'The law', depth: 1 },
	{ id: 'people', label: 'Who decides', depth: 1 },
	{ id: 'plan', label: 'Planning and the budget', depth: 1 },
	{ id: 'bidding', label: 'Public bidding, step by step', depth: 1 },
	{ id: 'modes', label: 'Other ways to buy', depth: 1 },
	{ id: 'amounts', label: 'The amounts that matter', depth: 1 },
	{ id: 'security', label: 'Guarantees and penalties', depth: 1 },
	{ id: 'checks', label: 'Protests and sanctions', depth: 1 },
	{ id: 'barmm', label: 'In the Bangsamoro', depth: 1 },
	{ id: 'reading', label: 'Reading this workspace', depth: 1 },
	{ id: 'sources', label: 'Sources', depth: 1 },
]

const steps = [
	{
		name: 'Pre-procurement conference',
		body: 'The committee confirms the project is in the plan, the budget is there, the documents and designs are ready, and how the winner will be chosen. Optional for small contracts: goods up to ₱5,000,000, infrastructure up to ₱10,000,000, consulting up to ₱2,000,000.',
		cite: 'IRR Secs. 49.1–49.2',
	},
	{
		name: 'Invitation to Bid',
		body: 'Posted for 7 calendar days on PhilGEPS, on the office’s website, and in a conspicuous place at its premises. It states the approved budget for the contract.',
		cite: 'IRR Secs. 50.1–50.3',
	},
	{
		name: 'Pre-bid conference',
		body: 'Required when the approved budget is ₱3,000,000 or more. Held at least 12 days before bids are due, and not earlier than 7 days after posting. Questions are answered in bid bulletins, also posted on PhilGEPS, at least 7 days before the deadline.',
		cite: 'IRR Secs. 51.1–51.5',
	},
	{
		name: 'Bid submission',
		body: 'Each bidder hands in two envelopes at once: a technical one, with its eligibility papers and PhilGEPS registration, and a financial one with its price. A late bid is refused. Bidders get at most 45 days for goods, 50 or 65 for infrastructure (above ₱50,000,000), and 75 for consulting.',
		cite: 'IRR Secs. 54.1–54.6',
	},
	{
		name: 'Bid opening',
		body: 'Right after the deadline, in public. Above ₱10,000,000 for goods, ₱20,000,000 for infrastructure and ₱5,000,000 for consulting, every conference is recorded on video and the opening is livestreamed.',
		cite: 'IRR Secs. 38, 58',
	},
	{
		name: 'Evaluation',
		body: 'A pass-or-fail check of each bid against the requirements, then a ranking. Any bid above the approved budget is disqualified outright.',
		cite: 'IRR Secs. 59–61',
	},
	{
		name: 'Post-qualification',
		body: 'The top-ranked bidder is checked in detail: its papers, its record, its capacity. It has 5 days to send documents; the committee has 12 days, which the head of the office may extend to 45 (30 for consulting). If it fails, the next bidder is checked.',
		cite: 'IRR Secs. 63.2, 63.8',
	},
	{
		name: 'Notice of Award',
		body: 'The committee recommends the winner. The head of the office approves or rejects within 10 days. From bid opening to award may take no more than 60 days.',
		cite: 'IRR Secs. 66–67',
	},
	{
		name: 'Contract and Notice to Proceed',
		body: 'The winner signs and posts its performance security within 10 days of the award. Work begins with the Notice to Proceed, which the Act requires within 3 days of the contract’s approval.',
		cite: 'IRR Sec. 66.5; Act Sec. 66',
	},
]

const modes = [
	{
		group: 'Competitive',
		items: [
			{ name: 'Competitive bidding', when: 'The default. Open to any eligible bidder, through the steps above.', limit: 'No ceiling' },
			{ name: 'Limited source bidding', when: 'Highly specialised goods, consulting or works that only a few known suppliers can provide. Bidders come from a pre-selected list.', limit: 'No ceiling' },
			{ name: 'Competitive dialogue', when: 'New. Complex or innovative purchases whose specifications cannot be fixed in advance; the office talks with bidders first, then takes bids.', limit: 'No ceiling' },
			{ name: 'Unsolicited offer with bid matching', when: 'New. A supplier proposes a new idea or technology; it is put to open bids, and the original offeror may match the lowest.', limit: 'No ceiling' },
		],
	},
	{
		group: 'Direct',
		items: [
			{ name: 'Direct contracting', when: 'Goods that only one supplier sells: patented or proprietary items, or parts required to keep a warranty.', limit: 'No ceiling' },
			{ name: 'Direct acquisition', when: 'New, and partly replaces “shopping”. Small buys from any reputable source, without a canvass, if in the annual plan.', limit: 'Up to ₱200,000' },
			{ name: 'Direct sales', when: 'New. Buying the same goods another office bid out, from the same supplier, at the same or lower price, within 6 months.', limit: 'No ceiling' },
			{ name: 'Repeat order', when: 'More of the same goods from a recent winner, at the same or lower price, within 6 months, up to 25% of the original quantity.', limit: 'No ceiling' },
			{ name: 'Science, technology and innovation', when: 'New. Research supplies, commissioned and pre-commercial goods, startups.', limit: 'No ceiling' },
		],
	},
	{
		group: 'Small value',
		items: [
			{ name: 'Small value procurement', when: 'At least 3 suppliers are asked for quotations, though 1 reply is enough. The request is posted on PhilGEPS for 3 days when above ₱200,000.', limit: 'Up to ₱2,000,000; lower for local governments' },
		],
	},
	{
		group: 'Negotiated',
		items: [
			{ name: 'Two failed biddings', when: 'After a public bidding has failed twice.', limit: 'No ceiling' },
			{ name: 'Emergency', when: 'Imminent danger to life or property during a calamity, or to restore vital public services.', limit: 'No ceiling' },
			{ name: 'Take-over of contracts', when: 'A contract was rescinded or terminated and the work cannot wait.', limit: 'No ceiling' },
			{ name: 'Adjacent or contiguous', when: 'Works next to an ongoing project, by the same contractor, on conditions.', limit: 'No ceiling' },
			{ name: 'Agency to agency', when: 'Another government office with the mandate and capacity does the job. It may not subcontract.', limit: 'No ceiling' },
			{ name: 'Lease of real property and venues', when: 'Renting offices, land or event venues; public property is preferred.', limit: 'No ceiling' },
			{ name: 'Community participation', when: 'Buying directly from local farmers and fisherfolk, or simple works done by community groups.', limit: 'No ceiling' },
			{ name: 'Others', when: 'Scientific, artistic and media work; highly technical consultants; NGO participation where an appropriation names it; UN and international bodies; fuel at the pump; online subscriptions.', limit: 'Subscriptions up to ₱1,000,000, or ₱5,000,000 with approval' },
		],
	},
]

const lgu = [
	{ cls: '1st class', province: '₱2,000,000', city: '₱2,000,000', town: '₱400,000' },
	{ cls: '2nd class', province: '₱2,000,000', city: '₱2,000,000', town: '₱400,000' },
	{ cls: '3rd class', province: '₱2,000,000', city: '₱1,600,000', town: '₱400,000' },
	{ cls: '4th class', province: '₱1,600,000', city: '₱1,200,000', town: '₱200,000' },
	{ cls: '5th class', province: '₱1,200,000', city: '₱800,000', town: '₱200,000' },
]

const amounts = [
	{ rule: 'Small value procurement, general ceiling', now: '₱2,000,000', then: '₱1,000,000' },
	{ rule: 'Small value procurement, barangays', now: '₱100,000', then: '₱50,000' },
	{ rule: 'Quotation request posted on PhilGEPS', now: 'Above ₱200,000', then: 'Above ₱50,000' },
	{ rule: 'Pre-bid conference required', now: '₱3,000,000 and up', then: '₱1,000,000 and up' },
	{ rule: 'Pre-procurement conference optional (goods / works / consulting)', now: 'Up to ₱5M / ₱10M / ₱2M', then: 'Up to ₱2M / ₱5M / ₱1M' },
	{ rule: 'Video recording and livestreamed opening (goods / works / consulting)', now: 'Above ₱10M / ₱20M / ₱5M', then: 'Not required' },
	{ rule: 'Bid opening to award, at most', now: '60 days', then: '3 months' },
]

const fees = [
	{ abc: '₱50 million and below', fee: '0.75% of the budget' },
	{ abc: 'Above ₱50M to ₱100M', fee: '₱500,000' },
	{ abc: 'Above ₱100M to ₱500M', fee: '0.5% of the budget' },
	{ abc: 'Above ₱500M to ₱1B', fee: '₱2,500,000' },
	{ abc: 'Above ₱1B to ₱2B', fee: '0.25% of the budget' },
	{ abc: 'Above ₱2B', fee: '₱5,000,000' },
]

const sources = [
	{ label: 'Implementing Rules and Regulations of RA 12009, Official Gazette, February 10, 2025', href: IRR },
	{ label: 'Republic Act 12009, the New Government Procurement Act (Lawphil)', href: ACT },
	{ label: 'GPPB resolutions and circulars, including Circular 01-2025 on the transition', href: 'https://www.gppb.gov.ph/resolutions/' },
	{ label: 'GPPB Public Advisory 09-2026: cite only the Official Gazette IRR', href: 'https://www.gppb.gov.ph/public-advisory-no-09-2026/' },
	{ label: '2016 Revised IRR of RA 9184, as of July 19, 2024 (for the older figures)', href: OLD_IRR },
	{ label: 'Bangsamoro Autonomy Act 85, the FY 2026 General Appropriations Act, Sec. 16', href: BAA_85 },
	{ label: 'Bangsamoro Autonomy Act 84, the Bangsamoro Budget System Act, Secs. 45, 58 and 68', href: BAA_84 },
	{ label: 'Bangsamoro Autonomy Act 13, the Bangsamoro Administrative Code, Book VI', href: BAA_13 },
	{ label: 'Republic Act 11054, the Bangsamoro Organic Law, Art. XII', href: 'https://lawphil.net/statutes/repacts/ra2018/ra_11054_2018.html' },
	{ label: 'PhilGEPS open data', href: 'https://philgeps.gov.ph/CmsHomePages/open-data' },
]

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
	return (
		<div className='mt-6 overflow-x-auto'>
			<table className='w-full min-w-[30rem] border-collapse text-left text-[14px] leading-6'>
				<thead>
					<tr className='border-b border-[var(--rule-strong,var(--rule))]'>
						{head.map((h) => (
							<th key={h} className='py-2.5 pr-6 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)] last:pr-0'>
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((r) => (
						<tr key={r.join()} className='border-b border-[var(--rule)]'>
							{r.map((c, i) => (
								<td key={i} className={`py-3 pr-6 align-top last:pr-0 ${i ? 'num whitespace-nowrap font-semibold text-[var(--ink)]' : 'text-[var(--ink-2)]'}`}>
									{c}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

function Cite({ children, href = IRR }: { children: React.ReactNode; href?: string }) {
	return (
		<p className={CITE}>
			Source:{' '}
			<a href={href} target='_blank' rel='noreferrer' className='rule-link'>
				{children}
			</a>
		</p>
	)
}

export default function HowItWorksPage() {
	return (
		<>
			<Masthead
				kicker='Procurement · Bangsamoro'
				name='How procurement works'
				note='How a government office buys, from the plan to the contract: the law it follows, who decides, the steps of a public bidding, the other ways to buy, and the amounts that trigger each rule.'
			/>

			<DocLayout toc={contents}>
				<div className='[&>section+section]:mt-20 [&>section]:scroll-mt-28'>
					<section id='law'>
						<h2 className={H2}>The law</h2>
						<p className={P}>
							Every purchase made with public money, by any national office, government corporation, state university or
							local government, follows one law: <strong>Republic Act 12009</strong>, the New Government Procurement Act. It
							was signed on July 20, 2024 and replaced <strong>RA 9184</strong>, the Government Procurement Reform Act of 2003.
							Its implementing rules took effect on <strong>February 25, 2025</strong>.
						</p>
						<p className={P}>
							The old law did not vanish overnight. A purchase first posted before February 25, 2025 still runs under RA 9184
							to the end, and offices have until about May 2028 to fully adopt the new rules. Many notices in this workspace,
							which starts in 2019, were bought under the old law, so its figures appear here beside the new ones.
						</p>
						<h3 className={H3}>What changed</h3>
						<ul className={`${P} list-disc space-y-2 pl-5`}>
							<li>
								The cheapest bid no longer has to win. An office may also choose the <strong>most economically advantageous</strong>{' '}
								bid, weighing quality against price.
							</li>
							<li>
								<strong>Shopping</strong> is gone as a mode. Small purchases now use <strong>small value procurement</strong> or the
								new <strong>direct acquisition</strong>, and ceilings were raised.
							</li>
							<li>Big biddings are recorded on video and their bid openings livestreamed.</li>
							<li>
								Bidders must disclose their <strong>beneficial owners</strong>, the people who really own or control them, in a
								public registry. Lying about it is grounds for blacklisting.
							</li>
							<li>
								PhilGEPS becomes the single portal for every stage, from plan to payment, and disclosure follows
								open-contracting practice.
							</li>
							<li>New modes: competitive dialogue, unsolicited offers with bid matching, direct acquisition, direct sales, and purchases for science and innovation.</li>
						</ul>
						<Cite href={ACT}>RA 12009 Secs. 3, 20, 82, 115; IRR Secs. 26, 38, 49, 113</Cite>
					</section>

					<section id='people'>
						<h2 className={H2}>Who decides</h2>
						<p className={P}>
							The <strong>Head of the Procuring Entity</strong>, a minister, a governor, a mayor, approves each award and hears
							protests, but may not sit on the committee that picks the winner.
						</p>
						<p className={P}>
							That committee is the <strong>Bids and Awards Committee (BAC)</strong>: 5 or 7 permanent officials who post the
							invitation, run the conferences, open and judge the bids, and recommend the winner. In a province, city or town its
							members come from the offices under the mayor or governor, such as the administrator, budget, legal and
							engineering; in a barangay, from the barangay council. Members serve 1-year terms, at most 3 in a row.
						</p>
						<p className={P}>
							A <strong>Secretariat</strong> does the paperwork and a <strong>Technical Working Group</strong> of experts helps
							with specifications and evaluation. At least <strong>2 observers</strong>, one from a business or professional
							group in the field and one from a registered civil-society group, are invited to every stage alongside an auditor
							from the <strong>Commission on Audit</strong>. Observers do not vote, but may see the minutes and bids, and report
							to the head of the office, PhilGEPS and COA.
						</p>
						<Cite>IRR Secs. 41–44</Cite>
					</section>

					<section id='plan'>
						<h2 className={H2}>Planning and the budget</h2>
						<p className={P}>
							Buying starts a year early. Each unit lists what it will need in a <strong>Project Procurement Management Plan</strong>.
							These are combined into the office&rsquo;s <strong>Annual Procurement Plan</strong>, which names each project, how it
							will be bought, when, from what fund, and for how much. The final plan is posted online and sent to the Government
							Procurement Policy Board by the end of January. Nothing may be bought that is not in it.
						</p>
						<p className={P}>
							Each project carries an <strong>Approved Budget for the Contract</strong>. It is a ceiling: a bid above it is
							disqualified, and there is no floor. Breaking one contract into smaller ones to slip under a threshold,{' '}
							<strong>splitting</strong>, is prohibited and an offence. Common supplies such as paper and ink must be bought from
							the Procurement Service of the Department of Budget and Management when it has them.
						</p>
						<Cite>IRR Secs. 7.7–7.8, 39, 40.1, 60.1</Cite>
					</section>

					<section id='bidding'>
						<h2 className={H2}>Public bidding, step by step</h2>
						<p className={P}>
							Competitive bidding is the rule; every other way to buy is an exception that must be justified. Days are calendar
							days.
						</p>
						<ol className='mt-8'>
							{steps.map((s, i) => (
								<li key={s.name} className='grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-t border-[var(--rule)] py-6'>
									<span className='num text-[13px] font-semibold text-[var(--brass)]'>{String(i + 1).padStart(2, '0')}</span>
									<div>
										<h3 className='text-[1.05rem] font-extrabold tracking-[-0.01em] text-[var(--ink)]'>{s.name}</h3>
										<p className='mt-2 text-[15px] leading-7 text-[var(--ink-2)]'>{s.body}</p>
										<p className='mt-1.5 text-[12.5px] text-[var(--ink-3)]'>{s.cite}</p>
									</div>
								</li>
							))}
						</ol>
						<h3 className={H3}>When a bidding fails</h3>
						<p className={P}>
							A bidding fails when no one bids, no bidder is eligible, no bid passes, or the winner walks away. The office revises
							its terms and bids again. After a second failure it may negotiate directly. A single passing bid may still win.
						</p>
						<Cite>IRR Secs. 27, 64–65</Cite>
					</section>

					<section id='modes'>
						<h2 className={H2}>Other ways to buy</h2>
						<p className={P}>
							The law lists 11 modes of procurement. Public bidding is one; the others apply only when their conditions are met,
							and an office may always choose to bid instead. Notices in this workspace tagged &ldquo;negotiated&rdquo;,
							&ldquo;direct contracting&rdquo; or &ldquo;small value&rdquo; were bought this way.
						</p>
						{modes.map((g) => (
							<div key={g.group}>
								<h3 className={H3}>{g.group}</h3>
								<dl className='mt-4'>
									{g.items.map((m) => (
										<div key={m.name} className='grid gap-x-8 gap-y-1 border-t border-[var(--rule)] py-4 sm:grid-cols-[minmax(0,1fr)_11rem]'>
											<dt className='text-[15px] font-semibold text-[var(--ink)]'>{m.name}</dt>
											<dd className='num text-[13px] text-[var(--ink-3)] sm:row-span-2 sm:text-right'>
												{m.limit}
											</dd>
											<dd className='text-[14px] leading-6 text-[var(--ink-2)]'>{m.when}</dd>
										</div>
									))}
								</dl>
							</div>
						))}
						<Cite>IRR Secs. 26–37</Cite>
					</section>

					<section id='amounts'>
						<h2 className={H2}>The amounts that matter</h2>
						<p className={P}>
							Above the small-value ceiling, an office must bid unless another mode&rsquo;s conditions apply. Local governments
							have lower ceilings, set by type and income class. Barangays: <strong>₱100,000</strong>.
						</p>
						<Table
							head={['Small value ceiling', 'Province', 'City', 'Municipality']}
							rows={lgu.map((r) => [r.cls, r.province, r.city, r.town])}
						/>
						<Cite>IRR Sec. 34.2</Cite>
						<h3 className={H3}>Then and now</h3>
						<p className={P}>The thresholds that changed between the old law and the new.</p>
						<Table head={['Rule', 'RA 12009', 'RA 9184']} rows={amounts.map((a) => [a.rule, a.now, a.then])} />
						<p className={CITE}>
							Sources:{' '}
							<a href={IRR} target='_blank' rel='noreferrer' className='rule-link'>
								IRR Secs. 34, 38, 49, 51, 67
							</a>
							;{' '}
							<a href={OLD_IRR} target='_blank' rel='noreferrer' className='rule-link'>
								RA 9184 IRR Secs. 20, 22, 38, Annex H
							</a>
							. No Government Procurement Policy Board resolution up to 20-2026 changes these amounts.
						</p>
					</section>

					<section id='security'>
						<h2 className={H2}>Guarantees and penalties</h2>
						<p className={P}>
							A bidder backs its bid with a <strong>bid security</strong>: 2% of the budget in cash or a manager&rsquo;s check,
							5% as a bank guarantee or surety bond, or a signed Bid Securing Declaration. A bid without one is disqualified.
						</p>
						<p className={P}>
							The winner then posts a <strong>performance security</strong> on the contract price: 5% for goods and consulting,
							10% for infrastructure, or 30% as a surety bond. Goods carry a warranty, backed by 1% to 5% of each payment held
							back. Infrastructure carries a 1-year defects liability period after completion.
						</p>
						<p className={P}>
							A late supplier pays <strong>liquidated damages</strong> of at least 0.1% of the unfinished work for each day of
							delay, and the office may terminate the contract once they reach 10% of its price. A contractor may subcontract at
							most 20% of goods and 50% of infrastructure, with approval.
						</p>
						<Cite>IRR Secs. 7.5, 56, 68, 90, 97</Cite>
					</section>

					<section id='checks'>
						<h2 className={H2}>Protests and sanctions</h2>
						<p className={P}>
							A losing bidder first asks the committee to reconsider, within 3 days; the committee answers within 7. If refused,
							it may file a protest with the head of the office within 7 days, paying a non-refundable fee. The head decides
							within 7 days. A protest does not stop the bidding, but must be settled before an award. Only the Supreme Court may
							halt a procurement by injunction.
						</p>
						<Table head={['Approved budget', 'Protest fee']} rows={fees.map((f) => [f.abc, f.fee])} />
						<p className={P}>
							For smaller contracts the head&rsquo;s decision is final: goods up to ₱20,000,000, infrastructure up to
							₱50,000,000 and consulting up to ₱10,000,000 for national and regional offices; ₱1,250,000, ₱12,500,000 and
							₱2,500,000 for local governments. Above those, the bidder may go to the Regional Trial Court.
						</p>
						<h3 className={H3}>Suspension and blacklisting</h3>
						<p className={P}>
							A supplier that refuses an award, delivers poor goods or falls 15% or more behind schedule can be{' '}
							<strong>suspended</strong> by the office for 1 year, 2 for a repeat. Collusion, false documents, hidden
							relationships with officials or false beneficial-ownership information lead to <strong>blacklisting</strong> from
							all government purchases, and a third offence to a permanent ban. Officials who leak bids, split contracts or delay
							without cause face administrative charges, and criminal ones under the Anti-Graft and Corrupt Practices Act.
						</p>
						<Cite href={ACT}>RA 12009 Secs. 83–87, 92, 98–105</Cite>
					</section>

					<section id='barmm'>
						<h2 className={H2}>In the Bangsamoro</h2>
						<p className={P}>
							The Bangsamoro Government has no procurement law of its own; it follows RA 12009. Its 2026 budget, Bangsamoro
							Autonomy Act 85, orders every ministry, office and agency to &ldquo;strictly adhere&rdquo; to RA 12009 and its
							rules, and makes PhilGEPS the primary channel for all its procurement, which is why this workspace reads from it.
							The Bangsamoro Budget System Act (Act 84) ties spending controls to RA 12009 and requires each ministry to keep a
							transparency seal on its website showing its procurement plans and the contracts it awarded.
						</p>
						<p className={P}>
							The region&rsquo;s provinces, cities, towns and barangays follow the same national rules, with the local ceilings
							above. The Commission on Audit is the sole auditor of the regional government and its local governments.
						</p>
						<p className={P}>
							One question is open. The Bangsamoro Administrative Code of 2020 (Act 13) still refers to RA 9184 and sets its own
							committee terms of 3 years, and appeals that end with the Chief Minister. RA 12009 sets 1-year terms and appeals to
							the courts. No later act has reconciled the two.
						</p>
						<p className={CITE}>
							Sources:{' '}
							<a href={BAA_85} target='_blank' rel='noreferrer' className='rule-link'>
								BAA 85 Sec. 16
							</a>
							;{' '}
							<a href={BAA_84} target='_blank' rel='noreferrer' className='rule-link'>
								BAA 84 Secs. 58, 68
							</a>
							;{' '}
							<a href={BAA_13} target='_blank' rel='noreferrer' className='rule-link'>
								BAA 13 Book VI, Secs. 15–24
							</a>
							;{' '}
							<a href='https://lawphil.net/statutes/repacts/ra2018/ra_11054_2018.html' target='_blank' rel='noreferrer' className='rule-link'>
								RA 11054 Art. XII Sec. 2
							</a>
						</p>
					</section>

					<section id='reading'>
						<h2 className={H2}>Reading this workspace</h2>
						<p className={P}>
							A <strong>bid notice</strong> here is an Invitation to Bid or a Request for Quotation posted on PhilGEPS; its{' '}
							<strong>approved budget</strong> is the ceiling above. An <strong>award</strong> is the contract that followed, at
							the winning price. The gap between the two is what bidding saved. Neither is a payment.
						</p>
						<p className={P}>
							PhilGEPS publishes the mode of procurement only for notices that reached an award, or that were posted on its new
							system since 2024. A notice with a pre-bid conference date was a public bidding, since no other mode holds one.
							See{' '}
							<a href='/sources' className='rule-link'>
								Sources
							</a>{' '}
							for what the data can and cannot show.
						</p>
					</section>

					<section id='sources'>
						<h2 className={H2}>Sources</h2>
						<p className={P}>
							Read in October 2026. Where this page and the law differ, the law settles it.
						</p>
						<ol className='mt-6 space-y-3 text-[14px] leading-6'>
							{sources.map((s) => (
								<li key={s.href} className='border-t border-[var(--rule)] pt-3'>
									<a href={s.href} target='_blank' rel='noreferrer' className='rule-link text-[var(--ink-2)]'>
										{s.label}
									</a>
								</li>
							))}
						</ol>
					</section>
				</div>
			</DocLayout>
		</>
	)
}
