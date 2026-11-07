/* ============================================================
   The rest of the estate, for Jo

   Every dataset a workspace publishes that the other builders do
   not already read: COA's audit reports, the development plan's
   scorecard, schools, health facilities, the news, scholarships
   and jobs, preparedness, procurement and DPWH's projects.

   A dataset of a few dozen things is one row a thing. A dataset
   of thousands is one row a town or an agency, carrying the
   counts a question asks for, plus — where a single item is worth
   asking about by name (a school, a DPWH project, a blacklisted
   contractor) — a row a thing that waits until a question uses
   its own words. PhilGEPS's hundred thousand notices are only
   ever counted, never listed.
   ============================================================ */

import auditFile from '../../../datasets/coa/audit-reports.json'
import planFile from '../../../datasets/development-plan/scorecard.json'
import schoolsFile from '../../../datasets/education/schools.json'
import historiesFile from '../../../datasets/education/school-histories.json'
import healthFile from '../../../datasets/health/facilities.json'
import week1 from '../../../datasets/news/weeks/2026-10-12.json'
import week2 from '../../../datasets/news/weeks/2026-10-19.json'
import week3 from '../../../datasets/news/weeks/2026-10-26.json'
import week4 from '../../../datasets/news/weeks/2026-11-02.json'
import scholarshipsFile from '../../../datasets/opportunities/scholarships.json'
import jobsFile from '../../../datasets/opportunities/jobs.json'
import facilitiesFile from '../../../datasets/preparedness/facilities.json'
import exposureFile from '../../../datasets/preparedness/exposure.json'
import philgepsFile from '../../../datasets/procurement/philgeps.json'
import blacklistFile from '../../../datasets/procurement/gppb-blacklist.json'
import dpwhFile from '../../../datasets/public-works/dpwh.json'
import type { Entry } from './corpus'

const WWW = 'https://betterbarmm.com'
const joined = (parts: (string | number | null | undefined | false)[]) => parts.filter((p) => p !== null && p !== undefined && p !== false && p !== '').join(' ')
const peso = (n: number) => `₱${Math.round(n).toLocaleString('en-US')}`
const AREA: Record<string, string> = {
	basilan: 'Basilan',
	'lanao-del-sur': 'Lanao del Sur',
	'maguindanao-del-norte': 'Maguindanao del Norte',
	'maguindanao-del-sur': 'Maguindanao del Sur',
	'tawi-tawi': 'Tawi-Tawi',
	'cotabato-city': 'Cotabato City',
	'special-geographic-area': 'Special Geographic Area',
}
const area = (slug: string) => AREA[slug] ?? slug
/** "3 rural health unit, 1 hospital" — a tally, most first. */
const tally = (counts: Map<string, number>) =>
	[...counts].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} ${k.toLowerCase()}`).join(', ')
const count = <T,>(list: T[], key: (item: T) => string) => {
	const n = new Map<string, number>()
	for (const item of list) n.set(key(item), (n.get(key(item)) ?? 0) + 1)
	return n
}
const groupBy = <T,>(list: T[], key: (item: T) => string) => {
	const g = new Map<string, T[]>()
	for (const item of list) g.set(key(item), [...(g.get(key(item)) ?? []), item])
	return g
}

/* ---- COA's annual audit reports ---- */
type Audit = { entity: string; area: string; year: number; opinion: string; observations: number; recommendations: number; priorRecommendations?: { total: number; implemented: number; partial: number; notImplemented: number }; findings: { text: string }[]; document: string }
function audits(): Entry[] {
	return (auditFile as unknown as { reports: Audit[] }).reports.map((r) => {
		const prior = r.priorRecommendations
		return {
			space: 'audit',
			kind: 'Audit report',
			title: `${r.entity}, ${r.year} audit`,
			note: joined([
				`COA's ${r.year} annual audit gave ${r.entity} (${area(r.area)}) a ${r.opinion} opinion, with ${r.observations} observations and ${r.recommendations} recommendations.`,
				prior?.total ? `Of ${prior.total} earlier recommendations, ${prior.implemented} were implemented, ${prior.partial} partly and ${prior.notImplemented} not.` : '',
				r.findings.length ? `Findings: ${r.findings.slice(0, 3).map((f) => f.text).join(' ')}` : '',
			]),
			href: r.document,
			text: joined([r.entity, area(r.area), r.year, r.opinion, ...r.findings.map((f) => f.text)]).toLowerCase(),
		}
	})
}

