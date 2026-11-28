import { ArrowUpRightIcon, BuildingsIcon, StudentIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead } from '../_components/parts'
import { AUDIENCE, isScholarship, offerHref, offersTotal, offices, type Offer } from '../_lib/services'

export const metadata: Metadata = {
	title: 'Scholarships and services',
	description: 'What the Bangsamoro Government offers students, teachers and schools: scholarships, training, grants and the services its offices give over the counter, with how to get each.',
}

const WWW = 'https://betterbarmm.com/services'

/* ============================================================
   Scholarships and services

   Who it is for across the top, as links, so a filtered page can be
   shared; then the scholarships, which is what most come for, as cards;
   then everything else office by office, as rows. Every item opens its
   entry on betterbarmm.com in a new tab, where how to apply, what to
   bring and the source are.
   ============================================================ */

type Item = Offer & { office: string; officeName: string; slug: string }

const all: Item[] = offices.flatMap((o) => o.offers.map((x) => ({ ...x, office: o.acronym ?? o.name, officeName: o.name, slug: o.slug })))

/** The audiences worth a filter: those with more than two items, the most first. */
const audiences = [...all.flatMap((x) => x.for).reduce((m, a) => m.set(a, (m.get(a) ?? 0) + 1), new Map<string, number>())]
	.filter(([a, n]) => n > 2 && a !== 'everyone')
	.sort((a, b) => b[1] - a[1])

/** A rounded card and its icon tile (user decision: the travel look). */
const CARD = 'rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] shadow-[0_18px_40px_-32px_rgba(0,0,0,0.45)]'
const ICON_TILE = 'grid size-11 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'

