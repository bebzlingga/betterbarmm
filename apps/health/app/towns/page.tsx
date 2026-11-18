import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead } from '../_components/parts'
import { countsSource } from '../_lib/health'
import { areas, regionStations, towns, type TownRow } from '../_lib/towns'

export const metadata: Metadata = {
	title: 'Towns',
	description: 'Every town in the region: its barangay health stations against its barangays and its people, its health units, birthing homes and hospitals.',
}

const TH = 'px-3 py-2.5 text-left font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
const TD = 'px-3 py-2 align-top'
const CHIP =
	'inline-flex h-9 shrink-0 items-center border px-3.5 text-[0.8125rem] font-semibold transition border-[var(--rule)] text-[var(--ink-2)] hover:border-[var(--ink)] data-[active=true]:border-[var(--ink)] data-[active=true]:bg-[var(--ink)] data-[active=true]:text-[var(--paper)]'

/** People per station, with a town that has none above every other and a town off the registry below. */
const load = (t: TownRow) => t.perStation ?? (t.onRegistry && t.population ? 1e12 : -1)

const SORTS = {
	name: { label: 'By name', by: (a: TownRow, b: TownRow) => a.name.localeCompare(b.name) },
	people: { label: 'Most people per station', by: (a: TownRow, b: TownRow) => load(b) - load(a) },
	stations: { label: 'Fewest stations per barangay', by: (a: TownRow, b: TownRow) => (a.per10 ?? 1e12) - (b.per10 ?? 1e12) },
} as const
type Sort = keyof typeof SORTS

const asOf = new Date(`${countsSource.asOf}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const n = (v: number | null) => (v == null ? '–' : v.toLocaleString('en-PH'))

export default async function TownsPage({ searchParams }: { searchParams: Promise<{ area?: string; sort?: string }> }) {
	const q = await searchParams
	const area = areas.some((a) => a.slug === q.area) ? q.area! : null
	const sort: Sort = q.sort && q.sort in SORTS ? (q.sort as Sort) : 'people'
	const rows = towns.filter((t) => !area || t.area === area).sort(SORTS[sort].by)
	const href = (a: string | null, s: Sort) => {
		const p = new URLSearchParams()
		if (a) p.set('area', a)
		if (s !== 'people') p.set('sort', s)
		return `/towns${p.size ? `?${p}` : ''}`
	}

	return (
		<>
			<Masthead
				kicker='Health · Bangsamoro'
				name='Town by town'
				note={`Across the ${regionStations.towns} towns the Department of Health counted, ${regionStations.stations.toLocaleString('en-PH')} barangay health stations serve ${regionStations.barangays.toLocaleString('en-PH')} barangays: ${regionStations.per10} for every 10, and one for every ${regionStations.perStation.toLocaleString('en-PH')} people. Choose a town for everything on record about its care.`}
			/>

			<section className='bb-container bb-section'>
				<nav aria-label='Areas' className='flex gap-2 overflow-x-auto [scrollbar-width:none] lg:flex-wrap [&::-webkit-scrollbar]:hidden'>
					<Link href={href(null, sort)} data-active={!area} className={CHIP}>
						All areas
					</Link>
					{areas.map((a) => (
						<Link key={a.slug} href={href(a.slug, sort)} data-active={area === a.slug} className={CHIP}>
							{a.name}
						</Link>
					))}
				</nav>
				<nav aria-label='Order' className='mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8125rem]'>
					<span className='text-[var(--ink-3)]'>Order</span>
					{(Object.keys(SORTS) as Sort[]).map((s) => (
						<Link key={s} href={href(area, s)} aria-current={s === sort ? 'true' : undefined} className={s === sort ? 'font-bold text-[var(--ink)] underline underline-offset-4' : 'rule-link'}>
							{SORTS[s].label}
						</Link>
					))}
				</nav>

				<div className='mt-8 overflow-x-auto border-y border-[var(--rule)]'>
					<table className='w-full min-w-[56rem] text-[0.84375rem]'>
						<thead className='border-b border-[var(--rule)]'>
							<tr>
								<th className={TH}>Town</th>
								<th className={`${TH} !text-right`}>People</th>
								<th className={`${TH} !text-right`}>Barangays</th>
								<th className={`${TH} !text-right`}>Health stations</th>
								<th className={`${TH} !text-right`}>Per 10 barangays</th>
								<th className={`${TH} !text-right`}>People per station</th>
								<th className={`${TH} !text-right`}>Health units</th>
								<th className={`${TH} !text-right`}>Birthing homes</th>
								<th className={`${TH} !text-right`}>Hospitals</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-[var(--rule-soft)]'>
							{rows.map((t) => (
								<tr key={`${t.area}/${t.slug}`}>
									<td className={TD}>
										<Link href={`/towns/${t.area}/${t.slug}`} className='rule-link font-semibold'>
											{t.name}
										</Link>
										{!area ? <span className='ml-2 text-[0.75rem] text-[var(--ink-3)]'>{t.areaName}</span> : null}
									</td>
									<td className={`${TD} num text-right`}>{n(t.population)}</td>
									<td className={`${TD} num text-right`}>{n(t.barangays)}</td>
									{t.onRegistry ? (
										<>
											<td className={`${TD} num text-right`}>{t.stations}</td>
											<td className={`${TD} num text-right`}>
												<span className={t.per10 != null && t.per10 < 1 ? 'font-bold text-[var(--accent)]' : ''}>{t.per10 ?? '–'}</span>
											</td>
											<td className={`${TD} num text-right`}>{t.stations ? n(t.perStation) : <span className='text-[var(--accent)]'>No station</span>}</td>
											<td className={`${TD} num text-right`}>{t.units || '–'}</td>
											<td className={`${TD} num text-right`}>{t.birthing || '–'}</td>
											<td className={`${TD} num text-right`}>{t.hospitals || '–'}</td>
										</>
									) : (
										<td colSpan={6} className={`${TD} text-[var(--ink-3)]`}>
											Not on the 2021 registry
										</td>
									)}
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<p className='mt-8 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
					Facilities are the Department of Health&rsquo;s registry count as of {asOf}, government and private together; people are the
					LGU directory&rsquo;s latest census figure, so the two are some years apart. A station can serve more than one barangay, so
					&ldquo;per 10 barangays&rdquo; is a ratio, not a share of barangays covered. Fewer than one station for every 10 barangays is
					marked. &ldquo;No station&rdquo; means the registry counted none in the town, not that none was built since. The Special
					Geographic Area&rsquo;s towns were created after the count.
				</p>
			</section>
		</>
	)
}
