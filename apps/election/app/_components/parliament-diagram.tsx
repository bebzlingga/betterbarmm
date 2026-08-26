/* ============================================================
   The Parliament, drawn

   Both figures here replaced a wrapped row of eighty person icons. A block
   of identical glyphs reflowing across the column tells a reader how many
   seats there are and nothing else — not that the three tracks are separate
   elections, not that a majority is a line one side of the chamber has to
   reach. A chamber has a shape, and a threshold is a line; drawn that way,
   both are one glance rather than a count.

   Neither figure adds a fact. Everything in them is in the seat structure
   the workspace already publishes, which is why the sentences they replace
   could go rather than sit underneath as a caption of themselves.

   SVG for the chamber, because its geometry is arcs and nothing about it
   reflows; CSS grid for the threshold, because that one is a row of cells
   that has to wrap on a phone. Every colour is a token, so the dark theme
   gets both for free.
   ============================================================ */

export type SeatTrack = {
	key: string
	label: string
	seats: number
	/** A token, not a hex value — the dark theme moves all three. */
	color: string
}

type Seat = { x: number; y: number; row: number; angle: number }

/**
 * Seat positions for a hemicycle of `total` seats.
 *
 * Rows hold seats in proportion to their own radius, so the spacing between
 * neighbours stays about even from the front bench to the back — allocating
 * evenly instead packs the inner row and strands the outer one. Seats are
 * returned sorted by angle, left to right, which is the order the blocs are
 * laid into: a bloc is contiguous in a chamber, not scattered through it.
 */
function hemicycle(total: number, rows = 4): Seat[] {
	const innerRadius = 86
	const outerRadius = 178
	const radii = Array.from(
		{ length: rows },
		(_, row) => innerRadius + ((outerRadius - innerRadius) * row) / (rows - 1),
	)

	const radiusSum = radii.reduce((sum, radius) => sum + radius, 0)
	const perRow = radii.map((radius) => Math.max(1, Math.round((total * radius) / radiusSum)))

	// Rounding row by row rarely lands on the total. The remainder is settled
	// against the outer rows, which have the most room to absorb it.
	let drift = total - perRow.reduce((sum, count) => sum + count, 0)
	for (let row = rows - 1; drift !== 0 && row >= 0; row -= 1) {
		const step = drift > 0 ? 1 : -1
		perRow[row] += step
		drift -= step
	}

	const seats: Seat[] = []
	radii.forEach((radius, row) => {
		const count = perRow[row]
		for (let index = 0; index < count; index += 1) {
			// Half-step insets keep the first and last seat of every row off the
			// floor line rather than sitting on it.
			const angle = 180 - ((index + 0.5) * 180) / count
			const radians = (angle * Math.PI) / 180
			seats.push({
				x: 200 + radius * Math.cos(radians),
				y: 198 - radius * Math.sin(radians),
				row,
				angle,
			})
		}
	})

	return seats.sort((a, b) => b.angle - a.angle || a.row - b.row)
}

/**
 * The chamber, with each track sitting as one bloc.
 *
 * The three tracks are three different elections that fill one room, and that
 * is the thing this figure is for: the party vote fills the left of the
 * chamber, the districts the middle, the reserved seats the right, and the
 * room is full at eighty.
 *
 * The well is not empty. Left as a bare arc the figure sprawled the width of
 * the column and read as a rainbow of bubbles; held to a measure with the
 * total standing in the middle of it, it reads as a chamber with a number of
 * seats — and the one figure a reader takes away is inside the picture rather
 * than in a caption under it.
 */
