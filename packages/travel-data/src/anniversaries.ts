import file from '../../../datasets/travel/anniversaries.json'

/* ============================================================
   The founding anniversaries of the region's provinces, cities and
   municipalities (datasets/travel/anniversaries.json): the day each
   legally began — its law's effect or its plebiscite where a source
   gives one, else the day the law was passed or signed; a city from
   its charter. `kind` says which, `basis` and `source` say why.
   ============================================================ */

export type AnniversaryKind = 'law' | 'effective' | 'ratified' | 'charter' | 'tradition'

export type Anniversary = {
	area: string
	/** A municipality's slug; none for a province or Cotabato City. */
	slug?: string
	name: string
	/** ISO date; null where only the year is known. */
	date: string | null
	year?: number
	kind: AnniversaryKind
	basis: string
	source: string | null
}

type File = { note: string; areas: Anniversary[]; units: Anniversary[] }
const data = file as unknown as File

export const anniversariesNote = data.note
export const areaAnniversaries: Anniversary[] = data.areas
export const townAnniversaries: Anniversary[] = data.units

export const ANNIVERSARY_KIND_LABEL: Record<AnniversaryKind, string> = {
	law: 'Created by law',
	effective: 'Took effect',
	ratified: 'Ratified by plebiscite',
	charter: 'City charter',
	tradition: 'Founding by tradition',
}

/** The anniversaries with a full date, in the order of the year (month, then day). */
export const byDayOfYear = (list: Anniversary[]) =>
	list.filter((a) => a.date).sort((a, b) => a.date!.slice(5).localeCompare(b.date!.slice(5)) || a.name.localeCompare(b.name))
