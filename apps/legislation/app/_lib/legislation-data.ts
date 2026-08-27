import fs from 'node:fs'
import path from 'node:path'
import { getCategory, type CategoryDefinition, type CategorySlug } from './categories'
import {
	classifyTag,
	describeStatus,
	formatDate,
	parliamentLabel,
	sectorLabel,
	sessionLabel,
	toTitleCase,
	typeLabel,
	type StatusTone,
} from './labels'
import {
	getOfficialBill,
	getOfficialBillForAct,
	getOfficialMeasure,
	getOfficialMeasuresByCategory,
} from './official-measures'

/* ============================================================
   Shared record shape

   Acts, bills, and resolutions are published with different fields but
   are read the same way, so all three normalise into one record type.
   A category simply leaves unused fields empty rather than forking the
   type — that keeps the browser, filters, and detail view written once.
   ============================================================ */

export type Tag = { value: string; label: string }

/**
 * One rung on the path from filing to law. The registry records these per
 * measure with a `reached` flag, which is far more legible than a status
 * string — you can see how far a bill actually got, and where it stopped.
 */
export type JourneyStage = {
	label: string
	reached: boolean
	dateDisplay?: string
	/** The furthest stage reached — where the measure sits right now. */
	current: boolean
}

/**
 * A reading of the measure's own documents.
 *
 * Everything else in a record is Parliament's data, normalised. This is not:
 * it is what the filed copy, the committee report and the journal actually
 * say, written out in plain language. It exists only for measures whose
 * documents have been read, and it says which documents those were — a reader
 * has to be able to tell an analysis from a summary of metadata.
 */
export type MeasureReading = {
	/** 100-300 words: what the measure does, in normal language. */
	whatItDoes: string
	/** The case the author makes, from the explanatory note. */
	whyProposed?: string
	/** Who the measure reaches, as the text defines them. */
	whoIsAffected: string[]
	/** The offices the text names to carry it out. */
	implementedBy: string[]
	funding?: {
		/** Whether the measure carries an appropriation at all. */
		required: boolean
		/** What the text says about the money, where it says anything. */
		detail?: string
	}
	/** What is different the day it takes effect. */
	whatChanges: string[]
	/**
	 * Points raised while it was considered — from the journal or a committee
	 * report. Empty where no deliberation record has been published, which is
	 * most measures.
	 */
	deliberation: string[]
	/** What is worth noticing about it, said plainly. */
	insight?: string
	/** The documents this reading is based on. */
	readFrom: Array<{ label: string; url?: string }>
	/** When the reading was written. */
	readOn: string
}

export type SourceLink = {
	type: string
	url?: string
	accessNote?: string
	fileName?: string
}

export type LegislationRecord = {
	id: string
	category: CategorySlug
	number: number
	/** Compact designation, e.g. "Bill 453". */
	numberLabel: string
	/** Full official designation. */
	display: string
	/** The measure's full name, title-cased for reading. */
	title: string
	/** The registry's condensed name, where it has one — "Halal Development Act". */
	shortTitle?: string
	/** Title exactly as published, still in the source's capitalisation. */
	titleOfficial: string

	/** Status as the registry words it. */
	status: string
	/** Scannable version of the same status, for badges and rows. */
	statusShort: string
	statusTone: StatusTone
	statusMeaning: string

	/** The stage ladder — which steps toward law this measure has reached. */
	journey: JourneyStage[]

	dateIso?: string
	dateDisplay: string
	/** What the date on this record represents. */
	dateLabel: string
	year: string

	session?: string
	era?: string

	sectors: Tag[]
	types: Tag[]
	/** Everyone credited, principal authors first. */
	authors: string[]
	/**
	 * True where Parliament credits the measure to the Government of the Day
	 * rather than to any member — a cabinet measure. It is a different kind of
	 * thing from a member's bill: it arrives with the executive behind it, and a
	 * reader should be able to see that before reading a word of it.
	 */
	isCabinetMeasure: boolean
	principalAuthors: string[]
	coAuthors: string[]

	/** Relations between measures. */
	originBillNumber?: number
	becameActNumber?: number
	amendsBaa: number[]
	amendedByBaa: number[]
	repeals?: string

	/** A reading of the measure's own documents, where they have been read. */
	reading?: MeasureReading

	/** Prose analysis, where a source was actually read. */
	gist?: string
	keyEffects: string[]
	appropriationAmount?: string
	fiscalYear?: string

	/** Perspective blocks from the registry. */
	citizenMeaning?: string
	citizenEngage?: string
	researchLeads: string[]
	signalValue?: string
	watchpoints: string[]

	sourceUrl?: string
	sourceLinks: SourceLink[]
	notes?: string
	disclaimer?: string

	/** Precomputed lowercase haystack so search doesn't rebuild strings per keystroke. */
	searchText: string
}

export type DatasetMetadata = {
	datasetName: string
	generatedAt: string
	coverage: string
	recordCount: number
	scopeNote: string
	knownGaps: string[]
	sourceUrl: string
}

export type FilterOption = { value: string; label: string; count: number }

export type LegislationDataset = {
	category: CategoryDefinition
	metadata: DatasetMetadata
	records: LegislationRecord[]
	/**
	 * Which of Parliament's own lists a record came from, where a view reads
	 * more than one — adopted against proposed on `/resolutions`. Empty on a
	 * view drawn from a single list, since a filter with one option narrows
	 * nothing.
	 */
	kinds: FilterOption[]
	sectors: FilterOption[]
	types: FilterOption[]
	statuses: FilterOption[]
	years: FilterOption[]
	sessions: FilterOption[]
	stats: {
		total: number
		sectors: number
		enacted: number
		inProgress: number
		earliestYear: string
		latestYear: string
	}
}

/* ============================================================
   Registry file access

   The dataset lives outside the app directory, so the path is resolved
   against a few plausible roots — `next dev` runs from `apps/bills`
   while turbo may run from the repo root. Files are read once at module
   scope; pages are statically rendered, so this happens at build time.
   ============================================================ */

const DATASET_ROOT = (() => {
	const candidates = [
		path.join(process.cwd(), '../../datasets/bills'),
		path.join(process.cwd(), 'datasets/bills'),
		path.join(process.cwd(), '../datasets/bills'),
	]

	return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0]
})()

const REGISTRY_ROOT = path.join(DATASET_ROOT, 'bangsamoro_registry')

function readJson<T>(filePath: string): T | null {
	try {
		return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
	} catch {
		return null
	}
}

/** Reads every `prefix*.json` in a registry folder, skipping `_index.json`. */
function readCollection<T>(relativeDir: string, prefix: string): T[] {
	const dir = path.join(REGISTRY_ROOT, relativeDir)

	if (!fs.existsSync(dir)) return []

	return fs
		.readdirSync(dir)
		.filter((name) => name.startsWith(prefix) && name.endsWith('.json'))
		.map((name) => readJson<T>(path.join(dir, name)))
		.filter((record): record is T => record !== null)
}

const registryManifest = readJson<{
	generated?: string
	known_gaps?: string[]
}>(path.join(REGISTRY_ROOT, 'manifest.json'))

const GENERATED_AT = registryManifest?.generated ?? 'Unknown'

