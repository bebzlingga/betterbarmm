import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import { Counter, LineReveal, Rise, Stagger, StaggerItem } from '@betterbarmm/editorial'
import { bangsamoroParliament } from '@betterbarmm/primer-data'
import { barmmBoundaries, lguCounts, lguData, lguProvinces } from '@betterbarmm/lgu-data'

/* ============================================================
   What is being governed

   The dark band on the front page: the region's 7 areas on the map
   and in a list beside it, then the 4 figures for the whole. The
   map and the list are one picture — hovering an area in the list
   lights it on the map, through `:has()`, with no script.

   The map is the same drawing as barmm-map.tsx (PSA's outlines,
   one hue stepped by population, the rest of Mindanao in grey for
   position) without its figures, which the list carries here.
   Sulu is drawn and not counted; the Special Geographic Area is
   counted and not drawn. The caption says both.
   ============================================================ */

const LGU = 'https://lgu.betterbarmm.com'
const FAINTEST = 0.5
const DEPTH = 9

/** The part of the boundary frame the region sits in: x, y, width, height. */
const FRAME = [40, 30, 940, 520] as const

/** Where each label sits, in the frame's units: `at` is a point on the area, `text` where its name goes.
    Placed by eye in open sea. The Special Geographic Area has no shape, so no label; the tiles carry it. */
const LABELS: { slug: string; at: [number, number]; text: [number, number]; align: 'start' | 'end' | 'middle' }[] = [
	{ slug: 'lanao-del-sur', at: [880, 72], text: [740, 80], align: 'end' },
	{ slug: 'maguindanao-del-norte', at: [835, 215], text: [740, 250], align: 'end' },
	{ slug: 'cotabato-city', at: [848, 180], text: [740, 175], align: 'end' },
	{ slug: 'maguindanao-del-sur', at: [905, 235], text: [800, 320], align: 'end' },
	{ slug: 'basilan', at: [535, 270], text: [535, 340], align: 'middle' },
	{ slug: 'tawi-tawi', at: [255, 475], text: [360, 500], align: 'start' },
]

