import data from '../../../../datasets/crafts/crafts.json'

export { commonsThumb } from './commons'
import type { Crop } from './commons'
import type { Tone } from './craft-tone'

/* The crafts of the region: textiles, mats, brass, gongs, carving and blades,
   each with where it is made, who makes it and where a visitor can see it.
   Photos are Wikimedia Commons files under free licences, credited as they ask. */

export type Pattern = { style: 'plaid' | 'diamond' | 'band'; colors: string[] }
export type CraftModel =
	| { kind: 'hanging' | 'tube' | 'mat'; pattern: Pattern }
	| { kind: 'vessel'; shape: 'gador' | 'kendi' | 'lamp' }
	| { kind: 'gongs'; count: number }
	| { kind: 'kris' }

/** focus: a CSS object-position, where a crop should centre (two crafts can share one photo). */
export type CraftImage = { crop?: Crop; tone?: Tone; focus?: string; url: string; page: string; author: string; license: string; license_url: string | null; width: number; height: number; caption: string }
export type Sourced = { name: string; note: string; source: string; place?: string; month?: string }
/** A maker; honour names a national recognition, such as a GAMABA award or a School of Living Traditions. */
export type Maker = Sourced & { honour?: string | null; town?: string | null }
/** A recognition of the craft itself: a registry entry, a national treasure, or a warning that it is at risk. */
export type Heritage = { status: string; body: string; note: string; source: string }
/** Somewhere a visitor can buy it: a fair, a centre, a shop or a cooperative. */
export type BuyAt = { name: string; place: string; kind: 'fair' | 'centre' | 'shop' | 'otop' | 'cooperative' | 'online'; note: string; url?: string | null; source: string; as_of: string }
export type Price = { text: string; source: string; as_of: string }
/** Public money spent on it, as a bid notice records. */
export type Spend = { title: string; by: string; date: string; amount: number | null; source: string }

export type Craft = {
	slug: string
	name: string
	local_name: string
	group: keyof typeof GROUP
	people: string
	province: string
	towns: string[]
	summary: string
	materials: string
	how_made: string
	uses: string
	motifs?: { name: string; meaning: string }[]
	colors: string[]
	makers: Maker[]
	where_to_see: Sourced[]
	/** Dated prices, newest first. */
	prices?: Price[]
	buy?: BuyAt[]
	heritage?: Heritage[]
	spend?: Spend[]
	sources: string[]
	images: CraftImage[]
	model: CraftModel | null
}

export const GROUP = {
	textile: 'Textiles',
	attire: 'Dress',
	mat: 'Mats',
	basketry: 'Basketry',
	brass: 'Brass',
	pottery: 'Pottery',
	instrument: 'Instruments',
	carving: 'Carving',
	ornament: 'Ornaments',
	blade: 'Blades',
	boat: 'Boats',
} as const

export const PROVINCE: Record<string, string> = {
	basilan: 'Basilan',
	// Pusaka writes of Maguindanao before its 2022 division, so its items name the old province.
	maguindanao: 'Maguindanao',
	'lanao-del-sur': 'Lanao del Sur',
	'maguindanao-del-norte': 'Maguindanao del Norte',
	'maguindanao-del-sur': 'Maguindanao del Sur',
	'tawi-tawi': 'Tawi-Tawi',
	'cotabato-city': 'Cotabato City',
	'special-geographic-area': 'Special Geographic Area',
}

export const crafts = data.items as Craft[]

/** A Commons photo in the shape the site's credit mark takes. */
export const creditOf = (i: CraftImage) => ({ credit: i.author, license: i.license, source: i.page })

export const festivals = data.festivals as Sourced[]
/** Fairs and shops that sell the region's crafts without naming which. */
export const markets = data.markets as BuyAt[]
export const craftsMeta = { generatedAt: data.generatedAt }
export const craft = (slug: string) => crafts.find((c) => c.slug === slug)

/** Crafts with a photo before those still waiting for one; otherwise in their own order. */
export const byPhoto = (list: Craft[]) => [...list].sort((a, b) => Number(!a.images.length) - Number(!b.images.length))

/** The others of its kind first, then the rest, photographed ones first in each, for "More like it". */
export const related = (c: Craft, n = 3) =>
	[...byPhoto(crafts.filter((x) => x.group === c.group && x !== c)), ...byPhoto(crafts.filter((x) => x.group !== c.group))].slice(0, n)
