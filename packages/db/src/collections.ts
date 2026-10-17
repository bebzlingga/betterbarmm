/**
 * Every editable collection, and where it lives in `datasets/`.
 *
 * A collection is either an array inside one JSON file (`file` + `path`), or a
 * folder holding one JSON file per record (`dir` + `prefix`). `key` must be
 * stable and unique within the collection: it is the record's primary key in
 * the database and how `db:pull` finds its place in the file again.
 */

type Item = Record<string, unknown>

type Source =
	| { kind: 'array'; file: string; path: string | null }
	| { kind: 'dir'; dir: string; prefix: string }

export type CollectionDef = {
	workspace: string
	collection: string
	label: string
	source: Source
	key: (item: Item, fileStem?: string) => string
	title: (item: Item) => string
}

export const WORKSPACES = [
	{ value: 'legislation', label: 'Legislation' },
	{ value: 'budget', label: 'Budget' },
	{ value: 'election', label: 'Election' },
	{ value: 'lgu', label: 'Local government' },
	{ value: 'travel', label: 'Travel' },
	{ value: 'accidents', label: 'Incident Watch' },
] as const

const s = (value: unknown) => (value == null ? '' : String(value))
const R = 'bills/bangsamoro_registry'

const array = (file: string, path: string | null): Source => ({ kind: 'array', file, path })

const BUDGET_YEARS = [
	['BAA03', 2020],
	['BAA15', 2021],
	['BAA23', 2022],
	['BAA32', 2023],
	['BAA56', 2024],
	['BAA65', 2025],
	['BAA85', 2026],
] as const

