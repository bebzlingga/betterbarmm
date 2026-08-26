/* ============================================================
   Local government in the Bangsamoro

   The question this answers is the one people actually arrive with:
   who runs my town, and who did I vote for. It is a different question
   from "who is in Parliament", and the two get confused constantly,
   because BARMM elects a regional parliament while every province,
   city, municipality and barangay inside it keeps electing its own
   officials on the national local-election cycle. Same voters, two
   different ballots, different years.

   So this file carries three things: the ladder of units and what is
   elected at each rung, the units BARMM currently contains, and where
   a reader can look their own officials up today. The last part
   matters — the named directory is a workspace we have not built, and
   the honest thing is to say so and point at the offices that already
   publish it rather than leave a dead end.
   ============================================================ */

export type LguRung = {
	level: string
	/** What the unit is, in one line. */
	what: string
	/** Who the voters elect at this rung. */
	elects: string[]
	note: string
}

/**
 * The four rungs, largest first.
 *
 * The region sits at the top and is deliberately marked as *not* a local
 * government unit: BARMM is an autonomous regional government, and its Chief
 * Minister is chosen by Parliament rather than elected directly. Leaving it out
 * would be tidier and would also be the exact confusion this page exists to
 * clear up.
 */
export const lguLadder: LguRung[] = [
	{
		level: 'The region',
		what: 'BARMM — an autonomous regional government, not a local government unit.',
		elects: ['Members of Parliament (80 seats)'],
		note: 'Voters elect the Bangsamoro Parliament; the Parliament then chooses the Chief Minister from among its own members. Nobody votes for a Chief Minister directly. The first regular election for these seats is September 14, 2026.',
	},
	{
		level: 'The province',
		what: 'Basilan, Lanao del Sur, Maguindanao del Norte, Maguindanao del Sur, Tawi-Tawi — plus the Special Geographic Area.',
		elects: ['Governor', 'Vice-Governor', 'Sangguniang Panlalawigan members'],
		note: 'The provincial board is the Sangguniang Panlalawigan. Its members are elected by district, which is why a province with more districts sends more board members.',
	},
	{
		level: 'The city or municipality',
		what: 'The town or city hall — 3 component cities and 105 municipalities across the region, Sulu excluded.',
		elects: ['Mayor', 'Vice-Mayor', 'Sangguniang Panlungsod or Sangguniang Bayan members'],
		note: 'This is the rung most public services are actually delivered from, and the one most people mean when they say “the LGU”.',
	},
	{
		level: 'The barangay',
		what: 'The basic political unit — 2,180 of them across the units in this directory.',
		elects: [
			'Punong Barangay',
			'7 Sangguniang Barangay members',
			'SK Chairperson and 7 SK members',
		],
		note: 'Barangay and Sangguniang Kabataan officials are elected together, on their own schedule, separate from both the national midterms and the Bangsamoro parliamentary election.',
	},
]

export type LguArea = {
	name: string
	/** Single-member district seats in the Bangsamoro Parliament. */
	seats: number
	/** 2024 POPCEN population, as PSA reports it. */
	population: string
	kind: 'Province' | 'City' | 'Special area'
	note: string
}

/**
 * What BARMM currently contains, and how much of Parliament each part elects.
 *
 * Seat counts come from the project's own election dataset; populations are
 * PSA's 2024 POPCEN figures as reported in its BARMM highlights. Sulu is absent
 * for the reason given in `lguCounts` below.
 */
