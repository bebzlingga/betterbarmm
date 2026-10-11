import type { Metadata } from 'next'
import Image from 'next/image'
import {
	ArrowRightIcon,
	ArrowUpRightIcon,
	BuildingsIcon,
	CheckSquareOffsetIcon,
	CoinsIcon,
	GavelIcon,
	MapPinIcon,
} from '@phosphor-icons/react/ssr'
import type { Icon } from '@phosphor-icons/react'
import Link from 'next/link'
import { JO } from '@betterbarmm/ai/dock'
import { CtaAction, CtaPanel } from '@betterbarmm/editorial'
import { areaHref, lguData, lguIndex, lguProvinces } from '@betterbarmm/lgu-data'
import { bangsamoroParliament } from '@betterbarmm/primer-data'
import { photo, type DiscoverPhoto } from './_components/discover-media'
import { HubSearch, type HubEntry } from './_components/hub-search'
import { SiteHeader } from './_components/site-header'
import { CARD } from './_lib/seo'

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

/* ============================================================
   The front page, as a hub

   One search for anything the site can open, then the workspaces as
   tiles, a way into your own area, the Discover chapters, and the
   region in four figures. Everything else is a click away.
   ============================================================ */

const LGU = 'https://lgu.betterbarmm.com'

const workspaces: { name: string; href: string; icon: Icon; stat: string; body: string }[] = [
	{
		name: 'Election',
		href: 'https://election.betterbarmm.com',
		icon: CheckSquareOffsetIcon,
		stat: `${bangsamoroParliament.totalSeats} seats`,
		body: 'Parties, candidates, districts and reserved seats in the Bangsamoro parliamentary election, and the count.',
	},
	{
		name: 'Legislation',
		href: 'https://legislation.betterbarmm.com',
		icon: GavelIcon,
		stat: 'Bills, acts, resolutions',
		body: 'Every measure of the Bangsamoro Parliament, the stage it has reached, and who filed it.',
	},
	{
		name: 'Budget',
		href: 'https://budget.betterbarmm.com',
		icon: CoinsIcon,
		stat: 'FY 2020–2026',
		body: 'Each year’s regional budget by sector, office, program and project, traced to the page of the act.',
	},
	{
		name: 'Local government',
		href: LGU,
		icon: BuildingsIcon,
		stat: `${lguData.totals.lgus} cities and towns`,
		body: 'Every province, city, town and barangay: who was elected, the money each receives, and what each discloses.',
	},
]

const planned = ['Public works', 'Public services', 'Travel', 'Source layer']

const chapters: { href: string; title: string; blurb: string; photo: DiscoverPhoto }[] = [
	{ href: '/discover/history', title: 'History', blurb: 'From the sultanates to the Organic Law and the transition.', photo: photo('makhdumMosque') },
	{ href: '/discover/governance', title: 'Government', blurb: 'Parliament, the chief minister, and the ministries.', photo: photo('parliamentBuilding') },
	{ href: '/discover/local-government', title: 'Local government', blurb: 'Provinces, cities, towns and barangays, and who you elect.', photo: photo('cotabatoPlaza') },
	{ href: '/discover/people', title: 'People', blurb: 'The Moro, Indigenous and settler communities of the region.', photo: photo('singkil') },
	{ href: '/discover/culture-places', title: 'Culture & places', blurb: 'Mosques, islands, food, textiles and living heritage.', photo: photo('budBongao') },
]

const quickLinks = [
	{ label: 'Marawi City', href: `${LGU}/lanao-del-sur/marawi` },
	{ label: 'The 2026 budget', href: 'https://budget.betterbarmm.com' },
	{ label: 'Local Governance Code', href: `${LGU}/governance-code` },
	{ label: 'Local officials', href: `${LGU}/officials` },
]

/** What the search can open: workspaces, chapters, the seven areas and every town. */
const searchIndex: HubEntry[] = [
	...workspaces.map((w) => ({ name: w.name, sub: 'Workspace', href: w.href, keys: w.body.toLowerCase() })),
	...chapters.map((c) => ({ name: c.title, sub: 'Discover BARMM', href: c.href, keys: c.blurb.toLowerCase() })),
	...lguProvinces.map((p) => ({ name: p.name, sub: 'Area · Local government', href: `${LGU}${areaHref(p)}`, keys: p.name.toLowerCase() })),
	...lguIndex.map((e) => ({
		name: e.name,
		sub: `${e.unit.isCity ? 'City' : 'Town'} · ${e.province.name}`,
		href: `${LGU}${e.href}`,
		keys: e.haystack,
	})),
]

const H2 = 'text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'

