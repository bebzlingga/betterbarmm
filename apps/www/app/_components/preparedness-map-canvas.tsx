'use client'

import type { FeatureCollection, Point } from 'geojson'
import * as MapLibreGL from 'maplibre-gl'
import type { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import outline from '../../../../datasets/accidents/barmm-outline.json'
import { FACILITY_GLYPHS } from '../_lib/preparedness-icons'
import { CLASS_COLORS, HAZARDS, PROVINCE_NAMES, type HazardId } from '../_lib/preparedness-shared'
import { Map, MapControls, useMap } from './mapcn'

/* ============================================================
   The preparedness map's canvas

   Two vector tilesets: public/preparedness/hazards.pmtiles holds NOAH's
   three hazard maps cut to the region (zoom 6 up), and barangays.pmtiles every
   barangay, each carrying its own exposure. One hazard is shown at a time, three ways:

     zones      NOAH's own zones, in yellow, orange and red, with the heat
                standing in below zoom 6, where the zone tiles begin
     barangays  each barangay shaded by its land in medium or high hazard
     heat       where the hazard gathers, from each barangay's exposed land,
                handing over to the zones themselves as the reader zooms in

   Facilities sit on top as badges, one glyph per kind, every one of
   them drawn, small at the region's scale and growing as the reader
   zooms in. Pointing at a barangay outlines it and names it with its share of land
   in the hazard; pointing at a facility names it. Browser-only, through
   next/dynamic.
   ============================================================ */

let registered = false
function registerPmtiles() {
	if (registered) return
	MapLibreGL.addProtocol('pmtiles', new Protocol().tile)
	registered = true
}

export type FacilityFeatures = FeatureCollection<Point, { id: string; kind: string; name: string }>
/** Barangay points weighted by exposed land, 0–1, per hazard. */
export type HeatFeatures = FeatureCollection<Point, Record<HazardId, number>>
export type View = 'zones' | 'barangays' | 'heat'

/** A map that still has its style. One torn down by a hot reload, or caught mid-swap on a theme change,
 *  has none, and touching its layers then throws; the effects wait for the next load instead. */
const live = (map: MapLibreGL.Map | null | undefined): map is MapLibreGL.Map => !!map && !!map.style

const BOUNDS: [[number, number], [number, number]] = [
	[118.2, 4.5],
	[125.0, 8.2],
]
const HZ = 'hz'
/** Barangays in a tileset of their own, so crowded hazard tiles never thin them out. */
const BGY = 'bgy'
/** Overture Maps' buildings, read straight from its open tiles (a release a month; this one is October 2026's). */
const BLDG = 'bldg'
const BUILDINGS = 'https://tiles.overturemaps.org/2026-10-21.0/buildings.pmtiles'
const HAZARD_IDS: HazardId[] = ['flood', 'landslide', 'surge']
const hazardColor = ['match', ['get', 'h'], 1, CLASS_COLORS[0], 2, CLASS_COLORS[1], 3, CLASS_COLORS[2], '#999999']
const medHigh = (h: HazardId) => ['+', ['coalesce', ['get', `${h[0]}2`], 0], ['coalesce', ['get', `${h[0]}3`], 0]]
const choropleth = (h: HazardId) => ['step', medHigh(h), 'rgba(0,0,0,0)', 0.02, '#f7e7b4', 0.1, CLASS_COLORS[0], 0.3, CLASS_COLORS[1], 0.5, CLASS_COLORS[2]]
/** The zones fade in under the heat as it fades out. */
/** The zone tiles begin at zoom 6, which a phone showing the whole region is below: there, the zones view shows the heat until they arrive. */
const heatOpacity = (view: View) => (view === 'heat' ? ['interpolate', ['linear'], ['zoom'], 9, 0.85, 11.5, 0] : ['interpolate', ['linear'], ['zoom'], 5.6, 0.85, 6.2, 0])
const zoneOpacity = (view: View, dark: boolean) => (view === 'heat' ? ['interpolate', ['linear'], ['zoom'], 9, 0, 11, dark ? 0.5 : 0.6] : dark ? 0.5 : 0.6)

/** A kind's badge: its colour in a ring of white, its glyph in white, drawn at twice the size for sharp screens. */
function badge(color: string, glyph: string): ImageData {
	const s = 52
	const c = document.createElement('canvas')
	c.width = c.height = s
	const g = c.getContext('2d')!
	g.beginPath()
	g.arc(s / 2, s / 2, s / 2 - 2, 0, Math.PI * 2)
	g.fillStyle = color
	g.fill()
	g.lineWidth = 3
	g.strokeStyle = '#ffffff'
	g.stroke()
	const size = 28
	g.translate((s - size) / 2, (s - size) / 2)
	g.scale(size / 256, size / 256)
	g.fillStyle = '#ffffff'
	g.fill(new Path2D(glyph))
	return g.getImageData(0, 0, s, s)
}

const pct = (x: number) => (x >= 0.995 ? '100%' : x < 0.005 && x > 0 ? 'under 1%' : `${Math.round(x * 100)}%`)

/** What the pointer is over: a barangay from the tiles, or a facility. */
type Hover = { x: number; y: number; flipX: boolean; flipY: boolean } & ({ type: 'bgy'; props: Record<string, unknown> } | { type: 'fac'; name: string; kind: string } )

type Props = {
	hazard: HazardId | null
	view: View
	facilities: FacilityFeatures
	kinds: { id: string; color: string; label: string }[]
	heat: HeatFeatures
	selected: string | null
	focus: { bbox: [number, number, number, number]; nonce: number } | null
	me: [number, number] | null
	onSelectBarangay: (psgc: string) => void
	onSelectFacility: (id: string) => void
}

function Layers({ hazard, view, facilities, kinds, heat, selected, focus, me, onSelectBarangay, onSelectFacility }: Props) {
	const { map, isLoaded, resolvedTheme } = useMap()
	const [hover, setHover] = useState<Hover | null>(null)
	// 2D or 3D: flat and north up, or tilted with the basemap's buildings raised.
	const [three, setThree] = useState(false)
	const latest = useRef({ facilities, heat, kinds })
	useEffect(() => {
		latest.current = { facilities, heat, kinds }
	}, [facilities, heat, kinds])

	// Sources, images and layers, added on load and after every style swap (a theme change reloads the style).
	useEffect(() => {
		if (!live(map) || !isLoaded) return
		const dark = resolvedTheme === 'dark'
		const ground = map.getStyle()?.layers?.find((l) => l.type === 'symbol' || l.type === 'line')?.id
		for (const k of latest.current.kinds) if (!map.hasImage(`fac-${k.id}`) && FACILITY_GLYPHS[k.id]) map.addImage(`fac-${k.id}`, badge(k.color, FACILITY_GLYPHS[k.id]!), { pixelRatio: 2 })
		if (!map.getSource('barmm')) map.addSource('barmm', { type: 'geojson', data: outline as never })
		if (!map.getLayer('barmm-fill')) map.addLayer({ id: 'barmm-fill', type: 'fill', source: 'barmm', paint: { 'fill-color': dark ? '#e0604c' : '#8b1e1a', 'fill-opacity': dark ? 0.05 : 0.03 } }, ground)
		if (!map.getSource(HZ)) map.addSource(HZ, { type: 'vector', url: `pmtiles://${window.location.origin}/preparedness/hazards.pmtiles` })
		if (!map.getSource(BGY)) map.addSource(BGY, { type: 'vector', url: `pmtiles://${window.location.origin}/preparedness/barangays.pmtiles` })
		for (const h of HAZARD_IDS)
			if (!map.getLayer(`hz-${h}`)) map.addLayer({ id: `hz-${h}`, type: 'fill', source: HZ, 'source-layer': h, layout: { visibility: 'none' }, paint: { 'fill-color': hazardColor as never, 'fill-opacity': 0.6 } }, ground)
		if (!map.getLayer('bgy-fill')) map.addLayer({ id: 'bgy-fill', type: 'fill', source: BGY, 'source-layer': 'barangays', layout: { visibility: 'none' }, paint: { 'fill-color': choropleth('flood') as never, 'fill-opacity': 0.75 } }, ground)
		if (!map.getSource('heat')) map.addSource('heat', { type: 'geojson', data: latest.current.heat })
		if (!map.getLayer('heat'))
			map.addLayer({
				id: 'heat',
				type: 'heatmap',
				source: 'heat',
				layout: { visibility: 'none' },
				paint: {
					'heatmap-weight': ['get', 'flood'] as never,
					'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 5, 0.25, 8, 0.6, 10, 1.2] as never,
					'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 5, 7, 8, 16, 11, 32] as never,
					'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0.85, 11.5, 0] as never,
					'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(242,201,76,0)', 0.15, 'rgba(242,201,76,0.55)', 0.4, 'rgba(240,140,46,0.8)', 0.7, 'rgba(212,58,47,0.9)', 1, 'rgba(125,32,21,1)'] as never,
				},
			})
		if (!map.getLayer('bgy-hit')) map.addLayer({ id: 'bgy-hit', type: 'fill', source: BGY, 'source-layer': 'barangays', paint: { 'fill-color': '#000', 'fill-opacity': 0 } })
		if (!map.getLayer('bgy-line'))
			map.addLayer({ id: 'bgy-line', type: 'line', source: BGY, 'source-layer': 'barangays', minzoom: 8, paint: { 'line-color': dark ? '#d8d2c4' : '#5b564c', 'line-opacity': ['interpolate', ['linear'], ['zoom'], 8, 0.15, 12, 0.5] as never, 'line-width': 0.6 } })
		if (!map.getLayer('bgy-hover')) map.addLayer({ id: 'bgy-hover', type: 'line', source: BGY, 'source-layer': 'barangays', filter: ['==', ['get', 'psgc'], ''], paint: { 'line-color': dark ? '#f3efe6' : '#131312', 'line-width': 1.4, 'line-opacity': 0.8 } })
		if (!map.getLayer('bgy-sel')) map.addLayer({ id: 'bgy-sel', type: 'line', source: BGY, 'source-layer': 'barangays', filter: ['==', ['get', 'psgc'], ''], paint: { 'line-color': dark ? '#f3efe6' : '#131312', 'line-width': 2.5 } })
		// Every building raised for 3D, from Overture Maps: OpenStreetMap's, filled out with the footprints Google and
		// Microsoft detected from satellite imagery, so a village with nothing on OpenStreetMap still shows its houses.
		// Above the hazard zones and the roads, under the place names. Its height where one is known, else its floors at
		// 3 m each, else 4 m, a one-storey house. Each is asked for with `has`: a missing value inside the arithmetic would
		// fail the whole expression and lay the building flat.
		const labels = map.getStyle()?.layers?.find((l) => l.type === 'symbol')?.id
		if (!map.getSource(BLDG)) map.addSource(BLDG, { type: 'vector', url: `pmtiles://${BUILDINGS}`, attribution: '© Overture Maps Foundation' })
		if (!map.getLayer('bldg-3d'))
			map.addLayer(
				{
					id: 'bldg-3d',
					type: 'fill-extrusion',
					source: BLDG,
					'source-layer': 'building',
					minzoom: 13,
					filter: ['!=', ['get', 'is_underground'], true],
					layout: { visibility: 'none' },
					paint: {
						'fill-extrusion-color': dark ? '#5d5850' : '#aca18f',
						'fill-extrusion-vertical-gradient': true,
						'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 13, 0, 14.5, ['case', ['has', 'height'], ['get', 'height'], ['has', 'num_floors'], ['*', ['get', 'num_floors'], 3], 4]] as never,
						'fill-extrusion-base': ['case', ['has', 'min_height'], ['get', 'min_height'], 0] as never,
						'fill-extrusion-opacity': 0.92,
					},
				},
				labels,
			)
		if (!map.getSource('fac')) map.addSource('fac', { type: 'geojson', data: latest.current.facilities })
		if (!map.getLayer('fac'))
			map.addLayer({
				id: 'fac',
				type: 'symbol',
				source: 'fac',
				layout: {
					'icon-image': ['concat', 'fac-', ['get', 'kind']] as never,
					// Every badge is drawn, none hidden by its neighbours: small across the region, full size up close.
					'icon-size': ['interpolate', ['linear'], ['zoom'], 6, 0.42, 9, 0.62, 12, 0.9, 14, 1.05] as never,
					'icon-allow-overlap': true,
					'icon-ignore-placement': true,
					// The thousand-odd schools are drawn first, so the few evacuation centres, hospitals and offices sit on top of them.
					'symbol-sort-key': ['match', ['get', 'kind'], 'school', 0, 'health', 1, 2] as never,
				},
			})
		if (!map.getSource('me')) map.addSource('me', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
		if (!map.getLayer('me')) map.addLayer({ id: 'me', type: 'circle', source: 'me', paint: { 'circle-color': '#2a78d6', 'circle-radius': 7, 'circle-stroke-width': 3, 'circle-stroke-color': '#ffffff' } })

		const click = (e: MapLayerMouseEvent) => {
			const fac = map.queryRenderedFeatures(e.point, { layers: ['fac'] })[0]
			if (fac?.properties?.id) return onSelectFacility(String(fac.properties.id))
			const b = map.queryRenderedFeatures(e.point, { layers: ['bgy-hit'] })[0]
			if (b?.properties?.psgc) onSelectBarangay(String(b.properties.psgc))
		}
		// What the pointer is over: outlined on the map, and named in a tip beside it.
		const move = (e: MapLayerMouseEvent) => {
			const { x, y } = e.point
			const box = map.getContainer()
			const at = { x, y, flipX: x > box.clientWidth - 290, flipY: y > box.clientHeight - 170 }
			const fac = map.queryRenderedFeatures(e.point, { layers: ['fac'] })[0]
			const b = fac ? null : map.queryRenderedFeatures(e.point, { layers: ['bgy-hit'] })[0]
			map.getCanvas().style.cursor = fac || b ? 'pointer' : ''
			map.setFilter('bgy-hover', ['==', ['get', 'psgc'], b?.properties?.psgc ?? ''])
			if (fac) setHover({ ...at, type: 'fac', name: String(fac.properties.name ?? ''), kind: String(fac.properties.kind) })
			else if (b) setHover({ ...at, type: 'bgy', props: b.properties })
			else setHover(null)
		}
		const out = () => {
			setHover(null)
			if (map.getLayer('bgy-hover')) map.setFilter('bgy-hover', ['==', ['get', 'psgc'], ''])
		}
		map.on('click', click)
		map.on('mousemove', move)
		map.on('mouseout', out)
		map.on('movestart', out)
		return () => {
			map.off('click', click)
			map.off('mousemove', move)
			map.off('mouseout', out)
			map.off('movestart', out)
		}
	}, [map, isLoaded, resolvedTheme, onSelectBarangay, onSelectFacility])

	// Which hazard, drawn which way.
	useEffect(() => {
		if (!live(map) || !isLoaded || !map.getLayer('heat')) return
		const dark = resolvedTheme === 'dark'
		for (const h of HAZARD_IDS) {
			map.setLayoutProperty(`hz-${h}`, 'visibility', hazard === h && view !== 'barangays' ? 'visible' : 'none')
			map.setPaintProperty(`hz-${h}`, 'fill-opacity', zoneOpacity(view, dark) as never)
		}
		map.setLayoutProperty('bgy-fill', 'visibility', hazard && view === 'barangays' ? 'visible' : 'none')
		map.setLayoutProperty('heat', 'visibility', hazard && view !== 'barangays' ? 'visible' : 'none')
		map.setPaintProperty('heat', 'heatmap-opacity', heatOpacity(view) as never)
		if (hazard) {
			map.setPaintProperty('bgy-fill', 'fill-color', choropleth(hazard) as never)
			map.setPaintProperty('heat', 'heatmap-weight', ['get', hazard] as never)
		}
	}, [map, isLoaded, resolvedTheme, hazard, view])

	// 3D shows the raised buildings (again after a theme change reloads the style); the camera tilts only when the switch moves.
	useEffect(() => {
		if (!live(map) || !isLoaded || !map.getLayer('bldg-3d')) return
		map.setLayoutProperty('bldg-3d', 'visibility', three ? 'visible' : 'none')
		// The basemap's own flat buildings would lie over the raised ones' roofs, so 3D puts them away.
		for (const id of ['building', 'building-top']) if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', three ? 'none' : 'visible')
	}, [map, isLoaded, resolvedTheme, three])
	useEffect(() => {
		if (!live(map) || !isLoaded) return
		const z = map.getZoom()
		// From a town, 3D goes on down to street level, where the buildings stand out; from the whole region it only tilts.
		// The light comes from one side, so walls shade darker than roofs and a building reads as a block.
		map.easeTo(three ? { pitch: 55, bearing: -17, zoom: z >= 11.5 && z < 17 ? 17 : z, duration: 1100 } : { pitch: 0, bearing: 0, duration: 700 })
		if (three) map.setLight({ anchor: 'viewport', color: '#ffffff', position: [1.2, 210, 35], intensity: 0.55 })
	}, [map, isLoaded, three])

	// The panel beside the map comes and goes with the picked place, so the map follows its own box, not only the window.
	useEffect(() => {
		if (!live(map) || !isLoaded) return
		const box = map.getContainer()
		const watch = new ResizeObserver(() => live(map) && map.resize())
		watch.observe(box)
		return () => watch.disconnect()
	}, [map, isLoaded])

	// The dialog lays out after the map is created, so the first framing is redone once it has its real size.
	const framed = useRef(false)
	useEffect(() => {
		if (!live(map) || !isLoaded || framed.current) return
		framed.current = true
		map.resize()
		map.fitBounds(BOUNDS, { padding: 24, duration: 0 })
	}, [map, isLoaded])

	useEffect(() => {
		if (!live(map) || !isLoaded) return
		;(map.getSource('fac') as GeoJSONSource | undefined)?.setData(facilities)
	}, [map, isLoaded, facilities])

	useEffect(() => {
		if (!live(map) || !isLoaded) return
		;(map.getSource('heat') as GeoJSONSource | undefined)?.setData(heat)
	}, [map, isLoaded, heat])

	useEffect(() => {
		if (!live(map) || !isLoaded || !map.getLayer('bgy-sel')) return
		map.setFilter('bgy-sel', ['==', ['get', 'psgc'], selected ?? ''])
	}, [map, isLoaded, selected])

	useEffect(() => {
		if (!live(map) || !isLoaded) return
		;(map.getSource('me') as GeoJSONSource | undefined)?.setData({ type: 'FeatureCollection', features: me ? [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: me } }] : [] })
	}, [map, isLoaded, me])

	useEffect(() => {
		if (!live(map) || !isLoaded || !focus) return
		const [w, s, e, n] = focus.bbox
		map.fitBounds(
			[
				[w, s],
				[e, n],
			],
			{ padding: 48, maxZoom: 14, duration: 800 },
		)
	}, [map, isLoaded, focus])

	return (
		<>
			<div className='absolute left-2 top-2 z-10 flex gap-2'>
				<button
					type='button'
					onClick={() => map?.fitBounds(BOUNDS, { padding: 24, duration: 800 })}
					className='flex h-8 cursor-pointer items-center rounded-md border border-[var(--rule)] bg-[var(--paper)] px-3 text-[0.75rem] font-semibold text-[var(--ink)] shadow-sm transition hover:text-[var(--accent)]'
				>
					Whole region
				</button>
				<div role='group' aria-label='Map view' className='flex h-8 overflow-hidden rounded-md border border-[var(--rule)] bg-[var(--paper)] text-[0.75rem] font-semibold shadow-sm'>
					{(['2D', '3D'] as const).map((m) => {
						const on = (m === '3D') === three
						return (
							<button
								key={m}
								type='button'
								aria-pressed={on}
								onClick={() => setThree(m === '3D')}
								className={`cursor-pointer px-2.5 transition ${on ? 'bg-[var(--ink)] text-[var(--paper)]' : 'text-[var(--ink)] hover:text-[var(--accent)]'}`}
							>
								{m}
							</button>
						)
					})}
				</div>
			</div>
			{hover ? <Tip hover={hover} hazard={hazard} kinds={kinds} /> : null}
		</>
	)
}

