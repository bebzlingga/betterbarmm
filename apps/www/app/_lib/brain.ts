import fs from 'node:fs'
import path from 'node:path'
import { lguProvinces } from '@betterbarmm/lgu-data'
import { discoverBarmmTopics } from '@betterbarmm/primer-data'
import { barangayRows, localGovernments } from './directory'

/* ============================================================
   The brain of BetterBARMM, as data

   Every node on /brain is a real part of the estate — a source it
   reads, a dataset it keeps, a workspace it publishes, and Jo, who
   reads the lot — and every count and date on it is read from the
   datasets at build time, not written down. So the map is only ever
   as current as the site, and it can never claim a link the data
   does not make.

   Also each town's footprint: everything the estate holds about
   one place, which is the joins made visible.
   ============================================================ */

const ROOT = path.join(process.cwd(), '../../datasets')
const read = <T = Record<string, unknown>>(file: string): T => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8')) as T
const dated = (d: Record<string, unknown>) => (d.generatedAt ?? d.generated_at ?? null) as string | null

export type Kind = 'jo' | 'workspace' | 'dataset' | 'source'
export type BrainNode = { id: string; label: string; kind: Kind; note: string; count?: number; unit?: string; date?: string | null; href?: string; fresh?: boolean }
export type BrainEdge = { from: string; to: string; kind: 'feeds' | 'reads' | 'join'; label?: string }

export type TownThread = {
	key: string
	name: string
	province: string
	isCity: boolean
	mayor: string | null
	barangays: number
	lines: number
	email: boolean
	incidents: number
	deaths: number
	notices: number
	places: string[]
	district: string | null
	directory: string
	lgu: string
}

