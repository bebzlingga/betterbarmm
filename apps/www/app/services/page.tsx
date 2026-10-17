import { ArrowRightIcon, MagnifyingGlassIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'
import { pageMeta } from '../_lib/seo'
import { AUDIENCES, audienceLabel, matches, offerings, offices, servicesMeta, shortName, slugify, type Office, type Offering } from '../_lib/services'
import { GetInvolved } from '../_components/get-involved'

export const metadata: Metadata = pageMeta({
	title: 'Programs & services',
	description:
		'What the Bangsamoro Government’s ministries and offices offer the public — scholarships, assistance, permits, training — who each is for, and how to get it, from their own Citizen’s Charters.',
	path: '/services',
})

const GROUPS: { kind: Office['kind'][]; title: string }[] = [
	{ kind: ['office', 'ministry'], title: 'The Chief Minister’s office and the ministries' },
	{ kind: ['attached'], title: 'Attached offices, authorities and commissions' },
]

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ q?: string; for?: string }> }) {
	const { q = '', for: audience = '' } = await searchParams
	const term = q.trim().toLowerCase()
	const searching = Boolean(term || audience)
	const found = searching ? offerings.filter((o) => matches(o, term, audience)) : []
	const programs = offerings.filter((o) => o.kind === 'program').length
	const services = offerings.length - programs
	// Only the audiences something is actually offered to.
	const audiences = AUDIENCES.filter((a) => offerings.some((o) => o.item.for.includes(a.id)))

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='services' />

			<Masthead
				brand
				label='Programs & services'
				lines={['What the Bangsamoro Government offers,', 'and how to get it.']}
				muted={[1]}
				standfirst='Scholarships, assistance, permits, training and the rest: office by office, who each is for, and what to bring, from the offices’ own Citizen’s Charters.'
				facts={[
					{ value: String(offices.filter((o) => o.charter).length), label: 'with a Citizen’s Charter' },
					{ value: String(programs), label: 'programs' },
					{ value: String(services), label: 'services' },
				]}
			/>

			<section className='bb-container bb-section'>
				<form className='flex flex-col gap-3 sm:flex-row sm:items-end' role='search'>
					<label className='flex min-w-0 flex-1 flex-col gap-1'>
						<span className='text-[12px] text-[var(--ink-3)]'>Search</span>
						<span className='flex h-11 items-center gap-3 border border-[var(--rule)] bg-[var(--paper-2)] px-3 focus-within:border-[var(--ink)]'>
							<MagnifyingGlassIcon size={16} className='shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
							<input name='q' defaultValue={q} placeholder='Scholarship, business permit, burial assistance…' className='min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[var(--ink-mute)]' />
						</span>
					</label>
					<label className='flex flex-col gap-1 sm:w-64'>
						<span className='text-[12px] text-[var(--ink-3)]'>Who it’s for</span>
						<select name='for' defaultValue={audience} className='h-11 border border-[var(--rule)] bg-[var(--paper-2)] px-3 text-[14px]'>
							<option value=''>Anyone</option>
							{audiences.map((a) => (
								<option key={a.id} value={a.id}>
									{a.label}
								</option>
							))}
						</select>
					</label>
					<button type='submit' className='h-11 cursor-pointer bg-[var(--ink)] px-5 text-[14px] font-semibold text-[var(--paper)] hover:bg-[var(--accent)]'>
						Find
					</button>
					{searching ? (
						<Link href='/services' className='flex h-11 items-center px-2 text-[13.5px] font-semibold underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'>
							Show every office
						</Link>
					) : null}
				</form>

				{searching ? <Results found={found} q={q} audience={audience} /> : <Directory />}

				<p className='mt-16 max-w-3xl text-[13px] leading-[1.7] text-[var(--ink-3)]'>
					{servicesMeta.note} An office that has published no Citizen’s Charter online is greyed out, and what it offers is not listed until it does. Know of a program that is missing or out of date?{' '}
					<a href='/report' className='underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'>
						Tell us
					</a>
					.
				</p>
			</section>
			<GetInvolved />
		</main>
	)
}

