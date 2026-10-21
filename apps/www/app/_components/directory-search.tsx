'use client'

import { ArrowRightIcon, BuildingsIcon, MagnifyingGlassIcon, MapTrifoldIcon, SirenIcon, UsersThreeIcon, XIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { Emblem } from './emblem'
import { useRouter } from 'next/navigation'
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'

/* The directory's one search: every office and its head, province, town and
   mayor, barangay and punong barangay, and Member of Parliament, filtered as
   the reader types. With a query the results stand in for the page's
   sections; with none, the sections show. "/" focuses it from anywhere on the
   page, the arrow keys move through the results and Enter opens one. */

export type DirectoryEntry = {
	/** What it is, for the group it is listed under. */
	kind: 'Office' | 'Province' | 'Town' | 'Barangay' | 'Member of Parliament'
	title: string
	/** Who holds it, or where it is. */
	sub: string
	href: string
	/** Its logo, seal or portrait, where there is one. */
	image?: string
	/** Everything it can be found by, lower-cased. */
	terms: string
}

const ORDER: DirectoryEntry['kind'][] = ['Office', 'Province', 'Town', 'Member of Parliament', 'Barangay']
const PLURAL: Record<DirectoryEntry['kind'], string> = {
	Office: 'Offices',
	Province: 'Provinces',
	Town: 'Towns and cities',
	'Member of Parliament': 'Members of Parliament',
	Barangay: 'Barangays',
}
const LIMIT = 8

/** The page's sections, as a row of jumps under the search. */
const JUMP = [
	{ href: '#hotlines', label: 'Hotlines', icon: SirenIcon },
	{ href: '#regional', label: 'Regional offices', icon: BuildingsIcon },
	{ href: '#local', label: 'Provinces and towns', icon: MapTrifoldIcon },
	{ href: '/directory/parliament', label: 'Parliament', icon: UsersThreeIcon },
]

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** head: the band's words above the search; children: the page's sections. */
export function DirectorySearch({ head, children }: { head: React.ReactNode; children: React.ReactNode }) {
	const [q, setQ] = useState('')
	// The index is fetched the first time the reader focuses or types in the search, not with the page.
	const [entries, setEntries] = useState<DirectoryEntry[] | null>(null)
	const asked = useRef(false)
	const load = () => {
		if (asked.current) return
		asked.current = true
		fetch('/directory/search-index.json')
			.then((r) => r.json())
			.then(setEntries)
			.catch(() => (asked.current = false))
	}
	const query = useDeferredValue(q)
	const [at, setAt] = useState(0)
	const input = useRef<HTMLInputElement>(null)
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

	// Every word must match somewhere; a match at the start of the name ranks first.
	const groups = useMemo(() => {
		const words = fold(query).split(/\s+/).filter(Boolean)
		if (!words.length || !entries) return []
		const hits = entries.filter((e) => words.every((w) => e.terms.includes(w)))
		const first = words[0]!
		const rank = (e: DirectoryEntry) => (fold(e.title).startsWith(first) ? 0 : fold(e.title).includes(first) ? 1 : 2)
		return ORDER.map((kind) => {
			const all = hits.filter((e) => e.kind === kind).sort((a, b) => rank(a) - rank(b))
			return { kind, all, shown: all.slice(0, LIMIT) }
		}).filter((g) => g.all.length)
	}, [entries, query])

	const flat = groups.flatMap((g) => g.shown)
	const total = groups.reduce((n, g) => n + g.all.length, 0)

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (!flat.length) return
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			setAt((i) => (i + 1) % flat.length)
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			setAt((i) => (i - 1 + flat.length) % flat.length)
		} else if (e.key === 'Enter') {
			e.preventDefault()
			router.push(flat[at]!.href, { scroll: false })
		}
	}

	let n = -1
	return (
		<>
			<section className='brand-bg bb-lattice relative overflow-hidden'>
				<span
					aria-hidden='true'
					className='bb-glow absolute -top-[22rem] left-1/2 h-[40rem] w-[64rem] max-w-[160vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,206,84,0.7)_0%,rgba(255,170,40,0.3)_38%,transparent_70%)]! opacity-80!'
				/>
				<div className='bb-container relative py-16 text-center lg:py-24'>
					{head}
			<form role='search' action='/directory' onSubmit={(e) => e.preventDefault()} className='mx-auto mt-8 max-w-2xl'>
				<label htmlFor='directory-search' className='sr-only'>
					Search the directory
				</label>
				{/* Fixed colours: inside the brand band, --paper and --ink point at its crimson ground. */}
				<span className='flex h-14 items-center gap-3 bg-white px-5 text-[#191713] shadow-[0_20px_40px_-24px_rgba(0,0,0,0.6)]'>
					<MagnifyingGlassIcon size={20} className='shrink-0 text-[#5c574c]' aria-hidden='true' />
					<input
						ref={input}
						id='directory-search'
						name='q'
						type='search'
						autoComplete='off'
						value={q}
						onFocus={load}
						onChange={(e) => (load(), setQ(e.target.value), setAt(0))}
						onKeyDown={onKeyDown}
						placeholder='An office, a minister, a town, a mayor, a barangay…'
						aria-controls='directory-results'
						className='min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#8a857a] [&::-webkit-search-cancel-button]:hidden'
					/>
					{q ? (
						<button type='button' onClick={() => (setQ(''), input.current?.focus())} aria-label='Clear the search' className='grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-[#5c574c] hover:bg-[#f1ede6]'>
							<XIcon size={15} weight='bold' aria-hidden='true' />
						</button>
					) : (
						<kbd className='hidden shrink-0 rounded border border-[#d9d4ca] px-1.5 py-0.5 font-mono text-[11px] text-[#8a857a] sm:block'>/</kbd>
					)}
				</span>
			</form>
					<nav aria-label='Jump to' className='mt-6 flex flex-wrap justify-center gap-2'>
						{JUMP.map(({ href, label, icon: Icon }) => (
							<a
								key={href}
								href={href}
								className='inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3.5 py-1.5 text-[13px] font-semibold text-[var(--ink)] transition hover:border-white hover:bg-white hover:text-[#8f2328]'
							>
								<Icon size={14} weight='bold' aria-hidden='true' /> {label}
							</a>
						))}
					</nav>
				</div>
			</section>

			<div id='directory-results' aria-live='polite'>
				{query.trim() ? (
					<div className={`bb-container ${total ? 'py-16 lg:py-24' : 'py-32 lg:py-48'}`}>
						{/* A count over the results; with none, the line stands alone in the middle. */}
						<p className={`text-[13.5px] text-[var(--ink-3)] ${total ? '' : 'text-center'}`}>
							{!entries
								? 'Searching…'
								: total
									? `${total.toLocaleString('en-PH')} ${total === 1 ? 'match' : 'matches'} for “${query.trim()}”`
									: `Nothing matches “${query.trim()}”. Try a surname, a town or an acronym.`}
						</p>
						<div className='mt-6 grid gap-10 lg:grid-cols-2'>
							{groups.map((g) => (
								<section key={g.kind} aria-label={PLURAL[g.kind]}>
									<h2 className='flex items-baseline justify-between border-b border-[var(--ink)] pb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
										{PLURAL[g.kind]}
										<span className='text-[var(--ink-mute)]'>{g.all.length > LIMIT ? `${LIMIT} of ${g.all.length}` : g.all.length}</span>
									</h2>
									<ul>
										{g.shown.map((e) => {
											n++
											const on = n === at
											const i = n
											return (
												<li key={i}>
													<Link scroll={false}
														href={e.href}
														onMouseEnter={() => setAt(i)}
														data-on={on}
														className='group flex items-center gap-4 border-b border-[var(--rule-soft)] px-2 py-3 data-[on=true]:bg-[var(--paper-2)]'
													>
														<Emblem image={e.image ? { src: e.image } : null} name={e.title} portrait={e.kind === 'Member of Parliament'} className='size-10 rounded-full text-[10px]' />
														<span className='min-w-0 flex-1'>
															<span className='block truncate text-[15px] font-semibold group-data-[on=true]:text-[var(--accent)]'>{e.title}</span>
															<span className='block truncate text-[13px] text-[var(--ink-3)]'>{e.sub}</span>
														</span>
														<ArrowRightIcon size={14} className='shrink-0 text-[var(--ink-mute)] group-data-[on=true]:text-[var(--accent)]' aria-hidden='true' />
													</Link>
												</li>
											)
										})}
									</ul>
								</section>
							))}
						</div>
					</div>
				) : (
					children
				)}
			</div>
		</>
	)
}
