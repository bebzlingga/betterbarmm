'use client'

import { TileMap } from './tile-map'

type Point = { id: string; name: string; lat: number; lon: number }

/** "Where you'll be": the place in red, its nearest neighbours in grey, fitted to all of them. */
export function PlaceMap({ here, nearby }: { here: Point; nearby: Point[] }) {
	return (
		<TileMap
			pins={[{ ...here, category: 'here' }, ...nearby.map((p) => ({ ...p, category: 'near' }))]}
			categories={[
				{ key: 'here', label: here.name, color: '#8a2418' },
				{ key: 'near', label: 'Nearby places', color: '#717171' },
			]}
			selected={here.id}
			height={400}
			minZoom={6}
			focusZoom={10}
		/>
	)
}
