/* ============================================================
   Where things are

   Enough geography to draw a locator map, and no more than that.

   Every coordinate here is an approximate town or site center given
   to 2 decimal places — about a kilometer. That is the right
   precision for answering "which end of the region is this?" and the
   wrong precision for finding a trailhead. Nothing in this file
   should be used to navigate, and the maps drawn from it say so.

   They were placed by hand rather than taken from a gazetteer, which
   is the honest reason for the 2 decimals: a figure written to 5
   would imply a survey that did not happen.

   The maps are drawn as inline SVG rather than pulled from a tile
   server. A tile provider would be a third party watching every
   reader of this site, would need an API key in the build, and would
   fail entirely for the reader on a bad connection in the region the
   map is of. A drawn map has none of those problems and is more
   legible at the one job it has here.
   ============================================================ */

/** Degrees north, degrees east. Approximate centers, 2 decimal places. */
export type LatLon = { lat: number; lon: number }

export type MapPoint = LatLon & {
	slug: string
	label: string
	/** How the point is drawn — gateways and sites read differently. */
	kind: 'area' | 'place' | 'gateway'
	/** Set on the point a given map is about, so it can be drawn emphasised. */
	area?: string
}

/**
 * The frame every map here is drawn in.
 *
 * It reaches past BARMM on purpose: Zamboanga, Iligan, Laguindingan and Davao
 * are not in the region and are how almost everyone arrives, so a map that
 * stopped at the boundary would leave out the whole answer to "how do I get
 * there".
 */
export const MAP_BOUNDS = { minLat: 4.3, maxLat: 8.9, minLon: 117.9, maxLon: 126.0 }

/**
 * The cosine correction, taken at the frame's middle latitude.
 *
 * Longitude degrees are shorter than latitude degrees everywhere but the
 * equator, so a map that plots them one-for-one squashes the region sideways.
 * At 6.6°N the factor is 0.993 — very nearly 1, which is why a plain
 * equirectangular projection is honest at this scale and would not be at a
 * continental one.
 */
const LAT_K = Math.cos((((MAP_BOUNDS.minLat + MAP_BOUNDS.maxLat) / 2) * Math.PI) / 180)

/** Projected units per degree, set so the frame is exactly 100 units wide. */
export const UNITS_PER_DEGREE = 100 / ((MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon) * LAT_K)

/**
 * The frame's height in the same units.
 *
 * Derived rather than chosen, which is the whole point: x and y share one
 * scale, so the drawing keeps the region's real proportions and a distance
 * measured across the map means the same thing in either direction.
 */
export const MAP_HEIGHT = (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat) * UNITS_PER_DEGREE

/** Length of a 100 km bar in projected units — the scale rule on the map. */
export const UNITS_PER_100KM = (100 / 111.32) * UNITS_PER_DEGREE

/** Longitude, latitude → x, y in projected units. y is flipped, as SVG counts down. */
export function project({ lat, lon }: LatLon): { x: number; y: number } {
	return {
		x: (lon - MAP_BOUNDS.minLon) * LAT_K * UNITS_PER_DEGREE,
		y: (MAP_BOUNDS.maxLat - lat) * UNITS_PER_DEGREE,
	}
}

/** Whole-degree gridlines inside the frame, for the graticule. */
export const graticule = {
	lons: Array.from(
		{ length: Math.floor(MAP_BOUNDS.maxLon) - Math.ceil(MAP_BOUNDS.minLon) + 1 },
		(_, i) => Math.ceil(MAP_BOUNDS.minLon) + i,
	),
	lats: Array.from(
		{ length: Math.floor(MAP_BOUNDS.maxLat) - Math.ceil(MAP_BOUNDS.minLat) + 1 },
		(_, i) => Math.ceil(MAP_BOUNDS.minLat) + i,
	),
}

/** One point per travel area, for the region map. */
export const areaPoints: MapPoint[] = [
	{ slug: 'tawi-tawi', label: 'Tawi-Tawi', kind: 'area', lat: 5.05, lon: 119.8 },
	{ slug: 'basilan', label: 'Basilan', kind: 'area', lat: 6.6, lon: 122.05 },
	{ slug: 'maguindanao-del-norte', label: 'Maguindanao del Norte', kind: 'area', lat: 7.25, lon: 124.1 },
	{ slug: 'cotabato-city', label: 'Cotabato City', kind: 'area', lat: 7.22, lon: 124.25 },
	{ slug: 'maguindanao-del-sur', label: 'Maguindanao del Sur', kind: 'area', lat: 6.85, lon: 124.45 },
	{ slug: 'special-geographic-area', label: 'Special Geographic Area', kind: 'area', lat: 7.1, lon: 124.62 },
	{ slug: 'lanao-del-sur', label: 'Lanao del Sur', kind: 'area', lat: 7.85, lon: 124.3 },
]

/**
 * The ways in.
 *
 * Four of these are outside BARMM. That is the point of showing them: the
 * region has no single gateway, and choosing the wrong one costs a day.
 */
