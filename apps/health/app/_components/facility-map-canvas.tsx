'use client'

import * as maplibregl from 'maplibre-gl'
import type { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef } from 'react'
import type { MapPoint } from '../_lib/towns'

/* ============================================================
   The mapped health facilities

   Loaded only in the browser, through next/dynamic, and made once, as
   the Education workspace's school map is; the points it is given and
   the one chosen are applied to it. Hospitals are larger dots than
   health centres, so the two read apart without the colour.
   ============================================================ */

if (typeof window !== 'undefined' && !maplibregl.getWorkerUrl()) {
	maplibregl.setWorkerUrl(`https://unpkg.com/maplibre-gl@${maplibregl.getVersion()}/dist/maplibre-gl-worker.mjs`)
}

const STYLES = {
	light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
	dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
}

/** The region: Mapun and the Turtle Islands in the west to the Special Geographic Area in the east. */
const BOUNDS: [[number, number], [number, number]] = [
	[118.2, 4.5],
	[125.0, 8.2],
]

const KIND_COLOUR = { hospital: { light: '#b8392c', dark: '#ef8f80' }, health: { light: '#2e9a66', dark: '#6fcf9c' } }

const SRC = 'facilities'

const collection = (points: MapPoint[]) => ({
	type: 'FeatureCollection' as const,
	features: points.map((p) => ({ type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [p.lon, p.lat] }, properties: { id: p.id, kind: p.kind } })),
})

export default function FacilityMapCanvas({
	points,
	selectedId = null,
	onSelect,
	focus,
}: {
	points: MapPoint[]
	selectedId?: string | null
	onSelect?: (id: string) => void
	/** Where to open instead of the whole region: a box around a town's points. */
	focus?: [[number, number], [number, number]]
}) {
	const box = useRef<HTMLDivElement>(null)
	const map = useRef<maplibregl.Map | null>(null)
	const ready = useRef(false)
	const latest = useRef({ points, selectedId, onSelect })
	useEffect(() => {
		latest.current = { points, selectedId, onSelect }
	}, [points, selectedId, onSelect])

	useEffect(() => {
		if (!box.current) return
		const dark = document.documentElement.dataset.theme === 'dark'
		const m = new maplibregl.Map({
			container: box.current,
			style: dark ? STYLES.dark : STYLES.light,
			bounds: focus ?? BOUNDS,
			fitBoundsOptions: { padding: focus ? 60 : 24, maxZoom: 13 },
			attributionControl: { compact: true },
		})
		map.current = m
		// The box can still be settling its width when the map is made; keep the canvas the box's size.
		const fit = new ResizeObserver(() => m.resize())
		fit.observe(box.current)
		m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
		m.on('load', () => {
			const shade = dark ? 'dark' : 'light'
			const colour = ['match', ['get', 'kind'], 'hospital', KIND_COLOUR.hospital[shade], KIND_COLOUR.health[shade]]
			m.addSource(SRC, { type: 'geojson', data: collection(latest.current.points) })
			m.addLayer({
				id: 'facility',
				type: 'circle',
				source: SRC,
				paint: {
					'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, ['case', ['==', ['get', 'kind'], 'hospital'], 4.5, 3], 13, ['case', ['==', ['get', 'kind'], 'hospital'], 10, 7]] as never,
					'circle-color': colour as never,
					'circle-stroke-color': dark ? '#151311' : '#ffffff',
					'circle-stroke-width': 1.2,
					'circle-opacity': 0.92,
				},
			})
			m.addLayer({
				id: 'halo',
				type: 'circle',
				source: SRC,
				filter: ['==', ['get', 'id'], latest.current.selectedId ?? ''],
				paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 10, 14, 17], 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-width': 2.5, 'circle-stroke-color': dark ? '#f4efe8' : '#191713' },
			})
			m.on('click', 'facility', (e: MapLayerMouseEvent) => {
				const id = e.features?.[0]?.properties?.id as string | undefined
				if (id) latest.current.onSelect?.(id)
			})
			m.on('mouseenter', 'facility', () => (m.getCanvas().style.cursor = 'pointer'))
			m.on('mouseleave', 'facility', () => (m.getCanvas().style.cursor = ''))
			ready.current = true
			;(m.getSource(SRC) as GeoJSONSource).setData(collection(latest.current.points))
		})
		return () => {
			fit.disconnect()
			ready.current = false
			m.remove()
			map.current = null
		}
		// The map is made once; what changes is applied below.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		const m = map.current
		if (!m || !ready.current) return
		;(m.getSource(SRC) as GeoJSONSource | undefined)?.setData(collection(points))
	}, [points])

	useEffect(() => {
		const m = map.current
		if (!m || !ready.current || !m.getLayer('halo')) return
		m.setFilter('halo', ['==', ['get', 'id'], selectedId ?? ''])
		const p = latest.current.points.find((x) => x.id === selectedId)
		if (p) m.easeTo({ center: [p.lon, p.lat], duration: 600 })
	}, [selectedId])

	return <div ref={box} className='size-full' />
}
