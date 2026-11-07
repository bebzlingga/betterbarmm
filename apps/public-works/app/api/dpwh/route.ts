import type { NextRequest } from 'next/server'
import { nationalQuery, searchNational } from '../../_lib/dpwh'

/* A page of DPWH projects for the explorer. */
export function GET(request: NextRequest) {
	const p = request.nextUrl.searchParams
	return Response.json(searchNational({ ...nationalQuery(p), page: Math.max(1, Number(p.get('page')) || 1) }))
}
