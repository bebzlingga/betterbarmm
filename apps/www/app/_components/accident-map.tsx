'use client'

import { ArrowUpRightIcon, BoatIcon, CaretLeftIcon, CaretRightIcon, CarProfileIcon, CrosshairIcon, FireIcon, WarningIcon, WavesIcon, XIcon, type Icon } from '@phosphor-icons/react'
import { SearchField, Select, Skeleton } from '@betterbarmm/editorial'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ACCIDENT_TYPES, accidentDate, MAX_ZOOM, typeOf, type Accident, type AccidentType } from '../_lib/accidents'
import lake from '../../../../datasets/accidents/lake-lanao.json'
import outline from '../../../../datasets/accidents/barmm-outline.json'
import { AccidentChart } from './accident-chart'
import type { AccidentFeatures, Focus } from './accident-map-canvas'

/* ============================================================
   Filters, figures, map, list — one state

   The filters scope everything at once: the figures, the heat and the
   dots, the list of reports. The list is the map's table view and is
   rendered on the server with every source linked.

   The map itself opens as a full-screen dialog — a native <dialog>
   under showModal, so focus is trapped, Escape closes it and the page
   behind is inert without any of that written here. Down its left side
   sit the same filters, the chosen incident's details and a short list
   of what is on the map; the canvas fills the rest. The
   canvas is mounted only while the dialog is open: MapLibre wants a
   sized container and a window, and most readers never open it.
   ============================================================ */

const Canvas = dynamic(() => import('./accident-map-canvas'), {
	ssr: false,
	loading: () => <Skeleton className='h-full w-full rounded-none' />,
})

type Show = 'both' | 'heat' | 'points'

const figure = (n: number) => n.toLocaleString('en-PH')

/** Rows of the table a page holds. */
const PAGE = 20

/** "Kurinte, Datu Odin Sinsuat, Maguindanao del Norte" — a city that is its own province is named once. */
const place = (a: Accident) => [a.barangay, a.municipality !== a.province ? a.municipality : null, a.province].filter(Boolean).join(', ')

/** One glyph per kind, kept here rather than in the lib so the server page never loads the icon set. */
const ICONS: Record<AccidentType, Icon> = { road: CarProfileIcon, water: BoatIcon, flood: WavesIcon, fire: FireIcon, shooting: CrosshairIcon, other: WarningIcon }

/** The kind's glyph in the kind's colour — the swatch, with a shape. */
function KindIcon({ type, size = 13 }: { type: AccidentType; size?: number }) {
	const t = typeOf(type)
	const Icon = ICONS[t.id]
	return <Icon size={size} weight='fill' className='acc-icon' style={{ color: `var(--acc-${t.id})` }} aria-hidden='true' />
}

/** A column heading in the registry's table voice: small capitals; figures right-aligned over their numbers. */
function Th({ children, numeric = false, wide = false, className = '' }: { children: React.ReactNode; numeric?: boolean; wide?: boolean; className?: string }) {
	return (
		<th
			scope='col'
			className={`py-3 text-[0.65625rem] font-semibold uppercase tracking-[0.1em] text-[var(--ink-3)] ${
				numeric ? 'w-px whitespace-nowrap pl-6 text-right sm:pl-10' : wide ? 'pr-8 text-left' : 'w-px whitespace-nowrap pr-8 text-left'
			} ${className}`}
		>
			{children}
		</th>
	)
}

/** Dead, injured, missing — only the figures the report gave. */
function Counts({ a, className = '' }: { a: Accident; className?: string }) {
	return (
		<dl className={`num flex gap-5 text-[0.75rem] ${className}`}>
			{(['deaths', 'injured', 'missing'] as const).map((key) =>
				a[key] ? (
					<div key={key}>
						<dd className='text-[0.9375rem] font-extrabold text-[var(--ink)]'>{figure(a[key] as number)}</dd>
						<dt className='font-mono text-[0.59375rem] uppercase tracking-[0.14em] text-[var(--ink-3)]'>{key}</dt>
					</div>
				) : null,
			)}
		</dl>
	)
}

function Sources({ a, sep = ' · ' }: { a: Accident; sep?: string }) {
	return (
		<>
			{a.sources.map((s, i) => (
				<span key={s.url}>
					{i ? sep : ''}
					<a
						href={s.url}
						target='_blank'
						rel='noreferrer'
						title={s.title || undefined}
						className='inline-flex items-center gap-0.5 underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]'
					>
						{s.outlet}
						<ArrowUpRightIcon className='size-3' weight='bold' aria-hidden='true' />
					</a>
				</span>
			))}
		</>
	)
}

