import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Masthead } from '../../_components/masthead'
import { SiteHeader } from '../../_components/site-header'
import { GetInvolved } from '../../_components/get-involved'
import { Tags } from '../../_components/service-cards'
import { formatValue, gapText, judge, STATUS_LABEL } from '../../_lib/development-plan'
import { sectorContents } from '../../_lib/sector-contents'
import { SECTORS_LIVE, sectorBySlug, sectors } from '../../_lib/sectors'
import { budgetHref, peso, shortName, slugify } from '../../_lib/services'

const PROC = 'https://procurement.betterbarmm.com'

export function generateStaticParams() {
	return SECTORS_LIVE ? sectors.map((s) => ({ slug: s.slug })) : []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const s = sectorBySlug((await params).slug)
	return { title: s ? s.title : 'Sector', description: s?.lead, robots: { index: false, follow: false } }
}

const H2 = 'dv-title !text-[clamp(1.5rem,2.4vw,1.875rem)]'
const NOTE = 'mt-1 text-[0.84375rem] text-[var(--ink-3)]'
const LINK = 'underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'
const date = (iso: string) => new Date(iso).toLocaleDateString('en-PH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Manila' })

export default async function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
	const sector = sectorBySlug((await params).slug)
	if (!SECTORS_LIVE || !sector) notFound()
	const { own, items, jobs, grants, plan, bids, news } = sectorContents(sector)
	const programs = items.filter((i) => i.kind === 'program')
	const services = items.filter((i) => i.kind === 'service')

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader />

			<Masthead brand label='Sector workspace · in development' lines={[sector.title]} standfirst={sector.lead}>
				<div className='flex flex-wrap gap-2'>
					{sector.related.map((r) => (
						<a key={r.href} href={r.href} className='dv-btn dv-btn-glass !px-4 !py-2 !text-[0.8125rem]'>
							{r.label} <ArrowUpRightIcon size={13} weight='bold' aria-hidden='true' />
						</a>
					))}
				</div>
			</Masthead>

			<div className='bb-container dv-section space-y-16'>
				<section aria-labelledby='offices'>
					<h2 id='offices' className={H2}>
						Who is responsible <span className='text-[var(--ink-mute)]'>{own.length}</span>
					</h2>
					<ul className='mt-5 grid gap-4 sm:grid-cols-2'>
						{own.map((o) => (
							<li key={o.slug} className='rounded-[1.25rem] border border-[var(--rule)] p-5 sm:p-6'>
								<Link href={`/services/${o.slug}`} className='text-[1.03125rem] font-bold leading-snug hover:text-[var(--accent)]'>
									{o.name}
								</Link>
								{o.mandate ? <p className='mt-1.5 text-[0.875rem] leading-[1.6] text-[var(--ink-2)]'>{o.mandate}</p> : null}
								<p className='mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] font-semibold'>
									<Link href={`/services/${o.slug}`} className={LINK}>
										Programs & services
									</Link>
									<Link href={`/directory/office/${o.slug}`} className={LINK}>
										Directory
									</Link>
									<a href={budgetHref(o)} className={LINK}>
										Budget
									</a>
								</p>
							</li>
						))}
					</ul>
				</section>

				{programs.length ? (
					<section aria-labelledby='programs'>
						<h2 id='programs' className={H2}>
							Programs <span className='text-[var(--ink-mute)]'>{programs.length}</span>
						</h2>
						<p className={NOTE}>What each office runs for the public, as the office describes it.</p>
						<ul className='mt-5 divide-y divide-[var(--rule-soft)] rounded-[1.25rem] border border-[var(--rule)] px-5'>
							{programs.map(({ office, item }) => (
								<li key={`${office.slug}-${item.name}`} className='py-4'>
									<Link href={`/services/${office.slug}#program-${slugify(item.name)}`} className='font-bold leading-snug hover:text-[var(--accent)]'>
										{item.name}
									</Link>
									<span className='ml-2 text-[0.78125rem] text-[var(--ink-mute)]'>{shortName(office)}</span>
									{item.summary ? <p className='mt-1 max-w-3xl text-[0.90625rem] leading-[1.6] text-[var(--ink-2)]'>{item.summary}</p> : null}
									<Tags list={item.for} />
								</li>
							))}
						</ul>
					</section>
				) : null}

				{services.length ? (
					<section aria-labelledby='services'>
						<h2 id='services' className={H2}>
							Services <span className='text-[var(--ink-mute)]'>{services.length}</span>
						</h2>
						<p className={NOTE}>Over the counter, from each office’s Citizen’s Charter. Open one for what to bring, the fee and how long it takes.</p>
						<ul className='mt-5 grid gap-x-8 sm:grid-cols-2'>
							{services.map(({ office, item }) => (
								<li key={`${office.slug}-${item.name}`} className='border-b border-[var(--rule-soft)] py-3 text-[0.90625rem] leading-snug'>
									<Link href={`/services/${office.slug}`} className='hover:text-[var(--accent)]'>
										{item.name}
									</Link>
									<span className='ml-2 text-[0.75rem] text-[var(--ink-mute)]'>{shortName(office)}</span>
								</li>
							))}
						</ul>
					</section>
				) : null}

				{plan.length ? (
					<section aria-labelledby='plan'>
						<h2 id='plan' className={H2}>
							The plan’s targets <span className='text-[var(--ink-mute)]'>{plan.length}</span>
						</h2>
						<p className={NOTE}>
							From the{' '}
							<Link href='/development-plan' className={LINK}>
								Development Plan Scorecard
							</Link>
							: each target beside the latest published figure.
						</p>
						<ul className='mt-5 grid gap-4 md:grid-cols-2'>
							{plan.map((i) => {
								const { status, against } = judge(i)
								return (
									<li key={i.id} className='rounded-[1.25rem] border border-[var(--rule)] p-5 sm:p-6'>
										<p className='text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[var(--ink-mute)]'>{i.area}</p>
										<p className='mt-1 font-bold leading-snug'>{i.name}</p>
										<p className='mt-2 text-[1.5rem] font-extrabold tabular-nums'>
											{formatValue(i.latest.value, i.unit)} <span className='text-[0.8125rem] font-medium text-[var(--ink-3)]'>in {i.latest.year}</span>
										</p>
										<p className={`mt-1 text-[0.8125rem] font-semibold ${status === 'met' ? 'text-[var(--acc-water)]' : status === 'short' ? 'text-[var(--accent)]' : 'text-[var(--ink-3)]'}`}>
											{STATUS_LABEL[status]}
											{gapText(i, status, against) ? <span className='font-normal text-[var(--ink-3)]'> · {gapText(i, status, against)}</span> : null}
										</p>
									</li>
								)
							})}
						</ul>
					</section>
				) : null}

				{jobs.length || grants.length ? (
					<section aria-labelledby='open'>
						<h2 id='open' className={H2}>
							Open now <span className='text-[var(--ink-mute)]'>{jobs.length + grants.length}</span>
						</h2>
						<p className={NOTE}>
							Government jobs and grants you can still apply for. All of them are on{' '}
							<Link href='/opportunities' className={LINK}>
								Opportunities
							</Link>
							.
						</p>
						<ul className='mt-5 divide-y divide-[var(--rule-soft)] rounded-[1.25rem] border border-[var(--rule)] px-5'>
							{grants.map((g) => (
								<li key={g.name} className='py-4'>
									<a href={g.source} target='_blank' rel='noreferrer' className='font-bold hover:text-[var(--accent)]'>
										{g.name}
									</a>
									<p className='mt-1 max-w-3xl text-[0.875rem] leading-[1.6] text-[var(--ink-2)]'>{g.summary}</p>
								</li>
							))}
							{jobs.map((j) => (
								<li key={j.id} className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3'>
									<span className='font-semibold'>{j.title}</span>
									<span className='text-[0.8125rem] text-[var(--ink-3)]'>
										{j.office} · ₱{j.monthlySalary.toLocaleString('en-PH')} a month · closes {date(j.closes)}
									</span>
								</li>
							))}
						</ul>
					</section>
				) : null}

				{bids.length ? (
					<section aria-labelledby='bids'>
						<h2 id='bids' className={H2}>
							Bids open <span className='text-[var(--ink-mute)]'>{bids.length}</span>
						</h2>
						<p className={NOTE}>What these offices are buying on PhilGEPS now.</p>
						<ul className='mt-5 divide-y divide-[var(--rule-soft)] rounded-[1.25rem] border border-[var(--rule)] px-5'>
							{bids.slice(0, 12).map((n) => (
								<li key={n.ref} className='py-3'>
									<p className='text-[0.90625rem] font-semibold leading-snug'>{n.title}</p>
									<p className='mt-0.5 text-[0.8125rem] text-[var(--ink-3)]'>
										<a href={`${PROC}/${n.officeSlug}`} className='hover:text-[var(--accent)]'>
											{n.office}
										</a>
										{n.budget ? ` · ${peso(n.budget)}` : ''}
										{n.closing ? ` · closes ${date(n.closing)}` : ''}
									</p>
								</li>
							))}
						</ul>
					</section>
				) : null}

				{news.length ? (
					<section aria-labelledby='news'>
						<h2 id='news' className={H2}>
							In the news
						</h2>
						<ul className='mt-5 divide-y divide-[var(--rule-soft)] rounded-[1.25rem] border border-[var(--rule)] px-5'>
							{news.map((n) => (
								<li key={n.url} className='py-3'>
									<a href={n.url} target='_blank' rel='noreferrer' className='font-semibold leading-snug hover:text-[var(--accent)]'>
										{n.title}
									</a>
									<p className='mt-0.5 text-[0.78125rem] text-[var(--ink-mute)]'>
										{n.source} · {date(n.published_at!)}
									</p>
								</li>
							))}
						</ul>
					</section>
				) : null}
			</div>

			<GetInvolved />
		</main>
	)
}
