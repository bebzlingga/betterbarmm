import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead, peso } from '../_components/parts'
import { works } from '../_lib/works'

export const metadata: Metadata = {
	title: 'By town',
	description: 'Every BARMM town and city by the public works the Bangsamoro budget has funded in it since FY 2020: how many projects and how much.',
}

const TH = 'py-2.5 pr-6 text-[0.71875rem] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)] last:pr-0'
const TD = 'py-3 pr-6 align-top last:pr-0'

export default function TownsPage() {
	const towns = new Map<string, { area: string; areaName: string; slug: string; name: string; count: number; amount: number; latest: number }>()
	for (const w of works) {
		if (!w.town || !w.area) continue
		const k = `${w.area}/${w.town.slug}`
		const t = towns.get(k) ?? { area: w.area, areaName: w.areaName, slug: w.town.slug, name: w.town.name, count: 0, amount: 0, latest: 0 }
		t.count += 1
		t.amount += w.amount
		t.latest = Math.max(t.latest, w.year)
		towns.set(k, t)
	}
	const rows = [...towns.values()].sort((a, b) => b.amount - a.amount)
	const unplaced = works.filter((w) => !w.town)

	return (
		<>
			<Masthead
				kicker='Public works · Bangsamoro'
				name='By town'
				note='Each town and city by the projects the Acts name in it. A project is placed where its own name says it is; those whose names give no town are counted under their province below.'
			/>
			<section className='bb-container bb-section'>
				<div className='overflow-x-auto'>
					<table className='w-full min-w-[40rem] border-collapse text-left text-[0.875rem]'>
						<thead>
							<tr className='border-b border-[var(--rule)]'>
								<th className={TH}>#</th>
								<th className={TH}>Town or city</th>
								<th className={`${TH} text-right`}>Projects</th>
								<th className={`${TH} text-right`}>Appropriated</th>
								<th className={`${TH} text-right`}>Latest</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((t, i) => (
								<tr key={`${t.area}/${t.slug}`} className='border-b border-[var(--rule)]'>
									<td className={`${TD} num text-[var(--ink-3)]`}>{i + 1}</td>
									<td className={TD}>
										<Link href={`/?area=${encodeURIComponent(t.areaName)}&q=${encodeURIComponent(t.name)}`} className='rule-link font-semibold text-[var(--ink)]'>
											{t.name}
										</Link>
										<span className='text-[var(--ink-3)]'> · {t.areaName}</span>
									</td>
									<td className={`${TD} num text-right`}>{t.count}</td>
									<td className={`${TD} num whitespace-nowrap text-right font-semibold`}>{peso(t.amount)}</td>
									<td className={`${TD} num text-right text-[var(--ink-3)]`}>FY {t.latest}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<p className='mt-8 max-w-[48rem] text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
					{unplaced.length.toLocaleString('en-PH')} projects ({peso(unplaced.reduce((s, w) => s + w.amount, 0))}) name no town the
					directory knows: inter-town roads, sitios named alone, and Sulu&rsquo;s, whose towns left the region in 2024. They are in
					the full list under their province.
				</p>
			</section>
		</>
	)
}
