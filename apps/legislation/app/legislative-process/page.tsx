import type { Metadata } from 'next'
import Link from 'next/link'
import { BillPath } from '../_components/bill-path'
import { PageHeader } from '../_components/page-header'
import { ReadingColumn } from '../_components/reading-column'
import { Reveal } from '../_components/reveal'
import type { TocItem } from '../_components/table-of-contents'
import { Timeline } from '../_components/timeline'
import type { StatusTone } from '../_lib/labels'

export const metadata: Metadata = {
	title: 'The legislative process',
	description:
		'How a bill becomes a Bangsamoro Autonomy Act, and how a resolution is adopted — Parliament’s own process in plain language, step by step.',
}

/* ============================================================
   The legislative process

   Parliament sets this out twice — once for bills, once for resolutions —
   as thirteen and eleven steps of rules citations. The bill path is the
   interactive rail; the resolution path is short enough to read straight
   down, and differs from the bill path in ways worth stating outright: no
   third reading, no Chief Minister, and a shortcut that skips committee
   altogether.

   Laid out the way "The rules" and "How Parliament works" are, since the
   three are one set: the kicker in the accent over a centred claim, and the
   substance ranged left in a single column beneath it.
   ============================================================ */

const PROCESS_SOURCE = 'https://parliament.bangsamoro.gov.ph/legislative-process-bill/'

type Step = {
	label: string
	body: string
	/* The same tones the bill path uses at the equivalent stage, so the two
	   timelines read as two routes through one building. */
	tone: StatusTone
}

const RESOLUTION_STEPS: Step[] = [
	{
		label: 'Filed',
		body: 'Any member may file a resolution. It goes to the Bills and Index Division, which records its number and the date it was received.',
		tone: 'filed',
	},
	{
		label: 'Calendared',
		body: 'The Majority Floor Leader puts it on the legislative agenda.',
		tone: 'early',
	},
	{
		label: 'First reading',
		body: 'The Secretary-General reads the resolution’s number, title, and author. The Speaker then refers it to the appropriate committee.',
		tone: 'early',
	},
	{
		label: 'Committee',
		body: 'The committee examines and deliberates on it, and may consult experts, ministries, the public, and other interested parties. It may propose amendments before reporting back to the plenary.',
		tone: 'committee',
	},
	{
		label: 'Plenary debate',
		body: 'Members debate the committee report and any amendments — from the committee or from individual members on the floor. Both kinds are debated and voted on. Parliament may send the resolution back to committee.',
		tone: 'advancing',
	},
	{
		label: 'Adopted',
		body: 'Once it has cleared those stages, the adopted resolution is printed and signed by the Secretary-General and the Speaker.',
		tone: 'passed',
	},
	{
		label: 'Sent to Manila',
		body: 'Within ten working days of approval, the Speaker submits a certified true copy to the President and to the Congress of the Philippines — the same requirement that applies to acts.',
		tone: 'enacted',
	},
]

type Difference = {
	title: string
	body: React.ReactNode
	cite: string
}

const DIFFERENCES: Difference[] = [
	{
		title: 'No third reading',
		body: 'A resolution is adopted after the plenary deliberation. There is no final reading and so no roll-call vote — which means no resolution carries a record of how any individual member voted.',
		cite: 'Legislative process, adoption of resolutions',
	},
	{
		title: 'No Chief Minister',
		body: 'A resolution is not presented to the Chief Minister and does not become law. It is Parliament stating its own position, and it binds nobody outside the Parliament unless some other law gives it force.',
		cite: 'Legislative process, adoption of resolutions',
	},
	{
		title: 'A simple resolution can skip committee',
		body: 'Where a resolution concerns Parliament’s own procedures, needs immediate action, or expresses an opinion, sympathy, or commendation, it is treated as a simple resolution and moved to the Business for the Day — debated and adopted without going through a committee at all.',
		cite: 'Rules, Rule XVII, and the legislative process',
	},
]

/* The page's sections, in the order they appear, and the index in the margin
   beside them. Kept in one place so the two cannot drift apart. */
const SECTIONS: TocItem[] = [
	{ id: 'the-bill-path', label: 'How a bill becomes law' },
	{ id: 'resolutions', label: 'Resolutions' },
	{ id: 'bill-or-resolution', label: 'Bill or resolution' },
	{ id: 'sources', label: 'Where this comes from' },
]

