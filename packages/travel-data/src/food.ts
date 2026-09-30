/* ============================================================
   Food

   The most useful thing this guide can do for a traveler, because
   the food is the part of the Bangsamoro that is genuinely
   world-class and the part that is least written about. It is also
   the part where a visitor is most likely to be handed something and
   have no idea what it is.

   Three framing facts sit under everything below:

   · The region is Muslim and the food is halal. There is no pork,
     and alcohol is restricted or prohibited in many local
     jurisdictions. A traveler who arrives expecting the Filipino
     canon of lechon and sisig will find neither, and will be much
     better off for it.

   · There is no single "Bangsamoro cuisine". Maranao, Maguindanaon,
     Tausug, Sama, Yakan and Iranun cooking are related but distinct,
     and a dish claimed by one is often made differently by the
     others. Each entry names whose it is.

   · Sulu is not in BARMM any more, but Tausug cooking is on the
     table across the region and pretending otherwise would make this
     list wrong. Where a dish is Tausug in origin, it says so.

   No restaurant addresses and no prices. Restaurants in this region
   open and close faster than a guide can track, and the best cooking
   is in homes and at markets in any case — so what is given is what
   to look for and where that kind of place is, which stays true.
   ============================================================ */

export type FoodTradition = 'Maranao' | 'Maguindanaon' | 'Tausug' | 'Sama' | 'Yakan' | 'Iranun' | 'Shared'

export type Dish = {
	slug: string
	name: string
	tradition: FoodTradition
	/** One line for a card. */
	summary: string
	detail: string
	/** Where a visitor realiztically encounters it. */
	whereToFind: string
	/** True for the handful nobody should leave without eating. */
	essential?: boolean
}

