/* ============================================================
   Discover: the destination pages (user decision: a modern travel
   app's showcase, one area at a time, Maguindanao del Norte first)

   Each destination names the photographs its header turns through
   and the place its full-width band stands on. Every photograph is
   one of the area's own places' (`datasets/places/places.json`), by
   place slug and image index, so the credit is the place's credit.
   ============================================================ */

export type Shot = { place: string; image: number }

export type Destination = {
	slug: string
	/** The header's photographs, in the order they turn. The first is the one a phone and a still page show. */
	hero: Shot[]
	/** The place the full-width band in the middle of the page stands on. */
	feature?: Shot
	/** A photograph for each "known for" line, in the same order: a place the line names, credited on the tile; null where no place shows it. */
	knownFor?: (Shot | null)[]
	/** A line under each of the eat and stay rails. */
	eat?: string
	stay?: string
	/** The province's seal, from the landing site's directory, shown above its name. */
	seal?: string
	/** The province's woven cloth: its four colours (as the crafts dataset gives them) tint the name and weave a strip under it. */
	weave?: { colors: [string, string, string, string]; label: string; href: string }
}

const SEAL = (slug: string) => `https://betterbarmm.com/directory/seals/${slug}.png`

// Inaul, the Maguindanaon handwoven cloth: purple, green, gold and red (datasets/crafts/crafts.json).
const INAUL: Destination['weave'] = { colors: ['#5B2A6E', '#3F7A3A', '#D4A72C', '#B3202A'], label: 'In the colours of the inaul, the Maguindanaon woven cloth', href: 'https://betterbarmm.com/crafts/inaul' }

