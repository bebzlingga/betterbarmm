import {
	ArrowRightIcon,
	ArrowsClockwiseIcon,
	BankIcon,
	ClockCounterClockwiseIcon,
	DatabaseIcon,
	FileMagnifyingGlassIcon,
	MosqueIcon,
	UsersThreeIcon,
} from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { PageHeader } from './_components/page-header'
import { Reveal } from './_components/reveal'
import { SiteHeader } from './_components/site-header'

/**
 * Every workspace, live or planned, in one list.
 *
 * They used to be split across a featured card and a "what comes next"
 * column, which made the live one loud and the rest an afterthought. As one
 * list they read the way the registry reads: a row per thing, its state on
 * the same line, in the order it will arrive.
 */
type Workspace = {
	label: string
	/** Absent while a workspace is still only planned — the row is then inert. */
	href?: string
	blurb: string
	/** What the workspace covers, in the source's own units. */
	measure: string
	state: 'live' | 'soon' | 'planned'
}

const workspaces: Workspace[] = [
	{
		label: 'Election',
		href: 'https://election.betterbarmm.com',
		blurb:
			'Parties, candidates, districts, and sectoral seats for the 2026 Parliamentary Elections, with the source record behind each one.',
		measure: '2026 Parliamentary Elections',
		state: 'live',
	},
	{
		label: 'Legislation',
		href: 'https://bills.betterbarmm.com',
		blurb:
			'Bills, autonomy acts, resolutions, committees, and the members who filed them — with the stage each measure has reached.',
		measure: 'Bangsamoro Parliament',
		state: 'live',
	},
	{
		label: 'Budget',
		href: 'https://budget.betterbarmm.com',
		blurb: 'Appropriations by agency and programme, traced to the General Appropriations Act.',
		measure: 'GAAB FY 2020–2026',
		state: 'soon',
	},
	{
		label: 'Public works',
		blurb: 'Infrastructure projects, their cost, their contractor, and whether they were finished.',
		measure: 'Infrastructure tracker',
		state: 'planned',
	},
	{
		label: 'Local government',
		blurb: 'The provinces, cities, and municipalities of the region, and who runs them.',
		measure: 'LGU directory',
		state: 'planned',
	},
	{
		label: 'Public services',
		blurb: 'Which office handles what, what it costs, and what you need to bring.',
		measure: 'Service finder',
		state: 'planned',
	},
	{
		label: 'Source layer',
		blurb: 'The documents and datasets underneath every workspace, openable on their own.',
		measure: 'PDFs and JSON',
		state: 'planned',
	},
]

const stateBadge = {
	live: { className: 'badge badge-done', label: 'Live' },
	soon: { className: 'badge badge-plain badge-move', label: 'Soon' },
	planned: { className: 'badge badge-plain badge-idle', label: 'Planned' },
} as const

const discoverTopics = [
	{
		title: 'History',
		blurb:
			'From the sultanates and the Bangsamoro struggle to the Organic Law and the ongoing transition.',
		href: '/discover/history',
		icon: ClockCounterClockwiseIcon,
	},
	{
		title: 'Government',
		blurb: 'Parliament, the chief minister, ministries, and the offices that run the region.',
		href: '/discover/governance',
		icon: BankIcon,
	},
	{
		title: 'People',
		blurb: 'The Moro, Indigenous, and settler communities that shape Bangsamoro life.',
		href: '/discover/people',
		icon: UsersThreeIcon,
	},
	{
		title: 'Culture & Places',
		blurb: 'Mosques, sacred sites, islands, food, textiles, and living heritage.',
		href: '/discover/culture-places',
		icon: MosqueIcon,
	},
]

const principles = [
	{
		label: 'Source-first',
		title: 'Start with the record.',
		description:
			'Every workspace is built on a visible source trail — official PDFs, datasets, and public records you can open yourself.',
		icon: DatabaseIcon,
	},
	{
		label: 'Context',
		title: 'Explain what it means.',
		description:
			'Records come with dates, labels, plain-language notes, and enough background to know why they matter.',
		icon: FileMagnifyingGlassIcon,
	},
	{
		label: 'Living data',
		title: 'Keep it honest.',
		description:
			'Names, figures, and statuses change. Warnings and verification notes stay right beside the data.',
		icon: ArrowsClockwiseIcon,
	},
]

