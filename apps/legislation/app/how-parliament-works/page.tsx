import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '../_components/page-header'
import { SittingCalendar, VoteComparison } from '../_components/parliament-diagrams'
import { Block, Point, Source } from '../_components/explainer'
import { MemberSections } from '../_components/member-sections'
import { ProcessSections } from '../_components/process-sections'
import { ReadingColumn } from '../_components/reading-column'
import { Reveal } from '../_components/reveal'
import type { TocItem } from '../_components/table-of-contents'

export const metadata: Metadata = {
	title: 'How Parliament works',
	description:
		'Plain answers about the Bangsamoro Parliament: what it can and cannot do, how a bill becomes law, what a member is paid and barred from, how it votes, what gets written down, and where an ordinary person can actually take part.',
}

/* ============================================================
   How Parliament works

   Parliament publishes two documents about itself: a rulebook of thirty-four
   rules, and a legislative process written as citations into it. Both are
   precise and neither is readable.

   This page was two — one on powers and limits, one walking the rulebook —
   and they restated each other. Question Hour, the narrow arrest immunity,
   the conflict-of-interest bar, the Journal's nominal-voting rule, the three
   languages, and censure and suspension all appeared on both, in different
   words, which left a reader unsure whether they were two rules or one.

   They are one page now, and it opens with the questions people actually
   arrive with rather than with the constitutional position. The order after
   that is: what this body is, what stops it, how a sitting runs, when it
   answers, what a committee can compel, what gets written down, what binds a
   member, where an outsider fits — then the vocabulary, then the sources.

   House style on jargon: say the plain thing first and name the term second,
   never the reverse. "A vote taken name by name — nominal voting, in the
   rules" reads; "nominal voting, that is, a vote taken name by name" does
   not. Terms that survive that treatment are collected in the glossary.

   Rewritten once more for plainness. The first version cleared the rulebook's
   vocabulary but kept its sentence shapes — long, hedged, several clauses
   deep — so it read like a careful summary of a legal document rather than
   like someone explaining it. This version says one thing per sentence,
   addresses the reader directly, and puts the consequence before the
   mechanism: what it means for you first, how it works second. Nothing was
   dropped to get there and every citation is unchanged, because the point of
   the page is that a reader can check it.

   The section that matters most is the one on voting: the rules require the
   Journal to record "all nominal voting" in full, which is why a named vote
   can be shown for seven measures and no others.
   ============================================================ */

const SOURCES = {
	rules:
		'https://parliament.bangsamoro.gov.ph/rules-procedures-and-practices-of-the-bta-parliament/',
	rulesPdf:
		'https://parliament.bangsamoro.gov.ph/wp-content/uploads/2023/03/AR-268-House-Rules-as-of-March-14-2023-4.36-PM-FONTSIZE-12-WITH-SIGN.pdf',
	process: 'https://parliament.bangsamoro.gov.ph/legislative-process-bill/',
	organicLaw: 'https://www.officialgazette.gov.ph/downloads/2018/07jul/20180727-RA-11054-RRD.pdf',
	positionPapers: 'https://parliament.bangsamoro.gov.ph/position-papers/',
	schedules: 'https://parliament.bangsamoro.gov.ph/schedules/',
}

function Term({ term, children }: { term: string; children: React.ReactNode }) {
	return (
		<div className='border-t border-[var(--rule-soft)] py-5 first:border-t-0 first:pt-0'>
			<dt className='item-title text-[var(--ink)]'>{term}</dt>
			<dd className='copy mt-1.5 text-[var(--ink-2)]'>{children}</dd>
		</div>
	)
}

/* The page's sections, in the order they appear, and the index in the margin
   beside them. Kept in one place so the two cannot drift apart. */
const SECTIONS: TocItem[] = [
	{ id: 'what-it-is', label: 'What it is' },
	{ id: 'limits', label: 'What holds it back' },
	{ id: 'the-sitting', label: 'The sitting' },
	{ id: 'the-calendar', label: 'The calendar' },
	{ id: 'committees', label: 'Committees' },
	{ id: 'the-bill-path', label: 'How a bill becomes law' },
	{ id: 'resolutions', label: 'Resolutions' },
	{ id: 'bill-or-resolution', label: 'Bill or resolution' },
	{ id: 'voting-and-the-record', label: 'Voting and the record' },
	{ id: 'members', label: 'Rules on members' },
	{ id: 'the-job', label: 'The job' },
	{ id: 'duties', label: 'What they must do' },
	{ id: 'pay', label: 'What a seat costs' },
	{ id: 'allowances', label: 'Allowances' },
	{ id: 'member-limits', label: 'What they may not do' },
	{ id: 'holding-them-to-it', label: 'Holding them to it' },
	{ id: 'where-you-come-in', label: 'Where you come in' },
	{ id: 'glossary', label: 'The words they use' },
	{ id: 'sources', label: 'Read the originals' },
]

