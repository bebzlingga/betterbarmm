import type { Icon } from '@phosphor-icons/react'

/* The crimson band the Directory and Programs & services open on, for a page with no search of its own: the label,
   the title and a line under it, centred, then the page's own jumps as pills and any buttons. About, Contact and
   Contribute open on it (user decision), so the site's front doors look alike. */

export type BandJump = { href: string; label: string; icon: Icon }

export function PageBand({
	label,
	title,
	standfirst,
	jumps = [],
	children,
}: {
	label: string
	title: string
	standfirst: string
	jumps?: BandJump[]
	/** Buttons, under the line and over the jumps. */
	children?: React.ReactNode
}) {
	return (
		<section className='brand-bg bb-lattice relative overflow-hidden'>
			<span
				aria-hidden='true'
				className='bb-glow absolute -top-[22rem] left-1/2 h-[40rem] w-[64rem] max-w-[160vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,206,84,0.7)_0%,rgba(255,170,40,0.3)_38%,transparent_70%)]! opacity-80!'
			/>
			<div className='bb-container relative py-16 text-center lg:py-24'>
				<p className='bb-label'>{label}</p>
				<h1 className='bb-display-md mt-4 text-[var(--ink)]'>{title}</h1>
				<p className='mx-auto mt-4 max-w-2xl text-[0.9375rem] leading-7 text-[var(--ink-2)]'>{standfirst}</p>
				{children ? <div className='mt-8 flex flex-wrap justify-center gap-3'>{children}</div> : null}
				{jumps.length ? (
					<nav aria-label='On this page' className='mt-8 flex flex-wrap justify-center gap-2'>
						{jumps.map(({ href, label, icon: Glyph }) => (
							<a
								key={href}
								href={href}
								className='inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3.5 py-1.5 text-[0.8125rem] font-semibold text-[var(--ink)] transition hover:border-white hover:bg-white hover:text-[#8f2328]'
							>
								<Glyph size={14} weight='bold' aria-hidden='true' /> {label}
							</a>
						))}
					</nav>
				) : null}
			</div>
		</section>
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
	'group relative flex min-w-0 flex-col overflow-hidden border border-[var(--rule)] bg-[var(--paper)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_20px_40px_-26px_rgba(0,0,0,0.35)]'
/** The bar at a card's foot that says where it goes, filling crimson with the card's hover. */
export const CARD_FOOT =
	'flex items-center justify-between gap-3 border-t border-[var(--rule)] px-5 py-3 text-[0.8125rem] font-semibold text-[var(--ink-2)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-white'
/** An icon on a soft crimson tile, filling on the card's hover. */
export const ICON_TILE =
	'grid size-12 place-items-center bg-[var(--accent-soft)] text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-white'
export const BADGE = 'inline-block rounded-full bg-[var(--paper-2)] px-2.5 py-0.5 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-[var(--ink-2)]'
