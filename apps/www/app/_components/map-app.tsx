'use client'

import {
	ArrowLeftIcon,
	ArrowRightIcon,
	ArrowUpRightIcon,
	CaretRightIcon,
	MagnifyingGlassIcon,
	MinusIcon,
	ShuffleIcon,
} from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EASE } from '@betterbarmm/editorial'
import type { MapArea, MapBarangay, MapMeasure, MapRegion, MapUnit, MapUnitDetail } from '../_lib/map-data'
import type { SceneBarangay, SceneFocus, SceneStyle } from './map-scene'

/* ============================================================
   The region as something to explore

   Three levels, one camera. The region shows every town as a block; pick one
   and the camera flies in, its barangays rise out of it and the panel turns
   into that town; pick a barangay and it flies again. Back, Escape or the
   breadcrumb fly out a level. Drag to pan, right-drag to turn, scroll to zoom.

   The blocks are a WebGL scene (map-scene.tsx), loaded only when the map
   opens. What their height and colour mean is the layer: the areas, people,
   density, the town's NTA per resident, how much the travel guide holds, or
   the party that won its district in 2026 — four workspaces read off one map.

   Towns explored are remembered in this browser only, as a small game: a
   count to fill, and a "surprise me" that flies somewhere not yet seen.
   ============================================================ */

const MapScene = dynamic(() => import('./map-scene'), {
	ssr: false,
	loading: () => <p className='absolute inset-0 grid place-items-center text-[0.8125rem] text-[var(--ink-3)]'>Drawing the region…</p>,
})

type Level =
	| { kind: 'region' }
	| { kind: 'area'; area: string }
	| { kind: 'unit'; area: string; unit: string }
	| { kind: 'barangay'; area: string; unit: string; barangay: number }

type LayerId = 'area' | 'people' | 'density' | 'nta' | 'guide' | 'election'
const LAYERS: { id: LayerId; label: string; note: string }[] = [
	{ id: 'area', label: 'Areas', note: 'Each area its own shade. Towns you have explored sit darker.' },
	{ id: 'people', label: 'People', note: 'Population, 2024 census. Taller is more people.' },
	{ id: 'density', label: 'Density', note: 'People per km², on a log scale.' },
	{ id: 'nta', label: 'NTA', note: 'The town’s National Tax Allotment per resident, latest year it reported (BLGF).' },
	{ id: 'guide', label: 'Travel', note: 'Named places, eateries and stays in the travel guide.' },
	{ id: 'election', label: '2026 vote', note: 'The party that won the town’s parliamentary district (BAA 86 districts).' },
]

const STORE = 'bb-map-explored'

/** Each area its own step of the brand crimson, so a town's area reads at a glance. */
const SHADE: Record<string, number> = {
	basilan: 46,
	'lanao-del-sur': 60,
	'maguindanao-del-norte': 38,
	'maguindanao-del-sur': 52,
	'tawi-tawi': 42,
	'cotabato-city': 70,
}
const tint = (area: string, boost = 0) =>
	`color-mix(in srgb, var(--accent) ${Math.min(100, (SHADE[area] ?? 45) + boost)}%, var(--paper))`

const figure = (value: number | null | undefined) => (value == null ? '—' : value.toLocaleString('en-PH'))

/* ---- Colour as numbers, for the scene (WebGL takes no color-mix) ---- */

