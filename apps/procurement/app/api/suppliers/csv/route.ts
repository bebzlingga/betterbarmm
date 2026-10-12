import { csvResponse } from '@betterbarmm/editorial/csv'
import { suppliers } from '../../../_lib/philgeps'

/* Every supplier PhilGEPS records winning a contract from a BARMM office. */
export function GET() {
	return csvResponse(
		'barmm-suppliers',
		['supplier', 'category group', 'contracts won', 'awarded amount (PHP)', 'offices', 'last award'],
		suppliers.map((s) => [s.name, s.group, s.awards, Math.round(s.amount), s.entities.size, s.last]),
	)
}
