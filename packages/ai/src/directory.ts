/* ============================================================
   The records the www site added after the corpus was written

   The Directory (who heads each regional office, how to reach
   it, who led it before, its offices in the provinces, the
   hotlines and each town's emergency lines and email), the
   Places catalogue and its places to stay, the Crafts, and
   Incident Watch.

   Without these Jo answered "who heads the Ministry of Health"
   and "what is MILG's number" off the web, ten seconds late and
   from whatever page ranked first — which gave a stale hotline
   and a replaced administrator, confidently. Each row is built
   from the same dataset the page prints, so a figure in an
   answer is one `grounded` can find again.
   ============================================================ */

import { lguProvinces } from '@betterbarmm/lgu-data'
import accidentsFile from '../../../datasets/accidents/accidents.json'
import craftsFile from '../../../datasets/crafts/crafts.json'
import emergencyFile from '../../../datasets/directory/emergency.json'
import fieldFile from '../../../datasets/directory/field-offices.json'
import historyFile from '../../../datasets/directory/history.json'
import emailsFile from '../../../datasets/directory/lgu-emails.json'
import officesFile from '../../../datasets/directory/offices.json'
import placesFile from '../../../datasets/places/places.json'
import staysFile from '../../../datasets/places/stays.json'
import type { Entry } from './corpus'

const TRAVEL = 'https://travel.betterbarmm.com'
const WWW = 'https://betterbarmm.com'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
/** "2026-07-18" or "2026-07" as "July 2026"; a bare year as itself. */
const month = (iso?: string | null) => {
	if (!iso) return ''
	const [y, m] = iso.split('-')
	return m ? `${MONTHS[Number(m) - 1]} ${y}` : (y ?? '')
}
const trim = (text: string, most: number) => (text.length > most ? `${text.slice(0, most - 1).trimEnd()}…` : text)
const joined = (parts: (string | null | undefined | false)[]) => parts.filter(Boolean).join(' ')

type Office = {
	slug: string
	name: string
	acronym: string | null
	head: { name: string; title: string; as_of: string | null } | null
	address: string | null
	phones: string[]
	emails: string[]
	website: string | null
	parent?: string | null
}
type Tenure = { name: string; title: string; from: string | null; to: string | null; former?: boolean; first_seen?: string; last_seen?: string }
type Line = { kind: string; name: string; phones: string[] }
type FieldOffice = { ministry_slug: string; office: string; province: string; address: string | null; phones: string[]; emails?: string[]; head: { name: string; title: string } | null }

const offices = (officesFile as { offices: Office[] }).offices
const officeName = (slug: string) => offices.find((o) => o.slug === slug)

const LINE: Record<string, string> = { drrm: 'Disaster response', police: 'Police', fire: 'Fire', health: 'Health', hall: 'Town hall', other: 'Other' }
const lines = (ls: Line[]) => ls.map((l) => `${LINE[l.kind] ?? l.kind} (${l.name}) ${l.phones.join(', ')}`).join('; ')

/** One row per regional office: its head now, and every way to reach it. */
function regionalOffices(): Entry[] {
	return offices.map((o) => {
		const parent = o.parent ? officeName(o.parent) : undefined
		const head = o.head
			? `Headed by ${o.head.title} ${o.head.name}${o.head.as_of ? `, as of ${month(o.head.as_of)}` : ''}.`
			: 'No head named in an official source.'
		const reach = joined([
			o.phones.length ? `Phone and hotline: ${o.phones.join(', ')}.` : 'No public phone number or hotline found.',
			o.emails.length ? `Email ${o.emails.join(', ')}.` : '',
			o.address ? `Address: ${o.address}.` : '',
			parent ? `Attached to the ${parent.name}.` : '',
		])
		return {
			space: 'directory',
			kind: 'Office head',
			title: o.acronym ? `${o.name} (${o.acronym})` : o.name,
			note: `${head} ${reach}`,
			href: `${WWW}/directory/office/${o.slug}`,
			text: joined([o.name, o.acronym, o.head?.name, o.head?.title, o.address, parent?.name]).toLowerCase(),
		} satisfies Entry
	})
}

