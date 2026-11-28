import type { Icon } from '@phosphor-icons/react'
import Link from 'next/link'
import { books, coverSrc, type Book } from '../_lib/library'

/* ============================================================
   The header every page here opens with, in the travel workspace's
   look (user decision): dark, up under both bars, which run clear over
   it. Where travel turns its photographs, the library sets a still,
   tilted wall of the shelf's own covers. The page's words sit at its
   foot, or centred as the front page's search is.
   ============================================================ */

/** The wall's covers: every one the shelf has, spread across it, the same on every page so the browser keeps them. */
const WALL = (() => {
	const withCovers = books.filter((b) => b.cover)
	const step = Math.max(1, Math.floor(withCovers.length / 36))
	return withCovers.filter((_, i) => i % step === 0).slice(0, 36)
})()

export function CoverWall({ first = [] }: { first?: Book[] }) {
	const own = first.filter((b) => b.cover)
	const shown = [...own, ...WALL.filter((b) => !own.some((o) => o.slug === b.slug))].slice(0, 36)
	return (
		<div aria-hidden='true' className='lb-wall'>
			{shown.map((b) => (
				<span key={b.slug}>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={coverSrc(b)!} alt='' loading='lazy' decoding='async' />
				</span>
			))}
		</div>
	)
}

export function Masthead({
	kicker,
	name,
	note,
	stacked = false,
	center = false,
	tall = false,
	covers,
	aside,
	children,
}: {
	kicker: string
	name: string
	note?: React.ReactNode
	/** A long name (a book's, a person's): set a step smaller. */
	stacked?: boolean
	/** The words centred, as the front page's search is. */
	center?: boolean
	/** Most of the first screen, as the front page's is. */
	tall?: boolean
	/** Covers to set first on the wall: an author's or a press's own books. */
	covers?: Book[]
	/** Beside the kicker: a page's outside links. */
	aside?: React.ReactNode
	children?: React.ReactNode
}) {
	return (
		<header className={`dv-hero ${tall ? 'dv-hero-tall' : ''}`}>
			<CoverWall first={covers} />
			<span aria-hidden='true' className='dv-hero-shade' />
			<div
				className={`bb-container relative flex min-h-[inherit] flex-col ${center ? 'items-center justify-center pb-16 pt-[calc(var(--tv-nav-h)+3rem)] text-center' : 'justify-end pb-16 pt-[calc(var(--tv-nav-h)+4rem)] md:pb-20'}`}
			>
				<div className={`flex flex-wrap items-center gap-x-6 gap-y-3 ${center ? 'justify-center' : 'justify-between'}`}>
					<p className='font-[family-name:var(--font-display)] text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[#f1c453]'>{kicker}</p>
					{aside}
				</div>
				<h1 className={`pg-hero-title mt-4 ${stacked ? 'pg-hero-title-sm' : ''} ${center ? 'mx-auto' : ''}`}>{name}</h1>
				{note ? <p className={`mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-white/85 md:text-[1.125rem] ${center ? 'mx-auto' : ''}`}>{note}</p> : null}
				{children}
			</div>
		</header>
	)
}

/** The section heading's classes, for a heading that is not a SectionHead. */
export const H2 = 'dv-title'
/** A rounded chip on the page's paper. */
export const CHIP = 'dv-pill !px-3.5 !py-1.5 !text-[0.8125rem]'
/** A rounded chip over the header's dark ground. */
export const CHIP_DARK = 'dv-chip !px-3 !py-1.5'

/** A heading with its line under it, and anything for its right (a link to the rest), as travel's sections open. */
export function SectionHead({ title, note, children }: { title: string; note?: string; children?: React.ReactNode }) {
	return (
		<div className='flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
			<div>
				<h2 className='dv-title'>{title}</h2>
				{note ? <p className='dv-lede'>{note}</p> : null}
			</div>
			{children}
		</div>
	)
}

/**
 * The shelf in figures (user decision: redesigned): each a card that opens what it counts, with a picture of it above
 * the number, as travel's cards lead with a photograph: a fan of covers, a row of faces, the presses' marks.
 */
