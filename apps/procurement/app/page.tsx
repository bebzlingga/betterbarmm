import { EntityExplorer, type EntityRow } from './_components/entity-explorer'
import { Figures, Masthead, YearBars, peso } from './_components/parts'
import { entities, entityTotals, regionByYear, regionTotals, years } from './_lib/philgeps'

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
				items={[
					{ value: regionTotals.notices.toLocaleString('en-PH'), label: 'Bid notices posted' },
					{ value: peso(regionTotals.abc), label: 'Approved budget' },
					{ value: regionTotals.awards.toLocaleString('en-PH'), label: 'Contracts awarded' },
					{ value: peso(regionTotals.contracts), label: 'Awarded amount' },
				]}
			/>

			<section className='bb-container bb-section'>
				<EntityExplorer rows={rows} years={years} />
				<p className='mt-10 text-[13px] leading-6 text-[var(--ink-3)]'>
					An approved budget is what an office set aside for a purchase, not what it paid. Awards are only those PhilGEPS
					records on the legacy system; the modernized system&rsquo;s awards are not published by agency.
				</p>
			</section>
		</>
	)
}
