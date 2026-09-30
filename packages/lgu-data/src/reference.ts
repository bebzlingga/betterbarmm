/* ============================================================
   What every unit has, by level

   The directory can say with confidence what offices exist in a
   municipality and what that municipality is responsible for, because
   both are set by law rather than by the town. Inside BARMM that law
   is the Bangsamoro Local Governance Code of 2023 — Bangsamoro
   Autonomy Act 49 — and its implementing rules of 30 September 2025.
   The Code creates the offices, fixes the terms and the pay, and
   devolves the services; the national Local Government Code of 1991
   applies only where the Bangsamoro one is silent.

   Figures here are the law's own, cited to the section or article that
   carries them, so a reader can check any of them against the text.

   What the directory cannot say is who currently holds those offices.
   That is a live record we do not hold, and inventing it would be
   worse than leaving it blank — so the Officials tab lists the posts
   and hands the reader to the office that publishes the names.
   ============================================================ */

export type OfficePost = {
	title: string
	note: string
	/**
	 * What the law fixes about the post — its term, the age to hold it, what it
	 * pays, or whether the unit is obliged to have it at all. Kept apart from
	 * `note` because this is the checkable half: every one of these is a figure
	 * from the Code or its IRR, and the citation travels with it.
	 */
	detail?: string
}

/**
 * The elected posts at each level.
 *
 * `sanggunian` counts vary: a municipality's council has 8 regular members, a
 * component city's 10, and a province's board is sized by district — so the
 * counts that are fixed are stated and the ones that are not are described.
 *
 * Every elective local official serves three years from noon on 30 June after
 * the election and may not serve more than three in a row (Code s. 43, IRR
 * art. 185), so that much is true of every post below and is not repeated on
 * each one.
 */
export const ELECTED_POSTS: Record<'province' | 'city' | 'municipality' | 'barangay', OfficePost[]> =
	{
		province: [
			{
				title: 'Governor',
				note: 'Chief executive of the province.',
				detail: 'Salary grade 30. Must be 23 on election day. (IRR art. 187, Code s. 42)',
			},
			{
				title: 'Vice-Governor',
				note: 'Presides over the Sangguniang Panlalawigan, the provincial board.',
				detail: 'Salary grade 28. Must be 23 on election day. (IRR art. 187, Code s. 42)',
			},
			{
				title: 'Sangguniang Panlalawigan members',
				note: 'The provincial board. Members are elected by district, so a province with more districts seats more of them.',
				detail: 'Must be 23 on election day. (Code s. 42)',
			},
		],
		city: [
			{
				title: 'City Mayor',
				note: 'Chief executive of the city.',
				detail:
					'Salary grade 30 in a highly urbanised city. Must be 23 on election day there, 21 in a component city. (IRR art. 187, Code s. 42)',
			},
			{
				title: 'City Vice-Mayor',
				note: 'Presides over the Sangguniang Panlungsod.',
				detail: 'Salary grade 28. Must be 23 on election day, 21 in a component city. (IRR art. 187, Code s. 42)',
			},
			{
				title: 'Sangguniang Panlungsod members',
				note: 'The city council — 10 regular members in each of the region’s three cities, plus the ex officio seats for the barangay and youth federation presidents.',
				detail: 'Must be 18 on election day, 23 in a highly urbanised city. (Code s. 42)',
			},
		],
		municipality: [
			{
				title: 'Municipal Mayor',
				note: 'Chief executive of the municipality.',
				detail: 'Salary grade 27. Must be 21 on election day. (IRR art. 187, Code s. 42)',
			},
			{
				title: 'Municipal Vice-Mayor',
				note: 'Presides over the Sangguniang Bayan.',
				detail: 'Salary grade 25. Must be 21 on election day. (IRR art. 187, Code s. 42)',
			},
			{
				title: 'Sangguniang Bayan members',
				note: 'The municipal council — 8 regular members, plus the ex officio seats for the barangay and youth federation presidents.',
				detail: 'Must be 18 on election day. (Code s. 42)',
			},
		],
		barangay: [
			{
				title: 'Punong Barangay',
				note: 'The barangay captain, and its chief executive.',
				detail:
					'Paid an honorarium, not a salary: at least ₱5,000 a month, up to the first step of salary grade 14. Must be 18. (Code s. 424, IRR art. 45)',
			},
			{
				title: '7 Sangguniang Barangay members',
				note: 'The barangay council, elected at large across the barangay.',
				detail: 'At least ₱3,000 a month, up to the first step of salary grade 10. Must be 18. (Code s. 424, IRR art. 45)',
			},
			{
				title: 'SK Chairperson and 7 SK members',
				note: 'The Sangguniang Kabataan — the youth council, elected by and from residents aged 15 to 30.',
				detail:
					'The chairperson sits on the barangay council and is paid as its members are. Must be 18 to 24 on election day. The SK gets 10% of the barangay’s general fund. (Code s. 42, IRR arts. 45, 83, 624)',
			},
		],
	}

