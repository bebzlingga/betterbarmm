import { ArrowRightIcon, ArrowUpRightIcon, CoinsIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '../_components/site-header'
import { ServicesSearch, type ServiceEntry } from '../_components/services-search'
import { GetInvolved } from '../_components/get-involved'
import { officeLogo } from '../_lib/images'
import { Emblem } from '../_components/emblem'
import { pageMeta } from '../_lib/seo'
import { AUDIENCES, budgetHref, CATEGORIES, CHARTER_GAPS, fundedPrograms, hasCharter, offerings, offices, peso, servicesMeta, shortName, slugify, type Office, type Service } from '../_lib/services'

export const metadata: Metadata = pageMeta({
	title: 'Programs & services',
	description:
		'What the Bangsamoro Government’s ministries and offices offer the public — scholarships, assistance, permits, training — who each is for, what to bring, the fee and how long it takes, from their own Citizen’s Charters.',
	path: '/services',
})

const GROUPS: { kind: Office['kind'][]; title: string | null }[] = [
	// The ministries lead under the section's own heading, so they take no label of their own.
	{ kind: ['office', 'ministry'], title: null },
	{ kind: ['attached'], title: 'Attached offices, authorities and commissions' },
]

const sectionHead = 'flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'
const eyebrow = 'font-mono text-[0.65625rem] font-semibold uppercase tracking-[0.14em]'
const linkClass = 'underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; for?: string }> }) {
	const { q = '', cat = '', for: audience = '' } = await searchParams
	const listed = offices.filter(hasCharter)
	const programs = offerings.filter((o) => o.kind === 'program').length
	const services = offerings.length - programs

	// What the search needs, and nothing more: the requirements stay on the office pages.
	const entries: ServiceEntry[] = offerings.map((o) => ({
		kind: o.kind,
		name: o.item.name,
		summary: o.item.summary,
		office: shortName(o.office),
		officeName: o.office.name,
		href: `/services/${o.office.slug}#${o.kind}-${slugify(o.item.name)}`,
		for: o.item.for,
		category: o.item.category ?? '',
		fee: o.kind === 'service' ? (o.item as Service).fee : null,
		time: o.kind === 'service' ? (o.item as Service).time : null,
		draft: o.office.charterStatus === 'draft',
	}))
	// Only the audiences something is actually offered to, by name.
	const audiences = AUDIENCES.map((a) => ({ ...a, count: offerings.filter((o) => o.item.for.includes(a.id)).length })).filter((a) => a.count)
	const categories = CATEGORIES.map((c) => ({ ...c, count: offerings.filter((o) => o.item.category === c.id).length })).filter((c) => c.count)

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='services' />

			<ServicesSearch
				entries={entries}
				categories={categories}
				audiences={audiences}
				initial={{ q, cat, for: audience }}
				jump={[
					{ href: '#categories', label: 'Categories', icon: 'categories' },
					{ href: '#offices', label: 'Offices with a charter', icon: 'charter' },
					{ href: '#no-charter', label: 'Offices without one', icon: 'none' },
				]}
				head={
					<>
						<p className='bb-label'>What the government offers, and how to get it</p>
						<h1 className='bb-display-md mt-4 text-[var(--ink)]'>Programs & services</h1>
						<p className='mx-auto mt-4 max-w-xl text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
							{services} services and {programs} programs from the Citizen’s Charters of {listed.length} offices: who each is for, what to bring, the fee and how long it takes.
						</p>
					</>
				}
			>
				<div className='bb-container py-14 lg:py-20'>
					<WithCharter />
					<WithoutCharter />

					<p className='mt-16 text-[0.8125rem] leading-[1.7] text-[var(--ink-3)]'>
						{servicesMeta.note} Each office’s website was checked for a charter on{' '}
						{new Date(servicesMeta.charterCheckedAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}. Know of a charter we missed, or a service that is out of date?{' '}
						<a href='/report' className={linkClass}>
							Tell us
						</a>
						.
					</p>
				</div>
			</ServicesSearch>
			<GetInvolved />
		</main>
	)
}

const KIND: Record<Office['kind'], string> = { office: 'Office', ministry: 'Ministry', attached: 'Attached' }
const badge = 'inline-block rounded-full px-2.5 py-0.5 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.12em]'
const card =
	'group relative flex min-w-0 flex-col overflow-hidden border border-[var(--rule)] bg-[var(--paper)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_20px_40px_-26px_rgba(0,0,0,0.35)]'

