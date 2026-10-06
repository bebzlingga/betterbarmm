import {
	areaHref,
	areaSpending,
	barmmBoundaries,
	density,
	growth,
	lguAreas,
	lguData,
	lguProvinces,
	pesoCell,
	sameUnit,
	unitClass,
	winners,
	type Contest,
	type LguProvince,
	type LguUnit,
} from '@betterbarmm/lgu-data'
import { barangayOfficials, unitRosters } from '@betterbarmm/lgu-data/barangay-officials'
import { barangayShapes } from '@betterbarmm/lgu-data/barangay-shapes'
import { nta, ntaFor } from '@betterbarmm/lgu-data/nta'
import { PLACE_KIND_LABEL, SPOT_KIND_LABEL, dishes, findTown, placesInArea, travelAreas } from '@betterbarmm/travel-data'
import acts from '../../../../datasets/bills/baa.min.json'
import billIndex from '../../../../datasets/bills/bangsamoro_registry/bills/official_index.json'
import resolutionIndex from '../../../../datasets/bills/bangsamoro_registry/resolutions/adopted_official_index.json'
import readingsFile from '../../../../datasets/bills/readings.json'
import districtTownsFile from '../../../../datasets/election/district-towns.json'
import resultsFile from '../../../../datasets/election/election-results.json'

/* ============================================================
   The map's data, joined on the server

   The browser gets two kinds of payload and none of the datasets behind
   them: the region (every area and every drawn town, light), fetched when
   the map opens; and one town in full (its officials, places and every
   barangay with its outline and roster), fetched when a reader flies into it.
   ============================================================ */

export type MapArea = {
	slug: string
	name: string
	kind: 'Province' | 'City' | 'Special area'
	d: string | null
	tagline: string | null
	population: number | null
	areaKm2: number | null
	towns: number
	barangays: number
	capital: string | null
	leaders: { role: string; name: string }[]
	seats: number | null
	languages: string[]
	knownFor: string[]
	places: { name: string; kind: string; municipality: string }[]
	spending: { total: string; firstYear: number; latestYear: number; latest: string; projects: number } | null
	lguHref: string
	/** Every town in the area, drawn or not — the way into the ones with no outline. */
	units: { slug: string; name: string }[]
}

/** A town as the region map draws it. */
export type MapUnit = {
	slug: string
	area: string
	name: string
	d: string
	isCity: boolean
	isCapital: boolean
	population: number | null
	/** What each map layer colours and raises the town by. Null where unknown. */
	layers: {
		density: number | null
		/** Latest reported NTA divided by the 2024 population, in pesos. */
		ntaPerResident: number | null
		/** Named places, eateries and stays in the travel guide. */
		guide: number
		/** The party that won the town's parliamentary district in 2026; null where the town spans several. */
		party: string | null
	}
}

export type MapParty = { id: string; label: string; color: string | null; seats: number }

export type MapRegion = {
	viewBox: string
	land: string
	outside: string[]
	source: { label: string; href: string }
	areas: MapArea[]
	units: MapUnit[]
	/** Parties that won a district seat, for the election layer's key. */
	parties: MapParty[]
	ntaYear: number
}

export type MapBarangay = {
	psgc: string | null
	name: string
	/** Null where the boundary edition has no outline for it. */
	d: string | null
	captain: string | null
	council: string[]
	sk: string | null
	secretary: string | null
	treasurer: string | null
}

export type MapUnitDetail = {
	slug: string
	name: string
	area: { slug: string; name: string }
	classification: string
	isCapital: boolean
	alsoKnownAs: string | null
	population: number | null
	population2020: number | null
	growth: number | null
	areaKm2: number | null
	density: number | null
	officials: { role: string; name: string; party: string | null; votes: number | null }[]
	council: string[]
	term: string | null
	captainsListed: number
	places: { name: string; kind: string; summary: string }[]
	barangays: MapBarangay[]
	rostersAsOf: string
	rostersSource: string
	lguHref: string
	foods: MapFood[]
	/** Measures whose titles name this town — or, where none do, its area. */
	related: { scope: 'town' | 'area'; acts: MapMeasure[]; bills: MapMeasure[]; resolutions: MapMeasure[] }
	spending: MapArea['spending']
	travel: MapTravel | null
	election: MapElection | null
	/** The town's National Tax Allotment, once that dataset exists. */
	nta: {
		/** One per year the town reported, oldest first. */
		years: { year: number; amount: string; perResident: string | null; preliminary: boolean }[]
		change: string | null
		province: { name: string; latest: string; year: number } | null
		note: string
		source: { label: string; href: string }
	} | null
}

