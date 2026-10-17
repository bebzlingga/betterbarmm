import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import outline from '../../../../datasets/accidents/barmm-outline.json'
import { accidents, typeOf } from '../_lib/accidents'

/* ============================================================
   The projects, for the front page

   The records of a different kind — each a page on this site rather
   than a workspace of its own — in the same grid as the workspaces,
   but each with a picture of what it holds: Incident Watch draws its
   own incidents, the others a sketch of the page.
   ============================================================ */

export type Project = {
	key: 'accidents' | 'directory' | 'crafts' | 'services'
	label: string
	href?: string
	measure: string
	blurb: string
	state: 'live' | 'soon'
}

// The thumbnail's box: the mainland and Basilan, where most incidents are, at the card's own proportions.
// Tawi-Tawi and the Turtle Islands fall outside it; the map itself has them.
const [W0, W1, S0, S1] = [121.55, 125.05, 6.3, 8.25]
const px = (lon: number, lat: number) => [((lon - W0) / (W1 - W0)) * 340, (1 - (lat - S0) / (S1 - S0)) * 190] as const

/** The region's land as one SVG path, worked out once on the server: the map's own outline, washed in the brand crimson. */
const REGION = (outline.features as { geometry: { type: string; coordinates: number[][][] | number[][][][] } }[])
	.flatMap((f) => (f.geometry.type === 'MultiPolygon' ? (f.geometry.coordinates as number[][][][]) : [f.geometry.coordinates as number[][][]]))
	.flatMap((poly) => poly)
	.map((ring) => 'M' + ring.map(([lon, lat]) => px(lon!, lat!).map((v) => v.toFixed(1)).join(' ')).join('L') + 'Z')
	.join('')

/** Every incident as a dot in its kind's colour on the region's outline. */
function IncidentDots() {
	return (
		<svg viewBox='0 0 340 190' className='h-full w-full overflow-hidden' aria-hidden='true'>
			<path d={REGION} fill='var(--accent)' fillOpacity='0.12' stroke='var(--accent)' strokeOpacity='0.45' strokeWidth='0.7' />
			{accidents.map((a) => (
				<circle
					key={a.id}
					cx={px(a.lon, a.lat)[0]}
					cy={px(a.lon, a.lat)[1]}
					r={a.deaths && a.deaths > 2 ? 3.6 : 2.6}
					fill={typeOf(a.type).color}
					fillOpacity={0.85}
				/>
			))}
		</svg>
	)
}

/** A contact card: a portrait circle, a name, and the lines a directory entry carries. */
function ContactCard() {
	return (
		<svg viewBox='0 0 340 190' className='h-full w-full' aria-hidden='true'>
			<rect x='70' y='34' width='200' height='122' rx='6' fill='var(--paper)' stroke='var(--rule)' />
			<circle cx='104' cy='72' r='18' fill='var(--accent)' fillOpacity='0.18' />
			<circle cx='104' cy='67' r='7' fill='var(--accent)' fillOpacity='0.7' />
			<path d='M92 84 a12 9 0 0 1 24 0' fill='var(--accent)' fillOpacity='0.7' />
			<rect x='132' y='60' width='96' height='9' rx='2' fill='var(--ink)' fillOpacity='0.75' />
			<rect x='132' y='76' width='64' height='6' rx='2' fill='var(--ink-3)' fillOpacity='0.6' />
			{[106, 122, 138].map((y, i) => (
				<g key={y}>
					<circle cx='92' cy={y} r='4' fill='var(--brass)' fillOpacity='0.8' />
					<rect x='104' y={y - 3} width={[110, 132, 88][i]} height='6' rx='2' fill='var(--ink-3)' fillOpacity='0.45' />
				</g>
			))}
		</svg>
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

/** A woven band: rows of nested diamonds, the motif Yakan and Sama weavers share. */
function Weave() {
	return (
		<svg viewBox='0 0 340 190' className='h-full w-full' aria-hidden='true'>
			<rect x='40' y='40' width='260' height='110' rx='3' fill='#7b4a35' />
			{[58, 132].map((y) => (
				<rect key={y} x='40' y={y} width='260' height='4' fill='#c89b4a' />
			))}
			{Array.from({ length: 7 }, (_, i) => 66 + i * 35).map((x) =>
				[22, 14, 6].map((r, j) => <path key={`${x}-${r}`} d={`M${x} ${95 - r} l${r * 0.9} ${r} l${-r * 0.9} ${r} l${-r * 0.9} ${-r} z`} fill={['#e7c9a9', '#b23a2e', '#f4efe8'][j]} />),
			)}
		</svg>
	)
}

const PICTURE = { accidents: IncidentDots, directory: ContactCard, crafts: Weave, services: Checklist } as const

export function ProjectList({ projects }: { projects: Project[] }) {
	return (
		// Each card draws its own hairline (overlapping its neighbour's by a pixel), so a row the projects do not
		// fill shows the page, not a grey block.
		<ul className='grid sm:grid-cols-2 lg:grid-cols-3'>
			{projects.map((p) => {
				const Picture = PICTURE[p.key]
				const body = (
					<>
						<span className='block h-40 border-b border-[var(--rule-soft)] bg-[var(--paper-2)] px-6 py-4'>
							<Picture />
						</span>
						<span className='block p-6'>
							<span className='flex items-baseline justify-between gap-3'>
								<span className={`text-[16px] font-extrabold tracking-[-0.02em] ${p.href ? 'group-hover:text-[var(--accent)]' : 'text-[var(--ink-3)]'}`}>{p.label}</span>
								{p.href ? (
									<ArrowUpRightIcon className='size-3.5 shrink-0 text-[var(--ink-3)] transition duration-200 group-hover:text-[var(--accent)]' aria-hidden='true' />
								) : (
									<span className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>Coming</span>
								)}
							</span>
							<span className='block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>{p.measure}</span>
							<span className='mt-1.5 line-clamp-2 text-[13.5px] leading-[1.55] text-[var(--ink-2)]'>{p.blurb}</span>
						</span>
					</>
				)
				return (
					<li key={p.key} className='-mt-px -ml-px border border-[var(--rule)] bg-[var(--paper)]'>
						{p.href ? (
							<Link href={p.href} className='group block h-full transition duration-200 hover:bg-[var(--paper-2)]'>
								{body}
							</Link>
						) : (
							<div className='h-full opacity-80'>{body}</div>
						)}
					</li>
				)
			})}
		</ul>
	)
}
