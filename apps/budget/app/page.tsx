import type { Metadata } from 'next'
import Link from 'next/link'
import {
	EXPENSE_CLASSES,
	FISCAL_YEARS,
	budgetFor,
	percent,
	peso,
	pesoTight,
} from '@betterbarmm/budget-data'
import { SectionHead } from '@betterbarmm/editorial'
import { Masthead } from './_components/budget-parts'
import { BudgetTabs } from './_components/budget-tabs'
import {
	joinRenames,
	officeLines,
	areaLines,
	sectorLines,
	trendYears,
} from './_components/budget-trend'

export const metadata: Metadata = {
	description:
		'Every enacted Bangsamoro budget beside each other, FY 2020 to FY 2026: what each Act is made of, the money held outside any ministry, and the same span across every sector, office and area.',
}

/* ============================================================
   Every Act against the others

   This is the page that is all of them, which is the only place
   a figure can be called large or small: ₱114 billion means
   nothing until it sits beside the ₱65.9 billion the region
   started with.

   It carries no `?fy=`. The year switch says which Act a page is
   reading, and this page reads them all — a year parameter here
   would answer a question the page does not ask.

   Three tables, one question: what kind of money is this.

   They are deliberately not the same table three times. Each
   grouping carries a different breakdown and only a different
   breakdown, and forcing all three onto personnel/MOOE/capital
   would have meant inventing two of them:

     the Acts    carry all three classes exactly, every year
     the sectors carry none of them — a sector's total is
                 assembled from program rows, provisions and
                 projects, which overlap, so it is shown across the
                 years instead and never split by class

   A sector's program rows were tried as a proxy and come to
   ₱3.33B against a sector total of ₱12.17B for social protection
   alone. A table built that way would have been wrong by a factor
   of four and looked authoritative.
   ============================================================ */

const YEARS = [...FISCAL_YEARS].reverse()
const ACTS = YEARS.map((fy) => {
	const { budget, budgetGroups } = budgetFor(fy)
	/* The Act's own Section 1 group, not this workspace's reading of it: money
	   appropriated without naming a ministry, released through them later. */
	const funds = budgetGroups.find((group) => group.name === 'Special Purpose Fund')
	return {
		year: fy,
		totals: budget.totals,
		total: budget.total,
		funds: funds?.totals.total ?? 0,
	}
})

const SPAN = ACTS.reduce((sum, act) => sum + act.total, 0)
const MOST_FUNDS = Math.max(...ACTS.map((act) => act.funds))
const TALLEST = Math.max(...ACTS.map((act) => act.total))
/* The tallest bar, in pixels. A height in pixels rather than a percentage of
   the row: a percentage height only means anything when the parent's height is
   definite, and in a flex column whose own height is its content — which is
   what a row of bars sitting on a baseline is — it resolves to `auto`, which
   is nothing. The bars were in the markup with the right ratios and drew zero
   pixels tall. */
const BAR_H = 160
/* The offices tab: every place someone works, and nothing else.

   The trend file is every line the Acts print, which is two different kinds of
   thing in one list. Most are offices — the ministries, the Chief Minister and
   the offices under him, and the commissions, authorities and the Wali filed
   under Other Executive Offices. Eight are special purpose funds, which are not
   places anyone works at all: money appropriated without naming who spends it,
   released through the ministries later. Read down one column those eight sit
   among the ministries as though they were peers.

   So the funds come out and everything else stays. They are not lost — they are
   the strip in the header, which is the one place they can be shown as what
   they are.

   Built from the Acts across every year rather than the latest: a fund that
   stopped appearing after FY 2022 still has a line, and matching only against
   this year's Act would leave it in.

   This makes the column a selection and no longer a partition — it no longer
   sums to the Act — which is what the note under the table says. */
const FUNDS = new Set(
	FISCAL_YEARS.flatMap((fy) => budgetFor(fy).offices)
		.filter((office) => office.kind === 'special_purpose_fund')
		.map((office) => office.slug),
)

/* `pesoTight` is the workspace's own short form — "₱ 26.5B", "₱ 958M" — with
   the precision rule that keeps a tenth of a billion visible and drops a tenth
   of a million once the figure is in the hundreds. A zero is a dash: a column
   of ₱ 0.00B says nothing was appropriated, which is not the same as nothing
   being recorded. */
const short = (amount: number) => (amount > 0 ? pesoTight(amount) : '—')

/**
 * One grouping down the side, the years across the top.
 *
 * Written once because the page draws it four times and a table copied four
 * ways drifts by the second edit. A row carries its own series rather than a
 * value per column, because a line that only exists in three of the seven Acts
 * has three points and five blanks — not four zeroes.
 */