/**
 * Appointed offices a unit is required or permitted to have.
 *
 * Useful because these are the people a resident actually deals with — you take
 * a business permit to the treasurer, not to the mayor.
 *
 * Which of them a unit must have differs by level, and the difference is worth
 * stating: a municipality is obliged to have nine of these and may do without
 * the rest, which is why the town next door has a legal officer and yours does
 * not. The split is IRR arts. 229 (province), 230 (city) and 231 (municipality).
 */
export const APPOINTED_OFFICES: OfficePost[] = [
	{
		title: 'Treasurer',
		note: 'Collects taxes and fees, and keeps the unit’s funds. The office behind business permits and real property tax.',
		detail: 'Required at every level. Appointed by the regional finance ministry, not by the mayor. (IRR arts. 229–231, 240)',
	},
	{
		title: 'Assessor',
		note: 'Values land and buildings for real property tax, and keeps the tax map.',
		detail: 'Required at every level. Revalues all property every three years. (IRR arts. 229–231, 517)',
	},
	{
		title: 'Accountant',
		note: 'Keeps the books and certifies the availability of funds.',
		detail: 'Required at every level. (IRR arts. 229–231)',
	},
	{
		title: 'Budget Officer',
		note: 'Prepares the annual budget the council enacts.',
		detail: 'Required at every level. (IRR arts. 229–231)',
	},
	{
		title: 'Planning and Development Coordinator',
		note: 'Prepares the comprehensive development plan and the land use plan.',
		detail: 'Required at every level. (IRR arts. 229–231)',
	},
	{
		title: 'Engineer',
		note: 'Infrastructure, public works, and building permits.',
		detail: 'Required at every level. (IRR arts. 229–231)',
	},
	{
		title: 'Health Officer',
		note: 'Runs the rural health unit or city health office.',
		detail: 'Required at every level. (IRR arts. 229–231, 248)',
	},
	{
		title: 'Secretary to the Sanggunian',
		note: 'Keeps the council’s records and ordinances.',
		detail: 'Required at every level. (IRR arts. 229–231)',
	},
	{
		title: 'Civil Registrar',
		note: 'Birth, marriage and death records.',
		detail: 'Required in a municipality. Provinces keep no civil registry. (IRR art. 231)',
	},
	{
		title: 'Administrator',
		note: 'Runs the machinery of the unit day to day and coordinates the departments.',
		detail: 'Required in a province and a city; optional in a municipality. (IRR arts. 229–231, 236)',
	},
	{
		title: 'Legal Officer',
		note: 'Advises the unit and represents it in cases brought against it.',
		detail: 'Required in a province and a city; optional in a municipality. (IRR arts. 229–231)',
	},
	{
		title: 'Social Welfare and Development Officer',
		note: 'Assistance programs, child and family services, disaster relief casework.',
		detail: 'Required in a province and a city; optional in a municipality. (IRR arts. 229–231)',
	},
	{
		title: 'General Services Officer',
		note: 'Supplies, records, motor pool and the unit’s property.',
		detail: 'Required in a province and a city. (IRR arts. 229–230)',
	},
	{
		title: 'Veterinarian',
		note: 'Animal health, the slaughterhouse, and meat inspection.',
		detail: 'Required in a province and a city. (IRR arts. 229–230)',
	},
	{
		title: 'Agriculturist',
		note: 'Extension services for farmers and fisherfolk.',
		detail: 'Required in a province; optional in a municipality. (IRR arts. 229, 231)',
	},
	{
		title: 'Architect',
		note: 'Design of the unit’s buildings and review of plans.',
		detail: 'Required in a city; optional in a municipality. (IRR arts. 230–231)',
	},
	{
		title: 'Environment and Natural Resources Officer',
		note: 'Waste, water, and the unit’s share of forestry and pollution control.',
		detail: 'Optional in a municipality. (IRR art. 231)',
	},
	{
		title: 'Information Officer',
		note: 'Public information and the unit’s own record of what it is doing.',
		detail: 'Optional in a municipality. (IRR art. 231)',
	},
]

