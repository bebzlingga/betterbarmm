import type { Metadata } from 'next'
import { DpwhExplorer } from '../_components/dpwh-explorer'
import { Figures, Masthead, YearBars, peso } from '../_components/parts'
import { dpwh, nationalAreas, nationalCategories, nationalOffices, nationalStatuses, nationalWorks, nationalYears } from '../_lib/dpwh'

export const metadata: Metadata = {
	title: 'DPWH projects',
	description: 'Every Department of Public Works and Highways project inside the Bangsamoro since 2016: where it is, who built it, who bid, and the contract papers.',
}

export default async function DpwhPage({ searchParams }: { searchParams: Promise<{ area?: string; q?: string }> }) {
	const { area, q } = await searchParams
	const of = (y: number) => nationalWorks.filter((w) => w.year === y)
	const cost = (ws: typeof nationalWorks) => ws.reduce((s, w) => s + (w.cost ?? 0), 0)
	const byYear = (fn: (y: number) => number) => nationalYears.map(fn)
	const towns = new Set(nationalWorks.map((w) => `${w.area}/${w.town.slug}`))
	const oneBidder = (ws: typeof nationalWorks) => ws.filter((w) => w.bidders.length === 1).length

	return (
		<>
			<Masthead
				kicker='Public works · DPWH'
				name='What DPWH builds here'
				chart
				note={`DPWH has no regional office in the Bangsamoro, but the offices around it build inside it. These are the ${nationalWorks.length.toLocaleString('en-PH')} projects its Transparency Portal places in the region, ${nationalYears[0]} to ${nationalYears.at(-1)}: where each is, who built it, who bid, and the contract papers.`}
			>
				<YearBars
					bars={nationalYears.map((year) => ({ year, value: cost(of(year)) }))}
					caption='DPWH contracts inside the region, by infrastructure year'
					note={`${nationalYears.at(-1)}: ${of(nationalYears.at(-1)!).length} projects still for procurement, none let yet`}
				/>
			</Masthead>

			<Figures
				title={`Since ${nationalYears[0]}`}
				note='Counted off the portal’s contracts. A contract’s cost is what it was let for, as the portal shows it now; what has been paid is not in the copy read here.'
				years={nationalYears}
				items={[
					{ value: nationalWorks.length.toLocaleString('en-PH'), label: 'Projects', series: byYear((y) => of(y).length) },
					{ value: peso(cost(nationalWorks)), label: 'In contracts', series: byYear((y) => cost(of(y))) },
					{ value: towns.size.toLocaleString('en-PH'), label: 'Towns and cities', series: byYear((y) => new Set(of(y).map((w) => w.town.slug)).size) },
					{ value: oneBidder(nationalWorks).toLocaleString('en-PH'), label: 'Let with a single bidder', series: byYear((y) => oneBidder(of(y))) },
				]}
			/>

			<section className='bb-container bb-section'>
				<DpwhExplorer
					key={`${area ?? ''}-${q ?? ''}`}
					years={nationalYears}
					areas={nationalAreas.map((a) => a.name)}
					categories={nationalCategories}
					statuses={nationalStatuses}
					offices={nationalOffices}
					initial={{ area, q }}
				/>
				<p className='mt-10 max-w-[48rem] text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
					From the{' '}
					<a href={dpwh.source.href} className='rule-link'>
						{dpwh.source.label}
					</a>
					, read through a{' '}
					<a href={dpwh.source.viaHref} className='rule-link'>
						public copy of it
					</a>{' '}
					because the portal blocks automated reading. A project is placed in the town its description names, or where its map
					point falls; open a project to see which. These are DPWH&rsquo;s contracts, not the Ministry of Public Works&rsquo;:
					those are on the{' '}
					<a href='/' className='rule-link'>
						Bangsamoro budget
					</a>{' '}
					page.
				</p>
			</section>
		</>
	)
}