export default function HomePage() {
	const figures = [
		{ value: String(bangsamoroParliament.totalSeats), label: 'Seats in the Bangsamoro Parliament' },
		{ value: String(lguProvinces.length), label: 'Areas: 5 provinces, a city and the Special Geographic Area' },
		{ value: lguData.totals.lgus.toLocaleString('en-PH'), label: 'Cities and municipalities' },
		{ value: lguData.totals.barangays.toLocaleString('en-PH'), label: 'Barangays' },
	]

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader />

			{/* ---- Hero: one search ---- */}
			<section className='brand-bg bb-lattice relative z-10 !overflow-visible'>
				<div className='bb-container relative flex flex-col items-center py-[clamp(4.5rem,10vw,8rem)] text-center'>
					<p className='bb-label'>Bangsamoro public records</p>
					<h1 className='mt-5 max-w-[48rem] font-[family-name:var(--font-display)] text-[clamp(2.4rem,6vw,4.5rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-[var(--ink)]'>
						Find what your government decided, spent and promised.
					</h1>
					<p className='mt-5 max-w-[38rem] text-[16px] leading-7 text-[var(--ink-2)]'>
						Laws, budgets, elections and every local government in the region, in plain language and one click from the
						source.
					</p>
					<div className='mt-9 flex w-full justify-center'>
						<HubSearch index={searchIndex} quickLinks={quickLinks} canAsk={JO} />
					</div>
				</div>
				<div className='bb-weave' aria-hidden='true' />
			</section>

			{/* ---- Workspaces ---- */}
			<section className='bb-container bb-section'>
				<div className='flex flex-wrap items-end justify-between gap-4'>
					<div>
						<h2 className={H2}>Workspaces</h2>
						<p className='mt-2 text-[15px] leading-7 text-[var(--ink-3)]'>Each one built around one part of the public record.</p>
					</div>
				</div>
				<div className='mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
					{workspaces.map((w) => {
						const WIcon = w.icon
						return (
							<a
								key={w.name}
								href={w.href}
								className='group flex flex-col rounded-2xl border border-[var(--rule)] bg-[var(--paper)] p-6 transition hover:-translate-y-0.5 hover:border-transparent hover:shadow-[0_24px_50px_-28px_rgba(0,0,0,0.35)]'
							>
								<div className='flex items-start justify-between'>
									<span className='grid size-12 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]'>
										<WIcon size={24} weight='duotone' aria-hidden='true' />
									</span>
									<ArrowUpRightIcon size={18} className='text-[var(--ink-mute)] transition group-hover:text-[var(--accent)]' aria-hidden='true' />
								</div>
								<h3 className='mt-6 text-[1.2rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>{w.name}</h3>
								<p className='mt-1 text-[12.5px] font-semibold text-[var(--accent)]'>{w.stat}</p>
								<p className='mt-3 flex-1 text-[14px] leading-6 text-[var(--ink-2)]'>{w.body}</p>
							</a>
						)
					})}
				</div>
				<p className='mt-6 text-[13px] text-[var(--ink-3)]'>
					Coming later: {planned.join(', ')}.
				</p>
			</section>

			{/* ---- Your area ---- */}
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container py-[clamp(3.5rem,6vw,5.5rem)]'>
					<h2 className={H2}>Find your area</h2>
					<p className='mt-2 text-[15px] leading-7 text-[var(--ink-3)]'>
						Who was elected, the money it receives, and what it has disclosed.
					</p>
					<div className='mt-8 flex flex-wrap gap-3'>
						{lguProvinces.map((p) => (
							<a
								key={p.slug}
								href={`${LGU}${areaHref(p)}`}
								className='inline-flex items-center gap-2 rounded-full bg-[var(--paper)] px-5 py-3 text-[14.5px] font-semibold text-[var(--ink)] shadow-[0_1px_0_var(--rule)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)]'
							>
								<MapPinIcon size={16} weight='fill' className='text-[var(--accent)]' aria-hidden='true' />
								{p.name}
								<span className='num text-[12px] opacity-60'>{p.municipalities.length}</span>
							</a>
						))}
					</div>
				</div>
			</section>

			{/* ---- Discover ---- */}
			<section className='bb-container bb-section'>
				<div className='flex flex-wrap items-end justify-between gap-4'>
					<div>
						<h2 className={H2}>Discover BARMM</h2>
						<p className='mt-2 text-[15px] leading-7 text-[var(--ink-3)]'>The region in five short chapters.</p>
					</div>
					<Link href='/discover' className='inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--accent)]'>
						All of Discover
						<ArrowRightIcon size={14} weight='bold' aria-hidden='true' />
					</Link>
				</div>
				<div className='-mx-4 mt-8 flex snap-x gap-5 overflow-x-auto px-4 pb-3 [scrollbar-width:thin] lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0'>
					{chapters.map((c) => (
						<Link key={c.href} href={c.href} className='group w-64 shrink-0 snap-start overflow-hidden rounded-2xl bg-[var(--paper-2)] lg:w-auto'>
							<div className='relative aspect-[4/5] overflow-hidden'>
								<Image src={c.photo.src} alt={c.photo.alt} fill sizes='(min-width: 1024px) 20vw, 16rem' className='object-cover transition duration-500 group-hover:scale-105' />
								<div className='absolute inset-0 bg-[linear-gradient(to_top,rgba(10,10,10,0.75),transparent_55%)]' />
								<div className='absolute inset-x-0 bottom-0 p-5 text-white'>
									<h3 className='text-[1.15rem] font-extrabold tracking-[-0.02em]'>{c.title}</h3>
									<p className='mt-1 text-[12.5px] leading-5 text-white/80'>{c.blurb}</p>
								</div>
							</div>
						</Link>
					))}
				</div>
			</section>

			{/* ---- The region in figures ---- */}
			<section className='bb-container bb-section-bottom'>
				<div className='grid grid-cols-2 gap-5 lg:grid-cols-4'>
					{figures.map((f) => (
						<div key={f.label} className='rounded-2xl bg-[var(--paper-2)] p-6'>
							<p className='num font-[family-name:var(--font-display)] text-[clamp(1.9rem,3.6vw,2.6rem)] font-black leading-none tracking-[-0.03em] text-[var(--ink)]'>
								{f.value}
							</p>
							<p className='mt-3 text-[13px] leading-5 text-[var(--ink-3)]'>{f.label}</p>
						</div>
					))}
				</div>
			</section>

			<CtaPanel
				label='Contribute'
				lines={['Better records need', 'many careful readers.']}
				standfirst='Send source links, corrections, missing context, or notes about confusing records.'
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
