import { EntityExplorer, type EntityRow } from './_components/entity-explorer'
import Link from 'next/link'
import { Figures, Masthead, YearBars, longDate, peso } from './_components/parts'
import { TopChart } from './_components/top-chart'
import { entities, entityTotals, openNotices, regionByYear, regionTotals, suppliers, topCategories, years } from './_lib/philgeps'

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
				plain
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

			{openNotices.length ? (
				<section className='bg-[var(--paper-2)]'>
					<div className='bb-container bb-section'>
					<div className='flex flex-wrap items-end justify-between gap-x-10 gap-y-3'>
						<div>
							<h2 className='text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>Open for bids</h2>
							<p className='mt-2 text-[14px] leading-6 text-[var(--ink-3)]'>
								{openNotices.length} notices still taking bids, closing soonest first.
							</p>
						</div>
						<Link href='/notices?stage=Open+for+bids' className='rule-link text-[14px] font-semibold text-[var(--ink)]'>
							See all {openNotices.length}
						</Link>
					</div>
					<ul className='mt-8 grid gap-x-12 border-t border-[var(--rule)] lg:grid-cols-2'>
						{openNotices.slice(0, 6).map((n) => (
							<li key={n.ref} className='grid grid-cols-[minmax(0,1fr)_auto] gap-x-8 border-b border-[var(--rule)] py-4'>
								<div className='min-w-0'>
									<p className='line-clamp-2 text-[14.5px] font-semibold leading-6 text-[var(--ink)]'>{n.title ?? n.category}</p>
									<p className='mt-1 truncate text-[12px] text-[var(--ink-3)]'>
										<Link href={`/${entities[n.entity]!.slug}`} className='rule-link'>
											{entities[n.entity]!.name}
										</Link>
										{n.mode ? ` · ${n.mode}` : null}
									</p>
								</div>
								<div className='text-right'>
									<p className='num text-[15px] font-semibold text-[var(--ink)]'>{n.abc == null ? '—' : peso(n.abc)}</p>
									{n.closing ? <p className='mt-1 text-[11.5px] font-semibold text-[var(--accent)]'>Closes {longDate(n.closing)}</p> : null}
								</div>
							</li>
						))}
					</ul>
					</div>
				</section>
			) : null}

			<section className='bb-container bb-section'>
				<TopChart
					title='Top 15'
					rankings={[
						{
							key: 'suppliers',
							tab: 'Suppliers',
							note: 'Suppliers by the amount of contracts awarded to them.',
							format: 'peso',
							items: suppliers.slice(0, 15).map((s) => ({ label: s.name, value: s.amount, href: `/notices?supplier=${encodeURIComponent(s.name)}` })),
						},
						{
							key: 'offices',
							tab: 'Offices',
							note: 'Offices by the approved budget of the notices they posted.',
							format: 'peso',
							items: entities
								.map((e) => ({ label: e.name, value: entityTotals[e.index]!.all.abc, href: `/${e.slug}` }))
								.sort((a, b) => b.value - a.value)
								.slice(0, 15),
						},
						{ key: 'categories', tab: 'Categories', note: 'What offices buy: the largest categories, by approved budget.', format: 'peso', items: topCategories },
						{
							key: 'wins',
							tab: 'Most contracts',
							note: 'Suppliers by the number of contracts awarded to them.',
							format: 'count',
							items: [...suppliers]
								.sort((a, b) => b.awards - a.awards)
								.slice(0, 15)
								.map((s) => ({ label: s.name, value: s.awards, href: `/notices?supplier=${encodeURIComponent(s.name)}` })),
						},
					]}
				/>
			</section>

			<section className='bb-container pb-[clamp(3.75rem,7vw,6.5rem)]'>
				<h2 className='mb-8 border-t border-[var(--rule)] pt-12 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>Every office</h2>
				<EntityExplorer rows={rows} years={years} />
				<p className='mt-10 text-[13px] leading-6 text-[var(--ink-3)]'>
					An approved budget is what an office set aside for a purchase, not what it paid. Awards are only those PhilGEPS
					records on the legacy system; the modernized system&rsquo;s awards are not published by agency. Open notices,
					sources of funds and closing dates are read from the modernized system&rsquo;s own notice pages.
				</p>
			</section>
		</>
	)
}
