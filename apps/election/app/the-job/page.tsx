import type { Metadata } from 'next'
import Link from 'next/link'
import { Rise, SectionHead } from '@betterbarmm/editorial'
import { ElectionShell } from '../_components/election-shell'
import { Masthead } from '../_components/masthead'
import { getElectionViewModel } from '../_lib/election-data'

export const metadata: Metadata = {
	title: 'What the job is — BetterBARMM Election',
	description:
		'What a member of the Bangsamoro Parliament is elected to do: the work, the duties the rulebook sets, what a member may not do, and what the ballot does not decide.',
}

const REGISTRY = 'https://legislation.betterbarmm.com'
const ORGANIC_LAW = 'https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/92699'

/* ============================================================
   What the job is

   The workspace can say who is standing and how the seats are filled, and a
   reader can still finish it without knowing what the person they are voting
   for will actually do. That is the question underneath the whole exercise,
   and it was the one page missing.

   Every claim here is one the registry already carries, with the citation it
   carries it under — the rulebook is Parliament's own, and this page reads it
   in a voter's terms rather than a lawyer's. What it deliberately does not do
   is restate the rulebook: the registry has a page that goes through all
   thirty-four rules, and a second copy of it here would be two accounts of one
   document, drifting apart the first time either is edited. Each point links
   to its own section over there instead.
   ============================================================ */

/**
 * One duty or limit: what the rule says, what it means for you, and where it
 * is written.
 *
 * Three across rather than stacked down the page. Each of these is a discrete
 * fact about the office — they are not an argument that builds, and read as a
 * column of full-width rows the page asked to be worked through in order when
 * what a reader actually does is scan for the one that answers their question.
 * In a grid they can be taken in any order, which is how a reference is used.
 *
 * The `means` line is the part that makes this page worth having. A rule
 * citation tells you the duty exists; it does not tell you what to do with it,
 * and "a member must publish their legislative work" and "you may ask a member
 * for their record and they owe you an answer" are the same rule read from two
 * ends. The second is the one a voter needs.
 */
function Point({
	title,
	cite,
	href,
	means,
	children,
}: {
	title: string
	cite: string
	/** The registry section that carries the full treatment. */
	href?: string
	/** What the rule gives a reader to do — the duty read from their end. */
	means?: string
	children: React.ReactNode
}) {
	return (
		<Rise distance={14}>
			<div className='flex h-full flex-col border-t border-[var(--rule)] pt-6'>
				<h3 className='text-[18px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
					{title}
				</h3>
				<p className='mt-3 text-[15px] leading-[1.6] text-[var(--ink-2)]'>{children}</p>

				{means ? (
					<p className='mt-4 border-l-2 border-[var(--brass-line)] pl-3.5 text-[14px] leading-[1.55] text-[var(--ink-3)]'>
						<span className='font-semibold text-[var(--ink-2)]'>What that gives you: </span>
						{means}
					</p>
				) : null}

				<p className='mt-auto pt-5 font-mono text-[10px] font-semibold uppercase leading-5 tracking-[0.14em] text-[var(--ink-3)]'>
					{href ? (
						<a href={href} target='_blank' rel='noreferrer' className='rule-link'>
							{cite}
						</a>
					) : (
						cite
					)}
				</p>
			</div>
		</Rise>
	)
}

