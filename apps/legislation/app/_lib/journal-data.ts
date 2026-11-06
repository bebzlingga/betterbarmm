import fs from 'node:fs'
import path from 'node:path'

/* ============================================================
   The session journals

   Every plenary journal Parliament has published, read from the PDFs'
   own text layer: what each sitting did, the measures it acted on, the
   substance of the debate, and the votes recorded by name. Built by
   reading, not parsing — see datasets/bills/bangsamoro_registry/journal/
   sessions.json for the method and its limits.

   BTA1 and BTA2 numbered their bills separately, so Bill 59 of 2021 and
   Bill 59 of 2024 are different measures. A BTA1 bill is linked only
   through the act it became; a BTA2 bill links to its own page.
   ============================================================ */

export type JournalMeasure = {
	category: 'bills' | 'acts' | 'adopted-resolutions' | 'proposed-resolutions' | null
	number: number | null
	proposed?: number | null
	adopted?: number | null
	becameAct?: number | null
	titleAsRead?: string
}

export type JournalItem = { kind: string; measure: JournalMeasure | null; text: string }
export type JournalPoint = { measure: JournalMeasure | null; point: string }
export type JournalRollCall = { measure: JournalMeasure | null; yes: number; no: number; abstain: number; note?: string }

export type Journal = {
	key: string
	parliament: 'BTA1' | 'BTA2'
	number: number
	title: string
	dates: string[]
	dateNote?: string
	kind: string
	session: string
	presiding?: string
	attendance?: { present?: number; absent?: string[]; onLeave?: string[]; note?: string }
	summary: string
	items: JournalItem[]
	points: JournalPoint[]
	rollCalls: JournalRollCall[]
	url: string
	pdf_url: string
}

const FILE = (() => {
	const candidates = [
		path.join(process.cwd(), '../../datasets/bills/bangsamoro_registry/journal/sessions.json'),
		path.join(process.cwd(), 'datasets/bills/bangsamoro_registry/journal/sessions.json'),
	]
	return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0]
})()

const journals: Journal[] = (() => {
	try {
		const file = JSON.parse(fs.readFileSync(FILE, 'utf8')) as { journals: Journal[] }
		// Newest first, as every other list on the site reads.
		return [...file.journals].sort((a, b) => b.dates[0].localeCompare(a.dates[0]))
	} catch {
		return []
	}
})()

export const getJournals = () => journals
export const getJournal = (key: string) => journals.find((journal) => journal.key === key)

export const PARLIAMENT_LABEL = {
	BTA1: 'First Bangsamoro Transition Authority (2019–2022)',
	BTA2: 'Second Bangsamoro Transition Authority (2022–2025)',
} as const

const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
export function journalDates(journal: Journal): string {
	const days = journal.dates.map((iso) => new Date(`${iso}T00:00:00Z`))
	const first = days[0]
	const last = days[days.length - 1]
	if (days.length === 1) return DATE.format(first)
	const sameMonth = first.getUTCMonth() === last.getUTCMonth() && first.getUTCFullYear() === last.getUTCFullYear()
	// "7–8 March 2023", not "7 March 2023 – 8 March 2023".
	if (sameMonth) return `${first.getUTCDate()}–${DATE.format(last)}`
	return `${DATE.format(first).replace(/ \d{4}$/, '')} – ${DATE.format(last)}`
}

/** The page for a measure the journal names, where the site has one. */
export function measureHref(measure: JournalMeasure | null, parliament: Journal['parliament']): string | undefined {
	if (!measure) return undefined
	if (measure.category === 'acts' && measure.number) return `/acts/${measure.number}`
	if (measure.adopted) return `/resolutions/adopted/${measure.adopted}`
	if (measure.becameAct) return `/acts/${measure.becameAct}`
	if (measure.category === 'bills' && measure.number && parliament === 'BTA2') return `/bills/${measure.number}`
	// The proposed-resolutions index starts with BTA2; a BTA1 proposal has no page.
	if (measure.category === 'proposed-resolutions' && measure.proposed && parliament === 'BTA2')
		return `/resolutions/proposed/${measure.proposed}`
	return undefined
}

/** How a measure is named in a list: "Bill 29", "Proposed Resolution 86 → Resolution 304". */
export function measureLabel(measure: JournalMeasure | null): string {
	if (!measure) return 'Other business'
	const parts: string[] = []
	if (measure.category === 'bills' && measure.number) parts.push(`Bill ${measure.number}`)
	if (measure.category === 'acts' && measure.number) parts.push(`BAA ${measure.number}`)
	if (measure.proposed) parts.push(`Proposed Resolution ${measure.proposed}`)
	if (measure.adopted) parts.push(`${parts.length ? '→ ' : ''}Resolution ${measure.adopted}`)
	if (measure.becameAct && measure.category === 'bills') parts.push(`→ BAA ${measure.becameAct}`)
	return parts.join(' ') || 'Other business'
}

