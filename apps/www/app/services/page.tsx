import { ArrowRightIcon, ArrowUpRightIcon, CoinsIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '../_components/site-header'
import { ServicesSearch, type ServiceEntry } from '../_components/services-search'
import { GetInvolved } from '../_components/get-involved'
import { officeLogo } from '../_lib/directory'
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
const eyebrow = 'font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em]'
const linkClass = 'underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'

/** An office's logo, as the Directory draws it, or its acronym where no logo has been found. */
function OfficeLogo({ o }: { o: Office }) {
	const logo = officeLogo(o.slug)
	return logo ? (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={logo.src} alt='' title={`Logo: ${logo.credit}`} loading='lazy' className='size-full bg-[var(--paper-2)] object-contain! p-2 sm:p-4' />
	) : (
		<span aria-hidden='true' className='grid size-full place-items-center bg-[var(--paper-2)] font-mono text-[11px] font-bold text-[var(--ink-3)] sm:text-[16px]'>
			{(o.acronym ?? '').slice(0, 5)}
		</span>
	)
}

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
				head={
					<>
						<p className='bb-label'>What the government offers, and how to get it</p>
						<h1 className='bb-display-md mt-4 text-[var(--ink)]'>Programs & services</h1>
						<p className='mx-auto mt-4 max-w-xl text-[15px] leading-7 text-[var(--ink-2)]'>
							{services} services and {programs} programs from the Citizen’s Charters of {listed.length} offices: who each is for, what to bring, the fee and how long it takes.
						</p>
					</>
				}
			>
				<div className='bb-container py-14 lg:py-20'>
					<WithCharter />
					<WithoutCharter />

					<p className='mt-16 max-w-3xl text-[13px] leading-[1.7] text-[var(--ink-3)]'>
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

/** The offices whose programs and services are listed: cards, as the Directory draws its offices. */
function WithCharter() {
	const listed = offices.filter(hasCharter)
	return (
		<section id='offices' aria-labelledby='offices-title' className='scroll-mt-[calc(var(--site-header-h)+1rem)]'>
			<div className={sectionHead}>
				<h2 id='offices-title' className='text-[26px] font-extrabold tracking-[-0.02em]'>
					Offices with a Citizen’s Charter <span className='text-[var(--ink-mute)]'>· {listed.length}</span>
				</h2>
				<p className='text-[13.5px] text-[var(--ink-3)]'>Each office’s page has every service: what to bring, the fee, the time and where to go.</p>
			</div>
			{GROUPS.map((g) => {
				const list = listed.filter((o) => g.kind.includes(o.kind))
				if (!list.length) return null
				return (
					<div key={g.kind[0]} className={g.title ? 'mt-12' : 'mt-8'}>
						{g.title ? (
							<h3 className={`${eyebrow} text-[var(--ink-3)]`}>
								{g.title} <span className='text-[var(--ink-mute)]'>· {list.length}</span>
							</h3>
						) : null}
						{/* A list on a phone, cards from a tablet up. */}
						<ul className='mt-3 grid border-t border-[var(--rule)] sm:mt-4 sm:grid-cols-2 sm:gap-4 sm:border-t-0 lg:grid-cols-3 xl:grid-cols-4'>
							{list.map((o) => (
								<li key={o.slug} className='bb-frame relative flex min-w-0 gap-4 border-b border-[var(--rule-soft)] bg-transparent! py-3 sm:flex-col sm:gap-0 sm:overflow-hidden sm:border sm:border-[var(--rule)] sm:py-0'>
									<span className='relative size-16 shrink-0 overflow-hidden sm:h-28 sm:w-full'>
										<OfficeLogo o={o} />
									</span>
									<div className='flex min-w-0 flex-1 flex-col sm:p-4'>
										<p className='text-[15.5px] leading-[1.2]'>
											{/* The whole card is the link; the name carries it for readers of the link text. */}
											<Link href={`/services/${o.slug}`} className='font-bold after:absolute after:inset-0 hover:text-[var(--accent)]'>
												{o.name}
											</Link>
										</p>
										<p className='mt-2 text-[13px] text-[var(--ink-2)]'>
											<span className='font-semibold tabular-nums text-[var(--ink)]'>{o.services.length}</span> {o.services.length === 1 ? 'service' : 'services'} ·{' '}
											<span className='font-semibold tabular-nums text-[var(--ink)]'>{o.programs.length}</span> {o.programs.length === 1 ? 'program' : 'programs'}
										</p>
										{o.charterStatus === 'draft' ? (
											<p className={`${eyebrow} mt-2 text-[var(--brass)]`}>From a draft charter</p>
										) : null}
									</div>
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
 * is the only public account of what it does, so its programs from the Act
 * stand in — named as the Act names them, and said to be that, not services.
 */
function WithoutCharter() {
	const without = offices.filter((o) => !hasCharter(o))
	return (
		<section id='no-charter' aria-labelledby='no-charter-title' className='mt-20 scroll-mt-[calc(var(--site-header-h)+1rem)] border-t border-[var(--rule)] pt-14 lg:mt-24'>
			<div className={sectionHead}>
				<h2 id='no-charter-title' className='text-[26px] font-extrabold tracking-[-0.02em]'>
					Offices without one <span className='text-[var(--ink-mute)]'>· {without.length}</span>
				</h2>
				<p className='max-w-xl text-[13.5px] text-[var(--ink-3)]'>
					Every office must publish a Citizen’s Charter: each service, what to bring, the fee and how long it takes. Until these do, here is what the 2026 budget funds each to do.
				</p>
			</div>

			{CHARTER_GAPS.map((g) => {
				const list = without.filter((o) => o.charterStatus === g.status)
				if (!list.length) return null
				return (
					<div key={g.status} className='mt-10'>
						<h3 className={`${eyebrow} text-[var(--ink-3)]`}>
							{g.title} <span className='text-[var(--ink-mute)]'>· {list.length}</span>
						</h3>
						<p className='mt-1 text-[13px] text-[var(--ink-mute)]'>{g.lead}</p>
						<ul className='mt-4 border-t border-[var(--ink)]'>
							{list.map((o) => (
								<GapRow key={o.slug} o={o} />
							))}
						</ul>
					</div>
				)
			})}
		</section>
	)
}

function GapRow({ o }: { o: Office }) {
	const funded = fundedPrograms(o)
	const total = funded.reduce((n, p) => n + p.amount, 0)
	return (
		<li className='grid gap-x-8 gap-y-3 border-b border-[var(--rule-soft)] py-5 md:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]'>
			<div className='min-w-0'>
				{o.acronym ? <p className={`${eyebrow} text-[var(--accent)]`}>{o.acronym}</p> : null}
				<p className='mt-0.5 text-[15.5px] font-bold leading-snug'>
					<Link href={`/services/${o.slug}`} className='hover:text-[var(--accent)]'>
						{o.name}
					</Link>
				</p>
				{o.charterNote ? (
					<p className='mt-1.5 text-[13px] leading-[1.55] text-[var(--ink-3)]'>
						{o.charterNote}
						{o.charterPage ? (
							<>
								{' '}
								<a href={o.charterPage} target='_blank' rel='noreferrer' className={`inline-flex items-center gap-0.5 ${linkClass}`}>
									See it <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
								</a>
							</>
						) : null}
					</p>
				) : null}
			</div>
			<div className='min-w-0'>
				{funded.length ? (
					<>
						<p className='flex flex-wrap items-baseline justify-between gap-x-4 text-[12.5px] text-[var(--ink-3)]'>
							<span className='inline-flex items-center gap-1.5'>
								<CoinsIcon size={13} aria-hidden='true' /> Funded in 2026 for
							</span>
							<a href={budgetHref(o)} className={`inline-flex items-center gap-1 font-semibold text-[var(--ink)] ${linkClass}`}>
								{peso(total)} in all <ArrowRightIcon size={11} weight='bold' aria-hidden='true' />
							</a>
						</p>
						<ul className='mt-2 grid gap-x-6 sm:grid-cols-2'>
							{funded.slice(0, 6).map((p) => (
								<li key={p.name} className='flex items-baseline justify-between gap-3 border-b border-dotted border-[var(--rule)] py-1.5 text-[13.5px] leading-snug'>
									<span className='min-w-0 text-[var(--ink-2)]'>{p.name}</span>
									<span className='shrink-0 tabular-nums text-[var(--ink-3)]'>{peso(p.amount)}</span>
								</li>
							))}
						</ul>
						{funded.length > 6 ? <p className='mt-1.5 text-[12.5px] text-[var(--ink-mute)]'>and {funded.length - 6} more on its budget page</p> : null}
					</>
				) : (
					<p className='text-[13px] italic text-[var(--ink-mute)]'>No programs of its own in the 2026 budget.</p>
				)}
			</div>
		</li>
	)
}
