import {
	BankIcon,
	CheckSquareOffsetIcon,
	DatabaseIcon,
	FileMagnifyingGlassIcon,
	ScrollIcon,
} from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { PageHeader } from '../_components/page-header'
import { Reveal } from '../_components/reveal'
import { SiteHeader } from '../_components/site-header'

const principles = [
	{
		label: 'Source first',
		title: 'Start with official records.',
		description:
			'Every workspace is organised around a source trail: public PDFs, datasets, laws, candidate lists, budget acts, and other records that readers can inspect directly.',
		icon: DatabaseIcon,
	},
	{
		label: 'Context second',
		title: 'Explain what the record means.',
		description:
			'Documents are easier to use when they come with dates, labels, plain-language notes, links, and enough background to understand why the record matters.',
		icon: FileMagnifyingGlassIcon,
	},
	{
		label: 'Care always',
		title: 'Treat public information as living data.',
		description:
			'Names, figures, statuses, districts, nominee lists, appropriations, and legal records can change. BetterBARMM keeps warnings and verification notes close to the data.',
		icon: CheckSquareOffsetIcon,
	},
]

const workspaceNotes = [
	{
		label: 'Election',
		title: 'Choose leaders. Shape Bangsamoro.',
		description:
			'Follows the 2026 BARMM Parliamentary Elections: parties, district candidates, sectoral seats, timelines, and developing stories.',
		href: 'https://election.betterbarmm.com',
		state: 'live',
		icon: CheckSquareOffsetIcon,
	},
	{
		label: 'Legislation',
		title: 'Know your laws.',
		description:
			'Organises Bangsamoro Autonomy Acts, bills, resolutions, and committees so readers can track a measure, its authors, and its stage.',
		href: 'https://bills.betterbarmm.com',
		state: 'live',
		icon: ScrollIcon,
	},
	{
		label: 'Budget',
		title: 'Follow the money.',
		description:
			'Turns appropriations into browsable fiscal years, offices, programmes, expense classes, source files, and budget lines.',
		href: 'https://budget.betterbarmm.com',
		state: 'soon',
		icon: BankIcon,
	},
	{
		label: 'Data',
		title: 'Open the source layer.',
		description:
			'The long-term home for datasets, source documents, validation notes, release context, and reusable public files.',
		state: 'planned',
		icon: DatabaseIcon,
	},
] as const

const stateBadge = {
	live: { className: 'badge badge-done', label: 'Live' },
	soon: { className: 'badge badge-plain badge-move', label: 'Soon' },
	planned: { className: 'badge badge-plain badge-idle', label: 'Planned' },
} as const

const readerGuide = [
	{
		title: 'Read the summary, then open the source.',
		description:
			'Use BetterBARMM to find the record faster, but treat the official document or dataset as the controlling reference for citation.',
	},
	{
		title: 'Check dates, status, and scope.',
		description:
			'A budget line, candidate list, or bill can be tied to a specific fiscal year, filing period, version, office, committee, or legal stage.',
	},
	{
		title: 'Watch for confidence notes.',
		description:
			'Some records are official and complete. Others are working lists, legacy references, extracted data, or summaries that need careful verification.',
	},
	{
		title: 'Send corrections and missing context.',
		description:
			'Public records improve when readers share better source links, local knowledge, corrections, and review notes.',
	},
]

const audienceNotes = [
	'Citizens who want to understand how public decisions are made.',
	'Journalists and researchers who need source trails and reusable context.',
	'Civil society groups tracking public money, elections, laws, services, and local governance.',
	'Public servants who need cleaner ways to explain records and spot gaps in public information.',
]

/** A section head: kicker, claim, and the paragraph that qualifies it. */
function SectionHead({
	eyebrow,
	title,
	children,
}: {
	eyebrow: string
	title: string
	children: React.ReactNode
}) {
	return (
		<div className='grid gap-6 border-b border-[var(--rule)] pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16'>
			<div>
				<p className='eyebrow'>{eyebrow}</p>
				<h2 className='mt-3 max-w-2xl text-[1.75rem] font-semibold leading-tight text-[var(--ink)] sm:text-[2rem]'>
					{title}
				</h2>
			</div>
			<div className='max-w-2xl text-sm leading-6 text-[var(--ink-2)]'>{children}</div>
		</div>
	)
}

