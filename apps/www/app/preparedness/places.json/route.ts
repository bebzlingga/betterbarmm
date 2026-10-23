import { barangays } from '../../_lib/preparedness'

// Built once at build time; the map fetches it when it first draws, to pick a place and to find what is near it.
export const dynamic = 'force-static'

export function GET() {
	return Response.json(barangays.map((b) => ({ psgc: b.psgc, name: b.name, town: b.town, town_psgc: b.town_psgc, prov: b.prov, area: b.area, pop: b.pop, at: b.at, bbox: b.bbox, flood: b.flood, landslide: b.landslide, surge: b.surge })))
}
