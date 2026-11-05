import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead } from '../_components/parts'
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
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container bb-section'>
					<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-16'>
						<h2 className='text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>Writers from home</h2>
						<p className='max-w-[38rem] text-[0.875rem] leading-6 text-[var(--ink-3)] lg:text-right'>
							{localAuthors.length} of the authors on the shelf were born in the Bangsamoro or elsewhere in Mindanao, or made their lives there: storytellers, poets, historians and scholars writing about the region from within.
						</p>
					</div>
					{(['bangsamoro', 'mindanao'] as const).map((k) => (
						<div key={k} className='mt-10'>
							<h3 className='bb-label'>{LOCAL_LABEL[k]}</h3>
							<ul className='mt-4 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3'>
								{localAuthors
									.filter((a) => a.local === k)
									.map((a) => {
										const n = booksBy(a.slug).length
										return (
											<li key={a.slug}>
												<Link href={`/authors/${a.slug}`} className='font-[family-name:var(--font-display)] text-[1rem] font-extrabold tracking-[-0.02em] text-[var(--ink)] hover:text-[var(--accent)]'>
													{a.name}
												</Link>
												<p className='mt-0.5 text-[0.75rem] text-[var(--ink-3)]'>
													{[a.from, a.roles.join(', ')].filter(Boolean).join(' · ')} · {n} {n === 1 ? 'book' : 'books'}
												</p>
											</li>
										)
									})}
							</ul>
						</div>
					))}
				</div>
			</section>
			<div className='bb-container bb-section'>
				<h2 className='mb-6 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>Every author</h2>
				<p className='flex flex-wrap gap-x-3 gap-y-1 text-[0.8125rem] font-semibold text-[var(--ink-3)]'>
					{letters.map((l) => (
						<a key={l} href={`#${l}`} className='hover:text-[var(--accent)]'>
							{l}
						</a>
					))}
				</p>
				{letters.map((l) => (
					<section key={l} id={l} className='mt-10 scroll-mt-24 border-t border-[var(--rule)] pt-6'>
						<h2 className='font-[family-name:var(--font-display)] text-[1.5rem] font-black text-[var(--ink)]'>{l}</h2>
						<ul className='mt-4 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3'>
							{sorted
								.filter((a) => a.sort[0]!.toUpperCase() === l)
								.map((a) => {
									const n = booksBy(a.slug).length
									return (
										<li key={a.slug}>
											<Link href={`/authors/${a.slug}`} className='font-[family-name:var(--font-display)] text-[1rem] font-extrabold tracking-[-0.02em] text-[var(--ink)] hover:text-[var(--accent)]'>
												{a.name}
											</Link>
											<p className='mt-0.5 text-[0.75rem] text-[var(--ink-3)]'>
												{a.roles.join(', ')} · {n} {n === 1 ? 'book' : 'books'}
											</p>
											<p className='mt-1.5 text-[0.8125rem] leading-snug text-[var(--ink-2)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden'>{a.bio}</p>
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