export const DESTINATIONS: Destination[] = [
	{
		slug: 'maguindanao-del-norte',
		hero: [
			{ place: 'upi-uplands', image: 0 },
			{ place: 'masjid-alqudra', image: 0 },
			{ place: 'blue-lagoon-datu-odin-sinsuat', image: 2 },
			{ place: 'ranao-pilayan-falls', image: 3 },
		],
		feature: { place: 'blue-lagoon-datu-odin-sinsuat', image: 1 },
		seal: SEAL('maguindanao-del-norte'),
		// Illana Bay coast (Bongo Island, off Parang), the Upi uplands, Polloc port, and Upi for its festival.
		knownFor: [
			{ place: 'bongo-island', image: 0 },
			{ place: 'upi-uplands', image: 1 },
			{ place: 'illana-bay-coast', image: 0 },
			{ place: 'ranao-pilayan-falls', image: 1 },
		],
		weave: INAUL,
		eat: 'Halal kitchens, cafés and the Maguindanaon table.',
		stay: 'Beach resorts on the coast; Cotabato City’s hotels are 30 minutes away.',
	},
	{
		slug: 'cotabato-city',
		hero: [
			{ place: 'grand-mosque-cotabato', image: 1 },
			{ place: 'pedro-colina-hill', image: 0 },
			{ place: 'bangsamoro-government-center', image: 0 },
			{ place: 'rio-grande-de-mindanao', image: 3 },
		],
		feature: { place: 'kutawato-caves', image: 0 },
		seal: SEAL('cotabato-city'),
		// The Grand Mosque, PC Hill and the caves, pastil (no place shows it), the festival on the river.
		knownFor: [{ place: 'grand-mosque-cotabato', image: 0 }, { place: 'pedro-colina-hill', image: 1 }, null, { place: 'rio-grande-de-mindanao', image: 0 }],
		weave: INAUL,
		eat: 'Pastil stalls, cafés and the city’s Maguindanaon kitchens.',
		stay: 'The region’s widest choice of hotels, most of them near the city centre.',
	},
	{
		slug: 'tawi-tawi',
		hero: [
			{ place: 'sangay-siapo-island', image: 2 },
			{ place: 'bud-bongao', image: 0 },
			{ place: 'sheik-makhdum-mosque', image: 0 },
			{ place: 'sitangkai', image: 0 },
		],
		feature: { place: 'panampangan-island', image: 0 },
		seal: SEAL('tawi-tawi'),
		// Bud Bongao, Panampangan, the Simunul mosque, Sitangkai, seaweed (no place shows it).
		knownFor: [{ place: 'bud-bongao', image: 1 }, { place: 'panampangan-island', image: 1 }, { place: 'sheik-makhdum-mosque', image: 1 }, { place: 'sitangkai', image: 2 }, null],
		// Tepo, the Sama woven mat (datasets/crafts/crafts.json).
		weave: { colors: ['#D81B7A', '#1E8C8C', '#E8C33A', '#F2E6C9'], label: 'In the colours of the tepo, the Sama woven mat', href: 'https://betterbarmm.com/crafts/tepo' },
		eat: 'Cafés and seafood kitchens in Bongao, the capital.',
		stay: 'Beach resorts and inns in Bongao, the base for the islands.',
	},
	{
		slug: 'lanao-del-sur',
		hero: [
			{ place: 'lake-lanao', image: 1 },
			{ place: 'marawi-grand-mosque', image: 3 },
			{ place: 'lake-dapao', image: 0 },
			{ place: 'mount-ragang', image: 0 },
		],
		feature: { place: 'kawayan-torogan', image: 0 },
		seal: SEAL('lanao-del-sur'),
		// Lake Lanao, Tugaya, the Aga Khan Museum, torogan and okir, the highland cool.
		knownFor: [
			{ place: 'lake-lanao', image: 0 },
			{ place: 'tugaya', image: 3 },
			{ place: 'aga-khan-museum', image: 0 },
			{ place: 'kawayan-torogan', image: 1 },
			{ place: 'mount-matampor', image: 0 },
		],
		// Malong a landap, the Maranao tube skirt (datasets/crafts/crafts.json).
		weave: { colors: ['#B0124F', '#E0A526', '#2E6B3F', '#4B1E5A'], label: 'In the colours of the malong a landap, the Maranao woven cloth', href: 'https://betterbarmm.com/crafts/malong-a-landap' },
		eat: 'Lakeside cafés in Marawi and the highland coffee of Wao.',
		stay: 'Hotels in Marawi, a few of them over the lake.',
	},
	{
		slug: 'maguindanao-del-sur',
		hero: [
			{ place: 'masjid-dimaukom', image: 0 },
			{ place: 'ligawasan-marsh', image: 1 },
			{ place: 'lake-buluan', image: 0 },
			{ place: 'masjidil-haron-rashid', image: 0 },
		],
		feature: { place: 'ligawasan-marsh', image: 3 },
		seal: SEAL('maguindanao-del-sur'),
		// The Pink Mosque, the marsh; no place shows the farming belt or the kulintang.
		knownFor: [{ place: 'masjid-dimaukom', image: 1 }, { place: 'ligawasan-marsh', image: 2 }, null, null],
		weave: INAUL,
		eat: 'Cafés and kitchens along the highway towns, Buluan to Datu Piang.',
	},
	{
		slug: 'basilan',
		hero: [
			{ place: 'malamawi-island', image: 0 },
			{ place: 'bulingan-falls', image: 1 },
			{ place: 'basilan-national-park', image: 0 },
			{ place: 'calugusan-beach', image: 0 },
		],
		feature: { place: 'malamawi-island', image: 1 },
		seal: SEAL('basilan'),
		// Yakan weaving, the Lamitan festival, rubber and coffee (no place shows it), Bulingan, Malamawi.
		knownFor: [{ place: 'ambalang-museum', image: 3 }, { place: 'lamitan', image: 0 }, null, { place: 'bulingan-falls', image: 2 }, { place: 'malamawi-island', image: 3 }],
		// Yakan tennun, the Yakan woven cloth (datasets/crafts/crafts.json).
		weave: { colors: ['#C62828', '#F2B705', '#2E7D32', '#5E2A84'], label: 'In the colours of the Yakan tennun, the woven cloth of Lamitan', href: 'https://betterbarmm.com/crafts/yakan-tennun' },
		eat: 'Cafés and bakeshops in Lamitan and along the coast.',
		stay: 'A riverside resort, inns and a hostel in Lamitan.',
	},
	{
		slug: 'special-geographic-area',
		// One photographed place so far; no seal of its own.
		hero: [{ place: 'fort-pikit', image: 0 }],
		// The plebiscite (no place shows it), the marsh's western reaches.
		knownFor: [null, { place: 'ligawasan-marsh', image: 1 }],
		weave: INAUL,
	},
]

export const findDestination = (slug: string) => DESTINATIONS.find((d) => d.slug === slug)
