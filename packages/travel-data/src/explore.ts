import placesFile from '../../../datasets/places/places.json'
import staysFile from '../../../datasets/places/stays.json'
import centresFile from '../../../datasets/accidents/municipality-centres.json'
import craftsFile from '../../../datasets/crafts/crafts.json'
import { placePoints } from './geo'
import { travelAreas } from './areas'
import { towns, type Town } from './towns'

/* ============================================================
   Travel & Places: the places to browse

   The guide's own places and the ones traced to sources since, 104
   in all, most with free-licence photographs from Wikimedia Commons
   (`datasets/places/places.json`). This is what the explorer lists
   and what each place page is built from.

   Every place is given a point for the map. Where the guide has
   placed it (`placePoints`), that point; otherwise its town's centre
   from the incident map's centres, marked `exact: false` so the page
   can say the pin is the town and not the spot. A place whose text
   names no single town is left off the map rather than guessed.

   No prices, ratings, reviews or availability: none of them exist
   for these places, and the guide does not invent them.
   ============================================================ */

export type ExploreImage = {
	url: string
	page: string
	author: string
	license: string
	license_url: string | null
	width: number
	height: number
	caption: string
	crop?: [number, number, number, number]
	focus?: string
}

export type ExploreNote = { title: string; detail: string; source: string }

export type ExploreKind = 'island' | 'beach' | 'mosque' | 'lake' | 'falls' | 'mountain' | 'nature' | 'heritage' | 'museum' | 'market' | 'craft' | 'memory' | 'city'

export type ExplorePlace = {
	slug: string
	name: string
	also_known_as?: string[]
	kind: ExploreKind
	area: string
	municipality: string
	summary: string
	detail: string[]
	before_you_go: string[]
	getting_there?: string | null
	best_time?: string | null
	colors: string[]
	sources: string[]
	images: ExploreImage[]
	from_guide?: boolean
	do?: ExploreNote[]
	eat?: ExploreNote[]
	/** Where the pin goes; null where the place names no single town. */
	point: { lat: number; lon: number; exact: boolean } | null
	/** Other categories it belongs in too: a weaving town is heritage and a craft place at once. */
	also?: ExploreKind[]
	/** The crafts made or sold here, by their slug in the crafts dataset. */
	makes?: string[]
}


/** The categories along the top of the explorer, in the order a visitor reaches for them. */
export const EXPLORE_KINDS: { key: ExploreKind; label: string; one: string }[] = [
	{ key: 'island', label: 'Islands', one: 'Island' },
	{ key: 'beach', label: 'Beaches', one: 'Beach' },
	{ key: 'mosque', label: 'Mosques', one: 'Mosque' },
	{ key: 'lake', label: 'Lakes', one: 'Lake' },
	{ key: 'falls', label: 'Falls', one: 'Falls' },
	{ key: 'mountain', label: 'Mountains', one: 'Mountain' },
	{ key: 'nature', label: 'Nature', one: 'Nature' },
	{ key: 'heritage', label: 'Heritage', one: 'Heritage' },
	{ key: 'museum', label: 'Museums', one: 'Museum' },
	{ key: 'market', label: 'Markets', one: 'Market' },
	{ key: 'craft', label: 'Crafts', one: 'Craft centre' },
	{ key: 'memory', label: 'Memory', one: 'Memory' },
	{ key: 'city', label: 'Cities', one: 'City' },
]

export const EXPLORE_KIND_ONE = Object.fromEntries(EXPLORE_KINDS.map((k) => [k.key, k.one])) as Record<ExploreKind, string>

export const AREA_NAME: Record<string, string> = Object.fromEntries(travelAreas.map((area) => [area.slug, area.name]))

/* ---- Points --------------------------------------------------------- */

type Centre = { province: string; municipality: string; slug: string; lat: number; lon: number }

const norm = (s: string) =>
	s
		.toLowerCase()
		.replace(/^city of /, '')
		.replace(/ city$/, '')
		.replace(/[^a-z0-9]/g, '')

/** How the places file writes a town where the centres file writes it differently. */
const ALIAS: Record<string, string> = { generalsalipadakpendatun: 'genskpendatun' }

const CENTRES = new Map<string, Centre>()
for (const c of (centresFile as { centres: Centre[] }).centres) CENTRES.set(norm(c.municipality), c)