/** Every office, as cards, ministries first. */
function Directory() {
	return (
		<div className='mt-12 space-y-14'>
			{GROUPS.map((g) => {
				const list = offices.filter((o) => g.kind.includes(o.kind))
				return (
					<section key={g.title}>
						<h2 className='text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
							{g.title} <span className='text-[var(--ink-mute)]'>{list.length}</span>
						</h2>
						<ul className='mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
							{list.map((o) => (
								<li key={o.slug}>
									{/* An office with no Citizen's Charter published is greyed out: what it offers is not listed until it publishes one. */}
									<Link
										href={`/services/${o.slug}`}
										className={`group flex h-full flex-col border p-5 transition ${o.charter ? 'border-[var(--rule)] bg-[var(--paper)] hover:border-[var(--ink)]' : 'border-[var(--rule-soft)] bg-[var(--paper-2)] text-[var(--ink-mute)] hover:border-[var(--rule)]'}`}
									>
										{o.acronym ? <span className={`font-mono text-[11px] font-semibold uppercase tracking-[0.14em] ${o.charter ? 'text-[var(--accent)]' : ''}`}>{o.acronym}</span> : null}
										<span className={`mt-1 text-[16px] font-bold leading-snug ${o.charter ? '' : 'text-[var(--ink-3)]'}`}>{o.name}</span>
										{o.mandate ? <span className={`mt-2 line-clamp-3 text-[13.5px] leading-6 ${o.charter ? 'text-[var(--ink-2)]' : ''}`}>{o.mandate}</span> : null}
										<span className='mt-auto flex items-center justify-between pt-4 text-[12.5px] text-[var(--ink-3)]'>
											{o.charter ? (
												<span>
													{o.programs.length} {o.programs.length === 1 ? 'program' : 'programs'} · {o.services.length} {o.services.length === 1 ? 'service' : 'services'}
												</span>
											) : (
												<span className='italic'>No Citizen’s Charter published</span>
											)}
											<ArrowRightIcon size={15} className='transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]' aria-hidden='true' />
										</span>
									</Link>
								</li>
							))}
						</ul>
					</section>
				)
			})}
		</div>
	)
}

/** What a search or an audience found, across every office. */
function Results({ found, q, audience }: { found: Offering[]; q: string; audience: string }) {
	const what = [q && `“${q}”`, audience && `for ${audienceLabel(audience).toLowerCase()}`].filter(Boolean).join(' ')
	return (
		<div className='mt-10'>
			<p className='text-[14px] text-[var(--ink-3)]'>
				{found.length} {found.length === 1 ? 'program or service' : 'programs and services'} {what}
			</p>
			{found.length ? (
				<ul className='mt-5 divide-y divide-[var(--rule-soft)] border-y border-[var(--rule)]'>
					{found.map((o, i) => (
						<li key={`${o.office.slug}-${o.kind}-${i}`} className='py-5'>
							<p className='font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
								{o.kind === 'program' ? 'Program' : 'Service'} ·{' '}
								<Link href={`/services/${o.office.slug}`} className='hover:text-[var(--accent)]'>
									{shortName(o.office)}
								</Link>
							</p>
							<Link href={`/services/${o.office.slug}#${o.kind}-${slugify(o.item.name)}`} className='mt-1 block text-[16px] font-semibold leading-snug hover:text-[var(--accent)]'>
								{o.item.name}
							</Link>
							{o.item.summary ? <p className='mt-1.5 max-w-3xl text-[14px] leading-6 text-[var(--ink-2)]'>{o.item.summary}</p> : null}
						</li>
					))}
				</ul>
			) : (
				<p className='mt-8 text-[14px] text-[var(--ink-2)]'>Nothing matches. Try a shorter word, or another audience.</p>
			)}
		</div>
	)
}

