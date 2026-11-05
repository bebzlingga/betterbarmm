'use client'

import * as maplibregl from 'maplibre-gl'
import type { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef } from 'react'
import { SCHOOL_TYPES, type MapSchool } from '../_lib/school-types'

/* ============================================================
   The schools on a map

   Loaded only in the browser, through next/dynamic. Every school is
   its own dot, coloured by its kind; none are gathered into counted
   circles. A school pinned where it stands is a solid dot, one placed
   only at its town's centre a ring, so nobody takes the town for the
   school. The map is made once; the schools it is given, the one
   chosen and where to fly are passed in and applied to it.
   ============================================================ */

if (typeof window !== 'undefined' && !maplibregl.getWorkerUrl()) {
	maplibregl.setWorkerUrl(`https://unpkg.com/maplibre-gl@${maplibregl.getVersion()}/dist/maplibre-gl-worker.mjs`)
}

const STYLES = {
	light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
	dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
}

/** The region: Mapun and the Turtle Islands in the west to the Special Geographic Area in the east. */
export const BOUNDS: [[number, number], [number, number]] = [
	[118.2, 4.5],
	[125.0, 8.2],
]

const SRC = 'schools'

/** Where to fly: a school, or the whole region when `zoom` is below zero. */
export type Fly = { lon: number; lat: number; zoom: number; nonce: number } | null

const collection = (schools: MapSchool[]) => ({
	type: 'FeatureCollection' as const,
	features: schools.map((s) => ({ type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [s.lon, s.lat] }, properties: { id: s.id, type: s.type, exact: s.exact } })),
})

export default function SchoolMapCanvas({
	schools,
	selectedId = null,
	onSelect,
	focus,
	fly = null,
}: {
	schools: MapSchool[]
	selectedId?: string | null
	/** A dot was chosen. Without it, choosing a dot opens that school's page. */
	onSelect?: (id: string) => void
	/** Where to open, instead of the whole region. */
	focus?: { lon: number; lat: number; zoom: number }
	fly?: Fly
}) {
	const box = useRef<HTMLDivElement>(null)
	const map = useRef<maplibregl.Map | null>(null)
	const ready = useRef(false)
	const latest = useRef({ schools, selectedId, onSelect })
	useEffect(() => {
		latest.current = { schools, selectedId, onSelect }
	}, [schools, selectedId, onSelect])

	// The map itself, once.
	useEffect(() => {
		if (!box.current) return
		const dark = document.documentElement.dataset.theme === 'dark'
		const m = new maplibregl.Map({
			container: box.current,
			style: dark ? STYLES.dark : STYLES.light,
			bounds: focus ? undefined : BOUNDS,
			center: focus ? [focus.lon, focus.lat] : undefined,
			zoom: focus?.zoom,
			fitBoundsOptions: { padding: 24 },
			attributionControl: { compact: true },
		})
		map.current = m
		m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
		m.on('load', () => {
			const colour = ['match', ['get', 'type'], ...SCHOOL_TYPES.flatMap((t) => [t.label, dark ? t.dark : t.light]), dark ? '#a8a296' : '#6f6a60']
			m.addSource(SRC, { type: 'geojson', data: collection(latest.current.schools) })
			m.addLayer({
				id: 'school',
				type: 'circle',
				source: SRC,
				paint: {
					'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 2.6, 10, 4.5, 14, 7],
					'circle-color': ['case', ['get', 'exact'], colour, 'rgba(0,0,0,0)'] as never,
					'circle-stroke-color': colour as never,
					// Zoom may only lead an expression, so the case for each kind of pin sits inside it.
					'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 6, ['case', ['get', 'exact'], 0.4, 1.2], 12, ['case', ['get', 'exact'], 1.2, 1.8]] as never,
					'circle-opacity': 0.9,
				},
			})
			m.addLayer({
				id: 'halo',
				type: 'circle',
				source: SRC,
				filter: ['==', ['get', 'id'], latest.current.selectedId ?? ''],
				paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 9, 14, 15], 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-width': 2.5, 'circle-stroke-color': dark ? '#f4efe8' : '#191713' },
			})
			m.on('click', 'school', (e: MapLayerMouseEvent) => {
				const id = e.features?.[0]?.properties?.id as string | undefined
				if (!id) return
				if (latest.current.onSelect) latest.current.onSelect(id)
				else window.location.href = `/schools/${id}`
			})
			m.on('mouseenter', 'school', () => (m.getCanvas().style.cursor = 'pointer'))
			m.on('mouseleave', 'school', () => (m.getCanvas().style.cursor = ''))
			ready.current = true
			// Anything chosen or filtered while the style was loading.
			;(m.getSource(SRC) as GeoJSONSource).setData(collection(latest.current.schools))
		})
		return () => {
			ready.current = false
			m.remove()
			map.current = null
		}
		// The map is made once; what changes is applied below.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// The schools shown, as the filters change.
	useEffect(() => {
		const m = map.current
		if (!m || !ready.current) return
		;(m.getSource(SRC) as GeoJSONSource | undefined)?.setData(collection(schools))
	}, [schools])

	// The chosen school's halo.
	useEffect(() => {
		const m = map.current
		if (!m || !ready.current || !m.getLayer('halo')) return
		m.setFilter('halo', ['==', ['get', 'id'], selectedId ?? ''])
	}, [selectedId])

	// Flying to a school, or back to the region.
	useEffect(() => {
		const m = map.current
		if (!m || !fly) return
		if (fly.zoom < 0) m.fitBounds(BOUNDS, { padding: 24, duration: 700 })
		else m.flyTo({ center: [fly.lon, fly.lat], zoom: Math.max(m.getZoom(), fly.zoom), duration: 800 })
	}, [fly])

	return <div ref={box} className='size-full' />
}
