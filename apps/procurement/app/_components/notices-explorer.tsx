'use client'

import { CaretLeftIcon, CaretRightIcon, XIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { NoticeRow, Totals } from '../_lib/philgeps'
import { SearchField, Select } from '@betterbarmm/editorial'
import { longDate } from './parts'

/* Bid notices, newest first, fetched a page at a time from /api/notices. */

const STAGES: [string, string][] = [
	['', 'All notices'],
	['Open for bids', 'Open for bids'],
	['Awarded', 'Awarded'],
	['Failed', 'Failed'],
	['No award recorded', 'No award recorded'],
]

type Page = { totals: Totals; page: number; pages: number; rows: NoticeRow[] }

const peso = (n: number) =>
	n >= 1e9 ? `₱${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `₱${(n / 1e6).toFixed(1)}M` : `₱${Math.round(n).toLocaleString('en-PH')}`

export function NoticesExplorer({
	entity,
	supplier: initialSupplier = '',
	stage: initialStage = '',
	years,
	groups,
	modes,
	funds,
}: {
	entity?: string
	supplier?: string
	stage?: string
	years: number[]
	/** The broad groups notices are sorted into, for the Category filter. */
	groups: string[]
	/** Families of procurement mode, for the Mode filter. */
	modes: string[]
	/** Sources of funds, for the Fund filter. */
	funds: string[]
}) {
	const [query, setQuery] = useState('')
	const [typed, setTyped] = useState('')
	const [year, setYear] = useState('')
	const [group, setGroup] = useState('')
	const [stage, setStage] = useState(initialStage)
	const [mode, setMode] = useState('')
	const [fund, setFund] = useState('')
	const [supplier, setSupplier] = useState(initialSupplier)
	const [page, setPage] = useState(1)
	const [data, setData] = useState<Page | null>(null)

	// A short pause before searching, so each keystroke is not a request.
	useEffect(() => {
		const timer = setTimeout(() => {
			setQuery(typed)
			setPage(1)
		}, 250)
		return () => clearTimeout(timer)
	}, [typed])

	useEffect(() => {
		const params = new URLSearchParams()
		if (entity) params.set('entity', entity)
		if (query) params.set('q', query)
		if (year) params.set('year', year)
		if (group) params.set('group', group)
		if (stage) params.set('stage', stage)
		if (mode) params.set('mode', mode)
		if (fund) params.set('fund', fund)
		if (supplier) params.set('supplier', supplier)
		params.set('page', String(page))
		const controller = new AbortController()
		fetch(`/api/notices?${params}`, { signal: controller.signal })
			.then((r) => r.json())
			.then(setData)
			.catch(() => {})
		return () => controller.abort()
	}, [entity, query, year, group, stage, mode, fund, supplier, page])

	// The download carries the same filters as the list, every page of it.
	const csvParams = new URLSearchParams(
		Object.entries({ entity, q: query, year, group, stage, mode, fund, supplier }).filter((e): e is [string, string] => Boolean(e[1])),
	).toString()

	const reset = (fn: () => void) => {
		fn()
		setPage(1)
	}

	return (
		<div className='@container'>
			{/* Sized to its own width, not the screen's: an office page gives it less room. */}
			<div className='grid grid-cols-2 items-end gap-3 pb-6 @2xl:grid-cols-5 @2xl:gap-4 @5xl:grid-cols-[minmax(0,1fr)_repeat(5,10.5rem)] lg:pb-8'>
				<div className='col-span-full @5xl:col-span-1'>
					<SearchField value={typed} onChange={setTyped} placeholder='Title, reference, category or supplier' />
				</div>
				<Select label='Notices' value={stage} onChange={(v) => reset(() => setStage(v))} options={STAGES} />
				<Select label='Category' value={group} onChange={(v) => reset(() => setGroup(v))} options={[['', 'All categories'], ...groups.map((g): [string, string] => [g, g])]} />
				<Select label='Mode' value={mode} onChange={(v) => reset(() => setMode(v))} options={[['', 'All modes'], ...modes.map((m): [string, string] => [m, m])]} />
				<Select label='Source of funds' value={fund} onChange={(v) => reset(() => setFund(v))} options={[['', 'All sources'], ...funds.map((f): [string, string] => [f, f])]} />
				<Select label='Year' value={year} onChange={(v) => reset(() => setYear(v))} options={[['', 'All years'], ...[...years].reverse().map((y): [string, string] => [String(y), String(y)])]} />
			</div>

			{supplier ? (
				<button
					type='button'
					onClick={() => reset(() => setSupplier(''))}
					className='mb-4 inline-flex cursor-pointer items-center gap-2 bg-[var(--paper-2)] px-3 py-1.5 text-[13px] text-[var(--ink)]'
				>
					Won by {supplier}
					<XIcon size={12} weight='bold' aria-label='Clear' />
				</button>
			) : null}

			<div className='mb-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-y border-[var(--rule-soft)] py-3 text-[13px] text-[var(--ink-3)]'>
				<a href={`/api/notices/csv?${csvParams}`} className='rule-link font-semibold text-[var(--ink)]' download>
					Download CSV
				</a>
			<p className='text-right'>
				{data ? (
					<>
						<span className='num font-semibold text-[var(--ink)]'>{data.totals.notices.toLocaleString('en-PH')}</span> notices ·{' '}
						<span className='num font-semibold text-[var(--ink)]'>{peso(data.totals.abc)}</span> approved budget ·{' '}
						<span className='num font-semibold text-[var(--ink)]'>{data.totals.awards.toLocaleString('en-PH')}</span> awards,{' '}
						<span className='num font-semibold text-[var(--ink)]'>{peso(data.totals.contracts)}</span>
					</>
				) : (
					'Loading…'
				)}
			</p>
			</div>

			<ul className={data ? '' : 'opacity-50'}>
				{data?.rows.map((n) => (
					<li key={`${n.ref}-${n.date}`} className='grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-5 border-b border-[var(--rule)] py-4 sm:gap-x-28'>
						<div className='min-w-0'>
							<p className='font-[family-name:var(--font-display)] text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>{n.group}</p>
							<p className='mt-1 text-[14.5px] font-semibold leading-6 text-[var(--ink)]'>{n.title ?? n.category ?? 'Untitled notice'}</p>
							<p className='mt-1 text-[12px] leading-5 text-[var(--ink-3)]'>
								{[n.date && longDate(n.date), `Ref. ${n.ref}`, n.title && n.category, n.mode, n.fund !== 'Not published' && n.fund].filter(Boolean).join(' · ')}
								{entity ? null : (
									<>
										{' · '}
										<Link href={`/${n.entitySlug}`} className='rule-link'>
											{n.entityName}
										</Link>
									</>
								)}
							</p>
							{n.awards.map((a, i) => (
								<p key={i} className='mt-2 text-[13px] leading-5 text-[var(--ink-2)]'>
									Awarded to{' '}
									<button type='button' onClick={() => reset(() => setSupplier(a.awardee))} className='rule-link cursor-pointer font-semibold'>
										{a.awardee}
									</button>
									{a.amount != null ? <span className='num font-semibold text-[var(--ink)]'> · {peso(a.amount)}</span> : null}
									{a.date ? <span className='text-[var(--ink-3)]'> · {longDate(a.date)}</span> : null}
									{/* The older PhilGEPS dates a notice by its last update, which can fall after the award. */}
									{a.date && n.date && a.date < n.date ? (
										<span className='text-[var(--ink-mute)]' title='The older PhilGEPS dates a notice by when it was last updated, not first posted, so the award can appear to come first.'>
											{' '}
											· before the notice&rsquo;s date (last updated)
										</span>
									) : null}
								</p>
							))}
						</div>
						<div className='text-right sm:self-center'>
							<p className='num text-[16px] font-semibold text-[var(--ink)]'>{n.abc == null ? '—' : peso(n.abc)}</p>
							<p className={`mt-1 text-[11.5px] ${n.stage === 'Open for bids' ? 'font-semibold text-[var(--accent)]' : 'text-[var(--ink-3)]'}`}>
								{n.stage === 'Open for bids' && n.closing ? (
									<>
										Closes <br className='sm:hidden' />
										{longDate(n.closing)}
									</>
								) : (
									n.stage
								)}
							</p>
						</div>
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