export function RegionBand({ index = '03' }: { index?: string }) {
	const { areas, outside, land, missing } = barmmBoundaries
	const rows = [...lguProvinces].sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
	const most = rows[0]?.population ?? 1
	const shade = new Map(rows.map((p, i) => [p.slug, 1 - (i / Math.max(1, rows.length - 1)) * (1 - FAINTEST)] as const))

	// One rule per area: hovering its row lights its shape. Slugs are the directory's own, so safe in a selector.
	const linkCss = rows
		.map((p) => `.region-band:has([data-row="${p.slug}"]:hover,[data-row="${p.slug}"]:focus-visible) .barmm-map-area[data-area="${p.slug}"]{fill:var(--ink);opacity:1}`)
		.join('')

	const stats = [
		{
			value: bangsamoroParliament.totalSeats,
			label: 'Seats in Parliament',
			note: `${bangsamoroParliament.partyRepresentativeSeats} by party, ${bangsamoroParliament.districtSeats} by district, ${bangsamoroParliament.reservedSeats} reserved.`,
		},
		{ value: lguData.totals.lgus, label: 'Cities and towns', note: 'Across the 7 areas, each with its own mayor and council.' },
		{
			value: lguData.totals.barangays,
			label: 'Barangays',
			group: true,
			note: 'The level of government nearest the household, and the one most often elected.',
		},
		{
			// Millions to two places: at display size 7 digits read as commas, not a quantity.
			value: lguData.totals.population / 1e6,
			decimals: 2,
			suffix: ' M',
			label: 'People',
			note: `At the ${lguCounts.populationAsOf} census, without Sulu, which the Supreme Court removed from the region. PSA counts it: ${lguCounts.population}.`,
		},
	]

	return (
		<section className='region-band bb-ground bb-grain bb-lattice relative isolate overflow-hidden border-y border-[var(--rule)]'>
			<style>{linkCss}</style>
			<div className='bb-container relative z-2 py-[clamp(5rem,9vw,8.5rem)]'>
				<Rise distance={14}>
					<div className='bb-kicker'>
						<span>{index}</span>
						<span>What is being governed</span>
					</div>
				</Rise>

				<div className='mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16'>
					<LineReveal
						as='h2'
						lines={['One region.', 'Five provinces, a city, and a special area.']}
						className='bb-display-md text-[var(--ink)]'
						lineClassName={[undefined, 'bb-mute']}
					/>
					<Rise delay={0.2} distance={14}>
						<p className='max-w-md bb-body text-[var(--ink-2)] lg:text-right'>
							BARMM is the only autonomous region in the Philippines with its own parliament. On{' '}
							{bangsamoroParliament.electionDay} its voters elect all {bangsamoroParliament.totalSeats} members for the
							first time.
						</p>
					</Rise>
				</div>

				{/* ---- The map, labelled, and the areas under it ---- */}
				<Rise distance={18}>
					<figure className='m-0 mt-14 lg:mt-20'>
						<div
							role='img'
							aria-label={`The ${rows.length} areas of the region, shaded by population.`}
							className='relative'
						>
							<svg viewBox={FRAME.join(' ')} className='h-auto w-full' aria-hidden='true'>
								{/* The grey land is clipped by the frame, and on the dark band that cut reads as a
								    box, so the land alone fades out toward the edges. The region's areas do not. */}
								<defs>
									<radialGradient id='rb-fade'>
										<stop offset='0.62' stopColor='#fff' />
										<stop offset='1' stopColor='#000' />
									</radialGradient>
									<mask id='rb-land'>
										<rect x={FRAME[0]} y={FRAME[1]} width={FRAME[2]} height={FRAME[3]} fill='url(#rb-fade)' />
									</mask>
								</defs>
								<g mask='url(#rb-land)'>
									<path d={land} className='barmm-map-land-side' transform={`translate(0 ${DEPTH})`} />
									{outside.map((a) => (
										<path key={`${a.slug}-s`} d={a.d} className='barmm-map-land-side' transform={`translate(0 ${DEPTH})`} />
									))}
									<path d={land} className='barmm-map-land' />
									{outside.map((a) => (
										<path key={a.slug} d={a.d} className='barmm-map-land' />
									))}
								</g>
								{areas.map((a) => (
									<path key={`${a.slug}-s`} d={a.d} className='barmm-map-side' transform={`translate(0 ${DEPTH})`} />
								))}
								{areas.map((a) => (
									<path
										key={a.slug}
										d={a.d}
										data-area={a.slug}
										className='barmm-map-area'
										style={{ '--area-shade': shade.get(a.slug) ?? FAINTEST } as React.CSSProperties}
									>
										<title>{a.name}</title>
									</path>
								))}
								{/* Leaders from each label to its area. */}
								{LABELS.map((l) => (
									<g key={l.slug} className='hidden sm:inline'>
										<line x1={l.at[0]} y1={l.at[1]} x2={l.text[0]} y2={l.text[1]} stroke='var(--ink-mute)' strokeWidth='0.8' />
										<circle cx={l.at[0]} cy={l.at[1]} r='2.6' fill='var(--ink)' />
									</g>
								))}
							</svg>

							{/* The labels are HTML over the drawing, placed in the frame's own units, so they stay
							    crisp and sized like text at every width. */}
							{LABELS.map((l) => {
								const p = rows.find((r) => r.slug === l.slug)
								if (!p) return null
								return (
									<div
										key={l.slug}
										aria-hidden='true'
										className={`pointer-events-none absolute hidden -translate-y-1/2 sm:block ${
											l.align === 'end' ? '-translate-x-full pr-2 text-right' : l.align === 'middle' ? '-translate-x-1/2 text-center' : 'pl-2'
										}`}
										style={{
											left: `${((l.text[0] - FRAME[0]) / FRAME[2]) * 100}%`,
											top: `${((l.text[1] - FRAME[1]) / FRAME[3]) * 100}%`,
										}}
									>
										<p className='whitespace-nowrap text-[0.8125rem] font-extrabold tracking-[-0.01em] text-[var(--ink)]'>{p.name}</p>
										<p className='num whitespace-nowrap text-[0.75rem] text-[var(--ink-3)]'>{p.population?.toLocaleString('en-PH')}</p>
									</div>
								)
							})}
						</div>
						<figcaption className='mt-4 text-[0.75rem] leading-5 text-[var(--ink-mute)]'>
							Shaded by population.{' '}
							{missing.map((m) => `${m.name} is counted but not drawn: its barangays were ratified after these outlines. `)}
							{outside.map((a) => `${a.name}, in grey, is no longer part of the region. `)}
							Outlines: PSA, simplified.
						</figcaption>
					</figure>
				</Rise>

				<Stagger gap={0.06}>
					<ol className='mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[2px] border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-4 xl:grid-cols-7'>
						{/* 7 tiles: the largest takes 2 columns below xl, so 2- and 4-column grids fill evenly. */}
						{rows.map((p, i) => (
							<StaggerItem key={p.slug} as='li' className={`bg-[var(--paper)] ${i === 0 ? 'col-span-2 xl:col-span-1' : ''}`}>
								<a
									href={`${LGU}/${p.slug}`}
									data-row={p.slug}
									className='group flex h-full flex-col gap-3 p-4 outline-none transition hover:bg-[var(--paper-2)] focus-visible:bg-[var(--paper-2)]'
								>
									<span className='flex items-start justify-between gap-2'>
										<span
											aria-hidden='true'
											className='mt-1 size-2.5 shrink-0 bg-[var(--accent)] transition group-hover:bg-[var(--ink)]'
											style={{ opacity: shade.get(p.slug) }}
										/>
										<ArrowUpRightIcon
											className='size-3.5 text-[var(--ink-mute)] transition group-hover:text-[var(--accent)]'
											weight='bold'
											aria-hidden='true'
										/>
									</span>
									<span className='text-[0.875rem] font-extrabold leading-tight tracking-[-0.015em] text-[var(--ink)]'>{p.name}</span>
									<span className='mt-auto'>
										<span className='num block text-[1.125rem] font-bold text-[var(--ink)]'>
											{p.population?.toLocaleString('en-PH') ?? '—'}
										</span>
										<span className='relative mt-2 block h-1 overflow-hidden rounded-full bg-[var(--rule-soft)]'>
											<span
												className='absolute inset-y-0 left-0 rounded-full bg-[var(--accent)] transition group-hover:bg-[var(--ink)]'
												style={{ width: `${((p.population ?? 0) / most) * 100}%` }}
											/>
										</span>
										<span className='num mt-2 block text-[0.6875rem] text-[var(--ink-3)]'>
											{p.municipalities.length} {p.kind === 'City' ? 'city' : 'towns'} · {p.barangayCount.toLocaleString('en-PH')} brgys
										</span>
									</span>
								</a>
							</StaggerItem>
						))}
					</ol>
				</Stagger>

				{/* ---- The whole, in four figures ---- */}
				<Stagger
					gap={0.09}
					className='mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-[var(--brass-line)] pt-10 sm:gap-x-10 lg:mt-20 lg:grid-cols-4'
				>
					{stats.map((stat) => (
						<StaggerItem key={stat.label}>
							<p className='bb-figure-sm text-[var(--ink)]'>
								<Counter value={stat.value} group={stat.group ?? false} decimals={stat.decimals ?? 0} suffix={stat.suffix ?? ''} />
							</p>
							<p className='mt-3 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[var(--brass)]'>
								{stat.label}
							</p>
							<p className='mt-2 text-[0.8125rem] leading-[var(--leading-body)] text-[var(--ink-2)]'>{stat.note}</p>
						</StaggerItem>
					))}
				</Stagger>
			</div>
		</section>
	)
}
