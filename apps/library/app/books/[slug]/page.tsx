import type { Metadata } from 'next'
import { ArrowSquareOutIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Cover, Shelf } from '../../_components/book-card'
import { CHIP, H2 } from '../../_components/parts'
import { AVAILABILITY, authorBySlug, bookBySlug, books, booksBy, booksFrom, byline, publisherBySlug, subjectName } from '../../_lib/library'

export function generateStaticParams() {
	return books.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const book = bookBySlug.get((await params).slug)
	if (!book) return {}
	return { title: book.title, description: `${byline(book)}, ${publisherBySlug.get(book.publisher)?.name ?? ''} ${book.year}. ${book.summary}` }
}

const host = (url: string) => {
	try {
		return new URL(url).hostname.replace(/^www\./, '')
	} catch {
		return url
	}
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
	const book = bookBySlug.get((await params).slug)
	if (!book) notFound()
	const publisher = publisherBySlug.get(book.publisher)
	const people = book.authors.map((s) => authorBySlug.get(s)).filter((a) => a !== undefined)
	const a = AVAILABILITY[book.availability]
	const [first, ...rest] = book.links
	const byAuthors = [...new Map(people.flatMap((p) => booksBy(p.slug)).map((b) => [b.slug, b])).values()].filter((b) => b.slug !== book.slug)
	const sameShelf = books.filter((b) => b.slug !== book.slug && !byAuthors.some((x) => x.slug === b.slug) && b.subjects.some((s) => book.subjects.includes(s))).slice(0, 6)
	const fromPublisher = booksFrom(book.publisher).filter((b) => b.slug !== book.slug).slice(0, 6)

	return (
		<>
			<section className='bb-lattice brand-bg relative overflow-hidden'>
				<div className='bb-container relative grid gap-10 pb-[clamp(3rem,6vw,5rem)] pt-[clamp(3rem,6vw,5rem)] md:grid-cols-[minmax(0,14rem)_1fr] md:gap-14 lg:grid-cols-[minmax(0,17rem)_1fr]'>
					<div className='max-w-[14rem] md:max-w-none'>
						<Cover book={book} sizes='(min-width: 1024px) 272px, (min-width: 768px) 224px, 224px' priority />
					</div>
					<div>
						<p className='bb-label'>
							<Link href={`/books?subject=${book.subjects[0]}`} className='hover:underline'>
								{subjectName(book.subjects[0] ?? '')}
							</Link>
							{' · '}
							{book.kind}
						</p>
						<h1 className='bb-display-md mt-4 !font-black text-[var(--ink)]'>{book.title}</h1>
						{book.subtitle ? <p className='mt-3 text-[1.0625rem] leading-snug text-[var(--ink-2)]'>{book.subtitle}</p> : null}
						<p className='mt-5 text-[1rem] text-[var(--ink)]'>
							{book.role === 'editor' ? (people.length > 1 ? 'Edited by ' : 'Edited by ') : book.role === 'translator' ? 'Translated by ' : book.role === 'compiler' ? 'Compiled by ' : ''}
							{people.map((p, i) => (
								<span key={p.slug}>
									{i ? (i === people.length - 1 ? ' and ' : ', ') : ''}
									<Link href={`/authors/${p.slug}`} className='rule-link font-semibold'>
										{p.name}
									</Link>
								</span>
							))}
						</p>
						<dl className='mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-[0.875rem] sm:grid-cols-3'>
							<div>
								<dt className='text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>Publisher</dt>
								<dd className='mt-1 text-[var(--ink)]'>
									{publisher ? (
										<Link href={`/publishers/${publisher.slug}`} className='rule-link'>
											{publisher.name}
										</Link>
									) : (
										book.publisher
									)}
								</dd>
							</div>
							<div>
								<dt className='text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>Year</dt>
								<dd className='num mt-1 text-[var(--ink)]'>
									{book.year}
									{book.edition ? <span className='block text-[0.75rem] text-[var(--ink-3)]'>{book.edition}</span> : null}
								</dd>
							</div>
							<div>
								<dt className='text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>Language</dt>
								<dd className='mt-1 text-[var(--ink)]'>{book.language}</dd>
							</div>
							{book.pages ? (
								<div>
									<dt className='text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>Pages</dt>
									<dd className='num mt-1 text-[var(--ink)]'>{book.pages}</dd>
								</div>
							) : null}
							{book.isbn ? (
								<div>
									<dt className='text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>ISBN</dt>
									<dd className='num mt-1 text-[var(--ink)]'>{book.isbn}</dd>
								</div>
							) : null}
							<div>
								<dt className='text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>Availability</dt>
								<dd className='mt-1 font-semibold text-[var(--ink)]'>{a.label}</dd>
							</div>
						</dl>

						{/* ---- Where to get it ---- */}
						{first ? (
							<div className='mt-8 flex flex-wrap items-center gap-3'>
								<a href={first.url} target='_blank' rel='noreferrer' className='bb-btn bb-btn-accent'>
									{first.label}
									<ArrowSquareOutIcon size={14} weight='bold' aria-hidden='true' />
								</a>
								{rest.map((l) => (
									<a key={l.url} href={l.url} target='_blank' rel='noreferrer' className={CHIP}>
										{l.label}
									</a>
								))}
							</div>
						) : null}
						<p className='mt-3 text-[0.8125rem] leading-snug text-[var(--ink-3)]'>{a.note}</p>
					</div>
				</div>
				<div className='bb-weave' aria-hidden='true' />
			</section>

			<div className='bb-container bb-section grid gap-12 lg:grid-cols-[1fr_minmax(0,20rem)] lg:gap-20'>
				<div>
					<h2 className={H2}>About the book</h2>
					<p className='mt-4 max-w-[46rem] text-[1rem] leading-7 text-[var(--ink-2)]'>{book.summary}</p>
					{book.blurb ? (
						<figure className='mt-6 max-w-[46rem] border-l-2 border-[var(--rule)] pl-5'>
							<blockquote className='text-[0.9375rem] leading-7 text-[var(--ink-2)]'>{book.blurb}</blockquote>
							<figcaption className='mt-2 text-[0.75rem] text-[var(--ink-3)]'>
								The publisher’s description, as{' '}
								<a href={book.links.find((l) => l.label === 'Open Library')?.url ?? 'https://openlibrary.org'} className='rule-link' target='_blank' rel='noreferrer'>
									Open Library
								</a>{' '}
								records it.
							</figcaption>
						</figure>
					) : null}
					{book.note ? <p className='mt-4 max-w-[46rem] text-[0.875rem] leading-6 text-[var(--ink-3)]'>{book.note}</p> : null}
					<p className='mt-6 flex flex-wrap gap-2'>
						{book.subjects.map((s) => (
							<Link key={s} href={`/books?subject=${s}`} className={CHIP}>
								{subjectName(s)}
							</Link>
						))}
					</p>
					{book.cover ? (
						<p className='mt-8 text-[0.75rem] text-[var(--ink-mute)]'>
							Cover from{' '}
							<a href={book.cover.url} className='rule-link' target='_blank' rel='noreferrer'>
								{book.cover.source}
							</a>
							, shown to identify the book; its rights stay with the publisher.
						</p>
					) : null}
				</div>

				{/* ---- The people ---- */}
				<aside>
					{people.map((p) => (
						<div key={p.slug} className='border-t border-[var(--rule)] py-5 first:border-t-0 first:pt-0'>
							<p className='text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>{p.roles.join(' · ')}</p>
							<Link href={`/authors/${p.slug}`} className='mt-1 block font-[family-name:var(--font-display)] text-[1.0625rem] font-extrabold tracking-[-0.02em] text-[var(--ink)] hover:text-[var(--accent)]'>
								{p.name}
							</Link>
							<p className='mt-2 text-[0.8125rem] leading-snug text-[var(--ink-2)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4] overflow-hidden'>{p.bio}</p>
						</div>
					))}
					{publisher ? (
						<div className='border-t border-[var(--rule)] py-5'>
							<p className='text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>{publisher.kind} · {publisher.based}</p>
							<Link href={`/publishers/${publisher.slug}`} className='mt-1 block font-[family-name:var(--font-display)] text-[1.0625rem] font-extrabold tracking-[-0.02em] text-[var(--ink)] hover:text-[var(--accent)]'>
								{publisher.name}
							</Link>
							<p className='mt-2 text-[0.8125rem] leading-snug text-[var(--ink-2)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4] overflow-hidden'>{publisher.about}</p>
							{publisher.url ? (
								<a href={publisher.url} target='_blank' rel='noreferrer' className='mt-2 inline-block font-mono text-[0.625rem] uppercase tracking-[0.12em] text-[var(--ink-3)] hover:text-[var(--accent)]'>
									{host(publisher.url)}
								</a>
							) : null}
						</div>
					) : null}
				</aside>
			</div>

			{byAuthors.length ? (
				<section className='bg-[var(--paper-2)]'>
					<div className='bb-container bb-section'>
						<h2 className={H2}>More by {people.length === 1 ? people[0]!.name : 'the same authors'}</h2>
						<div className='mt-8'>
							<Shelf books={byAuthors} />
						</div>
					</div>
				</section>
			) : null}
			{sameShelf.length ? (
				<section className={byAuthors.length ? '' : 'bg-[var(--paper-2)]'}>
					<div className='bb-container bb-section'>
						<h2 className={H2}>On the same shelf</h2>
						<div className='mt-8'>
							<Shelf books={sameShelf} />
						</div>
					</div>
				</section>
			) : null}
			{fromPublisher.length ? (
				<section className={(byAuthors.length ? 1 : 0) + (sameShelf.length ? 1 : 0) === 1 ? 'bg-[var(--paper-2)]' : ''}>
					<div className='bb-container bb-section'>
						<h2 className={H2}>More from {publisher?.name}</h2>
						<div className='mt-8'>
							<Shelf books={fromPublisher} />
						</div>
					</div>
				</section>
			) : null}
		</>
	)
}
