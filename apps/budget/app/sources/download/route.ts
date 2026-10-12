import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { toCsv } from '@betterbarmm/editorial/csv'
import { type NextRequest } from 'next/server'
import { DOWNLOADS } from '../downloads'

/**
 * Serves one of the source files by name.
 *
 * The name is looked up in the allow-list rather than joined onto a path, so
 * `?file=../../.env` finds nothing instead of finding something.
 */
const datasetRoot = join(process.cwd(), '..', '..', 'datasets', 'budget')

export async function GET(request: NextRequest) {
	const wanted = request.nextUrl.searchParams.get('file')
	const file = DOWNLOADS.find((one) => one.file === wanted)
	if (!file) return new Response('No such file', { status: 404 })

	const path = join(datasetRoot, file.relativePath)

	let body: Buffer
	let size: number
	try {
		;[body, size] = await Promise.all([readFile(path), stat(path).then((info) => info.size)])
	} catch (error) {
		// Listed but not on disk — the PDFs are large and a deployment may not
		// carry all of them. Say so rather than returning a 500 nobody can read.
		console.error('A listed source file could not be read', file.file, error)
		return new Response('That file is listed but is not available here.', { status: 404 })
	}

	if (file.file.endsWith('.csv')) {
		const { line_items } = JSON.parse(body.toString('utf8')) as { line_items: Record<string, unknown>[] }
		const columns = ['id', 'item_type', 'agency', 'office', 'sector', 'cost_structure', 'program_path', 'name', 'personnel_services', 'mooe', 'capital_outlays', 'amount', 'source_page'] as const
		const csv = toCsv([...columns], line_items.map((row) => columns.map((c) => row[c] as string | number | null)))
		return new Response(csv, {
			headers: {
				'content-type': file.contentType,
				'content-disposition': `attachment; filename="${file.file}"`,
				'cache-control': 'public, max-age=3600',
			},
		})
	}

	return new Response(new Uint8Array(body), {
		headers: {
			'content-type': file.contentType,
			'content-length': String(size),
			'content-disposition': `attachment; filename="${file.file}"`,
			'cache-control': 'public, max-age=3600',
		},
	})
}
