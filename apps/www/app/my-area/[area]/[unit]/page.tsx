import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Masthead } from '../../../_components/masthead'
import { SiteHeader } from '../../../_components/site-header'
import { procurementFor } from '../../../_lib/area-procurement'
import { allUnits, buildUnit, type MapMeasure } from '../../../_lib/map-data'
import { pageMeta } from '../../../_lib/seo'

/* ============================================================
   My area

   One town or city, everything the estate knows about it on one page,
   each part linking to the workspace that holds the full record: who
   governs it and who represents it in Parliament, what money it gets,
   what its government is buying, and the measures that name it.
   ============================================================ */

export function generateStaticParams() {
	return allUnits().map(({ area, unit }) => ({ area, unit }))
}

export async function generateMetadata({ params }: { params: Promise<{ area: string; unit: string }> }): Promise<Metadata> {
	const { area, unit } = await params
	const u = buildUnit(area, unit)
	if (!u) return {}
	return pageMeta({
		title: `${u.name}, ${u.area.name}`,
		description: `${u.name} at a glance: its officials and member of Parliament, its National Tax Allotment, what its government is buying, and the measures that name it.`,
		path: `/my-area/${area}/${unit}`,
	})
}

const H2 = 'text-[1.5rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const LINK = 'mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--accent)]'
const peso = (n: number) => (n >= 1e9 ? `₱${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `₱${(n / 1e6).toFixed(1)}M` : `₱${Math.round(n).toLocaleString('en-PH')}`)
const longDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

function More({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<a href={href} className={LINK}>
			{children}
			<ArrowUpRightIcon size={13} weight='bold' aria-hidden='true' />
		</a>
	)
}

function Measures({ label, items }: { label: string; items: MapMeasure[] }) {
	if (!items.length) return null
	return (
		<div className='mt-6'>
			<p className='bb-label'>{label}</p>
			<ul className='mt-3'>
				{items.slice(0, 6).map((m) => (
					<li key={m.href} className='border-t border-[var(--rule)] py-3'>
						<a href={m.href} className='text-[14.5px] font-semibold leading-6 text-[var(--ink)] hover:text-[var(--accent)]'>
							{m.title}
						</a>
						<p className='mt-1 text-[12.5px] text-[var(--ink-3)]'>{[m.status, m.date].filter(Boolean).join(' · ')}</p>
					</li>
				))}
			</ul>
		</div>
	)
}

export default async function MyAreaPage({ params }: { params: Promise<{ area: string; unit: string }> }) {
	const { area, unit } = await params
	const u = buildUnit(area, unit)
	if (!u) notFound()
	const buying = procurementFor(area, unit)
	const facts = [
		u.population != null ? { value: u.population.toLocaleString('en-PH'), label: 'People (2024)' } : null,
		{ value: String(u.barangays.length), label: 'Barangays' },
		u.nta?.years.at(-1) ? { value: u.nta.years.at(-1)!.amount.replace(/\s/g, ''), label: `Tax allotment ${u.nta.years.at(-1)!.year}` } : null,
	].filter((f): f is { value: string; label: string } => Boolean(f))

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='my-area' />
			<Masthead
				brand
				label={`My area · ${u.area.name}`}
				lines={[u.name]}
				size='display'
				standfirst={`${u.classification}${u.isCapital ? ', the provincial capital' : ''}. Who governs it, who represents it, what money it gets and what its government is buying — each linked to the full record.`}
				facts={facts}
			/>

			<div className='bb-container bb-section grid gap-x-20 gap-y-16 lg:grid-cols-2'>
				<section>
					<h2 className={H2}>Who governs it</h2>
					<p className='mt-2 text-[13px] text-[var(--ink-3)]'>Elected {u.term ?? ''}</p>
					<dl className='mt-5'>
						{u.officials.map((o) => (
							<div key={o.role} className='flex items-baseline justify-between gap-4 border-t border-[var(--rule)] py-3'>
								<dt className='text-[13px] text-[var(--ink-3)]'>{o.role}</dt>
								<dd className='text-right text-[15px] font-semibold'>
									{o.name}
									{o.party ? <span className='font-normal text-[var(--ink-3)]'> · {o.party}</span> : null}
								</dd>
							</div>
						))}
					</dl>
					{u.council.length ? <p className='mt-4 text-[13.5px] leading-6 text-[var(--ink-2)]'>Council: {u.council.join(', ')}.</p> : null}
					<More href={u.lguHref}>The full local government record</More>
				</section>

				<section>
					<h2 className={H2}>Who represents it in Parliament</h2>
					{u.election?.districts.length ? (
						<>
							{u.election.districts.map((d) => {
								const won = d.candidates.find((c) => c.won)
								return (
									<div key={d.label} className='mt-5 border-t border-[var(--rule)] pt-3'>
										<p className='text-[13px] text-[var(--ink-3)]'>{d.label}</p>
										<p className='mt-1 text-[17px] font-semibold'>{won?.name ?? 'Not yet declared'}</p>
										{won ? <p className='text-[13px] text-[var(--ink-3)]'>{won.party}</p> : null}
									</div>
								)
							})}
							{u.election.note ? <p className='mt-4 text-[13px] leading-6 text-[var(--ink-3)]'>{u.election.note}</p> : null}
							<More href={u.election.href}>The election results</More>
						</>
					) : (
						<p className='mt-4 text-[14px] text-[var(--ink-3)]'>No parliamentary district is recorded for it yet.</p>
					)}
				</section>

				<section>
					<h2 className={H2}>The money it gets</h2>
					{u.nta?.years.length ? (
						<>
							<dl className='mt-5'>
								{u.nta.years.map((y) => (
									<div key={y.year} className='flex items-baseline justify-between gap-4 border-t border-[var(--rule)] py-3'>
										<dt className='text-[13px] text-[var(--ink-3)]'>
											National Tax Allotment {y.year}
											{y.preliminary ? ' (allocation)' : ''}
										</dt>
										<dd className='num text-right text-[15px] font-semibold'>
											{y.amount.replace(/\s/g, '')}
											{y.perResident ? <span className='font-normal text-[var(--ink-3)]'> · {y.perResident} each</span> : null}
										</dd>
									</div>
								))}
							</dl>
							{u.nta.change ? <p className='mt-3 text-[13px] text-[var(--ink-3)]'>{u.nta.change}.</p> : null}
						</>
					) : (
						<p className='mt-4 text-[14px] text-[var(--ink-3)]'>No allotment is reported for it yet.</p>
					)}
					<More href={`${u.lguHref}#finances`}>Its finances</More>
				</section>

				<section>
					<h2 className={H2}>What its government is buying</h2>
					{buying ? (
						<>
							<p className='mt-4 text-[14.5px] leading-7 text-[var(--ink-2)]'>
								Since {buying.since ? new Date(`${buying.since}T00:00:00Z`).getUTCFullYear() : 2019}, the{' '}
								{u.classification.toLowerCase().includes('city') ? 'city' : 'municipal'} government has posted{' '}
								<strong>{buying.notices.toLocaleString('en-PH')}</strong> bid notices worth <strong>{peso(buying.budget)}</strong> on
								PhilGEPS.{' '}
								{buying.awards
									? `PhilGEPS records ${buying.awards.toLocaleString('en-PH')} contracts awarded on them, worth ${peso(buying.awarded)}.`
									: 'PhilGEPS records no award on any of them, so who won is not on record here.'}
							</p>
							{buying.open.length ? (
								<div className='mt-6'>
									<p className='bb-label'>Open for bids now</p>
									<ul className='mt-3'>
										{buying.open.slice(0, 5).map((o) => (
											<li key={o.title} className='flex items-baseline justify-between gap-4 border-t border-[var(--rule)] py-3'>
												<span className='text-[14px] font-semibold'>{o.title}</span>
												<span className='num shrink-0 text-right text-[13px]'>
													{o.budget != null ? peso(o.budget) : ''}
													{o.closing ? <span className='block text-[12px] text-[var(--accent)]'>Closes {longDate(o.closing)}</span> : null}
												</span>
											</li>
										))}
									</ul>
								</div>
							) : null}
							<More href={buying.href}>Every notice it posted</More>
						</>
					) : (
						<p className='mt-4 text-[14px] text-[var(--ink-3)]'>Its government has posted nothing PhilGEPS files under BARMM.</p>
					)}
				</section>
			</div>

			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container py-[clamp(3.75rem,7vw,6.5rem)]'>
					<h2 className={H2}>Laws and resolutions that name {u.related.scope === 'town' ? 'it' : u.area.name}</h2>
					<p className='mt-2 max-w-[46rem] text-[14px] leading-6 text-[var(--ink-3)]'>
						{u.related.scope === 'town'
							? 'Measures of the Bangsamoro Parliament whose titles mention this town by name.'
							: 'None names this town in its title, so these are the measures that name its province or area.'}
					</p>
					<div className='grid gap-x-16 lg:grid-cols-3'>
						<Measures label='Acts' items={u.related.acts} />
						<Measures label='Bills' items={u.related.bills} />
						<Measures label='Resolutions' items={u.related.resolutions} />
					</div>
				</div>
			</section>

			{u.travel ? (
				<section className='bb-container bb-section'>
					<h2 className={H2}>Visiting</h2>
					<p className='mt-4 max-w-[46rem] text-[15px] leading-7 text-[var(--ink-2)]'>{u.travel.summary}</p>
					<More href={u.travel.href}>The travel guide</More>
				</section>
			) : null}

			<section className='bb-container pb-[clamp(3.75rem,7vw,6.5rem)]'>
				<Link href='/my-area' className='rule-link text-[14px] font-semibold'>
					Another town or city
				</Link>
			</section>
		</main>
	)
}
