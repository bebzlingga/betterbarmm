import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead, peso } from '../_components/parts'
import { nationalWorks } from '../_lib/dpwh'
import { works } from '../_lib/works'

export const metadata: Metadata = {
	title: 'By town',
	description: 'Every BARMM town and city by its public works: the projects the Bangsamoro budget names in it since FY 2020, and the DPWH contracts let inside it since 2016.',
}

const TH = 'py-2.5 pr-6 text-[0.71875rem] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)] last:pr-0'
const TD = 'py-3 pr-6 align-top last:pr-0'

type Town = { area: string; areaName: string; slug: string; name: string; count: number; amount: number; dCount: number; dCost: number }

export default function TownsPage() {
	const towns = new Map<string, Town>()
	const at = (area: string, areaName: string, slug: string, name: string) => {
		const k = `${area}/${slug}`
		const t = towns.get(k) ?? { area, areaName, slug, name, count: 0, amount: 0, dCount: 0, dCost: 0 }
		towns.set(k, t)
		return t
	}
	for (const w of works) {
		if (!w.town || !w.area) continue
		const t = at(w.area, w.areaName, w.town.slug, w.town.name)
		t.count += 1
		t.amount += w.amount
	}
	for (const w of nationalWorks) {
		const t = at(w.area, w.areaName, w.town.slug, w.town.name)
		t.dCount += 1
		t.dCost += w.cost ?? 0
	}
	const rows = [...towns.values()].sort((a, b) => b.amount + b.dCost - (a.amount + a.dCost))
	const unplaced = works.filter((w) => !w.town)
	const q = (t: Town) => `area=${encodeURIComponent(t.areaName)}&q=${encodeURIComponent(t.name)}`

	return (
		<>
			<Masthead
				kicker='Public works · Bangsamoro'
				name='By town'
				note='Each town and city by the two records of what is built in it: the projects the Bangsamoro budget names there, and the contracts DPWH let there. They are separate builders and separate money, so neither column contains the other.'
			/>
			<section className='bb-container bb-section'>
				<div className='overflow-x-auto'>
					<table className='w-full min-w-[46rem] border-collapse text-left text-[0.875rem]'>
						<thead>
							<tr className='border-b border-[var(--rule)]'>
								<th className={TH}>#</th>
								<th className={TH}>Town or city</th>
								<th className={`${TH} text-right`}>Regional projects</th>
								<th className={`${TH} text-right`}>Appropriated</th>
								<th className={`${TH} text-right`}>DPWH projects</th>
								<th className={`${TH} text-right`}>In contracts</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((t, i) => (
								<tr key={`${t.area}/${t.slug}`} className='border-b border-[var(--rule)]'>
									<td className={`${TD} num text-[var(--ink-3)]`}>{i + 1}</td>
									<td className={TD}>
										<span className='font-semibold text-[var(--ink)]'>{t.name}</span>
										{t.area !== 'cotabato-city' ? <span className='text-[var(--ink-3)]'> · {t.areaName}</span> : null}
									</td>
									<td className={`${TD} num text-right`}>
										{t.count ? (
											<Link href={`/?${q(t)}`} className='rule-link'>
												{t.count}
											</Link>
										) : (
											<span className='text-[var(--ink-mute)]'>—</span>
										)}
									</td>
									<td className={`${TD} num whitespace-nowrap text-right font-semibold`}>{t.amount ? peso(t.amount) : ''}</td>
									<td className={`${TD} num text-right`}>
										{t.dCount ? (
											<Link href={`/dpwh?${q(t)}`} className='rule-link'>
												{t.dCount}
											</Link>
										) : (
											<span className='text-[var(--ink-mute)]'>—</span>
										)}
									</td>
									<td className={`${TD} num whitespace-nowrap text-right font-semibold`}>{t.dCost ? peso(t.dCost) : ''}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<p className='mt-8 max-w-[48rem] text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
					{unplaced.length.toLocaleString('en-PH')} regional projects ({peso(unplaced.reduce((s, w) => s + w.amount, 0))}) name no town the
					directory knows: inter-town roads, sitios named alone, and Sulu&rsquo;s, whose towns left the region in 2024. They are in
					the full list under their province. Every DPWH project here has a town, by its map point or its description.
				</p>
			</section>
		</>
	)
}
