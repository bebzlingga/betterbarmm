type PageHeaderProps = {
	eyebrow: string
	title: string
	/**
	 * The second half of a two-tone headline, set in a lighter grey. The dark
	 * line carries the claim; this one carries the qualifier, so the eye lands
	 * on what matters before reading the rest.
	 */
	titleMuted?: string
	description: string
	meta?: string
	/**
	 * `brand` is for the standing pages — About — where the heading is the
	 * page's whole point rather than a label over a list of records. It runs
	 * centred, large, and heavy, since there is no list beneath it competing
	 * for the eye.
	 */
	emphasis?: 'default' | 'brand'
	/**
	 * Only read on `brand`. Centring suits a page that is purely a statement;
	 * a page that opens onto a list reads better ranged left, so the headline
	 * shares an edge with the records underneath it.
	 */
	align?: 'center' | 'left'
	/**
	 * Only read on `brand`. `compact` steps the headline down a size and holds
	 * the header to three quarters of the page — for a page whose masthead is a
	 * label over a grid rather than the page's whole point. `hero` steps it up,
	 * for the one page that opens the site.
	 */
	size?: 'display' | 'compact' | 'hero'
}

/**
 * The top of every page. Deliberately plain — no rules, no background pattern,
 * just one column of text with room around it. The page's own content is what
 * should carry weight, not its masthead.
 */
export function PageHeader({
	eyebrow,
	title,
	titleMuted,
	description,
	meta,
	emphasis = 'default',
	align = 'center',
	size = 'display',
}: PageHeaderProps) {
	const isBrand = emphasis === 'brand'

	if (isBrand) {
		// Ranged left, the column just drops its centring — the pill and the
		// spacing are the same header either way.
		const centred = align === 'center'
		const compact = size === 'compact'
		const column = centred ? 'mx-auto ' : ''
		// A centred header needs a measure, or the lines run too long to track
		// back to. Ranged left it shares the page's edges with the content under
		// it, so it takes the full width — unless it is compact, which holds it
		// to three quarters and leaves the right edge to breathe.
		// The hero takes the full measure of the page: at this size a cap would
		// break the line where the container doesn't, and the point of the cut is
		// that it spans the page. Prose below keeps its own measure.
		const titleWidth =
			size === 'hero' ? '' : centred ? 'max-w-5xl ' : compact ? 'lg:max-w-[75%] ' : ''
		const proseWidth = centred ? 'max-w-4xl ' : compact ? 'lg:max-w-[75%] ' : ''
		// Three cuts, and the size follows the length of the line rather than the
		// importance of the page: `hero` is set for a short headline that fits on
		// one or two lines, and would wrap a sentence three times.
		//
		// Each cut takes an extra step below `sm`. The gap from a phone to 640px
		// is the widest one in the scale, and a size picked so a display line
		// clears a 640px column is set against roughly half that on a 360px
		// screen — the words still fit, but the headline stops being a masthead
		// and becomes a wall. The narrow step lands around 400px, where a phone
		// held in one hand has the width to carry the full cut.
		const titleSize = compact
			? 'text-[2rem] min-[400px]:text-[2.25rem] sm:text-[3rem] lg:text-[3.5rem]'
			: size === 'hero'
				? 'text-[2.75rem] min-[400px]:text-[3.5rem] sm:text-[5.25rem] lg:text-[6.5rem]'
				: 'text-[2.5rem] min-[400px]:text-[3.25rem] sm:text-[4.75rem] lg:text-[5.5rem]'

		return (
			// The ground runs the full width of the viewport while the header keeps
			// the estate's column, so the band reads as the page's masthead rather
			// than as a coloured card sitting on it. `brand-bg` re-points the
			// tokens, so every part below takes its colour from the ground without
			// being told about it.
			<div className='brand-bg'>
				<section
					className={`mx-auto max-w-[88rem] px-6 pb-12 pt-14 sm:pb-14 sm:pt-20 lg:px-8 lg:pb-20 lg:pt-28${
						centred ? ' text-center' : ''
					}`}
				>
					{/* The kicker states the size of the thing rather than naming the
				    page — the headline already says what the page is. */}
					<p className='font-title inline-flex items-center rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] font-semibold uppercase text-[var(--ink-3)]'>
						{eyebrow}
					</p>

					<h1
						className={`${column}${titleWidth}mt-6 font-extrabold leading-[1.02] text-[var(--ink)] ${titleSize}`}
					>
						{title}
						{/* Flows inline — where it breaks is left to the text, not forced. */}
						{titleMuted ? (
							<>
								{' '}
								<span className='text-[var(--ink-display)]'>{titleMuted}</span>
							</>
						) : null}
					</h1>

					<p className={`${column}${proseWidth}mt-7 text-base leading-6 text-[var(--ink-2)]`}>
						{description}
					</p>

					{meta ? <p className='meta-sm mt-7'>{meta}</p> : null}
				</section>
			</div>
		)
	}

	return (
		<div className='brand-bg'>
			<section className='mx-auto max-w-[88rem] px-6 pb-10 pt-12 sm:pb-12 sm:pt-16 lg:px-8 lg:pb-16 lg:pt-24'>
				<p className='eyebrow'>{eyebrow}</p>

				<h1 className='mt-4 max-w-3xl text-[1.75rem] font-semibold leading-[1.1] text-[var(--ink)] min-[400px]:text-[2rem] sm:text-[2.75rem]'>
					{title}
				</h1>

				<p className='mt-5 max-w-2xl text-base leading-6 text-[var(--ink-2)]'>{description}</p>

				{meta ? <p className='meta-sm mt-6'>{meta}</p> : null}
			</section>
		</div>
	)
}
