import { Counter, Stagger, StaggerItem } from '@betterbarmm/editorial'

export type Stat = {
	label: string
	value: string | number
	detail: string
	/** Counts by year, drawn as small bars under the figure. */
	series?: { year: number; value: number }[]
	/** Or one mark per item, named on hover — for a count of a few named things. */
	marks?: string[]
}

/** How many a year, as a small line beside the figure: the latest year dashed while it is not over. */
function Spark({ series }: { series: { year: number; value: number }[] }) {
	const top = Math.max(...series.map((s) => s.value), 1)
	const current = new Date().getFullYear()
	const W = 100
	const H = 40
	const x = (i: number) => (series.length > 1 ? (i / (series.length - 1)) * W : W / 2)
	const y = (v: number) => H - 3 - (v / top) * (H - 6)
	const pts = series.map((s, i) => `${x(i).toFixed(2)},${y(s.value).toFixed(2)}`)
	const open = series.at(-1)?.year === current && series.length > 1
	const solid = open ? pts.slice(0, -1) : pts
	return (
		<svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio='none' className='h-7 w-16 shrink-0 overflow-visible' aria-hidden='true'>
			<title>{`${series[0]?.year}–${series.at(-1)?.year}`}</title>
			<polyline points={solid.join(' ')} fill='none' stroke='var(--accent)' strokeWidth='2' strokeLinejoin='round' strokeLinecap='round' vectorEffect='non-scaling-stroke' />
			{open ? (
				<polyline points={pts.slice(-2).join(' ')} fill='none' stroke='var(--accent)' strokeWidth='2' strokeDasharray='3 3' strokeLinecap='round' vectorEffect='non-scaling-stroke' opacity='0.6' />
			) : null}
		</svg>
	)
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
	// One strip (user decision: the three-across grid took a screen of its own): every figure in a row on a wide
	// screen, a hairline between them, the trend drawn small beside the number and the caption held to a line.
	return (
		<Stagger gap={0.06} className='grid grid-cols-2 border-y border-[var(--rule)] sm:grid-cols-3 lg:grid-cols-5'>
			{stats.map((stat) => (
				<StaggerItem key={stat.label} className='border-[var(--rule)] px-4 py-5 max-sm:odd:border-r sm:border-r sm:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n)]:border-r lg:last:border-r-0 lg:px-6'>
					<p className='text-[0.65625rem] font-semibold uppercase tracking-[0.12em] text-[var(--brass)]'>{stat.label}</p>
					<div className='mt-2 flex items-end justify-between gap-3'>
						<p className='text-[1.875rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'>
							<Figure value={stat.value} />
						</p>
						{stat.series?.length ? <Spark series={stat.series} /> : null}
					</div>
					<p className='mt-2 line-clamp-2 text-[0.75rem] leading-[1.45] text-[var(--ink-3)]' title={stat.marks?.join(', ')}>
						{stat.detail}
					</p>
				</StaggerItem>
			))}
		</Stagger>
	)
}