/** An office's acronym, what kind of office it is, and anything else said of it, as badges, as the Directory draws them. */
function Badges({ o, extra }: { o: Office; extra?: React.ReactNode }) {
	return (
		<p className='mt-2 flex flex-wrap justify-center gap-1.5'>
			{o.acronym ? <span className={`${badge} bg-[var(--accent-soft)] text-[var(--accent)]`}>{o.acronym}</span> : null}
			<span className={`${badge} bg-[var(--paper-2)] text-[var(--ink-2)]`}>{KIND[o.kind]}</span>
			{extra}
		</p>
	)
}

/** The offices whose programs and services are listed: cards, as the Directory draws its offices — the mark, the name
 *  and badges, then the two counts side by side, and the way in at the foot. */
function WithCharter() {
	const listed = offices.filter(hasCharter)
	return (
		<section id='offices' aria-labelledby='offices-title' className='scroll-mt-[calc(var(--site-header-h)+1rem)]'>
			<div className={sectionHead}>
				<h2 id='offices-title' className='text-[1.625rem] font-extrabold tracking-[-0.02em]'>
					Offices with a Citizen’s Charter <span className='text-[var(--ink-mute)]'>· {listed.length}</span>
				</h2>
				<p className='text-[0.84375rem] text-[var(--ink-3)]'>Each office’s page has every service: what to bring, the fee, the time and where to go.</p>
			</div>
			{GROUPS.map((g) => {
				const list = listed.filter((o) => g.kind.includes(o.kind))
				if (!list.length) return null
				return (
					<div key={g.kind[0]} className={g.title ? 'mt-12' : 'mt-8'}>
						{g.title ? (
							<h3 className={`${eyebrow} mb-4 text-[var(--ink-3)]`}>
								{g.title} <span className='text-[var(--ink-mute)]'>· {list.length}</span>
							</h3>
						) : null}
						<ul className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
							{list.map((o) => (
								<li key={o.slug} className={card}>
									<div className='grid h-28 place-items-center pt-4'>
										<Emblem image={officeLogo(o.slug)} name={o.name} label={o.acronym} className='size-[4.5rem] text-[0.75rem] transition duration-500 group-hover:scale-105' />
									</div>
									<div className='flex flex-1 flex-col px-5 pb-5 pt-4 text-center'>
										<p className='text-[1rem] font-extrabold leading-snug tracking-[-0.015em]'>
											{/* The whole card is the link; the name carries it for readers of the link text. */}
											<Link href={`/services/${o.slug}`} className='after:absolute after:inset-0 group-hover:text-[var(--accent)]'>
												{o.name}
											</Link>
										</p>
										<Badges o={o} extra={o.charterStatus === 'draft' ? <span className={`${badge} bg-[var(--paper-2)] text-[var(--brass)]`}>Draft charter</span> : null} />
										{/* The two counts side by side, pushed to the card's foot so they line up across a row. */}
										<div className='mt-auto pt-5'>
										<dl className='grid grid-cols-2 divide-x divide-[var(--rule)] border border-[var(--rule)]'>
											{[
												['Services', o.services.length],
												['Programs', o.programs.length],
											].map(([label, n]) => (
												<div key={label} className='flex flex-col-reverse py-3'>
													<dt className='mt-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>{label}</dt>
													<dd className='num text-[1.5rem] font-extrabold leading-none tracking-[-0.02em] text-[var(--ink)]'>{n}</dd>
												</div>
											))}
										</dl>
										</div>
									</div>
									<p className='flex items-center justify-between border-t border-[var(--rule)] px-5 py-3 text-[0.8125rem] font-semibold text-[var(--ink-2)] group-hover:bg-[var(--accent)] group-hover:text-white'>
										See its services <ArrowRightIcon size={13} weight='bold' aria-hidden='true' />
									</p>
								</li>
							))}
						</ul>
					</div>
				)
			})}
		</section>
	)
}

/**
 * The offices whose services are not listed, and why. Every office is bound
 * to publish a Citizen's Charter; where one has not, its 2026 appropriation
 * is the only public account of what it does. Each is a card: what the check
 * found, and what the budget gives it; its page lists the programs the Act
 * funds, named as the Act names them, and said to be that, not services.
 */
