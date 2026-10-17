import { ArrowUpRightIcon, CoinsIcon, EnvelopeSimpleIcon, FacebookLogoIcon, GlobeIcon, MapPinIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Phone, linkClass, monthYear } from '../../../_components/directory-bits'
import { Masthead } from '../../../_components/masthead'
import { DirectoryDialog } from '../../../_components/directory-dialog'
import { directoryMeta, directoryOffice, directoryOffices, fieldOffices, headPhoto, officeHistory, officePhoto } from '../../../_lib/directory'
import { PhotoCredit } from '../../../_components/discover-figure'
import { HeadPortrait } from '../../../_components/head-portrait'
import { budgetHref, officeBySlug } from '../../../_lib/services'
import { pageMeta } from '../../../_lib/seo'

export function generateStaticParams() {
	return directoryOffices.map((o) => ({ slug: o.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const o = directoryOffice((await params).slug)
	if (!o) return { title: 'Directory', robots: { index: false, follow: true } }
	return pageMeta({
		title: `${o.name} — Directory`,
		description: `Who heads the ${o.name}, how to reach it, who headed it before, and its offices in the provinces.`,
		path: `/directory/office/${o.slug}`,
	})
}

const KIND = { office: 'Office of the Chief Minister', ministry: 'Ministry', attached: 'Attached office' } as const

export default async function OfficeDirectoryPage({ params }: { params: Promise<{ slug: string }> }) {
	const o = directoryOffice((await params).slug)
	if (!o) notFound()
	const history = officeHistory(o.slug)
	const field = fieldOffices(o.slug)
	const parent = o.parent ? directoryOffice(o.parent) : undefined
	const attached = directoryOffices.filter((x) => x.parent === o.slug)
	const service = officeBySlug(o.slug)
	const portrait = headPhoto(o.slug)
	const building = officePhoto(o.slug, o.address)

	return (
		<DirectoryDialog id={o.slug} name={o.name}>
			<Masthead brand label={o.acronym ? `${KIND[o.kind]} · ${o.acronym}` : KIND[o.kind]} lines={[o.name]} />
			{building ? (
				<figure className='bb-frame relative h-56 overflow-hidden bg-[var(--paper-2)] sm:h-80'>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={building.src} alt={building.caption} className='size-full object-cover' />
					<PhotoCredit photo={{ credit: building.credit, license: building.license, source: building.page }} />
				</figure>
			) : null}

			<section className='bb-container bb-section'>
				<p className='text-[13.5px] text-[var(--ink-3)]'>
					<Link scroll={false} href='/directory' className={linkClass}>
						Directory
					</Link>
					{parent ? (
						<>
							{' '}
							· Attached to the{' '}
							<Link scroll={false} href={`/directory/office/${parent.slug}`} className={linkClass}>
								{parent.name}
							</Link>
						</>
					) : null}
				</p>

				<div className='mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
					<div>
						<p className='font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>Head of office</p>
						{o.head ? (
							<div className='mt-2 flex items-start gap-5'>
								<HeadPortrait slug={o.slug} name={o.head.name} className='size-24 sm:size-28' />
								<div className='min-w-0'>
									<p className='text-[24px] font-extrabold leading-tight tracking-[-0.02em]'>{o.head.name}</p>
									<p className='mt-1 text-[15px] text-[var(--ink-2)]'>{o.head.title}</p>
									<a href={o.head.source} target='_blank' rel='noreferrer' className='mt-1 inline-flex items-center gap-0.5 text-[12.5px] text-[var(--ink-3)] hover:text-[var(--accent)]'>
										{monthYear(o.head.as_of) ? `As of ${monthYear(o.head.as_of)}` : 'Source'} <ArrowUpRightIcon size={11} weight='bold' aria-hidden='true' />
									</a>
									{portrait ? (
										<a href={portrait.page} target='_blank' rel='noreferrer' className='mt-0.5 block text-[11.5px] text-[var(--ink-mute)] hover:text-[var(--accent)]'>
											Portrait: {portrait.credit}
										</a>
									) : null}
								</div>
							</div>
						) : (
							<p className='mt-1 text-[15px] text-[var(--ink-3)]'>Not named in an official source we could read.</p>
						)}
						{service?.mandate ? <p className='mt-6 max-w-xl text-[14.5px] leading-[1.7] text-[var(--ink-2)]'>{service.mandate}</p> : null}
						<a href={budgetHref(o)} className={`mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold ${linkClass}`}>
							<CoinsIcon size={16} aria-hidden='true' /> Its budget, year by year
						</a>
					</div>

					<div>
						<p className='font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>How to reach it</p>
						<ul className='mt-2 space-y-1.5 text-[14px] leading-6'>
							{o.phones.map((p) => (
								<Phone key={p} number={p} />
							))}
							{o.emails.map((e) => (
								<li key={e} className='flex gap-2'>
									<EnvelopeSimpleIcon size={15} className='mt-1 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
									<a href={`mailto:${e}`} className={`break-all ${linkClass}`}>
										{e}
									</a>
								</li>
							))}
							{o.address ? (
								<li className='flex gap-2 text-[var(--ink-2)]'>
									<MapPinIcon size={15} className='mt-1 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
									{o.address}
								</li>
							) : null}
							{o.website ? (
								<li className='flex gap-2'>
									<GlobeIcon size={15} className='mt-1 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
									<a href={o.website} target='_blank' rel='noreferrer' className={linkClass}>
										Website
									</a>
								</li>
							) : null}
							{o.facebook ? (
								<li className='flex gap-2'>
									<FacebookLogoIcon size={15} className='mt-1 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
									<a href={o.facebook} target='_blank' rel='noreferrer' className={linkClass}>
										Facebook
									</a>
								</li>
							) : null}
							{!o.phones.length && !o.emails.length && !o.address ? <li className='text-[var(--ink-3)]'>No public number or email found.</li> : null}
						</ul>
						{o.checked ? <p className='mt-3 text-[12px] text-[var(--ink-3)]'>Checked by an editor, {o.checked}.</p> : null}
					</div>
				</div>

				{field.length ? (
					<section aria-labelledby='field' className='mt-14'>
						<h2 id='field' className='text-[20px] font-extrabold'>
							In the provinces <span className='text-[var(--ink-mute)]'>{field.length}</span>
						</h2>
						<ul className='mt-4 grid pt-px pl-px sm:grid-cols-2 lg:grid-cols-3'>
							{field.map((f) => (
								<li key={f.office} className='-mt-px -ml-px border border-[var(--rule)] bg-[var(--paper)] p-5 text-[13.5px] leading-6'>
									<p className='font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>{f.province}</p>
									<p className='mt-1 text-[14.5px] font-semibold leading-snug'>{f.office}</p>
									{f.head ? (
										<p className='mt-1 text-[var(--ink-2)]'>
											{f.head.name}, {f.head.title}
										</p>
									) : null}
									{f.address ? <p className='mt-1 text-[var(--ink-3)]'>{f.address}</p> : null}
									<ul className='mt-1.5 space-y-1'>
										{f.phones.map((p) => (
											<Phone key={p} number={p} />
										))}
									</ul>
									<a href={f.source} target='_blank' rel='noreferrer' className='mt-2 inline-flex items-center gap-0.5 text-[11.5px] text-[var(--ink-3)] hover:text-[var(--accent)]'>
										Source <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
									</a>
								</li>
							))}
						</ul>
					</section>
				) : null}

				<section aria-labelledby='heads' className='mt-14'>
					<h2 id='heads' className='text-[20px] font-extrabold'>
						Who has headed it
					</h2>
					{history.length ? (
						<ol className='mt-3 divide-y divide-[var(--rule-soft)] border-y border-[var(--rule)] text-[14px]'>
							{history.map((h) => (
								<li key={h.name + h.from} className='grid gap-x-4 gap-y-0.5 py-2.5 sm:grid-cols-[13rem_minmax(0,1fr)_auto]'>
									<span className='tabular-nums text-[var(--ink-3)]'>
										{h.from ? monthYear(h.from) : h.first_seen ? `By ${monthYear(h.first_seen)}` : '?'} –{' '}
										{h.to ? monthYear(h.to) : h.former ? (h.last_seen ? `at least ${monthYear(h.last_seen)}` : 'undated') : 'now'}
									</span>
									<span>
										<span className='font-semibold'>{h.name}</span>
										<span className='text-[var(--ink-2)]'>, {h.title}</span>
									</span>
									<a href={h.source} target='_blank' rel='noreferrer' className='inline-flex items-center gap-0.5 text-[12px] text-[var(--ink-3)] hover:text-[var(--accent)]'>
										Source <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
									</a>
								</li>
							))}
						</ol>
					) : (
						<p className='mt-3 text-[13.5px] text-[var(--ink-3)]'>No dated list of past heads found yet.</p>
					)}
					<p className='mt-3 text-[12.5px] text-[var(--ink-3)]'>
						Read with the office’s{' '}
						<a href={budgetHref(o)} className={linkClass}>
							budget
						</a>
						, a tenure says who ran the office when its money was spent.
					</p>
				</section>

				{attached.length ? (
					<section aria-labelledby='attached' className='mt-14'>
						<h2 id='attached' className='text-[20px] font-extrabold'>
							Attached offices
						</h2>
						<ul className='mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[14px]'>
							{attached.map((a) => (
								<li key={a.slug}>
									<Link scroll={false} href={`/directory/office/${a.slug}`} className={linkClass}>
										{a.name}
									</Link>
								</li>
							))}
						</ul>
					</section>
				) : null}

				<p className='mt-16 max-w-3xl text-[12.5px] leading-[1.7] text-[var(--ink-3)]'>{directoryMeta.note}</p>
			</section>
		</DirectoryDialog>
	)
}
