/* ============================================================
   Planning a trip

   The part of a guide that earns its keep. Everything here is the
   answer to a question a first-time visitor to the Bangsamoro
   actually asks, and several of them are questions nobody publishes
   a straight answer to.

   The security section is written on one principle: the situation in
   this region varies more between its own areas than most countries
   vary internally, so any statement that averages across BARMM is
   false in both directions at once. It will frighten a traveler off
   Tawi-Tawi and it will send one blithely into an interior
   municipality of Maguindanao del Sur. So the general note here says
   only what is general, and the specifics live on each area.

   Nothing here is legal or safety advice, and the advisories change.
   Where a reader needs the current position, this points at who
   publishes it rather than paraphrasing it into staleness.
   ============================================================ */

export type PlanSection = {
	slug: string
	title: string
	/** One line, for a contents list. */
	lede: string
	body: string[]
	/** The short, scannable version. */
	points?: string[]
}

export const planSections: PlanSection[] = [
	{
		slug: 'getting-here',
		title: 'Getting to the region',
		lede: 'Three doors: Cotabato by air, Zamboanga for the islands, Iligan for the lake.',
		body: [
			'BARMM has no single gateway, and choosing the wrong one costs a day. The region is in three pieces geographically — the Maguindanao mainland, the Lanao highlands, and the Sulu archipelago — and each is reached differently.',
			'For the mainland and the seat of government, fly into Awang Airport, ticketed as Cotabato (CBO), which takes daily jets from Manila. It stands in Datu Odin Sinsuat, about 30 minutes from Cotabato City.',
			'For Tawi-Tawi and Basilan, everything goes through Zamboanga City. Bongao is a short hop from Zamboanga by air; Basilan is 1 to 2 hours by fast craft. Zamboanga itself connects to Manila, Cebu and Davao.',
			'For Lanao del Sur, fly to Laguindingan near Cagayan de Oro and travel overland through Iligan. Iligan to Marawi is about an hour and a half by van.',
			'Davao and General Santos are also practical starting points for the Maguindanao mainland by road, 3 to 5 hours on the highway.',
		],
		points: [
			'Awang (CBO) — Cotabato City and both Maguindanao provinces',
			'Zamboanga, then air or ferry — Tawi-Tawi and Basilan',
			'Laguindingan, then Iligan by road — Lanao del Sur',
			'Davao or General Santos by road — the Maguindanao mainland',
		],
	},
	{
		slug: 'safety',
		title: 'Security, honestly',
		lede: 'It varies enormously by area. Any single answer for the whole region is wrong.',
		body: [
			'Parts of BARMM carry standing travel advisories from foreign governments, and parts of it are visited routinely by Filipinos and foreigners without incident. The gap between Cotabato City on an ordinary Tuesday and an interior municipality of Maguindanao del Sur is not a matter of degree — they are different questions, and a guide that gives one answer for both is useless.',
			'What is broadly true: the region emerged from decades of conflict into a peace process, and the Bangsamoro government exists because of it. Military and police checkpoints on inter-town roads are routine and are not a signal that something is wrong. Kidnapping-for-ransom was a real and specific threat in the Sulu archipelago and Basilan, and while the groups behind it have been substantially degraded, the advisories written about them have not all been withdrawn.',
			'What is also true: clan disputes — rido — are a local phenomenon that outsiders read badly and can inadvertently walk into, particularly in the Maguindanao provinces. This is one of the reasons that arriving with a local contact matters here more than in most places.',
			'The practical protocol, which is what residents themselves do: know which municipality you are going to rather than which province; ask locally the week you travel rather than the month before; coordinate with the LGU or the tourism office, which is normal courtesy here and not an imposition; and do not improvise into interior municipalities.',
			'Read your own government’s current advisory before you book. They are updated, they are specific by area, and if you travel on institutional insurance the advisory may determine whether you are covered at all.',
		],
		points: [
			'Ask by municipality, not by province — the variation is that fine-grained',
			'Checkpoints are routine; carry ID and be unhurried',
			'Travel with a local contact outside the main towns',
			'Coordinate with the LGU or tourism office; it is expected',
			'Check your own government’s current advisory, which may affect insurance',
		],
	},
	{
		slug: 'etiquette',
		title: 'Manners in a Muslim region',
		lede: 'Modest dress, shoes off, right hand, ask before photographing.',
		body: [
			'BARMM is the only Muslim-majority region in the Philippines and the ordinary courtesies are Islamic ones. None of this is onerous and all of it is noticed.',
			'Dress covered. For men that means trousers rather than shorts in towns and always at a mosque. For women it means covered shoulders and knees, and a scarf carried for mosques and for conservative towns — you do not need to cover your hair on the street, but having the option in your bag will make several moments easier.',
			'At a mosque: shoes off, ask before entering, do not walk in front of someone praying, and stay out during the Friday midday congregational prayer unless you have been invited. Non-Muslims are generally welcome outside prayer times, and the welcome is warmer if you have asked.',
			'Use your right hand for eating, giving and receiving. The left is for other things and the distinction is real.',
			'Ask before photographing people, and take no as an answer, particularly with women and particularly at sacred sites. This is the single most common way visitors give offence.',
			'Public affection between couples reads badly. So does raising your voice. Greetings — assalamu alaikum, answered wa alaikum salam — go a long way and cost nothing.',
			'During Ramadan, do not eat, drink or smoke in public during daylight, even if you are not fasting.',
		],
		points: [
			'Cover shoulders and knees; carry a scarf',
			'Shoes off at mosques; ask before entering',
			'Right hand for eating and giving',
			'Ask before every photograph of a person',
			'No public eating or drinking in daylight during Ramadan',
		],
	},
	{
		slug: 'when-to-go',
		title: 'When to go',
		lede: 'Largely outside the typhoon belt. March to May for the islands, December to April inland.',
		body: [
			'Mindanao sits mostly below the typhoon track, which makes BARMM one of the more weather-reliable parts of the Philippines. That does not mean dry — the southwest monsoon brings sustained rain from roughly June to October, and it affects road conditions more than it affects whether you can travel.',
			'For the Sulu archipelago — Tawi-Tawi and Basilan — the calmest seas are roughly March to early June. The northeast monsoon from November to February makes small-boat crossings rough and can cancel island trips outright, which matters because the islands are the reason to go.',
			'For the mainland and the Lanao highlands, December to April is drier and clearer, and in Lanao it is also cold at night in a way visitors do not expect.',
			'Two calendar items override the weather. Ramadan shifts about 11 days earlier each year against the Gregorian calendar, and it changes the rhythm of everything — daytime eating, opening hours, the mood of a town. It is a fascinating time to visit and a difficult one to travel efficiently in. Eid al-Fitr and Eid al-Adha are regional holidays; transport fills and rooms disappear.',
		],
		points: [
			'March–early June: best for Tawi-Tawi and the islands',
			'December–April: driest for the mainland and Lanao',
			'June–October: southwest monsoon, rain and rough roads',
			'Ramadan and the two Eids move each year — check before booking',
		],
	},
	{
		slug: 'money',
		title: 'Money and connectivity',
		lede: 'Bring cash. Outside Cotabato City and Bongao, assume no ATM and no card.',
		body: [
			'Cotabato City has banks, ATMs and card acceptance at hotels and larger establishments. Bongao has ATMs. Almost everywhere else, assume neither.',
			'The working rule is to draw cash in Cotabato City, Zamboanga or Iligan before you head anywhere else, and to carry more than you think you need in small denominations — a ₱1,000 note is hard to break in a barangay.',
			'Mobile money and e-wallets are used in the towns and are increasingly the way transfers happen, but they depend on signal and on a local account.',
			'Mobile signal is good in Cotabato City, adequate in the larger towns, patchy on the Lake Lanao circuit and absent on the outer islands of Tawi-Tawi. Tell someone your plan before you lose signal rather than after.',
			'Power interruptions are routine across the region. Carry a power bank and charge whenever you have the chance.',
		],
		points: [
			'Draw cash in Cotabato City, Zamboanga or Iligan',
			'Small denominations — a ₱1,000 note is hard to break',
			'ATMs: Cotabato City and Bongao; assume none elsewhere',
			'No signal on the outer islands; power cuts everywhere',
		],
	},
	{
		slug: 'language',
		title: 'Language',
		lede: 'A dozen languages, and English understood almost everywhere.',
		body: [
			'BARMM is genuinely multilingual. Maguindanaon on the mainland, Maranao around Lake Lanao, Tausug and Sinama across the archipelago, Yakan on Basilan, Iranun along the coast between them. Filipino works as a bridge in the towns, and English is widely understood — the education system runs on it and hospitality towards visitors is usually conducted in it.',
			'Learning the greeting is worth more than learning anything else. Assalamu alaikum — peace be upon you — is answered wa alaikum salam, and it opens almost every interaction here.',
			'Shukran for thank you is understood everywhere. Beyond that, people will meet you far more than halfway.',
		],
		points: [
			'Maguindanaon, Maranao, Tausug, Sinama, Yakan, Iranun',
			'Filipino and English widely understood',
			'Assalamu alaikum / wa alaikum salam — learn this one',
		],
	},
	{
		slug: 'permissions',
		title: 'Permissions and courtesy calls',
		lede: 'Telling the LGU you are coming is normal practice, not bureaucracy.',
		body: [
			'In much of BARMM, a visitor who contacts the municipal or provincial tourism office before arriving gets a better trip: current road and sea conditions, a guide who knows the site, and — in places where it matters — the fact that people know who you are and why you are there.',
			'Some visits require it outright. The Turtle Islands are a protected area and access is cleared rather than bought. Island charters in Tawi-Tawi are arranged rather than booked. Sacred sites are visited with someone who can tell you what you are looking at and what not to do.',
			'A courtesy call on the barangay captain before spending time in a small community is normal, brief and appreciated, and in some places it is what makes the difference between being a guest and being a stranger.',
		],
		points: [
			'Contact the provincial or municipal tourism office before you travel',
			'Turtle Islands access is cleared through protected-area management',
			'Island boats are chartered and arranged, not scheduled',
			'A courtesy call on the barangay captain is normal in small communities',
		],
	},
	{
		slug: 'health',
		title: 'Health and what to bring',
		lede: 'Hospitals in the cities only. Bring what you need with you.',
		body: [
			'Hospital capacity in the region is limited and unevenly distributed — Cotabato City has the most, the archipelago and the interior have very little. Anything serious means evacuation to Davao, Zamboanga, Iligan or Cagayan de Oro, which takes time. Travel insurance that covers medical evacuation is worth having and is worth checking against the advisories for the areas you intend to visit.',
			'Bring your own medication in sufficient quantity, including anything routine. Pharmacies in the towns cover the basics and nothing beyond.',
			'Mosquito-borne illness is present. Cover up at dusk and use repellent, particularly around the marsh and the lake.',
			'Drink bottled or treated water. Sun exposure on the sandbars and boats is severe and unshaded — a hat, long sleeves and reef-safe sunscreen, and more water than you planned to carry.',
		],
		points: [
			'Hospitals in the cities; evacuation is the plan for anything serious',
			'Bring your own medication',
			'Repellent, especially near the marsh and the lake',
			'Bottled water, hat, long sleeves — the boats and sandbars are unshaded',
		],
	},
]

