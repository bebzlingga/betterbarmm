/* ============================================================
   Where to sleep

   This is the section a travel guide is most tempted to invent, and
   the one a traveler is most damaged by when it is wrong. So it is
   built the other way round from the usual: it describes how lodging
   actually works in each area — what exists, how it is booked, what
   a room is like — rather than listing establishments with rates and
   phone numbers that would be stale within a season and were never
   verified to begin with.

   Two things are true of accommodation across most of BARMM and
   explain the shape of everything below:

   · The online travel agencies barely cover this region. Outside
     Cotabato City you will find few properties on the booking sites
     most travelers use, and their absence says nothing about
     whether a place exists or is any good. Booking is done by phone,
     by Facebook page, or through the tourism office.

   · Outside Cotabato City and Bongao, the lodging market is thin
     enough that arriving without a booking is a real risk during
     festivals, Ramadan and Eid, and whenever official delegations
     fill the few good rooms.

   No prices are given. Not because they are secret, but because a
   number written once and read a year later is worse than no number
   — and the ranges that would be honest are so wide as to be
   useless. Ask when you book; everyone will tell you.
   ============================================================ */

/** The kinds of place a traveler will actually find here. */
export type LodgingKind = 'hotel' | 'inn' | 'pension' | 'homestay' | 'guesthouse' | 'none'

export type AreaLodging = {
	/** Matches the travel area and the LGU directory slug. */
	area: string
	/** The town you would realiztically sleep in. */
	base: string
	/** What kinds of place exist, in rough order of how many there are. */
	kinds: LodgingKind[]
	/** Two or three paragraphs on the actual situation. */
	situation: string[]
	/** How a booking is really made here. */
	booking: string
	/** What a room is likely to be like, so expectations land correctly. */
	expect: string[]
	/** When the rooms fill up. */
	fillsUp: string
	/**
	 * Long-established places whose names a traveler will hear.
	 *
	 * Not recommendations and not a directory. See `NOTABLE_STAYS_CAVEAT`.
	 * Empty where this guide has no name it is confident enough to print —
	 * which is most of the region, and is itself the useful information.
	 */
	notableStays: NotableStay[]
}

/**
 * One lodging house, named.
 *
 * Deliberately thin. There is no rate, no phone number, no street address and
 * no star rating, because those are the four fields that go stale first and
 * that a guide has no business guessing at. What is here is what stays true:
 * the name, the town, what kind of place it is, and why it is worth knowing
 * about. Everything else is a phone call the traveler has to make anyway.
 */
export type NotableStay = {
	name: string
	/** The town, and nothing finer. */
	town: string
	kind: LodgingKind
	/** What sort of place it is and who tends to stay there. */
	note: string
}

