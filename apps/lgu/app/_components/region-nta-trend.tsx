import { finances, row } from '@betterbarmm/lgu-data/fiscal'
import { ntaShares } from '@betterbarmm/lgu-data/nta'

/* What all of BARMM's local governments reported receiving as NTA, year by
   year. The old Maguindanao province, filed apart before its 2022 split, is
   added in; the count of units reporting each year is printed with it. */
const NTA_TREND = finances.years.map((year) => {
	let total = 0
	let units = 0
	for (const table of [finances.units, finances.former]) {
		for (const key of Object.keys(table)) {
			const nta = Number(row({ ...finances, units: table }, key, year)?.nta) || 0
			if (nta) {
				total += nta
				units += 1
			}
		}
	}
	return { year, total, units, allocated: false }
})

// DBM's FY 2026 allocation to the same units: provinces, cities and towns, barangays left out.
const ALLOCATED = 2026
NTA_TREND.push({
	year: ALLOCATED,
	total: Object.values(ntaShares.units).reduce((t, u) => t + (u.province?.[ALLOCATED] ?? 0) + (u.lgu?.[ALLOCATED] ?? 0), 0),
	units: Object.keys(ntaShares.units).length,
	allocated: true,
})

export function RegionNtaTrend() {
	const top = Math.max(...NTA_TREND.map((y) => y.total))
	const cols = { gridTemplateColumns: `repeat(${NTA_TREND.length}, minmax(0, 1fr))` }
	return (
		<figure className='m-0 mt-16 lg:mt-20'>
			<div className='grid h-48 items-end gap-1.5 sm:gap-4' style={cols}>
				{NTA_TREND.map(({ year, total, allocated }) => (
					<div key={year} className='flex h-full flex-col items-center justify-end'>
						<span className='num mb-1.5 whitespace-nowrap text-[9.5px] text-[var(--ink-2)] sm:text-[12.5px]'>
							<span className='sm:hidden'>{(total / 1e9).toFixed(1)}B</span>
							<span className='hidden sm:inline'>₱{(total / 1e9).toFixed(1)}B</span>
						</span>
						<div
							className='w-full max-w-16'
							style={{
								height: `calc(${(total / top) * 100}% - 1.5rem)`,
								background: 'linear-gradient(to top, transparent, var(--accent))',
								opacity: allocated ? 0.5 : 1,
							}}
							title={`FY ${year}: ₱${total.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`}
						/>
					</div>
				))}
			</div>
			<div className='grid gap-1.5 border-t border-[var(--rule)] pt-2 sm:gap-4' style={cols}>
				{NTA_TREND.map(({ year }) => (
					<span key={year} className='num text-center text-[10.5px] text-[var(--ink-3)] sm:text-[12px]'>
						<span className='sm:hidden'>’{String(year).slice(2)}</span>
						<span className='hidden sm:inline'>{year}</span>
					</span>
				))}
			</div>
			<figcaption className='mt-4 flex flex-wrap items-baseline justify-between gap-2'>
				<span className='text-[12.5px] font-semibold text-[var(--ink)]'>
					National Tax Allotment received by BARMM’s local governments, by year
				</span>
				<span className='text-[11px] text-[var(--ink-3)]'>
					Reported to BLGF by {Math.min(...NTA_TREND.map((y) => y.units))}–{Math.max(...NTA_TREND.filter((y) => !y.allocated).map((y) => y.units))}{' '}
					units a year; FY {finances.years.at(-1)} is preliminary. FY {ALLOCATED}, lighter, is DBM&rsquo;s allocation to all {NTA_TREND.at(-1)!.units}. The 2022 jump is the Mandanas ruling.
				</span>
			</figcaption>
		</figure>
	)
}
