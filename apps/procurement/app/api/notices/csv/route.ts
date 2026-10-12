import { csvResponse } from '@betterbarmm/editorial/csv'
import type { NextRequest } from 'next/server'
import { entities, entityBySlug, matchNotices } from '../../../_lib/philgeps'

/* The notices the explorer is showing — same filters — as a CSV, one row per
   notice, its awards joined into the last columns. */
export function GET(request: NextRequest) {
	const p = request.nextUrl.searchParams
	const entity = p.get('entity') ? entityBySlug.get(p.get('entity')!)?.index : undefined
	const rows = matchNotices({
		entity,
		q: p.get('q')?.slice(0, 200) ?? undefined,
		year: Number(p.get('year')) || undefined,
		group: p.get('group') ?? undefined,
		supplier: p.get('supplier') ?? undefined,
		stage: p.get('stage') ?? undefined,
		mode: p.get('mode') ?? undefined,
		fund: p.get('fund') ?? undefined,
	})
	return csvResponse(
		`barmm-bid-notices${p.get('entity') ? `-${p.get('entity')}` : ''}`,
		['reference', 'posted', 'office', 'title', 'category', 'category group', 'approved budget (PHP)', 'mode', 'source of funds', 'stage', 'closing', 'awarded to', 'awarded amount (PHP)', 'award date'],
		rows.map((n) => [
			n.ref,
			n.date,
			entities[n.entity]!.name,
			n.title,
			n.category,
			n.group,
			n.abc,
			n.mode,
			n.fund === 'Not published' ? null : n.fund,
			n.stage,
			n.closing,
			n.awards.map((a) => a.awardee).join('; '),
			n.awards.length ? n.awards.reduce((s, a) => s + (a.amount ?? 0), 0) : null,
			n.awards.map((a) => a.date).filter(Boolean).join('; '),
		]),
	)
}
