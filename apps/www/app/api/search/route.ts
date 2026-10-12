import type { NextRequest } from 'next/server'
import { search } from '../../_lib/search-index'

/* Search across every workspace, for the /search page and the search box in
   every workspace's strip — which asks from its own subdomain, hence the header. */
export function GET(request: NextRequest) {
	const q = request.nextUrl.searchParams.get('q')?.slice(0, 120) ?? ''
	return Response.json(search(q), { headers: { 'Access-Control-Allow-Origin': '*' } })
}
