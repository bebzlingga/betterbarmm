'use client'

import { ArrowUpRightIcon, CaretDownIcon, CrosshairIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import { Select } from '@betterbarmm/editorial'
import dynamic from 'next/dynamic'
import { type CSSProperties, type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { Barangay } from '../_lib/preparedness'
import { FACILITY_GLYPHS } from '../_lib/preparedness-icons'
import { CLASS_COLORS, CLASS_LABELS, HAZARDS, PROVINCE_NAMES, type HazardId } from '../_lib/preparedness-shared'
import type { FacilityFeatures, HeatFeatures, View } from './preparedness-map-canvas'

/* ============================================================
   The preparedness map, as Incident Watch's is: a full-screen dialog

   A native <dialog> under showModal, opened by `#map` from the page's
   door, so focus is trapped and Escape closes it. Across the top, on the
   dark ground: the hazard and how to draw it, and the way out. Down the
   left: the legend, a search over every barangay and town, the place
   picker, the place's land in each hazard, the facilities nearest it,
   and which kinds to show. The canvas fills the rest and is mounted only
   while the dialog is open; the data it needs is fetched the first time
   it opens. On a phone the panel sits under the map, so a picked place
   also gets a card on the map itself.

   The hazard, the view and the place ride in the hash (#map?h=flood&
   v=heat&b=<psgc>), so a link opens the map where it was left.
   ============================================================ */

const Canvas = dynamic(() => import('./preparedness-map-canvas'), {
	ssr: false,
	loading: () => <div className='h-full w-full animate-pulse bg-[var(--paper-2)]' aria-hidden='true' />,
})

export type Facility = { id: string; kind: string; name: string; lon: number; lat: number; town: string | null; prov: string | null; detail?: string | null; source: { label: string; url: string } }
export type FacilityKind = { id: string; label: string; color: string; on: boolean }
type Place = Pick<Barangay, 'psgc' | 'name' | 'town' | 'town_psgc' | 'prov' | 'area' | 'pop' | 'at' | 'bbox' | 'flood' | 'landslide' | 'surge'>

const pct = (x: number) => (x >= 0.995 ? '100%' : x < 0.005 && x > 0 ? '<1%' : `${Math.round(x * 100)}%`)
const km = (d: number) => (d < 1 ? `${Math.round(d * 1000)} m` : `${d < 10 ? d.toFixed(1) : Math.round(d)} km`)
function distance(a: [number, number], b: [number, number]) {
	const r = Math.PI / 180
	const h = Math.sin(((b[1] - a[1]) * r) / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(((b[0] - a[0]) * r) / 2) ** 2
	return 12742 * Math.asin(Math.sqrt(h))
}

/** A kind's badge, the same glyph the map paints. */
export function KindBadge({ kind, color, size = 18 }: { kind: string; color: string; size?: number }) {
	return (
		<span className='inline-flex shrink-0 items-center justify-center rounded-full' style={{ background: color, width: size, height: size }} aria-hidden='true'>
			<svg viewBox='0 0 256 256' width={size * 0.6} height={size * 0.6} fill='#fff'>
				<path d={FACILITY_GLYPHS[kind] ?? ''} />
			</svg>
		</span>
	)
}

type Box = [number, number, number, number]
const union = (boxes: Box[]): Box => [Math.min(...boxes.map((b) => b[0])), Math.min(...boxes.map((b) => b[1])), Math.max(...boxes.map((b) => b[2])), Math.max(...boxes.map((b) => b[3]))]
/** "Dañgcagan" and "dangcagan", "Datu Odin Sinsuat" and "datu odin": what a reader types against what PSA writes. */
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

type Hit = { kind: 'town'; psgc: string; name: string; prov: string; n: number } | { kind: 'bgy'; psgc: string; name: string; town: string; prov: string }

/** A combobox over every town and barangay: towns first, then barangays whose names begin with what was typed, then the rest that contain it.
 *  The crosshair at its right end finds the reader instead. */
function Search({ places, onBarangay, onTown, onLocate, locating }: { places: Place[] | null; onBarangay: (psgc: string) => void; onTown: (psgc: string) => void; onLocate: () => void; locating: boolean }) {
	const [q, setQ] = useState('')
	const [open, setOpen] = useState(false)
	const [active, setActive] = useState(0)
	const index = useMemo(() => {
		const towns = new Map<string, Hit & { kind: 'town' }>()
		for (const p of places ?? []) {
			const t = towns.get(p.town_psgc)
			if (t) t.n++
			else towns.set(p.town_psgc, { kind: 'town', psgc: p.town_psgc, name: p.town, prov: p.prov, n: 1 })
		}
		return {
			towns: [...towns.values()].map((t) => ({ hit: t as Hit, key: fold(t.name) })),
			bgys: (places ?? []).map((p) => ({ hit: { kind: 'bgy', psgc: p.psgc, name: p.name, town: p.town, prov: p.prov } as Hit, key: fold(p.name) })),
		}
	}, [places])
	const hits = useMemo(() => {
		const n = fold(q)
		if (n.length < 2) return []
		// Every word typed, in any order: "cotabato city" finds PSA's "City of Cotabato".
		const words = n.split(' ')
		const has = (k: string) => words.every((w) => k.includes(w))
		const starts = (k: string) => k.startsWith(words[0]!) || k.includes(` ${words[0]}`)
		const t = index.towns.filter((x) => has(x.key)).sort((a, b) => Number(starts(b.key)) - Number(starts(a.key))).slice(0, 3)
		const b = index.bgys.filter((x) => has(x.key)).sort((a, b) => Number(starts(b.key)) - Number(starts(a.key)) || a.key.localeCompare(b.key))
		return [...t, ...b].slice(0, 8).map((x) => x.hit)
	}, [q, index])
	const choose = (h: Hit) => {
		;(h.kind === 'town' ? onTown : onBarangay)(h.psgc)
		setQ('')
		setOpen(false)
	}
	const shown = open && hits.length > 0
	return (
		<div className='relative'>
			<MagnifyingGlassIcon size={15} weight='bold' className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)]' aria-hidden='true' />
			<input
				type='search'
				role='combobox'
				aria-expanded={shown}
				aria-controls='prep-search-list'
				aria-activedescendant={shown ? `prep-hit-${active}` : undefined}
				aria-autocomplete='list'
				aria-label='Search a barangay or town'
				placeholder={places ? 'Search a barangay or town' : 'Loading places…'}
				disabled={!places}
				value={q}
				onChange={(e) => (setQ(e.target.value), setOpen(true), setActive(0))}
				onFocus={() => setOpen(true)}
				onBlur={() => setTimeout(() => setOpen(false), 120)}
				onKeyDown={(e) => {
					if (!shown) return
					if (e.key === 'ArrowDown') {
						e.preventDefault()
						setActive((active + 1) % hits.length)
					} else if (e.key === 'ArrowUp') {
						e.preventDefault()
						setActive((active - 1 + hits.length) % hits.length)
					} else if (e.key === 'Enter') {
						e.preventDefault()
						choose(hits[active]!)
					} else if (e.key === 'Escape') {
						// The list closes; the dialog does not.
						e.preventDefault()
						e.stopPropagation()
						setOpen(false)
					}
				}}
				className='h-10 w-full min-w-0 border border-[var(--rule)] bg-[var(--paper)] pl-9 pr-11 text-[14px] text-[var(--ink)] placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
			/>
			<button
				type='button'
				onClick={onLocate}
				aria-label={locating ? 'Finding you' : 'Find places near me'}
				title='Near me'
				className={`absolute right-1 top-1/2 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center text-[var(--ink-3)] transition hover:text-[var(--accent)] ${locating ? 'animate-pulse text-[var(--accent)]' : ''}`}
			>
				<CrosshairIcon size={17} weight='bold' aria-hidden='true' />
			</button>
			{shown ? (
				<ul id='prep-search-list' role='listbox' className='absolute inset-x-0 top-full z-30 mt-1 max-h-80 overflow-y-auto border border-[var(--rule)] bg-[var(--paper)] py-1 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.4)]'>
					{hits.map((h, i) => (
						<li
							key={`${h.kind}-${h.psgc}`}
							id={`prep-hit-${i}`}
							role='option'
							aria-selected={i === active}
							onMouseDown={(e) => (e.preventDefault(), choose(h))}
							onMouseEnter={() => setActive(i)}
							className={`cursor-pointer px-3 py-1.5 text-[13.5px] ${i === active ? 'bg-[var(--paper-2)]' : ''}`}
						>
							<span className='font-semibold'>{h.name}</span>
							<span className='block text-[11.5px] text-[var(--ink-3)]'>
								{h.kind === 'town' ? `Town · ${PROVINCE_NAMES[h.prov] ?? h.prov} · ${h.n} barangays` : `${h.town}, ${PROVINCE_NAMES[h.prov] ?? h.prov}`}
							</span>
						</li>
					))}
				</ul>
			) : null}
		</div>
	)
}

/** A dropdown in the header, drawn as the editorial Select's plain trigger (a label, then the value and a
 *  caret), opening a panel of its own rather than a list of one. It shuts itself whenever `shut` changes. */
function Menu({ label, value, width = 340, shut = 0, children }: { label: string; value: ReactNode; width?: number; shut?: number; children: ReactNode }) {
	const id = useId()
	const button = useRef<HTMLButtonElement>(null)
	const panel = useRef<HTMLDivElement>(null)
	const [open, setOpen] = useState(false)
	const [place, setPlace] = useState<CSSProperties>({})
	// Placed under the trigger as it opens, kept on screen.
	useEffect(() => {
		const el = panel.current
		if (!el) return
		const before = (event: Event) => {
			if ((event as ToggleEvent).newState !== 'open' || !button.current) return
			const r = button.current.getBoundingClientRect()
			const w = Math.min(width, window.innerWidth - 16)
			setPlace({ left: Math.max(8, Math.min(r.left, window.innerWidth - w - 8)), top: r.bottom + 4, width: w })
		}
		const toggle = (event: Event) => setOpen((event as ToggleEvent).newState === 'open')
		el.addEventListener('beforetoggle', before)
		el.addEventListener('toggle', toggle)
		return () => {
			el.removeEventListener('beforetoggle', before)
			el.removeEventListener('toggle', toggle)
		}
	}, [width])
	useEffect(() => {
		if (shut) panel.current?.hidePopover()
	}, [shut])
	return (
		<div className='flex min-w-0 items-center gap-2'>
			<span className='whitespace-nowrap text-[14px] text-[var(--ink-3)]'>{label}</span>
			<button
				ref={button}
				type='button'
				aria-haspopup='true'
				aria-expanded={open}
				aria-controls={`${id}-panel`}
				popoverTarget={`${id}-panel`}
				className='flex h-10 min-w-0 cursor-pointer items-center gap-2 whitespace-nowrap text-[14px] font-semibold text-[var(--ink)] outline-none focus-visible:underline focus-visible:decoration-[var(--accent)] focus-visible:underline-offset-4'
			>
				{value}
				<CaretDownIcon size={11} weight='bold' aria-hidden='true' className={`shrink-0 text-[var(--ink-3)] transition-transform ${open ? 'rotate-180' : ''}`} />
			</button>
			<div ref={panel} id={`${id}-panel`} popover='auto' style={place} className='fixed inset-auto m-0 overflow-visible border border-[var(--rule)] bg-[var(--paper)] p-1.5 text-[13.5px] text-[var(--ink)] shadow-[0_16px_40px_rgba(0,0,0,0.28)]'>
				{children}
			</div>
		</div>
	)
}

/** Which facilities the map shows: a checklist, so several kinds can be on at once. */
function FacilityMenu({ kinds, counts, onToggle }: { kinds: FacilityKind[]; counts: Record<string, number>; onToggle: (id: string) => void }) {
	const on = kinds.filter((k) => k.on).length
	return (
		<Menu
			label='Facilities'
			value={
				<>
					<span className='flex -space-x-1' aria-hidden='true'>
						{kinds
							.filter((k) => k.on)
							.slice(0, 4)
							.map((k) => (
								<KindBadge key={k.id} kind={k.id} color={k.color} size={18} />
							))}
					</span>
					{on === kinds.length ? 'All' : on ? `${on} of ${kinds.length}` : 'None'}
				</>
			}
		>
			<ul>
				{kinds.map((k) => (
					<li key={k.id}>
						<label className='flex cursor-pointer items-center gap-2.5 px-2.5 py-2 transition hover:bg-[var(--paper-2)]'>
							<input type='checkbox' checked={k.on} onChange={() => onToggle(k.id)} className='accent-[var(--accent)]' />
							<KindBadge kind={k.id} color={k.color} />
							<span className={`flex-1 ${k.on ? '' : 'text-[var(--ink-3)]'}`}>{k.label}</span>
							<span className='tabular-nums text-[12px] text-[var(--ink-3)]'>{counts[k.id] ? counts[k.id]!.toLocaleString('en-PH') : ''}</span>
						</label>
					</li>
				))}
			</ul>
			<p className='mt-1 border-t border-[var(--rule)] px-2.5 pb-1.5 pt-2.5 text-[11.5px] leading-[1.55] text-[var(--ink-3)]'>From OpenStreetMap. No official list of the region’s evacuation centres is published, so schools stand in for the sites LGUs most often designate.</p>
		</Menu>
	)
}

/** A place's land in each hazard, as three bars. */
function Exposure({ place }: { place: Place }) {
	return (
		<ul className='space-y-3'>
			{HAZARDS.map((h) => {
				const v = place[h.id]
				const a = place.area || 1
				const none = !v[0] && !v[1] && !v[2]
				return (
					<li key={h.id}>
						<p className='flex justify-between text-[13px]'>
							<span className='font-semibold'>{h.label}</span>
							<span className='text-[var(--ink-3)]'>{none ? (h.id === 'flood' && place.prov === 'tawi-tawi' ? 'Not modelled' : 'None mapped') : `${pct((v[1] + v[2]) / a)} medium or high`}</span>
						</p>
						<span className='mt-1 flex h-2 overflow-hidden bg-[var(--paper-2)]'>
							{v.map((x, i) => (
								<span key={i} style={{ width: `${Math.min(100, (x / a) * 100)}%`, background: CLASS_COLORS[i] }} title={`${CLASS_LABELS[i]}: ${pct(x / a)}`} />
							))}
						</span>
					</li>
				)
			})}
		</ul>
	)
}

const select = 'h-10 w-full min-w-0 border border-[var(--rule)] bg-[var(--paper)] px-2 text-[14px] text-[var(--ink)]'
const label = 'font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]'
const VIEWS: { id: View; label: string }[] = [
	{ id: 'zones', label: 'NOAH’s zones' },
	{ id: 'heat', label: 'Heat' },
	{ id: 'barangays', label: 'By barangay' },
]

export function PreparednessMap({ kinds: initialKinds }: { kinds: FacilityKind[] }) {
	const [open, setOpen] = useState(false)
	const dialog = useRef<HTMLDialogElement>(null)
	const [places, setPlaces] = useState<Place[] | null>(null)
	const [facilities, setFacilities] = useState<Facility[]>([])
	const [hazard, setHazard] = useState<HazardId | null>('flood')
	const [view, setView] = useState<View>('zones')
	const [kinds, setKinds] = useState(initialKinds)
	const [prov, setProv] = useState('')
	const [town, setTown] = useState('')
	const [selected, setSelected] = useState<string | null>(null)
	const [facilityId, setFacilityId] = useState<string | null>(null)
	/** Bumped when a place is chosen, to shut the place menu. */
	const [shut, setShut] = useState(0)
	const closePlace = () => setShut((n) => n + 1)
	const [focus, setFocus] = useState<{ bbox: [number, number, number, number]; nonce: number } | null>(null)
	const [me, setMe] = useState<[number, number] | null>(null)
	const [locating, setLocating] = useState<'idle' | 'busy' | 'failed'>('idle')
	const asked = useRef(false)
	/** A place named in the link, picked once the places have loaded. */
	const linked = useRef<string | null>(null)

	const openMap = useCallback(() => {
		const q = new URLSearchParams(window.location.hash.split('?')[1] ?? '')
		const h = q.get('h')
		if (h === 'none') setHazard(null)
		else if (HAZARDS.some((x) => x.id === h)) setHazard(h as HazardId)
		const v = q.get('v')
		if (VIEWS.some((x) => x.id === v)) setView(v as View)
		linked.current = q.get('b')
		setOpen(true)
		if (!dialog.current?.open) dialog.current?.showModal()
		if (asked.current) return
		asked.current = true
		fetch('/preparedness/places.json').then((r) => r.json()).then(setPlaces).catch(() => setPlaces([]))
		fetch('/preparedness/facilities.json').then((r) => r.json()).then(setFacilities).catch(() => setFacilities([]))
	}, [])

	// `#map` opens the dialog, on arrival and whenever the page's door sets it.
	useEffect(() => {
		const onHash = () => {
			if (window.location.hash.startsWith('#map')) openMap()
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

	const byPsgc = useMemo(() => new Map((places ?? []).map((p) => [p.psgc, p])), [places])
	const place = selected ? (byPsgc.get(selected) ?? null) : null
	const facility = facilityId ? (facilities.find((f) => f.id === facilityId) ?? null) : null
	const color = useMemo(() => Object.fromEntries(kinds.map((k) => [k.id, k.color])), [kinds])
	const counts = useMemo(() => facilities.reduce<Record<string, number>>((m, f) => ((m[f.kind] = (m[f.kind] ?? 0) + 1), m), {}), [facilities])
	const kindLabel = useMemo(() => Object.fromEntries(kinds.map((k) => [k.id, k.label])), [kinds])

	const features: FacilityFeatures = useMemo(() => {
		const on = new Set(kinds.filter((k) => k.on).map((k) => k.id))
		return { type: 'FeatureCollection', features: facilities.filter((f) => on.has(f.kind)).map((f) => ({ type: 'Feature', properties: { id: f.id, kind: f.kind, name: f.name }, geometry: { type: 'Point', coordinates: [f.lon, f.lat] } })) }
	}, [facilities, kinds])

	// Each barangay's land in medium or high hazard, scaled to the 95th percentile so a few very large ones do not wash out the rest.
	const heat: HeatFeatures = useMemo(() => {
		const list = places ?? []
		const cap = {} as Record<HazardId, number>
		for (const h of HAZARDS) {
			const v = list.map((p) => p[h.id][1] + p[h.id][2]).filter((x) => x > 0).sort((a, b) => a - b)
			cap[h.id] = v[Math.floor(v.length * 0.95)] || 1
		}
		return {
			type: 'FeatureCollection',
			features: list.map((p) => ({
				type: 'Feature',
				geometry: { type: 'Point', coordinates: p.at },
				properties: { flood: Math.min(1, (p.flood[1] + p.flood[2]) / cap.flood), landslide: Math.min(1, (p.landslide[1] + p.landslide[2]) / cap.landslide), surge: Math.min(1, (p.surge[1] + p.surge[2]) / cap.surge) },
			})),
		}
	}, [places])

	const towns = useMemo(() => {
		const m = new Map<string, string>()
		for (const p of places ?? []) if (!prov || p.prov === prov) m.set(p.town_psgc, p.town)
		return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]))
	}, [places, prov])
	const bgys = useMemo(() => (places ?? []).filter((p) => p.town_psgc === town).sort((a, b) => a.name.localeCompare(b.name)), [places, town])

	const pick = useCallback(
		(psgc: string, fly = true) => {
			const p = byPsgc.get(psgc)
			if (!p) return
			setSelected(psgc)
			setFacilityId(null)
			setProv(p.prov)
			setTown(p.town_psgc)
			if (fly) setFocus({ bbox: p.bbox, nonce: Date.now() })
		},
		[byPsgc],
	)
	const onMapBarangay = useCallback((psgc: string) => pick(psgc, false), [pick])
	const onMapFacility = useCallback((id: string) => setFacilityId(id), [])

	// The bounds of every town and province, so picking one moves the map to it.
	const boxes = useMemo(() => {
		const town = new Map<string, Box[]>()
		const prov = new Map<string, Box[]>()
		for (const p of places ?? []) {
			town.set(p.town_psgc, [...(town.get(p.town_psgc) ?? []), p.bbox])
			prov.set(p.prov, [...(prov.get(p.prov) ?? []), p.bbox])
		}
		return { town: new Map([...town].map(([k, v]) => [k, union(v)])), prov: new Map([...prov].map(([k, v]) => [k, union(v)])) }
	}, [places])
	const goTown = (psgc: string) => {
		const p = (places ?? []).find((x) => x.town_psgc === psgc)
		if (p) setProv(p.prov)
		setTown(psgc)
		const b = boxes.town.get(psgc)
		if (b) setFocus({ bbox: b, nonce: Date.now() })
	}
	const goProv = (slug: string) => {
		setProv(slug)
		setTown('')
		const b = slug ? boxes.prov.get(slug) : null
		if (b) setFocus({ bbox: b, nonce: Date.now() })
	}

	// The place named in the link, once there are places to find it among.
	useEffect(() => {
		if (!places || !linked.current) return
		const b = linked.current
		linked.current = null
		pick(b)
	}, [places, pick])

	// What is on the map rides in the hash, so the address bar can be shared as it stands.
	useEffect(() => {
		if (!open) return
		history.replaceState(null, '', `${window.location.pathname}${window.location.search}#map?h=${hazard ?? 'none'}&v=${view}${selected ? `&b=${selected}` : ''}`)
	}, [open, hazard, view, selected])

	const locate = () => {
		if (!navigator.geolocation) return setLocating('failed')
		setLocating('busy')
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const here: [number, number] = [pos.coords.longitude, pos.coords.latitude]
				setMe(here)
				setLocating('idle')
				const inside = (places ?? []).filter((p) => here[0] >= p.bbox[0] && here[0] <= p.bbox[2] && here[1] >= p.bbox[1] && here[1] <= p.bbox[3])
				const near = [...(inside.length ? inside : (places ?? []))].sort((a, b) => distance(here, a.at) - distance(here, b.at))[0]
				if (near && distance(here, near.at) < 30) pick(near.psgc)
				else setFocus({ bbox: [here[0] - 0.05, here[1] - 0.05, here[0] + 0.05, here[1] + 0.05], nonce: Date.now() })
			},
			() => setLocating('failed'),
			{ enableHighAccuracy: true, timeout: 10000 },
		)
	}

	// Nearest of each kind shown, from the reader if located, else from the barangay. The React compiler memoizes it.
	const origin: [number, number] | null = me ?? place?.at ?? null
	const nearest = !origin
		? []
		: kinds
				.filter((k) => k.on)
				.map((k) => ({
					kind: k,
					list: facilities
						.filter((f) => f.kind === k.id)
						.map((f) => ({ f, d: distance(origin, [f.lon, f.lat]) }))
						.sort((a, b) => a.d - b.d)
						.slice(0, 3),
				}))
				.filter((x) => x.list.length)

	const hz = HAZARDS.find((h) => h.id === hazard)
	const panel = !!place || nearest.length > 0

	return (
		<dialog
			ref={dialog}
			onClose={() => {
				setOpen(false)
				if (window.location.hash.startsWith('#map')) history.replaceState(null, '', window.location.pathname + window.location.search)
			}}
			aria-label='Hazard and preparedness map'
			className='m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-[var(--paper)] p-0 text-[var(--ink)] backdrop:bg-black/40 open:flex open:flex-col lg:overflow-hidden'
		>
			{/* The header is the hazard and how it is drawn, and the way out, on the dark ground. */}
			<div className='bb-ground flex shrink-0 items-start justify-between gap-4 border-b border-[var(--rule)] px-4 py-2 [color-scheme:dark] lg:items-center lg:px-6'>
				{/* The hazard and how to draw it, as the accident map's header does its filters: plain dropdowns on the dark ground. */}
				<div className='flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-1'>
					<p className='hidden text-[14px] font-extrabold tracking-[-0.01em] text-[var(--ink)] xl:block'>Hazard and preparedness map</p>
					<Select label='Hazard' value={hazard ?? 'none'} onChange={(v) => setHazard(v === 'none' ? null : (v as HazardId))} options={[...HAZARDS.map((h): [string, string] => [h.id, h.label]), ['none', 'None']]} plain />
					<Select label='Show' value={view} onChange={(v) => setView(v as View)} options={VIEWS.map((v): [string, string] => [v.id, v.label])} plain />
					<FacilityMenu kinds={kinds} counts={counts} onToggle={(id) => setKinds(kinds.map((x) => (x.id === id ? { ...x, on: !x.on } : x)))} />
					<Menu label='Place' value={<span className='max-w-[12rem] truncate'>{place ? place.name : 'Find a place'}</span>} width={380} shut={shut}>
						<div className='p-2.5'>
							<p className='mb-2 text-[12.5px] text-[var(--ink-3)]'>Search, tap the crosshair for places near you, or tap a barangay on the map.</p>
							<Search places={places} onBarangay={(p) => (pick(p), closePlace())} onTown={(t) => (goTown(t), closePlace())} onLocate={locate} locating={locating === 'busy'} />
							{locating === 'busy' ? <p className='mt-1.5 text-[12px] text-[var(--ink-3)]'>Finding you…</p> : null}
							{locating === 'failed' ? <p className='mt-1.5 text-[12px] text-[var(--ink-3)]'>Your location could not be read. Search or pick a place instead.</p> : null}
							<p className='mt-4 text-[12.5px] font-semibold text-[var(--ink-3)]'>Or browse by province and town</p>
							<div className='mt-2 space-y-1.5'>
								<select aria-label='Province' className={select} value={prov} onChange={(e) => goProv(e.target.value)}>
									<option value=''>All provinces</option>
									{Object.entries(PROVINCE_NAMES).map(([slug, name]) => (
										<option key={slug} value={slug}>
											{name}
										</option>
									))}
								</select>
								<select aria-label='Town' className={select} value={town} onChange={(e) => (e.target.value ? goTown(e.target.value) : setTown(''))} disabled={!places}>
									<option value=''>{places ? 'Pick a town' : 'Loading…'}</option>
									{towns.map(([psgc, name]) => (
										<option key={psgc} value={psgc}>
											{name}
										</option>
									))}
								</select>
								<select aria-label='Barangay' className={select} value={place && place.town_psgc === town ? place.psgc : ''} onChange={(e) => e.target.value && (pick(e.target.value), closePlace())} disabled={!town}>
									<option value=''>Pick a barangay</option>
									{bgys.map((b) => (
										<option key={b.psgc} value={b.psgc}>
											{b.name}
										</option>
									))}
								</select>
							</div>
						</div>
					</Menu>
				</div>
				<button type='button' onClick={() => dialog.current?.close()} aria-label='Close map' className='inline-flex h-10 cursor-pointer items-center justify-center text-[var(--ink-3)] transition hover:text-[var(--ink)]'>
					<XIcon size={16} weight='bold' aria-hidden='true' />
				</button>
			</div>

			<div className={`grid min-h-0 flex-1 ${panel ? 'lg:grid-cols-[minmax(0,1fr)_22rem]' : ''}`}>
				<div className={`relative min-h-0 ${panel ? 'h-[62dvh] lg:h-auto' : 'h-full min-h-[60dvh]'}`}>
					{open ? <Canvas hazard={hazard} view={view} facilities={features} kinds={kinds} heat={heat} selected={selected} focus={focus} me={me} onSelectBarangay={onMapBarangay} onSelectFacility={onMapFacility} /> : null}

					{/* The legend sits on the map it explains. On a phone it gives way to a picked place or facility. */}
					{hz ? (
						<div className={`absolute bottom-3 left-3 z-10 w-auto max-w-[calc(100%-1.5rem)] border lg:w-[19rem] border-[var(--rule)] bg-[var(--paper)]/95 p-3.5 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.45)] backdrop-blur ${place || facility ? 'max-lg:hidden' : ''}`}>
							<p className={label}>
								{hz.label} · {view === 'heat' ? 'where it gathers' : view === 'barangays' ? 'by barangay' : 'NOAH’s zones'}
							</p>
							{view === 'barangays' ? (
								<>
									<p className='mt-1.5 text-[12px] text-[var(--ink-3)]'>Share of each barangay’s land in medium or high hazard</p>
									<div className='mt-2 grid grid-cols-4 gap-1 text-[11px] text-[var(--ink-3)]'>
										{[
											['#f7e7b4', '2–10%'],
											[CLASS_COLORS[0], '10–30%'],
											[CLASS_COLORS[1], '30–50%'],
											[CLASS_COLORS[2], '50%+'],
										].map(([c, t]) => (
											<span key={t}>
												<span className='block h-2' style={{ background: c }} />
												<span className='mt-1 block tabular-nums'>{t}</span>
											</span>
										))}
									</div>
								</>
							) : (
								<>
									{view === 'heat' ? <p className='mt-1.5 text-[12px] leading-[1.5] text-[var(--ink-3)] max-lg:hidden'>Brighter where more land is in medium or high hazard. Zoom in and NOAH’s zones take over.</p> : null}
									<ul className='mt-2 flex gap-x-3 gap-y-1 text-[12px] lg:block lg:space-y-1'>
										{hz.classes.map((c, i) => (
											<li key={c} className='flex items-center gap-2'>
												<span className='size-3 shrink-0' style={{ background: CLASS_COLORS[i] }} /> <span className='font-semibold'>{CLASS_LABELS[i]}</span> <span className='truncate text-[var(--ink-3)] max-lg:hidden'>{c}</span>
											</li>
										))}
									</ul>
								</>
							)}
							<p className='mt-2 border-t border-[var(--rule)] pt-2 text-[11px] leading-[1.5] text-[var(--ink-3)] max-lg:hidden'>{hz.note}</p>
						</div>
					) : null}

					{/* On a phone the panel is below the fold, so the picked place is summed up on the map. */}
					{place && !facility ? (
						<div className='absolute inset-x-3 bottom-3 z-10 bg-[var(--paper)] p-4 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)] lg:hidden'>
							<div className='flex items-start justify-between gap-3'>
								<div className='min-w-0'>
									<p className='truncate text-[16px] font-extrabold leading-tight'>{place.name}</p>
									<p className='text-[12px] text-[var(--ink-3)]'>
										{place.town}, {PROVINCE_NAMES[place.prov] ?? place.prov}
										{place.pop ? ` · ${place.pop.toLocaleString('en-PH')} people` : ''}
									</p>
								</div>
								<button type='button' aria-label='Clear the place' onClick={() => (setSelected(null), setMe(null))} className='text-[var(--ink-3)] hover:text-[var(--ink)]'>
									<XIcon size={16} weight='bold' />
								</button>
							</div>
							<div className='mt-3'>
								<Exposure place={place} />
							</div>
							{nearest.length ? <p className='mt-3 text-[12px] text-[var(--ink-3)]'>The nearest facilities are listed below the map.</p> : null}
						</div>
					) : null}

					{facility ? (
						<div className='absolute inset-x-3 bottom-3 z-10 bg-[var(--paper)] p-4 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)] lg:inset-x-auto lg:bottom-4 lg:right-4 lg:w-[22rem]'>
							<div className='flex items-start justify-between gap-3'>
								<p className='flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em]' style={{ color: color[facility.kind] }}>
									<KindBadge kind={facility.kind} color={color[facility.kind] ?? '#888'} size={16} /> {kindLabel[facility.kind]}
								</p>
								<button type='button' aria-label='Close' onClick={() => setFacilityId(null)} className='text-[var(--ink-3)] hover:text-[var(--ink)]'>
									<XIcon size={14} weight='bold' />
								</button>
							</div>
							<p className='mt-1 text-[16px] font-bold leading-snug'>{facility.name}</p>
							<p className='text-[12.5px] text-[var(--ink-3)]'>{[facility.detail, facility.town, facility.prov ? PROVINCE_NAMES[facility.prov] : null].filter(Boolean).join(' · ')}</p>
							{origin ? <p className='mt-1 text-[12px] text-[var(--ink-3)]'>{km(distance(origin, [facility.lon, facility.lat]))} from {me ? 'you' : place?.name}, in a straight line</p> : null}
							<a href={facility.source.url} target='_blank' rel='noreferrer' className='mt-1.5 inline-flex items-center gap-0.5 text-[12px] text-[var(--ink-3)] hover:text-[var(--accent)]'>
								{facility.source.label} <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
							</a>
						</div>
					) : null}
				</div>

				{/* The panel: the picked place, read; with nothing picked there is nothing to say, so there is no panel. */}
				{panel ? (
				<aside className='flex min-h-0 flex-col overflow-y-auto border-t border-[var(--rule)] lg:border-l lg:border-t-0'>

						<section className='border-b border-[var(--rule)] bg-[var(--paper-2)] px-6 py-6'>
							{place ? (
								<>
									<div className='flex items-start justify-between gap-3'>
										<div>
											<p className={label}>Barangay</p>
											<p className='mt-1 text-[22px] font-extrabold leading-tight tracking-[-0.015em]'>{place.name}</p>
											<p className='mt-0.5 text-[12.5px] text-[var(--ink-3)]'>
												{place.town}, {PROVINCE_NAMES[place.prov] ?? place.prov}
											</p>
										</div>
										<button type='button' aria-label='Clear the place' onClick={() => (setSelected(null), setMe(null))} className='mt-1 text-[var(--ink-3)] hover:text-[var(--ink)]'>
											<XIcon size={16} weight='bold' />
										</button>
									</div>
									<dl className='mt-3 grid grid-cols-2 gap-3 border-y border-[var(--rule)] py-3'>
										<div>
											<dt className='text-[11px] text-[var(--ink-3)]'>Land</dt>
											<dd className='text-[15px] font-bold tabular-nums'>{place.area < 10 ? place.area.toFixed(1) : Math.round(place.area)} km²</dd>
										</div>
										<div>
											<dt className='text-[11px] text-[var(--ink-3)]'>People (2024)</dt>
											<dd className='text-[15px] font-bold tabular-nums'>{place.pop ? place.pop.toLocaleString('en-PH') : '—'}</dd>
										</div>
									</dl>
									<p className={`${label} mt-4`}>Its land in each hazard</p>
									<div className='mt-2'>
										<Exposure place={place} />
									</div>
								</>
							) : null}
							{nearest.length ? (
								<div className={place ? 'mt-6' : ''}>
									<p className={label}>Nearest {me ? 'to you' : `to ${place?.name}`}</p>
									<p className='mt-0.5 text-[11.5px] text-[var(--ink-3)]'>Straight-line distance, not the road.</p>
									<div className='mt-3 space-y-3'>
										{nearest.map(({ kind, list }) => (
											<div key={kind.id}>
												<p className='flex items-center gap-1.5 text-[12px] font-semibold'>
													<KindBadge kind={kind.id} color={kind.color} size={16} /> {kind.label}
												</p>
												<ul className='mt-1 divide-y divide-[var(--rule)] border-y border-[var(--rule)]'>
													{list.map(({ f, d }) => (
														<li key={f.id}>
															<button
																type='button'
																onClick={() => (setFacilityId(f.id), setFocus({ bbox: [f.lon - 0.01, f.lat - 0.01, f.lon + 0.01, f.lat + 0.01], nonce: Date.now() }))}
																className={`flex w-full items-baseline justify-between gap-3 py-1.5 text-left text-[13px] hover:text-[var(--accent)] ${facilityId === f.id ? 'font-semibold text-[var(--accent)]' : ''}`}
															>
																<span className='min-w-0 truncate'>{f.name}</span>
																<span className='shrink-0 tabular-nums text-[var(--ink-3)]'>{km(d)}</span>
															</button>
														</li>
													))}
												</ul>
											</div>
										))}
									</div>
								</div>
							) : null}
						</section>
				</aside>
				) : null}
			</div>
		</dialog>
	)
}
