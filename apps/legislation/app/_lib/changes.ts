import { recordHref } from './categories'
import { describeStatus, toDisplayTitle, type StatusTone } from './labels'
import { getAllRecords, type LegislationRecord } from './legislation-data'
import { getFirstParliamentMeasures, getOfficialMeasuresByCategory } from './official-measures'

/* ============================================================
   What changed, and when

   Every dated step a measure has taken, newest first: the stages in each
   bill's and proposed resolution's own history on Parliament's site
   ("Second Reading – 10/6/2026"), and each act's ratification. A proposal
   adopted as a resolution is already a line in its history ("Adopted as
   Resolution No. 271"), so adopted resolutions are not counted twice.
   ============================================================ */

export type Change = {
	date: string
	stage: string
	note?: string
	label: string
	title: string
	href?: string
}

const LINE = /^(.*?)\s+[–-]\s+(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(?:\((.*)\))?\s*$/

let cached: Change[] | null = null

export function getChanges(): Change[] {
	if (cached) return cached
	const byId = new Map<string, LegislationRecord>(getAllRecords().map((record) => [record.id, record]))
	const out: Change[] = []
	for (const category of ['bills', 'proposed-resolutions'] as const) {
		for (const measure of getOfficialMeasuresByCategory(category)) {
			const record = byId.get(`${category}-${measure.number}`)
			const lines = measure.history
				.map((line) => LINE.exec(line.trim()))
				.filter((m): m is RegExpExecArray => Boolean(m))
				.map(([, stage, month, day, year, note]) => ({ stage: stage!, note, date: `${year}-${month!.padStart(2, '0')}-${day!.padStart(2, '0')}` }))
			// A step dated after a later step is a typo at source ("Filed – 10/27/2026" before a 2025 first
			// reading), and would put an old measure at the top of the list; such a line is left out.
			lines.forEach(({ stage, note, date }, i) => {
				if (lines.slice(i + 1).some((later) => later.date < date)) return
				out.push({
					date,
					stage: stage.trim(),
					note: note || undefined,
					label: record?.numberLabel ?? `${category === 'bills' ? 'Bill' : 'Resolution'} ${measure.number}`,
					title: record?.shortTitle ?? record?.title ?? measure.title,
					href: record ? recordHref(record) : undefined,
				})
			})
		}
	}
	// The First Parliament's measures (from 24 November 2026), numbered from 1 again and linked to Parliament's own page.
	for (const measure of getFirstParliamentMeasures()) {
		for (const line of measure.history) {
			const m = LINE.exec(line.trim())
			if (!m) continue
			const [, stage, month, day, year, note] = m
			out.push({
				date: `${year}-${month!.padStart(2, '0')}-${day!.padStart(2, '0')}`,
				// "Adopted as Bangsamoro Parliament Resolution No. 1" says the Parliament twice on a card already headed by it.
				stage: stage!.trim().replace(/Bangsamoro Parliament Resolution/i, 'Resolution'),
				note: note || undefined,
				label: `First Parliament ${measure.kind} ${measure.number}`,
				title: toDisplayTitle(measure.title),
				href: measure.url || undefined,
			})
		}
	}
	for (const record of getAllRecords()) {
		if (record.category !== 'acts' || !record.dateIso) continue
		out.push({ date: record.dateIso, stage: record.dateLabel, label: record.numberLabel, title: record.shortTitle ?? record.title, href: recordHref(record) })
	}
	cached = out.sort((a, b) => b.date.localeCompare(a.date) || a.label.localeCompare(b.label))
	return cached
}

/** Monday of the week a date falls in, as YYYY-MM-DD. */
export function mondayOf(iso: string): string {
	const d = new Date(`${iso}T00:00:00Z`)
	d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
	return d.toISOString().slice(0, 10)
}

/**
 * The colour a step takes, on the registry's own status scale. Parliament's history uses a few words the status
 * reader doesn't: a committee report adopted moves a bill on rather than enacting it, "Enhanced" is a reworked text
 * moving forward, and a bare committee name is a referral.
 */
export function stageTone(stage: string): StatusTone {
	if (/^Ratified/i.test(stage)) return 'enacted'
	if (/^Committee Report/i.test(stage) || /^Enhanced/i.test(stage)) return 'advancing'
	if (/^(Referred to )?(the )?Committee on|^Special Committee|^Blue Ribbon/i.test(stage)) return 'committee'
	return describeStatus(stage).tone
}
