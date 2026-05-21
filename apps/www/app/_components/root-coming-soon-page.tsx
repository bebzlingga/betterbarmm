import { SiteHeader } from './site-header'
import { type ReactNode } from 'react'

type RootComingSoonPageProps = {
	activeItem: 'about' | 'contact'
	eyebrow: string
	title: string
	description: ReactNode
	notes: string[]
}

export function RootComingSoonPage({ activeItem, eyebrow, title, description, notes }: RootComingSoonPageProps) {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem={activeItem} />

			<section className='relative overflow-hidden border-b border-[var(--ink)]'>
				<div
					className='absolute inset-0 opacity-70'
					aria-hidden='true'
				>
					<div className='absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_right,var(--rule-soft)_1px,transparent_1px),linear-gradient(to_bottom,var(--rule-soft)_1px,transparent_1px)] bg-[size:72px_72px] sm:bg-[size:96px_96px]' />
				</div>

				<div className='relative mx-auto max-w-7xl px-12 py-16 sm:py-20 lg:py-32'>
					<p className='eyebrow'>{eyebrow}</p>
					<h1 className='mt-4 max-w-6xl text-5xl font-extrabold leading-[0.92] tracking-[-0.04em] sm:mt-5 sm:text-7xl md:text-8xl lg:text-[8.5rem] xl:text-[9rem]'>{title}</h1>
					<p className='mt-6 max-w-3xl text-base leading-6! text-[var(--ink-2)] sm:mt-8 sm:text-lg sm:leading-7! lg:text-xl lg:leading-9!'>{description}</p>
				</div>
			</section>

			<section className='mx-auto max-w-7xl px-12 py-20 sm:py-24 lg:py-32'>
				<div className='grid border-y border-[var(--ink)] sm:grid-cols-2 lg:grid-cols-3'>
					{notes.map((note, index) => (
						<div
							key={note}
							className='border-b border-[var(--rule)] p-5 sm:border-r sm:p-6 sm:last:col-span-2 sm:last:border-r-0 sm:[&:nth-child(2n)]:border-r-0 lg:last:col-span-1 lg:border-b-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0'
						>
							<p className='inline-block bg-[var(--accent)] px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.28em] text-white'>0{index + 1}</p>
							<p className='mt-5 text-sm leading-6 text-[var(--ink-2)] sm:text-base sm:leading-7'>{note}</p>
						</div>
					))}
				</div>
			</section>
		</main>
	)
}
