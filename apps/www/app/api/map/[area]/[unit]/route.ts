import { allUnits, buildUnit } from '../../../../_lib/map-data'

// One file per town, built ahead: the data only changes when the datasets do.
export const dynamic = 'force-static'

export function generateStaticParams() {
	return allUnits()
}

/** One town in full — officials, places, every barangay — fetched when a reader flies in. */
export async function GET(_request: Request, { params }: { params: Promise<{ area: string; unit: string }> }) {
	const { area, unit } = await params
	const detail = buildUnit(area, unit)
	return detail ? Response.json(detail) : Response.json({ error: 'No such town' }, { status: 404 })
}