/* ============================================================
   Normalisation helpers

   Registry schema 2.0 marks anything it hasn't scraped yet with a
   `pending_capture: ...` sentinel string rather than omitting the key.
   Those sentinels are internal bookkeeping, never content, so every read
   goes through `clean()` — printing one to the page would present a note
   to ourselves as if it were a fact about the law.
   ============================================================ */

const PENDING_SENTINEL = /^pending_capture\b/i
const NOT_CAPTURED = /^\(?\s*(status\s+)?not\s+captured\s*\)?$/i

const toStringValue = (value: unknown, fallback = '') =>
	typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback

/** A trimmed string, or `fallback` when the registry left it unscraped. */
function clean(value: unknown, fallback = ''): string {
	const raw = toStringValue(value)
	if (!raw) return fallback
	if (PENDING_SENTINEL.test(raw) || NOT_CAPTURED.test(raw)) return fallback
	return raw
}

/**
 * Author and document fields hold an array once captured but a lone
 * `pending_capture` string until then, so both shapes collapse to a list.
 *
 * List entries get a stricter test than scalars: `key_provisions` buries the
 * sentinel mid-sentence ("Full section-by-section provisions: pending_capture:
 * ..."), which would otherwise render as though it were a provision of the law.
 * Any entry mentioning it at all is bookkeeping, so the whole entry goes.
 */
const cleanArray = (value: unknown): string[] =>
	Array.isArray(value)
		? value
				.map((item) => clean(item))
				.filter((item) => item && !/pending_capture/i.test(item))
		: []

/** Pulls the number out of a reference like "BAA 71" or "Bill 350". */
function parseMeasureNumber(value: unknown): number | undefined {
	const match = clean(value).match(/\d+/)
	if (!match) return undefined

	const parsed = Number(match[0])
	return Number.isFinite(parsed) ? parsed : undefined
}

const parseMeasureNumbers = (value: unknown): number[] =>
	Array.isArray(value)
		? value.map((item) => parseMeasureNumber(item)).filter((n): n is number => n !== undefined)
		: []

/** Splits schema 2.0's merged `impact_tags` back into sectors and types. */
function splitTags(value: unknown): { sectors: Tag[]; types: Tag[] } {
	const sectors: Tag[] = []
	const types: Tag[] = []

	for (const raw of cleanArray(value)) {
		const kind = classifyTag(raw)
		if (kind === 'sector') sectors.push({ value: raw, label: sectorLabel(raw) })
		else if (kind === 'type') types.push({ value: raw, label: typeLabel(raw) })
	}

	return { sectors, types }
}

const upperFirst = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

/**
 * A measure's full name, as Parliament published it.
 *
 * Official titles arrive shouting ("AN ACT CREATING THE BANGSAMORO HALAL
 * DEVELOPMENT AUTHORITY..."), so they are title-cased for reading but not
 * abbreviated — the full name is what identifies a measure in a citation, an
 * index, or a search. Where the official title wasn't captured, which is most
 * adopted resolutions, the registry's condensed title stands in.
 */
function fullTitle(shortTitle: string, officialTitle: string): string {
	return toTitleCase(officialTitle) || (shortTitle ? upperFirst(shortTitle) : '') || 'Title not recorded'
}

/**
 * The measure's name as Parliament itself lists it.
 *
 * A captured registry file carries an `official_title`, but it is a reading of
 * the measure rather than a transcription, and it is often abbreviated —
 * BAA 81 came through as "An Act Establishing the Salamat Excellence Award for
 * Leadership (SEAL) Program and Endowment Fund", where Parliament's own index
 * says "AN ACT ESTABLISHING AND INSTITUTIONALIZING THE SALAMAT EXCELLENCE AWARD
 * FOR LEADERSHIP PROGRAM FOR THE BANGSAMORO AUTONOMOUS REGION IN MUSLIM
 * MINDANAO, AND ALLOCATING FOR THIS PURPOSE THE SALAMAT EXCELLENCE AWARD FOR
 * LEADERSHIP ENDOWMENT FUND".
 *
 * The full name is what identifies a measure in a citation, so the index wins
 * wherever it has an entry. The captured title stands in for the measures the
 * index does not list.
 */
function officialTitleFor(category: CategorySlug, number: number, captured: string): string {
	return clean(getOfficialMeasure(category, number)?.title) || captured
}

/**
 * The registry's short title — the name people actually use for a measure —
 * but only when it adds something. Two cases drop it:
 *
 *   · it repeats the full title, which happens whenever the official title
 *     wasn't captured and the short one already stood in for it;
 *   · it was split mid-name by the generator ("Sr. Memorial Hospital Act",
 *     cut out of "DATU ALAWADDIN T. BANDON, SR. MEMORIAL HOSPITAL").
 */
const SPLIT_MID_NAME = /^(sr|jr|ii|iii|iv)\b\.?/i

function shortName(shortTitle: string, fullName: string): string {
	if (!shortTitle || SPLIT_MID_NAME.test(shortTitle)) return ''

	const short = upperFirst(shortTitle)
	if (short.toLowerCase().trim() === fullName.toLowerCase().trim()) return ''

	return short
}

/**
 * The rung as a timeline prints it.
 *
 * The registry names stages for a database rather than a reader: it qualifies
 * where a reader wants the plain word ("Approved by Parliament" — there is
 * nowhere else a bill could be approved) and drops the qualifier where a
 * reader needs it ("Committee" and "Plenary" both belong to second reading,
 * and alone they read as stages of their own).
 */
function stageLabel(stage: string): string {
	const label = stage.replace(/\s*\(.*\)$/, '').trim()

	if (/^second reading\s*-\s*/i.test(label)) {
		return label.replace(/^second reading\s*-\s*/i, 'Second Reading — ')
	}

	if (/^approved by parliament$/i.test(label)) return 'Approved'

	return label
}

/**
 * Normalises the registry's stage ladder, and flags the last reached rung so
 * the UI can mark where the measure currently stands.
 */
function toJourney(value: unknown): JourneyStage[] {
	if (!Array.isArray(value)) return []

	const stages = (value as Array<{ stage?: unknown; reached?: unknown; date?: unknown }>)
		.map((entry): JourneyStage | null => {
			const label = clean(entry?.stage)
			if (!label) return null

			const dateIso = clean(entry?.date)

			return {
				label: stageLabel(label),
				reached: entry?.reached === true,
				dateDisplay: dateIso ? formatDate(dateIso, '') || undefined : undefined,
				current: false,
			}
		})
		.filter((stage): stage is JourneyStage => stage !== null)

	const lastReached = stages.reduce((last, stage, index) => (stage.reached ? index : last), -1)
	if (lastReached >= 0) stages[lastReached].current = true

	return stages
}

/* ------------------------------------------------------------
   Dating the rungs

   A captured bill file carries the whole ladder but almost none of the
   dates: "Filed" is dated on 6 of 192 records, "Third Reading" on none.
   Parliament's bills index carries the opposite — no ladder, but a dated
   line for everything that actually happened ("First Reading – 7/16/2026",
   "Referred to the Committee on Health – 7/15/2026").

   So the two are read together: the registry says what the rungs are, the
   index says when each was reached. A rung the index dates is a rung the
   measure reached, whatever the captured file's flag says — the index is
   the later and more complete source.
   ------------------------------------------------------------ */

type StageKey = 'filed' | 'first' | 'committee' | 'plenary' | 'third' | 'approved' | 'archived'

