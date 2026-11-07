import { csvResponse } from '@betterbarmm/editorial/csv'
import type { NextRequest } from 'next/server'
import { matchNational, nationalQuery } from '../../../_lib/dpwh'

/* The DPWH projects the explorer is showing, every page, as a CSV. */
export function GET(request: NextRequest) {
	return csvResponse(
		'dpwh-projects-in-barmm',
		['contract ID', 'project', 'category', 'status', 'progress (%)', 'contract cost (PHP)', 'approved budget (PHP)', 'award (PHP)', 'contractor', 'bidders', 'infra year', 'start', 'completion', 'source of funds', 'implementing office', 'town', 'province or area', 'placed by', 'latitude', 'longitude'],
		matchNational(nationalQuery(request.nextUrl.searchParams)).map((w) => [
			w.id,
			w.name,
			w.category,
			w.status,
			w.progress,
			w.cost,
			w.abc,
			w.award,
			w.contractor,
			w.bidders.map((b) => b.name).join('; '),
			w.year,
			w.start,
			w.end,
			w.funds,
			w.office,
			w.town.name,
			w.areaName,
			w.located,
			w.lat,
			w.lon,
		]),
	)
}