/**
 * A section, headed the way the chapters on "How Parliament works" and "The
 * rules" are: the kicker in the accent and the claim under it, ranged left, so
 * the heading shares an edge with the substance beneath it and with the index
 * in the margin.
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
	lead?: React.ReactNode
	children: React.ReactNode
}) {
	return (
		<Reveal>
			{/* DM Sans below the masthead — see the note on the same section in
			    `how-parliament-works`. The kicker keeps Outfit: `.eyebrow` sets its
			    own family. `scroll-mt` clears the sticky header so a jump from the
			    index lands on the kicker. */}
			<section id={id} className='scroll-mt-32 py-12 font-sans lg:py-14'>
				<p className='eyebrow'>{label}</p>
				<h2 className='section-title mt-4 max-w-3xl'>{title}</h2>
				{lead ? <p className='section-lead mt-4 max-w-2xl text-[var(--ink-3)]'>{lead}</p> : null}

				<div className='mt-10 max-w-4xl'>{children}</div>
			</section>
		</Reveal>
	)
}

export default function LegislativeProcessPage() {
	return (
		<>
			<PageHeader
				emphasis='brand'
				align='left'
				size='compact'
				eyebrow='From a filed paper to a law'
				title='How a measure actually moves.'
				titleMuted='Both paths, step by step.'
				description='Parliament publishes this as two lists of rules citations — thirteen steps for a bill, eleven for a resolution. They describe a path most people never see: where a measure can be rewritten, where it can quietly die, and the single point at which someone outside Parliament can affect it.'
			/>

			<ReadingColumn sections={SECTIONS}>
				{/* Walked down the page rather than clicked across it, so the index
				    can sit beside it and every stage is open at once. */}
				<BillPath id='the-bill-path' />

				<Block
					id='resolutions'
					label='Resolutions'
					title='The shorter path, and the weaker instrument.'
					lead={
						<>
							Parliament has adopted far more resolutions than it has passed acts.{' '}
							<Link href='/resolutions' className='rule-link'>
								All of them are here
							</Link>
							.
						</>
					}
				>
					{/* The same timeline the bill path uses, held closer together: a
					    resolution step is a paragraph where a bill step is a stage
					    broken into parts, and the wider spacing would leave this one
					    looking like a path with pieces missing. */}
					<Timeline
						dense
						items={RESOLUTION_STEPS.map((step) => ({
							id: step.label,
							tone: step.tone,
							content: (
								<>
									<h3 className='font-title text-[1.25rem] font-extrabold leading-tight text-[var(--ink)]'>
										{step.label}
									</h3>
									<p className='copy mt-2 text-[var(--ink-2)]'>{step.body}</p>
								</>
							),
						}))}
					/>
				</Block>

				<Block
					id='bill-or-resolution'
					label='Bill or resolution'
					title='Three differences that matter.'
					lead='The two paths look alike until the end, where the resolution loses the vote that leaves names and the signature that makes law.'
				>
					{DIFFERENCES.map((item) => (
						<div
							key={item.title}
							className='border-t border-[var(--rule-soft)] py-6 first:border-t-0 first:pt-0'
						>
							<h3 className='item-title text-[var(--ink)]'>{item.title}</h3>
							<div className='copy mt-2.5 text-[var(--ink-2)]'>{item.body}</div>
							{/* Held off the paragraph above it — the citation belongs to the
						    point but is not part of reading it. */}
							<p className='meta-sm mt-4'>{item.cite}</p>
						</div>
					))}
				</Block>

				<Reveal>
					{/* The last entry in the index, so the sources are reachable from the
				    top of the page rather than only by scrolling to the end. */}
					<section id='sources' className='scroll-mt-32 py-14'>
						<p className='label label-strong'>Where this comes from</p>
						<div className='mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm'>
							<a href={PROCESS_SOURCE} target='_blank' rel='noreferrer' className='rule-link'>
								Legislative process
							</a>
							<Link href='/how-parliament-works' className='rule-link'>
								The rules behind it
							</Link>
							<Link href='/questions' className='rule-link'>
								Common questions
							</Link>
						</div>
						<p className='mt-5 max-w-3xl text-[13px] leading-6 text-[var(--ink-3)]'>
							Both paths above are Parliament&rsquo;s own, restated in plain language and cited to
							the BTA Parliamentary Rules. Where this page and the rules differ, the rules are
							right.
						</p>
					</section>
				</Reveal>
			</ReadingColumn>
		</>
	)
}
