import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import { CtaAction, CtaPanel } from '@betterbarmm/editorial'
import type { Metadata } from 'next'
import { pageMeta } from '../../_lib/seo'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { categoryLabel } from '@betterbarmm/db'
import { Markdown } from '@betterbarmm/ui'
import { SiteHeader } from '../../_components/site-header'
import { getExplainer } from '../../_lib/explainers'
import { CADENA_FIGURES } from '../figures/cadena'
import { HOW_FIGURES } from '../figures/how-betterbarmm'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

/** Graphics an article places with `{{figure:name}}`, by slug. */
const FIGURES: Record<string, Record<string, React.ReactNode>> = {
	'cadena-act': CADENA_FIGURES,
	'how-betterbarmm-brings-records-together': HOW_FIGURES,
}

const longDate = (iso: string) => new Date(iso).toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric' })

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const explainer = await getExplainer((await params).slug)
	if (!explainer) return { title: 'Explainer not found', robots: { index: false, follow: true } }
	return pageMeta({ title: explainer.title, description: explainer.summary || 'A plain-language explainer from BetterBARMM.', path: `/explainers/${explainer.slug}` })
}

export default async function ExplainerPage({ params }: Props) {
	const explainer = await getExplainer((await params).slug)
	if (!explainer) notFound()

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='explainers' />

			{/* The head on the brand ground, centred, as the site's mastheads are. */}
			<header className='brand-bg bb-lattice relative overflow-hidden'>
				<div className='bb-container relative py-[clamp(3.75rem,7vw,6.5rem)] text-center'>
					<Link href={`/explainers?category=${explainer.category}`} className='bb-label justify-center hover:underline'>
						Explainer · {categoryLabel(explainer.category)}
					</Link>
					<h1 className='mx-auto mt-6 max-w-[32ch] text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[var(--ink)]'>
						{explainer.title}
					</h1>
					{explainer.summary ? (
						<p className='mx-auto mt-6 max-w-[54em] text-[1.05rem] leading-[1.6] text-[var(--ink-2)]'>{explainer.summary}</p>
					) : null}
					{explainer.published_at ? (
						<p className='mt-6 text-[13px] text-[var(--ink-3)]'>
							{[longDate(explainer.published_at), explainer.author ? `@${explainer.author}` : null].filter(Boolean).join(' · ')}
						</p>
					) : null}
				</div>
				<div className='bb-weave' aria-hidden='true' />
			</header>

			<article className='bb-container bb-section !pt-[clamp(2.5rem,5vw,4rem)]'>
				{/* Wider than prose's usual measure: the graphics and tables need the room. */}
				<Markdown source={explainer.body} figures={FIGURES[explainer.slug]} className='bb-prose bb-article mx-auto !max-w-[54rem] !leading-[1.7]' />

				<footer className='mx-auto mt-14 max-w-[54rem] border-t border-[var(--rule)] pt-6'>
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
				</footer>
			</article>

			<CtaPanel
				label='Get involved'
				lines={['Know something', 'we should explain?']}
				standfirst='Spotted an error, or a law, budget or process that deserves a plain-language guide? Tell us — every correction and every suggestion makes these better.'
			>
				<CtaAction>
					<Link href='/contribute' className='bb-btn bb-btn-brass'>
						Contribute
						<ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
					</Link>
				</CtaAction>
				<CtaAction>
					<Link href='/contact' className='bb-btn bb-btn-ghost'>
						Suggest a topic
					</Link>
				</CtaAction>
			</CtaPanel>
		</main>
	)
}
