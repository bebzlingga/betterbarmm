import { ArrowRightIcon, EnvelopeSimpleIcon, PhoneIcon, SirenIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { linkClass } from './directory-bits'
import { DirectoryPlaces } from './directory-places'
import { DirectorySearch } from './directory-search'
import { members } from '../_lib/directory-index'
import { GetInvolved } from './get-involved'
import { SiteHeader } from './site-header'
import { barangayRows, directoryMeta, directoryOffices, hotlines, localGovernments, officeLogo, telHref } from '../_lib/directory'


const GROUPS = [
	{ kinds: ['office', 'ministry'], title: 'The Chief Minister’s office and the ministries' },
	{ kinds: ['attached'], title: 'Attached offices, authorities and commissions' },
] as const

/** An office's logo on the card's ground, or its acronym where no logo has been found. */
function OfficeLogo({ slug, acronym }: { slug: string; acronym: string | null }) {
	const logo = officeLogo(slug)
	return logo ? (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={logo.src} alt='' title={`Logo: ${logo.credit}`} loading='lazy' className='size-full bg-[var(--paper-2)] object-contain! p-3' />
	) : (
		<span aria-hidden='true' className='grid size-full place-items-center bg-[var(--paper-2)] font-mono text-[11px] font-bold text-[var(--ink-3)] sm:text-[18px]'>
			{(acronym ?? '').slice(0, 5)}
		</span>
	)
}

const sectionHead = 'flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'
const eyebrow = 'font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em]'

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
						<p className='mx-auto mt-4 max-w-xl text-[15px] leading-7 text-[var(--ink-2)]'>
							{directoryOffices.length} regional offices, {localGovernments.length} provinces and areas, {towns} towns and cities, {barangays.toLocaleString('en-PH')} barangays and the {members.length} Members of Parliament.
						</p>
					</>
				}
			>
				<div className='bb-container py-14 lg:py-20'>
					{hotlines.length ? (
						<section id='hotlines' aria-labelledby='hotlines-title' className='scroll-mt-[calc(var(--site-header-h)+1rem)]'>
							{/* As many columns as there are panels, up to three, so no empty cell shows the rule colour. */}
							<div className={`grid gap-px overflow-hidden border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2 ${hotlines.length + 1 >= 3 ? 'lg:grid-cols-3' : ''}`}>
								<div className='flex items-center gap-3 bg-[#8f2328] p-5 text-white'>
									<SirenIcon size={26} weight='fill' aria-hidden='true' />
									<div>
										<h2 id='hotlines-title' className='text-[17px] font-extrabold'>
											In an emergency, call 911
										</h2>
										<p className='text-[13px] text-white/80'>Each town’s police, fire and health lines are on its page.</p>
									</div>
								</div>
								{hotlines.map((h) => (
									<a key={h.name + h.number} href={telHref(h.number)} className='group bg-[var(--paper)] p-5 transition hover:bg-[var(--paper-2)]'>
										<span className='block text-[13px] leading-5 text-[var(--ink-2)]'>{h.name}</span>
										<span className='mt-1 inline-flex items-center gap-2 text-[18px] font-bold tabular-nums group-hover:text-[var(--accent)]'>
											<PhoneIcon size={16} weight='bold' aria-hidden='true' /> {h.number}
										</span>
									</a>
								))}
							</div>
						</section>
					) : null}

					<section id='regional' aria-labelledby='regional-title' className='mt-16 scroll-mt-[calc(var(--site-header-h)+1rem)]'>
						<div className={sectionHead}>
							<h2 id='regional-title' className='text-[26px] font-extrabold tracking-[-0.02em]'>
								Regional government
							</h2>
							<p className='text-[13.5px] text-[var(--ink-3)]'>Each office’s page has every number, email and address, its past heads and its offices in the provinces.</p>
						</div>
						{GROUPS.map((g) => {
							const list = directoryOffices.filter((o) => (g.kinds as readonly string[]).includes(o.kind))
							return (
								<div key={g.title} className='mt-8'>
									<h3 className={`${eyebrow} text-[var(--ink-3)]`}>
										{g.title} <span className='text-[var(--ink-mute)]'>· {list.length}</span>
									</h3>
									{/* A list on a phone, cards from a tablet up. */}
									<ul className='mt-3 grid border-t border-[var(--rule)] sm:mt-4 sm:grid-cols-2 sm:gap-4 sm:border-t-0 lg:grid-cols-3 xl:grid-cols-4'>
										{list.map((o) => (
											<li key={o.slug} className='bb-frame relative flex min-w-0 gap-4 border-b border-[var(--rule-soft)] bg-transparent! py-3 sm:flex-col sm:gap-0 sm:overflow-hidden sm:border sm:border-[var(--rule)] sm:py-0'>
												<span className='relative size-16 shrink-0 overflow-hidden sm:h-32 sm:w-full'>
													<OfficeLogo slug={o.slug} acronym={o.acronym} />
												</span>
												<div className='min-w-0 flex-1 sm:p-4'>
													<p>
														<Link scroll={false} href={`/directory/office/${o.slug}`} className='text-[15.5px] font-bold leading-snug hover:text-[var(--accent)]'>
															{o.name}
														</Link>
													</p>
													<p className='mt-0.5 truncate text-[13.5px]'>
														{o.head ? (
															<>
																<span className='text-[var(--ink-3)]'>{o.head.title.replace(/\s*\(.*\)$/, '')}</span> <span className='font-semibold text-[var(--ink)]'>{o.head.name}</span>
															</>
														) : (
															<span className='text-[var(--ink-3)]'>Head not named in an official source</span>
														)}
													</p>
													{o.phones[0] ? (
														<p className='mt-2 truncate text-[12.5px]'>
															<a href={telHref(o.phones[0])} className='inline-flex items-center gap-1.5 hover:text-[var(--accent)]'>
																<PhoneIcon size={12} className='shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
																<span className='font-semibold tabular-nums'>{o.phones[0]}</span>
																{o.phones.length > 1 ? <span className='text-[var(--ink-mute)]'>+{o.phones.length - 1}</span> : null}
															</a>
														</p>
													) : null}
													{o.emails[0] ? (
														<p className={`${o.phones[0] ? 'mt-0.5' : 'mt-2'} truncate text-[12.5px]`}>
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

					<section id='local' aria-labelledby='local-title' className='mt-20 scroll-mt-[calc(var(--site-header-h)+1rem)]'>
						<div className={sectionHead}>
							<h2 id='local-title' className='text-[26px] font-extrabold tracking-[-0.02em]'>
								Provinces and towns
							</h2>
							<p className='max-w-xl text-[13.5px] text-[var(--ink-3)]'>Winners of COMELEC’s canvass of the May 2025 elections, for 2025–2028. Each town’s page has its emergency lines and barangay officials.</p>
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
								<span id='mps-title' className='mt-1 block text-[22px] font-extrabold tracking-[-0.02em] group-hover:text-[var(--accent)]'>
									The {members.length} Members of Parliament
								</span>
								<span className='mt-1 block text-[13.5px] text-[var(--ink-3)]'>Elected on 14 September 2026, by district, party, sector and indigenous peoples’ seat.</span>
							</span>
							<span className='inline-flex shrink-0 items-center gap-2 text-[14px] font-semibold'>
								See them all <ArrowRightIcon size={15} weight='bold' className='transition group-hover:translate-x-0.5' aria-hidden='true' />
							</span>
						</Link>
					</section>

					<p className='mt-16 text-[13px] leading-[1.7] text-[var(--ink-3)]'>
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
