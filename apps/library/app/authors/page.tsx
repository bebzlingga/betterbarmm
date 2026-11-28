import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthorMark, Masthead } from '../_components/parts'
import { LOCAL_LABEL, authors, booksBy, localAuthors } from '../_lib/library'

export const metadata: Metadata = {
	title: 'Authors',
	description: 'The historians, journalists, scholars, poets and officials who wrote the books about the Bangsamoro.',
}

export default function AuthorsPage() {
	const sorted = [...authors].sort((a, b) => a.sort.localeCompare(b.sort))
	const letters = [...new Set(sorted.map((a) => a.sort[0]!.toUpperCase()))]
	return (
		<>
			<Masthead kicker='Library · Bangsamoro' name='The authors' note={`${authors.length} historians, journalists, scholars, poets, soldiers and officials, each with a life in brief and the books of theirs on the shelf.`} />
			<section className='tv-wash'>
				<div className='bb-container dv-section'>
					<div>
						<h2 className='dv-title'>Writers from home</h2>
						<p className='dv-lede'>
							{localAuthors.length} of the authors on the shelf were born in the Bangsamoro or elsewhere in Mindanao, or made their lives there: storytellers, poets, historians and scholars writing about the region from within.
						</p>
					</div>
					{(['bangsamoro', 'mindanao'] as const).map((k) => (
						<div key={k} className='mt-10'>
							<h3 className='bb-label'>{LOCAL_LABEL[k]}</h3>
							<ul className='mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
								{localAuthors
									.filter((a) => a.local === k)
									.map((a) => {
										const n = booksBy(a.slug).length
										return (
											<li key={a.slug} className='tv-card relative !flex-row items-start gap-3.5 !p-4'>
												<AuthorMark name={a.name} photo={a.photo ? `/authors/${a.photo.file}` : null} className='size-11 !bg-[var(--paper)] text-[0.8125rem]' />
												<div className='min-w-0'>
													<Link href={`/authors/${a.slug}`} className='tv-card-link font-[family-name:var(--font-display)] text-[1rem] font-bold tracking-[-0.02em] text-[var(--ink)] after:absolute after:inset-0 hover:text-[var(--accent)]'>
														{a.name}
													</Link>
													<p className='mt-0.5 text-[0.75rem] text-[var(--ink-3)]'>
														{[a.from, a.roles.join(', ')].filter(Boolean).join(' · ')} · {n} {n === 1 ? 'book' : 'books'}
													</p>
												</div>
											</li>
										)
									})}
							</ul>
						</div>
					))}
				</div>
			</section>
			<div className='bb-container dv-section'>
				<h2 className='dv-title'>Every author</h2>
				<p className='mt-6 flex flex-wrap gap-1.5'>
					{letters.map((l) => (
						<a key={l} href={`#${l}`} className='dv-round !size-10 font-[family-name:var(--font-display)] text-[0.875rem] font-bold'>
							{l}
						</a>
					))}
				</p>
				{letters.map((l) => (
					<section key={l} id={l} className='mt-14 scroll-mt-8'>
						<h2 className='font-[family-name:var(--font-display)] text-[2rem] font-extrabold tracking-[-0.03em] text-[var(--ink)]'>{l}</h2>
						<ul className='mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
							{sorted
								.filter((a) => a.sort[0]!.toUpperCase() === l)
								.map((a) => {
									const n = booksBy(a.slug).length
									return (
										<li key={a.slug} className='tv-card relative !flex-row gap-4 !p-5'>
											<AuthorMark name={a.name} photo={a.photo ? `/authors/${a.photo.file}` : null} />
											<div className='min-w-0'>
											<Link href={`/authors/${a.slug}`} className='tv-card-link font-[family-name:var(--font-display)] text-[1rem] font-bold tracking-[-0.02em] text-[var(--ink)] after:absolute after:inset-0 hover:text-[var(--accent)]'>
												{a.name}
											</Link>
											<p className='mt-0.5 text-[0.75rem] text-[var(--ink-3)]'>
												{a.roles.join(', ')} · {n} {n === 1 ? 'book' : 'books'}
											</p>
											<p className='mt-1.5 text-[0.8125rem] leading-snug text-[var(--ink-2)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden'>{a.bio}</p>
											</div>
										</li>
									)
								})}
						</ul>
					</section>
				))}
			</div>
		</>
	)
}
