/* ============================================================
   Money, audits and awards, by local government

   What each province, city and municipality reported collecting
   and spending (BLGF's Statement of Receipts and Expenditures and
   its other per-LGU tables), its income class, its procurement,
   the national releases that name it, its COA audits, and the
   seals and awards it has won — FY 2016 on for the statement,
   FY 2009 on for regular income and the education fund.

   Every figure is a reported actual, not the budget a council
   passed, except the disaster fund, which BLGF publishes both
   ways. Barangays are in none of it. Keys are directory slugs:
   "basilan" for a province, "basilan/lamitan" for a town. A year
   that is absent is a year with no record, never a zero.

   Each dataset's own `note` says what it is and is not; a page
   that prints one of these figures prints that note with it.
   ============================================================ */

import financesFile from '../../../datasets/lgu/finances.json'
import fundsFile from '../../../datasets/lgu/funds.json'
import incomeClassFile from '../../../datasets/lgu/income-class.json'
import sglgFile from '../../../datasets/lgu/sglg.json'
import cmciFile from '../../../datasets/lgu/cmci.json'
import awardsFile from '../../../datasets/lgu/awards.json'
import procurementFile from '../../../datasets/lgu/procurement.json'
import fundReleasesFile from '../../../datasets/lgu/fund-releases.json'
import coaAuditsFile from '../../../datasets/lgu/coa-audits.json'

type Source = { label: string; href: string; fiscalYear?: number }
type Value = number | string | null
type ByUnit<T> = Record<string, T>

/** A BLGF table: each unit's year is a row of values in the order of `fields`. */
export type Table = {
	source: Source[]
	note: string
	years: number[]
	fields: { key: string; label: string }[]
	units: ByUnit<Record<string, Value[]>>
	/** Maguindanao before its 2022 split. */
	former: ByUnit<Record<string, Value[]>>
}

export type Certificate = {
	control: string
	barangay?: string
	status: string | null
	date: string | null
	purpose: string
	proposedAmount: number | null
	netDebtServiceCeiling: number | null
	borrowingCapacity: number | null
	href: string
}

type Dataset<T> = { name: string; generatedAt: string; source: Source[]; note: string; units: ByUnit<T>; former: ByUnit<T> }

export const finances = financesFile as unknown as Table & { name: string; generatedAt: string }

export const funds = fundsFile as unknown as {
	name: string
	note: string
	dependency: Table
	disasterFund: Table
	educationFund: Table
	propertyRoll: Table
	borrowing: { source: Source[]; note: string; units: ByUnit<Certificate[]> }
}

export const incomeClass = incomeClassFile as unknown as Dataset<
	Record<string, { class: string; retained?: boolean; computedClass?: string; href: string }>
>

export const sglg = sglgFile as unknown as Dataset<
	Record<string, { passed: true; award: string; incentive?: number; href: string }>
> & { years: number[]; status: Record<string, string> }

export const cmci = cmciFile as unknown as Dataset<
	Record<string, { overall: number; rank?: number; rankCategory?: string; href: string }>
> & { years: number[] }

export type Award = { id: string; name: string; agency: string; scope: 'national' | 'regional'; recognises: string }

export const awards = awardsFile as unknown as Dataset<
	{ award: string; year: number; conferred?: string; level?: string; category?: string; rank?: number; barangay?: string; href: string }[]
> & { awards: Award[] }

export const procurement = procurementFile as unknown as Dataset<
	Record<string, { notices: number; abc: number; awarded: number; contracts: number }>
> & { years: number[] }

export const fundReleases = fundReleasesFile as unknown as Dataset<
	Record<string, { kind: 'SARO' | 'NCA'; number: string; fund: string | null; purpose: string; amount: number; date: string; barangay?: string; href: string }[]>
> & { years: number[] }

export const coaAudits = coaAuditsFile as unknown as Dataset<
	Record<string, { opinion: string; liabilities?: number; observations: number; href: string }>
>

/**
 * One year of a BLGF table as named fields — `row(finances, 'basilan/lamitan', 2024)?.nta`.
 * Null where the LGU has no row that year.
 */
export function row(table: Table, key: string, year: number | string): Record<string, Value> | null {
	const values = table.units[key]?.[String(year)]
	return values ? Object.fromEntries(table.fields.map((field, i) => [field.key, values[i] ?? null])) : null
}

/** The latest year a BLGF table has for this LGU, or null. */
export function latestYear(table: Table, key: string): number | null {
	const years = Object.keys(table.units[key] ?? {}).map(Number)
	return years.length ? Math.max(...years) : null
}
