/** Reading and writing a collection's dataset files, for db:seed and db:pull. */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { CollectionDef } from '../src/collections'

export const DATASETS = resolve(import.meta.dir, '../../../datasets')

export type Row = { key: string; data: Record<string, unknown>; position: number }

/**
 * The file's own formatting — indent and trailing newline — so a pull writes
 * it back exactly as it was. Files here use 1 space, 2 spaces or tabs; a
 * reformatted 5 MB file is a diff nobody can review.
 */
export function readJsonKeepingFormat(path: string) {
	const text = readFileSync(path, 'utf8')
	const data = JSON.parse(text)
	const line = text.split('\n')[1]
	// No second line: the file is minified, and stays that way.
	const indent = line === undefined ? 0 : line.startsWith('\t') ? '\t' : (line.match(/^ +/)?.[0].length ?? 1)
	return { data, indent, newline: text.endsWith('\n') }
}

export function writeJsonKeepingFormat(path: string, data: unknown, indent: string | number, newline: boolean) {
	writeFileSync(path, JSON.stringify(data, null, indent) + (newline ? '\n' : ''))
}

export function readRows(def: CollectionDef): Row[] {
	const rows: Row[] = []
	if (def.source.kind === 'dir') {
		const dir = join(DATASETS, def.source.dir)
		const prefix = def.source.prefix
		readdirSync(dir)
			.filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
			.sort()
			.forEach((f, position) => {
				const stem = f.slice(0, -5)
				const data = JSON.parse(readFileSync(join(dir, f), 'utf8'))
				rows.push({ key: def.key(data, stem), data, position })
			})
	} else {
		const { data } = readJsonKeepingFormat(join(DATASETS, def.source.file))
		const items = (def.source.path ? data[def.source.path] : data) as Record<string, unknown>[]
		items.forEach((item, position) => rows.push({ key: def.key(item), data: item, position }))
	}
	// The source data repeats a few keys (Committee Report 168 is listed twice,
	// an FY 2026 line-item id is reused). A repeat becomes "168#2", which stays
	// stable as long as the file's order does.
	const seen = new Map<string, number>()
	for (const row of rows) {
		if (!row.key) throw new Error(`${def.workspace}/${def.collection}: a record has an empty key`)
		const count = (seen.get(row.key) ?? 0) + 1
		seen.set(row.key, count)
		if (count > 1) row.key = `${row.key}#${count}`
	}
	return rows
}

/** JSON with object keys sorted, so two values compare equal whatever their key order. */
const canonical = (value: unknown): string =>
	JSON.stringify(value, (_k, v) =>
		v && typeof v === 'object' && !Array.isArray(v)
			? Object.fromEntries(Object.keys(v).sort().map((k) => [k, (v as Record<string, unknown>)[k]]))
			: v,
	)

/**
 * `next` with its keys put back in `like`'s order, all the way down; keys `like`
 * did not have go last. Postgres `jsonb` re-sorts object keys, so a record
 * coming back from the database has to be re-ordered before it is written, or
 * every edit reshuffles the whole record in the diff.
 */
function orderLike(next: unknown, like: unknown): unknown {
	if (Array.isArray(next)) return next.map((item, i) => orderLike(item, Array.isArray(like) ? like[i] : undefined))
	if (!next || typeof next !== 'object') return next
	const src = next as Record<string, unknown>
	const ref = like && typeof like === 'object' && !Array.isArray(like) ? (like as Record<string, unknown>) : {}
	const keys = [...Object.keys(ref).filter((k) => k in src), ...Object.keys(src).filter((k) => !(k in ref))]
	return Object.fromEntries(keys.map((k) => [k, orderLike(src[k], ref[k])]))
}

/**
 * Put rows back where they came from, in `position` order. Returns whether
 * anything was written.
 *
 * A record that has not changed keeps its exact original object, and a file
 * is only rewritten when something in it changed. The budget files were
 * written by Python, which prints whole floats as `1.0`; JSON.stringify drops
 * the `.0`, so an untouched file must stay untouched. A file that was edited
 * loses them — same values, noisier diff.
 */
export function writeRows(def: CollectionDef, rows: Row[]): boolean {
	const ordered = [...rows].sort((a, b) => a.position - b.position)
	const before = new Map(readRows(def).map((row) => [row.key, row.data]))
	const restore = (row: Row) => {
		const old = before.get(row.key)
		if (old === undefined) return row.data
		return canonical(old) === canonical(row.data) ? old : (orderLike(row.data, old) as Record<string, unknown>)
	}

	if (def.source.kind === 'dir') {
		const dir = join(DATASETS, def.source.dir)
		let wrote = false
		for (const row of ordered) {
			const old = before.get(row.key)
			if (old !== undefined && canonical(old) === canonical(row.data)) continue
			const path = join(dir, `${row.key}.json`)
			const format = existsSync(path) ? readJsonKeepingFormat(path) : { indent: 1, newline: false }
			writeJsonKeepingFormat(path, restore(row), format.indent, format.newline)
			wrote = true
		}
		// ponytail: a record deleted in the admin is not deleted from the folder; remove the file by hand.
		return wrote
	}
	const path = join(DATASETS, def.source.file)
	const file = readJsonKeepingFormat(path)
	const current = (def.source.path ? file.data[def.source.path] : file.data) as unknown[]
	const items = ordered.map(restore)
	if (items.length === current.length && items.every((item, i) => canonical(item) === canonical(current[i])))
		return false
	if (def.source.path) file.data[def.source.path] = items
	else file.data = items
	writeJsonKeepingFormat(path, file.data, file.indent, file.newline)
	return true
}
