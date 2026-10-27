'use client'

import type { FeatureCollection, Point } from 'geojson'
import type { MapLayerMouseEvent } from 'maplibre-gl'
import { useEffect, useMemo, useState } from 'react'
import outline from '../../../../datasets/accidents/barmm-outline.json'
import { Map, MapControls, useMap } from './mapcn'
import type { MapPlace } from './project-places'

/* ============================================================
   The projects map itself: one dot per place

   The incident map's canvas, cut down to what a budget needs: the
   region washed in under the basemap, a dot for every place the Act
   puts a project, its area following the money there, and a ring in
   the ink around the chosen one. Loaded only in the browser — MapLibre
   wants a window — through `next/dynamic` from the dialog, which holds
   the choice; a click here only reports which place.
   ============================================================ */

export type Focus = { key: string; lon: number; lat: number; nonce: number } | null

const SRC = 'projects'
const REGION = 'barmm'
const REGION_FILL = 'barmm-fill'
const PTS = 'projects-points'
const HALO = 'projects-halo'
const MAX_ZOOM = 12

/** The whole region, the opening view: the incident map's. */
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
			className='absolute right-12 top-2 z-10 flex h-8 cursor-pointer items-center rounded-md border border-[var(--rule)] bg-[var(--paper)] px-3 text-[0.75rem] font-semibold text-[var(--ink)] shadow-sm transition hover:text-[var(--accent)]'
		>
			All BARMM
		</button>
	)
}

/** A dot's radius at this zoom, scaled: area, not radius, follows the money (`r` is the square root of its share of the largest). */
const radius = (scale: number) => [
	'interpolate',
	['linear'],
	['zoom'],
	5,
	['*', scale, ['+', 3, ['*', 13, ['get', 'r']]]],
	MAX_ZOOM,
	['*', scale, ['+', 5, ['*', 22, ['get', 'r']]]],
]

function Layers({ places, selected, focus, onSelect }: { places: MapPlace[]; selected: string | null; focus: Focus; onSelect: (key: string) => void }) {
	const { map, isLoaded, resolvedTheme } = useMap()

	// The costliest first, so the small dots are drawn over the large ones and stay clickable.
	const features = useMemo<FeatureCollection<Point>>(() => {
		const most = places[0]?.total ?? 1
		return {
			type: 'FeatureCollection',
			features: places.map((p) => ({
				type: 'Feature',
				geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
				properties: { key: p.key, at: p.at, r: Math.sqrt(p.total / most) },
			})),
		}
	}, [places])

	// Added on load and again after every style swap: a theme change reloads the style, and the style holds them.
	useEffect(() => {
		if (!map || !isLoaded) return
		const dark = resolvedTheme === 'dark'
		const accent = dark ? '#e8796a' : '#8a2418'
		if (!map.getSource(REGION)) map.addSource(REGION, { type: 'geojson', data: outline as never })
		const ground = map.getStyle().layers?.find((layer) => layer.type === 'symbol' || layer.type === 'line')?.id
		if (!map.getLayer(REGION_FILL))
			map.addLayer({ id: REGION_FILL, type: 'fill', source: REGION, paint: { 'fill-color': dark ? '#e0604c' : '#8b1e1a', 'fill-opacity': dark ? 0.06 : 0.035 } }, ground)
		if (!map.getSource(SRC)) map.addSource(SRC, { type: 'geojson', data: features })
		if (!map.getLayer(PTS))
			map.addLayer({
				id: PTS,
				type: 'circle',
				source: SRC,
				paint: {
					'circle-color': accent,
					'circle-radius': radius(1) as never,
					// Paler where only the town is named, so a town centre reads as a stand-in and not a site.
					'circle-opacity': ['case', ['==', ['get', 'at'], 'town'], 0.38, 0.68],
					'circle-stroke-width': 1,
					'circle-stroke-color': '#ffffff',
					'circle-stroke-opacity': 0.85,
				},
			})
		if (!map.getLayer(HALO))
			map.addLayer({
				id: HALO,
				type: 'circle',
				source: SRC,
				filter: ['==', ['get', 'key'], ''],
				paint: { 'circle-color': 'transparent', 'circle-radius': radius(1) as never, 'circle-stroke-width': 2.5, 'circle-stroke-color': dark ? '#f3efe6' : '#131312' },
			})

		const click = (e: MapLayerMouseEvent) => {
			const key = e.features?.[0]?.properties?.key
			if (key) onSelect(String(key))
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
	}, [map, isLoaded, resolvedTheme, features, onSelect])

	useEffect(() => {
		if (!map || !isLoaded || !map.getLayer(HALO)) return
		map.setFilter(HALO, ['==', ['get', 'key'], selected ?? ''])
	}, [map, isLoaded, selected])

	// A row in the list asked for this place: fly there.
	useEffect(() => {
		if (!map || !isLoaded || !focus) return
		map.flyTo({ center: [focus.lon, focus.lat], zoom: Math.max(map.getZoom(), 9.5), duration: 900 })
	}, [map, isLoaded, focus])

	return null
}

export default function ProjectMapCanvas({ places, selected, focus, onSelect }: { places: MapPlace[]; selected: string | null; focus: Focus; onSelect: (key: string) => void }) {
	// MapLibre draws on WebGL2 and throws without it: a sentence and the list instead of a crashed dialog.
	const [webgl] = useState(() => {
		try {
			return !!document.createElement('canvas').getContext('webgl2')
		} catch {
			return false
		}
	})

	if (!webgl)
		return (
			<div className='flex h-full w-full items-center justify-center bg-[var(--paper-2)] p-8 text-center text-[0.875rem] leading-[1.7] text-[var(--ink-3)]'>
				The map needs WebGL2, which this browser does not provide. Every place is listed beside it.
			</div>
		)

	return (
		<Map className='h-full w-full' bounds={BOUNDS} fitBoundsOptions={FIT} minZoom={4.5} maxZoom={MAX_ZOOM}>
			<Layers places={places} selected={selected} focus={focus} onSelect={onSelect} />
			<MapControls position='top-right' showZoom />
			<AllBarmm />
		</Map>
	)
}
