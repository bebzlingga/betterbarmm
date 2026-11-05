import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Shelf } from '../../_components/book-card'
import { CHIP, H2, Masthead } from '../../_components/parts'
import { LOCAL_LABEL, authorBySlug, authors, booksBy } from '../../_lib/library'

export function generateStaticParams() {
	return authors.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const a = authorBySlug.get((await params).slug)
	return a ? { title: a.name, description: a.bio } : {}
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
	const a = authorBySlug.get((await params).slug)
	if (!a) notFound()
	const list = booksBy(a.slug)
	const life = [a.born ? `born ${a.born}` : '', a.died ? `died ${a.died}` : '', a.from ?? ''].filter(Boolean).join(' · ')
	return (
		<>
			<Masthead kicker={`${a.local ? `${LOCAL_LABEL[a.local]} · ` : 'Author · '}${a.roles.join(' · ')}`} name={a.name} note={life || undefined} stacked>
				<div className='mt-8 grid gap-8 md:grid-cols-[1fr_auto] md:items-start'>
					<p className='max-w-[44rem] text-[1rem] leading-7 text-[var(--ink-2)]'>{a.bio}</p>
					{a.photo ? (
						<figure className='m-0 w-40'>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={`/authors/${a.photo.file}`} alt={a.name} className='aspect-square w-40 object-cover' />
							<figcaption className='mt-1.5 text-[0.625rem] leading-snug text-[var(--ink-3)]'>
								{a.photo.author ? `${a.photo.author}, ` : ''}
								{a.photo.license ?? ''}
								{' · '}
								<a href={a.photo.url} className='underline' target='_blank' rel='noreferrer'>
									{a.photo.source}
								</a>
							</figcaption>
						</figure>
					) : null}
				</div>
				{a.links.length ? (
					<p className='mt-6 flex flex-wrap gap-2'>
						{a.links.map((l) => (
							<a key={l.url} href={l.url} target='_blank' rel='noreferrer' className={CHIP}>
								{l.label}
							</a>
						))}
					</p>
				) : null}
			</Masthead>
			<section className='bb-container bb-section'>
				<h2 className={H2}>
					{list.length} {list.length === 1 ? 'book' : 'books'} on the shelf
				</h2>
				<div className='mt-8'>
					<Shelf books={list} showPublisher />
				</div>
			</section>
		</>
	)
}
