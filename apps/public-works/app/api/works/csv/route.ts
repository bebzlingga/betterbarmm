import { csvResponse } from '@betterbarmm/editorial/csv'
import type { NextRequest } from 'next/server'
import { matchWorks, worksQuery } from '../../../_lib/works'

/* The projects the explorer is showing, every page, as a CSV. */
export function GET(request: NextRequest) {
	return csvResponse(
		'barmm-public-works',
		['fiscal year', 'project', 'amount (PHP)', 'kind', 'town', 'province or area', 'Act heading', 'Act page', 'likely bid notice', 'notice title', 'notice date', 'notice budget (PHP)'],
		matchWorks(worksQuery(request.nextUrl.searchParams)).map((w) => [
			w.year,
			w.name,
			w.amount,
			w.kinds.join('; '),
			w.town?.name,
			w.areaName,
			w.heading,
			w.sourcePage,
			w.notice?.ref,
			w.notice?.title,
			w.notice?.date,
			w.notice?.budget,
		]),
	)
}
