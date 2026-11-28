import type { Icon } from '@phosphor-icons/react'
import type { DiscoverPhotoKey } from './discover-media'
import { PhotoHero, photosFor } from './photo-hero'

/* The header the Directory and Programs & services open on (now the travel look's photograph header, centred), for a page with no search of its own: the label,
   the title and a line under it, centred, then the page's own jumps as pills and any buttons. About, Contact and
   Contribute open on it (user decision), so the site's front doors look alike. */

export type BandJump = { href: string; label: string; icon: Icon }

export function PageBand({
	label,
	title,
	standfirst,
	jumps = [],
	children,
	photos,
}: {
	label: string
	title: string
	standfirst: string
	jumps?: BandJump[]
	/** Buttons, under the line and over the jumps. */
	children?: React.ReactNode
	/** The header's photographs; left out, three of the region's chosen by the title. */
	photos?: DiscoverPhotoKey[]
}) {
	return (
		<PhotoHero photos={photos ?? photosFor(title)} kicker={label} title={title} lede={standfirst} center>
			{children ? <div className='mt-8 flex flex-wrap justify-center gap-3'>{children}</div> : null}
			{jumps.length ? (
				<nav aria-label='On this page' className='mt-8 flex flex-wrap justify-center gap-2'>
					{jumps.map(({ href, label, icon: Glyph }) => (
						<a key={href} href={href} className='dv-btn dv-btn-glass !px-4 !py-2 !text-[0.8125rem]'>
							<Glyph size={14} weight='bold' aria-hidden='true' /> {label}
						</a>
					))}
				</nav>
			) : null}
		</PhotoHero>
	)
}

/** A section's heading as Programs & services sets it: the title on the left, a line on what it holds on the right. */
export function SectionTitle({ id, title, lead }: { id: string; title: React.ReactNode; lead?: string }) {
	return (
		<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
			<h2 id={`${id}-title`} className='text-[1.625rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
				{title}
			</h2>
			{lead ? <p className='max-w-xl text-[0.84375rem] leading-[1.6] text-[var(--ink-3)]'>{lead}</p> : null}
		</div>
	)
}

/** The card the Directory and Programs & services draw: a hairline, lifting and turning crimson at the edge on hover. */
export const CARD =
	'group relative flex min-w-0 flex-col overflow-hidden rounded-[1.25rem] border border-[var(--rule)] bg-[var(--paper)] transition duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ink)_30%,var(--rule))] hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]'
/** The bar at a card's foot that says where it goes, filling crimson with the card's hover. */
export const CARD_FOOT =
	'flex items-center justify-between gap-3 border-t border-[var(--rule)] px-5 py-3 text-[0.8125rem] font-semibold text-[var(--ink-2)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-white'
/** An icon on a soft crimson tile, filling on the card's hover. */
export const ICON_TILE =
	'grid size-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-white'
export const BADGE = 'inline-block rounded-full bg-[var(--paper-2)] px-2.5 py-0.5 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-[var(--ink-2)]'