/** Which rung a normalised registry stage name is. */
function registryStageKey(label: string): StageKey | null {
	const value = label.toLowerCase()

	if (value.startsWith('filed')) return 'filed'
	if (value.startsWith('first reading')) return 'first'
	// "Second Reading — Committee" and "Second Reading — Plenary" name the
	// reading first, so these are read anywhere in the label rather than at its
	// head. Committee is tested first: an act's ladder folds both into one rung.
	if (value.includes('committee')) return 'committee'
	if (value.includes('plenary')) return 'plenary'
	if (value.startsWith('third reading')) return 'third'
	if (value.startsWith('approved')) return 'approved'
	if (value.startsWith('archived')) return 'archived'

	return null
}

/**
 * Which rungs an index history line reports. Third reading is tested before
 * second so "Approved on Third and Final Reading" isn't read as a floor
 * debate — that line reports two rungs at once, the vote and the approval it
 * carries. Bare "Deferred" lines are deliberately unmatched: a deferral names
 * no stage, and dating a rung from one would claim more than the source says.
 */
function historyStageKeys(line: string): StageKey[] {
	const value = line.toLowerCase()

	// "Field – 6/4/2025" — the index's own typo for a filing.
	if (/^(filed|field)\b/.test(value)) return ['filed']
	if (/^first reading/.test(value)) return ['first']
	if (/third (and final )?reading/.test(value)) {
		return /^approved/.test(value) ? ['third', 'approved'] : ['third']
	}
	if (/committee report|referred (back )?to (the )?committee|^committee on /.test(value)) {
		return ['committee']
	}
	if (/second reading|2nd reading|authorship speech/.test(value)) return ['plenary']
	if (/^archived/.test(value)) return ['archived']

	return []
}

/** The earliest date the history gives for each rung, as ISO. */
function historyStageDates(history: string[]): Map<StageKey, string> {
	const dates = new Map<StageKey, string>()

	for (const line of history) {
		const match = line.match(/[–—-]\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/)
		if (!match) continue

		const [, month, day, year] = match
		const dateIso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

		for (const key of historyStageKeys(line)) {
			const existing = dates.get(key)
			// A rung can be reported more than once — referred, reported back,
			// referred again. The first time it happened is the date it was reached.
			if (!existing || dateIso < existing) dates.set(key, dateIso)
		}
	}

	return dates
}

/** Fills a captured ladder's blank dates from the index, and re-reads where it stands. */
function withHistoryDates(stages: JourneyStage[], history: string[]): JourneyStage[] {
	if (stages.length === 0 || history.length === 0) return stages

	const dates = historyStageDates(history)
	if (dates.size === 0) return stages

	const dated = stages.map((stage) => {
		const key = registryStageKey(stage.label)
		const dateIso = key ? dates.get(key) : undefined
		if (!dateIso) return stage

		return {
			...stage,
			reached: true,
			dateDisplay: stage.dateDisplay ?? (formatDate(dateIso, '') || undefined),
		}
	})

	// A dated rung can sit above one the captured file left unflagged, and a
	// measure cannot skip a rung — everything below the furthest one reached
	// was passed through on the way.
	const lastReached = dated.reduce((last, stage, index) => (stage.reached ? index : last), -1)

	return dated.map((stage, index) => ({
		...stage,
		reached: stage.reached || index < lastReached,
		current: index === lastReached,
	}))
}

/**
 * An act's ladder is the ladder of the bill it was.
 *
 * Captured act files record the passage in four vague rungs — "Filed as a
 * bill", "Committee & plenary readings" — and date none of them but the
 * ratification. An act is a bill that made it the whole way, so it is shown on
 * the same rungs as any bill, dated from that bill's own history where the
 * index can be traced back to it.
 */
const ACT_STAGES = [
	'Filed',
	'First Reading',
	'Second Reading — Committee',
	'Second Reading — Plenary',
	'Third Reading',
	'Approved',
	'Enacted',
]

function actJourney(history: string[], ratifiedIso?: string): JourneyStage[] {
	const dates = historyStageDates(history)

	return ACT_STAGES.map((label, index) => {
		const isLast = index === ACT_STAGES.length - 1
		const key = registryStageKey(label)
		const dateIso = isLast ? ratifiedIso : key ? dates.get(key) : undefined

		return {
			label,
			// The measure is law: every rung on the way was passed, whether or not
			// a source recorded the day it happened.
			reached: true,
			dateDisplay: dateIso ? formatDate(dateIso, '') || undefined : undefined,
			current: isLast,
		}
	})
}

type CitizenQuestion = { q?: unknown; a?: unknown }

/** The answer to the first question whose text matches — used for engagement notes. */
function answerMatching(questions: unknown, pattern: RegExp): string | undefined {
	if (!Array.isArray(questions)) return undefined

	for (const entry of questions as CitizenQuestion[]) {
		if (pattern.test(clean(entry?.q))) {
			const answer = clean(entry?.a)
			if (answer) return answer
		}
	}

	return undefined
}

/** Document pointers worth showing a researcher, minus the unscraped ones. */
function documentLeads(related: unknown): string[] {
	if (!related || typeof related !== 'object') return []

	return Object.entries(related as Record<string, unknown>)
		.map(([key, value]) => {
			const detail = clean(value)
			if (!detail) return ''
			return `${key.replace(/_/g, ' ').replace(/\bpdf\b/i, 'PDF')}: ${detail}`
		})
		.filter(Boolean)
		.map((lead) => lead.charAt(0).toUpperCase() + lead.slice(1))
}

/* ============================================================
   Schema 2.0 record sections
   ============================================================ */

type BasicInformation = {
	baa_number?: unknown
	bill_number?: unknown
	resolution_number?: unknown
	short_title?: unknown
	official_title?: unknown
	type?: unknown
	session?: unknown
	enacting_parliament?: unknown
	date_ratified?: unknown
	date_adopted?: unknown
	date_filed?: unknown
	date_approved?: unknown
	status_as_of?: unknown
	current_status?: unknown
}

type RegistryRecord = {
	record_type?: unknown
	basic_information?: BasicInformation
	citizen_summary?: {
		what_is_this_about?: unknown
		why_was_it_proposed?: unknown
		what_will_change?: unknown
		who_will_be_affected?: unknown
		when_will_it_take_effect?: unknown
	}
	key_provisions?: unknown
	legislative_journey?: unknown
	impact?: {
		who_benefits?: unknown
		impact_tags?: unknown
		estimated_beneficiaries?: unknown
		allocated_budget?: unknown
	}
	authors_and_sponsors?: {
		principal_authors?: unknown
		co_authors?: unknown
		authors?: unknown
		sponsor?: unknown
		committee?: unknown
		note?: unknown
	}
	related_documents?: unknown
	related_legislation?: {
		amends?: unknown
		amended_by?: unknown
		repeals?: unknown
		origin_bill?: unknown
		related_bills?: unknown
	} | null
	implementation_status?: {
		law_enacted?: unknown
		in_force?: unknown
		legal_challenge_note?: unknown
		note?: unknown
		budget_appropriated?: unknown
	}
	citizen_questions?: unknown
	display_header?: {
		line1?: unknown
		line2?: unknown
		what_this_does?: unknown
		who_it_affects?: unknown
	}
	provenance?: { source?: unknown; generation?: unknown }
}

