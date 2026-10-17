import type { Metadata } from 'next'
import { CARD } from './_lib/seo'
import { ArrowRightIcon, ArrowUpRightIcon, MagnifyingGlassIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { ChapterStrip, type StripCard } from './_components/chapter-strip'
import { Counter, LineReveal, Rise, Stagger, StaggerItem } from '@betterbarmm/editorial'
import { bangsamoroParliament } from '@betterbarmm/primer-data'
import { DiscoverMarquee } from './_components/discover-marquee'
import { photo } from './_components/discover-media'
import { lguCounts, lguData, lguProvinces } from '@betterbarmm/lgu-data'
import { SectionHead } from './_components/masthead'
import { SiteHeader } from './_components/site-header'
import { WorkspaceList } from './_components/workspace-index'
import { ExplainerCard } from './_components/explainer-card'
import { GetInvolved } from './_components/get-involved'
import { listExplainers } from './_lib/explainers'
import { projects, workspaces } from './_lib/workspaces'
import { ProjectList } from './_components/project-list'

export const metadata: Metadata = {
	alternates: { canonical: '/' },
	openGraph: {
		type: 'website',
		siteName: 'BetterBARMM',
		locale: 'en_PH',
		url: '/',
		title: 'BetterBARMM — Bangsamoro public records, made readable',
		description:
			'A public transparency project for the Bangsamoro. Public records — elections, laws, budgets, local governments — organized so you can read, question, and trace them back to the source.',
		images: [CARD],
	},
}

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

// New explainers reach the front page within a minute of being published, as they reach the Explainers page.
export const revalidate = 60

export default async function HomePage() {
	const live = workspaces.filter((workspace) => workspace.state === 'live').length
	const explainers = await listExplainers().catch(() => [])

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
			    parts, so the headline, the standfirst, the three figures, the search
			    and the links all invert together — and anything added
			    here later inverts with them. */}
			<section className='brand-bg bb-lattice relative overflow-hidden'>
				{/* A warm yellow light from the top centre, over the headline. Important: bb-glow sets its own brass ground outside the layers. */}
				<span
					aria-hidden='true'
					className='bb-glow absolute -top-[22rem] left-1/2 h-[40rem] w-[64rem] max-w-[160vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,206,84,0.75)_0%,rgba(255,170,40,0.35)_38%,transparent_70%)]! opacity-80!'
				/>

				{/* Shorter than it was, and it now does a job: the search box is the band's one
				    action, since most readers arrive looking for something specific — a bill, a
				    town, a budget line. The links under it are the ways in for everyone else. */}
				<div className='bb-container relative py-20 lg:py-32'>
					{/* One centred column: label, headline, standfirst, search, the ways in. */}
					<div className='mx-auto max-w-5xl text-center'>
						<Rise distance={14}>
							<p className='bb-label'>Public transparency for the Bangsamoro</p>
						</Rise>

						<LineReveal
							lines={[
								<>
									Public records, <span className='bb-mute'>in one place.</span>
								</>,
							]}
							delay={0.08}
							// One line at every width: sized to the screen rather than wrapped, up to a step above bb-display-md.
							// Important: bb-display-md sits outside the layers and would win over both, its text-wrap: balance included.
							className='bb-display-md mt-5 text-[var(--ink)] [font-size:clamp(1.6rem,6.4vw,5rem)]! text-nowrap!'
						/>

						<Rise delay={0.3} distance={16}>
							<p className='mx-auto mt-6 max-w-xl text-[15px] leading-7 text-[var(--ink-2)]'>
								Bills, budgets, elections, procurement and every local government in the region, readable and traced back to the source.
							</p>
						</Rise>

						<Rise delay={0.4} distance={14}>
							<form action='/search' role='search' className='mx-auto mt-8 flex max-w-xl text-left'>
								<label className='sr-only' htmlFor='home-search'>
									Search BetterBARMM
								</label>
								{/* Fixed colours: inside the band, --paper and --ink are re-pointed to its crimson ground. */}
								<span className='flex h-12 min-w-0 flex-1 items-center gap-3 bg-white px-4 text-[#191713]'>
									<MagnifyingGlassIcon size={18} className='shrink-0 text-[#5c574c]' aria-hidden='true' />
									<input id='home-search' name='q' placeholder='A bill, a town, a budget line, an official…' className='min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#8a857a]' />
								</span>
								<button type='submit' className='h-12 shrink-0 cursor-pointer border-l border-[#e7e2d8] bg-white px-5 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#8f2328] transition hover:bg-[#f7f3ec]'>
									Search
								</button>
							</form>
						</Rise>

						<Rise delay={0.5} distance={12}>
							<p className='mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[14px] font-semibold'>
								<Link href='https://budget.betterbarmm.com' className='inline-flex items-center gap-1.5 text-[var(--ink)] underline decoration-white/40 underline-offset-4 hover:decoration-white'>
									Open the Budget workspace <ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
								</Link>
								<Link href='/discover' className='inline-flex items-center gap-1.5 text-[var(--ink)] underline decoration-white/40 underline-offset-4 hover:decoration-white'>
									Discover BARMM <ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
								</Link>
							</p>
						</Rise>
					</div>
				</div>
			</section>

			{/* ---- The names ---- */}
			<DiscoverMarquee items={principlesBand} duration={50} />

			{/* ---- The workspaces ----

			    Compact: the live ones as slim rows and the rest as a line of names. The
			    full cards took a screen and a half to say five things. */}
			<section id='workspaces' className='bb-container scroll-mt-20 py-20 lg:py-24'>
				<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2'>
					<h2 className='text-[1.6rem] font-extrabold tracking-[-0.03em]'>
						The workspaces <span className='text-[var(--ink-mute)]'>· {live} live</span>
					</h2>
					<p className='max-w-xl text-[13.5px] leading-6 text-[var(--ink-3)]'>Public records you can read, question, and trace back to the source.</p>
				</div>
				<div className='mt-6'>
					<WorkspaceList workspaces={workspaces} />
				</div>
			</section>

			{/* ---- The projects ----

			    The same grid as the workspaces, each with a picture of what it holds. */}
			<section aria-labelledby='projects-title' className='border-t border-[var(--rule)]'>
				<div className='bb-container py-20 lg:py-24'>
					<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2'>
						<h2 id='projects-title' className='text-[1.6rem] font-extrabold tracking-[-0.03em]'>
							Projects <span className='text-[var(--ink-mute)]'>· {projects.filter((p) => p.state === 'live').length} live</span>
						</h2>
						<p className='max-w-xl text-[13.5px] leading-6 text-[var(--ink-3)]'>Records of another kind, each on a page of its own.</p>
					</div>
					<div className='mt-6'>
						{/* Programs & services is hidden for now; only the live projects show. */}
						<ProjectList projects={projects.filter((p) => p.state === 'live')} />
					</div>
				</div>
			</section>

			{/* ---- Explainers ---- */}
			{explainers.length ? (
				<section aria-labelledby='explainers-title' className='border-t border-[var(--rule)]'>
					<div className='bb-container py-20 lg:py-24'>
						<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2'>
							<h2 id='explainers-title' className='text-[1.6rem] font-extrabold tracking-[-0.03em]'>
								Explainers
							</h2>
							<p className='flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[13.5px] leading-6 text-[var(--ink-3)]'>
								How government works, in plain words.
								<Link href='/explainers' className='inline-flex items-center gap-1.5 font-semibold text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'>
									All explainers <ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
								</Link>
							</p>
						</div>
						<div className='mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
							{explainers.slice(0, 3).map((e) => (
								<ExplainerCard key={e.id} e={e} heading='h3' />
							))}
						</div>
					</div>
				</section>
			) : null}

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
								note: 'The level of government nearest the household, and the one most often elected.',
							},
							{
								/* Millions, to two places, rather than all seven digits. At
								   display size 4,545,486 is a wall of numerals that nobody reads
								   as a quantity — the eye counts the commas instead. The exact
								   figure is not lost: it is what the note underneath compares
								   against PSA's own, which is the one place on the page a reader
								   wants it to the person. */
								value: lguData.totals.population / 1e6,
								decimals: 2,
								suffix: ' M',
								label: 'People',
								// PSA's own BARMM total is 5,691,583 and counts Sulu, which the
								// Supreme Court removed from the region.
								note: `At the ${lguCounts.populationAsOf} census, excluding Sulu, which the Supreme Court removed from the region. PSA counts it, and puts the region at ${lguCounts.population}.`,
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
			<div id='discover' className='bb-container scroll-mt-20 py-[clamp(2.25rem,4.75vw,4.5rem)]'>
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

			<GetInvolved />
		</main>
	)
}
