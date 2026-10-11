import { barmmBoundaries, findShape, sameUnit } from '@betterbarmm/lgu-data'

/* ============================================================
   Where a place is: the region in grey, the place in red, framed
   close on it and tilted back so it reads as a raised block on a
   table. Server-rendered SVG; the depth is each shape drawn again,
   shifted down, in a darker shade. A place with no published
   outline (the Special Geographic Area and its towns) draws nothing.
   ============================================================ */

/** The bounding box of SVG path data made only of M, L and Z commands. */
function bounds(d: string) {
	const numbers = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
	let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity]
	for (let i = 0; i + 1 < numbers.length; i += 2) {
		x0 = Math.min(x0, numbers[i])
		x1 = Math.max(x1, numbers[i])
		y0 = Math.min(y0, numbers[i + 1])
		y1 = Math.max(y1, numbers[i + 1])
	}
	return { x0, y0, x1, y1 }
}

export function LocatorMap({
	areaSlug,
	unit,
	label,
}: {
	/** The province or area the place is in. */
	areaSlug: string
	/** Set for a city or municipality; left off for a province. */
	unit?: { psgc: string | null; name: string }
	label: string
}) {
	const { land, outside, areas, units } = barmmBoundaries
	const target = unit
		? units.find((shape) => shape.area === areaSlug && sameUnit(shape.psgc, unit.psgc, shape.name, unit.name))?.d
		: findShape(areaSlug)?.d
	if (!target) return null

	// Frame the place with room around it: a town shows its neighbours, a
	// province the coast it sits on. Never tighter than a fixed minimum, or a
	// small island town fills the frame and says nothing about where it is.
	const box = bounds(target)
	const size = Math.max(box.x1 - box.x0, (box.y1 - box.y0) * 1.25, unit ? 70 : 120)
	const width = size * 2.6
	const height = width * 0.8
	const cx = (box.x0 + box.x1) / 2
	const cy = (box.y0 + box.y1) / 2
	const viewBox = `${cx - width / 2} ${cy - height / 2} ${width} ${height}`
	const depth = width * 0.018
	const stroke = width * 0.0025

	const ground = 'fill-[color-mix(in_srgb,var(--paper-3)_86%,#000)]'
	const region = unit ? units.filter((shape) => shape.area === areaSlug) : areas

	return (
		<figure className='m-0 overflow-hidden bg-[var(--paper-2)]'>
			<svg
				viewBox={viewBox}
				className='block h-auto w-full [transform:perspective(900px)_rotateX(38deg)_scale(1.18)] [transform-origin:50%_60%]'
				role='img'
				aria-label={`Map showing where ${label} is`}
			>
				{/* The ground and the region, raised. */}
				<path d={land} transform={`translate(0 ${depth})`} className={ground} />
				{outside.map((area) => (
					<path key={`${area.slug}-side`} d={area.d} transform={`translate(0 ${depth})`} className={ground} />
				))}
				{areas.map((area) => (
					<path key={`${area.slug}-side`} d={area.d} transform={`translate(0 ${depth})`} className={ground} />
				))}
				<path d={land} className='fill-[var(--paper-3)]' />
				{outside.map((area) => (
					<path key={area.slug} d={area.d} className='fill-[var(--paper-3)]' />
				))}
				{areas.map((area) => (
					<path key={area.slug} d={area.d} className='fill-[color-mix(in_srgb,var(--paper-3)_80%,var(--ink-mute))]' />
				))}
				{/* Its neighbours: the other towns of the province, or the other provinces. */}
				{region.map((shape) => (
					<path
						key={'psgc' in shape ? shape.psgc : shape.slug}
						d={shape.d}
						strokeWidth={stroke}
						strokeLinejoin='round'
						className='fill-[color-mix(in_srgb,var(--accent)_16%,var(--paper-3))] stroke-[var(--paper)]'
					/>
				))}
				{/* The place itself, lifted higher than the rest. */}
				<path d={target} transform={`translate(0 ${depth * 1.6})`} className='fill-[color-mix(in_srgb,var(--accent)_62%,#000)]' />
				<path d={target} strokeWidth={stroke * 1.4} strokeLinejoin='round' className='fill-[var(--accent)] stroke-[var(--paper)]' />
			</svg>
			<figcaption className='px-4 pb-3 text-[12px] text-[var(--ink-3)]'>{label} in red</figcaption>
		</figure>
	)
}
