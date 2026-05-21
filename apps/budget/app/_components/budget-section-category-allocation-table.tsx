import { Minus, Plus } from 'lucide-react'
import { type AgencyRow, type SectionCategoryRow } from '../_lib/budget-view-model'
import { AutoScrollDetails } from './auto-scroll-details'
import { AllocationBar, budgetShare, compactTableCurrency, exactTableCurrency, titleCase } from './budget-office-allocation-table'

interface BudgetSectionCategoryAllocationTableProps {
	rows: SectionCategoryRow[]
	agencies: AgencyRow[]
	total: number
	label: string
}

type AgencyDetailRow = AgencyRow['detailRows'][number]

type CategoryOfficeContribution = {
	agencyId: string
	agencyName: string
	personnel: number
	mooe: number
	capital: number
	total: number
}

type CategoryProgramContribution = AgencyDetailRow & {
	agencyId: string
	agencyName: string
}

function normalizeCategory(value: string | undefined) {
	return (value ?? 'Uncategorized').trim().toLowerCase()
}

function categoryMatches(value: string | undefined, category: string) {
	return normalizeCategory(value) === normalizeCategory(category)
}

function sumDetailRows(rows: AgencyDetailRow[]) {
	return rows.reduce(
		(sum, row) => ({
			personnel: sum.personnel + row.personnel_services,
			mooe: sum.mooe + row.mooe,
			capital: sum.capital + row.capital_outlays,
			total: sum.total + row.total,
		}),
		{ personnel: 0, mooe: 0, capital: 0, total: 0 },
	)
}

function directCategoryRows(agency: AgencyRow, category: string) {
	return agency.detailRows.filter((row) => categoryMatches(row.section_category ?? agency.category, category))
}

function detailBasisRows(rows: AgencyDetailRow[]) {
	const purposeRows = rows.filter((row) => row.row_type === 'program_or_purpose')

	return purposeRows.length > 0 ? purposeRows : rows
}

function buildOfficeContributors(category: string, agencies: AgencyRow[]) {
	return agencies
		.map<CategoryOfficeContribution | null>((agency) => {
			const directRows = directCategoryRows(agency, category)
			const primaryCategoryMatch = categoryMatches(agency.category, category)

			if (primaryCategoryMatch) {
				return {
					agencyId: agency.agency_id,
					agencyName: agency.agency_name,
					personnel: agency.personnel,
					mooe: agency.mooe,
					capital: agency.capital,
					total: agency.total_appropriation,
				}
			}

			const directTotals = sumDetailRows(detailBasisRows(directRows))

			if (directTotals.total <= 0) return null

			return {
				agencyId: agency.agency_id,
				agencyName: agency.agency_name,
				...directTotals,
			}
		})
		.filter((agency): agency is CategoryOfficeContribution => agency !== null)
		.sort((a, b) => b.total - a.total)
}

function buildProgramContributors(category: string, agencies: AgencyRow[]) {
	return agencies
		.flatMap<CategoryProgramContribution>((agency) =>
			directCategoryRows(agency, category)
				.filter((row) => row.row_type === 'program_or_purpose')
				.map((row) => ({
					...row,
					agencyId: agency.agency_id,
					agencyName: agency.agency_name,
				})),
		)
		.sort((a, b) => b.total - a.total)
}

function sourceLabelForDetailRow(row: AgencyDetailRow) {
	return row.source_page ? `P.${row.source_page}` : 'Source table'
}

function metaForContribution(row: CategoryProgramContribution) {
	return [`${titleCase(row.agencyName)} (${row.agencyId})`, `FY ${row.fiscal_year}`, sourceLabelForDetailRow(row)].filter(Boolean)
}

