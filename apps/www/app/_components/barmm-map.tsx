import { barmmBoundaries, lguData, lguProvinces } from '@betterbarmm/lgu-data'

/* ============================================================
   The region, drawn

   Seven areas on one map with their own figures beside it. The
   outlines are PSA's, through the PSGC, and the figures are the
   same ones the local government directory runs on — so a number
   here and a number there cannot drift apart, because there is
   only one of each.

   One hue stepped by population, never seven hues. The estate
   settles this the same way on its charts: a sequential ramp is
   what color is for when it stands for the same thing another
   channel already carries, and seven unrelated hues would say
   these are seven kinds of thing rather than one measure across
   seven places. The ramp stops well short of invisible, because
   the smallest area still has to be found on the map.

   What the map is honest about, in the note under it rather than
   in a footnote nobody opens:

   · Sulu is drawn and not counted. It is the one grey island the
     region closes around, between Basilan and Tawi-Tawi. Leaving
     it out would have left a hole there that reads as sea.

   · The Special Geographic Area is counted and not drawn. Its 63
     barangays were ratified after the boundary edition underneath
     this, so there is no shape for it to take. Six areas are drawn
     where the region has seven, and the note says so rather than
     letting a reader count the shapes and come out one short.

   · The outlines are simplified. They are good enough to recognize
     a province and not good enough to settle where one ends.

   The grey behind it all is the rest of Mindanao, the archipelago
   and the tip of Palawan. It carries no figures and is never
   counted — it is there because six of the seven areas are islands,
   and islands drawn on an empty page are not a region.
   ============================================================ */

/** The ramp's floor. Shallow, so every area still reads as the brand crimson
    rather than as a wash of it — the ramp separates, the hairline between two
    areas is what divides. */
const FAINTEST = 0.58

/** How far the region stands off the sea, in the frame's own units. */
const DEPTH = 9

const figure = (value: number | null) =>
	value === null ? '—' : value.toLocaleString('en-PH')

