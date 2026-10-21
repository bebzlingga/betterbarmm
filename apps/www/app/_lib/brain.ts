import fs from 'node:fs'
import path from 'node:path'
import { lguProvinces } from '@betterbarmm/lgu-data'
import { discoverBarmmTopics } from '@betterbarmm/primer-data'
import { barangayRows, directoryOffices, fieldOffices, localGovernments, officeHistory } from './directory'
import { budgetHref, hasCharter, officeBySlug, offerings } from './services'
import { lguByKey, lguHasCharter, lguHref, lgus } from './lgu-services'

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

/** A town or an office, followed across the estate: what it is, its facts, every place it appears, and what to light. */
export type Thread = {
	key: string
	kind: 'town' | 'office'
	group: string
	title: string
	kicker: string
	facts: [string, string][]
	links: { where: string; what: string; href: string }[]
	lit: string[]
}

const PROCUREMENT = 'https://procurement.betterbarmm.com'
const ELECTION = 'https://election.betterbarmm.com'
/** The procurement workspace's own address for an entity: its name slugged, the same rule and order it uses. */
const slugify = (name: string) =>
	name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
const squash = (name: string) => name.toUpperCase().replace(/[^A-Z0-9]+/g, ' ').replace(/\bTHE\b/g, ' ').replace(/\s+/g, ' ').trim()
const n = (x: number) => x.toLocaleString('en-PH')
const plural = (x: number, one: string, many = `${one}s`) => `${n(x)} ${x === 1 ? one : many}`

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
	const places = read<{ generatedAt: string; items: { slug: string; name: string; municipality: string; area: string }[] }>('places/places.json')
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
		{ id: 'w-services', label: 'Programs & services', kind: 'workspace', note: 'What each regional office, province, city and town offers the public: who it is for, what to bring, the fee and how long it takes.', href: '/services' },
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
		{ id: 'd-charters', label: 'Regional Citizen’s Charters', kind: 'dataset', count: offerings.length, unit: 'services & programs', note: `The services and programs of the ${new Set(offerings.map((o) => o.office.slug)).size} regional offices that publish a Citizen’s Charter, each with its requirements, fee and time.` },
		{ id: 'd-lgu-charters', label: 'LGU Citizen’s Charters', kind: 'dataset', count: lgus.reduce((k, l) => k + (lguHasCharter(l) ? l.services.length : 0), 0), unit: 'services', note: `The services of the ${lgus.filter(lguHasCharter).length} provinces, cities and towns whose charters are online; the other ${lgus.filter((l) => !lguHasCharter(l)).length} have none.` },
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
		{ id: 's-bcpch', label: 'BCPCH', kind: 'source', note: 'The Bangsamoro Commission for the Preservation of Cultural Heritage: its Pusaka registry of crafts and makers, and heritage site validations.' },
		{ id: 's-mtit', label: 'MTIT', kind: 'source', note: 'The Ministry of Trade, Investments and Tourism: tourism sites, travel fairs and the regional photo competition.' },
		{ id: 's-mfbm', label: 'MFBM', kind: 'source', note: 'The Ministry of Finance, and Budget and Management, which prepares the budget Parliament enacts.' },
		{ id: 's-milg', label: 'MILG', kind: 'source', note: 'The Ministry of the Interior and Local Government: its key officials, field offices and READi.' },
		{ id: 's-pna', label: 'Philippine News Agency', kind: 'source', note: 'The government’s news agency, one of the outlets incidents are read from.' },
		{ id: 's-dot', label: 'Department of Tourism', kind: 'source', note: 'Its own photographs of the region’s destinations, government works.' },
		{ id: 's-museum', label: 'National Museum', kind: 'source', note: 'Archaeological sites and their photographs.' },
		{ id: 's-commons', label: 'Wikimedia Commons', kind: 'source', note: 'Freely licensed photographs, each credited to its author.' },
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
		['s-ministries', ['d-offices', 'd-field', 'd-lines', 'd-charters', 'd-lgu-charters']],
		['s-news', ['d-incidents']],
		['s-bcpch', ['d-crafts', 'd-places']],
		['s-mtit', ['d-places', 'd-field']],
		['s-mfbm', ['d-appropriations']],
		['s-milg', ['d-offices', 'd-field', 'd-officials']],
		['s-pna', ['d-incidents']],
		['s-dot', ['d-places']],
		['s-museum', ['d-places']],
		['s-commons', ['d-places', 'd-crafts']],
		['s-scholars', ['d-primer']],
	]
	const publishes: [string, string[]][] = [
		['d-measures', ['w-legislation']],
		['d-code', ['w-legislation', 'w-lgu']],
		['d-appropriations', ['w-budget', 'w-services']],
		['d-charters', ['w-services', 'w-directory']],
		['d-lgu-charters', ['w-services', 'w-directory']],
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
		['w-services', 'w-directory', 'Office ID'],
		['w-services', 'w-lgu', 'Town code'],
	]
	const edges: BrainEdge[] = [
		...feeds.flatMap(([from, to]) => to.map((t): BrainEdge => ({ from, to: t, kind: 'feeds' }))),
		...publishes.flatMap(([from, to]) => to.map((t): BrainEdge => ({ from, to: t, kind: 'feeds' }))),
		...nodes.filter((n) => n.kind === 'workspace').map((n): BrainEdge => ({ from: n.id, to: 'jo', kind: 'reads' })),
		...joins.map(([from, to, label]): BrainEdge => ({ from, to, kind: 'join', label })),
	]

	/* Each PhilGEPS entity's notices, and its address in the procurement workspace. */
	const used = new Set<string>()
	const entities = (philgeps.entities as { name: string; unit: string | null }[]).map((e, i) => {
		let slug = slugify(e.name)
		while (used.has(slug)) slug += '-2'
		used.add(slug)
		return { i, name: e.name.replace(/\s+/g, ' ').trim(), unit: e.unit, slug, notices: 0 }
	})
	philgeps.notices.forEach((row) => {
		const e = entities[row[3] as number]
		if (e) e.notices += 1
	})
	const procurementLinks = (list: typeof entities) =>
		list
			.filter((e) => e.notices)
			.sort((a, b) => b.notices - a.notices)
			.slice(0, 4)
			.map((e) => ({ where: 'Procurement', what: `${e.name}: ${plural(e.notices, 'bid notice')}`, href: `${PROCUREMENT}/${e.slug}` }))

	/* Each town across every workspace that holds it. */
	const townThreads: Thread[] = localGovernments.flatMap((g) =>
		g.units.map((u) => {
			const key = `${g.slug}/${u.slug}`
			const hits = accidents.incidents.filter((i) => i.municipality === u.name && i.province === g.name)
			const dead = hits.reduce((k, i) => k + i.deaths, 0)
			const lines = emergency.towns.find((t) => t.province === g.slug && t.slug === u.slug)?.lines.length ?? 0
			const email = key in emails.towns
			const own = entities.filter((e) => e.unit === key)
			const notices = own.reduce((k, e) => k + e.notices, 0)
			const here = places.items.filter((p) => p.area === g.slug && p.municipality === u.name)
			const district = districts[key]?.districts.join(', ') ?? null
			const lgu = lguByKey(key)
			const served = lgu && lguHasCharter(lgu) ? lgu.services.length : 0
			const links = [
				{ where: 'Directory', what: `Mayor, ${plural(barangayRows(g.slug, u.slug).length, 'barangay')}${lines ? `, ${plural(lines, 'emergency line')}` : ''}${email ? ', email' : ''}`, href: u.href },
				{ where: 'Local Government', what: 'Officials, finances, audits and history', href: u.lguHref },
				...(lgu ? [{ where: 'Programs & services', what: served ? `${plural(served, 'service')} from its Citizen’s Charter` : 'No Citizen’s Charter online', href: lguHref(lgu) }] : []),
				...(district ? [{ where: 'Election', what: `Votes in its province’s ${district} parliamentary district`, href: `${ELECTION}/results` }] : []),
				...procurementLinks(own),
				...(hits.length ? [{ where: 'Incident Watch', what: `${plural(hits.length, 'incident')} since 2019, ${n(dead)} dead`, href: '/accidents' }] : []),
				...here.map((p) => ({ where: 'Places', what: p.name, href: `/places/${p.slug}` })),
			]
			const lit = ['jo', 'w-directory', 'w-lgu', 'd-lgus', 'd-officials', 'd-lines', 'd-finances', ...(district ? ['w-election', 'd-election'] : []), ...(notices ? ['w-procurement', 'd-notices'] : []), ...(hits.length ? ['w-incidents', 'd-incidents'] : []), ...(here.length ? ['w-places', 'd-places'] : []), ...(served ? ['w-services', 'd-lgu-charters'] : [])]
			return {
				key: `town:${key}`,
				kind: 'town' as const,
				group: g.name,
				title: u.name,
				kicker: `${u.isCity ? 'City' : 'Municipality'} · ${g.name}`,
				facts: [
					['Mayor', u.head ?? '—'],
					['Barangays', n(barangayRows(g.slug, u.slug).length)],
					['Emergency lines', lines ? `${lines}${email ? ' + email' : ''}` : email ? 'Email only' : '—'],
					['District', district ?? '—'],
					['Bid notices', notices ? n(notices) : '—'],
					['Incidents', hits.length ? `${hits.length} · ${dead} dead` : '—'],
				] as [string, string][],
				links,
				lit,
			}
		}),
	)

	/* Each regional office across the Directory, the Budget and Procurement. */
	const KIND_GROUP = { office: 'The Chief Minister’s office', ministry: 'Ministries', attached: 'Attached offices' } as const
	const officeThreads: Thread[] = directoryOffices.map((o) => {
		const field = fieldOffices(o.slug)
		const past = officeHistory(o.slug).length
		const name = squash(o.name)
		const own = entities.filter((e) => squash(e.name).startsWith(name))
		const notices = own.reduce((k, e) => k + e.notices, 0)
		const budgetOf = (o as { budget_of?: string }).budget_of
		const service = officeBySlug(o.slug)
		const charter = service && hasCharter(service)
		const links = [
			{ where: 'Directory', what: `Head, contacts, structure${past ? `, ${plural(past, 'past head')}` : ''}`, href: `/directory/office/${o.slug}` },
			{ where: 'Budget', what: budgetOf ? 'Funded within its parent ministry’s budget' : 'Its appropriations, year by year', href: budgetHref({ slug: budgetOf ?? o.slug }) },
			...(service
				? [{ where: 'Programs & services', what: charter ? `${plural(service.services.length, 'service')} and ${plural(service.programs.length, 'program')}` : 'No Citizen’s Charter; what its budget funds', href: `/services/${service.slug}` }]
				: []),
			...(field.length ? [{ where: 'Directory', what: `${plural(field.length, 'provincial office')}`, href: `/directory/office/${o.slug}` }] : []),
			...procurementLinks(own),
		]
		return {
			key: `office:${o.slug}`,
			kind: 'office' as const,
			group: KIND_GROUP[o.kind as keyof typeof KIND_GROUP] ?? 'Offices',
			title: o.acronym ? `${o.name} (${o.acronym})` : o.name,
			kicker: KIND_GROUP[o.kind as keyof typeof KIND_GROUP] ?? 'Office',
			facts: [
				['Head', o.head ? `${o.head.title} ${o.head.name}` : '—'],
				['As of', o.head?.as_of ? new Date(`${o.head.as_of.slice(0, 7)}-01T00:00:00+08:00`).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) : '—'],
				['Phone', o.phones[0] ?? '—'],
				['Email', o.emails[0] ?? '—'],
				['Provincial offices', field.length ? n(field.length) : '—'],
				['Bid notices', notices ? n(notices) : '—'],
			] as [string, string][],
			links,
			lit: ['jo', 'w-directory', 'd-offices', 'w-budget', 'd-appropriations', ...(field.length ? ['d-field'] : []), ...(notices ? ['w-procurement', 'd-notices'] : []), ...(service ? ['w-services', charter ? 'd-charters' : 'd-appropriations'] : [])],
		}
	})
	const threads = [...townThreads, ...officeThreads]

	return { nodes, edges, threads }
}
