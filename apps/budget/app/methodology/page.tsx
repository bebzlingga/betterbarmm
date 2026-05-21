import { BudgetMetricStrip } from '../_components/budget-metric-strip'
import { BudgetPageHeader } from '../_components/budget-page-header'
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
			<section className='mb-12 mt-16'>
				<BudgetPageHeader
					eyebrow='Methodology'
					title={<>How the BARMM budget dictionary is assembled.</>}
					description={
						<>
							Inspired by BetterGov&apos;s dictionary approach, this portal keeps the GAAB source files close to the interface while normalizing each fiscal year into comparable offices, programs,
							section categories, and PS/MOOE/CO allocations. Totals stay tied to their source year; derived views are built from those preserved rows.
						</>
					}
				/>
			</section>

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

			<section className='my-32'>
				<div className='mb-12! flex flex-wrap items-end justify-between gap-4'>
					<div>
						<p className='eyebrow'>Processing pipeline</p>
						<h2 className='num mt-2 text-5xl font-extrabold uppercase tracking-normal'>Assembly Steps</h2>
					</div>
					<p className='font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]'>{pipelineSteps.length} steps</p>
				</div>
				<div className='grid gap-10 md:grid-cols-2 xl:grid-cols-4'>
					{pipelineSteps.map((item) => (
						<div
							key={item.step}
							className='border-t border-[var(--ink)] pt-5'
						>
							<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>Step {item.step}</p>
							<h3 className='num uppercase mt-4 text-2xl font-extrabold tracking-normal'>{item.title}</h3>
							<p className='mt-2! text-sm leading-snug! text-[var(--ink-3)]'>{item.detail}</p>
						</div>
					))}
				</div>
			</section>

			<section className='mb-12 mt-24'>
				<div className='mb-6! flex flex-wrap items-end justify-between gap-4'>
					<div>
						<p className='eyebrow'>Validation table</p>
						<h2 className='num mt-2 text-5xl font-extrabold uppercase tracking-normal'>Checks</h2>
					</div>
					<p className='font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]'>{selection.budget.act_number}</p>
				</div>
				<div className='overflow-x-auto bg-[var(--paper)]'>
					<div className='min-w-[980px] border-t border-[var(--ink)]'>
						<div className='grid grid-cols-[16rem_minmax(28rem,1fr)_14rem] border-b border-[var(--rule-soft)] px-8 py-5 text-sm font-semibold text-[var(--ink)]'>
							<div>Check</div>
							<div>Rule</div>
							<div>Status</div>
						</div>
						<div className='divide-y divide-[var(--rule-soft)]'>
							{validationRows.map((row) => (
								<div
									key={row.check}
									className='grid grid-cols-[16rem_minmax(28rem,1fr)_14rem] items-center px-8 py-6 transition hover:bg-[var(--paper-2)]'
								>
									<p className='text-sm font-semibold text-[var(--ink)]'>{row.check}</p>
									<p className='text-sm leading-6 text-[var(--ink-2)]'>{row.rule}</p>
									<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>{row.status}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			<section className='my-32 mb-24'>
				<div className='mb-6! flex flex-wrap items-end justify-between gap-4'>
					<div>
						<p className='eyebrow'>Definition of terms</p>
						<h2 className='num mt-2 text-5xl font-extrabold uppercase tracking-normal'>Budget Terms</h2>
					</div>
					<p className='font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]'>{definitionTerms.length} terms</p>
				</div>
				<div className='overflow-x-auto bg-[var(--paper)]'>
					<div className='min-w-[760px] border-t border-[var(--ink)]'>
						{definitionTerms.map((item) => (
							<div
								key={item.term}
								className='grid grid-cols-[16rem_minmax(28rem,1fr)] items-start border-b border-[var(--rule-soft)] px-8 py-6 transition hover:bg-[var(--paper-2)]'
							>
								<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>{item.term}</p>
								<p className='text-sm leading-6 text-[var(--ink-2)]'>{item.definition}</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</BudgetPageShell>
	)
}
