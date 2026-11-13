import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead } from '../_components/parts'
import { areaNameOf, divisions, latestSY } from '../_lib/education'

export const metadata: Metadata = {
	title: 'Divisions and districts',
	description: 'The schools divisions and districts the public schools of the Bangsamoro are run under, each with its schools and pupils.',
}

const TH = 'py-2.5 pr-6 last:pr-0 text-left font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
const TD = 'py-2.5 pr-6 last:pr-0 align-top'

export default function DistrictsPage() {
	const districts = divisions.reduce((n, d) => n + d.districts.length, 0)
	return (
		<>
			<Masthead
				kicker='Education · Bangsamoro'
				name='Divisions and districts'
				note={`A public school answers to a district, and the district to a schools division: ${districts} districts in ${divisions.length} divisions, as the Department of Education files them for school year ${latestSY}. Each district with its schools, its learners and the towns it covers.`}
			/>

			<section className='bb-container bb-section'>
				<div className='space-y-14'>
					{divisions.map((dv) => (
						<section key={dv.name}>
							<h2 className='flex flex-wrap items-baseline gap-x-3 border-b border-[var(--rule)] pb-2'>
								<span className='text-[1.25rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>{dv.name}</span>
								<span className='text-[0.78125rem] text-[var(--ink-3)]'>
									{areaNameOf(dv.area)} · {dv.districts.length} {dv.districts.length === 1 ? 'district' : 'districts'} · {dv.schools.toLocaleString('en-PH')} schools ·{' '}
									{dv.pupils.toLocaleString('en-PH')} pupils
								</span>
							</h2>
							<div className='overflow-x-auto'>
								<table className='w-full min-w-[36rem] text-[0.875rem]'>
									<thead>
										<tr>
											<th className={TH}>District</th>
											<th className={TH}>Towns</th>
											<th className={`${TH} !text-right`}>Schools</th>
											<th className={`${TH} !text-right`}>Learners {latestSY}</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-[var(--rule-soft)]'>
										{dv.districts.map((d) => (
											<tr key={d.full}>
												<td className={TD}>
													<Link href={`/schools?district=${encodeURIComponent(d.full)}`} className='rule-link font-semibold'>
														{d.name}
													</Link>
												</td>
												<td className={`${TD} text-[var(--ink-3)]`}>{d.towns.join(', ')}</td>
												<td className={`${TD} num text-right`}>{d.schools.toLocaleString('en-PH')}</td>
												<td className={`${TD} num text-right`}>{d.pupils ? d.pupils.toLocaleString('en-PH') : '–'}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</section>
					))}
				</div>
				<p className='mt-12 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
					Divisions and districts are as DepEd names them for school year {latestSY}; Maguindanao’s two divisions keep their old names,
					though the province has since split into del Norte and del Sur. Private schools, madaris and colleges answer to no district, so they
					are not counted here.
				</p>
			</section>
		</>
	)
}