/** A workspace row. Only the ones that exist are links. */
function WorkspaceRow({ workspace, index }: { workspace: Workspace; index: number }) {
	const badge = stateBadge[workspace.state]

	const body = (
		<>
			<div className='min-w-0'>
				<div className='flex flex-wrap items-center gap-x-2 gap-y-1.5'>
					<span className='num text-[13px] font-medium text-[var(--ink-3)]'>
						{String(index + 1).padStart(2, '0')}
					</span>
					<span className={badge.className}>{badge.label}</span>
					<span className='meta-sm'>{workspace.measure}</span>
				</div>

				<h3 className='mt-2 text-[16.5px] font-medium leading-snug text-[var(--ink)]'>
					{workspace.label}
				</h3>

				<p className='mt-1.5 max-w-2xl text-sm leading-6 text-[var(--ink-2)]'>{workspace.blurb}</p>
			</div>

			{workspace.href ? (
				<div className='flex items-center'>
					<ArrowRightIcon className='row-arrow hidden size-4 sm:block' aria-hidden='true' />
				</div>
			) : null}
		</>
	)

	const className =
		'row row-in grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 py-6 sm:gap-8'

	return workspace.href ? (
		<a
			href={workspace.href}
			style={{ '--row-index': index } as React.CSSProperties}
			className={className}
		>
			{body}
		</a>
	) : (
		<div style={{ '--row-index': index } as React.CSSProperties} className={className}>
			{body}
		</div>
	)
}

