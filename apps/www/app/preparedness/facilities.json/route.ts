import { facilities } from '../../_lib/preparedness-facilities'

// Built once at build time; the map fetches it when it first draws.
export const dynamic = 'force-static'

export function GET() {
	return Response.json(facilities.map((f) => ({ id: f.id, kind: f.kind, name: f.name, lon: f.lon, lat: f.lat, town: f.barangay ? `${f.barangay}, ${f.town}` : f.town, prov: f.prov, detail: f.detail, source: f.source })))
}
