/* ============================================================
   Where the bills actually are

   A ring, because the question this answers is part-to-whole at a glance:
   what share of everything filed is still sitting in a committee. It is
   legible as a ring only because there are a handful of segments and two of
   them dominate — for a set of close values this would have to be a bar.

   The colour is a one-hue ramp rather than the status tones the badges use.
   Stages are a sequence: swapping "first reading" and "approved" would change
   what the picture says, which makes this ordinal, and ordinal data takes
   lightness steps so the order is visible in the colour itself. The badge
   tones are also measurably unsafe at this size — the committee and early
   hues sit ΔE 3.7 apart under deuteranopia, which is no distance at all. See
   `--funnel-1..4` in the stylesheet.

   The legend splits and flanks the ring, reading outward from it: earlier
   stages left, later stages right. Several slices are slivers under two
   percent, and an arc that thin cannot be labelled or hovered reliably — so
   the flanking rows are not decoration around the chart, they are where those
   slices are actually read.
   ============================================================ */

export type FunnelSlice = {
	label: string
	count: number
	/** A `--funnel-*` token. */
	color: string
	/** What the stage means, one line. */
	note: string
}

const SIZE = 132
const RADIUS = 52
const STROKE = 21
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
/** Surface showing between segments, so two adjacent arcs never touch. */
const GAP = 2.5

function LegendRow({
	slice,
	total,
	side,
}: {
	slice: FunnelSlice
	total: number
	side: 'left' | 'right'
}) {
	const share = (slice.count / total) * 100
	const mirrored = side === 'left'

	return (
		<div
			className={`flex items-start gap-3 border-t border-[var(--rule-soft)] py-4 first:border-t-0 first:pt-0 ${
				mirrored ? 'flex-row-reverse text-right' : 'text-left'
			}`}
		>
			{/* On the outer edge of the ring either way, so the two columns read as
			    one legend wrapped around it rather than two lists. */}
			<span
				aria-hidden='true'
				className='mt-1.5 size-2.5 shrink-0 rounded-full'
				style={{ background: slice.color }}
			/>

			<div className='min-w-0'>
				<p className={`flex flex-wrap items-center gap-x-2 ${mirrored ? 'justify-end' : ''}`}>
					{/* The count leads: the row answers "how many are here", and the
					    stage name is what that number is a count of. */}
					<span className='num text-[15px] font-semibold text-[var(--ink)]'>
						{slice.count.toLocaleString()}
					</span>
					<span className='item-title text-[var(--ink)]'>{slice.label}</span>
					{/* The share as a tinted pill, tied to its own arc by colour — the
					    same soft-fill badge the status pills use, a size down.

					    The text is a darkened step of the slice colour rather than the
					    slice colour itself: `--funnel-1` reaches only 2.2:1 on paper,
					    which is fine for a 21px-wide arc and unreadable as type. Mixing
					    toward `--ink` keeps the hue and gets the contrast, and because
					    `--ink` flips with the theme it darkens on paper and lightens on
					    a dark ground without a second rule. */}
					<span
						className='num inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[10.5px] font-bold leading-none tracking-[0.01em]'
						style={{
							background: `color-mix(in oklab, ${slice.color} 20%, transparent)`,
							color: `color-mix(in oklab, ${slice.color} 68%, var(--ink))`,
						}}
					>
						{share < 1 ? '<1' : Math.round(share)}
						{/* The unit a step down from the figure — the number is the value,
						    the sign only says what kind. */}
						<span className='ml-px text-[8px] font-bold'>%</span>
					</span>
				</p>
				<p className='mt-1 text-[13px] leading-5 text-[var(--ink-3)]'>{slice.note}</p>
			</div>
		</div>
	)
}

export function BillFunnel({
	slices,
	total,
	heroValue,
	heroLabel,
}: {
	slices: FunnelSlice[]
	total: number
	heroValue: string
	heroLabel: string
}) {
	// Earlier stages left of the ring, later ones right. An odd count puts the
	// extra row on the left, so the split always falls at a stage boundary.
	const split = Math.ceil(slices.length / 2)
	const earlier = slices.slice(0, split)
	const later = slices.slice(split)

	let travelled = 0

	return (
		<div className='grid items-center gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:gap-x-16'>
			<div>
				{earlier.map((slice) => (
					<LegendRow key={slice.label} slice={slice} total={total} side='left' />
				))}
			</div>

			<figure className='relative mx-auto w-[20rem] shrink-0 sm:w-[24rem]'>
				<svg
					viewBox={`0 0 ${SIZE} ${SIZE}`}
					className='w-full -rotate-90'
					role='img'
					aria-label={`Distribution of ${total.toLocaleString()} bills across stages. ${slices
						.map((slice) => `${slice.label}, ${slice.count}`)
						.join('. ')}.`}
				>
					{slices.map((slice) => {
						const length = Math.max((slice.count / total) * CIRCUMFERENCE - GAP, 0.5)
						const offset = -travelled
						// Advanced by the true share, not the drawn length, so trimming a
						// sliver for its gap never shifts everything after it.
						travelled += (slice.count / total) * CIRCUMFERENCE

						return (
							<circle
								key={slice.label}
								cx={SIZE / 2}
								cy={SIZE / 2}
								r={RADIUS}
								fill='none'
								stroke={slice.color}
								strokeWidth={STROKE}
								strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
								strokeDashoffset={offset}
								// A rounded end on a sub-percent sliver would swallow the
								// slice whole, so the ends stay butt and the gap does the work.
								strokeLinecap='butt'
							>
								<title>{`${slice.label}: ${slice.count.toLocaleString()} of ${total.toLocaleString()}`}</title>
							</circle>
						)
					})}
				</svg>

				{/* The ring answers "how is it spread"; this answers "so what". */}
				<figcaption className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center'>
					<span className='font-title text-[2.75rem] font-extrabold leading-none tracking-tight text-[var(--ink)] sm:text-[3.25rem]'>
						{heroValue}
					</span>
					<span className='mt-3 max-w-[11rem] text-[13px] leading-5 text-[var(--ink-mute)]'>
						{heroLabel}
					</span>
				</figcaption>
			</figure>

			<div>
				{later.map((slice) => (
					<LegendRow key={slice.label} slice={slice} total={total} side='right' />
				))}
			</div>
		</div>
	)
}
