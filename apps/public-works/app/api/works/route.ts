import type { NextRequest } from 'next/server'
import { searchWorks, worksQuery } from '../../_lib/works'

/* A page of projects for the explorer. */
export function GET(request: NextRequest) {
	const p = request.nextUrl.searchParams
	return Response.json(searchWorks({ ...worksQuery(p), page: Math.max(1, Number(p.get('page')) || 1) }))
}
