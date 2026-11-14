import { EnvelopeSimpleIcon, PhoneIcon, SirenIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { linkClass } from './directory-bits'
import { DirectoryPlaces } from './directory-places'
import { DirectorySearch } from './directory-search'
import { members } from '../_lib/directory-index'
import { GetInvolved } from './get-involved'
import { SiteHeader } from './site-header'
import { barangayRows, directoryMeta, memberId, directoryOffices, hotlines, localGovernments, nationalMeta, nationalOffices, telHref } from '../_lib/directory'
import { headPhoto, memberPortrait, nationalLogo, officeLogo } from '../_lib/images'
import { Emblem } from './emblem'
import { SwitchTabs } from './switch-tabs'


const GROUPS = [
	// The ministries lead under the section's own heading, so they take no label of their own.
	{ kinds: ['office', 'ministry'], title: null },
	{ kinds: ['attached'], title: 'Attached offices, authorities and commissions' },
] as const

/** The offices within an office, listed on its card rather than as cards of their own. */
const units = (slug: string) => directoryOffices.filter((o) => o.kind === 'unit' && o.parent === slug)

const sectionHead = 'flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'
/** The kinds of seat, in the order the Parliament page lists them. */
const SEATS = ['District representative', 'Party representative', 'Sectoral representative', 'Non-Moro indigenous peoples representative']
const eyebrow = 'font-mono text-[0.65625rem] font-semibold uppercase tracking-[0.14em]'

/** One office as a card: who heads it, its logo and acronym, its name, what it is for, and its first number and email. The whole card opens the office; the number and email work on their own. */
function OfficeCard({
	id,
	href,
	logo,
	name,
	acronym,
	tag,
	purpose,
	head,
	phones,
	emails,
	children,
}: {
	id?: string
	href: string
	logo: { src: string } | null
	name: string
	acronym: string | null
	tag: string
	purpose?: string | null
	head: { title: string; name: string; photo: { src: string } | null } | null
	phones: string[]
	emails: string[]
	children?: React.ReactNode
}) {
	return (
		<li
			id={id}
			className='group relative flex scroll-mt-[calc(var(--site-header-h)+1rem)] flex-col overflow-hidden border border-[var(--rule)] bg-[var(--paper)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_20px_40px_-26px_rgba(0,0,0,0.35)]'
		>
			{/* The office's mark, large, on the card's own ground. */}
			<div className='relative grid h-28 place-items-center pt-4'>
				<Emblem image={logo} name={name} label={acronym} className='size-[4.5rem] text-[0.75rem] transition duration-500 group-hover:scale-105' />
			</div>

			<div className='flex flex-1 flex-col px-5 pb-5 pt-5 text-center'>
				<p className='text-[1rem] font-extrabold leading-snug tracking-[-0.015em]'>
					{/* The card's one link, stretched over it, so the number and email below stay links of their own. */}
					<Link scroll={false} href={href} className='after:absolute after:inset-0 group-hover:text-[var(--accent)]'>
						{name}
					</Link>
				</p>
				{/* Its acronym and what kind of office it is, as badges under its name (user decision). */}
				<p className='mt-2 flex flex-wrap justify-center gap-1.5'>
					{acronym ? (
						<span className='inline-block rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-[var(--accent)]'>
							{acronym}
						</span>
					) : null}
					<span className='inline-block rounded-full bg-[var(--paper-2)] px-2.5 py-0.5 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-[var(--ink-2)]'>
						{tag}
					</span>
				</p>
				{/* The ways to reach it, right under its name (user decision). */}
				{phones[0] || emails[0] ? (
					<div className='relative z-1 mt-4 flex flex-wrap justify-center gap-2'>
						{phones[0] ? (
							<a
								href={telHref(phones[0])}
								className='inline-flex min-w-0 items-center gap-1.5 rounded-full border border-[var(--rule)] px-3 py-1.5 text-[0.75rem] font-semibold tabular-nums transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white'
							>
								<PhoneIcon size={13} weight='bold' className='shrink-0' aria-hidden='true' />
								{phones[0]}
								{phones.length > 1 ? <span className='opacity-60'>+{phones.length - 1}</span> : null}
							</a>
						) : null}
						{emails[0] ? (
							<a href={`mailto:${emails[0]}`} title={emails[0]} className='inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border border-[var(--rule)] px-3 py-1.5 text-[0.75rem] font-semibold transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white'>
								<EnvelopeSimpleIcon size={13} weight='bold' className='shrink-0' aria-hidden='true' />
								<span className='truncate'>{emails[0]}</span>
							</a>
						) : null}
					</div>
				) : null}

				{purpose ? <p className='mt-4 text-[0.84375rem] leading-[1.55] text-[var(--ink-2)]'>{purpose}</p> : null}

				{children}
			</div>
			{/* Who heads it, at the foot of the card (user decision), so the heads line up across a row. */}
			<div className='flex min-h-[4.25rem] items-center gap-3 border-t border-[var(--rule)] px-4 py-3'>
				{head ? (
					<>
						<Emblem image={head.photo} name={head.name} portrait className='size-11 shrink-0 rounded-full text-[0.6875rem]' />
						<span className='min-w-0'>
							<span className='block truncate text-[0.875rem] font-bold leading-tight text-[var(--ink)]'>{head.name}</span>
							<span className='mt-0.5 block truncate text-[0.6875rem] leading-tight text-[var(--ink-3)]'>{head.title}</span>
						</span>
					</>
				) : (
					<span className='text-[0.8125rem] text-[var(--ink-3)]'>Head not named in an official source</span>
				)}
			</div>
		</li>
	)
}

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
							{directoryOffices.filter((o) => o.kind !== 'unit').length} regional offices, {localGovernments.length} provinces and areas, {towns} towns and cities, {barangays.toLocaleString('en-PH')} barangays and the {members.length} Members of Parliament.
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

					{/* One section at a time (user decision); the jump links in the search band open the right one. */}
					<SwitchTabs
						label='Directory sections'
						className={hotlines.length ? 'mt-14' : ''}
						tabs={[
							{
								key: 'regional',
								label: 'Regional government',
								count: directoryOffices.filter((o) => o.kind !== 'unit').length,
								panel: (
					<section id='regional' aria-labelledby='regional-title' className='scroll-mt-[calc(var(--site-header-h)+1rem)] pt-8'>
						<div className={sectionHead}>
							<h2 id='regional-title' className='sr-only'>
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
									<ul className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
										{list.map((o) => (
											<OfficeCard
												key={o.slug}
												href={`/directory/office/${o.slug}`}
												logo={officeLogo(o.slug)}
												name={o.name}
												acronym={o.acronym}
												tag={o.kind === 'ministry' ? 'Ministry' : o.kind === 'attached' ? 'Attached' : 'Office'}
												phones={o.phones}
												head={o.head ? { title: o.head.title.replace(/\s*\(.*\)$/, ''), name: o.head.name, photo: headPhoto(o.slug) } : null}
												emails={o.emails}
											>
												{units(o.slug).length ? (
													<p className='relative z-1 mt-3 text-[0.78125rem] leading-[1.5] text-[var(--ink-3)]'>
														<span className='font-semibold text-[var(--ink-2)]'>Its offices:</span>{' '}
														{units(o.slug).map((u, i) => (
															<span key={u.slug}>
																{i ? ' · ' : null}
																<Link scroll={false} href={`/directory/office/${u.slug}`} className='text-[var(--ink-2)] hover:text-[var(--accent)]'>
																	{u.name.replace(/^Office of the /, '')}
																</Link>
															</span>
														))}
													</p>
												) : null}
											</OfficeCard>
										))}
									</ul>
								</div>
							)
						})}
					</section>
								),
							},
							{
								key: 'national',
								label: 'National offices',
								count: nationalOffices.length,
								// National agencies' offices in the region, carded as the ministries are; each opens a dialog with the rest.
								panel: (
					<section id='national' aria-labelledby='national-title' className='scroll-mt-[calc(var(--site-header-h)+1rem)] pt-8'>
						<div className={sectionHead}>
							<h2 id='national-title' className='sr-only'>
								National offices in the region
							</h2>
							<p className='max-w-xl text-[0.84375rem] text-[var(--ink-3)]'>Where to go for a certificate, a contribution, a licence or a passport. Many publish little; an empty line is one no official source showed.</p>
						</div>
						<ul className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
							{nationalOffices.map((o) => (
								<OfficeCard
									key={o.slug}
									id={`national-${o.slug}`}
									href={`/directory/national/${o.slug}`}
									logo={nationalLogo(o.slug)}
									name={o.office}
									acronym={o.acronym}
									tag='National'
									purpose={o.for}
									head={o.head ? { title: o.head.title, name: o.head.name, photo: null } : null}
									phones={o.phones}
									emails={o.emails}
								/>
							))}
						</ul>
						<p className='mt-4 max-w-3xl text-[0.78125rem] leading-[1.65] text-[var(--ink-3)]'>{nationalMeta.note}</p>
					</section>
								),
							},
							{
								key: 'local',
								label: 'Provinces and towns',
								count: towns,
								panel: (
					<section id='local' aria-labelledby='local-title' className='scroll-mt-[calc(var(--site-header-h)+1rem)] pt-8'>
						<div className={sectionHead}>
							<h2 id='local-title' className='sr-only'>
								Provinces and towns
							</h2>
							<p className='max-w-xl text-[0.84375rem] text-[var(--ink-3)]'>Winners of COMELEC’s canvass of the May 2025 elections, for 2025–2028. Each town’s page has its emergency lines and barangay officials.</p>
						</div>
						<DirectoryPlaces />
					</section>
								),
							},
							{
								key: 'parliament',
								label: 'Parliament',
								count: members.length,
								panel: (
					<section id='parliament' aria-labelledby='mps-title' className='scroll-mt-[calc(var(--site-header-h)+1rem)] pt-8'>
						{/* Every Member, here (user decision), in the office cards' shape: portrait, name, party, seat. By kind of seat,
						    all at once, no filter chips. Each opens the Member's details over the Directory. */}
						<div className={sectionHead}>
							<h2 id='mps-title' className='sr-only'>
								Members of Parliament
							</h2>
							<p className='max-w-xl text-[0.84375rem] text-[var(--ink-3)]'>Elected on 14 September 2026, by district, party, sector and indigenous peoples’ seat. Each opens the Member’s details.</p>
						</div>
						<div className='mt-8'>
							{SEATS.map((seat) => {
								const list = members.filter((m) => m.seatLabel === seat)
								return (
										<section key={seat} className='pt-10'>
											<h3 className={`${eyebrow} text-[var(--ink-3)]`}>
												{seat}s <span className='text-[var(--ink-mute)]'>· {list.length}</span>
											</h3>
											<ul className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
												{list.map((m) => (
													<li
														key={m.rosterName}
														id={memberId(m)}
														className='group relative flex scroll-mt-[calc(var(--site-header-h)+1rem)] flex-col items-center overflow-hidden border border-[var(--rule)] bg-[var(--paper)] px-4 pb-5 pt-6 text-center transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_20px_40px_-26px_rgba(0,0,0,0.35)]'
													>
														<Emblem image={memberPortrait(m)} name={m.fullName} portrait className='size-24 rounded-full text-[1rem]' />
														<Link scroll={false} href={`/directory/member/${memberId(m)}`} className='mt-4 text-[1rem] font-extrabold leading-snug tracking-[-0.015em] after:absolute after:inset-0 group-hover:text-[var(--accent)]'>
															{m.fullName}
														</Link>
														<p className='mt-2 flex flex-wrap justify-center gap-1.5'>
															{m.partyLabel ? (
																<span className='inline-block rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-[var(--accent)]'>
																	{m.partyLabel}
																</span>
															) : null}
															<span className='inline-block rounded-full bg-[var(--paper-2)] px-2.5 py-0.5 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-[var(--ink-2)]'>
																{seat.replace(/ representative$/, '')}
															</span>
														</p>
														{m.district ?? m.sector ? <p className='mt-3 text-[0.8125rem] leading-[1.5] text-[var(--ink-2)]'>{m.district ?? m.sector}</p> : null}
													</li>
												))}
											</ul>
										</section>
								)
							})}
						</div>
					</section>
								),
							},
						]}
					/>

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
