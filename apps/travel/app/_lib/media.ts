import type { StaticImageData } from 'next/image'

import agung from '../_images/travel/agung.jpg'
import armmRegionalCenter from '../_images/travel/armm-regional-center.jpg'
import budBongao from '../_images/travel/bud-bongao.jpg'
import cotabatoPlaza from '../_images/travel/cotabato-plaza.jpg'
import governmentCenter from '../_images/travel/government-center.jpg'
import kulintang from '../_images/travel/kulintang.jpg'
import lakeLanao from '../_images/travel/lake-lanao.jpg'
import makhdumMosque from '../_images/travel/makhdum-mosque.jpg'
import malong from '../_images/travel/malong.jpg'
import marawiGrandMosque from '../_images/travel/marawi-grand-mosque.jpg'
import marawiIslamicCenter from '../_images/travel/marawi-islamic-center.jpg'
import panampangan from '../_images/travel/panampangan.jpg'
import panolong from '../_images/travel/panolong.jpg'
import parliamentBuilding from '../_images/travel/parliament-building.jpg'
import pastil from '../_images/travel/pastil.jpg'
import paterPalapa from '../_images/travel/pater-palapa.jpg'
import pisSiyabit from '../_images/travel/pis-siyabit.jpg'
import singkil from '../_images/travel/singkil.jpg'
import tausugAttire from '../_images/travel/tausug-attire.jpg'
import tepoMat from '../_images/travel/tepo-mat.jpg'
import tiyulaItum from '../_images/travel/tiyula-itum.jpg'
import torogan from '../_images/travel/torogan.jpg'
import yakanWeaving from '../_images/travel/yakan-weaving.jpg'

/* ============================================================
   The photographs

   A guide that describes a sandbar and shows nothing is asking the
   reader to take its word for the one thing a picture settles. So
   these are here to do work, and they are held to the same standard
   as a figure anywhere else on this estate: each names what it
   shows, who made it, under what license, and where the original
   lives.

   Everything is public domain, CC0, or a CC license permitting reuse
   with attribution — Wikimedia Commons, plus official releases from
   the Bangsamoro Government's own information offices. `credit`,
   `license` and `source` are what satisfy the attribution terms, so
   none of them is optional and none is dropped from the rendered
   page.

   They are the same files the landing site's Discover primer uses.
   That is deliberate: two workspaces showing the same region should
   show it the same way, and a second sourcing pass would have meant
   two sets of credits to keep straight.

   What is NOT here matters as much. There is no photograph of
   Maguindanao del Sur, of the Special Geographic Area, or of most of
   the individual places this guide describes — no freely licensed
   image of them was available to draw on. Those pages say so rather
   than borrowing a picture of somewhere else, because a photograph
   captioned loosely is a claim about a place, and this workspace has
   enough of those to keep track of already.
   ============================================================ */

export type TravelPhoto = {
	src: StaticImageData
	/** What a screen reader hears. Describes the frame, not the caption. */
	alt: string
	/** The line printed under the image. Says something the alt text does not. */
	caption: string
	/** Where in BARMM, printed as a small locator over the frame. */
	place?: string
	credit: string
	license: string
	/** The file page — the license's "link to the source" requirement. */
	source: string
}

