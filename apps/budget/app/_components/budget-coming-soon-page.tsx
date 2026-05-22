import { BudgetPageHeader } from './budget-page-header'
import { BudgetPageShell } from './budget-page-shell'

interface BudgetComingSoonPageProps {
	activeItem: string
	eyebrow: string
	title: string
	accent: string
	description: string
	signal: string
	statusHeading?: string
	notes: string[]
	checkpoints: string[]
}

export function BudgetComingSoonPage({ activeItem, eyebrow, title, accent, description, signal, statusHeading = "We're cooking.", notes, checkpoints }: BudgetComingSoonPageProps) {
	return (
		<BudgetPageShell activeItem={activeItem}>
			<section className='mb-12 mt-10 sm:mb-16 sm:mt-16'>
				<BudgetPageHeader
					eyebrow={eyebrow}
					title={
						<>
							{title} <span className='text-[var(--accent)]'>{accent}</span>
						</>
					}
					description={description}
					aside={
						<div className='mt-8 border-y border-[var(--ink)] sm:mt-12'>
							<div className='flex flex-wrap items-center justify-between gap-4 border-b border-[var(--rule)] px-4 py-4 text-[10px] font-bold uppercase tracking-[0.16em] sm:px-8'>
								<p className='text-[var(--accent)]'>Now simmering</p>
								<p className='text-[var(--ink-3)]'>Draft room / Not final</p>
							</div>
							<div className='grid md:grid-cols-3'>
								{notes.map((note) => (
									<div
										key={note}
										className='border-b border-[var(--rule)] p-4 last:border-b-0 sm:p-8 md:border-b-0 md:border-r md:last:border-r-0'
									>
										<p className='mb-4! text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]'>Coming soon</p>
										<p className='num mt-3 text-xl font-semibold leading-snug! text-[var(--ink)]'>{note}</p>
									</div>
								))}
							</div>
						</div>
					}
				/>
			</section>

			<section className='mt-20 mb-16 grid gap-10 border-t border-[var(--ink)] pt-10 sm:mt-36 sm:mb-24 lg:grid-cols-[minmax(18rem,0.75fr)_1fr]'>
				<div className='lg:pr-10'>
					<p className='eyebrow'>Status</p>
					<h2 className='num mt-3 text-3xl font-extrabold tracking-normal sm:text-5xl'>{statusHeading}</h2>
					<p className='mt-5! text-sm leading-6 text-[var(--ink-3)]'>{signal}</p>
				</div>

				<div className='grid gap-4'>
					{checkpoints.map((checkpoint, index) => (
						<div
							key={checkpoint}
							className='grid items-center gap-5 border-b border-[var(--rule-soft)] py-5 md:grid-cols-[5rem_1fr_12rem]'
						>
							<p className='text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]'>{(index + 1).toString().padStart(2, '0')}</p>
							<p className='text-sm font-semibold text-[var(--ink)]'>{checkpoint}</p>
							<div className='h-2 border border-[var(--ink)] bg-[var(--paper-2)]'>
								<div
									className='h-full bg-[var(--accent)]'
									style={{ width: `${42 + index * 12}%` }}
								/>
							</div>
						</div>
					))}
				</div>
			</section>
		</BudgetPageShell>
	)
}
