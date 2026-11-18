import fs from 'node:fs'
import path from 'node:path'
import { lguProvinces } from '@betterbarmm/lgu-data'
import { KINDS, townCounts, type TownCounts } from './health'

/* ============================================================
   Every town's care, side by side

   Each city and municipality in the LGU directory, with the
   Department of Health's 2021 count of its facilities beside its
   population and its barangays, and the health facilities that
   OpenStreetMap's volunteers have mapped there
   (datasets/preparedness/facilities.json). A town the registry did
   not count, the Special Geographic Area's above all, is kept with
   blanks, not left out.
   ============================================================ */

const sum = (c: Record<string, number>, types: string[]) => types.reduce((s, t) => s + (c[t] ?? 0), 0)
const both = (row: TownCounts | undefined, types: string[]) => (row ? sum(row.government, types) + sum(row.private, types) : 0)
const typesOf = (label: string) => KINDS.find((k) => k.label === label)!.types

export type TownRow = {
	area: string
	areaName: string
	slug: string
	name: string
	isCity: boolean
	population: number | null
	barangays: number
	onRegistry: boolean
	/** Barangay health stations, government and private. */
	stations: number
	/** Rural and city health units and the health offices. */
	units: number
	birthing: number
	hospitals: number
	government: number
	private: number
	/** People for each barangay health station; null with no station or no population. */
	perStation: number | null
	/** Stations for every 10 barangays. */
	per10: number | null
	counts: TownCounts | null
	mapped: number
}

/* ---- The mapped facilities ---------------------------------------------- */

export type MapKind = 'hospital' | 'health'
export type MapPoint = { id: string; kind: MapKind; name: string; lon: number; lat: number; barangay: string | null; town: string | null; area: string | null; townSlug: string | null; url: string }

type PrepFile = { generatedAt: string; source: { label: string; url: string } | string; facilities: { id: string; kind: string; name: string; lon: number; lat: number; barangay: string | null; town: string | null; prov: string | null; source: { url: string } }[] }

function readPrep(): PrepFile {
	const roots = [process.cwd(), path.join(process.cwd(), '..'), path.join(process.cwd(), '../..')]
	const file = roots.map((r) => path.join(r, 'datasets/preparedness/facilities.json')).find((f) => fs.existsSync(f))
	if (!file) throw new Error('datasets/preparedness/facilities.json not found')
	return JSON.parse(fs.readFileSync(file, 'utf8')) as PrepFile
}

const prep = readPrep()
export const mapGeneratedAt = prep.generatedAt

const key = (s: string) => s.toLowerCase().replace(/^city of /, '').replace(/ city$/, '').replace(/[^a-z]/g, '')
const unitSlug = (area: string | null, town: string | null) => {
	if (!area || !town) return null
	const p = lguProvinces.find((x) => x.slug === area)
	return p?.municipalities.find((m) => key(m.name) === key(town) || key(m.alsoKnownAs ?? '') === key(town))?.slug ?? null
}

export const mapPoints: MapPoint[] = prep.facilities
	.filter((f) => f.kind === 'hospital' || f.kind === 'health')
	.map((f) => ({
		id: f.id,
		kind: f.kind as MapKind,
		name: f.name,
		lon: f.lon,
		lat: f.lat,
		barangay: f.barangay,
		town: f.town,
		area: f.prov,
		townSlug: unitSlug(f.prov, f.town),
		url: f.source.url,
	}))

/* ---- The towns ---------------------------------------------------------- */

export const towns: TownRow[] = lguProvinces.flatMap((p) =>
	p.municipalities.map((u) => {
		const row = townCounts.find((t) => t.area === p.slug && t.town === u.slug)
		const stations = both(row, typesOf('Barangay health stations'))
		const barangays = u.barangays.length
		const total = (k: 'government' | 'private') => (row ? Object.values(row[k]).reduce((a, b) => a + b, 0) : 0)
		return {
			area: p.slug,
			areaName: p.name,
			slug: u.slug,
			name: u.name,
			isCity: u.isCity,
			population: u.population,
			barangays,
			onRegistry: !!row,
			stations,
			units: both(row, typesOf('Rural and city health units')),
			birthing: both(row, typesOf('Birthing homes')),
			hospitals: both(row, typesOf('Hospitals')),
			government: total('government'),
			private: total('private'),
			perStation: row && stations && u.population ? Math.round(u.population / stations) : null,
			per10: row && barangays ? Math.round((stations / barangays) * 100) / 10 : null,
			counts: row ?? null,
			mapped: mapPoints.filter((m) => m.area === p.slug && m.townSlug === u.slug).length,
		}
	}),
)

export const findTown = (area: string, slug: string) => towns.find((t) => t.area === area && t.slug === slug)

export const areas = lguProvinces.map((p) => ({ slug: p.slug, name: p.name, towns: towns.filter((t) => t.area === p.slug) }))

/** Where a reader is sent for the town itself: its page in the Local Government workspace. */
export const lguHref = (t: Pick<TownRow, 'area' | 'slug'>) => `https://lgu.betterbarmm.com/${t.area}/${t.slug}`

/** The region's whole: stations against barangays, people against stations, where both are known. */
export const regionStations = (() => {
	const counted = towns.filter((t) => t.onRegistry)
	const stations = counted.reduce((s, t) => s + t.stations, 0)
	const barangays = counted.reduce((s, t) => s + t.barangays, 0)
	const people = counted.reduce((s, t) => s + (t.population ?? 0), 0)
	return { towns: counted.length, stations, barangays, people, per10: Math.round((stations / barangays) * 100) / 10, perStation: Math.round(people / stations) }
})()
