import { ArrowRightIcon, ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CtaAction, CtaPanel, OkirCorner, Rise, Stagger, StaggerItem, Tilt } from '@betterbarmm/editorial'
import { photo } from '../_components/discover-media'
import { Masthead, SectionHead } from '../_components/masthead'
import { CompareDiagram, GapDiagram, LookupDiagram, TrailDiagram } from '../_components/audience-diagram'
import { ContextDiagram, LivingDiagram, SourceDiagram } from '../_components/method-diagram'
import { QuoteBand } from '../_components/quote-band'
import { SiteHeader } from '../_components/site-header'

export const metadata: Metadata = {
	title: 'About — BetterBARMM',
	description:
		'BetterBARMM is a public information project for the Bangsamoro. It organises records, explains methods, and keeps source trails visible.',
}

/**
 * Why the project exists, in four notes.
 *
 * It ran as four paragraphs, which is the right form for an essay and the
 * wrong one for the second screen of an About page — a reader deciding whether
 * this project is worth their afternoon does not read four hundred words to
 * find out. Each note keeps one move of the argument: the records exist,
 * finding them is the work, publishing is not the same as usable, and the doubt
 * stays visible.
 */
const whyNotes = [
	{
		title: 'The records already exist.',
		body: 'Decisions, spending, laws, and the offices answerable for them are public in principle. In practice they arrive as scanned PDFs spread across a dozen agency websites.',
	},
	{
		title: 'Finding them is the work.',
		body: 'Knowing a document exists is not the same as being able to find it. An ordinary question turns into an afternoon of searching, and most people reasonably stop before the answer.',
	},
	{
		title: 'Published is not usable.',
		body: 'A file posted online is not yet usable. The same record organised, dated, labelled in plain words, and kept one click from the original is.',
	},
	{
		title: 'The doubt stays visible.',
		body: 'Where a figure is provisional or a list is still being checked, the page says so rather than rounding the uncertainty away.',
	},
]

const principles = [
	{
		label: 'Source first',
		title: 'Start with official records.',
		description:
			'Every workspace is organised around a source trail: public PDFs, datasets, laws, candidate lists, budget acts, and other records that readers can inspect directly.',
		diagram: SourceDiagram,
	},
	{
		label: 'Context second',
		title: 'Explain what the record means.',
		description:
			'Documents are easier to use when they come with dates, labels, plain-language notes, links, and enough background to understand why the record matters.',
		diagram: ContextDiagram,
	},
	{
		label: 'Care always',
		title: 'Treat public information as living data.',
		description:
			'Names, figures, statuses, districts, nominee lists, appropriations, and legal records can change. BetterBARMM keeps warnings and verification notes close to the data.',
		diagram: LivingDiagram,
	},
]

/**
 * The workspaces, named by what a reader will find in them.
 *
 * The titles were slogans — "follow the money", "know your laws" — which tell
 * a reader how to feel about a workspace and nothing about what is inside it.
 * A card on an About page is answering "what is this", so each one now states
 * its contents and leaves the persuading to the record.
 */
const workspaceNotes = [
	{
		label: 'Election',
		title: 'Candidates, parties, and seats for 2026.',
		description:
			'Follows the 2026 BARMM Parliamentary Elections: parties, district candidates, sectoral seats, timelines, and developing stories.',
		href: 'https://election.betterbarmm.com',
		state: 'live',
	},
	{
		label: 'Legislation',
		title: 'Bills and autonomy acts, with the stage each has reached.',
		description:
			'Organises Bangsamoro Autonomy Acts, bills, resolutions, and committees so readers can track a measure, its authors, and its stage.',
		href: 'https://legislation.betterbarmm.com',
		state: 'live',
	},
	{
		label: 'Budget',
		title: 'Appropriations by fiscal year, office, and programme.',
		description:
			'Turns appropriations into browsable fiscal years, offices, programmes, expense classes, source files, and budget lines.',
		href: '/soon',
		state: 'soon',
	},
	{
		label: 'Data',
		title: 'The documents and datasets the rest is built on.',
		description:
			'The long-term home for datasets, source documents, validation notes, release context, and reusable public files.',
		state: 'planned',
	},
] as const

