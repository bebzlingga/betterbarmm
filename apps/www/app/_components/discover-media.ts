import type { StaticImageData } from 'next/image'

import agung from '../_images/discover/agung.jpg'
import bataTransitionPlan from '../_images/discover/bta-transition-plan.jpg'
import bolRatification from '../_images/discover/bol-ratification.jpg'
import btaFirstSession from '../_images/discover/bta-first-session.jpg'
import budBongao from '../_images/discover/bud-bongao.jpg'
import cabinet from '../_images/discover/cabinet.jpg'
import chiefMinisterOffice from '../_images/discover/chief-minister-office.jpg'
import cotabatoPlaza from '../_images/discover/cotabato-plaza.jpg'
import governmentCenter from '../_images/discover/government-center.jpg'
import kulintang from '../_images/discover/kulintang.jpg'
import lakeLanao from '../_images/discover/lake-lanao.jpg'
import makhdumMosque from '../_images/discover/makhdum-mosque.jpg'
import malong from '../_images/discover/malong.jpg'
import marawiGrandMosque from '../_images/discover/marawi-grand-mosque.jpg'
import marawiIslamicCenter from '../_images/discover/marawi-islamic-center.jpg'
import moaAdMap from '../_images/discover/moa-ad-map.jpg'
import panampangan from '../_images/discover/panampangan.jpg'
import panolong from '../_images/discover/panolong.jpg'
import parliamentBuilding from '../_images/discover/parliament-building.jpg'
import parliamentHall from '../_images/discover/parliament-hall.jpg'
import parliamentSession from '../_images/discover/parliament-session.jpg'
import pastil from '../_images/discover/pastil.jpg'
import paterPalapa from '../_images/discover/pater-palapa.jpg'
import pisSiyabit from '../_images/discover/pis-siyabit.jpg'
import singkil from '../_images/discover/singkil.jpg'
import tausugAttire from '../_images/discover/tausug-attire.jpg'
import tepoMat from '../_images/discover/tepo-mat.jpg'
import tiyulaItum from '../_images/discover/tiyula-itum.jpg'
import tausugWarriors from '../_images/discover/tausug-warriors-1899.jpg'
import torogan from '../_images/discover/torogan.jpg'
import yakanWeaving from '../_images/discover/yakan-weaving.jpg'

/**
 * Every photograph on Discover BARMM, with the credit it is used under.
 *
 * These are not decoration. A reader who has never been to the region needs to
 * see it, and the same standard applies to a picture as to a figure elsewhere
 * on the site: it names what it shows, who made it, under what licence, and
 * where the original lives. `caption` is the line printed under the image;
 * `alt` is what a screen reader hears, so the two say different things.
 *
 * Everything here is public domain, CC0, or a CC licence that permits reuse
 * with attribution — mostly from Wikimedia Commons, plus official releases from
 * the Bangsamoro Government's own information offices. `credit` and `source`
 * are what satisfy the attribution terms, so neither is optional.
 */
export type DiscoverPhoto = {
	src: StaticImageData
	alt: string
	caption: string
	/** Where in BARMM, printed as a small locator over the frame. */
	place?: string
	credit: string
	license: string
	/** The Commons file page — the licence's "link to the source" requirement. */
	source: string
}

