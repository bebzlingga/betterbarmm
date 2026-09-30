import dataset from '../../../datasets/lgu/barmm-lgu.json'

/* ============================================================
   The local government directory

   Province → city or municipality → barangay, for every unit in
   BARMM. The dataset is built from PSA's Philippine Standard
   Geographic Code for the structure and Wikidata — which is CC0 and
   carries PSA's census figures with their census dates — for
   population and land area.

   Three things about it are worth knowing before reading a number off
   a page:

   · Sulu is not here. The Supreme Court removed it from BARMM, so any
     PSA total that still counts Sulu will be larger than the totals
     in this directory. 108 units rather than 127.

   · Maguindanao is split. PSGC still publishes the undivided province;
     the division into del Norte and del Sur was ratified in 2022, and
     is applied here by municipality.

   · Cotabato City is listed as an area of its own. PSA and COMELEC both
     file it inside Maguindanao del Norte, so PSA's provincial figure of
     1,124,811 already contains the city's 383,383. The province figure
     here has the city taken out of it — otherwise the region would be
     counted 383,383 people larger than it is.

   · The Special Geographic Area's 8 municipalities were ratified in
     April 2024 and are newer than the PSGC edition underneath this,
     so they are transcribed from the Parliament and PSA announcements
     and carry no census figures of their own yet.

   · Province land area is the province's own published figure and is
     never summed from its municipalities. Philippine municipal areas
     are self-reported and overlap across disputed boundaries —
     Basilan's 12 units add to 2,593 km² against a province of roughly
     1,327 — so the sum is not a measurement of anything. Where a
     province has no published figure the field is blank.

   Where a figure is missing it is `null` and the page says so. A blank
   is a fact about the record; a zero would be a claim about the place.
   ============================================================ */

export type Candidate = {
	name: string
	party: string | null
	votes: number
	percentage: number
}

/**
 * One contest as COMELEC canvassed it.
 *
 * `ranked` is every candidate, highest votes first. `seats` is how many of
 * them were elected — 1 for a mayor, 8 or 10 for a council, and null where the
 * number is not fixed by statute (a provincial board's size varies), in which
 * case the page shows the tally without drawing a line through it.
 */
export type Contest = {
	contestName: string
	seats: number | null
	ranked: Candidate[]
}

export type UnitOfficials = {
	mayor?: Contest
	viceMayor?: Contest
	council?: Contest[]
}

export type ProvinceOfficials = {
	governor?: Contest
	viceGovernor?: Contest
	board?: Contest[]
}

/**
 * A term of office, and how good the record of it is.
 *
 * `current` is the term this directory holds COMELEC's own Certificate of
 * Canvass for. `canvass` is a term OpenHalalan rebuilt from archived returns
 * and that still carries every candidate and every vote — the same kind of
 * fact, one remove further from the source. `winners` is a term for which
 * only the name of whoever took each office survives.
 *
 * The status is the best any unit has in that term, not a promise about every
 * unit: 2010 and 2013 are `canvass` terms in which about half the region has
 * only a roll. What a given town actually has is on its own record, and
 * `note` says how complete the cycle is.
 *
 * The distinction is the point. A roll must not render as though it were a
 * canvass, so the two carry different shapes and the pages that draw them
 * cannot get them confused.
 */
export type OfficialsTerm = {
	id: string
	label: string
	election: string
	electionDay: string
	start: string
	end: string
	source: { label: string; href: string }
	status: 'current' | 'canvass' | 'winners'
	note?: string
}

/** Officials keyed by term id. */
export type OfficialsByTerm<T> = Record<string, T | undefined>

export type Barangay = {
	psgc: string | null
	name: string
}

export type LguUnit = {
	psgc: string | null
	name: string
	slug: string
	isCity: boolean
	/** Which kind of city — the two behave differently at the ballot box. */
	cityClass?: 'Component city' | 'Independent component city'
	isCapital: boolean
	population: number | null
	population2020: number | null
	areaKm2: number | null
	/** The name the law gave it, where that is not the name PSGC files it under. */
	alsoKnownAs?: string
	/** Which act renamed it, and why this directory still uses the old name. */
	nameNote?: string
	/** Why a figure is blank, or which basis it is on. Printed where it exists. */
	populationNote?: string
	/** Only on Special Geographic Area units — the town they were carved from. */
	formedFrom?: string
	/** COMELEC's own code for the unit, where it canvassed one. */
	comelecCode?: string
	/** Keyed by term id. Absent where COMELEC recorded no canvass for the unit. */
	officials?: OfficialsByTerm<UnitOfficials>
	barangays: Barangay[]
}

