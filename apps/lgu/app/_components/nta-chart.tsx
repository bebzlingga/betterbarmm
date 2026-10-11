import { finances, row } from '@betterbarmm/lgu-data/fiscal'

/**
 * A province's or town's own National Tax Allotment, year by year: one series, so one hue and
 * no legend, the figure printed over each column and the exact one on hover.
 * A year with no report is drawn as a gap with a dash, never as zero.
 */
export function NtaChart({ unitKey }: { unitKey: string }) {
	const years = finances.years.map((year) => ({
		year,
		nta: (row(finances, unitKey, year)?.nta as number | null | undefined) ?? null,
	}))
	if (!years.some((one) => one.nta)) return null
	const top = Math.max(...years.map((one) => one.nta ?? 0))
	const short = (value: number) =>
		value >= 1e9 ? `₱${(value / 1e9).toFixed(2)}B` : `₱${(value / 1e6).toFixed(1)}M`
	// Ten columns on a phone leave about 34px each: no peso sign, whole millions.
	const tiny = (value: number) => (value >= 1e9 ? `${(value / 1e9).toFixed(2)}B` : `${Math.round(value / 1e6)}M`)

	return (
		<figure className='m-0 mt-10'>
			<figcaption className='mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
				<h2 className='font-[family-name:var(--font-display)] text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>National Tax Allotment, by year</h2>
				<span className='text-[12.5px] text-[var(--ink-3)]'>
					Reported to BLGF. FY {finances.years.at(-1)} is preliminary.
				</span>
			</figcaption>
			<div className='grid h-44 items-end gap-1.5 sm:gap-4' style={{ gridTemplateColumns: `repeat(${years.length}, minmax(0, 1fr))` }}>
				{years.map(({ year, nta }) => (
					// The label rides on top of its bar; the bar's height is a share of
					// the track under the label row, so the tallest one never overruns.
					<div key={year} className='flex h-full flex-col items-center justify-end pt-6'>
						<div className='flex w-full flex-1 flex-col items-center justify-end'>
							<span className='num mb-1.5 whitespace-nowrap text-[9.5px] text-[var(--ink-2)] sm:text-[12.5px]'>
								<span className='sm:hidden'>{nta ? tiny(nta) : '—'}</span>
								<span className='hidden sm:inline'>{nta ? short(nta) : '—'}</span>
							</span>
							{nta ? (
								<div
									className='w-full max-w-16'
									style={{
										height: `calc(${(nta / top) * 100}% - 1.5rem)`,
										minHeight: '2px',
										background: 'var(--accent)',
									}}
									title={`FY ${year}: ₱${nta.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
								/>
							) : (
								<div className='h-px w-full max-w-16 bg-[var(--rule)]' aria-hidden='true' />
							)}
						</div>
					</div>
				))}
			</div>
			<div className='grid gap-1.5 border-t border-[var(--rule)] pt-2 sm:gap-4' style={{ gridTemplateColumns: `repeat(${years.length}, minmax(0, 1fr))` }}>
				{years.map(({ year }) => (
					<span key={year} className='num text-center text-[10.5px] text-[var(--ink-3)] sm:text-[12px]'>
						<span className='sm:hidden'>’{String(year).slice(2)}</span>
						<span className='hidden sm:inline'>{year}</span>
					</span>
				))}
			</div>
		</figure>
	)
}