function buildSearchText(record: Omit<LegislationRecord, 'searchText'>): string {
	return [
		record.numberLabel,
		record.display,
		record.title,
		record.shortTitle,
		record.titleOfficial,
		record.status,
		record.session,
		record.era,
		record.gist,
		...record.sectors.map((tag) => tag.label),
		...record.types.map((tag) => tag.label),
		...record.authors,
	]
		.filter(Boolean)
		.join(' ')
		.toLowerCase()
}

const CABINET_AUTHOR = /^government of the day$/i

const isCabinetAuthor = (names: string[]) => names.some((name) => CABINET_AUTHOR.test(name.trim()))

const withSearchText = (record: Omit<LegislationRecord, 'searchText'>): LegislationRecord => ({
	...record,
	searchText: buildSearchText(record),
})

/* ============================================================
   Prose enrichment from the older hand-compiled BAA catalogue

   `baa.min.json` covers BAA 1-89 with written summaries, key effects,
   and source links that the structured registry doesn't carry. The
   registry is the spine (94 acts); this fills in the narrative where
   it exists.
   ============================================================ */

type LegacyAct = {
	baa_number?: unknown
	title_official?: unknown
	source_link?: unknown
	source_links?: unknown
	principal_authors?: unknown
	co_authors?: unknown
	data_quality_notes?: unknown
	analysis?: {
		comprehensive_gist?: unknown
		key_effects?: unknown
		appropriation_amount_if_identified?: unknown
		fiscal_year_if_identified?: unknown
		implementation_or_policy_notes?: unknown
	}
}

const legacyActs = (() => {
	const raw = readJson<{ records?: LegacyAct[] | Record<string, LegacyAct> }>(
		path.join(DATASET_ROOT, 'baa.min.json'),
	)

	if (!raw?.records) return new Map<number, LegacyAct>()

	const list = Array.isArray(raw.records) ? raw.records : Object.values(raw.records)

	return new Map(list.map((record) => [Number(record.baa_number ?? 0), record]))
})()

/* ============================================================
   Readings

   Written analyses live in their own file rather than in the registry
   capture, because they are a different kind of thing: the registry is
   Parliament's data normalised, and a reading is what the measure's own
   documents say once someone has read them. Keeping them apart means a
   re-capture never overwrites a reading, and a reading never gets mistaken
   for something Parliament published.
   ============================================================ */

type RawReading = Partial<MeasureReading> & { category?: string; number?: number }

const readings = (() => {
    const file = readJson<{ readings?: RawReading[] }>(
        path.join(DATASET_ROOT, 'readings.json'),
    )

    const index = new Map<string, MeasureReading>()
    for (const entry of file?.readings ?? []) {
        if (!entry.category || typeof entry.number !== 'number' || !entry.whatItDoes) continue
        index.set(`${entry.category}-${entry.number}`, {
            whatItDoes: entry.whatItDoes,
            whyProposed: entry.whyProposed,
            whoIsAffected: entry.whoIsAffected ?? [],
            implementedBy: entry.implementedBy ?? [],
            funding: entry.funding,
            whatChanges: entry.whatChanges ?? [],
            deliberation: entry.deliberation ?? [],
            insight: entry.insight,
            readFrom: entry.readFrom ?? [],
            readOn: entry.readOn ?? '',
        })
    }

    return index
})()

const readingFor = (category: CategorySlug, number: number): MeasureReading | undefined =>
    readings.get(`${category}-${number}`)

/* ============================================================
   Category loaders
   ============================================================ */

function loadActs(): LegislationRecord[] {
	return readCollection<RegistryRecord>('baa', 'BAA-')
		.map((raw) => {
			const basic = raw.basic_information ?? {}
			const number = Number(basic.baa_number ?? 0)
			const legacy = legacyActs.get(number)
			const dateIso = clean(basic.date_ratified) || undefined
			const shortTitle = clean(basic.short_title)
			const officialTitle = officialTitleFor(
				'acts',
				number,
				clean(basic.official_title) || clean(legacy?.title_official),
			)
			const status = describeStatus(clean(basic.current_status, 'Enacted'))
			const relations = raw.related_legislation ?? {}
			const { sectors, types } = splitTags(raw.impact?.impact_tags)

			// Who wrote an act is the hardest field on this dataset to fill, and
			// it is worth naming why rather than letting it come out empty.
			//
			// No captured act file names its authors: all 94 carry the same
			// `pending_capture` sentinel and the same note — the authors are on
			// the origin bill's page. Parliament's own acts index is no help
			// either; it publishes a number, a title, a link and a date, and no
			// author field at all. (It is still read here: if the index ever
			// grows one, this picks it up without a change.)
			//
			// So the hand-compiled catalogue answers for the acts it covers —
			// BAA 1-89, and only 48 of those actually carry authors — and after
			// it, the bill the act was. The bills index names every principal and
			// co-author for all 477 of them, and the bill that became an act is
			// the same measure under its earlier name, so its authors are the
			// act's authors. That is what fills BAA 90: nothing in the acts data
			// names anyone, and Bill 328 names twenty.
			// The bill this act was. The captured file names it on a sixth of the
			// acts; the bills index names the act each bill became, so it answers
			// for the rest of what has been captured. Resolved here rather than
			// further down because the authors below are read off it.
			const officialAct = getOfficialMeasure('acts', number)
			const originBillNumber = parseMeasureNumber(relations?.origin_bill)
			const originBill = originBillNumber
				? getOfficialBill(originBillNumber)
				: getOfficialBillForAct(number)
			const capturedPrincipals = cleanArray(raw.authors_and_sponsors?.principal_authors)
			const indexedPrincipals = officialAct?.principalAuthors ?? []
			const legacyPrincipals = cleanArray(legacy?.principal_authors)

			const principalAuthors = capturedPrincipals.length
				? capturedPrincipals
				: indexedPrincipals.length
					? indexedPrincipals
					: legacyPrincipals.length
						? legacyPrincipals
						: (originBill?.principalAuthors ?? [])

			// Read from whichever source supplied the principals, so a measure is
			// never credited with one list's principals and another's co-authors.
			const coAuthors = capturedPrincipals.length
				? cleanArray(raw.authors_and_sponsors?.co_authors)
				: indexedPrincipals.length
					? (officialAct?.coAuthors ?? [])
					: legacyPrincipals.length
						? cleanArray(legacy?.co_authors)
						: (originBill?.coAuthors ?? [])


			return withSearchText({
				id: `acts-${number}`,
				reading: readingFor('acts', number),
				category: 'acts',
				number,
				numberLabel: `BAA ${number}`,
				display: `Bangsamoro Autonomy Act No. ${number}`,
				title: fullTitle(shortTitle, officialTitle),
				shortTitle: shortName(shortTitle, fullTitle(shortTitle, officialTitle)) || undefined,
				titleOfficial: officialTitle || shortTitle || 'Title not recorded',
				status: status.label,
				statusShort: status.short,
				statusTone: status.tone,
				// The rungs a bill climbs, dated from that bill's own history.
				journey: actJourney(originBill?.history ?? [], dateIso),
				statusMeaning: status.meaning,
				dateIso,
				dateDisplay: formatDate(dateIso),
				dateLabel: 'Ratified',
				year: dateIso?.slice(0, 4) ?? 'Undated',
				// The sitting that passed it, written as the years it covered.
				era: parliamentLabel(clean(basic.enacting_parliament)) || undefined,
				sectors,
				types,
				authors: [...principalAuthors, ...coAuthors],
				principalAuthors,
				coAuthors,
				isCabinetMeasure: isCabinetAuthor([...principalAuthors, ...coAuthors]),
				originBillNumber: originBillNumber ?? originBill?.number,
				amendsBaa: parseMeasureNumbers(relations?.amends),
				amendedByBaa: parseMeasureNumbers(relations?.amended_by),
				repeals: clean(relations?.repeals) || undefined,
				// The hand-written catalogue reads better than the generated
				// summary, so it wins where it exists.
				gist:
					clean(legacy?.analysis?.comprehensive_gist) ||
					clean(raw.citizen_summary?.what_is_this_about) ||
					undefined,
				keyEffects: cleanArray(legacy?.analysis?.key_effects).length
					? cleanArray(legacy?.analysis?.key_effects)
					: cleanArray(raw.key_provisions),
				appropriationAmount:
					clean(legacy?.analysis?.appropriation_amount_if_identified) ||
					clean(raw.implementation_status?.budget_appropriated) ||
					undefined,
				fiscalYear: clean(legacy?.analysis?.fiscal_year_if_identified) || undefined,
				citizenMeaning: clean(raw.citizen_summary?.what_will_change) || undefined,
				citizenEngage: answerMatching(raw.citizen_questions, /read|full text|engage|how can i/i),
				researchLeads: documentLeads(raw.related_documents),
				signalValue: clean(raw.display_header?.who_it_affects) || undefined,
				watchpoints: [
					clean(raw.implementation_status?.legal_challenge_note),
					clean(raw.authors_and_sponsors?.note),
				].filter(Boolean),
				sourceUrl:
					clean(legacy?.source_link) || 'https://parliament.bangsamoro.gov.ph/baa-new/',
				sourceLinks: Array.isArray(legacy?.source_links)
					? (legacy.source_links as Array<Record<string, unknown>>).map((link) => ({
							type: clean(link.type, 'source'),
							url: clean(link.url) || undefined,
							accessNote: clean(link.access_note) || undefined,
							fileName: clean(link.file_name) || undefined,
						}))
					: [],
				notes:
					clean(legacy?.analysis?.implementation_or_policy_notes) ||
					clean(legacy?.data_quality_notes) ||
					undefined,
				disclaimer: clean(raw.provenance?.generation) || undefined,
			})
		})
		.sort((left, right) => right.number - left.number)
}

