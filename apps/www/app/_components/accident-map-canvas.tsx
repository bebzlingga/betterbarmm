'use client'

import type { FeatureCollection, Point } from 'geojson'
import type { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'
import outline from '../../../../datasets/accidents/barmm-outline.json'
import { ACCIDENT_TYPES, type Accident } from '../_lib/accidents'
import { Map, MapControls, useMap } from './mapcn'

/* ============================================================
   The map itself: a heat layer under a pulse under a dot layer

   Loaded only in the browser — MapLibre wants a window — which is why
   this file is reached through `next/dynamic` from the component that
   holds the filters and the dialog. It is given the filtered features
   and draws them; it decides nothing. The chosen incident's details are
   the dialog's business, so a click here only reports the id.

   Four layers off one source. The heat layer answers "where does it
   keep happening" and is weighted by how many were hurt, so a single
   ferry sinking with dozens dead glows as much as a stretch of highway
   with a dozen small crashes. It fades as the reader zooms in and the
   dots take over, each coloured by kind and sized by deaths. Under
   every dot a ring of the same colour swells and fades on a loop — one
   requestAnimationFrame moving one paint property — and around the
   chosen dot a halo in the ink marks it.
   ============================================================ */

export type AccidentFeatures = FeatureCollection<Point, { id: string; type: Accident['type']; deaths: number; weight: number; placed: Accident['placed'] }>

export type Focus = { id: string; lon: number; lat: number; nonce: number } | null

const SRC = 'accidents'
/** The region itself, washed in the brand crimson under everything else, so the reader sees where BARMM ends. */
const REGION = 'barmm'
const REGION_FILL = 'barmm-fill'
const HEAT = 'accidents-heat'
const PULSE = 'accidents-pulse'
const PTS = 'accidents-points'
const HALO = 'accidents-halo'

/** The whole region, every map's opening view: the Turtle Islands and Mapun in the
    west to Datu Paglas and Old Kaabakan in the east, Sitangkai in the south to
    Tagoloan II above Marawi's lake in the north. */
const BOUNDS: [[number, number], [number, number]] = [
	[118.2, 4.5],
	[125.0, 8.2],
]
const FIT = { padding: 32 }

/** Back to the whole region, from wherever a click or a flight has left the map. */
function AllBarmm() {
	const { map } = useMap()
	return (
		<button
			type='button'
			onClick={() => map?.fitBounds(BOUNDS, { ...FIT, duration: 700 })}
			className='absolute right-12 top-2 z-10 flex h-8 cursor-pointer items-center rounded-md border border-[var(--rule)] bg-[var(--paper)] px-3 text-[12px] font-semibold text-[var(--ink)] shadow-sm transition hover:text-[var(--accent)]'
		>
			All BARMM
		</button>
	)
}

const colourMatch = (dark: boolean) => [
	'match',
	['get', 'type'],
	...ACCIDENT_TYPES.flatMap((t) => [t.id, dark ? t.colorDark : t.color]),
	dark ? '#9a9488' : '#8a8578',
]

const deathsCapped = ['min', 12, ['coalesce', ['get', 'deaths'], 0]]

/** A dot parked on a province's centre is drawn faint, so it reads as a placeholder and not a place. */
const opacity = (full: number) => ['case', ['==', ['get', 'placed'], 'province'], full * 0.45, full]

/** The dot's radius at this zoom, scaled — 1 for the dot, more for the pulse around it. */
const radius = (scale: number) => [
	'interpolate',
	['linear'],
	['zoom'],
	5,
	['*', scale, ['+', 3.5, ['*', 0.5, deathsCapped]]],
	11,
	['*', scale, ['+', 6, ['*', 1.4, deathsCapped]]],
]

function Layers({
	features,
	show,
	selectedId,
	focus,
	onSelect,
}: {
	features: AccidentFeatures
	show: 'both' | 'heat' | 'points'
	selectedId: string | null
	focus: Focus
	onSelect: (id: string) => void
}) {
	const { map, isLoaded, resolvedTheme } = useMap()
	// The newest features, for the one-time source add below; written in an effect, not in render.
	const latest = useRef(features)
	useEffect(() => {
		latest.current = features
	}, [features])

	// Source and layers, added on load and again after every style swap —
	// a theme change reloads the style, and the style is what holds them.
	useEffect(() => {
		if (!map || !isLoaded) return
		const dark = resolvedTheme === 'dark'
		if (!map.getSource(REGION)) map.addSource(REGION, { type: 'geojson', data: outline as never })
		// The wash goes in under the basemap's roads and place names — it is part of the ground, not a sheet over it —
		// while the heat and the dots, added after, sit on top of everything.
		const ground = map.getStyle().layers?.find((layer) => layer.type === 'symbol' || layer.type === 'line')?.id
		if (!map.getLayer(REGION_FILL))
			map.addLayer({ id: REGION_FILL, type: 'fill', source: REGION, paint: { 'fill-color': dark ? '#e0604c' : '#8b1e1a', 'fill-opacity': dark ? 0.06 : 0.035 } }, ground)
		if (!map.getSource(SRC)) map.addSource(SRC, { type: 'geojson', data: latest.current })
		if (!map.getLayer(HEAT))
			map.addLayer({
				id: HEAT,
				type: 'heatmap',
				source: SRC,
				paint: {
					'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 1, 0.35, 12, 1],
					'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 5, 0.7, 10, 1.8],
					'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 5, 16, 8, 28, 11, 44],
					'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0.85, 10.5, 0.2],
					// Semantic heat in the estate's own metals: brass warming to crimson.
					'heatmap-color': [
						'interpolate',
						['linear'],
						['heatmap-density'],
						0,
						'rgba(168,129,63,0)',
						0.2,
						'rgba(168,129,63,0.45)',
						0.45,
						'rgba(224,150,60,0.8)',
						0.7,
						'rgba(200,67,43,0.9)',
						1,
						'rgba(125,32,21,1)',
					],
				},
			})
		if (!map.getLayer(PULSE))
			map.addLayer({
				id: PULSE,
				type: 'circle',
				source: SRC,
				paint: { 'circle-color': colourMatch(dark) as never, 'circle-radius': radius(1) as never, 'circle-opacity': 0.5 },
			})
		if (!map.getLayer(PTS))
			map.addLayer({
				id: PTS,
				type: 'circle',
				source: SRC,
				paint: { 'circle-color': colourMatch(dark) as never, 'circle-radius': radius(1) as never, 'circle-opacity': opacity(0.94) as never, 'circle-stroke-width': 1, 'circle-stroke-color': '#ffffff', 'circle-stroke-opacity': opacity(0.9) as never },
			})
		if (!map.getLayer(HALO))
			map.addLayer({
				id: HALO,
				type: 'circle',
				source: SRC,
				filter: ['==', ['get', 'id'], ''],
				paint: { 'circle-color': 'transparent', 'circle-radius': radius(1.6) as never, 'circle-stroke-width': 2, 'circle-stroke-color': dark ? '#f3efe6' : '#131312' },
			})

		const click = (e: MapLayerMouseEvent) => {
			const id = e.features?.[0]?.properties?.id
			if (id) onSelect(String(id))
		}
		const enter = () => {
			map.getCanvas().style.cursor = 'pointer'
		}
		const leave = () => {
			map.getCanvas().style.cursor = ''
		}
		map.on('click', PTS, click)
		map.on('mouseenter', PTS, enter)
		map.on('mouseleave', PTS, leave)
		return () => {
			map.off('click', PTS, click)
			map.off('mouseenter', PTS, enter)
			map.off('mouseleave', PTS, leave)
		}
	}, [map, isLoaded, resolvedTheme, onSelect])

	// The pulse: every 1.8 s the ring under each dot grows to two and a half
	// times the dot and fades out. One frame loop for the whole layer.
	useEffect(() => {
		if (!map || !isLoaded) return
		let frame = 0
		const tick = (now: number) => {
			const t = (now % 1800) / 1800
			if (map.getLayer(PULSE)) {
				map.setPaintProperty(PULSE, 'circle-radius', radius(1 + 1.5 * t) as never)
				map.setPaintProperty(PULSE, 'circle-opacity', opacity(0.5 * (1 - t)) as never)
			}
			frame = requestAnimationFrame(tick)
		}
		frame = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(frame)
	}, [map, isLoaded])

	useEffect(() => {
		if (!map || !isLoaded) return
		;(map.getSource(SRC) as GeoJSONSource | undefined)?.setData(features)
	}, [map, isLoaded, features])

	useEffect(() => {
		if (!map || !isLoaded || !map.getLayer(HALO)) return
		map.setFilter(HALO, ['==', ['get', 'id'], selectedId ?? ''])
	}, [map, isLoaded, selectedId])

	useEffect(() => {
		if (!map || !isLoaded || !map.getLayer(HEAT) || !map.getLayer(PTS)) return
		map.setLayoutProperty(HEAT, 'visibility', show === 'points' ? 'none' : 'visible')
		for (const id of [PULSE, PTS, HALO]) map.setLayoutProperty(id, 'visibility', show === 'heat' ? 'none' : 'visible')
	}, [map, isLoaded, show])

	// A row in the list asked for this incident: fly there.
	useEffect(() => {
		if (!map || !isLoaded || !focus) return
		map.flyTo({ center: [focus.lon, focus.lat], zoom: Math.max(map.getZoom(), 10.5), duration: 900 })
	}, [map, isLoaded, focus])

	return null
}

export default function AccidentMapCanvas({
	features,
	show,
	selectedId,
	onSelect,
	focus,
}: {
	features: AccidentFeatures
	show: 'both' | 'heat' | 'points'
	selectedId: string | null
	onSelect: (id: string | null) => void
	focus: Focus
}) {
	// MapLibre draws on WebGL2 and throws without it. Checked once, before the
	// map is asked for, so a reader on an old browser gets a sentence and the
	// list rather than a crashed dialog.
	const [webgl] = useState(() => {
		try {
			return !!document.createElement('canvas').getContext('webgl2')
		} catch {
			return false
		}
	})

	if (!webgl)
		return (
			<div className='flex h-full w-full items-center justify-center bg-[var(--paper-2)] p-8 text-center text-[14px] leading-[1.7] text-[var(--ink-3)]'>
				The map needs WebGL2, which this browser does not provide. Every incident is listed with its sources.
			</div>
		)

	return (
		<Map className='h-full w-full' bounds={BOUNDS} fitBoundsOptions={FIT} minZoom={4.5} maxZoom={16}>
			<Layers features={features} show={show} selectedId={selectedId} focus={focus} onSelect={onSelect} />
			<MapControls position='top-right' showZoom />
			<AllBarmm />
		</Map>
	)
}