export const findPlanSection = (slug: string): PlanSection | undefined =>
	planSections.find((section) => section.slug === slug)

/* ---- The calendar --------------------------------------------------------- */

export type Festival = {
	name: string
	/** The area slug it belongs to, or 'region' for a regional observance. */
	area: string
	when: string
	what: string
}

/**
 * What is on, and when.
 *
 * The Islamic observances carry no fixed date because they have none: the
 * Hijri calendar is lunar and moves about 11 days earlier each Gregorian year,
 * so a date printed here would be wrong within a year of being written. The
 * civil festivals have fixed dates and are given them.
 */
export const festivals: Festival[] = [
	{
		name: 'Shariff Kabunsuan Festival',
		area: 'cotabato-city',
		when: 'December',
		what: 'Marks the arrival of Shariff Muhammad Kabungsuwan, who brought Islam to the Maguindanao mainland. River pageantry on the Rio Grande, and the best week to see the city.',
	},
	{
		name: 'Lami-Lamihan Festival',
		area: 'basilan',
		when: 'June',
		what: 'Lamitan’s week of Yakan dress, weaving, music and horsemanship. The single best opportunity to see Yakan culture on display.',
	},
	{
		name: 'Kamahardikaan sin Tawi-Tawi',
		area: 'tawi-tawi',
		when: 'Late September',
		what: 'The province’s founding anniversary, with Sama and Tausug performance, boat events and craft.',
	},
	{
		name: 'Meguyaya Festival',
		area: 'maguindanao-del-norte',
		when: 'Around mid-year',
		what: 'Upi’s Teduray thanksgiving festival — one of the few places where an indigenous non-Muslim culture of the region is publicly celebrated.',
	},
	{
		name: 'Eid al-Fitr',
		area: 'region',
		when: 'Moves each year — end of Ramadan',
		what: 'The end of the fast, and the largest celebration in the calendar. A regional and national holiday. Transport fills and rooms disappear; the hospitality is extraordinary.',
	},
	{
		name: 'Eid al-Adha',
		area: 'region',
		when: 'Moves each year — the month of pilgrimage',
		what: 'The feast of sacrifice, marked across the region. A regional holiday.',
	},
	{
		name: 'Ramadan',
		area: 'region',
		when: 'Moves each year — shifts about 11 days earlier annually',
		what: 'A month of daylight fasting. Daytime eateries close, the rhythm of every town changes, and iftar at sundown is the most generous meal of the year.',
	},
]

export const festivalsForArea = (areaSlug: string): Festival[] =>
	festivals.filter((festival) => festival.area === areaSlug || festival.area === 'region')
