import fs from 'node:fs'
import path from 'node:path'
import { lguProvinces } from '@betterbarmm/lgu-data'
import roster from '../../../../datasets/bills/bangsamoro_registry/members/_index.json'
import elected from '../../../../datasets/bills/bangsamoro_registry/members/parliament-2026.json'
import acts from '../../../../datasets/bills/bangsamoro_registry/baa/official_index.json'
import bills from '../../../../datasets/bills/bangsamoro_registry/bills/official_index.json'
import adopted from '../../../../datasets/bills/bangsamoro_registry/resolutions/adopted_official_index.json'
import proposed from '../../../../datasets/bills/bangsamoro_registry/resolutions/proposed_official_index.json'
import trends from '../../../../datasets/budget/trends.json'
import directory from '../../../../datasets/directory/offices.json'
import { categoryLabel, offerings, shortName, slugify as anchor } from './services'
import { lguHasCharter, lguHref, lgus } from './lgu-services'

/* ============================================================
   One search across the estate

   Every named thing a reader might look for, in one list held on the
   server: measures and members, budget offices, provinces, towns and
   barangays, procurement offices and suppliers, the regional offices in
   the Directory, and every program and service. Each entry links to
   the workspace that holds its record. Ranked by how much of the name
   the words cover, then by kind.
   ============================================================ */

export type SearchKind = 'Act' | 'Bill' | 'Resolution' | 'Member' | 'Budget office' | 'Town' | 'Province' | 'Barangay' | 'Procuring office' | 'Supplier' | 'Office' | 'Service' | 'Program'

export type SearchHit = { kind: SearchKind; title: string; detail: string; href: string }

type Entry = SearchHit & { hay: string; rank: number }

const LEG = 'https://legislation.betterbarmm.com'
const BUDGET = 'https://budget.betterbarmm.com'
const LGU = 'https://lgu.betterbarmm.com'
const PROC = 'https://procurement.betterbarmm.com'
// The landing site's own pages, written whole: the search answers every workspace's header too.
const WWW = 'https://betterbarmm.com'

/** Lowercase, unaccented, punctuation to spaces. */
export const fold = (s: string) =>
	s
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9ñ]+/g, ' ')
		.trim()

/** "ABAS, AKMAD I." → "Akmad I. Abas". */
const personName = (roster: string) => {
	const [surname, given, ...suffix] = roster.split(',').map((s) => s.trim())
	const cap = (s: string) => s.toLowerCase().replace(/(^|[\s.-])([a-zñ])/g, (_m, a: string, b: string) => a + b.toUpperCase())
	return given ? [cap(given), cap(surname!), ...suffix.map(cap)].join(' ') : cap(roster)
}

const memberSlug = (roster: string) => roster.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const sentence = (title: string) => title.charAt(0) + title.slice(1).toLowerCase()

/** Kinds a reader most often means, first. */
const KIND_RANK: Record<SearchKind, number> = {
	Town: 0,
	Province: 0,
	Office: 1,
	Member: 1,
	Service: 2,
	Program: 3,
	Act: 2,
	'Budget office': 2,
	'Procuring office': 3,
	Bill: 3,
	Resolution: 4,
	Supplier: 4,
	Barangay: 5,
}

const slugify = (name: string) =>
	name
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 80)

function procurement(): Entry[] {
	const roots = [process.cwd(), path.join(process.cwd(), '..'), path.join(process.cwd(), '../..')]
	const file = roots.map((r) => path.join(r, 'datasets/procurement/philgeps.json')).find((f) => fs.existsSync(f))
	if (!file) return []
	const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as { entities: { name: string; type: string }[]; awardees: string[] }
	const used = new Set<string>()
	const offices = raw.entities.map((e) => {
		const name = e.name.replace(/\s+/g, ' ').trim()
		let slug = slugify(name)
		while (used.has(slug)) slug += '-2'
		used.add(slug)
		return entry('Procuring office', name, `${e.type} · bids on PhilGEPS`, `${PROC}/${slug}`)
	})
	// The procurement workspace's supplier pages, slugged the same way.
	const suppliers = raw.awardees.map((s) => entry('Supplier', s, 'Won contracts from BARMM offices', `${PROC}/suppliers/${slugify(s) || 'supplier'}`))
	return [...offices, ...suppliers]
}

function entry(kind: SearchKind, title: string, detail: string, href: string, extra = ''): Entry {
	return { kind, title, detail, href, hay: fold(`${title} ${extra}`), rank: KIND_RANK[kind] }
}

type Measure = { number: number; title: string; status?: string }

