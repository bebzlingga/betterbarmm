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
