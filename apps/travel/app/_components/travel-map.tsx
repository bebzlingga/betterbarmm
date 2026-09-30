import {
	MAP_HEIGHT,
	UNITS_PER_100KM,
	graticule,
	project,
	type MapPoint,
} from '@betterbarmm/travel-data'

/* ============================================================
   The locator maps

   Drawn, not tiled. A tile provider would put a third party between
   this site and every reader of it, would need a key in the build,
   and would fail exactly where the map matters most — on a slow
   connection in the region being mapped. Inline SVG has none of
   those problems and is sharper at the one job it has here.

   What these maps are honest about: there is no coastline. This
   estate holds no coastline data it could vouch for, and a freehand
   shoreline would be a drawing presented as a survey. So what is
   drawn is what is actually known — a degree graticule, a true scale
   bar, and points at coordinates given to about a kilometer. That is
   enough to answer "how far is Tawi-Tawi from Marawi" and
   deliberately not enough to navigate by.

   Both axes share one scale, so the proportions are the region's own
   and a distance means the same measured across as down.

   The points are numbered and named in a key rather than labeled in
   place. That is not a stylistic choice: five of the seven areas sit
   inside about 50 km of delta, and "Maguindanao del Norte" set beside
   its own dot would run across four of its neighbours. A key costs
   the reader one glance and keeps every name legible and complete,
   where direct labels at this density would need abbreviating into
   guesswork.
   ============================================================ */

/** The scale bar steps, in km. The largest that fits comfortably is used. */
const SCALE_STEPS = [5, 10, 25, 50, 100, 200, 400]

type Frame = { x: number; y: number; w: number; h: number }

/**
 * A frame around the given points.
 *
 * The padding is proportional to how far apart the points actually are, not a
 * fixed number of units. A fixed margin that suits the whole region — where the
 * points are 600 km apart — leaves the Lanao del Sur places, which sit inside
 * 20 km of each other, as a speck in an empty rectangle.
 *
 * It is floored so a tight cluster is not zoomed past the precision the
 * coordinates have. These are accurate to about a kilometer, and a frame narrow
 * enough to make that error visible would be claiming more than the data says.
 */
function frameFor(points: MapPoint[], pad?: number): Frame {
	if (!points.length) return { x: 0, y: 0, w: 100, h: MAP_HEIGHT }

	const xs = points.map((point) => project(point).x)
	const ys = points.map((point) => project(point).y)

	const spread = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))
	const margin = pad ?? Math.min(Math.max(spread * 0.38, 1.8), 9)

	const minX = Math.min(...xs) - margin
	const maxX = Math.max(...xs) + margin
	const minY = Math.min(...ys) - margin
	const maxY = Math.max(...ys) + margin

	// Two coincident points would otherwise give a frame of no width at all.
	// 5.5 units is roughly 50 km, which is as close as coordinates good to a
	// kilometer have any business being examined.
	const w = Math.max(maxX - minX, 5.5)
	const h = Math.max(maxY - minY, 5.5 * 0.62)

	return { x: minX, y: minY, w, h }
}

type Placed = { point: MapPoint; x: number; y: number; moved: boolean }

/**
 * Push overlapping nodes apart until each is readable.
 *
 * Five of the seven areas sit inside about 50 km of the Rio Grande delta, so at
 * any zoom that shows the whole region their markers land on top of one
 * another. Cartographers solve this by displacement — moving the symbol and
 * leaving the true position marked — and that is what this does: a few passes
 * of pairwise repulsion, then a hairline drawn back to where the place actually
 * is.
 *
 * Deterministic, because the same map has to come out of every build the same
 * way. No randomness, fixed iteration count, and the input order is already
 * sorted by latitude before it gets here.
 */
function displace(points: MapPoint[], radius: number): Placed[] {
	const min = radius * 2.5
	const nodes = points.map((point) => ({ point, ...project(point) }))

	for (let pass = 0; pass < 60; pass += 1) {
		let settled = true

		for (let i = 0; i < nodes.length; i += 1) {
			for (let j = i + 1; j < nodes.length; j += 1) {
				const a = nodes[i]!
				const b = nodes[j]!
				let dx = b.x - a.x
				let dy = b.y - a.y
				let distance = Math.hypot(dx, dy)

				if (distance >= min) continue

				// Two points at identical coordinates have no direction to separate
				// along, so give them one — by index, so it stays deterministic.
				if (distance < 1e-6) {
					const angle = (i * 2.399963) % (Math.PI * 2)
					dx = Math.cos(angle)
					dy = Math.sin(angle)
					distance = 1
				}

				const push = ((min - distance) / distance) * 0.5
				a.x -= dx * push
				a.y -= dy * push
				b.x += dx * push
				b.y += dy * push
				settled = false
			}
		}

		if (settled) break
	}

	return nodes.map((node) => {
		const truth = project(node.point)
		return {
			point: node.point,
			x: node.x,
			y: node.y,
			moved: Math.hypot(node.x - truth.x, node.y - truth.y) > radius * 0.2,
		}
	})
}

