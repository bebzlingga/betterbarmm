import type { Metadata } from 'next'
import { MapTrifoldIcon, WarningCircleIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { GetInvolved } from '../_components/get-involved'
import { PreparednessMap, type FacilityKind } from '../_components/preparedness-map'
import { SiteHeader } from '../_components/site-header'
import { CLASS_COLORS, HAZARDS, officialBarangays, PROVINCE_NAMES, preparednessMeta, provinces, region, share, towns, type AreaSummary, type HazardId } from '../_lib/preparedness'
import { facilityKinds, facilitySources } from '../_lib/preparedness-facilities'
import { pageMeta } from '../_lib/seo'

export const metadata: Metadata = pageMeta({
	title: 'Disaster risk and preparedness',
	description:
		'Flood, landslide and storm surge hazard across the Bangsamoro, barangay by barangay, from Project NOAH, with the evacuation centres, hospitals and other facilities nearest each place, every point linked to its source.',
	path: '/preparedness',
})

const pct = (x: number) => (x >= 0.995 ? '100%' : x > 0 && x < 0.005 ? '<1%' : `${Math.round(x * 100)}%`)
const km2 = (x: number) => `${x >= 100 ? Math.round(x).toLocaleString('en-PH') : x.toFixed(1)} km²`

/** Each hazard drawn, in NOAH's own three colours over the ink of the page: a house in rising water,
 *  a slope giving way above a house, and a surge breaking over a stilt house on the shore. */
function HazardArt({ hazard }: { hazard: HazardId }) {
	const [low, med, high] = CLASS_COLORS
	const ink = 'var(--ink-2)'
	const house = (x: number, y: number, s = 1) => (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			<path d='M-34 0 L0 -30 L34 0 Z' fill={ink} />
			<rect x='-27' y='-1' width='54' height='44' fill='var(--paper)' stroke={ink} strokeWidth='3' />
			<rect x='-8' y='17' width='16' height='26' fill={ink} />
			<rect x='-21' y='8' width='9' height='9' fill={ink} opacity='0.55' />
			<rect x='12' y='8' width='9' height='9' fill={ink} opacity='0.55' />
		</g>
	)
	return (
		<svg viewBox='0 0 360 160' className='block h-auto w-full' role='img' aria-hidden='true'>
			{hazard === 'flood' ? (
				<>
					{[24, 58, 92, 262, 296, 330].map((x, i) => (
						<line key={x} x1={x} y1={22 + (i % 2) * 12} x2={x - 8} y2={44 + (i % 2) * 12} stroke={ink} strokeWidth='2.5' strokeLinecap='round' opacity='0.35' />
					))}
					{house(180, 92)}
					{/* the water, at three depths */}
					<path d='M0 108 Q30 100 60 108 T120 108 T180 108 T240 108 T300 108 T360 108 V160 H0 Z' fill={low} opacity='0.9' />
					<path d='M0 120 Q30 112 60 120 T120 120 T180 120 T240 120 T300 120 T360 120 V160 H0 Z' fill={med} opacity='0.92' />
					<path d='M0 136 Q30 129 60 136 T120 136 T180 136 T240 136 T300 136 T360 136 V160 H0 Z' fill={high} />
					<g stroke={ink} strokeWidth='2' opacity='0.6'>
						<line x1='318' y1='70' x2='318' y2='150' />
						{[78, 94, 110, 126, 142].map((y) => (
							<line key={y} x1='312' y1={y} x2='324' y2={y} />
						))}
					</g>
				</>
			) : hazard === 'landslide' ? (
				<>
					<path d='M0 160 V44 Q60 30 110 46 L250 160 Z' fill={ink} opacity='0.16' />
					{/* the mass giving way, down the slope */}
					<path d='M70 46 Q104 54 120 70 L205 140 Q170 150 132 142 Q118 112 90 92 Q74 70 70 46 Z' fill={med} opacity='0.95' />
					<path d='M92 74 Q112 86 128 104 L180 146 Q156 152 136 146 Q124 120 104 100 Z' fill={high} />
					{[
						[150, 126, 9],
						[176, 138, 7],
						[124, 108, 6],
						[198, 146, 5],
					].map(([cx, cy, r]) => (
						<circle key={cx} cx={cx} cy={cy} r={r} fill={ink} />
					))}
					<path d='M58 30 l-8 12 l10 4 l-6 12' fill='none' stroke={ink} strokeWidth='2.5' strokeLinejoin='round' opacity='0.6' />
					<g stroke={low} strokeWidth='4' strokeLinecap='round'>
						<line x1='214' y1='96' x2='232' y2='114' />
						<line x1='226' y1='84' x2='244' y2='102' />
					</g>
					{house(292, 117)}
					<line x1='0' y1='160' x2='360' y2='160' stroke={ink} strokeWidth='3' />
				</>
			) : (
				<>
					{/* the shore and a house on stilts */}
					<path d='M200 160 L232 112 H360 V160 Z' fill={ink} opacity='0.16' />
					<g stroke={ink} strokeWidth='3'>
						<line x1='278' y1='112' x2='278' y2='86' />
						<line x1='318' y1='112' x2='318' y2='86' />
					</g>
					{house(298, 54, 0.85)}
					{/* the surge, curling in from the sea */}
					<path d='M0 160 V112 Q40 96 82 104 Q132 60 182 70 Q214 76 214 100 Q200 88 186 96 Q174 106 196 118 Q226 132 262 124 L290 160 Z' fill={med} opacity='0.95' />
					<path d='M0 160 V128 Q50 116 100 126 Q150 136 200 128 Q240 122 270 136 L286 160 Z' fill={high} />
					<path d='M0 122 Q30 110 64 116' fill='none' stroke={low} strokeWidth='4' strokeLinecap='round' />
					<g stroke={ink} strokeWidth='2.5' strokeLinecap='round' opacity='0.35'>
						<path d='M24 40 Q60 30 96 40' fill='none' />
						<path d='M44 60 Q86 48 128 58' fill='none' />
						<path d='M16 78 Q44 70 72 76' fill='none' />
					</g>
				</>
			)}
		</svg>
	)
}

/** A row's hazard as a bar: low, medium and high as a share of its land. */
function Bar({ a, h }: { a: AreaSummary; h: HazardId }) {
	return (
		<span className='flex h-2 w-full overflow-hidden bg-[var(--paper-2)]' aria-hidden='true'>
			{[0, 1, 2].map((c) => (
				<span key={c} style={{ width: `${Math.min(100, share(a, h, c as 0 | 1 | 2) * 100)}%`, background: CLASS_COLORS[c] }} />
			))}
		</span>
	)
}

function Ranking({ h }: { h: (typeof HAZARDS)[number] }) {
	const rows = [...towns]
		.map((t) => ({ t, high: share(t, h.id, 2), med: share(t, h.id, 1) }))
		.filter((r) => r.high + r.med > 0)
		.sort((a, b) => b.high + b.med - (a.high + a.med))
		.slice(0, 12)
	return (
		<div>
			<h3 className='text-[1.125rem] font-extrabold'>{h.label}</h3>
			<p className='mt-1 text-[0.78125rem] text-[var(--ink-3)]'>Towns with the most land in medium or high {h.label.toLowerCase()} hazard, from {h.scenario}.</p>
			<ol className='mt-4 divide-y divide-[var(--rule-soft)] border-y border-[var(--rule)]'>
				{rows.map(({ t, high, med }, i) => (
					<li key={t.key} className='grid grid-cols-[1.5rem_minmax(0,1fr)_4.5rem] items-center gap-x-3 py-2.5 text-[0.84375rem]'>
						<span className='tabular-nums text-[var(--ink-mute)]'>{i + 1}</span>
						<span className='min-w-0'>
							{t.href ? (
								<Link href={t.href} className='font-semibold hover:text-[var(--accent)]'>
									{t.name}
								</Link>
							) : (
								<span className='font-semibold'>{t.name}</span>
							)}
							<span className='text-[0.75rem] text-[var(--ink-3)]'> · {PROVINCE_NAMES[t.prov]}</span>
							<span className='mt-1 block'>
								<Bar a={t} h={h.id} />
							</span>
						</span>
						<span className='text-right tabular-nums'>
							<span className='font-semibold'>{pct(high + med)}</span>
							<span className='block text-[0.6875rem] text-[var(--ink-3)]'>{pct(high)} high</span>
						</span>
					</li>
				))}
			</ol>
		</div>
	)
}

export default function PreparednessPage() {
	const kinds: FacilityKind[] = facilityKinds.map((k) => ({ ...k, on: k.defaultOn }))
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='preparedness' />

			{/* The band opens straight on the map's door, as Incident Watch's does. */}
			<section className='brand-bg bb-lattice relative overflow-hidden'>
				<div className='bb-container relative w-full py-14 md:py-20'>
					<div className='flex flex-wrap items-center justify-between gap-8'>
						<div className='max-w-[48rem]'>
							<p className='bb-label'>Interactive map</p>
							<h1 className='mt-2 text-[clamp(2.1rem,4.4vw,3.4rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-[var(--ink)]'>Know the hazard where you live, and where to go.</h1>
							<p className='mt-3 text-[0.96875rem] leading-[1.65] text-[var(--ink-2)]'>
								Flood, landslide and storm surge from{' '}
								<a href='https://noah.up.edu.ph/' target='_blank' rel='noreferrer' className='underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]'>
									Project NOAH
								</a>
								, as zones, as heat or barangay by barangay, with evacuation sites, hospitals and offices on top. Pick a place, or let the map find you.
							</p>
						</div>
						<a href='#map' className='bb-btn bb-btn-solid !px-5 !py-3 !text-[0.65625rem]'>
							<MapTrifoldIcon size={15} weight='bold' aria-hidden='true' />
							Open the map
						</a>
					</div>
				</div>
				<div className='bb-weave' aria-hidden='true' />
			</section>

			<PreparednessMap kinds={kinds} />

			<section className='bb-container bb-section'>
				<div className='flex flex-wrap items-end justify-between gap-x-10 gap-y-3'>
					<h2 className='text-[1.625rem] font-extrabold tracking-[-0.02em]'>Disaster risk and preparedness</h2>
					<p className='max-w-[34rem] text-[0.84375rem] leading-[1.6] text-[var(--ink-3)]'>
						Barangays with a tenth or more of their land in NOAH’s high class, of the region’s {officialBarangays.toLocaleString('en-PH')}, and the people who lived in them at the 2024 census.
					</p>
				</div>
				<dl className='mt-8 grid gap-5 md:grid-cols-3'>
					{HAZARDS.map((h) => {
						const n = region.highBarangays[h.id]
						const people = region.highPeople[h.id]
						return (
							<div key={h.id} className='flex flex-col border border-[var(--rule)] bg-[var(--paper)]'>
								<div className='relative overflow-hidden border-b border-[var(--rule)] bg-[var(--paper-2)]'>
									<HazardArt hazard={h.id} />
									<p className='absolute left-3 top-2.5 bg-[var(--paper-2)] px-1.5 py-0.5 bb-label'>{h.label}</p>
								</div>
								<div className='flex flex-1 flex-col p-5'>
									<dt className='text-[0.8125rem] leading-[1.5] text-[var(--ink-3)]'>Barangays with a tenth or more of their land in the high class</dt>
									<dd className='mt-2 flex items-baseline gap-2'>
										<span className='text-[2.75rem] font-extrabold leading-none tracking-[-0.03em] tabular-nums'>{n.toLocaleString('en-PH')}</span>
										<span className='text-[0.8125rem] text-[var(--ink-3)]'>of {officialBarangays.toLocaleString('en-PH')}</span>
									</dd>
									<dd className='mt-3'>
										<span className='flex h-2 overflow-hidden bg-[var(--paper-2)]' aria-hidden='true'>
											<span style={{ width: `${(n / officialBarangays) * 100}%`, background: CLASS_COLORS[2] }} />
										</span>
									</dd>
									<dd className='mt-auto pt-4 text-[0.8125rem] text-[var(--ink-2)]'>
										Home to <strong className='font-extrabold tabular-nums text-[var(--ink)]'>{people.toLocaleString('en-PH')}</strong> people in 2024, {pct(people / region.pop)} of the region
									</dd>
								</div>
							</div>
						)
					})}
				</dl>
				<div className='mt-6 flex gap-3 border-l-[3px] border-[var(--accent)] bg-[var(--paper-2)] px-5 py-4'>
					<WarningCircleIcon size={18} weight='bold' className='mt-0.5 shrink-0 text-[var(--accent)]' aria-hidden='true' />
					<p className='text-[0.8125rem] leading-[1.65] text-[var(--ink-2)]'>
						NOAH’s maps show what could happen in a severe event, not what has happened. They are drawn from elevation data and models, at a scale for planning: check a site that matters with your municipal disaster risk reduction and management office (MDRRMO) before you build or decide to stay. In an
						emergency, follow your barangay and MDRRMO.
					</p>
				</div>
			</section>

			<section className='bb-container pb-16'>
				<h2 className='text-[1.625rem] font-extrabold tracking-[-0.02em]'>By province</h2>
				<div className='mt-6 overflow-x-auto'>
					<table className='w-full min-w-[40rem] text-[0.84375rem]'>
						<thead>
							<tr className='border-b border-[var(--ink)] text-left text-[0.6875rem] uppercase tracking-[0.1em] text-[var(--ink-3)]'>
								<th className='py-2 pr-4 font-semibold'>Province</th>
								<th className='py-2 pr-4 font-semibold'>Barangays</th>
								{HAZARDS.map((h) => (
									<th key={h.id} className='py-2 pr-4 font-semibold'>
										{h.label}: medium or high
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{provinces.map((p) => (
								<tr key={p.key} className='border-b border-[var(--rule-soft)]'>
									<td className='py-3 pr-4 font-semibold'>
										<Link href={p.href!} className='hover:text-[var(--accent)]'>
											{p.name}
										</Link>
										<span className='block text-[0.71875rem] font-normal text-[var(--ink-3)]'>{km2(p.area)}</span>
									</td>
									<td className='py-3 pr-4 tabular-nums'>{p.barangays.toLocaleString('en-PH')}</td>
									{HAZARDS.map((h) => (
										<td key={h.id} className='py-3 pr-4'>
											{h.id === 'flood' && p.key === 'tawi-tawi' ? (
												<span className='text-[0.75rem] text-[var(--ink-3)]'>Not modelled</span>
											) : (
												<>
													<span className='tabular-nums'>{pct(share(p, h.id, 1) + share(p, h.id, 2))}</span>
													<span className='mt-1 block max-w-[10rem]'>
														<Bar a={p} h={h.id} />
													</span>
												</>
											)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<h2 className='mt-16 text-[1.625rem] font-extrabold tracking-[-0.02em]'>Towns most exposed</h2>
				<div className='mt-6 grid gap-12 lg:grid-cols-3 lg:gap-x-20 xl:gap-x-28'>
					{HAZARDS.map((h) => (
						<Ranking key={h.id} h={h} />
					))}
				</div>
			</section>

			<section className='bb-container pb-20'>
				<h2 className='text-[1.375rem] font-extrabold'>Sources and method</h2>
				<div className='mt-4 grid gap-8 text-[0.84375rem] leading-[1.7] text-[var(--ink-2)] lg:grid-cols-2'>
					<div className='space-y-3'>
						<p>
							<strong>Hazards.</strong> Project NOAH, University of the Philippines Resilience Institute: flood hazard for a 100-year rain return, landslide hazard (shallow, structurally controlled and debris flow), and storm surge hazard at Storm Surge Advisory 4, from{' '}
							<a href='https://noah.up.edu.ph/downloads' target='_blank' rel='noreferrer' className='underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]'>
								NOAH’s open data downloads
							</a>
							, under the Open Data Commons Open Database License (ODbL). The maps here are cut to the region and simplified for the screen; NOAH’s own site holds them at full detail.
						</p>
						<p>
							<strong>Exposure.</strong> Each barangay’s land in each hazard class is measured against PSA’s boundaries (2023 PSGC edition, through faeldon/philippines-json-maps), the way the Directory draws them. A barangay counts as highly exposed when a tenth or more of its land is in the high class. NOAH has no flood model for Tawi-Tawi, and storm surge reaches only the coasts. PSA counts 2,185 barangays in the region; the boundary file holds 2,182, so three Special Geographic Area barangays made or moved since have no hazard measure yet.
						</p>
						<p className='text-[0.78125rem] text-[var(--ink-3)]'>
							{preparednessMeta.note} Data built {preparednessMeta.generatedAt}; shared, as NOAH asks, under the same {preparednessMeta.licence}.
						</p>
					</div>
					<div className='space-y-3'>
						<p>
							<strong>Facilities.</strong> Each point links to the record it came from.
						</p>
						<ul className='space-y-2'>
							{facilitySources.map((s) => (
								<li key={s.label}>
									<a href={s.url} target='_blank' rel='noreferrer' className='font-semibold underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]'>
										{s.label}
									</a>
									<span className='text-[var(--ink-3)]'> · {s.note}</span>
								</li>
							))}
						</ul>
						<p className='text-[0.78125rem] text-[var(--ink-3)]'>
							Know of an evacuation centre that is missing, closed or misplaced?{' '}
							<a href='/report' className='underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]'>
								Tell us
							</a>
							.
						</p>
					</div>
				</div>
			</section>
			<GetInvolved />
		</main>
	)
}
