import {
	ArrowRightIcon,
	ArrowUpRightIcon,
	BookOpenTextIcon,
	ChatsCircleIcon,
	CheckSquareIcon,
	FilePlusIcon,
	FileTextIcon,
	PenNibIcon,
	SealCheckIcon,
	UsersThreeIcon,
} from '@phosphor-icons/react/ssr'
import type { Icon } from '@phosphor-icons/react'
import Link from 'next/link'
import { BillFunnel, type FunnelSlice } from './_components/bill-funnel'
import { BILL_PATH_STEPS } from './_components/bill-path-steps'
import { DidYouKnow } from './_components/did-you-know'
import { MemberPayFigures } from './_components/member-pay'
import { ChangeCard, groupByMeasure } from './_components/change-card'
import { BandSectionTitle, RegistryBand } from './_components/registry-band'
import { StatFigures } from './_components/stat-band'
import { Reveal } from './_components/reveal'
import { getChanges } from './_lib/changes'
import { getCategoryCounts, getDataset } from './_lib/legislation-data'
import { getOfficialMeasuresByCategory, type OfficialMeasure } from './_lib/official-measures'

/** Each stage of the path, by its label, as a picture of it. */
const STEP_ICON: Record<string, Icon> = {
	Filed: FilePlusIcon,
	'First reading': BookOpenTextIcon,
	Committee: UsersThreeIcon,
	'Second reading': ChatsCircleIcon,
	'Third reading': CheckSquareIcon,
	Signed: PenNibIcon,
	'In force': SealCheckIcon,
}

/** The seat-cost section, held back until it is ready to run again. */
const SHOW_SEAT_COST = false

/** The entitlements block, held back the same way and for the same reason. */
const SHOW_DID_YOU_KNOW = false

