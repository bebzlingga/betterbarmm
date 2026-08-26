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
export function StatBand({ stats }: { stats: Stat[] }) {
	return (
		<section className='bb-container'>
			{/* Two up from 380px rather than 560px: four figures stacked one per line
			    turn a summary into a screen of its own, and every phone wider than
			    the small ones has the room for a pair. Below that they stack, because
			    a detail line in a 150px column is four words to a row.

			    The gutters widen with the breakpoint rather than holding one value:
			    at full width four figures set close together read as a single run,
			    and it is the space between them that says these are four answers to
			    four different questions. */}
			<Stagger
				gap={0.08}
				className='grid gap-x-8 gap-y-9 border-y border-[var(--brass-line)] py-10 min-[380px]:grid-cols-2 sm:gap-x-12 sm:gap-y-10 sm:py-12 lg:grid-cols-4 lg:gap-x-20'
			>
				{stats.map((stat) => (
					<StaggerItem key={stat.label}>
						<p className='bb-label'>{stat.label}</p>
						<p className='bb-figure-sm mt-4 text-[var(--ink)]'>
							<Figure value={stat.value} />
						</p>
						{/* Held to a measure of its own: with the gutters this wide a cell
						    is wider than its caption needs, and a two-line detail under
						    every figure keeps the four reading as a row. */}
						<p className='mt-3 max-w-[16rem]  bb-body text-[var(--ink-3)]'>
							{stat.detail}
						</p>
					</StaggerItem>
				))}
			</Stagger>
		</section>
	)
}
