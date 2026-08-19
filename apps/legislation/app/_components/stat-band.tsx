export type Stat = {
	label: string
	value: string | number
	detail: string
}

/**
 * A row of headline numbers. Separated by space and a single hairline rather
 * than boxed per cell — four framed panels read as four things to inspect,
 * where this reads as one summary line.
 */
export function StatBand({ stats }: { stats: Stat[] }) {
	return (
		<section className='mx-auto max-w-[88rem] px-6 lg:px-8'>
			{/* Two up from 380px rather than 560px: four figures stacked one per
			    line turn a summary into a screen of its own, and every phone wider
			    than the small ones has the room for a pair. Below that they stack,
			    because a detail line in a 150px column is four words to a row.

			    The gutters widen with the breakpoint rather than holding one value:
			    at full width four figures set close together read as a single run,
			    and it is the space between them that says these are four answers to
			    four different questions. */}
			{/* The figures are inset from the page edge; the two hairlines are not.
			    They keep the estate's measure, so the band's rules line up with every
			    other divider on the page while the numbers sit in from them. */}
			<div className='grid gap-x-8 gap-y-8 border-y border-[var(--rule)] px-4 py-9 min-[380px]:grid-cols-2 sm:gap-x-12 sm:gap-y-10 sm:px-6 sm:py-10 lg:grid-cols-4 lg:gap-x-20 lg:px-10'>
				{stats.map((stat) => (
					<div key={stat.label}>
						<p className='label'>{stat.label}</p>
						<p className='num mt-3 text-3xl font-black leading-none text-[var(--ink)]'>
							{stat.value}
						</p>
						{/* Held to a measure of its own: with the gutters this wide a cell
						    is wider than its caption needs, and a two-line detail under
						    every figure keeps the four reading as a row. */}
						<p className='mt-2.5 max-w-[16rem] text-[13px] leading-5 text-[var(--ink-3)]'>
							{stat.detail}
						</p>
					</div>
				))}
			</div>
		</section>
	)
}
