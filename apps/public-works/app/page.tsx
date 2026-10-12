import { WorksExplorer } from './_components/works-explorer'
import { Figures, Masthead, YearBars, peso } from './_components/parts'
import { workAreas, workKinds, workYears, works } from './_lib/works'

export default async function PublicWorksHome({ searchParams }: { searchParams: Promise<{ area?: string; q?: string }> }) {
	const { area, q } = await searchParams
	const byYear = (fn: (y: number) => number) => workYears.map(fn)
	const of = (y: number) => works.filter((w) => w.year === y)
	const total = works.reduce((s, w) => s + w.amount, 0)
	const towns = new Set(works.filter((w) => w.town).map((w) => `${w.area}/${w.town!.slug}`))

	return (
		<>
			<Masthead
				kicker='Public works · Bangsamoro'
				name='What is being built'
				chart
				note={`Every road, bridge, water system and building the Bangsamoro budget has funded the Ministry of Public Works to build, FY ${workYears[0]} to FY ${workYears.at(-1)}: where it is, what it was given, and the bid notice that is probably it.`}
			>
				<YearBars
					bars={workYears.map((year) => ({ year, value: of(year).reduce((s, w) => s + w.amount, 0) }))}
					caption='Infrastructure projects itemised in each year’s Act, by amount'
				/>
			</Masthead>

			<Figures
				title='Since FY 2020'
				note='Counted off the projects each General Appropriations Act names one by one. An appropriation is what was set aside, not what was spent or built.'
				years={workYears}
				items={[
					{ value: works.length.toLocaleString('en-PH'), label: 'Projects named', series: byYear((y) => of(y).length) },
					{ value: peso(total), label: 'Appropriated', series: byYear((y) => of(y).reduce((s, w) => s + w.amount, 0)) },
					{ value: towns.size.toLocaleString('en-PH'), label: 'Towns and cities named', series: byYear((y) => new Set(of(y).filter((w) => w.town).map((w) => w.town!.slug)).size) },
					{ value: works.filter((w) => w.notice).length.toLocaleString('en-PH'), label: 'With a likely bid notice', series: byYear((y) => of(y).filter((w) => w.notice).length) },
				]}
			/>

			<section className='bb-container bb-section'>
				<WorksExplorer
					key={`${area ?? ''}-${q ?? ''}`}
					years={workYears}
					areas={workAreas.map((a) => a.name)}
					kinds={workKinds}
					initial={{ area, q }}
				/>
				<p className='mt-10 max-w-[48rem] text-[13px] leading-6 text-[var(--ink-3)]'>
					A <strong className='font-semibold text-[var(--ink-2)]'>likely bid notice</strong> is a Ministry of Public Works
					notice on PhilGEPS whose title shares the project&rsquo;s distinctive words, posted in its year or the next, for no
					more than its amount. It is a lead to check, not a confirmed link. Sulu&rsquo;s projects are listed for the years it
					was part of the region.
				</p>
			</section>
		</>
	)
}
