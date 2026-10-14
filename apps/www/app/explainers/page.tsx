import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { pageMeta } from '../_lib/seo'
import Link from 'next/link'
import { EXPLAINER_CATEGORIES, categoryLabel } from '@betterbarmm/db'
import { listExplainers } from '../_lib/explainers'
import { Masthead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'
import { GUIDES } from './guides'

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
				standfirst='Short, sourced explanations of laws, budgets, elections and the way public money moves — in the Bangsamoro and beyond, written for someone who has never read a bill.'
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
		</main>
	)
}

const longDate = (iso: string) => new Date(iso).toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric' })

/** The guides each workspace carries, grouped by workspace. */
function Guides() {
	const workspaces = [...new Set(GUIDES.map((g) => g.workspace))]
	return (
		<section className='border-t border-[var(--rule)] bg-[var(--paper-2)]'>
			<div className='bb-container bb-section'>
			<p className='bb-label'>In each workspace</p>
			<h2 className='mt-3 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>The longer guides</h2>
			<div className='mt-10 grid gap-x-16 gap-y-14 lg:grid-cols-2'>
				{workspaces.map((w) => (
					<div key={w}>
						<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>{w}</p>
						<ul className='mt-4'>
							{GUIDES.filter((g) => g.workspace === w).map((g) => (
								<li key={g.href} className='border-t border-[var(--rule)]'>
									<a href={g.href} className='group block py-5'>
										<span className='flex items-baseline justify-between gap-4'>
											<span className='text-[1.15rem] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)] group-hover:text-[var(--accent)]'>
												{g.title}
											</span>
											<ArrowRightIcon className='size-3.5 shrink-0 transition group-hover:translate-x-0.5' weight='bold' aria-hidden='true' />
										</span>
										<span className='mt-2 block text-[14px] leading-6 text-[var(--ink-2)]'>{g.summary}</span>
									</a>
								</li>
							))}
						</ul>
					</div>
				))}
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
