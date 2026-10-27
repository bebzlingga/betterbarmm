import {
	ChatsCircleIcon,
	CrownIcon,
	EyeIcon,
	FileTextIcon,
	IdentificationBadgeIcon,
	ListChecksIcon,
	MagnifyingGlassIcon,
	UserCircleIcon,
	UsersIcon,
	UsersThreeIcon,
} from '@phosphor-icons/react/dist/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '../_components/page-header'
import { Reveal } from '../_components/reveal'
import { getCommitteesDataset, type Committee } from '../_lib/committees-data'
import { toDisplayTitle } from '../_lib/labels'

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
	{ verb: 'Examines', detail: 'the bills and resolutions referred to it.', Icon: MagnifyingGlassIcon },
	{ verb: 'Discusses', detail: 'the issues that fall within its subject.', Icon: ChatsCircleIcon },
	{ verb: 'Hears', detail: 'experts, stakeholders, and the public.', Icon: UsersThreeIcon },
	{ verb: 'Recommends', detail: 'what the Parliament should do with each measure.', Icon: ListChecksIcon },
	{ verb: 'Reports', detail: 'in writing on every measure it considers.', Icon: FileTextIcon },
	{ verb: 'Oversees', detail: 'the laws already passed, to see they are carried out.', Icon: EyeIcon },
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

const range = (counts: number[]) => {
	const low = Math.min(...counts)
	const high = Math.max(...counts)
	return low === high ? `${low}` : `${low} to ${high}`
}

/** A U-shaped committee table: the chair at its head, members down both sides, a witness facing them. */
function CommitteeTable() {
	const seats = [-180, -150, -120, -60, -30, 0].map((degrees) => {
		const angle = (degrees * Math.PI) / 180
		return [160 + 102 * Math.cos(angle), 110 + 102 * Math.sin(angle)]
	})
	return (
		<svg viewBox='0 -16 320 228' className='h-auto w-full max-w-[20rem]' aria-hidden='true'>
			<path
				d='M80 176V110a80 80 0 0 1 160 0v66'
				fill='none'
				stroke='var(--ink-3)'
				strokeWidth='14'
				strokeLinejoin='round'
			/>
			{[...seats, [58, 150], [262, 150]].map(([x, y]) => (
				<circle key={`${x}-${y}`} cx={x} cy={y} r='11' fill='var(--paper)' stroke='var(--ink-3)' strokeWidth='2.5' />
			))}
			<circle cx='160' cy='8' r='14' fill='var(--accent)' />
			<circle cx='160' cy='8' r='20' fill='none' stroke='var(--accent)' strokeWidth='2' opacity='0.35' />
			<rect x='128' y='168' width='64' height='10' rx='2' fill='var(--brass)' />
			<circle cx='160' cy='196' r='11' fill='var(--paper)' stroke='var(--brass)' strokeWidth='2.5' />
		</svg>
	)
}

function CommitteeCard({ committee, index }: { committee: Committee; index: number }) {
	const examples = committee.referredBills.slice(0, 2)
	return (
		/* Not a link itself — the chair's name is a link of its own, and an
		   anchor cannot sit inside an anchor. The heading's link stretches over
		   the whole cell instead, so the card still opens the committee wherever
		   it is clicked; the chair, the examples and the Rules' wording sit above
		   that overlay and stay usable. */
		<div
			style={{ '--row-index': index } as React.CSSProperties}
			/* No horizontal padding while the grid is one card wide. A card in a
			   single column already has the page's own margin either side of it, and
			   its padding sits inside that — so the type ran at two margins' distance
			   from the edge and the line got shorter on the screen with the least room
			   for it. From `sm`, where two cards share a row and a card needs its own
			   edges, the padding comes back. */
			className='row-in relative flex h-full flex-col border-l border-t border-[var(--rule)] py-6 transition hover:bg-[var(--paper-2)] sm:p-8 lg:p-10'
		>
			<h3 className='text-[1.35rem] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
				<Link href={`/committees/${committee.slug}`} className='after:absolute after:inset-0 after:content-[""]'>
					{committee.name}
				</Link>
			</h3>

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

			{/* What it covers in ordinary words, whole; the Rules' own sentence is a
			    tap away rather than clipped to four lines as it used to be. */}
			<p className='mt-3.5 bb-body text-[var(--ink-2)]'>{committee.inShort || committee.jurisdiction}</p>

			{examples.length > 0 ? (
				<div className='mt-4'>
					<p className='label'>Referred here, for instance</p>
					<ul className='mt-1.5 space-y-1.5'>
						{examples.map((bill) => (
							<li key={bill.url} className='line-clamp-2 meta'>
								{toDisplayTitle(bill.title)}
							</li>
						))}
					</ul>
				</div>
			) : null}

			{committee.inShort && committee.jurisdiction ? (
				<details className='group relative mt-4'>
					<summary className='meta-sm cursor-pointer list-none font-semibold text-[var(--ink-3)] underline decoration-[var(--rule)] underline-offset-2 transition hover:text-[var(--ink)] [&::-webkit-details-marker]:hidden'>
						<span className='group-open:hidden'>In the Rules’ words</span>
						<span className='hidden group-open:inline'>Hide the Rules’ words</span>
					</summary>
					<p className='mt-2 border-l-2 border-[var(--rule)] pl-3 meta'>{committee.jurisdiction}</p>
				</details>
			) : null}

			{/* Pinned to the bottom so the badges line up across a row regardless of
			    how long each card runs. */}
			<div className='mt-auto flex flex-wrap gap-1.5 pt-5'>
				<span className='badge badge-plain badge-idle'>{committee.memberCount} seated</span>
				{committee.referredBills.length + committee.referredResolutions.length > 0 ? (
					<span className='badge badge-plain badge-early'>
						{committee.referredBills.length + committee.referredResolutions.length} referred
					</span>
				) : null}
				{committee.reports.length > 0 ? (
					<span className='badge badge-plain badge-done'>
						{committee.reports.length} {committee.reports.length === 1 ? 'report' : 'reports'}
					</span>
				) : null}
			</div>
		</div>
	)
}

