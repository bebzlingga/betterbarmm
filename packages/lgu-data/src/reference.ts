/* ============================================================
   What every unit has, by level

   The directory can say with confidence what offices exist in a
   municipality and what that municipality is responsible for, because
   both are set by law rather than by the town: the Local Government
   Code of 1991 creates the offices and devolves the services, and the
   Bangsamoro Local Governance Code governs how units inside BARMM
   operate.

   What the directory cannot say is who currently holds those offices.
   That is a live record we do not hold, and inventing it would be
   worse than leaving it blank — so the Officials tab lists the posts
   and hands the reader to the office that publishes the names.
   ============================================================ */

export type OfficePost = {
	title: string
	note: string
}

/**
 * The elected posts at each level.
 *
 * `sanggunian` counts vary: a municipality's council has 8 regular members, a
 * component city's 10, and a province's board is sized by district — so the
 * counts that are fixed are stated and the ones that are not are described.
 */
export const ELECTED_POSTS: Record<'province' | 'city' | 'municipality' | 'barangay', OfficePost[]> =
	{
		province: [
			{ title: 'Governor', note: 'Chief executive of the province.' },
			{
				title: 'Vice-Governor',
				note: 'Presides over the Sangguniang Panlalawigan, the provincial board.',
			},
			{
				title: 'Sangguniang Panlalawigan members',
				note: 'The provincial board. Members are elected by district, so a province with more districts seats more of them.',
			},
		],
		city: [
			{ title: 'City Mayor', note: 'Chief executive of the city.' },
			{ title: 'City Vice-Mayor', note: 'Presides over the Sangguniang Panlungsod.' },
			{
				title: 'Sangguniang Panlungsod members',
				note: 'The city council. A component city seats 10 regular members, plus the ex officio seats for the barangay and youth federation presidents.',
			},
		],
		municipality: [
			{ title: 'Municipal Mayor', note: 'Chief executive of the municipality.' },
			{ title: 'Municipal Vice-Mayor', note: 'Presides over the Sangguniang Bayan.' },
			{
				title: 'Sangguniang Bayan members',
				note: 'The municipal council — 8 regular members, plus the ex officio seats for the barangay and youth federation presidents.',
			},
		],
		barangay: [
			{ title: 'Punong Barangay', note: 'The barangay captain, and its chief executive.' },
			{
				title: '7 Sangguniang Barangay members',
				note: 'The barangay council, elected at large across the barangay.',
			},
			{
				title: 'SK Chairperson and 7 SK members',
				note: 'The Sangguniang Kabataan — the youth council, elected by and from residents aged 15 to 30.',
			},
		],
	}

/**
 * Appointed offices a municipality or city is required or permitted to have.
 *
 * Useful because these are the people a resident actually deals with — you take
 * a business permit to the treasurer, not to the mayor.
 */
export const APPOINTED_OFFICES: OfficePost[] = [
	{
		title: 'Treasurer',
		note: 'Collects taxes and fees, and keeps the unit’s funds. The office behind business permits and real property tax.',
	},
	{
		title: 'Assessor',
		note: 'Values land and buildings for real property tax, and keeps the tax map.',
	},
	{ title: 'Accountant', note: 'Keeps the books and certifies the availability of funds.' },
	{ title: 'Budget Officer', note: 'Prepares the annual budget the council enacts.' },
	{
		title: 'Planning and Development Coordinator',
		note: 'Prepares the comprehensive development plan and the land use plan.',
	},
	{ title: 'Engineer', note: 'Infrastructure, public works, and building permits.' },
	{ title: 'Health Officer', note: 'Runs the rural health unit or city health office.' },
	{
		title: 'Social Welfare and Development Officer',
		note: 'Assistance programmes, child and family services, disaster relief casework.',
	},
	{ title: 'Civil Registrar', note: 'Birth, marriage and death records.' },
	{ title: 'Agriculturist', note: 'Extension services for farmers and fisherfolk.' },
	{ title: 'Secretary to the Sanggunian', note: 'Keeps the council’s records and ordinances.' },
]

export type ServiceGroup = {
	title: string
	items: string[]
}