export function BarmmMap() {
	const { viewBox, areas, outside, land, missing, source } = barmmBoundaries

	/* The directory is the only list of areas. The boundary file names the same
	   places but carries no figures, so it is joined onto the directory rather
	   than read alongside it — a shape with no province behind it would be a
	   silent extra area on the map. */
	const rows = [...lguProvinces]
		.map((province) => ({
			province,
			shape: areas.find((area) => area.slug === province.slug),
		}))
		.sort((a, b) => (b.province.population ?? 0) - (a.province.population ?? 0))

	/* Shade by rank in that order, so the ramp and the list below it read down
	   together. The areas with no census figure sort last and take the floor. */
	const shadeOf = (index: number) =>
		1 - (index / Math.max(1, rows.length - 1)) * (1 - FAINTEST)

	const shades = new Map(
		rows.map((row, index) => [row.province.slug, shadeOf(index)] as const),
	)

	return (
		<figure className='m-0'>
			{/* The map is a picture of the list under it, and the list is readable.
			    So the picture is given a name and nothing else: read out shape by
			    shape it would be seven province names in a random order, which is
			    the list again, worse. */}
			<div
				role='img'
				aria-label={`The ${rows.length} areas of the Bangsamoro Autonomous Region in Muslim Mindanao, shaded by population.`}
				className='barmm-map'
			>
				{/* Four layers, bottom to top, each one finished before the next
				    starts: the sea's land and its side, then the region and its
				    side. The order is the whole of the effect. Pairing each shape
				    with its own side instead would let a later province's side fall
				    across an earlier province's face, and the map would look like
				    cards dropped on a table rather than ground standing out of it.

				    The side is the same path moved down. A real extrusion would
				    want the silhouette of each shape swept downward, which is a
				    geometry problem; at nine units of travel the difference is
				    behind the shape and nobody can see it. */}
				<svg viewBox={viewBox} className='h-auto w-full' aria-hidden='true'>
					<path d={land} fillRule='nonzero' className='barmm-map-land-side' transform={`translate(0 ${DEPTH})`} />
					{outside.map((area) => (
						<path
							key={`${area.slug}-side`}
							d={area.d}
							fillRule='nonzero'
							className='barmm-map-land-side'
							transform={`translate(0 ${DEPTH})`}
						/>
					))}

					<path d={land} fillRule='nonzero' className='barmm-map-land' />
					{outside.map((area) => (
						<path key={area.slug} d={area.d} fillRule='nonzero' className='barmm-map-land' />
					))}

					{areas.map((area) => (
						<path
							key={`${area.slug}-side`}
							d={area.d}
							fillRule='nonzero'
							className='barmm-map-side'
							transform={`translate(0 ${DEPTH})`}
						/>
					))}

					{areas.map((area) => (
						<path
							key={area.slug}
							d={area.d}
							fillRule='nonzero'
							className='barmm-map-area'
							/* The shade goes through a variable rather than straight onto
							   `opacity`, so hover can take it back to full. An inline
							   opacity would have won against any rule trying to. */
							style={{ '--area-shade': shades.get(area.slug) ?? FAINTEST } as React.CSSProperties}
						>
							{/* Names the shape under the cursor. The figures are in the
							    list below and are not repeated into a tooltip nobody can
							    reach from a keyboard. */}
							<title>{area.name}</title>
						</path>
					))}
				</svg>
			</div>

			{/* The figures. A description list rather than a table: each area is one
			    thing with four facts about it, which is what a table of four columns
			    would have been pretending was a comparison across rows. */}
			<dl className='mt-10 grid border-t border-[var(--rule)] sm:grid-cols-2'>
				{rows.map(({ province, shape }, index) => (
					<div
						key={province.slug}
						className='flex gap-4 border-b border-[var(--rule)] py-5 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(odd)]:pr-8 sm:[&:nth-child(even)]:pl-8'
					>
						{/* The key back to the map. Square, as every mark on this estate
						    is, and carrying the area's own shade rather than a bullet. */}
						<span
							aria-hidden='true'
							className='mt-1.5 size-3 shrink-0 bg-[var(--accent)]'
							style={{ opacity: shadeOf(index) }}
						/>

						<div className='min-w-0'>
							<dt className='text-[15px] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
								{province.name}
								{shape ? null : (
									<span className='ml-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]'>
										not drawn
									</span>
								)}
							</dt>
							<dd className='num mt-1.5 text-[13px] leading-6 text-[var(--ink-2)]'>
								{figure(province.population)}
								<span className='text-[var(--ink-mute)]'> people</span>
								{' · '}
								{province.municipalities.length}
								<span className='text-[var(--ink-mute)]'>
									{province.kind === 'City' ? ' city' : ' towns'}
								</span>
								{' · '}
								{figure(province.barangayCount)}
								<span className='text-[var(--ink-mute)]'> barangays</span>
							</dd>
						</div>
					</div>
				))}
			</dl>

			<figcaption className='mt-8 bb-body text-[var(--ink-3)]'>
				{`Shaded by population, darkest first. ${lguData.totals.population.toLocaleString('en-PH')} people across ${lguData.totals.lgus} cities and municipalities and ${lguData.totals.barangays.toLocaleString('en-PH')} barangays. `}
				{missing.map((gap) => `${gap.name} is counted here and not drawn: ${gap.why.toLowerCase()} `)}
				{outside.map((area) => `${area.name} is drawn and not counted — the Supreme Court removed it from the region in 2024, and it is the grey the region closes around between Basilan and Tawi-Tawi. `)}
				{'Everything else in grey is the rest of Mindanao and its neighbours, for position only. '}
				{'Outlines are simplified: enough to recognize a province, not enough to settle where one ends. '}
				<a
					href={source.href}
					target='_blank'
					rel='noreferrer'
					className='underline decoration-[var(--rule)] underline-offset-4 transition hover:decoration-[var(--accent)]'
				>
					{source.label}
				</a>
				{'.'}
			</figcaption>
		</figure>
	)
}
