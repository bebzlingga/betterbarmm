import { ArrowRightIcon, EnvelopeSimpleIcon, PhoneIcon, SirenIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { linkClass } from './directory-bits'
import { DirectoryPlaces } from './directory-places'
import { DirectorySearch } from './directory-search'
import { members } from '../_lib/directory-index'
import { GetInvolved } from './get-involved'
import { SiteHeader } from './site-header'
import { barangayRows, directoryMeta, directoryOffices, hotlines, localGovernments, nationalMeta, nationalOffices, telHref } from '../_lib/directory'
import { nationalLogo, officeLogo } from '../_lib/images'
import { Emblem } from './emblem'


const GROUPS = [
	// The ministries lead under the section's own heading, so they take no label of their own.
	{ kinds: ['office', 'ministry'], title: null },
	{ kinds: ['attached'], title: 'Attached offices, authorities and commissions' },
] as const

const sectionHead = 'flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'
const eyebrow = 'font-mono text-[0.65625rem] font-semibold uppercase tracking-[0.14em]'

/** The directory's index. It lives in the directory's layout, so it stays underneath, scrolled where the reader
 * left it, while an office, a province or a town opens over it as a dialog. */
export function DirectoryIndex() {
	const towns = localGovernments.reduce((n, g) => n + g.units.length, 0)
	const barangays = localGovernments.reduce((n, g) => n + g.units.reduce((k, u) => k + barangayRows(g.slug, u.slug).length, 0), 0)

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='directory' />

			<DirectorySearch
				head={
					<>
						<p className='bb-label'>Who runs what, and how to reach them</p>
						<h1 className='bb-display-md mt-4 text-[var(--ink)]'>Directory</h1>
						<p className='mx-auto mt-4 max-w-xl text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
							{directoryOffices.length} regional offices, {localGovernments.length} provinces and areas, {towns} towns and cities, {barangays.toLocaleString('en-PH')} barangays and the {members.length} Members of Parliament.
						</p>
					</>
				}
			>
				<div className='bb-container py-14 lg:py-20'>
					{hotlines.length ? (
						<section id='hotlines' aria-labelledby='hotlines-title' className='scroll-mt-[calc(var(--site-header-h)+1rem)]'>
							{/* One crimson band: 911 first, then each hotline, with a hairline between them. */}
							<div className={`grid divide-y divide-white/20 bg-[#8f2328] text-white sm:grid-cols-2 sm:divide-x sm:divide-y-0 ${hotlines.length + 1 >= 3 ? 'lg:grid-cols-3' : ''}`}>
								<div className='flex items-center justify-center gap-3 p-5 text-center'>
									<SirenIcon size={26} weight='fill' aria-hidden='true' />
									<div>
										<h2 id='hotlines-title' className='text-[1.0625rem] font-extrabold'>
											In an emergency, call 911
										</h2>
										<p className='text-[0.8125rem] text-white/80'>Each town’s police, fire and health lines are on its page.</p>
									</div>
								</div>
								{hotlines.map((h) => (
									<a key={h.name + h.number} href={telHref(h.number)} className='group flex flex-col items-center justify-center p-5 text-center transition hover:bg-white/10'>
										<span className='block text-[0.8125rem] leading-5 text-white/80'>{h.name}</span>
										<span className='mt-1 inline-flex items-center gap-2 text-[1.125rem] font-bold tabular-nums'>
											<PhoneIcon size={16} weight='bold' aria-hidden='true' /> {h.number}
										</span>
									</a>
								))}
							</div>
						</section>
					) : null}

					<section id='regional' aria-labelledby='regional-title' className='mt-16 scroll-mt-[calc(var(--site-header-h)+1rem)]'>
						<div className={sectionHead}>
							<h2 id='regional-title' className='text-[1.625rem] font-extrabold tracking-[-0.02em]'>
								Regional government
							</h2>
							<p className='text-[0.84375rem] text-[var(--ink-3)]'>Each office’s page has every number, email and address, its past heads and its offices in the provinces.</p>
						</div>
						{GROUPS.map((g) => {
							const list = directoryOffices.filter((o) => (g.kinds as readonly string[]).includes(o.kind))
							return (
								<div key={g.kinds[0]} className={g.title ? 'mt-12' : 'mt-8'}>
									{g.title ? (
										<h3 className={`${eyebrow} text-[var(--ink-3)]`}>
											{g.title} <span className='text-[var(--ink-mute)]'>· {list.length}</span>
										</h3>
									) : null}
									{/* A list on a phone, cards from a tablet up. */}
									<ul className='mt-3 grid border-t border-[var(--rule)] sm:mt-4 sm:grid-cols-2 sm:gap-4 sm:border-t-0 lg:grid-cols-3 xl:grid-cols-4'>
										{list.map((o) => (
											<li key={o.slug} className='bb-frame relative flex min-w-0 gap-4 border-b border-[var(--rule-soft)] bg-transparent! py-3 sm:flex-col sm:gap-0 sm:overflow-hidden sm:border sm:border-[var(--rule)] sm:py-0'>
												<span className='relative size-14 shrink-0 overflow-hidden sm:h-24 sm:w-full'>
													<Emblem image={officeLogo(o.slug)} name={o.name} label={o.acronym} tile className='size-full text-[0.625rem] sm:text-[1rem]' />
												</span>
												<div className='min-w-0 flex-1 sm:p-4'>
													<p className='mb-1.5 text-[0.96875rem] leading-[1.2]'>
														<Link scroll={false} href={`/directory/office/${o.slug}`} className='font-bold hover:text-[var(--accent)]'>
															{o.name}
														</Link>
													</p>
													<p className='mt-0.5 truncate text-[0.84375rem]'>
														{o.head ? (
															<>
																<span className='text-[var(--ink-3)]'>{o.head.title.replace(/\s*\(.*\)$/, '')}</span> <span className='font-semibold text-[var(--ink)]'>{o.head.name}</span>
															</>
														) : (
															<span className='text-[var(--ink-3)]'>Head not named in an official source</span>
														)}
													</p>
													{o.phones[0] ? (
														<p className='mt-2 truncate text-[0.78125rem]'>
															<a href={telHref(o.phones[0])} className='inline-flex items-center gap-1.5 hover:text-[var(--accent)]'>
																<PhoneIcon size={12} className='shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
																<span className='font-semibold tabular-nums'>{o.phones[0]}</span>
																{o.phones.length > 1 ? <span className='text-[var(--ink-mute)]'>+{o.phones.length - 1}</span> : null}
															</a>
														</p>
													) : null}
													{o.emails[0] ? (
														<p className={`${o.phones[0] ? 'mt-0.5' : 'mt-2'} truncate text-[0.78125rem]`}>
															<a href={`mailto:${o.emails[0]}`} className='inline-flex max-w-full items-center gap-1.5 hover:text-[var(--accent)]'>
																<EnvelopeSimpleIcon size={12} className='shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
																<span className='truncate'>{o.emails[0]}</span>
															</a>
														</p>
													) : null}
												</div>
											</li>
										))}
									</ul>
								</div>
							)
						})}
					</section>

					{/* National agencies' offices in the region, carded as the ministries are; each opens a dialog with the rest. */}
					<section id='national' aria-labelledby='national-title' className='mt-20 scroll-mt-[calc(var(--site-header-h)+1rem)]'>
						<div className={sectionHead}>
							<h2 id='national-title' className='text-[1.625rem] font-extrabold tracking-[-0.02em]'>
								National offices in the region
							</h2>
							<p className='max-w-xl text-[0.84375rem] text-[var(--ink-3)]'>Where to go for a certificate, a contribution, a licence or a passport. Many publish little; an empty line is one no official source showed.</p>
						</div>
						<ul className='mt-3 grid border-t border-[var(--rule)] sm:mt-8 sm:grid-cols-2 sm:gap-4 sm:border-t-0 lg:grid-cols-3 xl:grid-cols-4'>
							{nationalOffices.map((o) => (
								<li key={o.slug} id={`national-${o.slug}`} className='bb-frame relative flex min-w-0 scroll-mt-[calc(var(--site-header-h)+1rem)] gap-4 border-b border-[var(--rule-soft)] bg-transparent! py-3 sm:flex-col sm:gap-0 sm:overflow-hidden sm:border sm:border-[var(--rule)] sm:py-0'>
									{/* The panel keeps the ministries' height; each logo sits in one small box inside it, so a wordmark and a seal read the same size. */}
									<span className='relative grid size-14 shrink-0 place-items-center overflow-hidden bg-[var(--paper-2)] sm:h-24 sm:w-full'>
										<Emblem image={nationalLogo(o.slug)} name={o.agency} label={o.acronym} className='h-9! w-11! text-[0.625rem] sm:h-12! sm:w-20! sm:text-[0.875rem]' />
									</span>
									<div className='min-w-0 flex-1 sm:p-4'>
										<p className='mb-1.5 text-[0.96875rem] leading-[1.2]'>
											<Link scroll={false} href={`/directory/national/${o.slug}`} className='font-bold hover:text-[var(--accent)]'>
												{o.office}
											</Link>
										</p>
										<p className='mt-0.5 truncate text-[0.84375rem]'>
											{o.head ? (
												<>
													<span className='text-[var(--ink-3)]'>{o.head.title}</span> <span className='font-semibold text-[var(--ink)]'>{o.head.name}</span>
												</>
											) : (
												<span className='text-[var(--ink-3)]'>Head not named in an official source</span>
											)}
										</p>
										{o.phones[0] ? (
											<p className='mt-2 truncate text-[0.78125rem]'>
												<a href={telHref(o.phones[0])} className='inline-flex items-center gap-1.5 hover:text-[var(--accent)]'>
													<PhoneIcon size={12} className='shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
													<span className='font-semibold tabular-nums'>{o.phones[0]}</span>
													{o.phones.length > 1 ? <span className='text-[var(--ink-mute)]'>+{o.phones.length - 1}</span> : null}
												</a>
											</p>
										) : null}
										{o.emails[0] ? (
											<p className={`${o.phones[0] ? 'mt-0.5' : 'mt-2'} truncate text-[0.78125rem]`}>
												<a href={`mailto:${o.emails[0]}`} className='inline-flex max-w-full items-center gap-1.5 hover:text-[var(--accent)]'>
													<EnvelopeSimpleIcon size={12} className='shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
													<span className='truncate'>{o.emails[0]}</span>
												</a>
											</p>
										) : null}
									</div>
								</li>
							))}
						</ul>
						<p className='mt-4 max-w-3xl text-[0.78125rem] leading-[1.65] text-[var(--ink-3)]'>{nationalMeta.note}</p>
					</section>

					<section id='local' aria-labelledby='local-title' className='mt-20 scroll-mt-[calc(var(--site-header-h)+1rem)]'>
						<div className={sectionHead}>
							<h2 id='local-title' className='text-[1.625rem] font-extrabold tracking-[-0.02em]'>
								Provinces and towns
							</h2>
							<p className='max-w-xl text-[0.84375rem] text-[var(--ink-3)]'>Winners of COMELEC’s canvass of the May 2025 elections, for 2025–2028. Each town’s page has its emergency lines and barangay officials.</p>
						</div>
						<DirectoryPlaces />
					</section>

					<section aria-labelledby='mps-title' className='mt-20'>
						<Link scroll={false}
							href='/directory/parliament'
							className='group flex flex-col gap-4 border border-[var(--rule)] bg-[var(--paper-2)] p-6 transition hover:border-[var(--ink)] sm:flex-row sm:items-center sm:justify-between'
						>
							<span>
								<span className={`${eyebrow} text-[var(--accent)]`}>Bangsamoro Parliament</span>
								<span id='mps-title' className='mt-1 block text-[1.375rem] font-extrabold tracking-[-0.02em] group-hover:text-[var(--accent)]'>
									The {members.length} Members of Parliament
								</span>
								<span className='mt-1 block text-[0.84375rem] text-[var(--ink-3)]'>Elected on 14 September 2026, by district, party, sector and indigenous peoples’ seat.</span>
							</span>
							<span className='inline-flex shrink-0 items-center gap-2 text-[0.875rem] font-semibold'>
								See them all <ArrowRightIcon size={15} weight='bold' className='transition group-hover:translate-x-0.5' aria-hidden='true' />
							</span>
						</Link>
					</section>

					<p className='mt-16 text-[0.8125rem] leading-[1.7] text-[var(--ink-3)]'>
						{directoryMeta.note} A number that no longer works, or a head who has changed?{' '}
						<a href='/report' className={linkClass}>
							Tell us
						</a>
						.
					</p>
				</div>
			</DirectorySearch>
			<GetInvolved />
		</main>
	)
}
