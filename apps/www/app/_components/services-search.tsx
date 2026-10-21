'use client'

import {
	ArrowRightIcon,
	BankIcon,
	BooksIcon,
	BriefcaseIcon,
	CertificateIcon,
	ClockIcon,
	FileTextIcon,
	FilesIcon,
	FirstAidKitIcon,
	GraduationCapIcon,
	HandCoinsIcon,
	HouseLineIcon,
	MagnifyingGlassIcon,
	PlantIcon,
	ProhibitIcon,
	ReceiptIcon,
	ScalesIcon,
	SquaresFourIcon,
	StorefrontIcon,
	TruckIcon,
	XIcon,
	type Icon,
} from '@phosphor-icons/react'
import { Select } from '@betterbarmm/editorial'
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
}

type Choice = { id: string; label: string; count: number }

/** One glyph per category, keyed by its id in the dataset. */
const ICONS: Record<string, Icon> = {
	health: FirstAidKitIcon,
	assistance: HandCoinsIcon,
	education: GraduationCapIcon,
	livelihood: BriefcaseIcon,
	farming: PlantIcon,
	housing: HouseLineIcon,
	legal: ScalesIcon,
	business: StorefrontIcon,
	permits: CertificateIcon,
	requests: FilesIcon,
	community: BooksIcon,
	suppliers: TruckIcon,
	government: BankIcon,
}