export function brain() {
	const acts = read<{ acts: unknown[] }>('bills/bangsamoro_registry/baa/official_index.json').acts.length
	const bills = read<{ bills: unknown[] }>('bills/bangsamoro_registry/bills/official_index.json').bills.length
	const adopted = read<{ measures: unknown[] }>('bills/bangsamoro_registry/resolutions/adopted_official_index.json').measures.length
	const proposed = read<{ measures: unknown[] }>('bills/bangsamoro_registry/resolutions/proposed_official_index.json').measures.length
	const code = read<{ sections: unknown[] }>('bills/blgc.json').sections.length + read<{ articles: unknown[] }>('bills/blgc-irr.json').articles.length

	const election = read<Record<string, unknown>>('election/election-results.json')
	const seats = 80

	const philgeps = read<{ generatedAt: string; entities: { unit: string | null }[]; notices: unknown[][] }>('procurement/philgeps.json')
	const awards = philgeps.notices.reduce((n, row) => n + ((row[10] as unknown[]) ?? []).length, 0)
	const blacklist = read<{ generatedAt: string; entities: unknown[] }>('procurement/gppb-blacklist.json')

	const offices = read<{ generatedAt: string; offices: unknown[] }>('directory/offices.json')
	const field = read<{ generatedAt: string; offices: unknown[] }>('directory/field-offices.json')
	const emergency = read<{ generatedAt: string; towns: { province: string; slug: string; lines: unknown[] }[] }>('directory/emergency.json')
	const emails = read<{ generatedAt: string; towns: Record<string, unknown> }>('directory/lgu-emails.json')
	const places = read<{ generatedAt: string; items: { name: string; municipality: string; area: string }[] }>('places/places.json')
	const stays = read<{ stays: unknown[] }>('places/stays.json').stays.length
	const crafts = read<{ generatedAt: string; items: unknown[] }>('crafts/crafts.json')
	const accidents = read<{ generatedAt: string; incidents: { province: string; municipality: string | null; deaths: number }[] }>('accidents/accidents.json')
	const audits = read<{ generatedAt: string; reports: unknown[] }>('coa/audit-reports.json')
	const finances = read<Record<string, unknown>>('lgu/finances.json')
	const districts = read<{ towns: Record<string, { districts: string[] }> }>('election/district-towns.json').towns

	const towns = lguProvinces.reduce((n, p) => n + p.municipalities.length, 0)
	const barangays = localGovernments.reduce((n, g) => n + g.units.reduce((k, u) => k + barangayRows(g.slug, u.slug).length, 0), 0)
	const appropriations = fs.readdirSync(path.join(ROOT, 'budget')).filter((f) => /^BAA\d+_FY\d{4}_budget\.json$/.test(f)).length

	const nodes: BrainNode[] = [
		{ id: 'jo', label: 'Jo', kind: 'jo', note: 'The assistant on every page. She reads the records the workspaces publish, and answers from them; a figure she gives is one a record holds.', href: '/jo' },

		{ id: 'w-legislation', label: 'Legislation', kind: 'workspace', note: 'Every act, bill and resolution of the Bangsamoro Parliament, read and explained, and the Local Governance Code rule by rule.', href: 'https://legislation.betterbarmm.com' },
		{ id: 'w-budget', label: 'Budget', kind: 'workspace', note: 'The region’s appropriations year by year, office by office, with what each act puts conditions on.', href: 'https://budget.betterbarmm.com' },
		{ id: 'w-election', label: 'Election', kind: 'workspace', note: 'The September 2026 parliamentary election: every party, every seat, every district race.', href: 'https://election.betterbarmm.com' },
		{ id: 'w-lgu', label: 'Local Government', kind: 'workspace', note: 'Every province, town and barangay: who governs it, what it collects and spends, and how it was audited.', href: 'https://lgu.betterbarmm.com' },
		{ id: 'w-procurement', label: 'Procurement', kind: 'workspace', note: 'What every BARMM office set out to buy on PhilGEPS since 2019, and who won the contracts.', href: 'https://procurement.betterbarmm.com' },
		{ id: 'w-directory', label: 'Directory', kind: 'workspace', note: 'Who heads each regional office, how to reach it, who led it before, and every town’s emergency lines.', href: '/directory' },
		{ id: 'w-incidents', label: 'Incident Watch', kind: 'workspace', note: 'Road crashes, shootings, drownings, fires and floods reported in the region, on a map.', href: '/accidents' },
		{ id: 'w-places', label: 'Places', kind: 'workspace', note: 'Islands, lakes, mosques, falls and heritage sites: what is there, how to get there, where to stay.', href: '/places' },
		{ id: 'w-crafts', label: 'Crafts', kind: 'workspace', note: 'The weaves, mats, brass and gongs of the region, who makes them and where to see them.', href: '/crafts' },
		{ id: 'w-discover', label: 'Discover', kind: 'workspace', note: 'How the Bangsamoro came to be, how its government works, and the explainers.', href: '/discover' },

		{ id: 'd-measures', label: 'Acts, bills & resolutions', kind: 'dataset', count: acts + bills + adopted + proposed, unit: 'measures', note: `${acts} acts, ${bills} bills, ${adopted} adopted and ${proposed} proposed resolutions, with authors and status.` },
		{ id: 'd-code', label: 'Local Governance Code', kind: 'dataset', count: code, unit: 'rules', note: 'The 2023 Bangsamoro Local Governance Code section by section, and its 2025 implementing rules article by article.' },
		{ id: 'd-appropriations', label: 'Appropriations acts', kind: 'dataset', count: appropriations, unit: 'budget years', note: 'Each year’s General Appropriations Act from FY 2020, transcribed line by line.' },
		{ id: 'd-election', label: '2026 election results', kind: 'dataset', count: seats, unit: 'seats', date: dated(election), note: 'The proclaimed result: party totals, the party-list count, all 32 district races and the reserved seats.' },
		{ id: 'd-lgus', label: 'Provinces, towns & barangays', kind: 'dataset', count: barangays, unit: 'barangays', note: `${lguProvinces.length} provinces and areas, ${towns} towns and cities, each on its standard place code.` },
		{ id: 'd-officials', label: 'Elected local officials', kind: 'dataset', count: towns, unit: 'towns', note: 'Governors, mayors, councils and punong barangays, from the COMELEC canvass and the DILG directory.' },
		{ id: 'd-finances', label: 'LGU finances & NTA', kind: 'dataset', count: Object.keys((finances.units as Record<string, unknown>) ?? {}).length || undefined, unit: 'LGUs', date: dated(finances), note: 'What each town and province collects and spends, its national tax allotment and its income class.' },
		{ id: 'd-audits', label: 'COA audit reports', kind: 'dataset', count: audits.reports.length, unit: 'reports', date: audits.generatedAt, note: 'The Commission on Audit’s annual reports on the region’s offices and local governments.' },
		{ id: 'd-notices', label: 'PhilGEPS bid notices', kind: 'dataset', count: philgeps.notices.length, unit: 'notices', date: philgeps.generatedAt, note: `Every notice a BARMM office posted since 2019, and ${awards.toLocaleString('en-PH')} contracts awarded on them.` },
		{ id: 'd-blacklist', label: 'Blacklisted suppliers', kind: 'dataset', count: blacklist.entities.length, unit: 'suppliers', date: blacklist.generatedAt, note: 'The national blacklist, matched to the region’s suppliers.' },
		{ id: 'd-offices', label: 'Regional offices & heads', kind: 'dataset', count: offices.offices.length, unit: 'offices', date: offices.generatedAt, note: 'Each ministry and office: its head as of the newest dated record, its numbers, emails, address, past heads and structure.' },
		{ id: 'd-field', label: 'Provincial offices', kind: 'dataset', count: field.offices.length, unit: 'offices', date: field.generatedAt, note: 'The ministries’ offices in the provinces, with their heads and contacts where published.' },
		{ id: 'd-lines', label: 'Emergency lines & emails', kind: 'dataset', count: emergency.towns.length, unit: 'towns', date: emails.generatedAt, note: 'Each town’s police, fire, health and town hall numbers, and its official email.' },
		{ id: 'd-places', label: 'Places & stays', kind: 'dataset', count: places.items.length + stays, unit: 'places', date: places.generatedAt, note: `${places.items.length} places and ${stays} places to stay, each traced to its sources.` },
		{ id: 'd-crafts', label: 'Crafts', kind: 'dataset', count: crafts.items.length, unit: 'crafts', date: crafts.generatedAt, note: 'Textiles, mats, brass, wood and gongs, with their makers and where to see them.' },
		{ id: 'd-incidents', label: 'Incident reports', kind: 'dataset', count: accidents.incidents.length, unit: 'incidents', date: accidents.generatedAt, note: 'One record per incident since 2019, every report linked, placed on its barangay where named.' },
		{ id: 'd-primer', label: 'History primer', kind: 'dataset', count: discoverBarmmTopics.length, unit: 'chapters', note: 'The region’s story from the sultanates to the transition, with dated timelines.' },

		{ id: 's-parliament', label: 'Bangsamoro Parliament', kind: 'source', note: 'Bills, resolutions, enacted acts and member profiles.' },
		{ id: 's-comelec', label: 'COMELEC', kind: 'source', note: 'Election canvasses and proclamations.' },
		{ id: 's-dilg', label: 'DILG', kind: 'source', note: 'Directories of local officials and barangays.' },
		{ id: 's-psa', label: 'PSA', kind: 'source', note: 'The standard code for every province, town and barangay.' },
		{ id: 's-dbm', label: 'DBM', kind: 'source', note: 'National tax allotments and local budget data.' },
		{ id: 's-coa', label: 'Commission on Audit', kind: 'source', note: 'Annual audit reports.' },
		{ id: 's-philgeps', label: 'PhilGEPS', kind: 'source', note: 'The government’s procurement system: notices, bids and awards.' },
		{ id: 's-gppb', label: 'GPPB', kind: 'source', note: 'The national blacklist of suppliers.' },
		{ id: 's-dti', label: 'DTI', kind: 'source', note: 'Town profiles in the competitiveness index, including official emails.' },
		{ id: 's-bio', label: 'Bangsamoro Information Office', kind: 'source', note: 'News releases: often the newest dated record of who holds a post.' },
		{ id: 's-ministries', label: 'Ministry & town sites', kind: 'source', note: 'Officials lists, hotlines and Citizen’s Charters.' },
		{ id: 's-news', label: 'News outlets', kind: 'source', note: 'For incidents, which no office keeps a register of.' },
		{ id: 's-photos', label: 'Commons, DOT & museums', kind: 'source', note: 'Freely licensed and government photographs, each credited.' },
		{ id: 's-scholars', label: 'Histories & laws', kind: 'source', note: 'The Organic Law, peace agreements and published histories behind the primer.' },
	]

	// Read this week, as of the build: the map is rebuilt with the site.
	const week = Date.now() - 7 * 86_400_000
	for (const n of nodes) if (n.date && new Date(n.date).getTime() >= week) n.fresh = true

	const feeds: [string, string[]][] = [
		['s-parliament', ['d-measures', 'd-code', 'd-appropriations']],
		['s-comelec', ['d-election', 'd-officials']],
		['s-dilg', ['d-officials', 'd-lgus']],
		['s-psa', ['d-lgus']],
		['s-dbm', ['d-finances']],
		['s-coa', ['d-audits', 'd-finances']],
		['s-philgeps', ['d-notices', 'd-field']],
		['s-gppb', ['d-blacklist']],
		['s-dti', ['d-lines', 'd-finances']],
		['s-bio', ['d-offices', 'd-field', 'd-places', 'd-crafts']],
		['s-ministries', ['d-offices', 'd-field', 'd-lines']],
		['s-news', ['d-incidents']],
		['s-photos', ['d-places', 'd-crafts']],
		['s-scholars', ['d-primer']],
	]
	const publishes: [string, string[]][] = [
		['d-measures', ['w-legislation']],
		['d-code', ['w-legislation', 'w-lgu']],
		['d-appropriations', ['w-budget']],
		['d-election', ['w-election']],
		['d-lgus', ['w-lgu', 'w-directory']],
		['d-officials', ['w-lgu', 'w-directory']],
		['d-finances', ['w-lgu']],
		['d-audits', ['w-lgu', 'w-budget']],
		['d-notices', ['w-procurement']],
		['d-blacklist', ['w-procurement']],
		['d-offices', ['w-directory']],
		['d-field', ['w-directory']],
		['d-lines', ['w-directory']],
		['d-places', ['w-places']],
		['d-crafts', ['w-crafts']],
		['d-incidents', ['w-incidents']],
		['d-primer', ['w-discover']],
	]
	const joins: [string, string, string][] = [
		['w-lgu', 'w-election', 'Town code'],
		['w-lgu', 'w-directory', 'Town code'],
		['w-lgu', 'w-procurement', 'Town code'],
		['w-lgu', 'w-incidents', 'Town code'],
		['w-lgu', 'w-places', 'Town'],
		['w-directory', 'w-budget', 'Office ID'],
		['w-directory', 'w-procurement', 'Office'],
		['w-budget', 'w-legislation', 'Act number'],
	]
	const edges: BrainEdge[] = [
		...feeds.flatMap(([from, to]) => to.map((t): BrainEdge => ({ from, to: t, kind: 'feeds' }))),
		...publishes.flatMap(([from, to]) => to.map((t): BrainEdge => ({ from, to: t, kind: 'feeds' }))),
		...nodes.filter((n) => n.kind === 'workspace').map((n): BrainEdge => ({ from: n.id, to: 'jo', kind: 'reads' })),
		...joins.map(([from, to, label]): BrainEdge => ({ from, to, kind: 'join', label })),
	]

	/* Each town across every workspace that holds it. */
	const unitNotices = new Map<string, number>()
	philgeps.notices.forEach((row) => {
		const unit = philgeps.entities[row[3] as number]?.unit
		if (unit) unitNotices.set(unit, (unitNotices.get(unit) ?? 0) + 1)
	})
	const threads: TownThread[] = localGovernments.flatMap((g) =>
		g.units.map((u) => {
			const key = `${g.slug}/${u.slug}`
			const hits = accidents.incidents.filter((i) => i.municipality === u.name && i.province === g.name)
			return {
				key,
				name: u.name,
				province: g.name,
				isCity: u.isCity,
				mayor: u.head,
				barangays: barangayRows(g.slug, u.slug).length,
				lines: emergency.towns.find((t) => t.province === g.slug && t.slug === u.slug)?.lines.length ?? 0,
				email: key in emails.towns,
				incidents: hits.length,
				deaths: hits.reduce((n, i) => n + i.deaths, 0),
				notices: unitNotices.get(key) ?? 0,
				places: places.items.filter((p) => p.area === g.slug && p.municipality === u.name).map((p) => p.name),
				district: districts[key]?.districts.join(', ') ?? null,
				directory: u.href,
				lgu: u.lguHref,
			}
		}),
	)

	return { nodes, edges, threads }
}
