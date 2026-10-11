/* ============================================================
   National Tax Allotment, by local government

   The NTA (the IRA before the Mandanas ruling) is each LGU's
   share of national taxes — for most BARMM towns, nearly all of
   the money they have. DBM sets every share but publishes only the
   BARMM total by level, so the per-LGU figure here is what each
   treasurer reported receiving to the Bureau of Local Government
   Finance. For FY 2025 it agrees with DBM's provincial and city
   totals to the peso.

   It is the LGU's own share. Barangay NTA is paid to the barangays
   and is not in it. A missing year is a town that did not report,
   not a town that got nothing.
   ============================================================ */

import file from '../../../datasets/lgu/nta.json'

/** Pesos by fiscal year, keyed "2025". A year the LGU did not report is absent. */
export type NtaByYear = Record<string, number>

export type NtaUnit = {
	/** The province government's own share. Set on a province's key only. */
	province?: NtaByYear
	/** The city or municipality's own share, barangays excluded. */
	lgu?: NtaByYear
	/** Total of the unit's barangays' shares, where published. Not yet published for BARMM. */
	barangays?: NtaByYear
}

export const nta = file as {
	name: string
	generatedAt: string
	source: { label: string; href: string; fiscalYear: number }[]
	note: string
	years: number[]
	units: Record<string, NtaUnit>
}

/**
 * The NTA for a province (`ntaFor('lanao-del-sur')`) or a town in it
 * (`ntaFor('lanao-del-sur', 'marawi')`), by directory slug. Null where
 * nothing was reported — the eight Special Geographic Area towns, so far.
 */
export function ntaFor(provinceSlug: string, unitSlug?: string): NtaUnit | null {
	return nta.units[unitSlug ? `${provinceSlug}/${unitSlug}` : provinceSlug] ?? null
}

import sharesFile from '../../../datasets/lgu/nta-shares.json'

/**
 * DBM's NTA allocation by LGU, from its COMPASS portal: FY 2026 and the
 * FY 2027 figure. An allocation, not a receipt — the BLGF figures in
 * `finances` are what treasurers reported receiving.
 */
export const ntaShares = sharesFile as {
	name: string
	generatedAt: string
	source: { label: string; href: string }[]
	note: string
	years: number[]
	/** DBM's BARMM total, barangays included. */
	region: Record<string, number>
	units: Record<string, NtaUnit>
}

/** The unit's own allocation for a year: a province's, or a city's or town's. */
export function ntaShare(unitKey: string, year: number): number | null {
	const unit = ntaShares.units[unitKey]
	return (unitKey.includes('/') ? unit?.lgu : unit?.province)?.[String(year)] ?? null
}
