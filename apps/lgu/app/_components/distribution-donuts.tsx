'use client'

import { useState } from 'react'

/* ============================================================
   Where the region's units are

   Two rings: one for the 108 cities and municipalities, one for the
   2,180 barangays. Both answer the same question — how evenly is the
   region divided — and they answer it differently, which is the point
   of setting them side by side. Lanao del Sur is a third of the units
   and over half the barangays.

   Seven slices is more than color alone can carry, so color is not
   asked to carry it. The slices are ordered largest first and painted
   down a single ramp, so the ring encodes rank by lightness rather
   than identity by hue; the legend under each ring is ordered the same
   way and holds the exact count and share for every area. Reading the
   ring gives the shape, reading the legend gives the number, and
   neither depends on telling two similar browns apart.
   ============================================================ */

export type Slice = {
	name: string
	value: number
	href: string
}

const RADIUS = 40
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
/** The surface gap between slices, in viewBox units — about 2px as drawn. */
const GAP = 1.6

const NUMBER = new Intl.NumberFormat('en-US')

/**
 * One ring and its legend.
 *
 * The center carries the total until a slice is hovered or focused, then it
 * carries that slice instead. A donut with a floating tooltip has the reader
 * looking at two places at once; the hole is already the one part of the ring
 * nothing is drawn in, and it is where the eye rests anyway.
 */
function Donut({
	slices,
	total,
	unit,
	label,
}: {
	slices: Slice[]
	total: number
	/** What is being counted, printed under the total — "units", "barangays". */
	unit: string
	label: string
}) {
	const [active, setActive] = useState<number | null>(null)

	const shown = active == null ? null : slices[active]
	const share = (value: number) => (total === 0 ? 0 : (value / total) * 100)

	// Cumulative fraction of the circle each slice starts at, so a slice can be
	// drawn as one dashed circle rather than an arc path. Summed per slice
	// rather than carried in a running total — seven items make the repeated
	// walk free, and nothing is reassigned mid-render.
	const arcs = slices.map((slice, index) => ({
		slice,
		start: slices.slice(0, index).reduce((sum, earlier) => sum + share(earlier.value) / 100, 0),
	}))

	return (
		<div>
			<figure className='m-0'>
				<figcaption className='bb-label'>{label}</figcaption>

				<div className='mt-6 flex justify-center'>
					<div className='relative w-full max-w-[15rem]'>
						<svg
							viewBox='0 0 100 100'
							className='w-full -rotate-90'
							role='img'
							aria-label={`${label}: ${slices
								.map(
									(slice) =>
										`${slice.name} ${NUMBER.format(slice.value)}, ${share(slice.value).toFixed(0)}%`,
								)
								.join('; ')}`}
						>
							{arcs.map(({ slice, start }, index) => {
								const length = Math.max((share(slice.value) / 100) * CIRCUMFERENCE - GAP, 0.6)
								return (
									<circle
										key={slice.name}
										cx='50'
										cy='50'
										r={RADIUS}
										fill='none'
										strokeWidth={active === index ? 17 : 14}
										stroke={`var(--lgu-slice-${index + 1})`}
										strokeDasharray={`${length} ${CIRCUMFERENCE}`}
										strokeDashoffset={-start * CIRCUMFERENCE}
										className='pointer-events-none transition-[stroke-width,opacity] duration-200'
										opacity={active == null || active === index ? 1 : 0.35}
									/>
								)
							})}

							{/* Hit targets, over the ring and invisible. Cotabato City is one
							    unit in 108 — three quarters of a viewBox unit of arc, which
							    is not a target a pointer can land on. These are wider than
							    the ring across it and never shorter than a few units along
							    it. */}
							{arcs.map(({ slice, start }, index) => (
								<circle
									key={`${slice.name}-target`}
									cx='50'
									cy='50'
									r={RADIUS}
									fill='none'
									strokeWidth={20}
									stroke='transparent'
									strokeDasharray={`${Math.max(
										(share(slice.value) / 100) * CIRCUMFERENCE,
										4,
									)} ${CIRCUMFERENCE}`}
									strokeDashoffset={-start * CIRCUMFERENCE}
									onMouseEnter={() => setActive(index)}
									onMouseLeave={() => setActive(null)}
								/>
							))}
						</svg>

						{/* The hole. Pointer events off so it never steals a hover from the
						    ring it sits inside. */}
						<div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center'>
							<p className='num text-[1.9rem] font-extrabold leading-none tracking-[-0.04em] text-[var(--ink)]'>
								{NUMBER.format(shown ? shown.value : total)}
							</p>
							<p className='mt-2 font-mono text-[9.5px] font-semibold uppercase leading-4 tracking-[0.14em] text-[var(--ink-3)]'>
								{shown ? `${share(shown.value).toFixed(1)}% of ${unit}` : unit}
							</p>
							{shown ? (
								<p className='mt-1.5 text-[11.5px] font-semibold leading-4 text-[var(--accent)]'>
									{shown.name}
								</p>
							) : null}
						</div>
					</div>
				</div>
			</figure>

			{/* The legend is also the table view: every area, in the ring's own
			    order, with the figure the ring can only approximate. */}
			<dl className='mt-8'>
				{slices.map((slice, index) => (
					<div
						key={slice.name}
						onMouseEnter={() => setActive(index)}
						onMouseLeave={() => setActive(null)}
						data-active={active === index}
						className='flex items-baseline gap-3 border-b border-[var(--rule-soft)] py-2 transition data-[active=true]:bg-[var(--paper-2)]'
					>
						<span
							aria-hidden='true'
							className='size-2.5 shrink-0 translate-y-0.5'
							style={{ background: `var(--lgu-slice-${index + 1})` }}
						/>
						<dt className='min-w-0 flex-1 truncate text-[13px] text-[var(--ink-2)]'>{slice.name}</dt>
						<dd className='num shrink-0 text-right text-[13px] font-semibold text-[var(--ink)]'>
							{NUMBER.format(slice.value)}
							<span className='ml-2 font-normal text-[var(--ink-3)]'>
								{share(slice.value).toFixed(1)}%
							</span>
						</dd>
					</div>
				))}
			</dl>
		</div>
	)
}

/**
 * The pair, side by side.
 *
 * Two columns rather than one chart with two series: they are different
 * measures on different scales, and putting them on one axis would be the
 * dual-axis mistake in a rounder shape.
 */
export function DistributionDonuts({
	units,
	barangays,
}: {
	units: Slice[]
	barangays: Slice[]
}) {
	const unitTotal = units.reduce((sum, slice) => sum + slice.value, 0)
	const barangayTotal = barangays.reduce((sum, slice) => sum + slice.value, 0)

	return (
		<div className='mt-12 grid gap-12 border-t border-[var(--brass-line)] pt-10 md:grid-cols-2 md:gap-16'>
			<Donut
				slices={units}
				total={unitTotal}
				unit='cities and municipalities'
				label='Cities and municipalities'
			/>
			<Donut slices={barangays} total={barangayTotal} unit='barangays' label='Barangays' />
		</div>
	)
}