const JUMP = [
	{ href: '#categories', label: 'Categories', icon: SquaresFourIcon },
	{ href: '#offices', label: 'Offices with a charter', icon: FileTextIcon },
	{ href: '#no-charter', label: 'Offices without one', icon: ProhibitIcon },
]

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function ServicesSearch({
	head,
	entries,
	categories,
	audiences,
	initial,
	children,
}: {
	head: React.ReactNode
	entries: ServiceEntry[]
	categories: Choice[]
	audiences: Choice[]
	initial: { q: string; cat: string; for: string }
	children: React.ReactNode
}) {
	const [q, setQ] = useState(initial.q)
	const [cat, setCat] = useState(initial.cat)
	const [who, setWho] = useState(initial.for)
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
		for (const [k, v] of [['q', query.trim()], ['cat', cat], ['for', who]] as const) {
			if (v) url.searchParams.set(k, v)
			else url.searchParams.delete(k)
		}
		if (url.href !== window.location.href) history.replaceState(history.state, '', url)
	}, [query, cat, who])

	// Every word must match somewhere; a match in the name ranks over one in the summary or the office.
	// Grouped by category, in the categories' own order, unless one category is already chosen.
	const found = useMemo(() => {
		const words = fold(query).split(/\s+/).filter(Boolean)
		if (!words.length && !cat && !who) return []
		const hits = entries.filter(
			(e) => (!cat || e.category === cat) && (!who || e.for.includes(who)) && words.every((w) => fold(`${e.name} ${e.summary ?? ''} ${e.office} ${e.officeName}`).includes(w)),
		)
		const rank = (e: ServiceEntry) => (!words.length ? 0 : words.every((w) => fold(e.name).includes(w)) ? 0 : 1)
		const order = new Map(categories.map((c, i) => [c.id, i]))
		return hits
			.map((e, i) => [e, rank(e), i] as const)
			.sort((a, b) => (order.get(a[0].category) ?? 99) - (order.get(b[0].category) ?? 99) || a[1] - b[1] || a[2] - b[2])
			.map(([e]) => e)
	}, [entries, categories, query, cat, who])
	const searching = Boolean(query.trim() || cat || who)

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
	const clear = () => (setQ(''), setCat(''), setWho(''))

	const label = (list: Choice[], id: string) => list.find((c) => c.id === id)?.label ?? ''
	const what = [query.trim() && `“${query.trim()}”`, cat && `in ${label(categories, cat)}`, who && `for ${label(audiences, who).toLowerCase()}`].filter(Boolean).join(' ')

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
						{JUMP.map(({ href, label, icon: Icon }) => (
							<a
								key={href}
								href={href}
								onClick={searching ? clear : undefined}
								className='inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3.5 py-1.5 text-[13px] font-semibold text-[var(--ink)] transition hover:border-white hover:bg-white hover:text-[#8f2328]'
							>
								<Icon size={14} weight='bold' aria-hidden='true' /> {label}
							</a>
						))}
					</nav>
				</div>
			</section>

			{/* The search on the left, the two filters on the right, always under the band, so a choice can be made or undone from the results as well as the sections. */}
			<div id='filters' className='bb-container scroll-mt-[calc(var(--site-header-h)+1rem)] pt-10 lg:pt-12'>
				<div className='flex flex-col gap-3 lg:flex-row lg:items-end'>
					<form role='search' action='/services' onSubmit={(e) => e.preventDefault()} className='flex min-w-0 flex-1 flex-col gap-1'>
						<label htmlFor='services-search' className='text-[12px] text-[var(--ink-3)]'>
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
								className='min-w-0 flex-1 bg-transparent text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
							/>
							{q ? (
								<button type='button' onClick={() => (setQ(''), input.current?.focus())} aria-label='Clear the search' className='grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-[var(--ink-3)] hover:bg-[var(--paper-3)]'>
									<XIcon size={13} weight='bold' aria-hidden='true' />
								</button>
							) : (
								<kbd className='hidden shrink-0 rounded border border-[var(--rule)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--ink-mute)] sm:block'>/</kbd>
							)}
						</span>
					</form>
					<div className='grid gap-3 sm:grid-cols-2 lg:w-[34rem] lg:shrink-0'>
						<Select label='Category' value={cat} onChange={(v) => (setCat(v), setAt(0))} options={[['', 'Every category'], ...categories.map((c): [string, string] => [c.id, `${c.label} (${c.count})`])]} />
						<Select label='Who it’s for' value={who} onChange={(v) => (setWho(v), setAt(0))} options={[['', 'Anyone'], ...audiences.map((a): [string, string] => [a.id, `${a.label} (${a.count})`])]} />
					</div>
				</div>
			</div>

			<div id='services-results' ref={results} aria-live='polite'>
				{searching ? (
					<div className={`bb-container ${found.length ? 'py-10 lg:py-14' : 'py-24 lg:py-32'}`}>
						<p className={`text-[13.5px] text-[var(--ink-3)] ${found.length ? '' : 'text-center'}`}>
							{found.length ? `${found.length} ${found.length === 1 ? 'program or service' : 'programs and services'} ${what}` : `Nothing matches ${what}. Try a shorter word, or clear a filter.`}
							<button type='button' onClick={clear} className='ml-3 cursor-pointer font-semibold text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'>
								Clear all
							</button>
						</p>
						<ul className='mt-4'>
							{found.map((e, i) => {
								// A heading wherever the category changes; with one category chosen there is only the first.
								const heading = !cat && (i === 0 || found[i - 1]!.category !== e.category)
								const Glyph = ICONS[e.category]
								return (
									<Fragment key={e.href + i}>
										{heading ? (
											<li className='mt-8 flex items-center gap-2 border-b border-[var(--ink)] pb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] first:mt-2'>
												{Glyph ? <Glyph size={15} weight='duotone' className='text-[var(--accent)]' aria-hidden='true' /> : null}
												{label(categories, e.category)}
											</li>
										) : null}
										<li>
											<Link
												href={e.href}
												onMouseEnter={() => setAt(i)}
												data-on={i === at}
												className='group flex items-start gap-4 border-b border-[var(--rule-soft)] px-2 py-4 data-[on=true]:bg-[var(--paper-2)]'
											>
												<span className='min-w-0 flex-1'>
													<span className='block font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
														{e.kind === 'program' ? 'Program' : 'Service'} · {e.office}
														{e.draft ? ' · draft charter' : ''}
													</span>
													<span className='mt-1 block text-[15.5px] font-semibold leading-snug group-data-[on=true]:text-[var(--accent)]'>{e.name}</span>
													{e.summary ? <span className='mt-1 block max-w-3xl text-[13.5px] leading-6 text-[var(--ink-2)]'>{e.summary}</span> : null}
													{e.fee || e.time ? (
														<span className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-[var(--ink-3)]'>
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
													) : null}
												</span>
												<ArrowRightIcon size={14} className='mt-6 shrink-0 text-[var(--ink-mute)] group-data-[on=true]:text-[var(--accent)]' aria-hidden='true' />
											</Link>
										</li>
									</Fragment>
								)
							})}
						</ul>
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
	return (
		<section id='categories' aria-labelledby='categories-title' className='bb-container scroll-mt-[calc(var(--site-header-h)+1rem)] pt-14 lg:pt-20'>
			<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
				<h2 id='categories-title' className='text-[26px] font-extrabold tracking-[-0.02em]'>
					By category
				</h2>
				<p className='text-[13.5px] text-[var(--ink-3)]'>What you need, whichever office gives it.</p>
			</div>
			<ul className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
				{categories.map((c) => {
					const Glyph = ICONS[c.id]
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
								className='bb-frame group flex h-full w-full cursor-pointer flex-col border border-[var(--rule)] bg-[var(--paper)] p-5 text-left transition hover:border-[var(--ink)]'
							>
								<span className='flex items-start justify-between gap-3'>
									{Glyph ? <Glyph size={30} weight='duotone' className='text-[var(--accent)]' aria-hidden='true' /> : null}
									<span className='num text-[13px] font-semibold tabular-nums text-[var(--ink-3)]'>{c.count}</span>
								</span>
								<span className='mt-4 text-[17px] font-extrabold leading-snug tracking-[-0.01em] group-hover:text-[var(--accent)]'>{c.label}</span>
								<span className='mt-2 space-y-1 text-[13px] leading-snug text-[var(--ink-3)]'>
									{sample.map((e) => (
										<span key={e.href} className='block truncate'>
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
