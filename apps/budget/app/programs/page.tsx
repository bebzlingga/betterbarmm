import type { Metadata } from 'next'
import { budgetFor } from '@betterbarmm/budget-data'
import { Suspense } from 'react'
import { Masthead, SourceNote } from '../_components/budget-parts'
import { ProgramBrowser } from '../_components/program-browser'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ fy?: string }> }): Promise<Metadata> {
	const { budget, programs } = budgetFor((await searchParams).fy)
	return {
		title: 'Every program',
		description: `All ${programs.length} programs and sub-programs in the FY ${budget.fiscalYear} Bangsamoro budget, searchable by sector — scholarships, health facilities, farm-to-market roads.`,
	}
}

export default async function ProgramsPage({ searchParams }: { searchParams: Promise<{ fy?: string }> }) {
	const fy = (await searchParams).fy
	const { budget, programs, sectors } = budgetFor(fy)

	return (
		<>
			<Masthead
				kicker={`Fiscal year ${budget.fiscalYear}`}
				title={`${programs.length} programs,`}
				titleMuted='searchable by sector.'
			/>

			{/* The estate's section rhythm opens a block of reading. What opens here
			    is a control, and at 9rem of air the search field a reader came for
			    sits below the fold on a laptop. Held off the masthead, not spaced
			    away from it. */}
			<section className='bb-container section-band'>
				{/* The browser reads `?q=`, which puts it behind a Suspense boundary or
				    the whole route falls out of prerendering. */}
				<Suspense
					fallback={
						<p className='py-16 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
							Loading {programs.length} programs…
						</p>
					}
				>
					{/* Eight chips, not 38. They are a shortcut for the commonest questions,
					    not the index — that is the sectors page, linked beside them. */}
					<ProgramBrowser programs={programs} sectors={sectors} />
				</Suspense>

				<SourceNote what='Every figure on this page' fy={fy} />
			</section>
		</>
	)
}
