import { categoryLabel } from '@betterbarmm/db'
import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import Image from 'next/image'
import Link from 'next/link'
import type { Article } from '../_lib/explainers'

const longDate = (iso: string) => new Date(iso).toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric' })

/** Minutes to read, at an unhurried 220 words a minute. */
const minutes = (body: string) => Math.max(1, Math.round(body.split(/\s+/).length / 220))

/**
 * One explainer as a card, the same design as its social post card (user decision): the illustration on
 * top, with the EXPLAINER tag drawn into it, then the title, the summary and the date. An explainer without
 * an illustration yet gets the maroon ground and the tag alone. Shared by the Explainers page and the front page.
 */
export function ExplainerCard({ e, heading: Heading = 'h2' }: { e: Article; heading?: 'h2' | 'h3' }) {
	return (
		<Link
			href={`/explainers/${e.slug}`}
			className='group flex h-full flex-col overflow-hidden border border-[var(--rule)] bg-[var(--paper)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-30px_rgba(25,23,19,0.55)]'
		>
			<div className='relative aspect-[1200/622] overflow-hidden bg-[#2e0b12]'>
				{e.cover ? (
					<Image src={e.cover} alt='' fill sizes='(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw' className='object-cover transition duration-700 ease-out group-hover:scale-[1.04]' />
				) : (
					<span className='absolute bottom-0 left-0 bg-[#8f2418] px-[7%] py-[4.5%] text-[0.6875rem] font-extrabold uppercase tracking-[0.18em] text-white'>Explainer</span>
				)}
			</div>
			<div className='flex flex-1 flex-col p-6'>
				<span className='text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]'>{categoryLabel(e.category)}</span>
				<Heading className='mt-3 text-[1.1875rem] font-extrabold leading-[1.25] tracking-[-0.02em] transition-colors duration-200 group-hover:text-[var(--accent)]'>{e.title}</Heading>
				{e.summary ? <p className='mt-3 line-clamp-3 text-[0.8125rem] leading-[1.65] text-[var(--ink-3)]'>{e.summary}</p> : null}
				<p className='mt-auto flex items-center justify-between gap-3 pt-6 text-[0.75rem] text-[var(--ink-3)]'>
					{[e.published_at ? longDate(e.published_at) : null, `${minutes(e.body)} min read`].filter(Boolean).join(' · ')}
					<span className='grid size-8 shrink-0 place-items-center rounded-full border border-[var(--rule)] text-[var(--ink-3)] transition duration-300 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white'>
						<ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
					</span>
				</p>
			</div>
		</Link>
	)
}

/** The front page's explainers: the newest four, side by side, as their post cards. */
export function ExplainerFeature({ explainers }: { explainers: Article[] }) {
	return (
		<ul className='grid gap-5 sm:grid-cols-2 xl:grid-cols-4'>
			{explainers.map((e) => (
				<li key={e.id}>
					<ExplainerCard e={e} heading='h3' />
				</li>
			))}
		</ul>
	)
}