/* ---- The development plan's scorecard ---- */
type Point = { value?: number; low?: number; high?: number; text?: string; year?: number }
type Indicator = { area: string; name: string; unit: string; baseline?: Point; target?: Point; latest?: Point; explain?: string; note?: string }
const said = (p: Point | undefined, unit: string) => {
	if (!p) return ''
	const v = p.text ?? (p.value !== undefined ? `${p.value}${unit === '%' ? '%' : ` ${unit}`}` : p.low !== undefined ? `${p.low}–${p.high}${unit === '%' ? '%' : ` ${unit}`}` : '')
	return v ? `${v}${p.year ? ` (${p.year})` : ''}` : ''
}
function plan(): Entry[] {
	const file = planFile as unknown as { plan: { title: string; period: string }; indicators: Indicator[] }
	return file.indicators.map((i) => ({
		space: 'plan',
		kind: 'Plan indicator',
		title: i.name,
		note: joined([
			`A target of the ${file.plan.title}, under ${i.area}.`,
			said(i.baseline, i.unit) ? `Baseline ${said(i.baseline, i.unit)}.` : '',
			said(i.target, i.unit) ? `Target ${said(i.target, i.unit)}.` : '',
			said(i.latest, i.unit) ? `Latest ${said(i.latest, i.unit)}.` : 'No reading since the baseline.',
		]),
		href: `${WWW}/development-plan`,
		text: joined([i.name, i.area, i.explain, 'development plan bdp target goal']).toLowerCase(),
	}))
}

/* ---- Schools ---- */
type School = { id: string; name: string; level: string; management: string; area: string; town: string; townName: string; district?: string; founded?: number; pupils2015?: number }
function schools(): Entry[] {
	const all = (schoolsFile as unknown as { schools: School[] }).schools
	const histories = new Map((historiesFile as unknown as { schools: { id: string; history: string[] }[] }).schools.map((s) => [s.id, s.history[0]]))
	const rows: Entry[] = all.map((s) => ({
		space: 'education',
		kind: 'School',
		title: `${s.name}, ${s.townName}`,
		note: joined([
			`${s.management} ${s.level.toLowerCase()} school in ${s.townName}, ${area(s.area)}.`,
			s.founded ? `Founded ${s.founded}.` : '',
			s.pupils2015 ? `${s.pupils2015} pupils in 2015.` : '',
			histories.get(s.id),
		]),
		href: `https://education.betterbarmm.com`,
		text: joined([s.name, s.townName, area(s.area), s.level, s.management, s.district]).toLowerCase(),
	}))
	for (const [key, list] of groupBy(all, (s) => `${s.townName}|${s.area}`)) {
		const [town, slug] = key.split('|')
		rows.push({
			space: 'education',
			kind: 'Schools count',
			title: `Schools in ${town}, ${area(slug!)}`,
			note: `${list.length} schools: ${tally(count(list, (s) => `${s.management} ${s.level}`))}. From DepEd's masterlist and OpenStreetMap, so not every school may be here.`,
			href: `https://education.betterbarmm.com`,
			text: joined([town, area(slug!), 'schools']).toLowerCase(),

			rollup: true,
		})
	}
	for (const [slug, list] of groupBy(all, (s) => s.area)) {
		rows.push({
			space: 'education',
			kind: 'Schools count',
			title: `Schools in ${area(slug)}`,
			note: `${list.length} schools: ${tally(count(list, (s) => `${s.management} ${s.level}`))}.`,
			href: `https://education.betterbarmm.com`,
			text: joined([area(slug), 'schools province']).toLowerCase(),
			rollup: true,
		})
	}
	return rows
}

