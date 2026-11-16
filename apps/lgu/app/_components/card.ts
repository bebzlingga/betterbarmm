/* Card classes copied from www's page-band, kept apart from lgu-parts so a client component can import them
   without pulling in the directory's data. */

/** The landing site's card: a hairline, lifting and turning crimson at the edge on hover. */
export const CARD =
	'group relative flex min-w-0 flex-col overflow-hidden border border-[var(--rule)] bg-[var(--paper)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_20px_40px_-26px_rgba(0,0,0,0.35)]'
/** The bar at a card's foot that says where it goes, filling crimson with the card's hover. */
export const CARD_FOOT =
	'flex items-center justify-between gap-3 border-t border-[var(--rule)] px-5 py-3 text-[0.8125rem] font-semibold text-[var(--ink-2)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-white'