/** The tip beside the pointer: a barangay's name and its land in the hazard, or a facility's name. */
function Tip({ hover, hazard, kinds }: { hover: Hover; hazard: HazardId | null; kinds: Props['kinds'] }) {
	const hz = HAZARDS.find((h) => h.id === hazard)
	let body: ReactNode
	if (hover.type === 'fac') {
		const k = kinds.find((x) => x.id === hover.kind)
		body = (
			<>
				<p className='text-[0.65625rem] font-semibold uppercase tracking-[0.1em]' style={{ color: k?.color }}>
					{k?.label}
				</p>
				<p className='font-semibold leading-snug'>{hover.name}</p>
			</>
		)
	} else {
		const p = hover.props
		const share = hz ? Number(p[`${hz.id[0]}2`] ?? 0) + Number(p[`${hz.id[0]}3`] ?? 0) : 0
		const high = hz ? Number(p[`${hz.id[0]}3`] ?? 0) : 0
		body = (
			<>
				<p className='font-semibold leading-snug'>{String(p.name)}</p>
				<p className='text-[0.71875rem] text-[var(--ink-3)]'>
					{String(p.town)}, {PROVINCE_NAMES[String(p.prov)] ?? String(p.prov)}
				</p>
				{hz ? (
					<p className='mt-1 text-[0.75rem]'>
						{hz.id === 'flood' && p.prov === 'tawi-tawi' ? (
							<span className='text-[var(--ink-3)]'>No flood model for Tawi-Tawi</span>
						) : share > 0 ? (
							<>
								<span className='font-semibold'>{pct(share)}</span> of its land in medium or high {hz.label.toLowerCase()} hazard{high > 0 ? `, ${pct(high)} high` : ''}
							</>
						) : (
							<span className='text-[var(--ink-3)]'>No medium or high {hz.label.toLowerCase()} hazard mapped</span>
						)}
					</p>
				) : null}
				<p className='mt-1 text-[0.6875rem] text-[var(--ink-3)]'>Click for its hazards and nearest facilities</p>
			</>
		)
	}
	// Kept inside the canvas: it flips to the pointer's left or above it near the right and bottom edges.
	return (
		<div
			className='pointer-events-none absolute z-20 w-max max-w-[16rem] rounded-md border border-[var(--rule)] bg-[var(--paper)] px-3 py-2 text-[0.78125rem] text-[var(--ink)] shadow-[0_12px_30px_-14px_rgba(0,0,0,0.45)]'
			style={{ left: hover.x, top: hover.y, transform: `translate(${hover.flipX ? 'calc(-100% - 14px)' : '14px'}, ${hover.flipY ? 'calc(-100% - 14px)' : '14px'})` }}
		>
			{body}
		</div>
	)
}

export default function PreparednessMapCanvas(props: Props) {
	// MapLibre needs WebGL2; without it, the place picker and the tables still answer every question.
	const [webgl] = useState(() => {
		try {
			return !!document.createElement('canvas').getContext('webgl2')
		} catch {
			return false
		}
	})
	useState(() => (webgl ? registerPmtiles() : null))
	if (!webgl)
		return (
			<div className='flex h-full w-full items-center justify-center bg-[var(--paper-2)] p-8 text-center text-[0.875rem] leading-[1.7] text-[var(--ink-3)]'>
				The map needs WebGL2, which this browser does not provide. Pick a place beside it to see its hazards and nearest facilities.
			</div>
		)
	return (
		<Map className='h-full w-full' bounds={BOUNDS} fitBoundsOptions={{ padding: 24 }} minZoom={4.5} maxZoom={19} maxPitch={70}>
			<Layers {...props} />
			<MapControls position='top-right' showZoom showCompass />
		</Map>
	)
}