export const areaLodging: AreaLodging[] = [
	{
		area: 'cotabato-city',
		base: 'Cotabato City',
		kinds: ['hotel', 'inn', 'pension'],
		situation: [
			'Cotabato City is the only place in BARMM with a genuine hotel market. Being the seat of the regional government means a steady flow of officials, contractors, aid workers and delegations, and the rooms exist because of them rather than because of tourism.',
			'The range runs from business hotels with air conditioning, hot water, generators and function rooms down through inns and pensions to very basic lodging near the terminals. The mid-range is the sweet spot and is where most visitors end up.',
			'This is also the one part of the region where the familiar booking sites carry a usable selection, so a traveler can arrive with a confirmed room and no local contact.',
		],
		booking: 'Online booking works here. Phoning ahead still gets a better rate and a better room.',
		expect: [
			'Air conditioning and hot water in the mid-range and above.',
			'A generator, which matters — power interruptions are routine.',
			'Wi-fi that exists and is slow.',
			'A prayer mat and the qibla direction marked in the room, in many places.',
		],
		notableStays: [
			{
				name: 'Estosan Garden Hotel',
				town: 'Cotabato City',
				kind: 'hotel',
				note: 'One of the city’s longest-running hotels, built around a garden. The mid-range standby for visiting delegations, and the name most often given when you ask a resident where to put someone up.',
			},
			{
				name: 'Em Manuel Suites',
				town: 'Cotabato City',
				kind: 'hotel',
				note: 'An established business hotel in the city, serving the government and contractor traffic the seat of the regional administration generates.',
			},
			{
				name: 'Al Nor Hotel and Convention Center',
				town: 'Cotabato City',
				kind: 'hotel',
				note: 'Rooms attached to function space, which is why it fills during Parliament sessions and regional events — and why it is worth calling early if one is on.',
			},
		],
		fillsUp:
			'Around Parliament sessions, the Shariff Kabunsuan Festival in December, and Eid. Book ahead for those.',
	},
	{
		area: 'tawi-tawi',
		base: 'Bongao',
		kinds: ['inn', 'pension', 'homestay', 'guesthouse'],
		situation: [
			'Bongao has a modest cluster of inns and pensions serving government travelers, traders and the occasional visitor, and they are adequate rather than comfortable. Air conditioning is common, hot water is not, and the electricity is not continuous everywhere.',
			'Outside Bongao there is essentially nothing commercial. Trips to Panampangan, Simunul, Sibutu and Sitangkai are either day trips out of Bongao or overnight stays arranged locally — with a family, in a barangay guesthouse, or camping with permission.',
			'That is not a hardship so much as the actual structure of travel here, and the homestay arrangements are frequently the best part of a trip to the province.',
		],
		booking:
			'By phone or Facebook page, or through the provincial tourism office, which is the single most useful contact in the province and will also arrange island trips.',
		expect: [
			'Fan or air conditioning; a cold-water bucket and dipper is normal.',
			'Power interruptions, and generators in the better places only.',
			'Mobile signal in Bongao, patchy to absent on the outer islands.',
			'Very little English signage, and a great deal of English spoken.',
		],
		notableStays: [
			{
				name: 'Beachside Inn',
				town: 'Bongao',
				kind: 'inn',
				note: 'A long-standing Bongao inn, and among the handful of names that come up whenever lodging in the province is discussed.',
			},
			{
				name: 'Rachel’s Place',
				town: 'Bongao',
				kind: 'pension',
				note: 'Another of Bongao’s established small lodgings, of the same modest kind. Between these and the provincial tourism office you have most of the town’s capacity.',
			},
		],
		fillsUp:
			'Kamahardikaan sin Tawi-Tawi in late September, Ramadan and Eid, and whenever a government delegation is in town — which is more often than you would think.',
	},
	{
		area: 'lanao-del-sur',
		base: 'Marawi City',
		kinds: ['hotel', 'inn', 'pension', 'homestay'],
		situation: [
			'Marawi’s lodging was badly damaged by the 2017 siege and the recovery has been partial. There are functioning inns and small hotels, and rooms connected to Mindanao State University, but the choice is narrow and quality is uneven.',
			'Many visitors to Lanao del Sur base themselves in Iligan City instead — outside BARMM, an hour and a half away, with a proper hotel market — and travel in for the day. That is a legitimate and common approach, and for a first visit it is the sensible one.',
			'Around the lake, accommodation is a matter of local arrangement rather than a market. Homestays exist through contacts; nothing is listed.',
		],
		booking:
			'Through local contacts, the city tourism office, or MSU. Online listings for Marawi are sparse and not always current.',
		expect: [
			'Cool nights — genuinely cool, at 700 meters. Blankets rather than air conditioning is the relevant amenity.',
			'Hot water in some places, not most.',
			'Power interruptions.',
			'Basic rooms, and hospitality that outruns the rooms by a distance.',
		],
		notableStays: [
			{
				name: 'Marawi Resort Hotel',
				town: 'Marawi',
				kind: 'hotel',
				note: 'Inside the Mindanao State University campus and the city’s best-known lodging, long predating the siege. The campus setting is also why it is the easiest place to arrange a visit through.',
			},
		],
		fillsUp: 'Ramadan and Eid, MSU graduation, and around commemorations of the siege.',
	},
	{
		area: 'maguindanao-del-norte',
		base: 'Cotabato City, or Parang for the coast',
		kinds: ['inn', 'pension', 'homestay'],
		situation: [
			'Most travelers sleep in Cotabato City and treat the whole province as day trips, which the geography supports — Awang, Parang, Upi and Sultan Kudarat are all within a comfortable day’s reach of the city.',
			'On the coast at Parang there are small beach places and inns of a simple kind, aimed at weekenders from the city rather than at travelers, and they are seasonal in practice if not in policy.',
			'In the Upi uplands, lodging is a matter of arrangement. There is no commercial market to speak of.',
		],
		booking: 'Phone or Facebook for the coastal places; local contacts and the LGU for the uplands.',
		expect: [
			'Simple rooms, with a fan or basic air conditioning.',
			'Beach lodging that is a cottage rather than a resort.',
			'Nothing bookable online outside the city.',
		],
		notableStays: [],
		fillsUp: 'Weekends and holidays on the Parang coast; Eid everywhere.',
	},
	{
		area: 'maguindanao-del-sur',
		base: 'Cotabato City, or Buluan and Datu Paglas from the south',
		kinds: ['inn', 'homestay', 'none'],
		situation: [
			'There is no visitor lodging market in most of this province. What exists is a handful of inns in the larger municipal centers serving traders and government travelers, and they are not places anyone would choose for their own sake.',
			'The practical pattern is to base in Cotabato City to the north or in Tacurong and Isulan to the south — both outside BARMM, both with hotels — and travel in for the day, which is what almost everyone does.',
			'Where an overnight is unavoidable, it should be arranged in advance through a local contact or the municipality rather than improvised.',
		],
		booking: 'Through local contacts and the LGU. Assume nothing is listed anywhere.',
		expect: [
			'Very basic where it exists at all.',
			'Power and water interruptions.',
			'That the arrangement matters more than the room.',
		],
		notableStays: [],
		fillsUp: 'Not applicable in the usual sense; availability is a question of who you know.',
	},
	{
		area: 'basilan',
		base: 'Lamitan City, or Isabela City',
		kinds: ['inn', 'pension', 'homestay'],
		situation: [
			'Basilan has small hotels and inns in Lamitan and in Isabela City — the latter administratively in Region IX but on the same island, and the usual arrival point. Both are modest and serve local business rather than tourism.',
			'Many visitors day-trip from Zamboanga City, which has a full hotel market and is an hour or two away by fast craft. For a short visit this is the standard approach and it removes the accommodation question entirely.',
			'Where an overnight on the island is planned, it is worth arranging through the city tourism office, who will also know what the current situation is on the roads you intend to use.',
		],
		booking: 'Phone, Facebook, or the city tourism office. Very little is listed online.',
		expect: [
			'Simple rooms, with air conditioning in the better ones.',
			'Power interruptions.',
			'A security presence around public buildings that is normal here and unremarkable.',
		],
		notableStays: [],
		fillsUp: 'Lami-Lamihan Festival in June, and Eid.',
	},
	{
		area: 'special-geographic-area',
		base: 'None — Cotabato City, Midsayap or Pikit',
		kinds: ['none'],
		situation: [
			'There is no visitor accommodation in the 8 new municipalities. They were constituted in 2024 and are still building civil administration; a lodging market is a long way down that list.',
			'Anyone with business here stays in Cotabato City, or in Midsayap or Pikit in North Cotabato, and travels in.',
		],
		booking: 'Not applicable. Arrange your stay outside the area, and your visit through the municipality.',
		expect: ['Nothing. Plan to sleep elsewhere.'],
		notableStays: [],
		fillsUp: 'Not applicable.',
	},
]