export const travelPhotos = {
	budBongao: {
		src: budBongao,
		alt: 'Bud Bongao rising behind a harbour at dusk, boats moored under a pink and violet sky.',
		caption:
			'Bud Bongao at dusk, seen from the port. The climb takes about an hour and a half, and the graves near the summit are why most people make it.',
		place: 'Bongao, Tawi-Tawi',
		credit: 'Crow1997',
		license: 'CC BY-SA 4.0',
		source: 'https://commons.wikimedia.org/wiki/File:Bud_Bongao_from_Bongao_Port.jpg',
	},
	panampangan: {
		src: panampangan,
		alt: 'A low green island ringed by a pale sandbar in turquoise water under a wide sky.',
		caption:
			'Panampangan Island off Sapa-Sapa. The sandbar runs for kilometers at low tide and is not there at high — check the table before chartering a boat.',
		place: 'Sapa-Sapa, Tawi-Tawi',
		credit: 'Ervin Malicdem',
		license: 'CC BY-SA 4.0',
		source: 'https://commons.wikimedia.org/wiki/File:Panampangan_Island.jpg',
	},
	makhdumMosque: {
		src: makhdumMosque,
		alt: 'The green and gold façade of the Sheik Karimul Makhdum Mosque, its domes topped with crescents.',
		caption:
			'Sheik Karim al-Makhdum Mosque at Simunul. The building is modern; four pillars of the 1380 original stand inside it.',
		place: 'Simunul, Tawi-Tawi',
		credit: 'Laila Aripin / Bangsamoro Information Office',
		license: 'Public domain',
		source:
			'https://commons.wikimedia.org/wiki/File:Sheikh_Karimul_Makhdum_Mosque_BIO_file_photo.jpg',
	},
	lakeLanao: {
		src: lakeLanao,
		alt: 'Lake Lanao stretching to distant hills under a bright, clouded sky.',
		caption:
			'Lake Lanao from Marawi. The road runs the whole way round the shore, and the towns on it are the reason to drive it.',
		place: 'Lanao del Sur',
		credit: 'PeterParker22',
		license: 'CC BY-SA 4.0',
		source: 'https://commons.wikimedia.org/wiki/File:Lake_Lanao_Marawi_City.jpg',
	},
	marawiGrandMosque: {
		src: marawiGrandMosque,
		alt: 'A white mosque with gold domes and twin minarets beneath a heavy grey sky.',
		caption: 'The Grand Mosque of Marawi, on the shore of Lake Lanao.',
		place: 'Marawi, Lanao del Sur',
		credit: 'Patrickroque01',
		license: 'CC BY-SA 4.0',
		source:
			'https://commons.wikimedia.org/wiki/File:Marawi_Grand_Mosque_(Disalongan_Street,_Marawi,_Lanao_Del_Sur;_10-14-2023).jpg',
	},
	marawiStreet: {
		src: marawiIslamicCenter,
		alt: 'A broad cream mosque with a central dome and flanking minarets on a Marawi street corner.',
		caption:
			'A mosque on a Marawi street corner. The city is more than the siege, and this is most of what it looks like.',
		place: 'Marawi, Lanao del Sur',
		credit: 'Bjeweld',
		license: 'CC BY-SA 4.0',
		source: 'https://commons.wikimedia.org/wiki/File:Sights_of_Marawi_City,_Lanao_del_Sur_(39).jpg',
	},
	cotabatoPlaza: {
		src: cotabatoPlaza,
		alt: 'A wet Cotabato City boulevard at night, street lights strung down the avenue.',
		caption: 'Sinsuat Avenue, Cotabato City, after rain.',
		place: 'Cotabato City',
		credit: 'Patrickroque01',
		license: 'CC BY-SA 4.0',
		source:
			'https://commons.wikimedia.org/wiki/File:Cotabato_City_Plaza_stage,_Sinsuat_Avenue_top_view_night_(Cotabato_City;_08-16-2023).jpg',
	},
	governmentCenter: {
		src: governmentCenter,
		alt: 'The arcade of the Bangsamoro Government Center at night, lit in bands of colored light.',
		caption:
			'The Bangsamoro Government Center lit for Eid al-Fitr. The seat of the regional government, and the reason Cotabato City has hotel rooms.',
		place: 'Cotabato City',
		credit: 'BARMM Bureau of Public Information',
		license: 'Public domain',
		source:
			'https://commons.wikimedia.org/wiki/File:Eid%E2%80%99l_Fitr_Bangsamoro_Government_Center.jpg',
	},
	parliamentBuilding: {
		src: parliamentBuilding,
		alt: 'The long arcaded façade of the Bangsamoro Parliament building under an overcast sky.',
		caption: 'The Bangsamoro Parliament building at the Government Center.',
		place: 'Cotabato City',
		credit: 'Marwan Khan',
		license: 'CC BY-SA 3.0',
		source: 'https://commons.wikimedia.org/wiki/File:BM_PARLIAMENT_BGC.jpg',
	},
	armmRegionalCenter: {
		src: armmRegionalCenter,
		alt: 'The facade of the ARMM Regional Center in Cotabato City, its concrete screen cut in Islamic geometric pattern.',
		caption:
			'The old ARMM Regional Center in Cotabato City — the seat of the region BARMM replaced, and worth a look for the concrete screen alone.',
		place: 'Cotabato City',
		credit: 'Shubert Ciencia',
		license: 'CC BY 2.0',
		source: 'https://commons.wikimedia.org/wiki/File:ARMM_Regional_Center_architectural_details.jpg',
	},
	yakanWeaving: {
		src: yakanWeaving,
		alt: 'A handwoven Yakan seputangan head cloth in fine geometric bands of pink, green and cream.',
		caption:
			'A seputangan head cloth by Ambalang Ausalin of Lamitan, a Yakan master weaver and National Living Treasure. This is what to look for in the Lamitan market.',
		place: 'Lamitan, Basilan',
		credit: 'Valenzuela400',
		license: 'CC BY-SA 4.0',
		source:
			'https://commons.wikimedia.org/wiki/File:Tennum_Ambalang_Ausalin_Lamitan_Basilan_Islamic_weavingA.jpg',
	},
	kulintang: {
		src: kulintang,
		alt: 'Three women in green and yellow seated behind a carved kulintang, one holding a hanging gong.',
		caption: 'A kulintang ensemble at Sitangkai — the gong-row music that runs through every Bangsamoro ceremony.',
		place: 'Sitangkai, Tawi-Tawi',
		credit: 'Municipal Tourism Office of Sitangkai, Tawi-Tawi',
		license: 'CC BY-SA 4.0',
		source: 'https://commons.wikimedia.org/wiki/File:Kulintang_sitangkai.jpg',
	},
	tepoMat: {
		src: tepoMat,
		alt: 'A woven pandan mat in bold diagonal bands of magenta, teal and yellow.',
		caption:
			'A tepo — the pandan mat woven by Sama women, handed down the mother’s line. Sold across Tawi-Tawi and worth carrying home.',
		place: 'Sibutu, Tawi-Tawi',
		credit: 'Valenzuela400',
		license: 'CC BY-SA 4.0',
		source:
			'https://commons.wikimedia.org/wiki/File:Sibutu_Tawi_Tawi_Sama_Bajau_pandan_Banig_mat_textile_colorfulF.jpg',
	},
	torogan: {
		src: torogan,
		alt: 'A torogan — a steep-roofed Maranao royal house raised on heavy posts above water.',
		caption:
			'A torogan, the Maranao royal house, raised on carved posts with flaring panolong beams. Very few survive; the Kawayan Torogan at Marantao is the intact one.',
		place: 'Lanao del Sur',
		credit: 'Maksym Kozlenko',
		license: 'CC BY-SA 4.0',
		source: 'https://commons.wikimedia.org/wiki/File:Model_of_Torogan_Marano.jpg',
	},
	panolong: {
		src: panolong,
		alt: 'A large wooden panolong beam carved and painted with swirling okir scrollwork in red, blue, green and yellow.',
		caption:
			'Okir on a panolong, the wing-beam of a torogan. The same ornament runs through the brass sold at Tugaya.',
		place: 'Lanao del Sur',
		credit: 'Nikka Cunom',
		license: 'CC BY 2.0',
		source: 'https://commons.wikimedia.org/wiki/File:Panolong.jpg',
	},
	agung: {
		src: agung,
		alt: 'Two hands striking a pair of large bossed bronze gongs with padded beaters.',
		caption:
			'The agung, the deep bossed gong that anchors a kulintang set. Cast and finished at Tugaya, on Lake Lanao’s western shore.',
		place: 'Lanao del Sur',
		credit: 'Philip Dominguez Mercurio',
		license: 'CC BY-SA 2.5',
		source: 'https://commons.wikimedia.org/wiki/File:Agung_(Philippine_hanging_gong).jpg',
	},
	pastil: {
		src: pastil,
		alt: 'Banana-leaf parcels of pastil, one opened to show shredded meat over steamed rice.',
		caption:
			'Pastil — rice and shredded meat in banana leaf. Sold from dawn at roadside stalls across Cotabato City and Maguindanao, and gone by mid-morning at the good ones.',
		credit: 'Obsidian Soul',
		license: 'CC0',
		source: 'https://commons.wikimedia.org/wiki/File:Pastil_(Philippines)_01.jpg',
	},
	paterPalapa: {
		src: paterPalapa,
		alt: 'Turmeric-yellow kuning rice and grilled chicken pater served on a banana leaf.',
		caption:
			'Grilled chicken with palapa and kuning, turmeric rice. Palapa is the condiment the whole Maranao kitchen is built on.',
		credit: 'Obsidian Soul',
		license: 'CC0',
		source:
			'https://commons.wikimedia.org/wiki/File:Maranao_chicken_pater_with_palapa_and_kuning_(turmeric_rice)_from_Bukidnon,_Philippines_01.jpg',
	},
	tiyulaItum: {
		src: tiyulaItum,
		alt: 'A bowl of near-black beef soup beside a red onion and dried chillies.',
		caption:
			'Tiyula itum — the Tausug black soup. The color is coconut meat toasted until it is genuinely black, and it tastes far better than it photographs.',
		credit: 'Nurfadzrie Abubakar',
		license: 'CC BY 3.0',
		source:
			'https://commons.wikimedia.org/wiki/File:Tiyula_Itum_by_Patrick_Aye_Beef_Black_Soup_8-37_screenshot.jpg',
	},
	tausugAttire: {
		src: tausugAttire,
		alt: 'A group in bright red, yellow, blue and pink Tausug dress standing on white sand before outrigger boats.',
		caption: 'Tausug dress. Every group in the region carries its own color, cut and weave.',
		credit: 'Heigen18',
		license: 'CC BY-SA 4.0',
		source: 'https://commons.wikimedia.org/wiki/File:TausugTribeOutfit.jpg',
	},
	singkil: {
		src: singkil,
		alt: 'Dancers in pink and violet stepping between clapping bamboo poles beneath a tiered parasol.',
		caption:
			'Singkil, the Maranao court dance of stepping through clashing bamboo, taken from the Darangen epic. Performed at festivals across Lanao del Sur.',
		credit: 'Conrad027',
		license: 'CC BY-SA 4.0',
		source: 'https://commons.wikimedia.org/wiki/File:SINGKIL_FOLKLORE.jpg',
	},
	pisSiyabit: {
		src: pisSiyabit,
		alt: 'A square Tausug pis siyabit head cloth densely woven with interlocking geometric medallions.',
		caption:
			'Pis siyabit — the Tausug head cloth, built up thread by thread. The lattice behind every page on this site is drawn from it.',
		credit: 'Hiart',
		license: 'CC0',
		source:
			'https://commons.wikimedia.org/wiki/File:Pis_siyabit_(headscarf),_Tausug_people,_Philippines,_Honolulu_Museum_of_Art_14451.1.JPG',
	},
	malong: {
		src: malong,
		alt: 'A malong tube skirt in wide magenta and gold bands crossed by a woven decorative panel.',
		caption:
			'A malong, the tube garment worn across Mindanao. Its bands and panel name where it was woven — useful to know before you buy one.',
		credit: 'Hiart',
		license: 'CC0',
		source:
			'https://commons.wikimedia.org/wiki/File:Malong_(tube_skirt)_from_Mindanao,_Honolulu_Museum_of_Art_14180.1.JPG',
	},
} satisfies Record<string, TravelPhoto>