export function BudgetSectionCategoryAllocationTable({ rows, agencies, total, label }: BudgetSectionCategoryAllocationTableProps) {
	const sortedRows = [...rows].sort((a, b) => b.total - a.total)

	return (
		<section className='my-12'>
			<div className='mb-6! flex flex-wrap items-end justify-between gap-4'>
				<div>
					<p className='eyebrow'>Section category allocation</p>
					<h2 className='num mt-2 text-5xl font-extrabold uppercase tracking-normal'>By Section Category Allotted Budget</h2>
				</div>
				<div className='flex flex-wrap items-center gap-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
					<span className='inline-flex items-center gap-2'>
						<span className='h-2 w-5 bg-[var(--positive)]' />
						PS
					</span>
					<span className='inline-flex items-center gap-2'>
						<span className='h-2 w-5 bg-[var(--ochre)]' />
						MOOE
					</span>
					<span className='inline-flex items-center gap-2'>
						<span className='h-2 w-5 bg-[var(--slate)]' />
						CO
					</span>
				</div>
			</div>

			<div className='overflow-x-auto bg-[var(--paper)]'>
				<div className='min-w-[1040px]'>
					{sortedRows.map((row) => {
						const allocationTotal = row.personnel + row.mooe + row.capital || row.total
						const reportingUnits = buildOfficeContributors(row.category, agencies).length || row.entities

						return (
							<AutoScrollDetails
								key={row.category}
								name='section-category-allocation'
								className='group border-b border-[var(--rule-soft)] last:border-b-0'
							>
								<summary className='grid cursor-pointer list-none grid-cols-[minmax(28rem,1fr)_minmax(18rem,30%)] items-center transition hover:bg-[var(--paper-2)] group-open:bg-[var(--ink)] group-open:text-[var(--paper)] group-open:hover:bg-[var(--ink)] [&::-webkit-details-marker]:hidden'>
									<div className='flex items-center px-6 py-3 leading-tight'>
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
											<p className='text-sm font-semibold text-[var(--ink)] group-open:text-[var(--paper)]'>{row.category}</p>
											<p className='mt-1 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-[var(--ink-3)] group-open:text-[var(--paper-2)]'>
												{reportingUnits} reporting {reportingUnits === 1 ? 'unit' : 'units'}
											</p>
										</div>
									</div>
									<div className='px-6 py-3'>
										<div className='mb-2 flex items-baseline justify-between gap-4'>
											<p className='num text-left text-sm font-semibold leading-tight text-[var(--ink)] group-open:text-[var(--paper)]'>{exactTableCurrency(row.total)}</p>
											<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] group-open:text-[var(--paper-2)]'>{budgetShare(row.total, total, label)}</p>
										</div>
										<AllocationBar
											personnel={row.personnel}
											mooe={row.mooe}
											capital={row.capital}
											total={allocationTotal}
											activeOnOpen
											compact
										/>
									</div>
								</summary>
								<SectionCategoryAllocationDetail
									category={row.category}
									agencies={agencies}
								/>
							</AutoScrollDetails>
						)
					})}
				</div>
			</div>
		</section>
	)
}

function SectionCategoryAllocationDetail({ category, agencies }: { category: string; agencies: AgencyRow[] }) {
	const officeContributors = buildOfficeContributors(category, agencies)
	const programContributors = buildProgramContributors(category, agencies)

	return (
		<div className='border border-[var(--ink-3)] bg-[var(--paper-3)] px-12 py-6'>
			<div className='mt-5 space-y-7'>
				<CategoryOfficeContributionGroup rows={officeContributors} />
				<CategoryProgramContributionGroup rows={programContributors} />
			</div>
		</div>
	)
}

function CategoryOfficeContributionGroup({ rows }: { rows: CategoryOfficeContribution[] }) {
	if (rows.length === 0) return null

	return (
		<div>
			<div className='flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule)] pb-3'>
				<div>
					<h3 className='num mt-1 uppercase'>Offices contributing to this category.</h3>
				</div>
				<p className='font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)]'>{rows.length} offices</p>
			</div>
			<div className='divide-y divide-[var(--rule-soft)]'>
				{rows.map((row) => (
					<div
						key={row.agencyId}
						className='grid items-center gap-5 py-4 xl:grid-cols-[minmax(18rem,1fr)_13rem_24rem]'
					>
						<div className='pr-16'>
							<p className='text-sm font-semibold leading-snug! text-[var(--ink)]'>
								{titleCase(row.agencyName)} <span className='font-normal uppercase tracking-[0.08em] text-[var(--ink-3)]'>({row.agencyId})</span>
							</p>
						</div>
						<p className='num text-left text-sm font-semibold'>{exactTableCurrency(row.total)}</p>
						<div>
							<AllocationBar
								personnel={row.personnel}
								mooe={row.mooe}
								capital={row.capital}
								total={row.personnel + row.mooe + row.capital || row.total}
								detailed
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

function CategoryProgramContributionGroup({ rows }: { rows: CategoryProgramContribution[] }) {
	if (rows.length === 0) return null

	return (
		<div>
			<div className='flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule)] pb-3'>
				<div>
					<h3 className='num mt-1 uppercase'>Program and purpose lines contributing to this category.</h3>
				</div>
				<p className='font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)]'>{rows.length} lines</p>
			</div>
			<div className='divide-y divide-[var(--rule-soft)]'>
				{rows.map((row, index) => (
					<div
						key={`${row.fiscal_year}-${row.agencyId}-${row.name}-${row.total}-${index}`}
						className='grid items-center gap-5 py-4 xl:grid-cols-[minmax(18rem,1fr)_13rem_24rem]'
					>
						<div className='pr-16'>
							<p className='text-sm font-semibold leading-snug! text-[var(--ink)]'>{titleCase(row.name)}</p>
							<p className='mt-0.5! text-xs leading-4 text-[var(--ink-3)]'>{metaForContribution(row).join('  ·  ')}</p>
						</div>
						<p className='num text-left text-sm font-semibold'>{exactTableCurrency(row.total)}</p>
						<div>
							<AllocationBar
								personnel={row.personnel_services}
								mooe={row.mooe}
								capital={row.capital_outlays}
								total={row.total}
								detailed
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
