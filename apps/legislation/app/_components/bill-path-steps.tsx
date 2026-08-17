import Link from 'next/link'
import type { StatusTone } from '../_lib/labels'

/* ============================================================
   The path a bill takes

   Parliament publishes this as thirteen steps written in rules citations —
   "Sec. 2(c), Rule XXI" — which is precise and unreadable. This is the same
   path in seven steps and plain sentences, with the one stage a member of
   the public can actually enter marked as such, because that is the fact a
   reader is looking for and Parliament's own text states it.

   Every claim here comes from that page: the thirty days the Chief Minister
   has, the fifteen days to effectivity, the three days bills must sit before
   a third-reading vote, and the committee's power to solicit opinions from
   the public.

   The data lives apart from the two views of it: the home page shows the
   seven labels as an interactive rail, the legislative process page walks
   the whole thing down the page.
   ============================================================ */

export type BillStep = {
	label: string
	/** One line, said the way you would say it aloud. */
	summary: string
	/**
	 * The whole stage in one paragraph: who is acting, what can still change,
	 * what the clock is, and how it ends. This was four labelled parts once,
	 * and reading it back the labels were doing the work of full stops —
	 * chopping one continuous account of a stage into headings a reader had to
	 * reassemble.
	 */
	detail: React.ReactNode
	tone: StatusTone
	/** Where a member of the public can act at this stage, if anywhere. */
	publicAction?: { text: string; href: string; label: string }
}

export const BILL_PATH_STEPS: BillStep[] = [
	{
		label: 'Filed',
		summary: 'Someone writes it and hands it in.',
		tone: 'filed',
		detail: (
			<>
				A bill can be filed by a member who holds no executive post, by the Chief Minister or a
				cabinet minister, or by a committee that decided through its own inquiries that a law is
				needed — and which of the three it was tells you a good deal about how far it will get.{' '}
				<Link href='/members' className='rule-link'>
					Every member is listed here
				</Link>{' '}
				with what they have filed. The bill goes to the Bills and Index Division, which records it
				and stamps it with a number and the date; that number is what the committee report, the
				Journal, and the eventual act all refer back to. Nothing else happens at this stage — no
				committee holds the bill, no member speaks to it, and no vote is taken. It waits for the
				Majority Floor Leader to put it on the agenda, and far more bills are filed than are ever
				reported out of a committee.
			</>
		),
	},
	{
		label: 'First reading',
		summary: 'Its number, title, and author are read out. Nothing is debated.',
		tone: 'early',
		detail: (
			<>
				The Secretary-General reads the bill’s number, title, and author aloud, and the author says
				whether it is a cabinet bill or a private member bill and may ask for co-authors to be
				added. Then one thing is decided: the Speaker refers the bill to the committee whose subject
				it falls under, which settles who will actually handle it —{' '}
				<Link href='/committees' className='rule-link'>
					every committee is listed here
				</Link>
				. No debate takes place. Nobody speaks to the merits, nobody votes, and a reading is not a
				signal of support. The whole thing takes about as long as reading a title aloud, and the
				committee stage follows quickly once the referral is made.
			</>
		),
	},
	{
		label: 'Committee',
		summary: 'A committee goes through it line by line — and can ask the public in.',
		tone: 'committee',
		detail: (
			<>
				The author opens with a sponsorship speech, and the committee holding the referral takes the
				bill line by line, in meetings and hearings its own members must attend. It may consult and
				ask for views from experts, ministries, the public, and anyone else with an interest — the
				only stage the rules open to an outsider, and one they permit rather than require.
				Everything can change here: the committee can propose amendments or a full rewrite before it
				reports back, which makes this, and not the floor, where a measure is really shaped. It ends
				with a report to the plenary or with nothing at all — a bill that is never reported out
				simply stops, with no vote to lose and no decision anyone has to record.
			</>
		),
		publicAction: {
			text: 'This is the stage where an outsider can change a bill. Parliament calls for position papers and publishes its committee schedules.',
			href: 'https://parliament.bangsamoro.gov.ph/position-papers/',
			label: 'Call for position papers',
		},
	},
	{
		label: 'Second reading',
		summary: 'The whole Parliament argues it out and amends it.',
		tone: 'advancing',
		detail: (
			<>
				The whole Parliament debates the committee’s report on the floor — and what changed between
				the bill as filed and that report is what the committee did. Amendments come from the
				committee and from individual members, each one debated and voted on separately, and a
				member is the only route a change has left by this point. Approval is by <em>viva voce</em>,
				a voice vote: members answer aloud together, so the result goes on the record and who said
				what does not. Most of what Parliament passes goes through exactly this way. The stage ends
				either approved and sent on to third reading, or sent back to committee — which reopens the
				one place the text can properly be reworked.
			</>
		),
	},
	{
		label: 'Third reading',
		summary: 'A final vote, by name. No more changes.',
		tone: 'passed',
		detail: (
			<>
				The text is fixed. No amendments are allowed, because the wording was settled at second
				reading and cannot be touched again. Printed copies must have been in members’ hands for
				three days beforehand — unless the Chief Minister certifies the bill as urgent, which
				cancels that wait and can make the window vanish. The Speaker then calls the roll, each
				member answers by name, and anyone abstaining has to say so aloud without having to give a
				reason. This is the only stage that leaves a record of how individual members stood: the
				rules require the Journal to carry every named vote in full, which is why{' '}
				<Link href='/journal' className='rule-link'>
					a named vote exists
				</Link>{' '}
				for a handful of measures and no others.
			</>
		),
		publicAction: {
			text: 'This is the vote worth watching, because it is the only one taken by name.',
			href: '/journal',
			label: 'Recorded votes',
		},
	},
	{
		label: 'Signed',
		summary: 'The Chief Minister signs — or does nothing, and it passes anyway.',
		tone: 'passed',
		detail: (
			<>
				The approved bill is signed by the Secretary-General and the Speaker on its way out, and
				Parliament’s part is then finished — the decision sits with the Chief Minister alone, the
				only stretch of the path where it does. The clock is thirty days from the day the bill
				arrives. If those days run out with no signature, it becomes law anyway, exactly as if it
				had been signed: silence is not refusal here. Nothing is debated or amended at this stage,
				and the Chief Minister receives the bill exactly as Parliament approved it.
			</>
		),
	},
	{
		label: 'In force',
		summary: 'Published, then law fifteen days later.',
		tone: 'enacted',
		detail: (
			<>
				Publication starts the clock, not the signature: the act takes effect fifteen days after it
				is printed in full in a newspaper circulating in the region. Within ten working days of
				approval the Speaker sends a certified copy to the President and to the Congress of the
				Philippines — that is the national government being kept informed, not a step the act has to
				clear. From here it is a Bangsamoro Autonomy Act with a number every later measure amending
				or repealing it will cite;{' '}
				<Link href='/acts' className='rule-link'>
					every act passed is listed here
				</Link>
				. What is still missing is the implementing rules: an act says comparatively little about
				how it will run day to day, and one issued without them can sit on the books changing
				nothing —{' '}
				<Link href='/irr' className='rule-link'>
					the ones on record are here
				</Link>
				.
			</>
		),
	},
]
