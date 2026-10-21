import { barangayOfficials } from '@betterbarmm/lgu-data/barangay-officials'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LguEmailBlock, Lines, linkClass, monthYear } from '../../../../_components/directory-bits'
import { PlaceHeader } from '../../../../_components/directory-places'
import { DirectoryDialog } from '../../../../_components/directory-dialog'
import { barangayRows, emergencyMeta, lguEmail, localGovernments, localGroup, localLineage, townLines } from '../../../../_lib/directory'
import { pageMeta } from '../../../../_lib/seo'
import { DirectoryServices } from '../../../../_components/directory-services'
import { lguByKey, lguHasCharter, lguHref } from '../../../../_lib/lgu-services'

export function generateStaticParams() {
	return localGovernments.flatMap((g) => g.units.map((u) => ({ province: g.slug, town: u.slug })))
}

const find = (province: string, town: string) => {
	const g = localGroup(province)
	const u = g?.units.find((x) => x.slug === town)
	return g && u ? { g, u } : null
}

export async function generateMetadata({ params }: { params: Promise<{ province: string; town: string }> }): Promise<Metadata> {
	const { province, town } = await params
	const hit = find(province, town)
	if (!hit) return { title: 'Directory', robots: { index: false, follow: true } }
	return pageMeta({
		title: `${hit.u.name}, ${hit.g.name} — Directory`,
		description: `The mayor and barangay officials of ${hit.u.name}, ${hit.g.name}, its emergency numbers, and who has held the mayoralty since 2007.`,
		path: `/directory/lgu/${province}/${town}`,
	})
}

export default async function TownPage({ params }: { params: Promise<{ province: string; town: string }> }) {
	const { province, town } = await params
	const hit = find(province, town)
	if (!hit) notFound()
	const { g, u } = hit
	const lines = townLines(province, town)
	const barangays = barangayRows(province, town)
	const listed = barangays.filter((b) => b.captain).length
	const lineage = localLineage('mayor', province, town)
	const lgu = lguByKey(`${province}/${town}`)

	return (
		<DirectoryDialog id={`${g.slug}/${u.slug}`} name={u.name}>
			<PlaceHeader label={`${u.isCity ? 'City' : 'Municipality'} · ${g.name}`} province={g.slug} town={u.slug} name={u.name} />

			<section className='bb-container bb-section'>
				<div className='grid gap-6 sm:grid-cols-2'>
					<div className='border-t border-[var(--ink)] pt-4'>
						<p className='mb-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]'>Mayor</p>
						<p className='mt-1 text-[22px] font-extrabold tracking-[-0.02em]'>{u.head ?? 'Not in the canvass'}</p>
					</div>
					<div className='border-t border-[var(--rule)] pt-4'>
						<p className='mb-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]'>Vice mayor</p>
						<p className='mt-1 text-[22px] font-extrabold tracking-[-0.02em]'>{u.deputy ?? '–'}</p>
					</div>
				</div>

				<LguEmailBlock email={lguEmail(province, town)} />

				<section aria-labelledby='lines' className='mt-14'>
					<h2 id='lines' className='text-[20px] font-extrabold'>
						Who to call
					</h2>
					<Lines lines={lines} empty='No town numbers found on an official page yet. The province’s lines are on its page.' />
					<p className='mt-3 text-[12.5px] text-[var(--ink-3)]'>{emergencyMeta.note}</p>
				</section>

				{lgu ? <DirectoryServices services={lguHasCharter(lgu) ? lgu.services : []} href={lguHref(lgu)} base='/services/lgu' note={lgu ? (lguHasCharter(lgu) ? 'From its Citizen’s Charter: what to bring, the fee and how long each takes.' : (lgu.charterNote ?? 'No Citizen’s Charter of its own was found online.')) : ''} /> : null}

				<section aria-labelledby='barangays' className='mt-14'>
					<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
						<h2 id='barangays' className='text-[20px] font-extrabold'>
							Barangays <span className='text-[var(--ink-mute)]'>{barangays.length}</span>
						</h2>
						<p className='text-[12.5px] text-[var(--ink-3)]'>
							DILG’s directory names a punong barangay for {listed} of {barangays.length}, as of {monthYear(barangayOfficials.capturedAt.slice(0, 7))}.
						</p>
					</div>
					<table className='mt-3 w-full table-fixed border-collapse text-[13.5px]'>
						<thead>
							<tr className='border-b border-[var(--ink)] text-left text-[10.5px] uppercase tracking-[0.1em] text-[var(--ink-3)]'>
								<th className='w-1/3 py-2 pr-4 font-semibold'>Barangay</th>
								<th className='w-1/3 py-2 pr-4 font-semibold'>Punong barangay</th>
								<th className='hidden w-1/3 py-2 pr-4 font-semibold sm:table-cell'>SK chairperson</th>
							</tr>
						</thead>
						<tbody>
							{barangays.map((b) => (
								<tr key={b.name} className='border-b border-[var(--rule-soft)] align-top'>
									<td className='py-2 pr-4'>{b.name}</td>
									<td className='py-2 pr-4'>{b.captain ?? <span className='text-[var(--ink-mute)]'>Not in DILG’s directory</span>}</td>
									<td className='hidden py-2 pr-4 text-[var(--ink-2)] sm:table-cell'>{b.sk ?? '–'}</td>
								</tr>
							))}
						</tbody>
					</table>
					<p className='mt-3 text-[12.5px] leading-6 text-[var(--ink-3)]'>
						To write to a barangay, use{' '}
						<a href={barangayOfficials.source.href} target='_blank' rel='noreferrer' className={linkClass}>
							{barangayOfficials.source.label}
						</a>
						, which carries each office’s e-mail and hall number; they are not copied here.
					</p>
				</section>

				<section aria-labelledby='lineage' className='mt-14'>
					<h2 id='lineage' className='text-[20px] font-extrabold'>
						Mayors since 2007
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
					<p className='mt-3 text-[12.5px] text-[var(--ink-3)]'>The winner of each election, from COMELEC’s canvass and OpenHalalan’s rebuild of the older returns. A succession mid-term is not shown.</p>
				</section>
			</section>
		</DirectoryDialog>
	)
}
