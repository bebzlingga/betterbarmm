/* ============================================================
   Routes that actually work

   The question this answers is the one a guide organized by area
   cannot: given a week, where do you go?

   Each of these is built from the transport that exists rather than
   from what would be nice. The reason there is no single itinerary
   covering the whole region is that no such trip is sensible —
   Tawi-Tawi and Lanao del Sur are reached through different cities
   on different islands, and stringing them together means three
   flights and two days of transit for the privilege. So they are
   separate trips, and saying so is more useful than pretending
   otherwise.

   Durations are days on the ground and exclude the flights in and
   out. Nothing here is booked, ticketed or guaranteed; a boat that
   does not run because the sea is up will rearrange any of them.
   ============================================================ */

export type ItineraryDay = {
	/** "Day 1", or "Days 3–4" where a stretch is one block. */
	label: string
	where: string
	what: string
}

export type Itinerary = {
	slug: string
	name: string
	/** The areas it covers, by slug. */
	areas: string[]
	nights: string
	base: string
	/** One line: who this trip is for. */
	forWhom: string
	days: ItineraryDay[]
	/** The thing most likely to go wrong, stated up front. */
	watchFor: string
}

export const itineraries: Itinerary[] = [
	{
		slug: 'tawi-tawi-week',
		name: 'The Tawi-Tawi week',
		areas: ['tawi-tawi'],
		nights: '5 to 6 nights',
		base: 'Bongao',
		forWhom:
			'The trip worth crossing the country for, and the one to take if you take only one. Island travel, a sacred mountain, and the oldest mosque in the Philippines.',
		days: [
			{
				label: 'Day 1',
				where: 'Bongao',
				what: 'Fly Zamboanga to Sanga-Sanga. Settle in, walk the town and the market, and call at the provincial tourism office to arrange the boats for the rest of the week — this is the errand the whole trip depends on.',
			},
			{
				label: 'Day 2',
				where: 'Bud Bongao',
				what: 'Climb early, before the heat. An hour and a half up through forest, macaques on the path, the graves near the summit, and the archipelago laid out below. Down by late morning; the afternoon is for recovering.',
			},
			{
				label: 'Day 3',
				where: 'Panampangan',
				what: 'A long boat day, timed to the low tide so the sandbar is there when you arrive. Bring everything — water, food, shade, snorkel. There is nothing on the island.',
			},
			{
				label: 'Day 4',
				where: 'Simunul',
				what: 'By boat to Tubig Indangan and the Sheik Karim al-Makhdum Mosque, where four pillars of the 1380 original still stand. The Sheik’s tomb is nearby. Half a day if the sea behaves.',
			},
			{
				label: 'Days 5–6',
				where: 'Sibutu and Sitangkai',
				what: 'The long haul south to the stilt town, staying over rather than turning round. Boardwalks for streets, boats for tricycles, and the seaweed economy running through all of it. Coordinate with the municipality first.',
			},
		],
		watchFor:
			'The sea, and only the sea. Boats here run on conditions rather than schedules, and the northeast monsoon from November to February will cancel days outright. Build two spare days into a six-day plan and treat any island day as provisional.',
	},
	{
		slug: 'cotabato-long-weekend',
		name: 'Cotabato City and around',
		areas: ['cotabato-city', 'maguindanao-del-norte'],
		nights: '3 nights',
		base: 'Cotabato City',
		forWhom:
			'The easiest introduction to the region, and the only one you can do with a confirmed hotel booking and no local contacts. Good food, real history, and a coast an hour away.',
		days: [
			{
				label: 'Day 1',
				where: 'Cotabato City',
				what: 'Land at Awang. Pastil for breakfast if you arrive early enough. The Grand Mosque in the late afternoon when the light is on it, then Pedro Colina Hill for the view over the delta at dusk.',
			},
			{
				label: 'Day 2',
				where: 'Cotabato City',
				what: 'The Bangsamoro Government Center and the old ARMM Regional Center, which read as two chapters of the same story. Tamontaka Church in the afternoon. Ask about the Kutawato caves — access varies.',
			},
			{
				label: 'Day 3',
				where: 'Parang and the Illana Bay coast',
				what: 'Out by van to the coast: beaches, the offshore islets, and Polloc port where the working coast and the swimming coast sit side by side. Back to the city for the evening.',
			},
			{
				label: 'Day 4',
				where: 'Upi',
				what: 'Uphill into the Teduray country before the flight out — cool air, upland farms, and views back down over the plain. Allow more time than the distance suggests.',
			},
		],
		watchFor:
			'Nothing dramatic. Checkpoints on the road out to Parang and Upi are routine; carry ID and do not be in a hurry. The Upi road is rough after sustained rain.',
	},
	{
		slug: 'lake-lanao-circuit',
		name: 'The Lake Lanao circuit',
		areas: ['lanao-del-sur'],
		nights: '3 to 4 nights',
		base: 'Marawi, or Iligan just outside the region',
		forWhom:
			'The strongest craft tradition in BARMM, the second-largest lake in the country, and a city being rebuilt. The trip that most rewards going with someone local.',
		days: [
			{
				label: 'Day 1',
				where: 'Iligan to Marawi',
				what: 'Fly into Laguindingan, overland through Iligan, and up. Arrive in daylight. It is genuinely cold at 700 meters after dark — the layer you did not pack is the one you will want.',
			},
			{
				label: 'Day 2',
				where: 'Marawi',
				what: 'The Aga Khan Museum at MSU for the Maranao collection — brass, kulintang, textiles, panolong beams. The Most Affected Area in the afternoon, with a local contact, and buy your lunch there.',
			},
			{
				label: 'Day 3',
				where: 'The western shore',
				what: 'A hired vehicle round the lake: Marantao for the Kawayan Torogan, Tugaya for the brass and the kulintang workshops. Buy from a workshop; carry cash. Late afternoon on the western shore is the light everyone remembers.',
			},
			{
				label: 'Day 4',
				where: 'The southern shore, or back',
				what: 'Continue the loop through Bacolod-Kalawi, Ganassi and Binidayan if current local advice is good, or turn back for Iligan. Ask on the ground the day before; this is not a decision to make from a distance.',
			},
		],
		watchFor:
			'The security picture here moves, and it moves by municipality. Marawi itself is visited, but arrange through local contacts, the city tourism office or MSU, and take advice about the southern shore the week you travel rather than the month before.',
	},
	{
		slug: 'basilan-from-zamboanga',
		name: 'Basilan from Zamboanga',
		areas: ['basilan'],
		nights: '1 to 2 nights, or a day trip',
		base: 'Lamitan, or Zamboanga outside the region',
		forWhom:
			'Yakan weaving, rubber country, and the island with the widest gap between what it is and what it is known for. Best timed to June and the Lami-Lamihan Festival.',
		days: [
			{
				label: 'Day 1',
				where: 'Zamboanga to Lamitan',
				what: 'Fast craft across in the morning. The Lamitan market for Yakan weaving — the seputangan cloth is the thing to look for — and the Datu Kalun shrine. Coordinate with the city tourism office before you go, which is normal practice here.',
			},
			{
				label: 'Day 2',
				where: 'Lamitan',
				what: 'Bulingan Falls out of town, and the rubber and coffee country around it. Back to Zamboanga in the afternoon, or stay over if you have arranged it.',
			},
		],
		watchFor:
			'Basilan carries standing foreign-government advisories and several countries advise against travel to parts of it. The Lamitan corridor is markedly calmer than the blanket framing suggests and Filipinos travel it routinely — but stay on the main road, go with local contacts, and do not improvise into the interior municipalities.',
	},
]

export const findItinerary = (slug: string): Itinerary | undefined =>
	itineraries.find((route) => route.slug === slug)

export const itinerariesForArea = (areaSlug: string): Itinerary[] =>
	itineraries.filter((route) => route.areas.includes(areaSlug))