/** Who led each office before, with the dates the sources support. */
function pastHeads(): Entry[] {
	const rows: Entry[] = []
	for (const h of (historyFile as { offices: { slug: string; history: Tenure[] }[] }).offices) {
		const o = officeName(h.slug)
		if (!o || h.history.length < 2) continue
		const ordered = [...h.history].sort((a, b) => (b.from ?? b.first_seen ?? '').localeCompare(a.from ?? a.first_seen ?? ''))
		const span = (t: Tenure) => {
			const from = month(t.from) || (t.first_seen ? `by ${month(t.first_seen)}` : '?')
			const to = t.to ? month(t.to) : t.former ? (t.last_seen ? `at least ${month(t.last_seen)}` : 'undated') : 'present'
			return `${from} to ${to}`
		}
		rows.push({
			space: 'directory',
			kind: 'Tenures',
			// "Tenures", not "heads": a title carrying the word head outranks the
			// office's own row on "who heads the ministry", which is about now.
			title: `${o.acronym ? `${o.name} (${o.acronym})` : o.name}: who led it before`,
			note: ordered.map((t) => `${t.name}, ${t.title}, ${span(t)}`).join('; ') + '.',
			href: `${WWW}/directory/office/${o.slug}`,
			text: joined([o.name, o.acronym, ...ordered.map((t) => `${t.name} ${t.title}`)]).toLowerCase(),
		})
	}
	return rows
}

/** A ministry's offices in the provinces. */
function fieldOffices(): Entry[] {
	return (fieldFile as { offices: FieldOffice[] }).offices.map((f) => {
		const o = officeName(f.ministry_slug)
		return {
			space: 'directory',
			kind: 'Field office',
			title: f.office,
			note: joined([
				`${o?.acronym ?? o?.name ?? 'Ministry'} office for ${f.province}.`,
				f.head ? `Headed by ${f.head.name}, ${f.head.title}.` : '',
				f.address ? `Address: ${f.address}.` : '',
				f.phones.length ? `Phone ${f.phones.join(', ')}.` : '',
				f.emails?.length ? `Email ${f.emails.join(', ')}.` : '',
			]),
			href: `${WWW}/directory/office/${f.ministry_slug}`,
			text: joined([f.office, o?.name, o?.acronym, f.province, f.head?.name]).toLowerCase(),
		} satisfies Entry
	})
}

/** The region's hotlines, 911 first. */
function hotlines(): Entry[] {
	const own = ((officesFile as { hotlines?: { name: string; number: string }[] }).hotlines ?? []).map(
		(h): Entry => ({ space: 'directory', kind: 'Hotline', title: h.name, note: `Call or text ${h.number}.`, href: `${WWW}/directory#hotlines`, text: h.name.toLowerCase() }),
	)
	return [
		{
			space: 'directory',
			kind: 'Hotline',
			title: 'Emergency hotline 911',
			note: 'In an emergency anywhere in BARMM, call 911. Each town’s police, fire and health lines are on its Directory page.',
			href: `${WWW}/directory#hotlines`,
			text: 'emergency 911 police fire ambulance rescue',
		},
		...own,
	]
}