export default function HomePage() {
	const counts = getCategoryCounts()
	const bills = getDataset('bills')

	const codes = getDataset('acts').records.filter((record) => record.types.some((type) => type.value === 'priority_code'))
	const priorityCodes = codes.length
	// "Bangsamoro Civil Service Code of 2021" → "Civil Service", "Indigenous Peoples' Act of 2024" → "Indigenous Peoples", oldest first.
	const codeNames = [...codes]
		.sort((a, b) => a.number - b.number)
		.map((r) => (r.shortTitle || r.title).replace(/^Bangsamoro\s+/i, '').replace(/\s+(Code|Rights Act|Act)\b.*$/i, '').replace(/['’]$/, ''))

	/* Each kind of measure by the year it was filed (or, for acts and adopted
	   resolutions, ratified or adopted), 2019 to now. */
	const yearOf = (m: OfficialMeasure) => {
		const filed = m.history.map((h) => h.match(/^filed\s*[–—-]\s*\d{1,2}\/\d{1,2}\/(\d{4})/i)?.[1]).find(Boolean)
		return Number(filed ?? m.dateIso.slice(0, 4)) || null
	}
	const thisYear = new Date().getFullYear()
	const byYear = (category: Parameters<typeof getOfficialMeasuresByCategory>[0]) => {
		const counts = new Map<number, number>()
		for (const m of getOfficialMeasuresByCategory(category)) {
			const y = yearOf(m)
			if (y && y >= 2019 && y <= thisYear) counts.set(y, (counts.get(y) ?? 0) + 1)
		}
		return Array.from({ length: thisYear - 2018 }, (_, i) => ({ year: 2019 + i, value: counts.get(2019 + i) ?? 0 }))
	}

	const countBillsWhere = (predicate: (status: string) => boolean) =>
		bills.records.filter((record) => predicate(record.status.toLowerCase())).length

	/* Mutually exclusive, in the order a bill travels them — the chart only tells
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


	return (
		<>
			{/* The band every page of the registry opens on (user decision); Parliament's own five figures under it (user
			    decision), in the same order as Parliament's homepage so the two can be read against each other. */}
			<RegistryBand
				label='Bangsamoro Legislative Registry'
				title='Every law the region has made'
				lead='The Bangsamoro Parliament publishes its record across six separate archives. This puts them in one place — searchable, filterable, and written in language you do not need a law degree to read.'
			>
				<div className='mt-8 flex flex-wrap gap-3'>
					<Link href='/bills' className='dv-btn dv-btn-light'>
						<FileTextIcon size={18} weight='duotone' aria-hidden='true' />
						Browse the bills
					</Link>
					<Link href='/how-parliament-works#the-bill-path' className='dv-btn dv-btn-glass'>
						How a bill becomes law
					</Link>
				</div>
			</RegistryBand>

			<section className='bb-container lg-under'>
					<StatFigures
						onPaper
						stats={[
					{
						label: 'Bangsamoro Autonomy Acts',
						value: counts.acts.toLocaleString(),
						detail: 'Regional laws ratified since 2019.',
						series: byYear('acts'),
					},
					{
						label: 'Priority codes',
						// The Organic Law mandates seven; the Revenue Code is the one the transition did not pass.
						value: `${priorityCodes} of 7`,
						detail: 'The Revenue Code is still pending.',
						marks: codeNames,
					},
					{
						label: 'Bills',
						value: counts.bills.toLocaleString(),
						detail: 'Every bill filed in the current Parliament.',
						series: byYear('bills'),
					},
					{
						label: 'Adopted resolutions',
						value: counts['adopted-resolutions'].toLocaleString(),
						detail: 'Positions Parliament has formally adopted.',
						series: byYear('adopted-resolutions'),
					},
					{
						label: 'Proposed resolutions',
						value: counts['proposed-resolutions'].toLocaleString(),
						detail: 'Every resolution filed, adopted or not.',
						series: byYear('proposed-resolutions'),
					},
				]}
					/>
			</section>

			<LatestUpdates />

			{/* ---- Where the bills are ----
			     The claim centerd over the picture, the legend wrapped around it, and
			     the ways out underneath — so the section reads top to bottom as one
			     statement rather than a column of text beside a chart. */}
			<section className='tv-wash'>
			<div className='bb-container dv-section'>
				<BandSectionTitle
					title='Most bills never make it'
					lead={`Of the ${totalBills.toLocaleString()} bills tracked here, ${approved} have been approved on third reading. Nearly all the rest are sitting in a committee, the one stage Parliament's own rules open to the public.`}
				/>

				{/* The headline count on the left, in the brand crimson, with the ways out; where every other bill is on the
				    right, as the bar and a card a stage. Rounded panels (user decision: the travel look). */}
				<Reveal delay={80}>
					<div className='mt-10 grid gap-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]'>
						<div className='brand-bg bb-lattice relative flex flex-col overflow-hidden rounded-[var(--dv-r)] p-7 text-white shadow-[0_24px_48px_-30px_rgba(143,35,40,0.9)] lg:p-8'>
							<span className='grid size-12 place-items-center rounded-2xl bg-white/12 text-[#f6cf7a]'>
								<SealCheckIcon size={24} weight='duotone' aria-hidden='true' />
							</span>
							<p className='mt-6 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#f6cf7a]'>Approved on third reading</p>
							<p className='mt-3 flex items-baseline gap-2'>
								<span className='num font-[family-name:var(--font-display)] text-[4rem] font-extrabold leading-none tracking-[-0.05em]'>{approved}</span>
								<span className='num text-[1.125rem] font-semibold text-white/75'>of {totalBills.toLocaleString()}</span>
							</p>
							<p className='mt-3 text-[0.875rem] leading-[1.6] text-white/85'>
								{Math.round((approved / totalBills) * 100)}% of the bills tracked here. The rest are still somewhere in the sequence.
							</p>
							<div className='mt-auto grid gap-2.5 pt-8'>
								<Link href='/bills' className='dv-btn dv-btn-light justify-center !text-[0.875rem]'>
									Browse all {totalBills.toLocaleString()} bills
								</Link>
								<Link href='/how-parliament-works#the-bill-path' className='dv-btn dv-btn-glass justify-center !text-[0.875rem]'>
									What each stage means
								</Link>
							</div>
						</div>
						<div className='flex min-w-0 flex-col justify-center rounded-[var(--dv-r)] bg-[var(--paper)] p-5 shadow-[0_20px_44px_-34px_rgba(0,0,0,0.45)] lg:p-7'>
							<BillFunnel slices={funnel} total={totalBills} />
						</div>
					</div>
				</Reveal>
			</div>
			</section>

			{SHOW_DID_YOU_KNOW ? <DidYouKnow /> : null}

			{/* ---- The path itself ----
			     A pointer rather than the walkthrough: the process page carries all
			     seven stages open, and running an abbreviated copy of it here only
			     gave a reader two versions of the same thing to reconcile. */}
			<section className='bb-container dv-section'>
				<BandSectionTitle
					title='Seven steps, and one of them is yours'
					lead='Parliament publishes the path a bill takes as thirteen steps of rules citations. Here it is said plainly, with the one point where its own rules say a committee may ask the public in.'
				/>

				{/* The seven stages as rounded cards, numbered in the order a bill takes them, each with its icon. The one stage a
				    member of the public can act at is filled in the brand crimson and says so, with the way in. */}
				<Reveal>
					<ol className='relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[repeat(2,minmax(0,1fr))_minmax(0,1.6fr)_repeat(4,minmax(0,1fr))]'>
						{BILL_PATH_STEPS.map((step, index) => {
							const yours = index === BILL_PATH_STEPS.findIndex((s) => s.publicAction?.href.startsWith('http'))
							const Glyph = STEP_ICON[step.label] ?? FileTextIcon
							return (
								<li
									key={step.label}
									className={`flex flex-col rounded-[var(--dv-r)] p-5 ${yours ? 'brand-bg bb-lattice text-white shadow-[0_24px_48px_-28px_rgba(143,35,40,0.9)] xl:-my-3 xl:py-8' : 'border border-[var(--rule)] bg-[var(--paper)]'}`}
								>
									<span className='flex items-center justify-between gap-2'>
										<span className={`grid size-11 place-items-center rounded-2xl ${yours ? 'bg-white/12 text-[#f6cf7a]' : 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'}`}>
											<Glyph size={22} weight='duotone' aria-hidden='true' />
										</span>
										<span className={`num font-[family-name:var(--font-display)] text-[0.875rem] font-bold ${yours ? 'text-[#f6cf7a]' : 'text-[var(--ink-mute)]'}`}>{String(index + 1).padStart(2, '0')}</span>
									</span>
									{yours ? <span className='mt-4 w-fit rounded-full bg-[#f6cf7a] px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-[#6b1a11]'>Your stage</span> : null}
									<span className={`mt-4 font-[family-name:var(--font-display)] text-[1.0625rem] font-bold tracking-[-0.015em] ${yours ? 'text-white' : 'text-[var(--ink)]'}`}>{step.label}</span>
									<span className={`mt-1.5 text-[0.8125rem] leading-[1.55] ${yours ? 'text-white/85' : 'text-[var(--ink-3)]'}`}>{step.summary}</span>
									{yours && step.publicAction ? (
										<span className='mt-auto pt-6'>
											<a href={step.publicAction.href} target='_blank' rel='noreferrer' className='inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3.5 py-2 text-[0.75rem] font-bold text-[#8a2418] transition hover:bg-[#fff3cf]'>
												{step.publicAction.label}
												<ArrowUpRightIcon size={12} weight='bold' aria-hidden='true' />
											</a>
										</span>
									) : null}
								</li>
							)
						})}
					</ol>
					<p className='mt-10 flex justify-end'>
						<Link href='/how-parliament-works#the-bill-path' className='dv-pill'>
							Follow a bill through Parliament
							<ArrowRightIcon size={14} weight='bold' aria-hidden='true' />
						</Link>
					</p>
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
			<section className='bb-container dv-section !pt-0'>
				<BandSectionTitle
					title={`₱3,277,082 a year for each member's post`}
					lead='That is not a salary figure, and the difference matters. It is the whole annual provision the budget makes for the post — basic pay plus the bonuses, allowances and government contributions costed against it.'
				/>

				<Reveal delay={80}>
					<div className='mt-16'>
						<MemberPayFigures />
					</div>

					<Link href='/how-parliament-works/transition-authority#the-job' className='bb-btn bb-btn-solid mt-12'>
						What a member actually does
					</Link>
				</Reveal>
			</section>
			) : null}

		</>
	)
}

/** The newest steps on record, under the band: the reason to come back. One card a measure, the six most recently moved. */
function LatestUpdates() {
	const measures = groupByMeasure(getChanges()).slice(0, 6)
	if (!measures.length) return null
	return (
		<section className='bb-container dv-section'>
			<BandSectionTitle title='What changed in Parliament' lead='The measures that moved most recently, each with its latest steps.' />
			<ul className='mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
				{measures.map((measure) => (
					<ChangeCard key={measure.key} measure={measure} maxSteps={3} />
				))}
			</ul>
			{/* Section-end links sit on the right. */}
			<p className='mt-10 flex justify-end'>
				<Link href='/latest' className='dv-pill'>
					See every update
					<ArrowRightIcon size={14} weight='bold' aria-hidden='true' />
				</Link>
			</p>
		</section>
	)
}
