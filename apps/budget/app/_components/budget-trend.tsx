import { peso, pesoTight } from '@betterbarmm/budget-data'
import { joinRenames } from '@betterbarmm/budget-data/trends'

export { joinRenames }
import trends from '../../../../datasets/budget/trends.json'

/* ============================================================
   What the region has been given, year on year

   The long view. Every Act is loaded now, so the series come
   off the Acts themselves rather than off the old seven-year
   extract — `packages/budget-data/src/build-trends.mts` reduces
   them to the few hundred integers a chart draws, and refuses to
   write the file if any office's latest figure disagrees with
   the one that Act was checked against.

   It runs FY 2020 to FY 2026, all seven. The file it replaced
   started at FY 2021 and carried no line for thirteen of the
   forty-four offices, because it could only match what the old
   extract's office codes matched.

   An office with fewer than two points has no line and falls
   back to the region's: a single column is not a trend, and an
   office the Act had not created yet was not given nothing.
   ============================================================ */

type Series = [year: number, total: number][]

export type Line = { slug: string; name: string; series: Series }

// `number[][]` is all TypeScript can infer from the JSON. The pairs are
// guaranteed by `build-trends.mts`, which is the only thing that writes it.
const TRENDS = trends as unknown as {
	meta: { years: number[]; notes: string[] }
	region: Series
	offices: Line[]
	sectors: Line[]
	areas: Line[]
}

/** The region's own series, for prose that has to quote it. */
export const regionTrend: Series = TRENDS.region ?? []

const index = (lines: Line[]) => new Map(lines.map((one) => [one.slug, one.series]))

const OFFICES = index(TRENDS.offices)
const SECTORS = index(TRENDS.sectors)
const AREAS = index(TRENDS.areas)

/** Every line in a grouping, largest last-year first — for the pages that
    compare them rather than look one up. */
export const officeLines: Line[] = TRENDS.offices
export const sectorLines: Line[] = TRENDS.sectors
export const areaLines: Line[] = TRENDS.areas

/** The years the series run across, oldest first. */
export const trendYears: number[] = TRENDS.meta.years

/** One office's line, where the Acts carry more than a single year of it. */
export const officeTrend = (slug: string): Series | undefined => OFFICES.get(slug)

/** One sector's line. These overlap between sectors and are never summed. */
export const sectorTrend = (slug: string): Series | undefined => SECTORS.get(slug)

/** One area's line — the itemised projects there, not its whole budget. */
export const areaTrend = (slug: string): Series | undefined => AREAS.get(slug)
/* The drawing box, in user units that CSS scales to the row.

   Wide and flat on purpose. The box's own ratio sets the rendered height —
   `h-auto` is what stops `preserveAspectRatio` letterboxing a fluid-width
   chart — so at the row's full width a squarer box would stand four hundred
   pixels tall.

   The first and last years sit on the box's own edges rather than in the
   middle of a slot (user decision), so the line runs the full width of the row
   it is given. `PAD_X` is the dot's radius and nothing more — enough that the
   two end marks are not cut in half by the viewBox.

   `PAD_LABEL` is the room the figure above the highest point needs, and
   `PAD_FOOT` keeps the lowest one off the baseline it is measured from. */
const W = 1200
const H = 240
const PAD_X = 8
const PAD_LABEL = 40
const PAD_FOOT = 12
const LABEL_FONT = 19

/* One id for the fill, not one per instance. Two charts on a page would define
   the same gradient twice and the first would win, which is the right answer
   when both definitions are identical. */
const FILL = 'bb-trend-fill'

/**
 * The trend as a line over a gradient, across the width of the row.
 *
 * Measured from zero, which the fill under the line is what decides: a filled
 * area says how much by how much ink is under it, so a baseline anywhere else
 * makes every height a lie. A bare line may scale to its own range — it
 * carries its meaning in slope — but the moment it is filled it is claiming
 * area, and area has to start at nothing.
 *
 * Every year carries its figure above its point, so nothing has to be hovered
 * to be read; the exact amount behind the rounded one is a native `title` on
 * each column. No state and no drawn tooltip, so the whole chart stays a server
 * component and ships no JavaScript, and every figure is in the `aria-label`
 * as well.
 *
 * The mark is `--accent`, the brand's own color, which re-points itself per
 * surface: the crimson on paper, the warm rose in the dark, white on the
 * crimson band. The figures beside it stay in `--ink` — text wears text
 * colors, and the mark beside them is what carries the series. One series, so
 * no legend: the label above the chart names it.
 */