function pointFor(slug: string, municipality: string): ExplorePlace['point'] {
	const own = placePoints.find((p) => p.slug === slug)
	if (own) return { lat: own.lat, lon: own.lon, exact: true }
	// "Ditsaan-Ramain and Tagoloan II": the first town named.
	const first = norm(municipality.split(/,| and | \(/)[0]!)
	const centre = CENTRES.get(ALIAS[first] ?? first)
	return centre ? { lat: centre.lat, lon: centre.lon, exact: false } : null
}

/* ---- The places ----------------------------------------------------- */

type RawPlace = Omit<ExplorePlace, 'point'>

/** Photos the landing site hosts itself ("/places/…__1.jpg", Department of Tourism files) are served from there:
    a bare path would resolve against this workspace's own domain, where they are not. */
const hosted = (img: ExploreImage): ExploreImage => (img.url.startsWith('/') ? { ...img, url: `https://betterbarmm.com${img.url}` } : img)

/* ---- Craft places (user decision: weaving centres and the like, as a category) ----
   Built from the crafts dataset's own entries — the centre, cooperative or workshop it names, its note and its source —
   so the words are traced exactly as there, nothing added. Places already in the guide that are craft places too (the
   Ambalang weaving centre, Tugaya, the Bajau village) are tagged into the category rather than listed twice. */

type CraftEntry = { name: string; place: string; note: string; source: string; kind?: string }
type CraftRecord = { slug: string; name: string; summary: string; colors?: string[]; images: ExploreImage[]; buy?: CraftEntry[]; where_to_see?: CraftEntry[] }
const CRAFT_RECORDS = new Map((craftsFile as unknown as { items: CraftRecord[] }).items.map((c) => [c.slug, c]))
const CRAFT_FESTIVALS = (craftsFile as unknown as { festivals: { name: string; place: string; month: string }[] }).festivals

const CRAFT_CENTRES: { slug: string; name: string; entry: { craft: string; list: 'buy' | 'where_to_see'; name: string }; makes: string[]; town: string; area: string }[] = [
	{ slug: 'buluan-inaul-weaving-centre', name: 'Provincial Women Center, Buluan', entry: { craft: 'inaul', list: 'buy', name: 'Provincial Women Center (inaul weaving section)' }, makes: ['inaul'], town: 'Buluan', area: 'maguindanao-del-sur' },
	{ slug: 'maranao-collectibles', name: 'Maranao Collectibles', entry: { craft: 'langkit', list: 'buy', name: 'Maranao Collectible Service Cooperative (Maranao Collectibles)' }, makes: ['langkit', 'malong-a-landap'], town: 'Marawi', area: 'lanao-del-sur' },
	{ slug: 'datu-dizal-cultural-center', name: 'Datu Dizal Cultural Center', entry: { craft: 'yakan-tennun', list: 'buy', name: 'Datu Dizal Cultural Center' }, makes: ['yakan-tennun'], town: 'Lamitan', area: 'basilan' },
	{ slug: 'mother-kalanganan-brassware', name: 'Brassmiths of Mother Kalanganan', entry: { craft: 'gador', list: 'where_to_see', name: 'Brassware of Mother Kalanganan' }, makes: ['cotabato-brassware'], town: 'Cotabato City', area: 'cotabato-city' },
]

/** Places in the guide that are craft places too, and what is made there. */
const ALSO_CRAFT: Record<string, string[]> = { 'ambalang-museum': ['yakan-tennun'], tugaya: ['gador', 'okir-baul'], 'bongao-bajau-village': ['tepo'] }

function craftCentre(c: (typeof CRAFT_CENTRES)[number]): RawPlace | null {
	const record = CRAFT_RECORDS.get(c.entry.craft)
	const entry = record?.[c.entry.list]?.find((e) => e.name === c.entry.name)
	if (!record || !entry) return null
	const made = c.makes.map((slug) => CRAFT_RECORDS.get(slug)).filter((r): r is CraftRecord => Boolean(r))
	const festival = CRAFT_FESTIVALS.find((f) => norm(f.place.split(',')[0]!) === norm(c.town))
	return {
		slug: c.slug,
		name: c.name,
		kind: 'craft',
		area: c.area,
		municipality: c.town,
		summary: entry.note.split(/(?<=\.)\s|;\s/)[0]!.replace(/[;.]$/, '') + '.',
		detail: [entry.note, ...made.map((m) => m.summary)],
		// Where the source itself says the centre may have changed since, the page says so before anyone travels.
		before_you_go: /unconfirmed/i.test(entry.note) ? ['Its source is old enough that the centre may have closed or moved: ask in town before making the trip.'] : [],
		getting_there: null,
		best_time: festival ? `${festival.month}, during the ${festival.name}` : null,
		colors: made[0]?.colors ?? [],
		sources: [entry.source],
		images: [],
		from_guide: false,
	}
}

/** Photographed places first, so the explorer opens on pictures; otherwise in the file's own order. */
export const explorePlaces: ExplorePlace[] = [
	...(placesFile as { items: RawPlace[] }).items,
	...CRAFT_CENTRES.map((c) => {
		const raw = craftCentre(c)
		return raw ? { ...raw, makes: c.makes } : null
	}).filter((p): p is RawPlace & { makes: string[] } => Boolean(p)),
]
	.map((p) => ({
		...p,
		images: p.images.map(hosted),
		point: pointFor(p.slug, p.municipality),
		...(ALSO_CRAFT[p.slug] ? { also: ['craft' as ExploreKind], makes: ALSO_CRAFT[p.slug] } : {}),
	}))
	.sort((a, b) => Number(!a.images.length) - Number(!b.images.length))

export const findExplorePlace = (slug: string): ExplorePlace | undefined => explorePlaces.find((p) => p.slug === slug)

const km = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
	const r = Math.PI / 180
	const x = (b.lon - a.lon) * r * Math.cos(((a.lat + b.lat) / 2) * r)
	const y = (b.lat - a.lat) * r
	return Math.hypot(x, y) * 6371
}

