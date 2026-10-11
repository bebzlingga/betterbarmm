/* ============================================================
   Local Government Support Fund, by project

   Money DBM gives an LGU on top of its NTA, for a stated project:
   Financial Assistance to LGUs, the Growth Equity Fund and the rest.
   Read from DBM's COMPASS portal by datasets/lgu/scripts/fetch_lgsf.py.
   ============================================================ */

import file from '../../../datasets/lgu/lgsf.json'

export type LgsfProject = {
	/** Directory key: "lanao-del-sur" or "lanao-del-sur/marawi". */
	unit: string
	program: string
	year: number
	province: string
	/** Null where DBM names only the province. */
	lgu: string | null
	barangay: string | null
	project: string
	/** Allotment (SARO), in pesos. */
	saro: number | null
	/** Cash released (NCA) so far, in pesos. The same money as the SARO, never added to it. */
	nca: number | null
}

export const lgsf = file as {
	name: string
	generatedAt: string
	source: { label: string; href: string }[]
	note: string
	programs: { code: string; name: string }[]
	projects: LgsfProject[]
}