/* ============================================================
   A measure's floor record

   Every sitting that touched a measure, from the journals: what the plenary
   did with it, the points raised on it, and the tally where one was stated.
   Keyed by the measure's page on this site (measureHref), so a bill that
   became an act is read on the act's page too.
   ============================================================ */

export type FloorEntry = {
	journalKey: string
	journalTitle: string
	date: string
	dates: string
	kind: 'action' | 'point' | 'tally'
	text: string
	tally?: { yes: number; no: number; abstain: number }
}

export type NamedVote = {
	date: string
	stage: string
	result: string
	tally: { favor: number; against: number; abstained: number }
	inFavor: string[]
	against: string[]
	abstained: string[]
	journalTitle: string
	journalUrl: string
}

const floorIndex = (() => {
	const index = new Map<string, FloorEntry[]>()
	const add = (href: string | undefined, entry: FloorEntry) => {
		if (!href) return
		const list = index.get(href) ?? []
		if (!list.some((e) => e.journalKey === entry.journalKey && e.text === entry.text)) list.push(entry)
		index.set(href, list)
	}
	for (const journal of journals) {
		const base = { journalKey: journal.key, journalTitle: `Journal No. ${journal.number}`, date: journal.dates[0] ?? '', dates: journalDates(journal) }
		for (const item of journal.items) add(measureHref(item.measure, journal.parliament), { ...base, kind: 'action', text: item.text })
		for (const point of journal.points) add(measureHref(point.measure, journal.parliament), { ...base, kind: 'point', text: point.point })
		for (const call of journal.rollCalls)
			add(measureHref(call.measure, journal.parliament), {
				...base,
				kind: 'tally',
				text: call.note ?? 'Nominal voting (roll call).',
				tally: { yes: call.yes, no: call.no, abstain: call.abstain },
			})
	}
	for (const list of index.values()) list.sort((a, b) => a.date.localeCompare(b.date))
	return index
})()

/** Everything the published journals record about the measure at this page. */
export const floorRecordFor = (href: string | undefined): FloorEntry[] => (href ? floorIndex.get(href) ?? [] : [])

const namedVotes = (() => {
	const file = FILE.replace(/sessions\.json$/, 'votes.json')
	try {
		type Raw = { measure: { became_act?: number | null }; vote: { date: string; stage: string; result: string; tally_as_stated: NamedVote['tally']; in_favor?: string[]; against?: string[]; abstained?: string[] }; journal?: { journal_title?: string; journal_url?: string } }
		const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as { votes: Raw[] }
		const index = new Map<number, NamedVote[]>()
		for (const v of raw.votes) {
			if (!v.measure.became_act) continue
			index.set(v.measure.became_act, [
				...(index.get(v.measure.became_act) ?? []),
				{
					date: v.vote.date,
					stage: v.vote.stage,
					result: v.vote.result,
					tally: v.vote.tally_as_stated,
					inFavor: v.vote.in_favor ?? [],
					against: v.vote.against ?? [],
					abstained: v.vote.abstained ?? [],
					journalTitle: v.journal?.journal_title ?? '',
					journalUrl: v.journal?.journal_url ?? '',
				},
			])
		}
		return index
	} catch {
		return new Map<number, NamedVote[]>()
	}
})()

/** The roll calls recorded by name on the bill that became this act. */
export const namedVotesForAct = (act: number): NamedVote[] => namedVotes.get(act) ?? []

/* ============================================================
   Committee reports, by measure

   datasets/bills/committee-reports.json: each report Parliament published,
   read for the measure it covers, what the committee recommended, and what
   it found or changed. Fills the years the journals don't reach.
   ============================================================ */

export type CommitteeReport = {
	number: number
	url: string
	pdfUrl?: string
	date?: string
	committees: string[]
	recommendation?: string
	substituteBill?: number
	points: string[]
}

const committeeReports = (() => {
	const file = FILE.replace(/bangsamoro_registry\/journal\/sessions\.json$/, 'committee-reports.json')
	const index = new Map<string, CommitteeReport[]>()
	try {
		type Raw = { number: number; url: string; pdf_url?: string | null; date_submitted?: string | null; committees?: string[]; measures?: { category: string; number: number }[]; recommendation?: string | null; substitute_bill?: number | null; points?: string[] }
		const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as { reports: Raw[] }
		for (const r of raw.reports) {
			const report: CommitteeReport = {
				number: r.number,
				url: r.url,
				pdfUrl: r.pdf_url ?? undefined,
				date: r.date_submitted ?? undefined,
				committees: r.committees ?? [],
				recommendation: r.recommendation ?? undefined,
				substituteBill: r.substitute_bill ?? undefined,
				points: r.points ?? [],
			}
			for (const m of r.measures ?? []) {
				const key = `${m.category}-${m.number}`
				index.set(key, [...(index.get(key) ?? []), report])
			}
		}
	} catch {
		// No reports read yet: the section simply doesn't appear.
	}
	return index
})()

/** The committee reports filed on a measure, oldest first. */
export const committeeReportsFor = (category: string, number: number): CommitteeReport[] =>
	[...(committeeReports.get(`${category}-${number}`) ?? [])].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