export type TravelPhotoKey = keyof typeof travelPhotos

export const photo = (key: TravelPhotoKey): TravelPhoto => travelPhotos[key]

/**
 * The photographs for an area, in the order they should appear.
 *
 * Keyed by area slug. Two areas are deliberately absent — Maguindanao del Sur
 * and the Special Geographic Area — because no freely licensed photograph of
 * either was available, and their pages say so rather than showing somewhere
 * else. `photosForArea` returning an empty array is the signal for that.
 */
const AREA_PHOTOS: Record<string, TravelPhotoKey[]> = {
	'cotabato-city': ['governmentCenter', 'cotabatoPlaza', 'parliamentBuilding', 'armmRegionalCenter'],
	'tawi-tawi': ['budBongao', 'panampangan', 'makhdumMosque', 'kulintang', 'tepoMat'],
	'lanao-del-sur': ['lakeLanao', 'marawiGrandMosque', 'marawiStreet', 'torogan', 'panolong', 'agung'],
	'maguindanao-del-norte': ['pastil'],
	basilan: ['yakanWeaving'],
}

export const photosForArea = (slug: string): TravelPhoto[] =>
	(AREA_PHOTOS[slug] ?? []).map((key) => travelPhotos[key])

/** The photograph a place page leads with, where one exists for that place. */
const PLACE_PHOTOS: Record<string, TravelPhotoKey> = {
	'bud-bongao': 'budBongao',
	'panampangan-island': 'panampangan',
	'sheik-makhdum-mosque': 'makhdumMosque',
	'lake-lanao': 'lakeLanao',
	'kawayan-torogan': 'torogan',
	tugaya: 'agung',
	lamitan: 'yakanWeaving',
	sitangkai: 'kulintang',
}

export const photoForPlace = (slug: string): TravelPhoto | undefined => {
	const key = PLACE_PHOTOS[slug]
	return key ? travelPhotos[key] : undefined
}

/** The photograph for a dish, where the estate holds one. */
const DISH_PHOTOS: Record<string, TravelPhotoKey> = {
	pastil: 'pastil',
	palapa: 'paterPalapa',
	'tiyula-itum': 'tiyulaItum',
}

export const photoForDish = (slug: string): TravelPhoto | undefined => {
	const key = DISH_PHOTOS[slug]
	return key ? travelPhotos[key] : undefined
}
