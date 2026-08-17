import fs from 'node:fs'
import path from 'node:path'
import { getCategory, type CategorySlug } from './categories'
import { getAllRecords, registryGeneratedAt, type LegislationRecord } from './legislation-data'
import { capitaliseNameToken, parliamentLabel, type StatusTone } from './labels'
import {
	getOfficialMeasuresForAuthor,
	getOfficialMeasuresMeta,
	type OfficialMeasure,
} from './official-measures'

/* ============================================================
   The people behind the record

   The registry keeps a roster of everyone who has served in the
   Bangsamoro Transition Authority, and each measure lists the members
   credited on it. This module joins the two so a member can be read as
   what they actually put their name to.

   The join is deliberately thin: authorship is derived from the measures
   themselves, so the day more measures are scraped, every profile fills
   in without touching this file.
   ============================================================ */

export type MemberRole = 'Principal Author' | 'Co-Author' | 'Author'

export type MemberMeasure = {
	id: string
	category: CategorySlug
	categoryLabel: string
	numberLabel: string
	title: string
	status: string
	statusTone: StatusTone
	dateDisplay: string
	/** Sortable form of the same date; empty when the source records none. */
	dateIso: string
	/** Deep link that opens the measure in its category browser. */
	href: string
	role: MemberRole
}

export type Member = {
	slug: string
	/** Roster form, "SURNAME, GIVEN M." — matches how measures credit people. */
	rosterName: string
	/** Readable form, "Given M. Surname". */
	displayName: string
	/** Two letters for the photo placeholder — given name, then surname. */
	initials: string
	termOfOffice: string
	isIncumbent: boolean
	/** Every sitting served in, in registry order. */
	phases: string[]
	/**
	 * The same sittings given as the years they covered — "February 2019 –
	 * August 2022". Dated rather than numbered: "First, Second, Third" asks a
	 * reader to already know when those were.
	 */
	parliamentsServed: string[]
	/**
	 * The most recent sitting served in — the one this member is listed under.
	 * Someone who sat in all three appears under the third only, so the roster
	 * shows each person once, where they were last seen.
	 */
	parliamentKey: string
	/** Full position string, e.g. "BTA Member / Deputy Speaker". */
	position?: string
	/** Just the distinguishing part, e.g. "Deputy Speaker". */
	roleTitle?: string
	representation?: string
	gender?: string
	notes?: string
	measures: MemberMeasure[]
	principalCount: number
	coAuthorCount: number
	/**
	 * Parliament's own biosketch, as paragraphs. Most member pages carry an
	 * empty Profile tab, so this is empty for about half the roster.
	 */
	bio: string[]
	/** Portrait published on the member's official page. */
	photoUrl?: string
	officeAddress?: string
	socialMediaUrl?: string
	/** Their page on parliament.bangsamoro.gov.ph. */
	profileUrl?: string
	/**
	 * True for an author that is not a person — "Government of the Day". The
	 * profile drops the parts of a member record that make no sense for one:
	 * a term, a province, a biography.
	 */
	isInstitution?: boolean
	searchText: string
}

export type MemberFilterOption = { value: string; label: string; count: number }

/**
 * A sitting of the Bangsamoro Transition Authority.
 *
 * The registry tags members with "BTA1"/"BTA2"/"BTA3", which means nothing to
 * a reader, so each is presented by the years it actually covered. The ranges
 * below are the span of the terms recorded in the roster, not a guess.
 */
export type Parliament = {
	key: string
	/** What the reader sees — "September 2022 – February 2025". */
	label: string
	description: string
	count: number
}

// The terms themselves live with the other label helpers, so a sitting reads
// the same on a member's profile as it does on the record of an act.
const PARLIAMENTS: Array<Omit<Parliament, 'count'>> = [
	{ key: 'BTA1', label: parliamentLabel('BTA1'), description: 'First transition parliament' },
	{ key: 'BTA2', label: parliamentLabel('BTA2'), description: 'Second transition parliament' },
	{ key: 'BTA3', label: parliamentLabel('BTA3'), description: 'Third transition parliament' },
]

