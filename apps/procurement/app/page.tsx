import { EntityExplorer, type EntityRow } from './_components/entity-explorer'
import Link from 'next/link'
import { ArrowRightIcon, TimerIcon } from '@phosphor-icons/react/ssr'
import { CARD, Figures, Masthead, SectionHead, YearBars, longDate, peso } from './_components/parts'
import { TopChart } from './_components/top-chart'
import { entities, entityTotals, openNotices, supplierHref, regionByYear, regionTotals, suppliers, topCategories, years } from './_lib/philgeps'

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
				<section className='tv-wash'>
					<div className='bb-container py-[clamp(4rem,8vw,6.5rem)]'>
						<SectionHead title='Open for bids' note={`${openNotices.length} notices still taking bids, closing soonest first.`}>
							<Link href='/notices?stage=Open+for+bids' className='dv-pill'>
								See all {openNotices.length}
								<ArrowRightIcon size={14} weight='bold' aria-hidden='true' />
							</Link>
						</SectionHead>
						<ul className='mt-10 grid gap-4 lg:grid-cols-2'>
							{openNotices.slice(0, 6).map((n) => (
								<li key={n.ref} className={`${CARD} flex gap-4 p-5 sm:p-6`}>
									<span className='hidden size-11 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)] sm:grid'>
										<TimerIcon size={22} weight='duotone' aria-hidden='true' />
									</span>
									<div className='grid min-w-0 flex-1 gap-x-6 sm:grid-cols-[minmax(0,1fr)_auto]'>
										<div className='min-w-0'>
											<p className='line-clamp-2 font-[family-name:var(--font-display)] text-[0.96875rem] font-bold leading-6 text-[var(--ink)]'>{n.title ?? n.category}</p>
											<p className='mt-1 truncate text-[0.78125rem] text-[var(--ink-3)]'>
												<Link href={`/${entities[n.entity]!.slug}`} className='rule-link'>
													{entities[n.entity]!.name}
												</Link>
												{n.mode ? ` · ${n.mode}` : null}
											</p>
										</div>
										<div className='mt-3 flex items-center justify-between gap-3 sm:mt-0 sm:block sm:text-right'>
											<p className='num text-[1rem] font-bold text-[var(--ink)]'>{n.abc == null ? '—' : peso(n.abc)}</p>
											{n.closing ? (
												<p className='mt-1.5 inline-block whitespace-nowrap rounded-full bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-2.5 py-0.5 text-[0.6875rem] font-semibold text-[var(--accent)]'>
													Closes {longDate(n.closing)}
												</p>
											) : null}
										</div>
									</div>
								</li>
							))}
						</ul>
					</div>
				</section>
			) : null}

			<section className='bb-container py-[clamp(4rem,8vw,6.5rem)]'>
				<TopChart
					title='Top 15'
					rankings={[
						{
							key: 'suppliers',
							tab: 'Suppliers',
							note: 'Suppliers by the amount of contracts awarded to them.',
							format: 'peso',
							items: suppliers.slice(0, 15).map((s) => ({ label: s.name, value: s.amount, href: supplierHref(s.name) })),
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
								.map((s) => ({ label: s.name, value: s.awards, href: supplierHref(s.name) })),
						},
					]}
				/>
			</section>

			<section className='tv-wash-flip'>
				<div className='bb-container py-[clamp(4rem,8vw,6.5rem)]'>
					<SectionHead title='Every office' note='Every BARMM procuring entity on PhilGEPS, ranked by the approved budget of the notices it posted.' />
					<div className='mt-10'>
						<EntityExplorer rows={rows} years={years} />
					</div>
					<p className='mt-10 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
						An approved budget is what an office set aside for a purchase, not what it paid. Awards are only those PhilGEPS
						records on the legacy system; the modernized system&rsquo;s awards are not published by agency. Open notices,
						sources of funds and closing dates are read from the modernized system&rsquo;s own notice pages.
					</p>
				</div>
			</section>
		</>
	)
}
