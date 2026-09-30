import { lguProvinces, type LguProvince } from '@betterbarmm/lgu-data'

/* ============================================================
   The seven areas, as a traveler meets them

   BARMM is not one destination and pretending it is does a reader no
   favors. Tawi-Tawi is an archipelago closer to Borneo than to
   Manila and is reached from Zamboanga. Lanao del Sur is highland,
   cold at night, and reached overland from Iligan. Cotabato City is
   a river port and the seat of the regional government. They share a
   government and a faith and very little else about the mechanics of
   getting there.

   So the unit of this guide is the area, and each one carries the
   things that change between them: the airport or pier you actually
   arrive at, what the roads are like once you have, the language
   spoken, and the security picture — which differs more sharply
   between these seven than between most countries.

   Every `slug` here is the local government directory's own, so an
   area page can link straight into the directory rather than
   maintaining a second list of the same places.
   ============================================================ */

/** How settled travel is in an area, stated plainly rather than scored. */
export type TravelFooting =
	/** Regular commercial flights, a working lodging market, routine visits. */
	| 'established'
	/** Reachable and visited, but thin on infrastructure — plan around it. */
	| 'emerging'
	/** Reachable, but standing advisories mean it needs local coordination. */
	| 'coordinate-first'
	/** Newly constituted, with nothing built for visitors yet. */
	| 'no-visitor-infrastructure'

export type TravelArea = {
	/** The local government directory's slug for the same area. */
	slug: string
	name: string
	/** One line, the thing a reader needs before anything else. */
	tagline: string
	/** The town you actually base yourself in. */
	base: string
	footing: TravelFooting
	/** Two or three paragraphs on what the place is. */
	intro: string[]
	/** Every practical way in, most-used first. */
	gettingThere: string[]
	gettingAround: string[]
	/** Languages a visitor will hear, most-spoken first. Filipino and English
	    are understood almost everywhere and are not repeated per area. */
	languages: string[]
	knownFor: string[]
	whenToGo: string
	/** The security picture for this area specifically. Never averaged across
	    the region — the whole point of stating it per area is that it varies. */
	safety: string
}