/* ---- Health facilities ---- */
type HealthTown = { area: string; townName: string; government: Record<string, number>; private: Record<string, number> }
function health(): Entry[] {
	const file = healthFile as unknown as { counts: { source: { asOf: string }; towns: HealthTown[] }; hospitals: { list: { name: string; area: string; townName: string; operator: string | null }[] } }
	const asOf = file.counts.source.asOf.slice(0, 4)
	const list = (r: Record<string, number>) => Object.entries(r).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} ${k}`).join(', ')
	return [
		...file.counts.towns.map((t) => ({
			space: 'health' as const,
			kind: 'Health facilities',
			title: `Health facilities in ${t.townName}, ${area(t.area)}`,
			note: joined([
				`${[...Object.values(t.government), ...Object.values(t.private)].reduce((n, v) => n + v, 0)} facilities registered in all.`,
				Object.keys(t.government).length ? `Government: ${list(t.government)}.` : 'No government facility registered.',
				Object.keys(t.private).length ? `Private: ${list(t.private)}.` : '',
				`DOH's National Health Facility Registry, ${asOf}.`,
			]),
			href: `https://health.betterbarmm.com`,
			text: joined([t.townName, area(t.area), ...Object.keys(t.government), ...Object.keys(t.private)]).toLowerCase(),
	
			rollup: true,
		})),
		...file.hospitals.list.map((h) => ({
			space: 'health' as const,
			kind: 'Hospital',
			title: h.name,
			note: joined([`A hospital in ${h.townName}, ${area(h.area)}.`, h.operator ? `Run by ${h.operator}.` : '', 'Mapped on OpenStreetMap; the list is not complete.']),
			href: `https://health.betterbarmm.com`,
			text: joined([h.name, h.townName, area(h.area), 'hospital']).toLowerCase(),
		})),
	]
}

/* ---- The news ---- */
type Story = { url: string; title: string; source: string; summary: string; published_at: string }
function news(): Entry[] {
	const seen = new Set<string>()
	const rows: Entry[] = []
	for (const week of [week4, week3, week2, week1] as unknown as { items: Story[] }[]) {
		for (const s of week.items) {
			if (seen.has(s.url)) continue
			seen.add(s.url)
			rows.push({
				space: 'news',
				kind: 'News',
				title: s.title,
				note: joined([`${s.source}, ${s.published_at.slice(0, 10)}.`, s.summary]),
				href: s.url,
				text: joined([s.title, s.summary, s.source]).toLowerCase(),
			})
		}
	}
	// "What is the latest news" is answered by the newest headlines, not whichever stories share its words.
	const dated = rows.map((r) => ({ r, at: r.note.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? '' })).sort((a, b) => b.at.localeCompare(a.at))
	rows.push({
		space: 'news',
		kind: 'Latest news',
		title: 'The latest news about the Bangsamoro',
		note: dated.slice(0, 10).map(({ r, at }) => `${r.title} (${at})`).join('; ') + '.',
		href: `${WWW}/news`,
		text: 'latest news headlines this week recent today',
		rollup: true,
	})
	return rows
}

