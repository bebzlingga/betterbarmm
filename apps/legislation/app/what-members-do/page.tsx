import type { Metadata } from 'next'
import Link from 'next/link'
import { MemberPayFigures } from '../_components/member-pay'
import { PageHeader } from '../_components/page-header'
import { ReadingColumn } from '../_components/reading-column'
import { Reveal } from '../_components/reveal'
import type { TocItem } from '../_components/table-of-contents'

export const metadata: Metadata = {
	title: 'What a member of Parliament actually does',
	description:
		"The job of a Bangsamoro member of Parliament: the eleven duties the rulebook sets, when the Parliament sits, what each seat costs the region, the allowances that come with it, and what a member is barred from doing. Every figure is quoted from the enacted budget and every duty from the Parliament's own rules.",
}

/* ============================================================
   What a member actually does

   Two questions get asked about members and neither has an answer anywhere
   public: what is the job, and what does it pay.

   The first is answerable — the rulebook sets out eleven duties in Rule II,
   Section 2, and they are specific enough to hold someone to. The second is
   answerable too, but only by reading the enacted budget: the Staffing
   Summary in every General Appropriations Act of the Bangsamoro lists what is
   provided for each post by name. Nobody publishes that as a figure, so this
   page does.

   The honesty problem on the pay section is real and is handled explicitly
   rather than glossed. The Staffing Summary figure is the whole annual
   Personnel Services provision for a post — basic salary plus the bonuses,
   allowances and government contributions costed against it — and it is not
   take-home pay. The act does not break basic salary out per post, so this
   page states the chamber-wide split and stops there rather than dividing a
   number the document does not divide.

   House style follows `how-parliament-works`: the plain thing first, the term
   second, and the source named on every point so a reader can check it.
   ============================================================ */

const SOURCES = {
	rules:
		'https://parliament.bangsamoro.gov.ph/rules-procedures-and-practices-of-the-bta-parliament/',
	rulesPdf:
		'https://parliament.bangsamoro.gov.ph/wp-content/uploads/2023/03/AR-268-House-Rules-as-of-March-14-2023-4.36-PM-FONTSIZE-12-WITH-SIGN.pdf',
	organicLaw: 'https://www.officialgazette.gov.ph/downloads/2018/07jul/20180727-RA-11054-RRD.pdf',
	schedules: 'https://parliament.bangsamoro.gov.ph/schedules/',
}

function Source({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<a href={href} target='_blank' rel='noreferrer' className='rule-link'>
			{children}
		</a>
	)
}

/** One plain-language point, with the rule or the act it comes from underneath. */
function Point({
	title,
	children,
	cite,
}: {
	title: string
	children: React.ReactNode
	cite: string
}) {
	return (
		<div className='border-t border-[var(--rule-soft)] py-6 first:border-t-0 first:pt-0'>
			<h3 className='item-title text-[var(--ink)]'>{title}</h3>
			<div className='copy mt-2.5 text-[var(--ink-2)]'>{children}</div>
			<p className='meta-sm mt-4'>{cite}</p>
		</div>
	)
}

/**
 * One duty, lettered as the rulebook letters it.
 *
 * The letter is kept because it is how the duty is cited: a reader taking one
 * of these to a member wants to name the sub-paragraph, not paraphrase it.
 */
function Duty({ letter, children }: { letter: string; children: React.ReactNode }) {
	return (
		<li className='flex gap-4 border-t border-[var(--rule-soft)] py-4 first:border-t-0 first:pt-0'>
			<span className='num mt-px w-4 shrink-0 text-[13px] font-semibold text-[var(--ink-mute)]'>
				{letter}
			</span>
			<span className='copy text-[var(--ink-2)]'>{children}</span>
		</li>
	)
}