export const COLLECTIONS: CollectionDef[] = [
	// ---- Legislation ----
	{
		workspace: 'legislation',
		collection: 'readings',
		label: 'Readings',
		source: array('bills/readings.json', 'readings'),
		key: (r) => `${s(r.category)}-${s(r.number)}`,
		title: (r) => `${s(r.category)} ${s(r.number)}`,
	},
	{
		workspace: 'legislation',
		collection: 'acts',
		label: 'Acts (records)',
		source: { kind: 'dir', dir: `${R}/baa`, prefix: 'BAA-' },
		key: (_r, stem) => s(stem),
		title: (r) => {
			const basic = (r.basic_information ?? {}) as Item
			return `BAA ${s(basic.baa_number)} — ${s(basic.short_title)}`
		},
	},
	{
		workspace: 'legislation',
		collection: 'bill-records',
		label: 'Bills (records)',
		source: { kind: 'dir', dir: `${R}/bills`, prefix: 'BILL-' },
		key: (_r, stem) => s(stem),
		title: (r) => {
			const basic = (r.basic_information ?? {}) as Item
			return `Bill ${s(basic.bill_number)} — ${s(basic.short_title || basic.official_title)}`
		},
	},
	{
		workspace: 'legislation',
		collection: 'adopted-resolution-records',
		label: 'Adopted resolutions (records)',
		source: { kind: 'dir', dir: `${R}/resolutions/adopted`, prefix: 'RES-' },
		key: (_r, stem) => s(stem),
		title: (r) => {
			const basic = (r.basic_information ?? {}) as Item
			return `Resolution ${s(basic.resolution_number)} — ${s(basic.short_title || basic.official_title)}`
		},
	},
	{
		workspace: 'legislation',
		collection: 'bills-index',
		label: 'Bills index',
		source: array(`${R}/bills/official_index.json`, 'bills'),
		// Parliament lists Bill 323 twice; the URL keeps both rows distinct.
		key: (r) => `${s(r.number)}|${s(r.url)}`,
		title: (r) => `Bill ${s(r.number)} — ${s(r.title)}`,
	},
	{
		workspace: 'legislation',
		collection: 'acts-index',
		label: 'Acts index',
		source: array(`${R}/baa/official_index.json`, 'acts'),
		key: (r) => s(r.number),
		title: (r) => `BAA ${s(r.number)} — ${s(r.title)}`,
	},
	{
		workspace: 'legislation',
		collection: 'adopted-index',
		label: 'Adopted resolutions index',
		source: array(`${R}/resolutions/adopted_official_index.json`, 'measures'),
		key: (r) => s(r.number),
		title: (r) => `Resolution ${s(r.number)} — ${s(r.title)}`,
	},
	{
		workspace: 'legislation',
		collection: 'proposed-index',
		label: 'Proposed resolutions index',
		source: array(`${R}/resolutions/proposed_official_index.json`, 'measures'),
		key: (r) => s(r.number),
		title: (r) => `Proposed Resolution ${s(r.number)} — ${s(r.title)}`,
	},
	{
		workspace: 'legislation',
		collection: 'bill-subjects',
		label: 'Bill subjects',
		source: array('bills/bill-subjects.json', 'bills'),
		key: (r) => s(r.number),
		title: (r) => `Bill ${s(r.number)} — ${(r.sectors as string[] | undefined)?.join(', ') ?? ''}`,
	},
	{
		workspace: 'legislation',
		collection: 'members',
		label: 'Member profiles',
		source: array(`${R}/members/profiles.json`, 'profiles'),
		key: (r) => s(r.slug),
		title: (r) => s(r.name),
	},
	{
		workspace: 'legislation',
		collection: 'committees',
		label: 'Committees',
		source: array(`${R}/committees/_index.json`, 'committees'),
		key: (r) => s(r.slug),
		title: (r) => s(r.name),
	},
	{
		workspace: 'legislation',
		collection: 'committee-reports',
		label: 'Committee reports',
		source: array(`${R}/committees/_index.json`, 'reports'),
		key: (r) => s(r.number),
		title: (r) => s(r.title),
	},
	{
		workspace: 'legislation',
		collection: 'journals',
		label: 'Journals',
		source: array(`${R}/journal/sessions.json`, 'journals'),
		key: (r) => s(r.key),
		title: (r) => s(r.title),
	},

	// ---- Budget ----
	...BUDGET_YEARS.map(
		([act, year]): CollectionDef => ({
			workspace: 'budget',
			collection: `line-items-fy${year}`,
			label: `Line items FY ${year}`,
			source: array(`budget/${act}_FY${year}_line_items.json`, 'line_items'),
			key: (r) => s(r.id),
			title: (r) => `${s(r.id)} — ${s(r.agency)}`,
		}),
	),
	{
		workspace: 'budget',
		collection: 'trend-offices',
		label: 'Trend: offices',
		source: array('budget/trends.json', 'offices'),
		key: (r) => s(r.slug),
		title: (r) => s(r.name),
	},
	{
		workspace: 'budget',
		collection: 'trend-sectors',
		label: 'Trend: sectors',
		source: array('budget/trends.json', 'sectors'),
		key: (r) => s(r.slug),
		title: (r) => s(r.name),
	},

	// ---- Election ----
	{
		workspace: 'election',
		collection: 'stories',
		label: 'Developing stories',
		source: array('election/barmm_2026_developing_stories.json', 'developing_stories'),
		key: (r) => s(r.id),
		title: (r) => s(r.headline),
	},
	{
		workspace: 'election',
		collection: 'chronology',
		label: 'Chronology',
		source: array('election/barmm_2026_developing_stories.json', 'chronology'),
		key: (r) => s(r.id),
		title: (r) => `${s(r.date)} — ${s(r.headline)}`,
	},
	{
		workspace: 'election',
		collection: 'key-figures',
		label: 'Key figures',
		source: array('election/election-supplement.json', 'key_figures'),
		key: (r) => s(r.name),
		title: (r) => `${s(r.name)} — ${s(r.role)}`,
	},

	// ---- Local government ----
	{
		workspace: 'lgu',
		collection: 'provinces',
		label: 'Provinces',
		source: array('lgu/barmm-lgu.json', 'provinces'),
		key: (r) => s(r.slug),
		title: (r) => s(r.name),
	},

	// ---- Travel ----
	{
		workspace: 'travel',
		collection: 'towns',
		label: 'Towns',
		source: array('travel/towns.json', null),
		key: (r) => s(r.slug),
		title: (r) => `${s(r.name)} (${s(r.area)})`,
	},

	// ---- Incident Watch ----
	// accidents.json is built (scripts/build_accidents.py), so an editor's work goes into the build's inputs, never
	// into it: a correction is a patch keyed by the incident's id, applied after every other; a missing incident
	// is a report of its own. Publishing rebuilds the map from them.
	{
		workspace: 'accidents',
		collection: 'edits',
		label: 'Corrections',
		source: array('accidents/enrichment/admin.json', null),
		key: (r) => s(r.id),
		title: (r) => `${s(r.id)}${r.drop ? ' — drop' : ''}${r.note ? ` — ${s(r.note)}` : ''}`,
	},
	{
		workspace: 'accidents',
		collection: 'added',
		label: 'Added by hand',
		source: array('accidents/reports/admin.json', null),
		key: (r) => s(r.ref),
		title: (r) => `${s(r.date)} — ${s(r.title)}`,
	},
]

export const findCollection = (workspace: string, collection: string) =>
	COLLECTIONS.find((c) => c.workspace === workspace && c.collection === collection)

export const workspaceLabel = (value: string) =>
	WORKSPACES.find((w) => w.value === value)?.label ?? value
