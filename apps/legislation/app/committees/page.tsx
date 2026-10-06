import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '../_components/page-header'
import { Reveal } from '../_components/reveal'
import { getCommitteesDataset } from '../_lib/committees-data'

export const metadata: Metadata = {
	title: 'Committees',
	description:
		'The committees of the Bangsamoro Parliament — what each one has jurisdiction over, who chairs it, who sits on it, and the measures referred to it.',
}

/* ============================================================
   What a committee is, in the Parliament's own terms

   Written from the Parliament's published explanation of its
   committee system and kept in that register: short sentences,
   ordinary words, one idea each. A reader who has never watched a
   sitting should be able to follow all of it without looking
   anything up, and nothing here needs a reader to already know
   what "referral" or "oversight" means before the sentence makes
   sense — each is said plainly the first time it appears.

   Three things this page did not say before and now does. A
   committee's work does not stop when a law passes: it is also
   supposed to check that the law is being carried out. The report
   a committee files records dissent, not just agreement. And the
   hearings are open — which on a site about public records is the
   single most useful fact on the page.
   ============================================================ */

/** What a committee does, across everything it handles. */
const functions = [
	{ verb: 'Examines', detail: 'bills and resolutions' },
	{ verb: 'Discusses', detail: 'issues within its jurisdiction' },
	{ verb: 'Hears', detail: 'experts, stakeholders, and the public' },
	{ verb: 'Recommends', detail: 'action to the Parliament' },
	{ verb: 'Prepares', detail: 'committee reports' },
	{ verb: 'Exercises', detail: 'oversight of laws already passed' },
]

/** What happens to one measure, in the order it happens. */
const stages = [
	{
		label: 'It gets referred',
		detail:
			'A measure is read into the record on first reading and sent to the committee whose subject it falls under. What the measure is about decides which committee gets it.',
	},
	{
		label: 'The committee works on it',
		detail:
			'Members study the measure and debate its provisions. They can call in experts, consult the people it affects, hold public hearings, and go and look for themselves. They can propose changes to it.',
	},
	{
		label: 'The committee decides',
		detail:
			'It may adopt the measure, amend it, rewrite it, or reject it outright. A measure the committee never acts on simply stops here, which is what happens to most of them.',
	},
	{
		label: 'It files a report',
		detail:
			'Every measure the committee considers gets a written report: what was said, what the experts told them, what was changed and why. Members who voted sign it — in favour, with reservation, or against.',
	},
	{
		label: 'And it keeps watching',
		detail:
			'The work does not end when a law passes. The committee also checks whether the ministries are carrying it out, and carrying it out the way Parliament meant.',
	},
]

