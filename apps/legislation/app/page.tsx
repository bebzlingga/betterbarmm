import Link from 'next/link'
import { BillFunnel, type FunnelSlice } from './_components/bill-funnel'
import { BillPathPreview } from './_components/bill-path-preview'
import { PageHeader } from './_components/page-header'
import { Reveal } from './_components/reveal'
import { StatBand } from './_components/stat-band'
import { getCategoryCounts, getDataset, registryGeneratedAt } from './_lib/legislation-data'

export default function HomePage() {
	const counts = getCategoryCounts()
	const bills = getDataset('bills')

	const totalRecords = Object.values(counts).reduce((sum, count) => sum + count, 0)

	const countBillsWhere = (predicate: (status: string) => boolean) =>
		bills.records.filter((record) => predicate(record.status.toLowerCase())).length

	/* Mutually exclusive, in the order a bill travels them — a ring only tells
	   the truth if the parts are exclusive and sum to the whole, so anything the
	   registry records under a status we have not named lands in the last slice
	   rather than quietly shrinking the total. */
	const filed = countBillsWhere((status) => status.includes('filed'))
	const firstReading = countBillsWhere((status) => status.includes('first reading'))
	const committee = countBillsWhere((status) => status.includes('second reading'))
	const approved = countBillsWhere((status) => status.includes('approved'))
	const archived = countBillsWhere((status) => status.includes('archived'))
	const totalBills = bills.records.length
	const unrecorded = totalBills - (filed + firstReading + committee + approved + archived)

	const funnel: FunnelSlice[] = [
		{
			label: 'Filed',
			count: filed,
			color: 'var(--funnel-1)',
			note: 'Handed in and numbered. Nothing has happened to it yet.',
		},
		{
			label: 'First reading',
			count: firstReading,
			color: 'var(--funnel-2)',
			note: 'Read into the record and sent to a committee.',
		},
		{
			label: 'In committee',
			count: committee,
			color: 'var(--funnel-3)',
			note: 'Being gone through line by line — the stage you can act at.',
		},
		{
			label: 'Approved',
			count: approved,
			color: 'var(--funnel-4)',
			note: 'Passed on third reading and on its way to becoming law.',
		},
		{
			label: 'Archived',
			count: archived,
			color: 'var(--funnel-out)',
			note: 'Left the sequence without passing.',
		},
		...(unrecorded > 0
			? [
					{
						label: 'Stage not recorded',
						count: unrecorded,
						color: 'var(--funnel-out)',
						note: 'The source lists no stage we can place.',
					},
				]
			: []),
	]

	const approvedShare = Math.round((approved / totalBills) * 100)

	return (
		<>
			{/* The masthead the standing pages use — brand emphasis, the headline
			    split across two tones. The home page is the one page whose heading
			    is the point rather than a label over a list, so it is set the way
			    Data & Methodology is. */}
			<PageHeader
				emphasis='brand'
				size='hero'
				eyebrow='Bangsamoro Legislative Registry'
				title='Every law, from filing to page one.'
				titleMuted='In plain language.'
				description='The Bangsamoro Parliament publishes its record across six separate archives. This puts them in one place — searchable, filterable, and written in language you do not need a law degree to read.'
				meta={`${totalRecords.toLocaleString()} records / registry generated ${registryGeneratedAt}`}
			/>

			<StatBand
				stats={[
					{
						label: 'Records indexed',
						value: totalRecords.toLocaleString(),
						detail: 'Across acts, bills, and adopted resolutions.',
					},
					{
						label: 'Laws in force',
						value: counts.acts.toLocaleString(),
						detail: 'Bangsamoro Autonomy Acts ratified since 2019.',
					},
					{
						label: 'Bills tracked',
						value: counts.bills.toLocaleString(),
						detail: 'Proposals moving through Parliament right now.',
					},
					{
						label: 'Resolutions',
						value: counts['adopted-resolutions'].toLocaleString(),
						detail: 'Positions Parliament has formally adopted.',
					},
				]}
			/>

			{/* ---- Where the bills are ----
			     The claim centred over the picture, the legend wrapped around it, and
			     the ways out underneath — so the section reads top to bottom as one
			     statement rather than a column of text beside a chart. */}
			<section className='mx-auto max-w-[88rem] px-6 py-16 lg:px-8 lg:py-24'>
				<Reveal>
					<div className='mx-auto max-w-3xl text-center'>
						<p className='eyebrow'>Where the bills are</p>
						<h2 className='section-title mt-3'>Most bills never make it.</h2>
						<p className='copy mx-auto mt-4 max-w-2xl text-[var(--ink-2)]'>
							Of the {totalBills.toLocaleString()} bills tracked here, {approved} have been approved
							on third reading. The rest are still somewhere in the sequence — and nearly all of
							them are sitting in a committee, which is the one stage Parliament&rsquo;s own rules
							open to the public.
						</p>
					</div>
				</Reveal>

				<Reveal delay={80}>
					<div className='mt-14 lg:mt-16'>
						<BillFunnel
							slices={funnel}
							total={totalBills}
							heroValue={`${approvedShare}%`}
							heroLabel='approved on third reading'
						/>
					</div>
				</Reveal>

				<Reveal delay={160}>
					<div className='mt-14 flex flex-wrap justify-center gap-3'>
						<Link href='/bills' className='btn btn-solid'>
							Browse all {totalBills.toLocaleString()} bills
						</Link>
						<Link href='/legislative-process' className='btn btn-quiet'>
							What each stage means
						</Link>
					</div>
				</Reveal>
			</section>

			{/* ---- The path itself ----
			     A pointer rather than the walkthrough: the process page carries all
			     seven stages open, and running an abbreviated copy of it here only
			     gave a reader two versions of the same thing to reconcile. */}
			<Reveal>
				<section className='mx-auto max-w-[88rem] px-6 pb-20 lg:px-8 lg:pb-28'>
					<div className='rounded-[var(--radius-lg)] bg-[var(--paper-2)] px-6 py-20 text-center sm:px-12 lg:px-16 lg:py-28'>
						<p className='eyebrow'>The process, simplified</p>
						<h2 className='section-title mx-auto mt-3 max-w-3xl'>
							Seven steps, and one of them is yours.
						</h2>
						<p className='copy mx-auto mt-4 max-w-2xl text-[var(--ink-2)]'>
							Parliament publishes the path a bill takes as thirteen steps of rules citations. It is
							the same path said plainly here — with what happens at each stage, and the one point
							where its own rules say a committee may ask the public in.
						</p>
						<BillPathPreview />

						<Link href='/legislative-process' className='btn btn-solid mt-12'>
							Follow a bill through Parliament
						</Link>
					</div>
				</section>
			</Reveal>
		</>
	)
}
