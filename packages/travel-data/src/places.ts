/* ============================================================
   Places

   What there is to go and see, one record each, tied to the
   municipality it is actually in.

   The rules this list is written under, because they are what keeps
   it useful:

   · Nothing is here that the writer could not describe concretely.
     A place that reduces to "a beautiful beach" is a placeholder,
     not an entry, and it is left out.

   · No opening hours, no fees, no phone numbers. Those change, they
     are the fields a guide gets wrong first, and a traveler who
     plans around a stale fee is worse off than one who was told to
     ask. Where a cost or a permission genuinely gates the visit, the
     `beforeYouGo` line says so without pricing it.

   · Sacred sites carry their etiquette in the record rather than in
     a general note somewhere else, because the general note is the
     one nobody reads.

   · `municipality` is the LGU directory's name for the town, so a
     place can link into the directory and a reader can find out what
     they are actually walking into.
   ============================================================ */

export type PlaceKind =
	| 'sacred'
	| 'nature'
	| 'coast'
	| 'heritage'
	| 'craft'
	| 'city'
	| 'memory'

export type Place = {
	slug: string
	name: string
	/** Other names a reader may have seen it under. */
	alsoKnownAs?: string[]
	kind: PlaceKind
	/** The travel area slug — matches both this guide and the LGU directory. */
	area: string
	/** The municipality as the LGU directory names it. */
	municipality: string
	/** One line for a card. */
	summary: string
	/** The substance — why it is worth the journey, and what is actually there. */
	detail: string[]
	/** Practical gates: a guide, a permit, a boat, a dress code, a closure. */
	beforeYouGo: string[]
	/** True where this is the single thing to see in its area. */
	signature?: boolean
}

