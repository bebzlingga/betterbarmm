import { ArrowRightIcon, MagnifyingGlassIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { Shelf } from './_components/book-card'
import { Figures, Masthead, SectionHead } from './_components/parts'
import { authors, books, isLocal, localAuthors, magazines, publishers, subjects, subjectName } from './_lib/library'

const byYear = [...books].sort((a, b) => b.year - a.year)
const free = books.filter((b) => b.availability === 'open-access')
const inPrint = books.filter((b) => b.availability === 'for-sale')
const withCover = (list: typeof books) => [...list].sort((a, b) => Number(Boolean(b.cover)) - Number(Boolean(a.cover)))

export default function LibraryHome() {
	const shelves = subjects.slice(0, 4)
	return (
		<>
			<Masthead
				kicker='Library · Bangsamoro'
				name='A library of the Bangsamoro'
				note='Every book we have found about the Bangsamoro and its peoples, from the sultanates to the peace process, with who wrote and published each, where it can be bought, borrowed or read free, and the magazines the region’s own offices put out.'
			>
				{/* Fixed colours: inside the brand band, --paper and --ink point at its crimson ground. */}
				<form method='get' action='/books' className='mt-10 flex h-14 max-w-[44rem] items-center bg-white pl-5 text-[#191713] shadow-[0_20px_40px_-24px_rgba(0,0,0,0.6)]'>
					<MagnifyingGlassIcon size={20} className='shrink-0 text-[#5c574c]' aria-hidden='true' />
					<label htmlFor='book-search' className='sr-only'>
						Find a book
					</label>
					<input
						id='book-search'
						name='q'
						type='search'
						autoComplete='off'
						placeholder='Find a book by title, author, publisher or year'
						className='ml-3 h-full min-w-0 flex-1 bg-transparent text-[1rem] outline-none placeholder:text-[#8a857a] [&::-webkit-search-cancel-button]:hidden'
					/>
					<button type='submit' className='h-full shrink-0 cursor-pointer bg-[#191713] px-6 font-[family-name:var(--font-display)] text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#3a3530]'>
						Find
					</button>
				</form>
				<div className='mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[0.875rem]'>
					<Link href='/books?availability=open-access' className='rule-link'>
						Books you can read free
					</Link>
					<Link href='/magazines' className='rule-link'>
						The offices’ magazines
					</Link>
				</div>
			</Masthead>

			<section className='bg-[var(--paper-2)]'>
				<Figures
					items={[
						{ value: books.length.toLocaleString('en-PH'), label: 'Books on the shelf' },
						{ value: authors.length.toLocaleString('en-PH'), label: 'Authors, editors and translators' },
						{ value: publishers.length.toLocaleString('en-PH'), label: 'Publishers, from university presses to the author’s own' },
						{ value: free.length.toLocaleString('en-PH'), label: 'Free to read in full' },
					]}
				/>
			</section>

			{/* ---- New on the shelf ---- */}
			<section className='bb-container bb-section'>
				<SectionHead title='Newest on the shelf' note='The most recent books, by year of first publication.' />
				<div className='mt-8'>
					<Shelf books={byYear.slice(0, 12)} />
				</div>
				<Link href='/books' className='rule-link mt-8 inline-flex items-center gap-2 text-[0.875rem]'>
					Every book, with filters <ArrowRightIcon size={14} aria-hidden='true' />
				</Link>
			</section>

			{/* ---- The region's own writers ---- */}
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container bb-section'>
					<SectionHead
						title='Writers from home'
						note={`Stories, poems, histories and studies of the Bangsamoro by ${localAuthors.length} writers born in the region or elsewhere in Mindanao.`}
					/>
					<div className='mt-8'>
						<Shelf books={withCover(books.filter(isLocal)).slice(0, 12)} />
					</div>
					<div className='mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[0.875rem]'>
						<Link href='/books?local=1' className='rule-link inline-flex items-center gap-2'>
							All {books.filter(isLocal).length} of their books <ArrowRightIcon size={14} aria-hidden='true' />
						</Link>
						<Link href='/authors' className='rule-link'>
							Meet the writers
						</Link>
					</div>
				</div>
			</section>

			{/* ---- Shelves by subject ---- */}
			{shelves.map((s, i) => (
				<section key={s.slug} className={i % 2 === 1 ? 'bg-[var(--paper-2)]' : ''}>
					<div className='bb-container bb-section'>
						<SectionHead title={subjectName(s.slug)} note={`${s.count} books on this shelf.`} />
						<div className='mt-8'>
							<Shelf books={withCover(books.filter((b) => b.subjects.includes(s.slug))).slice(0, 6)} />
						</div>
						<Link href={`/books?subject=${s.slug}`} className='rule-link mt-8 inline-flex items-center gap-2 text-[0.875rem]'>
							The whole shelf <ArrowRightIcon size={14} aria-hidden='true' />
						</Link>
					</div>
				</section>
			))}

			{/* ---- Free to read ---- */}
			<section className='bb-container bb-section'>
				<SectionHead title='Free to read' note='Published open: reports, studies and old histories whose publishers put the whole text online.' />
				<div className='mt-8'>
					<Shelf books={withCover(free).slice(0, 12)} />
				</div>
				<Link href='/books?availability=open-access' className='rule-link mt-8 inline-flex items-center gap-2 text-[0.875rem]'>
					All {free.length} <ArrowRightIcon size={14} aria-hidden='true' />
				</Link>
			</section>

			{/* ---- In print ---- */}
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container bb-section'>
					<SectionHead title='In the shops' note='Still in print: each page links to a shop that sells it.' />
					<div className='mt-8'>
						<Shelf books={withCover(inPrint).slice(0, 12)} />
					</div>
					<Link href='/books?availability=for-sale' className='rule-link mt-8 inline-flex items-center gap-2 text-[0.875rem]'>
						All {inPrint.length} <ArrowRightIcon size={14} aria-hidden='true' />
					</Link>
				</div>
			</section>

			{/* ---- Magazines ---- */}
			<section className='bb-container bb-section'>
				<SectionHead title='From the offices' note='The newsletters, magazines and reports the Bangsamoro Government’s own ministries and offices publish, issue by issue.' />
				<ul className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{magazines.slice(0, 6).map((m) => (
						<li key={m.slug} className='flex flex-col border border-[var(--rule)] p-5'>
							<p className='text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
								{m.kind} · {m.acronym ?? m.office}
							</p>
							<Link href={`/magazines#${m.slug}`} className='mt-2 font-[family-name:var(--font-display)] text-[1.0625rem] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)] hover:text-[var(--accent)]'>
								{m.title}
							</Link>
							<p className='mt-2 flex-1 text-[0.8125rem] leading-snug text-[var(--ink-2)]'>{m.about}</p>
							<p className='mt-3 text-[0.75rem] text-[var(--ink-3)]'>
								{m.issues.length} {m.issues.length === 1 ? 'issue' : 'issues'} found
							</p>
						</li>
					))}
				</ul>
				<Link href='/magazines' className='rule-link mt-8 inline-flex items-center gap-2 text-[0.875rem]'>
					All {magazines.length} <ArrowRightIcon size={14} aria-hidden='true' />
				</Link>
			</section>
		</>
	)
}