export const travelAreas: TravelArea[] = [
	{
		slug: 'cotabato-city',
		name: 'Cotabato City',
		tagline: 'The seat of the Bangsamoro government, and the easiest door into the region.',
		base: 'Cotabato City',
		footing: 'established',
		intro: [
			'Cotabato City sits on the Rio Grande de Mindanao a few kilometers upriver from the sea, and it is the one place in BARMM where a visitor arriving with no local contacts can simply check in, eat well and walk around. It voted to join the region in the 2019 plebiscite and now hosts the Bangsamoro Government Center, which means it also has the hotel rooms, ATMs, hospitals and daily Manila flights that a seat of government accumulates.',
			'It is an old city rather than a new capital. The Rio Grande made it the natural center of the Maguindanao Sultanate, and the layers are still legible: Pedro Colina Hill, fortified by the Spanish and still the place you climb for the view over the delta; the Kutawato caves running underneath it; the Tamontaka church built for a mission settlement in the 1870s; and above all the Sultan Haji Hassanal Bolkiah Masjid on the edge of town, the largest mosque in the country, paid for by the Sultan of Brunei.',
			'One thing confuses almost every visitor and is worth settling early: the city is geographically surrounded by Maguindanao del Norte but is not part of it. It is an area of its own in BARMM, and it is not the provincial capital of anything. Maguindanao del Norte governs from Datu Odin Sinsuat, next door.',
		],
		gettingThere: [
			'Awang Airport, in Datu Odin Sinsuat about 30 minutes from the city, is the region’s main airport and takes daily jets from Manila. It is signed and ticketed as Cotabato (CBO) although it stands outside the city.',
			'By road from Davao takes roughly 4 to 5 hours on the highway through Sultan Kudarat province, and buses and vans run it all day.',
			'By road from General Santos and Koronadal, 3 to 4 hours, on the same corridor.',
		],
		gettingAround: [
			'Tricycles and multicabs cover the city and are the normal way to move within it.',
			'Vans at the terminal serve Maguindanao del Norte and del Sur and are how most people reach Parang, Upi, Datu Piang and the towns beyond.',
			'Ride-hailing is unreliable here; agree the fare before you get in, as residents do.',
		],
		languages: ['Maguindanaon', 'Iranun', 'Cebuano', 'Hiligaynon'],
		knownFor: [
			'The Grand Mosque, the largest in the Philippines',
			'Pedro Colina Hill and the Kutawato caves',
			'Pastil, and the region’s densest concentration of it',
			'Shariff Kabunsuan Festival in December',
		],
		whenToGo:
			'Comfortable year-round; the city is outside the typhoon belt. Rain is heaviest around the southwest monsoon from June to October. December brings the Shariff Kabunsuan Festival, which is the best week to see the river and the culture on display at once.',
		safety:
			'Routinely visited, and the calmest introduction to the region. Checkpoints on the approach roads are normal and quick. Standard city sense applies and little more, though foreign governments still write advisories covering mainland Mindanao broadly, so a traveler on institutional insurance should read their own before booking.',
	},
	{
		slug: 'tawi-tawi',
		name: 'Tawi-Tawi',
		tagline:
			'The southernmost province in the country — sandbars, stilt towns, and the oldest mosque in the Philippines.',
		base: 'Bongao',
		footing: 'emerging',
		intro: [
			'Tawi-Tawi is an archipelago of some 300 islands strung between Mindanao and Borneo, and it is the part of BARMM most worth crossing the country for. Bongao, the capital, sits under a 314-meter limestone peak that is both the island’s landmark and a place of pilgrimage. The water around the outer islands is the clearest in the region, and Panampangan off Sapa-Sapa carries a sandbar that at low tide runs for something over 3 kilometers.',
			'It is also the seat of the oldest continuous Islamic presence in the country. Sheik Karim al-Makhdum arrived at Simunul in 1380 and built a mosque there; four of its original hardwood pillars still stand inside the structure that replaced it, and the site is a National Historical Landmark. Islam reached the Philippines here, roughly a century before Magellan reached Cebu, and the province is quietly conscious of it.',
			'The people of the outer islands are largely Sama, including the Sama Dilaut whose stilt villages at Sitangkai are built over open water with boardwalks for streets. Seaweed farming, not fishing, is the economy that holds the province up: the racks and drying lines are everywhere, and the agar trade reaches Zamboanga and beyond.',
		],
		gettingThere: [
			'Sanga-Sanga Airport at Bongao takes daily flights from Zamboanga City, the standard route in. Zamboanga itself connects to Manila and Cebu, so most travelers fly two legs.',
			'Ferries run Zamboanga to Bongao and take well over 24 hours. It is cheap, it is how most residents travel, and it is a genuine experience — but budget a full day and a night each way.',
			'Between islands, public bancas run on their own schedules from Bongao and Sitangkai. Chartering one for a day is normal practice and negotiated at the wharf.',
		],
		gettingAround: [
			'Tricycles cover Bongao town and Sanga-Sanga.',
			'Boats do everything else. There is no other way to Simunul, Sibutu, Sitangkai or Panampangan.',
			'Sea conditions, not schedules, decide when boats run. Build slack into any island plan.',
		],
		languages: ['Sinama', 'Sama Bangingi', 'Tausug', 'Bahasa Sug'],
		knownFor: [
			'Bud Bongao, climbed by pilgrims and visitors alike',
			'Panampangan Island’s sandbar',
			'Sheik Karim al-Makhdum Mosque at Simunul, 1380',
			'The stilt town at Sitangkai',
			'Seaweed farming, and the agar trade',
		],
		whenToGo:
			'March to early June is the calmest sea and the best window for the outer islands. The northeast monsoon from November to February makes small-boat crossings rough and sometimes cancels them outright. The province marks Kamahardikaan sin Tawi-Tawi, its founding anniversary, in late September.',
		safety:
			'Generally calm, and the province has worked hard at that reputation. It is the part of BARMM most often recommended to visitors without local ties. Foreign advisories covering the Sulu Archipelago frequently name Tawi-Tawi in the same breath as Sulu and Basilan even though the situations differ; read the current text rather than the headline. Coordinate island trips through the provincial tourism office, which is normal practice here rather than a precaution.',
	},
	{
		slug: 'lanao-del-sur',
		name: 'Lanao del Sur',
		tagline: 'Lake Lanao, the Maranao highlands, and a city being rebuilt.',
		base: 'Marawi City',
		footing: 'emerging',
		intro: [
			'Lanao del Sur is highland country wrapped around Lake Lanao, the second-largest lake in the Philippines and one of the few ancient lakes anywhere — old enough to have evolved its own endemic fish. It sits about 700 meters up, so nights are cool in a way nowhere else in the region is, and the light over the water in the late afternoon is the thing most visitors remember.',
			'This is Maranao country, and the craft tradition is the strongest in BARMM. Okir, the flowing carved ornament that runs through everything from house beams to brassware, is a Maranao form. Tugaya on the lake’s western shore is the brass and craft town, where kulintang gongs, betel boxes and cast vessels are still made. The torogan — the raised royal house with its winged panolong beam ends — survives in only a handful of examples; the Kawayan Torogan in Marantao is a declared National Cultural Treasure.',
			'Marawi cannot be visited honestly without the siege. In 2017 the city center was fought over for five months and destroyed; the area is still called Ground Zero or the Most Affected Area, and rebuilding has been slow and contested. Visitors do come, and residents are generally willing to talk about it, but this is not a photo backdrop. Go with someone local, ask before photographing anything, and accept that some of it remains closed.',
		],
		gettingThere: [
			'Fly to Laguindingan Airport near Cagayan de Oro, then travel overland via Iligan. Iligan to Marawi is roughly an hour and a half by van on a good day.',
			'Vans from Iligan’s terminal are the standard link and run frequently through the morning.',
			'Overland from Cotabato City through Malabang and up the western shore is possible and long; ask locally about conditions before committing to it.',
		],
		gettingAround: [
			'Vans and jeepneys link the lakeshore towns; the circuit around Lake Lanao is the main road.',
			'Tricycles within Marawi and the larger towns.',
			'A hired vehicle with a local driver is the practical way to see Tugaya, Marantao and the southern shore in a day.',
		],
		languages: ['Maranao'],
		knownFor: [
			'Lake Lanao, and the towns around its shore',
			'Tugaya’s brassware and kulintang',
			'The Aga Khan Museum at MSU Marawi',
			'Torogan houses, and okir carving',
			'The coolest climate in BARMM',
		],
		whenToGo:
			'Dry and clear roughly December to April, which is also when the highland nights are coldest — bring something warm, which surprises people. The lake is prone to afternoon cloud in the wet months, and the views are the reason to come.',
		safety:
			'The security picture here is more variable than in Cotabato City or Tawi-Tawi, and it moves. Marawi itself is visited, but travel is best arranged through local contacts, the city tourism office, or MSU, and some outlying municipalities are best left off an itinerary without current local advice. This is the area where asking on the ground matters most, and where a plan made from a distance is least reliable.',
	},
	{
		slug: 'maguindanao-del-norte',
		name: 'Maguindanao del Norte',
		tagline: 'The coast, the highland of Upi, and the road to everywhere else.',
		base: 'Datu Odin Sinsuat',
		footing: 'emerging',
		intro: [
			'Maguindanao del Norte wraps around Cotabato City and runs north and west to the Illana Bay coast. Most visitors pass through it — the region’s airport is here, at Awang — without registering that they have left the city, which is a shame, because the province holds the most varied landscape on the BARMM mainland.',
			'Upi and South Upi climb into cool uplands settled by Teduray communities, one of the region’s non-Muslim indigenous peoples, whose Meguyaya Festival is among the more distinctive things in the BARMM calendar. Down on the coast, Parang and Barira face Illana Bay with beaches and small islands, and Polloc port in Parang is the region’s deepwater harbour and its freeport.',
			'The province was created in 2022 when Maguindanao divided in two, which is recent enough that maps, signage and search results have not all caught up. Anything published before then describing "Maguindanao" is describing both halves.',
		],
		gettingThere: [
			'Awang Airport is in this province, in Datu Odin Sinsuat, roughly 30 minutes from Cotabato City.',
			'Vans from Cotabato City’s terminals reach Parang, Upi, Sultan Kudarat and Barira through the day.',
			'The coastal road north from Parang continues to Malabang in Lanao del Sur.',
		],
		gettingAround: [
			'Vans and jeepneys between towns; tricycles and habal-habal within them.',
			'Upi and South Upi are uphill and the last stretches can be rough after rain.',
		],
		languages: ['Maguindanaon', 'Iranun', 'Teduray'],
		knownFor: [
			'Illana Bay coast at Parang and Barira',
			'The Teduray uplands at Upi and South Upi',
			'Polloc port and freeport',
			'Meguyaya Festival in Upi',
		],
		whenToGo:
			'Year-round, with the driest stretch from December to April. The coast is best outside the southwest monsoon; the uplands are pleasant whenever it is not actively raining.',
		safety:
			'Mixed, and worth treating by municipality rather than by province. The Awang corridor and the coastal towns see routine traffic. Some interior municipalities carry a heavier security presence and are not places to arrive unannounced. Local advice before an interior trip is the working rule.',
	},
	{
		slug: 'maguindanao-del-sur',
		name: 'Maguindanao del Sur',
		tagline: 'The pink mosque, the great marsh, and the agricultural heart of the region.',
		base: 'Buluan',
		footing: 'coordinate-first',
		intro: [
			'Maguindanao del Sur is inland, flat and green, and the least traveled part of BARMM by outsiders. Its landscape feature is Ligawasan Marsh — one of the largest wetlands in the country, a maze of channels and floating vegetation, rich in birdlife and, less romantically, in natural gas. Getting onto it means a boat and a local guide, and there is no arrangement for that beyond asking in the barangay.',
			'The one thing here that has traveled internationally is Masjid Dimaukom in Datu Saudi-Ampatuan, painted entirely pink and known everywhere as the Pink Mosque. It was built at the initiative of the town’s mayor by Muslim and Christian workers together, and the color was chosen as a statement about peace rather than a decorative accident. It is a working mosque, so the visiting rules are the visiting rules.',
			'The province also carries the heaviest recent history in the region, and residents are aware that its name reaches outsiders attached to the 2009 massacre and the 2015 Mamasapano encounter. Both happened here. Neither describes the province, and both are part of why travel infrastructure never developed.',
		],
		gettingThere: [
			'By road from Cotabato City through Datu Piang and Shariff Aguak, or from the Davao–General Santos corridor via Buluan and Datu Paglas.',
			'Vans run the main corridor; the branch roads into the marsh towns are served by jeepneys and habal-habal.',
			'There is no airport in the province; Awang and General Santos are the two realiztic arrival points.',
		],
		gettingAround: [
			'Vans on the highway, habal-habal off it.',
			'Ligawasan Marsh is reached only by boat, arranged locally.',
		],
		languages: ['Maguindanaon'],
		knownFor: [
			'Masjid Dimaukom, the Pink Mosque',
			'Ligawasan Marsh',
			'Rice, corn and the region’s farming belt',
			'Kulintang and the Maguindanaon musical tradition',
		],
		whenToGo:
			'December to April is drier and the roads are better for it. The marsh is fuller and more navigable in the wet months, which is a genuine trade-off rather than a preference.',
		safety:
			'This is the area to arrange rather than improvise. Several municipalities carry standing advisories and a visible military presence, and clan disputes are a real and local phenomenon that outsiders read badly. Travel with a local contact who knows the specific town, coordinate with the LGU, and treat any plan that does not include those two steps as incomplete.',
	},
	{
		slug: 'basilan',
		name: 'Basilan',
		tagline: 'Rubber, Yakan weaving, and the island the advisories are written about.',
		base: 'Lamitan City',
		footing: 'coordinate-first',
		intro: [
			'Basilan is a green volcanic island off Zamboanga, and it is the place in this guide with the widest gap between what it is and what it is known for. It is the country’s rubber heartland, it grows good coffee, and it is home to the Yakan, whose geometric weaving is among the finest textile traditions in the Philippines. It is also the island that two decades of kidnapping coverage attached to the region’s name.',
			'Both things are true and the security situation has genuinely improved, particularly around Lamitan. Lamitan is the BARMM provincial capital and the most straightforward part of the island for a visitor: the Lami-Lamihan Festival in June is when Yakan dress, weaving and horse-riding are on full display, and Bulingan Falls sits a short drive out of town.',
			'A point of geography that trips everyone up: Isabela City, the island’s largest city, is not in BARMM. It voted to stay in Region IX and is administered from the Zamboanga Peninsula, even though it sits on Basilan. The provincial capital for BARMM purposes is Lamitan.',
		],
		gettingThere: [
			'Ferries from Zamboanga City to Isabela and to Lamitan, roughly 1 to 2 hours depending on the boat.',
			'Fast craft and RORO both run the crossing; the fast craft are the usual choice.',
			'Zamboanga connects by air to Manila, Cebu and Davao, so this is a two-leg journey for most travelers.',
		],
		gettingAround: [
			'Jeepneys and vans on the coastal road between Isabela, Lamitan and the western towns.',
			'Tricycles and habal-habal within towns.',
			'Malamawi Island is a short pump-boat crossing from Isabela.',
		],
		languages: ['Yakan', 'Tausug', 'Chavacano', 'Sama'],
		knownFor: [
			'Yakan weaving',
			'Lami-Lamihan Festival at Lamitan, June',
			'Rubber, and Basilan coffee',
			'Bulingan Falls',
			'Malamawi Island',
		],
		whenToGo:
			'Drier from March to May, and June for the festival. Crossings from Zamboanga are less comfortable during the northeast monsoon from November to February.',
		safety:
			'Basilan carries standing foreign-government advisories, and several countries advise against all travel to parts of it. The situation around Lamitan and the coastal corridor is markedly better than the advisories’ blanket framing, and Filipinos travel there routinely. That is not the same as it being unremarkable. Coordinate with the provincial or city tourism office, travel with local contacts, stay on the main corridor, and do not improvise into the interior municipalities.',
	},
	{
		slug: 'special-geographic-area',
		name: 'Special Geographic Area',
		tagline: 'Eight municipalities constituted in 2024, with nothing yet built for visitors.',
		base: 'None established',
		footing: 'no-visitor-infrastructure',
		intro: [
			'The Special Geographic Area is 63 barangays in North Cotabato that voted in the 2019 plebiscite to leave their province and join the Bangsamoro. They spent the following years administratively attached to towns outside the region, and were constituted into 8 new municipalities — Kadayangan, Kapalawan, Ligawasan, Malidegao, Nabalawag, Old Kaabakan, Pahamuddin and Tugunan — in 2024.',
			'It is included here because leaving it out would be its own kind of claim. But it is a new civil administration standing itself up, not a destination: there are no hotels, no tourism office to call, and no signposted anything. The landscape is the western edge of Ligawasan Marsh and the farmland around it, and the interest is genuinely in what is being built rather than in what there is to see.',
			'Anyone traveling here should be doing so for a reason — work, family, research — and should arrange it through the municipality directly.',
		],
		gettingThere: [
			'By road from Cotabato City or from Midsayap and Pikit in North Cotabato.',
			'Habal-habal and jeepneys serve the barangay roads; there is no through public transport built around the new municipal boundaries yet.',
		],
		gettingAround: ['Habal-habal, and local arrangement. Nothing is scheduled.'],
		languages: ['Maguindanaon', 'Iranun', 'Cebuano'],
		knownFor: [
			'The 2019 plebiscite, and the region’s newest local governments',
			'The western reaches of Ligawasan Marsh',
		],
		whenToGo:
			'Drier from December to April; marsh-edge roads are poor after sustained rain.',
		safety:
			'Treat as you would the neighbouring Maguindanao del Sur municipalities: arrange through local contacts and the LGU, and do not travel here on spec. Administrative arrangements are still settling, which affects everything from who to ask for permission to who answers the phone.',
	},
]

/** Areas keyed by slug, for a route that has one. */
export const travelAreaBySlug = new Map(travelAreas.map((area) => [area.slug, area]))

export const findTravelArea = (slug: string): TravelArea | undefined => travelAreaBySlug.get(slug)

/**
 * The local government record for an area, so a travel page can quote the
 * census rather than a second copy of it.
 *
 * Returns undefined rather than throwing where the directory has no matching
 * area — the guide is written by hand and the directory is generated, so the
 * two can drift, and a missing figure should blank a stat rather than a page.
 */
export const lguForArea = (area: TravelArea): LguProvince | undefined =>
	lguProvinces.find((province) => province.slug === area.slug)

/** Plain-language labels for the footing values, for a badge. */
export const FOOTING_LABEL: Record<TravelFooting, string> = {
	established: 'Straightforward to visit',
	emerging: 'Visited, thin infrastructure',
	'coordinate-first': 'Arrange before you go',
	'no-visitor-infrastructure': 'Nothing built for visitors',
}
