import { ArrowRightIcon, ArrowUpRightIcon, FacebookLogoIcon, GlobeIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { GetInvolved } from '../../_components/get-involved'
import { ServicesSearch, type ServiceEntry } from '../../_components/services-search'
import { SiteHeader } from '../../_components/site-header'
import { lguSeal } from '../../_lib/images'
import { Emblem } from '../../_components/emblem'
import { LGU_GAPS, lguHasCharter, lguHref, lguMeta, lgus, PROVINCES, type Lgu } from '../../_lib/lgu-services'
import { pageMeta } from '../../_lib/seo'
import { AUDIENCES, CATEGORIES, slugify } from '../../_lib/services'

export const metadata: Metadata = pageMeta({
	title: 'Programs & services of the provinces, cities and towns',
	description:
		'What the provinces, cities and towns of the Bangsamoro offer the public — permits, certificates, assistance — who each is for, what to bring, the fee and how long it takes, from their own Citizen’s Charters.',
	path: '/services/lgu',
})

const sectionHead = 'flex flex-col gap-1'
const eyebrow = 'font-mono text-[0.65625rem] font-semibold uppercase tracking-[0.14em]'
const linkClass = 'underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'

const kindOf = (l: Lgu) => (l.kind === 'Municipality' ? 'Town' : l.kind)

export default async function LguServicesPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; for?: string; in?: string }> }) {
	const { q = '', cat = '', for: audience = '', in: place = '' } = await searchParams
	const listed = lgus.filter(lguHasCharter)
	const total = listed.reduce((n, l) => n + l.services.length, 0)

	const entries: ServiceEntry[] = listed.flatMap((l) =>
		l.services.map((s) => ({
			kind: 'service' as const,
			name: s.name,
			summary: s.summary,
			office: l.name,
			officeName: `${kindOf(l)} of ${l.name}, ${l.province}`,
			href: `${lguHref(l)}#service-${slugify(s.name)}`,
			for: s.for,
			category: s.category ?? '',
			fee: s.fee,
			time: s.time,
			draft: false,
			place: l.provinceSlug,
		})),
	)
	const audiences = AUDIENCES.map((a) => ({ ...a, count: entries.filter((e) => e.for.includes(a.id)).length })).filter((a) => a.count)
	const categories = CATEGORIES.map((c) => ({ ...c, count: entries.filter((e) => e.category === c.id).length })).filter((c) => c.count)
	const places = PROVINCES.map((p) => ({ id: p.slug, label: p.name, count: entries.filter((e) => e.place === p.slug).length })).filter((p) => p.count)

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='services' />

			<ServicesSearch
				entries={entries}
				categories={categories}
				audiences={audiences}
				places={places}
				initial={{ q, cat, for: audience, in: place }}
				jump={[
					...(entries.length ? [{ href: '#categories', label: 'Categories', icon: 'categories' as const }] : []),
					{ href: '#lgus', label: 'With a charter', icon: 'charter' },
					{ href: '#no-charter', label: 'Without one', icon: 'none' },
				]}
				hero={{
					kicker: 'What your province, city or town offers',
					title: 'Programs & services',
					lede: `${total ? `${total} services from the Citizen’s Charters of ${listed.length} of the region’s ${lgus.length} local governments` : `The Citizen’s Charters of the region’s ${lgus.length} local governments`}: who each is for, what to bring, the fee and how long it takes.`,
					photos: ['cotabatoPlaza', 'lakeLanao', 'budBongao'],
				}}
			>
				<div className='bb-container pb-24 pt-16 lg:pb-32 lg:pt-24'>
					<WithCharter listed={listed} />
					<WithoutCharter />

					<p className='mt-16 text-[0.8125rem] leading-[1.7] text-[var(--ink-3)]'>
						{lguMeta.note} Each local government’s website, and a web search for its charter, were checked on{' '}
						{new Date(lguMeta.charterCheckedAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}. Know of a charter we missed?{' '}
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

const badge = 'inline-block rounded-full px-2.5 py-0.5 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.12em]'
const card =
	'group relative flex min-w-0 flex-col overflow-hidden rounded-[1.25rem] border border-[var(--rule)] bg-[var(--paper)] transition duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ink)_30%,var(--rule))] hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]'
const pill = 'relative z-1 inline-flex items-center gap-1 rounded-full border border-[var(--rule)] px-2.5 py-1 text-[0.71875rem] font-semibold transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white'

/** The LGUs whose services are listed: cards, as the regional offices are drawn — the seal, the name, what kind of
 *  government and where, the count, and the way in at the foot. */
function WithCharter({ listed }: { listed: Lgu[] }) {
	return (
		<section id='lgus' aria-labelledby='lgus-title' className='scroll-mt-4'>
			<div className={sectionHead}>
				<h2 id='lgus-title' className='dv-title'>
					With a Citizen’s Charter <span className='text-[var(--ink-mute)]'>· {listed.length}</span>
				</h2>
				<p className='dv-lede'>Each page has every service: what to bring, the fee, the time and where to go.</p>
			</div>
			{listed.length ? (
				<ul className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
					{listed.map((l) => (
						<li key={l.key} className={card}>
							<div className='grid h-28 place-items-center pt-4'>
								<Emblem image={lguSeal(l.key)} name={l.name} className='size-[4.5rem] rounded-full text-[0.75rem] transition duration-500 group-hover:scale-105' />
							</div>
							<div className='flex flex-1 flex-col px-5 pb-5 pt-4 text-center'>
								<p className='text-[1rem] font-extrabold leading-snug tracking-[-0.015em]'>
									<Link href={lguHref(l)} className='after:absolute after:inset-0 group-hover:text-[var(--accent)]'>
										{l.name}
									</Link>
								</p>
								<p className='mt-2 flex flex-wrap justify-center gap-1.5'>
									<span className={`${badge} bg-[var(--accent-soft)] text-[var(--accent)]`}>{kindOf(l)}</span>
									<span className={`${badge} bg-[var(--paper-2)] text-[var(--ink-2)]`}>{l.province}</span>
								</p>
								<div className='mt-auto pt-5'>
									<p className='border border-[var(--rule)] py-3'>
										<span className='num block text-[1.5rem] font-extrabold leading-none tracking-[-0.02em] text-[var(--ink)]'>{l.services.length}</span>
										<span className='mt-1.5 block text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>{l.services.length === 1 ? 'Service' : 'Services'}</span>
									</p>
								</div>
							</div>
							<p className='flex items-center justify-between border-t border-[var(--rule)] px-5 py-3 text-[0.8125rem] font-semibold text-[var(--ink-2)] group-hover:bg-[var(--accent)] group-hover:text-white'>
								See its services <ArrowRightIcon size={13} weight='bold' aria-hidden='true' />
							</p>
						</li>
					))}
				</ul>
			) : (
				<p className='mt-6 text-[0.875rem] text-[var(--ink-3)]'>None yet.</p>
			)}
		</section>
	)
}

/** Every other LGU, by why it has no services listed, then by province: small cards, each with its seal, what the
 *  check found, and its links. */
function WithoutCharter() {
	const without = lgus.filter((l) => !lguHasCharter(l))
	const groups = LGU_GAPS.map((g) => ({ g, list: without.filter((l) => g.status.includes(l.charterStatus)) })).filter(({ list }) => list.length)
	return (
		<section id='no-charter' aria-labelledby='no-charter-title' className='mt-20 scroll-mt-4 border-t border-[var(--rule)] pt-14 lg:mt-28 lg:pt-20'>
			<div className={sectionHead}>
				<h2 id='no-charter-title' className='dv-title'>
					Without one <span className='text-[var(--ink-mute)]'>· {without.length}</span>
				</h2>
				<p className='dv-lede'>Every local government must publish a Citizen’s Charter: each service, what to bring, the fee and how long it takes.</p>
			</div>

			{/* A group is only named when there is another to tell it from; with one, the provinces follow the section's heading. */}
			{groups.map(({ g, list }) => (
				<div key={g.title} className='mt-10'>
					{groups.length > 1 ? (
						<>
							<h3 className={`${eyebrow} text-[var(--ink-3)]`}>
								{g.title} <span className='text-[var(--ink-mute)]'>· {list.length}</span>
							</h3>
							<p className='mt-1 text-[0.8125rem] text-[var(--ink-mute)]'>{g.lead}</p>
						</>
					) : null}
					{PROVINCES.map((p) => {
						const inP = list.filter((l) => l.provinceSlug === p.slug)
						if (!inP.length) return null
						return (
							<div key={p.slug} className='mt-10 first:mt-6'>
								<h3 className='text-[1.0625rem] font-extrabold tracking-[-0.01em]'>
									{p.name} <span className='font-semibold text-[var(--ink-mute)]'>· {inP.length}</span>
								</h3>
								<ul className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
									{inP.map((l) => (
										<li key={l.key} className='flex min-w-0 gap-3 border border-[var(--rule)] bg-[var(--paper)] p-4'>
											<span className='size-11 shrink-0'>
												<Emblem image={lguSeal(l.key)} name={l.name} className='size-full rounded-full text-[0.625rem]' />
											</span>
											<div className='min-w-0 flex-1'>
												<p className='text-[0.9375rem] font-extrabold leading-snug tracking-[-0.01em]'>{l.name}</p>
												<p className='mt-1'>
													<span className={`${badge} bg-[var(--paper-2)] text-[var(--ink-2)]`}>{kindOf(l)}</span>
												</p>
												{l.charterNote ? <p className='mt-2 text-[0.78125rem] leading-[1.5] text-[var(--ink-3)]'>{l.charterNote}</p> : null}
												{l.website || l.facebook || l.charter ? (
													<p className='mt-3 flex flex-wrap gap-1.5'>
														{l.charter ? (
															<a href={l.charter.url} target='_blank' rel='noreferrer' className={pill}>
																Charter <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
															</a>
														) : null}
														{l.website ? (
															<a href={l.website} target='_blank' rel='noreferrer' className={pill}>
																<GlobeIcon size={12} aria-hidden='true' /> Website
															</a>
														) : null}
														{l.facebook ? (
															<a href={l.facebook} target='_blank' rel='noreferrer' className={pill}>
																<FacebookLogoIcon size={12} aria-hidden='true' /> Facebook
															</a>
														) : null}
													</p>
												) : null}
											</div>
										</li>
									))}
								</ul>
							</div>
						)
					})}
				</div>
			))}
		</section>
	)
}
