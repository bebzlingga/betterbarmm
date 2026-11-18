import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FacilityMap } from '../../../_components/facility-map'
import { Figures, Masthead } from '../../../_components/parts'
import { countsSource } from '../../../_lib/health'
import { findTown, lguHref, mapPoints, towns } from '../../../_lib/towns'

type Props = { params: Promise<{ area: string; town: string }> }

export function generateStaticParams() {
	return towns.map((t) => ({ area: t.area, town: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { area, town } = await params
	const t = findTown(area, town)
	if (!t) return { title: 'Town not found', robots: { index: false, follow: true } }
	return { title: `Care in ${t.name}`, description: `The health facilities in ${t.name}, ${t.areaName}: its barangay health stations against its barangays and people, its health units, birthing homes and hospitals, and those mapped.` }
}

const TH = 'px-3 py-2.5 text-left font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
const TD = 'px-3 py-2 align-top'
const H2 = 'text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const NOTE = 'max-w-[38rem] text-[0.875rem] leading-6 text-[var(--ink-3)] lg:text-right'

const asOf = new Date(`${countsSource.asOf}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })

export default async function TownPage({ params }: Props) {
	const { area, town } = await params
	const t = findTown(area, town)
	if (!t) notFound()
	const points = mapPoints.filter((p) => p.area === t.area && p.townSlug === t.slug)
	const pad = 0.02
	const focus: [[number, number], [number, number]] | undefined = points.length
		? [
				[Math.min(...points.map((p) => p.lon)) - pad, Math.min(...points.map((p) => p.lat)) - pad],
				[Math.max(...points.map((p) => p.lon)) + pad, Math.max(...points.map((p) => p.lat)) + pad],
			]
		: undefined
	const types = t.counts ? [...new Set([...Object.keys(t.counts.government), ...Object.keys(t.counts.private)])].sort((a, b) => (t.counts!.government[b] ?? 0) + (t.counts!.private[b] ?? 0) - (t.counts!.government[a] ?? 0) - (t.counts!.private[a] ?? 0)) : []
	// The province's other towns, the fewest stations for their barangays first, to read this one against.
	const neighbours = towns.filter((x) => x.area === t.area && x.onRegistry).sort((a, b) => (a.per10 ?? 0) - (b.per10 ?? 0))

	return (
		<>
			<Masthead
				kicker={`Health · ${t.areaName}`}
				name={t.name}
				note={
					t.onRegistry
						? `${t.stations ? `${t.stations} barangay health ${t.stations === 1 ? 'station' : 'stations'} for ${t.barangays} barangays` : `No barangay health station on the registry for its ${t.barangays} barangays`}, with ${t.government} government and ${t.private} private facilities in all, as the Department of Health counted them in ${asOf}.`
						: `${t.name} is not on the Department of Health’s 2021 registry${t.area === 'special-geographic-area' ? ': it was created after the count' : ''}. What volunteers have mapped is below.`
				}
			/>

			{t.onRegistry ? (
				<Figures
					title='At a glance'
					note={`Facilities as of ${asOf}; people from the LGU directory’s latest census figure.`}
					items={[
						{ value: t.population?.toLocaleString('en-PH') ?? '–', label: 'People' },
						{ value: String(t.stations), label: `Barangay health stations, for ${t.barangays} barangays` },
						{ value: t.perStation ? t.perStation.toLocaleString('en-PH') : '–', label: 'People for each station' },
						{ value: String(t.units + t.birthing + t.hospitals), label: 'Health units, birthing homes and hospitals' },
					]}
				/>
			) : null}

			{types.length ? (
				<section className='bb-container bb-section'>
					<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-16'>
						<h2 className={H2}>Every facility on the registry</h2>
						<p className={NOTE}>A count by type, government and private, not a list: the registry does not say which are open, staffed or supplied today.</p>
					</div>
					<div className='mt-8 overflow-x-auto border-y border-[var(--rule)]'>
						<table className='w-full min-w-[30rem] text-[0.875rem]'>
							<thead className='border-b border-[var(--rule)]'>
								<tr>
									<th className={TH}>Type</th>
									<th className={`${TH} !text-right`}>Government</th>
									<th className={`${TH} !text-right`}>Private</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-[var(--rule-soft)]'>
								{types.map((k) => (
									<tr key={k}>
										<td className={TD}>{k}</td>
										<td className={`${TD} num text-right`}>{t.counts!.government[k] ?? '–'}</td>
										<td className={`${TD} num text-right`}>{t.counts!.private[k] ?? '–'}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
			) : null}

			<section className={t.onRegistry ? 'bg-[var(--paper-2)]' : ''}>
				<div className='bb-container bb-section'>
					<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-16'>
						<h2 className={H2}>{points.length ? `${points.length} mapped by volunteers` : 'Nothing mapped yet'}</h2>
						<p className={NOTE}>
							Health facilities that OpenStreetMap&rsquo;s volunteers have placed and named in {t.name}. Only what someone has mapped:{' '}
							{points.length < t.government + t.private ? 'fewer than the registry counts.' : 'not a complete list.'}
						</p>
					</div>
					{points.length ? (
						<>
							<div className='mt-8'>
								<FacilityMap points={points} focus={focus} className='h-[26rem]' townLinks={false} />
							</div>
							<ul className='mt-8 grid gap-x-10 gap-y-3 text-[0.875rem] sm:grid-cols-2 lg:grid-cols-3'>
								{points.map((p) => (
									<li key={p.id} className='border-t border-[var(--rule)] pt-3'>
										<span className='font-semibold text-[var(--ink)]'>{p.name}</span>
										<span className='block text-[0.78125rem] text-[var(--ink-3)]'>
											{p.kind === 'hospital' ? 'Hospital' : 'Health centre or clinic'}
											{p.barangay ? ` · Barangay ${p.barangay}` : ''}
										</span>
									</li>
								))}
							</ul>
						</>
					) : (
						<p className='mt-6 text-[0.9375rem] text-[var(--ink-2)]'>
							No health facility in {t.name} is on OpenStreetMap yet. Anyone can add one at{' '}
							<a href='https://www.openstreetmap.org' className='rule-link'>
								openstreetmap.org
							</a>
							.
						</p>
					)}
				</div>
			</section>

			{neighbours.length > 1 ? (
				<section className='bb-container bb-section'>
					<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-16'>
						<h2 className={H2}>Beside the rest of {t.areaName}</h2>
						<p className={NOTE}>Barangay health stations for every 10 barangays, the fewest first.</p>
					</div>
					<ol className='mt-8 space-y-1.5'>
						{neighbours.map((x) => {
							const top = Math.max(...neighbours.map((y) => y.per10 ?? 0), 1)
							const me = x.slug === t.slug
							return (
								<li key={x.slug} className='grid grid-cols-[9rem_minmax(0,1fr)_3rem] items-center gap-3 text-[0.8125rem] sm:grid-cols-[13rem_minmax(0,1fr)_3rem]'>
									{me ? (
										<span className='truncate font-bold text-[var(--ink)]'>{x.name}</span>
									) : (
										<Link href={`/towns/${x.area}/${x.slug}`} className='truncate text-[var(--ink-2)] hover:text-[var(--accent)]'>
											{x.name}
										</Link>
									)}
									<span className='h-2 bg-[var(--paper-2)]'>
										<span className='block h-full' style={{ width: `${Math.max(((x.per10 ?? 0) / top) * 100, 0.8)}%`, background: me ? 'var(--accent)' : 'var(--ink-3)' }} />
									</span>
									<span className={`num text-right ${me ? 'font-bold text-[var(--ink)]' : 'text-[var(--ink-3)]'}`}>{x.per10}</span>
								</li>
							)
						})}
					</ol>
				</section>
			) : null}

			<section className='bb-container pb-[clamp(3.75rem,7vw,6.5rem)]'>
				<div className='flex flex-wrap gap-x-8 gap-y-3 border-t border-[var(--rule)] pt-6 text-[0.875rem]'>
					<Link href='/towns' className='rule-link'>
						Every town
					</Link>
					<a href={lguHref(t)} className='rule-link inline-flex items-center gap-1.5'>
						{t.name} in the Local Government workspace
						<ArrowUpRightIcon size={13} weight='bold' aria-hidden='true' />
					</a>
					<a href='https://betterbarmm.com/preparedness' className='rule-link inline-flex items-center gap-1.5'>
						Hazards and the nearest hospitals, barangay by barangay
						<ArrowUpRightIcon size={13} weight='bold' aria-hidden='true' />
					</a>
				</div>
			</section>
		</>
	)
}