export const dishes: Dish[] = [
	{
		slug: 'palapa',
		name: 'Palapa',
		tradition: 'Maranao',
		essential: true,
		summary: 'The condiment the whole Maranao kitchen is built on — scallion bulb, ginger, chilli, coconut.',
		detail:
			'Sakurab — the bulb of a native scallion — pounded with ginger, turmeric, chilli and toasted coconut, then cooked down. It is savoury, hot, sweet and aromatic at once, and it is the flavour a visitor will notice in everything from grilled fish to plain rice. Every household makes it differently and every household thinks theirs is correct. If you take one thing home from BARMM, take a jar of this.',
		whereToFind:
			'Sold in jars at every market in Lanao del Sur and Cotabato City, and served alongside almost everything in a Maranao household.',
	},
	{
		slug: 'pastil',
		name: 'Pastil',
		tradition: 'Maguindanaon',
		essential: true,
		summary: 'Rice and shredded meat in a banana leaf — the region’s breakfast, and its icon.',
		detail:
			'A mound of rice topped with kagikit, shredded and fried beef or chicken, wrapped tight in banana leaf and eaten with the hands. It costs very little, it is everywhere in Maguindanao and Cotabato City from early morning, and it is the single most characteristic thing you can eat in the region. Served with a boiled egg and palapa if you want it built up.',
		whereToFind:
			'Roadside stalls and market carts across Cotabato City and both Maguindanao provinces, from dawn. Gone by mid-morning at the good ones.',
	},
	{
		slug: 'piaparan',
		name: 'Piaparan',
		tradition: 'Maranao',
		essential: true,
		summary: 'Chicken or fish cooked in coconut with palapa and turmeric.',
		detail:
			'Piaparan a manok is chicken simmered in thick coconut milk with palapa, turmeric and often shredded coconut, and it is the Maranao dish to order if you order one. Yellow, rich and aromatic rather than fiery. Made with fish it becomes piaparan a seda, which is if anything better.',
		whereToFind: 'Maranao restaurants in Marawi and Iligan, and at any celebration in Lanao del Sur.',
	},
	{
		slug: 'tiyula-itum',
		name: 'Tiyula Itum',
		tradition: 'Tausug',
		essential: true,
		summary: 'Black beef soup, colored by burnt coconut.',
		detail:
			'Beef simmered with ginger, lemongrass, galangal and a paste of coconut meat toasted until it is genuinely black. The result is a deep, dark, smoky broth that looks alarming and tastes extraordinary. It is a dish of ceremony among the Tausug and turns up wherever Tausug communities are — which in BARMM means Tawi-Tawi and Basilan.',
		whereToFind:
			'Tausug households and celebrations; some restaurants in Bongao and in Zamboanga City on the way through.',
	},
	{
		slug: 'beef-rendang',
		name: 'Rendang',
		tradition: 'Maranao',
		summary: 'The slow-cooked dry coconut beef curry, in its Philippine form.',
		detail:
			'The same dish that runs across maritime Southeast Asia, and its presence here is a reminder that this region’s culinary neighbours are Sabah and Sulawesi as much as Luzon. Beef cooked down in coconut milk and spice until the liquid is gone and the meat is dark. Maranao versions lean on palapa and turmeric.',
		whereToFind: 'Maranao restaurants and family kitchens across Lanao del Sur.',
	},
	{
		slug: 'kulma',
		name: 'Kulma',
		tradition: 'Tausug',
		summary: 'A mild peanut-and-coconut curry, close to a korma.',
		detail:
			'Beef or chicken in a sauce of coconut milk, ground peanuts and warm spice, and the name gives away the ancestry it shares with the Indian korma. Gentle rather than hot, and often the dish put in front of a guest who has been assumed not to handle chilli.',
		whereToFind: 'Tausug and Sama tables in Tawi-Tawi and Basilan.',
	},
	{
		slug: 'pianggang',
		name: 'Pianggang',
		tradition: 'Tausug',
		summary: 'Grilled chicken in burnt-coconut sauce.',
		detail:
			'Chicken marinated and grilled, then served in a sauce built on the same toasted-black coconut that colors tiyula itum. Smoky, savoury, and the most immediately likeable dish in the Tausug repertoire.',
		whereToFind: 'Grills and celebration tables in Tawi-Tawi and Basilan.',
	},
	{
		slug: 'satti',
		name: 'Satti',
		tradition: 'Tausug',
		essential: true,
		summary: 'Skewered meat in a hot red sauce, with a block of rice — the breakfast of the archipelago.',
		detail:
			'Small skewers of chicken or beef in a thick, sweet-hot red sauce, served with tamu, a compressed block of rice, and eaten first thing in the morning. It is the Sulu archipelago’s answer to satay and it is a breakfast institution across Zamboanga, Basilan and Tawi-Tawi. Ordering is by the number of sticks.',
		whereToFind: 'Dedicated satti houses in Bongao, on Basilan and throughout Zamboanga City. Morning only.',
	},
	{
		slug: 'kiyoning',
		name: 'Kiyoning',
		tradition: 'Maguindanaon',
		summary: 'Turmeric rice, yellow and fragrant, cooked in coconut milk.',
		detail:
			'Rice cooked with turmeric and coconut milk until it is deep yellow and perfumed. It is festival and celebration rice across Maguindanao, and it is what elevates a plate of grilled fish into a meal.',
		whereToFind: 'Celebrations, and Maguindanaon restaurants in Cotabato City.',
	},
	{
		slug: 'junay',
		name: 'Junay',
		tradition: 'Tausug',
		summary: 'Coconut-and-turmeric rice steamed in a banana leaf parcel.',
		detail:
			'Rice cooked with toasted coconut and turmeric, wrapped tight in banana leaf and steamed, so the leaf flavours it through. Portable, keeps well, and traditionally the food taken on a journey — which on this archipelago meant a long boat crossing.',
		whereToFind: 'Markets in Bongao and across Tawi-Tawi and Basilan.',
	},
	{
		slug: 'latoh',
		name: 'Latoh',
		tradition: 'Sama',
		summary: 'Sea grapes, eaten raw with vinegar and chilli.',
		detail:
			'Bright green seaweed with beads that pop and release salt water when you bite them. Dressed simply with vinegar, onion and chilli, and eaten as a side or a salad. Tawi-Tawi is a seaweed province and this is the most direct way to taste that.',
		whereToFind: 'Any market in Tawi-Tawi, and on tables throughout the archipelago.',
	},
	{
		slug: 'agar-agar-salad',
		name: 'Agal-agal',
		tradition: 'Sama',
		summary: 'Cultivated seaweed, the crop the province lives on, eaten fresh.',
		detail:
			'The seaweed farmed on racks across the shallows of Tawi-Tawi is grown for agar, but it is also eaten fresh in salads with coconut, calamansi and chilli. It is worth eating where it is grown, if only to connect the racks in the water with something on a plate.',
		whereToFind: 'Tawi-Tawi markets and households; the drying lines are visible everywhere.',
	},
	{
		slug: 'inato',
		name: 'Inato',
		tradition: 'Maranao',
		summary: 'Everyday Maranao home cooking, served as a set with rice and palapa.',
		detail:
			'Not one dish but the ordinary Maranao meal: a fried or grilled protein, rice, a vegetable, and palapa on the side to make it all work. Ordering "inato" in a small Maranao eatery is ordering the house’s version of lunch, and it is the most reliable way to eat well cheaply in Lanao del Sur.',
		whereToFind: 'Small eateries in Marawi and around Lake Lanao.',
	},
	{
		slug: 'tinagtag',
		name: 'Tinagtag',
		tradition: 'Maguindanaon',
		summary: 'A lattice of fried rice-flour batter, crisp and sweet.',
		detail:
			'Rice flour batter poured through a perforated can into hot oil so it lands in threads, then gathered and folded into a crisp golden lattice. A festival sweet in Maguindanao, made for Eid and for weddings, and one of the most visually distinctive things in Philippine baking.',
		whereToFind: 'Markets around Eid, and sweet stalls in Cotabato City year-round.',
	},
	{
		slug: 'panyalam',
		name: 'Panyalam',
		tradition: 'Shared',
		summary: 'A fried rice-flour and coconut pancake, chewy in the middle and lacy at the edge.',
		detail:
			'Rice flour, coconut milk and brown sugar, fried until the edges go dark and frilled and the center stays soft. Made across the whole region under close variations of the same name, and the most common sweet a visitor will be handed with coffee.',
		whereToFind: 'Every market in BARMM, and at every gathering.',
	},
	{
		slug: 'dodol',
		name: 'Dodol',
		tradition: 'Shared',
		summary: 'Dark, dense coconut and glutinous-rice toffee, stirred for hours.',
		detail:
			'Glutinous rice, coconut milk and palm or brown sugar cooked down and stirred continuously until it thickens into a dark chewy slab. The stirring is the whole story — it takes hours and it is a communal job, which is why dodol is associated with celebrations rather than everyday cooking. Found from here to Java under the same name.',
		whereToFind: 'Markets across the region, wrapped in cellophane or leaf; heaviest around Eid.',
	},
	{
		slug: 'daral',
		name: 'Daral',
		tradition: 'Shared',
		summary: 'A thin green crepe rolled around sweet coconut.',
		detail:
			'A soft crepe, usually colored green with pandan, wrapped around a filling of coconut cooked with sugar. Light, and the standard accompaniment to afternoon coffee across the region.',
		whereToFind: 'Markets and bakeries region-wide.',
	},
	{
		slug: 'bangbang-sug',
		name: 'Bang-bang sug',
		tradition: 'Tausug',
		summary: 'The Tausug sweet tray — baulo, wadjit, jualan and the rest of it.',
		detail:
			'A category rather than a dish: the assortment of traditional sweets laid out for guests and celebrations across the Sulu archipelago. Baulo, a soft baked cake; wadjit, glutinous rice in coconut and sugar; jualan, fried banana. Brightly colored, very sweet, and served with coffee.',
		whereToFind: 'Bongao and Basilan markets, and any celebration table.',
	},
	{
		slug: 'kahawa',
		name: 'Kahawa',
		tradition: 'Shared',
		summary: 'Local coffee, taken strong, sweet and often spiced.',
		detail:
			'Coffee is grown on Basilan and across the archipelago, and it is drunk strong and heavily sweetened, sometimes with ginger. In the Sulu tradition it is often brewed with spice. It arrives with sweets and it is the medium through which most conversations in this region happen — declining the second cup takes effort.',
		whereToFind: 'Everywhere, all day. Basilan coffee is worth seeking out and taking home.',
	},
]

