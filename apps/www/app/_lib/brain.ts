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
/** `project`: one of the site's projects rather than a workspace (user decision: the projects shown too); drawn on the workspaces' ring in a colour of its own. */
export type BrainNode = { id: string; label: string; kind: Kind; note: string; count?: number; unit?: string; date?: string | null; href?: string; fresh?: boolean; project?: boolean }
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
	// The First Parliament's own measures (from 24 November 2026), captured apart from the Transition Authority's.
	const first =
		read<{ bills: unknown[] }>('bills/bangsamoro_registry/bills/first_parliament_index.json').bills.length +
		read<{ measures: unknown[] }>('bills/bangsamoro_registry/resolutions/proposed_first_parliament_index.json').measures.length
	const code = read<{ sections: unknown[] }>('bills/blgc.json').sections.length + read<{ articles: unknown[] }>('bills/blgc-irr.json').articles.length
	const journals = read<{ journals: unknown[] }>('bills/bangsamoro_registry/journal/sessions.json').journals.length
	const calendar = read<{ sittings: unknown[] }>('bills/session-calendar.json').sittings.length

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
	const eats = read<{ eats: unknown[] }>('places/eats.json').eats.length
	const shelf = read<{ built: string; books: { availability: string }[] }>('library/books.json')
	const libAuthors = read<{ authors: unknown[] }>('library/authors.json').authors.length
	const libPublishers = read<{ publishers: unknown[] }>('library/publishers.json').publishers.length
	const libMagazines = read<{ magazines: { issues: unknown[] }[] }>('library/magazines.json').magazines
	const crafts = read<{ generatedAt: string; items: unknown[] }>('crafts/crafts.json')
	const anniversaries = read<{ generatedAt: string; areas: unknown[]; units: { date: string | null }[] }>('travel/anniversaries.json')
	const exposure = read<{ generatedAt: string; barangays: unknown[] }>('preparedness/exposure.json')
	const facilitiesFile = read<{ generatedAt: string; facilities: unknown[] }>('preparedness/facilities.json')
	const accidents = read<{ generatedAt: string; incidents: { province: string; municipality: string | null; deaths: number }[] }>('accidents/accidents.json')
	const audits = read<{ generatedAt: string; reports: unknown[] }>('coa/audit-reports.json')
	const ordinanceFile = read<{ generatedAt: string; ordinances: { summary?: string }[] }>('ordinances/ordinances.json')
	const finances = read<Record<string, unknown>>('lgu/finances.json')
	const districts = read<{ towns: Record<string, { districts: string[] }> }>('election/district-towns.json').towns
	const healthFile = read<{ counts: { source: { asOf: string }; towns: unknown[] } }>('health/facilities.json')
	const planFile = read<{ indicators: unknown[] }>('development-plan/scorecard.json')
	const schoolsFile = read<{ years: string[]; source: { retrieved: string }; schools: { source: string; pupils: number | null }[] }>('education/schools.json')
	const ministry = read<{ retrieved: string; figures: unknown[] }>('education/mbhte-figures.json')
	const learners = schoolsFile.schools.reduce((k, x) => k + (x.pupils ?? 0), 0)
	const sy = (schoolsFile.years.at(-1) ?? '').replace('-', '–')

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
		{ id: 'w-directory', label: 'Directory', kind: 'workspace', note: 'Who heads each regional office, how to reach it, who led it before, every town’s emergency lines, and the first few services each office and town offers, each a link to it.', href: '/directory' },
		{ id: 'w-incidents', project: true, label: 'Incident Watch', kind: 'workspace', note: 'Road crashes, shootings, drownings, fires and floods reported in the region, on a map.', href: '/incidents' },
		{ id: 'w-preparedness', project: true, label: 'Preparedness', kind: 'workspace', note: 'Flood, landslide and storm surge hazard for every barangay, from Project NOAH, and the evacuation sites, hospitals and offices nearest each one.', href: '/preparedness' },
		{ id: 'w-places', label: 'Travel & Places', kind: 'workspace', note: 'Islands, lakes, mosques, falls and heritage sites: what is there, how to get there, where to stay.', href: 'https://travel.betterbarmm.com' },
		{ id: 'w-education', label: 'Education', kind: 'workspace', note: `Every school in the region on a map and town by town, with its learners each school year; how learners do against the plan; the scholarships on offer; and the education ministry’s own figures.`, href: 'https://education.betterbarmm.com' },
		{ id: 'w-health', label: 'Health', kind: 'workspace', note: 'The health ministry’s budget and the hospitals it funds; every town’s facilities beside its people and barangays; the mapped facilities; mothers’ and children’s health against the plan; and the programs and services on offer.', href: 'https://health.betterbarmm.com' },
		{ id: 'w-library', label: 'Library', kind: 'workspace', note: 'Books about the Bangsamoro and its peoples, who wrote and published them, where each can be bought, borrowed or read free, and the magazines of the region’s own offices.', href: 'https://library.betterbarmm.com' },
		{ id: 'w-crafts', project: true, label: 'Crafts', kind: 'workspace', note: 'The weaves, mats, brass and gongs of the region, who makes them and where to see them.', href: '/crafts' },
		{ id: 'w-services', label: 'Programs & services', kind: 'workspace', note: 'What each regional office, province, city and town offers the public: who it is for, what to bring, the fee and how long it takes, with each place’s head, numbers and email beside it.', href: '/services' },
		{ id: 'w-discover', label: 'Discover', kind: 'workspace', note: 'How the Bangsamoro came to be, how its government works, and the explainers.', href: '/discover' },
		{ id: 'p-plan', project: true, label: 'Plan scorecard', kind: 'workspace', note: 'The regional development plan’s targets beside the latest published figures, area by area.', href: '/development-plan' },
		{ id: 'p-data', project: true, label: 'Open data', kind: 'workspace', note: 'The records behind every workspace as tables anyone can download, CSV and JSON, each with its source.', href: '/data' },

		{ id: 'd-measures', label: 'Acts, bills & resolutions', kind: 'dataset', count: acts + bills + adopted + proposed + first, unit: 'measures', note: `${acts} acts, ${bills} bills, ${adopted} adopted and ${proposed} proposed resolutions of the Transition Authority, and ${first} of the First Parliament's own, with authors and status.` },
		{ id: 'd-sittings', label: 'Sittings & attendance', kind: 'dataset', count: journals + calendar, unit: 'sittings', note: `${journals} published plenary journals, with who was absent or on leave at each roll call, and the First Parliament’s calendar of ${calendar} sittings for its first regular session.` },
		{ id: 'd-code', label: 'Local Governance Code', kind: 'dataset', count: code, unit: 'rules', note: 'The 2023 Bangsamoro Local Governance Code section by section, and its 2025 implementing rules article by article.' },
		{ id: 'd-appropriations', label: 'Appropriations acts', kind: 'dataset', count: appropriations, unit: 'budget years', note: 'Each year’s General Appropriations Act from FY 2020, transcribed line by line.' },
		{ id: 'd-election', label: '2026 election results', kind: 'dataset', count: seats, unit: 'seats', date: dated(election), note: 'The proclaimed result: party totals, the party-list count, all 32 district races and the reserved seats.' },
		{ id: 'd-lgus', label: 'Provinces, towns & barangays', kind: 'dataset', count: barangays, unit: 'barangays', note: `${lguProvinces.length} provinces and areas, ${towns} towns and cities, each on its standard place code.` },
		{ id: 'd-officials', label: 'Elected local officials', kind: 'dataset', count: towns, unit: 'towns', note: 'Governors, mayors, councils and punong barangays, from the COMELEC canvass and the DILG directory.' },
		{ id: 'd-finances', label: 'LGU finances & NTA', kind: 'dataset', count: Object.keys((finances.units as Record<string, unknown>) ?? {}).length || undefined, unit: 'LGUs', date: dated(finances), note: 'What each town and province collects and spends, its national tax allotment and its income class.' },
		{ id: 'd-ordinances', label: 'Ordinances from other LGUs', kind: 'dataset', count: ordinanceFile.ordinances.filter((o) => o.summary).length, unit: 'ordinances', date: ordinanceFile.generatedAt, note: 'Ordinances enacted by provinces, cities and municipalities outside BARMM, in full and by category, as references for the region’s councils.' },
		{ id: 'd-audits', label: 'COA audit reports', kind: 'dataset', count: audits.reports.length, unit: 'reports', date: audits.generatedAt, note: 'The Commission on Audit’s annual reports on the region’s offices and local governments.' },
		{ id: 'd-notices', label: 'PhilGEPS bid notices', kind: 'dataset', count: philgeps.notices.length, unit: 'notices', date: philgeps.generatedAt, note: `Every notice a BARMM office posted since 2019, and ${awards.toLocaleString('en-PH')} contracts awarded on them.` },
		{ id: 'd-blacklist', label: 'Blacklisted suppliers', kind: 'dataset', count: blacklist.entities.length, unit: 'suppliers', date: blacklist.generatedAt, note: 'The national blacklist, matched to the region’s suppliers.' },
		{ id: 'd-offices', label: 'Regional offices & heads', kind: 'dataset', count: offices.offices.length, unit: 'offices', date: offices.generatedAt, note: 'Each ministry and office: its head as of the newest dated record, its numbers, emails, address, past heads and structure.' },
		{ id: 'd-field', label: 'Provincial offices', kind: 'dataset', count: field.offices.length, unit: 'offices', date: field.generatedAt, note: 'The ministries’ offices in the provinces, with their heads and contacts where published.' },
		{ id: 'd-lines', label: 'Emergency lines & emails', kind: 'dataset', count: emergency.towns.length, unit: 'towns', date: emails.generatedAt, note: 'Each town’s police, fire, health and town hall numbers, and its official email.' },
		{ id: 'd-places', label: 'Places, stays & food', kind: 'dataset', count: places.items.length + stays + eats, unit: 'places', date: places.generatedAt, note: `${places.items.length} places, ${stays} places to stay and ${eats} halal places to eat, each traced to its sources.` },
		{ id: 'd-books', label: 'Books, authors & publishers', kind: 'dataset', count: shelf.books.length, unit: 'books', date: shelf.built, note: `${shelf.books.length} books, ${shelf.books.filter((b) => b.availability === 'open-access').length} of them free to read, by ${libAuthors} authors from ${libPublishers} publishers, each with an overview from its sources.` },
		{ id: 'd-magazines', label: 'Office magazines', kind: 'dataset', count: libMagazines.reduce((n, m) => n + m.issues.length, 0), unit: 'issues', note: `${libMagazines.length} magazines, newsletters and journals of the region’s ministries and offices, each issue linked on the office’s own site.` },
		{ id: 'd-crafts', label: 'Crafts', kind: 'dataset', count: crafts.items.length, unit: 'crafts', date: crafts.generatedAt, note: 'Textiles, mats, brass, wood and gongs, with their makers and where to see them.' },
		{ id: 'd-anniversaries', label: 'Founding anniversaries', kind: 'dataset', count: anniversaries.areas.length + anniversaries.units.filter((u) => u.date).length, unit: 'provinces, cities and towns', date: anniversaries.generatedAt, note: 'The day each province, city and municipality legally began, from the law, charter or plebiscite that created it, on the travel calendar.' },
		{ id: 'd-incidents', label: 'Incident reports', kind: 'dataset', count: accidents.incidents.length, unit: 'incidents', date: accidents.generatedAt, note: 'One record per incident since 2019, every report linked, placed on its barangay where named.' },
		{ id: 'd-hazards', label: 'Hazard exposure', kind: 'dataset', count: exposure.barangays.length, unit: 'barangays', date: exposure.generatedAt, note: 'Each barangay’s land in each of NOAH’s flood, landslide and storm surge hazard classes, with its 2020 population.' },
		{ id: 'd-facilities', label: 'Emergency facilities', kind: 'dataset', count: facilitiesFile.facilities.length, unit: 'facilities', date: facilitiesFile.generatedAt, note: 'Evacuation sites, schools, hospitals, health centres, police, fire and disaster risk reduction offices, each placed in its barangay.' },
		{ id: 'd-schools', label: 'Schools & learners', kind: 'dataset', count: schoolsFile.schools.length, unit: 'schools', date: schoolsFile.source.retrieved, note: `Every school on DepEd’s list for school year ${sy}, public and private, with its learners in each year from 2023–24 (${n(learners)} in ${sy}) and, for a public school, its teachers and classrooms in 2023–24, placed in its town; the madaris and colleges OpenStreetMap and Wikipedia add.` },
		{ id: 'd-ministry', label: 'Education ministry figures', kind: 'dataset', count: ministry.figures.length, unit: 'figures', date: ministry.retrieved, note: 'MBHTE publishes no dataset, so its figures as it and the Parliament stated them (enrolment, scholars, teachers, classrooms), each with who said it and where.' },
		{ id: 'd-health', label: 'Health facilities', kind: 'dataset', count: healthFile.counts.towns.length, unit: 'towns', date: healthFile.counts.source.asOf, note: 'The Department of Health’s count of barangay health stations, health units, birthing homes, hospitals and infirmaries in each town, government and private.' },
		{ id: 'd-plan', label: 'Development plan scorecard', kind: 'dataset', count: planFile.indicators.length, unit: 'indicators', note: 'The 2nd Bangsamoro Development Plan’s targets, each beside the latest published figure.' },
		{ id: 'd-charters', label: 'Regional Citizen’s Charters', kind: 'dataset', count: offerings.length, unit: 'services & programs', note: `The services and programs of the ${new Set(offerings.map((o) => o.office.slug)).size} regional offices that publish a Citizen’s Charter, each with its requirements, fee and time.` },
		{ id: 'd-lgu-charters', label: 'LGU Citizen’s Charters', kind: 'dataset', count: lgus.reduce((k, l) => k + (lguHasCharter(l) ? l.services.length : 0), 0), unit: 'services', note: `The services of the ${lgus.filter(lguHasCharter).length} provinces, cities and towns whose charters are online; the other ${lgus.filter((l) => !lguHasCharter(l)).length} have none.` },
		{ id: 'd-primer', label: 'History primer', kind: 'dataset', count: discoverBarmmTopics.length, unit: 'chapters', note: 'The region’s story from the sultanates to the transition, with dated timelines.' },

		{ id: 's-parliament', label: 'Bangsamoro Parliament', kind: 'source', note: 'Bills, resolutions, enacted acts and member profiles.' },
		{ id: 's-comelec', label: 'COMELEC', kind: 'source', note: 'Election canvasses and proclamations.' },
		{ id: 's-dilg', label: 'DILG', kind: 'source', note: 'Directories of local officials and barangays.' },
		{ id: 's-psa', label: 'PSA', kind: 'source', note: 'The standard code for every province, town and barangay.' },
		{ id: 's-dbm', label: 'DBM', kind: 'source', note: 'National tax allotments and local budget data.' },
		{ id: 's-lgu-sites', label: 'LGU websites', kind: 'source', note: 'Ordinances that other LGUs publish on their own sites, and the Internet Archive’s copies of those taken down.' },
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
		{ id: 's-dxms', label: 'DXMS Radyo Bida', kind: 'source', note: 'NDBC’s station in Cotabato City, whose Facebook page reports the region’s shootings, fires and crashes as they happen; read into the news and the incident reports.' },
		{ id: 's-dot', label: 'Department of Tourism', kind: 'source', note: 'Its own photographs of the region’s destinations, government works.' },
		{ id: 's-museum', label: 'National Museum', kind: 'source', note: 'Archaeological sites and their photographs.' },
		{ id: 's-noah', label: 'Project NOAH', kind: 'source', note: 'The University of the Philippines’ flood, landslide and storm surge hazard maps, open under the ODbL.' },
		{ id: 's-osm', label: 'OpenStreetMap', kind: 'source', note: 'Volunteer-mapped facilities, used where the official registers are not open.' },
		{ id: 's-commons', label: 'Wikimedia Commons', kind: 'source', note: 'Freely licensed photographs, each credited to its author.' },
		{ id: 's-openlibrary', label: 'Open Library', kind: 'source', note: 'The Internet Archive’s open catalogue: book records, covers and publishers’ descriptions.' },
		{ id: 's-publishers', label: 'Publishers & institutes', kind: 'source', note: 'University presses, research institutes and NGOs: their catalogues, and the free PDFs many of them publish.' },
		{ id: 's-deped', label: 'Department of Education', kind: 'source', note: 'Project Bukas: school-level enrolment for every school year, and the school facilities and staff files; its 2019 masterlist, cleaned by OpenStreetMap Philippines, for where each school stands.' },
		{ id: 's-mbhte', label: 'MBHTE', kind: 'source', note: 'The Ministry of Basic, Higher and Technical Education: its releases on its official Facebook page, and the scholarships it runs.' },
		{ id: 's-doh', label: 'Department of Health', kind: 'source', note: 'The National Health Facility Registry: how many facilities of each type every town has.' },
		{ id: 's-bpda', label: 'BPDA', kind: 'source', note: 'The Bangsamoro Planning and Development Authority: the development plan, its midterm update and the yearly development reports.' },
		{ id: 's-scholars', label: 'Histories & laws', kind: 'source', note: 'The Organic Law, peace agreements and published histories behind the primer.' },
	]

	// Read this week, as of the build: the map is rebuilt with the site.
	const week = Date.now() - 7 * 86_400_000
	for (const n of nodes) if (n.date && new Date(n.date).getTime() >= week) n.fresh = true

	const feeds: [string, string[]][] = [
		['s-parliament', ['d-measures', 'd-code', 'd-appropriations', 'd-sittings']],
		['s-comelec', ['d-election', 'd-officials']],
		['s-dilg', ['d-officials', 'd-lgus']],
		['s-psa', ['d-lgus', 'd-hazards']],
		['s-noah', ['d-hazards']],
		['s-osm', ['d-facilities']],
		['s-dbm', ['d-finances']],
		['s-coa', ['d-audits', 'd-finances']],
		['s-lgu-sites', ['d-ordinances']],
		['s-philgeps', ['d-notices', 'd-field']],
		['s-gppb', ['d-blacklist']],
		['s-dti', ['d-lines', 'd-finances']],
		['s-bio', ['d-offices', 'd-field', 'd-places', 'd-crafts']],
		['s-ministries', ['d-offices', 'd-field', 'd-lines', 'd-charters', 'd-lgu-charters', 'd-magazines']],
		['s-news', ['d-incidents']],
		['s-bcpch', ['d-crafts', 'd-places']],
		['s-mtit', ['d-places', 'd-field']],
		['s-mfbm', ['d-appropriations']],
		['s-milg', ['d-offices', 'd-field', 'd-officials']],
		['s-pna', ['d-incidents']],
		['s-dxms', ['d-incidents']],
		['s-dot', ['d-places']],
		['s-museum', ['d-places']],
		['s-commons', ['d-places', 'd-crafts', 'd-books']],
		['s-openlibrary', ['d-books']],
		['s-publishers', ['d-books']],
		['s-scholars', ['d-primer', 'd-anniversaries']],
		['s-deped', ['d-schools']],
		['s-mbhte', ['d-ministry', 'd-charters']],
		['s-osm', ['d-schools']],
		['s-bio', ['d-ministry']],
		['s-parliament', ['d-ministry']],
		['s-news', ['d-ministry']],
		['s-doh', ['d-health']],
		['s-bpda', ['d-plan']],
	]
	const publishes: [string, string[]][] = [
		['d-measures', ['w-legislation']],
		['d-sittings', ['w-legislation']],
		['d-code', ['w-legislation', 'w-lgu']],
		['d-appropriations', ['w-budget', 'w-services', 'w-health']],
		['d-charters', ['w-services', 'w-directory', 'w-health']],
		['d-lgu-charters', ['w-services', 'w-directory']],
		['d-election', ['w-election']],
		['d-lgus', ['w-lgu', 'w-directory']],
		['d-officials', ['w-lgu', 'w-directory', 'w-services']],
		['d-finances', ['w-lgu']],
		['d-audits', ['w-lgu', 'w-budget']],
		['d-ordinances', ['w-lgu']],
		['d-notices', ['w-procurement', 'w-health']],
		['d-blacklist', ['w-procurement']],
		['d-offices', ['w-directory']],
		['d-field', ['w-directory']],
		['d-lines', ['w-directory', 'w-services']],
		['d-places', ['w-places']],
		['d-crafts', ['w-crafts']],
		['d-anniversaries', ['w-places']],
		['d-books', ['w-library']],
		['d-magazines', ['w-library']],
		['d-incidents', ['w-incidents']],
		['d-hazards', ['w-preparedness']],
		['d-facilities', ['w-preparedness', 'w-health']],
		['d-health', ['w-health']],
		['d-plan', ['w-health', 'p-plan']],
		['d-primer', ['w-discover']],
		// Open data publishes these as tables (scripts/build-open-data.mjs).
		...(['d-measures', 'd-sittings', 'd-election', 'd-appropriations', 'd-lgus', 'd-officials', 'd-notices', 'd-offices', 'd-charters', 'd-incidents', 'd-hazards', 'd-audits', 'd-crafts'] as const).map((d): [string, string[]] => [d, ['p-data']]),
		['d-schools', ['w-education']],
		['d-ministry', ['w-education']],
		['d-charters', ['w-education']],
	]
	const joins: [string, string, string][] = [
		['w-lgu', 'w-election', 'Town code'],
		['w-lgu', 'w-directory', 'Town code'],
		['w-lgu', 'w-procurement', 'Town code'],
		['w-lgu', 'w-incidents', 'Town code'],
		['w-lgu', 'w-places', 'Town'],
		['w-lgu', 'w-preparedness', 'Barangay code'],
		['w-directory', 'w-budget', 'Office ID'],
		['w-directory', 'w-procurement', 'Office'],
		['w-budget', 'w-legislation', 'Act number'],
		['w-services', 'w-directory', 'Office ID · town code'],
		['w-services', 'w-lgu', 'Town code'],
		['w-education', 'w-lgu', 'Town'],
		['w-education', 'w-budget', 'Office ID'],
		['w-health', 'w-lgu', 'Town code'],
		['w-health', 'w-budget', 'Office ID'],
		['w-health', 'w-procurement', 'Office'],
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
				{ where: 'Directory', what: `Mayor, ${plural(barangayRows(g.slug, u.slug).length, 'barangay')}${lines ? `, ${plural(lines, 'emergency line')}` : ''}${email ? ', email' : ''}${served ? ', its first services' : ''}`, href: u.href },
				{ where: 'Local Government', what: 'Officials, finances, audits and history', href: u.lguHref },
				...(lgu ? [{ where: 'Programs & services', what: served ? `${plural(served, 'service')} from its Citizen’s Charter, with its mayor, numbers and email` : 'No Citizen’s Charter online; its mayor, numbers and email', href: lguHref(lgu) }] : []),
				...(district ? [{ where: 'Election', what: `Votes in its province’s ${district} parliamentary district`, href: `${ELECTION}/results` }] : []),
				...procurementLinks(own),
				...(hits.length ? [{ where: 'Incident Watch', what: `${plural(hits.length, 'incident')} since 2019, ${n(dead)} dead`, href: '/incidents' }] : []),
				...here.map((p) => ({ where: 'Travel & Places', what: p.name, href: `https://travel.betterbarmm.com/places/${p.slug}` })),
			]
			const lit = ['jo', 'w-directory', 'w-lgu', 'd-lgus', 'd-officials', 'd-lines', 'd-finances', ...(district ? ['w-election', 'd-election'] : []), ...(notices ? ['w-procurement', 'd-notices'] : []), ...(hits.length ? ['w-incidents', 'd-incidents'] : []), ...(here.length ? ['w-places', 'd-places'] : []), ...(lgu ? ['w-services', ...(served ? ['d-lgu-charters'] : [])] : [])]
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
	const KIND_GROUP = { office: 'The Chief Minister’s office', ministry: 'Ministries', attached: 'Attached offices', unit: 'The Chief Minister’s office' } as const
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
			{ where: 'Directory', what: `Head, contacts, structure${past ? `, ${plural(past, 'past head')}` : ''}${charter && service.services.length ? ', its first services' : ''}`, href: `/directory/office/${o.slug}` },
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
