import type { Contest } from './dataset'
import history from '../../../datasets/lgu/officials-history.json'

/* ============================================================
   Who has held local office since 2001

   The directory's own `officials` field is the 2025 term as COMELEC
   canvassed it. This is the eight cycles before it, reconstructed by
   OpenHalalan from COMELEC's archived returns and, where those are
   gone, from the Rappler and Ianmaps archives.

   A term here is one of two things, and the difference matters enough
   to be in the type rather than in a footnote:

   · A `canvass` carries every candidate, their votes, their share and
     their rank — the same `Contest` shape as the 2025 record, and it
     renders through the same components. 2016, 2019 and 2022 are a
     canvass for all 100 units; 2010 and 2013 for about half of them.

   · A `roll` carries a name and a party and nothing else, because
     nothing else survives. 2001, 2004 and 2007 are rolls, as are the
     towns the vote counts never reached.

   Reading the second as though it were the first is the one mistake
   this data makes easy, so `kind` discriminates them and a page cannot
   render a roll through the canvass components by accident.

   It is a separate file and a separate import for a second reason: it
   is 2.2MB. The unit finder is a client component that reaches into
   the main dataset on every keystroke, which drags that JSON into the
   browser. This one is imported only by the server components that
   render it, and the subpath export keeps it that way —
   `@betterbarmm/lgu-data/history`, never the barrel.

   Source: OpenHalalan, ODbL v1.0, doi 10.5281/zenodo.17783099.
   Rebuild with datasets/lgu/scripts/fetch_officials_history.py.
   ============================================================ */

/** One person who held an office — all a winners-only record says of them. */
export type OfficeHolder = {
	name: string
	party: string | null
	/** As the source recorded it. Absent where it did not. */
	sex?: 'M' | 'F'
}

/** A city or municipality's term, with the vote behind it. */
export type UnitCanvass = {
	kind: 'canvass'
	mayor?: Contest
	viceMayor?: Contest
	council?: Contest[]
}

/** A city or municipality's term, winners only. */
export type UnitRoll = {
	kind: 'roll'
	mayor?: OfficeHolder
	viceMayor?: OfficeHolder
	council?: OfficeHolder[]
}

export type UnitRecord = UnitCanvass | UnitRoll

/**
 * `undivided` is set where the term predates the province.
 *
 * Maguindanao divided in 2022 and first elected two sets of provincial
 * officials in 2025. For every term before that, both del Norte and del Sur
 * carry the same record — the one governor who actually governed them — and
 * this names the province they were governor of, so neither page claims a
 * governor of its own that it did not have.
 */
export type ProvinceCanvass = {
	kind: 'canvass'
	governor?: Contest
	viceGovernor?: Contest
	board?: Contest[]
	undivided?: string
}

export type ProvinceRoll = {
	kind: 'roll'
	governor?: OfficeHolder
	viceGovernor?: OfficeHolder
	board?: OfficeHolder[]
	undivided?: string
}

export type ProvinceRecord = ProvinceCanvass | ProvinceRoll

export type OfficialsHistory = {
	name: string
	/* `licence`, not `license`: it is the key the dataset prints, and the key
	   has to match the file rather than the prose around it. */
	source: { label: string; href: string; doi: string; licence: string }
	note: string
	provinces: Record<string, Record<string, ProvinceRecord | undefined> | undefined>
	units: Record<string, Record<string, UnitRecord | undefined> | undefined>
}

export const officialsHistory = history as OfficialsHistory

/** Every term this file holds for a unit, keyed by term id. Empty if none. */
export function unitHistory(slug: string): Record<string, UnitRecord | undefined> {
	return officialsHistory.units[slug] ?? {}
}

/** Every term this file holds for a province, keyed by term id. */
export function provinceHistory(slug: string): Record<string, ProvinceRecord | undefined> {
	return officialsHistory.provinces[slug] ?? {}
}

/**
 * The person who won, whichever kind of record the term is.
 *
 * The lineage strip asks one question of every term — who took this office —
 * and should not have to know whether the answer came with a tally. A canvass
 * answers with its top-ranked candidate; a roll answers with the only name it
 * has.
 */
export function tookOffice(
	record: UnitRecord | ProvinceRecord | undefined,
	office: 'mayor' | 'governor',
): OfficeHolder | undefined {
	if (!record) return undefined
	if (record.kind === 'canvass') {
		const contest = office === 'mayor'
			? (record as UnitCanvass).mayor
			: (record as ProvinceCanvass).governor
		return contest?.ranked[0]
	}
	return office === 'mayor' ? (record as UnitRoll).mayor : (record as ProvinceRoll).governor
}
