import file from '../../../datasets/lgu/barangay-population.json'

/* PSA's 2024 census count for each barangay, keyed like the barangay
   officials: by the barangay's PSGC code in barmm-lgu.json, or its name
   where it has none. A barangay with no count is absent, never zero.

   Rebuilt by datasets/lgu/scripts/build_barangay_population.py. */

export const barangayPopulation = file as {
	source: { label: string; href: string }
	note: string
	units: Record<string, Record<string, number> | undefined>
}

export function barangayCounts(unitKey: string): Record<string, number> {
	return barangayPopulation.units[unitKey] ?? {}
}
