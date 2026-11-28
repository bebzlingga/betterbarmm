import { BrandLogo, FOOTER_FOLLOW, FOOTER_WORKSPACES } from '@betterbarmm/editorial'
import type { Icon } from '@phosphor-icons/react'
import {
	AddressBookIcon,
	BankIcon,
	BriefcaseIcon,
	LifebuoyIcon,
	MapPinAreaIcon,
	MosqueIcon,
	SirenIcon,
	SpiralIcon,
	TargetIcon,
	UsersThreeIcon,
	BooksIcon,
	BuildingsIcon,
	ChatCircleTextIcon,
	CheckSquareOffsetIcon,
	CoinsIcon,
	CompassIcon,
	DatabaseIcon,
	EnvelopeSimpleIcon,
	FacebookLogoIcon,
	GraduationCapIcon,
	HandHeartIcon,
	HandshakeIcon,
	HouseIcon,
	InfoIcon,
	LightbulbIcon,
	NewspaperIcon,
	ScrollIcon,
	ShoppingCartIcon,
} from '@phosphor-icons/react/ssr'
import Image from 'next/image'
import Link from 'next/link'
import { chapterCards } from '../_lib/chapters'

/* ============================================================
   The site's footer in the travel workspace's look (user decision):
   a deep ground lit from one corner; Discover's chapters as photo
   tiles; the site's links, the estate's workspaces and the follow
   buttons (the estate's own lists, so they never drift from the other
   workspaces'); the region's name set large in its weaves; the
   licence line.
   ============================================================ */

const WORD = 'Bangsamoro'
const STOPS: [number, [number, number, number]][] = [
	[0, [255, 211, 77]],
	[0.36, [255, 107, 94]],
	[0.7, [201, 139, 255]],
	[1, [127, 224, 122]],
]
function colourAt(t: number) {
	const k = STOPS.findIndex(([at]) => at >= t)
	const [a, ca] = STOPS[Math.max(k - 1, 0)]!
	const [b, cb] = STOPS[Math.max(k, 0)]!
	const f = b === a ? 0 : (t - a) / (b - a)
	return `rgb(${ca.map((v, i) => Math.round(v + (cb[i]! - v) * f)).join(' ')} / 0.7)`
}
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

const WORKSPACE_ICON: Record<string, Icon> = {
	Election: CheckSquareOffsetIcon,
	Legislation: ScrollIcon,
	Budget: CoinsIcon,
	'Local government': BuildingsIcon,
	Procurement: ShoppingCartIcon,
	Education: GraduationCapIcon,
	Library: BooksIcon,
	'Travel & Places': CompassIcon,
}

const WORKSPACES = {
	title: 'Workspaces',
	links: FOOTER_WORKSPACES.filter((w) => !w.href.endsWith('/discover')).map((w) => ({ ...w, icon: WORKSPACE_ICON[w.label] ?? HouseIcon })),
}

/** Always three columns (user decision), each one or two lists stacked: the site and the project; Discover and the projects; the workspaces. */
const COLUMNS: { title: string; links: Row[] }[][] = [
	[
		{
			title: 'BetterBARMM',
			links: [
				{ href: '/news', label: 'Latest news', icon: NewspaperIcon },
				{ href: '/directory', label: 'Directory', icon: AddressBookIcon },
				{ href: '/services', label: 'Services', icon: HandshakeIcon },
				{ href: '/explainers', label: 'Explainers', icon: LightbulbIcon },
				{ href: '/data', label: 'Open data', icon: DatabaseIcon },
			],
		},
		{
			title: 'Project',
			links: [
				{ href: '/about', label: 'About', icon: InfoIcon },
				{ href: '/contribute', label: 'Contribute', icon: HandHeartIcon },
				{ href: '/contact', label: 'Contact', icon: ChatCircleTextIcon },
			],
		},
	],
	[
		{
			title: 'Discover',
			links: [
				{ href: '/discover/history', label: 'History', icon: ScrollIcon },
				{ href: '/discover/governance', label: 'Government', icon: BankIcon },
				{ href: '/discover/local-government', label: 'Local government', icon: MapPinAreaIcon },
				{ href: '/discover/people', label: 'People', icon: UsersThreeIcon },
				{ href: '/discover/culture-places', label: 'Culture & places', icon: MosqueIcon },
			],
		},
		{
			title: 'Projects',
			links: [
				{ href: '/incidents', label: 'Incident Watch', icon: SirenIcon },
				{ href: '/preparedness', label: 'Preparedness', icon: LifebuoyIcon },
				{ href: '/development-plan', label: 'Development plan', icon: TargetIcon },
				{ href: '/opportunities', label: 'Opportunities', icon: BriefcaseIcon },
				{ href: '/crafts', label: 'Crafts', icon: SpiralIcon },
			],
		},
	],
	[WORKSPACES],
]

export function WwwFooter() {
	return (
		<footer className='tv-footer relative isolate overflow-hidden text-white'>
			{/* ---- Discover's chapters, as photo tiles ---- */}
			<div className='bb-container pt-24 lg:pt-32'>
				<div className='flex flex-wrap items-end justify-between gap-4'>
					<h2 className='font-[family-name:var(--font-display)] text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold leading-none tracking-[-0.03em]'>Get to know the Bangsamoro</h2>
					<p className='text-[0.875rem] text-white/55'>Five chapters, from the sultanates to the region today.</p>
				</div>
				<ul className='mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
					{chapterCards.map((c) => (
						<li key={c.slug}>
							<Link href={c.href} className='group relative isolate flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl bg-white/5 p-4'>
								<Image src={c.photo.src} alt='' fill sizes='(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw' className='-z-10 object-cover transition duration-700 group-hover:scale-105' />
								<span aria-hidden='true' className='absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(8,12,16,0.9)_0%,rgba(8,12,16,0.2)_60%,transparent_100%)]' />
								<span className='font-[family-name:var(--font-display)] text-[1rem] font-bold leading-tight'>{c.title}</span>
							</Link>
						</li>
					))}
				</ul>
			</div>

			<div className='bb-container mt-16 grid gap-10 border-t border-white/10 pt-14 lg:grid-cols-[30rem_minmax(0,1fr)] lg:gap-x-16'>
				<div className='max-w-[30rem] self-start'>
					<Link href='/' className='inline-block'>
						<BrandLogo className='text-white' size={40} />
					</Link>
					<div className='mt-6 space-y-3.5 text-[0.9375rem] leading-[1.7] text-white/70'>
						<p>An independent transparency project for the Bangsamoro: elections, laws, budgets, procurement and every local government in the region, readable and traced back to the source.</p>
						<p className='text-white/55'>Not an official government site. Where we disagree with the official record, the official record is right.</p>
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

				<div className='grid content-start gap-10 sm:grid-cols-[repeat(3,auto)] sm:gap-x-16 lg:justify-self-end xl:gap-x-24'>
					{COLUMNS.map((column) => (
						<div key={column[0]!.title} className='grid content-start gap-7'>
							{column.map((list) => (
								<nav key={list.title} aria-label={list.title}>
									<LinkRows {...list} />
								</nav>
							))}
						</div>
					))}
				</div>
			</div>

			<p aria-hidden='true' className='mt-16 grid select-none overflow-hidden px-[1.5vw]'>
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
				<p>2026 betterbarmm.com · public domain unless otherwise specified · Public records, in one place</p>
				<p>
					Inspired by{' '}
					<a href='https://bettergov.ph' target='_blank' rel='noreferrer' className='text-white/70 hover:text-white'>
						bettergov.ph
					</a>
				</p>
			</div>
		</footer>
	)
}
