import { csvResponse } from '@betterbarmm/editorial/csv'
import type { CategorySlug } from '../../_lib/categories'
import { getOfficialMeasuresByCategory } from '../../_lib/official-measures'

/* Parliament's own list of a kind of measure, as a CSV: number, title, status,
   date, authors and history, one measure per row. */

const KINDS: Partial<Record<string, CategorySlug[]>> = {
	acts: ['acts'],
	bills: ['bills'],
	resolutions: ['adopted-resolutions', 'proposed-resolutions'],
	'adopted-resolutions': ['adopted-resolutions'],
	'proposed-resolutions': ['proposed-resolutions'],
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const kinds = KINDS[slug]
	if (!kinds) return new Response('No such list', { status: 404 })
	const rows = kinds.flatMap((k) => getOfficialMeasuresByCategory(k).map((m) => ({ ...m, kind: k })))
	return csvResponse(
		`bangsamoro-${slug}`,
		['kind', 'number', 'title', 'status', 'date', 'principal authors', 'co-authors', 'committee referrals', 'became act', 'history', 'parliament page'],
		rows.map((m) => [
			m.kind,
			m.number,
			m.title,
			m.status,
			m.dateIso,
			m.principalAuthors.join('; '),
			m.coAuthors.join('; '),
			m.committeeReferrals,
			m.becameAct,
			m.history.join('; '),
			m.url,
		]),
	)
}
