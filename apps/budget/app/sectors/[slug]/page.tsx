import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { Rise, SectionHead } from '@betterbarmm/editorial'
import { budgetFor, percent } from '@betterbarmm/budget-data'
import { YearLink } from '../../_components/year-link'
import { notFound } from 'next/navigation'
import { Masthead, StatRow } from '../../_components/budget-parts'
import { ProvisionList } from '../../_components/provision-list'
import { SectorIcon } from '../../_components/sector-icon'
import { Money } from '../../_components/money'
import { HEAD_ROW, ROW, SUB, TABLE, TD, TD_NUM, TH, TH_NUM } from '../../_components/table'
import { BudgetTrend, sectorTrend } from '../../_components/budget-trend'

/* No `generateStaticParams`. These pages read `?fy=`, so what they render
   depends on the query string and there is no one page to prerender — an
   office's FY 2026 page and its FY 2025 page are the same route. They are
   rendered on demand instead, which is the cost of switching the year in
   place rather than giving each year its own path. */
export async function generateMetadata({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>
	searchParams: Promise<{ fy?: string }>
}): Promise<Metadata> {
	const { budget, findSector } = budgetFor((await searchParams).fy)
	const sector = findSector((await params).slug)
	if (!sector) return { title: 'Sector not found' }

	return {
		title: sector.name,
		description: `${sector.count} lines of the FY ${budget.fiscalYear} Bangsamoro budget are about ${sector.name.toLowerCase()} — ${sector.description}`,
	}
}

