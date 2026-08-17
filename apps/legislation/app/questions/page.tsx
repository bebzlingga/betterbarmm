import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '../_components/page-header'
import { ReadingColumn } from '../_components/reading-column'
import { Reveal } from '../_components/reveal'
import type { TocItem } from '../_components/table-of-contents'

export const metadata: Metadata = {
	title: 'Common questions',
	description:
		'Short answers about the Bangsamoro Parliament — who its members are, how a law is made, why so few votes are on the record, what a committee can compel, and how an ordinary person can take part.',
}

/* ============================================================
   Common questions

   This began as the opening section of "How Parliament works" and outgrew
   it. The two pages do different jobs and should stay that way: this one
   answers the question someone arrived with, in a line or two, and hands
   them off. The other one is the reference, where every claim carries the
   rule it came from.

   So the discipline here is brevity and the link. An answer that grows past
   three sentences belongs on the reference page, and this one should point
   at it rather than reproduce it — otherwise the site is back to two pages
   saying the same thing in different words, which is the problem the merge
   was undoing.

   Several of these exist to correct an assumption rather than fill a gap:
   Manila gets notice and not a veto, refusing to sign passes the bill,
   Question Hour has no public microphone, and a committee can compel you.
   ============================================================ */

const POSITION_PAPERS = 'https://parliament.bangsamoro.gov.ph/position-papers/'
const SCHEDULES = 'https://parliament.bangsamoro.gov.ph/schedules/'

/** A question and its short answer. */
function Question({ ask, children }: { ask: string; children: React.ReactNode }) {
	return (
		<div className='border-t border-[var(--rule-soft)] py-6 first:border-t-0 first:pt-0'>
			<h3 className='item-title text-[var(--ink)]'>{ask}</h3>
			<div className='copy mt-2.5 text-[var(--ink-2)]'>{children}</div>
		</div>
	)
}

/**
 * Where the whole answer lives, with the rule it comes from. Every question
 * ends in one of these — an answer here that stands alone is an answer that
 * has grown too long for this page.
 */
function Full({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<Link href={href} className='rule-link'>
			{children}
		</Link>
	)
}

function Outside({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<a href={href} target='_blank' rel='noreferrer' className='rule-link'>
			{children}
		</a>
	)
}

/* The page's sections, in the order they appear, and the index in the margin
   beside them. Kept in one place so the two cannot drift apart. */
const SECTIONS: TocItem[] = [
	{ id: 'the-parliament', label: 'The Parliament itself' },
	{ id: 'measures', label: 'Bills, acts, resolutions' },
	{ id: 'the-record', label: 'Votes and the record' },
	{ id: 'taking-part', label: 'Taking part' },
	{ id: 'powers', label: 'Powers people miss' },
]

/**
 * A section, headed the way "How Parliament works" is: the kicker in the
 * accent and the claim under it, both ranged left, so the heading shares an
 * edge with the questions beneath it and with the index in the margin.
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
			{/* DM Sans below the masthead, and `scroll-mt` to clear the sticky
			    header — see the notes on the same section in `how-parliament-works`. */}
			<section id={id} className='scroll-mt-32 py-12 font-sans lg:py-14'>
				<p className='eyebrow'>{label}</p>
				<h2 className='section-title mt-4 max-w-3xl'>{title}</h2>
				{lead ? <p className='section-lead mt-4 max-w-2xl text-[var(--ink-3)]'>{lead}</p> : null}

				<div className='mt-10 max-w-4xl'>{children}</div>
			</section>
		</Reveal>
	)
}