export default function HowParliamentWorksPage() {
	return (
		<>
			<PageHeader
				emphasis='brand'
				align='left'
				size='compact'
				eyebrow='Powers, limits, and the rulebook'
				title='What this Parliament can actually do.'
				titleMuted='And the rules it does it by.'
				description='Nobody has voted for the people in it yet. It writes the region&rsquo;s laws and runs the region at the same time. And it follows a rulebook it wrote for itself &mdash; 34 rules, public, and very hard to read. Everything about the chamber is on this one page: what it can do, how a measure moves through it, what a seat costs, and where you fit. Ordinary words throughout, with the rule or the section named on every point so you can check it.'
			/>

			<ReadingColumn sections={SECTIONS}>
				<Block
					id='what-it-is'
					label='What it is'
					title='What this Parliament is'
					lead='Nobody voted for it, and it does two jobs at once. Until the first election, the same people both write the laws and run the government.'
				>
					<Point
						title='Nobody elected it — yet'
						cite='Organic Law (RA 11054), Article XVI, Section 3'
					>
						The 80 people in the Bangsamoro Transition Authority were appointed. Nobody voted for
						any of them. The Organic Law &mdash; the national law that created the Bangsamoro region
						&mdash; hands them two jobs at once: writing the region&rsquo;s laws, and running it.
						The President appoints the interim Chief Minister who leads the running of it. All of
						this ends at the first election under the Bangsamoro Electoral Code. Until that happens,
						everyone in Parliament got their seat by appointment.
					</Point>
					<Point title='It wrote its own rulebook' cite='Organic Law, Article VII, Section 25'>
						Parliament is allowed to decide how it runs itself, and it did. It voted in a rulebook
						and revised it for this second BTA. Almost everything on this page comes from that
						rulebook, or from the Organic Law that sits above it.
					</Point>
					<Point title='A decision made once is meant to stick' cite='Rules, Rule XXXI'>
						When the Speaker settles a question about how a rule works, that answer is supposed to
						hold. Next time the same question comes up it is not argued again from scratch. The
						rulebook uses the Latin name for this, <em>stare decisis</em>. What it means for you:
						how a sitting runs is partly written down, and partly built up out of past decisions you
						will not find in any document.
					</Point>
				</Block>

				<Block
					id='limits'
					label='What holds it back'
					title='What it cannot do'
					lead='Three limits. Two come from outside Parliament. The third is a law it is not allowed to touch.'
				>
					<Point title='Manila gets told, not asked' cite='Organic Law, Article VII, Section 25(d)'>
						Within ten working days of passing a law or a resolution, the Speaker has to send a
						signed copy to the President and to Congress. That is all it is: telling them.
						Parliament does not need Manila&rsquo;s permission to pass something.
					</Point>
					<Point
						title='If the Chief Minister does nothing for 30 days, the bill still becomes law'
						cite='Legislative process, signatories'
					>
						Once Parliament passes a bill it goes to the Chief Minister, who has 30 days to sign it.
						If the 30 days run out and nothing has been signed, it becomes law anyway. Ignoring a
						bill does not kill it here. Waiting helps the bill.
					</Point>
					<Point
						title='It can rewrite its own rules, but not the law above them'
						cite='Rules, Rule XXXIII'
					>
						More than half of all members can change any rule in the rulebook, on a proposal from
						the Speaker, from any member, or from the Committee on Rules. The exception is anything
						the Organic Law fixed &mdash; that is out of reach. So most of what is on this page
						could be rewritten next month. The parts that come from the Organic Law could not.
					</Point>
				</Block>

				<Block
					id='the-sitting'
					label='The sitting'
					title='Who runs a sitting'
					lead='A sitting is not a free-for-all. A handful of people decide who gets to speak, about what, and when.'
				>
					<Point
						title='The Speaker is chosen in the open, and you can look up who voted how'
						cite='Rules, Rule III'
					>
						The Wali &mdash; the region&rsquo;s ceremonial head &mdash; opens the first session by
						striking the agong. Members then choose a Speaker. They stand up to be counted rather
						than writing anything down, and nobody has to explain their choice. Each member&rsquo;s
						vote goes into the written record. That makes it one of the very few votes you can look
						up name by name.
					</Point>
					<Point
						title='One member decides what gets discussed'
						cite='Rules, Rule IV, and the legislative process'
					>
						The Majority Floor Leader puts bills on the agenda for their readings and sets the
						speaking order from written requests. This is a bigger power than it sounds. A bill that
						never gets scheduled never moves, and no reason has to be given for leaving it off.
					</Point>
					<Point
						title='Nothing can be decided unless half the members plus one are there'
						cite='Rules, Rule VII'
					>
						When the roll is called, more than half the members have to be present before anything
						can be decided &mdash; whether that is the whole Parliament sitting together or a single
						committee. A member who cannot attend in person can still be counted as present by video
						call in set cases, including illness and a permanent disability affecting mobility.
					</Point>
					<Point title='Three kinds of sitting' cite='Rules, Rule VI'>
						A regular session is the ordinary working calendar. An inaugural session opens a new
						Parliament. A special session is called outside the calendar for something particular.
					</Point>
				</Block>

				<Block
					id='the-calendar'
					label='The calendar'
					title='When Parliament meets'
					lead='Three fixed slots. Two of them exist to make the government answer questions on a schedule.'
				>
					<SittingCalendar />

					<div className='mt-12'>
						<Point title='Eight afternoons a month' cite='Rules, Rule VI, Section 4'>
							Plenary sittings run Monday to Thursday of the third and fourth week only, starting at
							one in the afternoon, unless Parliament decides otherwise. Committee hearings and
							public consultations happen outside that.
						</Point>
						<Point
							title='Question Hour, and the Chief Minister’s Hour'
							cite='Rules, Rules X and XI'
						>
							Both fall on a first Wednesday &mdash; a week Parliament is not otherwise sitting.
							Once a quarter the Chief Minister or a nominated cabinet member reports on what the
							government has done. In the other months it is Question Hour instead: one hour,
							members questioning the cabinet, with the questions sent to the Secretary-General in
							writing at least three days beforehand. Urgent ones jump the queue. This is members
							asking. It is not a way for the public to put a question.
						</Point>
						<Point title='Privilege Hour, every Thursday it sits' cite='Rules, Rule IX'>
							Up to an hour for a member to raise something affecting them personally or affecting
							Parliament as a whole. Once it starts it cannot be interrupted &mdash; except to point
							out a broken rule, or to move that the sitting end.
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
					</div>
				</Block>

				<Block
					id='committees'
					label='Committees'
					title='What committees can do'
					lead='These are the powers most people never hear about. A committee can make you show up and punish you if you refuse — and it is where a bill is really written.'
				>
					<Point title='A committee can order you to appear' cite='Rules, Rule XV'>
						Committees can investigate things to help them write a law. They can call witnesses,
						take testimony, order someone to attend, and order someone to hand over documents. The
						committee chairperson signs the order and the Speaker approves it. Inside the region the
						Sergeant-at-Arms delivers it. Outside the region, the local police do.
					</Point>
					<Point title='And can punish you for defying it' cite='Rules, Rule XVI'>
						Parliament and its committees can hold someone in contempt &mdash; which the rules
						define as defying their authority, or getting in the way of their work.
					</Point>
					<Point
						title='This is where a bill is really written'
						cite='Legislative process, committee stage'
					>
						A committee goes through a bill line by line. It can change it, or rewrite it entirely,
						before handing it back. By the time the full Parliament debates a bill, most of what it
						says was already decided here.{' '}
						<a href='#the-bill-path' className='rule-link'>
							The full path is below
						</a>
						.
					</Point>
					<Point title='Members have to turn up' cite='Rules, Rules XIII and XIV'>
						The rules provide for committee meetings, hearings and public consultations, and require
						members to attend &mdash; in person or by sending a representative.
					</Point>
				</Block>

				<ProcessSections />

				<Block
					id='voting-and-the-record'
					label='Voting and the record'
					title='How votes are recorded'
					lead='There are two kinds of vote and only one leaves names. This is the most useful thing on the page: it is why you can see how members voted on seven measures and on nothing else.'
				>
					<VoteComparison />

					<Point
						title='The final vote is read out name by name'
						cite='Legislative process, final stage'
					>
						At the last stage nothing more can be changed. Printed copies must have been with
						members for three days &mdash; unless the Chief Minister marks the bill urgent, which
						cancels the wait. Then the Speaker calls the roll, and each member answers to their own
						name. Anyone abstaining has to say so out loud, and does not have to say why.
					</Point>
					<Point
						title='Named votes have to be written down in full'
						cite='Rules, Rule XXVII, Section 2'
					>
						The Journal is Parliament&rsquo;s official record of a sitting. The rules say it must
						record in full every vote taken name by name. Other things &mdash; messages,
						communications &mdash; can go in as a summary. That one rule is the reason this registry
						can show you{' '}
						<Link href='/journal' className='rule-link'>
							a named vote
						</Link>{' '}
						for seven measures and nothing else. Everything else was a shouted vote, so no
						member&rsquo;s position was ever written down.
					</Point>
					<Point title='Everything is kept in three languages' cite='Rules, Rule I, Section 4'>
						What gets said is recorded in the language it was said in, then translated into
						Filipino, Arabic and English. A member may speak in any language used in the Bangsamoro.
					</Point>
					<Point title='Sittings are supposed to be broadcast' cite='Rules, Rule XXIX'>
						The rules call for proceedings to be piped to members&rsquo; offices, and for audio and
						video broadcasting, recording and live streaming &mdash; including feeds to news media,
						stored recordings, and captions &mdash; under rules the Speaker issues.
					</Point>
				</Block>

				<Block
					id='members'
					label='Members'
					title='Rules that apply to members'
					lead='What protects a member, and what binds one. The protection is narrower than it sounds, and Parliament can punish its own members without anyone outside being involved.'
				>
					<Point title='They can still be arrested' cite='Rules, Rule II, Section 3'>
						A member is protected from arrest only while Parliament is sitting, and only for an
						offence carrying no more than six years in prison inside the Bangsamoro. A heavier
						charge, or any day Parliament is not sitting, and the protection is gone.
					</Point>
					<Point
						title='A member with money at stake has to stay out of it'
						cite='Rules, Rule II, Section 1(f)'
					>
						Members can vote on anything &mdash; except a measure they have a conflict of interest
						in, or stand to gain or lose money from. Then they have to stay out of the whole thing,
						not just the vote. The rules call this inhibiting.
					</Point>
					<Point
						title='Parliament can censure a member, or suspend one'
						cite='Rules, Rule XXVIII, Section 1'
					>
						A majority can formally reprimand or censure a member, or have them removed from the
						room. For serious misbehaviour, two thirds of all members can suspend one for up to 30
						days. No court or outside body is involved.
					</Point>
				</Block>

				<MemberSections />

				<Block
					id='where-you-come-in'
					label='Where you come in'
					title='How you can take part'
					lead='One stage is open to you, and it is not the floor. Knowing which one saves you writing to the wrong room, which is the most common way public input gets wasted.'
				>
					<Point
						title='The committee stage is your moment'
						cite='Legislative process, committee stage; Rules, Rules XIII and XIV'
					>
						This is the only point where the rules imagine someone from outside taking part. A
						committee looking at a bill can ask for views from experts, from ministries, from the
						public, from anyone with an interest. Parliament publishes a{' '}
						<Source href={SOURCES.positionPapers}>call for position papers</Source> and its{' '}
						<Source href={SOURCES.schedules}>committee schedules</Source>. One catch: the rules let
						a committee ask, they do not make it. A committee can send a bill onward without hearing
						from anybody.
					</Point>
					<Point title='Question Hour is not for you' cite='Rules, Rule XI, Section 2'>
						The name suggests otherwise, so it is worth saying plainly. Question Hour is members
						questioning the cabinet. Members write the questions and send them through the
						Secretary-General. There is no way in from outside.
					</Point>
					<Point
						title='Members owe you a hearing — and it is written down'
						cite='Rules, Rule II, Section 2(e), (g)'
					>
						The rulebook lists what a member must do, and two of those duties are yours to use. They
						have to put forward the demands and interests of the people they represent, and of
						anyone a bill affects. And they have to make information about their legislative work
						public. That is something you can hold a member to by name &mdash;{' '}
						<Link href='/members' className='rule-link'>
							every member is listed here
						</Link>{' '}
						with what they have filed, and{' '}
						<a href='#the-job' className='rule-link'>
							the full job description is below
						</a>
						.
					</Point>
				</Block>

				<Reveal>
					{/* The vocabulary a reader has to carry through the page. Every term
					    here is also explained where it first appears — this is the place
					    to look it up again, not the place it is first met. */}
					<section id='glossary' className='scroll-mt-32 py-14 font-sans lg:py-20'>
						<p className='eyebrow'>The words they use</p>
						<h2 className='section-title mt-4 max-w-3xl'>What the words mean</h2>
						<p className='section-lead mt-4 max-w-2xl text-[var(--ink-3)]'>
							Parliament&rsquo;s own words, in ordinary ones. These are the terms you will run into
							in the rulebook, in the Journal, and in a committee report.
						</p>

						<dl className='mt-10 max-w-4xl'>
							<Term term='Measure'>
								The catch-all word for anything Parliament takes up &mdash; a bill or a resolution.
							</Term>
							<Term term='Bill, act, resolution'>
								A bill is a proposed law. An act is a bill that made it all the way through and
								became one; here they are called Bangsamoro Autonomy Acts. A resolution is
								Parliament stating a position, and it never becomes law.
							</Term>
							<Term term='Organic Law'>
								Republic Act 11054, the national law that created the Bangsamoro region and set up
								its government. It sits above Parliament&rsquo;s own rulebook, and Parliament cannot
								change it.
							</Term>
							<Term term='Plenary'>
								The whole Parliament sitting together, as opposed to one of its committees.
							</Term>
							<Term term='Reading'>
								A stage a bill goes through on the floor. First reading announces it, second reading
								debates and changes it, third reading takes the final vote.
							</Term>
							<Term term='Viva voce'>
								A shouted vote. Members answer aloud together, so the result gets recorded and no
								names do.
							</Term>
							<Term term='Nominal voting'>
								A vote taken name by name. The rules make the Journal record these in full, which
								makes them the only votes with a public paper trail.
							</Term>
							<Term term='The Journal'>
								Parliament&rsquo;s official written record of what happened at a sitting.
							</Term>
							<Term term='Quorum'>
								How many members have to be in the room before anything can be decided. Here, more
								than half of them.
							</Term>
							<Term term='In aid of legislation'>
								The reason a committee gives for investigating something: it is gathering facts for
								a law it is working on, rather than acting as a court.
							</Term>
							<Term term='Inhibit'>
								To stay out of something entirely &mdash; what a member has to do on a measure they
								have a conflict of interest in.
							</Term>
							<Term term='Wali'>
								The ceremonial head of the Bangsamoro. Opens the first session of a new Parliament.
							</Term>
							<Term term='Government of the Day'>
								The governing side &mdash; the Chief Minister and the cabinet &mdash; as distinct
								from members who hold no government post.
							</Term>
							<Term term='IRR'>
								Implementing rules and regulations: the detailed rules issued under an act to make
								it work in practice.{' '}
								<Link href='/irr' className='rule-link'>
									The ones on record are here
								</Link>
								.
							</Term>
						</dl>
					</section>
				</Reveal>

				<Reveal>
					{/* The last entry in the index, so the sources are reachable from the
					    top of the page rather than only by scrolling to the end. */}
					<section id='sources' className='scroll-mt-32 py-14 lg:py-20'>
						<p className='label label-strong'>Read the originals</p>
						<div className='mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm'>
							<Source href={SOURCES.rules}>
								Rules, Procedures, and Practices of the BTA Parliament
							</Source>
							<Source href={SOURCES.rulesPdf}>Full rulebook (PDF)</Source>
							<Source href={SOURCES.process}>Legislative process</Source>
							<Source href={SOURCES.organicLaw}>Organic Law (RA 11054)</Source>
							<Source href={SOURCES.schedules}>Sitting schedules</Source>
							<Link href='/acts/85' className='rule-link'>
								FY 2026 budget (BAA 85)
							</Link>
						</div>
						<p className='mt-5 max-w-3xl bb-body text-[var(--ink-3)]'>
							This page puts those documents into ordinary words. It is not a replacement for them.
							It leaves out the procedural machinery &mdash; motions, points of order, how to get
							the floor &mdash; which matters to a member mid-debate and to nobody else. Where this
							page and the rules disagree, the rules are right: every point above names the one it
							came from, so you can go and check. Every peso figure is read from the enacted
							General Appropriations Act of the Bangsamoro for FY 2026 &mdash; the Staffing Summary
							for the per-post provisions, the General Provisions for the allowances. If you came
							with one specific question,{' '}
							<Link href='/questions' className='rule-link'>
								the short answers are here
							</Link>
							.
						</p>
					</section>
				</Reveal>
			</ReadingColumn>
		</>
	)
}
