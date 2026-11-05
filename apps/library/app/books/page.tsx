import type { Metadata } from 'next'
import Link from 'next/link'
import { Shelf } from '../_components/book-card'
import { CHIP, Masthead } from '../_components/parts'
import { AVAILABILITY, books, isLocal, matches, subjectName, subjects, type Availability } from '../_lib/library'

export const metadata: Metadata = {
	title: 'Books',
	description: 'Every book about the Bangsamoro on the shelf, by subject, by availability, by year.',
}

type Params = { q?: string; subject?: string; availability?: string; sort?: string; language?: string; local?: string }

const SORTS = { newest: 'Newest first', oldest: 'Oldest first', title: 'By title' } as const
const ON = `${CHIP} aria-[current]:border-[var(--ink)] aria-[current]:bg-[var(--ink)] aria-[current]:text-[var(--paper)]`

export default async function BooksPage({ searchParams }: { searchParams: Promise<Params> }) {
	const sp = await searchParams
	const q = sp.q?.trim() ?? ''
	const subject = sp.subject ?? ''
	const availability = sp.availability ?? ''
	const language = sp.language ?? ''
	const local = sp.local === '1' ? '1' : ''
	const sort = (sp.sort && sp.sort in SORTS ? sp.sort : 'newest') as keyof typeof SORTS

	const list = books
		.filter((b) => (!q || matches(b, q)) && (!subject || b.subjects.includes(subject)) && (!availability || b.availability === availability) && (!language || b.language === language) && (!local || isLocal(b)))
		.sort((a, b) => (sort === 'title' ? a.title.localeCompare(b.title) : sort === 'oldest' ? a.year - b.year : b.year - a.year))

	const languages = [...new Set(books.map((b) => b.language))].sort()
	const current = { q, subject, availability, language, sort, local }
	const href = (patch: Partial<Params>) => {
		const p = new URLSearchParams()
		for (const [k, v] of Object.entries({ ...current, ...patch })) if (v && !(k === 'sort' && v === 'newest')) p.set(k, v)
		const s = p.toString()
		return `/books${s ? `?${s}` : ''}`
	}
	const filtered = q || subject || availability || language || local

	return (
		<>
			<Masthead kicker='Library · Bangsamoro' name='The books' note={`${books.length} books about the Bangsamoro and its peoples, with where each can be bought, borrowed or read free.`}>
				<form method='get' action='/books' className='mt-10 flex h-12 max-w-[36rem] items-center bg-white pl-4 text-[#191713] shadow-[0_20px_40px_-24px_rgba(0,0,0,0.6)]'>
					{Object.entries(current)
						.filter(([k, v]) => v && k !== 'q' && !(k === 'sort' && v === 'newest'))
						.map(([k, v]) => (
							<input key={k} type='hidden' name={k} value={v} />
						))}
					<label htmlFor='q' className='sr-only'>
						Find a book
					</label>
					<input id='q' name='q' type='search' defaultValue={q} autoComplete='off' placeholder='Title, author, publisher or year' className='h-full min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-[#8a857a] [&::-webkit-search-cancel-button]:hidden' />
					<button type='submit' className='h-full shrink-0 cursor-pointer bg-[#191713] px-5 font-[family-name:var(--font-display)] text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#3a3530]'>
						Find
					</button>
				</form>
			</Masthead>

			<div className='bb-container bb-section'>
				{/* ---- Filters: plain links, so every view is an address ---- */}
				<div className='grid gap-5 border-b border-[var(--rule)] pb-6'>
					<div className='flex flex-wrap gap-2'>
						<Link href={href({ subject: '' })} aria-current={!subject ? 'true' : undefined} className={ON}>
							Every subject
						</Link>
						{subjects.map((s) => (
							<Link key={s.slug} href={href({ subject: s.slug })} aria-current={subject === s.slug ? 'true' : undefined} className={ON}>
								{s.name} <span className='num opacity-60'>{s.count}</span>
							</Link>
						))}
					</div>
					<div className='flex flex-wrap gap-2'>
						<Link href={href({ local: local ? '' : '1' })} aria-current={local ? 'true' : undefined} className={`${CHIP} aria-[current]:border-[var(--accent)] aria-[current]:bg-[var(--accent)] aria-[current]:text-white`}>
							By writers from Mindanao and the Bangsamoro
						</Link>
						{(Object.keys(AVAILABILITY) as Availability[]).map((a) => (
							<Link key={a} href={href({ availability: availability === a ? '' : a })} aria-current={availability === a ? 'true' : undefined} className={`${CHIP} aria-[current]:border-[var(--accent)] aria-[current]:bg-[var(--accent)] aria-[current]:text-white`}>
								{AVAILABILITY[a].label}
							</Link>
						))}
					</div>
				</div>

				<div className='mt-5 flex flex-wrap items-center justify-between gap-3 text-[0.8125rem] text-[var(--ink-3)]'>
					<p>
						<span className='num font-semibold text-[var(--ink)]'>{list.length}</span> {list.length === 1 ? 'book' : 'books'}
						{subject ? ` on ${subjectName(subject).toLowerCase()}` : ''}
						{availability ? `, ${AVAILABILITY[availability as Availability]?.label.toLowerCase()}` : ''}
						{language ? `, in ${language}` : ''}
						{local ? ', by writers from the region' : ''}
						{q ? ` matching “${q}”` : ''}
						{filtered ? (
							<>
								{' · '}
								<Link href='/books' className='rule-link'>
									clear
								</Link>
							</>
						) : null}
					</p>
					<div className='flex flex-wrap items-center gap-x-5 gap-y-1'>
						<span className='flex gap-2'>
							{(Object.keys(SORTS) as (keyof typeof SORTS)[]).map((s) => (
								<Link key={s} href={href({ sort: s })} aria-current={sort === s ? 'true' : undefined} className='aria-[current]:font-semibold aria-[current]:text-[var(--ink)] hover:text-[var(--ink)]'>
									{SORTS[s]}
								</Link>
							))}
						</span>
						{languages.length > 1 ? (
							<span className='flex gap-2'>
								{languages.map((l) => (
									<Link key={l} href={href({ language: language === l ? '' : l })} aria-current={language === l ? 'true' : undefined} className='aria-[current]:font-semibold aria-[current]:text-[var(--ink)] hover:text-[var(--ink)]'>
										{l}
									</Link>
								))}
							</span>
						) : null}
					</div>
				</div>

				<div className='mt-8'>
					{list.length ? (
						<Shelf books={list} showPublisher />
					) : (
						<p className='py-16 text-center text-[0.9375rem] text-[var(--ink-3)]'>
							Nothing on the shelf matches. Try fewer words, or{' '}
							<Link href='/books' className='rule-link'>
								see every book
							</Link>
							.
						</p>
					)}
				</div>
			</div>
		</>
	)
}