const stateBadge = {
	live: { className: 'badge badge-done', label: 'Live' },
	soon: { className: 'badge badge-plain badge-move', label: 'Soon' },
	planned: { className: 'badge badge-plain badge-idle', label: 'Planned' },
} as const

/**
 * Who the site is for, by the question each of them arrives with.
 *
 * They were four labels followed by a clause — "citizens, who want to
 * understand how public decisions are made" — which describes an audience
 * without saying anything a member of it would recognise as their own problem.
 * Each one now tells that reader what they will be able to do, in the second
 * person and in the words they would use themselves — no appropriations, no
 * source trails, no measures taken. The heading names the group, so the
 * sentence does not have to; it starts at "you can". The drawing beside it
 * shows the same thing: a question looked up and answered, a claim walked back
 * to its document, one figure followed three years running, the line missing
 * from an office's own page.
 */
const audienceNotes = [
	{
		who: 'Citizens',
		diagram: LookupDiagram,
		gets: 'You can find out what the government decided, where the money went, and which office to ask about it — in plain language, without digging through a dozen agency websites first.',
	},
	{
		who: 'Journalists and researchers',
		diagram: TrailDiagram,
		gets: 'You can get to the document behind a number in minutes, see when it was published and whether it is final, and link straight to it in what you write.',
	},
	{
		who: 'Civil society',
		diagram: CompareDiagram,
		gets: 'You can follow the same programme year after year, so when it shrinks or stalls you have the documents to show it rather than only the impression that something changed.',
	},
	{
		who: 'Public servants',
		diagram: GapDiagram,
		gets: 'You can see your office the way the public sees it — what is up to date, what has gone stale, and the questions people keep asking because the answer is buried.',
	},
]

