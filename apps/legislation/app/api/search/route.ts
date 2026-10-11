import type { NextRequest } from 'next/server'
import { getCategory, recordHref } from '../../_lib/categories'
import { getAllRecords } from '../../_lib/legislation-data'
import { getMembersDataset } from '../../_lib/members-data'

/* The registry finder's results: members first, then the measures whose
   text holds every word typed, a match on the number itself ranked top.
   Run on the server so the registry never ships to the browser. */

export type SearchHit = { href: string; title: string; meta: string; kind: string }

export function GET(request: NextRequest) {
	const query = (request.nextUrl.searchParams.get('q') ?? '').trim().toLowerCase()
	const words = query.split(/\s+/).filter(Boolean)
	if (query.length < 2) return Response.json({ hits: [] })
	const holds = (text: string) => words.every((word) => text.includes(word))

	const members: SearchHit[] = getMembersDataset()
		.members.filter((m) => holds(`${m.displayName} ${m.rosterName}`.toLowerCase()))
		.slice(0, 3)
		.map((m) => ({ href: `/members/${m.slug}`, title: m.displayName, meta: m.roleTitle ?? 'Member of Parliament', kind: 'Member' }))

	const records = getAllRecords()
		.filter((r) => recordHref(r) && holds(r.searchText))
		.sort((a, b) => Number(b.numberLabel.toLowerCase().includes(query)) - Number(a.numberLabel.toLowerCase().includes(query)))
		.slice(0, 8 - members.length)
		.map((r) => ({
			href: recordHref(r)!,
			title: r.shortTitle ?? r.title,
			meta: [r.numberLabel, r.year, r.statusShort].filter(Boolean).join(' · '),
			kind: getCategory(r.category).label,
		}))

	return Response.json({ hits: [...members, ...records] })
}
