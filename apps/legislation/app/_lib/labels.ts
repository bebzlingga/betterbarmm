/**
 * Presentation helpers for the registry's raw values.
 *
 * The Parliament publishes titles in ALL CAPS and tags in snake_case. Both are
 * hostile to read in bulk, so everything is normalised here — in one place, so
 * the same act reads identically in a list row, a filter chip, and a detail view.
 */

/** Acronyms that must survive title-casing intact. */
const ACRONYMS = new Set([
	'BARMM',
	'BAA',
	'BTA',
	'IRR',
	'LGU',
	'LGUs',
	'SGA',
	'MILF',
	'MNLF',
	'GAAB',
	'FY',
	'RA',
	'PD',
	'EO',
	'COA',
	'CSC',
	'DILG',
	'DPWH',
	'DSWD',
	'TESDA',
	'PNP',
	'AFP',
	'ARMM',
	'OPAPRU',
	'NGO',
	'NGOs',
	'ICT',
	'HIV',
	'AIDS',
	'TB',
	'MSME',
	'MSMEs',
	'PWD',
	'PWDs',
	'IP',
	'IPs',
	'OFW',
	'OFWs',
	'SK',
	'VAT',
	'ID',
	'IDs',
	'CSO',
	'CSOs',
	'PPE',
	'BOL',
	'CAB',
	'MOA',
	'MOU',
	'USA',
	'UN',
	'OIC',
	'ASEAN',
])

/** Words that stay lowercase inside a title (unless first or last). */
const MINOR_WORDS = new Set([
	'a',
	'an',
	'the',
	'and',
	'or',
	'nor',
	'but',
	'of',
	'for',
	'in',
	'on',
	'to',
	'at',
	'by',
	'from',
	'as',
	'with',
	'into',
	'onto',
	'over',
	'per',
	'via',
	'vs',
	// Filipino / Bangsamoro particles that appear in program names
	'sa',
	'ng',
	'mga',
	'para',
	'at',
	'na',
])

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1)

/**
 * Converts an ALL-CAPS official title into sentence-friendly title case while
 * preserving acronyms, hyphenated compounds, and quoted program names.
 *
 * "AN ACT ESTABLISHING THE 'MAY AYUDA SA BASURA' PROGRAM (TRASH-TO-CASH SYSTEM)"
 *   -> "An Act Establishing the 'May Ayuda sa Basura' Program (Trash-to-Cash System)"
 *
 * Titles that are already mixed-case are left alone — they were written by a
 * human and re-casing them only introduces errors.
 */
export function toTitleCase(value: string): string {
	const trimmed = value.trim()
	if (!trimmed) return ''

	const letters = trimmed.replace(/[^A-Za-z]/g, '')
	if (!letters) return ''

	// Nearly all capitals, rather than every last one — the same test
	// `toDisplayTitle` applies, so a measure reads the same in the registry as
	// it does on a member's profile. An index entry often shouts every word but
	// one: a proper name typed normally, or a plural acronym like "(OFWs)".
	// Those few lowercase letters should not exempt the whole line.
	const capitals = letters.replace(/[^A-Z]/g, '').length
	if (capitals / letters.length < 0.7) return trimmed

	// Split on whitespace but keep the words' surrounding punctuation attached.
	const words = trimmed.split(/\s+/)

	return words
		.map((word, index) => {
			// The word was not shouting to begin with, so it was typed that way
			// deliberately — leave it exactly as it is.
			if (/[a-z]/.test(word)) return word

			// Recurse through hyphenated compounds: TRASH-TO-CASH -> Trash-to-Cash
			if (word.includes('-') && word.replace(/-/g, '').length > 0) {
				return word
					.split('-')
					.map((part, partIndex) => casePart(part, index === 0 && partIndex === 0))
					.join('-')
			}

			return casePart(word, index === 0 || index === words.length - 1)
		})
		.join(' ')
}

function casePart(word: string, isEdge: boolean): string {
	// Peel leading/trailing punctuation so ('MAY -> ('May and SYSTEM). -> System).
	const match = word.match(/^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9]*)$/)
	if (!match) return word

	const [, lead, core, tail] = match
	if (!core) return word

	// Exact first, so a plural like "OFWs" keeps its lowercase s.
	if (ALL_ACRONYMS.has(core)) return `${lead}${core}${tail}`
	if (ALL_ACRONYMS.has(core.toUpperCase())) return `${lead}${core.toUpperCase()}${tail}`

	// Numbers and alphanumeric codes pass through untouched.
	if (/\d/.test(core)) return `${lead}${core}${tail}`

	const lower = core.toLowerCase()

	if (!isEdge && MINOR_WORDS.has(lower)) {
		return `${lead}${lower}${tail}`
	}

	return `${lead}${capitalize(lower)}${tail}`
}

