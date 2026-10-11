import { finances, row } from '@betterbarmm/lgu-data/fiscal'

/**
 * A province's or town's own National Tax Allotment, year by year, as a line:
 * one series, so one hue and no legend, the figure printed over each point and
 * the exact one on hover. A year with no report breaks the line and shows a
 * dash, never a zero.
 *
 * The line and its fill are an SVG stretched to the plot (non-scaling stroke,
 * so the line keeps its weight at any width); the points and their labels are
 * HTML on the same column grid, so they stay round and line up with the years.
 */
export function NtaChart({ unitKey }: { unitKey: string }) {
	const years = finances.years.map((year) => ({
		year,
		nta: (row(finances, unitKey, year)?.nta as number | null | undefined) ?? null,
	}))
	if (!years.some((one) => one.nta)) return null
	const top = Math.max(...years.map((one) => one.nta ?? 0))
	const short = (value: number) =>
		value >= 1e9 ? `₱${(value / 1e9).toFixed(2)}B` : `₱${(value / 1e6).toFixed(1)}M`
	// Ten columns on a phone leave about 34px each: no peso sign, whole millions.
	const tiny = (value: number) => (value >= 1e9 ? `${(value / 1e9).toFixed(2)}B` : `${Math.round(value / 1e6)}M`)

	// Plot space: x at each column's centre, y from 0 (top) to 100 (baseline),
	// with headroom for the labels above the highest point.
	const n = years.length
	const x = (i: number) => ((i + 0.5) / n) * 100
	const y = (value: number) => 100 - (value / top) * 78
	// One run of the line per stretch of consecutive reported years.
	const runs: { i: number; v: number }[][] = []
	years.forEach(({ nta }, i) => {
		if (!nta) return runs.push([])
		if (!runs.length) runs.push([])
		runs[runs.length - 1].push({ i, v: nta })
	})
	const lines = runs.filter((run) => run.length > 0)
	const cols = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }

	return (
		<figure className='m-0 mt-10'>
			<div className='relative h-44'>
				<svg viewBox='0 0 100 100' preserveAspectRatio='none' className='absolute inset-0 h-full w-full' aria-hidden='true'>
					<defs>
						<linearGradient id={`nta-fill-${unitKey}`} x1='0' x2='0' y1='0' y2='1'>
							<stop offset='0%' stopColor='var(--accent)' stopOpacity='0.35' />
							<stop offset='100%' stopColor='var(--accent)' stopOpacity='0' />
						</linearGradient>
					</defs>
					{lines.map((run) => {
						const points = run.map(({ i, v }) => `${x(i)},${y(v)}`).join(' ')
						const area = `${x(run[0].i)},100 ${points} ${x(run[run.length - 1].i)},100`
						return (
							<g key={run[0].i}>
								<polygon points={area} fill={`url(#nta-fill-${unitKey})`} />
								<polyline
									points={points}
									fill='none'
									stroke='var(--accent)'
									strokeWidth='2'
									strokeLinejoin='round'
									strokeLinecap='round'
									vectorEffect='non-scaling-stroke'
								/>
							</g>
						)
					})}
				</svg>

				<div className='absolute inset-0 grid' style={cols}>
					{years.map(({ year, nta }) => (
						<div key={year} className='relative'>
							{nta ? (
								<div
									className='absolute left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center'
									style={{ top: `${y(nta)}%` }}
									title={`FY ${year}: ₱${nta.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
								>
									<span className='num absolute bottom-full mb-1.5 whitespace-nowrap text-[9.5px] text-[var(--ink-2)] sm:text-[12.5px]'>
										<span className='sm:hidden'>{tiny(nta)}</span>
										<span className='hidden sm:inline'>{short(nta)}</span>
									</span>
									<span className='size-2 rounded-full bg-[var(--accent)] ring-2 ring-[var(--paper)] sm:size-2.5' />
								</div>
							) : (
								<span className='absolute bottom-1 left-1/2 -translate-x-1/2 text-[11px] text-[var(--ink-3)]'>—</span>
							)}
						</div>
					))}
				</div>
			</div>
			<div className='grid border-t border-[var(--rule)] pt-2' style={cols}>
				{years.map(({ year }) => (
					<span key={year} className='num text-center text-[10.5px] text-[var(--ink-3)] sm:text-[12px]'>
						<span className='sm:hidden'>’{String(year).slice(2)}</span>
						<span className='hidden sm:inline'>{year}</span>
					</span>
				))}
			</div>
			<figcaption className='mt-4 flex flex-wrap items-baseline justify-between gap-2'>
				<span className='text-[12.5px] font-semibold text-[var(--ink)]'>National Tax Allotment, by year</span>
				<span className='text-[11px] text-[var(--ink-3)]'>
					Reported to BLGF. FY {finances.years.at(-1)} is preliminary.
				</span>
			</figcaption>
		</figure>
	)
}
