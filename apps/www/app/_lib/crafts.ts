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
	makers: Sourced[]
	where_to_see: Sourced[]
	price: { text: string; source: string; as_of: string } | null
	sources: string[]
	images: CraftImage[]
	model: CraftModel | null
}

export const GROUP = {
	textile: 'Textiles',
	mat: 'Mats',
	brass: 'Brass',
	instrument: 'Instruments',
	carving: 'Carving',
	ornament: 'Ornaments',
	blade: 'Blades',
} as const

export const PROVINCE: Record<string, string> = {
	basilan: 'Basilan',
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
export const craftsMeta = { generatedAt: data.generatedAt }
export const craft = (slug: string) => crafts.find((c) => c.slug === slug)

/** The others of its kind first, then the rest, for "More like it". */
export const related = (c: Craft, n = 3) => [...crafts.filter((x) => x.group === c.group && x !== c), ...crafts.filter((x) => x.group !== c.group)].slice(0, n)