export type MapTravel = {
	summary: string
	coverage: 'good' | 'thin' | 'none'
	peoples: string[]
	whereToGo: { name: string; kind: string; summary: string }[]
	whatToDo: string[]
	eat: { name: string; kind: string; note: string }[]
	stay: { name: string; kind: string; note: string }[]
	stayNote: string | null
	gettingThere: string
	caution: string | null
	href: string
}

export type MapDistrict = {
	label: string
	totalVotes: number
	candidates: { name: string; party: string; color: string | null; votes: number; won: boolean }[]
}

export type MapElection = {
	districts: MapDistrict[]
	note: string | null
	turnout: { percent: number; registered: number; cast: number }
	source: { label: string; href: string }
	href: string
}

export type MapFood = { name: string; tradition: string; summary: string; whereToFind: string; essential: boolean }

export type MapMeasure = {
	number: number
	title: string
	status: string | null
	date: string | null
	/** The first sentence of its reading, where one has been written. */
	summary: string | null
	href: string
}

/** "ADIONG, MAMINTAL JR." → "Mamintal Adiong Jr.", as a reader would say it. */
export function personName(raw: string): string {
	// DILG fills an empty middle name with "N/A"; it is not part of anyone's name.
	raw = raw.replace(/\s*\bN\/A\b\.?/gi, '').replace(/\s+/g, ' ').trim()
	const title = (s: string) =>
		s.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase())
	const [last, first] = raw.split(/,\s*/)
	if (!first) return title(raw)
	const suffix = first.match(/\s+(JR\.?|SR\.?|II|III|IV)$/i)
	const given = suffix ? first.slice(0, suffix.index) : first
	return `${title(given)} ${title(last)}${
		suffix ? ` ${suffix[1].replace(/^(JR|SR)\.?$/i, (m) => title(m.replace('.', '')) + '.')}` : ''
	}`
}

/* ============================================================
   Measures that name a place

   Titles only: they are what Parliament itself says a measure is about. A
   town is matched as a whole word, and the longest name wins, so "South Upi"
   is not also "Upi". Names that are also people's names or places outside
   the region (Datu Odin Sinsuat, Sultan Kudarat, Ampatuan, Kapatagan, Parang)
   count only with a place cue around them — "Municipality of …", "in …",
   "…, Maguindanao" — or a commendation of a person would file under a town.
   ============================================================ */

const LEGISLATION = 'https://legislation.betterbarmm.com'

type Reading = { category: string; number: number; whatItDoes?: string }
const readingIndex = new Map(
	(readingsFile as { readings: Reading[] }).readings.map((r) => [`${r.category}-${r.number}`, r]),
)
const firstSentence = (category: string, number: number) => {
	const text = readingIndex.get(`${category}-${number}`)?.whatItDoes
	if (!text) return null
	const first = text.split(/\n/)[0]
	const end = first.search(/(?<=[a-z0-9)\]])\.\s/)
	return end > 0 ? first.slice(0, end + 1) : first
}

type Titled = { category: 'acts' | 'bills' | 'adopted-resolutions'; number: number; title: string; status: string | null; date: string | null; href: string }

