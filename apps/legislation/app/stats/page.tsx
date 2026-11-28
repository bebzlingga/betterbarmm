import type { Metadata } from 'next'
import { InfoIcon } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { BandSectionTitle, RegistryBand } from '../_components/registry-band'
import { Reveal } from '../_components/reveal'
import { SectorBars } from '../_components/sector-bars'
import { SubjectTreemap } from '../_components/subject-treemap'
import { YearColumns } from '../_components/year-columns'
import { getMembersDataset } from '../_lib/members-data'
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
	// Every bill in the index is accounted for: read in full, or — where
	// Parliament published no readable document — written up from its title.
	const billsRead = bills.records.filter(
		(record) => record.reading && record.reading.basis !== 'title',
	).length
	const billsFromTitle = bills.records.length - billsRead

	// The whole the treemap tiles. Not the bill count: a measure carries every
	// subject it touches, so the tags outnumber the measures and a chart that
	// tiled the bills would be stating something the register does not say.
	const subjectTags = bills.sectors.reduce((sum, sector) => sum + sector.count, 0)

	const topBillSubject = bills.sectors[0]
	const health = bills.sectors.find((sector) => sector.value === 'health')

	// When each bill was filed: the date on its Filed stage, not the record's own year, which is its latest step.
	const filedYears = new Map<string, number>()
	for (const record of bills.records) {
		const year = record.journey.find((stage) => /^filed$/i.test(stage.label))?.dateDisplay?.match(/\d{4}$/)?.[0]
		if (year) filedYears.set(year, (filedYears.get(year) ?? 0) + 1)
	}
	const filedByYear = [...filedYears].sort(([a], [b]) => a.localeCompare(b)).map(([label, count]) => ({ label, count }))
	const filedDated = filedByYear.reduce((sum, year) => sum + year.count, 0)
	// Acts by the year they were ratified, oldest first.
	const actsByYear = [...acts.years].sort((a, b) => a.value.localeCompare(b.value)).map((year) => ({ label: year.label, count: year.count }))

	// Where the bills stand, in the order a bill moves: the short status the cards carry, not the index's long one.
	const STAGES = ['Filed', 'First reading', 'In committee', 'Second reading', 'Approved', 'Archived']
	const stageCounts = STAGES.map((stage) => ({ value: stage, label: stage, count: bills.records.filter((record) => record.statusShort === stage).length })).filter((stage) => stage.count)

	// Who files them: the Government of the Day, or the Members.
	const cabinet = bills.records.filter((record) => record.isCabinetMeasure).length
	const filers = [
		{ value: 'members', label: 'Filed by Members', count: bills.records.length - cabinet },
		{ value: 'cabinet', label: 'Filed by the Government of the Day', count: cabinet },
	]

	// The Members who file the most, as principal author. The Government of the Day is counted above, not here.
	const names = new Map(getMembersDataset().members.map((member) => [member.rosterName.toUpperCase(), member.displayName]))
	const principal = new Map<string, number>()
	for (const record of bills.records) for (const name of record.principalAuthors) if (!/government of the day/i.test(name)) principal.set(name, (principal.get(name) ?? 0) + 1)
	const topAuthors = [...principal]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10)
		.map(([name, count]) => ({ value: name, label: names.get(name.toUpperCase()) ?? name, count }))

	return (
		<>
			{/* The headline figures as glass cards on the header's right (user decision: the travel look). */}
			<RegistryBand
				label='The registry, counted'
				title='Stats'
				lead={`Parliament publishes its measures one at a time, never in aggregate. These are the registry’s own records counted: when bills were filed and laws passed, where the bills stand, who files them, and what they are about, across the ${billsCounted} bills and ${actsCounted} acts read in full.`}
				side={
					<dl className='grid grid-cols-2 gap-3'>
						{[
						{
							label: 'Bills counted',
							value: billsCounted.toLocaleString(),
							detail: `All ${bills.records.length.toLocaleString()} in Parliament's index accounted for: ${billsRead.toLocaleString()} read in full, ${billsFromTitle} written from their titles.`,
						},
						{ label: 'Acts counted', value: actsCounted.toLocaleString(), detail: 'Autonomy acts in force, tagged the same way.' },
						{ label: 'Subjects', value: bills.sectors.length.toLocaleString(), detail: 'Policy areas the bills fall under. A measure can sit in more than one.' },
						{
							label: 'Largest subject',
							value: topBillSubject ? topBillSubject.count.toLocaleString() : '—',
							detail: topBillSubject ? `${topBillSubject.label}: more bills than any other area.` : 'No subject tags in the read set yet.',
						},
					].map((figure) => (
							<div key={figure.label} className='flex flex-col rounded-2xl border border-white/15 bg-white/[0.08] p-4 sm:p-5'>
								<dt className='order-2 mt-2.5 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#f1c453]'>{figure.label}</dt>
								<dd className='num order-1 font-[family-name:var(--font-display)] text-[2.25rem] font-extrabold leading-none tracking-[-0.04em] text-white'>{figure.value}</dd>
								<dd className='order-3 mt-1.5 text-[0.75rem] leading-snug text-white/70'>{figure.detail}</dd>
							</div>
						))}
					</dl>
				}
			/>

			{/* ---- Over time: two charts, each on its own scale, never one axis for two measures. ---- */}
			<section className='bb-container py-[clamp(4.5rem,9vw,8rem)]'>
				<BandSectionTitle title='Year by year' lead='Bills by the year they were filed; acts by the year they were ratified. Two counts, each on its own scale.' />
				<div className='mt-8 grid gap-4 lg:grid-cols-2'>
					<ChartCard title='Bills filed' note={`${filedDated.toLocaleString()} with a filing date`}>
						<YearColumns items={filedByYear} unit='bills filed' />
					</ChartCard>
					<ChartCard title='Acts ratified' note={`${acts.records.length.toLocaleString()} acts`}>
						<YearColumns items={actsByYear} unit='acts ratified' />
					</ChartCard>
				</div>
			</section>

			{/* ---- Where they stand, and who files them ---- */}
			<section className='tv-wash'>
			<div className='bb-container py-[clamp(4.5rem,9vw,8rem)]'>
				<BandSectionTitle title='Where the bills stand' lead='Every bill in the index by its latest step, in the order a bill moves; and how many the Government of the Day filed itself.' />
				<div className='mt-8 grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'>
					<ChartCard title='By stage' note={`${bills.records.length.toLocaleString()} bills`}>
						<SectorBars items={stageCounts} />
					</ChartCard>
					<ChartCard title='By who filed' note={`${Math.round((cabinet / bills.records.length) * 100)}% from the cabinet`}>
						<SectorBars items={filers} />
					</ChartCard>
				</div>
			</div>
			</section>

			{/* ---- Who files the most ---- */}
			<section className='bb-container py-[clamp(4.5rem,9vw,8rem)]'>
				<BandSectionTitle title='The Members who file the most' lead='Bills each Member filed as a principal author. A bill can have several, so the counts overlap.' />
				<div className='mt-8'>
					<ChartCard title='Top 10, as principal author' note='bills'>
						<SectorBars items={topAuthors} />
					</ChartCard>
				</div>
			</section>

			{/* ---- What they are about: the two lists side by side, each on its own scale. ---- */}
			<section className='tv-wash'>
			<div className='bb-container py-[clamp(4.5rem,9vw,8rem)]'>
				<BandSectionTitle
					title='What gets filed, and what gets passed'
					lead={
						health
							? `Health leads the bills, ${health.count} of ${subjectTags} subject tags; among acts in force, governance and the budget lead. A measure can carry several subjects.`
							: 'A measure can carry several subjects.'
					}
				/>
				<Reveal delay={80}>
					<div className='mt-8 grid gap-4 lg:grid-cols-2'>
						<ChartCard title='Filed as bills' note={`${billsCounted} read in full`}>
							<SectorBars items={bills.sectors} />
						</ChartCard>
						<ChartCard title='Passed into law' note={`${actsCounted} acts in force`}>
							<SectorBars items={acts.sectors} />
						</ChartCard>
					</div>
				</Reveal>

				{/* The columns rank; this one weighs. Bills only: two wholes side by side invite a subtraction the lists refuse. */}
				<Reveal delay={140}>
					<div className='mt-4 hidden lg:block'>
						<ChartCard title='The bills, by weight' note={`share of ${subjectTags} tags applied`}>
							<SubjectTreemap items={bills.sectors} />
						</ChartCard>
					</div>
				</Reveal>
			</div>
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
			<section className='bb-container py-[clamp(4.5rem,9vw,8rem)]'>
				<Reveal delay={80}>
					<div className='rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-7 shadow-[0_24px_50px_-40px_rgba(0,0,0,0.45)] lg:p-10'>
						<div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-3'>
							<p className='flex items-center gap-3'>
								<span className='grid size-11 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--brass)_16%,transparent)] text-[var(--brass-deep)]'>
									<InfoIcon size={22} weight='duotone' aria-hidden='true' />
								</span>
								<span className='font-[family-name:var(--font-display)] text-[1.375rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>How to read this</span>
							</p>
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
						<div className='mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--rule-soft)] pt-6'>
							<div className='flex flex-wrap gap-3'>
								<Link href='/bills' className='bb-btn bb-btn-solid'>
									Browse all {bills.records.length.toLocaleString()} bills
								</Link>
								<Link href='/acts' className='bb-btn bb-btn-ghost'>
									Browse the acts in force
								</Link>
							</div>

							<Link href='/about' className='bb-btn bb-btn-ghost'>
								Data
							</Link>
						</div>
					</div>
				</Reveal>
			</section>
		</>
	)
}

/** A chart in a card, as the landing site sets its panels: the title and what it counts on one line, the chart under. */
function ChartCard({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
	return (
		<figure className='h-full rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-6 sm:p-7'>
			<figcaption className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2'>
				<span className='font-[family-name:var(--font-display)] text-[1.125rem] font-extrabold tracking-[-0.015em] text-[var(--ink)]'>{title}</span>
				<span className='rounded-full bg-[var(--paper-2)] px-3 py-1 text-[0.75rem] text-[var(--ink-3)]'>{note}</span>
			</figcaption>
			<div className='mt-6'>{children}</div>
		</figure>
	)
}
