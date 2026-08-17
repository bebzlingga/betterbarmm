import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '../_components/page-header'
import { ReadingColumn } from '../_components/reading-column'
import { Reveal } from '../_components/reveal'
import type { TocItem } from '../_components/table-of-contents'

export const metadata: Metadata = {
	title: 'How Parliament works',
	description:
		'Plain answers about the Bangsamoro Parliament: who its members are, what it can and cannot do, how it votes, what gets written down, and where an ordinary person can actually take part.',
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

function Source({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<a href={href} target='_blank' rel='noreferrer' className='rule-link'>
			{children}
		</a>
	)
}

/** One plain-language point, with the rule it comes from underneath. */
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
			{/* Held off the paragraph above it — the citation belongs to the point
			    but is not part of reading it. */}
			<p className='meta-sm mt-4'>{cite}</p>
		</div>
	)
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
	{ id: 'voting-and-the-record', label: 'Voting and the record' },
	{ id: 'members', label: 'Members' },
	{ id: 'where-you-come-in', label: 'Where you come in' },
	{ id: 'glossary', label: 'The words they use' },
	{ id: 'sources', label: 'Read the originals' },
]

/**
 * A section, headed the way the page itself is: the kicker in the accent and
 * the claim under it, both ranged left, so the heading shares an edge with the
 * points beneath it and with the index in the margin.
 */
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
			{/* The reading face throughout. Outfit is the interface — labels, nav,
			    the masthead — and everything below that on this page is something
			    to be read rather than looked at, so it takes DM Sans. The kicker
			    keeps Outfit: `.eyebrow` sets its own family. */}
			{/* `scroll-mt` clears the sticky header, so a jump from the index lands
			    on the kicker rather than behind the bar. */}
			<section id={id} className='scroll-mt-32 py-12 font-sans lg:py-14'>
				<p className='eyebrow'>{label}</p>
				{/* The claim keeps the display face: it is a heading to look at, not
				    reading matter, so DM Sans stops at the text beneath it. */}
				<h2 className='section-title mt-4 max-w-3xl'>{title}</h2>
				{lead ? <p className='section-lead mt-4 max-w-2xl text-[var(--ink-3)]'>{lead}</p> : null}

				<div className='mt-10 max-w-4xl'>{children}</div>
			</section>
		</Reveal>
	)
}

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
				description='The Bangsamoro Parliament is not an ordinary legislature. Nobody has voted for its members yet, it holds executive power as well as legislative power, and it runs by a rulebook it wrote for itself. That rulebook is public and almost unreadable — thirty-four rules of statutory prose. This is the same thing in ordinary words, with the rule named on every point so you can check it.'
			/>

			<ReadingColumn sections={SECTIONS}>
				<Block
					id='what-it-is'
					label='What it is'
					title='An appointed parliament, holding both kinds of power.'
					lead='Not a legislature in the usual sense. For as long as the transition lasts it runs the region as well as legislating for it, and it sets its own procedure.'
				>
					<Point
						title='Nobody elected it — yet'
						cite='Organic Law (RA 11054), Article XVI, Section 3'
					>
						The 80 members of the Bangsamoro Transition Authority were appointed, not elected. The
						Organic Law — the national law that created the Bangsamoro region and set up its
						government — puts both the power to make law and the power to govern in the BTA&rsquo;s
						hands for the transition period, with the governing side led by an interim Chief
						Minister the President appoints. The first election under the Bangsamoro Electoral Code
						ends that arrangement. Until it happens, this is a government of appointees.
					</Point>
					<Point title='It wrote its own rulebook' cite='Organic Law, Article VII, Section 25'>
						The Organic Law lets Parliament decide how it will run its own business, and Parliament
						did: it adopted the Rules, Procedures, and Practices by resolution, and revised them for
						this second BTA. Almost every point on this page comes from that document or from the
						Organic Law behind it.
					</Point>
					<Point title='A ruling made once is meant to hold' cite='Rules, Rule XXXI'>
						When the Speaker settles a question of procedure, that answer is supposed to stand the
						next time the same question comes up, rather than being argued again from scratch. The
						rulebook calls this <em>stare decisis</em> — standing by earlier decisions. It means how
						a sitting runs is partly written down and partly built up out of past rulings.
					</Point>
				</Block>

				<Block
					id='limits'
					label='What holds it back'
					title='The things it cannot do.'
					lead='Two of these come from outside the Parliament, and the third sits above its rulebook entirely.'
				>
					<Point
						title='Everything it passes goes to Manila'
						cite='Organic Law, Article VII, Section 25(d)'
					>
						Within ten working days of approving them, the Speaker must send signed copies of every
						law and resolution to the President and to the Congress of the Philippines. Read that
						correctly: it is notice, not permission. Parliament legislates for the region, and the
						national government is told what it did.
					</Point>
					<Point
						title='The Chief Minister has thirty days, and doing nothing passes the bill'
						cite='Legislative process, signatories'
					>
						A passed bill goes to the Chief Minister, who has thirty days to sign it. If those days
						run out with no signature, the bill becomes law anyway, exactly as if it had been
						signed. Sitting on a bill does not kill it here — the deadline works in the bill&rsquo;s
						favour.
					</Point>
					<Point title='The rulebook stops where the Organic Law starts' cite='Rules, Rule XXXIII'>
						Parliament can rewrite its own rules whenever a majority of all its members agrees, on a
						proposal from the Speaker, from any member, or from the Committee on Rules. Every rule
						except the ones the Organic Law fixed — those it cannot touch. So most of this page is
						Parliament&rsquo;s to change, and the parts drawn from the Organic Law are not.
					</Point>
				</Block>

				<Block
					id='the-sitting'
					label='The sitting'
					title='Who runs the room.'
					lead='A sitting is not a free-for-all. A small number of officers decide who speaks, on what, and when.'
				>
					<Point
						title='The Speaker is elected in the open, and the vote is written down'
						cite='Rules, Rule III'
					>
						The Wali — the ceremonial head of the Bangsamoro — opens the first session by sounding
						the agong. The members then elect a Speaker: they stand to be counted rather than
						writing anything down, no one has to explain their choice, and each member&rsquo;s vote
						goes into the Journal. It is one of the few votes on the record by name.
					</Point>
					<Point
						title='One member decides what gets taken up'
						cite='Rules, Rule IV, and the legislative process'
					>
						The Majority Floor Leader schedules measures for their readings, sets the speaking order
						in Privilege Hour from written requests, and goes first when the rules are to be set
						aside. Scheduling is a real power and it sits in one pair of hands: a measure that is
						never put on the agenda never moves, and nothing has to be said about why.
					</Point>
					<Point
						title='Nothing can be decided without half the members plus one'
						cite='Rules, Rule VII'
					>
						Business needs more than half the members present when the roll is called — in the full
						Parliament sitting together, which the rules call the plenary, or in a committee. A
						member who cannot be there in person can be counted as present by teleconference in
						defined cases, including illness and a permanent disability affecting mobility.
					</Point>
					<Point title='Three kinds of session' cite='Rules, Rule VI'>
						A regular session is the ordinary working calendar; an inaugural session opens a new
						Parliament; a special session is called outside the calendar for particular business.
					</Point>
				</Block>

				<Block
					id='the-calendar'
					label='The calendar'
					title='When it meets, and when it answers.'
					lead='Three fixed hours in the rulebook. Two of them exist to make the executive answer questions on a schedule.'
				>
					<Point title='Chief Minister’s Hour — once a quarter' cite='Rules, Rule X'>
						The Chief Minister opens each regular session with a speech on the government&rsquo;s
						direction. Then, on the first Wednesday of every quarter, the Chief Minister or a
						nominated cabinet member reports to Parliament on what the government has done and where
						things stand.
					</Point>
					<Point title='Question Hour — once a month, and in writing' cite='Rules, Rule XI'>
						For sixty minutes on the first Wednesday of a month with no Chief Minister&rsquo;s Hour,
						members put questions to cabinet members about their policies, programmes, and projects.
						Questions go to the Secretary-General in writing at least three days beforehand, and
						urgent ones jump the queue. It is Parliament&rsquo;s standing appointment with the
						executive — and it is members asking, not the public.
					</Point>
					<Point title='Privilege Hour — once a week' cite='Rules, Rule IX'>
						Up to sixty minutes every Thursday of a regular session, when a member may raise a
						matter affecting them personally or affecting the Parliament as a body. Once it starts
						it cannot be interrupted, except to raise a point of order or to move that the sitting
						end.
					</Point>
				</Block>

				<Block
					id='committees'
					label='Committees'
					title='The powers most people never hear about.'
					lead='A committee can make you turn up and punish you if you refuse. It is also the stage where a measure is actually written.'
				>
					<Point title='A committee can order you to appear' cite='Rules, Rule XV'>
						Committees can hold investigations to inform the laws they are writing, call witnesses,
						take testimony, and issue a subpoena — an order to attend — or a{' '}
						<em>subpoena duces tecum</em>, an order to hand over documents. The committee
						chairperson signs it and the Speaker approves it. Inside the region the Sergeant-at-Arms
						delivers it; outside, the local police do, at the Secretary-General&rsquo;s request.
					</Point>
					<Point title='And can punish you for defying it' cite='Rules, Rule XVI'>
						Parliament and its committees can hold a person in contempt. The rules define that as
						behaviour defying the authority and dignity of the Parliament or a committee, or getting
						in the way of their work.
					</Point>
					<Point
						title='This is where a bill is really written'
						cite='Legislative process, committee stage'
					>
						A committee goes through a bill line by line and can propose changes — or a rewrite —
						before it reports back. By the time the full Parliament debates it, the shape of the
						thing was decided here.{' '}
						<Link href='/legislative-process' className='rule-link'>
							The full path is here
						</Link>
						.
					</Point>
					<Point title='Members have to turn up' cite='Rules, Rules XIII and XIV'>
						The rules provide for committee meetings, hearings, and public consultations, and
						require members to attend — in person or through a representative.
					</Point>
				</Block>

				<Block
					id='voting-and-the-record'
					label='Voting and the record'
					title='Two kinds of vote, and only one leaves names.'
					lead='This is the most useful thing on the page. It explains why you can see how members voted on a handful of measures and on nothing else.'
				>
					<Point
						title='Most votes are shouted, not counted'
						cite='Legislative process, approval on second reading'
					>
						A bill is approved on second reading by <em>viva voce</em> — a voice vote. Members
						answer aloud, together, rather than one at a time, so what goes on the record is the
						outcome and not who was on which side. Most of what Parliament passes is passed this
						way.
					</Point>
					<Point
						title='The final vote is called name by name'
						cite='Legislative process, final stage'
					>
						At the last stage nothing can be amended, printed copies must have been in
						members&rsquo; hands for three days — unless the Chief Minister certifies the bill as
						urgent, which cancels that wait — and the Speaker calls the roll. Each member answers by
						name, and anyone abstaining has to say so out loud, without having to give a reason.
					</Point>
					<Point
						title='Named votes must be written down in full'
						cite='Rules, Rule XXVII, Section 2'
					>
						The Journal — Parliament&rsquo;s official record of a sitting — must carry in full the
						proclamation convening Parliament, the titles of measures presented, and every vote
						taken name by name, which the rules call <em>nominal voting</em>. Messages and
						communications go in summarised. That single rule is the reason this registry can show{' '}
						<Link href='/journal' className='rule-link'>
							a named vote
						</Link>{' '}
						for seven measures and no others: everything else went through on a voice vote, so no
						member&rsquo;s position was ever written down.
					</Point>
					<Point title='Proceedings are kept in three languages' cite='Rules, Rule I, Section 4'>
						What is said is recorded, in writing or electronically, in the language it was said in,
						and translated into Filipino, Arabic, and English. A member may speak in any language
						used in the Bangsamoro.
					</Point>
					<Point title='Sittings are meant to be broadcast' cite='Rules, Rule XXIX'>
						The rules call for floor proceedings to be piped to members&rsquo; offices, and for
						audio and video broadcasting, recording, and live streaming — including feeds to news
						media, storage of the recordings, and closed captioning — under rules the Speaker
						issues.
					</Point>
				</Block>

				<Block
					id='members'
					label='Members'
					title='What protects a member, and what binds one.'
					lead='The protections are narrower than they sound, and the Parliament can discipline its own without anyone outside being involved.'
				>
					<Point title='They can still be arrested' cite='Rules, Rule II, Section 3'>
						A member cannot be arrested only while Parliament is in session, and only for an offence
						carrying no more than six years&rsquo; imprisonment within the Bangsamoro&rsquo;s
						jurisdiction. A heavier charge, or any day the Parliament is not sitting, and the
						protection does not apply.
					</Point>
					<Point
						title='A member with money at stake must step aside'
						cite='Rules, Rule II, Section 1(f)'
					>
						Members have the right to vote — except on a measure where they hold a conflict of
						interest or stand to gain or lose financially. In that case they must take no part in
						the proceedings at all. The rules call this inhibiting.
					</Point>
					<Point title='Parliament can censure a member, or suspend one' cite='Rules, Rule XXVIII'>
						A majority of all members can formally censure or reprimand a member. Two thirds can
						suspend one, for up to six months. No court or outside body is involved.
					</Point>
				</Block>

				<Block
					id='where-you-come-in'
					label='Where you come in'
					title='One stage is open, and it is not the floor.'
					lead='Knowing which stage saves the effort of writing to the wrong room — the most common way public input gets wasted.'
				>
					<Point
						title='Committees can invite the public, and that is the moment'
						cite='Legislative process, committee stage; Rules, Rules XIII and XIV'
					>
						The committee stage is the only point where the rules imagine an outsider taking part: a
						committee looking at a measure may consult and ask for views from experts, ministries,
						the public, and anyone else with an interest. Parliament publishes a{' '}
						<Source href={SOURCES.positionPapers}>call for position papers</Source> and its{' '}
						<Source href={SOURCES.schedules}>committee schedules</Source>. Be aware of the limit:
						the rules let a committee consult, they do not make it, so a committee can report a
						measure out without hearing from anyone.
					</Point>
					<Point title='Question Hour is not for you' cite='Rules, Rule XI, Section 2'>
						Worth saying plainly, because the name suggests otherwise. Question Hour is members
						questioning the Cabinet. The questions are submitted by members, in writing, through the
						Secretary-General. It is not a channel into the Parliament from outside.
					</Point>
					<Point
						title='Members owe their constituents a hearing'
						cite='Rules, Rule II, Section 2(e), (g)'
					>
						The rulebook lists a member&rsquo;s duties, and two of them are yours to use: to
						faithfully put forward the demands and interests of the people they represent and of
						anyone a measure affects, and to make information about their legislative work available
						to the public. That is a duty you can hold them to —{' '}
						<Link href='/members' className='rule-link'>
							every member is listed here
						</Link>{' '}
						with what they have filed.
					</Point>
				</Block>

				<Reveal>
					{/* The vocabulary a reader has to carry through the page. Every term
					    here is also explained where it first appears — this is the place
					    to look it up again, not the place it is first met. */}
					<section id='glossary' className='scroll-mt-32 py-12 font-sans lg:py-14'>
						<p className='eyebrow'>The words they use</p>
						<h2 className='section-title mt-4 max-w-3xl'>A short glossary.</h2>
						<p className='section-lead mt-4 max-w-2xl text-[var(--ink-3)]'>
							Parliament&rsquo;s own vocabulary, in ordinary words. These are the terms you will hit
							in the rulebook, in the Journal, and in a committee report.
						</p>

						<dl className='mt-10 max-w-4xl'>
							<Term term='Measure'>
								The catch-all word for anything Parliament takes up — a bill or a resolution.
							</Term>
							<Term term='Bill, act, resolution'>
								A bill is a proposal for a law. An act is a bill that finished the journey and
								became one — here they are called Bangsamoro Autonomy Acts. A resolution is
								Parliament stating a position; it never becomes law.
							</Term>
							<Term term='Organic Law'>
								Republic Act 11054, the national law that created the Bangsamoro region and set up
								its government. It sits above Parliament&rsquo;s own rulebook, and Parliament cannot
								amend it.
							</Term>
							<Term term='Plenary'>
								The whole Parliament sitting together, as opposed to one of its committees.
							</Term>
							<Term term='Reading'>
								A stage a bill passes through on the floor. First reading announces it, second
								reading debates and amends it, third reading takes the final vote.
							</Term>
							<Term term='Viva voce'>
								A voice vote. Members answer aloud together, so the result is recorded and no
								individual names are.
							</Term>
							<Term term='Nominal voting'>
								A vote taken name by name. The rules require the Journal to record these in full,
								which makes them the only votes with a public paper trail.
							</Term>
							<Term term='The Journal'>
								Parliament&rsquo;s official written record of what happened at a sitting.
							</Term>
							<Term term='Quorum'>
								The number of members who must be present before anything can be decided. Here, more
								than half of them.
							</Term>
							<Term term='In aid of legislation'>
								The reason a committee gives for an investigation: it is gathering facts for a law
								it is working on, rather than acting as a court.
							</Term>
							<Term term='Inhibit'>
								To take no part in a proceeding — what a member must do on a measure they have a
								conflict of interest in.
							</Term>
							<Term term='Wali'>
								The ceremonial head of the Bangsamoro. Opens the inaugural session of a new
								Parliament.
							</Term>
							<Term term='Government of the Day'>
								The governing side — the Chief Minister and the cabinet — as distinct from members
								who hold no executive post.
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
					<section id='sources' className='scroll-mt-32 py-14'>
						<p className='label label-strong'>Read the originals</p>
						<div className='mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm'>
							<Source href={SOURCES.rules}>
								Rules, Procedures, and Practices of the BTA Parliament
							</Source>
							<Source href={SOURCES.rulesPdf}>Full rulebook (PDF)</Source>
							<Source href={SOURCES.process}>Legislative process</Source>
							<Source href={SOURCES.organicLaw}>Organic Law (RA 11054)</Source>
						</div>
						<p className='mt-5 max-w-3xl text-[13px] leading-6 text-[var(--ink-3)]'>
							This page is a plain-language reading of those documents, not a substitute for them.
							It leaves out the procedural machinery — motions, points of order, how to obtain the
							floor — that matters to a member mid-debate and to nobody else. Where this page and
							the rules differ, the rules are right: every point above names the one it came from so
							you can check it. If you arrived with one specific question,{' '}
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