/* ---- Scholarships and jobs ---- */
type Scholarship = { name: string; kind: string; office: string; summary: string; for: string[]; website?: string; source: string; status?: { open?: boolean; text?: string } }
type Job = { title: string; office: string; assignment: string; salaryGrade: string; monthlySalary: number; term: string; eligibility: string; education: string; experience: string; posted: string }
function opportunities(): Entry[] {
	const jobs = jobsFile as unknown as { generatedAt: string; offices: { name: string; open: number }[]; jobs: Job[] }
	return [
		...(scholarshipsFile as unknown as { programs: Scholarship[] }).programs.map((p) => ({
			space: 'opportunities' as const,
			kind: 'Scholarship',
			title: p.name,
			note: joined([`${p.summary}`, `From the ${p.office}.`, p.status?.text]),
			href: `${WWW}/opportunities`,
			text: joined([p.name, p.kind, p.office, p.summary, ...p.for.map((f) => f.replace(/-/g, ' '))]).toLowerCase(),
		})),
		...jobs.jobs.map((j) => ({
			space: 'opportunities' as const,
			kind: 'Job',
			title: `${j.title}, ${j.office}`,
			note: joined([
				`${j.term} post at ${j.assignment}.`,
				`${j.salaryGrade}, ${peso(j.monthlySalary)} a month.`,
				`Needs: ${j.education}; ${j.experience}; ${j.eligibility}.`,
				`Posted ${j.posted}.`,
			]),
			href: `${WWW}/opportunities`,
			text: joined([j.title, j.office, j.assignment, 'job vacancy hiring']).toLowerCase(),
		})),
		{
			space: 'opportunities',
			kind: 'Jobs count',
			title: 'Government job openings in BARMM',
			note: `${jobs.offices.reduce((n, o) => n + o.open, 0)} open posts as of ${jobs.generatedAt.slice(0, 10)}: ${jobs.offices.filter((o) => o.open).sort((a, b) => b.open - a.open).map((o) => `${o.open} at the ${o.name}`).join(', ')}.`,
			href: `${WWW}/opportunities`,
			text: 'jobs job openings vacancies hiring government work employment',
			rollup: true,
		},
	]
}

/* ---- Preparedness: facilities and hazard exposure, a row a town ---- */
type Facility = { kind: string; name: string; barangay: string; town: string; prov: string }
type Exposure = { name: string; town: string; prov: string; area: number; flood: number[]; landslide: number[]; surge: number[] }
const FACILITY: Record<string, string> = { drrm: 'disaster office', evacuation: 'evacuation center', fire: 'fire station', health: 'health facility', hospital: 'hospital', police: 'police station', school: 'school' }
function preparedness(): Entry[] {
	const facilities = (facilitiesFile as unknown as { facilities: Facility[] }).facilities
	const exposure = (exposureFile as unknown as { barangays: Exposure[] }).barangays
	const rows: Entry[] = []
	for (const [key, list] of groupBy(facilities, (f) => `${f.town}|${f.prov}`)) {
		const [town, prov] = key.split('|')
		const centers = list.filter((f) => f.kind === 'evacuation').map((f) => `${f.name} (${f.barangay})`)
		rows.push({
			space: 'preparedness',
			kind: 'Emergency facilities',
			title: `Emergency facilities in ${town}, ${area(prov!)}`,
			note: joined([
				`${tally(count(list, (f) => FACILITY[f.kind] ?? f.kind))}.`,
				centers.length ? `Evacuation centers: ${centers.slice(0, 8).join('; ')}${centers.length > 8 ? ', and more' : ''}.` : 'No evacuation center is mapped here.',
				'Mapped on OpenStreetMap, so not every facility is here.',
			]),
			href: `${WWW}/preparedness`,
			text: joined([town, area(prov!), 'evacuation center centers emergency facilities disaster']).toLowerCase(),

			rollup: true,
		})
	}
	// Barangays with any high-hazard area, per town: the shape of the risk, not each square kilometre.
	const high = (b: Exposure, h: 'flood' | 'landslide' | 'surge') => (b[h]?.[2] ?? 0) > 0
	for (const [key, list] of groupBy(exposure, (b) => `${b.town}|${b.prov}`)) {
		const [town, prov] = key.split('|')
		const names = (h: 'flood' | 'landslide' | 'surge') => list.filter((b) => high(b, h)).map((b) => b.name)
		const flood = names('flood')
		const slide = names('landslide')
		const surge = names('surge')
		rows.push({
			space: 'preparedness',
			kind: 'Hazard exposure',
			title: `Hazards in ${town}, ${area(prov!)}`,
			note: joined([
				`Of ${list.length} barangays, ${flood.length} have land in Project NOAH's high flood hazard, ${slide.length} in high landslide hazard and ${surge.length} in high storm-surge hazard.`,
				flood.length ? `High flood: ${flood.slice(0, 10).join(', ')}${flood.length > 10 ? ', and more' : ''}.` : '',
				slide.length ? `High landslide: ${slide.slice(0, 10).join(', ')}${slide.length > 10 ? ', and more' : ''}.` : '',
				prov === 'tawi-tawi' ? 'NOAH has no flood model for Tawi-Tawi.' : '',
			]),
			href: `${WWW}/preparedness`,
			text: joined([town, area(prov!), 'flood landslide storm surge hazard risk prone']).toLowerCase(),

			rollup: true,
		})
	}
	return rows
}

