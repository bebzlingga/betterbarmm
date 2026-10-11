import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { EXPLAINER_CATEGORIES, categoryLabel, listPublishedExplainers } from '@betterbarmm/db'
import { Masthead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'

/* What each topic's explainers will cover, for the page before any is
   published. */
const PLANNED: Record<string, string> = {
	legislation: 'How a bill becomes a Bangsamoro law, what an autonomy act can and cannot do, and how to read one.',
	budget: 'Where the region’s money comes from, how the annual budget is passed, and how to follow a peso to a project.',
	election: 'How the parliament is elected: party seats, district seats, reserved seats, and what a vote counts for.',
	lgu: 'What provinces, cities, towns and barangays each do, and how they are funded.',
	travel: 'Visiting the region: what to know before you go, and how to be a good guest.',
}

export const metadata: Metadata = {
	title: 'Explainers — BetterBARMM',
	description:
		'Plain-language explainers on how the Bangsamoro works: its laws, its budget, its elections, and its local governments.',
}

// New and edited explainers appear within a minute of being published in the admin.
export const revalidate = 60

export default async function ExplainersPage({
	searchParams,
}: {
	searchParams: Promise<{ category?: string; tag?: string }>
}) {
	const { category, tag } = await searchParams
	const all = await listPublishedExplainers()
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
				label={all.length ? 'Explainers' : 'Explainers · Coming soon'}
				lines={['How the Bangsamoro', 'works, explained.']}
				muted={[1]}
				standfirst='Short, sourced explanations of the region’s laws, budget, elections and local governments — written for someone who has never read a bill.'
				facts={
					all.length
						? [
								{ value: String(all.length), label: all.length === 1 ? 'Explainer' : 'Explainers' },
								{ value: String(categories.length), label: categories.length === 1 ? 'Topic' : 'Topics' },
							]
						: undefined
				}
			/>

			{all.length ? (
			<section className='bb-container bb-section'>
				<nav aria-label='Filter explainers' className='space-y-4'>
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
						<div className='flex flex-wrap items-center gap-2'>
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
								<span className='mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]'>
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
			) : (
				<Empty />
			)}
		</main>
	)
}

/** Before the first explainer is published: what is coming, and an ask. */
function Empty() {
	return (
		<section className='bb-container bb-section'>
			<h2 className='text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>What is coming</h2>
			<p className='mt-3 max-w-[46rem] bb-body text-[var(--ink-3)]'>
				The first explainers are being written. Each will take one question about how the region works and answer it in plain
				language, with the sources linked.
			</p>
			<div className='mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
				{EXPLAINER_CATEGORIES.filter((c) => PLANNED[c.value]).map((c) => (
					<div key={c.value} className='flex flex-col bg-[var(--paper-2)] p-7'>
						<span className='font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>Coming soon</span>
						<h3 className='mt-4 text-[1.2rem] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)]'>{c.label}</h3>
						<p className='mt-3 bb-body text-[var(--ink-2)]'>{PLANNED[c.value]}</p>
					</div>
				))}
			</div>

			<div className='mt-16 flex flex-col gap-6 bg-[var(--paper-2)] p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12'>
				<div className='max-w-[44rem]'>
					<h2 className='text-[1.25rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>Have a question we should answer?</h2>
					<p className='mt-3 bb-body text-[var(--ink-2)]'>
						Tell us what about the Bangsamoro you would like explained, or offer to write one.
					</p>
				</div>
				<Link href='/contribute' className='bb-btn bb-btn-accent shrink-0'>
					Suggest a topic
				</Link>
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