export default function CommitteesPage() {
	const dataset = getCommitteesDataset()
	const { committees, stats } = dataset

	// Two kinds of committee, and a reader looking for "who handles hospitals" wants the first.
	const groups = [
		{
			key: 'subject',
			title: 'Subject committees',
			note: `The ${stats.statutory} the Rules name. Between them they cover what the Parliament can make laws on, so almost every bill lands in one of them.`,
			committees: committees.filter((committee) => committee.statutory),
		},
		{
			key: 'house',
			title: 'Committees that run the Parliament',
			note: 'Its rules, its accounts, its ethics, its revenue measures, investigations of officials, and the one standing committee created for Marawi.',
			committees: committees.filter((committee) => !committee.statutory),
		},
	]

	// Who holds each kind of seat, read from the rosters rather than assumed.
	const count = (committee: Committee, role: string) => committee.seats.filter((seat) => seat.role === role).length
	// An officer who also holds a regular seat on a committee is listed there once, as a member, so a seat of
	// any kind counts towards "every committee" for anyone the rosters seat ex officio at all.
	const exOfficio = new Set(
		committees.flatMap((committee) => committee.seats.filter((seat) => seat.role === 'Ex-officio').map((seat) => seat.rosterName)),
	)
	const seatsHeld = new Map<string, { name: string; slug?: string; on: number }>()
	for (const committee of committees)
		for (const seat of committee.seats.filter((s) => exOfficio.has(s.rosterName))) {
			const held = seatsHeld.get(seat.rosterName) ?? { name: seat.displayName, slug: seat.slug, on: 0 }
			held.on++
			seatsHeld.set(seat.rosterName, held)
		}
	// "Every committee" allows one miss: the registry leaves the Speaker off one list.
	const everywhere = [...seatsHeld.values()]
		.filter((held) => held.on >= committees.length - 1)
		.sort((left, right) => right.on - left.on || left.name.localeCompare(right.name))

	const roles = [
		{
			title: 'Chairperson',
			Icon: CrownIcon,
			detail: 'One for each committee. Leads it and presides over its meetings and hearings.',
			figure: `${committees.filter((committee) => committee.chairperson).length} of ${committees.length} committees have a chair on record.`,
		},
		{
			title: 'Vice-chairpersons',
			Icon: IdentificationBadgeIcon,
			detail: 'Stand in for the chair, and share in leading the committee’s work.',
			figure: `${range(committees.map((committee) => committee.viceChairpersons.length))} on a committee.`,
		},
		{
			title: 'Members',
			Icon: UsersIcon,
			detail:
				'Study each measure and vote on the committee’s report, signing it in favour, with reservation, or against.',
			figure: `${range(committees.map((committee) => count(committee, 'Member')))} on a committee.`,
		},
		{
			title: 'Ex-officio members',
			Icon: UserCircleIcon,
			// The offices are the Transition Authority's, as the members' own profiles give them; the rosters are its too.
			detail:
				'Seated by the office they hold rather than chosen for the subject: in these rosters, the Transition Authority’s Speaker, Deputy Speakers and Deputy Floor Leaders.',
			figure: everywhere.length ? `${everywhere.length} sit on every committee, or all but one:` : '',
		},
	]

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

			{/* ---- The committees, by kind ----

			    Interior rules only: every cell draws its own top and left edge, and
			    the grid is nudged a pixel up and left so the outermost of those are
			    clipped away. That separates the cells at every breakpoint without
			    hand-counting which one starts a row or a column. */}
			{groups.map((group, groupIndex) => (
				<section
					key={group.key}
					aria-labelledby={`group-${group.key}`}
					className={`bb-container ${groupIndex ? 'pb-[clamp(3.75rem,7vw,6.5rem)]' : 'py-[clamp(3.75rem,7vw,6.5rem)]'}`}
				>
					<div className='mb-8 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between lg:gap-10'>
						<h2 id={`group-${group.key}`} className='section-title'>
							{group.title} <span className='text-[var(--ink-mute)]'>· {group.committees.length}</span>
						</h2>
						<p className='max-w-xl bb-body text-[var(--ink-3)] lg:text-right'>{group.note}</p>
					</div>
					<div className='overflow-hidden border-t border-[var(--rule)]'>
						<div className='-ml-px -mt-px grid sm:grid-cols-2 lg:grid-cols-3'>
							{group.committees.map((committee, index) => (
								<CommitteeCard key={committee.slug} committee={committee} index={index} />
							))}
						</div>
					</div>
				</section>
			))}

			{/* ---- What a committee does ----

			    On a tinted band, so it reads as the explainer between two registers
			    rather than another one. The six verbs are what a committee is for and
			    fit on one screen; the steps further down are what it does to one
			    measure and take longer to read. */}
			<section className='border-t border-[var(--rule)] bg-[var(--paper-2)]'>
				<div className='bb-container py-[clamp(3.75rem,7vw,6.5rem)]'>
					<Reveal>
						<div className='grid items-center gap-10 lg:grid-cols-[1fr_auto]'>
							<div>
								<p className='eyebrow'>What a committee does</p>
								<h2 className='section-title mt-4 max-w-3xl'>Six jobs, on one subject each.</h2>
								<p className='mt-5 max-w-2xl bb-body text-[var(--ink-2)]'>
									A committee is a group of Members of the Parliament organised around one area of
									concern, sitting around one table with whoever it has called to be heard. Every
									committee does the same six things within its subject.
								</p>
							</div>
							<div className='hidden justify-self-end lg:block'>
								<CommitteeTable />
							</div>
						</div>
					</Reveal>

					<div className='mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{functions.map(({ verb, detail, Icon }, index) => (
							<Reveal key={verb} delay={index * 50}>
								<div className='flex h-full gap-4 border border-[var(--rule)] bg-[var(--paper)] p-5 sm:p-6'>
									<span className='grid size-11 shrink-0 place-items-center bg-[var(--accent-soft)] text-[var(--accent)]'>
										<Icon size={22} weight='duotone' aria-hidden='true' />
									</span>
									<div>
										<p className='item-title font-title'>{verb}</p>
										<p className='mt-1 bb-body text-[var(--ink-2)]'>{detail}</p>
									</div>
								</div>
							</Reveal>
						))}
					</div>
				</div>
			</section>

			{/* ---- Who sits on a committee ---- */}
			<section className='bb-container border-t border-[var(--rule)] py-[clamp(3.75rem,7vw,6.5rem)]'>
				<Reveal>
					<div>
						<p className='eyebrow'>Who sits on a committee</p>
						<h2 className='section-title mt-4 max-w-3xl'>A chair, vice-chairs, members, and the leadership.</h2>
					</div>
				</Reveal>

				<div className='mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4'>
					{roles.map(({ title, Icon, detail, figure }, index) => (
						<Reveal key={title} delay={index * 60}>
							<div className='border-t border-[var(--rule-soft)] pt-5'>
								<Icon size={26} weight='duotone' className='text-[var(--accent)]' aria-hidden='true' />
								<p className='item-title mt-3 font-title'>{title}</p>
								<p className='mt-2 bb-body text-[var(--ink-2)]'>{detail}</p>
								{figure ? <p className='mt-3 meta'>{figure}</p> : null}
								{title === 'Ex-officio members' && everywhere.length ? (
									<ul className='mt-2 space-y-1'>
										{everywhere.map((held) => (
											<li key={held.name} className='meta'>
												{held.slug ? (
													<Link
														href={`/members/${held.slug}`}
														className='font-semibold text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-2 hover:decoration-[var(--accent)]'
													>
														{held.name}
													</Link>
												) : (
													<span className='font-semibold text-[var(--ink)]'>{held.name}</span>
												)}
											</li>
										))}
									</ul>
								) : null}
							</div>
						</Reveal>
					))}
				</div>
			</section>

			{/* ---- What happens to a measure ---- */}
			<section className='bb-container border-t border-[var(--rule)] py-[clamp(3.75rem,7vw,6.5rem)]'>
				<Reveal>
					<div>
						<p className='eyebrow'>What happens to a measure</p>
						<h2 className='section-title mt-4 max-w-3xl'>From referral to the report, and after it.</h2>
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
									<span className='num text-[var(--ink-mute)]'>{String(index + 1).padStart(2, '0')}.</span>{' '}
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
							Committee hearings and consultations are open to the general public. A committee holds
							them to gather facts and hear views on a measure before it reports back, which makes this
							the stage where somebody outside the Parliament can still change what a law says.
							Schedules are announced by the Parliament rather than here.
						</p>
					</div>
				</Reveal>
			</section>
		</>
	)
}
