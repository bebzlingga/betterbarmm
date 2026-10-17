import { ArrowUpRightIcon, EnvelopeSimpleIcon, FacebookLogoIcon, GlobeIcon, MagnifyingGlassIcon, MapPinIcon, PhoneIcon, SirenIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'
import { directoryMeta, directoryOffices, hotlines, localGovernments, telHref } from '../_lib/directory'
import { pageMeta } from '../_lib/seo'

export const metadata: Metadata = pageMeta({
	title: 'Directory',
	description:
		'Who heads each office of the Bangsamoro Government, with its phone numbers, emails and address, and the governors and mayors of every province, city and town in BARMM.',
	path: '/directory',
})

const GROUPS = [
	{ kinds: ['office', 'ministry'], title: 'The Chief Minister’s office and the ministries' },
	{ kinds: ['attached'], title: 'Attached offices, authorities and commissions' },
] as const

/** "2026-08" or "2026-08-14" as "August 2026". */
const asOf = (d: string | null) => {
	if (!d) return null
	const [y, m] = d.split('-').map(Number)
	return m ? new Date(Date.UTC(y!, m - 1, 1)).toLocaleDateString('en-PH', { month: 'long', year: 'numeric', timeZone: 'UTC' }) : String(y)
}

const linkClass = 'underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]'

function Phone({ number }: { number: string }) {
	return (
		<li className='flex gap-2'>
			<PhoneIcon size={15} className='mt-1 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
			<a href={telHref(number)} className={`tabular-nums ${linkClass}`}>
				{number}
			</a>
		</li>
	)
}

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
	const { q = '' } = await searchParams
	const term = q.trim().toLowerCase()
	const has = (...parts: (string | null | undefined)[]) => !term || parts.some((p) => p?.toLowerCase().includes(term))

	const offices = directoryOffices.filter((o) => has(o.name, o.acronym, o.head?.name, o.head?.title))
	const locals = localGovernments
		.map((g) => {
			const all = has(g.name, g.governor, g.viceGovernor)
			return { ...g, units: all ? g.units : g.units.filter((u) => has(u.name, u.head, u.deputy)), shown: all }
		})
		.filter((g) => g.shown || g.units.length)

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='directory' />

			<Masthead brand lines={['Directory']} />

			<section className='bb-container bb-section'>
				<form role='search' className='flex flex-col gap-3 sm:flex-row sm:items-end'>
					<label className='flex min-w-0 flex-1 flex-col gap-1'>
						<span className='text-[12px] text-[var(--ink-3)]'>Search</span>
						<span className='flex h-11 items-center gap-3 border border-[var(--rule)] bg-[var(--paper-2)] px-3 focus-within:border-[var(--ink)]'>
							<MagnifyingGlassIcon size={16} className='shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
							<input name='q' defaultValue={q} placeholder='An office, a minister, a town or a mayor' className='min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[var(--ink-mute)]' />
						</span>
					</label>
					<button type='submit' className='h-11 cursor-pointer bg-[var(--ink)] px-5 text-[14px] font-semibold text-[var(--paper)] hover:bg-[var(--accent)]'>
						Search
					</button>
					{term ? (
						<Link href='/directory' className={`flex h-11 items-center px-2 text-[13.5px] font-semibold ${linkClass}`}>
							Show everything
						</Link>
					) : null}
				</form>

				{hotlines.length && !term ? (
					<section aria-labelledby='hotlines' className='mt-10 border border-[var(--rule)] bg-[var(--paper-2)] p-5'>
						<h2 id='hotlines' className='flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
							<SirenIcon size={16} weight='fill' className='text-[var(--accent)]' aria-hidden='true' /> Hotlines
						</h2>
						<ul className='mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3'>
							{hotlines.map((h) => (
								<li key={h.name + h.number} className='text-[14px]'>
									<span className='block text-[var(--ink-2)]'>{h.name}</span>
									<a href={telHref(h.number)} className='text-[16px] font-bold tabular-nums hover:text-[var(--accent)]'>
										{h.number}
									</a>
								</li>
							))}
						</ul>
					</section>
				) : null}

				<section id='regional' aria-labelledby='regional-title' className='mt-14 scroll-mt-[calc(var(--site-header-h)+1rem)]'>
					<h2 id='regional-title' className='text-[24px] font-extrabold tracking-[-0.01em]'>
						Regional government
					</h2>
					{offices.length ? (
						GROUPS.map((g) => {
							const list = offices.filter((o) => (g.kinds as readonly string[]).includes(o.kind))
							if (!list.length) return null
							return (
								<div key={g.title} className='mt-8'>
									<h3 className='text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
										{g.title} <span className='text-[var(--ink-mute)]'>{list.length}</span>
									</h3>
									<ul className='mt-4 divide-y divide-[var(--rule-soft)] border-y border-[var(--rule)]'>
										{list.map((o) => (
											<li key={o.slug} id={o.slug} className='grid scroll-mt-[calc(var(--site-header-h)+1rem)] gap-4 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]'>
												<div className='min-w-0'>
													{o.acronym ? <p className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>{o.acronym}</p> : null}
													<p className='text-[16px] font-bold leading-snug'>{o.name}</p>
													{o.head ? (
														<p className='mt-2 text-[14px] leading-6'>
															<span className='font-semibold'>{o.head.name}</span>
															<span className='text-[var(--ink-2)]'>, {o.head.title}</span>
															<a href={o.head.source} target='_blank' rel='noreferrer' className='ml-2 inline-flex items-center gap-0.5 text-[12px] text-[var(--ink-3)] hover:text-[var(--accent)]'>
																{asOf(o.head.as_of) ? `as of ${asOf(o.head.as_of)}` : 'source'}
																<ArrowUpRightIcon size={11} weight='bold' aria-hidden='true' />
															</a>
														</p>
													) : (
														<p className='mt-2 text-[13.5px] text-[var(--ink-3)]'>Head not named in an official source we could read.</p>
													)}
												</div>
												<ul className='min-w-0 space-y-1.5 text-[13.5px] leading-6'>
													{/* The first three numbers; an office with provincial lines keeps the rest one click away. */}
													{o.phones.slice(0, 3).map((p) => (
														<Phone key={p} number={p} />
													))}
													{o.phones.length > 3 ? (
														<li>
															<details className='group'>
																<summary className='cursor-pointer list-none pl-[23px] text-[13px] font-semibold text-[var(--ink-2)] hover:text-[var(--accent)] [&::-webkit-details-marker]:hidden'>
																	{o.phones.length - 3} more {o.phones.length - 3 === 1 ? 'number' : 'numbers'}
																</summary>
																<ul className='mt-1.5 space-y-1.5'>
																	{o.phones.slice(3).map((p) => (
																		<Phone key={p} number={p} />
																	))}
																</ul>
															</details>
														</li>
													) : null}
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
													{o.website || o.facebook ? (
														<li className='flex flex-wrap gap-x-4 gap-y-1 pt-0.5'>
															{o.website ? (
																<a href={o.website} target='_blank' rel='noreferrer' className={`inline-flex items-center gap-1.5 ${linkClass}`}>
																	<GlobeIcon size={15} className='text-[var(--ink-3)]' aria-hidden='true' /> Website
																</a>
															) : null}
															{o.facebook ? (
																<a href={o.facebook} target='_blank' rel='noreferrer' className={`inline-flex items-center gap-1.5 ${linkClass}`}>
																	<FacebookLogoIcon size={15} className='text-[var(--ink-3)]' aria-hidden='true' /> Facebook
																</a>
															) : null}
														</li>
													) : null}
													{!o.phones.length && !o.emails.length && !o.address ? <li className='text-[var(--ink-3)]'>No public number or email found.</li> : null}
												</ul>
											</li>
										))}
									</ul>
								</div>
							)
						})
					) : (
						<p className='mt-4 text-[14px] text-[var(--ink-3)]'>No office matches.</p>
					)}
				</section>

				<section id='local' aria-labelledby='local-title' className='mt-16 scroll-mt-[calc(var(--site-header-h)+1rem)]'>
					<h2 id='local-title' className='text-[24px] font-extrabold tracking-[-0.01em]'>
						Local governments
					</h2>
					<p className='mt-1 max-w-3xl text-[13.5px] leading-6 text-[var(--ink-3)]'>
						Who won each office in COMELEC’s canvass of the May 2025 elections, for the 2025–2028 term. A succession since then is not shown; each place’s page has its full council and history.
					</p>
					{locals.length ? (
						<div className='mt-8 space-y-10'>
							{locals.map((g) => (
								<section key={g.name} aria-label={g.name}>
									<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[var(--ink)] pb-2'>
										<h3 className='text-[18px] font-bold'>
											<a href={g.href} className='hover:text-[var(--accent)]'>
												{g.name}
											</a>
										</h3>
										{g.governor ? (
											<p className='text-[13.5px] text-[var(--ink-2)]'>
												Governor <span className='font-semibold text-[var(--ink)]'>{g.governor}</span>
												{g.viceGovernor ? (
													<>
														{' '}
														· Vice governor <span className='font-semibold text-[var(--ink)]'>{g.viceGovernor}</span>
													</>
												) : null}
											</p>
										) : null}
									</div>
									<table className='mt-1 w-full table-fixed border-collapse text-[13.5px]'>
										<thead className='sr-only sm:not-sr-only'>
											<tr className='text-left text-[10.5px] uppercase tracking-[0.1em] text-[var(--ink-3)]'>
												<th className='w-1/2 py-2 pr-4 font-semibold sm:w-1/3'>Town or city</th>
												<th className='w-1/2 py-2 pr-4 font-semibold sm:w-1/3'>Mayor</th>
												<th className='hidden py-2 pr-4 font-semibold sm:table-cell sm:w-1/3'>Vice mayor</th>
											</tr>
										</thead>
										<tbody>
											{g.units.map((u) => (
												<tr key={u.href} className='border-b border-[var(--rule-soft)] align-top'>
													<td className='py-2 pr-4'>
														<a href={u.href} className={linkClass}>
															{u.name}
														</a>
														{u.isCity ? <span className='ml-1.5 text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]'>City</span> : null}
													</td>
													<td className='py-2 pr-4'>{u.head ?? <span className='text-[var(--ink-mute)]'>Not in the canvass</span>}</td>
													<td className='hidden py-2 pr-4 text-[var(--ink-2)] sm:table-cell'>{u.deputy ?? '–'}</td>
												</tr>
											))}
										</tbody>
									</table>
								</section>
							))}
						</div>
					) : (
						<p className='mt-4 text-[14px] text-[var(--ink-3)]'>No town or official matches.</p>
					)}
				</section>

				<p className='mt-16 max-w-3xl text-[13px] leading-[1.7] text-[var(--ink-3)]'>
					{directoryMeta.note} A number that no longer works, or a head who has changed?{' '}
					<a href='/report' className={linkClass}>
						Tell us
					</a>
					.
				</p>
			</section>
		</main>
	)
}
