import fs from 'node:fs'
import path from 'node:path'
import acts from '../../../../datasets/bills/bangsamoro_registry/baa/official_index.json'
import bills from '../../../../datasets/bills/bangsamoro_registry/bills/official_index.json'
import adopted from '../../../../datasets/bills/bangsamoro_registry/resolutions/adopted_official_index.json'
import proposed from '../../../../datasets/bills/bangsamoro_registry/resolutions/proposed_official_index.json'

/* ============================================================
   What changed this week

   Everything the records date to one week, Monday to Sunday: each
   stage Parliament recorded on a bill or resolution, each act signed,
   each bid notice posted and each contract awarded on PhilGEPS, and
   the bids still open that close in the week after. Read from the
   dated records themselves, so a week can be looked back on.
   ============================================================ */

const LEG = 'https://legislation.betterbarmm.com'
const PROC = 'https://procurement.betterbarmm.com'

export type MeasureEvent = { kind: 'Bill' | 'Resolution' | 'Act'; number: number; title: string; stage: string; date: string; href: string }
export type NoticeItem = { ref: string; title: string; office: string; officeSlug: string; budget: number | null; date: string; closing?: string | null }
export type AwardItem = { ref: string; title: string; office: string; officeSlug: string; supplier: string; amount: number | null; date: string }

/** Monday of the week holding `iso` (YYYY-MM-DD). */
export function mondayOf(iso: string) {
	const d = new Date(`${iso}T00:00:00Z`)
	d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
	return d.toISOString().slice(0, 10)
}
export const addDays = (iso: string, n: number) => {
	const d = new Date(`${iso}T00:00:00Z`)
	d.setUTCDate(d.getUTCDate() + n)
	return d.toISOString().slice(0, 10)
}
export const todayManila = () => new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10)

const sentence = (t: string) => t.charAt(0) + t.slice(1).toLowerCase()

/** "Referred to a Committee – 7/20/2026 (Resumption)" → stage and ISO date. */
function line(s: string): { stage: string; date: string } | null {
	const m = s.match(/^(.*?)\s*[–—-]\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/)
	if (!m) return null
	return { stage: m[1]!.trim(), date: `${m[4]}-${m[2]!.padStart(2, '0')}-${m[3]!.padStart(2, '0')}` }
}

type Raw = { number: number; title: string; history?: string[]; as_of?: string; status?: string; date_ratified?: string }

const measureEvents: MeasureEvent[] = (() => {
	const out: MeasureEvent[] = []
	const add = (kind: MeasureEvent['kind'], list: Raw[], base: string) => {
		for (const m of list)
			for (const h of m.history ?? []) {
				const l = line(h)
				if (l) out.push({ kind, number: m.number, title: sentence(m.title), stage: l.stage, date: l.date, href: `${LEG}${base}/${m.number}` })
			}
	}
	add('Bill', bills.bills as Raw[], '/bills')
	add('Resolution', proposed.measures as Raw[], '/resolutions/proposed')
	// Acts and adopted resolutions carry one date: the day they became law or were adopted.
	for (const a of acts.acts as Raw[]) {
		const d = a.date_ratified || (a.as_of && line(`x – ${a.as_of}`)?.date)
		if (d) out.push({ kind: 'Act', number: a.number, title: sentence(a.title), stage: 'Signed into law', date: d, href: `${LEG}/acts/${a.number}` })
	}
	return out
})()

/* ---- PhilGEPS ---- */
const procurement = (() => {
	// turbopackIgnore: the build would otherwise trace every file under these roots; next.config includes philgeps.json.
	const file = ['.', '..', '../..']
		.map((up) => path.join(/* turbopackIgnore: true */ process.cwd(), up, 'datasets/procurement/philgeps.json'))
		.find((f) => fs.existsSync(f))
	if (!file) return { notices: [] as NoticeItem[], awards: [] as AwardItem[], open: [] as NoticeItem[] }
	const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as { columns: string[]; entities: { name: string }[]; categorys: string[]; awardees: string[]; notices: unknown[][] }
	const c = (n: string) => raw.columns.indexOf(n)
	const used = new Set<string>()
	const slugs = raw.entities.map((e) => {
		let s = e.name.replace(/\s+/g, ' ').trim().toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
		while (used.has(s)) s += '-2'
		used.add(s)
		return s
	})
	const notices: NoticeItem[] = []
	const awards: AwardItem[] = []
	const open: NoticeItem[] = []
	for (const n of raw.notices) {
		const e = n[c('entity')] as number
		const cat = n[c('category')] as number | null
		const title = (n[c('title')] as string | null) ?? (cat == null ? 'Untitled notice' : raw.categorys[cat]!)
		const base = { ref: n[c('ref')] as string, title, office: raw.entities[e]!.name, officeSlug: slugs[e]!, budget: n[c('abc')] as number | null }
		const date = n[c('date')] as string | null
		if (date) notices.push({ ...base, date })
		for (const [who, amount, at] of (n[c('awards')] as [number, number | null, string | null][]) ?? [])
			if (at) awards.push({ ...base, supplier: raw.awardees[who]!, amount, date: at })
		if (c('open') >= 0 && n[c('open')]) open.push({ ...base, date: date ?? '', closing: n[c('closing')] as string | null })
	}
	return { notices, awards, open }
})()

/** The latest day any record reaches, so "this week" never lands on an empty future. */
export const latestDay = [...measureEvents.map((e) => e.date), ...procurement.notices.map((n) => n.date)].filter((d) => d <= todayManila()).sort().at(-1)!

export function week(monday: string) {
	const sunday = addDays(monday, 6)
	const inWeek = (d: string) => d >= monday && d <= sunday
	const events = measureEvents.filter((e) => inWeek(e.date)).sort((a, b) => b.date.localeCompare(a.date) || a.number - b.number)
	const notices = procurement.notices.filter((n) => inWeek(n.date))
	const awards = procurement.awards.filter((a) => inWeek(a.date)).sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))
	const closing = procurement.open
		.filter((n) => n.closing && n.closing > sunday && n.closing <= addDays(sunday, 7))
		.sort((a, b) => (a.closing ?? '').localeCompare(b.closing ?? ''))
	return {
		monday,
		sunday,
		events,
		filed: events.filter((e) => /^filed/i.test(e.stage)),
		// The measure itself adopted or signed, not a committee report on it.
		adopted: events.filter((e) => /^(adopted|approved|enacted|signed)/i.test(e.stage)),
		acts: events.filter((e) => e.kind === 'Act'),
		notices: { count: notices.length, budget: notices.reduce((s, n) => s + (n.budget ?? 0), 0), largest: [...notices].sort((a, b) => (b.budget ?? 0) - (a.budget ?? 0)).slice(0, 8) },
		awards: { count: awards.length, amount: awards.reduce((s, a) => s + (a.amount ?? 0), 0), largest: awards.slice(0, 8) },
		closing: closing.slice(0, 8),
	}
}

export type Week = ReturnType<typeof week>

export { PROC }
