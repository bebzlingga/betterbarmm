import type { Metadata } from 'next'
import { budgetFor, percent, pesoTight } from '@betterbarmm/budget-data'
import { Suspense } from 'react'
import { BrowserSkeleton } from '../_components/browser-skeleton'
import { Masthead, SourceNote } from '../_components/budget-parts'
import { ProgramBrowser } from '../_components/program-browser'
import { FigureCards, SectionTitle, WholeActBar } from '../_components/page-figures'

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
	/* Programs only, not their sub-programs: a sub-program's money is already inside its program, so counting both
	   would put some pesos in twice. */
	const ranked = programs.filter((program) => program.level === 'program').sort((a, b) => b.total - a.total)
	const biggest = ranked[0]!
	const topTen = ranked.slice(0, 10).reduce((sum, program) => sum + program.total, 0)
	let running = 0
	let toHalf = 0
	for (const program of ranked) {
		running += program.total
		toHalf += 1
		if (running >= budget.total / 2) break
	}

	return (
		<>
			<Masthead
				kicker={`Fiscal year ${budget.fiscalYear}`}
				title='Programs'
				lead={`All ${programs.length} programs and sub-programs in the Act, searchable by name, office and sector, largest first.`}
			>
				<WholeActBar
					title='The whole Act, a program at a time'
					total={budget.total}
					parts={ranked.map((program) => ({ name: program.name, amount: program.total }))}
					rest='Not under any program'
					fmt={pesoTight}
					pct={(share) => percent(share * 100, 1)}
				/>

				<FigureCards
					band
					items={[
						{ label: 'Programs', value: String(ranked.length), note: `And ${programs.length - ranked.length} sub-programs under them` },
						{ label: 'Hold half', value: String(toHalf), note: `The largest ${toHalf}: ${percent((running / budget.total) * 100, 1)} of the Act` },
						{ label: 'Largest', value: pesoTight(biggest.total), note: biggest.name },
						{ label: 'Top ten', value: percent((topTen / budget.total) * 100, 0), note: 'Of the Act, in the ten largest programs' },
					]}
				/>
			</Masthead>

			{/* The estate's section rhythm opens a block of reading. What opens here
			    is a control, and at 9rem of air the search field a reader came for
			    sits below the fold on a laptop. Held off the masthead, not spaced
			    away from it. */}

			<section className='bb-container section-band'>
				<SectionTitle title='Every program, largest first' lead='Search by name, or narrow it to a sector.' className='mb-8' />
				{/* The browser reads `?q=`, which puts it behind a Suspense boundary or
				    the whole route falls out of prerendering. */}
				<Suspense
					fallback={<BrowserSkeleton kind='programs' label={`Loading ${programs.length} programs…`} />}
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
