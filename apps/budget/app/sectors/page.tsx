import type { Metadata } from 'next'
import { budgetFor, percent, pesoTight } from '@betterbarmm/budget-data'
import { Rise } from '@betterbarmm/editorial'
import { Masthead, SourceNote } from '../_components/budget-parts'
import { SectorChart } from '../_components/sector-chart'
import { SectorList } from '../_components/sector-list'
import { FigureCards, SectionTitle } from '../_components/page-figures'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ fy?: string }> }): Promise<Metadata> {
	const { budget } = budgetFor((await searchParams).fy)
	return {
		title: 'By sector',
		description: `The FY ${budget.fiscalYear} Bangsamoro budget sorted by what the money is for rather than who spends it — ${budget.sectorCount} sectors, from health and education to water, shari'ah and Marawi rehabilitation.`,
	}
}

export default async function SectorsPage({ searchParams }: { searchParams: Promise<{ fy?: string }> }) {
	const fy = (await searchParams).fy
	const { budget, sectors } = budgetFor(fy)
	const top = [...sectors].sort((a, b) => b.total - a.total)[0]!
	const lines = sectors.reduce((sum, sector) => sum + sector.count, 0)

	return (
		<>
			<Masthead
				kicker={`Fiscal year ${budget.fiscalYear}`}
				/* The claim the page exists to make: the Act is filed by who spends,
				   so the one question it cannot answer is the one everybody arrives
				   with. The muted line is the longer of the two (user decision), which
				   is the rag every other masthead on the workspace sets. */
				title='Sectors'
				lead='Not who spends it, but what the region spends it on: every line of the Act filed under the subject it pays for, ranked. A line can sit under more than one, so the columns never add up to the Act.'
			>
				{/* The chart inside the header and under the claim (user decision),
				    in place of the four figures that stood here: the largest and the
				    smallest sector were two of them, and the columns say both at once
				    and the thirty-six in between as well. Every color in it is a
				    token, so it needs no crimson variant. */}
				<Rise delay={0.3} distance={14}>
					<div className='mt-12'>
						<SectorChart sectors={sectors} />
					</div>
				</Rise>
			</Masthead>

			{/* Both edges on the masthead's own pb (`Masthead` in budget-parts), so
			    the gap above the first row reads the same as the gap the masthead
			    leaves under its claim, and the page closes on that same measure.
			    Kept literal rather than on `bb-section-top`, whose clamp runs to
			    9rem and so would not match either. */}
			{/* Foot only. The chart band above closes on its own 9rem, and a second
			    measure on top of it put the search field most of a screen below the
			    thing it filters. */}
			<FigureCards
				items={[
					{ label: 'Sectors', value: String(sectors.length), note: 'The subjects every line is filed under' },
					{ label: 'Largest', value: pesoTight(top.total), note: `${top.name}: ${percent((top.total / budget.total) * 100, 1)} of the Act` },
					{ label: 'Lines tagged', value: lines.toLocaleString('en-PH'), note: 'A line can carry more than one sector' },
				]}
			/>

			<section className='bb-container section-band'>
				<SectionTitle title='Every sector, ranked' lead='Search a subject, or open one for every line filed under it.' className='mb-8' />
				<SectorList sectors={sectors} />

				<SourceNote what='Every line on this page' fy={fy} />
			</section>

		</>
	)
}