function YearTable({
	caption,
	head,
	rows,
	wide,
	foot,
}: {
	caption: string
	head: string
	rows: { key: string; label: string; href?: string; at: (year: number) => number; total: number }[]
	wide?: boolean
	/** Said under the table where a column needs qualifying. */
	foot?: string
}) {
	return (
		<div className='-mx-6 overflow-x-auto px-6 lg:-mx-8 lg:px-8'>
			<table className={`w-full border-collapse text-[14.5px] ${wide ? 'min-w-[58rem]' : 'min-w-[54rem]'}`}>
				<caption className='sr-only'>{caption}</caption>
				<thead>
					<tr className='border-b border-[var(--ink)]'>
						<th scope='col' className='bb-label py-4 pr-4 text-left'>
							{head}
						</th>
						{trendYears.map((year) => (
							<th
								key={year}
								scope='col'
								className='num py-4 pl-5 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
							>
								FY {year}
							</th>
						))}
						<th
							scope='col'
							className='num py-4 pl-5 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brass)]'
						>
							Total
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.key} className='border-b border-[var(--rule-soft)] transition-colors duration-150 hover:bg-[var(--paper-2)]'>
							<th scope='row' className='max-w-[20rem] py-5 pr-4 text-left font-normal'>
								{row.href ? (
									<Link
										href={row.href}
										className='text-[15px] font-semibold leading-snug text-[var(--ink)] hover:text-[var(--accent)]'
									>
										{row.label}
									</Link>
								) : (
									<span className='block text-[15px] font-semibold leading-snug text-[var(--ink)]'>
										{row.label}
									</span>
								)}
							</th>
							{trendYears.map((year) => (
								<td
									key={year}
									className='num py-5 pl-5 text-right text-[13px] tabular-nums text-[var(--ink-2)]'
									title={row.at(year) > 0 ? peso(row.at(year)) : 'Not in this Act'}
								>
									{short(row.at(year))}
								</td>
							))}
							<td className='num py-5 pl-5 text-right text-[13px] font-semibold tabular-nums text-[var(--ink)]'>
								{short(row.total)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{foot ? (
				<p className='mt-5 text-[12px] leading-6 text-[var(--ink-3)]'>{foot}</p>
			) : null}
		</div>
	)
}

/* The chart under the claim, full width (user decision).


   Drawn the way `BudgetTrend` draws its line: a soft wash for the body, a
   solid edge on top. That is the estate's one chart idiom, and two charts
   on one site should look like the same hand made them. It also lets the
   okir lattice this band is woven with show through — seven solid blocks
   covered it and read as a slab laid over the masthead rather than part of
   it. The edge is what is read, so it carries the weight.

   One color, not three stacked by expense class: those tones are chosen
   against paper and land between 3.0 and 3.3:1 on this crimson, too thin
   for marks whose whole job is being told apart. `--accent` re-points to
   the warm gold here.

   Plain elements rather than an SVG — seven rectangles whose heights are a
   ratio is a thing CSS already does, and it stays a server component. */
function ActBars() {
	return (
		<figure
			className='m-0 mt-14'
			role='img'
			aria-label={`What each Act appropriated: ${ACTS.map((act) => `FY ${act.year}, ${peso(act.total)}`).join('; ')}.`}
		>
			<div className='flex items-end gap-3 border-b border-[var(--brass-line)] sm:gap-6'>
				{ACTS.map((act) => (
					<div key={act.year} className='flex min-w-0 flex-1 flex-col items-stretch gap-2.5'>
						<p className='num text-center font-mono text-[10.5px] font-semibold tabular-nums text-[var(--ink-2)]'>
							{short(act.total)}
						</p>
						{/* Capped and centerd in its track. Across the full container a
						    seventh of the width is a 180px slab, and seven of those is a
						    fence rather than a chart. */}
						<div
							title={peso(act.total)}
							className='mx-auto w-full max-w-[3.5rem] border-t-2 border-[var(--accent)] bg-gradient-to-b from-[var(--accent-soft)] to-transparent'
							style={{ height: `${Math.round((act.total / TALLEST) * BAR_H)}px` }}
						/>
					</div>
				))}
			</div>

			<div className='mt-3 flex gap-3 sm:gap-6'>
				{ACTS.map((act) => (
					<p
						key={act.year}
						className='num min-w-0 flex-1 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
					>
						FY {act.year}
					</p>
				))}
			</div>
		</figure>
	)
}

