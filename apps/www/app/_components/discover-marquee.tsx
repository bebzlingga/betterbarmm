/**
 * A running band of the region's own words.
 *
 * It is the one place on the site that says the names out loud — thirteen
 * Moro ethnolinguistic groups, the provinces, the languages — at a size you
 * cannot skim past. A reader who arrives knowing "BARMM" as an acronym should
 * leave this band knowing it is Meranao and Sama and Yakan and Iranun.
 *
 * The track is rendered twice and the pair is translated by exactly half its
 * own width, which is why the loop has no seam: at -50% the second copy is
 * sitting where the first one began. Hovering pauses it, so a name that
 * catches the eye can be read.
 */
/** Enough pairs in one track to outrun an ultrawide monitor. */
const MIN_PAINTED = 10

export function DiscoverMarquee({
	items,
	duration = 48,
	className = '',
}: {
	items: readonly string[]
	/** Seconds for one full pass. Longer list, longer duration. */
	duration?: number
	className?: string
}) {
	// A track has to be wider than the widest window it will ever be seen in, or
	// the seam between the two copies opens into empty paper halfway through
	// every pass. A list of thirty acronyms was always wide enough; a list of two
	// phrases is not, so a short one is repeated until there is enough of it.
	// Only the painted copies repeat — the accessible one below stays the list.
	const repeats = items.length ? Math.ceil(MIN_PAINTED / items.length) : 0
	const painted = Array.from({ length: repeats }, () => items).flat()

	const track = (
		<div className='dsc-marquee-track' aria-hidden='true'>
			{painted.map((item, index) => {
				// Which of the outlined slots a word falls in is decided by its place
				// in the original list, not in the repeated one. On a long list the two
				// are the same thing. On a list of two they are not, and a word that
				// came round solid one moment and outlined the next — both visible at
				// once on a wide screen — read as a fault rather than as a rhythm.
				const place = index % items.length

				return (
					<span key={`${item}-${index}`} className='dsc-marquee-pair'>
						<span className='dsc-marquee-item' data-quiet={place % 3 === 1}>
							{item}
						</span>
						<span className='dsc-marquee-dot' />
					</span>
				)
			})}
		</div>
	)

	return (
		<div
			className={`dsc-marquee ${className}`}
			style={{ '--dsc-marquee-duration': `${duration}s` } as React.CSSProperties}
		>
			{/* The list is decorative repetition visually, but the names themselves
			    are content, so one accessible copy is exposed and both painted
			    tracks are hidden from the accessibility tree. */}
			<p className='sr-only'>{items.join(', ')}</p>
			<div className='dsc-marquee-mover'>
				{track}
				{track}
			</div>
		</div>
	)
}
