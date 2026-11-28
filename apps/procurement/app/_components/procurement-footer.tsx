import { BrandLogo, FOOTER_FOLLOW, FOOTER_WORKSPACES } from '@betterbarmm/editorial'
import type { Icon } from '@phosphor-icons/react'
import {
	ArrowRightIcon,
	BooksIcon,
	BuildingOfficeIcon,
	BuildingsIcon,
	CheckSquareOffsetIcon,
	CoinsIcon,
	CompassIcon,
	DatabaseIcon,
	EnvelopeSimpleIcon,
	FacebookLogoIcon,
	FileArrowUpIcon,
	GraduationCapIcon,
	HandCoinsIcon,
	HouseIcon,
	MagnifyingGlassPlusIcon,
	MegaphoneIcon,
	PencilSimpleLineIcon,
	ScrollIcon,
	ShoppingCartIcon,
	SignpostIcon,
	StorefrontIcon,
	TimerIcon,
} from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { entities, notices, openNotices, suppliers } from '../_lib/philgeps'

/* ============================================================
   Procurement's own footer, in the travel workspace's look (user
   decision): the ask on a warm band, then a deep ground with the
   workspace's records as tiles, its links, the estate's
   workspaces and follow buttons (the estate's own lists), the
   region's name set large in its weaves, and the licence line.
   Always three link columns (user decision).
   ============================================================ */

const L = 'https://procurement.betterbarmm.com'

/* ---- The region's name, a different weave in each letter, as travel's footer sets it ---- */
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

/** What a reader can send the project, each a link to the contribute page. */
const ASKS = [
	{ icon: PencilSimpleLineIcon, title: 'Send a correction', note: 'A wrong amount, a misnamed office, a supplier listed twice: tell us and it gets fixed.' },
	{ icon: FileArrowUpIcon, title: 'Send a document', note: 'A notice of award, a contract or an audit finding the record is missing.' },
	{ icon: MagnifyingGlassPlusIcon, title: 'Tell us what is missing', note: 'A purchase you looked for here and could not find.' },
]

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
	'Discover BARMM': HouseIcon,
}

/* Each tile its own light on the deep ground, from the estate's palette. */
const TINT = ['#e8796a', '#f1c453', '#7fc4cf', '#c98bff', '#87caa0', '#9ab8de']