export default function CompositionPage() {
	return (
		<>
			{/* What the workspace is, before what it says (user decision).

			    "Every budget the region has ever passed" is checkable and checked:
			    Bangsamoro Autonomy Act 1 adopted the flag, Act 2 the emblem, and Act
			    3 is the FY 2020 appropriations act. There is no earlier one.

			    The three counts are the newest Act's, and are said to be — `offices`,
			    `programs` and `projects` off this package are FY 2026, not the span.
			    Printed against the seven-year total they would read as the span's,
			    and the span has 55 distinct offices rather than 44.

			    The provenance line names offices, programs and provisions and stops
			    there. All 44, all 246 and all 207 of those carry a source page; none
			    of the 258 projects does, so "every figure" would have been a claim
			    the data does not support. */}
			<Masthead
				kicker={`${YEARS.length} Acts · FY ${YEARS[0]} to FY ${YEARS[YEARS.length - 1]}`}
				title='Every budget the region'
				titleMuted='has ever passed.'
			>
				<ActBars />
			</Masthead>

			{/* Out of the header and onto the paper above the funds strip (user
			    decision). The header keeps the claim and the chart — one picture of
			    seven years — and the detail behind it starts the page proper.

			    The strip below is a tinted band, and that change of ground is the
			    separator: a rule as well read as a third line in a row of them. */}
			<section className='bb-container section-band-top pb-20'>
				<SectionHead
					size='sm'
					eyebrow='Each Act by expense class'
					title='Wages, running costs,'
					titleMuted='and things you can point at.'
					lead='Three buckets, and every peso in the Act sits in one of them. The first pays the people. The second keeps the lights on and the fuel in the trucks. The third buys what is still there next year — a road, a health center, an ambulance.'
				/>

				<div className='-mx-6 overflow-x-auto px-6 lg:-mx-8 lg:px-8'>
					<table className='w-full min-w-[54rem] border-collapse text-[14.5px]'>
						<caption className='sr-only'>
							Each Bangsamoro Act by expense class
						</caption>
						<thead>
							<tr className='border-b border-[var(--ink)]'>
								<th scope='col' className='py-4 pr-4 text-left'>
									<span className='sr-only'>Class</span>
								</th>
								{ACTS.map((act) => (
									<th
										key={act.year}
										scope='col'
										className='num py-4 pl-5 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
									>
										FY {act.year}
									</th>
								))}
								<th
									scope='col'
									className='num py-4 pl-5 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brass)]'
								>
									Total
								</th>
							</tr>
						</thead>

						<tbody>
							{EXPENSE_CLASSES.map((one) => {
								const across = ACTS.reduce((sum, act) => sum + act.totals[one.key], 0)
								return (
									<tr key={one.key} className='border-b border-[var(--rule-soft)] transition-colors duration-150 hover:bg-[var(--paper-2)]'>
										<th scope='row' className='py-5 pr-4 text-left font-normal'>
											<span className='flex items-center gap-2.5'>
												<span
													aria-hidden='true'
													className='size-2.5 shrink-0'
													style={{ background: one.tone }}
												/>
												<span className='text-[15px] font-semibold text-[var(--ink)]'>
													{one.label}
												</span>
											</span>
										</th>
										{ACTS.map((act) => (
											<td
												key={act.year}
												className='num py-5 pl-5 text-right text-[13px] tabular-nums text-[var(--ink-2)]'
												title={`${peso(act.totals[one.key])} — ${percent((act.totals[one.key] / act.total) * 100, 1)} of FY ${act.year}`}
											>
												{short(act.totals[one.key])}
											</td>
										))}
										<td className='num py-5 pl-5 text-right text-[13px] font-semibold tabular-nums text-[var(--ink)]'>
											{short(across)}
										</td>
									</tr>
								)
							})}
						</tbody>

						<tfoot>
							<tr className='border-t-2 border-[var(--brass)]'>
								<th scope='row' className='py-5 pr-4 text-left'>
									<span className='sr-only'>The Act</span>
								</th>
								{ACTS.map((act) => (
									<td
										key={act.year}
										className='num py-5 pl-5 text-right text-[13px] font-semibold tabular-nums text-[var(--ink)]'
									>
										{short(act.total)}
									</td>
								))}
								<td className='num py-5 pl-5 text-right text-[13px] font-semibold tabular-nums text-[var(--accent)]'>
									{short(SPAN)}
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</section>

			{/* A fifth of an Act sitting outside every ministry qualifies every
			    table below it, so a reader meets it before the first column of
			    ministries rather than after. */}
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container section-band'>
					<SectionHead
						size='sm'
						eyebrow='Held in a special purpose fund'
						title='Money without'
						titleMuted='a ministry.'
						lead='Money kept aside for what nobody can put in a calendar — a typhoon, an outbreak, a bill that lands on every ministry at once. No office is given it to spend until the thing actually happens.'
					/>
					<dl className='mt-20 grid gap-x-8 gap-y-8 sm:grid-cols-4 lg:grid-cols-7'>
						{ACTS.map((act) => (
							<div key={act.year}>
								<div
									className='split-bar split-bar-xs'
									role='img'
									aria-label={`FY ${act.year}: ${percent((act.funds / act.total) * 100, 0)} in special purpose funds`}
								>
									<div
										className='split-bar-seg'
										style={{ width: `${(act.funds / act.total) * 100}%`, background: 'var(--accent)' }}
									/>
									<div
										className='split-bar-seg'
										style={{
											width: `${100 - (act.funds / act.total) * 100}%`,
											background: 'var(--rule)',
										}}
									/>
								</div>
								<dt className='money mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
									FY {act.year}
								</dt>
								<dd
									className={`money money-stat-value mt-1.5 ${act.funds === MOST_FUNDS ? 'text-[var(--accent)]' : ''}`}
									title={peso(act.funds)}
								>
									{short(act.funds)}
								</dd>
								<dd className='money mt-1 font-mono text-[10.5px] font-semibold tracking-[0.08em] text-[var(--accent)]'>
									{percent((act.funds / act.total) * 100, 0)} of the Act
								</dd>
							</div>
						))}
					</dl>
				</div>
			</section>

			{/* ---- The two cuts ---- */}
			{/* No head on this one. It was announcing a choice the tabs make
			    plainly by existing, and a heading, a standfirst and two labels all
			    saying "sector or office" is three of them too many. The strip pins
			    under the nav once the reader is inside it. */}
			{/* The rule belongs to the tab strip, not to this section. On the section
			    it is drawn across the container's padding as well as its content, so
			    it started a gutter's width left of the first tab and read as a line
			    that had failed to line up with anything. */}
			<section className='bb-container section-band'>
				<BudgetTabs
					label='The same span, cut three ways'
					tabs={[
						{
							id: 'offices',
							label: 'Offices',
							badge: joinRenames(officeLines.filter((line) => !FUNDS.has(line.slug))).length,
							panel: (
								<YearTable
									wide
									caption='Every ministry, office and commission by fiscal year'
									head='Office'
									rows={joinRenames(officeLines.filter((line) => !FUNDS.has(line.slug)))
										.map((line) => ({
											key: line.slug,
											label: line.name,
											at: (year: number) =>
												line.series.find(([one]) => one === year)?.[1] ?? 0,
											total: line.series.reduce((sum, [, amount]) => sum + amount, 0),
										}))
										.sort((one, other) => other.total - one.total)}
									foot='Every place someone works: the ministries, the Chief Minister and the offices under him, and the commissions, authorities and the Wali filed under Other Executive Offices. The eight special purpose funds are left out — they are money without a ministry, and they are the strip in the header — so this column does not sum to the Act.'
								/>
							),
						},
						{
							id: 'sectors',
							label: 'Sectors',
							badge: sectorLines.length,
							panel: (
								<YearTable
									caption='Each sector of the budget by fiscal year'
									head='Sector'
									rows={[...sectorLines]
										.map((line) => ({
											key: line.slug,
											label: line.name,
											href: `/sectors/${line.slug}`,
											at: (year: number) =>
												line.series.find(([one]) => one === year)?.[1] ?? 0,
											total: line.series.reduce((sum, [, amount]) => sum + amount, 0),
										}))
										.sort((one, other) => other.total - one.total)}
								/>
							),
						},
						{
							id: 'areas',
							label: 'Areas',
							badge: areaLines.length,
							panel: (
								<YearTable
									caption='Itemised construction by the area each Act names, by fiscal year'
									head='Area'
									rows={[...areaLines]
										.map((line) => ({
											key: line.slug,
											label: line.name,
											at: (year: number) =>
												line.series.find(([one]) => one === year)?.[1] ?? 0,
											total: line.series.reduce((sum, [, amount]) => sum + amount, 0),
										}))
										.sort((one, other) => other.total - one.total)}
									foot='The itemised construction projects only — the one part of a budget that carries a place at all, so this column is far smaller than the Act. The region was also redrawn inside the span: Maguindanao I and II become Del Norte and Del Sur, Sulu stops appearing after FY 2022, and a renamed area is two rows rather than one.'
								/>
							),
						},
					]}
				/>
			</section>

		</>
	)
}