/**
 * Services devolved to each level under the Local Government Code.
 *
 * This is what the level is responsible for, not an inventory of what any
 * particular town currently offers — the directory has no way to verify the
 * second, and saying so is the difference between a reference and a brochure.
 */
export const SERVICES: Record<'province' | 'cityMunicipality' | 'barangay', ServiceGroup[]> = {
	province: [
		{
			title: 'Health',
			items: [
				'Provincial and district hospitals',
				'Health services beyond what a municipality can provide',
				'Purchase of medicines and medical supplies',
			],
		},
		{
			title: 'Social and environment',
			items: [
				'Social welfare services, including rebel and disabled persons programmes',
				'Enforcement of forestry, mining and pollution control law',
				'Relief in calamities and disaster preparedness',
			],
		},
		{
			title: 'Infrastructure and economy',
			items: [
				'Provincial roads and bridges, inter-municipal water works and drainage',
				'Investment support, industrial research and development',
				'Agricultural extension and on-site research',
			],
		},
		{
			title: 'Land and records',
			items: [
				'Provincial land use planning',
				'Upgrading and modernisation of tax information and collection',
			],
		},
	],
	cityMunicipality: [
		{
			title: 'Health',
			items: [
				'Rural health units, health centres and barangay health stations',
				'Primary health care, maternal and child care, communicable disease control',
				'Purchase of medicines and medical supplies',
			],
		},
		{
			title: 'Social services',
			items: [
				'Day care centres and child and family welfare',
				'Programmes for women, the elderly and persons with disabilities',
				'Nutrition, family planning and community-based rehabilitation',
			],
		},
		{
			title: 'Infrastructure and public works',
			items: [
				'Municipal or city roads, bridges, drainage and flood control',
				'School buildings, health centres, public markets and slaughterhouses',
				'Water supply systems and communal irrigation',
			],
		},
		{
			title: 'Permits, records and regulation',
			items: [
				'Business permits and licensing',
				'Building permits and zoning enforcement',
				'Civil registry — birth, marriage and death certificates',
				'Real property assessment and tax collection',
			],
		},
		{
			title: 'Agriculture, environment and safety',
			items: [
				'Agricultural extension, seed farms and fisheries',
				'Solid waste collection and disposal',
				'Community-based forestry projects',
				'Fire and police coordination, and disaster risk reduction',
			],
		},
	],
	barangay: [
		{
			title: 'Frontline services',
			items: [
				'Barangay clearance and certificates of residency and indigency',
				'Barangay health station and day care centre',
				'Katarungang Pambarangay — mediation of disputes before they reach court',
			],
		},
		{
			title: 'Community',
			items: [
				'Barangay tanod and peace and order at street level',
				'Maintenance of barangay roads, footpaths and water supply',
				'Solid waste segregation at source',
			],
		},
	],
}

/** Where the live record actually lives. */
export const OFFICIAL_LOOKUPS = [
	{
		office: 'Ministry of the Interior and Local Government',
		what: 'The BARMM ministry supervising local government units in the region. The first place to ask about a province, city, municipality or barangay inside BARMM.',
		href: 'https://milg.bangsamoro.gov.ph/',
	},
	{
		office: 'COMELEC',
		what: 'Official candidate lists and election results, including barangay and Sangguniang Kabataan elections — the record of who was elected.',
		href: 'https://comelec.gov.ph/',
	},
	{
		office: 'DILG',
		what: 'The national department’s directory of local chief executives, maintained alongside the LGU performance reports.',
		href: 'https://www.dilg.gov.ph/',
	},
	{
		office: 'Bangsamoro Official Gazette',
		what: 'Where Bangsamoro Autonomy Acts are published, including any law creating or reorganising a local unit.',
		href: 'https://officialgazette.bangsamoro.gov.ph/',
	},
]

export const LEGAL_BASIS = [
	{
		label: 'Republic Act 7160 — Local Government Code of 1991',
		note: 'Creates the offices and devolves the services described here.',
		href: 'https://www.officialgazette.gov.ph/1991/10/10/republic-act-no-7160/',
	},
	{
		label: 'Bangsamoro Autonomy Act 49 — Bangsamoro Local Governance Code',
		note: 'Enacted September 28, 2023. Governs how local units inside BARMM operate.',
		href: 'https://officialgazette.bangsamoro.gov.ph/',
	},
]