/* ---- Procurement: PhilGEPS per agency, and the GPPB blacklist ---- */
type Notices = { entities: { name: string }[]; awardees: string[]; notices: unknown[][]; columns: string[] }
function procurement(): Entry[] {
	const file = philgepsFile as unknown as Notices
	const at = (name: string) => file.columns.indexOf(name)
	const [ENTITY, ABC, STATUS, AWARDS, DATE] = [at('entity'), at('abc'), at('status'), at('awards'), at('date')]
	const statuses = (philgepsFile as unknown as { statuss: string[] }).statuss
	const by = groupBy(file.notices, (n) => String(n[ENTITY]))
	const rows: Entry[] = []
	for (const [index, list] of by) {
		const name = file.entities[Number(index)]?.name
		if (!name) continue
		let awarded = 0
		const winners = new Map<string, number>()
		for (const n of list) {
			for (const a of (n[AWARDS] as unknown[][]) ?? []) {
				const amount = Number(a[1]) || 0
				awarded += amount
				const who = file.awardees[Number(a[0])] ?? String(a[0])
				winners.set(who, (winners.get(who) ?? 0) + amount)
			}
		}
		const dates = list.map((n) => String(n[DATE])).sort()
		const top = [...winners].sort((a, b) => b[1] - a[1]).slice(0, 3)
		rows.push({
			space: 'procurement',
			kind: 'Procurement',
			title: `${name}: its procurement`,
			note: joined([
				`${list.length} bid notices on PhilGEPS from ${dates[0]} to ${dates.at(-1)}, worth ${peso(list.reduce((s, n) => s + (Number(n[ABC]) || 0), 0))} in approved budgets.`,
				`${tally(count(list, (n) => statuses[Number(n[STATUS])] ?? 'other'))}.`,
				awarded ? `${peso(awarded)} in recorded contracts; the largest awardees ${top.map(([w, a]) => `${w} (${peso(a)})`).join(', ')}.` : '',
			]),
			href: 'https://procurement.betterbarmm.com',
			text: joined([name, 'procurement bids bidding contracts philgeps awarded', ...top.map(([w]) => w)]).toLowerCase(),
		})
	}
	type Banned = { blacklisted_entity: string; min_date: string; max_date: string; orders: { procuring_entity: string; start_date: string; end_date: string; project: string }[] }
	for (const b of (blacklistFile as unknown as { entities: Banned[] }).entities) {
		rows.push({
			space: 'procurement',
			kind: 'Blacklisted',
			title: b.blacklisted_entity,
			note: `Blacklisted by the GPPB from ${b.min_date} to ${b.max_date}, by ${b.orders.length} order${b.orders.length === 1 ? '' : 's'}: ${b.orders.slice(0, 3).map((o) => `${o.procuring_entity}, over "${o.project}"`).join('; ')}.`,
			href: 'https://onlineblacklistingportal.gppb.gov.ph/',
			text: joined([b.blacklisted_entity, ...b.orders.map((o) => o.procuring_entity)]).toLowerCase(),
		})
	}
	return rows
}

