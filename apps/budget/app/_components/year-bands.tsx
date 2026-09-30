import { peso, percent } from '@betterbarmm/budget-data'

/* ============================================================
   One Act to a row, divided

   The workspace's stacked bar, run down the seven years instead
   of across one Act. It answers the question a column of totals
   cannot: the region's money did not only get bigger, it changed
   shape — and a share that moves fifteen points is invisible in a
   figure that is rising anyway.

   The same `.split-bar` the office pages use, so a division of a
   peso looks the same everywhere on the site. Identity is never
   color alone: every segment carries its name and its figure in
   the row's accessible text and in its own `title`, and the
   legend above prints the names once.
   ============================================================ */

export type Band = { key: string; label: string; tone: string; amount: number }

export function YearBands({
	rows,
	legend,
}: {
	rows: { year: number; bands: Band[]; note?: string }[]
	/** The names of the bands, printed once above the rows. */
	legend: { label: string; tone: string }[]
}) {
	return (
		<div className='mt-10'>
			<p className='flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
				{legend.map((one) => (
					<span key={one.label} className='flex items-center gap-2'>
						<span
							aria-hidden='true'
							className='size-2.5 shrink-0 rotate-45'
							style={{ background: one.tone }}
						/>
						{one.label}
					</span>
				))}
			</p>

			<dl className='mt-6'>
				{rows.map((row) => {
					const whole = row.bands.reduce((sum, band) => sum + band.amount, 0) || 1

					return (
						<div
							key={row.year}
							className='grid items-center gap-x-8 gap-y-2 border-t border-[var(--rule)] py-4 sm:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,13rem)]'
						>
							<dt className='money font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
								FY {row.year}
							</dt>

							<dd
								className='split-bar'
								role='img'
								aria-label={`FY ${row.year}: ${row.bands
									.map(
										(band) =>
											`${band.label}, ${peso(band.amount)}, ${percent((band.amount / whole) * 100)}`,
									)
									.join('; ')}`}
							>
								{row.bands
									.filter((band) => band.amount > 0)
									.map((band) => (
										<div
											key={band.key}
											className='split-bar-seg'
											style={{ width: `${(band.amount / whole) * 100}%`, background: band.tone }}
											title={`${band.label} — ${peso(band.amount)} (${percent(
												(band.amount / whole) * 100,
											)})`}
										/>
									))}
							</dd>

							<dd className='money font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-3)] sm:text-right'>
								{row.note ?? ''}
							</dd>
						</div>
					)
				})}
			</dl>
		</div>
	)
}
