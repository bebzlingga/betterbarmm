import { buildRegion } from '../../_lib/map-data'

// Built once at build time: nothing here changes between requests.
export const dynamic = 'force-static'

/** The region — every area and every drawn town — fetched when the map opens. */
export function GET() {
	return Response.json(buildRegion())
}
