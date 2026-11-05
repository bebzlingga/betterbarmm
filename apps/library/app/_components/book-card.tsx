import Link from 'next/link'
import { AVAILABILITY, byline, coverSrc, publisherBySlug, type Book } from '../_lib/library'

/* A cover on the shelf. Where no cover has been found the title is set on
   a coloured board, the colour from the book's own slug, so a shelf of
   coverless books still reads as a shelf and not as a list of errors. */

const BOARDS = ['#8c2f39', '#2f4f6f', '#3f6b4f', '#6b4f2f', '#4f3f6b', '#2f6b6b', '#6b2f5f', '#5f5f2f']
const board = (slug: string) => BOARDS[[...slug].reduce((h, c) => h + c.charCodeAt(0), 0) % BOARDS.length]

export function Cover({ book, sizes = '(min-width: 1024px) 180px, 40vw', priority = false }: { book: Book; sizes?: string; priority?: boolean }) {
	const src = coverSrc(book)
	return (
		<div className='relative aspect-[2/3] w-full overflow-hidden bg-[var(--paper-2)] shadow-[0_18px_30px_-22px_rgba(0,0,0,0.55)]'>
			{src ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img src={src} alt={`Cover of ${book.title}`} sizes={sizes} loading={priority ? 'eager' : 'lazy'} className='size-full object-cover' />
			) : (
				<div className='flex size-full flex-col justify-between p-4 text-white' style={{ background: `linear-gradient(160deg, ${board(book.slug)}, #1c1a17)` }} aria-hidden='true'>
					<span className='font-[family-name:var(--font-display)] text-[0.9rem] font-extrabold leading-tight tracking-[-0.02em] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:6] overflow-hidden'>{book.title}</span>
					<span className='text-[0.65rem] leading-snug opacity-80'>{byline(book)}</span>
				</div>
			)}
		</div>
	)
}

export function BookCard({ book, showPublisher = false }: { book: Book; showPublisher?: boolean }) {
	const a = AVAILABILITY[book.availability]
	return (
		<li className='group flex flex-col'>
			<Link href={`/books/${book.slug}`} className='block transition group-hover:-translate-y-0.5'>
				<Cover book={book} />
			</Link>
			<div className='flex flex-1 flex-col pt-3.5'>
				<p className='flex flex-wrap items-center gap-x-2 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
					<span className='num'>{book.year}</span>
					<span className={book.availability === 'for-sale' ? 'text-[var(--accent)]' : book.availability === 'open-access' ? 'text-[#2f6b4f] dark:text-[#7fc9a1]' : ''}>{a.label}</span>
				</p>
				<Link href={`/books/${book.slug}`} className='mt-1.5 font-[family-name:var(--font-display)] text-[0.9375rem] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)] hover:text-[var(--accent)]'>
					{book.title}
				</Link>
				<p className='mt-1 text-[0.8125rem] leading-snug text-[var(--ink-2)]'>{byline(book)}</p>
				{showPublisher ? <p className='mt-0.5 text-[0.75rem] text-[var(--ink-3)]'>{publisherBySlug.get(book.publisher)?.name}</p> : null}
				{/* What it is about, in three lines; the page has the rest. */}
				<p className='mt-2 text-[0.78125rem] leading-snug text-[var(--ink-3)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden'>{book.summary}</p>
			</div>
		</li>
	)
}

/** A shelf: a row of cards, six across on a wide screen. */
export function Shelf({ books, showPublisher = false }: { books: Book[]; showPublisher?: boolean }) {
	return (
		<ul className='grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
			{books.map((b) => (
				<BookCard key={b.slug} book={b} showPublisher={showPublisher} />
			))}
		</ul>
	)
}
