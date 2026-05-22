import { formatCurrency } from '@betterbarmm/charts'
import { Minus, Plus } from 'lucide-react'
import { type ProgramRow } from '../_lib/budget-view-model'
import { AutoScrollDetails } from './auto-scroll-details'
import { AllocationBar, budgetShare, exactTableCurrency, titleCase } from './budget-office-allocation-table'

interface BudgetProgramTableProps {
	programs: ProgramRow[]
	total: number
	label: string
	limit?: number
}

export function BudgetProgramTable({ programs, total, label, limit }: BudgetProgramTableProps) {
	const visiblePrograms = limit ? programs.slice(0, limit) : programs

	return (
		<section
			id='programs'
			className='my-10 scroll-mt-40 sm:my-12 sm:scroll-mt-[220px]'
		>
			<div className='overflow-x-auto bg-[var(--paper)]'>
				<div className='md:min-w-[860px]'>
					{visiblePrograms.map((program) => {
						const allocationTotal = program.personnel_services + program.mooe + program.capital_outlays || program.total

						return (
							<AutoScrollDetails
								key={program.program_id}
								name='program-allocation'
								className='group border-b border-[var(--rule-soft)] last:border-b-0'
							>
								<summary className='grid cursor-pointer list-none gap-1 transition hover:bg-[var(--paper-2)] group-open:bg-[var(--ink)] group-open:text-[var(--paper)] group-open:hover:bg-[var(--ink)] md:grid-cols-[minmax(22rem,1fr)_minmax(16rem,30%)] md:items-center [&::-webkit-details-marker]:hidden'>
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
											<p className='text-sm font-semibold text-[var(--ink)] group-open:text-[var(--paper)]'>{titleCase(program.program_name)}</p>
											<p className='mt-1 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-[var(--ink-3)] group-open:text-[var(--paper-2)]'>
												{titleCase(program.agency_name)} ({program.agency_id}) / {program.category}
											</p>
										</div>
									</div>
									<div className='px-4 pb-4 sm:px-6 md:py-3'>
										<div className='mb-2 flex items-baseline justify-between gap-4'>
											<p className='num text-left text-sm font-semibold leading-tight text-[var(--ink)] group-open:text-[var(--paper)]'>{exactTableCurrency(program.total)}</p>
											<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] group-open:text-[var(--paper-2)]'>{budgetShare(program.total, total, label)}</p>
										</div>
										<AllocationBar
											personnel={program.personnel_services}
											mooe={program.mooe}
											capital={program.capital_outlays}
											total={allocationTotal}
											activeOnOpen
											compact
										/>
									</div>
								</summary>
								<ProgramDistributionDetail program={program} />
							</AutoScrollDetails>
						)
					})}
					{visiblePrograms.length === 0 ? <div className='px-6 py-10 text-sm leading-6 text-[var(--ink-3)]'>No programs match the selected filters.</div> : null}
				</div>
			</div>
		</section>
	)
}

function ProgramDistributionDetail({ program }: { program: ProgramRow }) {
	const objectDistributions = program.detail.objectDistributions

	return (
		<div className='border border-[var(--ink-3)] bg-[var(--paper-2)] px-4 py-5 sm:px-6 lg:px-12 lg:py-6'>
			<div>
				<div className='flex flex-wrap items-baseline justify-between gap-4'>
					<div>
						<p className='eyebrow'>Object-level distribution</p>
						<h3 className='mt-3 text-xl font-extrabold tracking-normal sm:text-2xl'>Funds by object item</h3>
					</div>
					<p className='font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]'>{objectDistributions.length > 0 ? `${objectDistributions.length} classes` : 'Class split only'}</p>
				</div>

				{objectDistributions.length > 0 ? (
					<div className='mt-5 space-y-6'>
						{objectDistributions.map((distribution) => (
							<div key={distribution.key}>
								<div className='mb-3 flex items-baseline justify-between gap-6'>
									<p className='font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]'>{distribution.label}</p>
									<p className='num text-sm font-semibold text-[var(--ink)]'>{formatCurrency(distribution.total)}</p>
								</div>
								<div className='space-y-0!'>
									{distribution.items.map((item, itemIndex) => (
										<div
											key={[distribution.key, item.name, item.amount, item.sourcePage ?? 'source', item.objectGroup ?? distribution.label, itemIndex].join('-')}
											className='-mx-3 grid gap-2 px-3 py-2 text-sm transition hover:bg-[var(--paper-3)] sm:grid-cols-[minmax(12rem,1fr)_minmax(7rem,22%)_9rem] sm:items-center md:grid-cols-[minmax(20rem,1fr)_minmax(8rem,16%)_10rem]'
										>
											<p className='font-semibold text-[var(--ink)]'>{item.name}</p>
											<div className='h-1.5 bg-[var(--rule-soft)]'>
												<div
													className='h-full bg-[var(--accent)]'
													style={{
														width: itemShare(item.amount, distribution.total),
													}}
												/>
											</div>
											<p className='num shrink-0 text-left text-[var(--ink-2)] sm:text-right'>{formatCurrency(item.amount)}</p>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className='mt-5 border border-[var(--rule)] bg-[var(--paper)] p-4'>
						<p className='text-sm leading-6 text-[var(--ink-3)]'>
							The comprehensive source does not itemize this program down to object-level rows. The PS, MOOE, and CO distribution is shown from the program amount columns.
						</p>
					</div>
				)}
			</div>
		</div>
	)
}

function itemShare(value: number, total: number) {
	if (total <= 0) return '0%'

	return `${Math.max(1, Math.min(100, Math.round((value / total) * 100)))}%`
}
