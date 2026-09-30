import { budgetFor, formatNumber, percent, peso, pesoShort } from '@betterbarmm/budget-data'

/* ============================================================
   The 258 projects two ways: where, and what

   The two charts on one row and their two readings on the row
   under them (user decision), so the charts are read against
   each other before either is read at all. No tabs: there are
   two of these and both fit, and a control that hides half of
   what a block says earns its place only when the block is too
   long to show.

   The columns are the sector chart's, and the form is what
   makes the second chart honest. A pie is a share of 360° and
   so asserts a whole: drawn from these kinds it would have had
   to be either wrong or quietly restated, because a project can
   be two things at once — a road with a bridge on it — and 41
   of them are, so the kinds come to ₱5.4 billion against ₱4.8
   billion of actual projects. A column claims nothing but its
   own height, so both are drawn from the tags exactly as the
   Act carries them, and each says under itself which kind of
   thing it is:

   · the areas are a whole and add to the total
   · the kinds overlap and must never be added

   Nothing here is interactive, so nothing here is a client
   component. The hover panel is `group-hover`, which is CSS.
   ============================================================ */

/** The tallest column, in pixels. The sector chart's own. */
const HEIGHT = 176

/** The shortest a column may be drawn, so the tail is visible at all. */
const FLOOR = 2

type Column = { key: string; name: string; total: number; count: number }

/** The columns alone. Its reading is placed under it by the grid. */
function Chart({
	label,
	rows,
	describedBy,
	className,
}: {
	label: string
	rows: Column[]
	describedBy: string
	className: string
}) {
	const tallest = rows[0]?.total ?? 1

	return (
		<figure aria-describedby={describedBy} className={`m-0 ${className}`}>
			{/* The name has moved to the reading under the chart (user decision),
			    where it opens the sentence that explains it — so nothing is printed
			    twice. Kept here for anyone who is not looking at the page: a figure
			    with no caption is announced as an unnamed group of numbers. */}
			<figcaption className='sr-only'>{label}</figcaption>

			<div className='overflow-x-auto lg:overflow-x-visible'>
				<div className='flex min-w-[20rem] items-end gap-1.5 sm:gap-2'>
					{rows.map((row, index) => {
						/* One hue stepped down by rank — a sequential ramp, which is what
						   color is for when it stands for the same thing the height does.
						   It stops at 0.4 because the last column still has to be seen. */
						const shade = 1 - (index / Math.max(1, rows.length - 1)) * 0.6

						return (
							<div
								key={row.key}
								/* Paint order is DOM order, so an early column's panel was
								   going under a later column's bar. Lifting the hovered column
								   lifts its panel with it. */
								className='group/col relative flex min-w-0 flex-1 flex-col items-center hover:z-10'
							>
								<div className='relative h-12 w-full'>
									<div className='pointer-events-none absolute inset-x-0 bottom-0 flex justify-center opacity-0 transition-opacity duration-150 group-hover/col:opacity-100'>
										<p className='whitespace-nowrap bg-[var(--ink)] px-3 py-2 text-center'>
											<span className='block text-[11px] font-semibold leading-tight text-[var(--paper)]'>
												{row.name}
											</span>
											<span className='money mt-0.5 block font-mono text-[10px] text-[var(--paper)] opacity-75'>
												{peso(row.total)} · {formatNumber(row.count)}
											</span>
										</p>
									</div>
								</div>

								<div
									className='w-full bg-[var(--accent)]'
									style={{
										height: `${Math.max(FLOOR, (row.total / tallest) * HEIGHT)}px`,
										opacity: shade,
									}}
								/>

								{/* Truncated to one line: "Flood Control / Drainage" over a
								    column two thirds its width wrapped to three lines and the
								    axis became a paragraph. The name is never only here — it is
								    in the hover panel and in the accessible text, in full. */}
								<p
									title={row.name}
									className='mt-3 w-full truncate text-center text-[10px] font-semibold tracking-[-0.01em] text-[var(--ink-2)]'
								>
									{row.name}
								</p>
								<p className='money mt-1 text-center font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-mute)]'>
									{formatNumber(row.count)}
								</p>

								<span className='sr-only'>
									{row.name}: {peso(row.total)}, {formatNumber(row.count)} projects.
								</span>
							</div>
						)
					})}
				</div>
			</div>
		</figure>
	)
}

