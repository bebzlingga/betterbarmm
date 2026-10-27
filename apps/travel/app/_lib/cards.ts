import { AREA_NAME, EXPLORE_KIND_ONE, type ExploreImage, type ExploreKind, type ExplorePlace } from '@betterbarmm/travel-data/explore'
import { commonsThumb, cropStyle } from './commons'

/* ============================================================
   A place as the explorer's card needs it

   Worked out on the server, so the browser is sent a few short rows
   rather than the whole guide: the name and where, the kind, when to
   go, the map point, and up to five photographs already sized for a
   card, each with its credit — a free licence asks for the author and
   the licence beside the picture, and every card shows them.
   ============================================================ */

export type CardPhoto = {
	src: string
	srcSet: string
	style: React.CSSProperties | null
	author: string
	license: string
	page: string
}

export type CardPlace = {
	slug: string
	name: string
	kind: ExploreKind
	/** Other categories it is listed under, as a weaving town is under Crafts too. */
	also: ExploreKind[]
	kindLabel: string
	area: string
	areaName: string
	municipality: string
	summary: string
	bestTime: string | null
	colors: string[]
	photos: CardPhoto[]
	point: ExplorePlace['point']
}

/** The card's frame, width over height: the estate's catalogue photographs are 4:3. */
export const CARD_ASPECT = 4 / 3

/** "Any time; avoid Friday midday prayer" — the first clause is what fits on a card. */
const shortTime = (s?: string | null) => (s ? s.split(/[;.—]/)[0]!.trim() : null)

/** A card-sized photograph, with its credit. */
export const cardPhoto = (img: ExploreImage): CardPhoto => ({
	src: commonsThumb(img.url, 500, img.width),
	srcSet: `${commonsThumb(img.url, 500, img.width)} 500w, ${commonsThumb(img.url, 960, img.width)} 960w`,
	style: cropStyle(img, CARD_ASPECT),
	author: img.author,
	license: img.license,
	page: img.page,
})

/** Up to five of the place's own photographs. None of its own, none at all: a placeholder, never another place's (user decision). */
const photosOf = (p: ExplorePlace): CardPhoto[] => p.images.slice(0, 5).map(cardPhoto)

export function toCard(p: ExplorePlace): CardPlace {
	return {
		slug: p.slug,
		name: p.name,
		kind: p.kind,
		also: p.also ?? [],
		kindLabel: EXPLORE_KIND_ONE[p.kind],
		area: p.area,
		areaName: AREA_NAME[p.area] ?? p.area,
		municipality: p.municipality,
		summary: p.summary,
		bestTime: shortTime(p.best_time),
		colors: p.colors,
		photos: photosOf(p),
		point: p.point,
	}
}
