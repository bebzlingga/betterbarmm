import { lguProvinces, personName, type Contest } from '@betterbarmm/lgu-data'
import { unitRosters } from '@betterbarmm/lgu-data/barangay-officials'
import { provinceHistory, tookOffice, unitHistory } from '@betterbarmm/lgu-data/history'
import emergency from '../../../../datasets/directory/emergency.json'
import fieldOfficesFile from '../../../../datasets/directory/field-offices.json'
import historyFile from '../../../../datasets/directory/history.json'
import dataset from '../../../../datasets/directory/offices.json'
import { offices as serviceOffices } from './services'

/* ============================================================
   Who heads each office, and how to reach it

   The regional government, office by office: its head as the newest
   official source names them, with that source's date, every phone
   number and email the office publishes in plain text, who headed it
   before, and its offices in the provinces. Emails a site hides from
   robots are left out rather than decoded.

   Local governments come from the LGU directory: whoever won each
   governorship and mayoralty in COMELEC's canvass, term by term, and
   each barangay's officers as DILG's own directory listed them. Their
   e-mails and hall numbers are not republished here: DILG's directory
   is one click away for anyone who needs to write to one person.
   ============================================================ */

export type DirectoryOffice = {
	slug: string
	name: string
	acronym: string | null
	head: { name: string; title: string; as_of: string | null; source: string } | null
	address: string | null
	phones: string[]
	emails: string[]
	website: string | null
	facebook: string | null
	sources: { label: string; url: string }[]
	/** When an editor last confirmed the entry against its sources. */
	checked?: string | null
}

export type Hotline = { name: string; number: string; source: string }
export type Line = { kind: 'drrm' | 'police' | 'fire' | 'health' | 'hall' | 'other'; name: string; phones: string[]; source: string }
/** A head's time in office. Where no source dates it, first_seen and last_seen are the earliest and latest months a source shows them there; former marks a past head whose end is undated. */
export type Tenure = { name: string; title: string; from: string | null; to: string | null; source: string; first_seen?: string; last_seen?: string; former?: boolean }
export type FieldOffice = {
	ministry_slug: string
	office: string
	province: string
	address: string | null
	phones: string[]
	head: { name: string; title: string } | null
	source: string
}

export const directoryMeta = { generatedAt: dataset.generatedAt as string, note: dataset.note as string }
export const emergencyMeta = { note: emergency.note as string }
export const hotlines = (dataset.hotlines ?? []) as Hotline[]

const KIND = new Map(serviceOffices.map((o) => [o.slug, o]))
/** The office's kind and parent, kept with its programs and services so the two lists never disagree. */
export const directoryOffices = (dataset.offices as DirectoryOffice[]).map((o) => ({
	...o,
	kind: KIND.get(o.slug)?.kind ?? 'attached',
	parent: KIND.get(o.slug)?.parent ?? null,
}))
export const directoryOffice = (slug: string) => directoryOffices.find((o) => o.slug === slug)

/** Every head an office has had, newest first. */
export function officeHistory(slug: string): Tenure[] {
	const h = (historyFile.offices as { slug: string; history: Tenure[] }[]).find((o) => o.slug === slug)?.history ?? []
	return [...h].sort((a, b) => (b.from ?? b.first_seen ?? '').localeCompare(a.from ?? a.first_seen ?? ''))
}

/** A ministry's offices in the provinces. */
export const fieldOffices = (slug: string) => (fieldOfficesFile.offices as FieldOffice[]).filter((f) => f.ministry_slug === slug)

const LINE_ORDER: Line['kind'][] = ['drrm', 'police', 'fire', 'health', 'hall', 'other']
const sortLines = (lines: Line[]) => [...lines].sort((a, b) => LINE_ORDER.indexOf(a.kind) - LINE_ORDER.indexOf(b.kind))
export const LINE_LABEL: Record<Line['kind'], string> = {
	drrm: 'Disaster response',
	police: 'Police',
	fire: 'Fire',
	health: 'Health',
	hall: 'Town hall',
	other: 'Other',
}
export const provinceLines = (slug: string) =>
	sortLines((emergency.provinces as { slug: string; lines: Line[] }[]).find((p) => p.slug === slug)?.lines ?? [])
