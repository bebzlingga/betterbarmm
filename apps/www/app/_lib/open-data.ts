import generated from '../_generated/open-data.json'

/* ============================================================
   The open data catalogue

   Written by scripts/build-open-data.mjs before every dev and build,
   from the same files under datasets/ the workspaces read. The /data
   pages render it; the tables themselves are files under public/data/files.
   ============================================================ */

export type Column = { name: string; type: string; description: string }
export type FileLink = { href: string; bytes: number }
export type Table = {
	slug: string
	title: string
	description: string
	columns: Column[]
	rowCount: number
	sample: Record<string, unknown>[]
	files: { csv: FileLink; json: FileLink }
}
export type Dataset = {
	slug: string
	title: string
	summary: string
	source: { label: string; href: string }
	licence: string
	licenceNote?: string
	coverage: string
	workspace: string
	caveats: string[]
	tables: Table[]
}

export const catalogue = generated as { generatedAt: string; datasets: Dataset[] }
export const datasets = catalogue.datasets
export const datasetBySlug = (slug: string) => datasets.find((d) => d.slug === slug)

export const rowsIn = (d: Dataset) => d.tables.reduce((n, t) => n + t.rowCount, 0)

/** 1234567 bytes as "1.2 MB". */
export const fileSize = (bytes: number) =>
	bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1_000))} KB`

/** Where each licence's terms are explained on the licence page. */
export const licenceAnchor = (licence: string) =>
	licence.startsWith('CC BY') ? '/data/licence#cc-by' : licence.startsWith('ODbL') ? '/data/licence#odbl' : '/data/licence#facts'

/** "2026-10-27T…" as "27 October 2026". */
export const longDate = (iso: string) =>
	new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Manila' })
