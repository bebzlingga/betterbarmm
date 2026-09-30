import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CtaAction, CtaPanel, Stagger, StaggerItem } from '@betterbarmm/editorial'
import { Masthead, SectionHead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'

export const metadata: Metadata = {
	title: 'About — BetterBARMM',
	description:
		'BetterBARMM collects what the Bangsamoro government already publishes and puts it where a person can actually read it: organized, explained in plain words, and one click from the source.',
}

/**
 * Why the project exists. That is the whole page (user decision).
 *
 * It ran to four sections — the method in three diagrams, the workspaces as
 * cards, the audiences as four more diagrams — which is a prospectus rather
 * than an answer. Somebody on an About page is asking one question, and every
 * section after the first was answering a question they had not asked yet.
 * What is left is the argument: the records are public, they are not reachable,
 * and that gap is the work. The workspaces make their own case on their own
 * sites, and the header is how a reader gets to them.
 */
const notes = [
	{
		title: 'The records are already public.',
		body: 'What the government decided, what it spent, and which office is answerable for it are public in principle. In practice they arrive as scanned PDFs spread across a dozen agency websites, each with its own idea of an index.',
	},
	{
		title: 'Published is not the same as accessible.',
		body: 'A file posted online has been disclosed, not opened. The same record dated, labeled, searchable and written out in plain words is a record a person can use without already knowing what they are looking for.',
	},
	{
		title: 'Finding it is most of the work.',
		body: 'An ordinary question — what does this cost, who voted for it, which town is this about — turns into an afternoon of searching. Most people stop long before the answer, and reasonably so.',
	},
	{
		title: 'Where it is uncertain, it says so.',
		body: 'A figure that is provisional, a list still being checked, a document that could not be read: the page says which, rather than rounding the doubt away. Transparency about the gaps is part of the same job.',
	},
]

export default function AboutPage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='about' />

			<Masthead
				label='About BetterBARMM'
				lines={['Public records,', 'made readable.']}
				muted={[1]}
				scrollTo='#why'
				scrollLabel='Why it exists'
				standfirst='BetterBARMM is an independent transparency project for the Bangsamoro. Nothing on it is new information — it is the region’s own public record, collected in one place, explained in plain language, and kept one click from the document it came from.'
			/>

			{/* No top padding: it opens straight off the masthead, which already ends
			    in its own. A full step of section rhythm on top of that left the
			    first heading a screen below the cue pointing at it. */}
			<section id='why' className='bb-container scroll-mt-24 bb-section-bottom'>
				<SectionHead
					eyebrow='Why it exists'
					title='What stands between a record'
					titleMuted='and the person reading it.'
				/>

				{/* The same interior rules the rest of the site draws its grids with: a
				    hairline over every cell and one down the middle, and nothing closing
				    the outside. */}
				<Stagger gap={0.06} className='grid border-t border-[var(--rule)] sm:grid-cols-2'>
					{notes.map((note, index) => (
						<StaggerItem
							key={note.title}
							distance={14}
							className='flex flex-col border-b border-[var(--rule)] py-8 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(odd)]:pr-10 sm:[&:nth-child(even)]:pl-10'
						>
							<p className='num text-[13px] font-semibold text-[var(--brass)]'>
								{String(index + 1).padStart(2, '0')}
							</p>

							<h3 className='mt-4 text-[1.2rem] font-extrabold leading-snug tracking-[-0.028em] text-[var(--ink)] sm:text-[1.35rem]'>
								{note.title}
							</h3>
							<p className='mt-3 bb-body text-[var(--ink-2)]'>{note.body}</p>
						</StaggerItem>
					))}
				</Stagger>

				{/* The one thing a reader has to be told that is not part of the
				    argument: what this is not. It sits under the notes rather than in
				    a section of its own, because a section implies there is more to
				    it, and there is not. */}
				<p className='mt-14 bb-body text-pretty text-[var(--ink-2)]'>
					BetterBARMM is not an official authority and does not speak for the Bangsamoro
					Government. Where it summarises a document, reorganizes a table, or explains a
					record in its own words, the original is still what settles the question — which is
					why the original is always linked.
				</p>
			</section>

			<CtaPanel
				label='Contribute'
				lines={['Better records need', 'many careful readers.']}
				standfirst='Send source links, corrections, missing context, or notes about confusing records. The project becomes more useful when the public trail becomes easier to inspect.'
			>
				<CtaAction>
					<Link href='/contribute' className='bb-btn bb-btn-brass'>
						Contribute
						<ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
					</Link>
				</CtaAction>
				<CtaAction>
					<a href='mailto:support@betterbarmm.com' className='bb-btn bb-btn-ghost'>
						support@betterbarmm.com
					</a>
				</CtaAction>
			</CtaPanel>
		</main>
	)
}
