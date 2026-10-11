/* ============================================================
   The records added after the first corpus was written

   Who holds each local office now, the barangay captains, DBM's
   NTA allocation for FY 2026 and 2027, the Local Government
   Support Fund, each area's and town's history, and the full city
   guides. Each row is built from a dataset, so every figure in a
   note is one `grounded` can find again.
   ============================================================ */

import {
	areaHistory,
	areaHref,
	boardWinners,
	lguProvinces,
	officialsTerms,
	personName,
	townHistory,
	winners,
	type Contest,
} from '@betterbarmm/lgu-data'
import { unitRosters } from '@betterbarmm/lgu-data/barangay-officials'
import { lgsf } from '@betterbarmm/lgu-data/lgsf'
import { ntaShares } from '@betterbarmm/lgu-data/nta'
import { cityGuide } from '@betterbarmm/travel-data/cities'
import type { Entry } from './corpus'

const LGU = 'https://lgu.betterbarmm.com'
const TRAVEL = 'https://travel.betterbarmm.com'
const peso = (amount: number) => `₱${Math.round(amount).toLocaleString('en-PH')}`

/** The term in office now, or the latest one recorded. */
const term = officialsTerms.find((t) => t.status === 'current') ?? officialsTerms.at(-1)

const named = (contest: Contest | undefined) =>
	contest ? winners(contest).map((c) => `${personName(c.name)}${c.party ? ` (${c.party})` : ''}`) : []

/** Elected officials, one row per province and per city or town. */
function officials(): Entry[] {
	if (!term) return []
	const rows: Entry[] = []
	for (const province of lguProvinces) {
		const p = province.officials?.[term.id]
		if (p && province.kind === 'Province') {
			const board = boardWinners(province.slug, p.board)
			const parts = [
				named(p.governor).length ? `Governor ${named(p.governor).join(', ')}` : null,
				named(p.viceGovernor).length ? `Vice governor ${named(p.viceGovernor).join(', ')}` : null,
				board?.districts.length
					? `Provincial board: ${board.districts.map((d) => `${d.district} ${d.members.map((m) => personName(m.name)).join(', ')}`).join('; ')}`
					: null,
			].filter(Boolean)
			if (parts.length)
				rows.push({
					space: 'lgu',
					kind: 'Officials',
					title: `${province.name} provincial officials, ${term.label}`,
					note: `${parts.join('. ')}. Elected ${term.electionDay}; COMELEC canvass.`,
					href: `${LGU}${areaHref(province)}`,
					text: `${province.name} governor vice governor provincial board sangguniang panlalawigan board member officials elected`.toLowerCase(),
				})
		}
		for (const unit of province.municipalities) {
			const u = unit.officials?.[term.id]
			if (!u) continue
			const council = (u.council ?? []).flatMap((c) => winners(c)).map((c) => personName(c.name))
			const parts = [
				named(u.mayor).length ? `Mayor ${named(u.mayor).join(', ')}` : null,
				named(u.viceMayor).length ? `Vice mayor ${named(u.viceMayor).join(', ')}` : null,
				council.length ? `Councilors: ${council.join(', ')}` : null,
			].filter(Boolean)
			if (!parts.length) continue
			rows.push({
				space: 'lgu',
				kind: 'Officials',
				title: `${unit.name} officials, ${term.label}`,
				note: `${parts.join('. ')}. ${unit.isCity ? 'City' : 'Municipality'} in ${province.name}; elected ${term.electionDay}, COMELEC canvass.`,
				href: `${LGU}/${province.slug}/${unit.slug}`,
				text: `${unit.name} ${unit.alsoKnownAs ?? ''} ${province.name} mayor vice mayor council councilor councilors sangguniang officials elected`.toLowerCase(),
			})
		}
	}
	return rows
}

/** Barangay captains, one row per city or town. */
function captains(): Entry[] {
	const rows: Entry[] = []
	for (const province of lguProvinces)
		for (const unit of province.municipalities) {
			const rosters = unitRosters(unit.slug)
			const list = unit.barangays
				.map((b) => {
					const captain = rosters[b.psgc ?? b.name]?.punongBarangay?.name
					return captain ? `${b.name}: ${personName(captain)}` : null
				})
				.filter(Boolean)
			if (!list.length) continue
			rows.push({
				space: 'lgu',
				kind: 'Barangay captains',
				title: `Village heads (kapitan) of ${unit.name}`,
				note: `${list.length} of ${unit.barangays.length} barangays on record. ${list.join('; ')}.`,
				href: `${LGU}/${province.slug}/${unit.slug}`,
				// Not the word "barangay": every question about barangays would land here.
				text: `${unit.name} ${province.name} captain captains punong kapitan chairman village head ${unit.barangays.map((b) => b.name).join(' ')}`.toLowerCase(),
			})
		}
	return rows
}

