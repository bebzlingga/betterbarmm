import type { Metadata } from 'next'
import { ArrowSquareOutIcon, ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookRail, Cover } from '../../_components/book-card'
import { CHIP, CHIP_DARK, CoverWall, H2 } from '../../_components/parts'
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
	const sameShelf = books.filter((b) => b.slug !== book.slug && !byAuthors.some((x) => x.slug === b.slug) && b.subjects.some((s) => book.subjects.includes(s))).slice(0, 12)
	const fromPublisher = booksFrom(book.publisher).filter((b) => b.slug !== book.slug).slice(0, 12)

	return (
		<>
			{/* The travel look (user decision): the book's own cover, sharp, on the dark header over a wall of its shelf's covers. */}
			<header className='dv-hero dv-hero-short'>
				<CoverWall first={[...byAuthors, ...sameShelf]} />
				<span aria-hidden='true' className='dv-hero-shade !bg-[rgba(8,12,16,0.72)]' />
				<div className='bb-container relative grid min-h-[inherit] content-end gap-10 pb-16 pt-[calc(var(--tv-nav-h)+4rem)] md:grid-cols-[minmax(0,14rem)_1fr] md:items-start md:gap-14 md:pb-20 lg:grid-cols-[minmax(0,16rem)_1fr]'>
					<div className='w-[11rem] md:w-auto'>
						<Cover book={book} sizes='(min-width: 1024px) 256px, (min-width: 768px) 224px, 176px' priority className='shadow-[0_30px_60px_-24px_rgba(0,0,0,0.8)] ring-1 ring-white/10' />
					</div>
					<div>
						<p className='flex flex-wrap items-center gap-2'>
							<Link href={`/books?subject=${book.subjects[0]}`} className={CHIP_DARK}>
								{subjectName(book.subjects[0] ?? '')}
							</Link>
							<span className='dv-chip !px-3 !py-1.5'>{book.kind}</span>
							<span className='dv-chip !px-3 !py-1.5'>{a.label}</span>
						</p>
						<h1 className={`pg-hero-title pg-hero-title-sm mt-5 ${book.title.length > 60 ? '!text-[clamp(1.875rem,3.4vw,3rem)] !leading-[1.06]' : ''}`}>{book.title}</h1>
						{book.subtitle ? <p className='mt-3 max-w-3xl text-[1.0625rem] leading-snug text-white/80'>{book.subtitle}</p> : null}
						{people.length ? (
						<p className='mt-5 text-[1rem] text-white/90'>
							{book.role === 'editor' ? 'Edited by ' : book.role === 'translator' ? 'Translated by ' : book.role === 'compiler' ? 'Compiled by ' : 'By '}
							{people.map((p, i) => (
								<span key={p.slug}>
									{i ? (i === people.length - 1 ? ' and ' : ', ') : ''}
									<Link href={`/authors/${p.slug}`} className='font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white'>
										{p.name}
									</Link>
								</span>
							))}
						</p>
						) : null}
						{/* The details on the left and where to get it at the row's right end (user decision), wrapping under on a narrow screen. */}
						<div className='mt-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-8'>
						<dl className='flex flex-wrap gap-x-10 gap-y-4 text-[0.9375rem]'>
							<div>
								<dt className='text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/50'>Publisher</dt>
								<dd className='mt-1 text-white'>
									{publisher ? (
										<Link href={`/publishers/${publisher.slug}`} className='hover:underline'>
											{publisher.name}
										</Link>
									) : (
										book.publisher
									)}
								</dd>
							</div>
							<div>
								<dt className='text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/50'>Year</dt>
								<dd className='num mt-1 text-white'>
									{book.year}
									{book.edition ? <span className='block text-[0.75rem] text-white/55'>{book.edition}</span> : null}
								</dd>
							</div>
							<div>
								<dt className='text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/50'>Language</dt>
								<dd className='mt-1 text-white'>{book.language}</dd>
							</div>
							{book.pages ? (
								<div>
									<dt className='text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/50'>Pages</dt>
									<dd className='num mt-1 text-white'>{book.pages}</dd>
								</div>
							) : null}
							{book.isbn ? (
								<div>
									<dt className='text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/50'>ISBN</dt>
									<dd className='num mt-1 text-white'>{book.isbn}</dd>
								</div>
							) : null}
						</dl>

						{/* ---- Where to get it ---- */}
						<div className='flex flex-col items-start gap-3 lg:items-end lg:text-right'>
							{first ? (
								<div className='flex flex-wrap items-center gap-2.5 lg:justify-end'>
									<a href={first.url} target='_blank' rel='noreferrer' className='dv-btn dv-btn-light'>
										{first.label}
										<ArrowSquareOutIcon size={15} weight='bold' aria-hidden='true' />
									</a>
									{rest.map((l) => (
										<a key={l.url} href={l.url} target='_blank' rel='noreferrer' className='dv-btn dv-btn-glass !px-4 !py-2.5 !text-[0.8125rem]'>
											{l.label}
											<ArrowUpRightIcon size={12} weight='bold' aria-hidden='true' />
										</a>
									))}
								</div>
							) : null}
							<p className='max-w-[22rem] text-[0.8125rem] leading-snug text-white/60'>{a.note}</p>
						</div>
						</div>
					</div>
				</div>
			</header>

			<div className='bb-container dv-section grid gap-12 lg:grid-cols-[1fr_minmax(0,22rem)] lg:gap-20'>
				<div>
					<h2 className={H2}>About the book</h2>
					<p className='mt-4 max-w-[60rem] text-[1rem] leading-7 text-[var(--ink-2)]'>{book.summary}</p>
					{book.overview ? (
						<div className='mt-5 max-w-[60rem] space-y-4 text-[1rem] leading-7 text-[var(--ink-2)]'>
							{book.overview.split(/\n\s*\n/).map((para, i) => (
								<p key={i}>{para}</p>
							))}
							{book.overviewSources?.length ? (
								<p className='text-[0.75rem] leading-5 text-[var(--ink-3)]'>
									From{' '}
									{book.overviewSources.map((u, i) => (
										<span key={u}>
											{i ? ', ' : ''}
											<a href={u} className='rule-link' target='_blank' rel='noreferrer'>
												{new URL(u).hostname.replace(/^www\./, '')}
											</a>
										</span>
									))}
									.
								</p>
							) : null}
						</div>
					) : null}
					{book.blurb ? (
						<figure className='mt-6 max-w-[60rem] border-l-2 border-[var(--rule)] pl-5'>
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
					{book.note ? <p className='mt-4 max-w-[60rem] text-[0.875rem] leading-6 text-[var(--ink-3)]'>{book.note}</p> : null}
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

				{/* ---- The people, each on a rounded panel ---- */}
				<aside className='grid content-start gap-4'>
					{people.map((p) => (
						<div key={p.slug} className='dv-panel'>
							<p className='text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>{p.roles.join(' · ')}</p>
							<Link href={`/authors/${p.slug}`} className='mt-1 block font-[family-name:var(--font-display)] text-[1.0625rem] font-extrabold tracking-[-0.02em] text-[var(--ink)] hover:text-[var(--accent)]'>
								{p.name}
							</Link>
							<p className='mt-2 text-[0.8125rem] leading-snug text-[var(--ink-2)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4] overflow-hidden'>{p.bio}</p>
						</div>
					))}
					{publisher ? (
						<div className='dv-panel'>
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

			{byAuthors.length ? <BookRail className='tv-wash' title={`More by ${people.length === 1 ? people[0]!.name : 'the same authors'}`} books={byAuthors} /> : null}
			{sameShelf.length ? <BookRail className={byAuthors.length ? '' : 'tv-wash'} title='On the same shelf' books={sameShelf} /> : null}
			{fromPublisher.length ? <BookRail className={(byAuthors.length ? 1 : 0) + (sameShelf.length ? 1 : 0) === 1 ? 'tv-wash' : 'tv-wash-flip'} title={`More from ${publisher?.name}`} books={fromPublisher} /> : null}
		</>
	)
}
