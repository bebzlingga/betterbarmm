'use client'

import { RowsSkeleton, SkeletonLine } from '@betterbarmm/editorial'
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import type { NationalWork } from '../_lib/dpwh'
import { SearchField, Select } from './controls'

/* Every DPWH project in the region, filtered on the server and fetched a page at a time.
   A row opens onto its contract: who bid, who won, for how much against the budget, the dates and the papers. */

type Page = { count: number; total: number; ongoing: number; page: number; pages: number; rows: NationalWork[] }

const peso = (n: number) => (n >= 1e9 ? `₱${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `₱${(n / 1e6).toFixed(1)}M` : `₱${Math.round(n).toLocaleString('en-PH')}`)
const full = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const longDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

const LGU = 'https://lgu.betterbarmm.com'
const DOCS: [keyof NationalWork['docs'], string][] = [
	['advertisement', 'Advertisement'],
	['noticeOfAward', 'Notice of award'],
	['contractAgreement', 'Contract'],
	['noticeToProceed', 'Notice to proceed'],
	['programOfWork', 'Program of work'],
	['engineeringDesign', 'Engineering design'],
]
const PLACED = { coordinates: 'its map point', name: 'the town its description names', both: 'its map point and its description' }

function Detail({ w }: { w: NationalWork }) {
	const DT = 'text-[0.71875rem] uppercase tracking-[0.06em] text-[var(--ink-3)]'
	const DD = 'mt-0.5 text-[0.84375rem] leading-6 text-[var(--ink-2)]'
	return (
		<div className='mt-4 grid gap-x-10 gap-y-4 border-t border-[var(--rule-soft)] pt-4 sm:grid-cols-2'>
			<div>
				<p className={DT}>Contract</p>
				<p className={DD}>
					<span className='num font-semibold text-[var(--ink)]'>{w.id}</span>
					{w.funds ? ` · ${w.funds}` : ''}
				</p>
			</div>
			<div>
				<p className={DT}>Implemented by</p>
				<p className={DD}>
					{w.office}
					{w.region && w.region !== w.office ? `, ${w.region}` : ''}
				</p>
			</div>
			<div>
				<p className={DT}>Money</p>
				<p className={DD}>
					{w.abc != null ? <>Approved budget {full(w.abc)}<br /></> : null}
					{w.award != null ? <>Awarded {full(w.award)}{w.abc ? ` (${((w.award / w.abc) * 100).toFixed(1)}% of the budget)` : ''}<br /></> : null}
					{w.cost && w.cost !== w.award ? <>Contract cost now {full(w.cost)}</> : null}
				</p>
			</div>
			<div>
				<p className={DT}>Dates</p>
				<p className={DD}>
					{w.advertised ? <>Advertised {longDate(w.advertised)}<br /></> : null}
					{w.start ? <>Started {longDate(w.start)}<br /></> : null}
					{w.end ? <>{w.status === 'Completed' ? 'Completed' : 'Due'} {longDate(w.end)}</> : null}
				</p>
			</div>
			{w.bidders.length ? (
				<div className='sm:col-span-2'>
					<p className={DT}>
						{w.bidders.length === 1 ? 'One bidder' : `${w.bidders.length} bidders`}
					</p>
					<ul className={`${DD} mt-1`}>
						{w.bidders.map((b) => (
							<li key={b.name} className={b.won ? 'font-semibold text-[var(--ink)]' : ''}>
								{b.name}
								{b.won ? ' — won' : ''}
							</li>
						))}
					</ul>
				</div>
			) : null}
			<div className='sm:col-span-2'>
				<p className={DT}>Papers and place</p>
				<p className={`${DD} flex flex-wrap gap-x-4 gap-y-1`}>
					{DOCS.filter(([k]) => w.docs[k]).map(([k, label]) => (
						<a key={k} href={w.docs[k]} target='_blank' rel='noreferrer' className='rule-link font-semibold'>
							{label}
						</a>
					))}
					{w.lat != null && w.lon != null ? (
						<a href={`https://www.openstreetmap.org/?mlat=${w.lat}&mlon=${w.lon}#map=16/${w.lat}/${w.lon}`} target='_blank' rel='noreferrer' className='rule-link'>
							On the map
						</a>
					) : null}
					{w.live ? (
						<a href={w.live} target='_blank' rel='noreferrer' className='rule-link'>
							Live camera
						</a>
					) : null}
				</p>
				<p className='mt-2 text-[0.75rem] leading-5 text-[var(--ink-3)]'>
					Placed in {w.town.name} by {PLACED[w.located]}. Look the contract ID up on the{' '}
					<a href='https://transparency.dpwh.gov.ph/' target='_blank' rel='noreferrer' className='rule-link'>
						DPWH Transparency Portal
					</a>
					{w.images ? ` for its ${w.images} site photos` : ''}.
				</p>
			</div>
		</div>
	)
}

