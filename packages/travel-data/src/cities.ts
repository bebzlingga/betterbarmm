import cotabato from '../../../datasets/travel/cities/cotabato-city.json'

/* ============================================================
   City guides

   The travel-app layer: for a city, everything a visitor can use on
   the ground — where to sleep, where and what to eat, what to see,
   when things happen, and the practical stops (banks, hospitals,
   terminals) — each place on the map where OpenStreetMap has it.

   Built by datasets/travel/scripts/build_city.py from sourced
   research and OpenStreetMap. Every listing keeps the pages that name
   it. Still no rates, phone numbers or star ratings: those change
   faster than a guide can keep up with, and the links lead to them.
   ============================================================ */

export type CitySource = { label: string; url: string }

export type CityPlace = {
	id: string
	name: string
	kind: string
	/** Street or landmark, as a source gives it. */
	area: string | null
	note: string
	lat: number | null
	lon: number | null
	website: string | null
	sources: CitySource[]
	status: 'open' | 'unclear' | 'closed'
	/** Eat only. */
	halal?: boolean | null
	/** Stay only: listed on the big booking sites. */
	onBookingSites?: boolean
	/** A photograph key, where the guide holds a licensed one. */
	photo?: string | null
}

export type CityDish = { name: string; note: string; whereToTry: string[]; sources: CitySource[]; photo?: string | null }
export type CityEvent = { name: string; when: string; note: string; sources: CitySource[] }
export type CityTip = { topic: string; text: string; sources: CitySource[] }
export type CityEssential = { id: string; name: string; kind: string; lat: number; lon: number }

export type CityGuide = {
	slug: string
	name: string
	generatedAt: string
	note: string
	stay: CityPlace[]
	eat: CityPlace[]
	see: CityPlace[]
	dishes: CityDish[]
	events: CityEvent[]
	practical: CityTip[]
	essentials: CityEssential[]
	chains: string[]
}

const guides: Record<string, CityGuide> = { 'cotabato-city': cotabato as CityGuide }

/** The full city guide for an area or town slug, where one has been built. */
export function cityGuide(slug: string): CityGuide | null {
	return guides[slug] ?? null
}
