import type { Metadata } from 'next'
import Link from 'next/link'
import { BillPath } from '../_components/bill-path'
import type { BillStep } from '../_components/bill-path-steps'
import { Block, Duty, Head, Point, Source, SourcePill } from '../_components/explainer'
import { PageHeader } from '../_components/page-header'
import { SittingCalendar, VoteComparison, type SittingMonth } from '../_components/parliament-diagrams'
import { ParliamentSwitch } from '../_components/parliament-switch'
import { ReadingColumn } from '../_components/reading-column'
import { Reveal } from '../_components/reveal'
import type { TocItem } from '@betterbarmm/editorial'

export const metadata: Metadata = {
	title: 'How Parliament works',
	description:
		'Plain answers about the elected Bangsamoro Parliament and its Standing Orders: the government and the loyal opposition, who it elects, how a bill becomes law, how it votes, what gets written down, and where an ordinary person can take part.',
}

/* ============================================================
   How Parliament works — the elected Parliament

   The first elected Parliament adopted its own rulebook on 24 November 2026:
   Bangsamoro Parliament Resolution No. 01, the Standing Orders, 139 Orders in
   21 Parts. It replaces the Transition Authority's 34 rules, and this page
   replaces the one written on them. That page is kept, unchanged, at
   /how-parliament-works/transition-authority, because every act and journal
   from 2019 to 2026 was made under it.

   The house style carries over: the plain thing first and the term second,
   one point per paragraph, the consequence before the mechanism, and every
   point citing the Order it comes from so a reader can check it. The
   Standing Orders were published only as a scanned PDF; every citation here
   was checked against an OCR of all 49 pages.

   What is new gets its own sections, government and opposition, the
   elections, Question Hour, and a table of what changed, because a reader
   who knew the old Parliament needs those first.
   ============================================================ */

const SOURCES = {
	gazette: 'https://officialgazette.bangsamoro.gov.ph/2026/11/25/bangsamoro-parliament-resolution-no-01/',
	pdf: 'https://officialgazette.bangsamoro.gov.ph/wp-content/uploads/2026/11/BPR-01-FINAL-WITH-SIGNATURE.docx.pdf',
	organicLaw: 'https://www.officialgazette.gov.ph/downloads/2018/07jul/20180727-RA-11054-RRD.pdf',
	positionPapers: 'https://parliament.bangsamoro.gov.ph/position-papers/',
	schedules: 'https://parliament.bangsamoro.gov.ph/schedules/',
}

const BTA = '/how-parliament-works/transition-authority'

const SECTIONS: TocItem[] = [
	{ id: 'what-it-is', label: 'What it is' },
	{ id: 'what-changed', label: 'What changed' },
	{ id: 'two-sides', label: 'Government and opposition' },
	{ id: 'elections', label: 'Who it elects' },
	{ id: 'limits', label: 'What holds it back' },
	{ id: 'the-sitting', label: 'The sitting' },
	{ id: 'the-calendar', label: 'The calendar' },
	{ id: 'question-hour', label: 'Question Hour' },
	{ id: 'committees', label: 'Committees' },
	{ id: 'the-bill-path', label: 'How a bill becomes law' },
	{ id: 'kinds-of-bill', label: 'Kinds of bill' },
	{ id: 'resolutions', label: 'Resolutions' },
	{ id: 'voting-and-the-record', label: 'Voting and the record' },
	{ id: 'members', label: 'Rules on members' },
	{ id: 'duties', label: 'What they must do' },
	{ id: 'where-you-come-in', label: 'Where you come in' },
	{ id: 'glossary', label: 'The words they use' },
	{ id: 'sources', label: 'Read the originals' },
]

/* Order 32: Tuesday to Thursday of weeks 1 and 2. Order 108: Privilege Hour
   every Wednesday it sits. Order 45: Question Hour on the second Thursday.
   Order 39, Section 3: the Chief Minister's Hour on the first Wednesday of
   each quarter. */
const SITS = (week: number, day: number) => week < 2 && day > 0
const MONTH: SittingMonth = [0, 1, 2, 3].map((week) =>
	[0, 1, 2, 3].map((day) => {
		const marks: NonNullable<SittingMonth[number][number]['marks']> = []
		if (SITS(week, day) && day === 2) marks.push({ tone: 'privilege', label: 'Privilege' })
		if (week === 0 && day === 2) marks.push({ tone: 'chief', label: 'CM’s Hour' })
		if (week === 1 && day === 3) marks.push({ tone: 'question', label: 'Questions' })
		return { sits: SITS(week, day), marks: marks.length ? marks : undefined }
	}),
)
const LEGEND = [
	{ tone: 'sits' as const, label: 'Plenary sits, from 1:00 pm' },
	{ tone: 'privilege' as const, label: 'Privilege Hour, every Wednesday it sits' },
	{ tone: 'question' as const, label: 'Question Hour, the second Thursday' },
	{ tone: 'chief' as const, label: 'Chief Minister’s Hour, first Wednesday of each quarter' },
]

/* Each row: what the Transition Authority's rules said, and what the Standing
   Orders say now. Only the differences a reader would notice from outside. */
