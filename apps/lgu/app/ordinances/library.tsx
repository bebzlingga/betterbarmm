'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'

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
	/** Its standout facts, the first two shown on the card. */
	highlights: { value: string; label: string }[]
	/** What BARMM can do with it: "Ready to adapt" and so on. */
	verdict: string | null
	/** Lower-cased words a search is matched against. */
	words: string
}

export type LibraryCategory = { name: string; slug: string; about: string }

const VERDICTS = ['Ready to adapt', 'Adapt with changes', 'Take the idea, not the text'] as const
/** Who passed it. Municipalities first: most of BARMM's LGUs are municipalities. */
const LEVELS = [
	{ level: 'municipality', label: 'Municipalities', about: 'Passed by a Sangguniang Bayan, the level most BARMM LGUs are.' },
	{ level: 'city', label: 'Cities', about: 'Passed by a Sangguniang Panlungsod.' },
	{ level: 'province', label: 'Provinces', about: 'Passed by a Sangguniang Panlalawigan.' },
] as const
const LEVEL: Record<string, string> = { province: 'Province', city: 'City', municipality: 'Municipality', barangay: 'Barangay' }
/** The list's two columns: the ordinance, and its highlights. */
const COLS = 'lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-x-14'
const KICKER = 'font-mono text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-[var(--ink-mute)]'

/**
 * The collection: topics down the side on a wide screen (a menu on a phone), a search, who passed it and a verdict
 * filter over it, and the ordinances as a list — who passed it, the title, one line on what it does, and beside it
 * the verdict and two highlights.
 */