export default async function SectorPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>
	searchParams: Promise<{ fy?: string }>
}) {
	const fy = (await searchParams).fy
	const { budget, findSector, sectorContents } = budgetFor(fy)
	const sector = findSector((await params).slug)
	if (!sector) notFound()

	const { programs, provisions } = sectorContents(sector.tag)
	const trend = sectorTrend(sector.slug)

	// Which offices spend on this, largest first. The point of the page: a
	// sector is almost never one ministry's business.
	const byOffice = [
		...programs.reduce((offices, program) => {
			const one = offices.get(program.officeSlug) ?? {
				slug: program.officeSlug,
				name: program.office,
				total: 0,
				count: 0,
			}
			one.total += program.total
			one.count += 1
			return offices.set(program.officeSlug, one)
		}, new Map<string, { slug: string; name: string; total: number; count: number }>()),
	]
		.map(([, one]) => one)
		.sort((a, b) => b.total - a.total)

	return (
		<>
			<Masthead
				back={{ href: '/sectors', label: 'All sectors' }}
				kicker={`Sector · fiscal year ${budget.fiscalYear}`}
				title={sector.name}
				mark={
					<SectorIcon slug={sector.slug} className='size-9 text-[var(--brass)] lg:size-11' />
				}
				lead={
					<>
						{sector.description}. Everything the Act says on it, wherever in the Act it says it —{' '}
						{byOffice.length === 1
							? 'all of it in one office'
							: `spread across ${byOffice.length} offices`}
						.
					</>
				}
			>
				<StatRow
					stats={[
						...(sector.total > 0
							? [{ value: sector.total, label: 'In program rows', money: true }]
							: []),
						{ value: programs.length, label: 'Programs' },
						{ value: provisions.length, label: 'Rules in the Act' },
						{ value: byOffice.length, label: 'Offices involved' },
					].slice(0, 4)}
				/>
			</Masthead>

			{/* ---- Year on year ---- */}
			{trend && trend.length > 1 ? (
				<section className='bb-container section-band'>
					<SectionHead
						index='01'
						eyebrow='Year on year'
						size='sm'
						title={`${trend.length} Acts,`}
						titleMuted='one line.'
						lead={`What each General Appropriations Act put under this sector, FY ${trend[0]![0]} to FY ${trend[trend.length - 1]![0]}. Sectors overlap, so these are never added across sectors.`}
					/>
					<div className='mt-8'>
						<BudgetTrend series={trend} label='What each Act put under this sector' active={budget.fiscalYear} />
					</div>
				</section>
			) : null}

			{/* ---- Who spends it ---- */}
			{byOffice.length > 0 ? (
				<section className='bb-container section-band'>
					<SectionHead
						index='02'
						eyebrow='Who spends it'
						size='sm'
						title={
							byOffice.length === 1 ? 'One office' : `${byOffice.length} offices`
						}
						titleMuted='spend on this.'
						lead='The Act files money by office, so a sector is scattered through it. This is the scatter, gathered.'
					/>

					{/* A table (user decision): the office, how many of its programs, and what they come to. */}
					<table className={`${TABLE} mt-6`}>
						<caption className='sr-only'>Offices that spend on {sector.name.toLowerCase()}</caption>
						<thead>
							<tr className={HEAD_ROW}>
								<th scope='col' className={TH}>
									Office
								</th>
								<th scope='col' className={`${TH_NUM} hidden sm:table-cell`}>
									Programs
								</th>
								<th scope='col' className={TH_NUM}>
									Amount
								</th>
							</tr>
						</thead>
						<tbody>
							{byOffice.map((office) => (
								<tr key={office.slug} className={ROW}>
									<th scope='row' className={`${TD} font-normal`}>
										<YearLink
											href={`/offices/${office.slug}`}
											className='inline-flex items-baseline gap-2 text-[0.90625rem] font-semibold tracking-[-0.02em] text-[var(--ink)] transition hover:text-[var(--accent)]'
										>
											{office.name}
											<ArrowUpRightIcon className='size-3.5 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
										</YearLink>
									</th>
									<td className={`${TD_NUM} hidden font-mono text-[0.75rem] text-[var(--ink-3)] sm:table-cell`}>{office.count}</td>
									<td className={TD_NUM}>
										<Money amount={office.total} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>
			) : null}

			{/* ---- The programs ---- */}
			{programs.length > 0 ? (
				<section className='bb-container border-t border-[var(--rule)] section-band-bottom'>
					<SectionHead
						index='03'
						eyebrow='The lines themselves'
						size='sm'
						title={`${programs.length} ${programs.length === 1 ? 'program' : 'programs'},`}
						titleMuted='largest first.'
						lead={`Each is a row the Act prints against an office, tagged to this sector. Amounts are exactly as printed — ${percent(
							(sector.total / budget.total) * 100,
						)} of the region's total sits in these rows, though a line counted here may be counted under another sector too.`}
					/>

					{/* A table (user decision): the program as the Act prints its path, the office, the amount. */}
					<table className={`${TABLE} mt-6`}>
						<caption className='sr-only'>Programs tagged to {sector.name.toLowerCase()}</caption>
						<thead>
							<tr className={HEAD_ROW}>
								<th scope='col' className={TH}>
									Program
								</th>
								<th scope='col' className={`${TH} hidden lg:table-cell`}>
									Office
								</th>
								<th scope='col' className={TH_NUM}>
									Amount
								</th>
							</tr>
						</thead>
						<tbody>
							{programs.slice(0, 40).map((program) => (
								<tr key={program.id} className={ROW}>
									<th scope='row' className={`${TD} font-normal`}>
										<span className='block text-[0.875rem] font-medium leading-snug text-[var(--ink)]'>{program.path}</span>
										<YearLink href={`/offices/${program.officeSlug}`} className={`${SUB} rule-link w-fit lg:hidden`}>
											{program.office}
										</YearLink>
									</th>
									<td className={`${TD} hidden w-[16rem] text-[0.78125rem] leading-snug lg:table-cell`}>
										<YearLink href={`/offices/${program.officeSlug}`} className='rule-link text-[var(--ink-2)]'>
											{program.office}
										</YearLink>
									</td>
									<td className={TD_NUM}>
										<Money amount={program.total} />
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{programs.length > 40 ? (
						<Rise distance={12}>
							<YearLink
								href={`/programs?q=${encodeURIComponent(sector.tag)}`}
								className='bb-btn bb-btn-ghost mt-8'
							>
								All {programs.length} in the program browser
								<ArrowUpRightIcon size={14} aria-hidden='true' />
							</YearLink>
						</Rise>
					) : null}
				</section>
			) : null}

			{/* ---- The rules ---- */}
			{provisions.length > 0 ? (
				/* The one section set on a ground rather than on paper. The rules are
				   quoted text where every other section on the page is figures, and
				   the tint is what separates the Act's own words from our tables
				   without a heading having to say so.

				   The ground is on the section and the rhythm on the div inside it,
				   because `bb-container` caps the width — left on the same element the
				   tint would have stopped at the text column and read as a panel
				   floating in the page rather than as a band across it. */
				<section className='bg-[var(--paper-2)]'>
					<div className='bb-container section-band'>
						<SectionHead
							index='04'
							eyebrow='What the Act requires'
							size='sm'
							title={`${provisions.length} ${provisions.length === 1 ? 'rule' : 'rules'}`}
							titleMuted='attached to this money.'
							lead='A special provision is the condition Parliament put on an appropriation — who it must reach, what it may not be spent on, what has to be reported and to whom. These are the ones about this sector, quoted in full.'
						/>

						<div className='mt-6'>
							<ProvisionList provisions={provisions} showOffice />
						</div>
					</div>
				</section>
			) : null}
		</>
	)
}