/** A figure with what it covers under it — the pay and allowance rows. */
function Figure({
	value,
	label,
	children,
}: {
	value: string
	label: string
	children?: React.ReactNode
}) {
	return (
		<div className='border-t border-[var(--rule-soft)] py-5 first:border-t-0 first:pt-0'>
			<div className='flex flex-wrap items-baseline gap-x-4 gap-y-1'>
				<p className='num text-xl font-black leading-none text-[var(--ink)]'>{value}</p>
				<p className='item-title text-[var(--ink)]'>{label}</p>
			</div>
			{children ? (
				<p className='mt-2 text-[13px] leading-6 text-[var(--ink-3)]'>{children}</p>
			) : null}
		</div>
	)
}

const SECTIONS: TocItem[] = [
	{ id: 'the-job', label: 'The job' },
	{ id: 'duties', label: 'What they must do' },
	{ id: 'the-calendar', label: 'When they sit' },
	{ id: 'pay', label: 'What a seat costs' },
	{ id: 'allowances', label: 'Allowances and benefits' },
	{ id: 'limits', label: 'What they may not do' },
	{ id: 'holding-them-to-it', label: 'Holding them to it' },
	{ id: 'sources', label: 'Read the originals' },
]

function Block({
	id,
	label,
	title,
	lead,
	children,
}: {
	id: string
	label: string
	title: string
	lead?: string
	children: React.ReactNode
}) {
	return (
		<Reveal>
			<section id={id} className='scroll-mt-32 py-12 font-sans lg:py-14'>
				<p className='eyebrow'>{label}</p>
				<h2 className='section-title mt-4 max-w-3xl'>{title}</h2>
				{lead ? <p className='section-lead mt-4 max-w-2xl text-[var(--ink-3)]'>{lead}</p> : null}

				<div className='mt-10 max-w-4xl'>{children}</div>
			</section>
		</Reveal>
	)
}