export const gatewayPoints: MapPoint[] = [
	{ slug: 'awang', label: 'Awang (CBO)', kind: 'gateway', lat: 7.17, lon: 124.21 },
	{ slug: 'sanga-sanga', label: 'Sanga-Sanga (TWT)', kind: 'gateway', lat: 5.05, lon: 119.74 },
	{ slug: 'zamboanga', label: 'Zamboanga (ZAM)', kind: 'gateway', lat: 6.92, lon: 122.06 },
	{ slug: 'laguindingan', label: 'Laguindingan (CGY)', kind: 'gateway', lat: 8.61, lon: 124.46 },
	{ slug: 'iligan', label: 'Iligan', kind: 'gateway', lat: 8.23, lon: 124.24 },
	{ slug: 'davao', label: 'Davao (DVO)', kind: 'gateway', lat: 7.13, lon: 125.65 },
]

/** One point per place in the guide, keyed to the place slug. */
export const placePoints: MapPoint[] = [
	{ slug: 'grand-mosque-cotabato', label: 'Grand Mosque', kind: 'place', area: 'cotabato-city', lat: 7.19, lon: 124.22 },
	{ slug: 'pedro-colina-hill', label: 'Pedro Colina Hill', kind: 'place', area: 'cotabato-city', lat: 7.21, lon: 124.25 },
	{ slug: 'kutawato-caves', label: 'Kutawato Caves', kind: 'place', area: 'cotabato-city', lat: 7.21, lon: 124.25 },
	{ slug: 'tamontaka-church', label: 'Tamontaka Church', kind: 'place', area: 'cotabato-city', lat: 7.17, lon: 124.26 },
	{ slug: 'bud-bongao', label: 'Bud Bongao', kind: 'place', area: 'tawi-tawi', lat: 5.03, lon: 119.78 },
	{ slug: 'panampangan-island', label: 'Panampangan', kind: 'place', area: 'tawi-tawi', lat: 5.2, lon: 120.13 },
	{ slug: 'sheik-makhdum-mosque', label: 'Makhdum Mosque', kind: 'place', area: 'tawi-tawi', lat: 4.9, lon: 119.87 },
	{ slug: 'sitangkai', label: 'Sitangkai', kind: 'place', area: 'tawi-tawi', lat: 4.66, lon: 119.39 },
	{ slug: 'turtle-islands', label: 'Turtle Islands', kind: 'place', area: 'tawi-tawi', lat: 6.08, lon: 118.32 },
	{ slug: 'lake-lanao', label: 'Lake Lanao', kind: 'place', area: 'lanao-del-sur', lat: 7.9, lon: 124.28 },
	{ slug: 'aga-khan-museum', label: 'Aga Khan Museum', kind: 'place', area: 'lanao-del-sur', lat: 8.0, lon: 124.29 },
	{ slug: 'tugaya', label: 'Tugaya', kind: 'place', area: 'lanao-del-sur', lat: 7.87, lon: 124.16 },
	{ slug: 'kawayan-torogan', label: 'Kawayan Torogan', kind: 'place', area: 'lanao-del-sur', lat: 7.98, lon: 124.2 },
	{ slug: 'marawi-ground-zero', label: 'Marawi', kind: 'place', area: 'lanao-del-sur', lat: 8.0, lon: 124.29 },
	{ slug: 'upi-uplands', label: 'Upi', kind: 'place', area: 'maguindanao-del-norte', lat: 6.99, lon: 124.16 },
	{ slug: 'illana-bay-coast', label: 'Parang', kind: 'place', area: 'maguindanao-del-norte', lat: 7.37, lon: 124.27 },
	{ slug: 'masjid-dimaukom', label: 'Pink Mosque', kind: 'place', area: 'maguindanao-del-sur', lat: 6.94, lon: 124.44 },
	{ slug: 'ligawasan-marsh', label: 'Ligawasan Marsh', kind: 'place', area: 'maguindanao-del-sur', lat: 7.0, lon: 124.45 },
	{ slug: 'lamitan', label: 'Lamitan', kind: 'place', area: 'basilan', lat: 6.65, lon: 122.13 },
	{ slug: 'bulingan-falls', label: 'Bulingan Falls', kind: 'place', area: 'basilan', lat: 6.62, lon: 122.14 },
	{ slug: 'malamawi-island', label: 'Malamawi', kind: 'place', area: 'basilan', lat: 6.71, lon: 121.94 },
]

export const pointForArea = (slug: string): MapPoint | undefined =>
	areaPoints.find((point) => point.slug === slug)

export const pointsInArea = (slug: string): MapPoint[] =>
	placePoints.filter((point) => point.area === slug)

export const pointForPlace = (slug: string): MapPoint | undefined =>
	placePoints.find((point) => point.slug === slug)

/* ---- Getting between them ------------------------------------------------ */