function WithoutCharter() {
	const without = offices.filter((o) => !hasCharter(o))
	return (
		<section id='no-charter' aria-labelledby='no-charter-title' className='mt-20 scroll-mt-[calc(var(--site-header-h)+1rem)] border-t border-[var(--rule)] pt-14 lg:mt-24'>
			<div className={sectionHead}>
				<h2 id='no-charter-title' className='text-[1.625rem] font-extrabold tracking-[-0.02em]'>
					Offices without one <span className='text-[var(--ink-mute)]'>· {without.length}</span>
				</h2>
				<p className='max-w-xl text-[0.84375rem] text-[var(--ink-3)]'>
					Every office must publish a Citizen’s Charter: each service, what to bring, the fee and how long it takes. Until these do, here is what the 2026 budget funds each to do.
				</p>
			</div>

			{CHARTER_GAPS.map((g) => {
				// A charter only promised counts as none; those offices lead the list, their notes saying what was promised.
				const list = without.filter((o) => o.charterStatus === g.status || (g.status === 'none' && o.charterStatus === 'coming')).sort((a, b) => Number(b.charterStatus === 'coming') - Number(a.charterStatus === 'coming'))
				if (!list.length) return null
				return (
					<div key={g.status} className={g.status === 'none' ? 'mt-8' : 'mt-12'}>
						{/* The offices with none follow the section's own lead, which already says so; only the others take a heading. */}
						{g.status === 'none' ? null : (
							<div className='mb-4'>
								<h3 className={`${eyebrow} text-[var(--ink-3)]`}>
									{g.title} <span className='text-[var(--ink-mute)]'>· {list.length}</span>
								</h3>
								<p className='mt-1 text-[0.8125rem] text-[var(--ink-mute)]'>{g.lead}</p>
							</div>
						)}
						<ul className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
							{list.map((o) => (
								<GapCard key={o.slug} o={o} />
							))}
						</ul>
					</div>
				)
			})}
		</section>
	)
}

function GapCard({ o }: { o: Office }) {
	const funded = fundedPrograms(o)
	const total = funded.reduce((n, p) => n + p.amount, 0)
	return (
		<li className={card}>
			<div className='flex flex-1 flex-col px-5 pb-5 pt-6 text-center'>
				<span className='mx-auto size-14'>
					<Emblem image={officeLogo(o.slug)} name={o.name} label={o.acronym} className='size-full rounded-full text-[0.625rem] transition duration-500 group-hover:scale-105' />
				</span>
				<p className='mt-4 text-[0.96875rem] font-extrabold leading-snug tracking-[-0.015em]'>
					<Link href={`/services/${o.slug}`} className='after:absolute after:inset-0 group-hover:text-[var(--accent)]'>
						{o.name}
					</Link>
				</p>
				<Badges o={o} extra={o.charterStatus === 'coming' ? <span className={`${badge} bg-[var(--paper-2)] text-[var(--brass)]`}>Promised</span> : null} />
				{o.charterNote ? (
					<p className='mt-3 text-[0.78125rem] leading-[1.55] text-[var(--ink-3)]'>
						{o.charterNote}
						{o.charterPage ? (
							<>
								{' '}
								<a href={o.charterPage} target='_blank' rel='noreferrer' className={`relative z-1 inline-flex items-center gap-0.5 ${linkClass}`}>
									See it <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
								</a>
							</>
						) : null}
					</p>
				) : null}
			</div>
			{/* What the 2026 budget gives it, at the foot, so the amounts line up across a row. */}
			<div className='flex min-h-[4.25rem] items-center justify-between gap-3 border-t border-[var(--rule)] px-5 py-3'>
				{funded.length ? (
					<>
						<span className='min-w-0'>
							<span className='flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
								<CoinsIcon size={13} aria-hidden='true' /> Funded in 2026
							</span>
							<span className='mt-0.5 block text-[0.8125rem] text-[var(--ink-3)]'>
								{funded.length} {funded.length === 1 ? 'program' : 'programs'}
							</span>
						</span>
						<a href={budgetHref(o)} className='relative z-1 inline-flex shrink-0 items-center gap-1 text-[1.125rem] font-extrabold tabular-nums tracking-[-0.01em] text-[var(--ink)] hover:text-[var(--accent)]'>
							{peso(total)} <ArrowRightIcon size={12} weight='bold' aria-hidden='true' />
						</a>
					</>
				) : (
					<span className='text-[0.8125rem] italic text-[var(--ink-mute)]'>No programs of its own in the 2026 budget.</span>
				)}
			</div>
		</li>
	)
}
