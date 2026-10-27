import { peso, pesoShort, type Project } from '@betterbarmm/budget-data'
import { mapPlaces } from './project-places'
import { MapDialog } from './map-dialog'

/* ============================================================
   The year's projects on the region

   The places are read out of the projects' names here, on the
   server, and handed to the dialog as plain rows: one per place,
   every project at it, amounts already formatted. The dialog and
   its MapLibre canvas — the incident map's, vendored — are the only
   parts that run in the browser, and the canvas loads only once the
   map is opened.
   ============================================================ */

export function ProjectMap({ projects, fy, title }: { projects: Project[]; fy?: string; title: string }) {
	const { places, placed, atBarangay, sulu, unread } = mapPlaces(projects, { short: pesoShort, exact: peso })
	const most = places[0]?.total ?? 1
	return (
		<MapDialog
			title={title}
			fy={fy}
			places={places}
			count={{ all: projects.length, placed, atBarangay, sulu, unread }}
			legend={[most, most / 4, most / 16].map((amount) => ({ r: Math.sqrt(amount / most), label: pesoShort(amount) }))}
		/>
	)
}