export function Figures({ items }: { items: { value: string; label: string; icon: Icon; href: string; visual: React.ReactNode }[] }) {
	return (
		<dl className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
			{items.map(({ icon: Glyph, ...item }) => (
				<Link key={item.label} href={item.href} className='group relative flex flex-col overflow-hidden rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] transition duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ink)_30%,var(--rule))] hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]'>
					{/* The picture, on the warm wash, its foot cut off by the card's edge. */}
					<div aria-hidden='true' className='tv-wash relative flex h-36 items-end justify-center overflow-hidden px-6 pt-6'>
						{item.visual}
					</div>
					<div className='flex items-start justify-between gap-3 p-5 sm:p-6'>
						<div>
							<dd className='num font-[family-name:var(--font-display)] text-[clamp(2rem,3.4vw,2.75rem)] font-extrabold leading-none tracking-[-0.035em] text-[var(--ink)]'>{item.value}</dd>
							<dt className='mt-2 text-[0.875rem] leading-snug text-[var(--ink-3)]'>{item.label}</dt>
						</div>
						<span className='grid size-10 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)] transition group-hover:bg-[var(--accent)] group-hover:text-white'>
							<Glyph size={19} weight='duotone' />
						</span>
					</div>
				</Link>
			))}
		</dl>
	)
}

/** Three covers fanned, the middle one standing forward: a picture of a shelf. */
export function CoverFan({ books: list }: { books: Book[] }) {
	const three = list.filter((b) => b.cover).slice(0, 3)
	const pose = ['-rotate-[9deg] translate-x-7 translate-y-3', 'z-10 -translate-y-1', 'rotate-[9deg] -translate-x-7 translate-y-3']
	return (
		<span className='flex items-end'>
			{three.map((b, i) => (
				<span key={b.slug} className={`block w-[4.5rem] overflow-hidden rounded-lg shadow-[0_12px_24px_-12px_rgba(0,0,0,0.6)] ring-1 ring-black/5 transition duration-500 group-hover:-translate-y-2 ${pose[i]}`}>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={coverSrc(b)!} alt='' loading='lazy' decoding='async' className='aspect-[2/3] w-full object-cover' />
				</span>
			))}
		</span>
	)
}

/** Faces in a row, each overlapping the last. */
export function FaceRow({ people }: { people: { name: string; photo?: string | null }[] }) {
	return (
		<span className='mb-6 flex -space-x-4'>
			{people.slice(0, 5).map((p) => (
				<AuthorMark key={p.name} name={p.name} photo={p.photo} className='size-16 !bg-[color-mix(in_srgb,var(--accent)_9%,var(--paper))] text-[0.875rem] !text-[var(--accent)] ring-4 ring-[var(--paper)]' />
			))}
		</span>
	)
}

/** The presses' marks on white tiles, a little staggered. */
export function MarkRow({ presses }: { presses: { name: string; logo?: string | null }[] }) {
	return (
		<span className='mb-5 flex gap-2.5'>
			{presses.slice(0, 4).map((p, i) => (
				<span key={p.name} className={i % 2 ? 'translate-y-2' : ''}>
					<PublisherMark name={p.name} logo={p.logo} className='size-14 shadow-[0_10px_20px_-12px_rgba(0,0,0,0.45)]' />
				</span>
			))}
		</span>
	)
}

/** A press's logo on a white tile, or its initials where it has none. */
export function PublisherMark({ name, logo, className = 'size-14' }: { name: string; logo?: string | null; className?: string }) {
	if (logo)
		return (
			<span className={`grid shrink-0 place-items-center rounded-2xl bg-white p-2 ring-1 ring-[var(--rule)] ${className}`}>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={logo} alt='' loading='lazy' className='max-h-full max-w-full object-contain' />
			</span>
		)
	return (
		<span aria-hidden className={`grid shrink-0 place-items-center rounded-2xl bg-[var(--paper-2)] font-[family-name:var(--font-display)] text-[0.9375rem] font-black tracking-[-0.02em] text-[var(--ink-3)] ring-1 ring-[var(--rule)] ${className}`}>
			{initials(name)}
		</span>
	)
}

/** Up to 3 capitals from a name, for a mark where there is no picture. */
const initials = (name: string) =>
	name
		.replace(/\(.*?\)/g, '')
		.split(/[\s-]+/)
		.filter((w) => /^[A-Z]/.test(w) && !['The', 'Of', 'And'].includes(w))
		.map((w) => w[0])
		.join('')
		.slice(0, 3) || name[0]

/** An author's portrait in a circle, or their initials where there is none. */
export function AuthorMark({ name, photo, className = 'size-14' }: { name: string; photo?: string | null; className?: string }) {
	return photo ? (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={photo} alt='' loading='lazy' decoding='async' draggable={false} className={`shrink-0 rounded-full object-cover ${className}`} />
	) : (
		<span aria-hidden className={`grid shrink-0 place-items-center rounded-full bg-[var(--paper-2)] font-[family-name:var(--font-display)] text-[0.9375rem] font-black tracking-[-0.02em] text-[var(--ink-3)] ${className}`}>
			{initials(name)}
		</span>
	)
}
