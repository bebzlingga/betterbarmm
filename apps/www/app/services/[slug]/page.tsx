import { ArrowSquareOutIcon, ArrowUpRightIcon, CaretDownIcon, CoinsIcon, EnvelopeSimpleIcon, GlobeIcon, MapPinIcon, PhoneIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Masthead } from '../../_components/masthead'
import { SiteHeader } from '../../_components/site-header'
import { pageMeta } from '../../_lib/seo'
import { audienceLabel, budgetHref, officeBySlug, offices, servicesMeta, shortName, slugify, type Audience } from '../../_lib/services'

export function generateStaticParams() {
	return offices.map((o) => ({ slug: o.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const office = officeBySlug((await params).slug)
	if (!office) return { title: 'Programs & services', robots: { index: false, follow: true } }
	return pageMeta({
		title: `${office.name} — Programs & services`,
		description: office.mandate ?? `What the ${office.name} offers the public, who it is for, and how to get it.`,
		path: `/services/${office.slug}`,
	})
}

const KIND = { office: 'Office of the Chief Minister', ministry: 'Ministry', attached: 'Attached office' } as const

function For({ list }: { list: Audience[] }) {
	if (!list.length) return null
	return (
		<p className='mt-2 flex flex-wrap gap-1.5'>
			{list.map((a) => (
				<Link key={a} href={`/services?for=${a}`} className='border border-[var(--rule)] px-2 py-0.5 text-[11.5px] text-[var(--ink-2)] hover:border-[var(--ink)]'>
					{audienceLabel(a)}
				</Link>
			))}
		</p>
	)
}

const Source = ({ url }: { url: string }) => (
	<a href={url} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1 text-[12px] text-[var(--ink-3)] underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]'>
		Source <ArrowUpRightIcon size={11} weight='bold' aria-hidden='true' />
	</a>
)

export default async function OfficePage({ params }: { params: Promise<{ slug: string }> }) {
	const office = officeBySlug((await params).slug)
	if (!office) notFound()
	const parent = office.parent ? officeBySlug(office.parent) : undefined
	const attached = offices.filter((o) => o.parent === office.slug)
	const c = office.contact

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='services' />

			<Masthead brand label={office.acronym ? `${KIND[office.kind]} · ${office.acronym}` : KIND[office.kind]} lines={[office.name]} standfirst={office.mandate ?? undefined}>
				<div className='flex flex-wrap gap-3'>
					{/* Fixed colours: inside the band, --paper and --ink are re-pointed to its crimson ground. */}
					{office.website ? (
						<a href={office.website} target='_blank' rel='noreferrer' className='inline-flex h-11 items-center gap-2 bg-white px-4 text-[14px] font-semibold text-[#191713] hover:bg-white/90'>
							<GlobeIcon size={16} aria-hidden='true' /> Official website
						</a>
					) : null}
					<a href={budgetHref(office)} className='inline-flex h-11 items-center gap-2 border border-white/40 px-4 text-[14px] font-semibold text-white hover:bg-white/10'>
						<CoinsIcon size={16} aria-hidden='true' /> Its budget
					</a>
				</div>
			</Masthead>

			<section className='bb-container bb-section'>
				<p className='text-[13.5px] text-[var(--ink-3)]'>
					<Link href='/services' className='underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'>
						All offices
					</Link>
					{parent ? (
						<>
							{' '}
							· Attached to the{' '}
							<Link href={`/services/${parent.slug}`} className='underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'>
								{parent.name}
							</Link>
						</>
					) : null}
				</p>

				<div className='mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]'>
					<div className='min-w-0 space-y-14'>
						<section aria-labelledby='programs'>
							<h2 id='programs' className='text-[22px] font-extrabold tracking-[-0.01em]'>
								Programs <span className='text-[var(--ink-mute)]'>{office.programs.length}</span>
							</h2>
							{office.programs.length ? (
								<ul className='mt-5 divide-y divide-[var(--rule-soft)] border-y border-[var(--rule)]'>
									{office.programs.map((p) => (
										<li key={p.name} id={`program-${slugify(p.name)}`} className='scroll-mt-[calc(var(--site-header-h)+1rem)] py-5'>
											<h3 className='text-[16.5px] font-bold leading-snug'>{p.name}</h3>
											<p className='mt-1.5 max-w-3xl text-[14.5px] leading-[1.65] text-[var(--ink-2)]'>{p.summary}</p>
											{p.how ? (
												<p className='mt-2 max-w-3xl text-[13.5px] leading-6'>
													<span className='font-semibold'>How to get it: </span>
													{p.how}
												</p>
											) : null}
											<For list={p.for} />
											<p className='mt-2'>
												<Source url={p.source} />
											</p>
										</li>
									))}
								</ul>
							) : (
								<p className='mt-4 text-[14px] text-[var(--ink-3)]'>No program found in the office’s published material yet.</p>
							)}
						</section>

						<section aria-labelledby='services'>
							<h2 id='services' className='text-[22px] font-extrabold tracking-[-0.01em]'>
								Services <span className='text-[var(--ink-mute)]'>{office.services.length}</span>
							</h2>
							<p className='mt-1 text-[13.5px] text-[var(--ink-3)]'>As the office’s Citizen’s Charter lists them: what to bring, what it costs, how long it takes.</p>
							{office.services.length ? (
								<ul className='mt-5 space-y-3'>
									{office.services.map((s) => (
										<li key={s.name} id={`service-${slugify(s.name)}`} className='scroll-mt-[calc(var(--site-header-h)+1rem)]'>
											<details className='group border border-[var(--rule)] open:border-[var(--ink)]'>
												<summary className='flex cursor-pointer list-none items-start justify-between gap-4 p-4 [&::-webkit-details-marker]:hidden'>
													<span className='min-w-0'>
														<span className='block text-[15.5px] font-semibold leading-snug'>{s.name}</span>
														<span className='mt-1 block text-[12.5px] text-[var(--ink-3)]'>
															{[s.fee && `Fee: ${s.fee}`, s.time && `Takes ${s.time}`].filter(Boolean).join(' · ') || 'Fee and time not stated'}
														</span>
													</span>
													<CaretDownIcon size={16} className='mt-1 shrink-0 transition group-open:rotate-180' aria-hidden='true' />
												</summary>
												<div className='border-t border-[var(--rule-soft)] px-4 pb-4 pt-3 text-[14px] leading-6'>
													{s.summary ? <p className='text-[var(--ink-2)]'>{s.summary}</p> : null}
													{s.requirements.length ? (
														<>
															<p className='mt-3 font-semibold'>What to bring</p>
															<ul className='mt-1 list-disc space-y-0.5 pl-5 text-[var(--ink-2)]'>
																{s.requirements.map((r) => (
																	<li key={r}>{r}</li>
																))}
															</ul>
														</>
													) : null}
													<dl className='mt-3 grid gap-x-6 gap-y-1 text-[13.5px] sm:grid-cols-[auto_1fr]'>
														{s.fee ? (
															<>
																<dt className='text-[var(--ink-3)]'>Fee</dt>
																<dd>{s.fee}</dd>
															</>
														) : null}
														{s.time ? (
															<>
																<dt className='text-[var(--ink-3)]'>Processing time</dt>
																<dd>{s.time}</dd>
															</>
														) : null}
														{s.where ? (
															<>
																<dt className='text-[var(--ink-3)]'>Where</dt>
																<dd>{s.where}</dd>
															</>
														) : null}
													</dl>
													<For list={s.for} />
													<p className='mt-3'>
														<Source url={s.source} />
													</p>
												</div>
											</details>
										</li>
									))}
								</ul>
							) : (
								<p className='mt-4 text-[14px] text-[var(--ink-3)]'>No Citizen’s Charter we could read was published online. Ask the office directly.</p>
							)}
						</section>
					</div>

					<aside className='space-y-10 lg:sticky lg:top-[calc(var(--site-header-h)+1.5rem)] lg:self-start'>
						{c && (c.address || c.phone || c.email) ? (
							<section>
								<h2 className='text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>Contact</h2>
								<ul className='mt-3 space-y-2.5 text-[13.5px] leading-6'>
									{c.address ? (
										<li className='flex gap-2'>
											<MapPinIcon size={16} className='mt-1 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
											{c.address}
										</li>
									) : null}
									{c.phone ? (
										<li className='flex gap-2'>
											<PhoneIcon size={16} className='mt-1 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
											{c.phone}
										</li>
									) : null}
									{c.email ? (
										<li className='flex gap-2'>
											<EnvelopeSimpleIcon size={16} className='mt-1 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
											<a href={`mailto:${c.email}`} className='break-all underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]'>
												{c.email}
											</a>
										</li>
									) : null}
								</ul>
							</section>
						) : null}

						{attached.length ? (
							<section>
								<h2 className='text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>Attached offices</h2>
								<ul className='mt-3 space-y-2 text-[13.5px] leading-6'>
									{attached.map((a) => (
										<li key={a.slug}>
											<Link href={`/services/${a.slug}`} className='underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]'>
												{a.name}
											</Link>
										</li>
									))}
								</ul>
							</section>
						) : null}

						{office.sources.length ? (
							<section>
								<h2 className='text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>Sources</h2>
								<ul className='mt-3 space-y-2 text-[12.5px] leading-[1.6] text-[var(--ink-2)]'>
									{office.sources.map((s) => (
										<li key={s.url}>
											<a href={s.url} target='_blank' rel='noreferrer' className='inline-flex items-start gap-1 hover:text-[var(--accent)]'>
												<span>{s.label}</span>
												<ArrowSquareOutIcon size={12} className='mt-1 shrink-0' aria-hidden='true' />
											</a>
										</li>
									))}
								</ul>
							</section>
						) : null}

						<p className='text-[12px] leading-[1.7] text-[var(--ink-3)]'>
							{servicesMeta.note} {shortName(office)} may have changed a requirement since; call ahead.
						</p>
					</aside>
				</div>
			</section>
		</main>
	)
}
