import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import outline from '../../../../datasets/accidents/barmm-outline.json'
import { ACCIDENT_TYPES, accidents, typeOf } from '../_lib/accidents'
import { barangays, CLASS_COLORS, HAZARDS, officialBarangays, region } from '../_lib/preparedness'
import { commonsThumb, craft, creditOf } from '../_lib/crafts'
import { place } from '../_lib/places'
import { PhotoCredit } from './discover-figure'

/* ============================================================
   The projects, for the front page

   The records of a different kind — each a page on this site rather
   than a workspace of its own — in the same grid as the workspaces,
   but each with a picture of what it holds: Incident Watch draws its
   own incidents, Preparedness every barangay in its flood hazard, the
   others a photograph or a sketch of the page.
   ============================================================ */

export type Project = {
	key: 'accidents' | 'preparedness' | 'crafts' | 'places' | 'services'
	label: string
	href?: string
	measure: string
	blurb: string
	state: 'live' | 'soon'
}

// The map's box: Basilan to the mainland's eastern towns, where nearly every incident is. Tawi-Tawi and the
// Turtle Islands fall outside it; the map itself has them. The region is taller than the card is, so the map
// takes the right of the panel at its own shape and the left carries the count and the kinds.
const [W0, W1, S0, S1] = [121.85, 125.05, 6.3, 8.3]
const VW = (W1 - W0) * 100
const VH = (S1 - S0) * 100
const px = (lon: number, lat: number) => [(lon - W0) * 100, (S1 - lat) * 100] as const

/** The region's land as one SVG path, worked out once on the server from the map's own outline. */
const REGION = (outline.features as { geometry: { type: string; coordinates: number[][][] | number[][][][] } }[])
	.flatMap((f) => (f.geometry.type === 'MultiPolygon' ? (f.geometry.coordinates as number[][][][]) : [f.geometry.coordinates as number[][][]]))
	.flatMap((poly) => poly)
	.map((ring) => 'M' + ring.map(([lon, lat]) => px(lon!, lat!).map((v) => v.toFixed(1)).join(' ')).join('L') + 'Z')
	.join('')

const INSIDE = accidents.filter((a) => a.lon >= W0 && a.lon <= W1 && a.lat >= S0 && a.lat <= S1)
const KINDS = ACCIDENT_TYPES.map((t) => ({ ...t, n: accidents.filter((a) => a.type === t.id).length }))
	.filter((t) => t.n)
	.sort((a, b) => b.n - a.n)
	.slice(0, 4)

/** The region on the page's own light ground, every incident a soft dot in its kind's colour; beside it, the count and the main kinds. */
function IncidentDots() {
	return (
		<span className='flex h-full w-full items-stretch bg-[var(--paper-2)] text-[var(--ink-2)]'>
			<span className='flex w-[42%] shrink-0 flex-col justify-center gap-2 pl-6'>
				<span className='font-[family-name:var(--font-display)] text-[1.875rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'>{accidents.length.toLocaleString('en-PH')}</span>
				<span className='font-mono text-[0.59375rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>incidents mapped</span>
				<span className='mt-1 grid gap-1'>
					{KINDS.map((t) => (
						<span key={t.id} className='flex items-center gap-1.5 text-[0.6875rem] leading-none'>
							<span className='size-1.5 shrink-0 rounded-full' style={{ background: t.color }} />
							<span className='truncate'>{t.label}</span>
							<span className='tabular-nums text-[var(--ink-3)]'>{t.n}</span>
						</span>
					))}
				</span>
			</span>
			<svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio='xMidYMid meet' className='h-full min-w-0 flex-1 py-3 pr-3' aria-hidden='true'>
				<defs>
					<filter id='iw-glow' x='-50%' y='-50%' width='200%' height='200%'>
						<feGaussianBlur stdDeviation='3.2' />
					</filter>
				</defs>
				<path d={REGION} fill='var(--accent)' fillOpacity='0.1' stroke='var(--accent)' strokeOpacity='0.4' strokeWidth='0.8' />
				<g filter='url(#iw-glow)' opacity='0.45'>
					{INSIDE.map((a) => (
						<circle key={a.id} cx={px(a.lon, a.lat)[0]} cy={px(a.lon, a.lat)[1]} r={a.deaths && a.deaths > 2 ? 6.5 : 4.8} fill={typeOf(a.type).color} />
					))}
				</g>
				{INSIDE.map((a) => (
					<circle key={a.id} cx={px(a.lon, a.lat)[0]} cy={px(a.lon, a.lat)[1]} r={a.deaths && a.deaths > 2 ? 2.6 : 1.9} fill={typeOf(a.type).color} />
				))}
			</svg>
		</span>
	)
}

// Every barangay at a point inside it, in the same box as Incident Watch, coloured by its land in medium or high flood hazard.
const BGY = barangays.filter(({ at: [lon, lat] }) => lon >= W0 && lon <= W1 && lat >= S0 && lat <= S1)
function floodColor(b: (typeof barangays)[number]) {
	const s = b.area ? (b.flood[1] + b.flood[2]) / b.area : 0
	return s >= 0.5 ? CLASS_COLORS[2] : s >= 0.3 ? CLASS_COLORS[1] : s >= 0.1 ? CLASS_COLORS[0] : null
}

