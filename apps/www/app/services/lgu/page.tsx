import { ArrowUpRightIcon, FacebookLogoIcon, GlobeIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { GetInvolved } from '../../_components/get-involved'
import { ServicesSearch, type ServiceEntry } from '../../_components/services-search'
import { ServicesTabs } from '../../_components/services-tabs'
import { SiteHeader } from '../../_components/site-header'
import { lguSeal } from '../../_lib/images'
import { Emblem } from '../../_components/emblem'
import { LGU_GAPS, lguHasCharter, lguHref, lguMeta, lgus, PROVINCES, type Lgu } from '../../_lib/lgu-services'
import { pageMeta } from '../../_lib/seo'
import { AUDIENCES, CATEGORIES, offerings, slugify } from '../../_lib/services'

export const metadata: Metadata = pageMeta({
	title: 'Programs & services of the provinces, cities and towns',
	description:
		'What the provinces, cities and towns of the Bangsamoro offer the public — permits, certificates, assistance — who each is for, what to bring, the fee and how long it takes, from their own Citizen’s Charters.',
	path: '/services/lgu',
})

const sectionHead = 'flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'
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
				tabs={<ServicesTabs active='lgu' counts={{ regional: offerings.length, lgu: total }} />}
				jump={[
					...(entries.length ? [{ href: '#categories', label: 'Categories', icon: 'categories' as const }] : []),
					{ href: '#lgus', label: 'With a charter', icon: 'charter' },
					{ href: '#no-charter', label: 'Without one', icon: 'none' },
				]}
				head={
					<>
						<p className='bb-label'>What your province, city or town offers</p>
						<h1 className='bb-display-md mt-4 text-[var(--ink)]'>Programs & services</h1>
						<p className='mx-auto mt-4 max-w-xl text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
							{total ? `${total} services from the Citizen’s Charters of ${listed.length} of the region’s ${lgus.length} local governments` : `The Citizen’s Charters of the region’s ${lgus.length} local governments`}: who each is for, what to bring, the fee and how long it takes.
						</p>
					</>
				}
			>
				<div className='bb-container py-14 lg:py-20'>
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

/** The LGUs whose services are listed: cards with their seals, by province. */
function WithCharter({ listed }: { listed: Lgu[] }) {
	return (
		<section id='lgus' aria-labelledby='lgus-title' className='scroll-mt-[calc(var(--site-header-h)+1rem)]'>
			<div className={sectionHead}>
				<h2 id='lgus-title' className='text-[1.625rem] font-extrabold tracking-[-0.02em]'>
					With a Citizen’s Charter <span className='text-[var(--ink-mute)]'>· {listed.length}</span>
				</h2>
				<p className='text-[0.84375rem] text-[var(--ink-3)]'>Each page has every service: what to bring, the fee, the time and where to go.</p>
			</div>
			{listed.length ? (
				<ul className='mt-6 grid border-t border-[var(--rule)] sm:grid-cols-2 sm:gap-4 sm:border-t-0 lg:grid-cols-3 xl:grid-cols-4'>
					{listed.map((l) => (
						<li key={l.key} className='bb-frame relative flex min-w-0 gap-4 border-b border-[var(--rule-soft)] bg-transparent! py-3 sm:flex-col sm:gap-0 sm:overflow-hidden sm:border sm:border-[var(--rule)] sm:py-0'>
							<span className='relative size-16 shrink-0 overflow-hidden sm:h-28 sm:w-full'>
								<Emblem image={lguSeal(l.key)} name={l.name} tile className='size-full text-[1rem]' />
							</span>
							<div className='flex min-w-0 flex-1 flex-col sm:p-4'>
								<p className={`${eyebrow} text-[var(--ink-3)]`}>
									{kindOf(l)} · {l.province}
								</p>
								<p className='mt-1 text-[0.96875rem] leading-[1.2]'>
									<Link href={lguHref(l)} className='font-bold after:absolute after:inset-0 hover:text-[var(--accent)]'>
										{l.name}
									</Link>
								</p>
								<p className='mt-2 text-[0.8125rem] text-[var(--ink-2)]'>
									<span className='font-semibold tabular-nums text-[var(--ink)]'>{l.services.length}</span> {l.services.length === 1 ? 'service' : 'services'}
								</p>
							</div>
						</li>
					))}
				</ul>
			) : (
				<p className='mt-6 text-[0.875rem] text-[var(--ink-3)]'>None yet.</p>
			)}
		</section>
	)
}

/** Every other LGU, by why it has no services listed, then by province: a compact list, each with its seal and its links. */
function WithoutCharter() {
	const without = lgus.filter((l) => !lguHasCharter(l))
	const groups = LGU_GAPS.map((g) => ({ g, list: without.filter((l) => g.status.includes(l.charterStatus)) })).filter(({ list }) => list.length)
	return (
		<section id='no-charter' aria-labelledby='no-charter-title' className='mt-20 scroll-mt-[calc(var(--site-header-h)+1rem)] border-t border-[var(--rule)] pt-14 lg:mt-24'>
			<div className={sectionHead}>
				<h2 id='no-charter-title' className='text-[1.625rem] font-extrabold tracking-[-0.02em]'>
					Without one <span className='text-[var(--ink-mute)]'>· {without.length}</span>
				</h2>
				<p className='max-w-xl text-[0.84375rem] text-[var(--ink-3)]'>Every local government must publish a Citizen’s Charter: each service, what to bring, the fee and how long it takes.</p>
			</div>

			{/* A group is only named when there is another to tell it from; with one, the provinces follow the section's heading. */}
			{groups.map(({ g, list }) => {
				return (
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
								<div key={p.slug} className='mt-6'>
									<p className='relative border-b border-[var(--ink)] pb-2 text-[0.8125rem] font-bold'>
										{p.name} <span className='font-normal text-[var(--ink-mute)]'>· {inP.length}</span>
									</p>
									{/* Each row's rule is on its top, so the last row ends without one at any column count; the first row's tuck under the province's rule, which is positioned to paint over them. */}
									<ul className='-mt-px grid gap-x-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
										{inP.map((l) => (
											<li key={l.key} className='flex min-w-0 gap-3 border-t border-[var(--rule-soft)] py-5'>
												<span className='size-9 shrink-0'>
													<Emblem image={lguSeal(l.key)} name={l.name} className='size-full rounded-full text-[0.625rem]' />
												</span>
												<div className='min-w-0'>
													<p className='text-[0.90625rem] font-semibold leading-snug'>
														{l.name} <span className='text-[0.75rem] font-normal text-[var(--ink-mute)]'>{kindOf(l)}</span>
													</p>
													{l.charterNote ? <p className='mt-0.5 text-[0.78125rem] leading-[1.5] text-[var(--ink-3)]'>{l.charterNote}</p> : null}
													{l.website || l.facebook || l.charter ? (
														<p className='mt-1 flex flex-wrap gap-x-3 text-[0.78125rem]'>
															{l.charter ? (
																<a href={l.charter.url} target='_blank' rel='noreferrer' className={`inline-flex items-center gap-1 ${linkClass}`}>
																	Charter <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
																</a>
															) : null}
															{l.website ? (
																<a href={l.website} target='_blank' rel='noreferrer' className={`inline-flex items-center gap-1 ${linkClass}`}>
																	<GlobeIcon size={12} aria-hidden='true' /> Website
																</a>
															) : null}
															{l.facebook ? (
																<a href={l.facebook} target='_blank' rel='noreferrer' className={`inline-flex items-center gap-1 ${linkClass}`}>
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
				)
			})}
		</section>
	)
}