/* ============================================================
   People's names

   Every index writes a name the same way and in the same voice —
   "ANAYATIN, SUSANA S." Capitals are how a spreadsheet stores a name, not
   how a page should print one, so anything written that way is re-cased.
   The listing order is kept: surname first is what makes an alphabetical
   list of names read as one.
   ============================================================ */

/** Suffixes that are numerals, not words — "III" must not become "Iii". */
const NAME_ROMAN_NUMERAL = /^(?:II|III|IV|V|VI|VII)$/

/** Lowercases then capitalises each part, so hyphens and apostrophes survive. */
export const capitaliseNameToken = (token: string) =>
	token.toLowerCase().replace(/(^|[-'])([a-z])/g, (_, boundary, letter) => boundary + letter.toUpperCase())

/** "ANAYATIN, SUSANA S." -> "Anayatin, Susana S." A name already cased is left alone. */
export function toPersonName(value: string): string {
	const raw = value.trim()
	if (!raw || /[a-z]/.test(raw)) return raw

	return raw
		.split(/(\s+)/)
		.map((token) => {
			if (!token.trim()) return token
			if (NAME_ROMAN_NUMERAL.test(token.replace(/[^A-Za-z]/g, ''))) return token
			return capitaliseNameToken(token)
		})
		.join('')
}

/** Human labels for the registry's snake_case sector tags. */
const SECTOR_LABELS: Record<string, string> = {
	health: 'Health',
	education: 'Education',
	women_children_social_welfare: 'Women, Children & Social Welfare',
	local_government: 'Local Government',
	islamic_culture_heritage: 'Islamic Culture & Heritage',
	governance_civil_service: 'Governance & Civil Service',
	environment_agriculture_fisheries: 'Environment, Agriculture & Fisheries',
	peace_security_justice: 'Peace, Security & Justice',
	economy_trade_investment: 'Economy, Trade & Investment',
	infrastructure_transport: 'Infrastructure & Transport',
	elections_districting: 'Elections & Districting',
	budget_appropriations: 'Budget & Appropriations',
	sports_youth: 'Sports & Youth',
	indigenous_settlers: 'Indigenous Peoples & Settlers',
	disaster_resilience: 'Disaster Resilience',
	other: 'Other',

	/* The acts were tagged under an earlier vintage of this vocabulary and
	   were never re-tagged, so the same subject is written two ways across the
	   two lists — "infrastructure" against "infrastructure_transport",
	   "elections" against "elections_districting". Unlisted keys fall through
	   to `humanizeSnake`, which printed them as "Environment Climate" and
	   "Business Trade": a filter option and a chart row that read as raw data
	   rather than as English.

	   Named, not merged. Folding the old keys into the new ones would assert
	   equivalences the registry does not: "culture_heritage" is not only
	   Islamic heritage, and "agriculture_fisheries" carries no claim about the
	   environment. Two subjects that overlap is the truth about the data; one
	   subject invented here would not be. */
	culture_heritage: 'Culture & Heritage',
	infrastructure: 'Infrastructure',
	elections: 'Elections',
	agriculture_fisheries: 'Agriculture & Fisheries',
	environment_climate: 'Environment & Climate',
	business_trade: 'Business & Trade',
	health_services: 'Health Services',
	science_technology: 'Science & Technology',
	youth: 'Youth',
}

/** Human labels for the registry's snake_case measure-type tags. */
const TYPE_LABELS: Record<string, string> = {
	// Acts
	budget_finance: 'Budget & Finance',
	hospital_health: 'Hospitals & Health',
	institution_commission: 'New Institution or Commission',
	municipality_lgu: 'Municipality & LGU',
	symbols_identity: 'Symbols & Identity',
	labor_social: 'Labor & Social',
	priority_code: 'Priority Code',
	governance_other: 'Governance',
	// Resolutions
	directive_oversight: 'Directive & Oversight',
	commendation: 'Commendation',
	national_intergovernmental: 'National & Intergovernmental',
	islamic_affairs: 'Islamic Affairs',
	condemnation_justice: 'Condemnation & Justice',
	internal_rules: 'Internal Rules',
	international_solidarity: 'International Solidarity',
	elections_districting: 'Elections & Districting',
	other: 'Other',
}

const humanizeSnake = (value: string) =>
	value
		.split('_')
		.map((part) => capitalize(part))
		.join(' ')

export const sectorLabel = (value: string) => SECTOR_LABELS[value] ?? humanizeSnake(value)

/* ============================================================
   Sittings

   The same session is written two ways by the two sources: captured
   registry files spell it out — "4th Regular Session (2025-)" — while
   Parliament's own indexes slug it — "fourth-regular-session-2025". Left
   alone, one sitting shows up as two filter options with different names,
   so both forms are normalised to the spelled-out one.
   ============================================================ */

const SESSION_ORDINALS: Record<string, string> = {
	first: '1st',
	second: '2nd',
	third: '3rd',
	fourth: '4th',
	fifth: '5th',
	sixth: '6th',
}

/** The years each sitting covers, as the registry writes them. */
const SESSION_SPANS: Record<string, string> = {
	'1st': '2022-2023',
	'2nd': '2022-2023',
	'3rd': '2024-2025',
	'4th': '2025-',
}

const writeSession = (ordinal: string, span: string) => `${ordinal} Regular Session (${span})`

export function sessionLabel(value: string): string {
	const raw = value.trim()
	if (!raw) return raw

	// Already spelled out — "4th Regular Session (2025-)".
	if (/^\d+(?:st|nd|rd|th)\s+regular\s+session/i.test(raw)) return raw

	// Slugged — "fourth-regular-session-2025", "second-regular-2022-2023".
	const slug = raw.toLowerCase().match(/^([a-z]+)-regular(?:-session)?-(\d{4})(?:-(\d{4}))?$/)
	if (slug) {
		const ordinal = SESSION_ORDINALS[slug[1]]
		if (ordinal) return writeSession(ordinal, slug[3] ? `${slug[2]}-${slug[3]}` : `${slug[2]}-`)
	}

	// A registry file that names its sitting only in passing — "(listed under
	// 4th session index)". The ordinal is the whole of what it says.
	const aside = raw.match(/(\d+)(?:st|nd|rd|th)\s+session/i)
	if (aside) {
		const ordinal = Object.values(SESSION_ORDINALS).find((entry) => entry.startsWith(aside[1]))
		const span = ordinal ? SESSION_SPANS[ordinal] : undefined
		if (ordinal && span) return writeSession(ordinal, span)
	}

	return raw
}

export const typeLabel = (value: string) => TYPE_LABELS[value] ?? humanizeSnake(value)

/* ============================================================
   Sittings of the Transition Authority

   The registry tags a measure with the parliament that passed it — "BTA2".
   That code means nothing to a reader; the years it covered mean something
   to everyone, so the tag is never printed as it stands.
   ============================================================ */

const PARLIAMENT_TERMS: Record<string, string> = {
	BTA1: 'February 2019 – August 2022',
	BTA2: 'September 2022 – February 2025',
	BTA3: 'March 2025 – Present',
}

/** "BTA3" -> "March 2025 – Present". An unknown tag is left as it was written. */
export function parliamentLabel(value: string): string {
	const raw = value.trim()
	if (!raw) return ''

	return PARLIAMENT_TERMS[raw.toUpperCase().replace(/\s+/g, '')] ?? raw
}

/**
 * Registry schema 2.0 merged the old `sectors` and `types` arrays into a single
 * `impact_tags` list, so the two dimensions are split back apart here to keep
 * "what policy area is this" separate from "what kind of measure is this" in
 * the filters. Every tag in the registry resolves through one of the two maps
 * above; `other` is dropped because it describes nothing a reader can filter on.
 */
export type TagKind = 'sector' | 'type' | 'ignored'

export function classifyTag(value: string): TagKind {
	if (value === 'other') return 'ignored'
	if (value in SECTOR_LABELS) return 'sector'
	if (value in TYPE_LABELS) return 'type'

	// Unknown tags are surfaced as sectors rather than silently dropped.
	return 'sector'
}

/* ============================================================
   Legislative status
   ============================================================ */

/**
 * One tone per stage of a measure's passage, in the order it travels them:
 * `filed` -> `early` (first reading) -> `committee` -> `advancing` (the floor)
 * -> `passed` (third reading) -> `enacted`. `archived` is the exit at any
 * point, and `neutral` covers a source that recorded no stage at all.
 *
 * Every surface colours from this one list, so a stage is the same colour on a
 * row badge as it is on a rung of a timeline.
 */
export type StatusTone =
	| 'filed'
	| 'early'
	| 'committee'
	| 'advancing'
	| 'passed'
	| 'enacted'
	| 'archived'
	| 'neutral'

/**
 * Maps a raw status string to a tone the UI can colour by, a plain-language
 * explanation of what that stage means, and a short label.
 *
 * The registry publishes status in its own voice — "ENACTED - IN FORCE",
 * "Second Reading (Committee Stage)". That is precise but shouts in a list of
 * two hundred rows, so `short` carries a scannable version for badges while
 * `label` keeps the official wording for the detail view.
 */
export function describeStatus(status: string): {
	label: string
	short: string
	tone: StatusTone
	meaning: string
} {
	const value = status.trim().toLowerCase()

	if (value.includes('enacted') || value.includes('in force')) {
		return {
			label: status,
			short: 'In force',
			tone: 'enacted',
			meaning: 'Signed into law and operative unless later amended or repealed.',
		}
	}

	if (value.includes('approved') || value.includes('third reading')) {
		return {
			label: status,
			short: 'Approved',
			tone: 'passed',
			meaning: 'Passed third reading. This measure has cleared Parliament.',
		}
	}

	if (value.includes('second reading')) {
		return {
			label: status,
			short: value.includes('committee') ? 'In committee' : 'Second reading',
			// The committee stage and the floor stage are both second reading,
			// but they are where a measure spends most of its life and where the
			// two halves of that life differ, so they are told apart by colour.
			tone: value.includes('committee') ? 'committee' : 'advancing',
			meaning:
				'Under committee study or floor debate. Amendments are still possible, and this is the stage where public input carries the most weight.',
		}
	}

	if (value.includes('first reading')) {
		return {
			label: status,
			short: 'First reading',
			tone: 'early',
			meaning:
				'Filed and formally read into the record, then referred to committee. No debate has happened yet.',
		}
	}

	if (value.includes('filed')) {
		return {
			label: status,
			short: 'Filed',
			tone: 'filed',
			meaning: 'Submitted to Parliament but not yet read into the record.',
		}
	}

	// The proposed-resolutions index words the committee stage this way rather
	// than by reading number.
	if (value.includes('referred')) {
		return {
			label: status,
			short: 'In committee',
			tone: 'committee',
			meaning:
				'Referred to a committee for study. It moves further only if that committee reports it back, and this is the stage where public input carries the most weight.',
		}
	}

	if (value.includes('deferred')) {
		return {
			label: status,
			short: 'Deferred',
			tone: 'archived',
			meaning: 'Set aside during a sitting rather than acted on. It moves again only if Parliament takes it back up.',
		}
	}

	if (value.includes('struck down') || value.includes('superseded') || value.includes('repealed')) {
		return {
			label: status,
			short: 'Superseded',
			tone: 'archived',
			meaning:
				'No longer operative. A later act replaced it, or a court set it aside — check the related legislation before relying on it.',
		}
	}

	if (value.includes('archived') || value.includes('withdrawn')) {
		return {
			label: status,
			short: 'Archived',
			tone: 'archived',
			meaning: 'No longer moving. It lapsed, was withdrawn, or the session ended.',
		}
	}

	if (value.includes('adopted')) {
		return {
			label: status,
			short: 'Adopted',
			tone: 'enacted',
			meaning: 'Voted on and adopted by Parliament.',
		}
	}

	return {
		label: status || 'Status not captured',
		short: 'Not captured',
		tone: 'neutral',
		meaning: 'The source listing did not record a stage for this measure.',
	}
}

/** Badge classes per tone, kept next to the tone definition. */
export const statusToneClass: Record<StatusTone, string> = {
	filed: 'badge badge-file',
	early: 'badge badge-early',
	committee: 'badge badge-committee',
	advancing: 'badge badge-move',
	passed: 'badge badge-pass',
	enacted: 'badge badge-done',
	archived: 'badge badge-idle',
	neutral: 'badge badge-idle',
}

/** Formats an ISO date for display, falling back gracefully. */
export function formatDate(isoValue: string | undefined, fallback = 'Date not recorded') {
	if (!isoValue) return fallback

	const parsed = new Date(`${isoValue}T00:00:00`)
	if (Number.isNaN(parsed.getTime())) return fallback

	return new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(parsed)
}

/* ============================================================
   Shouted titles

   Parliament publishes some measure titles in full capitals and others in
   sentence case, often in the same list. Capitals set at body size are
   slower to read and land as raised voices, so anything written that way is
   re-cased for display. Only shouted titles are touched — a title someone
   actually cased is left exactly as they wrote it.
   ============================================================ */

/** Small words that stay lowercase inside a title. */
const TITLE_MINOR_WORDS = new Set([
	'a',
	'an',
	'and',
	'as',
	'at',
	'by',
	'for',
	'from',
	'in',
	'into',
	'of',
	'on',
	'or',
	'per',
	'the',
	'to',
	'under',
	'upon',
	'with',
])

/**
 * Capitals that mean something. Without these, "BARMM" becomes "Barmm" and
 * the re-casing does more damage than the shouting did.
 */
const TITLE_ACRONYMS = new Set([
	'ARMM',
	'ASD',
	'BAA',
	'BARMM',
	'BIAF',
	'BOL',
	'BTA',
	'CAB',
	'FY',
	'GAA',
	'GPH',
	'IDB',
	'IRR',
	'LGU',
	'MBHTE',
	'MFBM',
	'MILF',
	'MNLF',
	'MOH',
	'MP',
	'MPOS',
	'MPW',
	'MSSD',
	'PWD',
	'SGA',
	'TESDA',
	'VAT',
])

/**
 * Ministries, offices, and bodies that Parliament abbreviates in a title.
 * Everything here was counted in the published indexes rather than guessed at,
 * so the list stays close to what the titles actually contain.
 */
const BODY_ACRONYMS = [
	'AFAB',
	'BARMMAA',
	'BBOI',
	'BCPCH',
	'BDI',
	'BDP',
	'BEDC',
	'BGC',
	'BHRC',
	'BICTO',
	'BIO',
	'BMOA',
	'BMOAs',
	'BPDA',
	'CAAP',
	'CHED',
	'COMELEC',
	'CPALE',
	'DBM',
	'DFA',
	'FTLE',
	'GOTD',
	'IDP',
	'IDPs',
	'IEC',
	'IGRB',
	'JBC',
	'JICA',
	'KSA',
	'MAFAR',
	'MENRE',
	'MILG',
	'MINDA',
	'MHSD',
	'MOOE',
	'MOST',
	'MOTC',
	'MSU',
	'MTIT',
	'NBI',
	'NCMF',
	'OCM',
	'PRC',
	'SDF',
]

/**
 * One list for both casing passes. `toTitleCase` runs when a record is built
 * and `toDisplayTitle` runs when one is rendered; an acronym known to only one
 * of them would survive in a list row and be flattened on a profile.
 */
const ALL_ACRONYMS = new Set([...ACRONYMS, ...TITLE_ACRONYMS, ...BODY_ACRONYMS])

function caseWord(word: string, isEdge: boolean): string {
	const bare = word.replace(/[^A-Za-z]/g, '')
	if (!bare) return word

	// Acronyms, roman numerals, and single initials keep their capitals.
	if (ALL_ACRONYMS.has(bare) || /^[IVXL]+$/.test(bare) || bare.length === 1) return word

	const lower = word.toLowerCase()
	if (!isEdge && TITLE_MINOR_WORDS.has(bare.toLowerCase())) return lower

	// Capitalise after a space, a hyphen, or an opening quote or bracket, so
	// "50-BED" and "(BARMM)" come out right.
	return lower.replace(/(^|[-–—("'‘“/])([a-z])/g, (_, boundary, letter) => boundary + letter.toUpperCase())
}

/** Re-cases a title only if it was written in capitals. */
export function toDisplayTitle(title: string): string {
	const letters = title.replace(/[^A-Za-z]/g, '')
	if (letters.length === 0) return title

	const capitals = letters.replace(/[^A-Z]/g, '').length
	// Mixed case means someone wrote it that way; leave it alone.
	if (capitals / letters.length < 0.7) return title

	const words = title.split(/(\s+)/)
	const lastIndex = words.length - 1

	return words
		.map((word, index) => (/^\s+$/.test(word) ? word : caseWord(word, index === 0 || index === lastIndex)))
		.join('')
}
