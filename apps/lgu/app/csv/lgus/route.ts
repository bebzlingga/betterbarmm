import { csvResponse } from '@betterbarmm/editorial/csv'
import { lguProvinces } from '@betterbarmm/lgu-data'
import { finances, funds, row } from '@betterbarmm/lgu-data/fiscal'

/* What the Finances page ranks, as a CSV: one row per province, city or
   town per year, from the treasurers' reports to BLGF. */

const FIELDS = [
	['localSources', 'local taxes and fees (PHP)'],
	['nta', 'NTA (PHP)'],
	['operatingIncome', 'operating income (PHP)'],
	['operatingExpenditures', 'operating expenditures (PHP)'],
	['capitalOutlay', 'capital outlay (PHP)'],
	['borrowings', 'borrowings (PHP)'],
] as const

export function GET() {
	const units = lguProvinces.flatMap((p) => [
		...(p.kind === 'Province' ? [{ key: p.slug, area: p.name, name: p.name, type: 'Province', psgc: p.psgc, population: p.population }] : []),
		...p.municipalities.map((m) => ({
			key: `${p.slug}/${m.slug}`,
			area: p.name,
			name: m.name,
			type: m.isCity ? 'City' : 'Municipality',
			psgc: m.psgc,
			population: m.population,
		})),
	])
	const rows = units.flatMap((u) =>
		finances.years.flatMap((year) => {
			const sre = row(finances, u.key, year)
			if (!sre) return []
			const dependency = row(funds.dependency, u.key, year)?.ntaDependency
			return [[u.area, u.name, u.type, u.psgc, u.population, year, ...FIELDS.map(([f]) => sre[f] as number | null), typeof dependency === 'number' ? dependency : null]]
		}),
	)
	return csvResponse(
		'barmm-lgu-finances',
		['province or area', 'name', 'type', 'psgc', 'population', 'year', ...FIELDS.map(([, label]) => label), 'NTA share of regular income'],
		rows,
	)
}
