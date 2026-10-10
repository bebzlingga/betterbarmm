/* ============================================================
   Full Disclosure Policy postings, by local government

   DILG's Full Disclosure Policy has every province, city and
   municipality post 14 financial documents — its budget, its
   procurement plan, its quarterly statements, how it spent its
   20% development fund and its disaster fund — in three
   conspicuous places and on DILG's portal. This is what each
   BARMM unit has posted to the portal since 2023, read from its
   public report by datasets/lgu/scripts/fetch_fdpp.py.

   A posting says a document was put up, for which period; the
   file is DILG's, behind `download + id`. A period with nothing
   here is a period with nothing on the portal — not proof the
   document was never produced.
   ============================================================ */

import file from '../../../datasets/lgu/fdpp.json'
import codesFile from '../../../datasets/lgu/fdpp-codes.json'

export type FdppPeriod = { year?: number; quarter?: number; label?: string }

export type FdppPosting = {
	id: number
	document: number
	/** The period the document covers. */
	period: FdppPeriod
	/** When it went up. */
	posted: FdppPeriod
}

export const fdpp = file as unknown as {
	name: string
	generatedAt: string
	source: { label: string; href: string }[]
	note: string
	download: string
	documents: { id: number; label: string }[]
	units: Record<string, FdppPosting[]>
}


/**
 * The portal's own filter for a unit: its province code, and for a city or
 * municipality its two-digit code under it. Found by datasets/lgu/scripts/
 * fdpp_codes.py, since the portal lists them only to signed-in users.
 */
const codes = codesFile as unknown as { base: string; units: Record<string, { province: string; lgu?: string }> }

/**
 * DILG's report filtered to one unit, or null. A province's filter takes in
 * its towns as well — the portal has no way to ask for the province alone.
 */
export function fdppPortal(unitKey: string): { href: string; town: boolean } | null {
	const code = codes.units[unitKey]
	if (!code) return null
	return {
		href: `${codes.base}&province_filter=${code.province}${code.lgu ? `&lgu_filter=${code.lgu}` : ''}`,
		town: Boolean(code.lgu),
	}
}