/* ---- DPWH's projects in the region: a row a town, and a row a project ---- */
type Work = { id: string; name: string; category: string | null; status: string | null; progress: number | null; cost: number | null; award: number | null; contractor: string | null; bidders: { won: boolean }[]; year: number | null; office: string; areaName: string; town: { name: string } }
function works(): Entry[] {
	const all = (dpwhFile as unknown as { projects: Work[] }).projects
	const rows: Entry[] = all.map((w) => ({
		space: 'works',
		kind: 'DPWH project',
		title: w.name.length > 140 ? `${w.name.slice(0, 139)}…` : w.name,
		note: joined([
			`DPWH, ${w.year ?? 'year not given'}, in ${w.town.name}, ${w.areaName}, by its ${w.office}.`,
			w.status ? `${w.status}${w.progress != null ? `, ${w.progress}% done` : ''}.` : '',
			w.cost ? `Contract cost ${peso(w.cost)}.` : w.award ? `Awarded at ${peso(w.award)}.` : '',
			w.contractor ? `Contractor: ${w.contractor}${w.bidders.length === 1 ? ', the only bidder' : ''}.` : '',
			`Contract ${w.id}.`,
		]),
		href: 'https://transparency.dpwh.gov.ph/',
		text: joined([w.name, w.id, w.town.name, w.areaName, w.category, w.contractor, 'dpwh national']).toLowerCase(),
	}))
	for (const [town, list] of groupBy(all, (w) => `${w.town.name}|${w.areaName}`)) {
		const [name, province] = town.split('|')
		rows.push({
			space: 'works',
			kind: 'DPWH projects',
			title: `DPWH projects in ${name}, ${province}`,
			note: `${list.length} DPWH projects placed here, ${peso(list.reduce((s, w) => s + (w.cost ?? 0), 0))} in contracts: ${tally(count(list, (w) => w.status ?? 'status not given'))}. Built by DPWH's offices around the region, which has none of its own.`,
			href: 'https://transparency.dpwh.gov.ph/',
			text: joined([name, province, 'dpwh national projects roads bridges']).toLowerCase(),

			rollup: true,
		})
	}
	return rows
}

export function workspaces(): Entry[] {
	return [...audits(), ...plan(), ...schools(), ...health(), ...news(), ...opportunities(), ...preparedness(), ...procurement(), ...works()]
}

/** The words a question uses for each kind of row here. */
export const WORKSPACES_ASKED: Record<string, string> = {
	'Audit report': 'audit audited coa commission on audit opinion findings disallowance unqualified qualified adverse disclaimer',
	'Plan indicator': 'development plan bdp target targets goal indicator progress poverty growth rate',
	School: 'school schools elementary high secondary college university pupils students founded',
	'Schools count': 'how many schools number total count elementary high',
	'Health facilities': 'health facilities clinic clinics health station rural health unit birthing hospital how many',
	Hospital: 'hospital hospitals medical center',
	News: 'news latest recent headline headlines reported report announced happened week today',
	'Latest news': 'latest news headlines this week recent today happening',
	Scholarship: 'scholarship scholarships grant grants study students financial assistance tuition apply',
	Job: 'job jobs vacancy vacancies hiring work employment position salary apply',
	'Jobs count': 'how many jobs openings vacancies hiring',
	'Emergency facilities': 'evacuation evacuate emergency facilities fire station police station disaster preparedness',
	'Hazard exposure': 'flood flooding landslide storm surge hazard hazards risk prone disaster',
	Procurement: 'procurement bids bidding contracts contract awarded philgeps supplier suppliers spent purchases',
	Blacklisted: 'blacklisted blacklist banned debarred contractor supplier',
	// Not "road" or "bridge": those summoned two thousand DPWH roads onto "road crashes in Tawi-Tawi".
	'DPWH project': 'dpwh national contract contractor contractors',
	'DPWH projects': 'dpwh national contracts contractors',
}

/** Rows that come up only when a question uses their own words: a town's name should not summon its schools, hazards, news or DPWH roads. */
export const WORKSPACES_ASKED_ONLY = ['School', 'Schools count', 'Health facilities', 'Hospital', 'News', 'Job', 'Emergency facilities', 'Hazard exposure', 'Procurement', 'Blacklisted', 'DPWH project', 'DPWH projects', 'Audit report']
