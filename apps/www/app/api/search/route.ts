import type { NextRequest } from 'next/server'
import { search } from '../../_lib/search-index'

/* Search across every workspace, for the /search page. */
export function GET(request: NextRequest) {
	const q = request.nextUrl.searchParams.get('q')?.slice(0, 120) ?? ''
	return Response.json(search(q))
}
