import { barmmBoundaries, lguProvinces, sameUnit, type LguUnit } from '@betterbarmm/lgu-data'
import townsFile from '../../../datasets/travel/towns.json'

/* ============================================================
   Town by town

   The rest of this guide is written at the level of the area. This
   is the layer under it: one entry per city and municipality, all
   108 of them, researched one town at a time.

   Unlike the area pages, this lives in `datasets/` because every
   named place in it is sourced. A hotel, eatery or attraction is
   here only if a page could be found that names it, and the page is
   kept beside it. The same fields are left out as everywhere else in
   the guide: no rates, phone numbers, addresses or star ratings.

   Most towns have little a visitor can find online. An empty list
   with a note on where people actually sleep is the honest entry,
   and `coverage` says how much was found.
   ============================================================ */

export type Source = { label: string; url: string }

export type TownSpot = {
	name: string
	kind: 'nature' | 'coast' | 'heritage' | 'sacred' | 'market' | 'landmark' | 'other'
	summary: string
	sources: Source[]
}

export type TownListing = { name: string; kind: string; note: string; sources: Source[] }

export type Town = {
	area: string
	slug: string
	name: string
	summary: string
	peoples: string[]
	whereToGo: TownSpot[]
	whatToDo: string[]
	food: { name: string; summary: string }[]
	eat: TownListing[]
	stay: TownListing[]
	stayNote: string | null
	gettingThere: string
	caution: string | null
	sources: Source[]
	coverage: 'good' | 'thin' | 'none'
}

export const towns = townsFile as Town[]

export const SPOT_KIND_LABEL: Record<TownSpot['kind'], string> = {
	nature: 'Nature',
	coast: 'Coast',
	heritage: 'Heritage',
	sacred: 'Sacred site',
	market: 'Market',
	landmark: 'Landmark',
	other: 'Place',
}

export const findTown = (area: string, slug: string): Town | undefined =>
	towns.find((town) => town.area === area && town.slug === slug)

/** Every directory unit in the area, with its guide entry where one exists. */
export function townsInArea(area: string): { unit: LguUnit; town: Town | undefined }[] {
	const province = lguProvinces.find((one) => one.slug === area)
	return (province?.municipalities ?? []).map((unit) => ({ unit, town: findTown(area, unit.slug) }))
}

export type TownShape = { slug: string; name: string; d: string }

/**
 * The area's towns as drawn shapes, framed to fit.
 *
 * The viewBox is the bounding box of the area's own units, read off the path
 * numbers — the paths are absolute M/L commands, so every pair is a point.
 * Null where the area has no shapes (the Special Geographic Area).
 */
export function townShapes(area: string): { viewBox: string; shapes: TownShape[] } | null {
	const province = lguProvinces.find((one) => one.slug === area)
	if (!province) return null
	const shapes = barmmBoundaries.units.flatMap((shape) => {
		if (shape.area !== area) return []
		const unit = province.municipalities.find((one) => sameUnit(shape.psgc, one.psgc, shape.name, one.name))
		return unit ? [{ slug: unit.slug, name: unit.name, d: shape.d }] : []
	})
	if (!shapes.length) return null

	let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity]
	for (const { d } of shapes) {
		const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number)
		for (let i = 0; i + 1 < nums.length; i += 2) {
			x0 = Math.min(x0, nums[i]); x1 = Math.max(x1, nums[i])
			y0 = Math.min(y0, nums[i + 1]); y1 = Math.max(y1, nums[i + 1])
		}
	}
	const pad = Math.max(x1 - x0, y1 - y0) * 0.04
	const box = [x0 - pad, y0 - pad, x1 - x0 + pad * 2, y1 - y0 + pad * 2].map((n) => +n.toFixed(1))
	return { viewBox: box.join(' '), shapes }
}
