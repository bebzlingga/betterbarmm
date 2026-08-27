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

/** What a committee does to a bill, in the order it happens. */
const stages = [
	{
		label: 'Referral',
		detail:
			'A bill is read into the record on first reading and referred to the committee whose subject it falls under. The referral decides who does the studying.',
	},
	{
		label: 'Study and public hearings',
		detail:
			'The committee reads the bill in detail, calls agencies and affected groups, and holds hearings. This is where public input carries the most weight.',
	},
	{
		label: 'Committee report',
		detail:
			'The committee reports the bill back — as filed, amended, or substituted. A bill never reported out simply stops here, which is what happens to most.',
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
				eyebrow={`${stats.total} committees`}
				title='Where a bill is worked on,'
				titleMuted='before anyone votes on it.'
				description={`After first reading, every measure is referred to the committee whose subject it falls under. These ${stats.total} committees hold ${stats.referrals.toLocaleString()} referred measures between them and have filed ${stats.reports} reports. Each one below states its own jurisdiction, in its own words.`}
			/>

			{/* ---- The grid ----

			    Interior rules only: every cell draws its own top and left edge, and
			    the grid is nudged a pixel up and left so the outermost of those are
			    clipped away. That separates the cells at every breakpoint without
			    hand-counting which one starts a row or a column. */}
			<section className='bb-container pb-4'>
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
								className='row-in relative flex h-full flex-col border-l border-t border-[var(--rule)] p-6 transition hover:bg-[var(--paper-2)] sm:p-8 lg:p-10'
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

			{/* ---- What a committee does ---- */}
			<section className='bb-container border-t border-[var(--rule)] bb-section'>
				<Reveal>
					<div>
						<p className='eyebrow'>What a committee does</p>
						<h2 className='section-title mt-4 max-w-3xl'>
							Three things happen to a bill in committee.
						</h2>
					</div>
				</Reveal>

				<div className='mt-10 grid gap-x-10 gap-y-8 lg:grid-cols-3'>
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
			</section>

		</>
	)
}