export const places: Place[] = [
	/* ---- Cotabato City ---------------------------------------------------- */
	{
		slug: 'grand-mosque-cotabato',
		name: 'Sultan Haji Hassanal Bolkiah Masjid',
		alsoKnownAs: ['The Grand Mosque of Cotabato'],
		kind: 'sacred',
		area: 'cotabato-city',
		municipality: 'Cotabato City',
		summary: 'The largest mosque in the Philippines, on the edge of the city at Kalanganan.',
		signature: true,
		detail: [
			'Four minarets, a gold central dome and a prayer hall built to hold several thousand people, standing in open ground on the western edge of the city. It was funded by the Sultan of Brunei, whose name it carries, and opened in 2011.',
			'The scale is the point and photographs undersell it — the approach across the forecourt is what registers. Inside, the ornament is restrained: geometry and calligraphy, no figures, in the way of the tradition.',
			'It is a working congregational mosque, busiest at Friday midday prayer, and it is used by the city rather than maintained as a monument.',
		],
		beforeYouGo: [
			'Dress covered — long trousers or a long skirt, shoulders covered. Women are generally expected to cover their hair inside; bring a scarf.',
			'Shoes come off before the prayer hall.',
			'Avoid the hour around Friday midday prayer unless you are attending.',
			'Ask before photographing people, and do not photograph anyone praying.',
		],
	},
	{
		slug: 'pedro-colina-hill',
		name: 'Pedro Colina Hill',
		alsoKnownAs: ['PC Hill'],
		kind: 'heritage',
		area: 'cotabato-city',
		municipality: 'Cotabato City',
		summary: 'The rock the city was built around, and the view over the Rio Grande delta.',
		detail: [
			'A limestone outcrop rising out of otherwise flat delta country, which is exactly why everyone who has held this city has fortified it — the Maguindanao sultanate before the Spanish, the Spanish after them, and the Philippine constabulary that gave it the name people still use.',
			'The climb is short. What you get at the top is the whole geography of the place at once: the Rio Grande de Mindanao winding out to Illana Bay, the city below, and the Maguindanao plain behind it.',
		],
		beforeYouGo: [
			'Parts of the hill are occupied by government and security installations; stay on the public approach.',
			'Best in the late afternoon, both for the light and the heat.',
		],
	},
	{
		slug: 'kutawato-caves',
		name: 'Kutawato Caves',
		kind: 'nature',
		area: 'cotabato-city',
		municipality: 'Cotabato City',
		summary: 'A cave system running under Pedro Colina Hill, and the origin of the city’s name.',
		detail: [
			'"Kutawato" is kuta wato — stone fort — and the caves under the hill are the reason the name stuck. They run beneath the outcrop in the middle of a working city, which is a strange thing to stand in.',
			'The chambers have been used as shelter, as burial space and, in the twentieth century, during wartime. Development around the hill has affected access over the years and the state of the entrances varies.',
		],
		beforeYouGo: [
			'Ask locally about current access before making the trip; it has opened and closed repeatedly.',
			'Take a guide and a torch. This is not a lit tourist cave.',
		],
	},
	{
		slug: 'tamontaka-church',
		name: 'Tamontaka Church',
		kind: 'heritage',
		area: 'cotabato-city',
		municipality: 'Cotabato City',
		summary: 'A nineteenth-century Jesuit mission church, and one of the oldest in Mindanao.',
		detail: [
			'Built for a mission settlement on the Tamontaka river in the 1870s, and a reminder that Cotabato has been a meeting point rather than a monoculture for a very long time. The Christian community here predates the American period.',
			'It is modest architecture and the interest is historical rather than visual, but it sits well against the Grand Mosque a few kilometers away as a way of reading what this city actually is.',
		],
		beforeYouGo: ['A working parish. Around Mass times, attend or come back later.'],
	},

	/* ---- Tawi-Tawi -------------------------------------------------------- */
	{
		slug: 'bud-bongao',
		name: 'Bud Bongao',
		alsoKnownAs: ['Bongao Peak'],
		kind: 'sacred',
		area: 'tawi-tawi',
		municipality: 'Bongao',
		summary: 'A 314-meter peak above the capital, climbed as a pilgrimage and for the view.',
		signature: true,
		detail: [
			'The mountain over Bongao is the province’s landmark and its most important site at once. Near the summit are graves held sacred by local Muslims, and people climb to visit them, to pray and to make vows — so the path carries pilgrims and sightseers on the same steps.',
			'The climb takes roughly an hour to an hour and a half on a stepped and rooted trail through forest. Long-tailed macaques live on the mountain and gather along the route; climbers traditionally bring bananas for them.',
			'The summit gives the whole archipelago — Sanga-Sanga, the reefs, and on a clear day the outer islands running south towards Borneo. It is the single best hour in BARMM.',
		],
		beforeYouGo: [
			'This is a sacred site before it is a viewpoint. Dress modestly, keep your voice down near the graves, and follow what the people around you are doing.',
			'Bring bananas for the macaques, and do not carry food loose or in an open bag — they will take it.',
			'Start early. The trail is steep and unshaded in places and the heat builds fast.',
			'Guides are available at the trailhead and are worth taking, both for the route and for what they can tell you about the site.',
		],
	},
	{
		slug: 'panampangan-island',
		name: 'Panampangan Island',
		kind: 'coast',
		area: 'tawi-tawi',
		municipality: 'Sapa-Sapa',
		summary: 'A sandbar that runs for kilometers at low tide, and the clearest water in the region.',
		signature: true,
		detail: [
			'Panampangan is a small island off Sapa-Sapa with a sandbar that, when the tide is out, extends into a strip of white sand running well over 3 kilometers out to sea. It is regularly described as the longest sandbar in the Philippines. Walking out along it, with water on both sides and no land ahead, is the reason people make the journey to Tawi-Tawi.',
			'The water is exceptionally clear and the reef around the island is in good condition by national standards. Bring your own snorkel gear; nothing is rented here.',
			'There is no resort. Day trips are the norm, and camping is possible by arrangement with the barangay.',
		],
		beforeYouGo: [
			'The sandbar exists at low tide. Check the tide table before you charter a boat, or you will arrive at open water.',
			'Reached by boat from Bongao — a substantial crossing, chartered rather than scheduled. Arrange through the provincial tourism office or a Bongao operator.',
			'Bring water, food, shade and everything else. There are no facilities.',
			'Take your rubbish back with you; there is no collection.',
		],
	},
	{
		slug: 'sheik-makhdum-mosque',
		name: 'Sheik Karim al-Makhdum Mosque',
		alsoKnownAs: ['Tubig Indangan Mosque'],
		kind: 'sacred',
		area: 'tawi-tawi',
		municipality: 'Simunul',
		summary: 'The site of the first mosque in the Philippines, founded in 1380.',
		signature: true,
		detail: [
			'Sheik Karim al-Makhdum, an Arab missionary, reached Simunul in 1380 and built a mosque at Tubig Indangan. That is the beginning of Islam in the Philippines as a settled presence — roughly 140 years before Magellan landed at Cebu, and the fact that reorders most visitors’ sense of the country’s history.',
			'The building has been replaced over the centuries, but four of the original hardwood pillars survive and stand inside the present structure. Standing next to them is the whole visit. The site is a National Historical Landmark and the Sheik’s tomb is nearby.',
		],
		beforeYouGo: [
			'Simunul is reached by boat from Bongao; there is no other way.',
			'A working mosque and a pilgrimage site. Cover up, remove shoes, and ask before photographing the pillars or the tomb.',
			'Coordinate through the municipality or the provincial tourism office rather than turning up.',
		],
	},
	{
		slug: 'sitangkai',
		name: 'Sitangkai',
		alsoKnownAs: ['The Venice of the South'],
		kind: 'coast',
		area: 'tawi-tawi',
		municipality: 'Sitangkai',
		summary: 'A town built over open water, where the streets are boardwalks and boats.',
		detail: [
			'Sitangkai is the southernmost town in the Philippines and it is built on stilts over the shallows, with plank walkways instead of roads and boats instead of tricycles. It is a Sama Dilaut town, and the relationship with the sea here is not scenic — it is the entire structure of daily life.',
			'Seaweed is the economy. The racks, the drying lines and the sorting go on everywhere, and the smell and the rhythm of it is the town.',
			'It is a long way from anywhere and the journey is a large part of what you are signing up for.',
		],
		beforeYouGo: [
			'Reached by boat from Bongao via Sibutu; count on the better part of a day each way.',
			'People live here and their houses are what you would be photographing. Ask, every time.',
			'Coordinate with the municipality. Arriving unannounced in a small town at the end of the country reads badly.',
		],
	},
	{
		slug: 'turtle-islands',
		name: 'Turtle Islands',
		kind: 'nature',
		area: 'tawi-tawi',
		municipality: 'Turtle Islands',
		summary: 'Green sea turtle nesting beaches, protected jointly with Malaysia.',
		detail: [
			'A cluster of islands west of Tawi-Tawi proper that form one of the most significant green sea turtle nesting grounds in Southeast Asia. Baguan is the main sanctuary island, and the whole group is managed as a transboundary protected area shared with Malaysia — the only arrangement of its kind in the region.',
			'Nesting happens year-round with seasonal peaks, and seeing it is a matter of being on the right beach at night with the people who are permitted to be there.',
		],
		beforeYouGo: [
			'This is a protected area, not an attraction. Access requires clearance and is arranged through the protected-area management and the municipality — not on arrival.',
			'The crossing is long and weather-dependent.',
			'No lights, no flash, no handling. The rules exist because the turtles abandon nesting attempts.',
		],
	},

	/* ---- Lanao del Sur ---------------------------------------------------- */
	{
		slug: 'lake-lanao',
		name: 'Lake Lanao',
		kind: 'nature',
		area: 'lanao-del-sur',
		municipality: 'Marawi',
		summary:
			'The second-largest lake in the country, and one of a handful of ancient lakes in the world.',
		signature: true,
		detail: [
			'Lake Lanao fills a highland basin at around 700 meters and covers some 340 square kilometers. It is old — old enough that its fish evolved into species found nowhere else, which is the technical sense in which it is called an ancient lake, and several of those species are now in serious trouble.',
			'It drains through the Agus River to Maria Cristina Falls at Iligan, which is why a lake in Lanao del Sur has historically supplied a large share of Mindanao’s electricity. The lake level and the power system are politically entangled and locally contentious.',
			'For a visitor, the lake is a circuit rather than a viewpoint: the road runs around the shore through Marantao, Tugaya, Bacolod-Kalawi, Ganassi and Binidayan, and the towns are the reason to drive it. Late afternoon light over the water from the western shore is the shot everyone comes back with.',
		],
		beforeYouGo: [
			'A hired vehicle with a local driver is the practical way to do the circuit. Public transport works but eats the day.',
			'It is genuinely cool at altitude, especially after dark. Bring a layer.',
			'Ask locally about current conditions on the southern shore before committing to the full loop.',
		],
	},
	{
		slug: 'aga-khan-museum',
		name: 'Aga Khan Museum of Islamic Arts',
		kind: 'heritage',
		area: 'lanao-del-sur',
		municipality: 'Marawi',
		summary:
			'The best collection of Maranao and Mindanao material anywhere, on the MSU campus.',
		detail: [
			'Inside Mindanao State University in Marawi, and the single most rewarding indoor hour in BARMM. The collection covers Maranao brass and okir carving, kulintang instruments, textiles, weaponry and torogan architectural elements — panolong beam ends carved into the winged forms that are the signature of the tradition.',
			'It is a university museum rather than a national one, which means the labeling can be uneven and the presentation is plain. The objects carry it.',
		],
		beforeYouGo: [
			'On a university campus; entry is through MSU. Confirm it is open before traveling, as hours have varied.',
			'Photography rules vary by gallery — ask at the desk.',
		],
	},
	{
		slug: 'tugaya',
		name: 'Tugaya',
		kind: 'craft',
		area: 'lanao-del-sur',
		municipality: 'Tugaya',
		summary: 'The brass and craft town of the Maranao, on the western shore of the lake.',
		detail: [
			'Tugaya is where Maranao brass is made — kulintang gong sets, gadur vessels, betel boxes, and the cast and engraved work that carries okir ornament. It is a working craft town rather than a market: the casting, the engraving and the finishing happen in the houses and workshops along the road.',
			'Woodcarving and weaving are here too, and the town is the practical answer to the question of where the objects in the Aga Khan Museum come from.',
			'Buying directly from a workshop is normal and is the point of coming. Brass is heavy — plan for that before you fall in love with a gadur.',
		],
		beforeYouGo: [
			'Ask before photographing inside a workshop; it is someone’s livelihood and their technique.',
			'Prices are negotiated. Bring cash — nothing here takes a card.',
			'Combine it with the lake circuit rather than making it a separate trip.',
		],
	},
	{
		slug: 'kawayan-torogan',
		name: 'Kawayan Torogan',
		kind: 'heritage',
		area: 'lanao-del-sur',
		municipality: 'Marantao',
		summary: 'A declared National Cultural Treasure, and the last torogan of its kind.',
		detail: [
			'The torogan is the Maranao royal house: a raised timber hall on massive posts, with the panolong — the carved beam ends that project from the facade like wings — as its defining feature. It was a datu’s residence and the seat of his authority, and very few survive.',
			'The Kawayan Torogan at Marantao, built for Sultan sa Kawayan, is a declared National Cultural Treasure and the most intact example left. Its condition has been a long-running concern and restoration has been intermittent.',
			'Seeing one standing, rather than a panolong in a museum case, changes how the ornament reads. The carving is architecture, not decoration.',
		],
		beforeYouGo: [
			'Privately connected to the family that holds it. Arrange a visit locally rather than turning up.',
			'Condition varies and parts may not be enterable.',
		],
	},
	{
		slug: 'marawi-ground-zero',
		name: 'Marawi’s Most Affected Area',
		alsoKnownAs: ['Ground Zero'],
		kind: 'memory',
		area: 'lanao-del-sur',
		municipality: 'Marawi',
		summary: 'The city center destroyed in the 2017 siege, and the slow work of rebuilding it.',
		detail: [
			'For five months in 2017 the center of Marawi was fought over street by street, and at the end of it the commercial and residential core of the city was rubble. Around 200,000 people were displaced. The area is officially the Most Affected Area and universally called Ground Zero.',
			'Rebuilding has been slow, contested, and is still incomplete. Some residents have returned, many have not, and the question of compensation remains live. Mosques stand roofless in the middle of it.',
			'Visitors do come, and people here will generally talk about what happened. But the distinction between witnessing and sightseeing matters enormously in a place where the person you are talking to lost their house, and possibly more.',
		],
		beforeYouGo: [
			'Go with a local contact. This is not a place to wander into alone with a camera.',
			'Ask before photographing anything, and accept no as an answer.',
			'Sections remain restricted or unsafe. Follow what you are told on the ground.',
			'If you buy nothing else on your trip, buy your lunch here.',
		],
	},

	/* ---- Maguindanao del Norte -------------------------------------------- */
	{
		slug: 'upi-uplands',
		name: 'The Upi uplands',
		kind: 'nature',
		area: 'maguindanao-del-norte',
		municipality: 'Upi',
		summary: 'Cool highland country, and the heartland of the Teduray.',
		detail: [
			'The road climbs out of the coastal plain into Upi and South Upi and the temperature drops with it. This is Teduray country — one of the region’s indigenous non-Muslim peoples — and the landscape of rolling upland farms is unlike anywhere else in the province.',
			'The Meguyaya Festival is the moment the culture is most visible: Teduray dress, music, and the agricultural thanksgiving the festival is built around.',
			'It is also simply a good drive, with views back down over the plain towards Cotabato City.',
		],
		beforeYouGo: [
			'The last stretches are rough after heavy rain; a high-clearance vehicle helps.',
			'Cooler than the coast, especially in the early morning.',
		],
	},
	{
		slug: 'illana-bay-coast',
		name: 'The Illana Bay coast',
		kind: 'coast',
		area: 'maguindanao-del-norte',
		municipality: 'Parang',
		summary: 'Beaches, small islands and the region’s deepwater port, north-west of the city.',
		detail: [
			'Parang faces Illana Bay and is the closest stretch of proper coast to Cotabato City — beaches, offshore islets, and the fishing economy that goes with them. Polloc port here is the region’s deepwater harbour and the site of its freeport, so the working coast and the swimming coast sit side by side.',
			'Bongo Island lies off the mouth of the bay and is reachable by boat from the mainland.',
			'This is where people from the city go at the weekend, which is the most honest recommendation available.',
		],
		beforeYouGo: [
			'Facilities are basic and vary by beach. Bring what you need.',
			'Boats to the islands are arranged at the shore and negotiated.',
			'Swimwear norms here are local norms — most people swim covered.',
		],
	},

	/* ---- Maguindanao del Sur ---------------------------------------------- */
	{
		slug: 'masjid-dimaukom',
		name: 'Masjid Dimaukom',
		alsoKnownAs: ['The Pink Mosque'],
		kind: 'sacred',
		area: 'maguindanao-del-sur',
		municipality: 'Datu Saudi-Ampatuan',
		summary: 'A mosque painted entirely pink, built by Muslim and Christian hands together.',
		signature: true,
		detail: [
			'It is exactly as photographed: a mosque, domes and minarets and walls, in an unbroken pink. It was built at the initiative of the town’s then-mayor, and the story attached to it — that the color stands for peace and love, and that Muslim and Christian workers built it side by side in a province better known for the opposite — is the reason it traveled beyond the region.',
			'The temptation is to treat it as a photo stop, and most visitors do. It is worth staying long enough to notice that it is an ordinary working mosque in an ordinary Maguindanaon town, which is rather the point being made.',
		],
		beforeYouGo: [
			'A working mosque: cover up, shoes off inside, and a scarf for women in the prayer hall.',
			'Reached from Cotabato City by van via Datu Piang; ask locally about the road and the current situation before setting out.',
			'Do not treat the interior as a photo set. Ask.',
		],
	},
	{
		slug: 'ligawasan-marsh',
		name: 'Ligawasan Marsh',
		alsoKnownAs: ['Liguasan Marsh'],
		kind: 'nature',
		area: 'maguindanao-del-sur',
		municipality: 'Datu Piang',
		summary: 'One of the largest wetlands in the country — channels, floating vegetation, birds.',
		detail: [
			'The marsh spreads across the Maguindanao lowlands where the Rio Grande de Mindanao slows and spreads, and it is enormous — a shifting system of open water, channels and floating mats that changes shape between wet and dry season. It is one of the country’s most important wetlands for birds, and a fishery that a great many families live from.',
			'It also sits on substantial natural gas reserves, which has made it a subject of regional politics for decades and is part of why it has never been developed for visitors.',
			'Seeing it means getting in a boat with someone who knows the channels. There is no other version of this trip.',
		],
		beforeYouGo: [
			'A boat and a local guide, arranged in the barangay. Nothing is scheduled or ticketed.',
			'Fuller and more navigable in the wet season; easier to reach by road in the dry.',
			'This area needs current local advice before you travel. Ask, and take the answer seriously.',
			'Early morning for birds, as everywhere.',
		],
	},

	/* ---- Basilan ---------------------------------------------------------- */
	{
		slug: 'lamitan',
		name: 'Lamitan City',
		kind: 'city',
		area: 'basilan',
		municipality: 'Lamitan',
		summary: 'Basilan’s BARMM capital, and the center of Yakan life.',
		signature: true,
		detail: [
			'Lamitan is the most approachable part of Basilan and the place a first visit is built around. It is the provincial capital for BARMM purposes, it has the market where Yakan weaving is actually sold, and it holds the Lami-Lamihan Festival in June — the week when Yakan dress, weaving, music and horsemanship are all on display at once.',
			'The Datu Kalun shrine in town commemorates the leader who founded the settlement, and the market is the working heart of the place.',
			'Yakan textile is the thing to buy and to understand: dense geometric weaving in tight color, structurally unlike the ikat and the malong found elsewhere in the region.',
		],
		beforeYouGo: [
			'Reached by ferry from Zamboanga City.',
			'Coordinate through the city tourism office; this is normal practice on Basilan rather than an unusual precaution.',
			'June for the festival, if the timing works.',
		],
	},
	{
		slug: 'bulingan-falls',
		name: 'Bulingan Falls',
		kind: 'nature',
		area: 'basilan',
		municipality: 'Lamitan',
		summary: 'A short drive out of Lamitan, and the island’s best-known waterfall.',
		detail: [
			'A broad curtain falling into a pool in forest outside Lamitan, and the standard day trip from the city. It is a local swimming spot as much as an attraction, busiest at weekends.',
			'The setting — rubber and forest on a green volcanic island — is as much the experience as the falls themselves.',
		],
		beforeYouGo: [
			'Go with a local contact or through the tourism office rather than making your own way.',
			'Fuller and more dramatic in the wet months; the pool is better for swimming when it is not.',
		],
	},
	{
		slug: 'malamawi-island',
		name: 'Malamawi Island',
		kind: 'coast',
		area: 'basilan',
		municipality: 'Isabela City (Region IX) — crossed to from Basilan',
		summary: 'A white-sand beach a short boat ride off Isabela.',
		detail: [
			'Malamawi lies across a narrow channel from Isabela and carries the island’s best-known beach — white sand, shallow water, and close enough that the crossing is a few minutes rather than an expedition.',
			'It is the standard weekend outing for Basilan and Zamboanga residents, which means it is busy on Sundays and quiet the rest of the week.',
		],
		beforeYouGo: [
			'The crossing is by pump boat from Isabela City, which is administratively in Region IX rather than BARMM — the island is listed here because a traveler on Basilan will be told to go, and the boundary is invisible on the ground.',
			'Facilities are basic. Bring water and food.',
			'Most people swim covered here.',
		],
	},
]

/** Places in one area, signature entries first. */
export const placesInArea = (areaSlug: string): Place[] =>
	places
		.filter((place) => place.area === areaSlug)
		.sort((a, b) => Number(Boolean(b.signature)) - Number(Boolean(a.signature)))

export const findPlace = (slug: string): Place | undefined =>
	places.find((place) => place.slug === slug)

/** The one-per-area headline entries, for a landing page. */
export const signaturePlaces = (): Place[] => places.filter((place) => place.signature)

export const PLACE_KIND_LABEL: Record<PlaceKind, string> = {
	sacred: 'Sacred site',
	nature: 'Landscape',
	coast: 'Coast and islands',
	heritage: 'Heritage',
	craft: 'Craft',
	city: 'Town',
	memory: 'Recent history',
}