/** A chart's reading, placed on the row under it. */
function Reading({
	id,
	headline,
	className,
	children,
}: {
	id: string
	headline: string
	className: string
	children: React.ReactNode
}) {
	return (
		<p
			id={id}
			/* Smaller than it was (user decision). At 15.5px on 1.95 this read as the
			   page's own prose; it is a caption to the chart beside it, and a caption
			   that outweighs its figure is arguing with it. */
			className={`text-[13.5px] leading-[1.8] text-[var(--ink-2)] ${className}`}
		>
			<strong className='font-semibold text-[var(--ink)]'>{headline}</strong> {children}
		</p>
	)
}

/* Takes the year rather than the rows. This renders on the server, so it can
   ask for the year it is drawing and save the page threading four collections
   through a prop each. */
export function ProjectCharts({ fy }: { fy?: string }) {
	const { projects, projectsByProvince, projectKinds, projectsTotal } = budgetFor(fy)

	const areas: Column[] = projectsByProvince.map((group) => ({
		key: group.province,
		name: group.province,
		total: group.total,
		count: group.projects.length,
	}))

	/* Sorted by money, though the export is ordered by how many there are of
	   each: a chart whose columns are heights has to descend, or the ranking the
	   eye reads off it is not the one the columns are drawn from. */
	const kinds: Column[] = [...projectKinds]
		.sort((a, b) => b.total - a.total)
		.map((one) => ({ key: one.kind, name: one.kind, total: one.total, count: one.count }))

	const biggestArea = areas[0]
	const smallestArea = areas[areas.length - 1]
	const road = kinds[0]
	const overlapping = projects.filter((project) => project.kinds.length > 1).length
	const kindSum = kinds.reduce((sum, one) => sum + one.total, 0)

	/* Each chart sits beside its own reading in the markup and is put on the
	   grid by hand, rather than the four being emitted in the order they are
	   drawn in. Stacked at one column the source order is the reading order —
	   chart, what it means, chart, what it means — where laying the two charts
	   out first would have put both readings below both charts on a phone. */
	return (
		<div className='grid gap-x-16 gap-y-10 lg:grid-cols-2'>
			<Chart
				label='Where it is being built'
				rows={areas}
				describedBy='projects-by-area'
				className='lg:col-start-1 lg:row-start-1'
			/>
			<Reading
				id='projects-by-area'
				headline='Where it is being built.'
				className='lg:col-start-1 lg:row-start-2'
			>
				{`Every project is listed under exactly one area, so these ${areas.length} shares are the ${pesoShort(projectsTotal)} divided between them and nothing is counted twice. ${biggestArea?.name} takes ${percent(((biggestArea?.total ?? 0) / projectsTotal) * 100)} of it — ${pesoShort(biggestArea?.total ?? 0)} over ${biggestArea?.count} projects, which is ${Math.round(((biggestArea?.count ?? 0) / projects.length) * 100)}% of everything the Act itemises and ${((biggestArea?.total ?? 1) / (smallestArea?.total ?? 1)).toFixed(1)} times what ${smallestArea?.name} is given.`}
			</Reading>

			<Chart
				label='What is being built'
				rows={kinds}
				describedBy='projects-by-kind'
				className='lg:col-start-2 lg:row-start-1'
			/>
			<Reading
				id='projects-by-kind'
				headline='What is being built.'
				className='lg:col-start-2 lg:row-start-2'
			>
				{`Mostly this money is roads: ${road?.count} of the ${projects.length} projects and ${pesoShort(road?.total ?? 0)}, against ${pesoShort(kinds[1]?.total ?? 0)} across ${kinds[1]?.count} for ${kinds[1]?.name.toLowerCase()}. But ${overlapping} projects are two things at once — a road with a bridge on it is both — so unlike the areas these columns overlap: they come to ${pesoShort(kindSum)}, ${percent((kindSum / projectsTotal - 1) * 100)} more than the projects actually cost.`}
			</Reading>
		</div>
	)
}
