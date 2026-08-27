import { OkirCorner, OkirRule, SectionHead } from '@betterbarmm/editorial'
import Link from 'next/link'
import { BillFunnel, type FunnelSlice } from './_components/bill-funnel'
import { BillPathPreview } from './_components/bill-path-preview'
import { DidYouKnow } from './_components/did-you-know'
import { MemberPayFigures } from './_components/member-pay'
import { PageHeader } from './_components/page-header'
import { Reveal } from './_components/reveal'
import { StatBand } from './_components/stat-band'
import { getCategoryCounts, getDataset, registryGeneratedAt } from './_lib/legislation-data'

/** The seat-cost section, held back until it is ready to run again. */
const SHOW_SEAT_COST = false

/** The entitlements block, held back the same way and for the same reason. */
const SHOW_DID_YOU_KNOW = false

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
			<section className='bb-container bb-section'>
				<SectionHead
					index='01'
					eyebrow='Where the bills are'
					title='Most bills'
					titleMuted='never make it.'
					/* The space after the count is explicit: the text node that follows it
					   runs onto a second line, and JSX trims each line of a multi-line
					   node — which ate the space and printed "52have". */
					lead={`Of the ${totalBills.toLocaleString()} bills tracked here, ${approved} have been approved on third reading. The rest are still somewhere in the sequence — and nearly all of them are sitting in a committee, which is the one stage Parliament's own rules open to the public.`}
					align='center'
				/>

				<Reveal delay={80}>
					<div className='mt-16 lg:mt-20'>
						<BillFunnel
							slices={funnel}
							total={totalBills}
							heroValue={`${approvedShare}%`}
							heroLabel='approved on third reading'
						/>
					</div>
				</Reveal>

				<Reveal delay={160}>
					{/* On the same axis as the claim and the chart above them. Ranged
					    left under a centred section, the two ways out read as the start
					    of the next block rather than the end of this one. */}
					<div className='mt-14 flex flex-wrap justify-center gap-3'>
						<Link href='/bills' className='bb-btn bb-btn-solid'>
							Browse all {totalBills.toLocaleString()} bills
						</Link>
						<Link href='/how-parliament-works#the-bill-path' className='bb-btn bb-btn-ghost'>
							What each stage means
						</Link>
					</div>
				</Reveal>
			</section>

			{SHOW_DID_YOU_KNOW ? <DidYouKnow /> : null}

			{/* ---- The path itself ----
			     A pointer rather than the walkthrough: the process page carries all
			     seven stages open, and running an abbreviated copy of it here only
			     gave a reader two versions of the same thing to reconcile. */}
			<OkirRule className='mx-auto max-w-[88rem] opacity-70' />

			{/* ---- The path itself ----
			     A pointer rather than the walkthrough: the process page carries all
			     seven stages open, and running an abbreviated copy of it here only
			     gave a reader two versions of the same thing to reconcile. */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='02'
					eyebrow='The process, simplified'
					title='Seven steps,'
					titleMuted='and one of them is yours.'
					lead={`Parliament publishes the path a bill takes as thirteen steps of rules citations. It is the same path said plainly here — with what happens at each stage, and the one point where its own rules say a committee may ask the public in.`}
				/>

				<Reveal>
					{/* The plate marks the block off without boxing it: a brass hairline
					    at the head and the paper's own second step, rather than four
					    borders on a page already full of rules. */}
					<div className='bb-plate relative mt-16 px-5 py-14 text-center sm:px-12 sm:py-16 lg:px-16 lg:py-20'>
						<OkirCorner position='top-left' className='m-4 opacity-60' />
						<OkirCorner position='bottom-right' className='m-4 opacity-60' />

						<BillPathPreview />

						<Link href='/how-parliament-works#the-bill-path' className='bb-btn bb-btn-solid mt-12'>
							Follow a bill through Parliament
						</Link>
					</div>
				</Reveal>
			</section>

			{/* ---- What a seat is provided ----
			     The figure nobody publishes. Parliament does print it, but as one
			     line of a 349-page budget, which is the same as not printing it.
			     It sits on the hub because it is the single most asked question
			     about the people in the roster, and because it is the clearest
			     demonstration of what reading the acts is actually for.

			     Held back for the moment. Behind a flag rather than commented out
			     or deleted: the block still compiles, its figures still come from
			     the live record, and putting it back is one word here rather than
			     a diff to reconstruct. */}
			{SHOW_SEAT_COST ? (
			<section className='bb-container bb-section-bottom'>
				<SectionHead
					index='03'
					eyebrow='What a seat costs'
					title='₱3,277,082 a year'
					titleMuted={`for each member's post.`}
					lead='That is not a salary figure, and the difference matters. It is the whole annual provision the budget makes for the post — basic pay plus the bonuses, allowances and government contributions costed against it.'
				/>

				<Reveal delay={80}>
					<div className='mt-16'>
						<MemberPayFigures />
					</div>

					<Link href='/how-parliament-works#the-job' className='bb-btn bb-btn-solid mt-12'>
						What a member actually does
					</Link>
				</Reveal>
			</section>
			) : null}

		</>
	)
}
