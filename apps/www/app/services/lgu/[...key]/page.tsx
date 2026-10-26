import { AddressBookIcon, ArrowRightIcon, ArrowSquareOutIcon, ArrowUpRightIcon, EnvelopeSimpleIcon, FacebookLogoIcon, FileTextIcon, GlobeIcon, UserIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Phone } from '../../../_components/directory-bits'
import { GetInvolved } from '../../../_components/get-involved'
import { Masthead } from '../../../_components/masthead'
import { ServiceCards } from '../../../_components/service-cards'
import { SiteHeader } from '../../../_components/site-header'
import { lguByKey, lguHasCharter, lguMeta, lgus } from '../../../_lib/lgu-services'
import { lguEmail, localGroup, provinceLines, townLines } from '../../../_lib/directory'
import { pageMeta } from '../../../_lib/seo'
import { CATEGORIES } from '../../../_lib/services'

export function generateStaticParams() {
	return lgus.map((l) => ({ key: l.key.split('/') }))
}

const title = (l: { kind: string; name: string }) => (l.kind === 'Municipality' ? `Municipality of ${l.name}` : l.kind === 'Province' ? `Province of ${l.name}` : `City of ${l.name.replace(/ City$/, '')}`)

export async function generateMetadata({ params }: { params: Promise<{ key: string[] }> }): Promise<Metadata> {
	const l = lguByKey((await params).key.join('/'))
	if (!l) return { title: 'Programs & services', robots: { index: false, follow: true } }
	return pageMeta({
		title: `${title(l)} — Programs & services`,
		description: `What the ${title(l)}, ${l.province}, offers the public, who each service is for, what to bring, the fee and how long it takes.`,
		path: `/services/lgu/${l.key}`,
	})
}

