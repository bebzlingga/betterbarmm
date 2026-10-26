import { categoryLabel } from '@betterbarmm/db'
import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import type { Article } from '../_lib/explainers'

const longDate = (iso: string) => new Date(iso).toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric' })

/** One explainer as a card: category, title, summary, date. Shared by the Explainers page and the front page. */
export function ExplainerCard({ e, heading: Heading = 'h2' }: { e: Article; heading?: 'h2' | 'h3' }) {
	return (
		<Link
			href={`/explainers/${e.slug}`}
			className='bb-plate group relative flex h-full flex-col overflow-hidden p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)]'
		>
			{/* On hover: an arrow slides in and the title takes the accent. */}
			<ArrowRightIcon
				className='absolute right-6 top-6 size-4 -translate-x-2 text-[var(--accent)] opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100'
				weight='bold'
				aria-hidden='true'
			/>
			<span className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>{categoryLabel(e.category)}</span>
			<Heading className='mt-4 pr-6 text-[1.2rem] font-extrabold leading-snug tracking-[-0.02em] transition-colors duration-300 group-hover:text-[var(--accent)]'>{e.title}</Heading>
			{e.summary ? <p className='mt-3 flex-1 bb-body !leading-[1.7] text-[var(--ink-2)]'>{e.summary}</p> : null}
			{e.published_at ? (
				<p className='mt-5 text-[0.78125rem] text-[var(--ink-3)]'>{[longDate(e.published_at), e.author ? `@${e.author}` : null].filter(Boolean).join(' · ')}</p>
			) : null}
		</Link>
	)
}