function loadBills(actsByOriginBill: Map<number, number>): LegislationRecord[] {
	return readCollection<RegistryRecord>('bills', 'BILL-')
		.map((raw) => {
			const basic = raw.basic_information ?? {}
			const number = Number(basic.bill_number ?? 0)
			const dateIso = clean(basic.status_as_of) || undefined
			const shortTitle = clean(basic.short_title)
			const officialTitle = officialTitleFor('bills', number, clean(basic.official_title))
			const status = describeStatus(clean(basic.current_status))
			const { sectors, types } = splitTags(raw.impact?.impact_tags)

			// Most captured bill files carry no authors — Parliament publishes
			// them on the bill's own page, not in the index this registry read.
			// Its bills index does carry them, so it fills the blank. A file
			// that names its own authors is left alone.
			const official = getOfficialBill(number)
			const principalAuthors = cleanArray(raw.authors_and_sponsors?.principal_authors).length
				? cleanArray(raw.authors_and_sponsors?.principal_authors)
				: (official?.principalAuthors ?? [])
			const coAuthors = cleanArray(raw.authors_and_sponsors?.co_authors).length
				? cleanArray(raw.authors_and_sponsors?.co_authors)
				: (official?.coAuthors ?? [])

			return withSearchText({
				id: `bills-${number}`,
				reading: readingFor('bills', number),
				category: 'bills',
				number,
				numberLabel: `Parliament Bill ${number}`,
				display: `Parliament Bill No. ${number}`,
				title: fullTitle(shortTitle, officialTitle),
				shortTitle: shortName(shortTitle, fullTitle(shortTitle, officialTitle)) || undefined,
				titleOfficial: officialTitle || shortTitle || 'Title not recorded',
				status: status.label,
				statusShort: status.short,
				statusTone: status.tone,
				// The ladder from the captured file, dated from the index behind it.
				journey: withHistoryDates(toJourney(raw.legislative_journey), official?.history ?? []),
				statusMeaning: status.meaning,
				dateIso,
				dateDisplay: formatDate(dateIso),
				dateLabel: 'Status as of',
				year: dateIso?.slice(0, 4) ?? 'Undated',
				session: sessionLabel(clean(basic.session)) || undefined,
				sectors,
				types,
				authors: [...principalAuthors, ...coAuthors],
				principalAuthors,
				coAuthors,
				isCabinetMeasure: isCabinetAuthor([...principalAuthors, ...coAuthors]),
				becameActNumber: actsByOriginBill.get(number),
				amendsBaa: parseMeasureNumbers(raw.related_legislation?.amends),
				amendedByBaa: [],
				repeals: clean(raw.related_legislation?.repeals) || undefined,
				gist: clean(raw.citizen_summary?.what_is_this_about) || undefined,
				keyEffects: cleanArray(raw.key_provisions),
				citizenMeaning: clean(raw.citizen_summary?.what_will_change) || undefined,
				citizenEngage: answerMatching(raw.citizen_questions, /support|oppose|engage|how can i/i),
				researchLeads: documentLeads(raw.related_documents),
				signalValue: clean(raw.display_header?.who_it_affects) || undefined,
				watchpoints: [clean(raw.citizen_summary?.when_will_it_take_effect)].filter(Boolean),
				sourceUrl: 'https://parliament.bangsamoro.gov.ph/bills/',
				sourceLinks: [],
				notes: clean(raw.implementation_status?.note) || undefined,
				disclaimer: clean(raw.provenance?.generation) || undefined,
			})
		})
		.sort((left, right) => right.number - left.number)
}

/* ============================================================
   Subjects read off the filed bill

   Parliament publishes every bill as a scan — page images from a document
   feeder, no text layer — so the registry could read a bill's number, title
   and status from the index and nothing else. That is why two fifths of the
   bills carried a subject tag and three fifths carried none.

   This file is the other three fifths, read by putting the filed PDF through
   OCR and taking the subject from what the bill actually says rather than
   from the words in its title. It is kept apart from the capture for the same
   reason the written readings are: a re-capture must never overwrite work
   done on the documents, and work done on the documents must never be
   mistaken for something Parliament published in this form.
   ============================================================ */

type BillSubjects = { number: number; sectors?: unknown }

const billSubjects = (() => {
	const raw = readJson<{ bills?: BillSubjects[] }>(path.join(DATASET_ROOT, 'bill-subjects.json'))

	const index = new Map<number, Tag[]>()
	for (const entry of raw?.bills ?? []) {
		const tags = cleanArray(entry.sectors)
			.filter((value) => classifyTag(value) === 'sector')
			.map((value) => ({ value, label: sectorLabel(value) }))
		if (tags.length) index.set(Number(entry.number), tags)
	}

	return index
})()