export default async function LguPage({ params }: { params: Promise<{ key: string[] }> }) {
	const l = lguByKey((await params).key.join('/'))
	if (!l) notFound()
	const listed = lguHasCharter(l)
	const directory = `/directory/lgu/${l.key}`
	// The contact side is read from the Directory, which keeps each place's head, its hall's numbers and its email.
	const [province, town] = l.key.split('/') as [string, string | undefined]
	const group = localGroup(province)
	const head = town ? group?.units.find((u) => u.slug === town)?.head : group?.governor
	const hall = (town ? townLines(province, town) : provinceLines(province)).filter((x) => x.kind === 'hall').flatMap((x) => x.phones)
	const email = lguEmail(province, town)
	const sources = [
		l.charter ? { label: l.charter.label, url: l.charter.url } : null,
		l.website ? { label: 'Official website', url: l.website } : null,
		l.facebook ? { label: 'Official Facebook page', url: l.facebook } : null,
		email ? { label: email.office ?? 'Where its email is printed', url: email.source } : null,
	].filter((x): x is { label: string; url: string } => x !== null)
	const label = 'text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='services' />

			<Masthead brand label={l.kind === 'Province' ? 'Province' : `${l.kind === 'Municipality' ? 'Town' : l.kind} · ${l.province}`} lines={[title(l)]}>
				<div className='flex flex-wrap gap-x-5 gap-y-2'>
										{l.charter ? (
						<a href={l.charter.url} target='_blank' rel='noreferrer' className='inline-flex items-center gap-2 text-[0.875rem] font-semibold text-white underline decoration-white/30 underline-offset-[6px] transition hover:decoration-white'>
							<FileTextIcon size={16} aria-hidden='true' /> Citizen’s Charter
						</a>
					) : null}
					{l.website ? (
						<a href={l.website} target='_blank' rel='noreferrer' className='inline-flex items-center gap-2 text-[0.875rem] font-semibold text-white underline decoration-white/30 underline-offset-[6px] transition hover:decoration-white'>
							<GlobeIcon size={16} aria-hidden='true' /> Official website
						</a>
					) : null}
					{l.facebook ? (
						<a href={l.facebook} target='_blank' rel='noreferrer' className='inline-flex items-center gap-2 text-[0.875rem] font-semibold text-white underline decoration-white/30 underline-offset-[6px] transition hover:decoration-white'>
							<FacebookLogoIcon size={16} aria-hidden='true' /> Facebook
						</a>
					) : null}
					<Link href={directory} className='inline-flex items-center gap-2 text-[0.875rem] font-semibold text-white underline decoration-white/30 underline-offset-[6px] transition hover:decoration-white'>
						<AddressBookIcon size={16} aria-hidden='true' /> In the Directory
					</Link>
				</div>
			</Masthead>

			<section className='bb-container bb-section'>
				<div className='grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]'>
					<div className='min-w-0'>
						{listed ? (
							<section aria-labelledby='services'>
								<h2 id='services' className='text-[1.375rem] font-extrabold tracking-[-0.01em]'>
									Services <span className='text-[var(--ink-mute)]'>{l.services.length}</span>
								</h2>
								<p className='mt-1 text-[0.84375rem] text-[var(--ink-3)]'>As its Citizen’s Charter lists them: what to bring, what it costs, how long it takes.</p>
								{/* A city's charter runs to a hundred services and more, so they are shelved by category, in the categories' own order. */}
								{CATEGORIES.map((c) => {
									const list = l.services.filter((s) => s.category === c.id)
									if (!list.length) return null
									return (
										<div key={c.id} className='mt-10'>
											<h3 className='flex items-baseline gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
												{c.label} <span className='text-[var(--ink-mute)]'>{list.length}</span>
											</h3>
											<ServiceCards services={list} base='/services/lgu' />
										</div>
									)
								})}
							</section>
						) : (
							<section aria-labelledby='no-charter' className='border border-[var(--rule)] bg-[var(--paper-2)] p-6'>
								<h2 id='no-charter' className='text-[1.125rem] font-bold'>No Citizen’s Charter we could read</h2>
								<p className='mt-2 max-w-2xl text-[0.90625rem] leading-[1.7] text-[var(--ink-2)]'>
									Every local government must publish a Citizen’s Charter: each service it gives, what to bring, what it costs and how long it takes. Until one from the {title(l)} can be read here, ask its municipal or city hall directly, or tell us where its charter is.
								</p>
								{l.charterNote ? <p className='mt-3 max-w-2xl text-[0.875rem] leading-[1.65] text-[var(--ink-3)]'>{l.charterNote}</p> : null}
								<a href='/report' className='mt-4 inline-flex text-[0.875rem] font-semibold underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'>
									Tell us where to find it
								</a>
							</section>
						)}
					</div>

					<aside className='space-y-10 lg:sticky lg:top-[calc(var(--site-header-h)+1.5rem)] lg:self-start'>
						<section>
							<h2 className={label}>Contact</h2>
							<ul className='mt-3 space-y-2.5 text-[0.84375rem] leading-6'>
								{head ? (
									<li className='flex gap-2'>
										<UserIcon size={15} className='mt-1 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
										<span>
											{head} <span className='text-[var(--ink-3)]'>· {town ? 'Mayor' : 'Governor'}</span>
										</span>
									</li>
								) : null}
								{hall.map((n) => (
									<Phone key={n} number={n} />
								))}
								{email?.emails.map((e) => (
									<li key={e} className='flex gap-2'>
										<EnvelopeSimpleIcon size={15} className='mt-1 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
										<a href={`mailto:${e}`} className='break-all underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]'>
											{e}
										</a>
									</li>
								))}
							</ul>
							<Link href={directory} className='mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'>
								Emergency numbers and barangays <ArrowRightIcon size={11} weight='bold' aria-hidden='true' />
							</Link>
						</section>

						{sources.length ? (
							<section>
								<h2 className={label}>Sources</h2>
								<ul className='mt-3 space-y-2 text-[0.78125rem] leading-[1.6] text-[var(--ink-2)]'>
									{sources.map((x) => (
										<li key={x.url}>
											<a href={x.url} target='_blank' rel='noreferrer' className='inline-flex items-start gap-1 hover:text-[var(--accent)]'>
												<span>{x.label}</span>
												<ArrowSquareOutIcon size={12} className='mt-1 shrink-0' aria-hidden='true' />
											</a>
										</li>
									))}
								</ul>
							</section>
						) : null}

						<p className='text-[0.75rem] leading-[1.7] text-[var(--ink-3)]'>
							{lguMeta.note} {title(l)} may have changed a requirement since; call ahead.{' '}
							<Link href='/services/lgu' className='inline-flex items-center gap-1 underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'>
								Every province, city and town <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
							</Link>
						</p>
					</aside>
				</div>
			</section>
			<GetInvolved />
		</main>
	)
}