export type ServiceGroup = {
	title: string
	items: string[]
}

/**
 * Services devolved to each level under the Bangsamoro Local Governance Code.
 *
 * This is what the level is responsible for, not an inventory of what any
 * particular town currently offers — the directory has no way to verify the
 * second, and saying so is the difference between a reference and a brochure.
 *
 * Devolution runs on a five-year transition (IRR art. 367); Marawi, Cotabato
 * City and Basilan are already certified as fully devolved (IRR art. 372).
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
				'Social welfare services, including rebel returnee and evacuee relief',
				'Enforcement of forestry, small-scale mining and pollution control law',
				'Relief in calamities and disaster preparedness',
			],
		},
		{
			title: 'Infrastructure and economy',
			items: [
				'Provincial roads and bridges, inter-municipal water works and drainage',
				'Investment support, industrial research and development',
				'Agricultural extension and on-site research',
				'Dispersal of livestock and poultry',
			],
		},
		{
			title: 'Land and records',
			items: [
				'Provincial land use planning',
				'Upgrading and modernisation of tax information and collection',
				'Settling boundary disputes between the municipalities in it — 60 days to try, then the Regional Trial Court',
			],
		},
	],
	cityMunicipality: [
		{
			title: 'Health',
			items: [
				'Rural health units, health centers and barangay health stations',
				'Primary health care, maternal and child care, communicable disease control',
				'Purchase of medicines and medical supplies',
			],
		},
		{
			title: 'Social services',
			items: [
				'Day care centers and child and family welfare',
				'Programs for women, the elderly and persons with disabilities',
				'Nutrition, family planning and community-based rehabilitation',
			],
		},
		{
			title: 'Infrastructure and public works',
			items: [
				'Municipal or city roads, bridges, drainage and flood control',
				'School buildings, health centers, public markets and slaughterhouses',
				'Water supply systems and communal irrigation',
				'Sites for the police and fire stations and the municipal jail',
			],
		},
		{
			title: 'Permits, records and regulation',
			items: [
				'Business permits and licensing',
				'Building permits and zoning enforcement',
				'Civil registry — birth, marriage and death certificates',
				'Real property assessment and tax collection',
				'Reclassifying farmland — capped at 15% of the town’s agricultural land, 10% or 5% in smaller classes',
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
				'Barangay health station and day care center',
				'Katarungang Pambarangay — a lupon of 10 to 20 members mediates disputes before they reach court',
			],
		},
		{
			title: 'Community',
			items: [
				'Barangay tanod and peace and order at street level — one tanod per 200 residents, 30 at most',
				'Maintenance of barangay roads, footpaths and water supply',
				'Solid waste segregation at source',
				'Agricultural support — planting materials and farm produce collection and buying stations',
			],
		},
		{
			title: 'Money it handles',
			items: [
				'A tax of up to 1% on stores with gross sales under ₱50,000 in a city or ₱30,000 in a municipality',
				'Its share of the real property tax — 25% of what the province collects on property in it',
				'10% of its general fund set aside for the Sangguniang Kabataan',
				'Its own annual budget, reviewed by the city or municipal council within 90 days',
			],
		},
	],
}

export type Charge = {
	what: string
	rate: string
	when: string
	/** The section or article that fixes it. */
	basis: string
}

