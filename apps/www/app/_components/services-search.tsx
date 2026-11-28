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
import type { DiscoverPhotoKey } from './discover-media'
import { PhotoHero } from './photo-hero'
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

/** The filter row's columns from a laptop up, by how many dropdowns it holds; written out, so Tailwind sees each class. */

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function ServicesSearch({
	hero,
	entries,
	categories,
	audiences,
	places,
	initial,
	jump,
	children,
}: {
	/** The header's words and photographs. */
	hero: { kicker: string; title: string; lede: React.ReactNode; photos: DiscoverPhotoKey[] }
	entries: ServiceEntry[]
	categories: Choice[]
	audiences: Choice[]
	/** Provinces, for the Local governments tab; absent, there is no province filter. */
	places?: Choice[]
	initial: { q: string; cat: string; for: string; in?: string }
	/** The tab bar between the regional offices and the local governments, drawn under the band. */
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
			{/* The header in the travel look (user decision): the region's photographs, the words centred, the search as a
			    white pill on them and the page's jumps as glass buttons under it. */}
			<PhotoHero photos={hero.photos} kicker={hero.kicker} title={hero.title} lede={hero.lede} center>
				<form role='search' action='/services' onSubmit={(e) => e.preventDefault()} className='mx-auto mt-9 w-full max-w-2xl text-left'>
					<label htmlFor='services-search' className='sr-only'>
						Search programs and services
					</label>
					<span className='flex h-16 items-center gap-3 rounded-full bg-white pl-6 pr-3 text-[#191713] shadow-[0_24px_48px_-24px_rgba(0,0,0,0.7)]'>
						<MagnifyingGlassIcon size={20} className='shrink-0 text-[#5c574c]' aria-hidden='true' />
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
							className='min-w-0 flex-1 bg-transparent text-[1rem] outline-none placeholder:text-[#8a857a] [&::-webkit-search-cancel-button]:hidden'
						/>
						{q ? (
							<button type='button' onClick={() => (setQ(''), input.current?.focus())} aria-label='Clear the search' className='grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-[#5c574c] hover:bg-[#f1ede6]'>
								<XIcon size={15} weight='bold' aria-hidden='true' />
							</button>
						) : (
							<kbd className='hidden shrink-0 rounded-md border border-[#e7e2d8] px-2 py-0.5 font-mono text-[0.75rem] text-[#8a857a] sm:block'>/</kbd>
						)}
					</span>
				</form>
				<nav aria-label='Jump to' className='mt-6 flex flex-wrap justify-center gap-2'>
					{jump.map(({ href, label, icon }) => {
						const Icon = JUMP_ICONS[icon]
						return (
							<a key={href} href={href} onClick={searching ? clear : undefined} className='dv-btn dv-btn-glass !px-4 !py-2 !text-[0.8125rem]'>
								<Icon size={14} weight='bold' aria-hidden='true' /> {label}
							</a>
						)
					})}
				</nav>
			</PhotoHero>

			{/* The filters under the header, always there, so a choice can be made or undone from the results as well as the sections. */}
			<div id='filters' className='bb-container scroll-mt-4 pt-14 lg:pt-20'>
				{/* What the row is for on the left (user decision: no empty half), the dropdowns compact on the right. */}
				<div className='flex flex-wrap items-end justify-between gap-x-10 gap-y-6'>
					<div>
						<h2 className='font-[family-name:var(--font-display)] text-[clamp(1.375rem,2.2vw,1.75rem)] font-extrabold tracking-[-0.03em] text-[var(--ink)]'>Filter the list</h2>
						<p className='mt-1 text-[0.875rem] text-[var(--ink-3)]'>By {places ? 'province, ' : ''}category and who it is for. Every choice can be undone here.</p>
					</div>
					<div className='flex w-full flex-wrap gap-3 sm:w-auto'>
						{places ? (
							<div className='w-full sm:w-[14.5rem]'>
								<Select label='Province' value={place} onChange={(v) => (setPlace(v), setAt(0))} options={[['', 'Every province'], ...places.map((c): [string, string] => [c.id, `${c.label} (${c.count})`])]} />
							</div>
						) : null}
						<div className='w-full sm:w-[14.5rem]'>
							<Select label='Category' value={cat} onChange={(v) => (setCat(v), setAt(0))} options={[['', 'Every category'], ...categories.map((c): [string, string] => [c.id, `${c.label} (${c.count})`])]} />
						</div>
						<div className='w-full sm:w-[14.5rem]'>
							<Select label='Who it’s for' value={who} onChange={(v) => (setWho(v), setAt(0))} options={[['', 'Anyone'], ...audiences.map((a): [string, string] => [a.id, `${a.label} (${a.count})`])]} />
						</div>
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
								<tr className='border-b border-[var(--rule)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
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
												className='group cursor-pointer border-t border-[var(--rule-soft)] align-top data-[on=true]:bg-[color-mix(in_srgb,var(--accent)_5%,var(--paper))]'
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
		<section id='categories' aria-labelledby='categories-title' className='bb-container scroll-mt-4 pt-14 lg:pt-20'>
			<div>
				<h2 id='categories-title' className='dv-title'>
					By category
				</h2>
				<p className='dv-lede'>What you need, whichever office gives it.</p>
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
								className='group flex h-full w-full min-w-0 cursor-pointer flex-col rounded-[1.25rem] border border-[var(--rule)] bg-[var(--paper)] p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ink)_30%,var(--rule))] hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)] sm:p-5'
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