const forLine = (x: Offer) => `For ${x.for.map((a) => AUDIENCE[a] ?? a).join(', ').toLowerCase()}`

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ for?: string }> }) {
	const { for: who } = await searchParams
	const audience = who && AUDIENCE[who] ? who : null
	const shown = audience ? all.filter((x) => x.for.includes(audience) || x.for.includes('everyone')) : all
	const scholarships = shown.filter(isScholarship)
	const rest = offices
		.map((o) => ({ ...o, items: shown.filter((x) => x.slug === o.slug && !isScholarship(x)) }))
		.filter((o) => o.items.length)

	return (
		<>
			<Masthead
				kicker='Education · Bangsamoro'
				name='Scholarships and services'
				note={`${offersTotal} programs and services for students, teachers and schools, from ${offices.length} offices of the Bangsamoro Government, as each office states it. Choose one to see how to apply on betterbarmm.com.`}
			/>

			{/* ---- Who it is for ---- */}
			<nav aria-label='Who it is for'>
				<div className='bb-container flex items-center gap-x-2.5 gap-y-2.5 overflow-x-auto pt-[clamp(3rem,6vw,4.5rem)] [scrollbar-width:none] lg:flex-wrap lg:overflow-visible [&::-webkit-scrollbar]:hidden'>
					{[[null, 'Everyone', all.length] as const, ...audiences.map(([a, n]) => [a, AUDIENCE[a] ?? a, n] as const)].map(([a, label, n]) => {
						const on = a === audience
						return (
							<Link
								key={label}
								href={a ? `/services?for=${a}` : '/services'}
								aria-current={on ? 'page' : undefined}
								className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[0.84375rem] font-semibold transition ${
									on ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--rule)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)] hover:text-[var(--ink)]'
								}`}
							>
								{label}
								<span className={`num text-[0.71875rem] font-normal ${on ? 'opacity-70' : 'text-[var(--ink-3)]'}`}>{n}</span>
							</Link>
						)
					})}
				</div>
			</nav>

			{/* ---- Scholarships ---- */}
			{scholarships.length ? (
				<section className='bb-container pb-[clamp(5rem,10vw,9rem)] pt-12 lg:pt-16'>
					<div className='flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-16'>
						<h2 className='dv-title'>
							Scholarships and grants <span className='num ml-1 align-middle text-[0.55em] font-semibold tracking-normal text-[var(--ink-mute)]'>{scholarships.length}</span>
						</h2>
						<p className='max-w-[38rem] text-[0.9375rem] leading-[1.7] text-[var(--ink-3)]'>
							Money to study, from college and tech-voc to science and medicine, and help to stay in school.
						</p>
					</div>
					<ul className='mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3'>
						{scholarships.map((x) => (
							<li key={x.slug + x.name}>
								<a
									href={offerHref(x.slug, x)}
									target='_blank'
									rel='noreferrer'
									className={`${CARD} group flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ink)_30%,var(--rule))] sm:p-7`}
								>
									<span className='flex items-start justify-between gap-3'>
										<span className={ICON_TILE}>
											<StudentIcon size={20} weight='duotone' aria-hidden='true' />
										</span>
										<span className='grid size-9 place-items-center rounded-full border border-[var(--rule)] text-[var(--ink-3)] transition group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white'>
											<ArrowUpRightIcon size={14} weight='bold' aria-hidden='true' />
										</span>
									</span>
									<span className='mt-5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]' title={x.officeName}>
										{x.office}
									</span>
									<span className='mt-1.5 font-[family-name:var(--font-display)] text-[1.0625rem] font-bold leading-snug tracking-[-0.01em] text-[var(--ink)] group-hover:text-[var(--accent)]'>{x.name}</span>
									{x.summary ? <span className='mt-2 line-clamp-3 text-[0.84375rem] leading-6 text-[var(--ink-2)]'>{x.summary}</span> : null}
									<span className='mt-auto pt-4 text-[0.75rem] text-[var(--ink-3)]'>{forLine(x)}</span>
								</a>
							</li>
						))}
					</ul>
				</section>
			) : null}

			{/* ---- Everything else, office by office ---- */}
			{rest.length ? (
				<section className='tv-wash'>
					<div className='bb-container dv-section'>
						<h2 className='dv-title'>Training, programs and services</h2>
						<div className='mt-10 space-y-5 lg:mt-12'>
							{rest.map((o) => (
								<section key={o.slug} className={`${CARD} p-6 sm:p-8`}>
									<div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-3'>
										<h3 className='flex items-center gap-3 font-[family-name:var(--font-display)] text-[1.1875rem] font-bold tracking-[-0.02em] text-[var(--ink)]'>
											<span className={ICON_TILE}>
												<BuildingsIcon size={20} weight='duotone' aria-hidden='true' />
											</span>
											<span>
											{o.name}
											{o.acronym ? <span className='ml-2 text-[0.8125rem] font-semibold text-[var(--ink-3)]'>{o.acronym}</span> : null}
											</span>
										</h3>
										<a href={`${WWW}/${o.slug}`} target='_blank' rel='noreferrer' className='dv-pill ml-auto !py-2 !text-[0.8125rem]'>
											Everything it offers <ArrowUpRightIcon size={12} weight='bold' aria-hidden='true' />
										</a>
									</div>
									<ul className='mt-5 grid gap-x-3 gap-y-1 lg:grid-cols-2'>
										{o.items.map((x) => (
											<li key={x.kind + x.name}>
												<a href={offerHref(o.slug, x)} target='_blank' rel='noreferrer' className='group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 rounded-2xl px-4 py-4 transition hover:bg-[var(--paper-2)]'>
													<span className='min-w-0'>
														<span className='flex items-baseline gap-2'>
															<span className='text-[0.9375rem] font-semibold leading-snug text-[var(--ink)] group-hover:text-[var(--accent)]'>{x.name}</span>
														</span>
														{x.summary ? <span className='mt-1.5 block line-clamp-2 text-[0.8125rem] leading-[1.6] text-[var(--ink-2)]'>{x.summary}</span> : null}
														<span className='mt-1.5 block text-[0.71875rem] text-[var(--ink-3)]'>
															{x.kind === 'service' ? 'At the office · ' : ''}
															{forLine(x)}
														</span>
													</span>
													<ArrowUpRightIcon size={15} weight='bold' className='text-[var(--ink-3)] transition group-hover:text-[var(--accent)]' aria-hidden='true' />
												</a>
											</li>
										))}
									</ul>
								</section>
							))}
						</div>
					</div>
				</section>
			) : null}

			{!shown.length ? <p className='bb-container bb-section text-center text-[0.9375rem] text-[var(--ink-3)]'>Nothing listed for them yet.</p> : null}

			<section className='bb-container py-12'>
				<p className='text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
					Read from each office’s Citizen’s Charter and website, as the Programs &amp; services record on betterbarmm.com keeps them; requirements,
					fees and times are the office’s own, so confirm with it before you go. The education ministry’s website turns away automated visits,
					so its Citizen’s Charter has not been read; its scholarships are listed as its portal and the Bangsamoro Government describe them.
				</p>
			</section>
		</>
	)
}