const PARLIAMENT_ORDER = new Map(PARLIAMENTS.map((entry, index) => [entry.key, index]))

/** "BTA2" -> "September 2022 – February 2025". The registry's tag means
    nothing to a reader; the years it covered mean something to everyone. */
const PARLIAMENT_TERM = new Map(PARLIAMENTS.map((entry) => [entry.key, entry.label]))

/**
 * A member as the roster needs them.
 *
 * The roster is a client component, so whatever it is handed is serialised
 * into the page. A member now carries every measure Parliament credits them
 * on — hundreds each — and the grid only ever reads how many there are, so
 * the lists are dropped before they cross that boundary. Left in, they made
 * the roster a 23 MB page.
 */
export type RosterMember = Omit<Member, 'measures' | 'bio'> & { measureCount: number }

export type RosterDataset = Omit<MembersDataset, 'members'> & { members: RosterMember[] }

export type MembersDataset = {
	members: Member[]
	generatedAt: string
	/** Sittings with a member count, most recent first. */
	parliaments: Parliament[]
	roles: MemberFilterOption[]
	representations: MemberFilterOption[]
	stats: {
		total: number
		incumbent: number
		withMeasures: number
		/** Measures naming at least one member of the roster. */
		measuresCredited: number
		/** Every measure in the registry, credited or not. */
		measuresTotal: number
		creditedActs: number
		creditedBills: number
	}
	/** Stated plainly on the page — the linkage is only as good as the capture. */
	coverageNote: string
	knownGaps: string[]
}

/* ============================================================
   Roster file
   ============================================================ */

const DATASET_ROOT = (() => {
	const candidates = [
		path.join(process.cwd(), '../../datasets/bills'),
		path.join(process.cwd(), 'datasets/bills'),
		path.join(process.cwd(), '../datasets/bills'),
	]

	return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0]
})()

type RawMember = {
	name?: unknown
	term_of_office?: unknown
	phases_served?: unknown
	current_position?: unknown
	representation?: unknown
	gender?: unknown
	notes?: unknown
	authored_bills?: unknown
	co_authored_bills?: unknown
	resolutions?: unknown
}

function readJson<T>(filePath: string): T | null {
	try {
		return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
	} catch {
		return null
	}
}

const rosterFile = readJson<{ members?: RawMember[] }>(
	path.join(DATASET_ROOT, 'bangsamoro_registry/members/_index.json'),
)

type RawProfile = {
	name?: unknown
	url?: unknown
	photo?: unknown
	positions?: unknown
	office_address?: unknown
	social_media?: unknown
	biosketch?: unknown
}

/**
 * Who each member is, captured from their own page on the Parliament site.
 * Kept in a second file rather than merged into the roster: the roster is
 * the registry's own record, and this is a later reading of a different
 * source — if the capture is stale or missing, every profile still works,
 * just without the biography.
 */
const profileFile = readJson<{ generated?: string; profiles?: RawProfile[] }>(
	path.join(DATASET_ROOT, 'bangsamoro_registry/members/profiles.json'),
)

/**
 * Names match the roster exactly except for accents: the profile pages carry
 * "MUÑOZ, HUSSEIN P." where the roster has "MUNOZ, HUSSEIN P.".
 */
const profileKey = (value: string) =>
	value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.toUpperCase()

/* ============================================================
   Portraits

   Parliament publishes a photograph on each member's page, and the ones
   collected so far sit in this app's own `public/images/members`. The join
   is on the file name in the profile's photo URL rather than on the
   member's name: names drift between sources, and one file here is named
   for a member it doesn't show — `mp_abbas.jpeg` is Zul Qarneyn Abas, not
   Basit Abbas. The published URL is the only thing that says which face
   belongs to whom.

   Members whose page carries the BTA seal instead of a portrait get no
   photograph at all: a logo in a roster of faces reads as a face.
   ============================================================ */