export type LguProvince = {
	psgc: string | null
	name: string
	slug: string
	kind: 'Province' | 'City' | 'Special area'
	note?: string
	population: number | null
	population2020: number | null
	areaKm2: number | null
	/** Whether the population is the province's own census figure or a sum. */
	populationSource?:
		| 'province census record'
		| 'summed from municipalities'
		| 'province census record less Cotabato City'
	/** Why the figure is on the basis it is. Printed where it exists. */
	populationNote?: string
	barangayCount: number
	officials?: OfficialsByTerm<ProvinceOfficials>
	municipalities: LguUnit[]
}

export type LguDataset = {
	name: string
	generatedAt: string
	note: string
	sources: Record<string, { label: string; href: string }>
	totals: {
		provinces: number
		lgus: number
		cities: number
		barangays: number
		population: number
		note?: string
	}
	/** The terms on offer, newest first, and which one is current. */
	officials?: {
		terms: OfficialsTerm[]
		currentTermId: string
		note: string
	}
	provinces: LguProvince[]
}

/** The winners of a contest — the top `seats` by votes. */
export function winners(contest: Contest): Candidate[] {
	return contest.seats == null ? [] : contest.ranked.slice(0, contest.seats)
}

/** Everyone else, in the order they finished. */
export function runnersUp(contest: Contest): Candidate[] {
	return contest.seats == null ? contest.ranked : contest.ranked.slice(contest.seats)
}

const TERM = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })

export function formatDate(iso: string): string {
	return TERM.format(new Date(`${iso}T00:00:00Z`))
}

export const lguData = dataset as LguDataset

export const lguProvinces = lguData.provinces

/** The terms on offer, newest first. */
export const officialsTerms = lguData.officials?.terms ?? []

export function findTerm(id: string): OfficialsTerm | undefined {
	return officialsTerms.find((term) => term.id === id)
}

export function findProvince(slug: string): LguProvince | undefined {
	return lguProvinces.find((province) => province.slug === slug)
}

export function findUnit(
	provinceSlug: string,
	unitSlug: string,
): { province: LguProvince; unit: LguUnit } | undefined {
	const province = findProvince(provinceSlug)
	const unit = province?.municipalities.find((m) => m.slug === unitSlug)
	return province && unit ? { province, unit } : undefined
}

/** Every province/unit pair, for `generateStaticParams`. */
export function allUnitParams() {
	return lguProvinces.flatMap((province) =>
		province.municipalities.map((unit) => ({
			province: province.slug,
			municipality: unit.slug,
		})),
	)
}

const NUMBER = new Intl.NumberFormat('en-US')

export function formatNumber(value: number | null | undefined): string {
	return value == null ? '—' : NUMBER.format(value)
}

export function formatArea(value: number | null | undefined): string {
	return value == null ? '—' : `${NUMBER.format(Math.round(value * 100) / 100)} km²`
}

/**
 * People per square kilometer.
 *
 * Returned as a number so the caller can decide how to print it, and null
 * whenever either input is missing — a density computed from a missing
 * population is not a low density, it is no reading at all.
 */
export function density(unit: { population: number | null; areaKm2: number | null }): number | null {
	if (unit.population == null || !unit.areaKm2) return null
	return Math.round(unit.population / unit.areaKm2)
}

/**
 * Growth between the 2020 and 2024 censuses, as a percentage.
 *
 * 4 years apart, so this is total change over the period rather than an annual
 * rate — labeled that way wherever it is printed.
 */
export function growth(unit: {
	population: number | null
	population2020: number | null
}): number | null {
	if (unit.population == null || !unit.population2020) return null
	return Math.round(((unit.population - unit.population2020) / unit.population2020) * 1000) / 10
}

/** The largest units in a province, for a "biggest towns" strip. */
export function largestUnits(province: LguProvince, count = 3): LguUnit[] {
	return [...province.municipalities]
		.filter((unit) => unit.population != null)
		.sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
		.slice(0, count)
}

