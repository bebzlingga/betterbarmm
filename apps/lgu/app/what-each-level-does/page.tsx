import type { Metadata } from 'next'
import Link from 'next/link'
import { ELECTED_POSTS, LOCAL_CHARGES, SERVICES, formatNumber, lguData, lguLadder } from '@betterbarmm/lgu-data'
import { DocLayout } from '../_components/doc-layout'
import type { TocItem } from '../_components/doc-toc'
import { LguMasthead } from '../_components/lgu-parts'
import { AppointedOffices } from '../_components/appointed-offices'

export const metadata: Metadata = {
	title: 'What each level does',
	description:
		'The levels of local government in BARMM, who you elect at each, what each one does for you, who runs it day to day, what it may charge you and where to look things up.',
}

/* ============================================================
   How local government works

   Figures and diagrams, not paragraphs. The reader arriving here
   does not want an essay on decentralisation — they want to see
   where the money comes from, who signs it off, and how much of
   it was already committed before their council met.

   So every section is a graphic with a caption: the chain, the
   calendar, the set-asides, the service split. The prose is the
   label on the drawing.
   ============================================================ */

/* One plain table style for the whole page. */
const TABLE = 'w-full min-w-[34rem] border-collapse text-left text-[14px]'
const HEAD = 'border-b border-[var(--ink)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
const TH = 'py-3 pr-4 font-semibold'
const ROW = 'border-b border-[var(--rule-soft)] align-top transition-colors hover:bg-[var(--paper-2)]'
/* Rows under a merged Level cell take no hover: the shade would cover one row and the merged cell. */
const ROW_GROUPED = 'border-b border-[var(--rule-soft)] align-top'
const TD = 'py-3.5 pr-4 leading-6 text-[var(--ink-2)]'
const H3 = 'mt-12 text-[1.1rem] font-semibold tracking-[-0.01em] text-[var(--ink)]'

const ELECTED = [
	{ level: 'Province', posts: ELECTED_POSTS.province },
	{ level: 'City', posts: ELECTED_POSTS.city },
	{ level: 'Municipality', posts: ELECTED_POSTS.municipality },
	{ level: 'Barangay', posts: ELECTED_POSTS.barangay },
]

const RUNGS = [
	{ level: 'Barangay', count: lguData.totals.barangays, groups: SERVICES.barangay },
	{ level: 'City or municipality', count: lguData.totals.lgus, groups: SERVICES.cityMunicipality },
	{ level: 'Province', count: lguData.totals.provinces, groups: SERVICES.province },
] as const

/** The page's sections, top to bottom — the headings and "On this page". */
const TOC: TocItem[] = [
	{ id: 'introduction', label: 'What local government is', depth: 1 },
	{ id: 'ladder', label: 'The levels, and who you elect', depth: 1 },
	{ id: 'services', label: 'What each level does for you', depth: 1 },
	{ id: 'offices', label: 'Who runs it day to day', depth: 1 },
	{ id: 'charges', label: 'What you pay', depth: 1 },
]

const H2 = 'scroll-mt-32 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'

function Section({ id, lead, children }: { id: string; lead: string; children: React.ReactNode }) {
	return (
		<section className='mt-20 first:mt-0'>
			<h2 id={id} className={H2}>
				{TOC.find((item) => item.id === id)!.label}
			</h2>
			<p className='mt-5 text-[15px] leading-7 text-[var(--ink-2)]'>{lead}</p>
			{children}
		</section>
	)
}

