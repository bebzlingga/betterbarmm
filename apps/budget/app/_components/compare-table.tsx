import { peso, pesoShort, percent } from '@betterbarmm/budget-data'
import type { Line } from './budget-trend'

/* ============================================================
   One grouping, seven years, ranked by what changed

   A cell per line (user decision), each carrying its seven
   years as columns tall enough to read a shape off. Ranked by
   size in the latest year rather than by growth: the biggest
   movers in percentage terms are always the smallest lines, and
   a list that opened on a ₱2m office tripling would be a list
   about rounding.

   A line that does not run the whole span says so. An office
   the Act had not created in 2020 did not get nothing that
   year — it did not exist — and a change measured from nothing
   would be the loudest and least true number on the page.
   ============================================================ */

/* The columns' own height. At 52px in a full-width row a line that doubled and
   a line that held flat were a few pixels apart; in a cell three to the row
   there is the height to spend, and the shape is the only thing the cell has
   that two end figures do not. */
const BAR_H = 96

export function CompareTable({
	lines,
	unit,
	limit = 12,
}: {
	/** `was` carries the other names the Acts print the same line under. */
	lines: (Line & { was?: string[] })[]
	/** What one row is, for the accessible summary — "office", "sector". */
	unit: string
	limit?: number
}) {
	const rows = lines.slice(0, limit).map((line) => {
		const first = line.series[0]!
		const last = line.series[line.series.length - 1]!
		return {
			...line,
			first,
			last,
			/* Only where both ends are real years of the same line. */
			change: first[1] > 0 ? (last[1] / first[1] - 1) * 100 : null,
			widest: Math.max(...line.series.map(([, total]) => total)),
		}
	})

	const tallest = Math.max(...rows.map((row) => row.widest), 1)

	return (
		/* The estate's cell grid: one hairline between cells rather than a border
		   drawn on each, which is what the negative margins are undoing. */
		<div className='mt-10 -ml-px -mt-px grid overflow-hidden sm:grid-cols-2 lg:grid-cols-3'>
			{rows.map((row) => (
				<div
					key={row.slug}
					className='flex min-w-0 flex-col border-l border-t border-[var(--rule)] p-6 lg:p-7'
				>
					<div className='min-w-0'>
						<p className='text-[14px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
							{row.name}
						</p>
						<p className='money mt-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]'>
							{row.first[0]} — {row.last[0]}
						</p>
						{/* A reader who knows the office by the name an older Act printed
						    has to be able to find it under the name the latest one uses. */}
						{row.was && row.was.length > 0 ? (
							<p className='mt-2 text-[11.5px] leading-5 text-[var(--ink-3)]'>
								Earlier Acts print it as {row.was.join('; ')}.
							</p>
						) : null}
					</div>

					{/* One column per year, on the grouping's own scale — so a cell here
					    can be read against the cell beside it and not only against
					    itself. It is the shape of seven Acts rather than seven figures: a
					    line that rose and fell says so at a glance, where two end figures
					    would call it flat. */}
					<div
						className='mt-6 flex items-end gap-1'
						style={{ height: `${BAR_H}px` }}
						aria-hidden='true'
					>
						{row.series.map(([year, total]) => (
							<div
								key={year}
								className='min-w-0 flex-1 bg-[var(--accent)]'
								style={{
									height: `${Math.max(2, (total / tallest) * BAR_H)}px`,
									opacity: year === row.last[0] ? 1 : 0.4,
								}}
							/>
						))}
					</div>

					<div className='mt-5 flex items-baseline justify-between gap-4 border-t border-[var(--rule)] pt-4'>
						<p className='money text-[13.5px] font-semibold text-[var(--ink)]'>
							{pesoShort(row.last[1])}
						</p>
						<p className='money font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--brass)]'>
							{row.change === null
								? '—'
								: `${row.change >= 0 ? '+' : ''}${percent(row.change, 0)}`}
						</p>
					</div>

					<span className='sr-only'>
						{row.name}, one {unit}: {peso(row.first[1])} in {row.first[0]},{' '}
						{peso(row.last[1])} in {row.last[0]}.
					</span>
				</div>
			))}
		</div>
	)
}