/** Each province's and town's own lines and email. */
function localLines(): Entry[] {
	const e = emergencyFile as { provinces: { slug: string; lines: Line[] }[]; towns: { province: string; slug: string; lines: Line[] }[] }
	const mail = emailsFile as { areas: Record<string, { emails: string[] }>; towns: Record<string, { emails: string[] }> }
	const rows: Entry[] = []
	for (const p of lguProvinces) {
		const pl = e.provinces.find((x) => x.slug === p.slug)?.lines ?? []
		const pm = mail.areas[p.slug]?.emails ?? []
		if (pl.length || pm.length)
			rows.push({
				space: 'directory',
				kind: 'Emergency lines',
				title: `${p.name}: province-wide numbers`,
				note: joined([pl.length ? `${lines(pl)}.` : '', pm.length ? `Email ${pm.join(', ')}.` : '']),
				href: `${WWW}/directory/lgu/${p.slug}`,
				text: `${p.name} province provincial`.toLowerCase(),
			})
		for (const m of p.municipalities) {
			const tl = e.towns.find((x) => x.province === p.slug && x.slug === m.slug)?.lines ?? []
			const tm = mail.towns[`${p.slug}/${m.slug}`]?.emails ?? []
			if (!tl.length && !tm.length) continue
			rows.push({
				space: 'directory',
				kind: 'Emergency lines',
				title: `${m.name}, ${p.name}: numbers`,
				note: joined([tl.length ? `${lines(tl)}.` : 'No town numbers on an official page yet.', tm.length ? `Email ${tm.join(', ')}.` : '']),
				href: `${WWW}/directory/lgu/${p.slug}/${m.slug}`,
				text: `${m.name} ${p.name}`.toLowerCase(),
			})
		}
	}
	return rows
}

type Place = {
	slug: string
	name: string
	also_known_as?: string[]
	kind: string
	municipality: string
	area: string
	summary: string
	getting_there?: string | null
	best_time?: string | null
	do?: { title: string }[]
}
const AREA: Record<string, string> = {
	basilan: 'Basilan',
	'lanao-del-sur': 'Lanao del Sur',
	'maguindanao-del-norte': 'Maguindanao del Norte',
	'maguindanao-del-sur': 'Maguindanao del Sur',
	'tawi-tawi': 'Tawi-Tawi',
	'cotabato-city': 'Cotabato City',
	'special-geographic-area': 'Special Geographic Area',
}

/** The 104 places of the www catalogue, with how to get there and when. */
export function catalogue(): Entry[] {
	return (placesFile as { items: Place[] }).items.map((p) => ({
		space: 'travel',
		kind: 'Place',
		title: p.name,
		note: joined([
			`${p.summary}`,
			`In ${[p.municipality, AREA[p.area]].filter((x, i, a) => x && a.indexOf(x) === i).join(', ')}.`,
			p.getting_there ? `Getting there: ${trim(p.getting_there, 220)}` : '',
			p.best_time ? `When to go: ${trim(p.best_time, 160)}` : '',
		]),
		href: `${TRAVEL}/places/${p.slug}`,
		text: joined([p.name, ...(p.also_known_as ?? []), p.kind, p.municipality, AREA[p.area], p.summary, ...(p.do ?? []).map((d) => d.title)]).toLowerCase(),
	}))
}

function stays(): Entry[] {
	type Stay = { name: string; kind: string; municipality: string; address?: string | null; note: string; as_of: string }
	return (staysFile as { stays: Stay[] }).stays.map((s) => ({
		space: 'travel',
		kind: 'Place to stay',
		title: s.name,
		note: joined([`A ${s.kind} in ${s.municipality}.`, s.address ? `Address: ${s.address}.` : '', `${s.note}.`, `Named in ${s.as_of.slice(0, 4)}; confirm before booking.`]),
		// The guide's lodging page is hidden for now (travel app, GUIDE_PAGES).
		href: TRAVEL,
		text: `${s.name} ${s.kind} ${s.municipality} ${s.address ?? ''}`.toLowerCase(),
	}))
}

function crafts(): Entry[] {
	type Craft = { slug: string; name: string; local_name?: string; group: string; people?: string; province?: string; towns?: string[]; summary: string; materials?: string }
	return (craftsFile as { items: Craft[] }).items.map((c) => ({
		space: 'travel',
		kind: 'Craft',
		title: c.name,
		note: joined([c.summary, c.people ? `Made by the ${c.people}${c.towns?.length ? ` in ${c.towns.join(', ')}` : ''}.` : '', c.materials ? `Materials: ${trim(c.materials, 140)}` : '']),
		href: `${WWW}/crafts/${c.slug}`,
		text: joined([c.name, c.local_name, c.group, c.people, c.province?.replace(/-/g, ' '), ...(c.towns ?? []), c.summary]).toLowerCase(),
	}))
}

