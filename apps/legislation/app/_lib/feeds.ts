import { recordHref } from './categories'
import type { OfficialMeasure } from './official-measures'

/* ============================================================
   RSS feeds

   One item per dated stage line Parliament publishes on a measure —
   "Filed – 7/15/2026", "Referred to the Committee on … – 7/20/2026" — so
   a feed reader, or an email-from-RSS service, tells a follower each time
   a measure moves. A measure with no history yet is one item, on the date
   its index gives.
   ============================================================ */

const SITE = 'https://legislation.betterbarmm.com'

type Item = { title: string; link: string; date: Date; description: string; guid: string }

/** "Referred to a Committee – 7/20/2026 (Resumption)" → the stage and its date. */
function parseLine(line: string): { stage: string; date: Date } | null {
	const m = line.match(/^(.*?)\s*[–—-]\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/)
	if (!m) return null
	const date = new Date(Date.UTC(+m[4]!, +m[2]! - 1, +m[3]!))
	return Number.isNaN(date.getTime()) ? null : { stage: m[1]!.trim(), date }
}

export function measureEvents(measures: OfficialMeasure[]): Item[] {
	const items: Item[] = []
	for (const m of measures) {
		const link = `${SITE}${recordHref(m) ?? ''}`
		const lines = m.history.map(parseLine).filter((x): x is NonNullable<typeof x> => Boolean(x))
		if (lines.length)
			for (const { stage, date } of lines)
				items.push({ title: `${m.numberLabel}: ${stage}`, link, date, description: m.title, guid: `${m.category}-${m.number}-${stage}-${date.toISOString().slice(0, 10)}` })
		else if (m.dateIso)
			items.push({ title: `${m.numberLabel}: ${m.status}`, link, date: new Date(`${m.dateIso}T00:00:00Z`), description: m.title, guid: `${m.category}-${m.number}-${m.status}` })
	}
	// A stage dated after today is a typo at the source (Bill 404 is "Filed –
	// 10/27/2026" yet read on 11/13/2025); it would sit atop every feed.
	const now = Date.now()
	return items.filter((i) => i.date.getTime() <= now).sort((a, b) => b.date.getTime() - a.date.getTime())
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function rssResponse(channel: { title: string; path: string; description: string }, items: Item[]) {
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(channel.title)}</title>
<link>${SITE}${channel.path.replace(/\/feed\.xml$/, '') || '/'}</link>
<atom:link href="${SITE}${channel.path}" rel="self" type="application/rss+xml"/>
<description>${esc(channel.description)}</description>
<language>en</language>
${items
	.slice(0, 100)
	.map(
		(i) => `<item>
<title>${esc(i.title)}</title>
<link>${esc(i.link)}</link>
<guid isPermaLink="false">${esc(i.guid)}</guid>
<pubDate>${i.date.toUTCString()}</pubDate>
<description>${esc(i.description)}</description>
</item>`,
	)
	.join('\n')}
</channel>
</rss>
`
	return new Response(body, {
		headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
	})
}
