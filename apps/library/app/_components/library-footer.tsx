import { BrandLogo, FOOTER_FOLLOW, FOOTER_WORKSPACES } from '@betterbarmm/editorial'
import type { Icon } from '@phosphor-icons/react'
import {
	ArrowRightIcon,
	BookOpenTextIcon,
	BookmarkSimpleIcon,
	BooksIcon,
	BuildingsIcon,
	CheckSquareOffsetIcon,
	CoinsIcon,
	CompassIcon,
	EnvelopeSimpleIcon,
	FacebookLogoIcon,
	GraduationCapIcon,
	HouseIcon,
	ImageIcon,
	InfoIcon,
	NewspaperIcon,
	PencilSimpleLineIcon,
	PenNibIcon,
	ScrollIcon,
	ShoppingCartIcon,
	TagIcon,
} from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { books, authors, coverSrc, magazines, publishers, subjects } from '../_lib/library'

/* ============================================================
   The library's own footer, in the travel workspace's look (user
   decision): the ask on a warm band, then a deep ground with the
   shelves as cover tiles, the library's links, the estate's
   workspaces and follow buttons (the estate's own lists), the
   region's name set large in its weaves, and the licence line.
   ============================================================ */

const L = 'https://library.betterbarmm.com'

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
	{ icon: BookmarkSimpleIcon, title: 'Send a book', note: 'One about the Bangsamoro or by a Bangsamoro writer that the shelf has not found yet.' },
	{ icon: ImageIcon, title: 'Share a cover', note: 'A photograph or scan of a cover we are missing.' },
	{ icon: PencilSimpleLineIcon, title: 'Send a correction', note: 'A wrong year, a dead link, an author’s life: tell us and it gets fixed.' },
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
	'Travel & Places': CompassIcon,
	'Discover BARMM': HouseIcon,
}

export function LibraryFooter() {
	// The seven largest shelves as tiles, each on the cover of one of its own books (a different one each).
	const used = new Set<string>()
	const shelves = subjects.slice(0, 7).map((s) => {
		const cover = books.find((b) => b.cover && b.subjects.includes(s.slug) && !used.has(b.slug))
		if (cover) used.add(cover.slug)
		return { ...s, cover }
	})
	const columns = [
		{
			title: 'Library',
			links: [
				{ href: `${L}/`, label: 'Overview', icon: HouseIcon },
				{ href: `${L}/books`, label: 'Books', icon: BooksIcon },
				{ href: `${L}/authors`, label: 'Authors', icon: PenNibIcon },
				{ href: `${L}/publishers`, label: 'Publishers', icon: BuildingsIcon },
				{ href: `${L}/magazines`, label: 'Magazines', icon: NewspaperIcon },
				{ href: `${L}/sources`, label: 'Sources', icon: InfoIcon },
			],
		},
		{
			title: 'Read and find',
			links: [
				{ href: `${L}/books?availability=open-access`, label: 'Free to read', icon: BookOpenTextIcon },
				{ href: `${L}/books?availability=for-sale`, label: 'In the shops', icon: ShoppingCartIcon },
				{ href: `${L}/books?local=1`, label: 'Writers from home', icon: PenNibIcon },
			],
		},
	]
	const shelvesColumn = { title: 'Shelves', links: subjects.slice(7, 13).map((s) => ({ href: `${L}/books?subject=${s.slug}`, label: s.name, icon: TagIcon })) }
	const workspacesColumn = {
		title: 'More of BetterBARMM',
		links: FOOTER_WORKSPACES.filter((w) => !w.href.includes('library.')).map((w) => ({ ...w, icon: WORKSPACE_ICON[w.label] ?? HouseIcon })),
	}

	return (
		<>
			{/* ---- The project's ask, on a warm band of its own above the footer ---- */}
			<section className='tv-ask'>
				<div className='bb-container grid gap-12 py-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16 lg:py-32'>
					<div>
						<p className='font-[family-name:var(--font-display)] text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]'>Get involved</p>
						<h2 className='mt-4 max-w-[38rem] font-[family-name:var(--font-display)] text-[clamp(2.25rem,4.2vw,3.5rem)] font-extrabold leading-[1.1] tracking-[-0.035em] text-[var(--ink)]'>
							Know a book this library hasn’t found yet?
						</h2>
						<p className='mt-6 max-w-xl text-[1rem] leading-relaxed text-[var(--ink-2)]'>
							Tell us about it. A book we have not listed, a cover we are missing, a detail that is wrong: every one you send makes the shelf better for the next
							reader. The catalogue is a set of plain files anyone can read and correct.
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
				{/* ---- The largest shelves ---- */}
				<div className='bb-container pt-24 lg:pt-32'>
					<div className='flex flex-wrap items-end justify-between gap-4'>
						<h2 className='font-[family-name:var(--font-display)] text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold leading-none tracking-[-0.03em]'>Browse the shelves</h2>
						<p className='text-[0.875rem] text-white/55'>Every book here, by what it is about.</p>
					</div>
					<ul className='mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7'>
						{shelves.map((s) => (
							<li key={s.slug}>
								<Link href={`/books?subject=${s.slug}`} className='group relative isolate flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl bg-white/5 p-3.5'>
									{s.cover ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img decoding='async' src={coverSrc(s.cover)!} alt='' loading='lazy' className='absolute inset-0 -z-10 size-full object-cover transition duration-700 group-hover:scale-105' />
									) : null}
									<span aria-hidden='true' className='absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(8,12,16,0.92)_0%,rgba(8,12,16,0.3)_60%,rgba(8,12,16,0.1)_100%)]' />
									<span className='font-[family-name:var(--font-display)] text-[0.9375rem] font-bold leading-tight'>{s.name}</span>
									<span className='mt-0.5 text-[0.75rem] text-white/65'>
										{s.count} {s.count === 1 ? 'book' : 'books'}
									</span>
								</Link>
							</li>
						))}
					</ul>
				</div>

				<div className='bb-container mt-16 grid gap-10 border-t border-white/10 pt-14 lg:grid-cols-[30rem_minmax(0,1fr)] lg:gap-x-16'>
					<div className='max-w-[30rem] self-start'>
						<a href='https://betterbarmm.com' className='inline-block'>
							<BrandLogo className='text-white' size={40} />
						</a>
						<div className='mt-6 space-y-3.5 text-[0.9375rem] leading-[1.7] text-white/70'>
							<p>A library of the Bangsamoro: the books written about the region and its peoples, who wrote and published them, and where each can be bought, borrowed or read free.</p>
							<p>
								{books.length} books, {authors.length} authors, {publishers.length} publishers and {magazines.length} of the offices’ own magazines, each linked to where it came from.
								Nothing here is sold: every link goes to the shop, library or office that has it.
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

					<div className='grid content-start gap-10 sm:grid-cols-[repeat(3,auto)] sm:gap-x-24 lg:justify-self-end'>
						<div className='grid content-start gap-7'>
							{columns.map((c) => (
								<nav key={c.title} aria-label={c.title}>
									<LinkRows {...c} />
								</nav>
							))}
						</div>
						{[shelvesColumn, workspacesColumn].map((c) => (
							<nav key={c.title} aria-label={c.title}>
								<LinkRows {...c} />
							</nav>
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
					<p>2026 betterbarmm.com · public domain unless otherwise specified · A library of the Bangsamoro</p>
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
