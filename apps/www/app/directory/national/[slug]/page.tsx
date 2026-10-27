import { ArrowUpRightIcon, EnvelopeSimpleIcon, FacebookLogoIcon, GlobeIcon, MapPinIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DirectoryHead, Phone, linkClass, monthYear } from '../../../_components/directory-bits'
import { DirectoryDialog } from '../../../_components/directory-dialog'
import { nationalMeta, nationalOffice, nationalOffices } from '../../../_lib/directory'
import { nationalLogo } from '../../../_lib/images'
import { pageMeta } from '../../../_lib/seo'

/* A national agency's office in the region, opened over the Directory as a ministry's is: what a reader goes
   there for, who heads it where a source names them, how to reach it, and where each line came from. */

export function generateStaticParams() {
	return nationalOffices.map((o) => ({ slug: o.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const o = nationalOffice((await params).slug)
	if (!o) return { title: 'Directory', robots: { index: false, follow: true } }
	return pageMeta({
		title: `${o.office} — Directory`,
		description: `${o.office}: ${o.for.toLowerCase()}. How to reach it, from official sources.`,
		path: `/directory/national/${o.slug}`,
	})
}

const label = 'mb-1.5 font-mono text-[0.65625rem] font-bold uppercase tracking-[0.14em] text-[var(--ink)]'

export default async function NationalOfficePage({ params }: { params: Promise<{ slug: string }> }) {
	const o = nationalOffice((await params).slug)
	if (!o) notFound()
	const logo = nationalLogo(o.slug)

	return (
		<DirectoryDialog id={`national-${o.slug}`} name={o.office}>
			<DirectoryHead
				label={`National agency · ${o.acronym}`}
				name={o.office}
				photo={null}
				logo={logo ? { src: logo.src, alt: `${o.agency} logo`, title: `Logo: ${logo.credit}` } : null}
			/>

			<section className='bb-container py-14 lg:py-20'>
				<div className='grid gap-12 lg:grid-cols-[minmax(0,35fr)_minmax(0,65fr)] lg:gap-20 xl:gap-24'>
					<aside className='space-y-8'>
						<div>
							<p className={label}>What it is for</p>
							<p className='text-[0.9375rem] leading-7 text-[var(--ink-2)]'>{o.for}</p>
							<p className='mt-1 text-[0.8125rem] text-[var(--ink-3)]'>{o.agency}</p>
						</div>

						{o.head ? (
							<div>
								<p className={label}>Head of office</p>
								<p className='text-[1.125rem] font-extrabold tracking-[-0.01em]'>{o.head.name}</p>
								<p className='text-[0.84375rem] text-[var(--ink-2)]'>{o.head.title}</p>
								<a href={o.head.source} target='_blank' rel='noreferrer' className='mt-1 inline-flex items-center gap-0.5 text-[0.75rem] text-[var(--ink-3)] hover:text-[var(--accent)]'>
									{o.head.as_of ? `As of ${monthYear(o.head.as_of)}` : 'Source'} <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
								</a>
							</div>
						) : null}

						<div>
							<p className={label}>How to reach it</p>
							<ul className='mt-2 space-y-1.5 text-[0.875rem] leading-6'>
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
								{!o.phones.length && !o.emails.length ? <li className='text-[var(--ink-3)]'>No number or email found in an official source.</li> : null}
							</ul>
						</div>
					</aside>

					<div className='min-w-0 space-y-8'>
						{o.note ? (
							<div className='border-l-2 border-[var(--accent)] pl-5'>
								<p className={label}>Good to know</p>
								<p className='text-[0.9375rem] leading-7 text-[var(--ink-2)]'>{o.note}</p>
							</div>
						) : null}

						<section aria-labelledby='sources'>
							<h2 id='sources' className='text-[1.25rem] font-extrabold'>
								Sources
							</h2>
							<ul className='mt-3 divide-y divide-[var(--rule-soft)] border-y border-[var(--rule)] text-[0.875rem]'>
								{o.sources.map((src) => (
									<li key={src.url} className='py-3'>
										<a href={src.url} target='_blank' rel='noreferrer' className='inline-flex items-start gap-1 hover:text-[var(--accent)]'>
											<span>{src.label}</span>
											<ArrowUpRightIcon size={11} weight='bold' className='mt-1.5 shrink-0' aria-hidden='true' />
										</a>
									</li>
								))}
							</ul>
							<p className='mt-3 text-[0.78125rem] leading-[1.65] text-[var(--ink-3)]'>{nationalMeta.note}</p>
						</section>
					</div>
				</div>
			</section>
		</DirectoryDialog>
	)
}
