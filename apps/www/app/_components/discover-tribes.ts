import type { DiscoverPhotoKey } from './discover-media'

/* ============================================================
   Food and culture, by people

   The Culture & Places chapter used to carry one card that said
   "Tiyula Itum, pastil, palapa, piaparan, kumukunsi, and more". That
   list is accurate and tells a reader almost nothing: it reads as a
   single regional cuisine, which is exactly the flattening this guide
   exists to undo. Tiyula itum is Tausug. Pastil is Maguindanaon.
   Piaparan is Meranao. They are not variants of one dish — they belong
   to different peoples with different homelands, looms, and gongs.

   So the section is organised the way the region actually is: by
   people. Each entry below carries what that group puts on the table,
   what it makes with its hands, and what it plays or tells — and the
   official source for each.

   Everything here is transcribed from BCPCH and BARMM's own published
   pages, listed per entry in `sources`. Where a claim is widely
   repeated but not in one of those pages, it is not here. That is why
   some groups have three dishes and others have ten: this is what is
   documented, not what exists.
   ============================================================ */

export type TribeEntry = {
	name: string
	note: string
}

export type TribeLivingTreasure = {
	name: string
	/** The award's own category — "Textile Weaver", "Musician". */
	title: string
	/** Where BCPCH places them. */
	place: string
	note: string
	href: string
}

export type BangsamoroTribe = {
	slug: string
	name: string
	/** The spelling a reader is more likely to have met elsewhere. */
	alsoKnownAs?: string
	/** What the name itself means, where BCPCH gives it. */
	meaning?: string
	homeland: string
	intro: string
	/** What is cooked and eaten. */
	food: TribeEntry[]
	/** Cloth, mat, house, boat — what is made by hand. */
	craft: TribeEntry[]
	/** Music, dance, epic, language. */
	sound: TribeEntry[]
	/** A National Living Treasure from this group, where one has been named. */
	livingTreasure?: TribeLivingTreasure
	/** A dish or plate, and a made thing — one of each where both exist. */
	photos: { food?: DiscoverPhotoKey; craft?: DiscoverPhotoKey }
	sources: { label: string; href: string }[]
}

const SOURCE = {
	eid: {
		label: 'BARMM — Bangsamoro delicacies to celebrate Eid’l Fitr',
		href: 'https://bangsamoro.gov.ph/news/latest-news/bangsamoro-delicacies-to-celebrate-eidl-fitr/',
	},
	halal: {
		label: 'BARMM — Bangsamoro halal gastronomy',
		href: 'https://bangsamoro.gov.ph/news/latest-news/mtit-flaunts-bangsamoro-halal-gastronomy-in-bacolod-food-expo/',
	},
	tawiIftar: {
		label: 'BARMM — Iftar the Tawi-Tawi way',
		href: 'https://bangsamoro.gov.ph/news/feature-story/ramadhan-series-iftar-the-tawi-tawi-way-a-seafood-feast/',
	},
	inaul: {
		label: 'BCPCH — Inaul of Maguindanao',
		href: 'https://bcpch.bangsamoro.gov.ph/inaul-of-maguindanao/',
	},
	darangen: {
		label: 'UNESCO — Darangen epic of the Maranao people',
		href: 'https://ich.unesco.org/en/RL/darangen-epic-of-the-maranao-people-of-lake-lanao-00159',
	},
} as const

const bcpch = (slug: string, label: string) => ({
	label: `BCPCH — ${label}`,
	href: `https://bcpch.bangsamoro.gov.ph/${slug}/`,
})

