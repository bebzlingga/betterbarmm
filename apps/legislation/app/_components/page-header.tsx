import { LineReveal, OkirBloom, Rise } from '@betterbarmm/editorial'
import { StatFigures, type Stat } from './stat-band'

type PageHeaderProps = {
	eyebrow: string
	title: string
	/**
	 * The second half of a two-tone headline, set in the muted grey. The dark
	 * line carries the claim; this one carries the qualifier, so the eye lands
	 * on what matters before reading the rest.
	 */
	titleMuted?: string
	description: string
	/**
	 * Headline figures, set inside the masthead under the sentence that
	 * introduces them rather than in a band of their own below it. A page whose
	 * whole subject is a set of counts wants them read as part of the opening
	 * claim; a page that merely has counts is better served by `StatBand`.
	 */
	figures?: Stat[]
	meta?: string
	/**
	 * `brand` is for the standing pages — the hub, Data & Methodology — where
	 * the heading is the page's whole point rather than a label over a list of
	 * records. It runs large, with the medallion behind it.
	 */
	emphasis?: 'default' | 'brand'
	/**
	 * Only read on `brand`. Ranged left by default: every masthead in this
	 * registry opens onto something — a list, a set of figures, a page of
	 * reference blocks — and a headline that shares an edge with what follows
	 * it gives the reader one line to come down. Centring is available for a
	 * page that is purely a statement and has nothing under it to align to.
	 */
	align?: 'center' | 'left'
	/**
	 * Only read on `brand`. `compact` steps the headline down for a masthead
	 * that is a label over a grid; `hero` steps it up, for the page that opens
	 * the registry.
	 */
	size?: 'display' | 'compact' | 'hero'
}

/**
 * The top of every page in the registry.
 *
 * It used to sit on the crimson band. That band is now spent once per page, at
 * the foot, on the one thing the page is asking for — and a masthead on it
 * meant every page opened and closed on the same shout. So the header takes the
 * warm paper instead, with the woven lattice behind it and one okir medallion
 * turning off the top-right corner: quieter than the crimson, and the same
 * masthead the landing site uses, which is the point. A reader crossing from
 * betterbarmm.com to the registry should not feel they have changed sites.
 *
 * The headline arrives a line at a time. Where it breaks is given rather than
 * measured — at these sizes a wrap decided by the container puts a two-letter
 * word alone on a line, and the shape falls apart.
 */