export default function HomePage() {
	const live = workspaces.filter((workspace) => workspace.state === 'live').length

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader />

			<PageHeader
				eyebrow='Public transparency for the Bangsamoro'
				title='Public records,'
				titleMuted='made usable.'
				description='BetterBARMM turns scattered Bangsamoro public records into workspaces you can read, question, and trace back to the source — starting with the 2026 parliamentary elections and the Parliament that will be elected.'
			>
				<a href='https://election.betterbarmm.com' className='btn btn-solid btn-lg'>
					Open the Election workspace
					<ArrowRightIcon className='size-4' aria-hidden='true' />
				</a>
				<Link href='/about' className='btn btn-quiet btn-lg'>
					What is BetterBARMM?
				</Link>
			</PageHeader>

			{/* ---- The workspaces ---- */}
			<section className='mx-auto max-w-[88rem] px-6 py-12 lg:px-8'>
				<Reveal>
					<div className='flex flex-col justify-between gap-2 border-b border-[var(--rule)] pb-3 sm:flex-row sm:items-end'>
						<div>
							<p className='eyebrow'>The workspaces</p>
							<h2 className='mt-3 text-2xl font-semibold leading-tight'>
								{live} live. More on the way.
							</h2>
						</div>
						<p className='meta'>
							<span className='num font-medium text-[var(--ink)]'>{workspaces.length}</span> planned
							in total
						</p>
					</div>

					<div>
						{workspaces.map((workspace, index) => (
							<WorkspaceRow key={workspace.label} workspace={workspace} index={index} />
						))}
					</div>

					<p className='mt-8 max-w-2xl text-[13px] leading-6 text-[var(--ink-3)]'>
						Each workspace turns a pile of public records into something you can read, question, and
						trace back to the source. A row without a link is one we have not built yet.
					</p>
				</Reveal>
			</section>

			{/* ---- Discover ----

			    Interior rules only: every cell draws its own top and left edge, and
			    the grid is nudged a pixel up and left so the outermost of those are
			    clipped away. That separates the cells at every breakpoint without
			    hand-counting which one starts a row or a column. */}
			<section className='mx-auto max-w-[88rem] px-6 py-12 lg:px-8'>
				<Reveal>
					<div className='border-b border-[var(--rule)] pb-3'>
						<p className='eyebrow'>Discover BARMM</p>
						<h2 className='mt-3 text-2xl font-semibold leading-tight'>
							Get to know the Bangsamoro.
						</h2>
						<p className='mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-2)]'>
							Beyond the data: who the Bangsamoro are, how they are governed, and how they got
							here.
						</p>
					</div>

					<div className='overflow-hidden'>
						<div className='-ml-px -mt-px grid sm:grid-cols-2 lg:grid-cols-4'>
							{discoverTopics.map((topic, index) => {
								const Icon = topic.icon

								return (
									<Link
										key={topic.href}
										href={topic.href}
										style={{ '--row-index': index } as React.CSSProperties}
										className='row-in group flex h-full flex-col border-l border-t border-[var(--rule)] p-8 transition hover:bg-[var(--paper-2)] lg:p-10'
									>
										<Icon
											className='size-8 text-[var(--accent)]'
											weight='duotone'
											aria-hidden='true'
										/>
										<h3 className='mt-6 text-[15px] font-bold leading-snug text-[var(--ink)]'>
											{topic.title}
										</h3>
										<p className='mt-2 flex-1 text-[13px] leading-6 text-[var(--ink-2)]'>
											{topic.blurb}
										</p>
										<span className='meta-sm mt-6 inline-flex items-center gap-1.5 transition group-hover:text-[var(--accent)]'>
											Explore
											<ArrowRightIcon
												className='size-3 transition group-hover:translate-x-0.5'
												aria-hidden='true'
											/>
										</span>
									</Link>
								)
							})}
						</div>
					</div>
				</Reveal>
			</section>

			{/* ---- Method ---- */}
			<section className='mx-auto max-w-[88rem] px-6 py-12 lg:px-8'>
				<Reveal>
					<div className='border-b border-[var(--rule)] pb-3'>
						<p className='eyebrow'>How it works</p>
						<h2 className='mt-3 text-2xl font-semibold leading-tight'>Built to be trusted.</h2>
						<p className='mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-2)]'>
							Every workspace follows the same method — so you never have to take our word for it.
						</p>
					</div>
				</Reveal>

				<div className='mt-10 grid gap-10 sm:grid-cols-3 sm:gap-12'>
					{principles.map((principle, index) => {
						const Icon = principle.icon

						return (
							<Reveal key={principle.label} delay={index * 90}>
								<Icon
									className='size-7 text-[var(--accent)]'
									weight='duotone'
									aria-hidden='true'
								/>
								<p className='label label-strong mt-5'>{principle.label}</p>
								<h3 className='mt-2 text-lg font-semibold leading-snug text-[var(--ink)]'>
									{principle.title}
								</h3>
								<p className='mt-2 text-sm leading-6 text-[var(--ink-2)]'>
									{principle.description}
								</p>
							</Reveal>
						)
					})}
				</div>
			</section>

			{/* ---- Get involved ----

			    The one inverted block on the page. It sits on a container a touch
			    wider than the content measure, so the panel steps outside the page
			    without running the full width of the viewport. */}
			<Reveal>
				<div className='mx-auto max-w-[96rem] px-6 lg:px-8'>
					<div className='mt-12 rounded-[24px] bg-[var(--panel-bg)] px-6 py-20 text-center lg:mt-16 lg:px-12 lg:py-24'>
						<h2 className='mx-auto max-w-4xl text-[2rem] font-extrabold leading-[1.05] text-[var(--panel-fg)] sm:text-[2.75rem]'>
							Public records get better when people check them.
						</h2>

						<p className='mx-auto mt-8 max-w-2xl text-sm leading-6 text-[var(--panel-fg)]/70'>
							Spotted an error, or have a document worth adding? Every correction and every source
							makes the record stronger — and the official source is always right where we are
							wrong.
						</p>

						<div className='mt-10 flex flex-wrap items-center justify-center gap-3'>
							<Link
								href='/contribute'
								className='inline-flex items-center gap-2 rounded-full bg-[var(--panel-fg)] px-5 py-2.5 text-sm font-medium text-[var(--panel-bg)] transition hover:opacity-90'
							>
								Contribute
								<ArrowRightIcon className='size-4' aria-hidden='true' />
							</Link>
							<Link
								href='/about'
								className='inline-flex items-center rounded-full border border-[var(--panel-fg)]/30 px-5 py-2.5 text-sm font-medium text-[var(--panel-fg)] transition hover:border-[var(--panel-fg)]/60'
							>
								About the project
							</Link>
						</div>
					</div>
				</div>
			</Reveal>
		</main>
	)
}