/** DBM's NTA allocation, by LGU and for the region. */
function nta(): Entry[] {
	const years = ntaShares.years
	const rows: Entry[] = [
		{
			space: 'lgu',
			kind: 'NTA allocation',
			rollup: true,
			title: `BARMM National Tax Allotment, FY ${years.join(' and FY ')}`,
			note: years.map((y) => `FY ${y}: ${peso(ntaShares.region[y]!)} for all BARMM local governments, barangays included`).join('. ').concat('. DBM allocation, from its COMPASS portal.'),
			href: `${LGU}/finances`,
			text: 'nta national tax allotment ira total barmm region all local governments allocation dbm compass how much',
		},
	]
	for (const province of lguProvinces) {
		const p = ntaShares.units[province.slug]
		if (p?.province)
			rows.push({
				space: 'lgu',
				kind: 'NTA allocation',
				title: `${province.name} provincial government NTA, FY ${years.join('–')}`,
				note: years.map((y) => `FY ${y}: ${peso(p.province![y]!)}`).join('; ').concat('. The province’s own share, DBM allocation.'),
				href: `${LGU}${areaHref(province)}`,
				text: `${province.name} nta national tax allotment ira province share allocation`.toLowerCase(),
			})
		for (const unit of province.municipalities) {
			const u = ntaShares.units[`${province.slug}/${unit.slug}`]
			if (!u?.lgu) continue
			rows.push({
				space: 'lgu',
				kind: 'NTA allocation',
				title: `${unit.name} NTA, FY ${years.join('–')}`,
				note: years
					.map((y) => `FY ${y}: ${peso(u.lgu![y]!)}${u.barangays?.[y] ? ` (its barangays together: ${peso(u.barangays[y]!)})` : ''}`)
					.join('; ')
					.concat('. DBM allocation.'),
				href: `${LGU}/${province.slug}/${unit.slug}`,
				text: `${unit.name} ${province.name} nta national tax allotment ira share allocation barangay`.toLowerCase(),
			})
		}
	}
	return rows
}

/** The Local Government Support Fund: one row per LGU that received any, and the region. */
function supportFund(): Entry[] {
	const byUnit = new Map<string, typeof lgsf.projects>()
	for (const p of lgsf.projects) byUnit.set(p.unit, [...(byUnit.get(p.unit) ?? []), p])
	const names = new Map(
		lguProvinces.flatMap((province) => [
			[province.slug, province.name] as const,
			...province.municipalities.map((u) => [`${province.slug}/${u.slug}`, u.name] as const),
		]),
	)
	const total = lgsf.projects.reduce((t, p) => t + (p.saro ?? 0), 0)
	const rows: Entry[] = [
		{
			space: 'lgu',
			kind: 'Support fund',
			rollup: true,
			title: `Local Government Support Fund in BARMM: ${lgsf.projects.length} projects`,
			note: `${lgsf.projects.length} projects allotted ${peso(total)} to BARMM provinces, cities and towns, FY ${Math.min(...lgsf.projects.map((p) => p.year))}–${Math.max(...lgsf.projects.map((p) => p.year))}, from DBM. Allotted is approved, not spent.`,
			href: `${LGU}/lgsf`,
			text: 'lgsf local government support fund falgu financial assistance grant dbm projects total barmm',
		},
	]
	for (const [unit, projects] of byUnit) {
		const name = names.get(unit) ?? unit
		const sum = projects.reduce((t, p) => t + (p.saro ?? 0), 0)
		rows.push({
			space: 'lgu',
			kind: 'Support fund',
			title: `${name}: Local Government Support Fund projects`,
			note: `${projects.length} project${projects.length === 1 ? '' : 's'}, ${peso(sum)} allotted. ${projects
				.slice(0, 8)
				.map((p) => `FY ${p.year} ${p.program}: ${p.project} (${p.saro == null ? 'amount not given' : peso(p.saro)})`)
				.join('; ')}.`,
			href: `${LGU}/${unit}`,
			text: `${name} lgsf support fund falgu financial assistance projects grant`.toLowerCase(),
		})
	}
	return rows
}

