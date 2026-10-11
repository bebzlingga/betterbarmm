import type { Metadata } from 'next'
import { pageMeta } from '../../_lib/seo'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { categoryLabel, getPublishedExplainer } from '@betterbarmm/db'
import { Markdown } from '@betterbarmm/ui'
import { SiteHeader } from '../../_components/site-header'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const explainer = await getPublishedExplainer((await params).slug)
	if (!explainer) return { title: 'Explainer not found', robots: { index: false, follow: true } }
	return pageMeta({ title: explainer.title, description: explainer.summary || 'A plain-language explainer from BetterBARMM.', path: `/explainers/${explainer.slug}` })
}

export default async function ExplainerPage({ params }: Props) {
	const explainer = await getPublishedExplainer((await params).slug)
	if (!explainer) notFound()

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='explainers' />

			<article className='bb-container bb-section'>
				<Link
					href={`/explainers?category=${explainer.category}`}
					className='font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brass)] hover:underline'
				>
					{categoryLabel(explainer.category)}
				</Link>
				<h1 className='mt-5 max-w-[22ch] text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.04em]'>
					{explainer.title}
				</h1>
				{explainer.summary ? (
					<p className='mt-6 max-w-[40em] text-[1.2rem] leading-relaxed text-[var(--ink-2)]'>{explainer.summary}</p>
				) : null}

				<Markdown source={explainer.body} className='bb-prose bb-article mt-12' />

				<footer className='mt-14 max-w-[34em] border-t border-[var(--rule)] pt-6'>
					{explainer.tags.length ? (
						<div className='flex flex-wrap gap-2'>
							{explainer.tags.map((t) => (
								<Link
									key={t}
									href={`/explainers?tag=${encodeURIComponent(t)}`}
									className='rounded-full border border-[var(--rule)] px-3 py-1 text-xs font-semibold text-[var(--ink-2)] hover:border-[var(--ink)]'
								>
									#{t}
								</Link>
							))}
						</div>
					) : null}
					{explainer.published_at ? (
						<p className='mt-4 text-sm text-[var(--ink-3)]'>
							Published{' '}
							{new Date(explainer.published_at).toLocaleDateString('en-PH', {
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							})}
						</p>
					) : null}
					<Link href='/explainers' className='bb-btn bb-btn-ghost mt-6'>
						All explainers
					</Link>
				</footer>
			</article>
		</main>
	)
}