const titled: Titled[] = [
	...(acts as { records: { baa_number: number; title_short?: string; title_official?: string; date_approved_or_enacted_iso?: string }[] }).records.map((a) => ({
		category: 'acts' as const,
		number: a.baa_number,
		title: `${a.title_short ?? ''} — ${a.title_official ?? ''}`,
		status: 'Enacted',
		date: a.date_approved_or_enacted_iso ?? null,
		href: `${LEGISLATION}/acts/${a.baa_number}`,
	})),
	...(billIndex as { bills: { number: number; title: string; status?: string; as_of?: string }[] }).bills.map((b) => ({
		category: 'bills' as const,
		number: b.number,
		title: b.title,
		status: b.status ?? null,
		date: b.as_of ?? null,
		href: `${LEGISLATION}/bills/${b.number}`,
	})),
	...(resolutionIndex as { measures: { number: number; title: string; as_of?: string }[] }).measures.map((r) => ({
		category: 'adopted-resolutions' as const,
		number: r.number,
		title: r.title,
		status: 'Adopted',
		date: r.as_of ?? null,
		href: `${LEGISLATION}/resolutions/adopted/${r.number}`,
	})),
]

const NEEDS_CUE = new Set([
	'ampatuan', 'sultan kudarat', 'mangudadatu', 'kapatagan', 'parang', 'ligawasan', 'datu piang', 'datu paglas',
	'datu odin sinsuat', 'datu blah t. sinsuat', 'datu abdullah sangki', 'datu anggal midtimbang', 'datu hoffer ampatuan',
	'datu saudi-ampatuan', 'datu salibo', 'datu unsay', 'sultan dumalondong', 'sultan mastura', 'shariff aguak',
	'shariff saydona mustapha', 'gen. s. k. pendatun', 'amai manabilang', 'hadji mohammad ajul', 'hadji muhtamad',
	'panglima sugala', 'rajah buayan', 'sultan sa barongis', 'talitay', 'pandag', 'buldon', 'upi',
])
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const AREA_WORDS = 'basilan|lanao|maguindanao|tawi-tawi|special geographic|bangsamoro|barmm'

/** Every unit name each title mentions, after the longest-name rule. */
const allUnitNames = lguProvinces.flatMap((p) => p.municipalities.map((u) => ({ area: p.slug, slug: u.slug, name: u.name })))
const mentions = new Map<Titled, Set<string>>()
for (const measure of titled) {
	// Hyphens as spaces on both sides: "Datu Saudi-Ampatuan" is printed both ways.
	const title = measure.title.toLowerCase().replace(/-/g, ' ')
	const found: { key: string; name: string }[] = []
	for (const unit of allUnitNames) {
		const name = unit.name.toLowerCase().replace(/-/g, ' ')
		const bare = escape(name.replace(/ city$/, ''))
		const plain = new RegExp(`(^|[^a-z])${bare}(?![a-z])`)
		if (!plain.test(title)) continue
		if (unit.slug === 'cotabato-city' && !/cotabato city|city of cotabato/.test(title)) continue
		if (NEEDS_CUE.has(unit.name.toLowerCase())) {
			const cue = new RegExp(
				`(municipality|town|municipal|city)\\s+of\\s+${bare}|\\bin\\s+(the\\s+)?${bare}(?![a-z])|${bare},?\\s+(province of\\s+)?(${AREA_WORDS})`,
			)
			if (!cue.test(title)) continue
		}
		found.push({ key: `${unit.area}/${unit.slug}`, name })
	}
	const kept = found.filter((one) => !found.some((other) => other !== one && other.name.length > one.name.length && other.name.includes(one.name)))
	if (kept.length) mentions.set(measure, new Set(kept.map((one) => one.key)))
}

/**
 * Parliament's capitals as title case. Sentence case was tried and lost every
 * proper noun it could not list — a person's name, a month, "Mindanao State
 * University" — so every word is capitalised and only the small joining words,
 * and the acronyms, are put back.
 */