export default function QuestionsPage() {
	return (
		<>
			<PageHeader
				emphasis='brand'
				align='left'
				size='compact'
				eyebrow='The questions people actually ask'
				title='Short answers first.'
				titleMuted='The long ones are a click away.'
				description='Most people come to a parliament with one specific question, not with an interest in parliamentary procedure. These are the ones that come up, answered in a line or two — with a link to the page that gives the whole answer and names the rule it rests on.'
			/>

			<ReadingColumn sections={SECTIONS}>
				<Block
					id='the-parliament'
					label='The Parliament itself'
					title='What this body actually is.'
					lead='It is not a national legislature, not an elected one, and not only a legislature.'
				>
					<Question ask='Is this the same as Congress?'>
						No. Parliament makes law for the Bangsamoro region only, using powers a national law
						handed it. It sends copies of everything it passes to the President and to Congress, but
						that is notice — nobody in Manila has to approve a Bangsamoro law for it to take effect.{' '}
						<Full href='/how-parliament-works#limits'>What holds it back</Full>.
					</Question>
					<Question ask='Did anyone vote for these 80 members?'>
						Not yet. Every member of the Bangsamoro Transition Authority holds the seat by
						appointment. The first election under the Bangsamoro Electoral Code changes that; until
						then this is a government of appointees.{' '}
						<Full href='/how-parliament-works#what-it-is'>What it is</Full>.
					</Question>
					<Question ask='Who is actually in charge — the Speaker or the Chief Minister?'>
						Both, of different things. The Speaker presides over the Parliament and its proceedings;
						the Chief Minister leads the government that runs the region. During the transition the
						same body holds both kinds of power, which is why the distinction gets blurred.{' '}
						<Full href='/how-parliament-works#what-it-is'>What it is</Full>.
					</Question>
					<Question ask='Who is the Wali?'>
						The ceremonial head of the Bangsamoro. The Wali opens the inaugural session of a new
						Parliament by sounding the agong, and does not run its business.{' '}
						<Full href='/how-parliament-works#glossary'>The words they use</Full>.
					</Question>
					<Question ask='Can Parliament simply change its own rules?'>
						Most of them, yes — a majority of all members is enough, and the change can be proposed
						by the Speaker, by any member, or by the Committee on Rules. The exception is anything
						fixed by the Organic Law, which Parliament cannot touch.{' '}
						<Full href='/how-parliament-works#limits'>What holds it back</Full>.
					</Question>
				</Block>

				<Block
					id='measures'
					label='Bills, acts, resolutions'
					title='What Parliament produces.'
					lead='Three words that get used interchangeably in the news and mean quite different things here.'
				>
					<Question ask='What is the difference between a bill, an act, and a resolution?'>
						A bill is a proposal. An act is a bill that made it all the way through and became law —
						here they are called Bangsamoro Autonomy Acts. A resolution is Parliament saying
						something in its own name: it does not become law and binds nobody outside the
						Parliament. <Full href='/legislative-process'>Both paths, step by step</Full>.
					</Question>
					<Question ask='Who is allowed to file a bill?'>
						A member holding no executive post, the Chief Minister or a cabinet minister, or a
						committee that decided through its own inquiries that a law is needed. Which of the
						three filed it tells you a lot about how far it is likely to get.{' '}
						<Full href='/legislative-process#the-bill-path'>The path a bill takes</Full>.
					</Question>
					<Question ask='What happens if the Chief Minister refuses to sign a bill?'>
						Refusing changes nothing on its own. Thirty days after a passed bill reaches the Chief
						Minister it becomes law whether or not anyone signed it — the deadline works in the
						bill&rsquo;s favour. <Full href='/how-parliament-works#limits'>What holds it back</Full>
						.
					</Question>
					<Question ask='When does a new law actually start to apply to me?'>
						Fifteen days after it is printed in full in a newspaper circulating in the region — not
						the day it was passed, and not the day it was signed.{' '}
						<Full href='/legislative-process#the-bill-path'>The path a bill takes</Full>.
					</Question>
					<Question ask='Why are there so many resolutions and so few acts?'>
						Because a resolution is much easier to pass and does much less. One that concerns
						Parliament&rsquo;s own business, or expresses an opinion, sympathy, or commendation, can
						skip the committee stage entirely and be adopted on the floor.{' '}
						<Full href='/resolutions'>Every resolution on record</Full>.
					</Question>
					<Question ask='A law was passed, so why has nothing changed?'>
						Passing a law and putting it into effect are separate things. The detailed rules that
						make an act work in practice — the implementing rules and regulations — are issued
						afterwards, and an act without them can sit on the books doing very little.{' '}
						<Full href='/irr'>Implementing rules on record</Full>.
					</Question>
				</Block>

				<Block
					id='the-record'
					label='Votes and the record'
					title='What you can see, and what was never written down.'
					lead='The honest answer to most questions here is that the record does not exist — and there is a rule that explains why.'
				>
					<Question ask='How do I find out how my member voted on something?'>
						Usually you cannot, and that is not an oversight. Only the final vote on a bill is taken
						name by name; almost everything else passes on a voice vote that records the outcome and
						nobody&rsquo;s name.{' '}
						<Full href='/how-parliament-works#voting-and-the-record'>Voting and the record</Full>.
					</Question>
					<Question ask='Why are there only a handful of recorded votes on this site?'>
						Because there are only a handful in the source. The rules require the Journal to write
						down every vote taken name by name, and those are the ones that exist — the rest went
						through by voice. Nothing has been left out here.{' '}
						<Full href='/journal'>The recorded votes</Full>.
					</Question>
					<Question ask='Where is the official record of a sitting kept?'>
						In the Journal, Parliament&rsquo;s own written record of what happened. It must carry
						the proclamation convening Parliament, the titles of measures presented, and every named
						vote in full. <Full href='/journal'>The Journal</Full>.
					</Question>
					<Question ask='Are sittings broadcast?'>
						The rules say they should be — closed-circuit viewing in members&rsquo; offices, plus
						broadcasting, recording, live streaming, feeds to news media, and closed captioning,
						under rules the Speaker issues.{' '}
						<Full href='/how-parliament-works#voting-and-the-record'>Voting and the record</Full>.
					</Question>
					<Question ask='What language is any of this in?'>
						Proceedings are recorded in the language they were spoken in and translated into
						Filipino, Arabic, and English. A member may speak in any language used in the
						Bangsamoro.{' '}
						<Full href='/how-parliament-works#voting-and-the-record'>Voting and the record</Full>.
					</Question>
				</Block>

				<Block
					id='taking-part'
					label='Taking part'
					title='Where an outsider actually fits.'
					lead='There is one stage, and most effort aimed at the others is wasted. This is the most practical thing on the page.'
				>
					<Question ask='Can I attend a session, or speak at one?'>
						You can watch — sittings are meant to be broadcast and live-streamed — but you cannot
						speak on the floor. The one place the rules make room for an outsider is a committee
						meeting. <Full href='/how-parliament-works#where-you-come-in'>Where you come in</Full>.
					</Question>
					<Question ask='There is a bill I want changed. Who do I write to?'>
						The committee holding it, while it is still there. Once a bill leaves committee, only a
						member can move a change for you, and at the final vote nothing can be changed at all.{' '}
						<Outside href={SCHEDULES}>Committee schedules</Outside> say where a bill is being heard.
					</Question>
					<Question ask='What should a position paper actually say?'>
						Name the measure, name the section, and give the wording you want instead. A committee
						can rewrite text before it reports a bill back, so a specific proposed change is
						something it can act on; a general statement of support or opposition is not.{' '}
						<Outside href={POSITION_PAPERS}>Parliament&rsquo;s call for position papers</Outside>.
					</Question>
					<Question ask='Is a committee obliged to hear me?'>
						No. The rules let a committee consult experts, ministries, and the public — they do not
						require it, and a committee can report a measure out without hearing from anyone.{' '}
						<Full href='/how-parliament-works#where-you-come-in'>Where you come in</Full>.
					</Question>
					<Question ask='Question Hour sounds like my chance to ask something. Is it?'>
						No. Question Hour is members questioning the Cabinet, in writing, submitted at least
						three days in advance through the Secretary-General. There is no public microphone in
						it. <Full href='/how-parliament-works#the-calendar'>The calendar</Full>.
					</Question>
					<Question ask='Can I just ask my member to do something?'>
						You can, and the rulebook is on your side: a member&rsquo;s listed duties include
						faithfully putting forward the demands of the people they represent and making
						information about their legislative work public.{' '}
						<Full href='/members'>Every member, and what they have filed</Full>.
					</Question>
				</Block>

				<Block
					id='powers'
					label='Powers people miss'
					title='The parts that surprise people.'
					lead='Four powers that are in the rulebook, are rarely discussed, and can reach an ordinary person directly.'
				>
					<Question ask='Can a committee force me to show up?'>
						Yes. A committee can order you to appear, and order you to hand over documents. Inside
						the region the Sergeant-at-Arms delivers the order; outside it, the local police do.{' '}
						<Full href='/how-parliament-works#committees'>Committees</Full>.
					</Question>
					<Question ask='And what if I ignore it?'>
						Parliament and its committees can hold a person in contempt — defined as behaviour
						defying their authority and dignity, or getting in the way of their work.{' '}
						<Full href='/how-parliament-works#committees'>Committees</Full>.
					</Question>
					<Question ask='Can a member be arrested?'>
						Yes, in most circumstances. The protection is narrow: it applies only while Parliament
						is in session, and only to offences carrying no more than six years&rsquo; imprisonment.{' '}
						<Full href='/how-parliament-works#members'>Members</Full>.
					</Question>
					<Question ask='Can a member vote on something they stand to profit from?'>
						No. A member with a conflict of interest, or who stands to gain or lose financially on a
						measure, must take no part in the proceedings on it at all.{' '}
						<Full href='/how-parliament-works#members'>Members</Full>.
					</Question>
					<Question ask='Can Parliament punish its own members?'>
						Yes, without anyone outside being involved. A majority of all members can censure or
						reprimand a member; two thirds can suspend one for up to six months.{' '}
						<Full href='/how-parliament-works#members'>Members</Full>.
					</Question>
				</Block>

				<Reveal>
					<section className='py-14'>
						<p className='label label-strong'>Where the full answers are</p>
						<div className='mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm'>
							<Link href='/how-parliament-works' className='rule-link'>
								Powers, limits, and the rulebook
							</Link>
							<Link href='/legislative-process' className='rule-link'>
								How a measure becomes law
							</Link>
						</div>
						<p className='mt-5 max-w-3xl text-[13px] leading-6 text-[var(--ink-3)]'>
							Every answer above is short on purpose. The two pages behind it carry the same ground
							in full, and name the rule each point rests on — where they and this page differ, they
							are right.
						</p>
					</section>
				</Reveal>
			</ReadingColumn>
		</>
	)
}
