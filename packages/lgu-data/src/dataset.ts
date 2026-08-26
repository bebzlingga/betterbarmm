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
 * A term of office, and whether we hold the canvass for it.
 *
 * `unavailable` terms are listed on purpose. COMELEC's 2019 results site is
 * gone and its 2022 site serves canvass data only to its own front end, so
 * those terms cannot be transcribed — and a selector that silently offered
 * only 2025 would imply that is all there has ever been.
 */
export type OfficialsTerm = {
	id: string
	label: string
	election: string
	electionDay: string
	start: string
	end: string
	source: { label: string; href: string }
	status: 'current' | 'unavailable'
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
	isCapital: boolean
	population: number | null
	population2020: number | null
	areaKm2: number | null
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
	populationSource?: 'province census record' | 'summed from municipalities'
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
 * People per square kilometre.
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
 * rate — labelled that way wherever it is printed.
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
