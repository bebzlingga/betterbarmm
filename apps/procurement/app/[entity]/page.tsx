import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NoticesExplorer } from '../_components/notices-explorer'
import { Figures, Masthead, YearBars, peso } from '../_components/parts'
import { entities, entityBySlug, entityTotals, funds, groups, modeGroups, notices, years, supplierHref } from '../_lib/philgeps'

export function generateStaticParams() {
	return entities.map((e) => ({ entity: e.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ entity: string }> }): Promise<Metadata> {
	const entity = entityBySlug.get((await params).entity)
	return entity ? { title: entity.name, description: `What ${entity.name} has put out to bid on PhilGEPS, and who won.` } : {}
}

export default async function EntityPage({ params }: { params: Promise<{ entity: string }> }) {
	const entity = entityBySlug.get((await params).entity)
	if (!entity) notFound()
	const totals = entityTotals[entity.index]!
	const span = years.filter((y) => totals.byYear[y])

	// Who this office has paid most, across every year.
	const won = new Map<string, { awards: number; amount: number }>()
	for (const n of notices)
		if (n.entity === entity.index)
			for (const a of n.awards) {
				const s = won.get(a.awardee) ?? { awards: 0, amount: 0 }
				s.awards += 1
				s.amount += a.amount ?? 0
				won.set(a.awardee, s)
			}
	const top = [...won.entries()].sort((x, y) => y[1].amount - x[1].amount).slice(0, 10)

	return (
		<>
			<Masthead
				kicker={`${entity.type} · on PhilGEPS`}
				name={entity.name}
				stacked
				chart={span.length > 1}
				note={
					span.length
						? `${totals.all.notices.toLocaleString('en-PH')} bid notices from ${span[0]} to ${span.at(-1)}, with an approved budget of ${peso(totals.all.abc)}.`
						: undefined
				}
			>
				{span.length > 1 ? (
					<YearBars bars={years.map((year) => ({ year, value: totals.byYear[year]?.abc ?? 0 }))} caption='Approved budget of its notices, by year' />
				) : null}
			</Masthead>

			<Figures
				title='Since 2019'
				note='What this office has put out to bid on PhilGEPS, and what has been awarded so far. An approved budget is the most it may pay; an award is the contract it signed.'
				years={years}
				items={[
					{ value: totals.all.notices.toLocaleString('en-PH'), label: 'Bid notices posted', series: years.map((y) => totals.byYear[y]?.notices ?? 0) },
					{ value: peso(totals.all.abc), label: 'Approved budget', series: years.map((y) => totals.byYear[y]?.abc ?? 0) },
					{ value: totals.all.awards.toLocaleString('en-PH'), label: 'Contracts awarded', series: years.map((y) => totals.byYear[y]?.awards ?? 0) },
					{ value: peso(totals.all.contracts), label: 'Awarded amount', series: years.map((y) => totals.byYear[y]?.contracts ?? 0) },
				]}
			/>

			<div className='bb-container bb-section grid gap-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-24'>
				<section className='min-w-0'>
					<h2 className='text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>Bid notices</h2>
					<div className='mt-6'>
						<NoticesExplorer entity={entity.slug} years={span.length ? span : years} groups={groups} modes={modeGroups} funds={funds} />
					</div>
				</section>

				<aside className='order-first lg:order-none'>
					<h2 className='text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>Top suppliers</h2>
					{top.length ? (
						<ol className='mt-4'>
							{top.map(([name, s]) => (
								<li key={name} className='flex items-baseline justify-between gap-4 border-b border-[var(--rule)] py-3'>
									<a href={supplierHref(name)} className='min-w-0 text-[13.5px] font-semibold leading-5 text-[var(--ink)] hover:text-[var(--accent)]'>
										{name}
									</a>
									<span className='num shrink-0 text-right text-[13px] text-[var(--ink-2)]'>
										<span className='font-semibold text-[var(--ink)]'>{peso(s.amount)}</span>
										<span className='block text-[11px] text-[var(--ink-3)]'>{s.awards} {s.awards === 1 ? 'award' : 'awards'}</span>
									</span>
								</li>
							))}
						</ol>
					) : (
						<p className='mt-3 text-[13px] leading-6 text-[var(--ink-3)]'>PhilGEPS records no award on this office&rsquo;s notices.</p>
					)}
					{entity.unit ? (
						<a href={`https://lgu.betterbarmm.com/${entity.unit}`} className='rule-link mt-8 inline-block text-[13px]'>
							Its profile in the Local Government workspace
						</a>
					) : null}
				</aside>
			</div>
		</>
	)
}
