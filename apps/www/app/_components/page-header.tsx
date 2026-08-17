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
	 * Buttons under the description — a landing page usually has somewhere it
	 * wants you to go next, where a list page just has the list.
	 */
	children?: React.ReactNode
	/**
	 * Centring suits a page that is purely a statement; a page that opens onto
	 * a list or a grid reads better ranged left, so the headline shares an edge
	 * with the content underneath it.
	 */
	align?: 'center' | 'left'
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
	children,
	align = 'left',
}: PageHeaderProps) {
	const centred = align === 'center'
	const column = centred ? 'mx-auto ' : ''
	// A centred header needs a measure, or the lines run too long to track back
	// to. Ranged left it shares the page's edges with the content under it, so
	// it takes the full width instead.
	const titleWidth = centred ? 'max-w-5xl ' : ''
	const proseWidth = centred ? 'max-w-4xl ' : 'max-w-3xl '

	return (
		<section
			className={`mx-auto max-w-[88rem] px-6 pb-14 pt-20 lg:px-8 lg:pb-20 lg:pt-28${
				centred ? ' text-center' : ''
			}`}
		>
			{/* The kicker states the size or the subject of the thing rather than
			    naming the page — the headline already says what the page is. */}
			<p className='font-title inline-flex items-center rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] font-semibold uppercase text-[var(--ink-3)]'>
				{eyebrow}
			</p>

			<h1
				className={`${column}${titleWidth}mt-6 text-[3.25rem] font-extrabold leading-[1.02] text-[var(--ink)] sm:text-[4.75rem] lg:text-[5.5rem]`}
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

			{children ? (
				<div
					className={`mt-9 flex flex-wrap items-center gap-3${centred ? ' justify-center' : ''}`}
				>
					{children}
				</div>
			) : null}

			{meta ? <p className='meta-sm mt-7'>{meta}</p> : null}
		</section>
	)
}