export default function TheJobPage() {
	const { metadata: meta, stats } = getElectionViewModel()

	return (
		<ElectionShell>
			<Masthead
				label='What the job is'
				lines={['You are electing', 'a legislator.']}
				muted={[1]}
				standfirst={`On ${meta.electionDay} the region fills ${stats.totalSeats} seats. This is the job in one of them: the work itself, where the work happens, what a member owes the people who elected them, and what the office does not carry — each point as Parliament's own rulebook and the Organic Law put it.`}
			/>

			{/* ---- The work ---- */}
			{/* One account in four parts, so the steps between them are the same
			    value and a short one. A full section rhythm is for a change of
			    subject; these are four answers to the same question, and at that
			    distance the page read as four pages a reader had to keep starting
			    again. The rhythm stays where it belongs: above the first and below
			    the last. */}
			<section className='bb-container bb-section-top pb-0'>
				<SectionHead
					index='01'
					eyebrow='The work'
					title='They write the law,'
					titleMuted='and they choose the government.'
					lead='A member of Parliament has two jobs at once, and only the first is obvious from the ballot paper.'
					size='sm'
				/>

				<div className='grid gap-x-10 gap-y-10 lg:grid-cols-3'>
					<Point
						title='They legislate for the region'
						cite='RA 11054, the Organic Law, Article VII'
						href={ORGANIC_LAW}
						means='Anything the region governs — health, schools, local government, the budget — is decided by people on this ballot rather than in Manila. A vote here is a vote on regional law.'
					>
						The Bangsamoro Parliament makes the region&rsquo;s own laws — the autonomy acts that
						create ministries and hospitals, set the budget, and govern everything the region has
						power over. Every measure a member files, and the stage it has reached, is a matter of
						public record.
					</Point>

					<Point
						title='They elect the Chief Minister between them'
						cite='RA 11054, Article VII, Sections 30–35'
						href={ORGANIC_LAW}
						means='Your two marks are, between them, a vote on who leads the region. Reading a party’s bloc matters as much as reading the candidate — a seat is also a vote for a chief minister you never see on the paper.'
					>
						Nobody votes for a chief minister on the ballot. The {stats.totalSeats} members elected
						across all three tracks do that themselves, on the first day of session, and a
						candidate needs {stats.majorityThreshold} of the {stats.totalSeats} votes — a majority
						of all members, not of those present. That is why the party vote and the district vote
						end up being one question: which bloc can reach {stats.majorityThreshold}.
					</Point>

					<Point
						title='They pass the budget the region runs on'
						cite='BAA 85 — the FY 2026 appropriations'
						href={`${REGISTRY}/acts/85`}
						means='The appropriations act is public and searchable. Every ministry’s allocation, and the 5% of each one committed to gender and development, is a line you can look up rather than a figure you have to take on trust.'
					>
						Nothing the regional government spends is spent without Parliament passing it into law
						first. The annual General Appropriations Act is an autonomy act like any other — filed,
						read three times, voted on by name — and it is the single measure that decides what
						every ministry in the region can do that year.
					</Point>
				</div>
			</section>

			{/* ---- Where the work happens ---- */}
			<section className='bb-container pt-20 lg:pt-32'>
				<SectionHead
					index='02'
					eyebrow='Where the work happens'
					title='Eight afternoons a month'
					titleMuted='on the floor. The rest is committees.'
					lead='The chamber is the smaller half of the job. Most of what a member actually does happens in the weeks Parliament is not sitting at all.'
					size='sm'
				/>

				<div className='grid gap-x-10 gap-y-10 lg:grid-cols-3'>
					<Point
						title='The floor sits two weeks in four'
						cite='Rules, Rule VI, Section 4'
						href={`${REGISTRY}/how-parliament-works#the-calendar`}
						means='A member’s diary is mostly not plenary. If you are trying to reach one, the fortnight the chamber is dark is when they are likeliest to be reachable.'
					>
						Plenary sittings run Monday to Thursday of the third and fourth week only, starting at
						one in the afternoon. That is eight afternoons a month on the floor of the chamber —
						everything else in the month happens somewhere other than the plenary.
					</Point>

					<Point
						title='Committees are where a bill is actually worked on'
						cite='Rules, Rules XIII and XIV'
						href={`${REGISTRY}/how-parliament-works#committees`}
						means='This is the one stage the rules open to people outside Parliament. Parliament publishes a call for position papers and its committee schedules — a bill is easier to change here than anywhere else.'
					>
						The rules provide for committee meetings, hearings and public consultations, and require
						members to attend them — in person or by sending a representative. A measure is studied,
						amended and reported out here long before it reaches a vote.
					</Point>

					<Point
						title='They question the cabinet directly'
						cite='Rules, Rules X and XI'
						href={`${REGISTRY}/how-parliament-works#the-sitting`}
						means='Scrutiny of the government is part of the job, not an extra. A member who never asks anything is not doing half of it.'
					>
						Question Hour and the Chief Minister&rsquo;s Hour both fall on a first Wednesday — a
						week the chamber is not otherwise sitting. Members write the questions and send them
						through the Secretary-General; it is members holding the executive to account rather
						than a public hearing.
					</Point>
				</div>
			</section>

			{/* ---- What they owe you ---- */}
			<section className='bb-container pt-20 lg:pt-32'>
				<SectionHead
					index='03'
					eyebrow='What they owe you'
					title='The duties are written'
					titleMuted='down, and two are yours.'
					lead='Parliament wrote its own rulebook and listed what a member owes the people who elected them. Two of those duties are ones you can hold a member to by name.'
					size='sm'
				/>

				<div className='grid gap-x-10 gap-y-10 lg:grid-cols-3'>
					<Point
						title='They must carry your demands into the chamber'
						cite='Rules, Rule II, Section 2(e)'
						href={`${REGISTRY}/how-parliament-works#duties`}
						means='You can put a demand to your member and ask them to carry it, and point at the rule when you do. It is their job, not a favour.'
					>
						A member has to put forward the demands and interests of the people they represent — and
						of anyone else a bill in front of them affects. It is a duty of the office rather than a
						courtesy, which is what makes it something to ask for rather than to hope for.
					</Point>

					<Point
						title='They must make their legislative work public'
						cite='Rules, Rule II, Section 2(g)'
						href={`${REGISTRY}/how-parliament-works#duties`}
						means='You may ask any member what they have filed and expect an answer — and you can check it against the register before you ask.'
					>
						Information about what a member does in Parliament is theirs to publish, not yours to
						extract. This registry exists partly because that duty is easier to state than to keep:{' '}
						<a href={`${REGISTRY}/members`} className='rule-link'>
							every member is listed
						</a>{' '}
						with the measures they have filed and co-authored.
					</Point>

					<Point
						title='Their vote on a measure is recorded by name'
						cite='Rules, Rule XXVII, Section 2'
						href={`${REGISTRY}/how-parliament-works#voting-and-the-record`}
						means='For a measure that reached a final vote, how a member voted is knowable. Ask for it by measure and by name.'
					>
						On the final reading of a measure the vote is taken name by name and written down in
						full. It is the one point in the process where a member&rsquo;s position on a law is on
						the record as theirs.
					</Point>
				</div>
			</section>

			{/* ---- What they may not do ---- */}
			<section className='bb-container pt-20 lg:pt-32'>
				<SectionHead
					index='04'
					eyebrow='What the seat does not carry'
					title='The office has limits'
					titleMuted='as well as powers.'
					lead='A seat in Parliament is not a shield, and the chamber can discipline its own without anyone outside being involved.'
					size='sm'
				/>

				<div className='grid gap-x-10 gap-y-10 lg:grid-cols-3'>
					<Point
						title='A member with money at stake stays out of it'
						cite='Rules, Rule II, Section 1(f)'
						href={`${REGISTRY}/how-parliament-works#members`}
						means='A member’s business interests are a fair question to put to a candidate now, while they are asking for the seat rather than sitting in it.'
					>
						Members can vote on anything except a measure they have a conflict of interest in. The
						bar is on the member to observe, which is why the register of who filed what is worth
						keeping.
					</Point>

					<Point
						title='They can still be arrested'
						cite='Rules, Rule II, Section 3'
						href={`${REGISTRY}/how-parliament-works#members`}
						means='A seat is not a defence against a case. Nothing about winning one settles a charge that predates it.'
					>
						The immunity a member carries is narrower than the word suggests. It does not put them
						beyond the reach of the law.
					</Point>

					<Point
						title='Parliament can censure or suspend one of its own'
						cite='Rules, Rule XXVIII, Section 1'
						href={`${REGISTRY}/how-parliament-works#members`}
						means='Complaints about a member’s conduct in the chamber are settled inside the chamber. Knowing that saves writing to a body with no part in it.'
					>
						Discipline is internal: the chamber can censure a member, or suspend one, and no outside
						body is part of that decision.
					</Point>
				</div>
			</section>

			{/* ---- The closing note, on the section above ---- */}
			<section className='bb-container bb-section-bottom pt-20 lg:pt-32'>
				<Rise delay={0.1} distance={12}>
					{/* The note on one side of the rule, the ways on at the other. They
					    answer different questions — where this came from, and where to go
					    next — and stacked they read as one block ending in two buttons.
					    Set opposite each other the page closes on both at once. */}
					<div className='mt-12 flex flex-col gap-8 border-t border-[var(--brass-line)] pt-7 lg:flex-row lg:items-start lg:justify-between lg:gap-16'>
						<p className='max-w-[42rem] text-[16px] leading-[1.6] text-[var(--ink-3)]'>
							Every point on this page is drawn from Parliament&rsquo;s own rulebook and the
							Organic Law, under the citation printed beneath it. The registry goes through all
							thirty-four rules in full — this page is the part a voter needs before September.
						</p>
						<div className='flex shrink-0 flex-wrap gap-3 lg:justify-end'>
							<a
								href={`${REGISTRY}/how-parliament-works`}
								target='_blank'
								rel='noreferrer'
								className='bb-btn bb-btn-solid'
							>
								How Parliament works
							</a>
							<Link href='/candidates' className='bb-btn bb-btn-ghost'>
								Who is standing
							</Link>
						</div>
					</div>
				</Rise>
			</section>
		</ElectionShell>
	)
}
