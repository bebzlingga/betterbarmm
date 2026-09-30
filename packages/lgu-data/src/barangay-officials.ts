import rosters from '../../../datasets/lgu/barangay-officials.json'

/* ============================================================
   Who runs the barangay

   A barangay is the unit of government a reader actually lives in,
   and until now it was the one rung of the ladder this directory
   could only count. The names come from DILG's own public directory:
   2,180 barangays, one request each.

   Three things to know before reading a name off a page.

   About a quarter of BARMM's barangays have no entry in DILG's
   directory. The file marks those barangays present with an empty
   roster rather than leaving them out, so a page can say "DILG has no
   roster for this barangay" instead of implying nobody holds the
   office.

   DILG stamps no term on the data. It is a live directory that
   barangays report into, so what is here is what it held on
   `capturedAt` — not the roll of a term, and not necessarily current
   today.

   Contact details are not republished. DILG returns an e-mail address
   and a hall telephone number for most officials; a searchable form
   and a static page are different things to put 14,000 personal
   addresses into, and the directory itself is one click away for
   anyone who needs to write to someone.

   Imported by a subpath rather than the barrel: it is 900KB and the
   unit finder is a client component.

   Rebuild with datasets/lgu/scripts/fetch_barangay_officials.py.
   ============================================================ */

export type BarangayOfficial = { name: string }

/**
 * One barangay's officers.
 *
 * The first three are elected at the Barangay and Sangguniang Kabataan
 * Elections; the last two are appointed by the punong barangay. Every field is
 * optional because DILG's record of any one barangay can be partial — a
 * roster with a secretary and no captain is a gap in the directory, and the
 * page shows what there is.
 */
export type BarangayRoster = {
	punongBarangay?: BarangayOfficial
	council?: BarangayOfficial[]
	skChairperson?: BarangayOfficial
	secretary?: BarangayOfficial
	treasurer?: BarangayOfficial
}

export type BarangayOfficialsFile = {
	name: string
	capturedAt: string
	source: { label: string; href: string }
	note: string
	offices: { elected: string[]; note: string }
	/**
	 * Unit slug → barangay PSGC code, or its name where it has no code.
	 *
	 * The Special Geographic Area's barangays have no code: its municipalities
	 * were ratified in 2024 and PSA has not issued them yet. Names are unique
	 * inside a unit, so they key cleanly — except in Shariff Saydona Mustapha,
	 * which has two barangays called Pagatin and where both do have codes.
	 */
	units: Record<string, Record<string, BarangayRoster | undefined> | undefined>
}

export const barangayOfficials = rosters as BarangayOfficialsFile

/** Every roster in a unit, keyed as `rosterKey` keys them. */
export function unitRosters(slug: string): Record<string, BarangayRoster | undefined> {
	return barangayOfficials.units[slug] ?? {}
}
