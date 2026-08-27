import { SectionHead } from '@betterbarmm/editorial'
import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '../_components/page-header'
import { Reveal } from '../_components/reveal'
import { SectorBars } from '../_components/sector-bars'
import { SubjectTreemap } from '../_components/subject-treemap'
import { getDataset, registryGeneratedAt } from '../_lib/legislation-data'

export const metadata: Metadata = {
	title: 'The registry, counted',
	description:
		'What the Bangsamoro Parliament actually legislates about — bills and autonomy acts counted by subject, from health and education to budget and local government, with the coverage behind every figure stated.',
}

/* ============================================================
   The registry, counted

   Every other page here answers a question about one measure. This one
   answers a question about all of them at once: what does this Parliament
   spend its time on? A reader can get at that today only by opening the
   filters on /bills and reading the counts beside each subject, which is a
   chart nobody drew.

   Two counts rather than one, and deliberately not a comparison. What is
   filed and what becomes law are different populations, tagged from different
   source lists, and the registry's own vocabularies for the two are close but
   not identical — "Islamic Culture & Heritage" against "Culture & Heritage",
   "Infrastructure & Transport" against "Infrastructure". Setting them side by
   side on one axis would invent a subtraction that the data does not support,
   so they are two charts with two titles, and the difference between them is
   left for the reader to make rather than drawn as if it were measured.

   Coverage is stated on every figure. Parliament's index carries far more
   bills than the registry has read in full, and a subject tag only exists for
   a measure that has been read — so the subject counts describe the read
   portion, not the whole index, and the page says so where the number is
   rather than in a footnote.
   ============================================================ */

