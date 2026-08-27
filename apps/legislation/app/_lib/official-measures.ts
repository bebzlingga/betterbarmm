import fs from 'node:fs'
import path from 'node:path'
import type { CategorySlug } from './categories'
import { describeStatus, type StatusTone } from './labels'

/* ============================================================
   Parliament's own indexes

   The registry holds a deep record of the measures it has captured — plain
   language, sectors, a stage ladder. Parliament's indexes hold a shallow
   record of every measure there is, and the one thing the registry never
   had: who filed it.

   This module reads those indexes and exposes them two ways — by number,
   so a captured record can be told its authors, and by author, so a
   profile can list what that person filed whether or not the registry has
   read the measure yet. Nothing here overwrites a captured record; it only
   fills in what was blank.
   ============================================================ */

export type OfficialRole = 'Principal Author' | 'Co-Author'

export type OfficialMeasure = {
	/** The registry category this belongs to, so records can be matched up. */
	category: CategorySlug
	number: number
	/** "Bill 474", "Resolution 578" — the form each index numbers them in. */
	numberLabel: string
	title: string
	url: string
	/** Status as Parliament states it — "First Reading", "Adopted". */
	status: string
	statusShort: string
	statusTone: StatusTone
	/** Sortable date, empty when the index omits or malforms it. */
	dateIso: string
	dateDisplay: string
	/** The sitting it was filed under, e.g. "fourth-regular-session-2025". */
	session: string
	principalAuthors: string[]
	coAuthors: string[]
	/** Stage lines exactly as published, e.g. "Filed – 7/15/2026". */
	history: string[]
	committeeReferrals: string
	becameAct: string
}

type RawMeasure = {
	number?: unknown
	title?: unknown
	url?: unknown
	status?: unknown
	as_of?: unknown
	session?: unknown
	principal_authors?: unknown
	co_authors?: unknown
	history?: unknown
	committee_referrals?: unknown
	became_act?: unknown
}

const DATASET_ROOT = (() => {
	const candidates = [
		path.join(process.cwd(), '../../datasets/bills'),
		path.join(process.cwd(), 'datasets/bills'),
		path.join(process.cwd(), '../datasets/bills'),
	]

	return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0]
})()

function readJson<T>(filePath: string): T | null {
	try {
		return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
	} catch {
		return null
	}
}

type Source = {
	file: string
	category: CategorySlug
	numberPrefix: string
}

/** One captured index per registry category that has one. */
const SOURCES: Source[] = [
	{
		file: 'bangsamoro_registry/bills/official_index.json',
		category: 'bills',
		numberPrefix: 'Parliament Bill',
	},
	{ file: 'bangsamoro_registry/baa/official_index.json', category: 'acts', numberPrefix: 'BAA' },
	{
		file: 'bangsamoro_registry/resolutions/proposed_official_index.json',
		category: 'proposed-resolutions',
		numberPrefix: 'Proposed Resolution',
	},
	{
		file: 'bangsamoro_registry/resolutions/adopted_official_index.json',
		category: 'adopted-resolutions',
		numberPrefix: 'Resolution',
	},
]

const toStringValue = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const toStringArray = (value: unknown) =>
	Array.isArray(value) ? value.map(toStringValue).filter(Boolean) : []

/** "07/16/2026" -> "2026-07-16". The indexes publish US-ordered dates. */
function toIsoDate(value: string): string {
	const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
	if (!match) return ''

	const [, month, day, year] = match
	return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function formatDate(isoValue: string): string {
	if (!isoValue) return 'Date not recorded'

	const parsed = new Date(`${isoValue}T00:00:00`)
	if (Number.isNaN(parsed.getTime())) return 'Date not recorded'

	return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
		parsed,
	)
}

const files = SOURCES.map((source) => ({
	source,
	data: readJson<{ generated?: string; source?: string; measures?: RawMeasure[]; bills?: RawMeasure[] }>(
		path.join(DATASET_ROOT, source.file),
	),
}))

const measures: OfficialMeasure[] = files.flatMap(({ source, data }) =>
	// `bills` was the key the first capture wrote; `measures` is the shared one.
	(data?.measures ?? data?.bills ?? [])
		.map((raw): OfficialMeasure | null => {
			const number = typeof raw.number === 'number' ? raw.number : Number(toStringValue(raw.number))
			const title = toStringValue(raw.title)
			if (!Number.isFinite(number) || !title) return null

			const status = toStringValue(raw.status) || 'Status not recorded'
			const described = describeStatus(status)
			const dateIso = toIsoDate(toStringValue(raw.as_of))

			return {
				category: source.category,
				number,
				numberLabel: `${source.numberPrefix} ${number}`,
				title,
				url: toStringValue(raw.url),
				status,
				statusShort: described.short,
				statusTone: described.tone,
				dateIso,
				dateDisplay: formatDate(dateIso),
				session: toStringValue(raw.session),
				principalAuthors: toStringArray(raw.principal_authors),
				coAuthors: toStringArray(raw.co_authors),
				history: toStringArray(raw.history),
				committeeReferrals: toStringValue(raw.committee_referrals),
				becameAct: toStringValue(raw.became_act),
			}
		})
		.filter((measure): measure is OfficialMeasure => measure !== null),
)

