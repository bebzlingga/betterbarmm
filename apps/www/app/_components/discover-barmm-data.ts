export type DiscoverBarmmReference = {
	label: string
	href: string
}

export type DiscoverBarmmPeople = {
	name: string
	description: string
	href?: string
}

export type DiscoverBarmmPeopleGroup = {
	category: string
	description: string
	people: DiscoverBarmmPeople[]
}

export type DiscoverBarmmDetailCard = {
	label: string
	value?: string
	title: string
	description: string
	href?: string
	sourceLabel?: string
}

export type DiscoverBarmmTopic = {
	slug: string
	label: string
	title: string
	description: string
	sections: string[]
	references: DiscoverBarmmReference[]
	detailEyebrow?: string
	detailTitle?: string
	detailDescription?: string
	detailCards?: DiscoverBarmmDetailCard[]
	peopleGroups?: DiscoverBarmmPeopleGroup[]
}

export const discoverBarmmTopics: DiscoverBarmmTopic[] = [
	{
		slug: 'history',
		label: 'History',
		title: 'How BARMM came to be',
		description:
			'A plain-language account of identity, self-governance, the peace process, the Bangsamoro Organic Law, the 2019 plebiscites, and the transition from ARMM to BARMM.',
		sections: [
			'The Bangsamoro story is rooted in communities with distinct histories, faith traditions, customary institutions, and political aspirations across mainland and island Mindanao.',
			'The modern region grew from a long peace process that moved political demands for self-governance into negotiated institutions, laws, and a public transition.',
			'The Bangsamoro Organic Law created the legal basis for BARMM, and the 2019 plebiscites shaped the new autonomous region that replaced ARMM.',
			'The transition period focused on building ministries, Parliament, public offices, codes, and financial systems capable of serving a diverse region.',
			'History is not only a timeline. It is also a public memory that explains why budgets, laws, land, identity, and local governance remain closely connected.',
		],
		references: [
			{
				label: 'BARMM legal basis and mandate',
				href: 'https://bangsamoro.gov.ph/about-us/legal-basis-mandate/',
			},
			{
				label: 'Bangsamoro Government transition report',
				href: 'https://bangsamoro.gov.ph/news/latest-news/2019-bangsamoro-government-made-significant-strides-in-governance/',
			},
		],
	},
	{
		slug: 'governance',
		label: 'Governance',
		title: 'How the Bangsamoro government works',
		description:
			'BARMM is an autonomous parliamentary regional government: Parliament makes regional laws, the Chief Minister leads the executive, and ministries deliver public services across the Bangsamoro.',
		sections: [
			'BARMM was created under the Bangsamoro Organic Law and organized through the Bangsamoro Administrative Code. It is not a province, city, or ordinary regional office. It is an autonomous regional government with a parliamentary setup: the Bangsamoro Parliament exercises legislative power, while the Chief Minister leads the executive branch and works through ministries, agencies, offices, and commissions. As of May 21, 2026, the BARMM key officials page lists Abdulraof A. Macacua as Chief Minister; verify current officials against official pages before citation.',
		],
		detailEyebrow: 'Government map',
		detailTitle: 'Ministries, offices, and their public roles',
		detailDescription:
			'A plain-language guide to the institutions readers will meet most often: ministries deliver public services, attached offices handle specialized functions, Parliament makes regional laws, and executive offices coordinate the work of government.',
		detailCards: [
			{
				label: 'Government type',
				value: 'Parliamentary',
				title: 'Autonomous regional government under the Bangsamoro Organic Law',
				description:
					'BARMM has its own regional institutions under Philippine law. Its parliamentary model links lawmaking, cabinet leadership, and executive administration more closely than a presidential local government setup.',
				href: 'https://bangsamoro.gov.ph/about-us/legal-basis-mandate/',
				sourceLabel: 'Legal basis',
			},
			{
				label: 'Executive',
				value: 'OCM',
				title: 'Office of the Chief Minister',
				description:
					'The Chief Minister leads the Bangsamoro Government, sets executive priorities, works with the Cabinet, and oversees the regional administration through ministries and attached offices.',
				href: 'https://bangsamoro.gov.ph/officials/key-officials/',
				sourceLabel: 'Key officials',
			},
			{
				label: 'Legislative',
				value: 'Parliament',
				title: 'Bangsamoro Parliament',
				description:
					'The Parliament deliberates and passes Bangsamoro laws, handles bills and resolutions, reviews public issues through committees, and provides the legislative side of regional self-government.',
				href: 'https://parliament.bangsamoro.gov.ph/',
				sourceLabel: 'Parliament',
			},
			{
				label: 'Cabinet support',
				value: 'Senior offices',
				title: 'Deputy Chief Ministers, Senior Minister, and Cabinet Secretary',
				description:
					'These offices support executive coordination, cabinet work, island and mainland concerns, policy follow-through, and day-to-day government management around the Chief Minister.',
				href: 'https://bangsamoro.gov.ph/officials/key-officials/',
				sourceLabel: 'Key officials',
			},
			{
				label: 'Attached office',
				value: 'BICTO',
				title: 'Bangsamoro Information and Communications Technology Office',
				description:
					'Supports digital government, ICT systems, connectivity, information systems, cybersecurity-related coordination, and technology capacity for ministries and communities.',
				href: 'https://bangsamoro.gov.ph/information-communications-technology-office/',
				sourceLabel: 'BICTO',
			},
			{
				label: 'Attached office',
				value: 'BIO',
				title: 'Bangsamoro Information Office',
				description:
					'Handles government information work, public updates, media coordination, official announcements, and communication support across ministries, agencies, and offices.',
				href: 'https://bangsamoro.gov.ph/officials/key-officials/',
				sourceLabel: 'Key officials',
			},
			{
				label: 'Planning office',
				value: 'BPDA',
				title: 'Bangsamoro Planning and Development Authority',
				description:
					'Leads socioeconomic planning, policy coordination, development programming, monitoring, evaluation, research, statistics, and investment planning for the Bangsamoro Government.',
				href: 'https://bpda.bangsamoro.gov.ph/',
				sourceLabel: 'BPDA',
			},
			{
				label: 'Legal office',
				value: 'BAGO',
				title: "Bangsamoro Attorney General's Office",
				description:
					'Provides legal support to the Bangsamoro Government, including government legal representation, legal opinions, intergovernmental coordination, and justice-related policy work.',
				href: 'https://bago.bangsamoro.gov.ph/',
				sourceLabel: 'BAGO',
			},
			{
				label: 'Cultural heritage',
				value: 'BCPCH',
				title: 'Bangsamoro Commission for the Preservation of Cultural Heritage',
				description:
					'Documents, preserves, conserves, and promotes Bangsamoro history, culture, arts, traditions, cultural properties, shrines, heritage sites, libraries, and museums.',
				href: 'https://bcpch.bangsamoro.gov.ph/mandate/',
				sourceLabel: 'BCPCH',
			},
			{
				label: 'Rights body',
				value: 'BHRC',
				title: 'Bangsamoro Human Rights Commission',
				description:
					'Works on human rights promotion, protection, monitoring, education, and accountability concerns within the autonomous region.',
				href: 'https://bhrc.bangsamoro.gov.ph/',
				sourceLabel: 'BHRC',
			},
			{
				label: 'Sectoral office',
				value: 'BWC',
				title: 'Bangsamoro Women Commission',
				description:
					'Advances gender-responsive governance, women-focused policy, gender and development coordination, and programs that support women across the region.',
				href: 'https://bwc.bangsamoro.gov.ph/',
				sourceLabel: 'BWC',
			},
			{
				label: 'Sectoral office',
				value: 'BYC',
				title: 'Bangsamoro Youth Commission',
				description:
					'Supports youth participation, youth development programs, leadership initiatives, policy coordination, and representation of young Bangsamoro constituents.',
				href: 'https://byc.bangsamoro.gov.ph/',
				sourceLabel: 'BYC',
			},
			{
				label: 'Attached office',
				value: 'BSC',
				title: 'Bangsamoro Sports Commission',
				description:
					'Supports regional sports development, athlete welfare, community sports programs, partnerships, and sports-related initiatives across Bangsamoro communities.',
				href: 'https://bsc.bangsamoro.gov.ph/',
				sourceLabel: 'BSC',
			},
			{
				label: 'Religious authority',
				value: 'BDI',
				title: "Bangsamoro Darul-Ifta'",
				description:
					'Provides Islamic guidance, religious advisory work, and faith-related public reference for the Bangsamoro Government and Muslim communities.',
				href: 'https://bdi.bangsamoro.gov.ph/',
				sourceLabel: 'BDI',
			},
			{
				label: 'Ports authority',
				value: 'BPMA',
				title: 'Bangsamoro Ports Management Authority',
				description:
					'Handles port administration, port development, maritime gateway coordination, and public infrastructure concerns tied to regional trade and mobility.',
				href: 'https://bpma.bangsamoro.gov.ph/',
				sourceLabel: 'BPMA',
			},
			{
				label: 'Public learning',
				value: 'DAB',
				title: 'Development Academy of the Bangsamoro',
				description:
					'Supports capacity building, public-sector learning, leadership development, research, and institutional strengthening for Bangsamoro governance.',
				href: 'https://dab.bangsamoro.gov.ph/',
				sourceLabel: 'DAB',
			},
			{
				label: 'Enterprise office',
				value: 'CSEA',
				title: 'Cooperative and Social Enterprise Authority',
				description:
					'Supports cooperatives, social enterprises, enterprise development, and community-based economic organizations across the region.',
				href: 'https://csea.bangsamoro.gov.ph/',
				sourceLabel: 'CSEA',
			},
			{
				label: 'Pilgrimage office',
				value: 'BPA',
				title: 'Bangsamoro Pilgrimage Authority',
				description:
					'Coordinates pilgrimage-related concerns, support services, and public information for Bangsamoro constituents participating in religious travel.',
				href: 'https://mfbm.bangsamoro.gov.ph/',
				sourceLabel: 'Agency links',
			},
			{
				label: 'Public finance',
				value: 'MFBM',
				title: 'Ministry of Finance, and Budget and Management',
				description:
					'Handles budget preparation, fiscal management, treasury and financial systems, and the public finance processes that shape how regional funds move.',
				href: 'https://mfbm.bangsamoro.gov.ph/',
				sourceLabel: 'MFBM',
			},
			{
				label: 'Education',
				value: 'MBHTE',
				title: 'Ministry of Basic, Higher and Technical Education',
				description:
					'Leads the regional education portfolio, covering basic education, higher education, technical education, and education systems that serve Bangsamoro learners.',
				href: 'https://mbhte.bangsamoro.gov.ph/',
				sourceLabel: 'MBHTE',
			},
			{
				label: 'Health',
				value: 'MOH',
				title: 'Ministry of Health',
				description:
					'Oversees health policy, public health programs, health facilities coordination, disease response, and service delivery priorities across BARMM communities.',
				href: 'https://moh.bangsamoro.gov.ph/',
				sourceLabel: 'MOH',
			},
			{
				label: 'Housing',
				value: 'MHSD',
				title: 'Ministry of Human Settlements and Development',
				description:
					'Handles human settlements, housing-related policy, shelter programs, and settlement development concerns across Bangsamoro communities.',
				href: 'https://mhsd.bangsamoro.gov.ph/',
				sourceLabel: 'MHSD',
			},
			{
				label: 'Local governance',
				value: 'MILG',
				title: 'Ministry of the Interior and Local Government',
				description:
					'Works with provinces, cities, municipalities, barangays, and public safety partners on local governance, community administration, and local institutional capacity.',
				href: 'https://milg.bangsamoro.gov.ph/',
				sourceLabel: 'MILG',
			},
			{
				label: 'Labor',
				value: 'MOLE',
				title: 'Ministry of Labor and Employment',
				description:
					'Works on labor standards, employment facilitation, worker welfare, livelihood support, and labor-market concerns in the region.',
				href: 'https://mole.bangsamoro.gov.ph/',
				sourceLabel: 'MOLE',
			},
			{
				label: 'Public safety',
				value: 'MPOS',
				title: 'Ministry of Public Order and Safety',
				description:
					'Coordinates public order, safety, peace-and-security programs, risk reduction, and community safety concerns within the Bangsamoro Government.',
				href: 'https://mpos.bangsamoro.gov.ph/',
				sourceLabel: 'MPOS',
			},
			{
				label: 'Infrastructure',
				value: 'MPW',
				title: 'Ministry of Public Works',
				description:
					'Plans and implements regional infrastructure such as roads, bridges, public buildings, flood-control works, and other public construction programs.',
				href: 'https://mpw.bangsamoro.gov.ph/',
				sourceLabel: 'MPW',
			},
			{
				label: 'Science and tech',
				value: 'MOST',
				title: 'Ministry of Science and Technology',
				description:
					'Leads science, technology, innovation, scholarship, research, and applied technical programs that support regional development.',
				href: 'https://most.bangsamoro.gov.ph/',
				sourceLabel: 'MOST',
			},
			{
				label: 'Food and land',
				value: 'MAFAR',
				title: 'Ministry of Agriculture, Fisheries and Agrarian Reform',
				description:
					'Supports farming, fisheries, agrarian reform, food security, rural production, and livelihood systems tied to land and coastal economies.',
				href: 'https://mafar.bangsamoro.gov.ph/',
				sourceLabel: 'MAFAR',
			},
			{
				label: 'Social services',
				value: 'MSSD',
				title: 'Ministry of Social Services and Development',
				description:
					'Leads social welfare, protection programs, emergency assistance, family and community support, and services for vulnerable sectors.',
				href: 'https://mssd.bangsamoro.gov.ph/',
				sourceLabel: 'MSSD',
			},
			{
				label: 'Trade and tourism',
				value: 'MTIT',
				title: 'Ministry of Trade, Investments and Tourism',
				description:
					'Promotes trade, enterprise development, investment, tourism, halal industry opportunities, and market-facing economic programs.',
				href: 'https://mtit.bangsamoro.gov.ph/',
				sourceLabel: 'MTIT',
			},
			{
				label: 'Environment',
				value: 'MENRE',
				title: 'Ministry of Environment, Natural Resources and Energy',
				description:
					'Handles environmental management, natural resources, protected areas, land-related regulatory work, conservation, and energy concerns.',
				href: 'https://menre.bangsamoro.gov.ph/',
				sourceLabel: 'MENRE',
			},
			{
				label: 'Indigenous peoples',
				value: 'MIPA',
				title: "Ministry of Indigenous Peoples' Affairs",
				description:
					'Represents and supports Indigenous peoples concerns in regional governance, including cultural rights, community welfare, and policy coordination.',
				href: 'https://mipa.bangsamoro.gov.ph/',
				sourceLabel: 'MIPA',
			},
			{
				label: 'Transport and comms',
				value: 'MOTC',
				title: 'Ministry of Transportation and Communications',
				description:
					'Handles transportation, communications, mobility systems, sector coordination, and related public-service concerns for the region.',
				href: 'https://motc.bangsamoro.gov.ph/',
				sourceLabel: 'MOTC',
			},
		],
		references: [
			{
				label: 'BARMM legal basis and mandate',
				href: 'https://bangsamoro.gov.ph/about-us/legal-basis-mandate/',
			},
			{
				label: 'BARMM key officials',
				href: 'https://bangsamoro.gov.ph/officials/key-officials/',
			},
			{
				label: 'Chief Minister Macacua assumption report',
				href: 'https://bangsamoro.gov.ph/news/latest-news/cm-macacua-officially-takes-helm-vows-to-continue-ebrahims-moral-governance-agenda/',
			},
			{
				label: 'Bangsamoro Parliament',
				href: 'https://parliament.bangsamoro.gov.ph/',
			},
		],
	},
	{
		slug: 'people',
		label: 'People',
		title: 'Peoples and communities of Bangsamoro',
		description:
			'Meet the Moro ethnolinguistic groups, Indigenous peoples, and settler communities that shape Bangsamoro public life through language, faith, memory, arts, livelihoods, customary practice, and place.',
		sections: [
			'BCPCH groups the Bangsamoro People into Islamized ethnolinguistic groups, Indigenous peoples, and settler communities. Use the source links for deeper reading and keep local context in view.',
		],
		peopleGroups: [
			{
				category: 'Islamized ethnolinguistic groups',
				description:
					'BCPCH lists 13 Moro ethnolinguistic groups under this category. They are connected by Islam and Bangsamoro identity, but each has its own language, homeland, history, and cultural practice.',
				people: [
					{
						name: 'Meranao',
						description:
							'The Meranao are strongly associated with Lake Lanao and Lanao del Sur. BCPCH describes the name as meaning people of the lake, with cultural life tied to Marawi, lake communities, textiles, metalwork, woodcraft, and the torogan.',
						href: 'https://bcpch.bangsamoro.gov.ph/meranao/',
					},
					{
						name: 'Maguindanaon',
						description:
							'The Maguindanaon are associated with the Pulangi River valley, Maguindanao, Cotabato, and nearby provinces. BCPCH notes lower-valley and upper-valley groups linked to the Sultanate of Maguindanao and the Rajahship of Buayan.',
						href: 'https://bcpch.bangsamoro.gov.ph/maguindanaon/',
					},
					{
						name: 'Iranun',
						description:
							'The Iranun are closely related culturally and linguistically to the Meranao and Maguindanaon. BCPCH places many Iranun communities along the Illana Bay coast, Maguindanao, Zamboanga del Sur, and wider maritime routes.',
						href: 'https://bcpch.bangsamoro.gov.ph/iranun/',
					},
					{
						name: 'Yakan',
						description:
							'The Yakan are concentrated in Basilan, including Lamitan, Tipo-Tipo, Sumisip, and Tuburan. BCPCH highlights farming, upland rice cultivation, community religious leadership, weaving, and colorful traditional dress.',
						href: 'https://bcpch.bangsamoro.gov.ph/yakan/',
					},
					{
						name: 'Tausug',
						description:
							'The Tausug are the dominant group of the Sulu archipelago in BCPCH accounts, with communities in Jolo, Indanan, Siasi, Patikul, and beyond. Their name is linked to Jolo, Sulu, coastal and interior dialects, and Sulu political history.',
						href: 'https://bcpch.bangsamoro.gov.ph/tausug/',
					},
					{
						name: 'Sama',
						description:
							'Sama communities form a wide island and coastal ethnolinguistic world across Sulu, Tawi-Tawi, Basilan, Zamboanga, and nearby seas. The name covers many local identities, languages, and maritime or coastal livelihoods.',
					},
					{
						name: 'Sama di Laut',
						description:
							'Sama di Laut communities are often associated with sea-oriented life, navigation, fishing, boat culture, diving, and coastal settlement. BCPCH lists them separately from Sama in its Bangsamoro People page.',
					},
					{
						name: 'Jama Mapun',
						description:
							'The Jama Mapun are native to Mapun, formerly Cagayan de Tawi-Tawi, and Turtle Islands, with communities also found in northern Palawan and nearby islands. BCPCH notes a Sama-Bajau language and Muslim identity.',
						href: 'https://bcpch.bangsamoro.gov.ph/jama-mapun/',
					},
					{
						name: 'Kagan/Kalagan',
						description:
							'The Kagan or Kalagan are Islamized communities in Davao and neighboring areas. BCPCH describes cultural contact and intermarriage with Tausug and Maguindanaon communities, with language links to Tagakaolo, Tausug, and Maguindanaon.',
						href: 'https://bcpch.bangsamoro.gov.ph/kagan-kalagan/',
					},
					{
						name: 'Kolibugan',
						description:
							'BCPCH describes Kolibugan identity as connected to Subanun communities who intermarried with Tausug and Sama communities in western Mindanao. Their culture shares elements with Subanun, Tausug, and Sama traditions.',
						href: 'https://bcpch.bangsamoro.gov.ph/kolibugan/',
					},
					{
						name: 'Sangil',
						description:
							'Sangil communities are found in Balut, Sarangani, and parts of coastal South Cotabato and Davao del Sur. BCPCH links their ancestry to Sangihe in eastern Indonesia and notes an Austronesian language with affinity to Sama.',
						href: 'https://bcpch.bangsamoro.gov.ph/sangil/',
					},
					{
						name: 'Molbog',
						description:
							'The Molbog are associated with Balabac and southern Palawan. BCPCH describes links to North Borneo, contact with Tausug traders, Islamization, subsistence farming, fishing, barter trade, and lexical ties with Sama, Tausug, and Palawano.',
						href: 'https://bcpch.bangsamoro.gov.ph/molbog/',
					},
					{
						name: 'Palawanon',
						description:
							'BCPCH lists Palawanon among the Islamized ethnolinguistic groups and describes Palawan as rich in languages, culture, and archaeological memory, with many Palawanon communities living along upland rivers and some along the coast.',
						href: 'https://bcpch.bangsamoro.gov.ph/palawanon/',
					},
				],
			},
			{
				category: 'Indigenous peoples',
				description:
					'BCPCH lists Teduray, Lambangian, and Manobo Dulangan under Indigenous People. These communities are central to any accurate account of Bangsamoro land, ancestry, customary practice, and cultural governance.',
				people: [
					{
						name: 'Teduray',
						description:
							'BCPCH describes coastal, river, and mountain Teduray clans with distinct dialect variations. Teduray communities are found in Upi, South Upi, Dinaig, Ampatuan, Sultan Kudarat, and North Cotabato, with farming, hunting, fishing, basket weaving, and Indigenous customs.',
						href: 'https://bcpch.bangsamoro.gov.ph/teduray/',
					},
					{
						name: 'Lambangian',
						description:
							'BCPCH lists the Lambangian as an Indigenous people of the Bangsamoro. They are often discussed with Teduray and Dulangan Manobo communities in mainland Mindanao cultural, ancestral domain, and Indigenous governance contexts.',
					},
					{
						name: 'Manobo Dulangan',
						description:
							'BCPCH identifies Manobo Dulangan under Indigenous People and describes Manobo communities in the Cotabato Cordillera, Sultan Kudarat, Maguindanao, South Cotabato, and Sarangani, with Dulangan Manobo linked to mountain communities.',
						href: 'https://bcpch.bangsamoro.gov.ph/manobo/',
					},
				],
			},
			{
				category: 'Settler communities',
				description:
					'BCPCH also names settler communities, recognizing that the region has been shaped by migration, commerce, education, public service, and urban life alongside Moro and Indigenous histories.',
				people: [
					{
						name: 'Visaya',
						description:
							'BCPCH lists Visaya under settler communities. In a BARMM public guide, this points to Visayan migration, settlement, labor, trade, family networks, and everyday civic life in different parts of Mindanao.',
					},
					{
						name: 'Tagalog',
						description:
							"BCPCH lists Tagalog under settler communities and describes Tagalog as one of the country's largest ethnolinguistic groups, with Filipino language and national public life shaped by Tagalog and Manila-based variants.",
						href: 'https://bcpch.bangsamoro.gov.ph/tagalog/',
					},
					{
						name: 'Chinese',
						description:
							'BCPCH lists Chinese under settler communities. Chinese and Chinese-Filipino families and networks have long been part of trade, commerce, town life, and local public economies in Mindanao.',
					},
					{
						name: 'Other settler communities',
						description:
							'BCPCH uses an open-ended "Etc." category. This should be read carefully: local histories include other families and communities whose stories need documentation from municipal, provincial, and community sources.',
					},
				],
			},
		],
		references: [
			{
				label: 'BCPCH Bangsamoro People',
				href: 'https://bcpch.bangsamoro.gov.ph/bangsamoro-people/',
			},
			{
				label: 'BCPCH mandate',
				href: 'https://bcpch.bangsamoro.gov.ph/mandate/',
			},
			{
				label: 'BCPCH digital publications',
				href: 'https://bcpch.bangsamoro.gov.ph/bcpch-bangsamoro-cultural-heritage-digital-publication/',
			},
		],
	},
	{
		slug: 'culture-places',
		label: 'Culture & Places',
		title: 'Mosques, food, islands, and living heritage',
		description:
			'A starting map for what makes BARMM vivid: grand mosques, old sacred sites, island landscapes, halal food traditions, textiles, landmarks, and community-based tourism.',
		sections: [
			'This is not a travel guide yet. It is a source-backed shortlist of places, food, and cultural markers that help readers recognize BARMM beyond government boundaries.',
		],
		detailCards: [
			{
				label: 'Faith landmarks',
				value: 'Mosques',
				title: 'Grand Mosque and Sheik Karimul Makhdum Mosque',
				description:
					'Cotabato City is known for the Sultan Haji Hassanal Bolkiah Mosque, while Simunul, Tawi-Tawi is home to the historic Sheik Karimul Makhdum Mosque, built in 1380.',
				href: 'https://bangsamoro.gov.ph/news/latest-news/mtit-explores-tawi-tawis-tourism-spots/',
				sourceLabel: 'BARMM tourism',
			},
			{
				label: 'Cotabato landmarks',
				value: 'City layer',
				title: "Grand Mosque, PC Hill, Tamontaka Church, People's Palace, Timaco Hill",
				description:
					"BARMM's Kutawato Go feature lists well-known Cotabato City landmarks, from the Grand Mosque to Tamontaka Church and Sultan Kudarat Shrine.",
				href: 'https://bangsamoro.gov.ph/lifestyle/kutawato-go-a-virtual-tour-experience-in-cotabato-city/',
				sourceLabel: 'Kutawato Go',
			},
			{
				label: 'Island landscapes',
				value: 'Tawi-Tawi',
				title: 'Bud Bongao, Panampangan Island, Sangay Siapuh, and coastal resorts',
				description:
					"MTIT's Tawi-Tawi tourism inventory highlights Bud Bongao, Panampangan Island, Sangay Siapuh Island Resort, Bihing Tahik Resort, and other island destinations.",
				href: 'https://bangsamoro.gov.ph/news/latest-news/mtit-explores-tawi-tawis-tourism-spots/',
				sourceLabel: 'MTIT tourism',
			},
			{
				label: 'Food culture',
				value: 'Halal cuisine',
				title: 'Tiyula Itum, pastil, palapa, piaparan, kumukunsi, and more',
				description:
					'BARMM showcases Bangsamoro food as heritage: Tausug Tiyula Itum, Maguindanaoan dishes, Maranao piaparan, pastil, palapa, tapay, daral, and other local favorites.',
				href: 'https://bangsamoro.gov.ph/news/latest-news/mtit-flaunts-bangsamoro-halal-gastronomy-in-bacolod-food-expo/',
				sourceLabel: 'Halal gastronomy',
			},
			{
				label: 'Arts and material culture',
				value: 'Living craft',
				title: 'Textiles, weaving, dress, craft, music, and community practice',
				description:
					'BCPCH and MTIT both frame culture as living work: traditional arts, crafts, music, dance, festivals, food, and heritage practices remain part of daily public life.',
				href: 'https://mtit.bangsamoro.gov.ph/kb/is-the-ministry-involved-in-promoting-tourism-in-barmm/',
				sourceLabel: 'MTIT tourism',
			},
		],
		references: [
			{
				label: 'Kutawato Go landmarks',
				href: 'https://bangsamoro.gov.ph/lifestyle/kutawato-go-a-virtual-tour-experience-in-cotabato-city/',
			},
			{
				label: 'Tawi-Tawi tourism spots',
				href: 'https://bangsamoro.gov.ph/news/latest-news/mtit-explores-tawi-tawis-tourism-spots/',
			},
			{
				label: 'Bangsamoro halal gastronomy',
				href: 'https://bangsamoro.gov.ph/news/latest-news/mtit-flaunts-bangsamoro-halal-gastronomy-in-bacolod-food-expo/',
			},
			{
				label: 'MTIT tourism role',
				href: 'https://mtit.bangsamoro.gov.ph/kb/is-the-ministry-involved-in-promoting-tourism-in-barmm/',
			},
		],
	},
]