const PORTRAIT_DIR = path.join(process.cwd(), 'public/images/members')

const portraits = (() => {
	try {
		return new Set(fs.readdirSync(PORTRAIT_DIR))
	} catch {
		return new Set<string>()
	}
})()

/** The local portrait for a published photo URL, where one has been collected. */
function portraitFor(photoUrl: string): string | undefined {
	const file = photoUrl.trim().split(/[?#]/)[0].split('/').pop()
	return file && portraits.has(file) ? `/images/members/${file}` : undefined
}

const profilesByName = new Map<string, RawProfile>()
for (const profile of profileFile?.profiles ?? []) {
	const name = typeof profile.name === 'string' ? profile.name : ''
	if (name) profilesByName.set(profileKey(name), profile)
}

/* ============================================================
   Names

   The roster and every measure write names the same way — "PIANG, RAMON
   A., SR." — which is precise but hard to read in bulk. Matching is done
   on that raw form; display flips it into reading order.
   ============================================================ */

const NAME_SUFFIXES = new Set(['JR', 'SR', 'II', 'III', 'IV'])

/** The same token casing the authors list uses, so one name reads alike everywhere. */
const capitaliseToken = capitaliseNameToken

/** "PIANG, RAMON A., SR." -> "Ramon A. Piang Sr." */
function toDisplayName(rosterName: string): string {
	const segments = rosterName
		.split(',')
		.map((segment) => segment.trim())
		.filter(Boolean)

	if (segments.length === 0) return rosterName
	const [surname, ...rest] = segments

	const given: string[] = []
	const suffixes: string[] = []

	for (const token of rest.join(' ').split(/\s+/).filter(Boolean)) {
		const bare = token.replace(/\./g, '').toUpperCase()
		if (NAME_SUFFIXES.has(bare)) suffixes.push(capitaliseToken(token))
		else given.push(capitaliseToken(token))
	}

	return [given.join(' '), capitaliseToken(surname), suffixes.join(' ')].filter(Boolean).join(' ')
}

/**
 * Initials for the photo placeholder, taken from the roster form rather than
 * the display name: "PIANG, RAMON A., SR." gives RP, where reading the last
 * word of "Ramon A. Piang Sr." would give the suffix instead of the surname.
 */
function toInitials(rosterName: string): string {
	const [surname = '', ...rest] = rosterName.split(',').map((part) => part.trim())
	const given = rest.join(' ').trim()

	const first = (given || surname).charAt(0).toUpperCase()
	const last = given ? surname.charAt(0).toUpperCase() : ''

	return `${first}${last}` || '·'
}

const toSlug = (rosterName: string) =>
	rosterName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')

/**
 * Names are matched on a normalised key, not verbatim: the roster and the
 * older act catalogue disagree on diacritics for the same person ("MUÑOZ,
 * HUSSEIN P." against "MUNOZ, HUSSEIN P."), which would otherwise silently
 * drop that member's credits. Accents are folded and spacing collapsed so
 * both spellings land on one entry.
 */
const matchKey = (name: string) =>
	name
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.toUpperCase()

const toStringValue = (value: unknown) =>
	typeof value === 'string' && value.trim().length > 0 ? value.trim() : ''

const toStringArray = (value: unknown) =>
	Array.isArray(value) ? value.map(toStringValue).filter(Boolean) : []

const toNumberArray = (value: unknown) =>
	Array.isArray(value) ? value.map(Number).filter(Number.isFinite) : []

/* ============================================================
   Measure index

   Built from the measures themselves rather than from the roster's own
   bill lists, so it stays correct as capture improves. The roster lists
   are folded in afterwards to catch anything the measure files miss.
   ============================================================ */

type Credit = { record: LegislationRecord; role: MemberRole }

const creditsByMember = (() => {
	const index = new Map<string, Credit[]>()

	const add = (name: string, record: LegislationRecord, role: MemberRole) => {
		const key = matchKey(name)
		if (!key) return

		const existing = index.get(key)
		if (existing) {
			// A name credited twice on one measure is listed once, principal wins.
			if (!existing.some((credit) => credit.record.id === record.id)) existing.push({ record, role })
		} else {
			index.set(key, [{ record, role }])
		}
	}

	for (const record of getAllRecords()) {
		// Resolutions credit a flat author list with no principal/co distinction.
		const principalRole: MemberRole =
			record.category === 'adopted-resolutions' ? 'Author' : 'Principal Author'

		for (const name of record.principalAuthors) add(name, record, principalRole)
		for (const name of record.coAuthors) add(name, record, 'Co-Author')
	}

	return index
})()

const recordsByKey = (() => {
	const index = new Map<string, LegislationRecord>()
	for (const record of getAllRecords()) index.set(`${record.category}-${record.number}`, record)
	return index
})()

function toMemberMeasure(record: LegislationRecord, role: MemberRole): MemberMeasure {
	const category = getCategory(record.category)

	return {
		id: record.id,
		category: record.category,
		categoryLabel: category.label,
		numberLabel: record.numberLabel,
		title: record.title,
		status: record.status,
		statusTone: record.statusTone,
		dateDisplay: record.dateDisplay,
		dateIso: record.dateIso ?? '',
		href: `${category.href}?focus=${record.number}`,
		role,
	}
}

/** Acts and bills only — the counts a roster card carries. */
function countAuthorship(measures: MemberMeasure[], role: 'principal' | 'co'): number {
	return measures.filter(
		(measure) =>
			(measure.category === 'acts' || measure.category === 'bills') &&
			(role === 'co' ? measure.role === 'Co-Author' : measure.role !== 'Co-Author'),
	).length
}

/**
 * Newest first, by the date the source records — a profile reads as what
 * someone has been working on lately. An undated measure sorts to the end
 * rather than to the top, and measures sharing a date fall back to their
 * number, so the order is stable between builds.
 */
const byDate = (left: MemberMeasure, right: MemberMeasure) => {
	if (left.dateIso !== right.dateIso) {
		if (!left.dateIso) return 1
		if (!right.dateIso) return -1
		return right.dateIso.localeCompare(left.dateIso)
	}

	return right.id.localeCompare(left.id, undefined, { numeric: true })
}

/**
 * A measure Parliament credits to this member that the registry has not
 * captured. It carries the number, title, status, and date the official
 * index publishes, and links out to the page that says so — everything a
 * captured record has except the reading of the measure itself.
 */
function toOfficialMeasure(measure: OfficialMeasure, role: MemberRole): MemberMeasure {
	return {
		id: `official-${measure.category}-${measure.number}`,
		category: measure.category,
		categoryLabel: getCategory(measure.category).label,
		numberLabel: measure.numberLabel,
		title: measure.title,
		status: measure.status,
		statusTone: measure.statusTone,
		dateDisplay: measure.dateDisplay,
		dateIso: measure.dateIso,
		href: measure.url,
		role,
	}
}

function measuresFor(member: RawMember, rosterName: string): MemberMeasure[] {
	const collected = new Map<string, MemberMeasure>()

	for (const credit of creditsByMember.get(matchKey(rosterName)) ?? []) {
		collected.set(credit.record.id, toMemberMeasure(credit.record, credit.role))
	}

	// Roster-side lists are a fallback for measures whose own file omits authors.
	const fromRoster: Array<[number[], CategorySlug, MemberRole]> = [
		[toNumberArray(member.authored_bills), 'bills', 'Principal Author'],
		[toNumberArray(member.co_authored_bills), 'bills', 'Co-Author'],
		[toNumberArray(member.resolutions), 'adopted-resolutions', 'Author'],
	]

	for (const [numbers, category, role] of fromRoster) {
		for (const number of numbers) {
			const record = recordsByKey.get(`${category}-${number}`)
			if (record && !collected.has(record.id)) {
				collected.set(record.id, toMemberMeasure(record, role))
			}
		}
	}

	// Parliament's own indexes name an author on every bill and resolution,
	// including the ones this registry has not read. A captured record always
	// wins — it says more — but where there is none, the official entry stands
	// in, so a profile shows what someone filed rather than what happens to
	// have been indexed here.
	for (const { measure, role } of getOfficialMeasuresForAuthor(rosterName)) {
		const captured = recordsByKey.get(`${measure.category}-${measure.number}`)
		if (captured) {
			if (!collected.has(captured.id)) collected.set(captured.id, toMemberMeasure(captured, role))
			continue
		}

		const official = toOfficialMeasure(measure, role)
		if (!collected.has(official.id)) collected.set(official.id, official)
	}

	return Array.from(collected.values()).sort(byDate)
}

/* ============================================================
   Roster assembly — parsed once per process, reused by every route.
   ============================================================ */

const allMembers: Member[] = (rosterFile?.members ?? [])
	.map((raw) => {
		const rosterName = toStringValue(raw.name)
		if (!rosterName) return null

		const position = toStringValue(raw.current_position) || undefined
		// "BTA Member / Deputy Speaker" -> "Deputy Speaker"; a plain member has none.
		const roleTitle =
			position
				?.split('/')
				.map((part) => part.trim())
				.filter((part) => part && part.toLowerCase() !== 'bta member')
				.join(' / ') || undefined

		const termOfOffice = toStringValue(raw.term_of_office) || 'Term not recorded'
		const phases = toStringArray(raw.phases_served)

		// The latest sitting served in decides where this member is listed.
		const parliamentKey = phases.reduce((latest, phase) => {
			const rank = PARLIAMENT_ORDER.get(phase)
			if (rank === undefined) return latest
			const currentRank = PARLIAMENT_ORDER.get(latest)
			return currentRank === undefined || rank > currentRank ? phase : latest
		}, phases[0] ?? '')
		const representation = toStringValue(raw.representation) || undefined
		const displayName = toDisplayName(rosterName)
		const measures = measuresFor(raw, rosterName)
		const profile = profilesByName.get(profileKey(rosterName))

		const member: Member = {
			slug: toSlug(rosterName),
			rosterName,
			displayName,
			initials: toInitials(rosterName),
			termOfOffice,
			isIncumbent: /present/i.test(termOfOffice),
			phases,
			// Most recent sitting first — where someone sits now matters more
			// than where they started.
			parliamentsServed: [...phases]
				.filter((phase) => PARLIAMENT_ORDER.has(phase))
				.sort(
					(left, right) => (PARLIAMENT_ORDER.get(right) ?? 0) - (PARLIAMENT_ORDER.get(left) ?? 0),
				)
				.map((phase) => PARLIAMENT_TERM.get(phase))
				.filter((term): term is string => Boolean(term)),
			parliamentKey,
			position,
			roleTitle,
			representation,
			gender: toStringValue(raw.gender) || undefined,
			notes: toStringValue(raw.notes) || undefined,
			measures,
			// Legislation only. Resolutions are signed by nearly everyone —
			// hundreds each — so counting them here would drown the number that
			// says something: what this member put their name to as law.
			principalCount: countAuthorship(measures, 'principal'),
			coAuthorCount: countAuthorship(measures, 'co'),
			bio: toStringArray(profile?.biosketch),
			photoUrl: portraitFor(toStringValue(profile?.photo)),
			officeAddress: toStringValue(profile?.office_address) || undefined,
			socialMediaUrl: toStringValue(profile?.social_media) || undefined,
			profileUrl: toStringValue(profile?.url) || undefined,
			// The biography is searchable too: it is often the only place a
			// member's province, party, or former office is written down.
			searchText: [
				displayName,
				rosterName,
				roleTitle,
				representation,
				termOfOffice,
				...phases,
				...toStringArray(profile?.biosketch),
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase(),
		}

		return member
	})
	.filter((member): member is Member => member !== null)
	.sort((left, right) => left.rosterName.localeCompare(right.rosterName))

/* ============================================================
   Authors who are not people

   Parliament credits some measures to "Government of the Day" rather than
   to any member — the government's own legislative agenda, filed as a
   body. Those measures had nowhere to go: they name an author the roster
   has never heard of, so they counted as uncredited and disappeared.

   Listing the phrase as an author of its own puts them somewhere true. It
   is kept out of the member counts and given its own group in the roster,
   because it is a standing arrangement, not a person who served a term.
   ============================================================ */

/** Exactly the labels Parliament uses. A new one is a deliberate addition. */
const INSTITUTIONAL_AUTHORS = ['Government of the Day']

export const INSTITUTION_KEY = 'institution'

function toInstitutionalMember(name: string): Member {
	// Credited as the author outright, not as a principal or a co-signatory:
	// the government files a measure as a body, so the distinction that means
	// something between two members means nothing here.
	const measures = getOfficialMeasuresForAuthor(name)
		.map(({ measure }) => {
			const captured = recordsByKey.get(`${measure.category}-${measure.number}`)
			return captured ? toMemberMeasure(captured, 'Author') : toOfficialMeasure(measure, 'Author')
		})
		.sort(byDate)

	// Registry records credit the same phrase, mostly on older acts.
	for (const credit of creditsByMember.get(matchKey(name)) ?? []) {
		if (!measures.some((measure) => measure.id === credit.record.id)) {
			measures.push(toMemberMeasure(credit.record, 'Author'))
		}
	}

	return {
		slug: toSlug(name),
		rosterName: name,
		displayName: name,
		initials: 'GD',
		termOfOffice: `${measures.length} measures credited`,
		isIncumbent: false,
		phases: [],
		parliamentsServed: [],
		parliamentKey: INSTITUTION_KEY,
		position: undefined,
		roleTitle: undefined,
		representation: undefined,
		gender: undefined,
		notes:
			'Parliament credits these measures to the Government of the Day rather than to a named member. They are counted here so they can be read, but they belong to no one on the roster.',
		measures: measures.sort(byDate),
		principalCount: 0,
		coAuthorCount: 0,
		bio: [],
		isInstitution: true,
		searchText: [name, ...measures.map((measure) => measure.title)].join(' ').toLowerCase(),
	}
}

const institutionalMembers = INSTITUTIONAL_AUTHORS.map(toInstitutionalMember).filter(
	(member) => member.measures.length > 0,
)

/** Everyone the roster lists, then the authors that are not people. */
const rosterAndInstitutions = [...allMembers, ...institutionalMembers]

const membersBySlug = new Map(rosterAndInstitutions.map((member) => [member.slug, member]))

function buildOptions(
	pick: (member: Member) => string[],
	sort?: (left: MemberFilterOption, right: MemberFilterOption) => number,
): MemberFilterOption[] {
	const tally = new Map<string, MemberFilterOption>()

	for (const member of allMembers) {
		for (const value of pick(member)) {
			if (!value) continue

			const existing = tally.get(value)
			if (existing) existing.count += 1
			else tally.set(value, { value, label: value, count: 1 })
		}
	}

	return Array.from(tally.values()).sort(
		sort ?? ((left, right) => right.count - left.count || left.label.localeCompare(right.label)),
	)
}

/** Groups the many one-off position strings into filterable roles. */
function roleBucket(member: Member): string[] {
	if (!member.roleTitle) return ['Member']

	const value = member.roleTitle.toLowerCase()
	const buckets: string[] = []

	if (value.includes('chief minister')) buckets.push('Chief Minister')
	if (value.includes('speaker')) buckets.push(value.includes('deputy') ? 'Deputy Speaker' : 'Speaker')
	if (value.includes('floor leader'))
		buckets.push(value.includes('deputy') ? 'Deputy Floor Leader' : 'Floor Leader')
	if (value.includes('minister') && !value.includes('chief minister')) buckets.push('Cabinet Minister')

	return buckets.length > 0 ? buckets : ['Member']
}

/**
 * The roster, without the measure lists — see `RosterMember`. Everything else
 * the grid filters on stays.
 */
export function getRosterDataset(): RosterDataset {
	const dataset = getMembersDataset()

	return {
		...dataset,
		members: dataset.members.map(({ measures, bio: _bio, ...member }) => ({
			...member,
			measureCount: measures.length,
		})),
	}
}

export function getMembersDataset(): MembersDataset {
	const creditedIds = new Set(
		allMembers.flatMap((member) => member.measures.map((measure) => measure.id)),
	)
	const credited = allMembers.flatMap((member) => member.measures)
	const creditedActs = new Set(
		credited.filter((measure) => measure.category === 'acts').map((measure) => measure.id),
	).size
	const creditedBills = new Set(
		credited.filter((measure) => measure.category === 'bills').map((measure) => measure.id),
	).size
	const measuresTotal = getAllRecords().length

	const official = getOfficialMeasuresMeta()

	return {
		members: rosterAndInstitutions,
		generatedAt: registryGeneratedAt,
		// Most recent sitting first — the current parliament is what people
		// come looking for. The institutional authors close the list, under a
		// heading of their own so they are never read as members.
		parliaments: [
			...[...PARLIAMENTS].reverse().map((entry) => ({
				...entry,
				count: allMembers.filter((member) => member.parliamentKey === entry.key).length,
			})),
			{
				key: INSTITUTION_KEY,
				label: 'Government of the Day',
				description: 'Measures Parliament credits to the government rather than to a member',
				count: institutionalMembers.length,
			},
		].filter((entry) => entry.count > 0),
		roles: buildOptions(roleBucket),
		representations: buildOptions((member) =>
			member.representation ? [member.representation] : [],
		),
		stats: {
			total: allMembers.length,
			incumbent: allMembers.filter((member) => member.isIncumbent).length,
			withMeasures: allMembers.filter((member) => member.measures.length > 0).length,
			measuresCredited: creditedIds.size,
			measuresTotal,
			creditedActs,
			creditedBills,
		},
		coverageNote: `The roster is complete, and so is the link between a member and the bills they filed: Parliament's own bills index names an author on all ${official.byCategory.bills ?? 0} of them, and this reads it. Acts and resolutions are the partial part — ${creditedIds.size} of ${measuresTotal} captured measures name their authors here.`,
		knownGaps: [
			`Bill authorship comes from Parliament's bills index, which names an author on all ${official.byCategory.bills ?? 0} bills it lists. Only ${creditedBills} of those bills have a captured record here, so the rest appear on a profile with a status and a link to the official page, and nothing else.`,
			`Authorship inside the registry's own records covers ${creditedIds.size} of ${measuresTotal} captured measures — ${creditedActs} autonomy acts and ${creditedBills} bills. Author credits for acts come from the hand-compiled catalogue of BAA 1–89; acts outside that range carry no author list.`,
			'Measures Parliament credits to the “Government of the Day” are listed under that name rather than dropped, since they belong to no member. A measure credited to a committee still appears on no profile.',
			`Parliament publishes a biography for ${allMembers.filter((member) => member.bio.length > 0).length} of the ${allMembers.length} members; the rest have an empty profile tab on their own official page. Nothing here is written about a member that they did not publish about themselves.`,
			'Attendance and voting records come from the session journals, which have not been captured. Committee seats now come from the committee pages, and reflect current membership only.',
		],
	}
}

export function getMember(slug: string): Member | undefined {
	return membersBySlug.get(slug)
}

export function getMemberSlugs(): string[] {
	// Institutional authors get a page too — measures credited to them have
	// to lead somewhere.
	return rosterAndInstitutions.map((member) => member.slug)
}

/** Members credited on a measure — lets a record link back to people. */
export function getMembersForRecord(recordId: string): Array<{ member: Member; role: MemberRole }> {
	return allMembers
		.flatMap((member) => {
			const measure = member.measures.find((entry) => entry.id === recordId)
			return measure ? [{ member, role: measure.role }] : []
		})
		.sort((left, right) => left.member.rosterName.localeCompare(right.member.rosterName))
}