/** The region's barangays, the flood-prone ones lit in NOAH's colours; beside them, the barangays in high hazard for each of the three. */
function HazardDots() {
	return (
		<span className='flex h-full w-full items-stretch bg-[var(--paper-2)] text-[var(--ink-2)]'>
			<span className='flex w-[42%] shrink-0 flex-col justify-center gap-2 pl-6'>
				<span className='font-[family-name:var(--font-display)] text-[1.875rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'>{officialBarangays.toLocaleString('en-PH')}</span>
				<span className='font-mono text-[0.59375rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>barangays mapped</span>
				<span className='mt-1 grid gap-1'>
					<span className='text-[0.65625rem] font-semibold text-[var(--ink-3)]'>In high hazard</span>
					{HAZARDS.map((h) => (
						<span key={h.id} className='flex items-center gap-1.5 text-[0.6875rem] leading-none'>
							<span className='size-1.5 shrink-0 rounded-full' style={{ background: CLASS_COLORS[2] }} />
							<span className='truncate'>{h.label}</span>
							<span className='tabular-nums text-[var(--ink-3)]'>{region.highBarangays[h.id]}</span>
						</span>
					))}
				</span>
			</span>
			<svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio='xMidYMid meet' className='h-full min-w-0 flex-1 py-3 pr-3' aria-hidden='true'>
				<path d={REGION} fill='var(--accent)' fillOpacity='0.06' stroke='var(--accent)' strokeOpacity='0.3' strokeWidth='0.8' />
				{BGY.map((b) => {
					const c = floodColor(b)
					const [x, y] = px(b.at[0], b.at[1])
					return <circle key={b.psgc} cx={x} cy={y} r={c ? 1.7 : 1.1} fill={c ?? 'var(--ink-3)'} fillOpacity={c ? 0.95 : 0.22} />
				})}
			</svg>
		</span>
	)
}

/** A charter's page: a document with its checklist of what to bring. */
function Checklist() {
	return (
		<svg viewBox='0 0 340 190' className='h-full w-full' aria-hidden='true'>
			<path d='M118 26 h84 l20 20 v118 h-104 z' fill='var(--paper)' stroke='var(--rule)' />
			<path d='M202 26 v20 h20' fill='none' stroke='var(--rule)' />
			<rect x='134' y='52' width='60' height='8' rx='2' fill='var(--ink)' fillOpacity='0.6' />
			{[78, 100, 122, 144].map((y, i) => (
				<g key={y}>
					<rect x='134' y={y - 6} width='12' height='12' rx='2' fill='none' stroke='var(--ink-3)' strokeOpacity='0.6' />
					{i < 3 ? <path d={`M136 ${y} l3 3 l6 -7`} fill='none' stroke='var(--accent)' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' /> : null}
					<rect x='154' y={y - 3} width={[52, 44, 56, 38][i]} height='6' rx='2' fill='var(--ink-3)' fillOpacity='0.45' />
				</g>
			))}
		</svg>
	)
}

// The Crafts card shows a craft itself: the wide photograph of Yakan cloth from a Basilan School of Living Tradition.
const CRAFT_PHOTO = craft('yakan-tennun')!.images.find((i) => i.width > i.height)!

/** A real piece, the photograph filling the panel; its credit is drawn by the card, outside the card's link. */
function CraftPhoto() {
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={commonsThumb(CRAFT_PHOTO.url, 960)} alt='' loading='lazy' className='h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]' />
	)
}

// The Places card shows a place itself: Panampangan's sandbar, off Sapa-Sapa.
const PLACE_PHOTO = (place('panampangan-island') ?? place('bud-bongao'))!.images[0]!

function PlacePhoto() {
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={commonsThumb(PLACE_PHOTO.url, 960)} alt='' loading='lazy' className='h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]' />
	)
}

const PICTURE = { accidents: IncidentDots, preparedness: HazardDots, crafts: CraftPhoto, places: PlacePhoto, services: Checklist } as const

export function ProjectList({ projects }: { projects: Project[] }) {
	return (
		// Separate cards with room between them, each with its own hairline.
		<ul className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
			{projects.map((p) => {
				const Picture = PICTURE[p.key]
				const body = (
					<>
						{/* The picture fills its panel edge to edge; the sketches that do not are inset. */}
						<span className={`block h-40 overflow-hidden border-b border-[var(--rule-soft)] bg-[var(--paper-2)] ${p.key === 'accidents' || p.key === 'preparedness' || p.key === 'crafts' || p.key === 'places' ? '' : 'px-6 py-4'}`}>
							<Picture />
						</span>
						<span className='block p-6'>
							<span className='flex items-baseline justify-between gap-3'>
								<span className={`text-[1rem] font-extrabold tracking-[-0.02em] ${p.href ? 'group-hover:text-[var(--accent)]' : 'text-[var(--ink-3)]'}`}>{p.label}</span>
								{p.href ? (
									<ArrowUpRightIcon className='size-3.5 shrink-0 text-[var(--ink-3)] transition duration-200 group-hover:text-[var(--accent)]' aria-hidden='true' />
								) : (
									<span className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>Coming</span>
								)}
							</span>
							<span className='block font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>{p.measure}</span>
							<span className='mt-1.5 line-clamp-2 text-[0.84375rem] leading-[1.55] text-[var(--ink-2)]'>{p.blurb}</span>
						</span>
					</>
				)
				return (
					<li key={p.key} className='bb-frame relative overflow-hidden border border-[var(--rule)] bg-[var(--paper)]!'>
						{p.href ? (
							<Link href={p.href} className='group block h-full transition duration-200 hover:bg-[var(--paper-2)]'>
								{body}
							</Link>
						) : (
							<div className='h-full opacity-80'>{body}</div>
						)}
						{p.key === 'crafts' || p.key === 'places' ? (
							<span className='pointer-events-none absolute inset-x-0 top-0 h-40 [&>a]:pointer-events-auto'>
								<PhotoCredit photo={creditOf(p.key === 'crafts' ? CRAFT_PHOTO : PLACE_PHOTO)} />
							</span>
						) : null}
					</li>
				)
			})}
		</ul>
	)
}