/** What a visitor should not leave without eating. */
export const essentialDishes = (): Dish[] => dishes.filter((dish) => dish.essential)

export const dishesByTradition = (tradition: FoodTradition): Dish[] =>
	dishes.filter((dish) => dish.tradition === tradition)

export const findDish = (slug: string): Dish | undefined => dishes.find((dish) => dish.slug === slug)

/* ---- How eating actually works here -------------------------------------- */

export type FoodNote = { title: string; body: string }

/**
 * The practical notes, kept separate from the dishes because they are what a
 * visitor gets wrong — and getting them wrong is a matter of manners rather
 * than of missing out.
 */
export const foodNotes: FoodNote[] = [
	{
		title: 'It is all halal, and that is not a restriction',
		body: 'There is no pork on the table and there will not be. What replaces it is a beef, chicken, fish and coconut repertoire with more spice and more depth than the Philippine mainstream, drawing on the same maritime trade routes that brought rendang and korma into the kitchen. Do not go looking for what is absent.',
	},
	{
		title: 'Alcohol',
		body: 'Several local governments in the region prohibit or heavily restrict the sale of alcohol, and social norms discourage it almost everywhere. Assume it is unavailable and unwelcome unless you see otherwise. Coffee is the social drink here and it does a great deal of work.',
	},
	{
		title: 'The best food is not in a restaurant',
		body: 'Markets in the morning, roadside pastil stalls at dawn, satti houses at breakfast, and — above all — houses. If you are invited to eat in someone’s home, that is the meal of your trip and you should rearrange your day around it.',
	},
	{
		title: 'Eating with your hands',
		body: 'Normal, and often the practical way to eat pastil or rice with palapa. Use your right hand. A wash basin or a pitcher is usually offered before and after; take it.',
	},
	{
		title: 'Ramadan',
		body: 'During Ramadan most eateries are closed through daylight hours and many people are fasting. Eating, drinking or smoking in public in daytime is poor form even for non-Muslims. The compensation is iftar at sundown, which is the most generous meal in the calendar and to which visitors are frequently invited.',
	},
	{
		title: 'Ask what it is',
		body: 'People here are pleased when a visitor is interested and will explain at length. The interest is the courtesy — much more so than getting the name right on the first try.',
	},
]
