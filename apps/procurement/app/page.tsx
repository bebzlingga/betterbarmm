import { EntityExplorer, type EntityRow } from './_components/entity-explorer'
import { Figures, Masthead, RankBars, YearBars, peso } from './_components/parts'
import { entities, entityTotals, regionByYear, regionTotals, suppliers, topCategories, years } from './_lib/philgeps'

const figures = (t: { notices: number; abc: number; awards: number; contracts: number }) =>
	[t.notices, Math.round(t.abc), t.awards, Math.round(t.contracts)] as [number, number, number, number]

export default function ProcurementHome() {
	const rows: EntityRow[] = entities.map((e) => ({
		slug: e.slug,
		name: e.name,
		type: e.type,
		all: figures(entityTotals[e.index]!.all),
		byYear: Object.fromEntries(Object.entries(entityTotals[e.index]!.byYear).map(([y, t]) => [y, figures(t)])),
	}))

	return (
		<>
			<Masthead
				kicker='Procurement · Bangsamoro'
				name='Who buys what'
				chart
				note='Every bid notice a BARMM government office has posted on PhilGEPS since 2019, when BARMM began: what it set out to buy, its approved budget, and, where PhilGEPS records one, who won the contract and for how much.'
			>
				<YearBars
					bars={years.map((year) => ({ year, value: regionByYear[year]?.abc ?? 0 }))}
					caption='Approved budget of the notices BARMM offices posted, by year'
					note={`${years.at(-1)} is the year so far.`}
				/>
			</Masthead>

			<Figures
				title='Since 2019'
				note='What BARMM offices have put out to bid on PhilGEPS, and what has been awarded so far. An approved budget is the most an office may pay; an award is the contract it signed.'
				years={years}
				items={[
					{ value: regionTotals.notices.toLocaleString('en-PH'), label: 'Bid notices posted', series: years.map((y) => regionByYear[y]?.notices ?? 0) },
					{ value: peso(regionTotals.abc), label: 'Approved budget', series: years.map((y) => regionByYear[y]?.abc ?? 0) },
					{ value: regionTotals.awards.toLocaleString('en-PH'), label: 'Contracts awarded', series: years.map((y) => regionByYear[y]?.awards ?? 0) },
					{ value: peso(regionTotals.contracts), label: 'Awarded amount', series: years.map((y) => regionByYear[y]?.contracts ?? 0) },
				]}
			/>

			<section className='bb-container bb-section grid gap-x-20 gap-y-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
				<RankBars
					title='Top 10 suppliers'
					note='By the amount of contracts awarded to them.'
					format='peso'
					items={suppliers.slice(0, 10).map((s) => ({ label: s.name, value: s.amount, href: `/notices?supplier=${encodeURIComponent(s.name)}` }))}
				/>
				<RankBars
					title='Top 10 offices'
					note='By the approved budget of the notices they posted.'
					format='peso'
					items={entities
						.map((e) => ({ label: e.name, value: entityTotals[e.index]!.all.abc, href: `/${e.slug}` }))
						.sort((a, b) => b.value - a.value)
						.slice(0, 10)}
				/>
				<RankBars title='What they buy' note='The 10 largest categories, by approved budget.' format='peso' items={topCategories} />
				<RankBars
					title='Most contracts won'
					note='Suppliers by the number of contracts awarded to them.'
					format='count'
					items={[...suppliers]
						.sort((a, b) => b.awards - a.awards)
						.slice(0, 10)
						.map((s) => ({ label: s.name, value: s.awards, href: `/notices?supplier=${encodeURIComponent(s.name)}` }))}
				/>
			</section>

			<section className='bb-container pb-[clamp(3.75rem,7vw,6.5rem)]'>
				<h2 className='mb-8 border-t border-[var(--rule)] pt-12 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>Every office</h2>
				<EntityExplorer rows={rows} years={years} />
				<p className='mt-10 text-[13px] leading-6 text-[var(--ink-3)]'>
					An approved budget is what an office set aside for a purchase, not what it paid. Awards are only those PhilGEPS
					records on the legacy system; the modernized system&rsquo;s awards are not published by agency.
				</p>
			</section>
		</>
	)
}