/** The chosen incident, in the dialog's left column. */
function Details({ a, onClose }: { a: Accident; onClose: () => void }) {
	const t = typeOf(a.type)
	return (
		<article className='bg-[var(--paper)] p-4'>
			<div className='flex items-start justify-between gap-3'>
				<p className='flex flex-wrap items-center gap-2 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
					<KindIcon type={a.type} />
					{t.label}
					{a.kind && a.kind.toLowerCase() !== t.label.toLowerCase() ? <span className='text-[var(--ink-mute)]'>· {a.kind}</span> : null}
					<span className='text-[var(--ink-mute)]'>· {accidentDate(a.date)}</span>
				</p>
				<button
					type='button'
					onClick={onClose}
					aria-label='Close details'
					className='-mr-1.5 -mt-1.5 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center text-[var(--ink-3)] transition hover:text-[var(--ink)]'
				>
					<XIcon size={14} weight='bold' aria-hidden='true' />
				</button>
			</div>
			<h3 className='mt-2 text-[0.9375rem] font-extrabold leading-snug tracking-[-0.01em]'>{a.title}</h3>
			<p className='mt-1 text-[0.78125rem] text-[var(--ink-2)]'>{place(a)}</p>
			{a.deaths || a.injured || a.missing ? <Counts a={a} className='mt-3 border-t border-[var(--rule)] pt-3' /> : null}
			{a.image ? (
				<a href={a.image.href} target='_blank' rel='noreferrer' className='group/photo mt-3 block'>
					{/* The outlet's photo, hot-linked and credited — a thumbnail, not a reproduction. */}
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={a.image.url} alt='' loading='lazy' className='aspect-[16/9] w-full object-cover' />
					<span className='mt-1 block text-[0.65625rem] text-[var(--ink-mute)] group-hover/photo:text-[var(--ink-3)]'>Photo: {a.image.outlet}</span>
				</a>
			) : null}
			<p className='mt-3 text-[0.8125rem] leading-[1.6] text-[var(--ink-2)]'>{a.summary}</p>
			<p className='mt-3 text-[0.71875rem] leading-[1.7] text-[var(--ink-3)]'>
				{a.sources.length === 1 ? 'Source: ' : 'Sources: '}
				<Sources a={a} sep=', ' />
			</p>
			{a.placed !== 'barangay' ? (
				<p className='mt-2 text-[0.65625rem] leading-[1.6] text-[var(--ink-mute)]'>
					{a.municipality ? `Placed at the centre of ${a.municipality}; the report names no closer spot.` : `The report names no town, so the dot stands faintly at ${a.province}'s main town.`}
				</p>
			) : null}
		</article>
	)
}

type Ring = number[][]
const LAND: Ring[][] = outline.features.flatMap((f) => (f.geometry.type === 'MultiPolygon' ? (f.geometry.coordinates as Ring[][]) : [f.geometry.coordinates as Ring[]]))
const LAKE = lake.geometry.coordinates[0] as Ring

/** Even-odd ray cast: is the point inside the ring? */
function within([x, y]: [number, number], ring: Ring) {
	let inside = false
	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
		const [xi, yi] = ring[i]!, [xj, yj] = ring[j]!
		if (yi! > y !== yj! > y && x < ((xj! - xi!) * (y - yi!)) / (yj! - yi!) + xi!) inside = !inside
	}
	return inside
}
/** On the region's land: inside its outline (which leaves out the sea) and out of Lake Lanao (which it does not). */
const onLand = (p: [number, number]) => !within(p, LAKE) && LAND.some(([outer, ...holes]) => within(p, outer!) && !holes.some((h) => within(p, h)))

/** A dot's radius in pixels at MAX_ZOOM, as the canvas draws it: 3.5 + 0.5 a death at zoom 5, 6 + 1.4 a death at 11. */
const dotRadius = (a: Accident) => {
	const d = Math.min(a.deaths ?? 0, 12)
	const t = (MAX_ZOOM - 5) / 6
	return 3.5 + 0.5 * d + t * (2.5 + 0.9 * d)
}