/**
 * The bills Parliament lists but this registry has not read.
 *
 * Its index publishes 475 bills; 192 have been captured as files. Showing only
 * those made the registry look like the whole of Parliament's output when it is
 * two fifths of it — and left a member credited on 340 bills with a list that
 * could show 136 of them. So the index entries stand in for the rest, carrying
 * what the index actually publishes: number, title, status, authors, sitting,
 * and the history behind it. What takes a reading of the measure — a summary,
 * its provisions, sector tags — stays empty, and the gaps note says so.
 */
function loadIndexedBills(
	captured: Set<number>,
	actsByOriginBill: Map<number, number>,
): LegislationRecord[] {
	return getOfficialMeasuresByCategory('bills')
		.filter((measure) => !captured.has(measure.number))
		.map((measure) => {
			const status = describeStatus(measure.status)
			const officialTitle = clean(measure.title)
			const authors = [...measure.principalAuthors, ...measure.coAuthors]

			return withSearchText({
				id: `bills-${measure.number}`,
				category: 'bills',
				number: measure.number,
				numberLabel: `Parliament Bill ${measure.number}`,
				display: `Parliament Bill No. ${measure.number}`,
				title: fullTitle('', officialTitle),
				titleOfficial: officialTitle || 'Title not recorded',
				status: status.label,
				statusShort: status.short,
				statusTone: status.tone,
				statusMeaning: status.meaning,
				journey: toHistoryJourney(measure.history),
				reading: readingFor('bills', measure.number),
				dateIso: measure.dateIso || undefined,
				dateDisplay: measure.dateDisplay,
				dateLabel: 'Status as of',
				year: measure.dateIso ? measure.dateIso.slice(0, 4) : 'Undated',
				session: sessionLabel(measure.session) || undefined,
				// Read off the filed document where it has been read; empty where the
				// scan could not be got at, which the coverage note states.
				sectors: billSubjects.get(measure.number) ?? [],
				types: [],
				authors,
				principalAuthors: measure.principalAuthors,
				coAuthors: measure.coAuthors,
				isCabinetMeasure: isCabinetAuthor(authors),
				becameActNumber:
					actsByOriginBill.get(measure.number) ?? parseMeasureNumber(measure.becameAct),
				amendsBaa: [],
				amendedByBaa: [],
				keyEffects: [],
				researchLeads: [],
				watchpoints: [],
				sourceUrl: measure.url || 'https://parliament.bangsamoro.gov.ph/bills/',
				sourceLinks: measure.url ? [{ type: 'Official page', url: measure.url }] : [],
				notes: measure.committeeReferrals
					? `Referred to the ${measure.committeeReferrals}.`
					: undefined,
			})
		})
}

function loadAdoptedResolutions(): LegislationRecord[] {
	return readCollection<RegistryRecord>('resolutions/adopted', 'RES-')
		.map((raw) => {
			const basic = raw.basic_information ?? {}
			const number = Number(basic.resolution_number ?? 0)
			const dateIso = clean(basic.date_adopted) || undefined
			const shortTitle = clean(basic.short_title)
			const officialTitle = officialTitleFor(
				'adopted-resolutions',
				number,
				clean(basic.official_title),
			)
			const status = describeStatus(clean(basic.current_status, 'Adopted'))
			const { sectors, types } = splitTags(raw.impact?.impact_tags)

			// No captured resolution file names its authors — every one of them
			// says the names are on the measure's own page, which hasn't been
			// read. The adopted index publishes them for all 578, so it stands in.
			// It lists a single roll rather than splitting principals from
			// co-authors, and that is how the record carries it.
			const captured = cleanArray(raw.authors_and_sponsors?.authors)
			const official = getOfficialMeasure('adopted-resolutions', number)
			const principalAuthors = captured.length ? captured : (official?.principalAuthors ?? [])
			const coAuthors = captured.length ? [] : (official?.coAuthors ?? [])
			const authors = [...principalAuthors, ...coAuthors]

			return withSearchText({
				id: `adopted-resolutions-${number}`,
				reading: readingFor('adopted-resolutions', number),
				category: 'adopted-resolutions',
				number,
				numberLabel: `Resolution ${number}`,
				display: `Parliament Resolution No. ${number}`,
				title: fullTitle(shortTitle, officialTitle),
				shortTitle: shortName(shortTitle, fullTitle(shortTitle, officialTitle)) || undefined,
				titleOfficial: officialTitle || shortTitle || 'Title not recorded',
				status: status.label,
				statusShort: status.short,
				statusTone: status.tone,
				journey: toJourney(raw.legislative_journey),
				statusMeaning:
					'Voted on and adopted by Parliament. Resolutions express its position; unlike an act, most are not binding on outside bodies.',
				dateIso,
				dateDisplay: formatDate(dateIso),
				dateLabel: 'Adopted',
				year: dateIso?.slice(0, 4) ?? 'Undated',
				sectors,
				types,
				authors,
				principalAuthors,
				coAuthors,
				isCabinetMeasure: isCabinetAuthor([...principalAuthors, ...coAuthors]),
				amendsBaa: [],
				amendedByBaa: [],
				gist: clean(raw.citizen_summary?.what_is_this_about) || undefined,
				keyEffects: cleanArray(raw.key_provisions),
				citizenMeaning: clean(raw.citizen_summary?.what_will_change) || undefined,
				citizenEngage: answerMatching(raw.citizen_questions, /read|full text|engage|how can i/i),
				researchLeads: documentLeads(raw.related_documents),
				signalValue: clean(raw.display_header?.who_it_affects) || undefined,
				watchpoints: [],
				sourceUrl: 'https://parliament.bangsamoro.gov.ph/adopted-resolutions/',
				sourceLinks: [],
				disclaimer: clean(raw.provenance?.generation) || undefined,
			})
		})
		.sort((left, right) => right.number - left.number)
}

/**
 * The stage ladder, read out of an index's own history lines.
 *
 * Registry files carry a structured journey with a `reached` flag for every
 * rung, including the ones a measure never got to. An index publishes only
 * what happened — "Filed – 7/15/2026", "Referred to the Committee on Health
 * – 7/16/2026" — so every line here is a stage reached, and the last one is
 * where the measure stands. The ladder is shorter than a registry record's,
 * not because the measure went nowhere, but because the source says less.
 */
function toHistoryJourney(history: string[]): JourneyStage[] {
	const stages = history
		.map((line): JourneyStage | null => {
			// "Referred to the Committee on Health – 7/16/2026 (Resumption)"
			const match = line.match(/^(.*?)\s*[–—-]\s*(\d{1,2}\/\d{1,2}\/\d{4})/)
			const label = clean(match ? match[1] : line)
			if (!label) return null

			const [month, day, year] = match ? match[2].split('/') : []
			const dateIso = match ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : ''

			return {
				label,
				reached: true,
				dateDisplay: dateIso ? formatDate(dateIso, '') || undefined : undefined,
				current: false,
			}
		})
		.filter((stage): stage is JourneyStage => stage !== null)

	if (stages.length > 0) stages[stages.length - 1].current = true

	return stages
}

/**
 * The adopted resolutions Parliament lists but this registry has not read.
 *
 * The same gap the bills had: the index publishes 578, and 194 have been
 * captured as files. The index entries stand in for the rest so the list is
 * every resolution Parliament adopted, not every one we have read.
 */