export const discoverPhotos = {
	makhdumMosque: {
		src: makhdumMosque,
		alt: 'The green and gold façade of the Sheik Karimul Makhdum Mosque, its domes topped with crescents.',
		caption: 'Sheik Karimul Makhdum Mosque, Simunul — the oldest mosque in the Philippines, founded 1380.',
		place: 'Simunul, Tawi-Tawi',
		credit: 'Laila Aripin / Bangsamoro Information Office',
		license: 'Public domain',
		source: 'https://commons.wikimedia.org/wiki/File:Sheikh_Karimul_Makhdum_Mosque_BIO_file_photo.jpg',
	},
	tausugWarriors: {
		src: tausugWarriors,
		alt: 'An 1899 engraving of a Tausug warrior in full regalia carrying a shield and blade.',
		caption: 'Tausug warriors in full regalia, from a 1899 volume on the Philippine Islands.',
		credit: 'Internet Archive Book Images',
		license: 'No known copyright restrictions',
		source:
			'https://commons.wikimedia.org/wiki/File:Tausug_warriors_in_full_regalia._Image_from_page_109_of_%22The_Philippine_Islands%22_(1899).jpg',
	},
	moaAdMap: {
		src: moaAdMap,
		alt: 'The 2008 MOA-AD map showing proposed Bangsamoro territory in red and yellow across Mindanao and the Sulu archipelago.',
		caption: 'The territory the 2008 MOA-AD would have covered — struck down before it could be signed.',
		credit: 'Presidential Communications Development and Strategic Planning Office',
		license: 'Public domain',
		source: 'https://commons.wikimedia.org/wiki/File:MOA-AD_2008_Map.jpg',
	},
	bolRatification: {
		src: bolRatification,
		alt: 'A hall of seated officials beneath a banner reading Peace Assembly for the Ratification of Republic Act No. 11054.',
		caption: 'The peace assembly for the ratification of Republic Act 11054, the Bangsamoro Organic Law.',
		place: 'Cotabato City',
		credit: 'Robinson Niñal Jr. / Presidential Communications Operations Office',
		license: 'Public domain',
		source:
			'https://commons.wikimedia.org/wiki/File:Rodrigo_Durtete_Peace_Assembly_for_the_Ratification_of_Bangsamoro_Organic_Law.jpg',
	},
	btaFirstSession: {
		src: btaFirstSession,
		alt: 'Two officials seated at a carved wooden rostrum during the first session of the Bangsamoro Transition Authority.',
		caption: 'The first session of the Bangsamoro Transition Authority, with the Wali and the interim Chief Minister.',
		credit: 'Bangsamoro Regional Government',
		license: 'Public domain',
		source: 'https://commons.wikimedia.org/wiki/File:BARMM_BTA_First_Session,_Wali_Nando_and_CM_Ebrahim.jpg',
	},
	btaTransitionPlan: {
		src: bataTransitionPlan,
		alt: 'The Bangsamoro Transition Authority parliament chamber, flags flanking a green and gold rostrum.',
		caption: 'The Bangsamoro Transition Authority approving its transition plan in the parliament chamber.',
		place: 'Bangsamoro Government Center',
		credit: 'Bangsamoro Parliament',
		license: 'Public domain',
		source: 'https://commons.wikimedia.org/wiki/File:BTA_approves_proposed_transition_plan_1.jpg',
	},
	governmentCenter: {
		src: governmentCenter,
		alt: 'The arcade of the Bangsamoro Government Center at night, lit in bands of coloured light.',
		caption: 'The Bangsamoro Government Center lit for Eid al-Fitr.',
		place: 'Cotabato City',
		credit: 'BARMM Bureau of Public Information',
		license: 'Public domain',
		source: 'https://commons.wikimedia.org/wiki/File:Eid%E2%80%99l_Fitr_Bangsamoro_Government_Center.jpg',
	},
	parliamentHall: {
		src: parliamentHall,
		alt: 'Rows of blue desks with monitors facing a green and gold rostrum in the Bangsamoro parliament session hall.',
		caption: 'The session hall of the Bangsamoro Parliament — 80 seats when the first regular Parliament is elected.',
		place: 'Bangsamoro Government Center',
		credit: 'Bangsamoro Parliament',
		license: 'Public domain',
		source: 'https://commons.wikimedia.org/wiki/File:Bangsamoro_Transition_Authority_Parliament_Session_Hall.jpg',
	},
	parliamentSession: {
		src: parliamentSession,
		alt: 'Deputy Speaker Laisa Alamia standing at the rostrum presiding over a session of the Bangsamoro Parliament.',
		caption: 'Deputy Speaker Laisa Alamia presiding over a regular session of the Bangsamoro Parliament.',
		credit: 'Bangsamoro Parliament',
		license: 'Public domain',
		source:
			'https://commons.wikimedia.org/wiki/File:Deputy_Speaker_Laisa_Alamia_presides_over_a_session_of_the_Bangsamoro_Parliament.jpg',
	},
	parliamentBuilding: {
		src: parliamentBuilding,
		alt: 'The long arcaded façade of the Bangsamoro Parliament building under an overcast sky.',
		caption: 'The Bangsamoro Parliament building at the Bangsamoro Government Center.',
		place: 'Cotabato City',
		credit: 'Marwan Khan',
		license: 'CC BY-SA 3.0',
		source: 'https://commons.wikimedia.org/wiki/File:BM_PARLIAMENT_BGC.jpg',
	},
	chiefMinisterOffice: {
		src: chiefMinisterOffice,
		alt: 'The Office of the Chief Minister building at the Bangsamoro Government Center.',
		caption: 'The Office of the Chief Minister — the executive centre of the regional government.',
		place: 'Cotabato City',
		credit: 'Marwan Khan',
		license: 'CC BY-SA 3.0',
		source: 'https://commons.wikimedia.org/wiki/File:OCM_BGC.jpg',
	},
	cabinet: {
		src: cabinet,
		alt: 'Members of the BARMM cabinet seated along a long table lined with laptops.',
		caption: 'Ministers of the Bangsamoro cabinet in session — the ministries that deliver regional services.',
		credit: 'Bangsamoro Public Information Office',
		license: 'Public domain',
		source: 'https://commons.wikimedia.org/wiki/File:BARMM_new_cabinet_members_September_2022.jpg',
	},
	yakanWeaving: {
		src: yakanWeaving,
		alt: 'A handwoven Yakan seputangan head cloth in fine geometric bands of pink, green and cream.',
		caption:
			'A seputangan head cloth woven by Ambalang Ausalin of Lamitan, a Yakan master weaver named a National Living Treasure.',
		place: 'Lamitan, Basilan',
		credit: 'Valenzuela400',
		license: 'CC BY-SA 4.0',
		source:
			'https://commons.wikimedia.org/wiki/File:Tennum_Ambalang_Ausalin_Lamitan_Basilan_Islamic_weavingA.jpg',
	},
	tausugAttire: {
		src: tausugAttire,
		alt: 'A group in bright red, yellow, blue and pink Tausug dress standing on white sand before outrigger boats.',
		caption: 'Tausug traditional dress — every Bangsamoro group carries its own colour, cut and weave.',
		credit: 'Heigen18',
		license: 'CC BY-SA 4.0',
		source: 'https://commons.wikimedia.org/wiki/File:TausugTribeOutfit.jpg',
	},
	kulintang: {
		src: kulintang,
		alt: 'Three women in green and yellow seated behind a carved kulintang, one holding a hanging gong.',
		caption: 'A kulintang ensemble in Sitangkai — the gong-row music that runs through Bangsamoro ceremony.',
		place: 'Sitangkai, Tawi-Tawi',
		credit: 'Municipal Tourism Office of Sitangkai, Tawi-Tawi',
		license: 'CC BY-SA 4.0',
		source: 'https://commons.wikimedia.org/wiki/File:Kulintang_sitangkai.jpg',
	},
	singkil: {
		src: singkil,
		alt: 'Dancers in pink and violet stepping between clapping bamboo poles beneath a tiered parasol.',
		caption: 'Singkil — the Meranao court dance of stepping through clashing bamboo, told from the Darangen epic.',
		credit: 'Conrad027',
		license: 'CC BY-SA 4.0',
		source: 'https://commons.wikimedia.org/wiki/File:SINGKIL_FOLKLORE.jpg',
	},
	torogan: {
		src: torogan,
		alt: 'A torogan — a steep-roofed Meranao royal house raised on heavy posts above water.',
		caption: 'A torogan, the ancestral Meranao house of a datu, raised on carved posts with flaring panolong beams.',
		credit: 'Maksym Kozlenko',
		license: 'CC BY-SA 4.0',
		source: 'https://commons.wikimedia.org/wiki/File:Model_of_Torogan_Marano.jpg',
	},
	panolong: {
		src: panolong,
		alt: 'A large wooden panolong beam carved and painted with swirling okir scrollwork in red, blue, green and yellow.',
		caption: 'Okir — the flowing carved motif of the Meranao, here on a panolong, the wing-beam of a torogan.',
		credit: 'Nikka Cunom',
		license: 'CC BY 2.0',
		source: 'https://commons.wikimedia.org/wiki/File:Panolong.jpg',
	},
	pisSiyabit: {
		src: pisSiyabit,
		alt: 'A square Tausug pis siyabit head cloth densely woven with interlocking geometric medallions.',
		caption: 'Pis siyabit — the Tausug head cloth, its interlocking geometry built up thread by thread.',
		credit: 'Hiart',
		license: 'CC0',
		source:
			'https://commons.wikimedia.org/wiki/File:Pis_siyabit_(headscarf),_Tausug_people,_Philippines,_Honolulu_Museum_of_Art_14451.1.JPG',
	},
	malong: {
		src: malong,
		alt: 'A malong tube skirt in wide magenta and gold bands crossed by a woven decorative panel.',
		caption: 'A malong — the tube garment worn across Mindanao, its bands and panel naming where it was woven.',
		credit: 'Hiart',
		license: 'CC0',
		source:
			'https://commons.wikimedia.org/wiki/File:Malong_(tube_skirt)_from_Mindanao,_Honolulu_Museum_of_Art_14180.1.JPG',
	},
	budBongao: {
		src: budBongao,
		alt: 'Bud Bongao rising behind a harbour at dusk, boats moored under a pink and violet sky.',
		caption:
			'Bud Bongao at dusk — the peak above Bongao, a pilgrimage climb for people of different faiths.',
		place: 'Bongao, Tawi-Tawi',
		credit: 'Crow1997',
		license: 'CC BY-SA 4.0',
		source: 'https://commons.wikimedia.org/wiki/File:Bud_Bongao_from_Bongao_Port.jpg',
	},
	panampangan: {
		src: panampangan,
		alt: 'A low green island ringed by a pale sandbar in turquoise water under a wide sky.',
		caption:
			'Panampangan Island, off Tawi-Tawi — its sandbar is widely reported as the longest in the country.',
		place: 'Sapa-Sapa, Tawi-Tawi',
		credit: 'Ervin Malicdem',
		license: 'CC BY-SA 4.0',
		source: 'https://commons.wikimedia.org/wiki/File:Panampangan_Island.jpg',
	},
	lakeLanao: {
		src: lakeLanao,
		alt: 'Lake Lanao stretching to distant hills under a bright, clouded sky.',
		caption: 'Lake Lanao — the second largest lake in the Philippines, and the homeland the Meranao are named for.',
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
	marawiIslamicCenter: {
		src: marawiIslamicCenter,
		alt: 'A broad cream mosque with a central dome and flanking minarets on a Marawi street corner.',
		caption: 'A mosque in Marawi — the city that gives Lanao del Sur its civic and religious centre.',
		place: 'Marawi, Lanao del Sur',
		credit: 'Bjeweld',
		license: 'CC BY-SA 4.0',
		source: 'https://commons.wikimedia.org/wiki/File:Sights_of_Marawi_City,_Lanao_del_Sur_(39).jpg',
	},
	pastil: {
		src: pastil,
		alt: 'Banana-leaf parcels of pastil, one opened to show shredded meat over steamed rice.',
		caption: 'Pastil — rice and shredded meat wrapped in banana leaf, the everyday meal of the Maguindanaon.',
		credit: 'Obsidian Soul',
		license: 'CC0',
		source: 'https://commons.wikimedia.org/wiki/File:Pastil_(Philippines)_01.jpg',
	},
	paterPalapa: {
		src: paterPalapa,
		alt: 'Turmeric-yellow kuning rice and grilled chicken pater served on a banana leaf.',
		caption: 'Pater with palapa and kuning — Meranao cooking built on scallion, ginger and chilli.',
		credit: 'Obsidian Soul',
		license: 'CC0',
		source:
			'https://commons.wikimedia.org/wiki/File:Maranao_chicken_pater_with_palapa_and_kuning_(turmeric_rice)_from_Bukidnon,_Philippines_01.jpg',
	},
	cotabatoPlaza: {
		src: cotabatoPlaza,
		alt: 'A wet Cotabato City boulevard at night, street lights strung down the avenue.',
		caption: 'Cotabato City after rain — the seat of the Bangsamoro Government.',
		place: 'Cotabato City',
		credit: 'Patrickroque01',
		license: 'CC BY-SA 4.0',
		source:
			'https://commons.wikimedia.org/wiki/File:Cotabato_City_Plaza_stage,_Sinsuat_Avenue_top_view_night_(Cotabato_City;_08-16-2023).jpg',
	},
	tepoMat: {
		src: tepoMat,
		alt: 'A woven pandan mat in bold diagonal bands of magenta, teal and yellow.',
		caption:
			'A tepo — the pandan mat woven by Sama women, a craft handed down the mother\u2019s line and never taken up by men.',
		place: 'Sibutu, Tawi-Tawi',
		credit: 'Valenzuela400',
		license: 'CC BY-SA 4.0',
		source:
			'https://commons.wikimedia.org/wiki/File:Sibutu_Tawi_Tawi_Sama_Bajau_pandan_Banig_mat_textile_colorfulF.jpg',
	},
	agung: {
		src: agung,
		alt: 'Two hands striking a pair of large bossed bronze gongs with padded beaters.',
		caption: 'The agung — the deep bossed gong that anchors a kulintang ensemble.',
		credit: 'Philip Dominguez Mercurio',
		license: 'CC BY-SA 2.5',
		source: 'https://commons.wikimedia.org/wiki/File:Agung_(Philippine_hanging_gong).jpg',
	},
	tiyulaItum: {
		src: tiyulaItum,
		alt: 'A bowl of near-black beef soup beside a red onion and dried chillies.',
		caption:
			'Tiyula itum — the Tausug black soup, its colour from burnt coconut meat ground into the broth.',
		credit: 'Nurfadzrie Abubakar',
		license: 'CC BY 3.0',
		source:
			'https://commons.wikimedia.org/wiki/File:Tiyula_Itum_by_Patrick_Aye_Beef_Black_Soup_8-37_screenshot.jpg',
	},
} satisfies Record<string, DiscoverPhoto>

export type DiscoverPhotoKey = keyof typeof discoverPhotos

export function photo(key: DiscoverPhotoKey): DiscoverPhoto {
	return discoverPhotos[key]
}
