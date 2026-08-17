import fs from 'node:fs'
import path from 'node:path'
import { formatDate } from './labels'
import { getMembersDataset, type Member } from './members-data'

/* ============================================================
   The committees

   Parliament refers every bill to a committee after first reading, and the
   committee is where the hearings, the amendments, and most of the dying
   happen. This module reads the captured committee pages and the reports
   table, and joins both to the member roster so a name on a committee is
   the same person as the name on a bill.
   ============================================================ */

export type CommitteeRole = 'Chairperson' | 'Vice-Chairperson' | 'Member' | 'Ex-officio'

export type CommitteeSeat = {
	rosterName: string
	/** Readable form, when the roster knows this person. */
	displayName: string
	/** Links to the member profile; absent when the roster has no match. */
	slug?: string
	initials: string
	role: CommitteeRole
}

export type CommitteeReferral = {
	title: string
	url: string
}

export type CommitteeReport = {
	number: number
	title: string
	url: string
	dateDisplay: string
	/** Sortable form, empty when the source date could not be read. */
	dateIso: string
}

export type Committee = {
	slug: string
	name: string
	/** "Committee on Health" -> "Health", for anywhere the prefix is redundant. */
	shortName: string
	url: string
	/** The committee's own statement of what it covers. */
	jurisdiction: string
	chairperson?: CommitteeSeat
	viceChairpersons: CommitteeSeat[]
	/** Everyone seated, officers first, then members, then ex-officio. */
	seats: CommitteeSeat[]
	memberCount: number
	referredBills: CommitteeReferral[]
	referredResolutions: CommitteeReferral[]
	reports: CommitteeReport[]
	subcommittees: string
	searchText: string
}

export type CommitteesDataset = {
	committees: Committee[]
	generatedAt: string
	source: string
	reportsSource: string
	stats: {
		total: number
		seated: number
		/** Roster members holding at least one committee seat. */
		membersSeated: number
		referrals: number
		reports: number
	}
	knownGaps: string[]
}

type RawSeatSource = {
	slug?: unknown
	name?: unknown
	url?: unknown
	chairperson?: unknown
	vice_chairpersons?: unknown
	jurisdiction?: unknown
	members?: unknown
	ex_officio_members?: unknown
	referred_bills?: unknown
	referred_resolutions?: unknown
	subcommittees?: unknown
}

