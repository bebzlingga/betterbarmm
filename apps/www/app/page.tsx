import type { Metadata } from 'next'
import { CARD } from './_lib/seo'
import { ArrowRightIcon, ArrowUpRightIcon, MagnifyingGlassIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { DiscoverGrid } from './_components/chapter-grid'
import { LineReveal, Rise } from '@betterbarmm/editorial'
import { DiscoverMarquee } from './_components/discover-marquee'
import { photo } from './_components/discover-media'
import { SectionHead } from './_components/masthead'
import { SiteHeader } from './_components/site-header'
import { Directory } from './_components/directory'
import { ExplainerFeature } from './_components/explainer-card'
import { GetInvolved } from './_components/get-involved'
import { RegionBand } from './_components/region-band'
import { chapterCards } from './_lib/chapters'
import { listExplainers } from './_lib/explainers'
import { projects, workspaces } from './_lib/workspaces'

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


/** The primer's chapters, two of what each holds apiece: the front page is a door, not the index. */
const chapters = chapterCards.map((card) => ({ ...card, contains: card.contains?.slice(0, 2) }))

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
								<span key='line'>
									Public records, <span className='bb-mute'>in one place.</span>
								</span>,
							]}
							delay={0.08}
							// On a phone, two lines at a size that reads; from sm, one line sized to the screen rather than wrapped,
							// up to a step above bb-display-md. Important: bb-display-md sits outside the layers and would win over
							// both, its text-wrap: balance included.
							className='bb-display-md mt-5 text-[var(--ink)] [font-size:clamp(2.4rem,11vw,3.4rem)]! sm:[font-size:clamp(1.6rem,6.4vw,5rem)]! sm:text-nowrap!'
						/>

						<Rise delay={0.3} distance={16}>
							<p className='mx-auto mt-6 max-w-xl text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
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
									<input id='home-search' name='q' placeholder='A bill, a town, a budget line, an official…' className='min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-[#8a857a]' />
								</span>
								<button type='submit' className='h-12 shrink-0 cursor-pointer border-l border-[#e7e2d8] bg-white px-5 text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-[#8f2328] transition hover:bg-[#f7f3ec]'>
									Search
								</button>
							</form>
						</Rise>

						<Rise delay={0.5} distance={12}>
							<p className='mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[0.875rem] font-semibold'>
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

			{/* ---- The directory ----

			    Every workspace and project in one place, grouped by what a reader is
			    looking for (user decision). */}
			<section id='workspaces' className='bb-container scroll-mt-20 py-[clamp(5rem,9vw,8.5rem)]'>
				<SectionHead
					index='01'
					eyebrow='Find a record'
					title='What are you'
					titleMuted='looking for?'
					lead={`${live} workspaces and ${projects.filter((p) => p.state === 'live').length} projects, grouped by what they hold. Every record is traced back to its source.`}
				/>
				<div className='mt-10'>
					<Directory workspaces={workspaces} projects={projects} />
				</div>
			</section>

			{/* ---- Explainers ---- */}
			{explainers.length ? (
				<section className='bg-[var(--paper-2)]'>
					<div className='bb-container py-[clamp(5rem,9vw,8.5rem)]'>
						<SectionHead
							index='02'
							eyebrow='Explainers'
							title='Explainers,'
							titleMuted='in plain words.'
							aside={
								<Link href='/explainers' className='inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--ink)] hover:text-[var(--accent)]'>
									All explainers <ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
								</Link>
							}
						/>
						<div className='mt-10'>
							<ExplainerFeature explainers={explainers.slice(0, 4)} />
						</div>
					</div>
				</section>
			) : null}

			{/* ---- The region, in figures ----

			    The dark band between two light ones: the 7 areas on a map and in a
			    list, then the region in 4 figures. */}
			<RegionBand />

			{/* ---- Discover ----

			    The photographic section: the primer's 5 chapters as one bento, all on
			    one screen. Everything above it is a record you came looking for; this is
			    the part for someone who does not yet know what the Bangsamoro is. Less
			    space on top than the usual step, because the dark band above already
			    divides. */}
			<div id='discover' className='bb-container scroll-mt-20 pt-[clamp(3.5rem,6.5vw,6rem)] pb-[clamp(5rem,9vw,8.5rem)]'>
				<SectionHead
					index='04'
					eyebrow='Discover BARMM'
					title='Get to know'
					titleMuted='the Bangsamoro.'
					aside={
						<Link href='/discover' className='inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--ink)] hover:text-[var(--accent)]'>
							All of Discover <ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
						</Link>
					}
				/>
				<div className='mt-10'>
					<DiscoverGrid cards={chapters} />
				</div>
			</div>

			<GetInvolved />
		</main>
	)
}
