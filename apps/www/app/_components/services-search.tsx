'use client'

import {
	ArrowRightIcon,
	ClockIcon,
	FileTextIcon,
	MagnifyingGlassIcon,
	ProhibitIcon,
	ReceiptIcon,
	SquaresFourIcon,
	XIcon,
	type Icon,
} from '@phosphor-icons/react'
import { Select } from '@betterbarmm/editorial'
import { CATEGORY_ICONS } from './category-icons'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Fragment, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'

/* Programs & services' one search, drawn the way the Directory's is: every
   program and service from an office's Citizen's Charter, filtered as the
   reader types, by category and by who it is for. With any of them set, the
   results stand in for the page's sections; with none, the categories and
   the sections show. "/" focuses it, the arrows move through the results and
   Enter opens one. The choices are kept in the address, so a search can be
   shared and the office pages' audience links land on it. */

export type ServiceEntry = {
	kind: 'program' | 'service'
	name: string
	summary: string | null
	office: string
	officeName: string
	href: string
	for: string[]
	category: string
	fee: string | null
	time: string | null
	draft: boolean
	/** The province an LGU's service belongs to, for the Local governments tab's third filter. */
	place?: string
}

type Choice = { id: string; label: string; count: number }


/** The band's jumps to the page's sections; each page names its own. */
export type Jump = { href: string; label: string; icon: 'categories' | 'charter' | 'none' }
const JUMP_ICONS: Record<Jump['icon'], Icon> = { categories: SquaresFourIcon, charter: FileTextIcon, none: ProhibitIcon }

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function ServicesSearch({
	head,
	entries,
	categories,
	audiences,
	places,
	initial,
	tabs,
	jump,
	children,
}: {
	head: React.ReactNode
	entries: ServiceEntry[]
	categories: Choice[]
	audiences: Choice[]
	/** Provinces, for the Local governments tab; absent, there is no province filter. */
	places?: Choice[]
	initial: { q: string; cat: string; for: string; in?: string }
	/** The tab bar between the regional offices and the local governments, drawn under the band. */
	tabs?: React.ReactNode
	jump: Jump[]
	children: React.ReactNode
}) {
	const [q, setQ] = useState(initial.q)
	const [cat, setCat] = useState(initial.cat)
	const [who, setWho] = useState(initial.for)
	const [place, setPlace] = useState(initial.in ?? '')
	const query = useDeferredValue(q)
	const [at, setAt] = useState(0)
	const input = useRef<HTMLInputElement>(null)
	const results = useRef<HTMLDivElement>(null)
	const router = useRouter()

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const t = e.target as HTMLElement
			if (e.key === '/' && !/input|textarea|select/i.test(t.tagName) && !t.isContentEditable) {
				e.preventDefault()
				input.current?.focus()
			}
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [])

	// The address follows the choices without a navigation, so the page does not re-render from the server.
	useEffect(() => {
		const url = new URL(window.location.href)
		for (const [k, v] of [['q', query.trim()], ['cat', cat], ['for', who], ['in', place]] as const) {
			if (v) url.searchParams.set(k, v)
			else url.searchParams.delete(k)
		}
		if (url.href !== window.location.href) history.replaceState(history.state, '', url)
	}, [query, cat, who, place])

	// Every word must match somewhere; a match in the name ranks over one in the summary or the office.
	// Grouped by category, in the categories' own order, unless one category is already chosen.
	const found = useMemo(() => {
		const words = fold(query).split(/\s+/).filter(Boolean)
		if (!words.length && !cat && !who && !place) return []
		const hits = entries.filter(
			(e) => (!cat || e.category === cat) && (!who || e.for.includes(who)) && (!place || e.place === place) && words.every((w) => fold(`${e.name} ${e.summary ?? ''} ${e.office} ${e.officeName}`).includes(w)),
		)
		const rank = (e: ServiceEntry) => (!words.length ? 0 : words.every((w) => fold(e.name).includes(w)) ? 0 : 1)
		const order = new Map(categories.map((c, i) => [c.id, i]))
		return hits
			.map((e, i) => [e, rank(e), i] as const)
			.sort((a, b) => (order.get(a[0].category) ?? 99) - (order.get(b[0].category) ?? 99) || a[1] - b[1] || a[2] - b[2])
			.map(([e]) => e)
	}, [entries, categories, query, cat, who, place])
	const searching = Boolean(query.trim() || cat || who || place)

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (!found.length) return
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			setAt((i) => (i + 1) % found.length)
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			setAt((i) => (i - 1 + found.length) % found.length)
		} else if (e.key === 'Enter') {
			e.preventDefault()
			router.push(found[at]!.href)
		}
	}

	// A tile further down brings the reader back up to what it found.
	const openCategory = (id: string) => {
		setCat(id)
		setAt(0)
		requestAnimationFrame(() => document.getElementById('filters')?.scrollIntoView({ block: 'start', behavior: 'smooth' }))
	}
	const clear = () => (setQ(''), setCat(''), setWho(''), setPlace(''))

	const label = (list: Choice[], id: string) => list.find((c) => c.id === id)?.label ?? ''
	const what = [query.trim() && `“${query.trim()}”`, cat && `in ${label(categories, cat)}`, who && `for ${label(audiences, who).toLowerCase()}`, place && `in ${label(places ?? [], place)}`].filter(Boolean).join(' ')

	return (
		<>
			<section className='brand-bg bb-lattice relative overflow-hidden'>
				<span
					aria-hidden='true'
					className='bb-glow absolute -top-[22rem] left-1/2 h-[40rem] w-[64rem] max-w-[160vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,206,84,0.7)_0%,rgba(255,170,40,0.3)_38%,transparent_70%)]! opacity-80!'
				/>
				<div className='bb-container relative py-16 text-center lg:py-24'>
					{head}
					<nav aria-label='Jump to' className='mt-8 flex flex-wrap justify-center gap-2'>
						{jump.map(({ href, label, icon }) => {
							const Icon = JUMP_ICONS[icon]
							return (
							<a
								key={href}
								href={href}
								onClick={searching ? clear : undefined}
								className='inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3.5 py-1.5 text-[0.8125rem] font-semibold text-[var(--ink)] transition hover:border-white hover:bg-white hover:text-[#8f2328]'
							>
								<Icon size={14} weight='bold' aria-hidden='true' /> {label}
							</a>
							)
						})}
					</nav>
				</div>
			</section>

			{tabs}

			{/* The search on the left, the two filters on the right, always under the band, so a choice can be made or undone from the results as well as the sections. */}
			<div id='filters' className='bb-container scroll-mt-[calc(var(--site-header-h)+1rem)] pt-6 lg:pt-8'>
				<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
					<form role='search' action='/services' onSubmit={(e) => e.preventDefault()} className='flex min-w-0 flex-col gap-1 lg:w-[26rem]'>
						<label htmlFor='services-search' className='text-[0.75rem] text-[var(--ink-3)]'>
							Search
						</label>
						<span className='flex h-10 items-center gap-3 border border-[var(--rule)] bg-[var(--paper-2)] px-3 focus-within:border-[var(--ink)]'>
							<MagnifyingGlassIcon size={16} className='shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
							<input
								ref={input}
								id='services-search'
								name='q'
								type='search'
								autoComplete='off'
								value={q}
								onChange={(e) => (setQ(e.target.value), setAt(0))}
								onKeyDown={onKeyDown}
								placeholder='Scholarship, medical assistance, permit, accreditation…'
								aria-controls='services-results'
								className='min-w-0 flex-1 bg-transparent text-[0.875rem] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
							/>
							{q ? (
								<button type='button' onClick={() => (setQ(''), input.current?.focus())} aria-label='Clear the search' className='grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-[var(--ink-3)] hover:bg-[var(--paper-3)]'>
									<XIcon size={13} weight='bold' aria-hidden='true' />
								</button>
							) : (
								<kbd className='hidden shrink-0 rounded border border-[var(--rule)] px-1.5 py-0.5 font-mono text-[0.6875rem] text-[var(--ink-mute)] sm:block'>/</kbd>
							)}
						</span>
					</form>
					<div className={`grid gap-3 lg:shrink-0 ${places ? 'sm:grid-cols-3 lg:w-[48rem]' : 'sm:grid-cols-2 lg:w-[34rem]'}`}>
						{places ? (
							<Select label='Province' value={place} onChange={(v) => (setPlace(v), setAt(0))} options={[['', 'Every province'], ...places.map((c): [string, string] => [c.id, `${c.label} (${c.count})`])]} />
						) : null}
						<Select label='Category' value={cat} onChange={(v) => (setCat(v), setAt(0))} options={[['', 'Every category'], ...categories.map((c): [string, string] => [c.id, `${c.label} (${c.count})`])]} />
						<Select label='Who it’s for' value={who} onChange={(v) => (setWho(v), setAt(0))} options={[['', 'Anyone'], ...audiences.map((a): [string, string] => [a.id, `${a.label} (${a.count})`])]} />
					</div>
				</div>
			</div>

			<div id='services-results' ref={results} aria-live='polite'>
				{searching ? (
					<div className={`bb-container ${found.length ? 'py-10 lg:py-14' : 'py-24 lg:py-32'}`}>
						<p className={`text-[0.84375rem] text-[var(--ink-3)] ${found.length ? '' : 'text-center'}`}>
							{found.length ? `${found.length} ${found.length === 1 ? 'program or service' : 'programs and services'} ${what}` : `Nothing matches ${what}. Try a shorter word, or clear a filter.`}
							<button type='button' onClick={clear} className='ml-3 cursor-pointer font-semibold text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'>
								Clear all
							</button>
						</p>
						{/* A table: the name and what it is, then the facts a reader compares, each in its own column. On a phone the
						    type, fee and time fold under the name. The whole row opens the record; the name is its link. */}
						<table className='mt-4 w-full border-collapse text-left text-[0.84375rem]'>
							<thead className='hidden md:table-header-group'>
								<tr className='border-b border-[var(--ink)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
									<th className='py-2 pl-2 pr-4 font-semibold'>Program or service</th>
									<th className='py-2 pr-4 font-semibold'>Type</th>
									<th className='py-2 pr-4 font-semibold'>{places ? 'Local government' : 'Office'}</th>
									<th className='py-2 pr-4 font-semibold'>Fee</th>
									<th className='py-2 pr-4 font-semibold'>Time</th>
									<th className='w-6 py-2' aria-hidden='true' />
								</tr>
							</thead>
							<tbody>
								{found.map((e, i) => {
									// A heading row wherever the category changes; with one category chosen there is none.
									const heading = !cat && (i === 0 || found[i - 1]!.category !== e.category)
									const Glyph = CATEGORY_ICONS[e.category]
									return (
										<Fragment key={e.href + i}>
											{heading ? (
												<tr>
													<th colSpan={6} scope='colgroup' className={`pb-2 text-left ${i === 0 ? 'pt-4' : 'pt-10'}`}>
														<span className='flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink)]'>
															{Glyph ? <Glyph size={15} weight='duotone' className='text-[var(--accent)]' aria-hidden='true' /> : null}
															{label(categories, e.category)}
														</span>
													</th>
												</tr>
											) : null}
											<tr
												onMouseEnter={() => setAt(i)}
												onClick={(ev) => (ev.target as HTMLElement).closest('a') || router.push(e.href)}
												data-on={i === at}
												className='group cursor-pointer border-t border-[var(--rule-soft)] align-top data-[on=true]:bg-[var(--paper-2)]'
											>
												<td className='py-4 pl-2 pr-4'>
													<Link href={e.href} className='block text-[0.9375rem] font-semibold leading-snug group-data-[on=true]:text-[var(--accent)]'>
														{e.name}
													</Link>
													{e.summary ? <span className='mt-1 block max-w-2xl leading-6 text-[var(--ink-2)]'>{e.summary}</span> : null}
													<span className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.78125rem] text-[var(--ink-3)] md:hidden'>
														<span>
															{e.kind === 'program' ? 'Program' : 'Service'} · {e.office}
														</span>
														{e.fee ? (
															<span className='inline-flex items-center gap-1.5'>
																<ReceiptIcon size={13} aria-hidden='true' /> {e.fee}
															</span>
														) : null}
														{e.time ? (
															<span className='inline-flex items-center gap-1.5'>
																<ClockIcon size={13} aria-hidden='true' /> {e.time}
															</span>
														) : null}
													</span>
												</td>
												<td className='hidden whitespace-nowrap py-4 pr-4 text-[var(--ink-3)] md:table-cell'>
													{e.kind === 'program' ? 'Program' : 'Service'}
													{e.draft ? <span className='block text-[0.71875rem] text-[var(--brass)]'>Draft charter</span> : null}
												</td>
												<td className='hidden py-4 pr-4 font-semibold md:table-cell'>{e.office}</td>
												<td className='hidden max-w-[13rem] py-4 pr-4 text-[var(--ink-2)] md:table-cell'>
													<span className='line-clamp-3'>{e.fee ?? '—'}</span>
												</td>
												<td className='hidden max-w-[10rem] py-4 pr-4 text-[var(--ink-2)] md:table-cell'>{e.time ?? '—'}</td>
												<td className='py-4 pr-2 pt-5'>
													<ArrowRightIcon size={14} className='text-[var(--ink-mute)] group-data-[on=true]:text-[var(--accent)]' aria-hidden='true' />
												</td>
											</tr>
										</Fragment>
									)
								})}
							</tbody>
						</table>
					</div>
				) : (
					<>
						<Categories categories={categories} entries={entries} onOpen={openCategory} />
						{children}
					</>
				)}
			</div>
		</>
	)
}