/** Other places to go from this one: the same area first, nearest first, then anywhere nearest. */
export function nearbyPlaces(place: ExplorePlace, count = 8): ExplorePlace[] {
	const others = explorePlaces.filter((p) => p.slug !== place.slug)
	const distance = (p: ExplorePlace) => (place.point && p.point ? km(place.point, p.point) : 9999)
	return others.sort((a, b) => Number(a.area !== place.area) - Number(b.area !== place.area) || distance(a) - distance(b)).slice(0, count)
}

/** The town guide for a place's municipality, where there is one: the first town its text names, in its area. */
export function townFor(place: ExplorePlace): Town | undefined {
	const first = norm(place.municipality.split(/,| and | \(/)[0]!)
	const want = ALIAS[first] ?? first
	return towns.find((town) => town.area === place.area && norm(town.name) === want)
}

/* ---- Stays ---------------------------------------------------------- */

export type ExploreStay = {
	name: string
	kind: string
	area: string
	municipality: string
	address: string | null
	note: string | null
	accredited: boolean
	source: string
	as_of: string
	/** A credited photograph of the place itself, where a free one exists; most have none. */
	image: (Omit<ExploreImage, 'width' | 'height' | 'license_url'> & { width?: number; height?: number; license_url?: string | null }) | null
}

export const exploreStays = (staysFile as unknown as { stays: ExploreStay[] }).stays.map((stay) =>
	stay.image?.url.startsWith('/') ? { ...stay, image: { ...stay.image, url: `https://betterbarmm.com${stay.image.url}` } } : stay,
)

export const staysInArea = (area: string): ExploreStay[] => exploreStays.filter((stay) => stay.area === area)

/* ---- Crafts --------------------------------------------------------- */

/* The crafts made in a place's town (user decision: connect the two), from the landing site's crafts dataset. Matched
   on the town alone: a craft's photograph shows the craft, never the place, so it is shown under its own name on the
   place page and links to its own page — it does not stand in for a photo of the place. */

export type ExploreCraft = { slug: string; name: string; local_name: string; group: string; summary: string; image: ExploreImage | null }

type RawCraft = Omit<ExploreCraft, 'image'> & { towns: string[]; images: ExploreImage[] }

const townKey = (s: string) => norm(s.split(/,| and | \(| —/)[0]!)

const CRAFTS = (craftsFile as unknown as { items: RawCraft[] }).items.map((c) => ({
	craft: { slug: c.slug, name: c.name, local_name: c.local_name, group: c.group, summary: c.summary, image: c.images[0] ? hosted(c.images[0]) : null },
	towns: new Set(c.towns.map(townKey)),
}))

/** The crafts made in this place's town, photographed ones first. */
export function craftsFor(place: ExplorePlace): ExploreCraft[] {
	const town = townKey(place.municipality)
	return CRAFTS.filter((c) => c.towns.has(town))
		.map((c) => c.craft)
		.sort((a, b) => Number(!a.image) - Number(!b.image))
}