const index: Entry[] = [
	...lguProvinces.flatMap((p) => [
		entry('Province', p.name, p.kind === 'Province' ? 'Province' : p.kind, `${LGU}/${p.slug}`, ''),
		...p.municipalities.map((m) =>
			entry('Town', m.name, `${m.isCity ? 'City' : 'Municipality'} · ${p.name}`, `${LGU}/${p.slug}/${m.slug}`, m.alsoKnownAs ?? ''),
		),
		...p.municipalities.flatMap((m) =>
			m.barangays.map((b) => entry('Barangay', b.name, `Barangay · ${m.name}, ${p.name}`, `${LGU}/${p.slug}/${m.slug}`)),
		),
	]),
	// The legislation workspace's own slugs: the roster name, lowercased and hyphenated.
	...(() => {
		const people = new Map<string, Entry>()
		for (const m of elected.members as { rosterName: string; fullName: string; seatLabel: string }[])
			people.set(memberSlug(m.rosterName), entry('Member', m.fullName, `Member of Parliament · ${m.seatLabel}`, `${LEG}/members/${memberSlug(m.rosterName)}`, m.rosterName))
		for (const m of roster.members as { name: string; current_position: string | null }[])
			if (!people.has(memberSlug(m.name)))
				people.set(memberSlug(m.name), entry('Member', personName(m.name), m.current_position || 'Former member', `${LEG}/members/${memberSlug(m.name)}`, m.name))
		return [...people.values()]
	})(),
	...(acts.acts as Measure[]).map((m) => entry('Act', sentence(m.title), `Bangsamoro Autonomy Act ${m.number}`, `${LEG}/acts/${m.number}`, `baa ${m.number} act ${m.number}`)),
	...(bills.bills as Measure[]).map((m) => entry('Bill', sentence(m.title), `Bill ${m.number}${m.status ? ` · ${m.status}` : ''}`, `${LEG}/bills/${m.number}`, `bill ${m.number}`)),
	...(adopted.measures as Measure[]).map((m) => entry('Resolution', sentence(m.title), `Adopted resolution ${m.number}`, `${LEG}/resolutions/adopted/${m.number}`, `resolution ${m.number}`)),
	...(proposed.measures as Measure[]).map((m) =>
		entry('Resolution', sentence(m.title), `Proposed resolution ${m.number}${m.status ? ` · ${m.status}` : ''}`, `${LEG}/resolutions/proposed/${m.number}`, `resolution ${m.number}`),
	),
	...trends.offices.map((o) => entry('Budget office', o.name, 'In the Bangsamoro budget', `${BUDGET}/offices/${o.slug}`)),
	...procurement(),
	...(directory.offices as { slug: string; name: string; acronym: string | null }[]).map((o) =>
		entry('Office', o.name, 'Regional office · in the Directory', `${WWW}/directory/office/${o.slug}`, o.acronym ?? ''),
	),
	...offerings.map((o) =>
		entry(
			o.kind === 'program' ? 'Program' : 'Service',
			o.item.name,
			`${shortName(o.office)} · ${o.item.category ? categoryLabel(o.item.category) : 'Programs & services'}`,
			`${WWW}/services/${o.office.slug}#${o.kind}-${anchor(o.item.name)}`,
			`${o.office.acronym ?? ''} ${o.item.summary ?? ''}`,
		),
	),
	...lgus.filter(lguHasCharter).flatMap((l) =>
		l.services.map((s) =>
			entry('Service', s.name, `${l.name} · ${s.category ? categoryLabel(s.category) : 'Programs & services'}`, `${WWW}${lguHref(l)}#service-${anchor(s.name)}`, `${l.name} ${l.province} ${s.summary ?? ''}`),
		),
	),
]

export function search(q: string, limit = 40): { hits: SearchHit[]; total: number } {
	const words = fold(q).split(' ').filter(Boolean)
	if (!words.length) return { hits: [], total: 0 }
	const phrase = words.join(' ')
	const scored: { e: Entry; score: number }[] = []
	for (const e of index) {
		if (!words.every((w) => e.hay.includes(w))) continue
		const title = fold(e.title)
		// Whole name first, then a name that starts with the words, then any.
		const word = new RegExp(`(^| )${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}( |$)`)
		const tier = title === phrase ? 0 : title.startsWith(`${phrase} `) ? 1 : word.test(title) ? 2 : words.every((w) => new RegExp(`(^| )${w}`).test(title)) ? 3 : 4
		const score = tier * 10 + e.rank
		scored.push({ e, score })
	}
	scored.sort((a, b) => a.score - b.score || a.e.title.length - b.e.title.length)
	return { hits: scored.slice(0, limit).map(({ e: { kind, title, detail, href } }) => ({ kind, title, detail, href })), total: scored.length }
}
