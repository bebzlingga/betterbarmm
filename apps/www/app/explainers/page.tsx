import { ArrowUpRightIcon, BuildingsIcon, CoinsIcon, ScrollIcon, ShoppingCartIcon } from '@phosphor-icons/react/ssr'
import { HonestBand } from '../_components/honest-band'
import type { Metadata } from 'next'
import { pageMeta } from '../_lib/seo'
import Link from 'next/link'
import { EXPLAINER_CATEGORIES } from '@betterbarmm/db'
import { listExplainers } from '../_lib/explainers'
import { Masthead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'
import { GUIDES } from './guides'
import { GuideMotif } from './motif'
import { ExplainerCard } from '../_components/explainer-card'

export const metadata: Metadata = pageMeta({
	title: 'Explainers',
	description:
		'Plain-language explainers on how government works, in the Bangsamoro and beyond: laws, budgets, elections, procurement and local government.',
	path: '/explainers',
})

// New and edited explainers appear within a minute of being published in the admin.
export const revalidate = 60

export default async function ExplainersPage({
	searchParams,
}: {
	searchParams: Promise<{ category?: string; tag?: string }>
}) {
	const { category, tag } = await searchParams
	const all = await listExplainers()
	const shown = all.filter(
		(e) => (!category || e.category === category) && (!tag || e.tags.includes(tag)),
	)

	// Only the categories and tags that actually have something under them.
	const categories = EXPLAINER_CATEGORIES.filter((c) => all.some((e) => e.category === c.value))
	const tags = [...new Set(all.flatMap((e) => e.tags))].sort()

	const href = (next: { category?: string; tag?: string }) => {
		const params = new URLSearchParams(
			Object.entries(next).filter((entry): entry is [string, string] => Boolean(entry[1])),
		)
		return params.size ? `/explainers?${params}` : '/explainers'
	}

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='explainers' />

			<Masthead
				brand
				label='Explainers'
				lines={['How government works,', 'in plain words.']}
				muted={[1]}
				standfirst='Laws, budgets, elections and public spending, taken apart in short, sourced pieces anyone can follow. No law degree needed.'
			/>

			{all.length ? (
			<section className='bb-container dv-section'>
				{/* Topics left, tags right; stacked on a phone. */}
				<nav aria-label='Filter explainers' className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
					<div className='flex flex-wrap gap-2'>
						<FilterLink href={href({ tag })} active={!category}>
							All topics
						</FilterLink>
						{categories.map((c) => (
							<FilterLink key={c.value} href={href({ category: c.value, tag })} active={category === c.value}>
								{c.label}
							</FilterLink>
						))}
					</div>
					{tags.length ? (
						<div className='flex flex-wrap items-center gap-2 lg:justify-end'>
							<span className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
								Tags
							</span>
							{tags.map((t) => (
								<FilterLink
									key={t}
									href={href({ category, tag: tag === t ? undefined : t })}
									active={tag === t}
									small
								>
									#{t}
								</FilterLink>
							))}
						</div>
					) : null}
				</nav>

				{shown.length ? (
					<div className='mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
						{shown.map((e) => (
							<ExplainerCard key={e.id} e={e} />
						))}
					</div>
				) : (
					<p className='mt-12 bb-body !leading-[1.7] text-[var(--ink-3)]'>No explainers match this filter yet.</p>
				)}
			</section>
			) : null}

			<Guides />

			<HonestBand
				label='Get involved'
				title='Know something we should explain?'
				standfirst='Spotted an error, or a law, budget or process that deserves a plain-language guide? Tell us — every correction and every suggestion makes these better.'
				primary={{ href: '/contribute', label: 'Contribute' }}
				secondary={{ href: '/contact', label: 'Suggest a topic' }}
			/>
		</main>
	)
}


/** Each workspace's mark, as the workspace switch shows it. */
const WORKSPACE_ICON: Record<string, React.ComponentType<{ size?: number; weight?: 'regular' | 'fill'; className?: string }>> = {
	Legislation: ScrollIcon,
	Budget: CoinsIcon,
	'Local government': BuildingsIcon,
	Procurement: ShoppingCartIcon,
}

/** The longer guides each workspace carries, grouped by the workspace that carries them: a panel each, headed by its
 *  mark and a way into it, the guides as rows under it with the small picture of what each explains. */