/** Each area's and town's history. */
function histories(): Entry[] {
	const rows: Entry[] = []
	for (const province of lguProvinces) {
		const h = areaHistory(province.slug)
		if (h)
			rows.push({
				space: 'lgu',
				kind: 'Local history',
				title: `History of ${province.name}`,
				note: h.paragraphs.join(' '),
				href: `${LGU}${areaHref(province)}`,
				text: `${province.name} history historical founded created origin past`.toLowerCase(),
			})
		for (const unit of province.municipalities) {
			const t = townHistory(province.slug, unit.slug)
			if (!t) continue
			rows.push({
				space: 'lgu',
				kind: 'Local history',
				title: `History of ${unit.name}`,
				note: t.paragraphs.join(' '),
				href: `${LGU}/${province.slug}/${unit.slug}`,
				text: `${unit.name} ${province.name} history historical founded created origin past name`.toLowerCase(),
			})
		}
	}
	return rows
}

/** The full city guides: where to stay, where and what to eat, what to see. */
function cities(): Entry[] {
	const rows: Entry[] = []
	for (const slug of ['cotabato-city']) {
		const g = cityGuide(slug)
		if (!g) continue
		const href = `${TRAVEL}/${slug}`
		const listing = (kind: string, title: string, words: string, items: { name: string; area: string | null; note: string }[]) =>
			rows.push({
				space: 'travel',
				kind,
				title: `${title} in ${g.name}`,
				note: items.map((i) => `${i.name}${i.area ? ` (${i.area})` : ''}: ${i.note}`).join(' '),
				href,
				text: `${g.name} ${words}`.toLowerCase(),
			})
		listing('Stay', 'Where to stay', 'hotel hotels inn pension stay lodging accommodation sleep room', g.stay)
		listing(
			'Eat',
			'Where to eat',
			'restaurant restaurants eat food cafe halal dining eatery',
			g.eat.filter((e) => !e.sources.every((s) => s.label === 'OpenStreetMap')),
		)
		listing('Sight', 'What to see and do', 'see do visit attraction sight sights mosque church museum tourist', g.see)
		rows.push({
			space: 'travel',
			kind: 'Food',
			title: `Local dishes of ${g.name}`,
			note: g.dishes.map((d) => `${d.name}: ${d.note}`).join(' '),
			href,
			text: `${g.name} dish dishes food local eat try delicacy pastil`.toLowerCase(),
		})
		rows.push({
			space: 'travel',
			kind: 'Getting there',
			title: `Getting to and around ${g.name}`,
			note: g.practical.map((p) => `${p.topic}: ${p.text}`).join(' '),
			href,
			text: `${g.name} airport flight flights bus van getting there around transport tricycle money atm bank safety hospital`.toLowerCase(),
		})
		if (g.events.length)
			rows.push({
				space: 'travel',
				kind: 'Events',
				title: `Festivals and events in ${g.name}`,
				note: g.events.map((e) => `${e.name} (${e.when}): ${e.note}`).join(' '),
				href,
				text: `${g.name} festival festivals event events celebration when`.toLowerCase(),
			})
	}
	return rows
}

/** Every row this file adds. */
export function more(): Entry[] {
	return [...officials(), ...captains(), ...nta(), ...supportFund(), ...histories(), ...cities()]
}

/** The words a question uses for each kind this file adds. */
export const MORE_ASKED: Record<string, string> = {
	Officials: 'mayor vice mayor governor council councilor councilors board member officials elected who leads head',
	'Barangay captains': 'captain captains punong kapitan chairman village head heads',
	'NTA allocation': 'nta national tax allotment ira share allocation how much 2026 2027 dbm',
	'Support fund': 'lgsf support fund falgu financial assistance grant projects',
	'Local history': 'history historical founded created established origin',
	Stay: 'hotel hotels stay lodging accommodation sleep',
	Eat: 'restaurant restaurants eat dining cafe halal',
	Sight: 'see visit attraction sights tourist',
	'Getting there': 'airport flight bus getting there around transport',
	Events: 'festival event celebration',
}
