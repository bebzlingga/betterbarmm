import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
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

	return new Response(new Uint8Array(body), {
		headers: {
			'content-type': file.contentType,
			'content-length': String(size),
			'content-disposition': `attachment; filename="${file.file}"`,
			'cache-control': 'public, max-age=3600',
		},
	})
}