export const bangsamoroTribes: BangsamoroTribe[] = [
	{
		slug: 'meranao',
		name: 'Meranao',
		alsoKnownAs: 'Maranao',
		meaning: '“People of the Lake”',
		homeland: 'Lanao del Sur, around Lake Lanao',
		intro:
			'BCPCH takes the name from the lake itself — the Meranao are the people of the 135-square-mile lake basin at the centre of Mindanao, 2,300 feet above sea level. Communities cluster around two buildings: a mosque, and a torogan, the royal house of the leading household. Their cloth is read the way a uniform is read; the intricacy of the motif and the richness of the colour state the rank of whoever is wearing it.',
		food: [
			{
				name: 'Randang',
				note: 'Slow-cooked in coconut milk with spices until the meat is tender and has taken the flavour all the way through. A centrepiece of Eid’l Fitr in Lanao del Sur.',
			},
			{
				name: 'Piaparan',
				note: 'Chicken in a coconut-milk broth with garlic, onions, ginger, turmeric and spring onions. The dish BARMM sent to an international food expo as the Meranao classic.',
			},
			{
				name: 'Palapa',
				note: 'The condiment underneath much of the cooking — grated coconut with fried chillies, onions, garlic and herbs, stirred into a dish or eaten alongside it.',
			},
		],
		craft: [
			{
				name: 'Torogan',
				note: 'The ancestral house of a datu, raised on heavy posts. BCPCH calls it the most significant and spectacular example of Filipino secular architecture.',
			},
			{
				name: 'Okir and the panolong',
				note: 'The flowing carved motif that runs along the wing-beams flaring out from a torogan’s front, and through metalwork and woodcraft besides.',
			},
			{
				name: 'Awang',
				note: 'The dugout boat used on Lake Lanao — BCPCH singles it out as both unique and extremely ornate.',
			},
		],
		sound: [
			{
				name: 'Darangen',
				note: 'An epic in 17 cycles and 72,000 lines, sung by specialist male and female performers across several nights of a wedding. It carries customary law, ethics and ideas of beauty inside the story. UNESCO inscribed it in 2008; it is now rarely performed, because its archaic vocabulary is understood only by practitioners, elders and scholars.',
			},
			{
				name: 'Singkil',
				note: 'The court dance of stepping through clashing bamboo, drawn from an episode of the Darangen — the epic danced rather than sung.',
			},
			{
				name: 'Salsila',
				note: 'The early written genealogies. BCPCH takes its account of who counts as Meranao from them: it is the salsila that record the term as covering the people living around the lake.',
			},
		],
		photos: { food: 'paterPalapa', craft: 'panolong' },
		sources: [bcpch('meranao', 'Meranao'), SOURCE.eid, SOURCE.halal, SOURCE.darangen],
	},

	{
		slug: 'maguindanaon',
		name: 'Maguindanaon',
		homeland: 'The Pulangi river valley — Maguindanao del Norte and del Sur, and Cotabato',
		intro:
			'BCPCH describes the Maguindanaon as highly sophisticated in weaving, okir design, jewellery, metalwork and brassware — and says that in music they have few peers among Filipino cultural communities. Their masters of the kulintang and the kutyapi, it argues, stand comparison with any instrumental virtuoso in the East or West.',
		food: [
			{
				name: 'Linigil',
				note: 'Chicken cooked in fresh coconut milk seasoned with palapa, turmeric and other herbs — one of the most popular Eid’l Fitr dishes in Maguindanao.',
			},
			{
				name: 'Pastil',
				note: 'A budget meal: rice topped with sautéed shredded chicken or fish and wrapped in a banana leaf. Everyday food that also turns up at the feast.',
			},
			{
				name: 'Tapay',
				note: 'Fermented rice, set with yeast — a delicacy rather than a staple, and a fixture of the Eid table.',
			},
			{
				name: 'Kumukunsi',
				note: 'One of the household delicacies BARMM has put on the road with its halal gastronomy showcase, alongside tipas and muntia dadal.',
			},
			{
				name: 'Dudol, tinumis, tinadtag and p’lil',
				note: 'The rest of the Eid’l Fitr sweets and snacks BARMM lists for Maguindanao — a spread, not a single dessert.',
			},
		],
		craft: [
			{
				name: 'Inaul',
				note: 'The handwoven malong. Made on an ancient backstrap loom or a fixed horizontal frame with 4 treadles, from tanor cotton thread, silky rayon, katiyado, or a mix — 1 to 3 weeks of work for a single piece, depending on the pattern.',
			},
			{
				name: 'Clan patterns',
				note: 'Plaid has become the favourite among the old patterns, and some designs are woven exclusively for particular clans. Weavers learn by watching their elders, not from a book.',
			},
			{
				name: 'Riyal — pusaka a malong',
				note: 'Heirloom cloth. BCPCH exhibited one passed down 6 generations, last held by a 105-year-old woman from Sultan Kudarat, and no longer produced.',
			},
		],
		sound: [
			{
				name: 'Kutyapi',
				note: 'A 2-stringed plucked lute, and one of the hardest Filipino traditional instruments to master. One string holds a rhythmic drone; the other carries the melody on movable frets across two pentatonic scales.',
			},
			{
				name: 'Kulintang',
				note: 'The gong-chime row, the most popular instrument among the Maguindanaon — played with the agong, the gandingan, the palendag and the tambul.',
			},
		],
		livingTreasure: {
			name: 'Samaon Sulaiman',
			title: 'Musician',
			place: 'Maguindanao',
			note: 'A barber by trade and the most acclaimed kutyapi master and teacher of his generation, with a repertoire spanning dinaladay, linapu, minuna and binalig. He taught the other acknowledged experts around him.',
			href: 'https://bcpch.bangsamoro.gov.ph/samaon-sulaiman/',
		},
		photos: { food: 'pastil', craft: 'agung' },
		sources: [
			bcpch('maguindanaon', 'Maguindanaon'),
			SOURCE.inaul,
			bcpch('samaon-sulaiman', 'Samaon Sulaiman'),
			SOURCE.eid,
			SOURCE.halal,
		],
	},

	{
		slug: 'tausug',
		name: 'Tausug',
		meaning: 'tau (person) + suug, the old name of Jolo Island',
		homeland: 'The Sulu archipelago, with communities across the region and beyond it',
		intro:
			'BCPCH names the Tausug the dominant group of the Sulu archipelago on the strength of its political and religious institutions, with settlements reaching into Cotabato, Zamboanga del Sur and Malaysia. Two dialects divide the coast from the interior: parianum along the shores of Jolo, gimbahanun inland. Note that Jolo itself is no longer in BARMM — the Supreme Court excluded Sulu from the region — but the Tausug remain one of the peoples BCPCH lists as Bangsamoro, and Tausug communities live throughout it.',
		food: [
			{
				name: 'Tiyula itum',
				note: 'The black soup, and the dish the whole table is built around. Its colour comes from burnt coconut meat ground into a broth of beef, ginger, turmeric, onions and lemongrass. Served on special occasions rather than on an ordinary night.',
			},
			{
				name: 'Piyanggang manok',
				note: 'Chicken in the same burnt-coconut register — one of the dishes BARMM lists beside tiyula itum for the Eid table.',
			},
			{
				name: 'Kurma, kalliya and piyassak',
				note: 'The rest of the celebration spread as BARMM records it: a set of dishes, not a single main course.',
			},
			{
				name: 'The dulang',
				note: 'Not a dish but the shape of the meal. After the Eid prayer a dulang — a low dining table — is set with everything at once, and the family eats from it together.',
			},
		],
		craft: [
			{
				name: 'Pis siyabit',
				note: 'The woven square worn as a head covering, also cut into bags and attire. A 39-by-40-inch cloth takes about 3 months. Preparing the warp alone takes 3 days of stringing black and red thread across a banana-and-bamboo frame.',
			},
			{
				name: 'Learned from mothers',
				note: '“This is what we’ve grown up with,” the weavers of Barangay Parang told BCPCH. “It is something we’ve learned from our mothers.” For women with no land to farm, the cloth is the income.',
			},
		],
		sound: [
			{
				name: 'Parianum and gimbahanun',
				note: 'The two Tausug dialects — the coastal speech of Jolo and the speech of the interior. The language itself is drawn from the vocabulary of Tagimaha, in whose locality the Sultan of Sulu established Buansa as his capital.',
			},
		],
		livingTreasure: {
			name: 'Darhata Sawabi',
			title: 'Textile Weaver',
			place: 'Parang, Jolo, Sulu',
			note: 'Recognised by her own community of weavers for bold contrasting colours, the evenness of her weave, and her faithfulness to traditional designs — which let her price her work above the going rate.',
			href: 'https://bcpch.bangsamoro.gov.ph/darhata-sawabi/',
		},
		photos: { food: 'tiyulaItum', craft: 'pisSiyabit' },
		sources: [bcpch('tausug', 'Tausug'), bcpch('darhata-sawabi', 'Darhata Sawabi'), SOURCE.eid],
	},

	{
		slug: 'yakan',
		name: 'Yakan',
		meaning: '“Dayak origin”',
		homeland: 'Basilan — Lamitan, Tipo-Tipo, Sumisip and Tuburan',
		intro:
			'BCPCH traces the Yakan to the Orang Dyaks of eastern Indonesia, and notes that they speak a dialect of the Sama language while carrying Tausug cultural influence. They farm upland rice and, unusually, do not live in compact villages — houses sit on their own plots, just out of sight of the nearest neighbour. BCPCH sums them up in one line: famous for their beautiful weaving and their colourful traditional clothes and customs.',
		food: [
			{
				name: 'Lokot-lokot',
				note: 'Also called ja. Rice-flour noodles fried until golden and crunchy, then shaped into a roll or a triangle. A Basilan staple of the Eid table.',
			},
			{
				name: 'Panyalam',
				note: 'A fried pancake, and the sweet that completes the Yakan Eid’l Fitr feast.',
			},
		],
		craft: [
			{
				name: 'Tennun',
				note: 'Yakan weaving — tiny motifs, dense colour, and techniques only a seasoned weaver can attempt, with some designs restricted to a single category of cloth.',
			},
			{
				name: 'Suwah bekkat and suwah pendan',
				note: 'The cross-stitch-like and embroidery-like embellishments of the bunga sama category — the pair of techniques that mark out a master.',
			},
			{
				name: 'The bayre',
				note: 'An old custom: when a girl was born, the traditional midwife cut the umbilical cord with the bayre, the wooden bar used to beat in the weft on the loom. Cut that way, it was believed, she would grow up to be an accomplished weaver.',
			},
		],
		sound: [
			{
				name: 'Kwintangan kayu',
				note: '5 wooden logs hung horizontally, shortest nearest the ground. After the rice is planted, an unroofed platform is built high in a tree and the kwintangan kayu is played to serenade the palay — the resonance is believed to rouse the plants and coax a bigger yield.',
			},
			{
				name: 'Gabbang and agung',
				note: 'The bamboo xylophone and the bossed gong. Yakan tradition assigns the kwintangan to women and the agung to men — a line Uwang Ahadas crossed on the strength of his playing.',
			},
		],
		livingTreasure: {
			name: 'Ambalang Ausalin',
			title: 'Textile Weaver, 2016',
			place: 'Parangbasak, Lamitan City',
			note: 'Apuh Ambalang to her community, and held to be without equal in Lamitan: she can bring forth every design and every textile category the Yakan have, and knows what each one means as well as how it is made.',
			href: 'https://bcpch.bangsamoro.gov.ph/ambalang-ausalin/',
		},
		photos: { food: 'kulintang', craft: 'yakanWeaving' },
		sources: [
			bcpch('yakan', 'Yakan'),
			bcpch('ambalang-ausalin', 'Ambalang Ausalin'),
			bcpch('uwang-ahadas', 'Uwang Ahadas'),
			SOURCE.eid,
		],
	},

	{
		slug: 'sama',
		name: 'Sama',
		homeland: 'Tawi-Tawi and the island seas — Sulu, Basilan and the coasts between',
		intro:
			'The Sama world is a maritime one, and its kitchen shows it. Where the mainland cooks coconut and rice, Tawi-Tawi cooks what comes out of the water that morning — and BARMM’s own Ramadhan reporting from the province reads less like a menu than a tide table.',
		food: [
			{
				name: 'Okoh-okoh',
				note: 'Sea urchin stuffed with rice cooked in coconut water, so the sweetness of the rice runs against the salt of the shell.',
			},
			{
				name: 'Teheh-teheh with siyanglag',
				note: 'Freshly harvested sea urchin, eaten with roasted cassava and shredded coconut.',
			},
			{
				name: 'Tayum, gamay and kahanga',
				note: 'Sea urchins eaten raw or dressed with vinegar and spices; gamay, the sea grapes taken fresh or with vinegar; and kahanga, an edible marine snail close to a spider conch.',
			},
			{
				name: 'Sabaw butung',
				note: 'Fresh coconut juice, husked at the market stall — what people drink to rehydrate before evening prayers.',
			},
			{
				name: 'Daral, pasung and durul',
				note: 'A rolled crepe filled with sweetened coconut; a cone-shaped rice cake with a chewy bite; and glutinous rice steamed in banana leaves.',
			},
			{
				name: 'Bawlu, panggih and mandi',
				note: 'A fluffy golden cake for after the fast, and two more of the coloured sweets that fill a Tawi-Tawi market through Ramadhan.',
			},
		],
		craft: [
			{
				name: 'Tepo',
				note: 'The pandan mat. Weavers prefer the thorny leaf variety because it makes stronger strips — thorns pared off by knife, leaves stripped with a jangat deyum, sun-dried, pressed flat under a log, then dyed. About 3 months for one mat.',
			},
			{
				name: 'A women’s craft',
				note: 'Mat weaving passes down the mother’s line and men in Sama culture do not take it up. Every stage, from harvesting the leaves to executing the design, belongs to women.',
			},
			{
				name: 'Colour by choice',
				note: 'The forebears’ mats were plain white. Haja Amina Appi took up commercial anjibi dye and built the complex geometric patterns the Sama mat is now known for, backed by a plain white outer mat.',
			},
		],
		sound: [],
		livingTreasure: {
			name: 'Haja Amina Appi',
			title: 'Mat Weaver',
			place: 'Ungos Matata, Tandubas, Tawi-Tawi',
			note: 'Master mat weaver of her community, recognised for a precise sense of design, proportion and symmetry, and for an unerring instinct for colour — mats that read as applied mathematics as much as craft.',
			href: 'https://bcpch.bangsamoro.gov.ph/haja-amina-appi/',
		},
		photos: { food: 'panampangan', craft: 'tepoMat' },
		sources: [
			bcpch('haja-amina-appi', 'Haja Amina Appi'),
			SOURCE.tawiIftar,
			bcpch('bangsamoro-people', 'Bangsamoro People'),
		],
	},
]

/** The three columns every entry is read across. */
export const TRIBE_COLUMNS = [
	{ key: 'food', eyebrow: 'On the table', blurb: 'What is cooked, and when it is cooked.' },
	{ key: 'craft', eyebrow: 'In the hand', blurb: 'Cloth, mat, house, boat.' },
	{ key: 'sound', eyebrow: 'In the air', blurb: 'What is played, sung, and spoken.' },
] as const
