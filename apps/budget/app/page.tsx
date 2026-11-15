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
const FIRST = ACTS[0]!
const LATEST = ACTS[ACTS.length - 1]!
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
		<div>
			{/* On a phone the years scroll and the names stay: the name column is
			    pinned, so a swipe to FY 2026 still says whose row it is. */}
			<p aria-hidden='true' className='mb-3 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)] lg:hidden'>
				Swipe for every year &rarr;
			</p>
			<div className='overflow-x-auto'>
			<table className={`w-full border-collapse text-[0.90625rem] ${wide ? 'min-w-[50rem] lg:min-w-[58rem]' : 'min-w-[46rem] lg:min-w-[54rem]'}`}>
				<caption className='sr-only'>{caption}</caption>
				<thead>
					<tr className='border-b border-[var(--ink)]'>
						<th scope='col' className='bb-label sticky left-0 z-[1] bg-[var(--paper)] py-4 pr-4 text-left'>
							{head}
						</th>
						{trendYears.map((year) => (
							<th
								key={year}
								scope='col'
								className='num py-4 pl-5 text-right font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
							>
								FY {year}
							</th>
						))}
						<th
							scope='col'
							className='num py-4 pl-5 text-right font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--brass)]'
						>
							Total
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.key} className='group border-b border-[var(--rule-soft)] transition-colors duration-150 hover:bg-[var(--paper-2)]'>
							<th scope='row' className='w-[10.5rem] min-w-[10.5rem] py-5 pr-4 text-left font-normal sm:w-auto sm:max-w-[20rem] sticky left-0 z-[1] bg-[var(--paper)] transition-colors duration-150 group-hover:bg-[var(--paper-2)]'>
								{row.href ? (
									<Link
										href={row.href}
										className='text-[0.84375rem] font-semibold leading-snug text-[var(--ink)] hover:text-[var(--accent)] sm:text-[0.9375rem]'
									>
										{row.label}
									</Link>
								) : (
									<span className='block text-[0.84375rem] font-semibold leading-snug text-[var(--ink)] sm:text-[0.9375rem]'>
										{row.label}
									</span>
								)}
							</th>
							{trendYears.map((year) => (
								<td
									key={year}
									className='num py-5 pl-5 text-right text-[0.8125rem] tabular-nums text-[var(--ink-2)]'
									title={row.at(year) > 0 ? peso(row.at(year)) : 'Not in this Act'}
								>
									{short(row.at(year))}
								</td>
							))}
							<td className='num py-5 pl-5 text-right text-[0.8125rem] font-semibold tabular-nums text-[var(--ink)]'>
								{short(row.total)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
			</div>
			{foot ? (
				<p className='mt-5 text-[0.75rem] leading-6 text-[var(--ink-3)]'>{foot}</p>
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
						<p className='num text-center font-mono text-[0.65625rem] font-semibold tabular-nums text-[var(--ink-2)]'>
							{short(act.total)}
						</p>
						{/* Capped and centerd in its track. Across the full container a
						    seventh of the width is a 180px slab, and seven of those is a
						    fence rather than a chart. */}
						<div
							title={peso(act.total)}
							className='mx-auto w-full max-w-[6rem] border-t-2 border-[var(--accent)] bg-gradient-to-b from-[var(--accent-soft)] to-transparent'
							style={{ height: `${Math.round((act.total / TALLEST) * BAR_H)}px` }}
						/>
					</div>
				))}
			</div>

			<div className='mt-3 flex gap-3 sm:gap-6'>
				{ACTS.map((act) => (
					<p
						key={act.year}
						className='num min-w-0 flex-1 text-center font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
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
				title='Every budget the region has passed'
				lead={`${short(SPAN)} across ${YEARS.length} Acts, from the first Bangsamoro budget to this year's: what each one gave, to which office and sector, and how much sat in a fund no ministry holds.`}
			>
				<ActBars />
			</Masthead>

			{/* The span at a glance, as cards under the band. */}
			<section className='bb-container pt-[clamp(3.75rem,7vw,6.5rem)]'>
				<dl className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
					{[
						{ label: 'All seven Acts', value: short(SPAN), note: `FY ${YEARS[0]} to FY ${YEARS[YEARS.length - 1]}, together` },
						{ label: `FY ${LATEST.year}`, value: short(LATEST.total), note: LATEST.total === TALLEST ? 'The newest Act, and the largest' : 'The newest Act' },
						{ label: 'Since the first', value: `+${percent(((LATEST.total - FIRST.total) / FIRST.total) * 100, 0)}`, note: `From ${short(FIRST.total)} in FY ${FIRST.year}` },
						{ label: 'In special funds', value: percent((LATEST.funds / LATEST.total) * 100, 0), note: `Of FY ${LATEST.year}, held outside every ministry` },
					].map((card) => (
						<div key={card.label} className='flex flex-col border border-[var(--rule)] bg-[var(--paper)] p-5 sm:p-6'>
							<dd className='num order-1 text-[2rem] font-extrabold leading-none tracking-[-0.04em] text-[var(--accent)]'>{card.value}</dd>
							<dt className='order-2 mt-3 font-mono text-[0.625rem] font-bold uppercase tracking-[0.14em] text-[var(--brass)]'>{card.label}</dt>
							<dd className='order-3 mt-1.5 text-[0.78125rem] leading-snug text-[var(--ink-3)]'>{card.note}</dd>
						</div>
					))}
				</dl>
			</section>

			{/* Out of the header and onto the paper above the funds strip (user
			    decision). The header keeps the claim and the chart — one picture of
			    seven years — and the detail behind it starts the page proper.

			    The strip below is a tinted band, and that change of ground is the
			    separator: a rule as well read as a third line in a row of them. */}
			<section className='bb-container section-band'>
				<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
					<h2 className='text-[1.625rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>Wages, running costs, and things you can point at</h2>
					<p className='max-w-xl text-[0.84375rem] leading-[1.6] text-[var(--ink-3)]'>Three buckets, and every peso in the Act sits in one. The first pays the people, the second keeps the lights on, the third buys what is still there next year.</p>
				</div>

				{/* Each Act's split, as a share bar a year: the table under it has the pesos. */}
				<div className='mt-8 border border-[var(--rule)] bg-[var(--paper)] p-5 sm:p-6'>
					<div className='flex flex-wrap gap-x-5 gap-y-2'>
						{EXPENSE_CLASSES.map((one) => (
							<span key={one.key} className='inline-flex items-center gap-2 text-[0.8125rem] text-[var(--ink-2)]'>
								<span aria-hidden='true' className='size-2.5 rounded-[2px]' style={{ background: one.tone }} />
								{one.label}
							</span>
						))}
					</div>
					<ol className='mt-5 grid gap-2.5'>
						{ACTS.map((act) => (
							<li key={act.year} className='grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3'>
								<span className='num font-mono text-[0.6875rem] font-semibold text-[var(--ink-3)]'>FY {act.year}</span>
								<span
									className='flex h-5 gap-[2px] overflow-hidden rounded-[3px]'
									role='img'
									aria-label={`FY ${act.year}: ${EXPENSE_CLASSES.map((one) => `${one.label} ${percent((act.totals[one.key] / act.total) * 100, 0)}`).join(', ')}`}
								>
									{EXPENSE_CLASSES.map((one) => (
										<span
											key={one.key}
											title={`${one.label}: ${peso(act.totals[one.key])}, ${percent((act.totals[one.key] / act.total) * 100, 1)}`}
											className='h-full'
											style={{ flexGrow: act.totals[one.key], flexBasis: 0, background: one.tone }}
										/>
									))}
								</span>
							</li>
						))}
					</ol>
				</div>

				<div className='mt-4 border border-[var(--rule)] bg-[var(--paper)] px-5 sm:px-6'>

				<p aria-hidden='true' className='mb-3 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)] lg:hidden'>
					Swipe for every year &rarr;
				</p>
				<div className='overflow-x-auto lg:-mx-8 lg:px-8'>
					<table className='w-full min-w-[46rem] border-collapse text-[0.90625rem] lg:min-w-[54rem]'>
						<caption className='sr-only'>
							Each Bangsamoro Act by expense class
						</caption>
						<thead>
							<tr className='border-b border-[var(--ink)]'>
								<th scope='col' className='sticky left-0 z-[1] bg-[var(--paper)] py-4 pr-4 text-left'>
									<span className='sr-only'>Class</span>
								</th>
								{ACTS.map((act) => (
									<th
										key={act.year}
										scope='col'
										className='num py-4 pl-5 text-right font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
									>
										FY {act.year}
									</th>
								))}
								<th
									scope='col'
									className='num py-4 pl-5 text-right font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--brass)]'
								>
									Total
								</th>
							</tr>
						</thead>

						<tbody>
							{EXPENSE_CLASSES.map((one) => {
								const across = ACTS.reduce((sum, act) => sum + act.totals[one.key], 0)
								return (
									<tr key={one.key} className='group border-b border-[var(--rule-soft)] transition-colors duration-150 hover:bg-[var(--paper-2)]'>
										<th scope='row' className='w-[10.5rem] min-w-[10.5rem] py-5 pr-4 text-left font-normal sm:w-auto sticky left-0 z-[1] bg-[var(--paper)] transition-colors duration-150 group-hover:bg-[var(--paper-2)]'>
											<span className='flex items-center gap-2.5'>
												<span
													aria-hidden='true'
													className='size-2.5 shrink-0'
													style={{ background: one.tone }}
												/>
												<span className='text-[0.84375rem] font-semibold leading-snug text-[var(--ink)] sm:text-[0.9375rem]'>
													{one.label}
												</span>
											</span>
										</th>
										{ACTS.map((act) => (
											<td
												key={act.year}
												className='num py-5 pl-5 text-right text-[0.8125rem] tabular-nums text-[var(--ink-2)]'
												title={`${peso(act.totals[one.key])} — ${percent((act.totals[one.key] / act.total) * 100, 1)} of FY ${act.year}`}
											>
												{short(act.totals[one.key])}
											</td>
										))}
										<td className='num py-5 pl-5 text-right text-[0.8125rem] font-semibold tabular-nums text-[var(--ink)]'>
											{short(across)}
										</td>
									</tr>
								)
							})}
						</tbody>

						<tfoot>
							<tr className='border-t-2 border-[var(--brass)]'>
								<th scope='row' className='sticky left-0 z-[1] bg-[var(--paper)] py-5 pr-4 text-left'>
									<span className='sr-only'>The Act</span>
								</th>
								{ACTS.map((act) => (
									<td
										key={act.year}
										className='num py-5 pl-5 text-right text-[0.8125rem] font-semibold tabular-nums text-[var(--ink)]'
									>
										{short(act.total)}
									</td>
								))}
								<td className='num py-5 pl-5 text-right text-[0.8125rem] font-semibold tabular-nums text-[var(--accent)]'>
									{short(SPAN)}
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
				</div>
			</section>

			{/* A fifth of an Act sitting outside every ministry qualifies every
			    table below it, so a reader meets it before the first column of
			    ministries rather than after. */}
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container section-band'>
					<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
						<h2 className='text-[1.625rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>Money without a ministry</h2>
						<p className='max-w-xl text-[0.84375rem] leading-[1.6] text-[var(--ink-3)]'>Kept aside for what nobody can put in a calendar: a typhoon, an outbreak, a bill that lands on every ministry at once. No office is given it until the thing happens.</p>
					</div>
					<dl className='mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7'>
						{ACTS.map((act) => (
							<div key={act.year} className={`border bg-[var(--paper)] p-4 ${act.funds === MOST_FUNDS ? 'border-[var(--accent)]' : 'border-[var(--rule)]'}`}>
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
								<dt className='money mt-3 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
									FY {act.year}
								</dt>
								<dd
									className={`money money-stat-value mt-1.5 ${act.funds === MOST_FUNDS ? 'text-[var(--accent)]' : ''}`}
									title={peso(act.funds)}
								>
									{short(act.funds)}
								</dd>
								<dd className='money mt-1 font-mono text-[0.65625rem] font-semibold tracking-[0.08em] text-[var(--accent)]'>
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
				<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
					<h2 className='text-[1.625rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>Every office, sector and area, year by year</h2>
					<p className='max-w-xl text-[0.84375rem] leading-[1.6] text-[var(--ink-3)]'>Every ministry and office, every sector, and every area the Acts name for construction.</p>
				</div>
				<div className='mt-6'>
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
				</div>
			</section>

		</>
	)
}
