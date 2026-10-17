import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Lines, linkClass } from '../../../_components/directory-bits'
import { Masthead } from '../../../_components/masthead'
import { SiteHeader } from '../../../_components/site-header'
import { emergencyMeta, localGovernments, localGroup, localLineage, provinceLines } from '../../../_lib/directory'
import { pageMeta } from '../../../_lib/seo'

export function generateStaticParams() {
	return localGovernments.map((g) => ({ province: g.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ province: string }> }): Promise<Metadata> {
	const g = localGroup((await params).province)
	if (!g) return { title: 'Directory', robots: { index: false, follow: true } }
	return pageMeta({
		title: `${g.name} — Directory`,
		description: `The governor, mayors and emergency numbers of ${g.name}, and who has governed it since 2007.`,
		path: `/directory/lgu/${g.slug}`,
	})
}

export default async function ProvincePage({ params }: { params: Promise<{ province: string }> }) {
	const g = localGroup((await params).province)
	if (!g) notFound()
	const isProvince = g.kind === 'Province'
	const lines = provinceLines(g.slug)
	const lineage = isProvince ? localLineage('governor', g.slug) : []

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='directory' />
			<Masthead brand label={g.kind} lines={[g.name]} />

			<section className='bb-container bb-section'>
				<p className='text-[13.5px] text-[var(--ink-3)]'>
					<Link href='/directory' className={linkClass}>
						Directory
					</Link>{' '}
					· <a href={g.lguHref} className={linkClass}>{g.name} profile</a>
				</p>

				{isProvince ? (
					<div className='mt-8 grid gap-6 sm:grid-cols-2'>
						<div className='border-t border-[var(--ink)] pt-4'>
							<p className='font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>Governor</p>
							<p className='mt-1 text-[22px] font-extrabold tracking-[-0.02em]'>{g.governor ?? 'Not in the canvass'}</p>
						</div>
						<div className='border-t border-[var(--rule)] pt-4'>
							<p className='font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>Vice governor</p>
							<p className='mt-1 text-[22px] font-extrabold tracking-[-0.02em]'>{g.viceGovernor ?? '–'}</p>
						</div>
					</div>
				) : null}

				<section aria-labelledby='lines' className='mt-14'>
					<h2 id='lines' className='text-[20px] font-extrabold'>
						Who to call, province-wide
					</h2>
					<Lines lines={lines} empty='No province-wide numbers found on an official page yet.' />
					<p className='mt-3 text-[12.5px] text-[var(--ink-3)]'>{emergencyMeta.note}</p>
				</section>

				<section aria-labelledby='towns' className='mt-14'>
					<h2 id='towns' className='text-[20px] font-extrabold'>
						{g.units.length === 1 ? 'The city' : 'Towns and cities'} <span className='text-[var(--ink-mute)]'>{g.units.length}</span>
					</h2>
					<table className='mt-3 w-full table-fixed border-collapse text-[13.5px]'>
						<thead>
							<tr className='border-b border-[var(--ink)] text-left text-[10.5px] uppercase tracking-[0.1em] text-[var(--ink-3)]'>
								<th className='w-1/2 py-2 pr-4 font-semibold sm:w-1/3'>Town or city</th>
								<th className='w-1/2 py-2 pr-4 font-semibold sm:w-1/3'>Mayor</th>
								<th className='hidden py-2 pr-4 font-semibold sm:table-cell sm:w-1/3'>Vice mayor</th>
							</tr>
						</thead>
						<tbody>
							{g.units.map((u) => (
								<tr key={u.slug} className='border-b border-[var(--rule-soft)] align-top'>
									<td className='py-2 pr-4'>
										<Link href={u.href} className={linkClass}>
											{u.name}
										</Link>
										{u.isCity ? <span className='ml-1.5 text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]'>City</span> : null}
									</td>
									<td className='py-2 pr-4'>{u.head ?? <span className='text-[var(--ink-mute)]'>Not in the canvass</span>}</td>
									<td className='hidden py-2 pr-4 text-[var(--ink-2)] sm:table-cell'>{u.deputy ?? '–'}</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>

				{lineage.length ? (
					<section aria-labelledby='lineage' className='mt-14'>
						<h2 id='lineage' className='text-[20px] font-extrabold'>
							Governors since 2007
						</h2>
						<ol className='mt-3 divide-y divide-[var(--rule-soft)] border-y border-[var(--rule)] text-[14px]'>
							{lineage.map((r) => (
								<li key={r.term} className='grid grid-cols-[7rem_minmax(0,1fr)] gap-4 py-2.5'>
									<span className='tabular-nums text-[var(--ink-3)]'>{r.term}</span>
									<span>
										{r.name ?? <span className='text-[var(--ink-mute)]'>No record</span>}
										{r.party ? <span className='ml-2 text-[12px] text-[var(--ink-3)]'>{r.party}</span> : null}
									</span>
								</li>
							))}
						</ol>
						{g.slug.startsWith('maguindanao') ? (
							<p className='mt-3 text-[12.5px] text-[var(--ink-3)]'>
								Maguindanao divided in 2022; before 2025 both of its halves show the one governor of the undivided province.
							</p>
						) : null}
					</section>
				) : null}
			</section>
		</main>
	)
}
