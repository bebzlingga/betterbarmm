import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead } from '../_components/parts'
import { KIND_LABELS, countsSource, facilityAreas, kindCount } from '../_lib/health'

export const metadata: Metadata = {
	title: 'Facilities',
	description: 'The Department of Health’s count of barangay health stations, health units, birthing homes, hospitals and infirmaries in every town of the region.',
}

const TH = 'px-3 py-2.5 text-left font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
const TD = 'px-3 py-2 align-top'
const CHIP =
	'border border-[var(--rule)] px-3 py-1.5 text-[0.8125rem] font-semibold text-[var(--ink-2)] transition hover:border-[var(--ink)] data-[active=true]:border-[var(--ink)] data-[active=true]:bg-[var(--ink)] data-[active=true]:text-[var(--paper)]'

const asOf = new Date(`${countsSource.asOf}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

function Cell({ n }: { n: { government: number; private: number } }) {
	if (!n.government && !n.private) return <span className='text-[var(--ink-mute)]'>–</span>
	return (
		<>
			{n.government.toLocaleString('en-PH')}
			{n.private ? <span className='ml-1 text-[var(--ink-3)]'>({n.private})</span> : null}
		</>
	)
}

export default async function FacilitiesPage({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
	const { area } = await searchParams
	const shown = facilityAreas.filter((a) => a.rows.length && (!area || a.slug === area))

	return (
		<>
			<Masthead
				kicker='Health · Bangsamoro'
				name='Facilities'
				note={`How many health facilities of each kind the Department of Health’s registry counted in every town, as of ${asOf}. Government facilities, with private ones in brackets.`}
			/>

			<section className='bb-container bb-section'>
				<nav aria-label='Areas' className='flex flex-wrap gap-2'>
					<Link href='/facilities' data-active={!area} className={CHIP}>
						All areas
					</Link>
					{facilityAreas
						.filter((a) => a.rows.length)
						.map((a) => (
							<Link key={a.slug} href={`/facilities?area=${a.slug}`} data-active={area === a.slug} className={CHIP}>
								{a.name}
							</Link>
						))}
				</nav>

				<div className='mt-10 space-y-14'>
					{shown.map((a) => (
						<section key={a.slug}>
							<h2 className='flex flex-wrap items-baseline gap-x-3'>
								<span className='text-[1.375rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>{a.name}</span>
								<span className='text-[0.78125rem] text-[var(--ink-3)]'>
									{a.rows.length} of {a.towns} {a.towns === 1 ? 'town' : 'towns'} on the registry
								</span>
							</h2>
							<div className='mt-4 overflow-x-auto border-y border-[var(--rule)]'>
								<table className='w-full min-w-[46rem] text-[0.84375rem]'>
									<thead className='border-b border-[var(--rule)]'>
										<tr>
											<th className={TH}>Town</th>
											{KIND_LABELS.map((k) => (
												<th key={k} className={`${TH} !text-right`}>{k}</th>
											))}
										</tr>
									</thead>
									<tbody className='divide-y divide-[var(--rule-soft)]'>
										{a.rows.map((t) => (
											<tr key={t.town}>
												<td className={`${TD} font-semibold text-[var(--ink)]`}>{t.townName}</td>
												{KIND_LABELS.map((k) => (
													<td key={k} className={`${TD} num text-right`}>
														<Cell n={kindCount([t], k)} />
													</td>
												))}
											</tr>
										))}
										<tr className='bg-[var(--paper-2)] font-semibold'>
											<td className={TD}>All</td>
											{KIND_LABELS.map((k) => (
												<td key={k} className={`${TD} num text-right`}>
													<Cell n={kindCount(a.rows, k)} />
												</td>
											))}
										</tr>
									</tbody>
								</table>
							</div>
						</section>
					))}
				</div>

				<p className='mt-12 max-w-[48rem] text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
					&ldquo;Rural and city health units&rdquo; gathers the registry&rsquo;s rural health units with its municipal, city and
					provincial health offices. &ldquo;Other&rdquo; is everything else it lists: testing laboratories, an ambulatory surgical
					clinic and the like. A town missing from a table had nothing on the registry. The Special Geographic Area&rsquo;s towns
					were created after this count and are not on it.
				</p>
			</section>
		</>
	)
}
