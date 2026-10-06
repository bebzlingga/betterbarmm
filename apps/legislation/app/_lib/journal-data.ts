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
