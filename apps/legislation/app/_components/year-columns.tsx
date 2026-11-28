/* ============================================================
   A count by year, as columns

   Change over time is the job, so the years run left to right on one
   baseline and length is the encoding. One series, one hue: `--funnel-3`,
   the step SectorBars uses, so every chart on the page speaks one colour.
   The count sits over each column, so there is no axis or grid to read
   against; the native tooltip repeats it with the year for a pointer
   reader. The markup is a list, so the numbers are real text in reading
   order and the columns themselves are hidden from the accessibility tree.
   ============================================================ */

export function YearColumns({ items, unit }: { items: { label: string; count: number }[]; unit: string }) {
	if (items.length === 0) return null
	const max = Math.max(...items.map((item) => item.count))

	return (
		<ol className='flex h-60 gap-2 sm:gap-3'>
			{items.map((item) => (
				<li key={item.label} title={`${item.label}: ${item.count} ${unit}`} className='group flex h-full min-w-0 flex-1 flex-col items-center'>
					{/* The column's own track, so the tallest stops short of the top and leaves its count room. */}
					<span className='relative block w-full flex-1'>
						<span
							aria-hidden='true'
							className='absolute inset-x-0 bottom-0 mx-auto block w-full max-w-14 rounded-t-lg bg-[var(--funnel-3)] transition-opacity group-hover:opacity-80'
							style={{ height: `${Math.max(1.5, (item.count / max) * 86)}%` }}
						/>
						<span className='num absolute inset-x-0 text-center text-[0.8125rem] font-semibold text-[var(--ink)]' style={{ bottom: `calc(${Math.max(1.5, (item.count / max) * 86)}% + 0.375rem)` }}>
							{item.count}
						</span>
					</span>
					<span className='num mt-2 w-full border-t border-[var(--rule-soft)] pt-1.5 text-center text-[0.75rem] text-[var(--ink-3)]'>{item.label}</span>
				</li>
			))}
		</ol>
	)
}