export function PageHeader({
	eyebrow,
	title,
	titleMuted,
	description,
	figures,
	meta,
	emphasis = 'default',
	align = 'left',
	size = 'display',
}: PageHeaderProps) {
	const isBrand = emphasis === 'brand'

	if (isBrand) {
		const centred = align === 'center'
		const column = centred ? 'mx-auto ' : ''
		// A centred header needs a measure, or the lines run too long to track
		// back to. Ranged left it shares the page's edges with the content under
		// it, so it takes the full width.
		const titleWidth = centred ? 'max-w-5xl ' : size === 'compact' ? 'lg:max-w-[75%] ' : ''
		const proseWidth = centred ? 'max-w-3xl ' : size === 'compact' ? 'lg:max-w-[75%] ' : 'max-w-2xl '
		const titleClass =
			// Each cut one step up from where it started, to sit with the landing
			// site's mastheads: `hero` on the largest display cut, `compact` — the
			// label over a register — at the size the main site opens a section.
			//
			// The hero cut takes a leading of its own with it. The shared 0.84 is
			// tuned for the landing site's mastheads, where every given line is a
			// short phrase that never wraps; this registry's opening line is a
			// whole sentence and wraps at most widths, and two rows of 100px type
			// at 0.84 put the descenders of one through the capitals of the next.
			size === 'compact'
				? 'bb-display-md'
				: size === 'hero'
					? 'bb-display-lg reg-hero-title'
					: 'bb-display'

		return (
			/* The landing site's masthead, to the point: same lattice, same medallion
			   off the top-right corner, same proportions. `hero` fills four fifths of
			   the screen the way betterbarmm.com's mastheads do — a reader crossing
			   from there to the registry should not feel they have changed sites. The
			   other cuts stay in the flow: a masthead that size over a page of four
			   hundred rows is furniture in the way of what they came for. */
			// A column rather than a centred row on the hero cut. `items-center`
			// made every child a flex item on one line, and the seam at the foot of
			// this section is a child: a 7px strip with no width of its own, it was
			// laid beside the masthead instead of under it and measured zero. The
			// column stacks them again, and the content takes `my-auto` below to
			// hold the middle of the screen the way the row was holding it.
			<section
				className={`bb-lattice relative overflow-hidden${
					size === 'hero' ? ' flex min-h-[80svh] flex-col' : ''
				}`}
			>
				<OkirBloom
					variant='weave'
					className='absolute -right-[14%] -top-[38%] size-[min(44rem,86vw)] opacity-[0.15]'
				/>
				<span aria-hidden='true' className='bb-glow absolute -right-[10%] -top-[20%] size-[34rem]' />

				{/* More air than the panel used to give it. At 16/24 the masthead was
				    a block of type with the lattice edge close above and below it,
				    which reads as a banner; the room around it is what makes it an
				    opening. It matters more now that the figures sit inside the panel
				    on the pages that carry them — the block is taller, and a taller
				    block in the same margins is tighter, not roomier. */}
				<div
					className={`bb-container relative w-full pb-20 pt-20 lg:pb-32 lg:pt-32${
						size === 'hero' ? ' my-auto' : ''
					}${centred ? ' text-center' : ''}`}
				>
					<Rise distance={14}>
						{/* The kicker states the size or the subject of the thing rather
						    than naming the page — the headline already says what it is. */}
						<p className={`bb-label${centred ? ' justify-center' : ''}`}>{eyebrow}</p>
					</Rise>

					<LineReveal
						lines={titleMuted ? [title, titleMuted] : [title]}
						delay={0.08}
						className={`${column}${titleWidth}${titleClass} mt-8 text-[var(--ink)]`}
						lineClassName={[undefined, 'bb-mute']}
					/>

					<Rise delay={0.32} distance={16}>
						<p
							className={`${column}${proseWidth}bb-body mt-8 text-[var(--ink-2)]`}
						>
							{description}
						</p>
					</Rise>

					{/* On the brass rule the masthead already ends on, rather than in
					    a band under the panel. The figures are the page's opening claim
					    here — they are what it is about — and set outside the lattice
					    they read as a summary of something that has already finished. */}
					{figures?.length ? (
						<Rise delay={0.4} distance={14}>
							<div className='mt-12 border-t border-[var(--brass-line)] pt-9'>
								<StatFigures stats={figures} />
							</div>
						</Rise>
					) : null}

					{meta ? (
						<Rise delay={0.42} distance={12}>
							<p className='meta-sm mt-8'>{meta}</p>
						</Rise>
					) : null}
				</div>

				{/* The seam into the page proper. A malong's warp, not a 1px rule. */}
				<div className='bb-weave' aria-hidden='true' />
			</section>
		)
	}

	// The list-page cut: a label over a register, so the type steps well down and
	// the medallion goes. A masthead this size on a page of four hundred rows is
	// furniture in the way of the thing the reader came for.
	return (
		<section className='bb-lattice relative overflow-hidden'>
			<div className='bb-container relative pb-12 pt-12 lg:pb-16 lg:pt-20'>
				<Rise distance={12}>
					<p className='bb-label'>{eyebrow}</p>
				</Rise>

				<LineReveal
					lines={[title]}
					delay={0.06}
					className='bb-display-md mt-8 max-w-3xl text-[var(--ink)]'
				/>

				<Rise delay={0.25} distance={14}>
					<p className='bb-body mt-6 max-w-2xl text-[var(--ink-2)]'>
						{description}
					</p>
					{meta ? <p className='meta-sm mt-6'>{meta}</p> : null}
				</Rise>
			</div>

			<div className='bb-weave' aria-hidden='true' />
		</section>
	)
}
