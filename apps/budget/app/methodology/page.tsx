import { BudgetMetricStrip } from '../_components/budget-metric-strip'
import { BudgetPageShell } from '../_components/budget-page-shell'
import { buildAgencyRows, buildProgramRows, getFullBudgetSelection, sourceFiles } from '../_lib/budget-view-model'

const pipelineSteps = [
	{
		step: '01',
		title: 'Ingest GAAB JSON',
		detail: 'Load the FY 2020-FY 2026 comprehensive BARMM source file and preserve source filenames, agency codes, and expense totals.',
	},
	{
		step: '02',
		title: 'Normalize objects',
		detail: 'Map reporting units into stable agency objects, categories, total appropriation, Personnel Services, MOOE, and Capital Outlays.',
	},
	{
		step: '03',
		title: 'Attach program lines',
		detail: 'Read FPAP program rows from the program index and attach them to the matching agency object for each fiscal year.',
	},
	{
		step: '04',
		title: 'Keep fiscal years isolated',
		detail: 'Normalize each fiscal year on its own before building range views, so yearly totals remain traceable to their source files.',
	},
]

const validationRows = [
	{
		check: 'Totals',
		rule: 'Year totals use budget_allocation_details.overall_appropriation.',
		status: 'Authoritative',
	},
	{
		check: 'Expense classes',
		rule: 'PS, MOOE, and CO totals are read from agency allocation details.',
		status: 'Normalized',
	},
	{
		check: 'Programs',
		rule: 'Program rows are joined from by_program_per_year under each agency code.',
		status: 'Joined',
	},
	{
		check: 'BARMM label',
		rule: 'The portal uses GAAB for Bangsamoro appropriation acts.',
		status: 'Applied',
	},
]

const definitionTerms = [
	{
		term: 'GAAB',
		definition: 'General Appropriations Act of the Bangsamoro. This is the primary enacted source used for yearly BARMM appropriations.',
	},
	{
		term: 'Appropriation',
		definition: 'The amount authorized in the GAAB for an office, fund, program, or purpose. It is a budget allocation, not actual spending.',
	},
	{
		term: 'Office / reporting unit',
		definition: 'A ministry, parliament office, executive office, commission, authority, or fund entity that receives an appropriation.',
	},
	{
		term: 'Program / FPAP line',
		definition: 'A function, program, activity, project, or purpose row listed under an office in the source table.',
	},
	{
		term: 'Section category',
		definition: 'The source grouping used to organize offices and funds, such as ministries, parliament, executive offices, and special purpose funds.',
	},
	{
		term: 'PS',
		definition: 'Personnel Services. Salaries, wages, compensation, benefits, and other personnel-related costs.',
	},
	{
		term: 'MOOE',
		definition: 'Maintenance and Other Operating Expenses. Operating costs such as travel, supplies, utilities, services, grants, and other recurring expenses.',
	},
	{
		term: 'CO',
		definition: 'Capital Outlays. Infrastructure, equipment, public assets, and other long-lived investments.',
	},
	{
		term: 'Object of expenditures',
		definition: 'Detailed expense items under PS, MOOE, or CO, such as traveling expenses, representation allowance, supplies, or equipment outlay.',
	},
	{
		term: 'Special provisions',
		definition: 'GAAB clauses that attach implementation, release, reporting, transparency, or use conditions to an appropriation.',
	},
	{
		term: 'Source line',
		definition: 'A row extracted from the GAAB table with its filename, page reference, category, and amount columns preserved for review.',
	},
	{
		term: 'Normalized field',
		definition: 'A cleaned and standardized field used by the portal so figures can be compared across fiscal years.',
	},
]

