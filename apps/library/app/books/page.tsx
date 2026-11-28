import type { Metadata } from 'next'
import Link from 'next/link'
import { Shelf } from '../_components/book-card'
import { AutoSelect } from '../_components/auto-select'
import { Masthead } from '../_components/parts'
import { SubjectBar } from '../_components/subject-icon'
import { MagnifyingGlassIcon } from '@phosphor-icons/react/ssr'
import { AVAILABILITY, books, isLocal, matches, subjectName, subjects, type Availability } from '../_lib/library'

export const metadata: Metadata = {
	title: 'Books',
	description: 'Every book about the Bangsamoro on the shelf, by subject, by availability, by year.',
}

type Params = { q?: string; subject?: string; availability?: string; sort?: string; language?: string; local?: string }

const SORTS = { newest: 'Newest first', oldest: 'Oldest first', title: 'By title' } as const
const FIELD = 'h-11 cursor-pointer rounded-full border border-[var(--rule)] bg-[var(--paper)] pl-4 text-[0.875rem] text-[var(--ink)] transition hover:border-[var(--ink)]'

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
			<Masthead
				kicker='Library · Bangsamoro'
				name={subject ? subjectName(subject) : 'The books'}
				note={subject ? `${list.length} ${list.length === 1 ? 'book' : 'books'} on this shelf, with where each can be bought, borrowed or read free.` : `${books.length} books about the Bangsamoro and its peoples, with where each can be bought, borrowed or read free.`}
				covers={list.slice(0, 18)}
			/>
			<SubjectBar active={subject} />

			<div className='bb-container pb-24 pt-12 lg:pb-32 lg:pt-14'>
				{/* ---- Filters: a GET form and plain links, so every view is an address ---- */}
				<div className='grid gap-5'>
					<form method='get' action='/books' className='flex flex-wrap items-center justify-between gap-3'>
						{sort !== 'newest' ? <input type='hidden' name='sort' value={sort} /> : null}
						<div className='flex h-12 min-w-[16rem] flex-1 items-center gap-2 rounded-full border border-[var(--rule)] bg-[var(--paper)] pl-5 pr-1.5 sm:max-w-[30rem]'>
							<MagnifyingGlassIcon size={17} className='shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
							<label htmlFor='q' className='sr-only'>
								Find a book
							</label>
							<input id='q' name='q' type='search' defaultValue={q} autoComplete='off' placeholder='Title, author, publisher or year' className='h-full min-w-0 flex-1 bg-transparent text-[0.875rem] text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)] [&::-webkit-search-cancel-button]:hidden' />
							<button type='submit' className='h-9 shrink-0 cursor-pointer rounded-full bg-[var(--accent)] px-5 font-[family-name:var(--font-display)] text-[0.8125rem] font-semibold text-white transition hover:brightness-110'>
								Find
							</button>
						</div>
						<div className='flex flex-wrap gap-3'>
							<label className='sr-only' htmlFor='subject'>
								Subject
							</label>
							<AutoSelect id='subject' name='subject' defaultValue={subject} className={FIELD}>
								<option value=''>Every subject</option>
								{subjects.map((s) => (
									<option key={s.slug} value={s.slug}>
										{s.name} ({s.count})
									</option>
								))}
							</AutoSelect>
							<label className='sr-only' htmlFor='language'>
								Language
							</label>
							<AutoSelect id='language' name='language' defaultValue={language} className={FIELD}>
								<option value=''>Every language</option>
								{languages.map((l) => (
									<option key={l} value={l}>
										{l}
									</option>
								))}
							</AutoSelect>
							<label className='sr-only' htmlFor='availability'>
								Availability
							</label>
							<AutoSelect id='availability' name='availability' defaultValue={availability} className={FIELD}>
								<option value=''>Any availability</option>
								{(Object.keys(AVAILABILITY) as Availability[]).map((a) => (
									<option key={a} value={a}>
										{AVAILABILITY[a].label}
									</option>
								))}
							</AutoSelect>
							<label className='sr-only' htmlFor='local'>
								Writers
							</label>
							<AutoSelect id='local' name='local' defaultValue={local} className={FIELD}>
								<option value=''>Every writer</option>
								<option value='1'>Writers from the region</option>
							</AutoSelect>
						</div>
					</form>
				</div>

				<div className='mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule)] pb-5 text-[0.8125rem] text-[var(--ink-3)]'>
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
								<Link key={s} href={href({ sort: s })} aria-current={sort === s ? 'true' : undefined} className='dv-pill !px-3.5 !py-1.5 !text-[0.8125rem]'>
									{SORTS[s]}
								</Link>
							))}
						</span>
					</div>
				</div>

				<div className='mt-12 lg:mt-14'>
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