export const lguAreas: LguArea[] = [
	{
		name: 'Lanao del Sur',
		seats: 9,
		population: '1.37 million',
		kind: 'Province',
		note: 'The largest population in the region, and the largest block of district seats. Marawi is its capital.',
	},
	{
		name: 'Maguindanao del Norte',
		seats: 5,
		population: '1.12 million',
		kind: 'Province',
		note: 'Created when Maguindanao was divided in two, ratified by plebiscite in 2022. Twelve municipalities.',
	},
	{
		name: 'Maguindanao del Sur',
		seats: 5,
		population: '813,000',
		kind: 'Province',
		note: 'The southern half of the former Maguindanao, along the upper Pulangi valley.',
	},
	{
		name: 'Basilan',
		seats: 4,
		population: '542,000',
		kind: 'Province',
		note: 'Excluding the City of Isabela, which is in BARMM’s geography but not under its jurisdiction. Lamitan is the provincial capital.',
	},
	{
		name: 'Tawi-Tawi',
		seats: 4,
		population: '483,000',
		kind: 'Province',
		note: 'The southernmost province in the country, and the most maritime — its municipalities are islands.',
	},
	{
		name: 'Cotabato City',
		seats: 3,
		population: '383,383',
		kind: 'City',
		note: 'The largest single population of any city or municipality in the region. It voted to join BARMM in the 2019 plebiscite and is the seat of the Bangsamoro Government, though it sits geographically within Maguindanao.',
	},
	{
		name: 'Special Geographic Area',
		seats: 2,
		population: '215,000',
		kind: 'Special area',
		note: 'The 63 barangays of North Cotabato that voted to join BARMM in 2019, since constituted into 8 new municipalities.',
	},
]

/**
 * Region-wide totals, with the caveat that makes them readable.
 *
 * PSA counts Sulu inside BARMM: its 2024 census composition predates the
 * Supreme Court decision taking effect, and the statistical series has not been
 * restated. A reader who looks up "how many municipalities in BARMM" will find
 * conflicting numbers everywhere for exactly this reason, so the page says which
 * number counts what rather than picking one and hoping.
 */
export const lguCounts = {
	population: '5,691,583',
	populationAsOf: 'July 1, 2024',
	municipalities: 124,
	componentCities: 3,
	barangays: 2595,
	sulnote:
		'These totals are BARMM without Sulu — 108 units rather than the 127 PSA counts, because PSA’s 2024 census composition still includes Sulu and the Supreme Court has since excluded it. A figure you find elsewhere for “BARMM” will usually be the larger one. Population here is summed from the municipalities in this directory, so it excludes Sulu and the Special Geographic Area, whose 8 new municipalities have no census figures of their own yet.',
}

export type LguLookup = {
	office: string
	what: string
	href: string
}

/**
 * Where to find a named official today.
 *
 * The Local Government workspace — a directory down to barangay level — is
 * planned and not built. Until it is, this is the honest answer: the offices
 * that already hold the record.
 */
export const lguLookups: LguLookup[] = [
	{
		office: 'Ministry of the Interior and Local Government',
		what: 'The BARMM ministry that supervises local government units in the region — the first place to ask about a province, city, municipality or barangay inside BARMM.',
		href: 'https://milg.bangsamoro.gov.ph/',
	},
	{
		office: 'COMELEC',
		what: 'Official candidate lists and election results, including barangay and Sangguniang Kabataan elections. The record of who was actually elected.',
		href: 'https://comelec.gov.ph/',
	},
	{
		office: 'PSA — Philippine Standard Geographic Code',
		what: 'The authoritative list of every province, city, municipality and barangay in the country, with the codes that identify them.',
		href: 'https://psa.gov.ph/classification/psgc',
	},
	{
		office: 'Bangsamoro Official Gazette',
		what: 'Where Bangsamoro Autonomy Acts are published, including the Local Governance Code and any law creating or reorganising a local unit.',
		href: 'https://officialgazette.bangsamoro.gov.ph/',
	},
]

export const lguReferences = {
	localGovernanceCode: {
		label: 'Bangsamoro Autonomy Act No. 49 — Bangsamoro Local Governance Code',
		enacted: 'September 28, 2023',
		href: 'https://legislation.betterbarmm.com',
	},
	nationalCode: {
		label: 'Republic Act 7160 — Local Government Code of 1991',
		href: 'https://www.officialgazette.gov.ph/1991/10/10/republic-act-no-7160/',
	},
	psaHighlights: {
		label: 'PSA — BARMM population, 2024 census highlights',
		href: 'https://psa.gov.ph/content/highlights-bangsamoro-autonomous-region-muslim-mindanao-barmm-population-2024-census',
	},
	psaNewMunicipalities: {
		label: 'PSA — Eight new municipalities in BARMM',
		href: 'https://psa.gov.ph/content/eight-new-municipalities-bangsamoro-autonomous-region-muslim-mindanao',
	},
}
