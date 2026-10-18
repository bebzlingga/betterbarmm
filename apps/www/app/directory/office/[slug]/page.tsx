import { ArrowUpRightIcon, CoinsIcon, EnvelopeSimpleIcon, FacebookLogoIcon, GlobeIcon, MapPinIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DirectoryHead, Phone, linkClass, monthYear } from '../../../_components/directory-bits'
import { DirectoryDialog } from '../../../_components/directory-dialog'
import { directoryMeta, directoryOffice, directoryOffices, fieldOffices, headPhoto, officeHistory, officeLogo, officePhoto, officeStructure } from '../../../_lib/directory'
import { OfficeStructure, OrgNote } from '../../../_components/office-structure'
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
	const org = officeStructure(o.slug)
	const logo = officeLogo(o.slug)

	return (
		<DirectoryDialog id={o.slug} name={o.name}>
			<DirectoryHead
				label={o.acronym ? `${KIND[o.kind]} · ${o.acronym}` : KIND[o.kind]}
				name={o.name}
				photo={building ? { src: building.src, alt: building.caption, credit: { credit: building.credit, license: building.license, source: building.page } } : null}
				logo={logo ? { src: logo.src, alt: `${o.name} logo`, title: `Logo: ${logo.credit}` } : null}
			/>

			<section className='bb-container bb-section'>
				{parent ? (
					<p className='mb-8 text-[13.5px] text-[var(--ink-3)]'>
						Attached to the{' '}
						<Link scroll={false} href={`/directory/office/${parent.slug}`} className={linkClass}>
							{parent.name}
						</Link>
					</p>
				) : null}

				{/* Two columns from a laptop up: who heads it and how to reach it (35%), beside the right (65%):
				    how it is organized, its offices in the provinces and its past heads. */}
				<div className='grid gap-12 lg:grid-cols-[minmax(0,35fr)_minmax(0,65fr)] lg:gap-24'>
					<aside className='space-y-10'>
					<div>
						<p className='mb-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]'>Head of office</p>
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
					</div>

					<div>
						<p className='mb-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]'>How to reach it</p>
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

					<div>
						<p className='mb-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]'>Its budget</p>
						<ul className='mt-2 space-y-1.5 text-[14px] leading-6'>
							<li className='flex gap-2'>
								<CoinsIcon size={15} className='mt-1 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
								<a href={budgetHref(o)} className={linkClass}>
									Year by year, in the Budget workspace
								</a>
							</li>
						</ul>
					</div>
					</aside>

					<div className='min-w-0 [&>*:first-child]:mt-0'>

				{org ? <OfficeStructure org={org} /> : null}

				{field.length ? (
					<section aria-labelledby='field' className='mt-14'>
						<h2 id='field' className='text-[20px] font-extrabold'>
							In the provinces <span className='text-[var(--ink-mute)]'>{field.length}</span>
						</h2>
						{/* A list, as the past heads are: where, which office and who heads it, its numbers, its source. */}
						<ul className='mt-3 divide-y divide-[var(--rule-soft)] border-y border-[var(--rule)] text-[14px]'>
							{field.map((f) => (
								<li key={f.office} className='grid gap-x-4 gap-y-1 py-3 sm:grid-cols-[9rem_minmax(0,1fr)_auto]'>
									<span className='pt-1 font-mono text-[10.5px] font-semibold uppercase leading-[1.35] tracking-[0.14em] text-[var(--accent)]'>{f.province}</span>
									<div className='min-w-0'>
										<p className='font-semibold leading-snug'>{f.office}</p>
										{f.head ? (
											<p className='mt-0.5 text-[13.5px] text-[var(--ink-2)]'>
												{f.head.name}, {f.head.title}
											</p>
										) : null}
										{f.address ? <p className='mt-0.5 text-[13px] text-[var(--ink-3)]'>{f.address}</p> : null}
										{f.phones.length || f.emails?.length ? (
											<ul className='mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[13.5px]'>
												{f.phones.map((p) => (
													<Phone key={p} number={p} />
												))}
												{f.emails?.map((e) => (
													<li key={e} className='flex gap-2'>
														<EnvelopeSimpleIcon size={15} className='mt-1 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
														<a href={`mailto:${e}`} className={`break-all ${linkClass}`}>
															{e}
														</a>
													</li>
												))}
											</ul>
										) : null}
									</div>
									<a href={f.source} target='_blank' rel='noreferrer' className='inline-flex items-center gap-0.5 self-start text-[12px] leading-6 text-[var(--ink-3)] hover:text-[var(--accent)]'>
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
										{h.to ? monthYear(h.to) : h.former ? (h.last_seen ? `at least ${monthYear(h.last_seen)}` : 'undated') : 'Present'}
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
					<p className='mt-3 text-[12.5px] text-[var(--ink-mute)] opacity-70'>
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

					</div>
				</div>

				{/* Where it all came from, as a section of its own under the two columns. */}
				<section aria-labelledby='read' className='mt-16'>
					<h2 id='read' className='mb-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]'>
						How this was read
					</h2>
					<div className='mt-2 space-y-2 text-[12.5px] leading-[1.7] text-[var(--ink-mute)]'>
						{org ? <OrgNote org={org} /> : null}
						<p>{directoryMeta.note}</p>
					</div>
				</section>
			</section>
		</DirectoryDialog>
	)
}
