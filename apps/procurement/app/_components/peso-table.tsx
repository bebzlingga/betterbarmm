'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { PesoRow } from '../_lib/peso'
import { Select } from '@betterbarmm/editorial'

/* Each office's money three ways, for one year or all of them: what the
   budget gave it to buy with, what it put out to bid, what was awarded. */

const peso = (n: number) =>
	n >= 1e9 ? `₱${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `₱${(n / 1e6).toFixed(1)}M` : n > 0 ? `₱${Math.round(n / 1e3).toLocaleString('en-PH')}K` : '—'

export function PesoTable({ rows, years }: { rows: PesoRow[]; years: number[] }) {
	const [year, setYear] = useState('')
	const pick = (o: Record<number, number>) => (year ? (o[+year] ?? 0) : Object.values(o).reduce((s, v) => s + v, 0))
	const data = rows
		.map((r) => ({ ...r, b: pick(r.budget), d: pick(r.bid), a: pick(r.awarded) }))
		.filter((r) => r.b || r.d)
		.sort((x, y) => y.b - x.b)
	const max = Math.max(...data.flatMap((r) => [r.b, r.d]), 1)

	return (
		<div>
			<div className='flex flex-wrap items-end justify-between gap-4 pb-16'>
				<div className='flex min-h-10 flex-wrap items-center gap-x-6 gap-y-2 text-[0.78125rem] text-[var(--ink-2)]'>
					<span className='inline-flex items-center gap-2'>
						<span className='h-2.5 w-4 rounded-full bg-[#b9b3a8]' aria-hidden='true' /> Budget to buy with
					</span>
					<span className='inline-flex items-center gap-2'>
						<span className='h-2.5 w-4 rounded-full bg-[var(--accent)]' aria-hidden='true' /> Put out to bid
					</span>
					<span className='inline-flex items-center gap-2'>
						<span className='h-2.5 w-4 rounded-full bg-[#d4a72c]' aria-hidden='true' /> Awarded on PhilGEPS
					</span>
				</div>
				<div className='w-40'>
					<Select label='Year' value={year} onChange={setYear} options={[['', 'All years'], ...[...years].reverse().map((y): [string, string] => [String(y), String(y)])]} />
				</div>
			</div>

			{/* A table (user decision): one row an office, the three amounts as bars across it and as figures in their own
			    columns, on a rounded card with its head on a warm tint. */}
			<div className='overflow-x-auto rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] shadow-[0_18px_40px_-34px_rgba(0,0,0,0.4)]'>
				<table className='w-full min-w-[40rem] border-collapse text-left'>
					<thead>
						<tr className='border-b border-[var(--rule)] bg-[color-mix(in_srgb,var(--accent)_5%,var(--paper))]'>
							<th scope='col' className='py-4 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] pl-6 pr-6'>Office</th>
							<th scope='col' className='py-4 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] hidden w-[34%] pr-8 lg:table-cell'>
								<span className='sr-only'>Budget, bid out and awarded, drawn</span>
							</th>
							<th scope='col' className='py-4 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] whitespace-nowrap pr-6 text-right'>Budget</th>
							<th scope='col' className='py-4 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] whitespace-nowrap pr-6 text-right'>Bid out</th>
							<th scope='col' className='py-4 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] whitespace-nowrap pr-6 text-right'>Awarded</th>
						</tr>
					</thead>
					<tbody>
						{data.map((r) => (
							<tr key={r.key} className='border-b border-[var(--rule-soft)] align-middle transition-colors last:border-b-0 hover:bg-[var(--paper-2)]'>
								<th scope='row' className='py-4 pl-6 pr-6 font-normal'>
									<span className='block text-[0.9375rem] font-semibold leading-6 text-[var(--ink)]'>{r.name}</span>
									<span className='mt-0.5 block text-[0.8125rem] leading-5 text-[var(--ink-3)]'>
										{r.offices.length === 1 ? (
											<Link href={`/${r.offices[0]!.slug}`} className='rule-link'>
												Its notices
											</Link>
										) : (
											<>
												{r.offices.length} offices on PhilGEPS ·{' '}
												<Link href={`/${r.offices[0]!.slug}`} className='rule-link'>
													the largest
												</Link>
											</>
										)}
									</span>
								</th>
								{/* Each amount on a track of its own across the column, so the three read against one scale; a
								    small amount shows as a dot, not a sliver; each names its amount under the pointer. */}
								<td className='hidden py-4 pr-8 lg:table-cell'>
									<span className='grid gap-[5px]' aria-hidden='true'>
										{(
											[
												[r.b, 'bg-[#b9b3a8]', 'Budget'],
												[r.d, 'bg-[var(--accent)]', 'Bid out'],
												[r.a, 'bg-[#d4a72c]', 'Awarded'],
											] as const
										).map(([v, fill, what]) => (
											<span key={what} title={`${what}: ${peso(v)}`} className='relative block h-2.5 rounded-full bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]'>
												{v > 0 ? <span className={`absolute inset-y-0 left-0 min-w-2.5 rounded-full ${fill}`} style={{ width: `${(v / max) * 100}%` }} /> : null}
											</span>
										))}
									</span>
								</td>
								<td className='num whitespace-nowrap py-4 pr-6 text-right text-[0.9375rem] font-bold text-[var(--ink)]'>{peso(r.b)}</td>
								<td className='num whitespace-nowrap py-4 pr-6 text-right text-[0.9375rem] font-bold text-[var(--ink)]'>{peso(r.d)}</td>
								<td className='num whitespace-nowrap py-4 pr-6 text-right text-[0.9375rem] font-bold text-[var(--ink)]'>{peso(r.a)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}