export function BudgetTrend({
	slug,
	series: given,
	label: givenLabel,
	active,
}: {
	slug?: string
	/**
	 * A series read straight off the Acts, which is what an office page passes.
	 *
	 * `trend.json` is a build step over the old seven-year extract and it starts
	 * at FY 2021, carries no line for thirteen of the forty-four offices, and
	 * cannot say anything about FY 2020. Every year is loaded now, so a caller
	 * that can count the offices itself gets a better series than this file
	 * holds — and this one keeps its own for the region, where the two agree.
	 */
	series?: Series
	label?: string
	/** The year to mark. The last one, unless a page says otherwise. */
	active?: number
}) {
	// The office's own line where there is one, the region's where there is not.
	const own = given ?? (slug ? OFFICES.get(slug) : undefined)
	const series = own ?? TRENDS.region
	if (!series || series.length < 2) return null

	const label =
		givenLabel ??
		(own ? 'What the region has been given to this office' : 'What the region has been given')

	const high = Math.max(...series.map(([, total]) => total)) || 1

	const plot = H - PAD_LABEL - PAD_FOOT
	// End to end: the span is divided by the gaps between years, not by the
	// years, so the first point lands on the left edge and the last on the right.
	const step = (W - PAD_X * 2) / (series.length - 1)

	const points = series.map(([year, total], index) => ({
		year,
		total,
		x: PAD_X + index * step,
		y: PAD_LABEL + plot - (total / high) * plot,
	}))

	const first = points[0]!
	const last = points[points.length - 1]!
	const marked = active ?? last.year

	const line = points
		.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
		.join(' ')
	// Closed on the baseline at the foot of the box, which is zero.
	const area = `${line} L${last.x.toFixed(1)} ${H} L${first.x.toFixed(1)} ${H} Z`

	return (
		<figure className='m-0'>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				className='h-auto w-full text-[var(--accent)]'
				role='img'
				aria-label={`${label}, by fiscal year: ${series
					.map(([year, total]) => `${year}, ${peso(total)}`)
					.join('; ')}.`}
			>
				<defs>
					<linearGradient id={FILL} x1='0' y1='0' x2='0' y2='1'>
						<stop offset='0%' stopColor='currentColor' stopOpacity='0.3' />
						<stop offset='100%' stopColor='currentColor' stopOpacity='0.02' />
					</linearGradient>
				</defs>

				<path d={area} fill={`url(#${FILL})`} />
				{/* `non-scaling-stroke` so the line is two pixels wherever the box is
				    scaled to, rather than two user units multiplied by the column's
				    width over 1200. */}
				<path
					d={line}
					fill='none'
					stroke='currentColor'
					strokeWidth={2}
					strokeLinecap='round'
					strokeLinejoin='round'
					vectorEffect='non-scaling-stroke'
				/>

				{points.map((point, index) => (
					<g key={point.year} className='group/point'>
						{/* Every point carries its own figure (user decision), so the chart
						    is read without hovering it. Short form up here — the exact
						    amount is in the `title` on hover, in the two figures under the
						    chart and in the label the screen reader is given. */}
						<text
							x={point.x}
							y={point.y - 16}
							/* The end labels are anchored to their own edge rather than
							   centerd on a point that sits on the edge of the box, which
							   would cut half the figure off. */
							textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}
							className='fill-[var(--ink)] font-mono font-semibold'
							style={{ fontSize: LABEL_FONT }}
						>
							{pesoTight(point.total)}
						</text>

						{/* The marked year carries a stem to the baseline it is measured
						    from; the rest are dots. */}
						{point.year === marked ? (
							<line
								x1={point.x}
								y1={point.y}
								x2={point.x}
								y2={H}
								stroke='currentColor'
								strokeWidth={1}
								opacity={0.35}
								vectorEffect='non-scaling-stroke'
							/>
						) : null}
						<circle
							cx={point.x}
							cy={point.y}
							r={point.year === marked ? 6 : 4}
							fill='currentColor'
							opacity={point.year === marked ? 1 : 0.6}
							className='transition-opacity duration-150 group-hover/point:opacity-100'
						/>

						{/* The whole column is the target, full height: a dot is eight
						    pixels of hover at this scale. `title` rather than a drawn
						    tooltip — the figure is already on the page, and this is only
						    the exact one behind it. */}
						<rect
							x={point.x - step / 2}
							y={0}
							width={step}
							height={H}
							fill='transparent'
						>
							<title>{`FY ${point.year} · ${peso(point.total)}`}</title>
						</rect>
					</g>
				))}
			</svg>

			{/* Ticks in the SVG's own coordinates rather than a flex row underneath,
			    so each year sits under its own point instead of drifting a slot away
			    from it. */}
			<svg
				viewBox={`0 0 ${W} 18`}
				className='mt-2 h-auto w-full'
				aria-hidden='true'
				focusable='false'
			>
				{points.map((point) => (
					<text
						key={point.year}
						x={point.x}
						y={12}
						textAnchor='middle'
						className='fill-[var(--ink-3)] font-semibold'
						style={{ fontSize: 11, letterSpacing: '0.1em' }}
					>
						{point.year}
					</text>
				))}
			</svg>

			{/* The two ends only. Seven figures would say what the line already says. */}
			<div className='mt-3 flex items-baseline justify-between gap-6 border-t border-[var(--rule)] pt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
				<span className='money'>{peso(first.total)}</span>
				<span className='money text-[var(--ink)]'>{peso(last.total)}</span>
			</div>
		</figure>
	)
}
