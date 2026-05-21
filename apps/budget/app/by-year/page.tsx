import { BudgetFiscalYearTiles } from '../_components/budget-fiscal-year-tiles'
import { BudgetMetricStrip } from '../_components/budget-metric-strip'
import { BudgetOfficeAllocationTable } from '../_components/budget-office-allocation-table'
import { BudgetPageHeader } from '../_components/budget-page-header'
import { BudgetPageShell } from '../_components/budget-page-shell'
import { BudgetSectionCategoryAllocationTable } from '../_components/budget-section-category-allocation-table'
import {
	buildAgencyRows,
	buildExpenseClasses,
	buildProgramRows,
	buildSectionCategoryRows,
	buildYearRows,
	compactCurrency,
	getBudgetSelection,
	type BudgetSearchParams,
} from '../_lib/budget-view-model'

export default async function BudgetByYearPage({ searchParams }: { searchParams: BudgetSearchParams }) {
	const params = await searchParams
	const { budget, toYear, selectedYearLabel } = getBudgetSelection(params)
	const yearRows = buildYearRows()
	const agencyRows = buildAgencyRows(budget)
	const expenseClasses = buildExpenseClasses(agencyRows)
	const programRows = buildProgramRows(budget)
	const sectionCategoryRows = buildSectionCategoryRows(budget)

	return (
		<BudgetPageShell activeItem='By Year'>
			<BudgetFiscalYearTiles
				rows={yearRows}
				selectedYear={toYear}
				flushTop
			/>

			<div className='mb-16 mt-20'>
				<BudgetPageHeader
					eyebrow='Appropriation ledger'
					title={
						<>
							Where <span className='text-[var(--accent)]'>{compactCurrency(budget.total_appropriation)}</span> goes, by agency and program.
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
						label: 'Agencies',
						value: agencyRows.length,
						detail: 'Reporting units',
					},
					{
						label: 'Programs',
						value: programRows.length,
						detail: 'FPAP lines',
					},
					{
						label: 'Section categories',
						value: sectionCategoryRows.length,
						detail: 'Official section/category groups',
					},
					...expenseClasses.map((expenseClass) => ({
						label: expenseClass.shortLabel,
						value: compactCurrency(expenseClass.value),
						detail: expenseClass.description,
					})),
				]}
			/>

			<BudgetOfficeAllocationTable
				agencies={agencyRows}
				total={budget.total_appropriation}
				label={selectedYearLabel}
			/>

			<BudgetSectionCategoryAllocationTable
				rows={sectionCategoryRows}
				agencies={agencyRows}
				total={budget.total_appropriation}
				label={selectedYearLabel}
			/>
		</BudgetPageShell>
	)
}
