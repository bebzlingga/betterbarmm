import type { Metadata } from 'next'
import { Rise } from '@betterbarmm/editorial'
import { budgetFor } from '@betterbarmm/budget-data'
import { Suspense } from 'react'
import { BrowserSkeleton } from '../_components/browser-skeleton'
import { Masthead, SourceNote } from '../_components/budget-parts'
import { ProjectBrowser } from '../_components/project-browser'
import { ProjectCharts } from '../_components/project-charts'
import { otherYearsFor, RepeatProjects } from '../_components/repeat-projects'
import { ProjectMap } from '../_components/project-map'
import { SectionHead } from '@betterbarmm/editorial'

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
			{/* Where each project is, read out of its own name. */}
			{/* A light band rather than a full section (user decision): what the map shows on the left, the door to it on the
			    right, on one centred row — the map opens over the page, as the incident map does. */}
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container flex flex-wrap items-center justify-between gap-x-16 gap-y-6 py-12 lg:py-14'>
					<div className='max-w-[46rem]'>
						<p className='bb-label'>On the map</p>
						<h2 className='bb-display-sm mt-3 text-[var(--ink)]'>
							Where the money <span className='bb-mute'>is being built.</span>
						</h2>
						<p className='bb-body mt-4 text-[var(--ink-2)]'>
							Every project whose name says where it is, on that barangay or town. Open the map to zoom in on a place and click a dot to see what is being built there.
						</p>
					</div>
					<ProjectMap projects={projects} fy={fy} title={`Where the FY ${budget.fiscalYear} projects are`} />
				</div>
			</section>

			<section id='browse' className='bb-container section-band-bottom pt-12 lg:pt-14 scroll-mt-[calc(var(--site-header-h)+1rem)]'>
				<Suspense
					fallback={<BrowserSkeleton kind='projects' label={`Loading ${projects.length} projects…`} />}
				>
					<ProjectBrowser
						projects={projects}
						areas={areas}
						kinds={projectKinds}
						fiscalYear={budget.fiscalYear}
						repeats={otherYearsFor(budget.fiscalYear)}
					/>
				</Suspense>

				<SourceNote
					pages={projects.map((project) => project.source_page ?? 0).filter(Boolean)}
					what='Every project on this page'
					fy={fy}
				/>
			</section>

			{/* Across all seven Acts, whatever year is open above: a phase is only legible next to the others. */}
			<section className='bb-container section-band'>
				<SectionHead
					eyebrow='Built in phases'
					size='sm'
					title='Funded in'
					titleMuted='more than one Act.'
					lead='The same road, bridge or flood wall, appropriated again in a later year. Each Act on its own shows one phase; together they show what the work costs.'
				/>
				<div className='mt-8'>
					<RepeatProjects />
				</div>
			</section>
		</>
	)
}