/** Every dot set down where it stands clear of the ones before it at the map's closest zoom, by both their sizes and
    a pixel more: each starts at its own point and walks out a sunflower spiral until it is clear and on land (not the
    sea, not Lake Lanao). The surest go first — barangay, then town, then province — so they keep their exact place.
    Fixed on the ground, so a dot keeps its place at every zoom, and worked out over every incident, not the filtered
    few, so it keeps it whatever the filters say. */
function spread(incidents: Accident[]) {
	const rank = { barangay: 0, municipality: 1, province: 2 }
	const order = [...incidents].sort((a, b) => rank[a.placed] - rank[b.placed] || (a.id < b.id ? -1 : 1))
	// Metres in a pixel at MAX_ZOOM, at the region's latitude: MapLibre's 512-px tiles put 78,272 m in one at zoom 0.
	const metres = (78272 * Math.cos((7 * Math.PI) / 180)) / 2 ** MAX_ZOOM
	const placed: { x: number; y: number; r: number }[] = []
	const at = new Map<string, [number, number]>()
	for (const a of order) {
		const shrink = Math.cos((a.lat * Math.PI) / 180)
		const r = dotRadius(a)
		// The point as pixels at MAX_ZOOM, to measure clearance in.
		const px = (lon: number, lat: number) => ({ x: (lon * 111320 * shrink) / metres, y: (lat * 111320) / metres })
		const clear = (x: number, y: number) => placed.every((o) => Math.hypot(o.x - x, o.y - y) >= o.r + r + 1)
		let best: [number, number] = [a.lon, a.lat]
		// ponytail: up to 600 turns of 3 px each; a dot boxed in past that keeps its own point.
		for (let k = 0; k < 600; k++) {
			const step = (3 * Math.sqrt(k) * metres) / 111320
			const t = k * 2.39996 // the golden angle
			const q: [number, number] = [a.lon + (step * Math.cos(t)) / shrink, a.lat + step * Math.sin(t)]
			const { x, y } = px(q[0], q[1])
			if (clear(x, y) && (k === 0 || onLand(q))) {
				best = q
				break
			}
		}
		const { x, y } = px(best[0], best[1])
		placed.push({ x, y, r })
		at.set(a.id, best)
	}
	return at
}