/**
 * A leg of a journey, with how long it actually takes.
 *
 * Durations are the honest ranges a resident would give you, not a routing
 * engine's estimate. Sea crossings vary with weather, roads vary with the
 * season, and both vary more here than a single figure could carry — so where
 * a range is wide, the range is what is stated.
 */
export type Leg = {
	from: string
	to: string
	mode: 'air' | 'sea' | 'road'
	duration: string
	note?: string
}

export const legs: Leg[] = [
	{ from: 'Manila', to: 'Awang (Cotabato)', mode: 'air', duration: 'About 1h 45m', note: 'Daily jets. The main door into the region.' },
	{ from: 'Awang', to: 'Cotabato City', mode: 'road', duration: 'About 30 minutes' },
	{ from: 'Davao', to: 'Cotabato City', mode: 'road', duration: '4 to 5 hours', note: 'Buses and vans all day, through Sultan Kudarat province.' },
	{ from: 'General Santos', to: 'Cotabato City', mode: 'road', duration: '3 to 4 hours' },
	{ from: 'Cotabato City', to: 'Parang', mode: 'road', duration: 'About 1 hour', note: 'For the Illana Bay coast and Polloc port.' },
	{ from: 'Cotabato City', to: 'Upi', mode: 'road', duration: '1 to 2 hours', note: 'Longer after heavy rain; the last stretches are rough.' },
	{ from: 'Cotabato City', to: 'Datu Saudi-Ampatuan', mode: 'road', duration: '2 to 3 hours', note: 'For the Pink Mosque, via Datu Piang. Ask locally before setting out.' },
	{ from: 'Manila or Cebu', to: 'Zamboanga', mode: 'air', duration: 'About 1h 30m from Manila', note: 'The hub for Tawi-Tawi and Basilan.' },
	{ from: 'Zamboanga', to: 'Bongao (Sanga-Sanga)', mode: 'air', duration: 'About 1 hour', note: 'The standard route into Tawi-Tawi.' },
	{ from: 'Zamboanga', to: 'Bongao', mode: 'sea', duration: 'Over 24 hours', note: 'Cheap, and how most residents travel. Budget a full day and a night each way.' },
	{ from: 'Zamboanga', to: 'Basilan', mode: 'sea', duration: '1 to 2 hours', note: 'Fast craft to Isabela and Lamitan; RORO is slower.' },
	{ from: 'Bongao', to: 'Simunul', mode: 'sea', duration: 'Around 1 hour', note: 'Boat only. Weather decides the schedule.' },
	{ from: 'Bongao', to: 'Panampangan', mode: 'sea', duration: 'Several hours each way', note: 'Chartered, not scheduled. Go on the low tide or there is no sandbar.' },
	{ from: 'Bongao', to: 'Sitangkai', mode: 'sea', duration: 'Most of a day, via Sibutu' },
	{ from: 'Manila or Cebu', to: 'Laguindingan (CGY)', mode: 'air', duration: 'About 1h 30m from Manila', note: 'The way to Lanao del Sur.' },
	{ from: 'Laguindingan', to: 'Iligan', mode: 'road', duration: '1 to 2 hours' },
	{ from: 'Iligan', to: 'Marawi', mode: 'road', duration: 'About 1h 30m', note: 'Vans run frequently through the morning.' },
	{ from: 'Marawi', to: 'Tugaya', mode: 'road', duration: 'About 1 hour', note: 'Part of the Lake Lanao circuit; a hired vehicle does the loop in a day.' },
]

export const legsFrom = (place: string): Leg[] =>
	legs.filter((leg) => leg.from.toLowerCase().includes(place.toLowerCase()))

/**
 * The legs that matter for one area.
 *
 * Matched on the place names in each leg rather than tagged, because a leg
 * belongs to both ends of itself — Zamboanga to Bongao is a Tawi-Tawi journey
 * even though Zamboanga is not in the region, and it should appear on the
 * Tawi-Tawi page. The Special Geographic Area has no scheduled transport built
 * around its new boundaries, so it matches nothing, which is accurate.
 */
const AREA_LEG_TERMS: Record<string, string[]> = {
	'cotabato-city': ['cotabato', 'awang'],
	'maguindanao-del-norte': ['awang', 'parang', 'upi'],
	'maguindanao-del-sur': ['datu saudi'],
	'tawi-tawi': ['bongao', 'sanga-sanga', 'simunul', 'panampangan', 'sitangkai'],
	basilan: ['basilan'],
	'lanao-del-sur': ['marawi', 'iligan', 'laguindingan', 'tugaya'],
	'special-geographic-area': [],
}

export const legsForArea = (areaSlug: string): Leg[] => {
	const terms = AREA_LEG_TERMS[areaSlug] ?? []
	if (!terms.length) return []

	return legs.filter((leg) => {
		const line = `${leg.from} ${leg.to}`.toLowerCase()
		return terms.some((term) => line.includes(term))
	})
}
