import { BrandLogo, FOOTER_FOLLOW, FOOTER_WORKSPACES } from '@betterbarmm/editorial'
import { travelAreas } from '@betterbarmm/travel-data'
import { EXPLORE_KINDS, exploreEats, explorePlaces, exploreStays } from '@betterbarmm/travel-data/explore'
import { KIND_ICON } from './kind-icon'
import type { Icon } from '@phosphor-icons/react'
import {
	AirplaneTiltIcon,
	ArrowRightIcon,
	BedIcon,
	BoatIcon,
	BooksIcon,
	BuildingsIcon,
	CalendarStarIcon,
	CameraIcon,
	CheckSquareOffsetIcon,
	CoinsIcon,
	CompassIcon,
	EnvelopeSimpleIcon,
	FacebookLogoIcon,
	ForkKnifeIcon,
	GraduationCapIcon,
	HeartIcon,
	HouseIcon,
	MapPinIcon,
	MapPinPlusIcon,
	PencilSimpleLineIcon,
	ScrollIcon,
	ShoppingCartIcon,
} from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { commonsThumb } from '../_lib/commons'
import { DESTINATIONS } from '../_lib/discover'
import { GUIDE_PAGES } from '../_lib/guide'

/* ============================================================
   The travel workspace's own footer (user decision: the Discover look
   carried to the foot of every page)

   The seven areas as photo tiles first, each on one of its own
   places' photographs; then the guide's links, the estate's
   workspaces and the follow buttons (the estate's own lists, so they
   never drift from the other workspaces'); the region's name set large;
   and the estate's licence line.
   ============================================================ */

const T = 'https://travel.betterbarmm.com'

/* ---- The region's name, a different weave in each letter (user decision) ---- */

const WORD = 'Bangsamoro'
/** The cloth's colours, lifted to read on the dark ground, and where each sits along the word. */
const STOPS: [number, [number, number, number]][] = [
	[0, [255, 211, 77]],
	[0.36, [255, 107, 94]],
	[0.7, [201, 139, 255]],
	[1, [127, 224, 122]],
]
/** The colour at a point along the word, between the stops on either side. */
function colourAt(t: number) {
	const k = STOPS.findIndex(([at]) => at >= t)
	const [a, ca] = STOPS[Math.max(k - 1, 0)]!
	const [b, cb] = STOPS[Math.max(k, 0)]!
	const f = b === a ? 0 : (t - a) / (b - a)
	return `rgb(${ca.map((v, i) => Math.round(v + (cb[i]! - v) * f)).join(' ')} / 0.7)`
}
/** One weave per letter, in that letter's colour: diamonds, bands, warp, checks, dots, grid, chevrons, rings, twill, small diamonds. */
const WEAVES: ((c: string) => React.CSSProperties)[] = [
	(c) => ({ backgroundImage: `repeating-linear-gradient(45deg, ${c} 0 1.5px, transparent 1.5px 13px), repeating-linear-gradient(-45deg, ${c} 0 1.5px, transparent 1.5px 13px)` }),
	(c) => ({ backgroundImage: `repeating-linear-gradient(0deg, ${c} 0 3px, transparent 3px 11px)` }),
	(c) => ({ backgroundImage: `repeating-linear-gradient(90deg, ${c} 0 2px, transparent 2px 9px)` }),
	(c) => ({ backgroundImage: `conic-gradient(${c} 25%, transparent 0 50%, ${c} 0 75%, transparent 0)`, backgroundSize: '14px 14px' }),
	(c) => ({ backgroundImage: `radial-gradient(${c} 2px, transparent 2.5px)`, backgroundSize: '11px 11px' }),
	(c) => ({ backgroundImage: `repeating-linear-gradient(0deg, ${c} 0 1.5px, transparent 1.5px 12px), repeating-linear-gradient(90deg, ${c} 0 1.5px, transparent 1.5px 12px)` }),
	(c) => ({ backgroundImage: `linear-gradient(135deg, ${c} 25%, transparent 25%), linear-gradient(225deg, ${c} 25%, transparent 25%)`, backgroundSize: '16px 16px' }),
	(c) => ({ backgroundImage: `repeating-radial-gradient(circle at 50% 60%, ${c} 0 1.5px, transparent 1.5px 9px)` }),
	(c) => ({ backgroundImage: `repeating-linear-gradient(-60deg, ${c} 0 3px, transparent 3px 10px)` }),
	(c) => ({ backgroundImage: `linear-gradient(45deg, ${c} 25%, transparent 25% 75%, ${c} 75%), linear-gradient(-45deg, ${c} 25%, transparent 25% 75%, ${c} 75%)`, backgroundSize: '12px 12px' }),
]
const letterPattern = (i: number): React.CSSProperties => WEAVES[i % WEAVES.length]!(colourAt((i + 0.5) / WORD.length))

