import data from '../../../../datasets/places/places.json'
import staysFile from '../../../../datasets/places/stays.json'
import foodPhotosFile from '../../../../datasets/places/food-photos.json'
import { dishes, lodgingForArea, type Dish } from '@betterbarmm/travel-data'
import type { CraftImage } from './crafts'

/* Places worth the journey in BARMM: beaches, islands, mosques, lakes, falls,
   mountains and heritage sites, each with where it is, what is there, what to
   know before going, and its sources. Photos are free-licence Wikimedia files,
   credited as they ask. */

export type Place = {
	slug: string
	name: string
	also_known_as?: string[]
	kind: keyof typeof KIND
	area: string
	municipality: string
	summary: string
	detail: string[]
	before_you_go: string[]
	getting_there?: string | null
	best_time?: string | null
	colors: string[]
	sources: string[]
	images: CraftImage[]
	from_guide?: boolean
	/** What to do there, and anything to eat particular to it, each from a source ('guide' for the guide's own text). */
	do?: { title: string; detail: string; source: string }[]
	eat?: { title: string; detail: string; source: string }[]
}

export const KIND = {
	beach: 'Beaches',
	island: 'Islands',
	mosque: 'Mosques',
	lake: 'Lakes',
	falls: 'Falls',
	mountain: 'Mountains',
	nature: 'Nature',
	heritage: 'Heritage',
	museum: 'Museums',
	city: 'Cities',
	market: 'Markets',
	memory: 'Memory',
} as const

/** One of each kind, for its card and the dialog's eyebrow. */
export const KIND_ONE: Record<Place['kind'], string> = {
	beach: 'Beach',
	island: 'Island',
	mosque: 'Mosque',
	lake: 'Lake',
	falls: 'Falls',
	mountain: 'Mountain',
	nature: 'Nature',
	heritage: 'Heritage',
	museum: 'Museum',
	city: 'City',
	market: 'Market',
	memory: 'Memory',
}

export const AREA: Record<string, string> = {
	basilan: 'Basilan',
	'lanao-del-sur': 'Lanao del Sur',
	'maguindanao-del-norte': 'Maguindanao del Norte',
	'maguindanao-del-sur': 'Maguindanao del Sur',
	'tawi-tawi': 'Tawi-Tawi',
	'cotabato-city': 'Cotabato City',
	'special-geographic-area': 'Special Geographic Area',
}

export const places = data.items as Place[]
export const place = (slug: string) => places.find((p) => p.slug === slug)

/** Photographed places before the rest; otherwise in their own order. */
export const byPhoto = (list: Place[]) => [...list].sort((a, b) => Number(!a.images.length) - Number(!b.images.length))

/** Others in the same area first, then the same kind, for "Nearby". */
export const nearby = (p: Place, n = 4) =>
	[...byPhoto(places.filter((x) => x.area === p.area && x !== p)), ...byPhoto(places.filter((x) => x.area !== p.area && x.kind === p.kind))].slice(0, n)

/** Whose cooking a visitor meets in each area: the guide's dishes are filed by tradition, not by place. */
const KITCHENS: Record<string, Dish['tradition'][]> = {
	'lanao-del-sur': ['Maranao'],
	'maguindanao-del-norte': ['Maguindanaon', 'Iranun'],
	'maguindanao-del-sur': ['Maguindanaon'],
	'cotabato-city': ['Maguindanaon'],
	'special-geographic-area': ['Maguindanaon'],
	'tawi-tawi': ['Sama', 'Tausug'],
	basilan: ['Yakan', 'Tausug'],
}

/** The area's dishes from the travel guide, the ones nobody should miss first. */
export const areaDishes = (area: string, n = 4) =>
	dishes
		.filter((d) => (KITCHENS[area] ?? []).includes(d.tradition))
		.sort((a, b) => Number(!a.essential) - Number(!b.essential))
		.slice(0, n)

/** A place to stay, from an official or dated source; the image only where it is free or a government work. */
export type Stay = {
	name: string
	kind: 'hotel' | 'resort' | 'inn' | 'pension' | 'homestay' | 'guesthouse'
	area: string
	municipality: string
	address: string | null
	note: string
	accredited: boolean
	source: string
	as_of: string
	image: CraftImage | null
}
const stays = staysFile.stays as Stay[]
const sameTown = (a: string, b: string) => a.toLowerCase().replace(/ city$/, '') === b.toLowerCase().replace(/ city$/, '')

/** Up to six places to stay for a visitor to a place: in its town first, then elsewhere in its area. */
export const staysNear = (p: Place, n = 6) =>
	[...stays.filter((s) => s.area === p.area && sameTown(s.municipality, p.municipality)), ...stays.filter((s) => s.area === p.area && !sameTown(s.municipality, p.municipality))].slice(0, n)

/** The guide's own word on how lodging works in an area: where people sleep and how a room is booked. */
export const areaLodging = (area: string) => lodgingForArea(area) ?? null

/** A photograph of a dish, or of a place's own food item ('place-slug|title'): a Commons thumbnail or a file this site serves. */
export type FoodPhoto = { url: string; page: string; author: string; license: string; caption: string }
const foodPhotos = foodPhotosFile as { dishes: Record<string, FoodPhoto>; eat: Record<string, FoodPhoto> }
export const dishPhotoOf = (slug: string) => foodPhotos.dishes[slug] ?? null
export const eatPhotoOf = (place: string, title: string) => foodPhotos.eat[`${place}|${title}`] ?? null