const SMALL = new Set(['a', 'an', 'the', 'and', 'or', 'nor', 'but', 'of', 'in', 'on', 'at', 'to', 'for', 'by', 'with', 'from', 'into', 'as', 'its', 'per', 'via', 'thereof', 'therefor'])
const ACRONYMS = ['BARMM', 'BTA', 'MILF', 'MNLF', 'COMELEC', 'DPWH', 'DepEd', 'MBHTE', 'MILG', 'MOH', 'BAA', 'ARMM', 'LGU', 'LGUs', 'NCIP', 'OPAPRU', 'MSU', 'II', 'III', 'IV', 'COVID-19', 'PNP', 'AFP']
function sentence(title: string): string {
	const letters = title.replace(/[^A-Za-z]/g, '')
	const upper = letters.replace(/[^A-Z]/g, '').length
	if (!letters || upper / letters.length < 0.8) return title
	let first = true
	const out = title.toLowerCase().replace(/[a-z][a-z'’]*/g, (word, offset: number, whole: string) => {
		const after = whole[offset - 1] === '-' && !first
		// "10th", not "10Th": a suffix on a number stays lower case.
		const ordinal = /[0-9]/.test(whole[offset - 1] ?? '')
		const keep = ordinal || (!first && !after && SMALL.has(word))
		first = false
		return keep ? word : word.charAt(0).toUpperCase() + word.slice(1)
	})
	return ACRONYMS.reduce((text, word) => text.replace(new RegExp(`\\b${escape(word)}\\b`, 'gi'), word), out)
}

function relatedTo(match: (measure: Titled) => boolean) {
	const pick = (category: Titled['category']): MapMeasure[] =>
		titled
			.filter((m) => m.category === category && match(m))
			.sort((a, b) => b.number - a.number)
			.map((m) => ({
				number: m.number,
				title: sentence(m.title.replace(/^ — |— $/g, '')),
				status: m.status,
				date: m.date,
				summary: firstSentence(m.category, m.number),
				href: m.href,
			}))
	return { acts: pick('acts'), bills: pick('bills'), resolutions: pick('adopted-resolutions') }
}

const top = (contest: Contest | undefined) => (contest ? winners(contest)[0] : undefined)
const winner = (contest: Contest | undefined) => {
	const one = top(contest)
	return one ? personName(one.name) : null
}

const currentTerm = () => lguData.officials?.currentTermId ?? ''

function lguUnitHref(province: LguProvince, unit: LguUnit) {
	return `https://lgu.betterbarmm.com/${province.slug}/${unit.slug}`
}

/* ============================================================
   The election, by town

   Results are counted by parliamentary district, not by town, so a town
   carries its district's result. Which district a town votes in is read from
   BAA 86's tables (`datasets/election/district-towns.json`). Party colours
   are the parties' own, copied from the election workspace's
   `_lib/party-color.ts` — keep the two in step.
   ============================================================ */

const PARTY_COLORS: Record<string, string> = {
	ABOT: '#c48c58', BAPA: '#bf0405', BEST: '#f5bf18', BFP: '#1d3889', BGC: '#252a8a', ISAMA: '#fcf902',
	MAHARDIKA: '#e35f65', MORO_AKO: '#227006', PRO_BANGSAMORO: '#2b3291', RAAYAT: '#e99e17', UBJP: '#20630f',
}
// A party with no colour on file gets none — never its coalition's, which would read as the coalition.
const partyColor = (id: string | null) => (id ? (PARTY_COLORS[id] ?? null) : null)

type DistrictRow = (typeof resultsFile)['district_representation']['districts'][number]
const districtRows = resultsFile.district_representation.districts as DistrictRow[]
const districtTowns = districtTownsFile.towns as Record<string, { districts: string[]; note?: string }>

function districtsOf(province: LguProvince, unit: LguUnit): DistrictRow[] {
	const entry = districtTowns[`${province.slug}/${unit.slug}`]
	return (entry?.districts ?? []).flatMap((d) => districtRows.filter((row) => row.area === province.name && row.district === d))
}

const districtWinner = (row: DistrictRow) => row.candidates.find((c) => c.won)

const ntaLatestYear = Math.max(...nta.years)
function ntaPerResident(province: LguProvince, unit: LguUnit): number | null {
	const own: Record<string, number> = ntaFor(province.slug, unit.slug)?.lgu ?? {}
	const year = [...nta.years].reverse().find((y) => own[String(y)] != null)
	return year && unit.population ? Math.round(own[String(year)] / unit.population) : null
}

