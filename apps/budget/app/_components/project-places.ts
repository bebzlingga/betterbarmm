import type { Project } from '@betterbarmm/budget-data'
import towns from '../../../../datasets/accidents/municipality-centres.json'
import exposure from '../../../../datasets/preparedness/exposure.json'

/* ============================================================
   Where each project is

   The Act writes a project's place into its name — "Concreting of
   Road of Brgy. Tuayan I, Datu Hoffer Ampatuan" — and nowhere else.
   This reads it back out: the town named last in the line, then
   any of that town's barangays named before it. A project lands on
   its barangay where one is named, on its town's centre where only
   the town is, and is left off the map where neither can be read.

   Barangay points are the ones the preparedness pages use, a point
   inside each barangay's own boundary (PSA 2023); town centres are
   the incident map's. Sulu's projects, from the years it was still
   in the region, have no point on today's map and are counted
   instead of drawn.
   ============================================================ */

export type Placed = { id: string; lon: number; lat: number; at: 'barangay' | 'town'; place: string; town: string }

/* The Acts abbreviate the same few words every way there is: "Hj.", "Hji.", "Hadj"; "Moh.", "Muhammad". */
const WORDS: Record<string, string> = { hj: 'hadji', hji: 'hadji', hadj: 'hadji', haji: 'hadji', moh: 'mohammad', muhammad: 'mohammad', mohamad: 'mohammad', sto: 'santo', sta: 'santa' }
const norm = (s: string) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9 ]+/g, ' ')
		.split(/\s+/)
		.filter(Boolean)
		.map((w) => WORDS[w] ?? w)
		.filter((w) => w !== 'municipality')
		.join(' ')
const bare = (town: string) => norm(town.replace(/^City of /i, '').replace(/ City$/i, ''))

type Town = { province: string; municipality: string; lat: number; lon: number }
type Barangay = { name: string; town: string; at: number[] }

const TOWNS = (towns as { centres: Town[] }).centres.map((t) => ({
	...t,
	names: [...new Set([norm(t.municipality), bare(t.municipality)])].filter((n) => n.length > 2),
}))
const BARANGAYS = new Map<string, Barangay[]>()
for (const b of (exposure as { barangays: Barangay[] }).barangays) {
	const key = bare(b.town)
	BARANGAYS.set(key, [...(BARANGAYS.get(key) ?? []), b])
}

/** One project's place, or null where the name does not say one the map can show. */
function place(name: string): Omit<Placed, 'id'> | null {
	const text = ` ${norm(name)} `
	// The town named last: a line names the barangay first and its town at the end.
	let town: (typeof TOWNS)[number] | null = null
	let at = -1
	let len = 0
	for (const t of TOWNS)
		for (const n of t.names) {
			const i = text.lastIndexOf(` ${n} `)
			if (i > at || (i === at && i >= 0 && n.length > len)) [town, at, len] = [t, i, n.length]
		}
	if (!town) return null
	let barangay: Barangay | null = null
	for (const b of BARANGAYS.get(bare(town.municipality)) ?? []) {
		const n = norm(b.name)
		if (n.length > 2 && text.includes(` ${n} `) && (!barangay || n.length > norm(barangay.name).length)) barangay = b
	}
	return barangay
		? { lon: barangay.at[0]!, lat: barangay.at[1]!, at: 'barangay', place: barangay.name, town: town.municipality }
		: { lon: town.lon, lat: town.lat, at: 'town', place: town.municipality, town: town.municipality }
}

/** Every project of a year that can be put on the map, and how many could not, and why. */
export function placeProjects(projects: Project[]) {
	const placed: (Placed & { project: Project })[] = []
	let sulu = 0
	let unread = 0
	for (const project of projects) {
		const p = /sulu/i.test(project.province) ? null : place(project.project)
		if (p) placed.push({ id: project.id, ...p, project })
		else if (/sulu/i.test(project.province)) sulu++
		else unread++
	}
	return { placed, sulu, unread }
}

/** One dot on the interactive map: a place, and every project the Act puts there. Amounts come formatted, so the
    browser never loads the budget's figures to print them. */
export type MapPlace = {
	key: string
	lon: number
	lat: number
	at: Placed['at']
	place: string
	town: string
	total: number
	totalLabel: string
	projects: { id: string; name: string; amount: string; exact: string }[]
}

/** The year's placed projects, one entry per place, the costliest place first. */
export function mapPlaces(projects: Project[], money: { short: (n: number) => string; exact: (n: number) => string }) {
	const { placed, sulu, unread } = placeProjects(projects)
	const byPlace = new Map<string, (typeof placed)[number][]>()
	for (const p of placed) {
		const key = `${p.at}:${p.lon},${p.lat}`
		byPlace.set(key, [...(byPlace.get(key) ?? []), p])
	}
	const places: MapPlace[] = [...byPlace.entries()]
		.map(([key, list]) => {
			const first = list[0]!
			const total = list.reduce((n, p) => n + p.project.amount, 0)
			return {
				key,
				lon: first.lon,
				lat: first.lat,
				at: first.at,
				place: first.place,
				town: first.town,
				total,
				totalLabel: money.short(total),
				projects: list
					.sort((a, b) => b.project.amount - a.project.amount)
					.map((p) => ({ id: p.id, name: p.project.project, amount: money.short(p.project.amount), exact: money.exact(p.project.amount) })),
			}
		})
		.sort((a, b) => b.total - a.total)
	return { places, placed: placed.length, atBarangay: placed.filter((p) => p.at === 'barangay').length, sulu, unread }
}
