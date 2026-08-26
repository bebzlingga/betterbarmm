import { discoverPhotos, type DiscoverPhotoKey } from './discover-media'

/**
 * Which photographs belong to which chapter.
 *
 * Kept apart from `discover-barmm-data.ts` on purpose. That file is the text —
 * written, sourced, and edited as prose. This one is the picture edit, and the
 * two change for different reasons: a paragraph gets rewritten, a photograph
 * gets replaced when a better-licensed one turns up. Keying by slug means
 * neither file has to know the other's shape.
 */
export type DiscoverTopicMedia = {
	/** The full-bleed image behind the chapter title. */
	hero: DiscoverPhotoKey
	/** A one-line answer to "what am I looking at", printed under the chapter kicker. */
	standfirst: string
	/** Photographs pinned to particular timeline eras, by the era's own label. */
	eraPhotos?: Partial<Record<string, DiscoverPhotoKey>>
	/**
	 * A curated set of photographs for this chapter.
	 *
	 * Not currently rendered. The picture wall used to sit at the foot of every
	 * chapter and now runs once, on the front of Discover, from
	 * `discoverIndexGallery` below. The per-chapter selections are kept because
	 * they are a real editorial judgement about which pictures belong to which
	 * subject — cheap to hold, expensive to make again — and `galleryPhotos()`
	 * still turns them into photographs for whatever renders them next.
	 */
	gallery?: DiscoverPhotoKey[]
	/** A photograph run beside the prose, before the first module. */
	inline?: DiscoverPhotoKey
	/** Photographs for particular detail cards, by the card's title. */
	cardPhotos?: Record<string, DiscoverPhotoKey>
	/** Photographs for particular people groups, by category. */
	groupPhotos?: Record<string, DiscoverPhotoKey>
	/** Show the by-people food and culture guide. Only Culture & Places carries it. */
	tribeGuide?: boolean
	/** Show the local government ladder and directory. Only Local Government carries it. */
	lguGuide?: boolean
}

export const discoverTopicMedia: Record<string, DiscoverTopicMedia> = {
	history: {
		hero: 'makhdumMosque',
		standfirst:
			'Six centuries, one unbroken argument about who governs the Bangsamoro — told through the moments that changed the answer.',
		// No `inline`: the MOA-AD map is already on the timeline at 2008, and it was
		// carrying the opening screen as well.
		// Two, not six. A photograph on every era turned the timeline into a
		// slideshow with dates attached, and the pictures that were carrying an
		// argument got no more weight than the ones that were only decorating a
		// year. What is left is the pair that is evidence: the territory the
		// MOA-AD would have covered, and the room where the Organic Law was
		// ratified.
		eraPhotos: {
			'2008': 'moaAdMap',
			'2019': 'bolRatification',
		},
		gallery: ['makhdumMosque', 'tausugWarriors', 'moaAdMap', 'bolRatification', 'btaFirstSession'],
	},

	governance: {
		hero: 'governmentCenter',
		standfirst:
			'A parliament, a chief minister, and dozens of ministries and commissions — what each one is actually for.',
		// No `inline`: it sat beside the opening prose, and the opening is gone.
		cardPhotos: {
			'Autonomous regional government under the Bangsamoro Organic Law': 'parliamentBuilding',
			'Office of the Chief Minister': 'chiefMinisterOffice',
			'Bangsamoro Parliament': 'parliamentHall',
			'Deputy Chief Ministers, Senior Minister, and Cabinet Secretary': 'cabinet',
		},
		gallery: [
			'governmentCenter',
			'parliamentBuilding',
			'parliamentHall',
			'parliamentSession',
			'chiefMinisterOffice',
			'cotabatoPlaza',
		],
	},

	people: {
		hero: 'tausugAttire',
		standfirst:
			'Thirteen Moro groups, three Indigenous peoples, and the settler communities who also call the region home.',
		// No `inline`: it hung beside the lede, and the lede is gone.
		groupPhotos: {
			'Islamized ethnolinguistic groups': 'tausugAttire',
			'Indigenous peoples': 'torogan',
			'Settler communities': 'cotabatoPlaza',
		},
		gallery: ['tausugAttire', 'kulintang', 'singkil', 'yakanWeaving', 'pisSiyabit', 'malong'],
	},

	'culture-places': {
		hero: 'panampangan',
		tribeGuide: true,
		standfirst:
			'Mosques, sandbars, lake towns, carved beams and banana-leaf lunches — the region as it is actually lived in.',
		// No `inline`: it ran beside the opening prose, and the opening is gone.
		cardPhotos: {
			'Grand Mosque and Sheik Karimul Makhdum Mosque': 'makhdumMosque',
			"Grand Mosque, PC Hill, Tamontaka Church, People's Palace, Timaco Hill": 'cotabatoPlaza',
			'Bud Bongao, Panampangan Island, Sangay Siapuh, and coastal resorts': 'budBongao',
			'Tiyula Itum, pastil, palapa, piaparan, kumukunsi, and more': 'pastil',
			'Textiles, weaving, dress, craft, music, and community practice': 'panolong',
		},
		gallery: [
			'panampangan',
			'budBongao',
			'lakeLanao',
			'marawiGrandMosque',
			'makhdumMosque',
			'panolong',
			'pastil',
			'paterPalapa',
			'marawiIslamicCenter',
		],
	},

	'local-government': {
		hero: 'cotabatoPlaza',
		lguGuide: true,
		standfirst:
			'A governor, a mayor, a barangay captain — and, on a different ballot entirely, a Member of Parliament. Which is which, and where to look each one up.',
		// No `inline`: the chapter opens on the directory rather than on a picture.
		gallery: ['cotabatoPlaza', 'marawiIslamicCenter', 'lakeLanao', 'budBongao', 'governmentCenter'],
	},
}

/** Photographs for the Discover index, in the order the wall runs them. */
export const discoverIndexGallery: DiscoverPhotoKey[] = [
	'panampangan',
	'singkil',
	'marawiGrandMosque',
	'yakanWeaving',
	'budBongao',
	'pastil',
	'kulintang',
	'lakeLanao',
	'panolong',
	'governmentCenter',
	'makhdumMosque',
	'tausugAttire',
]

export function topicMedia(slug: string): DiscoverTopicMedia | undefined {
	return discoverTopicMedia[slug]
}

/** Turn a list of photo keys into the photographs themselves. */
export function galleryPhotos(keys: DiscoverPhotoKey[] | undefined) {
	return (keys ?? []).map((key) => discoverPhotos[key])
}
