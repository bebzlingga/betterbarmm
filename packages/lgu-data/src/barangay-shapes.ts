import file from '../../../datasets/lgu/barmm-barangay-shapes.json'

/* Barangay outlines, in the same frame as barmm-boundaries.json.

   A subpath of its own, like the barangay officials: it is 270KB, and only a
   page that zooms into a town needs any of it — and then only that town's.

   Rebuilt by datasets/lgu/scripts/build_boundaries.py. */

export type BarangayShape = { psgc: string; name: string; d: string }

const shapes = file as { units: Record<string, BarangayShape[] | undefined> }

/** A town's barangays, by the town's 2023-edition PSGC code. */
export function barangayShapes(unitPsgc: string): BarangayShape[] {
	return shapes.units[unitPsgc] ?? []
}
