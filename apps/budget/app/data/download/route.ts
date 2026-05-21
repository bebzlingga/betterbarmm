import { readFile, stat } from 'node:fs/promises'
import { join, normalize } from 'node:path'
import { type NextRequest } from 'next/server'
import { budgetDataFiles } from '../../_lib/budget-data-files'

const datasetRoot = join(process.cwd(), '..', '..', 'datasets', 'budget')

function downloadHeaders(file: (typeof budgetDataFiles)[number], size: number) {
	const downloadName = file.file.replaceAll('BAA', 'GAAB')

	return {
		'content-type': file.contentType,
		'content-length': String(size),
		'content-disposition': `attachment; filename="${downloadName}"`,
		'cache-control': 'public, max-age=3600',
	}
}

export async function GET(request: NextRequest) {
	const requestedFile = request.nextUrl.searchParams.get('file')
	const file = budgetDataFiles.find((item) => item.file === requestedFile)

	if (!file) {
		return new Response('File not found', { status: 404 })
	}

	const filePath = normalize(join(datasetRoot, file.relativePath))
	const fileStats = await stat(filePath)
	const body = await readFile(filePath)

	return new Response(new Uint8Array(body), {
		headers: downloadHeaders(file, fileStats.size),
	})
}
