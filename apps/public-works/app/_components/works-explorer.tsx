'use client'

import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import type { Work } from '../_lib/works'
import { SearchField, Select } from './controls'

/* Every project, filtered on the server and fetched a page at a time. */

type Page = { count: number; total: number; withNotice: number; page: number; pages: number; rows: Work[] }

const peso = (n: number) => (n >= 1e9 ? `₱${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `₱${(n / 1e6).toFixed(1)}M` : `₱${Math.round(n).toLocaleString('en-PH')}`)
const longDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

const PROC = 'https://procurement.betterbarmm.com'
const LGU = 'https://lgu.betterbarmm.com'

export function WorksExplorer({
	years,
	areas,
	kinds,
	initial = {},
}: {
	years: number[]
	areas: string[]
	kinds: string[]
	initial?: { area?: string; q?: string }
}) {
	const [typed, setTyped] = useState(initial.q ?? '')
	const [q, setQ] = useState(initial.q ?? '')
	const [year, setYear] = useState('')
	const [area, setArea] = useState(initial.area ?? '')
	const [kind, setKind] = useState('')
	const [notice, setNotice] = useState('')
	const [sort, setSort] = useState('amount')
	const [page, setPage] = useState(1)
	const [data, setData] = useState<Page | null>(null)

	useEffect(() => {
		const t = setTimeout(() => {
			setQ(typed)
			setPage(1)
		}, 250)
		return () => clearTimeout(t)
	}, [typed])

	const params = new URLSearchParams(
		Object.entries({ q, year, area, kind, notice, sort }).filter((e): e is [string, string] => Boolean(e[1])),
	)

	useEffect(() => {
		const controller = new AbortController()
		fetch(`/api/works?${params}&page=${page}`, { signal: controller.signal })
			.then((r) => r.json())
			.then(setData)
			.catch(() => {})
		return () => controller.abort()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [q, year, area, kind, notice, sort, page])

	const reset = (fn: () => void) => {
		fn()
		setPage(1)
	}

	return (
		<div className='@container'>
			<div className='grid grid-cols-2 items-end gap-3 pb-6 @2xl:grid-cols-5 @2xl:gap-4 @5xl:grid-cols-[minmax(0,1fr)_repeat(5,10rem)] lg:pb-8'>
				<div className='col-span-full @5xl:col-span-1'>
					<SearchField value={typed} onChange={setTyped} placeholder='Project, barangay, town or notice number' />
				</div>
				<Select label='Year' value={year} onChange={(v) => reset(() => setYear(v))} options={[['', 'All years'], ...[...years].reverse().map((y): [string, string] => [String(y), `FY ${y}`])]} />
				<Select label='Where' value={area} onChange={(v) => reset(() => setArea(v))} options={[['', 'Everywhere'], ...areas.map((a): [string, string] => [a, a])]} />
				<Select label='Kind' value={kind} onChange={(v) => reset(() => setKind(v))} options={[['', 'All kinds'], ...kinds.map((k): [string, string] => [k, k])]} />
				<Select label='Bid notice' value={notice} onChange={(v) => reset(() => setNotice(v))} options={[['', 'All projects'], ['1', 'With a likely notice']]} />
				<Select label='Sort' value={sort} onChange={(v) => reset(() => setSort(v))} options={[['amount', 'Largest first'], ['year', 'Newest first']]} />
			</div>

			<div className='mb-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-y border-[var(--rule-soft)] py-3 text-[13px] text-[var(--ink-3)]'>
				<a href={`/api/works/csv?${params}`} className='rule-link font-semibold text-[var(--ink)]' download>
					Download CSV
				</a>
				<p className='text-right'>
					{data ? (
						<>
							<span className='num font-semibold text-[var(--ink)]'>{data.count.toLocaleString('en-PH')}</span> projects ·{' '}
							<span className='num font-semibold text-[var(--ink)]'>{peso(data.total)}</span> appropriated ·{' '}
							<span className='num font-semibold text-[var(--ink)]'>{data.withNotice.toLocaleString('en-PH')}</span> with a likely bid notice
						</>
					) : (
						'Loading…'
					)}
				</p>
			</div>

			<ul className={data ? '' : 'opacity-50'}>
				{data?.rows.map((w) => (
					<li key={w.id} className='grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-5 border-b border-[var(--rule)] py-4 sm:gap-x-16'>
						<div className='min-w-0'>
							<p className='font-[family-name:var(--font-display)] text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>
								{w.kinds.join(' · ') || 'Works'}
							</p>
							<p className='mt-1 text-[14.5px] font-semibold leading-6 text-[var(--ink)]'>{w.name}</p>
							<p className='mt-1 text-[12px] leading-5 text-[var(--ink-3)]'>
								{`FY ${w.year} · `}
								{w.town && w.area ? (
									<a href={`${LGU}/${w.area}/${w.town.slug}`} className='rule-link'>
										{w.town.name}, {w.areaName}
									</a>
								) : (
									w.areaName
								)}
								{w.sourcePage ? ` · Act page ${w.sourcePage}` : ''}
							</p>
							{w.notice ? (
								<p className='mt-2 text-[12.5px] leading-5 text-[var(--ink-2)]'>
									Likely bid notice{' '}
									<a href={`${PROC}/notices?q=${encodeURIComponent(w.notice.ref)}`} className='rule-link font-semibold'>
										{w.notice.ref}
									</a>
									{` · ${longDate(w.notice.date)}${w.notice.budget != null ? ` · ${peso(w.notice.budget)}` : ''}`}
								</p>
							) : null}
						</div>
						<p className='num text-right text-[16px] font-semibold text-[var(--ink)]'>{peso(w.amount)}</p>
					</li>
				))}
			</ul>

			{data && data.pages > 1 ? (
				<div className='mt-6 flex items-center justify-end gap-3 text-[13px] text-[var(--ink-3)]'>
					<button type='button' disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className='inline-flex size-9 cursor-pointer items-center justify-center border border-[var(--rule)] disabled:cursor-default disabled:opacity-40' aria-label='Previous page'>
						<CaretLeftIcon size={14} />
					</button>
					<span className='num'>
						Page {data.page.toLocaleString('en-PH')} of {data.pages.toLocaleString('en-PH')}
					</span>
					<button type='button' disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} className='inline-flex size-9 cursor-pointer items-center justify-center border border-[var(--rule)] disabled:cursor-default disabled:opacity-40' aria-label='Next page'>
						<CaretRightIcon size={14} />
					</button>
				</div>
			) : null}
		</div>
	)
}
