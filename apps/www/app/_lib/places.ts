import data from '../../../../datasets/places/places.json'
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
