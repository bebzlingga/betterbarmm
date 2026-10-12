import { addDays, latestDay, mondayOf, week } from '../../_lib/weekly'

/* One item per week, the last twelve: what moved, in a sentence each. */
const peso = (n: number) => (n >= 1e9 ? `₱${(n / 1e9).toFixed(2)}B` : `₱${(n / 1e6).toFixed(1)}M`)
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const day = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

export function GET() {
	const last = mondayOf(latestDay)
	const items = Array.from({ length: 12 }, (_, i) => week(addDays(last, -7 * i))).map((w) => {
		const lines = [
			`Parliament: ${w.filed.length} measures filed, ${w.adopted.length} adopted or signed, ${w.events.length} stages recorded in all.`,
			...w.adopted.slice(0, 5).map((e) => `• ${e.kind} ${e.number} ${e.stage.toLowerCase()}: ${e.title}`),
			`Procurement: ${w.notices.count} bid notices posted (${peso(w.notices.budget)}); ${w.awards.count} contracts awarded (${peso(w.awards.amount)}).`,
		]
		return `<item>
<title>${esc(`The week of ${day(w.monday)}`)}</title>
<link>https://betterbarmm.com/this-week?week=${w.monday}</link>
<guid isPermaLink="false">week-${w.monday}</guid>
<pubDate>${new Date(`${w.sunday}T12:00:00Z`).toUTCString()}</pubDate>
<description>${esc(lines.join('\n'))}</description>
</item>`
	})
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>BetterBARMM — This week</title>
<link>https://betterbarmm.com/this-week</link>
<atom:link href="https://betterbarmm.com/this-week/feed.xml" rel="self" type="application/rss+xml"/>
<description>What moved in the Bangsamoro each week: bills, resolutions, laws, bids and awards.</description>
<language>en</language>
${items.join('\n')}
</channel>
</rss>
`,
		{ headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } },
	)
}