export default function BudgetMethodologyPage() {
	const selection = getFullBudgetSelection()
	const agencyRows = buildAgencyRows(selection.budget)
	const programRows = buildProgramRows(selection.budget)

	return (
		<BudgetPageShell activeItem='Methodology'>
			<BudgetMetricStrip
				metrics={[
					{
						label: 'Source files',
						value: sourceFiles.length,
						detail: 'GAAB inputs',
					},
					{
						label: 'Objects',
						value: agencyRows.length,
						detail: 'Range aggregate',
					},
					{
						label: 'Programs',
						value: programRows.length,
						detail: 'Merged FPAP lines',
					},
					{
						label: 'Act label',
						value: 'GAAB',
						detail: 'BARMM standard',
					},
				]}
			/>

			<section className='-mx-6 my-16 border-y border-[var(--rule)] bg-[var(--paper-2)] px-6 py-8 sm:-mx-8 sm:my-24 sm:px-8 sm:py-10'>
				<div className='mb-12! flex flex-wrap items-end justify-between gap-4'>
					<div>
						<p className='eyebrow'>Processing pipeline</p>
						<h2 className='num mt-2 text-3xl font-extrabold tracking-normal sm:text-5xl'>Assembly Steps</h2>
					</div>
					<p className='text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]'>{pipelineSteps.length} steps</p>
				</div>
				<div className='grid gap-10 md:grid-cols-2 xl:grid-cols-4'>
					{pipelineSteps.map((item) => (
						<div
							key={item.step}
							className='border-t border-[var(--ink)] pt-5'
						>
							<p className='text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>Step {item.step}</p>
							<h3 className='num mt-4 text-2xl font-extrabold tracking-normal'>{item.title}</h3>
							<p className='mt-2! text-sm leading-snug! text-[var(--ink-3)]'>{item.detail}</p>
						</div>
					))}
				</div>
			</section>

			<section className='my-16 sm:my-24'>
				<div className='mb-6! flex flex-wrap items-end justify-between gap-4'>
					<div>
						<p className='eyebrow'>Validation table</p>
						<h2 className='num mt-2 text-3xl font-extrabold tracking-normal sm:text-5xl'>Checks</h2>
					</div>
					<p className='text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]'>{selection.budget.act_number}</p>
				</div>
				<div className='overflow-x-auto bg-[var(--paper)]'>
					<div className='border-t border-[var(--ink)] md:min-w-[840px]'>
						<div className='hidden grid-cols-[12rem_minmax(22rem,1fr)_10rem] border-b border-[var(--rule-soft)] px-6 py-5 text-sm font-semibold text-[var(--ink)] md:grid lg:grid-cols-[16rem_minmax(28rem,1fr)_14rem] lg:px-8'>
							<div>Check</div>
							<div>Rule</div>
							<div>Status</div>
						</div>
						<div className='divide-y divide-[var(--rule-soft)]'>
							{validationRows.map((row) => (
								<div
									key={row.check}
									className='grid gap-3 px-4 py-5 transition hover:bg-[var(--paper-2)] sm:px-6 md:grid-cols-[12rem_minmax(22rem,1fr)_10rem] md:items-center lg:grid-cols-[16rem_minmax(28rem,1fr)_14rem] lg:px-8 lg:py-6'
								>
									<p className='text-sm font-semibold text-[var(--ink)]'>{row.check}</p>
									<p className='text-sm leading-6 text-[var(--ink-2)]'>{row.rule}</p>
									<p className='text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>{row.status}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			<section className='-mx-6 my-16 border-y border-[var(--rule)] bg-[var(--paper-2)] px-6 py-8 sm:-mx-8 sm:my-24 sm:px-8 sm:py-10'>
				<div className='mb-6! flex flex-wrap items-end justify-between gap-4'>
					<div>
						<p className='eyebrow'>Definition of terms</p>
						<h2 className='num mt-2 text-3xl font-extrabold tracking-normal sm:text-5xl'>Budget Terms</h2>
					</div>
					<p className='text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]'>{definitionTerms.length} terms</p>
				</div>
				<div className='overflow-x-auto bg-[var(--paper)]'>
					<div className='border-t border-[var(--ink)] md:min-w-[760px]'>
						{definitionTerms.map((item) => (
							<div
								key={item.term}
								className='grid gap-3 border-b border-[var(--rule-soft)] px-4 py-5 transition hover:bg-[var(--paper-2)] sm:px-6 md:grid-cols-[14rem_minmax(24rem,1fr)] md:px-8 md:py-6 lg:grid-cols-[16rem_minmax(28rem,1fr)]'
							>
								<p className='text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>{item.term}</p>
								<p className='text-sm leading-6 text-[var(--ink-2)]'>{item.definition}</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</BudgetPageShell>
	)
}
