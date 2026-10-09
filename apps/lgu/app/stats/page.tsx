import type { Metadata } from 'next'
import { lguProvinces, unitClass } from '@betterbarmm/lgu-data'
import { finances, funds, incomeClass, row } from '@betterbarmm/lgu-data/fiscal'
import { LguBreadcrumb, LguMasthead } from '../_components/lgu-parts'
import { StatsExplorer, type StatsData, type StatsUnit } from '../_components/stats-explorer'

export const metadata: Metadata = {
	title: 'LGU stats — Local government directory',
	description:
		'Every BARMM province, city and municipality ranked on what it collects and spends: local taxes, revenue per person, the NTA and how much of its income it is, spending, capital outlay and borrowing, FY 2020 to 2025.',
}

/* The SRE lines the ranking reads, and the order they travel in. */
const FIELDS = ['localSources', 'nta', 'ntaDependency', 'operatingIncome', 'operatingExpenditures', 'capitalOutlay', 'borrowings']

export default function StatsPage() {
	const units: StatsUnit[] = lguProvinces.flatMap((province) => [
		...(province.kind === 'Province'
			? [
					{
						key: province.slug,
						name: province.name,
						href: `/${province.slug}#finances`,
						level: 'province' as const,
						meta: 'Province',
						area: province.name,
						type: 'Province' as const,
						klass: incomeClass.units[province.slug]?.['2024']?.class ?? null,
					},
				]
			: []),
		...province.municipalities.map((unit) => ({
			key: `${province.slug}/${unit.slug}`,
			name: unit.name,
			href: `/${province.slug}/${unit.slug}#finances`,
			level: 'town' as const,
			meta: province.name === unit.name ? unitClass(unit) : `${unitClass(unit)} · ${province.name}`,
			area: province.name,
			type: unit.isCity ? ('City' as const) : ('Municipality' as const),
			klass: incomeClass.units[`${province.slug}/${unit.slug}`]?.['2024']?.class ?? null,
		})),
	])

	// Only what the table shows crosses to the browser: seven figures a year.
	const data: StatsData = {}
	for (const unit of units) {
		for (const year of finances.years) {
			const sre = row(finances, unit.key, year)
			if (!sre) continue
			const dependency = row(funds.dependency, unit.key, year)?.ntaDependency
			data[unit.key] ??= {}
			data[unit.key]![year] = FIELDS.map((field) =>
				field === 'ntaDependency' ? (typeof dependency === 'number' ? dependency : null) : (sre[field] as number | null),
			)
		}
	}

	return (
		<>
			<LguMasthead
				breadcrumb={<LguBreadcrumb trail={[]}>Stats</LguBreadcrumb>}
				kicker='The money · Bangsamoro'
				name='Who collects, who spends.'
				note='Every province, city and municipality on the same measures, from what each treasurer reported to the Bureau of Local Government Finance. Sort any column. These are actuals, not budgets: what a council appropriated is in its own ordinance, which nobody publishes together.'
			/>

			<section className='bb-container bb-section-bottom pt-12'>
				<StatsExplorer years={finances.years} fields={FIELDS} units={units} data={data} />

				<div className='mt-10 space-y-2 text-[13px] leading-6 text-[var(--ink-3)]'>
					<p>
						<strong className='font-semibold text-[var(--ink-2)]'>Local taxes and fees</strong> are what the
						unit raises itself: real property tax, business tax, fees and charges.{' '}
						<strong className='font-semibold text-[var(--ink-2)]'>NTA share of income</strong> is BLGF&rsquo;s
						own ratio of the National Tax Allotment to regular income.
					</p>
					<p>
						Source:{' '}
						<a href='https://blgf.gov.ph/lgu-fiscal-data/' target='_blank' rel='noreferrer' className='rule-link'>
							BLGF Statement of Receipts and Expenditures by LGU
						</a>
						, FY 2020–2025. Barangays file none, so they are not here; the eight Special Geographic Area
						towns, created in 2024, have no rows yet.
					</p>
				</div>
			</section>
		</>
	)
}