export function DpwhExplorer({
	years,
	areas,
	categories,
	statuses,
	offices,
	initial = {},
}: {
	years: number[]
	areas: string[]
	categories: string[]
	statuses: string[]
	offices: string[]
	initial?: { area?: string; q?: string }
}) {
	const [typed, setTyped] = useState(initial.q ?? '')
	const [q, setQ] = useState(initial.q ?? '')
	const [year, setYear] = useState('')
	const [area, setArea] = useState(initial.area ?? '')
	const [category, setCategory] = useState('')
	const [status, setStatus] = useState('')
	const [office, setOffice] = useState('')
	const [sort, setSort] = useState('year')
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
		Object.entries({ q, year, area, category, status, office, sort }).filter((e): e is [string, string] => Boolean(e[1])),
	)
	const key = `${params}&page=${page}`
	const [answered, setAnswered] = useState('')
	const pending = answered !== key

	useEffect(() => {
		const controller = new AbortController()
		fetch(`/api/dpwh?${key}`, { signal: controller.signal })
			.then((r) => r.json())
			.then((d) => {
				setData(d)
				setAnswered(key)
			})
			.catch(() => {})
		return () => controller.abort()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [q, year, area, category, status, office, sort, page])

	const reset = (fn: () => void) => {
		fn()
		setPage(1)
	}

	return (
		<div className='@container'>
			<div className='grid grid-cols-2 items-end gap-3 pb-6 @2xl:grid-cols-3 @2xl:gap-4 @5xl:grid-cols-[minmax(0,1fr)_repeat(6,9rem)] lg:pb-8'>
				<div className='col-span-full @5xl:col-span-1'>
					<SearchField value={typed} onChange={setTyped} placeholder='Project, barangay, town, contractor or contract ID' />
				</div>
				<Select label='Year' value={year} onChange={(v) => reset(() => setYear(v))} options={[['', 'All years'], ...[...years].reverse().map((y): [string, string] => [String(y), String(y)])]} />
				<Select label='Where' value={area} onChange={(v) => reset(() => setArea(v))} options={[['', 'Everywhere'], ...areas.map((a): [string, string] => [a, a])]} />
				<Select label='Kind' value={category} onChange={(v) => reset(() => setCategory(v))} options={[['', 'All kinds'], ...categories.map((c): [string, string] => [c, c])]} />
				<Select label='Status' value={status} onChange={(v) => reset(() => setStatus(v))} options={[['', 'Any status'], ...statuses.map((s): [string, string] => [s, s])]} />
				<Select label='Office' value={office} onChange={(v) => reset(() => setOffice(v))} options={[['', 'Any office'], ...offices.map((o): [string, string] => [o, o])]} />
				<Select label='Sort' value={sort} onChange={(v) => reset(() => setSort(v))} options={[['year', 'Newest first'], ['cost', 'Largest first']]} />
			</div>

			<div className='mb-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-y border-[var(--rule-soft)] py-3 text-[0.8125rem] text-[var(--ink-3)]'>
				<a href={`/api/dpwh/csv?${params}`} className='rule-link font-semibold text-[var(--ink)]' download>
					Download CSV
				</a>
				<p className='text-right'>
					{data && !pending ? (
						<>
							<span className='num font-semibold text-[var(--ink)]'>{data.count.toLocaleString('en-PH')}</span> projects ·{' '}
							<span className='num font-semibold text-[var(--ink)]'>{peso(data.total)}</span> in contracts ·{' '}
							<span className='num font-semibold text-[var(--ink)]'>{data.ongoing.toLocaleString('en-PH')}</span> ongoing
						</>
					) : (
						<SkeletonLine width='18rem' />
					)}
				</p>
			</div>

			{data && !pending ? null : (
				<div role='status'>
					<span className='sr-only'>Loading…</span>
					<RowsSkeleton
						rows={10}
						row='grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-5 border-b border-[var(--rule)] py-4 sm:gap-x-16'
						lines={[{ className: 'font-[family-name:var(--font-display)] text-[0.59375rem] uppercase tracking-[0.14em]', scale: 0.25 }, 'mt-1 text-[0.90625rem] leading-6', { className: 'mt-1 text-[0.75rem] leading-5', scale: 0.55 }]}
						figure={['text-[1rem]']}
					/>
				</div>
			)}
			<ul className={data && !pending ? '' : 'hidden'}>
				{data?.rows.map((w) => (
					<li key={w.id} className='border-b border-[var(--rule)]'>
						<details className='group py-4'>
							<summary className='grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-start gap-x-5 sm:gap-x-16 [&::-webkit-details-marker]:hidden'>
								<div className='min-w-0'>
									<p className='font-[family-name:var(--font-display)] text-[0.59375rem] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>
										{[w.category, w.status].filter(Boolean).join(' · ')}
									</p>
									<p className='mt-1 text-[0.90625rem] font-semibold leading-6 text-[var(--ink)] group-hover:text-[var(--accent)]'>{w.name}</p>
									<p className='mt-1 text-[0.75rem] leading-5 text-[var(--ink-3)]'>
										{w.year ? `${w.year} · ` : ''}
										<a href={`${LGU}/${w.area}/${w.town.slug}`} className='rule-link' onClick={(e) => e.stopPropagation()}>
											{w.town.name}
											{w.area !== 'cotabato-city' ? `, ${w.areaName}` : ''}
										</a>
										{w.contractor ? ` · ${w.contractor}` : ''}
										{w.status === 'On-Going' && w.progress != null ? ` · ${Math.round(w.progress)}% done` : ''}
									</p>
								</div>
								<p className='num text-right text-[1rem] font-semibold text-[var(--ink)]'>{w.cost ? peso(w.cost) : '—'}</p>
							</summary>
							<Detail w={w} />
						</details>
					</li>
				))}
			</ul>

			{data && data.pages > 1 ? (
				<div className='mt-6 flex items-center justify-end gap-3 text-[0.8125rem] text-[var(--ink-3)]'>
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
