'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { PesoRow } from '../_lib/peso'
import { Select } from './controls'

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
			<div className='flex flex-wrap items-end justify-between gap-4 pb-10'>
				<div className='flex min-h-10 flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-[var(--ink-2)]'>
					<span className='inline-flex items-center gap-2'>
						<span className='h-2.5 w-4 bg-[var(--ink-mute)] opacity-50' aria-hidden='true' /> Budget to buy with
					</span>
					<span className='inline-flex items-center gap-2'>
						<span className='h-2.5 w-4 bg-[var(--accent)]' aria-hidden='true' /> Put out to bid
					</span>
					<span className='inline-flex items-center gap-2'>
						<span className='h-2.5 w-4 bg-[var(--ink)]' aria-hidden='true' /> Awarded on PhilGEPS
					</span>
				</div>
				<div className='w-40'>
					<Select label='Year' value={year} onChange={setYear} options={[['', 'All years'], ...[...years].reverse().map((y): [string, string] => [String(y), String(y)])]} />
				</div>
			</div>

			<ol className='border-t border-[var(--rule)]'>
				{data.map((r) => (
					<li key={r.key} className='grid gap-x-10 gap-y-3 border-b border-[var(--rule)] py-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)_14rem]'>
						<div className='min-w-0'>
							<p className='text-[14.5px] font-semibold leading-6 text-[var(--ink)]'>{r.name}</p>
							<p className='mt-1 text-[12px] leading-5 text-[var(--ink-3)]'>
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
							</p>
						</div>
						<div className='grid content-center gap-1.5' aria-hidden='true'>
							<span className='h-2.5 bg-[var(--ink-mute)] opacity-50' style={{ width: `${(r.b / max) * 100}%` }} />
							<span className='h-2.5 bg-[var(--accent)]' style={{ width: `${(r.d / max) * 100}%` }} />
							<span className='h-2.5 bg-[var(--ink)]' style={{ width: `${(r.a / max) * 100}%` }} />
						</div>
						<dl className='grid grid-cols-3 gap-3 text-[12px] lg:grid-cols-1 lg:gap-1 lg:text-right'>
							<div className='lg:flex lg:justify-end lg:gap-2'>
								<dt className='text-[var(--ink-3)]'>Budget</dt>
								<dd className='num font-semibold text-[var(--ink)]'>{peso(r.b)}</dd>
							</div>
							<div className='lg:flex lg:justify-end lg:gap-2'>
								<dt className='text-[var(--ink-3)]'>Bid out</dt>
								<dd className='num font-semibold text-[var(--ink)]'>{peso(r.d)}</dd>
							</div>
							<div className='lg:flex lg:justify-end lg:gap-2'>
								<dt className='text-[var(--ink-3)]'>Awarded</dt>
								<dd className='num font-semibold text-[var(--ink)]'>{peso(r.a)}</dd>
							</div>
						</dl>
					</li>
				))}
			</ol>
		</div>
	)
}