const hex = (rgb: number[]) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`
const rgbOf = (value: string) => {
	const h = value.trim().replace('#', '')
	const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h.slice(0, 6)
	return [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16) || 0)
}
const mix = (a: string, b: string, t: number) => {
	const [x, y] = [rgbOf(a), rgbOf(b)]
	return hex(x.map((c, i) => c + (y[i] - c) * t))
}

function useTheme() {
	const [tokens, setTokens] = useState({ accent: '#8f2a1f', brass: '#a8813f', paper: '#ffffff', ink: '#191713' })
	useEffect(() => {
		const read = () => {
			const css = getComputedStyle(document.body)
			const get = (name: string, fallback: string) => {
				const v = css.getPropertyValue(name).trim()
				return v.startsWith('#') ? v : fallback
			}
			setTokens({ accent: get('--accent', '#8f2a1f'), brass: get('--brass', '#a8813f'), paper: get('--paper', '#ffffff'), ink: get('--ink', '#191713') })
		}
		read()
		const watch = new MutationObserver(read)
		watch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] })
		return () => watch.disconnect()
	}, [])
	return tokens
}

/** A layer's raw value for a town, or null where it is not known. */
function valueOf(layer: LayerId, u: MapUnit): number | null {
	if (layer === 'people') return u.population
	if (layer === 'density') return u.layers.density
	if (layer === 'nta') return u.layers.ntaPerResident
	if (layer === 'guide') return u.layers.guide
	return null
}

const layerText = (layer: LayerId, u: MapUnit, data: MapRegion) => {
	const v = valueOf(layer, u)
	if (layer === 'election') return data.parties.find((p) => p.id === u.layers.party)?.label ?? 'Several districts'
	if (layer === 'area') return u.isCapital ? 'Capital' : null
	if (v == null) return 'not reported'
	if (layer === 'people') return `${figure(v)} people`
	if (layer === 'density') return `${figure(v)} per km²`
	if (layer === 'nta') return `₱${figure(v)} per resident`
	return `${v} in the guide`
}

function readExplored(): Set<string> {
	try {
		return new Set(JSON.parse(localStorage.getItem(STORE) ?? '[]') as string[])
	} catch {
		return new Set()
	}
}

const detailCache = new Map<string, Promise<MapUnitDetail>>()
const loadUnit = (area: string, unit: string) => {
	const key = `${area}/${unit}`
	if (!detailCache.has(key)) {
		detailCache.set(
			key,
			fetch(`/api/map/${area}/${unit}`).then((res) => {
				if (!res.ok) throw new Error('not found')
				return res.json() as Promise<MapUnitDetail>
			}),
		)
	}
	return detailCache.get(key)!
}

export function MapApp({ data }: { data: MapRegion }) {
	// Under reduced motion the camera cuts rather than flies.
	const reduced = Boolean(useReducedMotion())
	const theme = useTheme()
	const [level, setLevel] = useState<Level>({ kind: 'region' })
	const [layer, setLayer] = useState<LayerId>('area')
	const [hover, setHover] = useState<{ key: string; label: string } | null>(null)
	const [detail, setDetail] = useState<MapUnitDetail | null>(null)
	const [failed, setFailed] = useState(false)
	const [explored, setExplored] = useState<Set<string>>(() => new Set())
	const [query, setQuery] = useState('')

	const rootRef = useRef<HTMLDivElement>(null)

	useEffect(() => setExplored(readExplored()), [])

	const areaOf = (slug: string) => data.areas.find((one) => one.slug === slug)
	const unitKey = (u: { area: string; slug: string }) => `${u.area}/${u.slug}`
	const unitByKey = useMemo(() => new Map(data.units.map((u) => [unitKey(u), u])), [data.units])

	/* ---- Moving between levels ---- */

	const goRegion = useCallback(() => {
		setLevel({ kind: 'region' })
		setDetail(null)
	}, [])

	const goArea = useCallback((area: string) => {
		setLevel({ kind: 'area', area })
		setDetail(null)
	}, [])

	const goUnit = useCallback((area: string, unit: string) => {
		setLevel({ kind: 'unit', area, unit })
		setFailed(false)
		setDetail((current) => (current?.slug === unit && current.area.slug === area ? current : null))
		loadUnit(area, unit)
			.then(setDetail)
			.catch(() => setFailed(true))
		setExplored((seen) => {
			const next = new Set(seen).add(`${area}/${unit}`)
			try {
				localStorage.setItem(STORE, JSON.stringify([...next]))
			} catch {
				/* storage unavailable: the count simply does not persist */
			}
			return next
		})
	}, [])

	const goBarangay = useCallback((area: string, unit: string, index: number) => {
		setLevel({ kind: 'barangay', area, unit, barangay: index })
	}, [])

	const up = useCallback(() => {
		if (level.kind === 'barangay') goUnit(level.area, level.unit)
		else if (level.kind === 'unit') {
			const area = areaOf(level.area)
			if (area && area.units.length > 1) goArea(level.area)
			else goRegion()
		} else if (level.kind === 'area') goRegion()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [level, goUnit, goArea, goRegion])

	const surprise = () => {
		const pool = data.units.filter((u) => !explored.has(unitKey(u)))
		const pick = (pool.length ? pool : data.units)[Math.floor(Math.random() * (pool.length || data.units.length))]
		if (pick) goUnit(pick.area, pick.slug)
	}

	/* Escape flies out a level before it closes anything. The dialog's own
	   cancel is only let through at the top. */
	useEffect(() => {
		const dialog = rootRef.current?.closest('dialog')
		if (!dialog) return
		const onCancel = (event: Event) => {
			if (level.kind !== 'region') {
				event.preventDefault()
				up()
			}
		}
		dialog.addEventListener('cancel', onCancel)
		return () => dialog.removeEventListener('cancel', onCancel)
	}, [level, up])

	/* ---- What is on screen ---- */

	const inUnit = level.kind === 'unit' || level.kind === 'barangay'
	const focusArea = level.kind === 'region' ? null : level.area
	const ready = inUnit && detail?.slug === level.unit && detail.area.slug === level.area

	const focus: SceneFocus =
		level.kind === 'region'
			? { kind: 'region' }
			: level.kind === 'area'
				? { kind: 'area', area: level.area }
				: level.kind === 'unit'
					? { kind: 'unit', key: `${level.area}/${level.unit}` }
					: { kind: 'barangay', key: `${level.area}/${level.unit}`, index: level.barangay }

	/* The layer, as a height and a colour per town. */
	const { styles, legend } = useMemo(() => {
		const styles = new Map<string, SceneStyle>()
		const none = mix(theme.paper, theme.ink, 0.16)
		const values = data.units.map((u) => valueOf(layer, u)).filter((v): v is number => v != null && v > 0)
		const max = Math.max(1, ...values)
		const min = Math.min(...values, max)
		const scale = (v: number) =>
			layer === 'density' ? Math.log(v / min + 1) / Math.log(max / min + 1) : Math.sqrt(v / max)
		const ramp = layer === 'nta' ? theme.brass : theme.accent
		for (const u of data.units) {
			const key = unitKey(u)
			if (layer === 'area') {
				const shade = ((SHADE[u.area] ?? 45) + (explored.has(key) ? 12 : 0)) / 100
				styles.set(key, { height: u.isCapital ? 12 : 7, color: mix(theme.paper, theme.accent, shade) })
			} else if (layer === 'election') {
				const party = data.parties.find((p) => p.id === u.layers.party)
				styles.set(key, { height: party ? 9 : 3, color: party?.color ?? none })
			} else {
				const v = valueOf(layer, u)
				const t = v == null || v <= 0 ? null : scale(v)
				styles.set(key, t == null ? { height: 1.5, color: none } : { height: 3 + t * 75, color: mix(theme.paper, ramp, 0.18 + t * 0.82) })
			}
		}
		const legend =
			layer === 'area' || layer === 'election'
				? null
				: {
						from: mix(theme.paper, ramp, 0.18),
						to: ramp,
						min: layer === 'nta' ? `₱${figure(min)}` : figure(min),
						max: layer === 'nta' ? `₱${figure(max)}` : figure(max),
					}
		return { styles, legend }
	}, [data, layer, theme, explored])

	const sceneBarangays: SceneBarangay[] | null = useMemo(
		() =>
			ready
				? detail.barangays.map((b) => ({
						name: b.name,
						d: b.d,
						color: b.captain ? mix(theme.paper, theme.accent, 0.3) : mix(theme.paper, theme.ink, 0.1),
					}))
				: null,
		[ready, detail, theme],
	)

	const sceneUnits = useMemo(
		() => data.units.map((u) => ({ key: unitKey(u), name: u.name, area: u.area, d: u.d })),
		[data.units],
	)

	const hoverText = (() => {
		if (!hover) return null
		const u = unitByKey.get(hover.key)
		const extra = u ? layerText(layer, u, data) : null
		return { name: hover.label, extra }
	})()

	const matches = useMemo(() => {
		const q = query.trim().toLowerCase()
		if (!q) return []
		return data.areas
			.flatMap((area) => area.units.map((u) => ({ ...u, area: area.slug, areaName: area.name })))
			.filter((u) => u.name.toLowerCase().includes(q))
			.slice(0, 8)
	}, [query, data.areas])

	const layerNote = LAYERS.find((l) => l.id === layer)!.note

	return (
		<div ref={rootRef} className='grid h-full min-h-0 lg:grid-cols-[minmax(0,1fr)_26rem]'>
			{/* ---- The map ---- */}
			<div
				className='relative min-h-[50svh] overflow-hidden'
				style={{
					background:
						'radial-gradient(120% 90% at 50% 10%, var(--paper) 0%, color-mix(in srgb, var(--paper-2) 80%, var(--paper)) 60%, var(--paper-2) 100%)',
				}}
			>
				<MapScene
					units={sceneUnits}
					land={data.land}
					outside={data.outside}
					styles={styles}
					focus={focus}
					barangays={sceneBarangays}
					reduced={reduced}
					onHover={(key, label) => setHover(key && label ? { key, label } : null)}
					onUnit={(key) => {
						const u = unitByKey.get(key)
						if (u) goUnit(u.area, u.slug)
					}}
					onBarangay={(index) => {
						if (detail) goBarangay(detail.area.slug, detail.slug, index)
					}}
					onBackground={() => {
						if (level.kind !== 'region') up()
					}}
				/>

				{/* ---- HUD ---- */}
				<nav aria-label='Map location' className='pointer-events-none absolute left-4 top-4 right-4 flex flex-wrap items-center gap-1.5'>
					<Crumb onClick={goRegion} active={level.kind === 'region'}>
						BARMM
					</Crumb>
					{focusArea && areaOf(focusArea) && (areaOf(focusArea)!.units.length > 1 || level.kind === 'area') ? (
						<>
							<CaretRightIcon size={12} className='text-[var(--ink-mute)]' aria-hidden='true' />
							<Crumb onClick={() => goArea(focusArea)} active={level.kind === 'area'}>
								{areaOf(focusArea)!.name}
							</Crumb>
						</>
					) : null}
					{inUnit ? (
						<>
							<CaretRightIcon size={12} className='text-[var(--ink-mute)]' aria-hidden='true' />
							<Crumb onClick={() => goUnit(level.area, level.unit)} active={level.kind === 'unit'}>
								{detail?.slug === level.unit ? detail.name : '…'}
							</Crumb>
						</>
					) : null}
					{level.kind === 'barangay' && ready ? (
						<>
							<CaretRightIcon size={12} className='text-[var(--ink-mute)]' aria-hidden='true' />
							<Crumb active>{detail.barangays[level.barangay]?.name}</Crumb>
						</>
					) : null}
				</nav>

				{/* Layers and their key. */}
				<div className='absolute left-4 top-14 w-[min(19rem,calc(100%-2rem))] border border-[var(--rule)] bg-[var(--paper)]/95 p-3 shadow-sm backdrop-blur'>
					<p className='font-mono text-[0.59375rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>Show the towns by</p>
					<div role='radiogroup' aria-label='Map layer' className='mt-2 flex flex-wrap gap-1'>
						{LAYERS.map((l) => (
							<button
								key={l.id}
								type='button'
								role='radio'
								aria-checked={layer === l.id}
								onClick={() => setLayer(l.id)}
								className='cursor-pointer border px-2 py-1 text-[0.71875rem] font-semibold transition aria-checked:border-[var(--ink)] aria-checked:bg-[var(--ink)] aria-checked:text-[var(--paper)] border-[var(--rule)] text-[var(--ink-2)] hover:border-[var(--ink)]'
							>
								{l.label}
							</button>
						))}
					</div>
					<p className='mt-2.5 text-[0.71875rem] leading-[1.5] text-[var(--ink-3)]'>{layerNote}</p>
					{legend ? (
						<div className='mt-2'>
							<div className='h-2' style={{ background: `linear-gradient(90deg, ${legend.from}, ${legend.to})` }} />
							<div className='num mt-1 flex justify-between text-[0.65625rem] text-[var(--ink-3)]'>
								<span>{legend.min}</span>
								<span>{legend.max}</span>
							</div>
						</div>
					) : layer === 'election' ? (
						<ul className='mt-2 grid gap-1'>
							{data.parties.map((p) => (
								<li key={p.id} className='flex items-center gap-2 text-[0.71875rem]'>
									<span
										aria-hidden='true'
										className='size-2.5 shrink-0 border border-[var(--rule)]'
										style={{ background: p.color ?? mix(theme.paper, theme.ink, 0.16) }}
									/>
									<span className='flex-1 text-[var(--ink-2)]'>
										{p.label}
										{p.color ? '' : <span className='text-[var(--ink-mute)]'> · no colour on file</span>}
									</span>
									<span className='num text-[var(--ink-3)]'>{p.seats}</span>
								</li>
							))}
						</ul>
					) : null}
				</div>

				<div className='pointer-events-none absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3'>
					<AnimatePresence>
						{hoverText ? (
							<motion.p
								key={hover!.key}
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15 }}
								className='border border-[var(--rule)] bg-[var(--paper)] px-3 py-1.5 text-[0.8125rem] font-semibold text-[var(--ink)] shadow-sm'
							>
								{hoverText.name}
								{hoverText.extra ? <span className='ml-2 font-normal text-[var(--ink-3)]'>{hoverText.extra}</span> : null}
							</motion.p>
						) : (
							<span />
						)}
					</AnimatePresence>

					<div className='pointer-events-auto flex items-center gap-1.5'>
						<p className='hidden border border-[var(--rule)] bg-[var(--paper)] px-3 py-1.5 text-[0.75rem] text-[var(--ink-2)] sm:block'>
							<span className='num font-semibold text-[var(--ink)]'>{explored.size}</span> of {data.units.length}{' '}
							towns explored
						</p>
						<HudButton label='Surprise me' onClick={surprise}>
							<ShuffleIcon size={16} weight='bold' />
						</HudButton>
						{level.kind !== 'region' ? (
							<HudButton label='Zoom out' onClick={up}>
								<MinusIcon size={16} weight='bold' />
							</HudButton>
						) : null}
					</div>
				</div>
			</div>

			{/* ---- The panel ---- */}
			<aside
				aria-live='polite'
				className='min-h-0 overflow-y-auto border-t border-[var(--rule)] bg-[var(--paper)] lg:border-l lg:border-t-0'
			>
				<AnimatePresence mode='wait' initial={false}>
					<motion.div
						key={
							level.kind === 'barangay'
								? `b-${level.unit}-${level.barangay}`
								: level.kind === 'unit'
									? `u-${level.unit}-${ready ? 1 : 0}`
									: level.kind === 'area'
										? `a-${level.area}`
										: 'region'
						}
						initial={{ opacity: 0, x: 16 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -8 }}
						transition={{ duration: 0.25, ease: EASE }}
						className='p-6 lg:p-7'
					>
						{level.kind === 'region' ? (
							<RegionPanel
								data={data}
								query={query}
								setQuery={setQuery}
								matches={matches}
								onArea={goArea}
								onUnit={goUnit}
							/>
						) : level.kind === 'area' ? (
							<AreaPanel area={areaOf(level.area)!} units={data.units} onUnit={goUnit} />
						) : failed ? (
							<p className='text-[0.875rem] text-[var(--ink-3)]'>This town could not be loaded. Zoom out and try again.</p>
						) : !ready ? (
							<p className='text-[0.875rem] text-[var(--ink-3)]'>Loading…</p>
						) : level.kind === 'unit' ? (
							<UnitPanel
								detail={detail}
								area={areaOf(detail.area.slug)}
								onBarangay={(i) => goBarangay(detail.area.slug, detail.slug, i)}
							/>
						) : (
							<BarangayPanel
								detail={detail}
								index={level.barangay}
								onMove={(i) => goBarangay(detail.area.slug, detail.slug, i)}
								onBack={() => goUnit(detail.area.slug, detail.slug)}
							/>
						)}
					</motion.div>
				</AnimatePresence>
			</aside>
		</div>
	)
}

/* ============================================================
   Panels
   ============================================================ */

function RegionPanel({
	data,
	query,
	setQuery,
	matches,
	onArea,
	onUnit,
}: {
	data: MapRegion
	query: string
	setQuery: (q: string) => void
	matches: { slug: string; name: string; area: string; areaName: string }[]
	onArea: (slug: string) => void
	onUnit: (area: string, unit: string) => void
}) {
	const total = data.areas.reduce((sum, a) => sum + (a.population ?? 0), 0)
	return (
		<>
			<p className='bb-label'>Explore the region</p>
			<h2 className='mt-4 text-[1.8rem] font-extrabold leading-[1.05] tracking-[-0.035em]'>
				Pick a town. Then a barangay.
			</h2>
			<p className='mt-3 text-[0.875rem] leading-[1.7] text-[var(--ink-2)]'>
				{data.units.length} towns are drawn and {figure(total)} people live in them and the rest of the region. Click any
				town to fly in and see its officials, budget, vote, travel guide and every barangay. Drag to move, right-drag to
				turn, scroll to zoom.
			</p>

			<label className='mt-6 flex items-center gap-2 border border-[var(--rule)] px-3 py-2.5 focus-within:border-[var(--ink)]'>
				<MagnifyingGlassIcon size={16} className='text-[var(--ink-3)]' aria-hidden='true' />
				<span className='sr-only'>Find a town</span>
				<input
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder='Find a town'
					className='w-full bg-transparent text-[0.875rem] outline-none'
				/>
			</label>
			{matches.length ? (
				<ul className='mt-2 border border-[var(--rule)]'>
					{matches.map((m) => (
						<li key={`${m.area}/${m.slug}`}>
							<button
								type='button'
								onClick={() => onUnit(m.area, m.slug)}
								className='flex w-full cursor-pointer items-baseline justify-between gap-3 border-b border-[var(--rule-soft)] px-3 py-2 text-left text-[0.875rem] last:border-b-0 hover:bg-[var(--paper-2)]'
							>
								<span className='font-semibold'>{m.name}</span>
								<span className='text-[0.75rem] text-[var(--ink-3)]'>{m.areaName}</span>
							</button>
						</li>
					))}
				</ul>
			) : null}

			<Section title='2026 Parliament, district seats'>
				<ul>
					{data.parties.map((p) => (
						<li key={p.id} className='flex items-center gap-3 border-b border-[var(--rule-soft)] py-2'>
							<span aria-hidden='true' className='size-3 shrink-0 border border-[var(--rule)]' style={{ background: p.color ?? 'var(--paper-2)' }} />
							<span className='flex-1 text-[0.84375rem]'>{p.label}</span>
							<span className='num text-[0.75rem] text-[var(--ink-3)]'>{p.seats}</span>
						</li>
					))}
				</ul>
				<p className='mt-2 text-[0.75rem] leading-5 text-[var(--ink-3)]'>Switch the map to “2026 vote” to see where each was won.</p>
			</Section>

			<Section title='Areas'>
				<ul>
					{data.areas.map((a) => (
						<li key={a.slug}>
							<button
								type='button'
								onClick={() => (a.units.length === 1 ? onUnit(a.slug, a.units[0].slug) : onArea(a.slug))}
								className='group flex w-full cursor-pointer items-center gap-3 border-b border-[var(--rule-soft)] py-2.5 text-left'
							>
								<span aria-hidden='true' className='size-3 shrink-0' style={{ background: tint(a.slug) }} />
								<span className='flex-1 text-[0.875rem] font-semibold group-hover:text-[var(--accent)]'>{a.name}</span>
								<span className='num text-[0.75rem] text-[var(--ink-3)]'>{a.towns} {a.towns === 1 ? 'city' : 'towns'}</span>
							</button>
						</li>
					))}
				</ul>
			</Section>
			<p className='mt-6 text-[0.75rem] leading-5 text-[var(--ink-3)]'>
				Outlines from{' '}
				<a href={data.source.href} target='_blank' rel='noreferrer' className='underline underline-offset-4'>
					{data.source.label}
				</a>
				, simplified. The Special Geographic Area has no published outline yet: its towns are listed, not drawn.
			</p>
		</>
	)
}

function AreaPanel({
	area,
	units,
	onUnit,
}: {
	area: MapArea
	units: MapUnit[]
	onUnit: (area: string, unit: string) => void
}) {
	const drawn = new Set(units.filter((u) => u.area === area.slug).map((u) => u.slug))
	return (
		<>
			<p className='bb-label'>{area.kind}</p>
			<h2 className='mt-4 text-[2rem] font-extrabold leading-[1.05] tracking-[-0.035em]'>{area.name}</h2>
			{area.tagline ? <p className='mt-3 text-[0.875rem] leading-[1.7] text-[var(--ink-2)]'>{area.tagline}</p> : null}

			<Stats
				items={[
					['People', figure(area.population)],
					['Land, km²', figure(area.areaKm2)],
					['Towns', figure(area.towns)],
					['Barangays', figure(area.barangays)],
				]}
			/>

			<Section title='People'>
				<Rows
					rows={[
						...area.leaders.map((l) => [l.role, l.name] as [string, string]),
						...(area.capital ? [['Capital', area.capital] as [string, string]] : []),
						...(area.seats != null ? [['Seats in Parliament', `${area.seats} district`] as [string, string]] : []),
						...(area.languages.length ? [['Languages', area.languages.join(', ')] as [string, string]] : []),
					]}
				/>
			</Section>

			{area.spending ? (
				<Section title='Budget'>
					<Stats
						items={[
							[`Built, FY ${area.spending.firstYear}–${area.spending.latestYear}`, area.spending.total],
							[`FY ${area.spending.latestYear}, ${area.spending.projects} projects`, area.spending.latest],
						]}
					/>
					<p className='mt-3 text-[0.75rem] leading-5 text-[var(--ink-3)]'>
						Regional construction naming this area — not the area’s own budget.
					</p>
				</Section>
			) : null}

			<Section title={`Towns (${area.units.length})`}>
				<ul className='grid grid-cols-2 gap-x-4'>
					{area.units.map((u) => (
						<li key={u.slug}>
							<button
								type='button'
								onClick={() => onUnit(area.slug, u.slug)}
								className='w-full cursor-pointer border-b border-[var(--rule-soft)] py-2 text-left text-[0.84375rem] hover:text-[var(--accent)]'
							>
								{u.name}
								{drawn.has(u.slug) ? null : <span className='ml-1 text-[0.6875rem] text-[var(--ink-mute)]'>· no outline</span>}
							</button>
						</li>
					))}
				</ul>
			</Section>
		</>
	)
}

type UnitTab = 'overview' | 'travel' | 'food' | 'budget' | 'election' | 'bills' | 'resolutions'

function UnitPanel({
	detail,
	area,
	onBarangay,
}: {
	detail: MapUnitDetail
	area: MapArea | undefined
	onBarangay: (index: number) => void
}) {
	const [tab, setTab] = useState<UnitTab>('overview')
	const [filter, setFilter] = useState('')
	const list = detail.barangays
		.map((b, index) => ({ b, index }))
		.filter(({ b }) => b.name.toLowerCase().includes(filter.trim().toLowerCase()))
	const r = detail.related
	const elsewhere = (area?.places ?? []).filter((p) => p.municipality !== detail.name)

	const tabs: { id: UnitTab; label: string; count?: number }[] = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'travel', label: 'Travel', count: (detail.travel?.whereToGo.length ?? 0) + (detail.travel?.eat.length ?? 0) + (detail.travel?.stay.length ?? 0) },
		{ id: 'food', label: 'Food', count: detail.foods.length },
		{ id: 'budget', label: 'Budget' },
		{ id: 'election', label: 'Election' },
		{ id: 'bills', label: 'Bills', count: r.acts.length + r.bills.length },
		{ id: 'resolutions', label: 'Resolutions', count: r.resolutions.length },
	]

	return (
		<>
			<p className='bb-label'>
				{detail.classification}
				{detail.isCapital ? ' · Capital' : ''} · {detail.area.name}
			</p>
			<h2 className='mt-4 text-[2rem] font-extrabold leading-[1.05] tracking-[-0.035em]'>{detail.name}</h2>
			{detail.alsoKnownAs ? (
				<p className='mt-2 text-[0.8125rem] text-[var(--ink-3)]'>Also known as {detail.alsoKnownAs}</p>
			) : null}

			{/* Tabs: one row, scrolling sideways on a narrow panel rather than wrapping. */}
			<div role='tablist' aria-label={`About ${detail.name}`} className='-mx-1 mt-6 flex gap-1 overflow-x-auto border-b border-[var(--rule)] pb-px'>
				{tabs.map((t) => (
					<button
						key={t.id}
						type='button'
						role='tab'
						aria-selected={tab === t.id}
						onClick={() => setTab(t.id)}
						className='relative shrink-0 cursor-pointer px-2.5 py-2 text-[0.78125rem] font-semibold text-[var(--ink-3)] transition hover:text-[var(--ink)] aria-selected:text-[var(--ink)]'
					>
						{t.label}
						{t.count ? <span className='num ml-1 text-[0.65625rem] text-[var(--ink-mute)]'>{t.count}</span> : null}
						{tab === t.id ? (
							<motion.span layoutId='map-tab' className='absolute inset-x-1 -bottom-px h-0.5 bg-[var(--accent)]' />
						) : null}
					</button>
				))}
			</div>

			<AnimatePresence mode='wait' initial={false}>
				<motion.div
					key={tab}
					role='tabpanel'
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.18 }}
				>
					{tab === 'overview' ? (
						<>
							<Stats
								items={[
									['People, 2024', figure(detail.population)],
									['Since 2020', detail.growth == null ? '—' : `${detail.growth > 0 ? '+' : ''}${detail.growth}%`],
									['Land, km²', figure(detail.areaKm2)],
									['Per km²', figure(detail.density)],
								]}
							/>

							<Section title={detail.term ? `Officials · ${detail.term}` : 'Officials'}>
								{detail.officials.length ? (
									<Rows rows={detail.officials.map((o) => [o.role, `${o.name}${o.party ? ` · ${o.party}` : ''}`])} />
								) : (
									<p className='text-[0.8125rem] text-[var(--ink-3)]'>COMELEC recorded no canvass for this town this term.</p>
								)}
								{detail.council.length ? (
									<p className='mt-3 text-[0.8125rem] leading-6 text-[var(--ink-2)]'>
										<span className='text-[var(--ink-3)]'>Council: </span>
										{detail.council.join(', ')}
									</p>
								) : null}
							</Section>

							<Section title={`Barangays (${detail.barangays.length})`}>
								<p className='text-[0.8125rem] leading-6 text-[var(--ink-2)]'>
									DILG’s directory names a captain for{' '}
									<span className='font-semibold text-[var(--ink)]'>
										{detail.captainsListed} of {detail.barangays.length}
									</span>
									. Shaded on the map where it does.
								</p>
								<label className='mt-3 flex items-center gap-2 border border-[var(--rule)] px-3 py-2 focus-within:border-[var(--ink)]'>
									<MagnifyingGlassIcon size={14} className='text-[var(--ink-3)]' aria-hidden='true' />
									<span className='sr-only'>Find a barangay</span>
									<input
										value={filter}
										onChange={(event) => setFilter(event.target.value)}
										placeholder='Find a barangay'
										className='w-full bg-transparent text-[0.84375rem] outline-none'
									/>
								</label>
								<ul className='mt-2 max-h-72 overflow-y-auto'>
									{list.map(({ b, index }) => (
										<li key={`${b.name}-${index}`}>
											<button
												type='button'
												onClick={() => onBarangay(index)}
												className='flex w-full cursor-pointer items-baseline justify-between gap-3 border-b border-[var(--rule-soft)] py-2 text-left text-[0.84375rem] hover:text-[var(--accent)]'
											>
												<span>{b.name}</span>
												<span className='truncate text-[0.75rem] text-[var(--ink-3)]'>{b.captain ?? '—'}</span>
											</button>
										</li>
									))}
								</ul>
							</Section>

							<a href={detail.lguHref} className='bb-btn bb-btn-solid mt-8'>
								Full local government record
								<ArrowUpRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
							</a>
						</>
					) : tab === 'travel' ? (
						<TravelTab detail={detail} elsewhere={elsewhere} knownFor={area?.knownFor ?? []} />
					) : tab === 'food' ? (
						<Section title={`What ${detail.area.name} eats`}>
							{detail.foods.length ? (
								<ul>
									{detail.foods.map((f) => (
										<li key={f.name} className='border-b border-[var(--rule-soft)] py-3'>
											<p className='text-[0.875rem] font-semibold'>
												{f.name}{' '}
												<span className='text-[0.75rem] font-normal text-[var(--ink-3)]'>
													· {f.tradition}
													{f.essential ? ' · essential' : ''}
												</span>
											</p>
											<p className='mt-1 text-[0.8125rem] leading-5 text-[var(--ink-2)]'>{f.summary}</p>
											<p className='mt-1 text-[0.75rem] leading-5 text-[var(--ink-3)]'>{f.whereToFind}</p>
										</li>
									))}
								</ul>
							) : (
								<p className='text-[0.8125rem] text-[var(--ink-3)]'>No dish in the guide is tied to the traditions spoken here.</p>
							)}
							<p className='mt-3 text-[0.75rem] leading-5 text-[var(--ink-3)]'>
								Dishes of the culinary traditions of the languages spoken in {detail.area.name}, from the travel guide.
							</p>
						</Section>
					) : tab === 'budget' ? (
						<BudgetTab detail={detail} />
					) : tab === 'election' ? (
						<ElectionTab detail={detail} />
					) : tab === 'bills' ? (
						<>
							<ScopeNote detail={detail} />
							{r.acts.length ? (
								<Section title={`Laws (${r.acts.length})`}>
									<Measures items={r.acts} label='BAA' />
								</Section>
							) : null}
							<Section title={`Bills (${r.bills.length})`}>
								{r.bills.length ? (
									<Measures items={r.bills} label='Bill' />
								) : (
									<p className='text-[0.8125rem] text-[var(--ink-3)]'>No bill names it.</p>
								)}
							</Section>
						</>
					) : (
						<>
							<ScopeNote detail={detail} />
							<Section title={`Adopted resolutions (${r.resolutions.length})`}>
								{r.resolutions.length ? (
									<Measures items={r.resolutions} label='Res.' />
								) : (
									<p className='text-[0.8125rem] text-[var(--ink-3)]'>No adopted resolution names it.</p>
								)}
							</Section>
						</>
					)}
				</motion.div>
			</AnimatePresence>
		</>
	)
}

function TravelTab({
	detail,
	elsewhere,
	knownFor,
}: {
	detail: MapUnitDetail
	elsewhere: MapArea['places']
	knownFor: string[]
}) {
	const t = detail.travel
	const list = (items: { name: string; kind: string; note?: string; summary?: string }[]) => (
		<ul>
			{items.map((p) => (
				<li key={p.name} className='border-b border-[var(--rule-soft)] py-3'>
					<p className='text-[0.875rem] font-semibold'>
						{p.name} <span className='text-[0.75rem] font-normal text-[var(--ink-3)]'>· {p.kind}</span>
					</p>
					<p className='mt-1 text-[0.8125rem] leading-5 text-[var(--ink-2)]'>{p.summary ?? p.note}</p>
				</li>
			))}
		</ul>
	)
	return (
		<>
			{t ? (
				<>
					<p className='mt-6 text-[0.84375rem] leading-6 text-[var(--ink-2)]'>{t.summary}</p>
					{t.peoples.length ? (
						<p className='mt-2 text-[0.78125rem] text-[var(--ink-3)]'>Peoples: {t.peoples.join(', ')}</p>
					) : null}
					{t.caution ? (
						<p className='mt-4 border-l-2 border-[var(--accent)] bg-[var(--paper-2)] px-3 py-2 text-[0.78125rem] leading-5 text-[var(--ink-2)]'>
							{t.caution}
						</p>
					) : null}
					<Section title={`Where to go (${t.whereToGo.length})`}>
						{t.whereToGo.length ? list(t.whereToGo) : <p className='text-[0.8125rem] text-[var(--ink-3)]'>No sourced place to visit.</p>}
					</Section>
					{t.whatToDo.length ? (
						<Section title='What to do'>
							<ul className='grid gap-1.5'>
								{t.whatToDo.map((x) => (
									<li key={x} className='text-[0.8125rem] leading-5 text-[var(--ink-2)]'>
										{x}
									</li>
								))}
							</ul>
						</Section>
					) : null}
					<Section title={`Where to eat (${t.eat.length})`}>
						{t.eat.length ? list(t.eat) : <p className='text-[0.8125rem] text-[var(--ink-3)]'>No eatery listed in any source.</p>}
					</Section>
					<Section title={`Where to stay (${t.stay.length})`}>
						{t.stay.length ? list(t.stay) : null}
						{t.stayNote ? <p className='mt-2 text-[0.8125rem] leading-5 text-[var(--ink-2)]'>{t.stayNote}</p> : null}
					</Section>
					<Section title='Getting there'>
						<p className='text-[0.8125rem] leading-5 text-[var(--ink-2)]'>{t.gettingThere}</p>
					</Section>
					<a href={t.href} className='bb-btn bb-btn-solid mt-8'>
						Town guide, with sources
						<ArrowUpRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
					</a>
				</>
			) : (
				<p className='mt-6 text-[0.8125rem] text-[var(--ink-3)]'>The travel guide has no entry for this town yet.</p>
			)}
			{elsewhere.length ? (
				<Section title={`Elsewhere in ${detail.area.name}`}>
					<Rows rows={elsewhere.map((p) => [p.kind, `${p.name} · ${p.municipality}`])} />
				</Section>
			) : null}
			{knownFor.length ? (
				<p className='mt-4 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
					{detail.area.name} is known for: {knownFor.join('; ')}.
				</p>
			) : null}
		</>
	)
}

function ElectionTab({ detail }: { detail: MapUnitDetail }) {
	const e = detail.election
	if (!e) return <p className='mt-6 text-[0.8125rem] text-[var(--ink-3)]'>No parliamentary district is on file for this town.</p>
	return (
		<>
			<p className='mt-6 text-[0.8125rem] leading-6 text-[var(--ink-2)]'>
				{detail.name} votes in {e.districts.length === 1 ? e.districts[0].label : `${e.districts.length} districts`} for the Bangsamoro
				Parliament. Results are counted by district, not by town.
				{e.note ? ` ${e.note}` : ''}
			</p>
			{e.districts.map((d) => {
				const max = Math.max(...d.candidates.map((c) => c.votes), 1)
				return (
					<Section key={d.label} title={`${d.label}, 14 September 2026`}>
						<ul>
							{d.candidates.map((c) => (
								<li key={c.name} className='border-b border-[var(--rule-soft)] py-2.5'>
									<p className='flex items-baseline justify-between gap-3 text-[0.84375rem]'>
										<span className={c.won ? 'font-semibold' : ''}>
											{c.name}
											{c.won ? <span className='ml-1.5 text-[0.6875rem] font-semibold text-[var(--accent)]'>Won</span> : null}
										</span>
										<span className='num text-[0.75rem] text-[var(--ink-3)]'>{c.votes.toLocaleString('en-PH')}</span>
									</p>
									<p className='mt-0.5 text-[0.75rem] text-[var(--ink-3)]'>{c.party}</p>
									<div className='mt-1.5 h-1 bg-[var(--paper-2)]'>
										<div
											className='h-full'
											style={{ width: `${(c.votes / max) * 100}%`, background: c.color ?? 'var(--ink-mute)' }}
										/>
									</div>
								</li>
							))}
						</ul>
						<p className='mt-2 num text-[0.75rem] text-[var(--ink-3)]'>{d.totalVotes.toLocaleString('en-PH')} votes in the district</p>
					</Section>
				)
			})}
			<Section title='Across the region'>
				<Stats
					items={[
						['Turnout', `${e.turnout.percent}%`],
						['Votes cast', figure(e.turnout.cast)],
					]}
				/>
			</Section>
			<p className='mt-4 text-[0.75rem] leading-5 text-[var(--ink-3)]'>
				Districts from{' '}
				<a href={e.source.href} target='_blank' rel='noreferrer' className='underline underline-offset-4'>
					{e.source.label}
				</a>
				.
			</p>
			<a href={e.href} className='bb-btn bb-btn-solid mt-8'>
				All results
				<ArrowUpRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
			</a>
		</>
	)
}

function ScopeNote({ detail }: { detail: MapUnitDetail }) {
	return (
		<p className='mt-6 text-[0.78125rem] leading-5 text-[var(--ink-3)]'>
			{detail.related.scope === 'town'
				? `Measures whose titles name ${detail.name}.`
				: `No measure’s title names ${detail.name}, so these are the ones naming ${detail.area.name}.`}
		</p>
	)
}

function Measures({ items, label }: { items: MapMeasure[]; label: string }) {
	return (
		<ul>
			{items.map((m) => (
				<li key={m.number} className='border-b border-[var(--rule-soft)] py-3'>
					<a href={m.href} target='_blank' rel='noreferrer' className='group block'>
						<p className='flex items-baseline justify-between gap-3 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-[var(--ink-3)]'>
							<span>
								{label} {m.number}
								{m.status ? ` · ${m.status}` : ''}
							</span>
							<ArrowUpRightIcon className='size-3 shrink-0 transition group-hover:text-[var(--accent)]' aria-hidden='true' />
						</p>
						<p className='mt-1 text-[0.84375rem] font-semibold leading-snug transition group-hover:text-[var(--accent)]'>
							{m.title}
						</p>
						{m.summary ? <p className='mt-1 text-[0.78125rem] leading-5 text-[var(--ink-2)]'>{m.summary}</p> : null}
					</a>
				</li>
			))}
		</ul>
	)
}

function BudgetTab({ detail }: { detail: MapUnitDetail }) {
	const n = detail.nta
	return (
		<>
			<Section title='National Tax Allotment (NTA / IRA)'>
				<p className='text-[0.8125rem] leading-6 text-[var(--ink-2)]'>
					The town’s share of national taxes — the IRA before the Mandanas ruling, and for most towns here nearly all
					of the money they have.
				</p>
				{n ? (
					<>
						<Stats
							items={n.years.map((y) => [`FY ${y.year}${y.preliminary ? ', preliminary' : ''}`, y.amount] as [string, string])}
						/>
						<ul className='mt-3'>
							{n.years.at(-1)?.perResident ? (
								<li className='flex gap-4 border-b border-[var(--rule-soft)] py-2 text-[0.84375rem]'>
									<span className='w-32 shrink-0 text-[var(--ink-3)]'>Per resident</span>
									<span>
										{n.years.at(-1)!.perResident} a year, FY {n.years.at(-1)!.year}
									</span>
								</li>
							) : null}
							{n.change ? (
								<li className='flex gap-4 border-b border-[var(--rule-soft)] py-2 text-[0.84375rem]'>
									<span className='w-32 shrink-0 text-[var(--ink-3)]'>Change</span>
									<span>{n.change}</span>
								</li>
							) : null}
							{n.province ? (
								<li className='flex gap-4 border-b border-[var(--rule-soft)] py-2 text-[0.84375rem]'>
									<span className='w-32 shrink-0 text-[var(--ink-3)]'>{n.province.name}</span>
									<span>
										{n.province.latest} to the provincial government, FY {n.province.year}
									</span>
								</li>
							) : null}
						</ul>
						<p className='mt-3 text-[0.75rem] leading-5 text-[var(--ink-3)]'>
							{n.note}{' '}
							<a href={n.source.href} target='_blank' rel='noreferrer' className='underline underline-offset-4'>
								{n.source.label}
							</a>
							.
						</p>
					</>
				) : (
					<p className='mt-3 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
						No NTA reported for this town. The Special Geographic Area’s towns, created in 2024, are not in BLGF’s
						statements yet.
					</p>
				)}
			</Section>
			{detail.spending ? (
				<Section title={`Regional construction in ${detail.area.name}`}>
					<Stats
						items={[
							[`FY ${detail.spending.firstYear}–${detail.spending.latestYear}`, detail.spending.total],
							[`FY ${detail.spending.latestYear}, ${detail.spending.projects} projects`, detail.spending.latest],
						]}
					/>
					<p className='mt-3 text-[0.75rem] leading-5 text-[var(--ink-3)]'>
						The Bangsamoro Government’s itemised construction naming the area — regional money landing there, not the
						town’s own budget.
					</p>
				</Section>
			) : null}
		</>
	)
}

function BarangayPanel({
	detail,
	index,
	onMove,
	onBack,
}: {
	detail: MapUnitDetail
	index: number
	onMove: (index: number) => void
	onBack: () => void
}) {
	const b: MapBarangay | undefined = detail.barangays[index]
	if (!b) return null
	const count = detail.barangays.length
	const prev = (index - 1 + count) % count
	const next = (index + 1) % count

	return (
		<>
			<p className='bb-label'>
				Barangay · {detail.name}, {detail.area.name}
			</p>
			<h2 className='mt-4 text-[2rem] font-extrabold leading-[1.05] tracking-[-0.035em]'>{b.name}</h2>
			<p className='mt-2 num text-[0.75rem] text-[var(--ink-3)]'>
				{index + 1} of {count}
				{b.psgc ? ` · PSGC ${b.psgc}` : ''}
				{b.d ? '' : ' · no outline in the boundary edition'}
			</p>

			<Section title='Who runs it'>
				{b.captain || b.council.length || b.sk ? (
					<>
						<Rows
							rows={[
								...(b.captain ? [['Punong barangay', b.captain] as [string, string]] : []),
								...(b.sk ? [['SK chairperson', b.sk] as [string, string]] : []),
								...(b.secretary ? [['Secretary', b.secretary] as [string, string]] : []),
								...(b.treasurer ? [['Treasurer', b.treasurer] as [string, string]] : []),
							]}
						/>
						{b.council.length ? (
							<>
								<p className='mt-4 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
									Council ({b.council.length})
								</p>
								<ul className='mt-1'>
									{b.council.map((name) => (
										<li key={name} className='border-b border-[var(--rule-soft)] py-1.5 text-[0.84375rem]'>
											{name}
										</li>
									))}
								</ul>
							</>
						) : null}
					</>
				) : (
					<p className='text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
						DILG’s directory has no roster for this barangay — a gap in the directory, not a barangay without
						officials.
					</p>
				)}
				<p className='mt-4 text-[0.75rem] leading-5 text-[var(--ink-3)]'>
					From{' '}
					<a href={detail.rostersSource} target='_blank' rel='noreferrer' className='underline underline-offset-4'>
						DILG’s barangay officials directory
					</a>
					, as it stood on{' '}
					{new Date(`${detail.rostersAsOf}T00:00:00Z`).toLocaleDateString('en-GB', {
						day: 'numeric',
						month: 'long',
						year: 'numeric',
						timeZone: 'UTC',
					})}
					. It stamps no term, so these may have changed.
				</p>
			</Section>

			<div className='mt-8 flex items-center gap-2'>
				<button type='button' onClick={() => onMove(prev)} className='bb-btn bb-btn-ghost cursor-pointer !px-3' aria-label='Previous barangay'>
					<ArrowLeftIcon className='size-3.5' weight='bold' aria-hidden='true' />
				</button>
				<button type='button' onClick={() => onMove(next)} className='bb-btn bb-btn-ghost cursor-pointer !px-3' aria-label='Next barangay'>
					<ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
				</button>
				<button type='button' onClick={onBack} className='bb-btn bb-btn-ghost cursor-pointer'>
					Back to {detail.name}
				</button>
			</div>
		</>
	)
}

/* ============================================================
   Small parts
   ============================================================ */

function Crumb({ children, onClick, active }: { children: React.ReactNode; onClick?: () => void; active?: boolean }) {
	return (
		<button
			type='button'
			onClick={onClick}
			disabled={active}
			className={`pointer-events-auto border px-2.5 py-1 text-[0.75rem] font-semibold shadow-sm transition ${
				active
					? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]'
					: 'cursor-pointer border-[var(--rule)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)]'
			}`}
		>
			{children}
		</button>
	)
}

function HudButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
	return (
		<button
			type='button'
			onClick={onClick}
			aria-label={label}
			title={label}
			className='inline-flex size-9 cursor-pointer items-center justify-center border border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)] shadow-sm transition hover:border-[var(--ink)]'
		>
			{children}
		</button>
	)
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className='mt-8'>
			<h3 className='border-b border-[var(--brass-line)] pb-2.5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]'>
				{title}
			</h3>
			<div className='mt-2'>{children}</div>
		</section>
	)
}

function Rows({ rows }: { rows: [string, string][] }) {
	return (
		<ul>
			{rows.map(([label, value]) => (
				<li key={label} className='flex gap-4 border-b border-[var(--rule-soft)] py-2 text-[0.84375rem]'>
					<span className='w-32 shrink-0 text-[var(--ink-3)]'>{label}</span>
					<span className='min-w-0'>{value}</span>
				</li>
			))}
		</ul>
	)
}

function Stats({ items }: { items: [string, string][] }) {
	return (
		<dl className='mt-6 grid grid-cols-2 border-t border-[var(--rule)]'>
			{items.map(([label, value]) => (
				<div key={label} className='border-b border-[var(--rule)] py-3 pr-3'>
					<dd className='num text-[1.25rem] font-extrabold tracking-[-0.02em]'>{value}</dd>
					<dt className='mt-0.5 font-mono text-[0.59375rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
						{label}
					</dt>
				</div>
			))}
		</dl>
	)
}