/** What the province's own units add up to, and how many are missing a figure. */
export function municipalTotal(province: LguProvince): { sum: number; missing: number } {
	return province.municipalities.reduce(
		(carry, unit) =>
			unit.population == null
				? { ...carry, missing: carry.missing + 1 }
				: { ...carry, sum: carry.sum + unit.population },
		{ sum: 0, missing: 0 },
	)
}

/**
 * The people in a province that its own municipalities do not account for.
 *
 * Two provinces do not reconcile. Maguindanao del Norte is missing two units'
 * 2024 counts outright — the source record gave both a neighbour's figure, so
 * both are blank here rather than wrong. Maguindanao del Sur's units fall a
 * little short of its published provincial total for reasons the record does
 * not explain.
 *
 * Computed rather than written down, so the number on the page can never drift
 * from the units above it. Null where the province has no figure of its own,
 * and null where everything already adds up.
 */
export function unaccounted(
	province: LguProvince,
): { people: number; missingUnits: number } | null {
	if (province.population == null) return null
	const { sum, missing } = municipalTotal(province)
	const people = province.population - sum
	return people === 0 ? null : { people, missingUnits: missing }
}

/** How a unit describes itself — "component city", "municipality". */
export function unitClass(unit: LguUnit): string {
	if (!unit.isCity) return 'Municipality'
	return unit.cityClass ?? 'City'
}

/**
 * True where an area is a single unit of the same name.
 *
 * Only Cotabato City. Its area page would be a list of one thing, named after
 * the thing — a click between the reader and the page they wanted — so
 * everything that links to an area links past it, and the area page itself
 * redirects.
 */
export function isSingleUnitArea(province: LguProvince): boolean {
	return (
		province.municipalities.length === 1 && province.municipalities[0]?.name === province.name
	)
}

/** Where a link to an area should actually go. */
export function areaHref(province: LguProvince): string {
	return isSingleUnitArea(province)
		? `/${province.slug}/${province.municipalities[0]!.slug}`
		: `/${province.slug}`
}

export type LguIndexEntry = {
	name: string
	slug: string
	href: string
	province: LguProvince
	unit: LguUnit
	/** Everything a reader might type: the unit, its province, its barangays. */
	haystack: string
}

/**
 * Every city and municipality in one flat, pre-lowercased list.
 *
 * Built once at module load because the dataset is static and 108 units is
 * nothing — the finder can filter the whole region on every keystroke without
 * an index, a worker, or a request. Barangay names ride along in the haystack
 * so that typing the village you actually live in finds the town that holds
 * it, which is the search most readers arrive wanting to run.
 */
export const lguIndex: LguIndexEntry[] = lguProvinces.flatMap((province) =>
	province.municipalities.map((unit) => ({
		name: unit.name,
		slug: unit.slug,
		href: `/${province.slug}/${unit.slug}`,
		province,
		unit,
		haystack: [
			unit.name,
			// Two units were renamed by Autonomy Act and PSGC never followed. A
			// reader who knows the town as Sultan Sumagka should not have to know
			// that COMELEC still calls it Talitay to find it.
			unit.alsoKnownAs ?? '',
			province.name,
			unit.formedFrom ?? '',
			unit.barangays.map((barangay) => barangay.name).join(' '),
		]
			.join(' ')
			.toLowerCase(),
	})),
)

/**
 * Units matching a query, best first.
 *
 * A unit whose own name starts with the query outranks one that merely
 * contains it, which outranks one matched only through a barangay — so typing
 * "bul" puts Buluan above Buldon's barangay list rather than sorting the
 * region alphabetically and hoping.
 */
export function searchUnits(query: string, limit = 8): LguIndexEntry[] {
	const q = query.trim().toLowerCase()
	if (q.length < 2) return []

	return lguIndex
		.map((entry) => {
			const name = entry.name.toLowerCase()
			const alias = entry.unit.alsoKnownAs?.toLowerCase() ?? ''
			const rank =
				name.startsWith(q) || alias.startsWith(q)
					? 0
					: name.includes(q) || alias.includes(q)
						? 1
						: entry.province.name.toLowerCase().includes(q)
							? 2
							: entry.haystack.includes(q)
								? 3
								: 4
			return { entry, rank }
		})
		.filter((row) => row.rank < 4)
		.sort((a, b) => a.rank - b.rank || a.entry.name.localeCompare(b.entry.name))
		.slice(0, limit)
		.map((row) => row.entry)
}