export default function CommitteesPage() {
	const dataset = getCommitteesDataset()
	const { committees, stats } = dataset

	return (
		<>
			{/* The middle cut rather than the small one. `compact` is for a
			    masthead that is a label over a register of hundreds of rows, where
			    the headline should get out of the way; twenty-four committees is a
			    page a reader arrives at rather than scrolls past, and the claim can
			    be the size of a claim. */}
			<PageHeader
				emphasis='brand'
				align='left'
				size='compact'
				eyebrow={`${stats.total} committees`}
				title='Where a bill is worked on,'
				titleMuted='before anyone votes on it.'
				description={`A committee takes charge of one subject — health, public works, the budget — and does the detailed work on every measure under it; most of a bill’s life happens here, not on the floor. ${stats.statutory} of these ${stats.total} are permanent, and together they hold ${stats.referrals.toLocaleString()} referred measures and ${stats.reports} reports.`}
			/>

			{/* ---- The grid ----

			    Interior rules only: every cell draws its own top and left edge, and
			    the grid is nudged a pixel up and left so the outermost of those are
			    clipped away. That separates the cells at every breakpoint without
			    hand-counting which one starts a row or a column. */}
			<section className='bb-container py-[clamp(3.75rem,7vw,6.5rem)]'>
				<div className='overflow-hidden border-t border-[var(--rule)]'>
					<div className='-ml-px -mt-px grid sm:grid-cols-2 lg:grid-cols-3'>
						{committees.map((committee, index) => (
							/* Not a link itself — the chair's name is a link of its own, and
							   an anchor cannot sit inside an anchor. The heading's link
							   stretches over the whole cell instead, so the card still opens
							   the committee wherever it is clicked, and the chair, sitting
							   above that overlay, opens their profile. */
							<div
								key={committee.slug}
								style={{ '--row-index': index } as React.CSSProperties}
								/* No horizontal padding while the grid is one card wide. A card
								   in a single column already has the page's own margin either
								   side of it, and its padding sits inside that — so the type ran
								   at two margins' distance from the edge and the line got shorter
								   on the screen with the least room for it. From `sm`, where two
								   cards share a row and a card needs its own edges, the padding
								   comes back. */
								className='row-in relative flex h-full flex-col border-l border-t border-[var(--rule)] py-6 transition hover:bg-[var(--paper-2)] sm:p-8 lg:p-10'
							>
								<h2 className='text-[1.35rem] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
									<Link
										href={`/committees/${committee.slug}`}
										className='after:absolute after:inset-0 after:content-[""]'
									>
										{committee.name}
									</Link>
								</h2>

								{committee.chairperson ? (
									<p className='meta mt-1.5'>
										Chaired by{' '}
										{committee.chairperson.slug ? (
											<Link
												href={`/members/${committee.chairperson.slug}`}
												className='relative underline decoration-[var(--rule)] underline-offset-2 transition hover:text-[var(--ink)] hover:decoration-[var(--accent)]'
											>
												{committee.chairperson.displayName}
											</Link>
										) : (
											committee.chairperson.displayName
										)}
									</p>
								) : null}

								{/* The committee's own words on what it covers, trimmed to a few
								    lines — the full statement is on its page. */}
								<p className='mt-3.5 line-clamp-4 bb-body text-[var(--ink-2)]'>
									{committee.jurisdiction}
								</p>

								{/* Pinned to the bottom so the badges line up across a row
								    regardless of how long each jurisdiction runs. */}
								<div className='mt-auto flex flex-wrap gap-1.5 pt-5'>
									{/* First in the row, because it says what kind of committee this
									    is and the rest are counts. Only on the seventeen: a badge on
									    every card distinguishes nothing. */}
									{committee.statutory ? (
										<span className='badge badge-plain badge-committee'>Statutory</span>
									) : null}
									<span className='badge badge-plain badge-idle'>
										{committee.memberCount} seated
									</span>
									{committee.referredBills.length + committee.referredResolutions.length > 0 ? (
										<span className='badge badge-plain badge-early'>
											{committee.referredBills.length + committee.referredResolutions.length}{' '}
											referred
										</span>
									) : null}
									{committee.reports.length > 0 ? (
										<span className='badge badge-plain badge-done'>
											{committee.reports.length} reports
										</span>
									) : null}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ---- What a committee does ----

			    The six verbs first, then the five steps. The verbs are what a
			    committee is for and fit on one screen; the steps are what it
			    actually does to one measure and take longer to read. A reader who
			    stops after the first list has still got the answer. */}
			<section className='bb-container border-t border-[var(--rule)] py-[clamp(3.75rem,7vw,6.5rem)]'>
				<Reveal>
					<div>
						<p className='eyebrow'>What a committee does</p>
						<h2 className='section-title mt-4 max-w-3xl'>
							Six jobs, on one subject each.
						</h2>
						<p className='mt-5 max-w-2xl bb-body text-[var(--ink-2)]'>
							A committee is a group of Members of the Parliament organised around one
							area of concern. Every committee does the same six things within it.
						</p>
					</div>
				</Reveal>

				<div className='mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3'>
					{functions.map((job, index) => (
						<Reveal key={job.verb} delay={index * 50}>
							<p className='border-t border-[var(--rule-soft)] pt-5 bb-body text-[var(--ink-2)]'>
								<strong className='font-semibold text-[var(--ink)]'>{job.verb}</strong>{' '}
								{job.detail}
							</p>
						</Reveal>
					))}
				</div>
			</section>

			{/* ---- What happens to a measure ---- */}
			<section className='bb-container border-t border-[var(--rule)] py-[clamp(3.75rem,7vw,6.5rem)]'>
				<Reveal>
					<div>
						<p className='eyebrow'>What happens to a measure</p>
						<h2 className='section-title mt-4 max-w-3xl'>
							From referral to the report, and after it.
						</h2>
					</div>
				</Reveal>

				<div className='mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3'>
					{stages.map((stage, index) => (
						<Reveal key={stage.label} delay={index * 60}>
							<div className='border-t border-[var(--rule-soft)] pt-5'>
								{/* The numeral leads the label on one line — it counts the
								    step, so it belongs to the heading rather than sitting
								    above it as a label of its own. */}
								<p className='item-title font-title'>
									<span className='num text-[var(--ink-mute)]'>
										{String(index + 1).padStart(2, '0')}.
									</span>{' '}
									{stage.label}
								</p>
								<p className='mt-2.5 bb-body text-[var(--ink-2)]'>{stage.detail}</p>
							</div>
						</Reveal>
					))}
				</div>

				{/* The one thing on this page a reader can act on, so it is set apart
				    from the steps rather than being the sixth of them. */}
				<Reveal>
					<div className='mt-12 border-l-2 border-[var(--accent)] bg-[var(--paper-2)] px-6 py-5 sm:px-8 sm:py-6'>
						<p className='eyebrow'>You can go</p>
						<p className='mt-3 bb-body text-[var(--ink-2)]'>
							Committee hearings and consultations are open to the general public. A
							committee holds them to gather facts and hear views on a measure before it
							reports back, which makes this the stage where somebody outside the
							Parliament can still change what a law says. Schedules are announced by the
							Parliament rather than here.
						</p>
					</div>
				</Reveal>
			</section>

		</>
	)
}
