import { ArrowRightIcon, CaretDownIcon, PhoneIcon, SirenIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { linkClass } from '../_components/directory-bits'
import { DirectorySearch } from '../_components/directory-search'
import { members } from '../_lib/directory-index'
import { GetInvolved } from '../_components/get-involved'
import { SiteHeader } from '../_components/site-header'
import { barangayRows, directoryMeta, directoryOffices, hotlines, localGovernments, telHref } from '../_lib/directory'
import { pageMeta } from '../_lib/seo'

export const metadata: Metadata = pageMeta({
	title: 'Directory',
	description:
		'Who heads each office of the Bangsamoro Government and how to reach it, every governor, mayor and punong barangay in BARMM, and the 80 Members of Parliament, in one searchable directory.',
	path: '/directory',
})

const GROUPS = [
	{ kinds: ['office', 'ministry'], title: 'The Chief Minister’s office and the ministries' },
	{ kinds: ['attached'], title: 'Attached offices, authorities and commissions' },
] as const

const sectionHead = 'flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'
const eyebrow = 'font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em]'

export default function DirectoryPage() {
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
							<div className={`grid gap-px overflow-hidden rounded-[6px] border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2 ${hotlines.length + 1 >= 3 ? 'lg:grid-cols-3' : ''}`}>
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
									<ul className='mt-3 grid border-t border-[var(--rule)] sm:mt-4 sm:grid-cols-2 sm:gap-4 sm:border-t-0 lg:grid-cols-3'>
										{list.map((o) => (
											<li key={o.slug}>
												<Link
													href={`/directory/office/${o.slug}`}
													className='group flex h-full flex-col border-b border-[var(--rule-soft)] py-3 transition sm:rounded-[6px] sm:border sm:border-[var(--rule)] sm:p-5 sm:hover:border-[var(--ink)] sm:hover:shadow-[0_14px_30px_-22px_rgba(0,0,0,0.5)]'
												>
													<span className='hidden items-start justify-between gap-3 sm:flex'>
														<span className={`${eyebrow} text-[var(--accent)]`}>{o.acronym ?? (o.kind === 'attached' ? 'Office' : 'Ministry')}</span>
														<ArrowRightIcon size={14} className='mt-0.5 shrink-0 text-[var(--ink-mute)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]' aria-hidden='true' />
													</span>
													<span className='text-[15px] font-bold leading-snug group-hover:text-[var(--accent)] sm:mt-2 sm:text-[15.5px]'>{o.name}</span>
													<span className='mt-auto pt-0.5 text-[13.5px] leading-5 sm:pt-4'>
														{o.head ? (
															<>
																<span className='font-semibold sm:block'>{o.head.name}</span>
																<span className='text-[var(--ink-3)] sm:block'>
																	<span className='sm:hidden'>, </span>
																	{o.head.title}
																</span>
															</>
														) : (
															<span className='block text-[var(--ink-3)]'>Head not named in an official source</span>
														)}
														{o.phones[0] ? (
															<span className='mt-2 hidden items-center gap-1.5 tabular-nums text-[var(--ink-2)] sm:flex'>
																<PhoneIcon size={13} aria-hidden='true' /> {o.phones[0]}
																{o.phones.length > 1 ? <span className='text-[var(--ink-mute)]'>+{o.phones.length - 1}</span> : null}
															</span>
														) : null}
													</span>
												</Link>
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
						<ul className='mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
							{localGovernments.map((g) => (
								<li key={g.slug} className='flex flex-col rounded-[6px] border border-[var(--rule)] p-5'>
									<p className={`${eyebrow} text-[var(--accent)]`}>{g.kind}</p>
									<Link href={g.href} className='mt-1 text-[19px] font-extrabold tracking-[-0.01em] hover:text-[var(--accent)]'>
										{g.name}
									</Link>
									{g.governor ? (
										<p className='mt-3 text-[13.5px] leading-5'>
											<span className='text-[var(--ink-3)]'>Governor</span> <span className='font-semibold'>{g.governor}</span>
											{g.viceGovernor ? (
												<span className='block'>
													<span className='text-[var(--ink-3)]'>Vice governor</span> {g.viceGovernor}
												</span>
											) : null}
										</p>
									) : g.units.length === 1 && g.units[0]!.head ? (
										<p className='mt-3 text-[13.5px] leading-5'>
											<span className='text-[var(--ink-3)]'>Mayor</span> <span className='font-semibold'>{g.units[0]!.head}</span>
										</p>
									) : null}
									{g.units.length > 1 ? (
										<details className='group mt-auto pt-4'>
											<summary className='flex cursor-pointer list-none items-center justify-between border-t border-[var(--rule-soft)] pt-3 text-[13.5px] font-semibold text-[var(--ink-2)] hover:text-[var(--accent)] [&::-webkit-details-marker]:hidden'>
												{g.units.length} towns and cities
												<CaretDownIcon size={14} className='transition group-open:rotate-180' aria-hidden='true' />
											</summary>
											<ul className='mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13.5px]'>
												{g.units.map((u) => (
													<li key={u.slug} className='min-w-0 truncate'>
														<Link href={u.href} className={linkClass}>
															{u.name}
														</Link>
													</li>
												))}
											</ul>
										</details>
									) : (
										<Link href={g.units[0]?.href ?? g.href} className={`mt-auto pt-4 text-[13.5px] font-semibold ${linkClass}`}>
											Its page, lines and barangays
										</Link>
									)}
								</li>
							))}
						</ul>
					</section>

					<section aria-labelledby='mps-title' className='mt-20'>
						<Link
							href='/directory/parliament'
							className='group flex flex-col gap-4 rounded-[6px] border border-[var(--rule)] bg-[var(--paper-2)] p-6 transition hover:border-[var(--ink)] sm:flex-row sm:items-center sm:justify-between'
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

					<p className='mt-16 max-w-3xl text-[13px] leading-[1.7] text-[var(--ink-3)]'>
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