export default function AboutPage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='about' />

			<Masthead
				label='About BetterBARMM'
				lines={['Better transparency.', 'Better governance.']}
				muted={[1]}
				scrollTo='#why'
				scrollLabel='Why it exists'
				standfirst='A transparency project for the Bangsamoro. Public records — what was decided, what it cost, and which office is answerable — collected in one place, explained in plain language, and kept one click from the document they came from.'
			/>

			{/* ---- Why it exists ----

			    No top padding: it opens straight off the masthead, which already ends
			    in its own. A full step of section rhythm on top of that left the
			    first heading a screen below the cue pointing at it. */}
			<section id='why' className='bb-container scroll-mt-24 bb-section-bottom'>
				<SectionHead
					index='01'
					eyebrow='Why it exists'
					title='What stands between a record'
					titleMuted='and the person reading it.'
				/>

				{/* The same interior rules the rest of the site draws its grids with: a
				    hairline over every cell and one down the middle, and nothing closing
				    the outside. */}
				<Stagger gap={0.06} className='grid border-t border-[var(--rule)] sm:grid-cols-2'>
					{whyNotes.map((note, index) => (
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
			</section>

			{/* ---- The method ----

			    Bottom padding only, so the join with the section above carries one
			    step of rhythm rather than two. */}
			<section className='bb-container bb-section-bottom'>
				<SectionHead
					index='02'
					eyebrow='The method'
					title='Three rules,'
					titleMuted='applied everywhere.'
					lead='They are the same three on every workspace, which is what makes a claim on one page checkable by the method used on another.'
				/>

				<Stagger gap={0.12} className='grid gap-14 sm:grid-cols-3 sm:gap-10'>
					{principles.map((item) => {
						const Diagram = item.diagram

						return (
							<StaggerItem key={item.label}>
								<div className='flex h-full flex-col'>
									<Diagram />
									<p className='bb-label mt-9'>{item.label}</p>
									<h3 className='mt-4 text-[1.35rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>
										{item.title}
									</h3>
									<p className='mt-3 bb-body text-[var(--ink-2)]'>{item.description}</p>
								</div>
							</StaggerItem>
						)
					})}
				</Stagger>
			</section>

			{/* The one break in a page of argument, and the only place on it the
			    region gets to be looked at rather than described. It was a committee
			    in session, which is a picture of the subject matter — true, and one
			    more room full of records on a page already full of them. A reader
			    who has never been to the Bangsamoro should leave this page having
			    seen it. */}
			<QuoteBand
				photo={photo('lakeLanao')}
				quote='Before any of it is a record, the Bangsamoro is a place.'
				attribution='Lake Lanao, Lanao del Sur — the homeland the Meranao are named for'
			/>

			{/* ---- What it is ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='03'
					eyebrow='What it is'
					title='A public workspace,'
					titleMuted='not an official authority.'
					lead='BetterBARMM is an independent civic information layer. When it summarises a document, normalises a table, or explains an issue, the original source is still what settles the question.'
				/>

				<Stagger gap={0.1} className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
					{workspaceNotes.map((workspace, index) => {
						const badge = stateBadge[workspace.state]

						const body = (
							<div className='bb-plate relative flex h-full flex-col p-7 lg:p-8'>
								<OkirCorner position='top-right' className='m-2 size-6 opacity-50' />

								<div className='flex items-center justify-between gap-3'>
									<span className='num text-[12px] font-semibold text-[var(--brass)]'>
										{String(index + 1).padStart(2, '0')}
									</span>
									<span className={badge.className}>{badge.label}</span>
								</div>

								<h3 className='mt-10 text-[1.05rem] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)]'>
									{workspace.title}
								</h3>
								<p className='mt-3 flex-1 bb-body text-[var(--ink-2)]'>
									{workspace.description}
								</p>

								<p className='mt-8 flex items-center justify-between gap-3 border-t border-[var(--rule)] pt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
									{workspace.label}
									{'href' in workspace && workspace.href ? (
										<ArrowUpRightIcon className='size-3.5' aria-hidden='true' />
									) : null}
								</p>
							</div>
						)

						return (
							<StaggerItem key={workspace.label}>
								<Tilt max={4} className='h-full'>
									{'href' in workspace && workspace.href ? (
										<a href={workspace.href} className='bb-plate-link block h-full'>
											{body}
										</a>
									) : (
										body
									)}
								</Tilt>
							</StaggerItem>
						)
					})}
				</Stagger>
			</section>

			{/* ---- Who it serves ----

			    On the paper, like the sections above it. The dark band was the one
			    ground change on a page that is otherwise a single argument read
			    straight through, and it broke the argument in half at the point
			    where it was least ready to be interrupted.

			    Bottom padding only. Two neighbouring `bb-section`s put a full step of
			    rhythm on each side of the join, and with the okir rule that used to
			    sit in the gap now gone there was nothing in that double space doing
			    any work. One step between sections is the rhythm; two is a hole. */}
			<section className='bb-container bb-section-bottom'>
				<SectionHead
					index='04'
					eyebrow='Who it serves'
					title='A shared memory'
					titleMuted='for public work.'
					lead='The same records answer very different questions depending on who is holding them. These are the four the site is built around.'
				/>

				<Stagger gap={0.1} className='grid gap-14 sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-4 lg:gap-10'>
					{audienceNotes.map((note) => {
						const Diagram = note.diagram

						return (
							<StaggerItem key={note.who}>
								<div className='flex h-full flex-col'>
									<Diagram />
									<h3 className='mt-9 text-[1.15rem] font-extrabold tracking-[-0.025em] text-[var(--ink)]'>
										{note.who}
									</h3>
									<p className='mt-3 bb-body text-[var(--ink-2)]'>{note.gets}</p>
								</div>
							</StaggerItem>
						)
					})}
				</Stagger>
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
