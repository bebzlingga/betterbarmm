import boundaries from '../../../datasets/lgu/barmm-boundaries.json'

/* ============================================================
   The shape of each area

   SVG path data, not GeoJSON. The projection, the simplification
   and the winding are all settled in
   `datasets/lgu/scripts/build_boundaries.py`, so what reaches a
   page is a string it can put in a `d` attribute and nothing it
   has to understand. No projection code ships to a browser and no
   coordinate is parsed at runtime.

   The outlines are PSA's, through the Philippine Standard
   Geographic Code, at the lowest resolution the source publishes.
   That is a simplification of a survey: good enough to recognize a
   province, not good enough to settle where one ends. A page
   drawing these should not invite anyone to read a boundary off
   them.

   Three things to know before drawing it:

   · `land` is every other piece of land in the frame, as one path:
     Mindanao behind the mainland provinces, the Sulu archipelago
     around the island ones, the southern tip of Palawan. One path
     and not seventy, because it is one thing on the page — land
     that is not the region — and the map draws no distinction
     inside it. Nothing in it is counted anywhere.

   · `outside` is land that is not BARMM. Sulu is the whole of it.
     The Supreme Court removed the province from the region in
     2024, after the PSGC edition these outlines come from, and it
     is kept only because dropping it leaves a hole in the middle
     of the archipelago between Basilan and Tawi-Tawi. It is never
     one of the region's areas and is never counted into one.

   · `missing` is an area with no shape at all. The Special
     Geographic Area is the whole of it: its 63 barangays were
     ratified in 2024 and the source file for them is an empty
     geometry collection. A map that draws six areas and calls it
     the region is wrong by one, so anything drawing this should
     say what it could not draw.
   ============================================================ */

export type AreaShape = {
	slug: string
	name: string
	/** Ready for a `d` attribute. Fill it with `fill-rule: nonzero`. */
	d: string
}

export type BoundarySet = {
	name: string
	note: string
	source: { label: string; href: string; via: string; viaHref: string }
	viewBox: string
	width: number
	height: number
	/** The region's own areas, in the directory's order. */
	areas: AreaShape[]
	/** Everything else in the frame, as one path. Drawn under the region. */
	land: string
	/** Drawn as land, never as a Bangsamoro area. */
	outside: AreaShape[]
	/** Areas of the region that have no shape to draw. */
	missing: { slug: string; name: string; why: string }[]
	/** Every drawn city and municipality, keyed by its 2023-edition PSGC code. */
	units: UnitShape[]
}

export type UnitShape = {
	/** 2023-edition PSGC (region 19). The directory still carries the older
	    region-15 code; `sameUnit` joins the two. */
	psgc: string
	name: string
	/** The directory slug of the area it is drawn in. */
	area: string
	d: string
}

/**
 * Whether a drawn shape and a directory unit are the same place.
 *
 * The 2023 edition renumbered the region from 15 to 19 and kept the rest of
 * the code, so the last seven digits agree. The two provinces split out of
 * Maguindanao were renumbered outright, which is what the name fallback is for.
 */
export function sameUnit(shapePsgc: string, unitPsgc: string | null, shapeName: string, unitName: string): boolean {
	if (unitPsgc && shapePsgc.slice(-7) === unitPsgc.slice(-7)) return true
	const norm = (s: string) => s.toLowerCase().replace(/^city of /, '').replace(/ city$/, '').replace(/[^a-z]/g, '')
	return norm(shapeName) === norm(unitName)
}

export const barmmBoundaries = boundaries as BoundarySet

export function findShape(slug: string): AreaShape | undefined {
	return barmmBoundaries.areas.find((area) => area.slug === slug)
}
