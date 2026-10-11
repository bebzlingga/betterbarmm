import type { Metadata } from 'next'
import { CARD } from './_lib/seo'
import { ArrowRightIcon, ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { ChapterStrip, type StripCard } from './_components/chapter-strip'
import { Counter, CtaAction, CtaPanel, LineReveal, Magnetic, Rise, Stagger, StaggerItem } from '@betterbarmm/editorial'
import { bangsamoroParliament } from '@betterbarmm/primer-data'
import { DiscoverMarquee } from './_components/discover-marquee'
import { photo } from './_components/discover-media'
import { lguCounts, lguData, lguProvinces } from '@betterbarmm/lgu-data'
import { SectionHead } from './_components/masthead'
import { HeroGraphic } from './_components/hero-graphic'
import { SiteHeader } from './_components/site-header'
import { WorkspaceIndex } from './_components/workspace-index'
import { workspaces } from './_lib/workspaces'

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

export default function HomePage() {
	const live = workspaces.filter((workspace) => workspace.state === 'live').length

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

				{/* The artwork is the band's background, not a column: it runs nearly
				    edge to edge behind the type and fades out before it reaches the
				    headline. Desktop only — on a phone it would sit under the words. */}
				<HeroGraphic className='absolute inset-[3%] hidden opacity-50 lg:block' />

				<div className='bb-container masthead-band relative'>
					{/* The headline keeps the room it actually needs. Any narrower and
					    "Public records," wraps, and a two-word line broken across two rows
					    is not a masthead. */}
					<div className='lg:max-w-[62%]'>
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
								<p className='mt-9 max-w-2xl text-[15px] leading-8 text-[var(--ink-2)]'>
									BetterBARMM turns scattered Bangsamoro public records into workspaces you can read,
									question, and trace back to the source — the bills before Parliament, the budgets
									behind them, and every local government in the region.
								</p>
							</Rise>

							<Rise delay={0.45} distance={14}>
								<div className='mt-11 flex flex-wrap items-center gap-3'>
									<Magnetic strength={0.24}>
										<Link href='https://budget.betterbarmm.com' className='bb-btn bb-btn-solid'>
											Open the Budget workspace
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
						</div>
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
								note: 'The level of government nearest the household, and the one most often elected.',
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
