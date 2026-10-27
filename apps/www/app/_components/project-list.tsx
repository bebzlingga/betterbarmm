import { ArrowUpRightIcon, DropIcon, MountainsIcon, SirenIcon, WavesIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { accidents } from '../_lib/accidents'
import { HAZARDS, officialBarangays, region } from '../_lib/preparedness'
import { commonsThumb, craft, creditOf } from '../_lib/crafts'
import { PhotoCredit } from './discover-figure'

/* ============================================================
   The projects, for the front page

   The records of a different kind — each a page on this site rather
   than a workspace of its own — in the same grid as the workspaces,
   but each with a picture of what it holds on a ground of its own colour:
   Incident Watch its incidents year by year, Preparedness the barangays
   in each hazard's high class, the others a photograph or a sketch.
   ============================================================ */

export type Project = {
	key: 'accidents' | 'preparedness' | 'crafts' | 'data' | 'services'
	label: string
	href?: string
	measure: string
	blurb: string
	state: 'live' | 'soon'
}

// Incidents by the year they happened, 2019 to now. Early years are thinner partly because less was reported and indexed.
const YEARS = Array.from({ length: new Date().getFullYear() - 2018 }, (_, i) => 2019 + i).map((year) => ({
	year,
	n: accidents.filter((a) => a.date.startsWith(String(year))).length,
}))
const MOST = Math.max(...YEARS.map((y) => y.n))

/** On the brand crimson: the count, and a bar for each year's incidents, this year's lit. */
function IncidentYears() {
	const last = YEARS[YEARS.length - 1]!
	return (
		<span className='flex h-full w-full items-stretch gap-4 bg-[linear-gradient(135deg,#9b2a1c_0%,#8a2418_45%,#5e170f_100%)] px-6 py-5 text-white'>
			<span className='flex w-[38%] shrink-0 flex-col justify-center gap-1.5'>
				<SirenIcon size={20} weight='fill' className='text-[#f0c98a]' aria-hidden='true' />
				<span className='font-[family-name:var(--font-display)] text-[1.875rem] font-extrabold leading-none tracking-[-0.03em]'>{accidents.length.toLocaleString('en-PH')}</span>
				<span className='text-[0.75rem] font-semibold text-white/80'>Incidents Mapped</span>
			</span>
			<span className='flex min-w-0 flex-1 flex-col justify-end'>
				<span className='flex h-[5.5rem] items-end gap-1.5'>
					{YEARS.map((y) => (
						<span key={y.year} className='relative flex h-full flex-1 items-end' title={`${y.year}: ${y.n}`}>
							<span
								className={`w-full rounded-t-[2px] ${y === last ? 'bg-[#f0c98a]' : 'bg-white/35'}`}
								style={{ height: `${Math.max(6, (y.n / MOST) * 100)}%` }}
							/>
						</span>
					))}
				</span>
				<span className='mt-1.5 flex justify-between text-[0.625rem] font-semibold tabular-nums text-white/70'>
					<span>{YEARS[0]!.year}</span>
					<span className='text-[#f0c98a]'>
						{last.year}: {last.n}
					</span>
				</span>
			</span>
		</span>
	)
}

const HAZARD_ICON = { flood: DropIcon, landslide: MountainsIcon, surge: WavesIcon } as const

/** On a deep teal: each hazard, with the share of the region's barangays NOAH puts in its high class. */
function HazardBars() {
	return (
		<span className='flex h-full w-full items-stretch gap-4 bg-[linear-gradient(135deg,#136172_0%,#0f4c5c_50%,#0a3340_100%)] px-6 py-5 text-white'>
			<span className='flex w-[38%] shrink-0 flex-col justify-center gap-1.5'>
				<span className='font-[family-name:var(--font-display)] text-[1.875rem] font-extrabold leading-none tracking-[-0.03em]'>{officialBarangays.toLocaleString('en-PH')}</span>
				<span className='text-[0.75rem] font-semibold text-white/80'>Barangays Mapped</span>
				<span className='text-[0.6875rem] text-white/65'>In High Hazard</span>
			</span>
			<span className='flex min-w-0 flex-1 flex-col justify-center gap-2.5'>
				{HAZARDS.map((h) => {
					const Icon = HAZARD_ICON[h.id]
					const n = region.highBarangays[h.id]
					return (
						<span key={h.id} className='grid grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-2'>
							<Icon size={15} weight='fill' className='text-[#9fe0e8]' aria-hidden='true' />
							<span className='min-w-0'>
								<span className='block truncate text-[0.6875rem] font-semibold capitalize leading-tight'>{h.label}</span>
								<span className='mt-1 block h-1.5 rounded-full bg-white/15'>
									<span className='block h-full rounded-full bg-[#9fe0e8]' style={{ width: `${Math.max(4, (n / officialBarangays) * 100)}%` }} />
								</span>
							</span>
							<span className='text-[0.75rem] font-bold tabular-nums'>{n.toLocaleString('en-PH')}</span>
						</span>
					)
				})}
			</span>
		</span>
	)
}

/** A charter's page: a document with its checklist of what to bring. */
function Checklist() {
	return (
		<span className='block h-full w-full bg-[linear-gradient(135deg,#e6f3ea,#cfe8d7)] px-6 py-4'>
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
		</span>
	)
}

/** A table and the two files it downloads as: open data. */
function DataTable() {
	return (
		<span className='block h-full w-full bg-[linear-gradient(135deg,#f8e3bb_0%,#f0c98a_100%)] px-6 py-4'>
		<svg viewBox='0 0 340 190' className='h-full w-full' aria-hidden='true'>
			<rect x='70' y='34' width='150' height='122' rx='3' fill='#ffffff' stroke='#8a2418' strokeOpacity='0.35' />
			<rect x='70' y='34' width='150' height='22' rx='3' fill='#8a2418' />
			{[90, 130, 170].map((x) => (
				<rect key={x} x={x - 12} y='42' width='24' height='6' rx='2' fill='#ffffff' fillOpacity='0.85' />
			))}
			{[70, 92, 114, 136].map((y, row) => (
				<g key={y}>
					<path d={`M70 ${y - 4} h150`} stroke='#e7e2d8' />
					{[90, 130, 170].map((x, col) => (
						<rect key={x} x={x - 12} y={y + 3} width={[22, 16, 24, 18][(row + col) % 4]} height='5' rx='2' fill='#5c574c' fillOpacity='0.45' />
					))}
				</g>
			))}
			{[
				['CSV', 64],
				['JSON', 112],
			].map(([label, y]) => (
				<g key={label}>
					<rect x='236' y={y} width='46' height='24' rx='3' fill='#8a2418' />
					<text x='259' y={(y as number) + 16} textAnchor='middle' fontSize='10' fontWeight='700' fill='#ffffff' fontFamily='var(--font-display)'>
						{label}
					</text>
				</g>
			))}
		</svg>
		</span>
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

const PICTURE = { accidents: IncidentYears, preparedness: HazardBars, crafts: CraftPhoto, data: DataTable, services: Checklist } as const

export function ProjectList({ projects }: { projects: Project[] }) {
	return (
		// Separate cards with room between them, each with its own hairline.
		<ul className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
			{projects.map((p) => {
				const Picture = PICTURE[p.key]
				const body = (
					<>
						{/* Every picture fills its panel and brings its own ground. */}
						<span className='block h-40 overflow-hidden border-b border-[var(--rule-soft)]'>
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
							<span className='block text-[0.75rem] font-semibold text-[var(--ink-3)]'>{p.measure}</span>
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
						{p.key === 'crafts' ? (
							<span className='pointer-events-none absolute inset-x-0 top-0 h-40 [&>a]:pointer-events-auto'>
								<PhotoCredit photo={creditOf(CRAFT_PHOTO)} />
							</span>
						) : null}
					</li>
				)
			})}
		</ul>
	)
}
