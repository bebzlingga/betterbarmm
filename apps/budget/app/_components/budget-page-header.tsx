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
				<h2 className='uppercase num mt-2 max-w-6xl break-words text-5xl! font-extrabold leading-none tracking-normal sm:text-7xl! lg:text-[100px]!'>{title}</h2>
				{description ? <p className='mt-5! max-w-3xl text-sm leading-7 text-[var(--ink-2)] sm:mt-8! sm:text-base sm:leading-8'>{description}</p> : null}
				{aside}
			</div>
		</section>
	)
}
