'use client'

import { ArrowUpRightIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import { useDeferredValue, useMemo, useState } from 'react'

/* Latest news, one story per row: the headline from the outlet that carries it best, and every other outlet
   that reported the same thing beside it. The band and its search are the Directory's, so the two read alike;
   the search filters the stories as the reader types. */

export type Story = {
	key: string
	title: string
	summary: string
	url: string
	source: string
	/** Manila day and time of the report whose headline the row shows, formatted on the server. */
	day: string
	time: string | null
	also: { source: string; url: string }[]
}

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function NewsList({ stories, head }: { stories: Story[]; head: React.ReactNode }) {
	const [q, setQ] = useState('')
	const query = useDeferredValue(q)
	const shown = useMemo(() => {
		const words = fold(query).split(/\s+/).filter(Boolean)
		if (!words.length) return stories
		return stories.filter((s) => {
			const text = fold([s.title, s.summary, s.source, ...s.also.map((a) => a.source)].join(' '))
			return words.every((w) => text.includes(w))
		})
	}, [stories, query])
	const days = new Map<string, Story[]>()
	for (const s of shown) days.set(s.day, [...(days.get(s.day) ?? []), s])

	return (
		<>
			<section className='brand-bg bb-lattice relative overflow-hidden'>
				<span
					aria-hidden='true'
					className='bb-glow absolute -top-[22rem] left-1/2 h-[40rem] w-[64rem] max-w-[160vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,206,84,0.7)_0%,rgba(255,170,40,0.3)_38%,transparent_70%)]! opacity-80!'
				/>
				<div className='bb-container relative py-16 text-center lg:py-24'>
					{head}
					<form role='search' onSubmit={(e) => e.preventDefault()} className='mx-auto mt-8 max-w-2xl'>
						<label htmlFor='news-search' className='sr-only'>
							Search the news
						</label>
						{/* Fixed colours: inside the brand band, --paper and --ink point at its crimson ground. */}
						<span className='flex h-14 items-center gap-3 bg-white px-5 text-[#191713] shadow-[0_20px_40px_-24px_rgba(0,0,0,0.6)]'>
							<MagnifyingGlassIcon size={20} className='shrink-0 text-[#5c574c]' aria-hidden='true' />
							<input
								id='news-search'
								type='search'
								autoComplete='off'
								value={q}
								onChange={(e) => setQ(e.target.value)}
								placeholder='A town, a name, an outlet, a subject…'
								aria-controls='news-results'
								className='min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#8a857a] [&::-webkit-search-cancel-button]:hidden'
							/>
							{q ? (
								<button type='button' onClick={() => setQ('')} aria-label='Clear the search' className='grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-[#5c574c] hover:bg-[#f1ede6]'>
									<XIcon size={15} weight='bold' aria-hidden='true' />
								</button>
							) : null}
						</span>
					</form>
				</div>
			</section>

			<section id='news-results' aria-live='polite' className='bb-container bb-section'>
				<div className='mx-auto max-w-5xl'>
				{query.trim() ? (
					<p className='mb-10 text-[13.5px] text-[var(--ink-3)]'>
						{shown.length ? `${shown.length} ${shown.length === 1 ? 'story' : 'stories'} for “${query.trim()}”` : `Nothing this week matches “${query.trim()}”.`}
					</p>
				) : null}
				<div className='grid gap-14'>
					{[...days].map(([label, list]) => (
						<div key={label}>
							<h2 className='bb-label'>{label}</h2>
							<ul className='mt-4'>
								{list.map((s) => (
									<li key={s.key} className='grid gap-x-8 gap-y-1 border-t border-[var(--rule)] py-5 md:grid-cols-[minmax(0,1fr)_12rem]'>
										<div className='min-w-0'>
											<a href={s.url} target='_blank' rel='noreferrer' className='group'>
												<span className='text-[1.05rem] font-bold leading-snug tracking-[-0.01em] text-[var(--ink)] group-hover:text-[var(--accent)]'>
													{s.title}
													<ArrowUpRightIcon className='ml-1.5 inline size-3.5 align-baseline text-[var(--ink-mute)] group-hover:text-[var(--accent)]' weight='bold' aria-hidden='true' />
												</span>
											</a>
											{s.summary ? <p className='mt-2 text-[14px] leading-[1.7] text-[var(--ink-2)]'>{s.summary}</p> : null}
											{s.also.length ? (
												<p className='mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px]'>
													<span className='text-[var(--ink-3)]'>Also reported by</span>
													{s.also.map((a) => (
														<a key={a.url} href={a.url} target='_blank' rel='noreferrer' className='inline-flex items-center gap-0.5 font-semibold text-[var(--ink-2)] underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]'>
															{a.source} <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
														</a>
													))}
												</p>
											) : null}
										</div>
										<span className='text-[12.5px] leading-[1.7] text-[var(--ink-3)] md:text-right'>
											<span className='block font-semibold text-[var(--ink-2)]'>{s.source}</span>
											{s.time}
										</span>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
				</div>
			</section>
		</>
	)
}