export function OrdinanceLibrary({ items, categories }: { items: LibraryItem[]; categories: LibraryCategory[] }) {
	const [query, setQuery] = useState('')
	const [topic, setTopic] = useState<string | null>(null)
	const [verdict, setVerdict] = useState<string | null>(null)
	const [level, setLevel] = useState<string | null>(null)
	/** How the list is sectioned: by what it is about, or by the level of government that passed it. */
	const [by, setBy] = useState<'topic' | 'level'>('topic')

	const terms = useMemo(() => query.toLowerCase().split(/\s+/).filter(Boolean), [query])
	const matches = (item: LibraryItem) => terms.every((t) => item.words.includes(t))
	// Counts follow the other filters, so a number says what clicking it will show.
	const counted = items.filter((i) => matches(i) && (!verdict || i.verdict === verdict) && (!level || i.level === level))
	const shown = counted.filter((i) => !topic || i.category === topic)

	// Within a level, the ordinances run in the topics' order, so the same subjects sit together.
	const order = (i: LibraryItem) => categories.findIndex((c) => c.name === i.category)
	const groups = (
		by === 'level'
			? LEVELS.map((l) => ({ name: l.label, slug: l.level, about: l.about, items: shown.filter((i) => i.level === l.level).sort((a, b) => order(a) - order(b) || b.year - a.year) }))
			: categories.map((c) => ({ ...c, items: shown.filter((i) => i.category === c.name).sort((a, b) => b.year - a.year) }))
	).filter((c) => c.items.length > 0)
	const filtered = query || topic || verdict || level

	const pill = (on: boolean) =>
		`rounded-full border px-3 py-1 text-[0.78125rem] font-semibold transition-colors ${
			on ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--rule)] text-[var(--ink-2)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
		}`

	return (
		<div className='grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-24'>
			{/* ---- Finding one ---- */}
			<aside className='lg:sticky lg:top-[calc(var(--sticky-top)+1.5rem)] lg:max-h-[calc(100vh-var(--sticky-top)-3rem)] lg:self-start lg:overflow-y-auto'>
				<label className='relative block'>
					<span className='sr-only'>Search the ordinances</span>
					<MagnifyingGlassIcon size={16} aria-hidden='true' className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]' />
					<input
						type='search'
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder='Search: fisheries, market, halal…'
						className='w-full border border-[var(--rule)] bg-[var(--paper)] py-2.5 pl-10 pr-3 text-[0.9375rem] text-[var(--ink)] placeholder:text-[var(--ink-mute)] focus:border-[var(--accent)] focus:outline-none'
					/>
				</label>

				<div className='mt-6'>
					<p className={KICKER}>Passed by</p>
					<div className='mt-3 flex flex-wrap gap-2' role='group' aria-label='Filter by who passed it'>
						{LEVELS.map((l) => {
							const on = level === l.level
							const n = items.filter((i) => i.level === l.level && matches(i) && (!verdict || i.verdict === verdict)).length
							return (
								<button key={l.level} type='button' onClick={() => setLevel(on ? null : l.level)} aria-pressed={on} disabled={n === 0 && !on} className={`${pill(on)} disabled:opacity-40`}>
									{l.label} <span className={`num ${on ? 'text-white/80' : 'text-[var(--ink-mute)]'}`}>{n}</span>
								</button>
							)
						})}
					</div>
				</div>

				<div className='mt-6'>
					<p className={KICKER}>For your LGU</p>
					<div className='mt-3 flex flex-wrap gap-2' role='group' aria-label='Filter by verdict'>
						{VERDICTS.map((v) => {
							const on = verdict === v
							return (
								<button key={v} type='button' onClick={() => setVerdict(on ? null : v)} aria-pressed={on} className={pill(on)}>
									{v} <span className={`num ${on ? 'text-white/80' : 'text-[var(--ink-mute)]'}`}>{items.filter((i) => i.verdict === v && matches(i) && (!level || i.level === level)).length}</span>
								</button>
							)
						})}
					</div>
				</div>
				{/* A phone gets the topics as one menu; the list would push the ordinances a screen down. */}
				<label className='mt-6 block lg:hidden'>
					<span className={KICKER}>Topic</span>
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
					<p className={KICKER}>Topics</p>
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
										className={`-ml-px flex w-full items-baseline justify-between gap-3 border-l-2 py-1 pl-4 text-left text-[0.8125rem] leading-5 transition disabled:opacity-40 ${
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

			</aside>

			{/* ---- The cards ---- */}
			<div className='min-w-0'>
				<div className='flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule)] pb-3'>
					<p className='num text-[0.875rem] text-[var(--ink-2)]'>
						<span className='font-bold text-[var(--ink)]'>{shown.length}</span> of {items.length} ordinances
						{level ? <> passed by {LEVELS.find((l) => l.level === level)?.label.toLowerCase()}</> : null}
						{topic ? <> in {topic.toLowerCase()}</> : null}
					</p>
					<div className='ml-auto flex items-center gap-3'>
						<div className='flex items-center gap-1 text-[0.8125rem]' role='group' aria-label='Group the list by'>
							<span className='mr-1 text-[var(--ink-3)]'>Group by</span>
							{(['topic', 'level'] as const).map((g) => (
								<button
									key={g}
									type='button'
									onClick={() => setBy(g)}
									aria-pressed={by === g}
									className={`px-2 py-0.5 font-semibold transition-colors ${by === g ? 'bg-[var(--ink)] text-[var(--paper)]' : 'text-[var(--ink-2)] hover:text-[var(--accent)]'}`}
								>
									{g === 'topic' ? 'Topic' : 'Level'}
								</button>
							))}
						</div>
					{filtered ? (
						<button
							type='button'
							onClick={() => {
								setQuery('')
								setTopic(null)
								setVerdict(null)
								setLevel(null)
							}}
							className='inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--accent)] hover:underline'
						>
							<XIcon size={13} weight='bold' aria-hidden='true' />
							Clear
						</button>
					) : null}
					</div>
				</div>

				{groups.length === 0 ? (
					<p className='mt-8 text-[0.9375rem] text-[var(--ink-2)]'>Nothing matches that. Try one word, or a municipality&rsquo;s name.</p>
				) : (
					groups.map((group) => (
						<section key={group.slug} id={group.slug} className='scroll-mt-28 pt-12 first:pt-8'>
							<div className='flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8'>
								<h3 className='text-[1.25rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
									{group.name} <span className='num font-semibold text-[var(--ink-mute)]'>· {group.items.length}</span>
								</h3>
								<p className='max-w-[30rem] text-[0.8125rem] leading-6 text-[var(--ink-3)] sm:text-right'>{group.about}</p>
							</div>
							{/* A table in all but markup: the ordinance in one column, its highlights in the other. */}
							<div className={`${COLS} mt-5 hidden border-b border-[var(--rule)] pb-2 lg:grid`} aria-hidden='true'>
								<span className={KICKER}>Ordinance</span>
								<span className={KICKER}>Highlights</span>
							</div>
							<ul className='mt-5 border-t border-[var(--rule)] lg:mt-0 lg:border-t-0'>
								{group.items.map((item) => (
									<li key={item.id} className='border-b border-[var(--rule)]'>
										<Link href={`/ordinances/${item.id}`} className={`${COLS} group grid gap-y-3 py-6`}>
											{/* Year, level and place as small badges above the title. */}
											<ul className='flex flex-wrap gap-1.5 lg:col-span-2'>
												{[String(item.year), by === 'level' ? item.category : (LEVEL[item.level] ?? 'LGU'), [item.lgu, item.province !== item.lgu ? item.province : null].filter(Boolean).join(', ')].map((b) => (
													<li key={b} className='num rounded-full bg-[var(--paper-2)] px-2.5 py-0.5 text-[0.71875rem] leading-5 text-[var(--ink-2)]'>
														{b}
													</li>
												))}
											</ul>
											<div className='min-w-0'>
												<h4 className='text-[1.0625rem] font-bold leading-snug tracking-[-0.01em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]'>
													{item.shortTitle}
												</h4>
												<p className='mt-1.5 line-clamp-2 text-[0.8125rem] leading-[1.6] text-[var(--ink-3)]'>{item.summary}</p>
											</div>
											{/* Two highlights read as lines: the figure in crimson, running into what it counts. */}
											<dl className='grid content-start gap-2.5 self-start'>
												{item.highlights.slice(0, 2).map((h) => (
													<div key={h.label} className='line-clamp-2 text-[0.8125rem] leading-[1.45] text-[var(--ink-2)]'>
														<dt className='num inline font-bold text-[var(--accent)]'>{h.value}</dt> <dd className='inline'>{h.label}</dd>
													</div>
												))}
											</dl>
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