export function SeatMap({
	tracks,
	total,
	majority,
}: {
	tracks: SeatTrack[]
	total: number
	/** Printed in the well under the total: the line any government has to cross. */
	majority?: number
}) {
	const seats = hemicycle(total)
	const colors: string[] = []
	tracks.forEach((track) => {
		for (let index = 0; index < track.seats; index += 1) colors.push(track.color)
	})

	return (
		<figure>
			<div className='relative mx-auto max-w-[46rem]'>
				<svg
					viewBox='0 0 400 212'
					className='block w-full'
					role='img'
					aria-label={`The ${total}-seat Bangsamoro Parliament: ${tracks
						.map((track) => `${track.seats} ${track.label}`)
						.join(', ')}.`}
				>
					{/* The floor. Without it the seats hang in the page and the arc
					    reads as a rainbow rather than as a room seen from above. */}
					<line
						x1={14}
						y1={198.5}
						x2={386}
						y2={198.5}
						stroke='var(--brass-line)'
						strokeWidth={1}
					/>

					{seats.map((seat, index) => (
						<circle
							key={`${seat.row}-${index}`}
							cx={seat.x}
							cy={seat.y}
							r={5.6}
							fill={colors[index] ?? 'var(--rule)'}
							stroke='var(--paper)'
							strokeWidth={1.1}
						/>
					))}
				</svg>

				{/* HTML rather than <text>: the type here is the site's own scale and
				    tokens, and an SVG label would have to re-declare both. */}
				<div className='pointer-events-none absolute inset-x-0 bottom-[6%] text-center'>
					<p className='bb-figure leading-none text-[var(--ink)]'>{total}</p>
					<p className='mt-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
						seats in Parliament
					</p>
					{majority ? (
						<p className='mt-3 inline-block border-t border-[var(--brass-line)] pt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>
							{majority} for a majority
						</p>
					) : null}
				</div>
			</div>

			<figcaption className='mt-8 grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-3'>
				{tracks.map((track) => (
					<div key={track.key} className='bg-[var(--paper)] px-5 py-4'>
						<div className='flex items-baseline gap-2.5'>
							<span
								aria-hidden='true'
								className='size-2.5 shrink-0 translate-y-[-1px] rounded-full'
								style={{ background: track.color }}
							/>
							<p className='num text-2xl font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'>
								{track.seats}
							</p>
							<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
								{Math.round((track.seats / total) * 100)}% of the chamber
							</p>
						</div>
						<p className='mt-2.5 text-[13px] font-semibold leading-snug text-[var(--ink-2)]'>
							{track.label}
						</p>
					</div>
				))}
			</figcaption>
		</figure>
	)
}

/**
 * The line a Chief Minister has to cross.
 *
 * Eighty cells, the first forty-one filled, with the threshold marked where
 * it falls. The sentence this replaces — "a majority of all members" — is
 * true and tells a reader nothing about how close that is to half the room.
 */
export function MajorityBar({ total, majority }: { total: number; majority: number }) {
	return (
		<figure>
			<div className='flex flex-wrap gap-[3px]' role='img' aria-label={`${majority} of ${total} members elect the Chief Minister.`}>
				{Array.from({ length: total }, (_, index) => (
					<span
						key={index}
						className={`h-6 w-[calc((100%-19*3px)/20)] ${
							index < majority ? 'bg-[var(--accent)]' : 'bg-[var(--rule)]'
						}`}
					/>
				))}
			</div>

			<figcaption className='mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2'>
				<span className='flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-2)]'>
					<span aria-hidden='true' className='size-2.5 bg-[var(--accent)]' />
					{majority} members — a majority
				</span>
				<span className='flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
					<span aria-hidden='true' className='size-2.5 bg-[var(--rule)]' />
					{total - majority} remaining
				</span>
			</figcaption>
		</figure>
	)
}

/**
 * The district seats, province by province.
 *
 * Set as bars because the interesting thing is the ratio between them — Lanao
 * del Sur returns more than twice what Cotabato City does — and because one
 * constituency is at zero. In a grid of tiles that zero was a tile like any
 * other with a 0 printed on it; as a bar it is a gap in the column, which is
 * what an excluded province actually is.
 */
export function DistrictSeatBars({
	seats,
	total,
}: {
	/* The dataset's own shape: one row carries a constituency, another a sector,
	   and this figure only ever draws the first kind. */
	seats: { constituency?: string; seats: number; note?: string }[]
	total: number
}) {
	const largest = Math.max(...seats.map((item) => item.seats), 1)

	return (
		<figure>
			<dl>
				{seats.map((item) => (
					<div
						key={item.constituency ?? item.seats}
						className='grid items-center gap-x-5 gap-y-1 border-t border-[var(--rule-soft)] py-3 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_2.5rem]'
					>
						<dt className='text-[13.5px] font-semibold leading-snug text-[var(--ink)]'>
							{item.constituency}
							{item.note ? (
								<span className='mt-0.5 block text-[12px] font-normal leading-snug text-[var(--ink-3)]'>
									{item.note}
								</span>
							) : null}
						</dt>

						<dd className='order-3 sm:order-none'>
							<span
								className='block h-3 bg-[var(--slate)]'
								style={{ width: `${Math.max((item.seats / largest) * 100, item.seats === 0 ? 0 : 4)}%` }}
								aria-hidden='true'
							/>
						</dd>

						<dd className='num text-right text-[15px] font-bold leading-none text-[var(--ink)] sm:text-[17px]'>
							{item.seats}
						</dd>
					</div>
				))}
			</dl>

			<p className='mt-4 border-t border-[var(--brass-line)] pt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
				{total} district seats in all
			</p>
		</figure>
	)
}