export const townLines = (province: string, slug: string) =>
	sortLines((emergency.towns as { province: string; slug: string; lines: Line[] }[]).find((t) => t.province === province && t.slug === slug)?.lines ?? [])

/** A phone number as a tel: link: digits only, Philippine area and mobile numbers given the country code. */
export function telHref(phone: string) {
	const digits = phone.replace(/[^\d+]/g, '')
	return `tel:${digits.startsWith('0') ? `+63${digits.slice(1)}` : digits}`
}

const LGU = 'https://lgu.betterbarmm.com'
const CURRENT = '2025-2028'
const winner = (c?: Contest) => (c?.ranked?.[0]?.name ? personName(c.ranked[0].name) : null)
const termLabel = (id: string) => id.replace('-', '–')

export type LocalHead = { name: string; slug: string; href: string; lguHref: string; head: string | null; deputy: string | null; isCity: boolean }
export type LocalGroup = {
	name: string
	slug: string
	kind: string
	href: string
	lguHref: string
	governor: string | null
	viceGovernor: string | null
	units: LocalHead[]
}

/** Each province (with Cotabato City and the Special Geographic Area), its governor, and every town's mayor. */
export const localGovernments: LocalGroup[] = lguProvinces.map((p) => {
	const po = p.officials?.[CURRENT]
	return {
		name: p.name,
		slug: p.slug,
		kind: p.kind,
		href: `/directory/lgu/${p.slug}`,
		lguHref: `${LGU}/${p.slug}`,
		governor: winner(po?.governor),
		viceGovernor: winner(po?.viceGovernor),
		units: p.municipalities.map((m) => {
			const mo = m.officials?.[CURRENT]
			return {
				name: m.name,
				slug: m.slug,
				href: `/directory/lgu/${p.slug}/${m.slug}`,
				lguHref: `${LGU}/${p.slug}/${m.slug}`,
				head: winner(mo?.mayor),
				deputy: winner(mo?.viceMayor),
				isCity: m.isCity,
			}
		}),
	}
})
export const localGroup = (slug: string) => localGovernments.find((g) => g.slug === slug)

/** Who took an office, term by term, newest first: the current term from the canvass, the older ones from the history file. */
export function localLineage(kind: 'mayor' | 'governor', province: string, unit?: string): { term: string; name: string | null; party: string | null }[] {
	const p = lguProvinces.find((x) => x.slug === province)
	const m = unit ? p?.municipalities.find((x) => x.slug === unit) : undefined
	const current = unit ? m?.officials?.[CURRENT]?.mayor : p?.officials?.[CURRENT]?.governor
	const rows = [{ term: termLabel(CURRENT), name: winner(current), party: current?.ranked?.[0]?.party ?? null }]
	const past = unit ? unitHistory(unit) : provinceHistory(province)
	for (const term of Object.keys(past).sort().reverse()) {
		const holder = tookOffice(past[term], kind)
		rows.push({ term: termLabel(term), name: holder?.name ? personName(holder.name) : null, party: holder?.party ?? null })
	}
	return rows
}

export type BarangayRow = { name: string; captain: string | null; sk: string | null }
/** Every barangay in a town, with its punong barangay and SK chairperson as DILG's directory listed them. */
export function barangayRows(province: string, unit: string): BarangayRow[] {
	const m = lguProvinces.find((x) => x.slug === province)?.municipalities.find((x) => x.slug === unit)
	if (!m) return []
	const rosters = unitRosters(unit)
	return m.barangays.map((b) => {
		const r = rosters[b.psgc ?? b.name]
		return { name: b.name, captain: r?.punongBarangay ? personName(r.punongBarangay.name) : null, sk: r?.skChairperson ? personName(r.skChairperson.name) : null }
	})
}
