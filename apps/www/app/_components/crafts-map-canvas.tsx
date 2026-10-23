'use client'

import type { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl'
import { useEffect, useMemo, useState } from 'react'
import outline from '../../../../datasets/accidents/barmm-outline.json'
import type { MapPoint } from '../_lib/craft-places'
import { Map, MapControls, useMap } from './mapcn'

/* The crafts map's canvas: one dot per town where a craft is made, sized by how many,
   and a faint one on a province's centre for crafts whose town no source names.
   Loaded only in the browser, through next/dynamic; a click reports the dot's key. */

const SRC = 'crafts'
const DOTS = 'crafts-dots'
const RING = 'crafts-ring'
const BOUNDS: [[number, number], [number, number]] = [
	[118.2, 4.5],
	[125.0, 8.2],
]

function Layers({ points, selected, onSelect }: { points: MapPoint[]; selected: string | null; onSelect: (key: string) => void }) {
	const { map, isLoaded } = useMap()
	const data = useMemo(
		() => ({
			type: 'FeatureCollection' as const,
			features: points.map((p) => ({ type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [p.lon, p.lat] }, properties: { key: p.key, n: p.crafts.length, town: p.town } })),
		}),
		[points],
	)

	useEffect(() => {
		if (!map || !isLoaded) return
		if (!map.getSource('barmm')) map.addSource('barmm', { type: 'geojson', data: outline as never })
		const ground = map.getStyle().layers?.find((l) => l.type === 'symbol' || l.type === 'line')?.id
		if (!map.getLayer('barmm-fill')) map.addLayer({ id: 'barmm-fill', type: 'fill', source: 'barmm', paint: { 'fill-color': '#7d3f2b', 'fill-opacity': 0.06 } }, ground)
		if (!map.getSource(SRC)) map.addSource(SRC, { type: 'geojson', data })
		const r = ['interpolate', ['linear'], ['get', 'n'], 1, 6, 4, 11, 10, 17]
		if (!map.getLayer(DOTS))
			map.addLayer({
				id: DOTS,
				type: 'circle',
				source: SRC,
				paint: {
					'circle-radius': r as never,
					'circle-color': '#b4613f',
					'circle-opacity': ['case', ['get', 'town'], 0.9, 0.35] as never,
					'circle-stroke-width': 1.5,
					'circle-stroke-color': '#fff7ee',
				},
			})
		if (!map.getLayer(RING))
			map.addLayer({ id: RING, type: 'circle', source: SRC, filter: ['==', ['get', 'key'], ''], paint: { 'circle-radius': ['+', r, 5] as never, 'circle-color': 'transparent', 'circle-stroke-width': 2.5, 'circle-stroke-color': '#3b2419' } })
		const click = (e: MapLayerMouseEvent) => {
			const key = e.features?.[0]?.properties?.key
			if (key) onSelect(String(key))
		}
		const enter = () => (map.getCanvas().style.cursor = 'pointer')
		const leave = () => (map.getCanvas().style.cursor = '')
		map.on('click', DOTS, click)
		map.on('mouseenter', DOTS, enter)
		map.on('mouseleave', DOTS, leave)
		return () => {
			map.off('click', DOTS, click)
			map.off('mouseenter', DOTS, enter)
			map.off('mouseleave', DOTS, leave)
		}
	}, [map, isLoaded, data, onSelect])

	useEffect(() => {
		if (!map || !isLoaded) return
		;(map.getSource(SRC) as GeoJSONSource | undefined)?.setData(data)
	}, [map, isLoaded, data])

	useEffect(() => {
		if (!map || !isLoaded || !map.getLayer(RING)) return
		map.setFilter(RING, ['==', ['get', 'key'], selected ?? ''])
	}, [map, isLoaded, selected])

	return null
}

export default function CraftsMapCanvas({ points, selected, onSelect }: { points: MapPoint[]; selected: string | null; onSelect: (key: string) => void }) {
	// MapLibre needs WebGL2; without it the list beside the map still works.
	const [webgl] = useState(() => {
		try {
			return !!document.createElement('canvas').getContext('webgl2')
		} catch {
			return false
		}
	})
	if (!webgl) return <div className='flex h-full items-center justify-center p-8 text-center text-[14px] text-[#8a6d5c]'>The map needs WebGL2, which this browser does not provide. Every town is listed beside it.</div>
	return (
		<Map className='h-full w-full' bounds={BOUNDS} fitBoundsOptions={{ padding: 24 }} minZoom={4.5} maxZoom={12}>
			<Layers points={points} selected={selected} onSelect={onSelect} />
			<MapControls position='top-right' showZoom />
		</Map>
	)
}
