import { Counter, Stagger, StaggerItem } from '@betterbarmm/editorial'

export type Stat = {
	label: string
	value: string | number
	detail: string
}

/**
 * A figure that counts up where it can, and simply prints where it cannot.
 *
 * Call sites hand these over already formatted — `toLocaleString()` output,
 * mostly — because most of them are printed somewhere else on the page too and
 * the formatting has to match. Rather than change every call site to pass a raw
 * number, the string is read back: a value that is nothing but digits and
 * separators is a count and gets counted, and anything else (a percentage, a
 * date, a peso figure) is left exactly as it was written.
 */
function Figure({ value }: { value: string | number }) {
	const text = String(value)
	const numeric = /^[\d,]+$/.test(text) ? Number(text.replace(/,/g, '')) : null

	return numeric == null ? <>{text}</> : <Counter value={numeric} group duration={1.3} />
}

/**
 * A row of headline numbers.
 *
 * Separated by space and a brass hairline rather than boxed per cell — four
 * framed panels read as four things to inspect, where this reads as one summary
 * line. The figures count up as the band arrives, which is what makes a row of
 * four totals read as a measurement being taken rather than as a caption.
 */
/**
 * The figures alone, for a masthead that carries its own.
 *
 * Split out from the band because a page can want these in either of two
 * places — standing between the masthead and the page, or inside the masthead
 * under the sentence that introduces them — and the difference between the two
 * is a section wrapper and nothing else. The row itself, its breakpoints and
 * its counting are the same object in both.
 */
export function StatFigures({ stats }: { stats: Stat[] }) {
	// Two up from 380px rather than 560px: four figures stacked one per line
	// turn a summary into a screen of its own, and every phone wider than the
	// small ones has the room for a pair. Below that they stack, because a
	// detail line in a 150px column is four words to a row.
	//
	// The gutters widen with the breakpoint rather than holding one value: at
	// full width four figures set close together read as a single run, and it
	// is the space between them that says these are four answers to four
	// different questions.
	//
	// No rules around them. Wherever they sit they follow a masthead that
	// already ends on an edge of its own, and a brass hairline a few points
	// under it read as a mistake rather than as a frame — boxing four figures
	// into a strip when they are simply the first thing the page says.
	// The row takes its column count from what it is given. Four figures go
	// four across; five go three across and two under them, which keeps every
	// cell wide enough for its caption — five in a row left each one a column
	// narrower than the sentence under it needs, and five in a four-track grid
	// stranded the last figure on a line of its own. Both class names are
	// written out because Tailwind reads the source, not the string.
	const columns = stats.length === 5 ? 'lg:grid-cols-3 lg:gap-x-16' : 'lg:grid-cols-4 lg:gap-x-20'

	return (
		<Stagger
			gap={0.08}
			className={`grid gap-x-8 gap-y-9 min-[380px]:grid-cols-2 sm:gap-x-12 sm:gap-y-10 ${columns}`}
		>
			{stats.map((stat) => (
				<StaggerItem key={stat.label}>
					<p className='bb-label'>{stat.label}</p>
					<p className='bb-figure-sm mt-4 text-[var(--ink)]'>
						<Figure value={stat.value} />
					</p>
					{/* A step under the reading size, and held to a measure of its
					    own. The detail is a caption for the figure above it rather
					    than prose — at body size in a five-track row it runs to four
					    and five lines and the figures stop reading as a row at all.
					    Not `.bb-body` with a size beside it: that class is unlayered
					    and would win against the utility. */}
					<p className='mt-3 max-w-[16rem] text-[13px] leading-[1.55] text-[var(--ink-3)]'>
						{stat.detail}
					</p>
				</StaggerItem>
			))}
		</Stagger>
	)
}

/**
 * The figures as a band of their own, between a masthead and the page.
 */
export function StatBand({ stats }: { stats: Stat[] }) {
	return (
		// The band carries the page's own section rhythm above it and nothing
		// below. The masthead it follows is a tinted panel, so the white the
		// reader sees over the figures is this padding alone — at the old value
		// the row sat tight under the panel's edge while the gap under it, which
		// the next section supplies, was twice as deep. One `bb-section-top` here
		// and no padding underneath makes the two the same clamp at every width.
		<section className='bb-container bb-section-top'>
			<StatFigures stats={stats} />
		</section>
	)
}
