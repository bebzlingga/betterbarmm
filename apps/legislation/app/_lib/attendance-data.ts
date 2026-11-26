import { getJournals, journalDates, type Journal } from './journal-data'
import { getMembersDataset } from './members-data'

/* ============================================================
   Attendance, by Member, from the journals

   Every journal's roll call names each Member: present in the hall or
   virtually, appeared after the roll call, absent, or on leave or
   official business. A Member who came in after the roll call is counted
   present, so the count here can run above the quorum the journal
   declared. A Member the roll call does not name held no seat that day.
   Where a journal names someone twice, the kinder list wins: present over
   late, leave over absent.
   ============================================================ */

export type Mark = 'present' | 'absent' | 'excused' | null

export type AttendanceSitting = { key: string; number: number; date: string; label: string; stated?: number; url: string }

export type AttendanceMember = {
	slug: string
	name: string
	photoUrl?: string
	representation?: string
	/** Office held beside the seat, e.g. "Deputy Speaker". */
	role?: string
	marks: Mark[]
	present: number
	absent: number
	excused: number
	/** Present over the sittings they held a seat for, 0–100. */
	rate: number
}

export type Attendance = { parliament: Journal['parliament']; sittings: AttendanceSitting[]; members: AttendanceMember[]; unmatched: string[] }

const SUFFIX = new Set(['jr', 'sr', 'ii', 'iii', 'iv'])
const words = (s: string) =>
	s
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/\(.*?\)/g, ' ')
		.toLowerCase()
		.split(/[^a-z]+/)
		.filter((w) => w && !SUFFIX.has(w))
const TITLES = new Set(['mp', 'hon', 'datu', 'ustadz'])
/** Two spellings one or two letters apart (one for short names), by edit distance. */
function near(a: string, b: string) {
	if (!a || !b || Math.abs(a.length - b.length) > 2) return false
	// Two letters swapped, "Sheik" for Shiek, counts as one slip.
	const swap = [...a].findIndex((ch, i) => ch !== b[i])
	if (a.length === b.length && swap >= 0 && a[swap] === b[swap + 1] && a[swap + 1] === b[swap] && a.slice(swap + 2) === b.slice(swap + 2)) return true
	let row = Array.from({ length: b.length + 1 }, (_, j) => j)
	for (let i = 1; i <= a.length; i++) {
		const next = [i]
		for (let j = 1; j <= b.length; j++) next[j] = Math.min(row[j]! + 1, next[j - 1]! + 1, row[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1))
		row = next
	}
	return row[b.length]! <= (Math.min(a.length, b.length) >= 6 ? 2 : 1)
}
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

/** "March 2019 - June 2019; March 2025 - Present" → ISO day spans. */
function seats(term: string): [string, string][] {
	const day = (part: string, end: boolean) => {
		if (/present/i.test(part)) return '9999-12-31'
		const [month, year] = part.trim().split(/\s+/)
		const m = MONTHS.indexOf(month!.toLowerCase()) + 1
		return m ? `${year}-${String(m).padStart(2, '0')}-${end ? '31' : '01'}` : ''
	}
	return term
		.split(';')
		.map((span) => span.split(/\s+-\s+/))
		.filter((span) => span.length === 2)
		.map(([a, b]) => [day(a!, false), day(b!, true)] as [string, string])
}

export function getAttendance(parliament: Journal['parliament'] = 'BTA1'): Attendance {
	const journals = getJournals()
		.filter((j) => j.parliament === parliament && j.attendance)
		.sort((a, b) => a.dates[0]!.localeCompare(b.dates[0]!))
	const roster = getMembersDataset()
		.members.filter((m) => m.phases.includes(parliament))
		.map((m) => {
			const [surname = '', given = ''] = m.rosterName.split(',')
			return { m, surname: words(surname), first: words(given).find((w) => !TITLES.has(w)), spans: seats(m.termOfOffice) }
		})

	// "MP Narciso C. Ekey" → "YU EKEY, NARCISO CO": the last word of the surname, then the first name, then who held a seat that day.
	const find = (name: string, date: string) => {
		const w = words(name).filter((x) => !TITLES.has(x))
		let found = roster.filter((r) => r.surname.at(-1) === w.at(-1))
		// A journal now and then prints the surname first: "Salendab Z. Said", "Lidasan Mussolini S.".
		if (!found.length) found = roster.filter((r) => r.surname.at(-1) === w[0] && w.slice(1).includes(r.first!))
		// Or misspells it: "Gyak" for Gayak, "Sheik" for Shiek. Then the first name must agree too.
		if (!found.length) found = roster.filter((r) => w.includes(r.first!) && near(r.surname.at(-1)!, w.at(-1)!))
		if (found.length > 1) found = found.filter((r) => r.first === w[0]).length ? found.filter((r) => r.first === w[0]) : found.filter((r) => near(r.first!, w[0]!))
		if (found.length > 1) found = found.filter((r) => r.spans.some(([a, b]) => a <= date && date <= b))
		return found.length === 1 ? found[0] : undefined
	}

	const unmatched = new Set<string>()
	const marks = new Map(roster.map((r) => [r.m.slug, journals.map((): Mark => null)]))
	journals.forEach((j, i) => {
		const date = j.dates[0]!
		const a = j.attendance!
		const named: [string[] | undefined, Mark][] = [[a.absent, 'absent'], [a.late, 'present'], [a.onLeave, 'excused'], [a.attended, 'present']]
		for (const [names, mark] of named)
			for (const name of names ?? []) {
				const r = find(name, date)
				if (r) marks.get(r.m.slug)![i] = mark
				else unmatched.add(name.replace(/^MP\s+/, '').replace(/\s*\(.*\)$/, '').replace(/,?\s+Jr\.$/, ''))
			}
	})

	const members = roster
		.map(({ m }): AttendanceMember => {
			const row = marks.get(m.slug)!
			const count = (k: Mark) => row.filter((x) => x === k).length
			const present = count('present')
			const seated = row.filter(Boolean).length
			return {
				slug: m.slug,
				name: m.displayName,
				photoUrl: m.photoUrl,
				representation: m.representation,
				role: m.roleTitle,
				marks: row,
				present,
				absent: count('absent'),
				excused: count('excused'),
				rate: seated ? Math.round((present / seated) * 1000) / 10 : 0,
			}
		})
		.filter((m) => m.marks.some(Boolean))
		.sort((a, b) => b.rate - a.rate || b.present - a.present || a.name.localeCompare(b.name))

	return {
		parliament,
		sittings: journals.map((j) => ({ key: j.key, number: j.number, date: j.dates[0]!, label: journalDates(j), stated: j.attendance!.present, url: `/journal/${j.key}` })),
		members,
		unmatched: [...new Set([...unmatched].map((n) => n.replace(/,$/, '')))],
	}
}