export default function DataPage() {
	const bills = getDataset('bills')
	const acts = getDataset('acts')

	// A subject tag exists only where the measure's own documents were read, so
	// the denominator for every figure below is the read set rather than the
	// index. Counted from the records themselves so it cannot drift from them.
	const billsCounted = bills.records.filter((record) => record.sectors.length > 0).length
	const actsCounted = acts.records.filter((record) => record.sectors.length > 0).length
	const billsShare = Math.round((billsCounted / bills.records.length) * 100)

	// The whole the treemap tiles. Not the bill count: a measure carries every
	// subject it touches, so the tags outnumber the measures and a chart that
	// tiled the bills would be stating something the register does not say.
	const subjectTags = bills.sectors.reduce((sum, sector) => sum + sector.count, 0)

	const topBillSubject = bills.sectors[0]
	const health = bills.sectors.find((sector) => sector.value === 'health')

	return (
		<>
			<PageHeader
				emphasis='brand'
				align='left'
				size='compact'
				eyebrow='The registry, counted'
				title='What Parliament works on.'
				titleMuted='Counted by subject.'
				description={`Parliament publishes its measures one at a time and never in aggregate, so what the chamber actually spends its time on is a question nobody can answer from its own site. These are the registry's own subject tags, tallied — ${billsCounted} bills and ${actsCounted} autonomy acts read in full, each counted under every subject it touches.`}
				figures={[
					{
						label: 'Bills counted',
						value: billsCounted.toLocaleString(),
						detail: `Read in full and tagged — ${billsShare}% of the ${bills.records.length.toLocaleString()} in Parliament's index.`,
					},
					{
						label: 'Acts counted',
						value: actsCounted.toLocaleString(),
						detail: 'Autonomy acts in force, tagged the same way.',
					},
					{
						label: 'Subjects',
						value: bills.sectors.length.toLocaleString(),
						detail: 'Policy areas the bills fall under. A measure can sit in more than one.',
					},
					{
						label: 'Largest subject',
						value: topBillSubject ? topBillSubject.count.toLocaleString() : '—',
						detail: topBillSubject
							? `${topBillSubject.label} — more bills than any other area.`
							: 'No subject tags in the read set yet.',
					},
				]}
			/>

			{/* ---- The two lists, side by side ----

			     One section rather than two, and the same encoding in both columns:
			     ranked bars, sorted, on their own scales. Set beside each other a
			     reader can run an eye across a subject and see it high on one list
			     and low on the other, which is the question the page exists to
			     answer.

			     The scales are deliberately not shared and the axis is not drawn
			     between them. The two lists are different sizes, tagged from
			     different source vintages, and their subject vocabularies do not
			     line up point for point — the caveat under the pair says so. Pairing
			     them on one axis would draw a subtraction the register cannot
			     support. */}
			{/* The full rhythm, not just the closing half. The stat band above
			    carries no padding under it — it hands that distance to whatever
			    follows — so a section set to `bb-section-bottom` left the head
			    sitting straight under the figures with nothing between them. */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='01'
					eyebrow='Subjects'
					title='What gets filed,'
					titleMuted='and what gets passed.'
					size='sm'
					lead={
						health
							? `Health is the largest single subject in the bills read so far — ${health.count} of the ${subjectTags} tags applied across ${billsCounted} bills — ahead of education and of social welfare. Among the acts already in force the order is different: governance and the budget lead. A measure carries every subject it touches, so each column adds to more than the number of measures in it.`
							: 'A measure carries every subject it touches, so each column adds to more than the number of measures in it.'
					}
				/>

				<Reveal delay={80}>
					<div className='grid gap-14 lg:grid-cols-2 lg:gap-16'>
						<div>
							<div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--brass-line)] pb-3'>
								<h3 className='item-title item-title-lg item-title-strong text-[var(--ink)]'>
									Filed as bills
								</h3>
								<p className='meta-sm'>
									<span className='num text-[var(--ink)]'>{billsCounted}</span> read in full
								</p>
							</div>
							<div className='mt-8'>
								<SectorBars items={bills.sectors} />
							</div>
						</div>

						<div>
							<div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--brass-line)] pb-3'>
								<h3 className='item-title item-title-lg item-title-strong text-[var(--ink)]'>
									Passed into law
								</h3>
								<p className='meta-sm'>
									<span className='num text-[var(--ink)]'>{actsCounted}</span> acts in force
								</p>
							</div>
							<div className='mt-8'>
								<SectorBars items={acts.sectors} />
							</div>
						</div>
					</div>
				</Reveal>

				{/* ---- The same bills, as areas ----

				     The columns rank; this one weighs. A bar chart answers "which
				     subject is largest" and leaves "how much of the whole is health"
				     to arithmetic across fifteen rows — the treemap is that answer as
				     one picture. It is the bills only, because the areas tile a whole
				     and two wholes side by side would invite the subtraction the
				     columns above already refuse. */}
				<Reveal delay={140}>
					<div className='mt-20 hidden lg:block'>
						<div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--brass-line)] pb-3'>
							<h3 className='item-title item-title-lg item-title-strong text-[var(--ink)]'>
								The bills, by weight
							</h3>
							<p className='meta-sm'>
								share of <span className='num text-[var(--ink)]'>{subjectTags}</span> tags applied
							</p>
						</div>
						<div className='mt-8'>
							<SubjectTreemap items={bills.sectors} />
						</div>
					</div>
				</Reveal>

			</section>

			{/* ---- How to read the two columns ----

			     A framed block rather than two grey paragraphs trailing off the foot
			     of the page. What it says is the difference between reading the
			     charts correctly and reading them wrongly — that the counts are of
			     what has been read rather than of everything filed, and that the two
			     columns are two rankings rather than a before and after. Set as
			     small print under a chart, a caveat is decoration; set in a frame
			     with a brass line over it, it is part of the record.

			     Two columns at width, because they are two separate cautions and
			     stacking them makes the second read as a continuation of the
			     first. */}
			<section className='bb-container bb-section-bottom'>
				<Reveal delay={80}>
					<div className='relative border border-[var(--rule)] p-7 lg:p-10'>
						<span
							aria-hidden='true'
							className='absolute inset-x-0 top-0 h-px bg-[var(--brass)]'
						/>

						<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2'>
							<p className='bb-label'>How to read this</p>
							<p className='meta-sm'>Registry generated {registryGeneratedAt}</p>
						</div>

						<div className='mt-8 grid gap-8 lg:grid-cols-2 lg:gap-14'>
							<div>
								<h3 className='item-title item-title-strong text-[var(--ink)]'>
									These are counts of what has been read
								</h3>
								<p className='mt-3 copy text-[var(--ink-2)]'>
									Subjects come from the registry&rsquo;s own tags on each measure, which are read
									from the filed copy and the committee record rather than assigned by hand here.
									A measure with no tag — one indexed but not yet read — is in no column at all,
									which is why these counts are smaller than the totals on the front page.
								</p>
							</div>

							<div>
								<h3 className='item-title item-title-strong text-[var(--ink)]'>
									Two rankings, not a before and after
								</h3>
								<p className='mt-3 copy text-[var(--ink-2)]'>
									The two columns are separate counts rather than two halves of one. The acts were
									tagged under an earlier vintage of the same vocabulary and never re-tagged, so a
									subject can appear on one side as &ldquo;Infrastructure&rdquo; and on the other
									as &ldquo;Infrastructure &amp; Transport&rdquo;.
								</p>
							</div>
						</div>

						{/* The registers on the left, the method on the right. They are
						    two different offers — one takes the reader to the records the
						    charts are counting, the other to how the counting was done —
						    and ranged together they read as one row of four equal
						    choices. Apart, the page ends on what it is for. */}
						<div className='mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--rule)] pt-6'>
							<div className='flex flex-wrap gap-3'>
								<Link href='/bills' className='bb-btn bb-btn-solid'>
									Browse all {bills.records.length.toLocaleString()} bills
								</Link>
								<Link href='/acts' className='bb-btn bb-btn-ghost'>
									Browse the acts in force
								</Link>
							</div>

							<Link href='/about' className='bb-btn bb-btn-ghost'>
								Data &amp; Methodology
							</Link>
						</div>
					</div>
				</Reveal>
			</section>
		</>
	)
}