export const lodgingForArea = (areaSlug: string): AreaLodging | undefined =>
	areaLodging.find((entry) => entry.area === areaSlug)

export const LODGING_KIND_LABEL: Record<LodgingKind, string> = {
	hotel: 'Hotels',
	inn: 'Inns',
	pension: 'Pension houses',
	homestay: 'Homestays',
	guesthouse: 'Barangay guesthouses',
	none: 'No visitor lodging',
}

/**
 * The standing caveat, shown wherever lodging is.
 *
 * It is stated once as data rather than written into each page, so it cannot
 * drift out of sync between the area pages and the stays page — and so that
 * removing it is a deliberate act rather than an oversight.
 */
/**
 * The standing caveat on every named establishment.
 *
 * Stronger than the general lodging note, because naming a business is a
 * different act from describing a market: a traveler who books on the
 * strength of a name here and finds the place closed has been failed
 * specifically rather than generally.
 */
export const NOTABLE_STAYS_CAVEAT =
	'These are long-established names that recur whenever lodging in the area is discussed. None has been visited, verified or endorsed, none is paying to be here, and none of the usual details — rate, room, phone number, whether it is still trading — has been checked. Treat them as a starting point for a phone call, not as a booking.'

export const lodgingCaveat =
	'Nothing on this page has been verified on the ground, and no establishment is endorsed. Lodging in this region opens, closes and changes hands quickly, and the only reliable confirmation is a phone call before you travel. Where a trip depends on a bed being there, confirm it directly with the property or the area’s tourism office.'
