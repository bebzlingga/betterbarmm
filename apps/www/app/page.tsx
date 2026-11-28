import type { Metadata } from 'next'
import { CARD } from './_lib/seo'
import { AddressBookIcon, ArrowRightIcon, CoinsIcon, CompassIcon, MagnifyingGlassIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { DiscoverGrid } from './_components/chapter-grid'
import { DiscoverMarquee } from './_components/discover-marquee'
import { SectionHead } from './_components/masthead'
import { SiteHeader } from './_components/site-header'
import { PhotoHero } from './_components/photo-hero'
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

			{/* ---- Masthead, in the travel look (user decision): the region's photographs turning under the bars, the
			    promise and the search centred on them, the ways in as glass buttons. ---- */}
			<PhotoHero
				showPhotos
				photos={['panampangan', 'parliamentBuilding', 'lakeLanao', 'marawiGrandMosque']}
				center
				tall
				kicker='Public transparency for the Bangsamoro'
				title={
					<>
						Public records, <span className='text-white/55'>in one place.</span>
					</>
				}
				lede='Bills, budgets, elections, procurement and every local government in the region, readable and traced back to the source.'
			>
				<form action='/search' role='search' className='mx-auto mt-9 w-full max-w-2xl'>
					<span className='flex h-16 items-center gap-3 rounded-full bg-white pl-6 pr-2 text-[#191713] shadow-[0_24px_48px_-24px_rgba(0,0,0,0.7)]'>
						<MagnifyingGlassIcon size={20} className='shrink-0 text-[#5c574c]' aria-hidden='true' />
						<label className='sr-only' htmlFor='home-search'>
							Search BetterBARMM
						</label>
						<input
							id='home-search'
							name='q'
							type='search'
							autoComplete='off'
							placeholder='A bill, a town, a budget line, an official…'
							className='min-w-0 flex-1 bg-transparent text-[1rem] outline-none placeholder:text-[#8a857a] [&::-webkit-search-cancel-button]:hidden'
						/>
						<button type='submit' className='h-12 shrink-0 cursor-pointer rounded-full bg-[#8f2328] px-6 font-[family-name:var(--font-display)] text-[0.875rem] font-semibold text-white transition hover:brightness-110'>
							Search
						</button>
					</span>
				</form>
				<nav aria-label='Ways in' className='mt-6 flex flex-wrap justify-center gap-2'>
					{[
						{ href: 'https://budget.betterbarmm.com', label: 'The Budget workspace', icon: CoinsIcon },
						{ href: '/directory', label: 'The Directory', icon: AddressBookIcon },
						{ href: '/discover', label: 'Discover BARMM', icon: CompassIcon },
					].map(({ href, label, icon: Glyph }) => (
						<Link key={href} href={href} className='dv-btn dv-btn-glass !px-4 !py-2 !text-[0.8125rem]'>
							<Glyph size={14} weight='bold' aria-hidden='true' /> {label}
						</Link>
					))}
				</nav>
			</PhotoHero>

			{/* ---- The names ---- */}
			<DiscoverMarquee items={principlesBand} duration={50} />

			{/* ---- The directory ----

			    Every workspace and project in one place, grouped by what a reader is
			    looking for (user decision). */}
			<section id='workspaces' className='bb-container dv-section scroll-mt-8'>
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
				<section className='tv-wash'>
					<div className='bb-container dv-section'>
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
