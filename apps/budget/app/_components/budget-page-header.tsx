import { type ReactNode } from 'react'

interface BudgetPageHeaderProps {
	eyebrow: string
	title: ReactNode
	description?: ReactNode
	aside?: ReactNode
}

export function BudgetPageHeader({ eyebrow, title, description, aside }: BudgetPageHeaderProps) {
	return (
		<section className='border-[var(--ink)]'>
			<div>
				<p className='eyebrow'>{eyebrow}</p>
				<h1 className='mt-4 max-w-6xl break-words text-4xl font-extrabold leading-[0.94] tracking-[-0.04em] sm:mt-5 sm:text-6xl md:text-7xl lg:text-[8rem]'>{title}</h1>
				{description ? <p className='mt-6! max-w-3xl text-base leading-7 text-[var(--ink-2)] sm:mt-8 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9'>{description}</p> : null}
				{aside}
			</div>
		</section>
	)
}
