'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRightIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import { VerdictTag } from './verdict'

export type LibraryItem = {
	id: string
	category: string
	shortTitle: string
	lgu: string
	province: string
	level: string
	region: string
	year: number
	summary: string
	pages: number
	/** What BARMM can do with it: "Ready to adapt" and so on. */
	verdict: string | null
	/** Lower-cased words a search is matched against. */
	words: string
}

export type LibraryCategory = { name: string; slug: string; about: string }

const VERDICTS = ['Ready to adapt', 'Adapt with changes', 'Take the idea, not the text'] as const

/**
 * The collection: topics down the side on a wide screen (a menu on a phone), a search and a verdict filter over it,
 * and the ordinances as a list to scan — title, who passed it and when, one line on what it does, and the verdict.
 */
export function OrdinanceLibrary({ items, categories }: { items: LibraryItem[]; categories: LibraryCategory[] }) {
	const [query, setQuery] = useState('')
	const [topic, setTopic] = useState<string | null>(null)
	const [verdict, setVerdict] = useState<string | null>(null)

	const terms = useMemo(() => query.toLowerCase().split(/\s+/).filter(Boolean), [query])
	const matches = (item: LibraryItem) => terms.every((t) => item.words.includes(t))
	// Counts follow the search and the verdict, so a topic's number says what clicking it will show.
	const counted = items.filter((i) => matches(i) && (!verdict || i.verdict === verdict))
	const shown = counted.filter((i) => !topic || i.category === topic)

	const groups = categories
		.map((c) => ({ ...c, items: shown.filter((i) => i.category === c.name) }))
		.filter((c) => c.items.length > 0)
	const filtered = query || topic || verdict

	return (
		<div className='grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14'>
			{/* ---- Finding one ---- */}
			<aside className='lg:sticky lg:top-[calc(var(--sticky-top)+1.5rem)] lg:max-h-[calc(100vh-var(--sticky-top)-3rem)] lg:self-start lg:overflow-y-auto'>
				<label className='relative block'>
					<span className='sr-only'>Search the ordinances</span>
					<MagnifyingGlassIcon size={16} aria-hidden='true' className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]' />
					<input
						type='search'
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder='Search: halal, Davao, waste…'
						className='w-full border border-[var(--rule)] bg-[var(--paper)] py-2.5 pl-10 pr-3 text-[0.9375rem] text-[var(--ink)] placeholder:text-[var(--ink-mute)] focus:border-[var(--accent)] focus:outline-none'
					/>
				</label>

				{/* A phone gets the topics as one menu; the list would push the ordinances a screen down. */}
				<label className='mt-4 block lg:hidden'>
					<span className='font-mono text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-[var(--ink-mute)]'>Topic</span>
					<select
						value={topic ?? ''}
						onChange={(event) => setTopic(event.target.value || null)}
						className='mt-1.5 w-full border border-[var(--rule)] bg-[var(--paper)] px-3 py-2.5 text-[0.9375rem] text-[var(--ink)]'
					>
						<option value=''>All topics ({counted.length})</option>
						{categories.map((c) => (
							<option key={c.slug} value={c.name}>
								{c.name} ({counted.filter((i) => i.category === c.name).length})
							</option>
						))}
					</select>
				</label>

				<nav aria-label='Topics' className='mt-7 hidden lg:block'>
					<p className='font-mono text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-[var(--ink-mute)]'>Topics</p>
					<ul className='mt-3 border-l border-[var(--rule)]'>
						{[{ name: null as string | null, label: 'All topics' }, ...categories.map((c) => ({ name: c.name as string | null, label: c.name }))].map((c) => {
							const n = c.name ? counted.filter((i) => i.category === c.name).length : counted.length
							const on = topic === c.name
							return (
								<li key={c.label}>
									<button
										type='button'
										onClick={() => setTopic(c.name)}
										aria-pressed={on}
										disabled={n === 0 && !on}
										className={`-ml-px flex w-full items-baseline justify-between gap-3 border-l-2 py-1.5 pl-4 text-left text-[0.84375rem] leading-5 transition disabled:opacity-40 ${
											on ? 'border-[var(--accent)] font-semibold text-[var(--ink)]' : 'border-transparent text-[var(--ink-2)] hover:text-[var(--accent)]'
										}`}
									>
										<span>{c.label}</span>
										<span className='num text-[0.75rem] text-[var(--ink-mute)]'>{n}</span>
									</button>
								</li>
							)
						})}
					</ul>
				</nav>

				<div className='mt-6 lg:mt-8'>
					<p className='font-mono text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-[var(--ink-mute)]'>For BARMM</p>
					<div className='mt-3 flex flex-wrap gap-2 lg:flex-col lg:items-start' role='group' aria-label='Filter by verdict'>
						{VERDICTS.map((v) => {
							const on = verdict === v
							return (
								<button
									key={v}
									type='button'
									onClick={() => setVerdict(on ? null : v)}
									aria-pressed={on}
									className={`rounded-full border px-3 py-1 text-[0.78125rem] font-semibold transition-colors ${
										on ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--rule)] text-[var(--ink-2)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
									}`}
								>
									{v} <span className={`num ${on ? 'text-white/80' : 'text-[var(--ink-mute)]'}`}>{items.filter((i) => i.verdict === v && matches(i)).length}</span>
								</button>
							)
						})}
					</div>
				</div>
			</aside>

			{/* ---- The list ---- */}
			<div className='min-w-0'>
				<div className='flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ink)] pb-3'>
					<p className='num text-[0.875rem] text-[var(--ink-2)]'>
						<span className='font-bold text-[var(--ink)]'>{shown.length}</span> of {items.length} ordinances
						{topic ? <> in {topic.toLowerCase()}</> : null}
					</p>
					{filtered ? (
						<button
							type='button'
							onClick={() => {
								setQuery('')
								setTopic(null)
								setVerdict(null)
							}}
							className='inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--accent)] hover:underline'
						>
							<XIcon size={13} weight='bold' aria-hidden='true' />
							Clear
						</button>
					) : null}
				</div>

				{groups.length === 0 ? (
					<p className='mt-8 text-[0.9375rem] text-[var(--ink-2)]'>Nothing matches that. Try one word, or a town&rsquo;s name.</p>
				) : (
					groups.map((group) => (
						<section key={group.slug} id={group.slug} className='scroll-mt-28 pt-10 first:pt-8'>
							<h3 className='text-[1.125rem] font-extrabold tracking-[-0.015em] text-[var(--ink)]'>
								{group.name} <span className='num font-semibold text-[var(--ink-mute)]'>· {group.items.length}</span>
							</h3>
							<p className='mt-1 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>{group.about}</p>
							<ul className='mt-4 border-t border-[var(--rule)]'>
								{group.items.map((item) => (
									<li key={item.id} className='border-b border-[var(--rule)]'>
										<Link href={`/ordinances/${item.id}`} className='group flex gap-4 py-5 transition-colors hover:bg-[var(--paper-2)] sm:-mx-4 sm:px-4'>
											<div className='min-w-0 flex-1'>
												<div className='flex flex-wrap items-start justify-between gap-x-4 gap-y-2'>
													<h4 className='text-[1.0625rem] font-bold leading-snug tracking-[-0.01em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]'>
														{item.shortTitle}
													</h4>
													{item.verdict ? <VerdictTag verdict={item.verdict} /> : null}
												</div>
												<p className='num mt-1 text-[0.8125rem] text-[var(--ink-3)]'>
													{[item.lgu, item.province !== item.lgu ? item.province : null].filter(Boolean).join(', ')} · {item.year} · {item.pages} pages
												</p>
												<p className='mt-2 line-clamp-2 max-w-[48rem] text-[0.875rem] leading-6 text-[var(--ink-2)]'>{item.summary}</p>
											</div>
											<ArrowRightIcon size={16} weight='bold' aria-hidden='true' className='mt-1.5 hidden shrink-0 text-[var(--ink-mute)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)] sm:block' />
										</Link>
									</li>
								))}
							</ul>
						</section>
					))
				)}
			</div>
		</div>
	)
}