function loadIndexedAdoptedResolutions(captured: Set<number>): LegislationRecord[] {
	return getOfficialMeasuresByCategory('adopted-resolutions')
		.filter((measure) => !captured.has(measure.number))
		.map((measure) => {
			const status = describeStatus(measure.status || 'Adopted')
			const officialTitle = clean(measure.title)
			const authors = [...measure.principalAuthors, ...measure.coAuthors]

			return withSearchText({
				id: `adopted-resolutions-${measure.number}`,
				category: 'adopted-resolutions',
				number: measure.number,
				numberLabel: `Resolution ${measure.number}`,
				display: `Parliament Resolution No. ${measure.number}`,
				title: fullTitle('', officialTitle),
				titleOfficial: officialTitle || 'Title not recorded',
				status: status.label,
				statusShort: status.short,
				statusTone: status.tone,
				statusMeaning:
					'Voted on and adopted by Parliament. Resolutions express its position; unlike an act, most are not binding on outside bodies.',
				journey: toHistoryJourney(measure.history),
				reading: readingFor('adopted-resolutions', measure.number),
				dateIso: measure.dateIso || undefined,
				dateDisplay: measure.dateDisplay,
				dateLabel: 'Adopted',
				year: measure.dateIso ? measure.dateIso.slice(0, 4) : 'Undated',
				session: sessionLabel(measure.session) || undefined,
				sectors: [],
				types: [],
				authors,
				principalAuthors: measure.principalAuthors,
				coAuthors: measure.coAuthors,
				isCabinetMeasure: isCabinetAuthor(authors),
				amendsBaa: [],
				amendedByBaa: [],
				keyEffects: [],
				researchLeads: [],
				watchpoints: [],
				sourceUrl: measure.url || 'https://parliament.bangsamoro.gov.ph/adopted-resolutions/',
				sourceLinks: measure.url ? [{ type: 'Official page', url: measure.url }] : [],
				notes: measure.committeeReferrals
					? `Referred to the ${measure.committeeReferrals}.`
					: undefined,
			})
		})
}

/**
 * Proposed resolutions, built from Parliament's index rather than from
 * captured files — there are none. Everything the index publishes is carried
 * over: number, title, status, authors, sitting, and the history behind it.
 * The fields that take a reading of the measure — a summary, its provisions,
 * what it would change — stay empty, and the gaps note says so.
 */
function loadProposedResolutions(): LegislationRecord[] {
	return getOfficialMeasuresByCategory('proposed-resolutions').map((measure) => {
		const status = describeStatus(measure.status)
		const officialTitle = clean(measure.title)

		return withSearchText({
			id: `proposed-resolutions-${measure.number}`,
			reading: readingFor('proposed-resolutions', measure.number),
			category: 'proposed-resolutions',
			number: measure.number,
			numberLabel: `Resolution ${measure.number}`,
			display: `Proposed Resolution No. ${measure.number}`,
			title: fullTitle('', officialTitle),
			titleOfficial: officialTitle || 'Title not recorded',
			status: status.label,
			statusShort: status.short,
			statusTone: status.tone,
			statusMeaning: status.meaning,
			journey: toHistoryJourney(measure.history),
			dateIso: measure.dateIso || undefined,
			dateDisplay: measure.dateDisplay,
			dateLabel: 'Status as of',
			year: measure.dateIso ? measure.dateIso.slice(0, 4) : 'Undated',
			session: sessionLabel(measure.session) || undefined,
			sectors: [],
			types: [],
			// The index keeps the two apart, unlike the adopted list.
			authors: [...measure.principalAuthors, ...measure.coAuthors],
			principalAuthors: measure.principalAuthors,
			coAuthors: measure.coAuthors,
			isCabinetMeasure: isCabinetAuthor([...measure.principalAuthors, ...measure.coAuthors]),
			amendsBaa: [],
			amendedByBaa: [],
			keyEffects: [],
			researchLeads: [],
			watchpoints: [],
			sourceUrl: 'https://parliament.bangsamoro.gov.ph/proposed-resolutions/',
			sourceLinks: measure.url ? [{ type: 'Official page', url: measure.url }] : [],
			notes: measure.committeeReferrals
				? `Referred to the ${measure.committeeReferrals}.`
				: undefined,
		})
	})
}

/* ============================================================
   Assembly — parsed once per process, reused by every route.
   ============================================================ */

const allRecords: Record<CategorySlug, LegislationRecord[]> = (() => {
	const acts = loadActs()

	// A bill that became law is the single most useful cross-reference in the
	// whole registry, so build the inverse index before parsing bills.
	const actsByOriginBill = new Map<number, number>()
	for (const act of acts) {
		if (act.originBillNumber) actsByOriginBill.set(act.originBillNumber, act.number)
	}

	const capturedAdopted = loadAdoptedResolutions()
	const adopted = [
		...capturedAdopted,
		...loadIndexedAdoptedResolutions(new Set(capturedAdopted.map((record) => record.number))),
	].sort((left, right) => right.number - left.number)
	const proposed = loadProposedResolutions()

	const capturedBills = loadBills(actsByOriginBill)
	const capturedBillNumbers = new Set(capturedBills.map((record) => record.number))

	return {
		acts,
		// A captured file always wins — it says more — and the index fills the
		// rest, so the list is every bill Parliament lists rather than every bill
		// this registry has read.
		bills: [...capturedBills, ...loadIndexedBills(capturedBillNumbers, actsByOriginBill)].sort(
			(left, right) => right.number - left.number,
		),
		// Parliament publishes the two rolls separately; a reader wants one list
		// of resolutions, so `/resolutions` is the merged view and the two source
		// lists stay addressable behind it. Highest number first, as every other
		// category reads, with the two rolls interleaved by number.
		resolutions: [...adopted, ...proposed].sort((left, right) => right.number - left.number),
		'adopted-resolutions': adopted,
		'proposed-resolutions': proposed,
		journal: [],
		irr: [],
	}
})()

function buildOptions(
	records: LegislationRecord[],
	pick: (record: LegislationRecord) => Array<{ value: string; label: string }>,
	sort?: (left: FilterOption, right: FilterOption) => number,
): FilterOption[] {
	const tally = new Map<string, FilterOption>()

	for (const record of records) {
		for (const entry of pick(record)) {
			if (!entry.value) continue

			const existing = tally.get(entry.value)
			if (existing) existing.count += 1
			else tally.set(entry.value, { ...entry, count: 1 })
		}
	}

	// Default: most common first — the useful order for a filter list.
	return Array.from(tally.values()).sort(
		sort ?? ((left, right) => right.count - left.count || left.label.localeCompare(right.label)),
	)
}

const DATASET_COVERAGE: Record<CategorySlug, string> = {
	acts: 'BAA 1–94 (2019–2026), complete',
	bills: 'Bills 1–475 (2019 – Jul 2026), from Parliament’s index; 192 read in full',
	resolutions: 'Every resolution Parliament lists — 578 adopted and 819 proposed',
	'adopted-resolutions': 'Resolutions 1–578 from Parliament’s index; 194 read in full',
	'proposed-resolutions': 'Resolutions 1–825 (Jun 2022 – Jul 2026), from Parliament’s index',
	journal: 'Not yet captured',
	irr: 'Not yet captured',
}

const RESOLUTION_GAPS = [
	'The two lists are read together here, so a resolution that was filed and later adopted appears twice — once on each roll, as Parliament lists it. The adopted/proposed filter separates them.',
	'Every resolution Parliament lists is here, but only 194 of the 578 adopted ones have been read as documents, and none of the proposed ones. The rest carry what the index publishes — number, title, status, authors, sitting, history — and no summary, provisions, or sector tags.',
	'The proposed index lists 819 resolutions numbered up to 825; the numbers in between are not published on it.',
]