const CHANGES: { topic: string; before: string; now: string; cite: string }[] = [
	{ topic: 'Who sits', before: 'Appointed by the President', now: 'Elected', cite: 'Preamble; Order 29, Section 2(a)' },
	{
		topic: 'Sides',
		before: 'No opposition named in the rules',
		now: 'A Government of the Day on the Speaker’s right, a Loyal Opposition on the left',
		cite: 'Orders 22, 24 and 42',
	},
	{
		topic: 'The agenda',
		before: 'Set by the Majority Floor Leader',
		now: 'The Floor Leader’s office becomes the Government of the Day Whip’s',
		cite: 'Order 139',
	},
	{ topic: 'Sittings', before: 'Monday to Thursday, weeks 3 and 4', now: 'Tuesday to Thursday, weeks 1 and 2', cite: 'Order 32' },
	{ topic: 'Privilege Hour', before: 'Thursdays', now: 'Wednesdays', cite: 'Order 108' },
	{
		topic: 'Question Hour',
		before: 'Any member, first Wednesday',
		now: 'The Loyal Opposition only, second Thursday',
		cite: 'Order 45',
	},
	{ topic: 'First reading', before: 'Number, title and author', now: 'The same, plus the sponsorship speech', cite: 'Order 78(a)' },
	{
		topic: 'Committee rewrites',
		before: 'A committee could report a substitute bill',
		now: 'No substitute bills. A committee can adopt, amend, revise or reject',
		cite: 'Orders 74, 76 and 99',
	},
	{
		topic: 'Floor amendments',
		before: 'Each one debated and voted on',
		now: 'Accepted or denied by the sponsor',
		cite: 'Order 78(d)',
	},
	{
		topic: 'Final vote',
		before: 'Roll call, each member by name',
		now: 'Roll call by voice, show of hands, or standing or sitting',
		cite: 'Order 78(e)',
	},
	{ topic: 'Suspending a member', before: 'Up to 30 days', now: 'Up to 6 months', cite: 'Orders 122 and 125' },
]

const STEPS: BillStep[] = [
	{
		label: 'Filed',
		summary: 'A member, the government, or one day the people, hands it in.',
		tone: 'filed',
		detail: (
			<>
				The authors sign the bill and file it with the Parliament Secretary, with an electronic
				copy, and it gets a number. A bill can cover one subject only: a rider tucked in on
				something else is not allowed. Before it goes on the agenda the Parliament Secretary checks
				that nothing in it is foreign to its title, and if it spends public money its explanatory
				statement has to say roughly how much.{' '}
				<a href='#kinds-of-bill' className='rule-link'>
					Who can file what is below
				</a>
				.
			</>
		),
	},
	{
		label: 'First reading',
		summary: 'Number, title and author are read, the sponsor speaks, and it goes to a committee.',
		tone: 'early',
		detail: (
			<>
				This is new: the sponsorship speech now comes here, at first reading, before any committee
				has looked at the bill. Nothing is debated and nothing is voted on. The Speaker refers the
				bill to a committee, and the author of a Private Member Bill may ask for co-authors to be
				added. If a committee chair thinks the bill went to the wrong committee, they can ask the
				Committee on Standing Orders and Procedures to move it, and that committee has 5 days to
				decide.
			</>
		),
	},
	{
		label: 'Committee',
		summary: 'A committee goes through it line by line — and anyone it affects can ask to be heard.',
		tone: 'committee',
		detail: (
			<>
				The committee examines the bill in detail, line by line. It may invite experts, ministries
				and the public. And a person a bill particularly affects may petition to be heard, in person
				or through a lawyer, which is a right the Transition Authority&rsquo;s rules never gave. The
				committee can adopt the bill, amend it, revise it or reject it. It cannot swap in a
				substitute bill of its own. Its report has to set out what members and resource persons
				said and every amendment with its reason, and members sign it with support, reservation or
				dissent. The report is made public.
			</>
		),
		publicAction: {
			text: 'This is the stage where an outsider can change a bill. If a bill affects you, you can petition the committee to be heard (Order 81).',
			href: SOURCES.positionPapers,
			label: 'Call for position papers',
		},
	},
	{
		label: 'Second reading',
		summary: 'The whole Parliament questions it and amends it, then approves it by voice.',
		tone: 'advancing',
		detail: (
			<>
				The bill is read in full unless members have had copies for 3 calendar days. The committee
				presents its report, members question the sponsor (interpellation), and then comes the
				period of amendments. An amendment only counts if it was raised during interpellation, page
				and line. And a member&rsquo;s amendment from the floor is now accepted or denied by the
				sponsor, not put to a vote. The bill is approved by a majority of those present, by voice
				&mdash; unless a member calls a division, which makes every member answer by name. Once a
				bill passes or fails here, no bill with substantially the same provisions can come to a
				second-reading vote in the same session period.
			</>
		),
	},
	{
		label: 'Third reading',
		summary: 'A final vote. Only the title is read, and nothing can change.',
		tone: 'passed',
		detail: (
			<>
				Members must have had printed copies for 3 calendar days, unless it is a certified or
				emergency bill, which can be voted on the same day. The Parliament Secretary reads only the
				title. The Speaker then has the roll called &mdash; by voice, by show of hands, or by
				members standing or sitting. Anyone abstaining has to say so aloud and does not have to
				explain. A show of hands is quicker than a call of names, and it may leave no record of who
				voted which way.
			</>
		),
	},
	{
		label: 'Signed',
		summary: 'The Chief Minister signs within 30 days — or it becomes law anyway.',
		tone: 'passed',
		detail: (
			<>
				The Speaker attests the printed bill without delay and presents it to the Chief Minister.
				The Chief Minister has 30 days from receiving it. If those days pass without a signature, it
				becomes law as if it had been signed. Silence is not a veto here.
			</>
		),
	},
	{
		label: 'In force',
		summary: 'Published, then law 15 days later.',
		tone: 'enacted',
		detail: (
			<>
				The act takes effect 15 days after it is published in full in the Bangsamoro Gazette or in a
				newspaper circulating in the region. The Speaker sends certified copies to the President and
				to Congress, which keeps Manila informed. It is not an approval the act has to wait for.{' '}
				<Link href='/acts' className='rule-link'>
					Every act passed is listed here
				</Link>
				.
			</>
		),
	},
]

