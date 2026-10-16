import dataset from '../../../../datasets/accidents/accidents.json'

/* ============================================================
   Accidents and shootings in the region, as the press reported them

   One record per incident, compiled from news reports: what happened,
   where, when, who was hurt, and the reports it rests on. Nothing here
   comes from an official register — none is published — so the map
   this feeds is a map of what was reported and indexed, and says so.

   Six kinds, one colour each; the glyphs live with the component that
   draws them, so this file stays free of the browser. The finer kind (a
   drowning, a landslide, an LPG blast, an ambush) is kept on the record
   and named in the details; it is not given a colour of its own because six hues
   is as many as a dot map can keep apart for every reader.
   Shootings are the one deliberate kind carried, a clan war's or an
   armed clash's among them; bombings and the rest of the violence stay out.
   ============================================================ */

export type AccidentType = 'road' | 'water' | 'flood' | 'fire' | 'shooting' | 'other'

export type Accident = {
	id: string
	/** YYYY-MM-DD, or YYYY-MM when the report gives only the month. */
	date: string
	type: AccidentType
	/** The finer kind as the report described it: "drowning", "landslide", "LPG explosion". */
	kind: string
	title: string
	summary: string
	province: string
	/** Null when the report named only the province. */
	municipality: string | null
	barangay: string | null
	deaths: number | null
	injured: number | null
	missing: number | null
	vehicles: string[]
	lat: number
	lon: number
	/** Whether the dot sits on the barangay the report named, on the town's centre, or — when the report named no town — on the province's. */
	placed: 'barangay' | 'municipality' | 'province'
	sources: { outlet: string; url: string; title: string; date: string | null }[]
	/** An outlet's photo of the incident, shown small and credited; the outlet's, not ours. */
	image?: { url: string; outlet: string; href: string } | null
}

export const ACCIDENT_TYPES: { id: AccidentType; label: string; color: string; colorDark: string }[] = [
	{ id: 'road', label: 'Road', color: '#2a78d6', colorDark: '#3987e5' },
	{ id: 'water', label: 'Sea, lake & river', color: '#1baf7a', colorDark: '#199e70' },
	{ id: 'flood', label: 'Flood', color: '#7a52cc', colorDark: '#9a7bea' },
	{ id: 'fire', label: 'Fire & explosion', color: '#eb6834', colorDark: '#d95926' },
	{ id: 'shooting', label: 'Shooting', color: '#d11f2f', colorDark: '#ef4050' },
	{ id: 'other', label: 'Other', color: '#8a8578', colorDark: '#9a9488' },
]

export const typeOf = (id: AccidentType) => ACCIDENT_TYPES.find((t) => t.id === id) ?? ACCIDENT_TYPES[ACCIDENT_TYPES.length - 1]!

export const accidents = (dataset.incidents as Accident[]).slice().sort((a, b) => (a.date < b.date ? 1 : -1))

export const accidentsMeta = { generatedAt: dataset.generatedAt as string, note: dataset.note as string, since: dataset.since as string }

/** "12 March 2024", or "March 2024" when only the month is known. */
export function accidentDate(date: string) {
	const [y, m, d] = date.split('-').map(Number)
	const dt = new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1))
	return dt.toLocaleDateString('en-PH', d ? { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' } : { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export const sum = (list: Accident[], key: 'deaths' | 'injured' | 'missing') => list.reduce((n, a) => n + (a[key] ?? 0), 0)
