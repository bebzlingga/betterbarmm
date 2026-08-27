import type { FilterOption } from '../_lib/legislation-data'

/* ============================================================
   What a set of measures is about, counted

   A ranked bar rather than a ring or a treemap. The question is magnitude
   across a list of named things — how much health, against how much
   everything else — and length on a shared baseline is the only encoding a
   reader measures accurately. A ring of sixteen slices would be unreadable at
   the tail, and the tail is where half the subjects are.

   One hue for every bar. The bars are a single series measuring one thing, so
   colour carries no information here and giving each subject its own would be
   sixteen hues saying nothing — several of them indistinguishable under
   deuteranopia. `--funnel-3` is the middle step of the ramp the estate's other
   chart already uses, and it clears 3:1 against the page on both themes.

   Length is the encoding, and the count beside it is the axis: with the value
   printed at the end of every bar there is nothing left for gridlines to do,
   and a chart of sixteen rows with a grid behind it is mostly grid. That is
   also why there is no tooltip — a hover that reveals a number already set in
   type beside the bar is a control that reports what the reader is looking at.

   The markup is a description list, so the chart and its table are the same
   object: every label and value is real text in the reading order, and the bar
   is the part that is hidden from the accessibility tree.
   ============================================================ */

/** Bars this short would vanish; a subject with a record in it stays visible. */
const MIN_WIDTH = 1.5

export function SectorBars({ items }: { items: FilterOption[] }) {
	if (items.length === 0) return null

	const max = Math.max(...items.map((item) => item.count))

	return (
		// Tighter than it was. The rows are a subject, a bar and a count — one
		// line of type and a 10px rule — and at a 16px gutter fifteen of them
		// read as fifteen separate statements rather than as one ranked list.
		// Side by side in two columns that cost a screen of height as well.
		<dl className='grid gap-y-2.5'>
			{items.map((item) => {
				const width = Math.max(MIN_WIDTH, (item.count / max) * 100)

				return (
					// Three tracks where there is room for them — subject, bar, count.
					// On a phone the bar drops to a row of its own under the pair,
					// because a subject like "Environment, Agriculture & Fisheries" set
					// in a 9rem column is four lines of type beside a 10px bar.
					<div
						key={item.value}
						className='grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 sm:grid-cols-[minmax(0,12rem)_1fr_auto]'
					>
						<dt className='bb-body text-[var(--ink-2)]'>{item.label}</dt>

						<dd
							aria-hidden='true'
							className='order-last col-span-2 sm:order-none sm:col-span-1'
						>
							{/* Square where it leaves the baseline, rounded at the end it
							    reached — the shape says which end is the measurement. */}
							<span
								className='block h-2.5 rounded-r-[4px] bg-[var(--funnel-3)]'
								style={{ width: `${width}%` }}
							/>
						</dd>

						<dd className='num text-[13px] font-semibold text-[var(--ink)]'>{item.count}</dd>
					</div>
				)
			})}
		</dl>
	)
}