function Guides() {
	const workspaces = [...new Set(GUIDES.map((g) => g.workspace))].map((name) => {
		const guides = GUIDES.filter((g) => g.workspace === name)
		return { name, guides, home: new URL(guides[0]!.href).origin }
	})
		// The workspace with the most guides last, so it takes a column of its own and the two columns come out level.
		.sort((a, b) => a.guides.length - b.guides.length)
	return (
		<section className='tv-wash'>
			<div className='bb-container dv-section'>
				<div className='grid gap-x-16 gap-y-4 lg:grid-cols-[minmax(0,35fr)_minmax(0,65fr)] lg:items-end'>
					<div>
						<p className='bb-label'>From the workspaces</p>
						<h2 className='mt-3 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>Go deeper</h2>
					</div>
					<p className='text-[0.875rem] leading-[1.7] text-[var(--ink-2)]'>
						Each workspace carries its own long-form guides, written beside the records they explain: how Parliament makes a
						law, how a budget moves, what each level of local government does, how public bidding works.
					</p>
				</div>
				{/* Columns rather than a grid, so a workspace with five guides doesn't stretch its neighbour with two. */}
				<div className='mt-12 gap-5 md:columns-2'>
					{workspaces.map(({ name, guides, home }) => {
						const Icon = WORKSPACE_ICON[name] ?? ScrollIcon
						return (
							<article key={name} className='mb-5 break-inside-avoid overflow-hidden rounded-[1.25rem] border border-[var(--rule)] bg-[var(--paper)]'>
								<header className='flex items-center gap-3 border-b border-[var(--rule)] px-5 py-4'>
									<span className='grid size-10 shrink-0 place-items-center bg-[var(--accent)] text-white'>
										<Icon size={20} weight='fill' aria-hidden='true' />
									</span>
									<span className='min-w-0 flex-1'>
										<span className='block text-[1.0625rem] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>{name}</span>
										<span className='mt-0.5 block text-[0.75rem] text-[var(--ink-3)]'>
											{guides.length} {guides.length === 1 ? 'guide' : 'guides'}
										</span>
									</span>
									<a
										href={home}
										className='inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--rule)] px-3 py-1.5 text-[0.75rem] font-semibold text-[var(--ink-2)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white'
									>
										Open workspace <ArrowUpRightIcon size={11} weight='bold' aria-hidden='true' />
									</a>
								</header>
								<ul>
									{guides.map((g) => (
										<li key={g.href} className='border-b border-[var(--rule-soft)] last:border-b-0'>
											<a href={g.href} className='group flex gap-4 px-5 py-4 transition-colors hover:bg-[var(--paper-2)]'>
												<span className='grid h-16 w-24 shrink-0 place-items-center rounded-xl bg-[var(--paper-2)] transition-colors group-hover:bg-[var(--paper)]'>
													<GuideMotif motif={g.motif} className='block h-12 w-full' />
												</span>
												<span className='min-w-0 flex-1'>
													<span className='flex items-start justify-between gap-3'>
														<span className='text-[0.96875rem] font-bold leading-snug tracking-[-0.01em] text-[var(--ink)] group-hover:text-[var(--accent)]'>{g.title}</span>
														<ArrowUpRightIcon className='mt-1 size-3.5 shrink-0 text-[var(--ink-mute)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]' weight='bold' aria-hidden='true' />
													</span>
													<span className='mt-1 block text-[0.8125rem] leading-[1.6] text-[var(--ink-3)]'>{g.summary}</span>
												</span>
											</a>
										</li>
									))}
								</ul>
							</article>
						)
					})}
				</div>
			</div>
		</section>
	)
}

function FilterLink({
	href,
	active,
	small,
	children,
}: {
	href: string
	active: boolean
	small?: boolean
	children: React.ReactNode
}) {
	return (
		<Link
			href={href}
			aria-current={active ? 'page' : undefined}
			className={`rounded-full border px-3.5 ${small ? 'py-1 text-xs' : 'py-1.5 text-sm'} font-semibold transition ${
				active
					? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]'
					: 'border-[var(--rule)] text-[var(--ink-2)] hover:border-[var(--ink)]'
			}`}
		>
			{children}
		</Link>
	)
}
