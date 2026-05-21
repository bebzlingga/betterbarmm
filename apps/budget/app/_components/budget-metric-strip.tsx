import { type ReactNode } from 'react'

interface BudgetMetric {
	label: string
	value: ReactNode
	detail: ReactNode
}

interface BudgetMetricStripProps {
	metrics: BudgetMetric[]
}

export function BudgetMetricStrip({ metrics }: BudgetMetricStripProps) {
	return (
		<section className='grid border-t border-[var(--ink)] sm:grid-cols-2 lg:grid-cols-4'>
			{metrics.map((metric, index) => (
				<div
					key={metric.label}
					className='border-b border-r border-b-[var(--ink)] border-r-[var(--rule)] p-6 lg:[&:nth-child(4n)]:border-r-0'
				>
					<p className='inline-block bg-[var(--accent)] pl-2 pr-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.28em] text-white'>{metric.label}</p>
					<p className='num mt-5 text-4xl font-semibold uppercase leading-none'>{metric.value}</p>
					<p className='font-mono text-[10px] font-medium uppercase tracking-[0.12em] leading-tight! text-[var(--ink-3)]'>{metric.detail}</p>
				</div>
			))}
		</section>
	)
}
