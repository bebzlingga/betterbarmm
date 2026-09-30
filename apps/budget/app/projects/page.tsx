import type { Metadata } from 'next'
import { Rise } from '@betterbarmm/editorial'
import { budgetFor } from '@betterbarmm/budget-data'
import { Suspense } from 'react'
import { Masthead, SourceNote } from '../_components/budget-parts'
import { ProjectBrowser } from '../_components/project-browser'
import { ProjectCharts } from '../_components/project-charts'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ fy?: string }> }): Promise<Metadata> {
	const { budget, projects } = budgetFor((await searchParams).fy)
	return {
		title: 'What is being built',
		description: `All ${projects.length} roads, bridges, flood control structures and buildings the Ministry of Public Works is funded to build in FY ${budget.fiscalYear}, searchable by barangay and municipality.`,
	}
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ fy?: string }> }) {
	const fy = (await searchParams).fy
	const { budget, projects, projectKinds, projectsByProvince } = budgetFor(fy)

	const areas = projectsByProvince.map((group) => ({
		province: group.province,
		count: group.projects.length,
		total: group.total,
	}))

	return (
		<>
			{/* No lead (user decision). The two charts take its place, inside the
			    header and under the claim (user decision): they open with the same
			    facts a paragraph would have asserted, and measure them instead. They
			    need no crimson variant — every color in them is a token, and
			    `bb-crimson` has already re-pointed each one to the band. */}
			<Masthead
				kicker={`Fiscal year ${budget.fiscalYear} · Ministry of Public Works`}
				title={`${projects.length} projects,`}
				titleMuted='each with a place on it.'
			>
				<Rise delay={0.3} distance={14}>
					<div className='mt-12'>
						<ProjectCharts fy={fy} />
					</div>
				</Rise>
			</Masthead>

			{/* The estate's section rhythm opens a block of reading. What opens here
			    is a control, and at 9rem of air the search field a reader came for
			    sits below the fold on a laptop. Held off the band above, not spaced
			    away from it. */}
			<section className='bb-container section-band'>
				<Suspense
					fallback={
						<p className='py-16 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
							Loading {projects.length} projects…
						</p>
					}
				>
					<ProjectBrowser
						projects={projects}
						areas={areas}
						kinds={projectKinds}
						fiscalYear={budget.fiscalYear}
					/>
				</Suspense>

				<SourceNote
					pages={projects.map((project) => project.source_page ?? 0).filter(Boolean)}
					what='Every project on this page'
					fy={fy}
				/>
			</section>
		</>
	)
}