export function ProcurementFooter() {
	const tiles = [
		{ href: '/', label: 'Offices', note: `${entities.length} procuring entities`, icon: BuildingOfficeIcon },
		{ href: '/notices', label: 'Bid notices', note: `${notices.length.toLocaleString('en-PH')} posted`, icon: MegaphoneIcon },
		{ href: '/notices?stage=Open+for+bids', label: 'Open for bids', note: `${openNotices.length} still taking bids`, icon: TimerIcon },
		{ href: '/suppliers', label: 'Suppliers', note: `${suppliers.length.toLocaleString('en-PH')} that won`, icon: StorefrontIcon },
		{ href: '/follow-the-peso', label: 'Follow the peso', note: 'Budget, bid out, awarded', icon: HandCoinsIcon },
		{ href: '/how-it-works', label: 'How it works', note: 'The law, the steps, the checks', icon: SignpostIcon },
	]
	const columns: { title: string; links: Row[] }[][] = [
		[
			{
				title: 'Records',
				links: [
					{ href: `${L}/`, label: 'Procuring entities', icon: BuildingOfficeIcon },
					{ href: `${L}/notices`, label: 'Bid notices', icon: MegaphoneIcon },
					{ href: `${L}/suppliers`, label: 'Suppliers', icon: StorefrontIcon },
				],
			},
		],
		[
			{
				title: 'Read it',
				links: [
					{ href: `${L}/follow-the-peso`, label: 'Follow the peso', icon: HandCoinsIcon },
					{ href: `${L}/how-it-works`, label: 'How it works', icon: SignpostIcon },
					{ href: `${L}/sources`, label: 'Sources', icon: DatabaseIcon },
					{ href: 'https://www.philgeps.gov.ph/', label: 'PhilGEPS', icon: ShoppingCartIcon },
				],
			},
		],
		[
			{
				title: 'More of BetterBARMM',
				links: FOOTER_WORKSPACES.filter((w) => !w.href.includes('procurement.')).map((w) => ({ ...w, icon: WORKSPACE_ICON[w.label] ?? HouseIcon })),
			},
		],
	]

	return (
		<>
			{/* ---- The project's ask, on a warm band of its own above the footer ---- */}
			<section className='tv-ask'>
				<div className='bb-container grid gap-12 py-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16 lg:py-32'>
					<div>
						<p className='font-[family-name:var(--font-display)] text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]'>Get involved</p>
						<h2 className='mt-4 max-w-[38rem] font-[family-name:var(--font-display)] text-[clamp(2.25rem,4.2vw,3.5rem)] font-extrabold leading-[1.1] tracking-[-0.035em] text-[var(--ink)]'>
							Public records get better when people check them.
						</h2>
						<p className='mt-6 max-w-xl text-[1rem] leading-relaxed text-[var(--ink-2)]'>
							Every figure here is read from PhilGEPS, and PhilGEPS is always right where we are wrong. Every correction and every document you send makes the
							record stronger.
						</p>
						<a href='https://betterbarmm.com/about' className='mt-8 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-[var(--ink-2)] transition hover:text-[var(--accent)]'>
							About the project <ArrowRightIcon size={14} weight='bold' aria-hidden='true' />
						</a>
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
				{/* ---- The record, by kind ---- */}
				<div className='bb-container pt-24 lg:pt-32'>
					<div className='flex flex-wrap items-end justify-between gap-4'>
						<h2 className='font-[family-name:var(--font-display)] text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold leading-none tracking-[-0.03em]'>Follow the purchases</h2>
						<p className='text-[0.875rem] text-white/55'>What the region&rsquo;s offices put out to bid, and who won.</p>
					</div>
					<ul className='mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6'>
						{tiles.map(({ icon: Glyph, ...t }, i) => (
							<li key={t.href}>
								<Link
									href={t.href}
									className='group relative isolate flex aspect-[5/4] flex-col justify-between overflow-hidden rounded-2xl bg-white/[0.05] p-4 transition hover:bg-white/[0.09]'
									style={{ backgroundImage: `radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, ${TINT[i]} 26%, transparent), transparent 70%)` }}
								>
									<Glyph size={30} weight='duotone' aria-hidden='true' className='transition duration-500 group-hover:-translate-y-0.5' style={{ color: TINT[i] }} />
									<span>
										<span className='block font-[family-name:var(--font-display)] text-[1rem] font-bold leading-tight'>{t.label}</span>
										<span className='mt-0.5 block text-[0.75rem] text-white/60'>{t.note}</span>
									</span>
								</Link>
							</li>
						))}
					</ul>
				</div>

				<div className='bb-container mt-16 grid gap-10 border-t border-white/10 pt-14 lg:grid-cols-[26rem_minmax(0,1fr)] lg:gap-x-16'>
					<div className='max-w-[30rem] self-start'>
						<a href='https://betterbarmm.com' className='inline-block'>
							<BrandLogo className='text-white' size={40} />
						</a>
						<div className='mt-6 space-y-3.5 text-[0.9375rem] leading-[1.7] text-white/70'>
							<p>Every bid notice a BARMM government office has posted on PhilGEPS, what it set out to buy and for how much, and who won the contract.</p>
							<p className='text-white/55'>Read from PhilGEPS, so check the notice itself before citing. Not an official government site.</p>
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
						{columns.map((column) => (
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
					<p>2026 betterbarmm.com · public domain unless otherwise specified · Government procurement in the Bangsamoro</p>
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