export function buildRegion(): MapRegion {
	const term = currentTerm()
	const latestYear = Math.max(...areaSpending.years)
	const { viewBox, land, outside, source } = barmmBoundaries

	const areas: MapArea[] = lguProvinces.map((province) => {
		const shape = barmmBoundaries.areas.find((area) => area.slug === province.slug)
		const travel = travelAreas.find((area) => area.slug === province.slug)
		const guide = lguAreas.find((area) => area.slug === province.slug)
		const spending = areaSpending.areas.find((area) => area.name === province.name)

		// A province has a governor; Cotabato City is one city, so its mayor.
		const own = province.officials?.[term]
		const city = province.kind === 'City' ? province.municipalities[0]?.officials?.[term] : undefined
		const leaders = [
			own?.governor && { role: 'Governor', name: winner(own.governor) },
			own?.viceGovernor && { role: 'Vice governor', name: winner(own.viceGovernor) },
			city?.mayor && { role: 'Mayor', name: winner(city.mayor) },
			city?.viceMayor && { role: 'Vice mayor', name: winner(city.viceMayor) },
		].filter((one): one is { role: string; name: string } => Boolean(one && one.name))

		return {
			slug: province.slug,
			name: province.name,
			kind: province.kind,
			d: shape?.d ?? null,
			tagline: travel?.tagline ?? province.note ?? null,
			population: province.population,
			areaKm2: province.areaKm2,
			towns: province.municipalities.length,
			barangays: province.barangayCount,
			capital: province.municipalities.find((unit) => unit.isCapital)?.name ?? null,
			leaders,
			seats: guide?.seats ?? null,
			languages: travel?.languages ?? [],
			knownFor: travel?.knownFor ?? [],
			places: placesInArea(province.slug)
				.slice(0, 5)
				.map((place) => ({ name: place.name, kind: PLACE_KIND_LABEL[place.kind], municipality: place.municipality })),
			spending: spending
				? {
						total: pesoCell(spending.total),
						firstYear: Math.min(...areaSpending.years),
						latestYear,
						latest: pesoCell(spending.years[String(latestYear)]?.amount),
						projects: spending.years[String(latestYear)]?.projects ?? 0,
					}
				: null,
			lguHref: `https://lgu.betterbarmm.com${areaHref(province)}`,
			units: province.municipalities.map((unit) => ({ slug: unit.slug, name: unit.name })),
		}
	})

	const units: MapUnit[] = barmmBoundaries.units.flatMap((shape) => {
		const province = lguProvinces.find((one) => one.slug === shape.area)
		const unit = province?.municipalities.find((one) => sameUnit(shape.psgc, one.psgc, shape.name, one.name))
		if (!province || !unit) return []
		return [
			{
				slug: unit.slug,
				area: province.slug,
				name: unit.name,
				d: shape.d,
				isCity: unit.isCity,
				isCapital: unit.isCapital,
				population: unit.population,
				layers: {
					density: density(unit),
					ntaPerResident: ntaPerResident(province, unit),
					guide: (() => {
						const town = findTown(province.slug, unit.slug)
						return town ? town.whereToGo.length + town.eat.length + town.stay.length : 0
					})(),
					party: (() => {
						const won = new Set(districtsOf(province, unit).map((row) => districtWinner(row)?.party_id ?? null))
						return won.size === 1 ? [...won][0] : null
					})(),
				},
			},
		]
	})

	const parties: MapParty[] = resultsFile.district_representation.parties
		.filter((p) => p.seats > 0 && p.party_id)
		.map((p) => ({ id: p.party_id!, label: p.label, color: partyColor(p.party_id), seats: p.seats }))

	return { viewBox, land, outside: outside.map((area) => area.d), source, areas, units, parties, ntaYear: ntaLatestYear }
}