export default function AboutPage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='about' />

			<PageHeader
				eyebrow='About BetterBARMM'
				title='Better transparency.'
				titleMuted='Better governance.'
				description='BetterBARMM is a public information project for the Bangsamoro. It organises records, explains methods, and keeps source trails visible so people can understand how public decisions move through elections, budgets, laws, offices, and services.'
			/>

			{/* ---- Why it exists ---- */}
			<section className='mx-auto max-w-[88rem] px-6 py-12 lg:px-8'>
				<Reveal>
					<SectionHead
						eyebrow='Why it exists'
						title='Public records only work when people can use them.'
					>
						<p>
							Public information often exists, but it can be scattered across PDFs, agency pages,
							spreadsheets, press releases, legal documents, and social posts. That makes it hard
							for ordinary readers to answer practical questions: who is running, what a law says,
							where the money goes, which office is responsible, or what source supports a claim.
						</p>
						<p className='mt-4'>
							BetterBARMM treats transparency as a usability problem. The goal is not only to
							publish records. The goal is to make public records easier to find, compare,
							question, cite, and improve.
						</p>
					</SectionHead>
				</Reveal>

				<div className='mt-10 grid gap-10 sm:grid-cols-3 sm:gap-12'>
					{principles.map((item, index) => {
						const Icon = item.icon

						return (
							<Reveal key={item.label} delay={index * 90}>
								<Icon className='size-7 text-[var(--accent)]' weight='duotone' aria-hidden='true' />
								<p className='label label-strong mt-5'>{item.label}</p>
								<h3 className='mt-2 text-lg font-semibold leading-snug text-[var(--ink)]'>
									{item.title}
								</h3>
								<p className='mt-2 text-sm leading-6 text-[var(--ink-2)]'>{item.description}</p>
							</Reveal>
						)
					})}
				</div>
			</section>

			{/* ---- What it is ---- */}
			<section className='mx-auto max-w-[88rem] px-6 py-12 lg:px-8'>
				<Reveal>
					<SectionHead
						eyebrow='What it is'
						title='A public workspace, not an official authority.'
					>
						<p>
							BetterBARMM is an independent civic information layer. It is designed to help people
							navigate public records about the Bangsamoro, but it is not a substitute for official
							government, COMELEC, Parliament, ministry, court, or agency records.
						</p>
						<p className='mt-4'>
							When the site summarises a document, normalises a table, groups a record, or explains
							an issue, readers should still verify important details against the original source.
							The site is a guide to the record, not the final record itself.
						</p>
					</SectionHead>

					{/* Interior rules only, so the cells separate at every breakpoint
					    without hand-counting which one starts a row. */}
					<div className='overflow-hidden'>
						<div className='-ml-px -mt-px grid sm:grid-cols-2 lg:grid-cols-4'>
							{workspaceNotes.map((workspace, index) => {
								const Icon = workspace.icon
								const badge = stateBadge[workspace.state]

								const body = (
									<>
										<div className='flex items-center justify-between gap-3'>
											<Icon
												className='size-7 text-[var(--accent)]'
												weight='duotone'
												aria-hidden='true'
											/>
											<span className={badge.className}>{badge.label}</span>
										</div>
										<h3 className='mt-6 text-[15px] font-bold leading-snug text-[var(--ink)]'>
											{workspace.title}
										</h3>
										<p className='mt-2 flex-1 text-[13px] leading-6 text-[var(--ink-2)]'>
											{workspace.description}
										</p>
										<p className='meta-sm mt-6'>{workspace.label}</p>
									</>
								)

								const className =
									'row-in flex h-full flex-col border-l border-t border-[var(--rule)] p-8 transition hover:bg-[var(--paper-2)] lg:p-10'
								const style = { '--row-index': index } as React.CSSProperties

								return 'href' in workspace && workspace.href ? (
									<a key={workspace.label} href={workspace.href} style={style} className={className}>
										{body}
									</a>
								) : (
									<div key={workspace.label} style={style} className={className}>
										{body}
									</div>
								)
							})}
						</div>
					</div>
				</Reveal>
			</section>

			{/* ---- How to use it ---- */}
			<section className='mx-auto max-w-[88rem] px-6 py-12 lg:px-8'>
				<Reveal>
					<SectionHead
						eyebrow='How to use it'
						title='A starting point for verification.'
					>
						<p>
							The site is built for reading and checking. It helps readers move from a question to a
							source-backed record, then from that record to better public discussion.
						</p>
					</SectionHead>

					<div>
						{readerGuide.map((item, index) => (
							<div
								key={item.title}
								style={{ '--row-index': index } as React.CSSProperties}
								className='row row-in grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-4 py-6'
							>
								<span className='num text-[13px] font-medium text-[var(--ink-3)]'>
									{String(index + 1).padStart(2, '0')}
								</span>
								<div className='min-w-0'>
									<h3 className='text-[16.5px] font-medium leading-snug text-[var(--ink)]'>
										{item.title}
									</h3>
									<p className='mt-1.5 max-w-2xl text-sm leading-6 text-[var(--ink-2)]'>
										{item.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</Reveal>
			</section>

			{/* ---- Who it serves ---- */}
			<section className='mx-auto max-w-[88rem] px-6 py-12 lg:px-8'>
				<Reveal>
					<SectionHead eyebrow='Who it serves' title='A shared memory for public work.'>
						<p>
							BetterBARMM is built for anyone trying to understand the public record. It should help
							people ask better questions, verify claims more carefully, and preserve context that
							would otherwise be scattered or forgotten.
						</p>
					</SectionHead>

					<div className='mt-2'>
						{audienceNotes.map((note, index) => (
							<div
								key={note}
								className='grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-4 border-b border-[var(--rule-soft)] py-4'
							>
								<span className='num text-[13px] font-medium text-[var(--ink-3)]'>
									{String(index + 1).padStart(2, '0')}
								</span>
								<span className='min-w-0 text-sm leading-6 text-[var(--ink-2)]'>{note}</span>
							</div>
						))}
					</div>
				</Reveal>
			</section>

			{/* ---- Contribute ---- */}
			<Reveal>
				<div className='mx-auto max-w-[96rem] px-6 lg:px-8'>
					<div className='mt-12 rounded-[24px] bg-[var(--panel-bg)] px-6 py-20 text-center lg:mt-16 lg:px-12 lg:py-24'>
						<h2 className='mx-auto max-w-4xl text-[2rem] font-extrabold leading-[1.05] text-[var(--panel-fg)] sm:text-[2.75rem]'>
							Better records need many careful readers.
						</h2>

						<p className='mx-auto mt-8 max-w-2xl text-sm leading-6 text-[var(--panel-fg)]/70'>
							Send source links, corrections, missing context, or notes about confusing records. The
							project becomes more useful when the public trail becomes easier to inspect.
						</p>

						<div className='mt-10 flex flex-wrap items-center justify-center gap-3'>
							<Link
								href='/contribute'
								className='inline-flex items-center gap-2 rounded-full bg-[var(--panel-fg)] px-5 py-2.5 text-sm font-medium text-[var(--panel-bg)] transition hover:opacity-90'
							>
								Contribute
							</Link>
							<a
								href='mailto:support@betterbarmm.com'
								className='inline-flex items-center rounded-full border border-[var(--panel-fg)]/30 px-5 py-2.5 text-sm font-medium text-[var(--panel-fg)] transition hover:border-[var(--panel-fg)]/60'
							>
								support@betterbarmm.com
							</a>
						</div>
					</div>
				</div>
			</Reveal>
		</main>
	)
}
