import type { Metadata } from 'next'
import { budgetFor } from '@betterbarmm/budget-data'
import { Masthead } from '../_components/budget-parts'
import { OfficeList } from '../_components/office-list'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ fy?: string }> }): Promise<Metadata> {
	const { budget, offices } = budgetFor((await searchParams).fy)
	return {
		title: 'Every office',
		description: `All ${offices.length} ministries, offices, attached agencies and special purpose funds in the FY ${budget.fiscalYear} Bangsamoro budget, with what each was appropriated.`,
	}
}

export default async function OfficesPage({ searchParams }: { searchParams: Promise<{ fy?: string }> }) {
	const { budget, offices } = budgetFor((await searchParams).fy)

	/* How few offices it takes to reach half the Act. This is why the list is
	   ordered by size rather than by the Act's own part numbers, so the header
	   says it instead of announcing the sort order. It is counted rather than
	   stated: it is four in FY 2026 and two in FY 2021, and a sentence that
	   named a number would be wrong in most years. */
	let running = 0
	let toHalf = 0
	for (const office of offices) {
		running += office.totals.total
		toHalf += 1
		if (running >= budget.total / 2) break
	}

	return (
		<>
			{/* The sources page's header, which is the estate's pattern for an index:
			    a kicker, a claim in two tones, and the figures under it as a row of
			    counted stats. It was a paragraph of prose carrying six figures inside
			    it — the same facts, but read as reading rather than as a dashboard,
			    and none of them findable without finishing the sentence. */}
			<Masthead
				kicker={`Fiscal year ${budget.fiscalYear}`}
				title={`${toHalf} ${toHalf === 1 ? 'office holds' : 'offices hold'} half`}
				titleMuted='of the whole budget.'
			/>

			{/* The estate's section rhythm opens a block of reading. What opens here
			    is a control, and at 9rem of air the search field a reader came for
			    sits below the fold on a laptop. Held off the masthead, not spaced
			    away from it. */}
			<section className='bb-container section-band'>
				<OfficeList offices={offices} />
			</section>
		</>
	)
}