const DATASET_GAPS: Record<CategorySlug, string[]> = {
	resolutions: RESOLUTION_GAPS,
	acts: [
		'Author metadata is available only for acts covered by the earlier hand-compiled catalogue (BAA 1–89).',
		'BAA 94 appears to duplicate BAA 93 on the official index and is flagged for verification.',
	],
	bills: [
		'Every bill Parliament lists is here, but only 192 of the 475 have been read as documents. The rest carry what the index publishes — number, title, status, authors, sitting, and history — and no summary, provisions, or sector tags.',
		'Parliament’s index lists two bills twice under the same number with different titles; where that happens the entry with the fuller history is the one shown.',
	],
	'adopted-resolutions': [
		'Every adopted resolution Parliament lists is here, but only 194 of the 578 have been read as documents. The rest carry what the index publishes and no summary, provisions, or sector tags.',
	],
	'proposed-resolutions': [
		'These come from Parliament’s proposed-resolutions index, not from reading each resolution. Every record carries its number, title, status, authors, sitting, and history — and none carries a summary, provisions, or sector tags, because no resolution page has been read yet.',
		'The index lists 819 resolutions numbered up to 825; the numbers in between are not published on it.',
		'A resolution that has since been adopted appears here as filed and again under Adopted Resolutions, which is how Parliament lists them.',
	],
	journal: [
		'Session journals are published as PDF archives split across two Parliament pages and have not been captured.',
	],
	irr: ['Implementing rules for enacted acts have not been captured.'],
}

/** How each source list is named where records from several are read together. */
const KIND_LABELS: Partial<Record<CategorySlug, string>> = {
	acts: 'Enacted',
	bills: 'Bills',
	'adopted-resolutions': 'Adopted',
	'proposed-resolutions': 'Proposed',
}

export function getDataset(slug: CategorySlug): LegislationDataset {
	const category = getCategory(slug)
	const records = allRecords[slug]
	const years = records.map((record) => record.year).filter((year) => year !== 'Undated')

	const kinds = buildOptions(records, (record) => {
		const label = KIND_LABELS[record.category]
		return label ? [{ value: record.category, label }] : []
	})

	return {
		category,
		metadata: {
			datasetName: `${category.officialLabel} — Bangsamoro Legislative Registry`,
			generatedAt: GENERATED_AT,
			coverage: DATASET_COVERAGE[slug],
			recordCount: records.length,
			scopeNote: category.description,
			knownGaps: DATASET_GAPS[slug],
			sourceUrl: category.sourceUrl,
		},
		records,
		// One option means every record is of that kind, which is no filter at all.
		kinds: kinds.length > 1 ? kinds : [],
		sectors: buildOptions(records, (record) => record.sectors),
		types: buildOptions(records, (record) => record.types),
		statuses: buildOptions(records, (record) => [
			{ value: record.status, label: record.status },
		]),
		years: buildOptions(
			records,
			(record) => (record.year === 'Undated' ? [] : [{ value: record.year, label: record.year }]),
			(left, right) => right.label.localeCompare(left.label),
		),
		sessions: buildOptions(records, (record) =>
			record.session ? [{ value: record.session, label: record.session }] : [],
		),
		stats: {
			total: records.length,
			sectors: new Set(records.flatMap((record) => record.sectors.map((tag) => tag.value))).size,
			enacted: records.filter((record) => record.statusTone === 'enacted').length,
			inProgress: records.filter(
				(record) => record.statusTone === 'advancing' || record.statusTone === 'early',
			).length,
			earliestYear: years.length ? years.reduce((a, b) => (a < b ? a : b)) : '—',
			latestYear: years.length ? years.reduce((a, b) => (a > b ? a : b)) : '—',
		},
	}
}

export function getCategoryCounts(): Record<CategorySlug, number> {
	return {
		acts: allRecords.acts.length,
		bills: allRecords.bills.length,
		resolutions: allRecords.resolutions.length,
		'adopted-resolutions': allRecords['adopted-resolutions'].length,
		'proposed-resolutions': allRecords['proposed-resolutions'].length,
		journal: 0,
		irr: 0,
	}
}

/* ============================================================
   Finding a measure by its name

   Some sources cite a measure by title and nothing else — the committee
   pages list what was referred to them as a line of capitals with a link to
   a WordPress permalink, no number anywhere. Matching on the title is the
   only join available, and it is exact: every one of the 753 referrals on
   those pages resolves to a record this way.
   ============================================================ */

const titleKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

let recordsByTitle: Map<string, LegislationRecord> | null = null

/** A measure whose published title matches, where one does. */
export function findRecordByTitle(title: string): LegislationRecord | undefined {
	if (!recordsByTitle) {
		recordsByTitle = new Map()
		for (const record of getAllRecords()) {
			// The official title first: that is the form other pages quote.
			for (const candidate of [record.titleOfficial, record.title]) {
				const key = titleKey(candidate)
				if (key && !recordsByTitle.has(key)) recordsByTitle.set(key, record)
			}
		}
	}

	const key = titleKey(title)
	return key ? recordsByTitle.get(key) : undefined
}

/** Every captured measure, in one list — used to index measures by author. */
export function getAllRecords(): LegislationRecord[] {
	// `resolutions` already holds both rolls, so the two source lists are not
	// read again — a measure counted twice would be credited twice on a profile.
	return [...allRecords.acts, ...allRecords.bills, ...allRecords.resolutions]
}

/** One measure by its roll and number — the lookup behind each record page. */
export function getRecord(category: CategorySlug, number: number): LegislationRecord | undefined {
	if (!Number.isFinite(number)) return undefined
	return allRecords[category].find((record) => record.number === number)
}

/**
 * Every number on a roll, for `generateStaticParams`.
 *
 * Deduplicated: a roll is assembled from captured files plus Parliament's
 * index, and a number appearing in both would otherwise be prerendered twice.
 */
export function getRecordNumbers(category: CategorySlug): number[] {
	return [...new Set(allRecords[category].map((record) => record.number))]
}

/**
 * The registry at a glance, for the standing caveat above the footer.
 *
 * The caveat is only worth reading if it says how far the reading actually
 * goes, so these are the two numbers that matter: everything Parliament lists,
 * and the far smaller count of measures whose own documents someone opened and
 * quoted. The gap between them is the honest shape of this registry.
 */
export type RegistryScale = {
	/** Every act, bill and resolution Parliament publishes an index for. */
	listed: number
	/** Measures read from their own documents, section by section. */
	read: number
	/** Earliest and latest year carried by any record, e.g. "2019-2026". */
	years: string
	/** The date the registry was last rebuilt from source. */
	compiledOn: string
}

export function getRegistryScale(): RegistryScale {
	const records = getAllRecords()
	const years = records
		.map((record) => record.year)
		.filter((year) => /^\d{4}$/.test(year))
		.sort()

	return {
		listed: records.length,
		read: records.filter((record) => record.reading).length,
		years: years.length > 0 ? `${years[0]}\u2013${years[years.length - 1]}` : '',
		compiledOn: GENERATED_AT,
	}
}

export const registryGeneratedAt = GENERATED_AT