/** Every category as a tile: its count and the first few things on its shelf. */
function Categories({ categories, entries, onOpen }: { categories: Choice[]; entries: ServiceEntry[]; onOpen: (id: string) => void }) {
	if (!categories.length) return null
	return (
		<section id='categories' aria-labelledby='categories-title' className='bb-container scroll-mt-[calc(var(--site-header-h)+1rem)] pt-8 lg:pt-10'>
			<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
				<h2 id='categories-title' className='text-[1.625rem] font-extrabold tracking-[-0.02em]'>
					By category
				</h2>
				<p className='text-[0.84375rem] text-[var(--ink-3)]'>What you need, whichever office gives it.</p>
			</div>
			{/* grid-cols-1 holds the phone's one column to the screen; an auto column would grow to the longest service name. */}
			<ul className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4'>
				{categories.map((c) => {
					const Glyph = CATEGORY_ICONS[c.id]
					// Services first: they are what a reader can walk in and ask for.
					const sample = entries
						.filter((e) => e.category === c.id)
						.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'service' ? -1 : 1))
						.slice(0, 3)
					return (
						<li key={c.id}>
							<button
								type='button'
								onClick={() => onOpen(c.id)}
								className='bb-frame group flex h-full w-full min-w-0 cursor-pointer flex-col border border-[var(--rule)] bg-[var(--paper)] p-4 text-left transition hover:border-[var(--ink)] sm:p-5'
							>
								{/* On a phone the icon sits beside the name, so a card is a row and not a block. */}
								<span className='flex items-center gap-3 sm:items-start sm:justify-between'>
									{Glyph ? <Glyph size={30} weight='duotone' className='shrink-0 text-[var(--accent)] max-sm:size-6' aria-hidden='true' /> : null}
									<span className='min-w-0 flex-1 text-[1rem] font-extrabold leading-snug tracking-[-0.01em] group-hover:text-[var(--accent)] sm:hidden'>{c.label}</span>
									<span className='num shrink-0 text-[0.8125rem] font-semibold tabular-nums text-[var(--ink-3)]'>{c.count}</span>
								</span>
								<span className='mt-4 text-[1.0625rem] font-extrabold leading-snug tracking-[-0.01em] group-hover:text-[var(--accent)] max-sm:hidden'>{c.label}</span>
								<span className='mt-2 min-w-0 space-y-1 text-[0.8125rem] leading-snug text-[var(--ink-3)] max-sm:pl-9'>
									{sample.map((e, k) => (
										<span key={e.href} className={`block truncate ${k === 2 ? 'max-sm:hidden' : ''}`}>
											{e.name}
										</span>
									))}
								</span>
							</button>
						</li>
					)
				})}
			</ul>
		</section>
	)
}