const byKey = new Map<string, OfficialMeasure>()
for (const measure of measures) byKey.set(`${measure.category}-${measure.number}`, measure)

/** Names carry accents on some pages and not others; match on the letters. */
const nameKey = (value: string) =>
	value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.toUpperCase()

const byAuthor = (() => {
	const index = new Map<string, Array<{ measure: OfficialMeasure; role: OfficialRole }>>()

	const add = (name: string, measure: OfficialMeasure, role: OfficialRole) => {
		const key = nameKey(name)
		if (!key) return

		const existing = index.get(key)
		if (existing) {
			// Named twice on one measure: principal authorship is the stronger
			// claim, and it is read first, so the later mention is dropped.
			if (
				!existing.some(
					(entry) =>
						entry.measure.category === measure.category && entry.measure.number === measure.number,
				)
			) {
				existing.push({ measure, role })
			}
		} else {
			index.set(key, [{ measure, role }])
		}
	}

	for (const measure of measures) {
		for (const name of measure.principalAuthors) add(name, measure, 'Principal Author')
		for (const name of measure.coAuthors) add(name, measure, 'Co-Author')
	}

	return index
})()

export function getOfficialMeasure(
	category: CategorySlug,
	number: number,
): OfficialMeasure | undefined {
	return byKey.get(`${category}-${number}`)
}

/** Bills only — what a captured bill record needs to learn its authors. */
export function getOfficialBill(number: number): OfficialMeasure | undefined {
	return byKey.get(`bills-${number}`)
}

/**
 * Bills indexed by the act they became — an act's route back to its own bill.
 *
 * The acts index publishes no history at all, and only a sixth of the captured
 * act files name their origin bill. But the bills index says which act each
 * bill turned into, and carries the dated stage lines the act never had, so an
 * act can be told its own passage by reading it off the bill behind it.
 *
 * Matched on the title, because `became_act` is a title and never a number.
 * It was read by pulling the first run of digits out of that string, which is
 * a different question — "does this act's title happen to contain a number" —
 * and the answer was wrong every time it was not empty. The bill that amends
 * Autonomy Act 35 was filed under the act it changes, so it was handed to act
 * 35 rather than to act 88, which is the one it became; a bill extending the
 * 2020 special development fund produced an act numbered 2020. Three links,
 * none of them right, while the thirteen bills that actually name their act
 * went unmatched.
 */
const actTitleKey = (title: string) =>
	title
		.normalize('NFKD')
		.toUpperCase()
		.replace(/[\u2018\u2019]/g, "'")
		.replace(/[\u201c\u201d]/g, '"')
		.replace(/[^A-Z0-9]+/g, ' ')
		.trim()

const billByAct = (() => {
	const actNumberByTitle = new Map<string, number>()
	for (const measure of measures) {
		if (measure.category !== 'acts') continue
		actNumberByTitle.set(actTitleKey(measure.title), measure.number)
	}

	const index = new Map<number, OfficialMeasure>()

	for (const measure of measures) {
		if (measure.category !== 'bills' || !measure.becameAct) continue

		const act = actNumberByTitle.get(actTitleKey(measure.becameAct))
		if (act === undefined) continue

		const existing = index.get(act)
		// Where two entries claim the same act, the fuller history wins.
		if (!existing || measure.history.length > existing.history.length) index.set(act, measure)
	}

	return index
})()

export function getOfficialBillForAct(actNumber: number): OfficialMeasure | undefined {
	return billByAct.get(actNumber)
}

/**
 * A whole index, newest number first. Where a category has no captured
 * records of its own, this is all there is to build a dataset from.
 */
export function getOfficialMeasuresByCategory(category: CategorySlug): OfficialMeasure[] {
	return measures
		.filter((measure) => measure.category === category)
		.sort((left, right) => right.number - left.number)
}

/** Every measure one author is named on, newest number first per category. */
export function getOfficialMeasuresForAuthor(
	name: string,
): Array<{ measure: OfficialMeasure; role: OfficialRole }> {
	return [...(byAuthor.get(nameKey(name)) ?? [])].sort(
		(left, right) =>
			left.measure.category.localeCompare(right.measure.category) ||
			right.measure.number - left.measure.number,
	)
}

export function getOfficialMeasuresMeta(): {
	generatedAt: string
	total: number
	byCategory: Record<string, number>
	credited: number
} {
	const byCategory: Record<string, number> = {}
	for (const measure of measures) {
		byCategory[measure.category] = (byCategory[measure.category] ?? 0) + 1
	}

	return {
		generatedAt: toStringValue(files.find(({ data }) => data?.generated)?.data?.generated) || 'not recorded',
		total: measures.length,
		byCategory,
		credited: measures.filter(
			(measure) => measure.principalAuthors.length + measure.coAuthors.length > 0,
		).length,
	}
}
