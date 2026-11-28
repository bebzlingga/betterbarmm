import { ArrowRightIcon, BookOpenTextIcon, BooksIcon, BuildingsIcon, MagnifyingGlassIcon, NewspaperIcon, PenNibIcon, ShoppingCartIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { BookRail } from './_components/book-card'
import { AuthorMark, Figures, Masthead, SectionHead } from './_components/parts'
import { Rail } from './_components/rail'
import { SubjectBar } from './_components/subject-icon'
import { authors, books, booksBy, isLocal, localAuthors, magazines, publishers, subjects, subjectName } from './_lib/library'

/* ============================================================
   The library's front page, in the travel workspace's look (user
   decision): a dark header on a wall of the shelf's covers with the
   search centred on it as a white pill, the shelves as a bar of
   glyphs under it, then the books as rails a thumb swipes and a mouse
   drags, on alternating warm washes.
   ============================================================ */

const byYear = [...books].sort((a, b) => b.year - a.year)
const free = books.filter((b) => b.availability === 'open-access')
const inPrint = books.filter((b) => b.availability === 'for-sale')
const withCover = (list: typeof books) => [...list].sort((a, b) => Number(Boolean(b.cover)) - Number(Boolean(a.cover)))

const MORE = 'inline-flex items-center gap-2 font-semibold text-[var(--ink-2)] transition hover:text-[var(--accent)]'

export default function LibraryHome() {
	const shelves = subjects.slice(0, 4)
	const local = books.filter(isLocal)
	// The region's writers with a portrait first, then by how many books of theirs are here.
	const writers = [...localAuthors].sort((a, b) => Number(Boolean(b.photo)) - Number(Boolean(a.photo)) || booksBy(b.slug).length - booksBy(a.slug).length).slice(0, 14)

	return (
		<>
			<Masthead
				center
				tall
				kicker='Library · Bangsamoro'
				name='A library of the Bangsamoro'
				note='Every book we have found about the Bangsamoro and its peoples, from the sultanates to the peace process, with who wrote and published each and where it can be bought, borrowed or read free.'
			>
				<form method='get' action='/books' role='search' className='mx-auto mt-9 w-full max-w-2xl'>
					<span className='flex h-16 items-center gap-3 rounded-full bg-white pl-6 pr-2 text-[#191713] shadow-[0_24px_48px_-24px_rgba(0,0,0,0.7)]'>
						<MagnifyingGlassIcon size={20} className='shrink-0 text-[#5c574c]' aria-hidden='true' />
						<label htmlFor='book-search' className='sr-only'>
							Find a book
						</label>
						<input
							id='book-search'
							name='q'
							type='search'
							autoComplete='off'
							placeholder='A title, an author, a publisher or a year'
							className='min-w-0 flex-1 bg-transparent text-[1rem] outline-none placeholder:text-[#8a857a] [&::-webkit-search-cancel-button]:hidden'
						/>
						<button type='submit' className='h-12 shrink-0 cursor-pointer rounded-full bg-[var(--accent)] px-6 font-[family-name:var(--font-display)] text-[0.875rem] font-semibold text-white transition hover:brightness-110'>
							Find
						</button>
					</span>
				</form>
				<nav aria-label='Ways in' className='mt-6 flex flex-wrap justify-center gap-2'>
					{[
						{ href: '/books?availability=open-access', label: 'Free to read', icon: BookOpenTextIcon },
						{ href: '/books?local=1', label: 'Writers from home', icon: PenNibIcon },
						{ href: '/magazines', label: 'The offices’ magazines', icon: NewspaperIcon },
					].map(({ href, label, icon: Glyph }) => (
						<Link key={href} href={href} className='dv-btn dv-btn-glass !px-4 !py-2 !text-[0.8125rem]'>
							<Glyph size={14} weight='bold' aria-hidden='true' /> {label}
						</Link>
					))}
				</nav>
			</Masthead>

			<SubjectBar />

			{/* ---- The shelf in four figures ---- */}
			<section className='bb-container pt-16 lg:pt-20'>
				<Figures
					items={[
						{ value: books.length.toLocaleString('en-PH'), label: 'Books on the shelf', icon: BooksIcon },
						{ value: authors.length.toLocaleString('en-PH'), label: 'Authors, editors and translators', icon: PenNibIcon },
						{ value: publishers.length.toLocaleString('en-PH'), label: 'Publishers, from university presses to the author’s own', icon: BuildingsIcon },
						{ value: free.length.toLocaleString('en-PH'), label: 'Free to read in full', icon: BookOpenTextIcon },
					]}
				/>
			</section>

			<BookRail
				title='Newest on the shelf'
				lede='The most recent books, by year of first publication.'
				books={byYear.slice(0, 14)}
				more={
					<Link href='/books' className={MORE}>
						Every book, with filters <ArrowRightIcon size={14} weight='bold' aria-hidden='true' />
					</Link>
				}
			/>

			{/* ---- The region's own writers: their faces, then their books ---- */}
			<div className='tv-wash'>
				<Rail
					title='Writers from home'
					lede={`Stories, poems, histories and studies of the Bangsamoro by ${localAuthors.length} writers born in the region or elsewhere in Mindanao.`}
					className='!pb-0'
				>
					{writers.map((a) => {
						const n = booksBy(a.slug).length
						return (
							<li key={a.slug} className='w-[9.5rem]'>
								<Link href={`/authors/${a.slug}`} draggable={false} className='group flex flex-col items-center text-center'>
									<AuthorMark
										name={a.name}
										photo={a.photo ? `/authors/${a.photo.file}` : null}
										className='size-28 !bg-[var(--paper)] text-[1.5rem] ring-1 ring-[var(--rule)] transition duration-300 group-hover:-translate-y-1'
									/>
									<span className='mt-3 font-[family-name:var(--font-display)] text-[0.9375rem] font-bold leading-tight tracking-[-0.01em] text-[var(--ink)] group-hover:text-[var(--accent)]'>{a.name}</span>
									<span className='mt-0.5 text-[0.75rem] text-[var(--ink-3)]'>
										{n} {n === 1 ? 'book' : 'books'}
									</span>
								</Link>
							</li>
						)
					})}
				</Rail>
				<BookRail
					title='Their books'
					books={withCover(local).slice(0, 14)}
					more={
						<span className='flex flex-wrap justify-end gap-x-6 gap-y-2'>
							<Link href='/authors' className={MORE}>
								Meet the writers
							</Link>
							<Link href='/books?local=1' className={MORE}>
								All {local.length} of their books <ArrowRightIcon size={14} weight='bold' aria-hidden='true' />
							</Link>
						</span>
					}
				/>
			</div>

			{/* ---- Shelves by subject ---- */}
			{shelves.map((s, i) => (
				<BookRail
					key={s.slug}
					className={i % 2 === 1 ? 'tv-wash-flip' : ''}
					title={subjectName(s.slug)}
					lede={`${s.count} books on this shelf.`}
					books={withCover(books.filter((b) => b.subjects.includes(s.slug))).slice(0, 12)}
					more={
						<Link href={`/books?subject=${s.slug}`} className={MORE}>
							The whole shelf <ArrowRightIcon size={14} weight='bold' aria-hidden='true' />
						</Link>
					}
				/>
			))}

			{/* ---- Free, and in the shops ---- */}
			<div className='tv-wash'>
				<BookRail
					title='Free to read'
					lede='Published open: reports, studies and old histories whose publishers put the whole text online.'
					books={withCover(free).slice(0, 14)}
					className='!pb-0'
					more={
						<Link href='/books?availability=open-access' className={MORE}>
							All {free.length} <ArrowRightIcon size={14} weight='bold' aria-hidden='true' />
						</Link>
					}
				/>
				<BookRail
					title='In the shops'
					lede='Still in print: each page links to a shop that sells it.'
					books={withCover(inPrint).slice(0, 14)}
					more={
						<Link href='/books?availability=for-sale' className={MORE}>
							<ShoppingCartIcon size={14} weight='bold' aria-hidden='true' /> All {inPrint.length} in print
						</Link>
					}
				/>
			</div>

			{/* ---- Magazines ---- */}
			<section className='dv-section bb-container'>
				<SectionHead title='From the offices' note='The newsletters, magazines and reports the Bangsamoro Government’s own ministries and offices publish, issue by issue.' />
				<ul className='mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{magazines.slice(0, 6).map((m) => (
						<li key={m.slug}>
							<Link href={`/magazines#${m.slug}`} className='tv-card group h-full !flex-row gap-5 !p-5'>
								{m.cover ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={`/magazines/${m.cover.file}`} alt='' loading='lazy' decoding='async' className='aspect-[3/4] w-20 shrink-0 self-start rounded-xl object-cover shadow-[0_14px_24px_-16px_rgba(0,0,0,0.5)]' />
								) : (
									<span aria-hidden className='grid aspect-[3/4] w-20 shrink-0 place-items-center self-start rounded-xl bg-[var(--paper-2)] p-2 text-center font-[family-name:var(--font-display)] text-[0.75rem] font-black text-[var(--ink-3)]'>
										{m.acronym ?? m.title}
									</span>
								)}
								<span className='flex min-w-0 flex-1 flex-col'>
									<span className='text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
										{m.kind} · {m.acronym ?? m.office}
									</span>
									<span className='mt-1.5 font-[family-name:var(--font-display)] text-[1.0625rem] font-bold leading-snug tracking-[-0.02em] text-[var(--ink)] group-hover:text-[var(--accent)]'>{m.title}</span>
									<span className='mt-1.5 text-[0.8125rem] leading-snug text-[var(--ink-3)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden'>{m.about}</span>
									<span className='mt-auto pt-3 text-[0.75rem] font-semibold text-[var(--ink-2)]'>
										{m.issues.length} {m.issues.length === 1 ? 'issue' : 'issues'} found
									</span>
								</span>
							</Link>
						</li>
					))}
				</ul>
				<div className='mt-8 flex justify-end text-[0.875rem]'>
					<Link href='/magazines' className={MORE}>
						All {magazines.length} <ArrowRightIcon size={14} weight='bold' aria-hidden='true' />
					</Link>
				</div>
			</section>
		</>
	)
}
