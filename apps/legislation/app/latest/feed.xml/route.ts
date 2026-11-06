import { getChanges } from '../../_lib/changes'

/* The newest 100 steps, one item each, for a feed reader. */
const SITE = 'https://legislation.betterbarmm.com'
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const dynamic = 'force-static'

export function GET() {
	const items = getChanges()
		.slice(0, 100)
		.map((c) => {
			const title = `${c.label}: ${c.stage}${c.note ? ` (${c.note})` : ''}`
			return `<item>
<title>${esc(title)}</title>
<link>${SITE}${c.href ?? '/latest'}</link>
<guid isPermaLink="false">${esc(`${c.label}|${c.stage}|${c.note ?? ""}|${c.date}`)}</guid>
<pubDate>${new Date(`${c.date}T12:00:00Z`).toUTCString()}</pubDate>
<description>${esc(c.title)}</description>
</item>`
		})
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>BetterBARMM Legislation — What changed</title>
<link>${SITE}/latest</link>
<atom:link href="${SITE}/latest/feed.xml" rel="self" type="application/rss+xml"/>
<description>Each step a bill or resolution takes in the Bangsamoro Parliament, and each act ratified.</description>
<language>en</language>
${items.join('\n')}
</channel>
</rss>
`,
		{ headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } },
	)
}