export function TravelMap({
	points,
	/** Drawn emphasised — the area or place the page is about. */
	focus,
	/** Override the automatic margin, in projected units. Larger zooms out. */
	pad,
	caption,
	className = '',
}: {
	points: MapPoint[]
	focus?: string
	pad?: number
	caption?: string
	className?: string
}) {
	const plot = frameFor(points, pad)

	// A band reserved along the bottom for the scale bar, so it can never land
	// on a node — which it did, on Tawi-Tawi, when it was placed inside the
	// plotted area. Nothing is drawn into it but the rule.
	const scaleBand = plot.w * 0.09
	const frame = { ...plot, h: plot.h + scaleBand }
	const strokeWidth = frame.w * 0.002
	const radius = frame.w * 0.026
	const fontSize = radius * 1.15

	// The largest round distance that stays under a third of the frame, so the
	// bar is a useful ruler rather than a line across the whole drawing.
	const km = SCALE_STEPS.filter((step) => (step / 100) * UNITS_PER_100KM < frame.w / 3).pop() ?? 5
	const barLength = (km / 100) * UNITS_PER_100KM
	const barX = frame.x + frame.w * 0.04
	const barY = plot.y + plot.h + scaleBand * 0.62

	// Numbered in reading order down the map, so the key runs the way the eye
	// does rather than in whatever order the data happened to be written in.
	const ordered = [...points].sort((a, b) => project(a).y - project(b).y)
	const placed = displace(ordered, radius)

	return (
		<figure className={`tv-map ${className}`}>
			<svg
				viewBox={`${frame.x} ${frame.y} ${frame.w} ${frame.h}`}
				role='img'
				aria-label={
					caption ??
					`Locator map showing ${points.length} ${points.length === 1 ? 'place' : 'places'} in the Bangsamoro: ${ordered.map((point) => point.label).join(', ')}.`
				}
				style={{ width: '100%', height: 'auto', display: 'block' }}
			>
				{/* The graticule is the only ground truth on the drawing, so it is
				    what the points are read against. Whole degrees — about 111 km. */}
				<g className='map-grid' strokeWidth={strokeWidth} fill='none'>
					{graticule.lons.map((lon) => {
						const { x } = project({ lat: 0, lon })
						return <line key={`lon-${lon}`} x1={x} y1={plot.y} x2={x} y2={plot.y + plot.h} />
					})}
					{graticule.lats.map((lat) => {
						const { y } = project({ lat, lon: 0 })
						return <line key={`lat-${lat}`} x1={frame.x} y1={y} x2={frame.x + frame.w} y2={y} />
					})}
				</g>

				{placed.map(({ point, x, y, moved }, index) => {
					const truth = project(point)
					const emphasis = point.slug === focus

					return (
						<g key={point.slug}>
							{/* Where a node had to be moved to stay readable, the true
							    position keeps a tick and a hairline runs back to it. The
							    reader is never shown a place somewhere it is not. */}
							{moved ? (
								<>
									<line
										x1={truth.x}
										y1={truth.y}
										x2={x}
										y2={y}
										className='map-leader'
										strokeWidth={strokeWidth * 1.2}
									/>
									<circle cx={truth.x} cy={truth.y} r={radius * 0.16} className='map-truth' />
								</>
							) : null}
							<circle
								cx={x}
								cy={y}
								r={radius}
								className={
									point.kind === 'gateway'
										? 'map-node map-node-gateway'
										: emphasis
											? 'map-node map-node-focus'
											: 'map-node'
								}
								strokeWidth={strokeWidth * 1.4}
							/>
							<text
								x={x}
								y={y + fontSize * 0.35}
								textAnchor='middle'
								fontSize={fontSize}
								className={
									point.kind === 'gateway' || emphasis ? 'map-num map-num-over' : 'map-num'
								}
							>
								{index + 1}
							</text>
						</g>
					)
				})}

				{/* A real scale bar, derived from the projection rather than drawn to
				    look about right. It is what makes the map worth anything. */}
				<g className='map-scale' strokeWidth={strokeWidth * 2}>
					<line x1={barX} y1={barY} x2={barX + barLength} y2={barY} />
					<line x1={barX} y1={barY - fontSize * 0.3} x2={barX} y2={barY + fontSize * 0.3} />
					<line
						x1={barX + barLength}
						y1={barY - fontSize * 0.3}
						x2={barX + barLength}
						y2={barY + fontSize * 0.3}
					/>
					<text x={barX} y={barY - fontSize * 0.85} fontSize={fontSize * 0.95} className='map-scale-text'>
						{km} km
					</text>
				</g>
			</svg>

			<ol className='tv-map-key'>
				{ordered.map((point, index) => (
					<li key={point.slug} data-gateway={point.kind === 'gateway'} data-focus={point.slug === focus}>
						<span className='tv-map-key-num'>{index + 1}</span>
						{point.label}
					</li>
				))}
			</ol>

			{caption ? <figcaption className='tv-map-caption'>{caption}</figcaption> : null}
		</figure>
	)
}