type Incident = { id: string; date: string; kind: string; title: string; summary: string; province: string; municipality: string | null; barangay: string | null; deaths: number; injured: number; missing: number }

/**
 * Every incident, and a count per town, per province and for the region.
 *
 * The counts are rows of their own because a model shown sixteen incidents
 * cannot count two hundred and fifty, and must never be asked to.
 */
function incidents(): Entry[] {
	const all = (accidentsFile as { incidents: Incident[]; since?: string }).incidents
	const since = (accidentsFile as { since?: string }).since ?? '2019'
	const rows: Entry[] = all.map((i) => ({
		space: 'incidents',
		kind: 'Incident',
		title: i.title,
		note: joined([
			`${i.kind}, ${i.date.length > 7 ? i.date : month(i.date)}, ${[i.barangay, i.municipality, i.province].filter(Boolean).join(', ')}.`,
			`${i.deaths} dead, ${i.injured} injured${i.missing ? `, ${i.missing} missing` : ''}.`,
			trim(i.summary, 240),
		]),
		href: `${WWW}/accidents`,
		text: joined([i.kind, i.title, i.municipality, i.barangay, i.province, i.date]).toLowerCase(),
	}))

	const tally = (list: Incident[]) => {
		const by = new Map<string, number>()
		for (const i of list) by.set(i.kind, (by.get(i.kind) ?? 0) + 1)
		const kinds = [...by].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} ${k.toLowerCase()}`).join(', ')
		const dead = list.reduce((n, i) => n + i.deaths, 0)
		const hurt = list.reduce((n, i) => n + i.injured, 0)
		return `${list.length} incidents reported since ${since}: ${kinds}. ${dead} dead and ${hurt} injured in all. Counted from news reports, so an incident nobody reported is not here.`
	}
	const groups = new Map<string, Incident[]>()
	for (const i of all) {
		// A city that is its own area (Cotabato City) is counted once, not as both.
		for (const key of [i.province, i.municipality && i.municipality !== i.province ? `${i.municipality}|${i.province}` : null]) {
			if (!key) continue
			groups.set(key, [...(groups.get(key) ?? []), i])
		}
	}
	for (const [key, list] of groups) {
		const [town, province] = key.includes('|') ? key.split('|') : [null, key]
		rows.push({
			space: 'incidents',
			kind: 'Incident count',
			title: town ? `Incidents in ${town}, ${province}` : `Incidents in ${province}`,
			note: tally(list),
			href: `${WWW}/accidents`,
			text: `${town ?? ''} ${province} incidents accidents crashes`.toLowerCase(),
			rollup: true,
		})
	}
	rows.push({ space: 'incidents', kind: 'Incident count', title: 'Incidents across BARMM', note: tally(all), href: `${WWW}/accidents`, text: 'incidents accidents crashes region whole', rollup: true })
	return rows
}

export function directory(): Entry[] {
	return [...regionalOffices(), ...pastHeads(), ...fieldOffices(), ...hotlines(), ...localLines(), ...catalogue(), ...stays(), ...crafts(), ...incidents()]
}

/** The words a question uses for each kind of row here. */
export const DIRECTORY_ASKED: Record<string, string> = {
	'Office head':
		'office ministry minister head heads headed leads chief director administrator secretary commissioner chairperson who contact phone number numbers hotline call email address reach located where',
	Tenures: 'previous former past before predecessor history earlier led tenure served until minister secretary administrator director',
	'Field office': 'provincial field office district branch province contact phone address who heads',
	Hotline: 'hotline emergency number call text complaint feedback',
	'Emergency lines': 'emergency number numbers hotline police fire ambulance rescue drrm disaster health contact phone call email town hall',
	Place: 'place visit see go attraction destination travel tourist spot beach island mosque lake falls mountain',
	'Place to stay': 'hotel hotels stay accommodation inn resort lodging room sleep',
	Craft: 'craft crafts weaving woven textile cloth brass handicraft souvenir made artisan',
	Incident: 'incident accident crash shooting drowning fire killed dead died injured',
	'Incident count': 'how many incidents accidents crashes shootings deaths killed count total number',
}