type Row = { href: string; label: string; icon: Icon }

/** What a reader can send the project, each a link to the contribute page. */
const ASKS = [
	{ icon: MapPinPlusIcon, title: 'Send a place', note: 'A beach, falls, mosque or café the guide has not listed yet.' },
	{ icon: CameraIcon, title: 'Share a photograph', note: 'One you took of a place here, credited to you.' },
	{ icon: PencilSimpleLineIcon, title: 'Send a correction', note: 'Something wrong or out of date? Tell us and it gets fixed.' },
]

/** A column of links, each a row with its glyph in the estate's crimson, lifted for the dark ground. */
function LinkRows({ title, links }: { title: string; links: Row[] }) {
	return (
		<>
			<p className='text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-white/45'>{title}</p>
			<ul className='mt-2.5'>
				{links.map(({ href, label, icon: Glyph }) => (
					<li key={href + label}>
						<a href={href} className='group flex items-center gap-3 rounded-xl py-1.5 text-[0.9375rem] text-white/80 transition hover:text-white'>
							<Glyph size={18} weight='duotone' aria-hidden='true' className='shrink-0' style={{ color: '#e8796a' }} />
							{label}
						</a>
					</li>
				))}
			</ul>
		</>
	)
}

/** The kinds a visitor reaches for first, each opening the explorer on it, with the explorer's own glyphs. */
const kindsColumn = {
	title: 'Explore by kind',
	links: (['island', 'beach', 'mosque', 'falls', 'mountain', 'heritage'] as const).map((k) => ({
		href: `${T}/?kind=${k}`,
		label: EXPLORE_KINDS.find((x) => x.key === k)!.label,
		icon: KIND_ICON[k],
	})),
}

/** The estate's other workspaces (its own list), each with a glyph for what it holds. */
const WORKSPACE_ICON: Record<string, Icon> = {
	Election: CheckSquareOffsetIcon,
	Legislation: ScrollIcon,
	Budget: CoinsIcon,
	'Local government': BuildingsIcon,
	Procurement: ShoppingCartIcon,
	Education: GraduationCapIcon,
	Library: BooksIcon,
	'Discover BARMM': HouseIcon,
}
const workspacesColumn = {
	title: 'More of BetterBARMM',
	links: FOOTER_WORKSPACES.filter((w) => !w.href.includes('travel.')).map((w) => ({ ...w, icon: WORKSPACE_ICON[w.label] ?? HouseIcon })),
}