export default function WhatMembersDoPage() {
	return (
		<>
			<PageHeader
				emphasis='brand'
				align='left'
				size='compact'
				eyebrow='The job of a member'
				title='What a member of Parliament'
				titleMuted='actually does.'
				description='The rulebook sets out eleven duties for a member, and the enacted budget says to the peso what each seat is provided. Neither is secret and neither is easy to find. This is both, in ordinary words, with the rule or the section named on every point so you can check it.'
			/>

			<ReadingColumn sections={SECTIONS}>
				<Block
					id='the-job'
					label='The job'
					title='Legislation first, and the rules say so in as many words.'
					lead='Not a job description written by anyone outside. This is the Parliament describing its own members, in the rulebook it adopted for itself.'
				>
					<Point
						title='The primary duty is making law'
						cite='Rules, Rule II, Section 2 (AR 268, as of 14 March 2023)'
					>
						The rulebook opens the duties with a single sentence: &ldquo;The primary duty and
						responsibility of the Members of the Parliament shall be legislation.&rdquo; Everything
						after it &mdash; attendance, debate, constituency work, publishing what they do &mdash;
						is framed as what fulfilling that duty requires.
					</Point>
					<Point title='Nobody has voted for them yet' cite='See Powers, limits, and the rulebook'>
						Members of the Bangsamoro Transition Authority are appointed, not elected, and the body
						holds executive as well as legislative power for the length of the transition. That
						changes what a duty to a constituency means in practice, and it is the single most
						important thing to hold in mind while reading the rest of this page.{' '}
						<Link href='/how-parliament-works' className='rule-link'>
							The constitutional position is set out here
						</Link>
						.
					</Point>
					<Point
						title='77 seats are funded, and 157 people have held one'
						cite='BAA 85, Staffing Summary, Bangsamoro Transition Authority; registry roster'
					>
						The FY 2026 budget funds 77 member posts: 1 Speaker, 12 Deputy Speakers, 1 Floor Leader,
						5 Deputy Floor Leaders and 58 Members of the Parliament. Across the three transition
						parliaments, 157 people have held a seat at one time or another &mdash;{' '}
						<Link href='/members' className='rule-link'>
							the full roster is here
						</Link>
						, with the measures each of them is credited on.
					</Point>
				</Block>

				<Block
					id='duties'
					label='What they must do'
					title='Eleven duties, and they are specific.'
					lead='Rule II, Section 2 lists them (a) to (k). They are reproduced here in the rulebook&rsquo;s own terms, because the letter is how you cite one back to a member.'
				>
					<ul className='mb-8'>
						<Duty letter='a'>
							Prepare, introduce and work for the passage of measures that address social, political
							and economic needs in the region.
						</Duty>
						<Duty letter='b'>
							Promptly attend plenary sessions, and the committee hearings and meetings they sit on
							or where they authored or sponsored the measure under consideration.
						</Duty>
						<Duty letter='c'>
							Stay in the session hall and committee rooms until the end &mdash; not merely appear
							and leave.
						</Duty>
						<Duty letter='d'>
							Be ready to participate intelligently in debate, in plenary, in committee, and in
							public consultations.
						</Duty>
						<Duty letter='e'>
							Articulate faithfully the demands and interests of their constituencies, and of other
							sectors a measure affects.
						</Duty>
						<Duty letter='f'>
							Secure, by every lawful means, the data and information needed to work out what
							legislation a public issue actually requires.
						</Duty>
						<Duty letter='g'>
							Make information about their legislative and constituent work available and accessible
							to the public.
						</Duty>
						<Duty letter='h'>Speak openly, but allow everyone their turn to speak.</Duty>
						<Duty letter='i'>
							Treat everyone with respect and courtesy, and never impute dishonesty or corruption to
							a fellow member.
						</Duty>
						<Duty letter='j'>Follow the rules of debate.</Duty>
						<Duty letter='k'>
							Perform whatever else is lawful and necessary to get needed measures passed.
						</Duty>
					</ul>

					<Point
						title='Three of these are yours to use'
						cite='Rules, Rule II, Section 2(e), (f), (g)'
					>
						Most of the list governs conduct inside the chamber. Three do not. A member must put
						your interests forward (e), must go and get the information a question actually needs
						(f), and must make their own legislative and constituent work public (g). That last one
						is a duty you can hold a member to by name &mdash;{' '}
						<Link href='/members' className='rule-link'>
							what each has filed is on their profile
						</Link>
						.
					</Point>
				</Block>

				<Block
					id='the-calendar'
					label='When they sit'
					title='Two weeks a month, from one in the afternoon.'
					lead='The sitting calendar is set in the rules rather than left to the Speaker, which makes it something a reader can check a member&rsquo;s attendance against.'
				>
					<Point
						title='Mondays to Thursdays, third and fourth week'
						cite='Rules, Rule VI, Section 4'
					>
						Plenary sessions commence at one o&rsquo;clock in the afternoon on Mondays through
						Thursdays of the third and fourth week of the month, unless the Parliament decides
						otherwise. Committee hearings and public consultations sit outside that. Parliament
						publishes its <Source href={SOURCES.schedules}>schedules</Source>.
					</Point>
					<Point title='Remote sittings need an emergency' cite='Rules, Rule VI, Section 4'>
						The Parliament may convene by teleconference or video conference, but only on a motion
						carried before the previous session closed, and only on account of force majeure or a
						national or regional emergency preventing members from being physically present. Members
						joining that way count for quorum and may vote.
					</Point>
					<Point
						title='Special sessions can be called during a recess'
						cite='Rules, Rule VI, Section 3(c)'
					>
						The Speaker calls special sessions at the Chief Minister&rsquo;s request in an emergency
						&mdash; or on the Speaker&rsquo;s own initiative, even while the Parliament is in
						recess.
					</Point>
				</Block>

				<Block
					id='pay'
					label='What a seat costs'
					title='&#8369;3,277,082 a year for each member&rsquo;s post.'
					lead='That is not a salary figure, and the difference matters. It is the whole annual provision the budget makes for the post &mdash; read the note under the numbers before quoting either.'
				>
					<div className='mb-8'>
						<MemberPayFigures />
					</div>

					<Point
						title='This is the cost of the post, not the take-home pay'
						cite='BAA 85, Staffing Summary and Appropriations by Object of Expenditures'
					>
						The Staffing Summary provides one figure per post, and it covers basic salary plus the
						bonuses, allowances and the government&rsquo;s share of retirement, PhilHealth, Pag-IBIG
						and insurance contributions costed against that post. Across all 1,484 permanent posts
						in the Parliament, the act provides ₱1,715,142,370, of which ₱1,217,542,596 &mdash;
						about 71% &mdash; is basic salaries and wages. The act does not break that split out
						post by post, so what a single member is paid before deductions is not in the document,
						and this page does not estimate it.
					</Point>
					<Point
						title='The Parliament&rsquo;s own budget is ₱7.26 billion'
						cite='BAA 85, Bangsamoro Transition Authority'
					>
						Personnel for all 1,750 posts is ₱1,931,805,242 of it. The rest is the chamber&rsquo;s
						operating budget: a Representation Program of ₱1,966,656,000, a Legislation Program of
						₱1,706,586,130, a Constituency Servicing Program of ₱480,000,000, oversight at
						₱384,544,000, and ₱60,000,000 across a learning programme and a forum with the
						Philippine Congress.{' '}
						<Link href='/acts/85' className='rule-link'>
							The full budget record is here
						</Link>
						.
					</Point>
				</Block>

				<Block
					id='allowances'
					label='Allowances and benefits'
					title='What comes with the seat, on top.'
					lead='Set by the General Provisions of each year&rsquo;s budget rather than by the rulebook, which means they are re-enacted &mdash; and can change &mdash; every December.'
				>
					<div className='mb-8'>
						<Figure value='₱25,000' label='Monthly, representation and transportation'>
							₱12,500 a month for each, payable only while actually performing the functions of the
							office &mdash; ₱300,000 a year if drawn in full. Transportation allowance is not
							granted to an official who is assigned and actively using a government vehicle.
						</Figure>
						<Figure value='₱108,000' label='Yearly, extraordinary expenses'>
							Plus up to ₱90,000 a year in miscellaneous expenses for the office. Neither may be
							spent on salaries, allowances, or confidential and intelligence expenses.
						</Figure>
						<Figure value='₱2,000' label='Monthly, PERA'>
							The Personnel Economic Relief Allowance, granted to every government employee from a
							member of Parliament down. Unchanged since the region&rsquo;s first budget in 2020.
						</Figure>
						<Figure value='2 months' label='Bonuses'>
							A mid-year bonus of one month&rsquo;s basic salary and a year-end bonus of another,
							plus a ₱5,000 cash gift.
						</Figure>
						<Figure value='₱14,000' label='Yearly, clothing and medical'>
							Up to ₱7,000 a year for uniform or clothing, and up to ₱7,000 a year toward an
							HMO-type medical benefit.
						</Figure>
					</div>

					<Point
						title='All of it is voted every year'
						cite='BAA 85, General Provisions, Sections 38, 43, 44, 45, 49, 50 and 51'
					>
						None of these rates sit in permanent law. They are written into the General Provisions
						of each annual General Appropriations Act, which the Parliament passes for itself. The
						representation and transportation rates rose in the FY 2024 budget &mdash; a
						member&rsquo;s from ₱11,000 to ₱12,500 a month &mdash; and the clothing allowance from
						₱6,000 to ₱7,000 a year. PERA and the ₱5,000 floor under any employee&rsquo;s monthly
						net take-home pay have not moved since 2020.
					</Point>
				</Block>

				<Block
					id='limits'
					label='What they may not do'
					title='The bars are on money, and they bite during the term.'
					lead='The Code of Conduct in the rulebook is more specific than the general conflict-of-interest rule, and most of it is about not profiting from the seat.'
				>
					<Point
						title='A member with money at stake takes no part at all'
						cite='Rules, Rule II, Section 1(f)'
					>
						The right to vote stops where a conflict of interest or a financial interest in the
						measure begins &mdash; and the rule does not merely bar the vote. The member must
						inhibit from participating in the proceedings.
					</Point>
					<Point
						title='No appearing as counsel, no government contracts'
						cite='Rules, Rule XXVIII, Section 3(e)'
					>
						A member may not personally appear as counsel before any court, electoral tribunal, or
						quasi-judicial or administrative body, and may not be directly or indirectly financially
						interested in any contract, franchise or special privilege granted by government or a
						government corporation, for the whole of their term.
					</Point>
					<Point
						title='And no taking the office they just created'
						cite='Rules, Rule XXVIII, Section 3(d), (g)'
					>
						A member may not be appointed to an office created &mdash; or whose emoluments were
						increased &mdash; during their term. If a law or resolution they authored particularly
						favours a business they hold an interest in, keeping that interest more than 30 days
						after it passes is unlawful.
					</Point>
					<Point title='The Parliament disciplines its own' cite='Rules, Rule XXVIII, Section 1'>
						A majority can reprimand or censure a member, or have them removed from the plenary. For
						grave disorderly behaviour, two thirds of all members can suspend one for up to 30 days.
						No court or outside body is involved.
					</Point>
				</Block>

				<Block
					id='holding-them-to-it'
					label='Holding them to it'
					title='The duty to publish is the one with a handle on it.'
					lead='Most of the eleven duties are enforceable only inside the chamber. One of them points outward, and this registry exists partly to make it checkable.'
				>
					<Point title='Start with what they have filed' cite='Rules, Rule II, Section 2(a), (g)'>
						The first duty is to prepare and introduce measures, and the seventh is to make that
						work public. Both are checkable against the record:{' '}
						<Link href='/members' className='rule-link'>
							every member&rsquo;s profile
						</Link>{' '}
						lists the measures they are credited on as principal author or co-author, and{' '}
						<Link href='/committees' className='rule-link'>
							every committee
						</Link>{' '}
						lists what was referred to it.
					</Point>
					<Point
						title='The committee stage is where an outsider fits'
						cite='Rules, Rules XIII and XIV'
					>
						Writing to a member about a measure already on the floor is usually too late. The
						committee stage is the only point the rules imagine an outsider taking part &mdash; and
						a committee may consult, but is not obliged to.{' '}
						<Link href='/how-parliament-works' className='rule-link'>
							Where you come in is set out here
						</Link>
						.
					</Point>
					<Point title='What is not on this page' cite='Rules, AR 268'>
						The rulebook does not set qualifications, a term length, or a removal procedure for
						members &mdash; those sit in the Organic Law, whose published copy is a scanned image
						this registry has not read line by line. Nor is there any published record of a
						member&rsquo;s attendance: the Journal covers sittings up to March 2023 only. Where the
						record does not exist, this registry says so rather than filling it in.
					</Point>
				</Block>

				<Reveal>
					<section id='sources' className='scroll-mt-32 py-14'>
						<p className='label label-strong'>Read the originals</p>
						<div className='mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm'>
							<Source href={SOURCES.rules}>
								Rules, Procedures, and Practices of the BTA Parliament
							</Source>
							<Source href={SOURCES.rulesPdf}>Full rulebook (PDF)</Source>
							<Source href={SOURCES.organicLaw}>Organic Law (RA 11054)</Source>
							<Link href='/acts/85' className='rule-link'>
								FY 2026 budget (BAA 85)
							</Link>
						</div>
						<p className='mt-5 max-w-3xl text-[13px] leading-6 text-[var(--ink-3)]'>
							Duties, rights and discipline are quoted from AR 268, the rulebook as of 14 March
							2023. Every peso figure is read from the enacted General Appropriations Act of the
							Bangsamoro for FY 2026, with the FY 2025 act for the year-on-year comparison &mdash;
							the Staffing Summary for the per-post provisions, the General Provisions for the
							allowances. Where this page and those documents differ, they are right: each point
							above names the one it came from.
						</p>
					</section>
				</Reveal>
			</ReadingColumn>
		</>
	)
}
