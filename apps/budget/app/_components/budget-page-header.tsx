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
				<h2 className='uppercase num mt-2 max-w-5xl text-[100px]! font-extrabold leading-none tracking-normal sm:text-7xl'>{title}</h2>
				<p className='mt-8! max-w-3xl text-base leading-8 text-[var(--ink-2)]'>{description}</p>
				{aside}
			</div>
		</section>
	)
}