export function TravelFooter() {
	const areas = travelAreas.map((a) => {
		const own = explorePlaces.filter((p) => p.area === a.slug)
		return { ...a, count: own.length, cover: own.find((p) => p.images.length)?.images[0], href: DESTINATIONS.some((d) => d.slug === a.slug) ? `/discover/${a.slug}` : `/${a.slug}` }
	})
	const columns = [
		{
			title: 'Discover',
			links: [
				{ href: `${T}/`, label: 'All places', icon: CompassIcon },
				...DESTINATIONS.map((d) => ({ href: `${T}/discover/${d.slug}`, label: travelAreas.find((a) => a.slug === d.slug)?.name ?? d.slug, icon: MapPinIcon })),
				{ href: `${T}/calendar`, label: 'Calendar', icon: CalendarStarIcon },
				{ href: `${T}/saved`, label: 'Saved places', icon: HeartIcon },
			],
		},
		{
			title: 'Getting here',
			links: [
				{ href: `${T}/flights`, label: 'Flights', icon: AirplaneTiltIcon },
				{ href: `${T}/ferries`, label: 'Ferries & boats', icon: BoatIcon },
				{ href: `${T}/eat`, label: 'Where to eat', icon: ForkKnifeIcon },
			],
		},
		// The guide's own pages, while they are hidden, are not linked (GUIDE_PAGES).
		...(GUIDE_PAGES
			? [{ title: 'The guide', links: [{ href: `${T}/plan`, label: 'Plan a trip', icon: CompassIcon }, { href: `${T}/stays`, label: 'Where to sleep', icon: BedIcon }] }]
			: []),
	]

	return (
		<>
			{/* ---- The project's ask, on a light band of its own above the footer (user decision): the question, then the three
			     things a reader can send as columns on hairlines. ---- */}
			<section className='tv-ask'>
				<div className='bb-container grid gap-12 py-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16 lg:py-32'>
					{/* The question on the left, the three asks stacked on the right (user decision: two columns). */}
					<div>
						<p className='font-[family-name:var(--font-display)] text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]'>Get involved</p>
						<h2 className='mt-4 max-w-[38rem] font-[family-name:var(--font-display)] text-[clamp(2.25rem,4.2vw,3.5rem)] font-extrabold leading-[1.1] tracking-[-0.035em] text-[var(--ink)]'>
							Know a place this guide hasn’t found yet?
						</h2>
						<p className='mt-6 max-w-xl text-[1rem] leading-relaxed text-[var(--ink-2)]'>
							Tell us about it. A place we have not listed, a photograph you took, a detail that has changed: every source you
							send makes the guide better for the next traveller. And where we disagree with the official record, the official
							record is right.
						</p>
					</div>
					<ul className='border-b border-[var(--rule)] lg:self-center'>
						{ASKS.map(({ icon: Glyph, title, note }) => (
							<li key={title} className='border-t border-[var(--rule)]'>
								<a href='https://betterbarmm.com/contribute' className='group flex items-start gap-5 py-6'>
									<Glyph size={26} weight='duotone' className='mt-0.5 shrink-0 text-[var(--accent)]' aria-hidden='true' />
									<span className='min-w-0 flex-1'>
										<span className='block font-[family-name:var(--font-display)] text-[1.125rem] font-bold text-[var(--ink)]'>{title}</span>
										<span className='mt-1 block text-[0.875rem] leading-relaxed text-[var(--ink-3)]'>{note}</span>
									</span>
									<span className='mt-1 inline-flex shrink-0 items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--ink-2)] transition group-hover:text-[var(--accent)]'>
										Send
										<ArrowRightIcon size={14} weight='bold' className='transition group-hover:translate-x-1' aria-hidden='true' />
									</span>
								</a>
							</li>
						))}
					</ul>
				</div>
			</section>

		<footer className='tv-footer relative isolate overflow-hidden text-white'>
			{/* ---- The seven areas ---- */}
			<div className='bb-container pt-24 lg:pt-32'>
				<div className='flex flex-wrap items-end justify-between gap-4'>
					<h2 className='font-[family-name:var(--font-display)] text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold leading-none tracking-[-0.03em]'>Seven areas, one region</h2>
					<p className='text-[0.875rem] text-white/55'>Every place in this guide, by where it is.</p>
				</div>
				<ul className='mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7'>
					{areas.map((a) => (
						<li key={a.slug}>
							<Link href={a.href} className='group relative isolate flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl bg-white/5 p-3.5'>
								{a.cover ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={commonsThumb(a.cover.url, 330, a.cover.width)} alt='' loading='lazy' className='absolute inset-0 -z-10 size-full object-cover transition duration-700 group-hover:scale-105' />
								) : null}
								<span aria-hidden='true' className='absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(8,12,16,0.9)_0%,rgba(8,12,16,0.2)_60%,transparent_100%)]' />
								<span className='font-[family-name:var(--font-display)] text-[0.9375rem] font-bold leading-tight'>{a.name}</span>
								<span className='mt-0.5 text-[0.75rem] text-white/65'>
									{a.count} {a.count === 1 ? 'place' : 'places'}
								</span>
							</Link>
						</li>
					))}
				</ul>
			</div>

			{/* ---- The guide on a glass card, the links with their glyphs, the estate's workspaces as chips ---- */}
			<div className='bb-container mt-16 grid gap-10 border-t border-white/10 pt-14 lg:grid-cols-[33rem_minmax(0,1fr)] lg:gap-x-16'>
				{/* The guide, plain (user decision): the red logo on the ground, the blurb, follow. */}
				<div className='max-w-[33rem] self-start'>
					<a href='https://betterbarmm.com' className='inline-block'>
						<BrandLogo className='text-white' size={40} />
					</a>
					<div className='mt-6 space-y-3.5 text-[0.9375rem] leading-[1.7] text-white/70'>
						<p>A written guide to the seven areas of the Bangsamoro: what to see, what to eat, where lodging actually exists, and an honest account of security in each.</p>
						<p>
							{explorePlaces.length} places, {exploreEats.length} places to eat and {exploreStays.length} places to stay, each traced to a public source and shown in a
							freely licensed photograph where one exists. No prices, ratings or bookings: nothing here is sold.
						</p>
						<p className='text-white/55'>
							An independent project, not an official tourism site. Security differs from one municipality to the next, so ask locally before an interior
							trip, and verify it all before you travel.
						</p>
					</div>
					<ul className='mt-6 flex gap-2'>
						{FOOTER_FOLLOW.map((f) => {
							const Glyph = f.href.includes('facebook') ? FacebookLogoIcon : EnvelopeSimpleIcon
							return (
								<li key={f.href}>
									<a
										href={f.href}
										target={f.href.startsWith('http') ? '_blank' : undefined}
										rel='noreferrer'
										aria-label={f.label}
										title={f.label}
										className='grid size-10 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-[#10161b]'
									>
										<Glyph size={18} weight='fill' aria-hidden='true' />
									</a>
								</li>
							)
						})}
					</ul>
				</div>

				{/* The link columns at their own widths, close together, flush right: the spare width falls after the guide. */}
				<div className='grid content-start gap-10 sm:grid-cols-[repeat(3,auto)] sm:gap-x-24 lg:justify-self-end'>
					<div className='grid content-start gap-7'>
						{columns.map((c) => (
							<nav key={c.title} aria-label={c.title}>
								<LinkRows {...c} />
							</nav>
						))}
					</div>
					{[kindsColumn, workspacesColumn].map((c) => (
						<nav key={c.title} aria-label={c.title}>
							<LinkRows {...c} />
						</nav>
					))}
				</div>
			</div>

			{/* Two copies stacked in one cell: the coloured outline, and over it the woven lattice that fills the letters. */}
			<p aria-hidden='true' className='mt-16 grid select-none overflow-hidden px-[1.5vw]'>
				{/* Both copies split letter by letter the same way, so they lay out identically and the patterns sit inside the outline. */}
				<span className='tv-footer-word [grid-area:1/1]'>
					{[...WORD].map((ch, i) => (
						<span key={i}>{ch}</span>
					))}
				</span>
				<span className='tv-footer-word tv-footer-lattice [grid-area:1/1]'>
					{[...WORD].map((ch, i) => (
						<span key={i} style={letterPattern(i)}>
							{ch}
						</span>
					))}
				</span>
			</p>

			<div className='bb-container flex flex-col justify-between gap-2 border-t border-white/10 py-6 text-[0.75rem] text-white/45 sm:flex-row sm:items-center'>
				<p>2026 betterbarmm.com · public domain unless otherwise specified · Traveling the Bangsamoro</p>
				<p>
					Inspired by{' '}
					<a href='https://bettergov.ph' target='_blank' rel='noreferrer' className='text-white/70 hover:text-white'>
						bettergov.ph
					</a>
				</p>
			</div>
		</footer>
		</>
	)
}
