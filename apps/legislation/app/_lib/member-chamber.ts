import { getJournals, type Journal } from './journal-data'
import type { Member } from './members-data'

/* ============================================================
   A member's record in the chamber

   From the published plenary journals: the sittings a member was
   listed absent or on leave for, and the points of debate the journal
   records them making. Journals name people as "MP Given M. Surname";
   the roster as "SURNAME, GIVEN M." — they are matched on surname plus
   first given name, which is unambiguous in this roster.

   The journals stop at No. 22 of the second Transition Authority
   (March 2023), so the record covers only the sittings published.
   ============================================================ */

const fold = (s: string) =>
	s
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9 ]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()

// Titles the journals sometimes print and sometimes drop ("Datu Roonie Q. Sinsuat").
const HONORIFICS = new Set(['datu', 'hadji', 'haji', 'hji', 'sultan', 'dr', 'atty', 'engr'])

/** "AHAJA, NUR-MAHADIL K., JR." → surname "ahaja", first given name "nur". */
function parts(roster: string) {
	const [surname = '', given = ''] = roster.split(',').map((s) => fold(s))
	const first = given.split(' ').filter((w) => w.length > 1 && !HONORIFICS.has(w))[0] ?? ''
	return { surname, first }
}

/** Does a name written in a journal ("MP Nur-Mahadil K. Ahaja") name this member?
 *  The given name is compared on its first four letters: the journals misspell
 *  some ("Abduraof" for Abdulraof). */
function names(written: string, member: { surname: string; first: string }) {
	const w = ` ${fold(written)} `
	return w.includes(` ${member.surname} `) && (!member.first || w.includes(` ${member.first.slice(0, 4)}`))
}

export type ChamberRecord = {
	/** Sittings of the parliaments this member sat in that published an attendance list. */
	sittings: number
	absent: Journal[]
	onLeave: Journal[]
	points: { journal: Journal; text: string }[]
}

export function chamberRecord(member: Member): ChamberRecord | null {
	const who = parts(member.rosterName)
	if (!who.surname) return null
	const mine = getJournals().filter((j) => member.phases.includes(j.parliament))
	if (!mine.length) return null
	const withList = mine.filter((j) => j.attendance && (j.attendance.absent || j.attendance.onLeave))
	const absent = withList.filter((j) => (j.attendance?.absent ?? []).some((n) => names(n, who)))
	const onLeave = withList.filter((j) => (j.attendance?.onLeave ?? []).some((n) => names(n, who)))
	// A point names its speaker after "MP"; the surname alone is not enough in a
	// chamber with several Ampatuans and Sinsuats.
	const said = new RegExp(`\\bMP (?:[\\w.'-]+ ){0,4}${who.surname.replace(/ /g, '[ -]')}\\b`, 'i')
	const points = mine.flatMap((journal) =>
		(journal.points ?? [])
			.filter((p) => {
				const m = p.point.match(said)
				return m ? names(m[0], who) : false
			})
			.map((p) => ({ journal, text: p.point })),
	)
	return { sittings: withList.length, absent, onLeave, points }
}