/**
 * What a resident actually pays the local government, and by when.
 *
 * The rest of this file is written for someone asking how the unit is built;
 * this is for someone asking what they owe it. Every figure is the ceiling the
 * law sets, not the rate any particular town charges — a sanggunian may levy
 * less and many do, so the honest phrasing is "up to".
 */
export const LOCAL_CHARGES: Charge[] = [
	{
		what: 'Community tax certificate — the cedula',
		rate: '₱20, plus ₱1 for every ₱1,000 of income, up to ₱5,000 in all',
		when: 'Accrues 1 January, due by the last day of February. 24% a year on what is late.',
		basis: 'IRR arts. 452, 454',
	},
	{
		what: 'Real property tax — the amilyar',
		rate: 'Up to 1% of assessed value in a province, up to 2% in a city, plus 1% for the Special Education Fund',
		when: 'In full by 31 March, or in four instalments due 31 March, 30 June, 30 September and 31 December. Up to 20% off for paying early.',
		basis: 'IRR arts. 530, 531, 540, 541',
	},
	{
		what: 'Business tax',
		rate: 'Graduated by gross sales — a retailer pays 2% on the first ₱400,000 and 1% above it',
		when: 'Within the first 20 days of January, or of each quarter.',
		basis: 'IRR arts. 439, 444',
	},
	{
		what: 'Professional tax',
		rate: 'Up to ₱1,300 a year, and it covers practice anywhere in the country',
		when: 'By 31 January, or before you begin to practice.',
		basis: 'IRR art. 447',
	},
	{
		what: 'Transfer of land',
		rate: 'Up to 0.5% of the price or the fair market value, whichever is higher',
		when: 'Within 60 days of the deed, or of the death of the owner.',
		basis: 'IRR art. 437',
	},
	{
		what: 'Barangay clearance',
		rate: 'A reasonable fee the barangay council sets by ordinance',
		when: 'On application. The barangay also collects a store tax of up to 1% from the smallest shops.',
		basis: 'IRR art. 457',
	},
	{
		what: 'Filing a complaint at the barangay',
		rate: 'Free — the katarungang pambarangay charges no filing fee',
		when: 'Mediation runs 15 days, then 15 more before the pangkat.',
		basis: 'IRR arts. 64, 65, 78',
	},
	{
		what: 'Paying any local tax late',
		rate: 'A surcharge of up to 25%, plus up to 2% a month, capped at 36 months',
		when: 'Runs from the day the tax fell due.',
		basis: 'IRR art. 459',
	},
]

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
		what: 'Where Bangsamoro Autonomy Acts are published, including any law creating or reorganizing a local unit.',
		href: 'https://officialgazette.bangsamoro.gov.ph/',
	},
]

export const LEGAL_BASIS = [
	{
		label: 'Bangsamoro Autonomy Act 49 — Bangsamoro Local Governance Code of 2023',
		note: 'Enacted September 28, 2023. The governing code inside BARMM: it creates the offices described here, fixes their terms and pay, and devolves the services. It repealed the ARMM code it replaced.',
		href: 'https://legislation.betterbarmm.com/acts/49',
	},
	{
		label: 'Implementing Rules and Regulations of the BLGC',
		note: 'Promulgated September 30, 2025. 696 articles setting out how the Code is carried out — the procedures, deadlines and rate ceilings quoted on this page.',
		href: 'https://legislation.betterbarmm.com/acts/49',
	},
	{
		label: 'Republic Act 7160 — Local Government Code of 1991',
		note: 'The national code. Inside BARMM it applies only where the Bangsamoro one is silent.',
		href: 'https://www.officialgazette.gov.ph/1991/10/10/republic-act-no-7160/',
	},
]
