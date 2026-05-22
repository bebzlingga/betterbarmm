import { formatCurrency } from '@betterbarmm/charts'
import { type buildExpenseClasses, percentOfTotal } from '../_lib/budget-view-model'

interface BudgetExpenseCompositionProps {
	label: string
	total: number
	expenseClasses: ReturnType<typeof buildExpenseClasses>
}

export function BudgetExpenseComposition({ label, total, expenseClasses }: BudgetExpenseCompositionProps) {
	return (
		<section className='border border-[var(--ink)] bg-[var(--paper)] p-10'>
			<div className='flex flex-wrap items-baseline justify-between gap-4'>
				<h2 className='text-2xl font-extrabold tracking-normal'>Expense class composition</h2>
				<p className='text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]'>
					{label} / {formatCurrency(total)}
				</p>
			</div>
			<div className='mt-5 flex h-8 overflow-hidden border border-[var(--ink)]'>
				{expenseClasses.map((expenseClass) => (
					<div
						key={expenseClass.label}
						className={`flex min-w-0 items-center justify-center overflow-hidden ${expenseClass.color} text-[10px] font-semibold tracking-[0.08em] text-[var(--paper)]`}
						style={{
							width: percentOfTotal(expenseClass.value, total),
						}}
					>
						{expenseClass.shortLabel}
					</div>
				))}
			</div>
			<div className='mt-5 grid gap-4 md:grid-cols-3'>
				{expenseClasses.map((expenseClass) => (
					<div
						key={expenseClass.label}
						className='border-t border-[var(--rule)] pt-4'
					>
						<p className='eyebrow'>{expenseClass.label}</p>
						<div className='mt-2 flex items-baseline justify-between gap-4'>
							<p className='num text-2xl font-semibold'>{percentOfTotal(expenseClass.value, total)}</p>
							<p className='num text-sm text-[var(--ink-3)]'>{formatCurrency(expenseClass.value)}</p>
						</div>
						<p className='mt-2 text-sm text-[var(--ink-3)]'>{expenseClass.description}</p>
					</div>
				))}
			</div>
		</section>
	)
}