type RawReport = {
	number?: unknown
	title?: unknown
	url?: unknown
	date_submitted?: unknown
	committee_slugs?: unknown
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

const file = readJson<{
	source?: string
	reports_source?: string
	generated?: string
	committees?: RawSeatSource[]
	reports?: RawReport[]
}>(path.join(DATASET_ROOT, 'bangsamoro_registry/committees/_index.json'))

const toStringValue = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const toStringArray = (value: unknown) =>
	Array.isArray(value) ? value.map(toStringValue).filter(Boolean) : []

const toReferrals = (value: unknown): CommitteeReferral[] =>
	Array.isArray(value)
		? value
				.map((entry) => ({
					title: toStringValue((entry as { name?: unknown })?.name),
					url: toStringValue((entry as { url?: unknown })?.url),
				}))
				.filter((entry) => entry.title.length > 0)
		: []

/**
 * The reports table tags each row with a taxonomy term that Parliament
 * maintains separately from the committee pages, and the two have drifted:
 * some terms are older names, some are misspelled, and the energy committee's
 * term is entered as two terms. Each mapping below was read off the source —
 * nothing is inferred, so a term that stops matching goes unmapped and its
 * reports simply don't attach, rather than attaching to the wrong committee.
 */
const REPORT_TERM_ALIASES: Record<string, string> = {
	'committee-on-rules': 'committee-on-rules1',
	'committee-on-bangsamoro-justice-system': 'bangsamoro-justice-system',
	'committee-on-environment-natural-resources': 'committee-on-environmental-natural-resources-and-energy',
	'and-energy': 'committee-on-environmental-natural-resources-and-energy',
	'committee-on-amendments-revisions-and-codification-of-laws': 'committee-on-amendments',
	'committee-on-indigenous-peoples-affair': 'committee-on-indigenous-peoples-and-affairs',
	'committee-on-social-services-and-development': 'committee-on-social-services',
	'committee-on-human-settlements-and-development': 'committee-on-human-settlements-and-developments',
	'committee-on-public-works': 'committee-on-public-works-and-highways',
}

/** "06/25/2026" -> "2026-06-25". The table is the only place this form appears. */
function toIsoDate(value: string): string {
	const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
	if (!match) return ''

	const [, month, day, year] = match
	return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

/**
 * Roster names should match exactly, and mostly do. This absorbs the ways
 * they don't: stray spacing, case, and accents typed on one page but not the
 * other — the committee pages carry "MUÑOZ, HUSSEIN P." where the roster has
 * "MUNOZ, HUSSEIN P." for the same member.
 */
const nameKey = (value: string) =>
	value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.toUpperCase()

const rosterByName = new Map<string, Member>()
for (const member of getMembersDataset().members) {
	rosterByName.set(nameKey(member.rosterName), member)
}

function toSeat(rosterName: string, role: CommitteeRole): CommitteeSeat {
	const member = rosterByName.get(nameKey(rosterName))

	return {
		rosterName,
		displayName: member?.displayName ?? rosterName,
		slug: member?.slug,
		initials: member?.initials ?? rosterName.charAt(0).toUpperCase(),
		role,
	}
}

const reportsByCommittee = new Map<string, CommitteeReport[]>()

for (const raw of file?.reports ?? []) {
	const number = typeof raw.number === 'number' ? raw.number : Number(toStringValue(raw.number))
	if (!Number.isFinite(number)) continue

	const submitted = toStringValue(raw.date_submitted)
	const dateIso = toIsoDate(submitted)

	const report: CommitteeReport = {
		number,
		title: toStringValue(raw.title) || `Committee Report No. ${number}`,
		url: toStringValue(raw.url),
		dateDisplay: dateIso ? formatDate(dateIso) : submitted || 'Date not recorded',
		dateIso,
	}

	// A report can be reported out by more than one committee, so it lists
	// under each of them rather than only the first.
	for (const term of toStringArray(raw.committee_slugs)) {
		const slug = REPORT_TERM_ALIASES[term] ?? term
		const existing = reportsByCommittee.get(slug)
		if (existing) {
			if (!existing.some((entry) => entry.number === number)) existing.push(report)
		} else {
			reportsByCommittee.set(slug, [report])
		}
	}
}

const committees: Committee[] = (file?.committees ?? [])
	.map((raw): Committee | null => {
		const slug = toStringValue(raw.slug)
		const name = toStringValue(raw.name)
		if (!slug || !name) return null

		const chairName = toStringValue(raw.chairperson)
		const chairperson = chairName ? toSeat(chairName, 'Chairperson') : undefined
		const viceChairpersons = toStringArray(raw.vice_chairpersons).map((person) =>
			toSeat(person, 'Vice-Chairperson'),
		)

		// The officers are listed again in the member roll; keep the seat that
		// says the most about them and drop the plain duplicate.
		const officerNames = new Set(
			[chairperson, ...viceChairpersons].filter(Boolean).map((seat) => nameKey(seat!.rosterName)),
		)

		const members = toStringArray(raw.members)
			.filter((person) => !officerNames.has(nameKey(person)))
			.map((person) => toSeat(person, 'Member'))

		const seated = new Set([...officerNames, ...members.map((seat) => nameKey(seat.rosterName))])

		const exOfficio = toStringArray(raw.ex_officio_members)
			.filter((person) => !seated.has(nameKey(person)))
			.map((person) => toSeat(person, 'Ex-officio'))

		const seats = [
			...(chairperson ? [chairperson] : []),
			...viceChairpersons,
			...members,
			...exOfficio,
		]

		const referredBills = toReferrals(raw.referred_bills)
		const referredResolutions = toReferrals(raw.referred_resolutions)
		const reports = (reportsByCommittee.get(slug) ?? []).sort((left, right) =>
			right.number - left.number,
		)

		return {
			slug,
			name,
			shortName: name.replace(/^(Special )?Committee on (the )?/i, '').trim() || name,
			url: toStringValue(raw.url),
			jurisdiction: toStringValue(raw.jurisdiction),
			chairperson,
			viceChairpersons,
			seats,
			memberCount: seats.length,
			referredBills,
			referredResolutions,
			reports,
			subcommittees: toStringValue(raw.subcommittees),
			searchText: [name, toStringValue(raw.jurisdiction), ...seats.map((seat) => seat.displayName)]
				.join(' ')
				.toLowerCase(),
		}
	})
	.filter((committee): committee is Committee => committee !== null)

export function getCommitteesDataset(): CommitteesDataset {
	const seatedMembers = new Set<string>()
	for (const committee of committees) {
		for (const seat of committee.seats) {
			if (seat.slug) seatedMembers.add(seat.slug)
		}
	}

	const referrals = committees.reduce(
		(total, committee) => total + committee.referredBills.length + committee.referredResolutions.length,
		0,
	)

	const reports = new Set(
		committees.flatMap((committee) => committee.reports.map((report) => report.number)),
	)

	return {
		committees,
		generatedAt: toStringValue(file?.generated) || 'not recorded',
		source: toStringValue(file?.source) || 'https://parliament.bangsamoro.gov.ph/committees/',
		reportsSource:
			toStringValue(file?.reports_source) ||
			'https://parliament.bangsamoro.gov.ph/committee-reports/',
		stats: {
			total: committees.length,
			seated: committees.reduce((total, committee) => total + committee.memberCount, 0),
			membersSeated: seatedMembers.size,
			referrals,
			reports: reports.size,
		},
		knownGaps: [
			'Committee pages list the current membership only. A member who sat on a committee in an earlier parliament and has since moved off it leaves no trace here.',
			'Reports are captured as they appear in Parliament’s reports table — number, title, date, and the committee that filed them. The text of each report has not been read.',
			'Parliament tags reports with a committee taxonomy that has drifted from the committee pages: a few terms are older names or misspellings. Terms that could not be matched to a committee leave their reports unattached rather than guess.',
			'Referred bills and resolutions come from each committee’s own page, which lists titles rather than measure numbers, so not every referral can be linked to its entry in this registry.',
			'Hearing schedules and attendance live in the session journals, which have not been captured.',
		],
	}
}

export function getCommittee(slug: string): Committee | undefined {
	return committees.find((committee) => committee.slug === slug)
}

export function getCommitteeSlugs(): string[] {
	return committees.map((committee) => committee.slug)
}

/** Seniority of a seat, for ordering one member's committees. */
const ROLE_RANK: Record<CommitteeRole, number> = {
	Chairperson: 0,
	'Vice-Chairperson': 1,
	Member: 2,
	'Ex-officio': 3,
}

/**
 * Every seat one member holds, for their profile — the committees they chair
 * first, then the ones they deputise on, then plain membership, then the
 * seats that come with another office. What someone leads says more than
 * what they merely sit on.
 */
export function getCommitteesForMember(
	rosterName: string,
): Array<{ committee: Committee; role: CommitteeRole }> {
	const key = nameKey(rosterName)

	return committees
		.map((committee) => {
			const seat = committee.seats.find((entry) => nameKey(entry.rosterName) === key)
			return seat ? { committee, role: seat.role } : null
		})
		.filter((entry): entry is { committee: Committee; role: CommitteeRole } => entry !== null)
		.sort(
			(left, right) =>
				ROLE_RANK[left.role] - ROLE_RANK[right.role] ||
				left.committee.name.localeCompare(right.committee.name),
		)
}
