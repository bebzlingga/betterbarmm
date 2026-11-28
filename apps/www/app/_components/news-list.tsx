'use client'

import { ArrowUpRightIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import { useDeferredValue, useMemo, useState } from 'react'
import { PhotoHero } from './photo-hero'

/* Latest news, one story per row: the headline from the outlet that carries it best, and every other outlet
   that reported the same thing beside it. The header is the travel look's photograph header with the search as a
   white pill on it; the search filters the stories as the reader types. */

export type Story = {
	key: string
	title: string
	summary: string
	url: string
	source: string
	/** The outlet's own picture for the story (its og:image or feed image), or null. */
	image: string | null
	/** Manila day and time of the report whose headline the row shows, formatted on the server. */
	day: string
	time: string | null
	also: { source: string; url: string }[]
}

/** One story: its picture on the left where the outlet has one that loads; with none, the text takes the row. */
function Row({ s }: { s: Story }) {
	const [failed, setFailed] = useState(false)
	const pic = !!s.image && !failed
	return (
		<li className={`grid gap-y-1 border-t border-[var(--rule)] py-5 ${pic ? 'grid-cols-[3.25rem_minmax(0,1fr)] gap-x-3.5 sm:grid-cols-[5.25rem_minmax(0,1fr)] sm:gap-x-5 md:grid-cols-[6rem_minmax(0,1fr)_12rem] md:gap-x-6' : 'gap-x-8 md:grid-cols-[minmax(0,1fr)_12rem]'}`}>
			{pic ? (
				<a href={s.url} target='_blank' rel='noreferrer' tabIndex={-1} aria-hidden='true' className='row-span-2 block aspect-square self-start overflow-hidden rounded-xl bg-[var(--paper-2)] sm:aspect-[3/2] md:row-span-1'>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={s.image!} alt='' loading='lazy' referrerPolicy='no-referrer' onError={() => setFailed(true)} className='h-full w-full object-cover' />
				</a>
			) : null}
			<div className='min-w-0'>
				<a href={s.url} target='_blank' rel='noreferrer' className='group'>
					<span className='text-[1.05rem] font-bold leading-snug tracking-[-0.01em] text-[var(--ink)] group-hover:text-[var(--accent)]'>
						{s.title}
						<ArrowUpRightIcon className='ml-1.5 inline size-3.5 align-baseline text-[var(--ink-mute)] group-hover:text-[var(--accent)]' weight='bold' aria-hidden='true' />
					</span>
				</a>
				{s.summary ? <p className='mt-2 text-[0.875rem] leading-[1.7] text-[var(--ink-2)]'>{s.summary}</p> : null}
				{s.also.length ? (
					<p className='mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[0.8125rem]'>
						<span className='mr-1 text-[var(--ink-3)]'>Also reported by</span>
						{s.also.map((a) => (
							<a key={a.url} href={a.url} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1 rounded-full border border-[var(--rule)] px-2.5 py-0.5 font-semibold text-[var(--ink-2)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]'>
								{a.source} <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
							</a>
						))}
					</p>
				) : null}
			</div>
			<span className={`text-[0.78125rem] leading-[1.7] text-[var(--ink-3)] md:text-right ${pic ? 'col-start-2 md:col-start-auto' : ''}`}>
				<span className='block font-semibold text-[var(--ink-2)]'>{s.source}</span>
				{s.time}
			</span>
		</li>
	)
}

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function NewsList({ stories, head }: { stories: Story[]; head: { kicker: string; title: string; lede: string } }) {
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
			{/* The travel look (user decision): the region's photographs under the bars, the search a white pill on them. */}
			<PhotoHero photos={['cotabatoPlaza', 'parliamentSession', 'marawiGrandMosque']} center kicker={head.kicker} title={head.title} lede={head.lede}>
				<form role='search' onSubmit={(e) => e.preventDefault()} className='mx-auto mt-9 w-full max-w-2xl'>
					<label htmlFor='news-search' className='sr-only'>
						Search the news
					</label>
					<span className='flex h-16 items-center gap-3 rounded-full bg-white pl-6 pr-3 text-[#191713] shadow-[0_24px_48px_-24px_rgba(0,0,0,0.7)]'>
						<MagnifyingGlassIcon size={20} className='shrink-0 text-[#5c574c]' aria-hidden='true' />
						<input
							id='news-search'
							type='search'
							autoComplete='off'
							value={q}
							onChange={(e) => setQ(e.target.value)}
							placeholder='A town, a name, an outlet, a subject…'
							aria-controls='news-results'
							className='min-w-0 flex-1 bg-transparent text-[1rem] outline-none placeholder:text-[#8a857a] [&::-webkit-search-cancel-button]:hidden'
						/>
						{q ? (
							<button type='button' onClick={() => setQ('')} aria-label='Clear the search' className='grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-[#5c574c] hover:bg-[#f1ede6]'>
								<XIcon size={15} weight='bold' aria-hidden='true' />
							</button>
						) : null}
					</span>
				</form>
			</PhotoHero>

			<section id='news-results' aria-live='polite' className='bb-container pb-24 pt-16 lg:pb-32 lg:pt-20'>
				<div className='mx-auto max-w-5xl'>
				{query.trim() ? (
					<p className='mb-10 text-[0.84375rem] text-[var(--ink-3)]'>
						{shown.length ? `${shown.length} ${shown.length === 1 ? 'story' : 'stories'} for “${query.trim()}”` : `Nothing this week matches “${query.trim()}”.`}
					</p>
				) : null}
				<div className='grid gap-14'>
					{[...days].map(([label, list]) => (
						<div key={label}>
							<h2 className='flex items-baseline justify-between gap-4 font-[family-name:var(--font-display)] text-[1.375rem] font-extrabold tracking-[-0.025em] text-[var(--ink)]'>
								{label}
								<span className='shrink-0 rounded-full bg-[var(--paper-2)] px-3 py-1 text-[0.75rem] font-semibold tracking-normal text-[var(--ink-3)]'>
									{list.length} {list.length === 1 ? 'story' : 'stories'}
								</span>
							</h2>
							<ul className='mt-5'>
								{list.map((s) => (
									<Row key={s.key} s={s} />
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
