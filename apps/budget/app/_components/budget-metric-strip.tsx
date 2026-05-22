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
					className='border-b border-b-[var(--ink)] border-r-[var(--rule)] p-5 sm:border-r sm:p-6 sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(4n)]:border-r-0'
				>
					<p className='inline-block max-w-full break-words bg-[var(--accent)] pl-2 pr-1.5 font-mono text-[9px] font-medium uppercase leading-4 tracking-[0.24em] text-white sm:tracking-[0.28em]'>{metric.label}</p>
					<p className='num mt-5 text-3xl font-semibold uppercase leading-none sm:text-4xl'>{metric.value}</p>
					<p className='font-mono text-[10px] font-medium uppercase tracking-[0.12em] leading-tight! text-[var(--ink-3)]'>{metric.detail}</p>
				</div>
			))}
		</section>
	)
}
