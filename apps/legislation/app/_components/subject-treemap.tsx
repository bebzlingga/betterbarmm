import type { FilterOption } from '../_lib/legislation-data'

/* ============================================================
   The subjects as areas

   A treemap says "these parts make up this whole", so the whole has to be
   real. It is not the bills: a measure carries every subject it touches, so
   the subject counts add to half again as many as there are bills, and tiling
   a rectangle with them would state something false about the register.

   What is being tiled here is the tags themselves — every subject tag applied
   across the bills that have been read. That is a genuine whole, each tile is
   honestly its share of it, and the page says which whole it is above the
   chart rather than leaving a reader to assume the other one.

   Squarified, after Bruls, Huizing and van Wijk: each run of tiles is laid
   along whichever side of the remaining rectangle is shorter, and a tile joins
   the run only while doing so keeps the run's worst aspect ratio from getting
   worse. Tiles that tend toward squares are the point — area is judged far
   better on a square than on a splinter, and an unsquarified treemap is a row
   of slivers a reader cannot compare at all.

   Colour is four shades of the register's own crimson, mixed from the accent
   into the page's ground and stepped by rank rather than given a hue per
   subject. Fifteen hues is three times what any palette can keep apart under
   normal vision, let alone deuteranopia; one colour, deeper for larger, says
   the same thing and stays legible. Area is still the measurement — the shades
   only agree with it.

   Every tile carries its name and its count as real text. Where a tile is too
   small to hold them they are hidden visually and kept for a screen reader,
   rather than clipped or shrunk to something nobody can read, and the run of
   subjects that lost their labels is printed under the chart.
   ============================================================ */

/** The unit rectangle the layout is solved in. Rendered as percentages of it. */
const W = 100
const H = 62.5

/** How wide the chart is at its narrowest, to decide what a tile can hold. */
const MIN_PX = 700

type Slice = { label: string; value: number }
type Tile = Slice & { x: number; y: number; w: number; h: number; step: number }

/**
 * The aspect ratio of the worst tile in a run, if one more were added.
 *
 * The squarify step is a greedy one: keep adding to the current run while this
 * number falls, stop the moment it would rise.
 */
function worst(values: number[], side: number, scale: number) {
	const sum = values.reduce((total, value) => total + value, 0) * scale
	const max = Math.max(...values) * scale
	const min = Math.min(...values) * scale
	if (sum <= 0 || min <= 0) return Number.POSITIVE_INFINITY

	const side2 = side * side
	const sum2 = sum * sum

	return Math.max((side2 * max) / sum2, sum2 / (side2 * min))
}

function squarify(slices: Slice[]): Tile[] {
	const total = slices.reduce((sum, slice) => sum + slice.value, 0)
	if (total <= 0) return []

	const tiles: Tile[] = []
	const queue = [...slices]
	const scale = (W * H) / total

	let x = 0
	let y = 0
	let width = W
	let height = H

	while (queue.length > 0 && width > 0.01 && height > 0.01) {
		const side = Math.min(width, height)
		const run: Slice[] = []

		while (queue.length > 0) {
			const candidate = [...run.map((item) => item.value), queue[0].value]
			const better =
				run.length === 0 ||
				worst(candidate, side, scale) <= worst(
					run.map((item) => item.value),
					side,
					scale,
				)

			if (!better) break
			run.push(queue.shift() as Slice)
		}

		const runArea = run.reduce((sum, item) => sum + item.value, 0) * scale

		// The run fills the shorter side and takes as much of the longer one as
		// its own area needs; what is left of the rectangle carries the rest.
		if (width >= height) {
			const runWidth = runArea / height
			let cursor = y
			for (const item of run) {
				const itemHeight = (item.value * scale) / runWidth
				tiles.push({ ...item, x, y: cursor, w: runWidth, h: itemHeight, step: 0 })
				cursor += itemHeight
			}
			x += runWidth
			width -= runWidth
		} else {
			const runHeight = runArea / width
			let cursor = x
			for (const item of run) {
				const itemWidth = (item.value * scale) / runHeight
				tiles.push({ ...item, x: cursor, y, w: itemWidth, h: runHeight, step: 0 })
				cursor += itemWidth
			}
			y += runHeight
			height -= runHeight
		}
	}

	// Four steps of the ramp by rank, so the groups stay even however lopsided
	// the values are. Keyed off the tile's place in the sorted list rather than
	// its value: with one subject twice the size of the next, a value-banded
	// ramp would put every other tile in the same step.
	return tiles.map((tile, index) => ({
		...tile,
		step: 4 - Math.min(3, Math.floor((index / tiles.length) * 4)),
	}))
}

/** Roughly what the longest word and the count need, at the label's own size. */
function fitsLabel(tile: Tile) {
	const px = (tile.w / 100) * MIN_PX
	const py = (tile.h / H) * (MIN_PX / (W / H))
	const longest = Math.max(...tile.label.split(' ').map((word) => word.length))

	return px >= longest * 6.6 + 22 && px >= 74 && py >= 62
}

export function SubjectTreemap({ items }: { items: FilterOption[] }) {
	if (items.length === 0) return null

	const tiles = squarify(items.map((item) => ({ label: item.label, value: item.count })))
	const unlabelled = tiles.filter((tile) => !fitsLabel(tile))

	return (
		<div>
			<dl className='tm relative aspect-[8/5] w-full'>
				{tiles.map((tile) => {
					const labelled = fitsLabel(tile)

					return (
						<div
							key={tile.label}
							className='absolute'
							style={{
								left: `${(tile.x / W) * 100}%`,
								top: `${(tile.y / H) * 100}%`,
								width: `${(tile.w / W) * 100}%`,
								height: `${(tile.h / H) * 100}%`,
							}}
						>
							{/* The inset is the gap. Two neighbours each hold a pixel back
							    from their shared edge, which separates them in the page's own
							    ground rather than by drawing a border — a stroke would add ink
							    that is not data. */}
							<div className={`tm-tile tm-${tile.step} absolute inset-px flex flex-col p-2.5`}>
								<dt className={labelled ? 'tm-label' : 'sr-only'}>{tile.label}</dt>
								<dd className={labelled ? 'tm-value num mt-auto' : 'sr-only'}>{tile.value}</dd>
							</div>
						</div>
					)
				})}
			</dl>

			{/* The tail, in words. A tile too small for its own name is still a
			    subject somebody legislated on, and leaving it as an unnamed chip of
			    colour would be the treemap keeping a secret. */}
			{unlabelled.length > 0 ? (
				<p aria-hidden='true' className='mt-5 bb-body text-[var(--ink-3)]'>
					<span className='font-semibold text-[var(--ink-2)]'>Smallest first:</span>{' '}
					{unlabelled
						.slice()
						.reverse()
						.map((tile) => `${tile.label} ${tile.value}`)
						.join(' · ')}
				</p>
			) : null}
		</div>
	)
}