export function AccidentMap({ incidents }: { incidents: Accident[] }) {
	const years = useMemo(() => [...new Set(incidents.map((a) => a.date.slice(0, 4)))].sort(), [incidents])
	const provinces = useMemo(() => [...new Set(incidents.map((a) => a.province))].sort(), [incidents])
	const at = useMemo(() => spread(incidents), [incidents])

	// One value each, '' for all. A new year or area in the data arrives in the
	// dropdown without anyone editing a list.
	const [query, setQuery] = useState('')
	const [page, setPage] = useState(1)
	// Opens on the latest year, the one a reader most likely came for; "All years" is one choice away.
	const [year, setYear] = useState(() => years[years.length - 1] ?? '')
	const [type, setType] = useState('')
	const [province, setProvince] = useState('')
	const [deadlyOnly, setDeadlyOnly] = useState(false)
	const [show, setShow] = useState<Show>('points')
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [focus, setFocus] = useState<Focus>(null)
	const [open, setOpen] = useState(false)
	const dialog = useRef<HTMLDialogElement>(null)
	// Counts the asks to fly, so asking for the same incident twice flies twice.
	const asks = useRef(0)

	// `except` leaves one dimension open, so a dropdown's counts say what choosing each option would leave.
	const q = query.trim().toLowerCase()
	const matches = useCallback(
		(a: Accident, except?: 'year' | 'type' | 'province') =>
			(!q || `${a.title} ${a.summary} ${a.kind} ${place(a)}`.toLowerCase().includes(q)) &&
			(except === 'year' || !year || a.date.startsWith(year)) &&
			(except === 'type' || !type || a.type === type) &&
			(except === 'province' || !province || a.province === province) &&
			(!deadlyOnly || (a.deaths ?? 0) > 0),
		[q, year, type, province, deadlyOnly],
	)
	const filtered = useMemo(() => incidents.filter((a) => matches(a)), [incidents, matches])
	// The page is clamped rather than reset when a filter shortens the list, so no effect has to watch the filters.
	const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
	const current = Math.min(page, pages)
	const shown = filtered.slice((current - 1) * PAGE, current * PAGE)

	const features = useMemo<AccidentFeatures>(
		() => ({
			type: 'FeatureCollection',
			features: filtered.map((a) => ({
				type: 'Feature',
				geometry: { type: 'Point', coordinates: at.get(a.id) ?? [a.lon, a.lat] },
				properties: {
					id: a.id,
					type: a.type,
					deaths: a.deaths ?? 0,
					placed: a.placed,
					// One incident counts for one; each death for half again, each injury a tenth, capped so one disaster does not wash out a province.
					// A dot parked on a province's centre adds nothing to the heat: a stack of them there would be a hotspot that is not.
					weight: a.placed === 'province' ? 0 : 1 + Math.min(a.deaths ?? 0, 20) * 0.5 + Math.min(a.injured ?? 0, 20) * 0.1,
				},
			})),
		}),
		[filtered, at],
	)

	const selected = useMemo(() => incidents.find((a) => a.id === selectedId) ?? null, [incidents, selectedId])
	const onSelect = useCallback((id: string | null) => setSelectedId(id), [])

	const openMap = useCallback(() => {
		setOpen(true)
		dialog.current?.showModal()
	}, [])

	// `#map` opens the dialog — on arrival, and whenever the masthead's door
	// sets it — so the map can be linked to and opened from outside this
	// component. Deferred a frame on arrival: the dialog element has to
	// exist before showModal.
	useEffect(() => {
		const onHash = () => {
			if (window.location.hash === '#map') openMap()
		}
		const frame = requestAnimationFrame(onHash)
		window.addEventListener('hashchange', onHash)
		return () => {
			cancelAnimationFrame(frame)
			window.removeEventListener('hashchange', onHash)
		}
	}, [openMap])

	// The dialog scrolls; the page under it should not.
	useEffect(() => {
		if (!open) return
		const root = document.documentElement
		const previous = root.style.overflow
		root.style.overflow = 'hidden'
		return () => {
			root.style.overflow = previous
		}
	}, [open])

	// A row asked for this incident: choose it, fly there, and open the map if it is shut.
	const goTo = (a: Accident) => {
		setSelectedId(a.id)
		setFocus({ id: a.id, lon: a.lon, lat: a.lat, nonce: ++asks.current })
		if (!open) openMap()
	}

	const countBy = (key: (a: Accident) => string, except: 'year' | 'type' | 'province') => {
		const counts = new Map<string, number>()
		for (const a of incidents) if (matches(a, except)) counts.set(key(a), (counts.get(key(a)) ?? 0) + 1)
		return counts
	}
	const byYear = countBy((a) => a.date.slice(0, 4), 'year')
	const byType = countBy((a) => a.type, 'type')
	const byProvince = countBy((a) => a.province, 'province')

	// Drawn twice — on the page and in the dialog's header — off one state,
	// on the estate's own controls, each the width of its words and no more.
	// Only the dialog gets "Show", since the page has no heat or dots to
	// switch; and in the dialog the boxes go bare, a row of controls in a
	// header rather than a form.
	const filters = (withShow: boolean, plain = false) => (
		<div className='@container'>
			<div className={`flex flex-wrap gap-3 ${plain ? 'items-center gap-x-5' : 'items-end justify-between'}`}>
				<div className={plain ? 'w-full @xl:w-52' : 'w-full @xl:w-60'}>
					<SearchField value={query} onChange={setQuery} placeholder='Title, place or kind' plain={plain} />
				</div>
				{/* In the dialog on a phone the controls keep to one line that scrolls sideways, so the map keeps the screen. */}
				<div
					className={
						plain
							? 'flex w-full items-center gap-x-5 overflow-x-auto pr-8 [mask-image:linear-gradient(to_right,#000_calc(100%-2.5rem),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0 @xl:w-auto @xl:flex-wrap @xl:gap-y-2 @xl:overflow-visible @xl:pr-0 @xl:[mask-image:none]'
							: 'flex w-full flex-wrap gap-3 @xl:w-auto [&>*]:w-[calc(50%-0.375rem)] @xl:[&>*]:w-[8.5rem]'
					}
				>
				<Select label='Year' value={year} onChange={setYear} options={[['', 'All years'], ...years.map((y): [string, string] => [y, `${y} (${byYear.get(y) ?? 0})`])]} plain={plain} />
				<Select label='Kind' value={type} onChange={setType} options={[['', 'All kinds'], ...ACCIDENT_TYPES.map((k): [string, string] => [k.id, `${k.label} (${byType.get(k.id) ?? 0})`])]} plain={plain} />
				<Select label='Area' value={province} onChange={setProvince} options={[['', 'All areas'], ...provinces.map((p): [string, string] => [p, `${p} (${byProvince.get(p) ?? 0})`])]} plain={plain} />
				<Select
					label='Casualties'
					value={deadlyOnly ? 'deadly' : ''}
					onChange={(v) => setDeadlyOnly(v === 'deadly')}
						plain={plain}
					options={[
						['', 'All incidents'],
						['deadly', 'With deaths only'],
					]}
				/>
				{withShow ? (
					<Select
						label='Show'
						value={show}
						onChange={(v) => setShow(v as Show)}
						plain={plain}
						options={[
							['both', 'Heat & dots'],
							['heat', 'Heat only'],
							['points', 'Dots only'],
						]}
					/>
				) : null}
				</div>
			</div>
		</div>
	)

	return (
		<div>
			<div className='pb-6'>{filters(false)}</div>

			{/* The same incidents over time, under the same filters; a year's bar opens that year. */}
			<AccidentChart incidents={filtered} year={year} years={years} onYear={setYear} />

			{/* The table view: every incident on the map, newest first, with its
			    sources — drawn the way the registry's tables are drawn. */}
			<table className='mt-8 w-full border-collapse'>
				<caption className='sr-only'>Every incident on the map, newest first</caption>
				<thead>
					<tr className='border-b border-[var(--ink)]'>
						<Th className='hidden sm:table-cell'>Date</Th>
						<Th className='hidden md:table-cell'>Kind</Th>
						<Th wide>Incident</Th>
						<Th numeric className='hidden sm:table-cell'>Dead</Th>
						<Th numeric className='hidden sm:table-cell'>Injured</Th>
						<Th numeric className='hidden sm:table-cell'>Missing</Th>
					</tr>
				</thead>
				<tbody>
					{shown.map((a) => (
						<tr key={a.id} id={a.id} className='border-b border-[var(--rule-soft)] align-top transition-colors hover:bg-[var(--paper-2)]'>
							<td className='num hidden w-px whitespace-nowrap py-3.5 pr-8 text-[0.8125rem] text-[var(--ink-2)] sm:table-cell'>{accidentDate(a.date)}</td>
							<td className='hidden w-px whitespace-nowrap py-3.5 pr-8 text-[0.8125rem] text-[var(--ink-2)] md:table-cell'>
								<span className='flex items-center gap-1.5'>
									<KindIcon type={a.type} />
									{a.kind || typeOf(a.type).label}
								</span>
							</td>
							<th scope='row' className='py-3.5 text-left font-normal sm:pr-8'>
								{/* On a phone the row is one column: the date and kind over the title, the figures under it. */}
								<p className='num mb-1 flex items-center gap-1.5 text-[0.75rem] text-[var(--ink-3)] sm:hidden'>
									<KindIcon type={a.type} />
									{accidentDate(a.date)}
								</p>
								<button
									type='button'
									onClick={() => goTo(a)}
									className='cursor-pointer text-left text-[0.9375rem] font-semibold leading-snug text-[var(--ink)] underline-offset-4 hover:text-[var(--accent)] hover:underline'
								>
									{a.title}
								</button>
								<p className='mt-0.5 text-[0.78125rem] text-[var(--ink-3)]'>{place(a)}</p>
								{a.deaths || a.injured || a.missing ? (
									<p className='num mt-1 text-[0.78125rem] font-semibold text-[var(--ink)] sm:hidden'>
										{[a.deaths && `${figure(a.deaths)} dead`, a.injured && `${figure(a.injured)} injured`, a.missing && `${figure(a.missing)} missing`].filter(Boolean).join(' · ')}
									</p>
								) : null}
								<p className='mt-2 hidden max-w-4xl text-[0.8125rem] leading-6 text-[var(--ink-2)] lg:block'>{a.summary}</p>
								<p className='mt-1.5 text-[0.75rem] leading-[1.7] text-[var(--ink-3)]'>
									<Sources a={a} />
								</p>
							</th>
							{(['deaths', 'injured', 'missing'] as const).map((key) => (
								<td key={key} className='num hidden w-px whitespace-nowrap py-3.5 pl-6 text-right text-[0.8125rem] tabular-nums text-[var(--ink)] sm:table-cell sm:pl-10'>
									{a[key] ? figure(a[key] as number) : <span className='text-[var(--ink-mute)]'>–</span>}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			{filtered.length === 0 ? <p className='py-10 text-center text-[0.84375rem] text-[var(--ink-3)]'>Nothing here matches these filters.</p> : null}
			{pages > 1 ? (
				<div className='mt-6 flex items-center justify-end gap-3 text-[0.8125rem] text-[var(--ink-3)]'>
					<button
						type='button'
						disabled={current <= 1}
						onClick={() => setPage(current - 1)}
						className='inline-flex size-9 cursor-pointer items-center justify-center border border-[var(--rule)] disabled:cursor-default disabled:opacity-40'
						aria-label='Previous page'
					>
						<CaretLeftIcon size={14} />
					</button>
					<span className='num'>
						Page {figure(current)} of {figure(pages)}
					</span>
					<button
						type='button'
						disabled={current >= pages}
						onClick={() => setPage(current + 1)}
						className='inline-flex size-9 cursor-pointer items-center justify-center border border-[var(--rule)] disabled:cursor-default disabled:opacity-40'
						aria-label='Next page'
					>
						<CaretRightIcon size={14} />
					</button>
				</div>
			) : null}

			<dialog
				ref={dialog}
				onClose={() => {
					setOpen(false)
					// Clear the hash on close, so the door's next click is a change again.
					if (window.location.hash === '#map') history.replaceState(null, '', window.location.pathname + window.location.search)
				}}
				aria-label='Interactive map'
				className='m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-[var(--paper)] p-0 text-[var(--ink)] backdrop:bg-black/40 open:flex open:flex-col lg:overflow-hidden'
			>
				{/* The header is the filters, and the way out — on the dark ground, so it reads as the frame and the map as the page. */}
				<div className='bb-ground flex shrink-0 items-start justify-between gap-4 border-b border-[var(--rule)] px-4 py-2 [color-scheme:dark] lg:items-center lg:px-6'>
					<div className='min-w-0 flex-1'>{filters(true, true)}</div>
					<button
						type='button'
						onClick={() => dialog.current?.close()}
						aria-label='Close map'
						className='inline-flex h-10 cursor-pointer items-center justify-center text-[var(--ink-3)] transition hover:text-[var(--ink)]'
					>
						<XIcon size={16} weight='bold' aria-hidden='true' />
					</button>
				</div>

				<div className='grid min-h-0 flex-1 lg:grid-cols-[26rem_minmax(0,1fr)]'>
					{/* The list on the left; the chosen incident floats over the map's corner. */}
					<aside className='order-2 min-h-0 overflow-y-auto border-t border-[var(--rule)] p-5 lg:order-1 lg:border-r lg:border-t-0'>
						<ul className='[&>li:first-child>button]:pt-0'>
							{filtered.map((a) => (
								<li key={a.id} className='border-b border-[var(--rule-soft)] last:border-b-0'>
									<button
										type='button'
										onClick={() => goTo(a)}
										aria-current={a.id === selectedId ? 'true' : undefined}
										className='grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 py-2.5 text-left transition hover:text-[var(--accent)] aria-[current=true]:text-[var(--accent)]'
									>
										<KindIcon type={a.type} size={20} />
										<span className='min-w-0'>
											<span className='block text-[0.8125rem] font-medium leading-snug'>{a.title}</span>
											<span className='num block text-[0.6875rem] text-[var(--ink-3)]'>
												{accidentDate(a.date)} · {a.municipality ?? a.province}
											</span>
										</span>
										{a.deaths ? (
											<span className='num ml-4 whitespace-nowrap text-[0.75rem] font-extrabold text-[var(--ink)]'>
												{figure(a.deaths)} <span className='font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>dead</span>
											</span>
										) : null}
									</button>
								</li>
							))}
						</ul>
					</aside>
					<div className='relative order-1 h-[55dvh] min-h-0 lg:order-2 lg:h-auto'>
						{open ? <Canvas features={features} show={show} selectedId={selectedId} onSelect={onSelect} focus={focus} /> : null}
						{selected ? (
							<div className='absolute bottom-4 right-4 z-10 w-[22rem] max-w-[calc(100%-2rem)] max-h-[calc(100%-2rem)] overflow-y-auto shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)]'>
								<Details a={selected} onClose={() => setSelectedId(null)} />
							</div>
						) : null}
					</div>
				</div>
			</dialog>
		</div>
	)
}
