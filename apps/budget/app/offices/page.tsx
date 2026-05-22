import { Minus, Plus } from 'lucide-react'
import { AllocationBar, budgetShare, exactTableCurrency, titleCase } from '../_components/budget-office-allocation-table'
import { AutoScrollDetails } from '../_components/auto-scroll-details'
import { BudgetFiscalYearTiles } from '../_components/budget-fiscal-year-tiles'
import { BudgetMetricStrip } from '../_components/budget-metric-strip'
import { BudgetPageHeader } from '../_components/budget-page-header'
import { BudgetPageShell } from '../_components/budget-page-shell'
import {
	buildAgencyRows,
	buildOfficeSpecialProvisionRows,
	buildYearRows,
	compactCurrency,
	getBudgetSelection,
	type AgencyRow,
	type BudgetSearchParams,
	type OfficeSpecialProvisionRow,
} from '../_lib/budget-view-model'

function pluralize(count: number, singular: string, plural = `${singular}s`) {
	return count === 1 ? singular : plural
}

export default async function BudgetOfficesPage({ searchParams }: { searchParams: BudgetSearchParams }) {
	const params = await searchParams
	const { budget, toYear, selectedYearLabel } = getBudgetSelection(params)
	const yearRows = buildYearRows()
	const agencyRows = buildAgencyRows(budget)
	const allocationByAgencyId = new Map(agencyRows.map((agency) => [agency.agency_id, agency]))
	const officeRows = buildOfficeSpecialProvisionRows(toYear)
	const officesWithProvisions = officeRows.filter((office) => office.special_provisions.length > 0)
	const provisionCount = officesWithProvisions.reduce((sum, office) => sum + office.special_provisions.length, 0)

	return (
		<BudgetPageShell activeItem='Special Provisions'>
			<BudgetFiscalYearTiles
				rows={yearRows}
				selectedYear={toYear}
				flushTop
				hrefBasePath='/offices'
			/>

			<div className='mb-16 mt-20'>
				<BudgetPageHeader
					eyebrow='Special provisions'
					title={
						<>
							Special provisions <span className='text-[var(--accent)]'>by office.</span>
						</>
					}
					description={
						<>
							Special provisions appear in the GAAB when an office appropriation carries legal conditions beyond the amount itself. They specify restricted purposes, release requirements, program
							guidelines, reporting and posting duties, geo-tagging, or other transparency controls that explain how approved funds may be used.
						</>
					}
				/>
			</div>

			<BudgetMetricStrip
				metrics={[
					{
						label: 'Total appropriation',
						value: compactCurrency(budget.total_appropriation),
						detail: budget.act_number,
					},
					{
						label: 'Reporting units',
						value: officeRows.length,
						detail: 'Offices in selected GAAB',
					},
					{
						label: 'With provisions',
						value: officesWithProvisions.length,
						detail: 'With extracted notes',
					},
					{
						label: 'Provision entries',
						value: provisionCount,
						detail: selectedYearLabel,
					},
				]}
			/>

			<OfficeSpecialProvisionList
				rows={officesWithProvisions}
				total={budget.total_appropriation}
				label={selectedYearLabel}
				allocationByAgencyId={allocationByAgencyId}
			/>
		</BudgetPageShell>
	)
}

