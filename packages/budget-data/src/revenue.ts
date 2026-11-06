import file from '../../../datasets/budget/revenue.json'

/* ============================================================
   What Manila sends

   The three amounts the national General Appropriations Act
   sets aside for the region each year: the annual block grant,
   the Special Development Fund and the share in national taxes
   collected here. Read from DBM's own pages of each GAA; see
   datasets/budget/revenue.json.
   ============================================================ */

export type RevenueYear = {
	year: number
	blockGrant: number
	specialDevelopmentFund: number
	taxShare: number
	/** DBM's PDF of the GAA pages these were read from. */
	source: string
}

export const revenueNote: string = file.note

/** Oldest first. */
export const revenueYears: (RevenueYear & { national: number })[] = file.years.map((y) => ({
	...y,
	national: y.blockGrant + y.specialDevelopmentFund + y.taxShare,
}))
