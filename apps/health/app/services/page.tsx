import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead } from '../_components/parts'
import { AUDIENCE, offerHref, offersTotal, offices, type Offer } from '../_lib/services'

export const metadata: Metadata = {
	title: 'Programs and services',
	description: 'What the Bangsamoro Government offers for health: the Ministry of Health’s programs, licences and permits, and the medical help other offices give, with how to get each.',
}

/* Who it is for across the top, as links, so a filtered page can be shared; then
   office by office, the programs before the counter services. Every item opens its
   entry on betterbarmm.com, where what to bring, the fee and the source are. */

type Item = Offer & { office: string; officeName: string; slug: string }
const all: Item[] = offices.flatMap((o) => o.offers.map((x) => ({ ...x, office: o.acronym ?? o.name, officeName: o.name, slug: o.slug })))
const audiences = [...all.flatMap((x) => x.for).reduce((m, a) => m.set(a, (m.get(a) ?? 0) + 1), new Map<string, number>())]
	.filter(([a, n]) => n > 1 && a !== 'everyone' && AUDIENCE[a])
	.sort((a, b) => b[1] - a[1])
const forLine = (x: Offer) => (x.for.length ? `For ${x.for.map((a) => AUDIENCE[a] ?? a.replace(/-/g, ' ')).join(', ').toLowerCase()}` : null)

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ for?: string }> }) {
	const { for: who } = await searchParams
	const audience = who && AUDIENCE[who] ? who : null
	const shown = audience ? all.filter((x) => x.for.includes(audience) || x.for.includes('everyone')) : all
	const groups = offices
		.map((o) => ({ ...o, items: shown.filter((x) => x.slug === o.slug).sort((a, b) => Number(a.kind === 'service') - Number(b.kind === 'service')) }))
		.filter((o) => o.items.length)

	return (
		<>
			<Masthead
				kicker='Health · Bangsamoro'
				name='Programs and services'
				note={`${offersTotal} programs and services for health from ${offices.length} offices of the Bangsamoro Government, as each office states it. Choose one to see what to bring and how to apply on betterbarmm.com.`}
			/>

			<nav aria-label='Who it is for'>
				<div className='bb-container flex items-center gap-x-3 gap-y-2 overflow-x-auto pt-[clamp(2.5rem,5vw,4rem)] [scrollbar-width:none] lg:flex-wrap lg:overflow-visible [&::-webkit-scrollbar]:hidden'>
					{[[null, 'Everyone', all.length] as const, ...audiences.map(([a, n]) => [a, AUDIENCE[a], n] as const)].map(([a, label, n]) => {
						const on = a === audience
						return (
							<Link
								key={label}
								href={a ? `/services?for=${a}` : '/services'}
								aria-current={on ? 'page' : undefined}
								className={`inline-flex h-9 shrink-0 items-center gap-2 border px-3.5 text-[0.8125rem] font-semibold transition ${
									on ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]' : 'border-[var(--rule)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)] hover:text-[var(--ink)]'
								}`}
							>
								{label}
								<span className={`num text-[0.71875rem] font-normal ${on ? 'opacity-70' : 'text-[var(--ink-3)]'}`}>{n}</span>
							</Link>
						)
					})}
				</div>
			</nav>

			<div className='bb-container space-y-16 pb-[clamp(3.75rem,7vw,6.5rem)] pt-12 lg:pt-16'>
				{groups.map((o) => (
					<section key={o.slug}>
						<div className='flex flex-col gap-2 border-b border-[var(--ink)] pb-3 sm:flex-row sm:items-baseline sm:justify-between'>
							<h2 className='text-[1.375rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
								{o.name} <span className='num text-[0.9375rem] font-semibold text-[var(--ink-3)]'>{o.items.length}</span>
							</h2>
							<a href={`https://betterbarmm.com/services/${o.slug}`} target='_blank' rel='noreferrer' className='rule-link inline-flex items-center gap-1 text-[0.8125rem]'>
								The office&rsquo;s page
								<ArrowUpRightIcon size={12} weight='bold' aria-hidden='true' />
							</a>
						</div>
						<ul className='divide-y divide-[var(--rule-soft)]'>
							{o.items.map((x) => (
								<li key={x.kind + x.name}>
									<a href={offerHref(o.slug, x)} target='_blank' rel='noreferrer' className='group grid gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_14rem] sm:gap-8'>
										<span>
											<span className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>{x.kind === 'program' ? 'Program' : 'Service'}</span>
											<span className='mt-1 block text-[1rem] font-bold leading-snug text-[var(--ink)] group-hover:text-[var(--accent)]'>{x.name}</span>
											{x.summary ? <span className='mt-1 block text-[0.84375rem] leading-6 text-[var(--ink-2)]'>{x.summary}</span> : null}
										</span>
										<span className='text-[0.78125rem] leading-6 text-[var(--ink-3)] sm:text-right'>
											{[forLine(x), x.fee ? `Fee: ${x.fee}` : null, x.time ? `Takes ${x.time}` : null].filter(Boolean).join(' · ')}
										</span>
									</a>
								</li>
							))}
						</ul>
					</section>
				))}
			</div>
		</>
	)
}