export function buildUnit(areaSlug: string, unitSlug: string): MapUnitDetail | null {
	const province = lguProvinces.find((one) => one.slug === areaSlug)
	const unit = province?.municipalities.find((one) => one.slug === unitSlug)
	if (!province || !unit) return null

	const term = currentTerm()
	const own = unit.officials?.[term]
	const officials = [
		{ role: unit.isCity ? 'City mayor' : 'Mayor', contest: own?.mayor },
		{ role: unit.isCity ? 'City vice mayor' : 'Vice mayor', contest: own?.viceMayor },
	].flatMap(({ role, contest }) => {
		const one = top(contest)
		return one ? [{ role, name: personName(one.name), party: one.party, votes: one.votes }] : []
	})
	const council = (own?.council ?? []).flatMap((contest) => winners(contest).map((one) => personName(one.name)))

	const shape = barmmBoundaries.units.find(
		(one) => one.area === province.slug && sameUnit(one.psgc, unit.psgc, one.name, unit.name),
	)
	const outlines = shape ? barangayShapes(shape.psgc) : []
	const rosters = unitRosters(unit.slug)

	const barangays: MapBarangay[] = unit.barangays
		.map((barangay) => {
			const outline = outlines.find((one) => sameUnit(one.psgc, barangay.psgc, one.name, barangay.name))
			const roster = rosters[barangay.psgc ?? barangay.name]
			const name = (one: { name: string } | undefined) => (one ? personName(one.name) : null)
			return {
				psgc: barangay.psgc,
				name: barangay.name,
				d: outline?.d ?? null,
				captain: name(roster?.punongBarangay),
				council: (roster?.council ?? []).map((one) => personName(one.name)),
				sk: name(roster?.skChairperson),
				secretary: name(roster?.secretary),
				treasurer: name(roster?.treasurer),
			}
		})
		.sort((a, b) => a.name.localeCompare(b.name))

	// The town first; where no title names it, the measures naming its area.
	const key = `${province.slug}/${unit.slug}`
	const townRelated = relatedTo((m) => mentions.get(m)?.has(key) ?? false)
	const any = townRelated.acts.length + townRelated.bills.length + townRelated.resolutions.length
	const areaName = new RegExp(`(^|[^a-z])${escape(province.name.toLowerCase())}(?![a-z])`)
	const related = any
		? { scope: 'town' as const, ...townRelated }
		: { scope: 'area' as const, ...relatedTo((m) => areaName.test(m.title.toLowerCase())) }

	// Dishes of the traditions spoken in this area, essentials first.
	const languages = (travelAreas.find((a) => a.slug === province.slug)?.languages ?? []).join(' ').toLowerCase()
	const foods: MapFood[] = dishes
		.filter((d) => d.tradition !== 'Shared' && languages.includes(d.tradition.toLowerCase()))
		.sort((a, b) => Number(Boolean(b.essential)) - Number(Boolean(a.essential)))
		.map((d) => ({ name: d.name, tradition: d.tradition, summary: d.summary, whereToFind: d.whereToFind, essential: Boolean(d.essential) }))

	const latestYear = Math.max(...areaSpending.years)
	const spent = areaSpending.areas.find((a) => a.name === province.name)

	// The town's own NTA, as its treasurer reported it to BLGF. A missing year
	// is a town that did not report, and is left out rather than drawn as zero.
	const ntaOwn: Record<string, number> = ntaFor(province.slug, unit.slug)?.lgu ?? {}
	const provinceNta = province.kind === 'Province' ? (ntaFor(province.slug)?.province ?? {}) : {}
	const latestSource = nta.source.filter((src) => src.href.includes('blgf')).at(-1)
	const ntaYears = nta.years
		.filter((year) => ntaOwn[String(year)] != null)
		.map((year) => ({
			year,
			amount: pesoCell(ntaOwn[String(year)]),
			perResident: unit.population ? `₱${Math.round(ntaOwn[String(year)] / unit.population).toLocaleString('en-PH')}` : null,
			preliminary: Boolean(latestSource && latestSource.fiscalYear === year && /prelim/i.test(latestSource.label)),
		}))
	const [first, last] = [nta.years.find((y) => ntaOwn[String(y)] != null), [...nta.years].reverse().find((y) => ntaOwn[String(y)] != null)]
	const provinceLatest = [...nta.years].reverse().find((y) => provinceNta[String(y)] != null)

	const town = findTown(province.slug, unit.slug)
	const travel: MapTravel | null = town
		? {
				summary: town.summary,
				coverage: town.coverage,
				peoples: town.peoples,
				whereToGo: town.whereToGo.map((w) => ({ name: w.name, kind: SPOT_KIND_LABEL[w.kind] ?? w.kind, summary: w.summary })),
				whatToDo: town.whatToDo,
				eat: town.eat.map(({ name, kind, note }) => ({ name, kind, note })),
				stay: town.stay.map(({ name, kind, note }) => ({ name, kind, note })),
				stayNote: town.stayNote,
				gettingThere: town.gettingThere,
				caution: town.caution,
				href: `https://travel.betterbarmm.com/${province.slug}/${unit.slug}`,
			}
		: null

	const rows = districtsOf(province, unit)
	const election: MapElection | null = rows.length
		? {
				districts: rows.map((row) => ({
					label: row.label,
					totalVotes: row.total_votes,
					candidates: row.candidates
						.slice()
						.sort((a, b) => b.votes - a.votes)
						.map((c) => ({ name: c.name, party: c.party_label, color: partyColor(c.party_id), votes: c.votes, won: c.won })),
				})),
				note: districtTowns[`${province.slug}/${unit.slug}`]?.note ?? null,
				turnout: {
					percent: resultsFile.turnout.turnout_percent,
					registered: resultsFile.turnout.registered_voters,
					cast: resultsFile.turnout.votes_cast,
				},
				source: { label: districtTownsFile.source.label, href: districtTownsFile.source.href },
				href: 'https://election.betterbarmm.com/results',
			}
		: null

	return {
		travel,
		election,
		nta: ntaYears.length
			? {
					years: ntaYears,
					change:
						first && last && first !== last
							? `${ntaOwn[String(last)] >= ntaOwn[String(first)] ? '+' : ''}${Math.round(((ntaOwn[String(last)] - ntaOwn[String(first)]) / ntaOwn[String(first)]) * 1000) / 10}% from ${first} to ${last}`
							: null,
					province: provinceLatest
						? { name: province.name, latest: pesoCell(provinceNta[String(provinceLatest)]), year: provinceLatest }
						: null,
					note: 'What the town’s treasurer reported receiving, from the Bureau of Local Government Finance. It is the town’s own share — its barangays get theirs separately — and DBM publishes no per-town figure.',
					source: latestSource ? { label: latestSource.label, href: latestSource.href } : { label: 'BLGF', href: 'https://blgf.gov.ph' },
				}
			: null,
		foods,
		related,
		spending: spent
			? {
					total: pesoCell(spent.total),
					firstYear: Math.min(...areaSpending.years),
					latestYear,
					latest: pesoCell(spent.years[String(latestYear)]?.amount),
					projects: spent.years[String(latestYear)]?.projects ?? 0,
				}
			: null,
		slug: unit.slug,
		name: unit.name,
		area: { slug: province.slug, name: province.name },
		classification: unitClass(unit),
		isCapital: unit.isCapital,
		alsoKnownAs: unit.alsoKnownAs ?? null,
		population: unit.population,
		population2020: unit.population2020,
		growth: growth(unit),
		areaKm2: unit.areaKm2,
		density: density(unit),
		officials,
		council,
		term: own ? (lguData.officials?.terms.find((one) => one.id === term)?.label ?? term) : null,
		captainsListed: barangays.filter((one) => one.captain).length,
		places: placesInArea(province.slug)
			.filter((place) => place.municipality === unit.name)
			.map((place) => ({ name: place.name, kind: PLACE_KIND_LABEL[place.kind], summary: place.summary })),
		barangays,
		rostersAsOf: barangayOfficials.capturedAt,
		rostersSource: barangayOfficials.source.href,
		lguHref: lguUnitHref(province, unit),
	}
}

/** Every town, for the per-town route's static params. */
export function allUnits() {
	return lguProvinces.flatMap((province) =>
		province.municipalities.map((unit) => ({ area: province.slug, unit: unit.slug })),
	)
}
