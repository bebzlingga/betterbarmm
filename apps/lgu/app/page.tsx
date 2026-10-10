import { Counter, LineReveal, Rise } from '@betterbarmm/editorial'
import {
	lguAreas,
	lguCounts,
	lguData,
	lguProvinces,
	areaHref,
	type LguProvince,
} from '@betterbarmm/lgu-data'
import { rosterCoverage } from '@betterbarmm/lgu-data/barangay-officials'
import { finances, row } from '@betterbarmm/lgu-data/fiscal'
import { RegionMap } from './_components/region-map'
import { DataTable } from './_components/data-table'

/** District seats in the Bangsamoro Parliament, joined on by slug. */
function seatsFor(province: LguProvince): number | null {
	return lguAreas.find((area) => area.slug === province.slug)?.seats ?? null
}

function capitalOf(province: LguProvince): string | null {
	return province.municipalities.find((unit) => unit.isCapital)?.name ?? null
}

/**
 * The seven areas BARMM contains, as a table: the same measures for each,
 * read down a column to compare.
 */
function Areas() {
	return (
		<div className='mt-12'>
			<DataTable
				caption='The seven areas of the Bangsamoro region'
				nameLabel='Area'
				columns={[
					{ key: 'units', label: 'Cities and municipalities', format: 'int', hideBelow: 'sm' },
					{ key: 'barangays', label: 'Barangays', format: 'int' },
					{ key: 'captains', label: 'Captains on record', format: 'int', hideBelow: 'lg' },
					{ key: 'population', label: 'Population', format: 'int' },
					{ key: 'seats', label: 'Parliament seats', format: 'int', hideBelow: 'md' },
				]}
				rows={lguProvinces.map((province) => {
					const capital = capitalOf(province)
					return {
						key: province.slug,
						href: areaHref(province),
						name: province.name,
						meta: [province.kind, capital && capital !== province.name ? `capital ${capital}` : null]
							.filter(Boolean)
							.join(' · '),
						detail: province.note ?? undefined,
						values: {
							units: province.municipalities.length,
							barangays: province.barangayCount,
							captains: rosterCoverage(province.municipalities).listed,
							population: province.population,
							seats: seatsFor(province),
						},
					}
				})}
			/>
		</div>
	)
}

export default function LguHomePage() {
	const regionRoster = rosterCoverage(lguProvinces.flatMap((province) => province.municipalities))
	// The NTA the provinces, cities and towns themselves reported receiving in
	// BLGF's latest year; barangays' shares are paid to them and are not in it.
	const ntaYear = finances.years.at(-1)!
	const ntaTotal = Object.keys(finances.units).reduce(
		(sum, key) => sum + Number(row(finances, key, ntaYear)?.nta ?? 0),
		0,
	)

	return (
		<>
			{/* ---- Masthead ---- */}
			<section className='bb-lattice brand-bg relative overflow-hidden'>
				<span
					aria-hidden='true'
					className='bb-glow absolute -right-[10%] -top-[20%] size-[34rem]'
				/>

				<div className='bb-container relative grid items-center gap-12 py-[clamp(3.75rem,7vw,6.5rem)] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]'>
					<div>
					<Rise distance={14}>
						<p className='bb-label'>Local government in the Bangsamoro</p>
					</Rise>

					<LineReveal
						lines={['Every province,', 'every town,', 'and who runs it.']}
						delay={0.08}
						className='bb-display mt-7 text-[var(--ink)]'
					/>
					</div>

					{/* Every drawn area is a link to its page. */}
					<Rise delay={0.3} distance={14} className='hidden lg:block lg:pt-12'>
						<RegionMap />
					</Rise>

					<Rise delay={0.55} distance={14} className='mt-6 lg:col-span-2 lg:mt-12'>
						<dl className='grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-6'>
							{/* Every figure here is the directory's own, summed from the units
							    it can actually open. PSA's regional totals are larger and
							    count different things; the note under the areas below says
							    exactly how much larger and why, rather than the page picking
							    one and hoping. */}
							{[
								{
									value: lguProvinces.length,
									label: 'Provinces, city and special area',
									group: false,
								},
								{
									value: lguData.totals.lgus,
									label: 'Cities and municipalities',
									group: false,
								},
								{
									value: lguData.totals.barangays,
									label: 'Barangays',
									group: true,
								},
								{
									value: regionRoster.listed,
									label: 'Barangay captains on record',
									group: true,
								},
								{
									value: lguData.totals.population,
									label: 'People, 2024 census',
									group: true,
								},
								{
									value: Math.round(ntaTotal / 1e8) / 10,
									label: `NTA to its LGUs, FY ${ntaYear}`,
									group: false,
									prefix: '₱',
									suffix: 'B',
									decimals: 1,
								},
							].map((fact) => (
								<div key={fact.label} className='border-t border-[var(--brass-line)] pt-6'>
									<dt className='sr-only'>{fact.label}</dt>
									<dd className='bb-figure-sm text-[var(--ink)]'>
										<Counter value={fact.value} group={fact.group} prefix={fact.prefix} suffix={fact.suffix} decimals={fact.decimals} />
									</dd>
									<p className='mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
										{fact.label}
									</p>
								</div>
							))}
						</dl>
					</Rise>
				</div>
			</section>

			{/* ---- The areas ---- */}
			<section className='bb-container bb-section'>
				<div className='grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-16'>
					<h2 className='bb-display-sm text-[var(--ink)]'>
						{lguData.totals.provinces} provinces, a city and a special area
					</h2>
					<p className='text-[15px] leading-7 text-[var(--ink-2)]'>
						Open an area to see its cities, municipalities, barangays and officials.
					</p>
				</div>

				<Areas />

				{/* The numbers here and PSA's do not agree, and saying which is which
				    is the whole job — so it is shown, not folded away (user decision). */}
				<aside className='mt-10 bg-[var(--paper-2)] px-6 py-6 sm:px-8'>
					<h3 className='text-[15px] font-semibold text-[var(--ink)]'>Why this total is smaller than PSA&rsquo;s</h3>
					<div className='mt-3 space-y-3 text-[14px] leading-7 text-[var(--ink-2)]'>
						<p>{lguCounts.sulnote}</p>
						<p>{lguCounts.reconcileNote}</p>
					</div>
				</aside>
			</section>

		</>
	)
}
