import { ArrowUpRightIcon, BuildingsIcon, FacebookLogoIcon, FileTextIcon, GlobeIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GetInvolved } from '../../../_components/get-involved'
import { Masthead } from '../../../_components/masthead'
import { ServiceCards } from '../../../_components/service-cards'
import { SiteHeader } from '../../../_components/site-header'
import { lguByKey, lguHasCharter, lguMeta, lgus } from '../../../_lib/lgu-services'
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

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='services' />

			<Masthead brand label={l.kind === 'Province' ? 'Province' : `${l.kind === 'Municipality' ? 'Town' : l.kind} · ${l.province}`} lines={[title(l)]}>
				<div className='flex flex-wrap gap-3'>
					{/* Fixed colours: inside the band, --paper and --ink are re-pointed to its crimson ground. */}
					{l.charter ? (
						<a href={l.charter.url} target='_blank' rel='noreferrer' className='inline-flex h-11 items-center gap-2 bg-white px-4 text-[14px] font-semibold text-[#191713] hover:bg-white/90'>
							<FileTextIcon size={16} aria-hidden='true' /> Citizen’s Charter
						</a>
					) : null}
					{l.website ? (
						<a href={l.website} target='_blank' rel='noreferrer' className='inline-flex h-11 items-center gap-2 border border-white/40 px-4 text-[14px] font-semibold text-white hover:bg-white/10'>
							<GlobeIcon size={16} aria-hidden='true' /> Official website
						</a>
					) : null}
					{l.facebook ? (
						<a href={l.facebook} target='_blank' rel='noreferrer' className='inline-flex h-11 items-center gap-2 border border-white/40 px-4 text-[14px] font-semibold text-white hover:bg-white/10'>
							<FacebookLogoIcon size={16} aria-hidden='true' /> Facebook
						</a>
					) : null}
					<Link href={directory} className='inline-flex h-11 items-center gap-2 border border-white/40 px-4 text-[14px] font-semibold text-white hover:bg-white/10'>
						<BuildingsIcon size={16} aria-hidden='true' /> In the Directory
					</Link>
				</div>
			</Masthead>

			<section className='bb-container bb-section'>
				<div className='max-w-[66rem]'>
					{listed ? (
						<section aria-labelledby='services'>
							<h2 id='services' className='text-[22px] font-extrabold tracking-[-0.01em]'>
								Services <span className='text-[var(--ink-mute)]'>{l.services.length}</span>
							</h2>
							<p className='mt-1 text-[13.5px] text-[var(--ink-3)]'>As its Citizen’s Charter lists them: what to bring, what it costs, how long it takes.</p>
							{/* A city's charter runs to a hundred services and more, so they are shelved by category, in the categories' own order. */}
							{CATEGORIES.map((c) => {
								const list = l.services.filter((s) => s.category === c.id)
								if (!list.length) return null
								return (
									<div key={c.id} className='mt-10'>
										<h3 className='flex items-baseline gap-2 border-b border-[var(--ink)] pb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
											{c.label} <span className='text-[var(--ink-mute)]'>{list.length}</span>
										</h3>
										<ServiceCards services={list} base='/services/lgu' />
									</div>
								)
							})}
						</section>
					) : (
						<section aria-labelledby='no-charter' className='border border-[var(--rule)] bg-[var(--paper-2)] p-6'>
							<h2 id='no-charter' className='text-[18px] font-bold'>No Citizen’s Charter we could read</h2>
							<p className='mt-2 max-w-2xl text-[14.5px] leading-[1.7] text-[var(--ink-2)]'>
								Every local government must publish a Citizen’s Charter: each service it gives, what to bring, what it costs and how long it takes. Until one from the {title(l)} can be read here, ask its municipal or city hall directly, or tell us where its charter is.
							</p>
							{l.charterNote ? <p className='mt-3 max-w-2xl text-[14px] leading-[1.65] text-[var(--ink-3)]'>{l.charterNote}</p> : null}
							<a href='/report' className='mt-4 inline-flex text-[14px] font-semibold underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'>
								Tell us where to find it
							</a>
						</section>
					)}
					<p className='mt-12 text-[12.5px] leading-6 text-[var(--ink-3)]'>
						{lguMeta.note}{' '}
						<Link href='/services/lgu' className='inline-flex items-center gap-1 underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'>
							Every province, city and town <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
						</Link>
					</p>
				</div>
			</section>
			<GetInvolved />
		</main>
	)
}