function OfficeSpecialProvisionList({ rows, total, label, allocationByAgencyId }: { rows: OfficeSpecialProvisionRow[]; total: number; label: string; allocationByAgencyId: Map<string, AgencyRow> }) {
	return (
		<section className='my-16 mb-12 sm:my-24'>
			<div className='mb-6! flex flex-wrap items-end justify-between gap-4'>
				<div>
					<p className='eyebrow'>Special provisions</p>
					<h2 className='num mt-2 text-3xl font-extrabold uppercase tracking-normal sm:text-5xl'>Special Provisions By Office</h2>
				</div>
				<p className='font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]'>
					{rows.length} {pluralize(rows.length, 'office', 'offices')} / {label}
				</p>
			</div>

			<div className='overflow-x-auto bg-[var(--paper)]'>
				<div className='md:min-w-[860px]'>
					{rows.map((office) => {
						const allocation = allocationByAgencyId.get(office.agency_id)
						const personnel = allocation?.personnel ?? 0
						const mooe = allocation?.mooe ?? 0
						const capital = allocation?.capital ?? 0
						const allocationTotal = personnel + mooe + capital || office.total_appropriation

						return (
							<AutoScrollDetails
								key={office.agency_id}
								name='office-special-provisions'
								className='group border-b border-[var(--rule-soft)] last:border-b-0'
							>
								<summary className='grid cursor-pointer list-none gap-1 transition hover:bg-[var(--paper-2)] group-open:bg-[var(--ink)] group-open:text-[var(--paper)] group-open:hover:bg-[var(--ink)] md:grid-cols-[minmax(22rem,1fr)_minmax(18rem,35%)] md:items-center [&::-webkit-details-marker]:hidden'>
									<div className='flex items-center px-4 py-4 leading-tight sm:px-6 md:py-3'>
										<span className='mr-5 grid size-4 shrink-0 place-items-center border border-[var(--rule)] text-[var(--accent)] group-open:border-[var(--paper-2)] group-open:text-[var(--paper)]'>
											<Plus
												className='size-2.5 group-open:hidden'
												aria-hidden='true'
											/>
											<Minus
												className='hidden size-2.5 group-open:block'
												aria-hidden='true'
											/>
										</span>
										<div>
											<p className='text-sm font-semibold text-[var(--ink)] group-open:text-[var(--paper)]'>
												{titleCase(office.agency_name)} <span className='font-normal uppercase tracking-[0.08em] text-[var(--ink-3)] group-open:text-[var(--paper-2)]'>({office.agency_id})</span>
											</p>
											<p className='mt-1 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-[var(--ink-3)] group-open:text-[var(--paper-2)]'>
												{office.category}
												{office.source_page ? ` / P.${office.source_page}` : ''}
											</p>
										</div>
									</div>
									<div className='px-4 pb-4 sm:px-6 md:py-3'>
										<div className='mb-2 flex items-baseline justify-between gap-4'>
											<p className='num text-left text-sm font-semibold leading-tight text-[var(--ink)] group-open:text-[var(--paper)]'>{exactTableCurrency(office.total_appropriation)}</p>
											<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] group-open:text-[var(--paper-2)]'>
												{budgetShare(office.total_appropriation, total, label)}
											</p>
										</div>
										<AllocationBar
											personnel={personnel}
											mooe={mooe}
											capital={capital}
											total={allocationTotal}
											activeOnOpen
										/>
									</div>
								</summary>

								<OfficeSpecialProvisionDetail office={office} />
							</AutoScrollDetails>
						)
					})}
				</div>
			</div>
		</section>
	)
}

function OfficeSpecialProvisionDetail({ office }: { office: OfficeSpecialProvisionRow }) {
	return (
		<div className='border border-[var(--rule)] bg-[var(--paper-2)] px-4 py-5 sm:px-6 lg:px-12 lg:py-6'>
			<div className='mt-5 space-y-8'>
				{office.special_provisions.map((provision, index) => (
					<section
						key={`${office.agency_id}-${provision.title}-${index}`}
						className='border-t border-[var(--rule-soft)] pt-5 first:border-t-0 first:pt-0'
					>
						<h3 className='num text-2xl font-extrabold uppercase tracking-normal sm:text-3xl'>{provision.title}</h3>
						<div
							className='special-provision-body mt-4 text-sm leading-normal text-[var(--ink-2)]'
							dangerouslySetInnerHTML={{
								__html: provision.description_html,
							}}
						/>
					</section>
				))}
			</div>
		</div>
	)
}
