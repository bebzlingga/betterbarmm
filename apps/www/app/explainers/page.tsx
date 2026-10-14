import { ArrowRightIcon, ArrowUpRightIcon, BuildingsIcon, CoinsIcon, ScrollIcon, ShoppingCartIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { CtaAction, CtaPanel } from '@betterbarmm/editorial'
import { pageMeta } from '../_lib/seo'
import Link from 'next/link'
import { EXPLAINER_CATEGORIES, categoryLabel } from '@betterbarmm/db'
import { listExplainers } from '../_lib/explainers'
import { Masthead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'
import { GUIDES } from './guides'
import { GuideMotif } from './motif'

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
			<section className='bb-container bb-section'>
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
							<span className='font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
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
							<Link
								key={e.id}
								href={`/explainers/${e.slug}`}
								className='bb-plate group flex h-full flex-col p-7 transition hover:-translate-y-0.5'
							>
								{e.motif ? (
									<span className='-mx-7 -mt-7 mb-6 block border-b border-[var(--rule)] bg-[var(--paper)] px-7 py-4'>
										<GuideMotif motif={e.motif} />
									</span>
								) : null}
								<span className='font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>
									{categoryLabel(e.category)}
								</span>
								<h2 className='mt-4 text-[1.2rem] font-extrabold leading-snug tracking-[-0.02em]'>
									{e.title}
								</h2>
								{e.summary ? <p className='mt-3 flex-1 bb-body text-[var(--ink-2)]'>{e.summary}</p> : null}
								{e.published_at ? (
									<p className='mt-5 text-[12.5px] text-[var(--ink-3)]'>
										{[longDate(e.published_at), e.author ? `@${e.author}` : null].filter(Boolean).join(' · ')}
									</p>
								) : null}
								<span className='mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]'>
									Read
									<ArrowRightIcon
										className='size-3.5 transition group-hover:translate-x-0.5'
										weight='bold'
										aria-hidden='true'
									/>
								</span>
							</Link>
						))}
					</div>
				) : (
					<p className='mt-12 bb-body text-[var(--ink-3)]'>No explainers match this filter yet.</p>
				)}
			</section>
			) : null}

			<Guides />

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

const longDate = (iso: string) => new Date(iso).toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric' })

/** Each workspace's mark, as the workspace switch shows it. */
const WORKSPACE_ICON: Record<string, React.ComponentType<{ size?: number; weight?: 'regular' | 'fill'; className?: string }>> = {
	Legislation: ScrollIcon,
	Budget: CoinsIcon,
	'Local government': BuildingsIcon,
	Procurement: ShoppingCartIcon,
}

/** The longer guides each workspace carries, as cards that say where they open. */
function Guides() {
	return (
		<section className='border-t border-[var(--rule)] bg-[var(--paper-2)]'>
			<div className='bb-container bb-section'>
				<div className='grid gap-x-16 gap-y-4 lg:grid-cols-[minmax(0,35fr)_minmax(0,65fr)] lg:items-end'>
					<div>
						<p className='bb-label'>From the workspaces</p>
						<h2 className='mt-3 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>Go deeper</h2>
					</div>
					<p className='text-[14px] leading-[1.7] text-[var(--ink-2)]'>
						Each workspace carries its own long-form guides, written beside the records they explain: how Parliament makes a
						law, how a budget moves, what each level of local government does, how public bidding works.
					</p>
				</div>
				<div className='mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{GUIDES.map((g) => {
						const Icon = WORKSPACE_ICON[g.workspace] ?? ScrollIcon
						return (
							<a
								key={g.href}
								href={g.href}
								className='group flex flex-col border border-[var(--rule)] bg-[var(--paper)] transition hover:border-[var(--ink)]'
							>
								<span className='block border-b border-[var(--rule)] bg-[var(--paper-2)] px-6 py-4 transition group-hover:bg-[var(--paper)]'>
									<GuideMotif motif={g.motif} />
								</span>
								<span className='flex flex-1 flex-col p-6'>
								<span className='flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>
									<Icon size={15} weight='fill' aria-hidden='true' className='shrink-0' />
									{g.workspace}
								</span>
								<span className='mt-4 text-[1.1rem] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)] group-hover:text-[var(--accent)]'>
									{g.title}
								</span>
								<span className='mt-2 flex-1 text-[13.5px] leading-[1.6] text-[var(--ink-2)]'>{g.summary}</span>
								<span className='mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--ink-3)] group-hover:text-[var(--ink)]'>
									Open in {g.workspace}
									<ArrowUpRightIcon className='size-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5' weight='bold' aria-hidden='true' />
								</span>
								</span>
							</a>
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
