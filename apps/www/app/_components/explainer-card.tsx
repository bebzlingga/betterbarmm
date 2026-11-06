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

/** Minutes to read, at an unhurried 220 words a minute. */
const minutes = (body: string) => Math.max(1, Math.round(body.split(/\s+/).length / 220))

const meta = (e: Article) => [e.published_at ? longDate(e.published_at) : null, `${minutes(e.body)} min read`].filter(Boolean).join(' · ')

/**
 * The front page's explainers: the newest set out in full, the next few beside it as rows.
 *
 * They were three grey cards of the same weight, each carrying its whole summary, which made the
 * section the heaviest on the page and gave no one of them a reason to be read first.
 */
export function ExplainerFeature({ explainers }: { explainers: Article[] }) {
	const [lead, ...rest] = explainers
	if (!lead) return null
	return (
		<div className='grid gap-x-20 gap-y-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]'>
			<Link href={`/explainers/${lead.slug}`} className='group block border-t-2 border-[var(--ink)] pt-6'>
				<span className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>
					Latest · {categoryLabel(lead.category)}
				</span>
				<h3 className='mt-4 text-[clamp(1.6rem,3vw,2.35rem)] font-extrabold leading-[1.12] tracking-[-0.03em] transition-colors duration-200 group-hover:text-[var(--accent)]'>
					{lead.title}
				</h3>
				{lead.summary ? <p className='mt-5 line-clamp-3 max-w-[40rem] bb-body !leading-[1.75] text-[var(--ink-2)]'>{lead.summary}</p> : null}
				<p className='mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8125rem] text-[var(--ink-3)]'>
					{meta(lead)}
					<span className='inline-flex items-center gap-1.5 font-semibold text-[var(--ink)] group-hover:text-[var(--accent)]'>
						Read it <ArrowRightIcon className='size-3.5 transition group-hover:translate-x-0.5' weight='bold' aria-hidden='true' />
					</span>
				</p>
			</Link>

			{rest.length ? (
				<ul className='divide-y divide-[var(--rule)] border-t-2 border-[var(--ink)]'>
					{rest.map((e) => (
						<li key={e.id}>
							<Link href={`/explainers/${e.slug}`} className='group -mx-3 block px-3 py-5 transition duration-200 hover:bg-[var(--paper)]'>
								<span className='font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>
									{categoryLabel(e.category)}
								</span>
								<h3 className='mt-2 flex items-start justify-between gap-4 text-[1.0625rem] font-extrabold leading-snug tracking-[-0.02em] group-hover:text-[var(--accent)]'>
									{e.title}
									<ArrowRightIcon className='mt-1.5 size-3.5 shrink-0 text-[var(--ink-3)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]' weight='bold' aria-hidden='true' />
								</h3>
								<p className='mt-1.5 text-[0.78125rem] text-[var(--ink-3)]'>{meta(e)}</p>
							</Link>
						</li>
					))}
				</ul>
			) : null}
		</div>
	)
}
