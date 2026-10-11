import type { NextRequest } from 'next/server'
import { entityBySlug, searchNotices } from '../../_lib/philgeps'

/* A page of notices for the explorer: newest first, filtered on the server
   so the 127,000 never cross to the browser. */
export function GET(request: NextRequest) {
	const p = request.nextUrl.searchParams
	const entity = p.get('entity') ? entityBySlug.get(p.get('entity')!)?.index : undefined
	if (p.get('entity') && entity == null) return Response.json({ error: 'Unknown entity' }, { status: 404 })
	const year = Number(p.get('year')) || undefined
	return Response.json(
		searchNotices({
			entity,
			q: p.get('q')?.slice(0, 200) ?? undefined,
			year,
			group: p.get('group') ?? undefined,
			supplier: p.get('supplier') ?? undefined,
			awarded: p.get('awarded') === '1',
			page: Math.max(1, Number(p.get('page')) || 1),
		}),
	)
}