export default function HowItWorksPage() {
	return (
		<>
			<LguMasthead
				kicker='The guide · Bangsamoro'
				name='What each level of government does, and who runs it.'
			/>

			<DocLayout toc={TOC}>
			{/* ---- What local government is ---- */}
			<Section
				id='introduction'
				lead={`Below the Bangsamoro Government sit three levels of local government: the province, the city or municipality, and the barangay. In BARMM that is ${lguData.totals.provinces} provinces, ${lguData.totals.lgus} cities and municipalities and ${formatNumber(lguData.totals.barangays)} barangays.`}
			>
				<p className='mt-5 text-[15px] leading-7 text-[var(--ink-2)]'>
					Each one elects its own officials, passes its own budget and runs the services the Bangsamoro Local
					Governance Code gives it. None takes orders from the level above on how to run its affairs. What
					ties them together is money and oversight: the national and regional governments send shares down,
					and each level checks that the one below it stays within its powers.
				</p>
				<p className='mt-5 text-[15px] leading-7 text-[var(--ink-2)]'>
					This page follows that story: who you elect at each level, what each one does for you, who runs it,
					and what it may charge you. Where its money comes from and how its budget is made are on{' '}
					<Link href='/local-budgets' className='rule-link'>
						Local budgets
					</Link>
					.
				</p>
			</Section>

			{/* ---- The levels ---- */}
			<Section
				id='ladder'
				lead='From the region down to the barangay, each level has its own elected officials. The Bangsamoro Parliament sits above them but does not replace any of them.'
			>
				<div className='mt-8 overflow-x-auto'>
					<table className={TABLE}>
						<thead>
							<tr className={HEAD}>
								<th className={TH}>Level</th>
								<th className={TH}>What it is</th>
								<th className={TH}>Voters elect</th>
							</tr>
						</thead>
						<tbody>
							{lguLadder.map((rung) => (
								<tr key={rung.level} className={ROW}>
									<td className={`${TD} font-semibold text-[var(--ink)]`}>{rung.level.replace(/^The /, '').replace(/^./, (c) => c.toUpperCase())}</td>
									<td className={TD}>{rung.what}</td>
									<td className={TD}>
										{rung.elects.map((post) => (
											<span key={post} className='block'>
												{post}
											</span>
										))}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<p className='mt-6 text-[15px] leading-7 text-[var(--ink-2)]'>
					So a voter in BARMM fills two separate ballots: one for these local offices, on the national
					local-election schedule, and one for the Bangsamoro Parliament.
				</p>
			</Section>

			{/* ---- What each level owes you ---- */}
			<Section id='services' lead='Each level has its own job. Knowing which one handles what saves a wasted trip to the wrong office.'>
				<div className='mt-8 overflow-x-auto'>
					<table className='w-full border-collapse text-left text-[14px]'>
						<thead>
							<tr className={HEAD}>
								<th className={`${TH} w-32`}>Level</th>
								<th className={TH}>What it provides</th>
							</tr>
						</thead>
						<tbody>
							{RUNGS.flatMap((rung) =>
								rung.groups.map((group, index) => (
									<tr key={`${rung.level}-${group.title}`} className={ROW_GROUPED}>
										{index === 0 ? (
											<td rowSpan={rung.groups.length} className={`${TD} font-semibold text-[var(--ink)]`}>
												{rung.level}
												<span className='block text-[12.5px] font-normal text-[var(--ink-3)]'>
													{formatNumber(rung.count)} in BARMM
												</span>
											</td>
										) : null}
										<td className={TD}>
											<span className='block font-medium text-[var(--ink)]'>{group.title}</span>
											{group.items.join('; ')}
										</td>
									</tr>
								)),
							)}
						</tbody>
					</table>
				</div>
			</Section>

			{/* ---- The offices ---- */}
			<Section
				id='offices'
				lead='Every local government has the same set of offices, fixed by the Bangsamoro Local Governance Code: elected officials who lead it and pass its ordinances, and appointed department heads who do the daily work.'
			>
				<h3 className={H3}>Elected positions</h3>
				<div className='mt-4 overflow-x-auto'>
					<table className={TABLE}>
						<thead>
							<tr className={HEAD}>
								<th className={TH}>Level</th>
								<th className={TH}>Position</th>
								<th className={TH}>What it does</th>
								<th className={TH}>Term, age and pay</th>
							</tr>
						</thead>
						<tbody>
							{ELECTED.flatMap(({ level, posts }) =>
								posts.map((post, index) => (
									<tr key={`${level}-${post.title}`} className={ROW_GROUPED}>
										{index === 0 ? (
											<td rowSpan={posts.length} className={`${TD} font-semibold text-[var(--ink)]`}>
												{level}
											</td>
										) : null}
										<td className={`${TD} font-medium text-[var(--ink)]`}>{post.title}</td>
										<td className={TD}>{post.note}</td>
										<td className={`${TD} text-[13px] text-[var(--ink-3)]`}>{post.detail ?? '—'}</td>
									</tr>
								)),
							)}
						</tbody>
					</table>
				</div>

				<h3 className={H3}>Appointed offices</h3>
				<p className='mt-3 text-[15px] leading-7 text-[var(--ink-2)]'>
					The department heads a governor or mayor appoints. The Code says which each level must have and
					which it may add.
				</p>
				<AppointedOffices />
				<p className='mt-6 text-[15px] leading-7 text-[var(--ink-2)]'>
					A barangay appoints a secretary and a treasurer, and has its lupon tagapamayapa for settling
					disputes, barangay health workers, purok leaders and tanods: 1 for every 200 residents, never more
					than 30 (Code ss. 413, 414).
				</p>
			</Section>

			{/* ---- What you pay ---- */}
			{/* Moved here from the 108 town pages that each repeated it: the Code
			    sets ceilings, not a town's bill. */}
			<Section
				id='charges'
				lead='The most a city or municipality and its barangays may charge you, and when it is due. Each sets its own rates by ordinance and may charge less, so the town hall has the actual figure.'
			>
				<div className='mt-8 overflow-x-auto'>
					<table className={TABLE}>
						<thead>
							<tr className={HEAD}>
								<th className={TH}>Charge</th>
								<th className={TH}>The most it may be</th>
								<th className={TH}>When</th>
							</tr>
						</thead>
						<tbody>
							{LOCAL_CHARGES.map((charge) => (
								<tr key={charge.what} className={ROW}>
									<td className={`${TD} font-medium text-[var(--ink)]`}>
										{charge.what}
										<span className='block text-[12.5px] font-normal text-[var(--ink-3)]'>{charge.basis}</span>
									</td>
									<td className={TD}>{charge.rate}</td>
									<td className={`${TD} text-[13px] text-[var(--ink-3)]`}>{charge.when}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Section>
			</DocLayout>
		</>
	)
}
