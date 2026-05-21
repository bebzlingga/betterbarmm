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
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)'>
			<SiteHeader activeItem={activeItem} />

			<section className='relative overflow-hidden border-b border-[var(--ink)] '>
				<div
					className='absolute inset-0 opacity-70'
					aria-hidden='true'
				>
					<div className='absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_right,var(--rule-soft)_1px,transparent_1px),linear-gradient(to_bottom,var(--rule-soft)_1px,transparent_1px)] bg-[size:96px_96px]' />
				</div>

				<div className='relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-32'>
					<p className='eyebrow'>{eyebrow}</p>
					<h1 className='mt-5 max-w-6xl text-6xl font-extrabold leading-[0.9] tracking-[-0.045em] sm:text-8xl lg:text-[9rem]'>{title}</h1>
					<p className='mt-8 max-w-3xl text-lg leading-7! text-[var(--ink-2)] sm:text-xl sm:leading-9'>{description}</p>
				</div>
			</section>

			<section className='mx-auto max-w-7xl px-5 py-14 sm:px-8 py-48'>
				<div className='grid border-y border-[var(--ink)] lg:grid-cols-3'>
					{notes.map((note, index) => (
						<div
							key={note}
							className='border-b border-r border-[var(--rule)] p-6 last:border-r-0 lg:border-b-0'
						>
							<p className='inline-block bg-[var(--accent)] px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.28em] text-white'>0{index + 1}</p>
							<p className='mt-5 text-base leading-7 text-[var(--ink-2)]'>{note}</p>
						</div>
					))}
				</div>
			</section>
		</main>
	)
}
