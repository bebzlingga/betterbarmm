import { searchIndex } from '../../_lib/directory-index'

// Built once at build time; the directory search fetches it when the reader first types.
export const dynamic = 'force-static'

export function GET() {
	return Response.json(searchIndex())
}
