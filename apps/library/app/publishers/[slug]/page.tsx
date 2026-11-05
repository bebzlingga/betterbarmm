import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Shelf } from '../../_components/book-card'
import { CHIP, H2, Masthead } from '../../_components/parts'
import { booksFrom, publisherBySlug, publishers } from '../../_lib/library'

export function generateStaticParams() {
	return publishers.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const p = publisherBySlug.get((await params).slug)
	return p ? { title: p.name, description: p.about } : {}
}

const host = (url: string) => {
	try {
		return new URL(url).hostname.replace(/^www\./, '')
	} catch {
		return url
	}
}

export default async function PublisherPage({ params }: { params: Promise<{ slug: string }> }) {
	const p = publisherBySlug.get((await params).slug)
	if (!p) notFound()
	const list = booksFrom(p.slug)
	return (
		<>
			<Masthead kicker={`Publisher · ${p.kind}`} name={p.name} note={`${p.based}${p.founded ? ` · since ${p.founded}` : ''}`} stacked>
				<p className='mt-8 max-w-[44rem] text-[1rem] leading-7 text-[var(--ink-2)]'>{p.about}</p>
				{p.url ? (
					<p className='mt-6'>
						<a href={p.url} target='_blank' rel='noreferrer' className={CHIP}>
							{host(p.url)}
						</a>
					</p>
				) : null}
			</Masthead>
			<section className='bb-container bb-section'>
				<h2 className={H2}>
					{list.length} {list.length === 1 ? 'book' : 'books'} on the shelf
				</h2>
				<div className='mt-8'>
					<Shelf books={list} />
				</div>
			</section>
		</>
	)
}
