import { ArrowRightIcon, ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { ChapterStrip, type StripCard } from './_components/chapter-strip'
import { Counter, CtaAction, CtaPanel, LineReveal, Magnetic, Rise, Stagger, StaggerItem } from '@betterbarmm/editorial'
import { bangsamoroParliament, discoverBarmmTopics } from '@betterbarmm/primer-data'
import { DiscoverMarquee } from './_components/discover-marquee'
import { photo } from './_components/discover-media'
import { lguCounts, lguData, lguProvinces } from '@betterbarmm/lgu-data'
import { SectionHead } from './_components/masthead'
import { ContextDiagram, LivingDiagram, SourceDiagram } from './_components/method-diagram'
import { HeroGraphic } from './_components/hero-graphic'
import { SiteHeader } from './_components/site-header'
import { WorkspaceIndex, type Workspace } from './_components/workspace-index'

/**
 * The band under the hero.
 *
 * It ran the thirty office acronyms — OCM, BICTO, BPDA — which is a roll call
 * of bodies a first-time reader has never heard of, at the one point on the
 * page where they are still deciding whether this site is for them. What it
 * says now is what the site is promising, in the words the promise is made in.
 *
 * Two lines and no more. A band that moves is read a phrase at a time, and a
 * reader who catches a different one on each pass has been given a list to
 * assemble rather than a claim to take away. The marquee repeats them itself,
 * as many times as the window is wide.
 */
const principlesBand = ['Better Transparency', 'Better Governance']

const workspaces: Workspace[] = [
	{
		label: 'Election',
		href: 'https://election.betterbarmm.com',
		blurb:
			'Parties, candidates, districts, and sectoral seats for the 2026 Parliamentary Elections, with the source record behind each one.',
		measure: '2026 Parliament',
		state: 'live',
	},
	{
		label: 'Legislation',
		href: 'https://legislation.betterbarmm.com',
		blurb:
			'Bills, autonomy acts, resolutions, committees, and the members who filed them — with the stage each measure has reached.',
		measure: 'Bangsamoro Parliament',
		state: 'live',
	},
	{
		label: 'Budget',
		href: 'https://budget.betterbarmm.com',
		blurb:
			'Every enacted appropriation by sector, office, program and project, traced to the page of the Act it was printed on.',
		measure: 'GAAB FY 2020–2026',
		state: 'live',
	},
	{
		label: 'Public works',
		blurb: 'Infrastructure projects, their cost, their contractor, and whether they were finished.',
		measure: 'Infrastructure',
		state: 'planned',
	},
	{
		label: 'Local government',
		href: '/soon',
		blurb:
			'Every province, city, municipality and barangay in the region — population, land area, and the officials elected to each.',
		measure: 'LGU directory',
		// Marked by where it actually goes. It was flagged live while its link
		// still pointed at the holding page, which is the one inconsistency an
		// index like this cannot afford: a reader who trusts the badge clicks it
		// and lands on "not yet".
		state: 'soon',
	},
	{
		label: 'Travel',
		href: '/soon',
		blurb:
			'A written guide to the seven areas — what there is to see, what to eat, where lodging actually exists, and an honest account of the security picture in each.',
		measure: 'Seven areas',
		// The only workspace here that is written rather than captured, and the
		// blurb says so: everything else on this index promises a record traced
		// to the body that published it, and this one cannot make that promise.
		state: 'soon',
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

/** The five chapters of the primer, as the strip presents them. */
const chapters: StripCard[] = [
	{
		href: '/discover/history',
		title: 'History',
		blurb: 'From the sultanates and the Bangsamoro struggle to the Organic Law and the transition.',
		photo: photo('makhdumMosque'),
		contains: ['Sultanates', 'Peace process'],
	},
	{
		href: '/discover/governance',
		title: 'Government',
		blurb: 'Parliament, the chief minister, ministries, and the offices that run the region.',
		photo: photo('parliamentBuilding'),
		contains: ['Parliament', 'Ministries'],
	},
	{
		href: '/discover/local-government',
		title: 'Local Government',
		blurb: 'Provinces, cities, municipalities and barangays — and who you elect to each.',
		photo: photo('cotabatoPlaza'),
		contains: ['Provinces', 'Barangays'],
	},
	{
		href: '/discover/people',
		title: 'People',
		blurb: 'The Moro, Indigenous, and settler communities that shape Bangsamoro life.',
		photo: photo('singkil'),
		contains: ['13 Moro groups', 'Languages'],
	},
	{
		href: '/discover/culture-places',
		title: 'Culture & Places',
		blurb: 'Mosques, sacred sites, islands, food, textiles, and living heritage.',
		photo: photo('budBongao'),
		contains: ['Islands', 'Textiles'],
	},
]

const principles = [
	{
		label: 'Source-first',
		title: 'Start with the record.',
		description:
			'Every workspace is built on a visible source trail — official PDFs, datasets, and public records you can open yourself.',
		diagram: SourceDiagram,
	},
	{
		label: 'Context',
		title: 'Explain what it means.',
		description:
			'Records come with dates, labels, plain-language notes, and enough background to know why they matter.',
		diagram: ContextDiagram,
	},
	{
		label: 'Living data',
		title: 'Keep it honest.',
		description:
			'Names, figures, and statuses change. Warnings and verification notes stay right beside the data.',
		diagram: LivingDiagram,
	},
]

/**
 * The band under the masthead names the offices of the Bangsamoro Government.
 *
 * It used to run the region's peoples, which is the right band for Discover —
 * that half of the site is about who the Bangsamoro are. This half is about
 * what governs them, and a reader who arrives knowing "BARMM" as an acronym
 * should have met the ministries and commissions that spend its budget before
 * they reach the first heading.
 *
 * They run as abbreviations — MILG, MBHTE, BCPCH — which is what the offices
 * are called in the region and what fits a band at this size.
 */

export default function HomePage() {
	const live = workspaces.filter((workspace) => workspace.state === 'live').length

	// The primer's own size, counted from its data the way the Discover index
	// counts it. A chapter added or a date added to a timeline moves these
	// figures without anyone remembering to come back here.
	const chapterCount = discoverBarmmTopics.length
	const peopleCount = discoverBarmmTopics
		.flatMap((topic) => topic.peopleGroups ?? [])
		.reduce((sum, group) => sum + group.people.length, 0)
	const momentCount = discoverBarmmTopics.reduce(
		(sum, topic) => sum + (topic.timeline?.length ?? 0),
		0,
	)

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader />

			{/* ---- Masthead ----

			    Type on the left, ornament on the right. The right-hand column is the
			    whole argument for the split: every other page on this estate opens on
			    a paragraph, and a paragraph is not what makes someone who has never
			    heard of the Bangsamoro read the next screen. */}
			{/* The masthead is the one band on the front page painted in the brand
			    crimson. `.brand-bg` re-points the tokens rather than restyling the
			    parts, so the headline, the standfirst, the three figures, the two
			    buttons and the artwork all invert together — and anything added
			    here later inverts with them. */}
			<section className='brand-bg bb-lattice relative overflow-hidden'>
				<span aria-hidden='true' className='bb-glow absolute -left-[6%] -top-[14%] size-[34rem]' />

				<div className='bb-container masthead-band relative'>
					{/* The left column is given the room the headline actually needs. At an
					    even split "Public records," wrapped at every desktop width, and a
					    two-word line broken across two rows is not a masthead. */}
					<div className='grid items-center gap-20 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16'>
						<div>
							<Rise distance={14}>
								<p className='bb-label'>Public transparency for the Bangsamoro</p>
							</Rise>

							<LineReveal
								lines={['Public records,', 'in one place.']}
								delay={0.08}
								className='bb-display mt-7 text-[var(--ink)]'
								lineClassName={[undefined, 'bb-mute']}
							/>

							<Rise delay={0.35} distance={16}>
								<p className='mt-9 max-w-2xl text-[16px] leading-[var(--leading-body)] text-[var(--ink-2)]'>
									BetterBARMM turns scattered Bangsamoro public records into workspaces you can read,
									question, and trace back to the source — the bills before Parliament, the budgets
									behind them, and every local government in the region.
								</p>
							</Rise>

							<Rise delay={0.45} distance={14}>
								<div className='mt-11 flex flex-wrap items-center gap-3'>
									<Magnetic strength={0.24}>
										<Link href='https://election.betterbarmm.com' className='bb-btn bb-btn-solid'>
											Open the Election workspace
											<ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
										</Link>
									</Magnetic>
									<Magnetic strength={0.24}>
										<Link href='/discover' className='bb-btn bb-btn-ghost'>
											Discover BARMM
										</Link>
									</Magnetic>
								</div>
							</Rise>

							{/* Three measurements on a brass rule. They used to count the
							    workspaces and the seats, which is the registry describing
							    itself to someone who already knows what a registry is for.
							    A reader arriving cold needs the region first, so the figures
							    are the primer's: what there is to read, and how much of the
							    Bangsamoro is in it. */}
							<Rise delay={0.6} distance={14}>
								<dl className='mt-14 flex flex-wrap gap-x-10 gap-y-6 border-t border-[var(--brass-line)] pt-6'>
									{[
										{ value: `${chapterCount}`, label: 'Chapters to read' },
										{ value: `${peopleCount}`, label: 'Peoples and communities' },
										{ value: `${momentCount}`, label: 'Moments on the timeline' },
									].map((fact) => (
										<div key={fact.label}>
											<dt className='sr-only'>{fact.label}</dt>
											<dd className='bb-figure-sm text-[var(--ink)]'>{fact.value}</dd>
											<p className='mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
												{fact.label}
											</p>
										</div>
									))}
								</dl>
							</Rise>
						</div>

						{/* The artwork is the right-hand column of the split, and nothing
						    else. Below the breakpoint there is no right-hand column: it
						    stacked under the headline as a tall diagram of a document
						    standing between the reader and the first workspace, on the one
						    screen size where the scroll to get past it costs the most. The
						    headline beside it already says what it draws, which is why it
						    can go without leaving a hole. */}
						<HeroGraphic className='hidden lg:block' />
					</div>
				</div>
			</section>

			{/* ---- The names ---- */}
			<DiscoverMarquee items={principlesBand} duration={50} />

			{/* ---- The workspaces ---- */}
			<section id='workspaces' className='bb-container scroll-mt-20 bb-section'>
				<SectionHead
					index='01'
					eyebrow='The workspaces'
					title={`${live} live.`}
					titleMuted='More on the way.'
					lead='Each one turns a pile of public records into something you can read, question, and trace back to the source. A card without a link is one we have not built yet.'
				/>

				<div>
					<WorkspaceIndex workspaces={workspaces} />
				</div>
			</section>

			{/* ---- The region, in figures ----

			    The dark band between two light ones. It answers the question the
			    workspaces above raise and never state: how big is the thing all
			    this is about. */}
			<section className='bb-ground bb-grain bb-lattice relative isolate overflow-hidden border-y border-[var(--rule)]'>

				<div className='bb-container relative z-2 bb-section'>
					<Rise distance={14}>
						<div className='bb-kicker'>
							<span>02</span>
							<span>What is being governed</span>
						</div>
					</Rise>

					<div className='mt-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16'>
						<LineReveal
							as='h2'
							lines={['One region.', 'Five provinces, a city, and a special area.']}
							className='bb-display-md text-[var(--ink)]'
							lineClassName={[undefined, 'bb-mute']}
						/>
						<Rise delay={0.2} distance={14}>
							<p className='max-w-md bb-body text-[var(--ink-2)] lg:text-right'>
								BARMM is the only autonomous region in the Philippines with its own parliament. On{' '}
								{bangsamoroParliament.electionDay} its voters elect all{' '}
								{bangsamoroParliament.totalSeats} members for the first time.
							</p>
						</Rise>
					</div>

					<Stagger
						gap={0.09}
						className='mt-16 grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-10 sm:gap-y-12 lg:mt-20 lg:grid-cols-4'
					>
						{[
							{
								value: bangsamoroParliament.totalSeats,
								label: 'Seats in Parliament',
								note: `${bangsamoroParliament.partyRepresentativeSeats} by party, ${bangsamoroParliament.districtSeats} by district, ${bangsamoroParliament.reservedSeats} reserved.`,
							},
							{
								value: lguProvinces.length,
								label: 'Areas of the region',
								note: 'Five provinces, Cotabato City, and the Special Geographic Area. Sulu was excluded by the Supreme Court.',
							},
							{
								value: lguData.totals.barangays,
								label: 'Barangays',
								group: true,
								note: 'The rung of government nearest the household, and the one most often elected.',
							},
							{
								/* Millions, to two places, rather than all seven digits. At
								   display size 4,330,783 is a wall of numerals that nobody reads
								   as a quantity — the eye counts the commas instead. The exact
								   figure is not lost: it is what the note underneath compares
								   against PSA's own, which is the one place on the page a reader
								   wants it to the person. */
								value: lguData.totals.population / 1e6,
								decimals: 2,
								suffix: ' M',
								label: 'People',
								// PSA's own BARMM total is 5,691,583 and counts both Sulu, which the
								// Supreme Court removed from the region, and the Special Geographic
								// Area, whose municipalities have no census figures of their own yet.
								note: `At the ${lguCounts.populationAsOf} census, excluding Sulu and the Special Geographic Area. PSA counts both, and puts the region at ${lguCounts.population}.`,
							},
						].map((stat) => (
							<StaggerItem key={stat.label}>
								<div className='border-t border-[var(--brass-line)] pt-6'>
									<p className='bb-figure text-[var(--ink)]'>
										<Counter
											value={stat.value}
											group={stat.group ?? false}
											decimals={stat.decimals ?? 0}
											suffix={stat.suffix ?? ''}
										/>
									</p>
									<p className='mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brass)]'>
										{stat.label}
									</p>
									<p className='mt-2.5 text-[13.5px] leading-[var(--leading-body)] text-[var(--ink-2)]'>
										{stat.note}
									</p>
								</div>
							</StaggerItem>
						))}
					</Stagger>
				</div>
			</section>

			{/* ---- Discover ----

			    The photographic section, and the only one that travels sideways.
			    Everything above it is a record you came looking for; this is the
			    part for someone who does not yet know what the Bangsamoro is.

			    The head is handed to the strip rather than set above it, so it
			    stays on screen for as long as the cards are traveling. */}
			{/* Half the section rhythm above, not the full step. The band overhead is
			    dark and full-bleed, and a dark edge already reads as a division — the
			    usual distance on top of it left the head floating away from both. */}
			<div id='discover' className='bb-container scroll-mt-20 pt-[clamp(2.25rem,4.75vw,4.5rem)]'>
				<ChapterStrip
					cards={chapters}
					heading={
						<SectionHead
							index='03'
							eyebrow='Discover BARMM'
							title='Get to know'
							titleMuted='the Bangsamoro.'
						/>
					}
				/>
			</div>

			{/* ---- Method ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='04'
					eyebrow='How it works'
					title='Built to'
					titleMuted='be checked.'
				/>

				<Stagger gap={0.12} className='grid gap-14 sm:grid-cols-3 sm:gap-10'>
					{principles.map((principle) => {
						const Diagram = principle.diagram

						return (
							<StaggerItem key={principle.label}>
								<div className='flex h-full flex-col'>
									<Diagram />
									<p className='bb-label mt-9'>{principle.label}</p>
									<h3 className='mt-4 text-[1.35rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>
										{principle.title}
									</h3>
									<p className='mt-3 bb-body text-[var(--ink-2)]'>
										{principle.description}
									</p>
								</div>
							</StaggerItem>
						)
					})}
				</Stagger>
			</section>

			<CtaPanel
				label='Get involved'
				lines={['Public records get better', 'when people check them.']}
				standfirst='Spotted an error, or have a document worth adding? Every correction and every source makes the record stronger — and the official source is always right where we are wrong.'
			>
				<CtaAction>
					<Link href='/contribute' className='bb-btn bb-btn-brass'>
						Contribute
						<ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
					</Link>
				</CtaAction>
				<CtaAction>
					<Link href='/about' className='bb-btn bb-btn-ghost'>
						About the project
					</Link>
				</CtaAction>
			</CtaPanel>
		</main>
	)
}