function Term({ term, children }: { term: string; children: React.ReactNode }) {
	return (
		<div className='rounded-2xl border border-[var(--rule)] bg-[var(--paper)] p-5 sm:p-6'>
			<dt className='font-[family-name:var(--font-display)] text-[1.0625rem] font-bold tracking-[-0.01em] text-[var(--ink)]'>{term}</dt>
			<dd className='copy mt-1.5 text-[var(--ink-2)]'>{children}</dd>
		</div>
	)
}

export default function HowParliamentWorksPage() {
	return (
		<>
			<PageHeader
				emphasis='brand'
				align='left'
				size='compact'
				eyebrow='The Standing Orders, from 2026'
				title='What the elected Parliament can do.'
				titleMuted='And the rules it does it by.'
				description='The first elected Bangsamoro Parliament adopted its own rulebook on 24 November 2026: 139 Standing Orders on the Westminster model, with a government and a loyal opposition. Here is how it is organised, how a bill moves, how it votes and where you fit &mdash; each point tied to the Order behind it.'
			/>
			<ParliamentSwitch current='/how-parliament-works' />

			<ReadingColumn sections={SECTIONS}>
				<Block
					id='what-it-is'
					label='What it is'
					title='An elected Parliament, with a rulebook of its own'
					lead='The appointed Transition Authority is over. The people in Parliament now hold their seats by election, and they wrote new rules for how it runs.'
				>
					<Point title='Elected, and it runs the government too' cite='Organic Law (RA 11054), Article VII; Standing Orders, Order 9(k)'>
						Parliament makes the region&rsquo;s laws, and it elects the Chief Minister who runs the
						government on its behalf. That is the parliamentary system the Organic Law set up, the
						national law that created the Bangsamoro region. The government answers to Parliament,
						and Parliament can remove it with a vote of no confidence.
					</Point>
					<Point title='The rulebook is called the Standing Orders' cite='Bangsamoro Parliament Resolution No. 01; Orders 2 and 4'>
						Parliament adopted them on 24 November 2026 as its first resolution: 139 Orders in 21
						Parts. They say their purpose is to carry out the will of a majority of at least 41
						members, protect the rights of the Loyal Opposition, and follow the Westminster model as
						adapted to the Bangsamoro. They replace the Transition Authority&rsquo;s 34 rules,{' '}
						<Link href={BTA} className='rule-link'>
							which are kept here
						</Link>
						.
					</Point>
					<Point title='They take effect 15 days after publication' cite='Order 132, Section 3'>
						The Bangsamoro Gazette published them on 25 November 2026, which puts the start at 10
						December 2026. They must also be posted on Parliament&rsquo;s website. The same 15 days
						apply to any later amendment.
					</Point>
					<Point title='The Speaker fills the gaps' cite='Order 7, Sections 1 and 2'>
						Anything the Standing Orders do not cover, the Speaker decides. A Speaker&rsquo;s ruling on
						what a rule means is final unless it is challenged by a bill or a substantive motion. So
						some of how Parliament runs will be built up from rulings, not written in advance.
					</Point>
				</Block>

				<Block
					id='what-changed'
					label='What changed'
					title='What is different from the Transition Authority'
					lead='The differences you would notice from outside, side by side. Everything else on this page builds on these.'
				>
					<div className='overflow-x-auto rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] px-5 py-2 sm:px-7'>
						<table className='w-full min-w-[34rem] border-collapse text-left'>
							<thead>
								<tr className='border-b border-[var(--rule)]'>
									<th className='label py-4 pr-4 font-normal'>&nbsp;</th>
									<th className='label py-4 pr-4 font-normal'>Transition Authority</th>
									<th className='label py-4 font-normal text-[var(--accent)]'>Standing Orders</th>
								</tr>
							</thead>
							<tbody>
								{CHANGES.map((row) => (
									<tr key={row.topic} className='border-b border-[var(--rule-soft)] align-top last:border-b-0'>
										<th scope='row' className='item-title py-4 pr-4 text-[var(--ink)]'>
											{row.topic}
										</th>
										<td className='copy py-4 pr-4 text-[var(--ink-3)]'>{row.before}</td>
										<td className='copy py-4 text-[var(--ink)]'>
											{row.now}
											<span className='meta-sm mt-1.5 block'>{row.cite}</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Block>

				<Block
					id='two-sides'
					label='Government and opposition'
					title='Two sides, written into the rules'
					lead='How a member voted for Chief Minister decides which side they sit on. The side that lost gets a name, a leader and guaranteed seats.'
				>
					<Point title='The Government of the Day' cite='Order 22, Sections 1 to 3'>
						It is the Chief Minister, the two Deputy Chief Ministers, the cabinet ministers who are
						members of Parliament, and every member who voted for the Chief Minister. It sits on the
						Speaker&rsquo;s right, with the Chief Minister in the front seat nearest the Speaker.
					</Point>
					<Point title='Not every minister is a member' cite='Order 22, Section 2; Order 45, Section 15'>
						Only a majority of the cabinet has to come from Parliament. So some ministers may not hold
						a seat. Questions to a minister who is not a member are answered through the Government
						of the Day Whip, or a member the Whip names.
					</Point>
					<Point title='The Loyal Opposition' cite='Orders 24 and 25'>
						Every member who did not vote for the Chief Minister, or who has since voted against them.
						It sits on the Speaker&rsquo;s left. Its members elect a Leader of the Loyal Opposition,
						who sits in the front seat nearest the Speaker and speaks for them.
					</Point>
					<Point title='Each side has a Whip' cite='Orders 23 and 26'>
						A Whip makes sure their side turns up for important votes, coordinates who speaks, and
						states the side&rsquo;s position on a measure. The Chief Minister names the Government of
						the Day Whip. The Leader of the Loyal Opposition names the Opposition Whip.
					</Point>
					<Point title='A quarter of every committee belongs to the opposition' cite='Order 89; Order 100'>
						25% of each committee&rsquo;s seats, rounded down, are reserved for the Loyal Opposition,
						with full votes. When one of those seats falls empty, only the opposition can fill it. Both
						Whips and the Leader of the Loyal Opposition sit on every committee with a vote.
					</Point>
					<Point title='But the government picks every chair' cite='Order 88, Section 1; Order 87(a)'>
						The Government of the Day chooses the chair of every committee. The choice is announced in
						plenary and affirmed without a vote or debate. The one exception is the Committee on
						Standing Orders and Procedures: the Speaker chairs it, and the Leader of the Loyal
						Opposition is its vice-chair.
					</Point>
					<Point title='Old offices, new names' cite='Order 139'>
						The Majority Floor Leader and Deputy Floor Leaders the new Parliament elected become the
						Government of the Day Whip and Deputy Whips, keeping their staff. The Secretary-General
						becomes the Parliament Secretary. Both last until the Chief Minister replaces them.
					</Point>
				</Block>

				<Block
					id='elections'
					label='Who it elects'
					title='The first thing it does is vote, standing up'
					lead='At its first sitting Parliament elects the government and its own officers. Those votes are among the few where every member’s choice is written down.'
				>
					<Point title='In a fixed order' cite='Order 15, Sections 1, 2 and 5'>
						The Wali, the region&rsquo;s ceremonial head, opens the first session by striking the
						agong. The majority party or coalition tells the Wali who its nominee for Chief Minister
						is. Then Parliament elects, in this order: the Chief Minister, the Speaker, the Deputy
						Chief Ministers, the Deputy Speakers, the committee chairs, the Parliament Secretary and
						Sergeant-at-Arms, and any other officers.
					</Point>
					<Point title='Every vote goes in the Journal' cite='Order 16, Sections 2 to 5; Order 17'>
						The Chief Minister and the Speaker each need a majority of all members. Members vote by
						standing, without explaining their vote, and each member&rsquo;s vote is entered in the
						Journal. The majority can put up only one candidate. If nobody wins outright among three or
						more, the top two go to a run-off, and in a run-off no one may abstain.
					</Point>
					<Point title='Two Deputy Chief Ministers, from the other two subregions' cite='Order 18, Section 1'>
						The Standing Orders split the region into three subregions: southwestern, north central and
						south central Mindanao. The 2 Deputy Chief Ministers must come from the two subregions the
						Chief Minister is not from. Parliament decides what each subregion covers.
					</Point>
					<Point title='If the Chief Minister’s seat falls empty' cite='Order 18, Section 1'>
						If the Chief Minister dies, resigns, is removed or is permanently incapacitated, the older
						Deputy Chief Minister acts in the post. Parliament must elect a new Chief Minister within
						30 days.
					</Point>
				</Block>

				<Block
					id='limits'
					label='What holds it back'
					title='What it cannot do, and what it can do to its own rules'
					lead='A law above it it cannot touch, a government that can be voted out, and rules it can set aside more easily than you might expect.'
				>
					<Point title='It cannot change the Organic Law' cite='Order 132, Section 1'>
						41 members can amend any Standing Order, except a provision that comes from the Organic
						Law. That is out of Parliament&rsquo;s reach.
					</Point>
					<Point title='It can bring the government down' cite='Order 65, Section 2; Order 30'>
						A vote of no confidence needs two-thirds of all members. The Standing Orders treat it as a
						way the Parliament can be dissolved before its term ends.
					</Point>
					<Point title='Manila gets told, not asked' cite='Order 20(n); Organic Law, Article VII, Section 25'>
						The Speaker sends certified copies of every law and resolution to the President and to
						Congress. That is notice. Parliament does not need Manila&rsquo;s permission to pass
						something.
					</Point>
					<Point title='A broken rule does not undo a decision' cite='Order 7, Section 3'>
						If Parliament or a committee fails to follow the Standing Orders while reaching a decision,
						that counts only as a &ldquo;procedural irregularity&rdquo;. The decision still stands. So
						a rule being skipped is not, by itself, a way to have a vote thrown out.
					</Point>
					<Point title='Any rule can be suspended by a simple majority' cite='Orders 126 to 131'>
						A majority of the members present, with a quorum, can suspend a Standing Order to pass a
						measure. The Government of the Day Whip moves it first. Debate on the motion is capped at 1
						hour, split equally between the two sides, and the measure then needs only a majority of
						those present.
					</Point>
				</Block>

				<Block
					id='the-sitting'
					label='The sitting'
					title='Who runs a sitting'
					lead='The Speaker runs the floor and is meant to stay out of the argument. The rest is quorum, order and time.'
				>
					<Point title='The Speaker stays impartial' cite='Order 20, Section 1(d), (e) and (o)'>
						The Speaker presides and has to stay neutral in debate. A Speaker who wants to argue a
						point has to leave the chair first. The Speaker votes only to break a tie, but sits on
						every committee with a vote.
					</Point>
					<Point title='Nothing is decided without 41 members' cite='Orders 35 and 38'>
						A quorum is a majority of all members, at least 41. A member who cannot be there can be
						counted present by video call for a permanent disability affecting mobility, a serious or
						contagious illness, isolation after exposure, or a disaster that makes travel unsafe.
					</Point>
					<Point title='The agenda is published' cite='Order 40'>
						The Order of Business for each day is published on Parliament&rsquo;s website and emailed
						to members, if practicable at least 3 days before the session.
					</Point>
					<Point title='15 minutes a speech, sides taking turns' cite='Order 56, Sections 3, 4 and 8'>
						A member speaks once on a question and for no more than 15 minutes. The sponsor of a
						measure can take as long as they need. So far as practicable, government and opposition
						members speak alternately.
					</Point>
					<Point title='Cutting debate short has a check on it' cite='Order 58'>
						A member can move to close a debate. The Speaker can refuse the motion if it abuses the
						rules or infringes the rights of the Loyal Opposition. If the opposition objects, the
						motion needs the votes of at least a majority of a quorum.
					</Point>
					<Point title='Four kinds of sitting, one of them closed' cite='Orders 29 to 31 and 34'>
						An inaugural session opens a new Parliament and holds the elections. Regular sessions run
						to the calendar, starting 45 days after the election. Special sessions deal with an
						emergency, on the Chief Minister&rsquo;s request or by resolution of a majority. Executive
						sessions are closed to the public and cover regional security, public safety, public
						health and matters offensive to decency. Every other sitting is open to the public unless
						Parliament announces otherwise. It meets in the Session Hall, or elsewhere if 41 members
						agree.
					</Point>
				</Block>

				<Block
					id='the-calendar'
					label='The calendar'
					title='When Parliament meets'
					lead='Six afternoons a month, all in the first half of it. The fixed hours for questions and privilege speeches now fall on days it sits.'
				>
					<SittingCalendar month={MONTH} legend={LEGEND} />

						<Point title='Six afternoons a month' cite='Order 32, Section 1'>
							Plenary sittings start at 1 pm on Tuesday, Wednesday and Thursday of the first and second
							weeks of each month, unless Parliament decides otherwise. Committee hearings and
							consultations happen outside that.
						</Point>
						<Point title='Privilege Hour, every Wednesday' cite='Orders 108 to 112'>
							Up to 60 minutes for members to speak on any matter of general interest, in the order they
							registered. It cannot be interrupted except by a point of order or a motion to adjourn. It
							cannot be used to argue a measure pending before a committee or the plenary. The speech
							goes to the Speaker 24 hours ahead.
						</Point>
						<Point title='The Chief Minister’s Hour, once a quarter' cite='Order 39, Section 3; Order 22, Section 4'>
							On the first Wednesday of each quarter, the Chief Minister&rsquo;s Hour comes straight after
							the roll call. The Chief Minister reports on what the government has done.
						</Point>
						<Point title='Question Hour, the second Thursday' cite='Order 45'>
							60 minutes, once a month, for the Loyal Opposition to question the cabinet.{' '}
							<a href='#question-hour' className='rule-link'>
								How it works is next
							</a>
							.
						</Point>
				</Block>

				<Block
					id='question-hour'
					label='Question Hour'
					title='The opposition’s hour'
					lead='Under the Transition Authority any member could question the cabinet. Now it is the Loyal Opposition’s right, and the rules on what it may ask are long.'
				>
					<Point title='Written first, answered within a month' cite='Order 45, Sections 1 to 5'>
						The opposition&rsquo;s questions go in writing to the Parliament Secretary on the first
						Monday of the month, then through the Speaker to the minister. Each covers one subject,
						with one follow-up. A minister may ask for more time, but must answer by the next Question
						Hour at the latest. Urgent questions go first.
					</Point>
					<Point title='The answers are published' cite='Order 50'>
						The Parliament Secretary publishes the questions and the replies, written and oral, on
						Parliament&rsquo;s website.
					</Point>
					<Point title='What cannot be asked' cite='Order 45, Section 11; Orders 46 and 47'>
						A question may not name persons, attack the character or conduct of the Chief Minister or a
						minister, ask about anything still pending in a committee or before a court, or seek
						information that is secret. The Speaker can send a question back, have it altered or
						disallow it, giving the reason in writing. The member can appeal, without debate.
					</Point>
					<Point title='A minister can decline' cite='Order 48; Order 45, Section 6'>
						With the Speaker&rsquo;s approval, a minister may refuse to answer on grounds of public
						interest, and the refusal cannot be debated or questioned. A minister can also be made to
						answer in executive session, behind closed doors, when security or the public interest
						requires it, or when the Chief Minister says so in writing.
					</Point>
					<Point title='It is still not for the public' cite='Order 45, Section 1'>
						Only the Loyal Opposition asks. There is no way for an outsider to put a question, except by
						bringing it to an opposition member.
					</Point>
				</Block>

				<Block
					id='committees'
					label='Committees'
					title='What committees can do'
					lead='25 standing committees, with the power to make you appear, and a report that has to show who said what.'
				>
					<Point title='17 statutory and 8 parliamentary committees' cite='Orders 85 to 87'>
						The statutory committees follow the government&rsquo;s work, from Finance, Budget and
						Management to Public Works, Health and the Bangsamoro Justice System. The parliamentary
						ones include Ways and Means, the Blue Ribbon Committee on good government, which
						investigates wrongdoing by any Bangsamoro official, Parliament&rsquo;s included, Ethics and
						Privileges, and special committees on Marawi&rsquo;s recovery and on the Special
						Geographic Area. Parliament can add more.
					</Point>
					<Point title='They watch the ministries' cite='Order 96'>
						Every committee has to check that the ministries in its field carry out the laws and
						programmes as Parliament intended.
					</Point>
					<Point title='A committee can order you to appear, and hold you if you refuse' cite='Orders 106 and 107'>
						Committees can summon witnesses and order documents produced, by subpoena signed by the
						chair and approved by the Speaker. Inside the region the Sergeant-at-Arms serves it;
						outside, the local police. A witness who refuses to testify, lies or holds back documents
						can be cited in contempt and detained until they comply.
					</Point>
					<Point title='The report shows who said what' cite='Orders 97 and 98'>
						A committee report has to set out the views of individual members and of every resource
						person heard, and each amendment with its reason. Members sign it with support,
						reservation or dissent, and a reservation becomes part of the report. The report is made
						available to the public.
					</Point>
					<Point title='Members who skip meetings can lose their seat on it' cite='Order 102; Order 38'>
						A member who misses 3 meetings in a row, or a third of a year&rsquo;s meetings, without
						leave can be removed from the committee. A committee needs 30% of its members for a
						quorum, ex officio members included. A public hearing needs only the chair.
					</Point>
					<Point title='Livestreamed, unless closed' cite='Order 104, Section 2; Order 105, Sections 7 and 8'>
						Parliament has to stream committee meetings, hearings and consultations on its website and
						social media. Executive sessions are the exception: their minutes, transcripts and
						evidence can never be disclosed.
					</Point>
				</Block>

				<BillPath
					id='the-bill-path'
					steps={STEPS}
					title='Seven stages, and one of them is yours.'
					lead='The Standing Orders set out the path in seven paragraphs. Three things changed from the Transition Authority: the sponsor speaks at first reading, committees cannot substitute a bill, and the sponsor decides floor amendments.'
					note={
						<>
							Simplified from Order 78 of the{' '}
							<Source href={SOURCES.gazette}>Standing Orders</Source>, with Orders 71 to 83 for the
							details.{' '}
							<Link href={`${BTA}#the-bill-path`} className='rule-link'>
								The Transition Authority&rsquo;s path
							</Link>{' '}
							is kept for the record.
						</>
					}
				/>

				<Block
					id='kinds-of-bill'
					label='Kinds of bill'
					title='Three kinds of bill, and one is not open yet'
					lead='Who brings a bill decides where it stands in the queue.'
				>
					<Point title='Government Bills go first' cite='Order 67, Section 2(a)'>
						A Government Bill is one the Government of the Day brings to Parliament. It takes precedence
						over Private Member Bills.
					</Point>
					<Point title='Private Member Bills' cite='Order 67, Section 2(b)'>
						A bill introduced by a member who is not a minister.
					</Point>
					<Point title='A bill from the people, once Parliament allows it' cite='Order 67, Section 2(c)'>
						A Popular Initiative is a bill proposed directly by the people. The Standing Orders name it
						but leave it &ldquo;as may be provided for by the Parliament&rdquo;. Until a law sets out
						how, it cannot be used.
					</Point>
				</Block>

				<Block
					id='resolutions'
					label='Resolutions'
					title='Three kinds of resolution'
					lead={
						<>
							A resolution states a position and never becomes law. Two of the three kinds skip the
							stages above.{' '}
							<Link href='/resolutions' className='rule-link'>
								Resolutions on record are here
							</Link>
							.
						</>
					}
				>
					<Point title='Simple resolutions' cite='Order 68, Section 1(a)'>
						For Parliament&rsquo;s own procedures, for something urgent, or to express an opinion,
						sympathy or commendation.
					</Point>
					<Point title='Concurrent resolutions' cite='Order 68, Section 1(b)'>
						Issued by the Bangsamoro Cabinet and Parliament together, stating their shared position.
					</Point>
					<Point title='Joint committee resolutions' cite='Order 68, Section 1(c)'>
						From 2 or more committees, and it needs a majority of each committee concerned.
					</Point>
					<Point title='No readings for the first two' cite='Order 68, Section 2; Order 39(i)'>
						Simple and concurrent resolutions do not go through the stages of legislation. Parliament
						acts on them promptly. A resolution that is referred to a committee comes back with a
						report, interpellation and amendments before it is approved.
					</Point>
				</Block>

				<Block
					id='voting-and-the-record'
					label='Voting and the record'
					title='How votes are recorded'
					lead='Most votes are by voice and leave no names. Any one member can change that by calling a division.'
				>
					<VoteComparison
						shouted={{
							kind: 'Voice vote',
							when: 'Every question, unless a division is called',
							note: 'The presiding officer declares the result from the Ayes and Nays. No names are written down.',
						}}
						named={{
							kind: 'Division',
							when: 'Any member can call one',
							rows: [
								{ named: true, name: 'Member A', answer: 'Aye' },
								{ named: true, name: 'Member B', answer: 'Nay' },
								{ named: true, name: 'Member C', answer: 'Abstain' },
							],
							note: 'Each member is asked separately. The Parliament Secretary enters every vote in the Votes and Proceedings.',
						}}
					/>

					<Point title='A majority of those present decides' cite='Order 65, Sections 1, 3 and 6'>
						Most questions pass with a simple majority of members present, by voice. The Speaker votes
						only to break a tie. A member who is absent cannot vote.
					</Point>
					<Point title='One member can force a named vote' cite='Order 66'>
						Any member can call a division. Each member is then asked how they vote and must say Aye,
						Nay or that they abstain, and the vote is entered name by name. This is the single most
						useful rule for anyone tracking how members vote: if no one calls a division, no one&rsquo;s
						position is recorded.
					</Point>
					<Point title='The Journal keeps every named vote, and every absence' cite='Order 117'>
						The Journal is Parliament&rsquo;s official record of a sitting. It must carry every nominal
						vote in full. It must also record who answered the roll call, who came in later, who was on
						official business, and the names of the members who were absent. That is what keeps an{' '}
						<Link href='/attendance' className='rule-link'>
							attendance record
						</Link>{' '}
						possible.
					</Point>
					<Point title='A second record holds the votes, but it is not public' cite='Order 119'>
						The Votes and Proceedings record attendance, every decision, and the names of members voting
						for and against and declining to vote. They are open to members, and to other people only if
						the Speaker authorises it.
					</Point>
					<Point title='Speeches are published, nearly word for word' cite='Orders 113 and 118'>
						The Official Report of speeches is a substantially verbatim record. Members may fix only
						small errors and cannot change what they said. A bigger change needs a ruling from the
						Speaker.
					</Point>
					<Point title='Three languages, two official' cite='Order 5'>
						What is said is recorded as it was said and translated into Filipino, Arabic and English.
						The official records are kept in Filipino and English, with Arabic on request.
					</Point>
					<Point title='Open, within the law, and broadcast' cite='Orders 116 and 121'>
						The records and Journals are to be preserved and open to the public &ldquo;in accordance
						with law&rdquo;. Plenary sittings must be broadcast, recorded and livestreamed, with
						captions, and accredited media get live access.
					</Point>
				</Block>

				<Block
					id='members'
					label='Rules on members'
					title='Rules that apply to members'
					lead='What protects a member, what they have to declare, and how Parliament punishes its own.'
				>
					<Point title='Narrow protection from arrest' cite='Order 10'>
						A member is protected from arrest only while Parliament is in session, and only for an
						offence punishable by no more than 6 years. No member can be sued or charged anywhere else
						for what they say in Parliament or its committees.
					</Point>
					<Point title='They have to declare their interests' cite='Order 11'>
						On taking office, members must fully disclose their financial and business interests and
						those of their spouses and children. They must flag any conflict of interest in a bill they
						author.
					</Point>
					<Point title='They cannot vote where they have money at stake' cite='Order 8(f); Order 66, Section 2'>
						A member may not vote on a measure in which they have a personal financial interest. Another
						member can move to have that vote disallowed, right after the count and before the result.
					</Point>
					<Point title='Barred from business with the government' cite='Orders 12 and 13'>
						No deals with the Bangsamoro Government, no stake in licensed cockpits or games, no buying
						property it has seized, no standing surety for its contractors, and no private use of
						public property. The national code of conduct for public officials, RA 6713, applies in
						full.
					</Point>
					<Point title='Two rules on lawyering that do not agree' cite='Order 14; Order 124(e)'>
						Order 14 lets members outside the cabinet practise their profession outside session hours,
						and bars lawyers only from certain cases against the government. Order 124(e) says a member
						shall not personally appear as counsel before any court at all. The two cannot both apply
						as written.
					</Point>
					<Point title='How Parliament disciplines its own' cite='Orders 63, 64, 122 and 125'>
						The Speaker can order a disorderly member out for up to 10 session days. A majority of all
						members can reprimand or censure one. Two-thirds of all members can suspend one for up to 6
						months, after the Committee on Ethics and Privileges investigates, or expel one. No court or
						outside body is involved.
					</Point>
				</Block>

				<Block
					id='duties'
					label='What they must do'
					title='The job, in the rulebook’s own list'
					lead='The Standing Orders open the list with one sentence: the primary duty of members is to legislate. Then they set out what that takes.'
				>
					<ol>
						<Duty letter='a'>Prepare, introduce and work for the passage of measures that meet the region&rsquo;s social, political and economic needs.</Duty>
						<Duty letter='b'>Attend plenary sessions, committee hearings and meetings, on time.</Duty>
						<Duty letter='c'>Stay in the Session Hall and committee rooms until the sitting ends.</Duty>
						<Duty letter='d'>Come prepared to take part in debate knowledgeably.</Duty>
						<Duty letter='e'>Faithfully put forward the demands and interests of their constituents and of the sectors a measure affects.</Duty>
						<Duty letter='f'>Get the data and information a legislative decision needs.</Duty>
						<Duty letter='g'>Make information about their legislative work available to the public.</Duty>
						<Duty letter='h'>Speak freely, and let others be heard in turn.</Duty>
						<Duty letter='i'>Treat everyone with respect, without abusive or insulting language.</Duty>
						<Duty letter='j'>Keep to the rules of debate.</Duty>
						<Duty letter='k'>Set policy, legislate, and elect a Chief Minister to exercise executive authority on their behalf.</Duty>
						<Duty letter='l'>Perform any other lawful function needed to pass legislation.</Duty>
					</ol>
					<p className='meta-sm'>Order 9, Section 1</p>
				</Block>

				<Block
					id='where-you-come-in'
					label='Where you come in'
					title='How you can take part'
					lead='More doors than before, and one of them is a right rather than an invitation.'
				>
					<Point title='If a bill affects you, you can ask to be heard' cite='Order 81; Order 78(b)'>
						A committee may invite the public to give views on a bill. That part is up to the
						committee. But a person a bill particularly affects can petition to be heard by the
						committee, in person or through a lawyer. Parliament publishes a{' '}
						<Source href={SOURCES.positionPapers}>call for position papers</Source> and its{' '}
						<Source href={SOURCES.schedules}>committee schedules</Source>.
					</Point>
					<Point title='You can watch' cite='Orders 34, 104 and 121'>
						Sittings are open to the public unless Parliament announces otherwise, and both the plenary
						and the committees must be livestreamed on Parliament&rsquo;s website and social media.
					</Point>
					<Point title='You can read what was decided and why' cite='Orders 40, 50 and 97'>
						The daily agenda, the opposition&rsquo;s questions with the government&rsquo;s answers, and
						every committee report, including members&rsquo; dissents, are all to be made public.
					</Point>
					<Point title='Members owe you a hearing' cite='Order 9, Section 1(e) and (g)'>
						Two of a member&rsquo;s duties are yours to use: putting forward the interests of the people
						and sectors a measure affects, and making their legislative work public.{' '}
						<a href='#duties' className='rule-link'>
							The full list is above
						</a>
						.
					</Point>
					<Point title='Question Hour is not for you' cite='Order 45, Section 1'>
						Only the Loyal Opposition asks. The way in is through an opposition member.
					</Point>
				</Block>

				<Reveal>
					<section id='glossary' className='scroll-mt-24 font-sans'>
						<Head
							label='The words they use'
							title='What the words mean'
							lead='The Standing Orders brought in a new vocabulary from Westminster. These are the terms you will meet in the Journal, the Order of Business and a committee report.'
						/>

						<dl className='mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2'>
							<Term term='Standing Orders'>
								Parliament&rsquo;s rulebook. &ldquo;Standing&rdquo; because they stay in force from one
								session to the next until Parliament changes them.
							</Term>
							<Term term='Government of the Day'>
								The governing side: the Chief Minister, the Deputy Chief Ministers, the ministers who are
								members, and every member who voted for the Chief Minister.
							</Term>
							<Term term='Loyal Opposition'>
								The members who did not vote for the Chief Minister. &ldquo;Loyal&rdquo; because they
								oppose the government, not the institution.
							</Term>
							<Term term='Whip'>
								The member who keeps their side together: who speaks, who turns up for a vote, and what
								the side&rsquo;s position is.
							</Term>
							<Term term='Government Bill, Private Member Bill'>
								A bill brought by the government, which goes first, and a bill brought by a member who is
								not a minister.
							</Term>
							<Term term='Plenary'>The whole Parliament sitting together, as opposed to a committee.</Term>
							<Term term='Reading'>
								A stage a bill goes through on the floor. First reading announces it and hears the
								sponsor, second reading debates and amends it, third reading takes the final vote.
							</Term>
							<Term term='Interpellation'>
								Members questioning the sponsor of a bill on the floor. Amendments have to be raised
								here first.
							</Term>
							<Term term='Viva voce'>A voice vote. The result is recorded and no names are.</Term>
							<Term term='Division'>
								A vote taken member by member, Aye, Nay or Abstain, which any member can call.
							</Term>
							<Term term='Votes and Proceedings'>
								The record of who attended, what was decided and how each member voted in a division.
								Open to members and to people the Speaker authorises.
							</Term>
							<Term term='The Journal'>
								Parliament&rsquo;s official record of a sitting, with every nominal vote and every
								absence.
							</Term>
							<Term term='Official Report'>The near word-for-word record of the speeches.</Term>
							<Term term='Quorum'>
								How many members must be present before anything is decided: 41 in plenary.
							</Term>
							<Term term='Executive session'>
								A closed sitting on security, public safety, public health or decency. Its record is never
								disclosed.
							</Term>
							<Term term='Popular Initiative'>
								A bill proposed directly by the people. Named in the Standing Orders, not yet usable.
							</Term>
							<Term term='Wali'>
								The ceremonial head of the Bangsamoro, who opens the first session of a new Parliament.
							</Term>
						</dl>
					</section>
				</Reveal>

				<Reveal>
					<section id='sources' className='scroll-mt-24'>
						<Head label='Read the originals' title='The documents behind this page' />
						<div className='mt-8 flex flex-wrap gap-2.5'>
							<SourcePill href={SOURCES.gazette}>Resolution No. 01, Bangsamoro Gazette</SourcePill>
							<SourcePill href={SOURCES.pdf}>Standing Orders (PDF, 49 pages)</SourcePill>
							<SourcePill href={SOURCES.organicLaw}>Organic Law (RA 11054)</SourcePill>
							<SourcePill href={SOURCES.schedules}>Sitting schedules</SourcePill>
							<SourcePill href={BTA}>The Transition Authority&rsquo;s rules</SourcePill>
						</div>
						<p className='mt-8 bb-body text-[var(--ink-3)]'>
							This page puts the Standing Orders into ordinary words. It is not a replacement for them,
							and it leaves out the machinery of motions, points of order and the gavel that matters
							only to a member mid-debate. Parliament published them as a scanned document; every
							point above was checked against the full text and names the Order it came from, so you
							can check it too. Where this page and the Standing Orders disagree, the Standing Orders are
							right.
						</p>
					</section>
				</Reveal>
			</ReadingColumn>
		</>
	)
}
