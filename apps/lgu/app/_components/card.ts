/* Card classes copied from www's page-band, kept apart from lgu-parts so a client component can import them
   without pulling in the directory's data. */

/** A rounded card in the travel look (user decision): a hairline, lifting on hover. */
export const CARD =
	'group relative flex min-w-0 flex-col overflow-hidden rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] transition duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ink)_30%,var(--rule))] hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]'
/** The bar at a card's foot that says where it goes: a warm tint, its arrow turning crimson with the card's hover. */
export const CARD_FOOT =
	'flex items-center justify-between gap-3 bg-[color-mix(in_srgb,var(--accent)_5%,var(--paper))] px-6 py-3.5 text-[0.8125rem] font-semibold text-[var(--ink-2)] transition-colors group-hover:text-[var(--accent)]'
