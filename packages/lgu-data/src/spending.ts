/* ============================================================
   What the region spent in each area

   Read off the itemised construction in the seven enacted
   Bangsamoro Acts and summed by the area each project names.

   It is the nearest thing to a per-area budget that exists, and
   it is not one: this is the Bangsamoro Government's money landing
   in a place, not that place's own appropriation. A town's budget
   is in its own ordinance, and nothing — not MILG, not the region,
   not DBM — publishes those together. The page that draws this
   says so at the top, because a table of pesos beside a town name
   will otherwise be read as the town's budget.
   ============================================================ */

import file from '../../../datasets/lgu/area-spending.json'

export type AreaYear = { amount: number; projects: number }

export type AreaSpending = {
	name: string
	/** Every spelling the Acts used for it, oldest first. */
	printedAs: string[]
	/** Set where the area is no longer in the region. */
	note: string | null
	total: number
	years: Record<string, AreaYear>
}

export const areaSpending = file as {
	name: string
	generatedAt: string
	note: string
	years: number[]
	/** How many areas each Act tagged at all — FY 2023 tagged three. */
	areasTaggedPerYear: Record<string, number>
	areas: AreaSpending[]
}

/** Every area's total for one year, for the column foot. */
export function spentIn(year: number): number {
	return areaSpending.areas.reduce((sum, area) => sum + (area.years[String(year)]?.amount ?? 0), 0)
}

/**
 * A year the Acts barely tagged, which a column has to admit to.
 *
 * FY 2023 names a province on three areas where every other Act names seven or
 * eight. Drawing its column like the others would say the region built almost
 * nothing that year, when what happened is that the Act did not print where.
 */
export function thinlyTagged(year: number): boolean {
	const tagged = areaSpending.areasTaggedPerYear[String(year)] ?? 0
	return tagged > 0 && tagged < areaSpending.areas.length / 2
}

/**
 * An amount short enough for a table cell: "₱ 17.9B", "₱ 470M".
 *
 * The budget workspace has `pesoTight` and this is the same rule, written
 * again rather than reached for: pulling it in would mean this app depending
 * on `@betterbarmm/budget-data`, which carries eighteen megabytes of enacted
 * Acts for the sake of one format string.
 *
 * Billions keep a decimal because a tenth of a billion is ₱100 million and
 * still matters; millions drop theirs once the figure is in the hundreds,
 * where a tenth is ₱100,000 and does not.
 */
/** "17.0" is a spreadsheet writing 17. */
const trim = (figure: string) => figure.replace(/\.0$/, '')

export function pesoCell(amount: number | null | undefined): string {
	if (!amount || amount <= 0) return '—'
	if (amount >= 1e9) return `₱ ${trim((amount / 1e9).toFixed(1))}B`
	if (amount >= 1e8) return `₱ ${Math.round(amount / 1e6)}M`
	if (amount >= 1e6) return `₱ ${trim((amount / 1e6).toFixed(1))}M`
	return `₱ ${(amount / 1e6).toFixed(2)}M`
}
