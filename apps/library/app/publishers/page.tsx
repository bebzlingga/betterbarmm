import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead } from '../_components/parts'
import { booksFrom, publishers } from '../_lib/library'

export const metadata: Metadata = {
	title: 'Publishers',
	description: 'The university presses, institutes, trade houses, government offices and authors’ own imprints that published the books about the Bangsamoro.',
}

export default function PublishersPage() {
	const kinds = [...new Set(publishers.map((p) => p.kind))]
	return (
		<>
			<Masthead kicker='Library · Bangsamoro' name='The publishers' note={`${publishers.length} presses, from the university presses of Manila, Singapore and the United States to the region’s own institutes and the authors who printed their own.`} />
			<div className='bb-container bb-section'>
				{kinds.map((k) => (
					<section key={k} className='mt-10 border-t border-[var(--rule)] pt-6 first:mt-0'>
						<h2 className='font-[family-name:var(--font-display)] text-[1.25rem] font-black capitalize text-[var(--ink)]'>{k}</h2>
						<ul className='mt-4 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3'>
							{publishers
								.filter((p) => p.kind === k)
								.map((p) => ({ p, n: booksFrom(p.slug).length }))
								.sort((a, b) => b.n - a.n || a.p.name.localeCompare(b.p.name))
								.map(({ p, n }) => (
									<li key={p.slug}>
										<Link href={`/publishers/${p.slug}`} className='font-[family-name:var(--font-display)] text-[1rem] font-extrabold tracking-[-0.02em] text-[var(--ink)] hover:text-[var(--accent)]'>
											{p.name}
										</Link>
										<p className='mt-0.5 text-[0.75rem] text-[var(--ink-3)]'>
											{p.based}
											{p.founded ? ` · since ${p.founded}` : ''} · {n} {n === 1 ? 'book' : 'books'}
										</p>
										<p className='mt-1.5 text-[0.8125rem] leading-snug text-[var(--ink-2)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden'>{p.about}</p>
									</li>
								))}
						</ul>
					</section>
				))}
			</div>
		</>
	)
}
