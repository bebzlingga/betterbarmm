import Link from 'next/link'
import { BillPath } from './bill-path'
import { Block } from './explainer'
import { Timeline } from './timeline'
import type { StatusTone } from '../_lib/labels'

/* ============================================================
   How a measure moves

   Parliament sets this out twice — once for bills, once for
   resolutions — as thirteen and eleven steps of rules citations. The
   bill path is the interactive rail; the resolution path is short
   enough to read straight down, and differs from the bill path in
   ways worth stating outright: no third reading, no Chief Minister,
   and a shortcut that skips committee altogether.

   It was its own page. It is three sections of "How Parliament
   works" now, because a reader asking how a bill becomes law is
   asking about the same building.
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


export function ProcessSections() {
	return (
		<>
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

		</>
	)
}
