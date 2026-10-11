import type { Metadata } from 'next'
import { ArrowDownIcon, ArrowRightIcon } from '@phosphor-icons/react/ssr'
import { Rise } from '@betterbarmm/editorial'
import { finances, row } from '@betterbarmm/lgu-data/fiscal'
import { DocLayout } from '../_components/doc-layout'
import type { TocItem } from '../_components/doc-toc'
import { LguFigures, LguMasthead } from '../_components/lgu-parts'
import { LguTabs } from '../_components/lgu-tabs'

export const metadata: Metadata = {
	title: 'Local budgets',
	description:
		'Where a BARMM local government’s money comes from, what the law makes it spend before its council votes, and the dates its budget has to clear — in charts.',
}

/* ============================================================
   Local budgets

   The money half of local government, moved here from What each
   level does and drawn rather than written: the flow from the
   national government down, what the units actually received, the
   floors and ceilings the Code sets, and the budget calendar. Every
   rule is cited to the Code or its IRR; the income bar is BLGF's.
   ============================================================ */

/** Who sends money to whom. Each card says what it gives and who gets it. */
const CHAIN = [
	{
		tier: 'National government',
		amount: '5%',
		amountNote: 'of national tax collections, each year, to the Bangsamoro Government',
		what: 'This block grant goes to the region. Separately, every province, city, municipality and barangay gets its own National Tax Allotment straight from the national government — it does not pass through the region.',
		basis: 'Bangsamoro Organic Law, art. XII',
	},
	{
		tier: 'Bangsamoro Government',
		amount: '₱114.08B',
		amountNote: 'its budget for FY 2026',
		what: 'Mostly spent on its own ministries. It also passes some down: 40% of the national taxes collected inside BARMM goes to the local governments, on top of other support for them.',
		basis: 'Code s. 313',
	},
	{
		tier: 'Your province, city, municipality or barangay',
		amount: '3',
		amountNote: 'sources of money',
		what: 'Its own National Tax Allotment, which is nearly all of it. Some help from the Bangsamoro Government. And the taxes and fees it collects itself — the only part it decides.',
		basis: 'Code s. 21',
	},
] as const

/** The budget year, as the Code dates it. */
const CALENDAR = [
	{ when: '15 July', what: 'Every department head files a budget proposal with the chief executive.', basis: 'Code s. 341' },
	{ when: '16 October', what: 'The chief executive submits the executive budget to the sanggunian.', basis: 'IRR art. 610' },
	{ when: '31 December', what: 'The sanggunian must enact it by ordinance, on the Annual Investment Plan.', basis: 'Code s. 343' },
	{ when: '+90 days', what: 'Missed? The council sits on nothing else, unpaid, until it passes. At 90 days last year’s budget is reenacted — salaries and fixed costs only, no new project.', basis: 'Code s. 347' },
	{ when: 'Then review', what: 'A barangay budget goes up to the town, a town’s to the province. Ninety days to act, or it stands.', basis: 'IRR art. 617' },
] as const

/* ------------------------------------------------------------
   The distribution of funds, level by level

   The requirements are not the same on every rung, and a single
   list of them was quietly wrong: a barangay has no component
   barangay to send ₱1,000 to, does not set a discretionary fund,
   and carries a salary ceiling computed on a different base from
   the one above it. Split three ways, each rung shows what it
   takes in, what it may charge, and what the Code has already
   spent before its council sits.

   `of` is carried on every floor and ceiling because the bases
   differ — 20% of the National Tax Allotment, 5% of estimated
   regular income, 5% of the whole budget — and a reader who reads
   them as parts of one pie has been misled by the layout.
   ------------------------------------------------------------ */

type Money = { share: number; label: string; of: string; basis: string }

type Level = {
	id: string
	tab: string
	/** What arrives without the unit doing anything. */
	receives: { what: string; detail: string; basis: string }[]
	/** What it may charge, and the most it may charge.  */
	levies: { what: string; detail: string; basis: string }[]
	floors: Money[]
	ceilings: Money[]
}

const LEVELS: Level[] = [
	{
		id: 'province',
		tab: 'Province',
		receives: [
			{ what: '35%', detail: 'of the basic real property tax it collects. The municipality takes 40% and the barangay 25%.', basis: 'IRR art. 546' },
			{ what: 'NTA', detail: 'Its National Tax Allotment share, released automatically and without condition.', basis: 'Code s. 21' },
			{ what: '40%', detail: 'of the Bangsamoro share of national taxes collected in BARMM, split with the other units.', basis: 'Code s. 313' },
		],
		levies: [
			{ what: '1%', detail: 'Real property tax, on assessed value — plus 1% more for the Special Education Fund.', basis: 'IRR arts. 530, 531' },
			{ what: '₱1,300', detail: 'Professional tax, a year, and it covers practice anywhere in the country.', basis: 'IRR art. 447' },
			{ what: '0.5%', detail: 'Transfer tax on the sale of land, of the price or fair market value, whichever is higher.', basis: 'IRR art. 437' },
			{ what: '10%', detail: 'Amusement tax on admission receipts, shared equally with the municipality.', basis: 'IRR art. 448' },
		],
		floors: [
			{ share: 20, label: 'Development projects', of: 'of the National Tax Allotment', basis: 'Code s. 348' },
			{ share: 5, label: 'Disaster risk reduction', of: 'of estimated regular income · 30% of it a quick response fund', basis: 'IRR art. 620' },
			{ share: 5, label: 'Gender and development', of: 'of the annual budget', basis: 'Code s. 348' },
			{ share: 1, label: 'Senior citizens and PWDs', of: 'of the annual budget', basis: 'Code s. 348' },
			{ share: 1, label: 'Protection of children', of: 'of the annual budget', basis: 'Code s. 348' },
			{ share: 1, label: 'Local road maintenance', of: 'of the annual budget', basis: 'Code s. 348' },
		],
		ceilings: [
			{ share: 45, label: 'Salaries', of: 'first to third class — 55% at fourth and below', basis: 'Code s. 349' },
			{ share: 20, label: 'Debt service', of: 'of regular income', basis: 'Code s. 348' },
			{ share: 2, label: 'The governor’s discretionary fund', of: 'of last year’s real property tax receipts', basis: 'Code s. 349' },
		],
	},
	{
		id: 'municipality',
		tab: 'City or municipality',
		receives: [
			{ what: '40%', detail: 'of the basic real property tax collected on property in it. A city keeps 70% and shares 30% with its barangays.', basis: 'IRR art. 546' },
			{ what: 'NTA', detail: 'Its National Tax Allotment share, released automatically and without condition.', basis: 'Code s. 21' },
			{ what: 'SEF', detail: 'The additional 1% on real property, which may be spent only on public schools.', basis: 'Code s. 333 · IRR art. 282' },
		],
		levies: [
			{ what: '2%', detail: 'Business tax on a retailer’s first ₱400,000 of gross sales, 1% above it. Manufacturers and contractors on their own graduated tables.', basis: 'IRR art. 439' },
			{ what: '₱20', detail: 'Community tax — the cedula — plus ₱1 per ₱1,000 of income, capped at ₱5,000.', basis: 'IRR art. 452' },
			{ what: '2%', detail: 'Real property tax, if it is a city. A municipality does not levy it; its province does.', basis: 'IRR art. 530' },
			{ what: '25%', detail: 'Surcharge on any local tax paid late, plus 2% a month, capped at 36 months.', basis: 'IRR art. 459' },
		],
		floors: [
			{ share: 20, label: 'Development projects', of: 'of the National Tax Allotment', basis: 'Code s. 348' },
			{ share: 5, label: 'Disaster risk reduction', of: 'of estimated regular income · 30% of it a quick response fund', basis: 'IRR art. 620' },
			{ share: 5, label: 'Gender and development', of: 'of the annual budget', basis: 'Code s. 348' },
			{ share: 1, label: 'Senior citizens and PWDs', of: 'of the annual budget', basis: 'Code s. 348' },
			{ share: 1, label: 'Protection of children', of: 'of the annual budget', basis: 'Code s. 348' },
			{ share: 1, label: 'Local road maintenance', of: 'of the annual budget', basis: 'Code s. 348' },
		],
		ceilings: [
			{ share: 45, label: 'Salaries', of: 'first to third class — 55% at fourth and below', basis: 'Code s. 349' },
			{ share: 20, label: 'Debt service', of: 'of regular income', basis: 'Code s. 348' },
			{ share: 2, label: 'The mayor’s discretionary fund', of: 'of last year’s real property tax receipts', basis: 'Code s. 349' },
		],
	},
	{
		id: 'barangay',
		tab: 'Barangay',
		receives: [
			{ what: '25%', detail: 'of the basic real property tax collected on property in it. In a city it shares the 30% — half to the barangay the property sits in, the rest split equally.', basis: 'IRR art. 546' },
			{ what: 'NTA', detail: 'Its National Tax Allotment share — but only once MILG has revalidated it against the standards.', basis: 'Code ss. 21, 403' },
			{ what: '₱1,000', detail: 'A year, at least, in aid from its city or municipality.', basis: 'Code s. 348' },
		],
		levies: [
			{ what: '1%', detail: 'On stores with gross sales under ₱50,000 in a city or ₱30,000 in a municipality.', basis: 'IRR art. 457' },
			{ what: 'Fee', detail: 'The barangay clearance, and reasonable charges on cockpits, places of recreation and billboards.', basis: 'IRR art. 457' },
			{ what: 'Free', detail: 'Filing a dispute at the katarungang pambarangay costs nothing.', basis: 'IRR art. 78' },
		],
		floors: [
			{ share: 10, label: 'The Sangguniang Kabataan', of: 'of the barangay general fund', basis: 'Code s. 353' },
			{ share: 20, label: 'Development projects', of: 'of the National Tax Allotment', basis: 'Code s. 348' },
			{ share: 5, label: 'Disaster risk reduction', of: 'of estimated regular income', basis: 'IRR art. 620' },
		],
		ceilings: [
			{ share: 55, label: 'Salaries', of: 'of income actually realized from local sources last year', basis: 'Code s. 355' },
			{ share: 20, label: 'Petty cash', of: 'of the funds in the barangay treasury', basis: 'IRR art. 627' },
		],
	},
]

/* ------------------------------------------------------------
   What every BARMM province, city and municipality reported
   receiving in the latest year, by source (BLGF Statements of
   Receipts and Expenditures).
   ------------------------------------------------------------ */

const INCOME_YEAR = finances.years.at(-1)!

const INCOME = (() => {
	const sum = (keys: string[]) =>
		Object.keys(finances.units).reduce((total, unit) => {
			const r = row(finances, unit, INCOME_YEAR)
			return total + keys.reduce((t, k) => t + (Number(r?.[k]) || 0), 0)
		}, 0)
	const parts = [
		{ label: 'National Tax Allotment', value: sum(['nta']), color: 'var(--accent)' },
		{ label: 'Own taxes, fees and charges', value: sum(['localSources']), color: 'var(--brass)' },
		{
			label: 'Other shares, transfers and grants',
			value: sum(['otherNationalShares', 'interLocalTransfers', 'grants']),
			color: 'var(--ink-mute)',
		},
	]
	const total = parts.reduce((t, p) => t + p.value, 0)
	return { total, parts: parts.map((p) => ({ ...p, share: total ? (p.value / total) * 100 : 0 })) }
})()

const billions = (value: number) => `₱${(value / 1e9).toFixed(1)}B`

/** One bar, the whole of the units' income, split by where it came from. */
function IncomeBar() {
	if (!INCOME.total) return null
	return (
		<figure className='m-0 mt-14'>
			<figcaption className='text-[15px] font-semibold text-[var(--ink)]'>
				What BARMM’s local governments received, FY {INCOME_YEAR}
			</figcaption>
			<p className='mt-1 text-[13px] text-[var(--ink-3)]'>
				Every province, city and municipality together: {billions(INCOME.total)}.
			</p>
			<div
				className='mt-5 flex h-12 w-full overflow-hidden'
				role='img'
				aria-label={INCOME.parts.map((p) => `${p.label} ${p.share.toFixed(1)}%`).join(', ')}
			>
				{INCOME.parts.map((p) => (
					<div
						key={p.label}
						className='h-full border-r-2 border-[var(--paper)] last:border-r-0'
						style={{ width: `${p.share}%`, minWidth: '3px', background: p.color }}
						title={`${p.label}: ${billions(p.value)} (${p.share.toFixed(1)}%)`}
					/>
				))}
			</div>
			<ul className='mt-5 grid gap-4 sm:grid-cols-3'>
				{INCOME.parts.map((p) => (
					<li key={p.label} className='border-t-2 pt-3' style={{ borderColor: p.color }}>
						<p className='num text-[1.6rem] font-extrabold leading-none tracking-[-0.02em] text-[var(--ink)]'>
							{p.share.toFixed(1)}%
						</p>
						<p className='mt-2 text-[13.5px] text-[var(--ink-2)]'>{p.label}</p>
						<p className='num mt-0.5 text-[12.5px] text-[var(--ink-3)]'>{billions(p.value)}</p>
					</li>
				))}
			</ul>
			<p className='mt-4 text-[12px] leading-5 text-[var(--ink-3)]'>
				From BLGF’s Statements of Receipts and Expenditures. FY {INCOME_YEAR} is preliminary; a unit that did not
				report is not in the total.
			</p>
		</figure>
	)
}

/** A labeled proportion bar. The width is the figure. */
function ShareRow({
	share,
	label,
	of,
	basis,
	tone,
}: {
	share: number
	label: string
	of: string
	basis: string
	tone: string
}) {
	return (
		<li className='border-b border-[var(--rule-soft)] py-3.5'>
			<div className='flex items-baseline justify-between gap-4'>
				<p className='text-[13.5px] font-semibold leading-snug text-[var(--ink)]'>{label}</p>
				<p className='num shrink-0 text-[15px] font-bold leading-none' style={{ color: tone }}>
					{share}%
				</p>
			</div>
			<div
				className='mt-2 h-1.5 w-full bg-[var(--rule-soft)]'
				role='img'
				aria-label={`${share} per cent ${of}`}
			>
				<div className='h-full' style={{ width: `${share}%`, background: tone }} />
			</div>
			<p className='mt-1.5 text-[11.5px] leading-5 text-[var(--ink-3)]'>
				{of} · {basis}
			</p>
		</li>
	)
}

/** One rung: what arrives, what it may charge, and what is committed. */
function LevelPanel({ level }: { level: Level }) {
	return (
		<div className='pt-10'>
			<div className='grid gap-x-12 gap-y-10 lg:grid-cols-2'>
				<div>
					<h3 className='bb-label'>What it takes in</h3>
					<ul className='mt-5'>
						{level.receives.map((row) => (
							<li key={row.detail} className='flex items-baseline gap-5 border-b border-[var(--rule-soft)] py-3.5'>
								<span className='money num w-20 shrink-0 text-[15px] font-bold leading-none text-[var(--accent)]'>
									{row.what}
								</span>
								<span className='min-w-0 flex-1'>
									<span className='block text-[13px] leading-6 text-[var(--ink-2)]'>
										{row.detail}
									</span>
									<span className='mt-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
										{row.basis}
									</span>
								</span>
							</li>
						))}
					</ul>
				</div>

				<div>
					<h3 className='bb-label'>What it may charge</h3>
					<ul className='mt-5'>
						{level.levies.map((row) => (
							<li key={row.detail} className='flex items-baseline gap-5 border-b border-[var(--rule-soft)] py-3.5'>
								<span className='money num w-20 shrink-0 text-[15px] font-bold leading-none text-[var(--brass)]'>
									{row.what}
								</span>
								<span className='min-w-0 flex-1'>
									<span className='block text-[13px] leading-6 text-[var(--ink-2)]'>
										{row.detail}
									</span>
									<span className='mt-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
										{row.basis}
									</span>
								</span>
							</li>
						))}
					</ul>
				</div>
			</div>

			<div className='mt-12 grid gap-x-12 gap-y-10 border-t border-[var(--brass-line)] pt-8 lg:grid-cols-2'>
				<div>
					<h3 className='bb-label'>Floors — at least this much</h3>
					<ul className='mt-5'>
						{level.floors.map((row) => (
							<ShareRow key={row.label} {...row} tone='var(--accent)' />
						))}
					</ul>
				</div>

				<div>
					<h3 className='bb-label'>Ceilings — no more than this</h3>
					<ul className='mt-5'>
						{level.ceilings.map((row) => (
							<ShareRow key={row.label} {...row} tone='var(--brass)' />
						))}
					</ul>
					{level.id === 'barangay' ? (
						<p className='mt-4 text-[12.5px] leading-6 text-[var(--ink-3)]'>
							The treasurer may also buy directly only up to ₱1,000 at a time.{' '}
							<span className='font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
								IRR art. 627
							</span>
						</p>
					) : (
						<p className='mt-4 text-[12.5px] leading-6 text-[var(--ink-3)]'>
							Plus at least ₱1,000 a year in aid to every component barangay.{' '}
							<span className='font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
								Code s. 348
							</span>
						</p>
					)}
				</div>
			</div>
		</div>
	)
}

const TOC: TocItem[] = [
	{ id: 'money', label: 'Where the money comes from', depth: 1 },
	{ id: 'distribution', label: 'What must be spent first', depth: 1 },
	{ id: 'calendar', label: 'How the budget is passed', depth: 1 },
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

export default function LocalBudgetsPage() {
	return (
		<>
			<LguMasthead kicker='The guide · Bangsamoro' name='Local budgets'>
				<LguFigures
					figures={[
						{ label: 'Development fund', value: '20%', detail: 'Of the National Tax Allotment, set aside for development projects. Code s. 348.' },
						{ label: 'Disaster fund', value: '5%', detail: 'Of estimated regular income, for disaster risk reduction. IRR art. 620.' },
						{ label: 'Salary cap', value: '45–55%', detail: 'The most of last year’s regular income that may go to personnel. Code s. 349.' },
						{ label: 'Deadline', value: '31 Dec', detail: 'The council must pass next year’s budget by then. Code s. 343.' },
					]}
				/>
			</LguMasthead>

			<DocLayout toc={TOC}>
			{/* ---- Where the money comes from ---- */}
			<Section
				id='money'
				lead='A local government gets most of its money straight from the national government. The Bangsamoro Government adds some, and the local government raises the rest itself. Each one decides how to spend what it gets.'
			>
				{/* The flow as connected cards: across on a wide screen, down on a phone. */}
				<ol className='mt-10 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-stretch'>
					{CHAIN.map((stage, index) => (
						<li key={stage.tier} className='contents'>
							<div className='bg-[var(--paper-2)] p-6'>
								<p className='num font-mono text-[11px] font-semibold text-[var(--brass)]'>
									{String(index + 1).padStart(2, '0')}
								</p>
								<h3 className='mt-2 text-[15.5px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
									{stage.tier}
								</h3>
								<p className='money num mt-5 text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--accent)]'>
									{stage.amount}
								</p>
								<p className='mt-2 text-[11.5px] leading-5 text-[var(--ink-3)]'>{stage.amountNote}</p>
								<p className='mt-4 text-[13.5px] leading-6 text-[var(--ink-2)]'>{stage.what}</p>
								<p className='mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
									{stage.basis}
								</p>
							</div>
							{index < CHAIN.length - 1 ? (
								<div aria-hidden='true' className='flex items-center justify-center text-[var(--accent)]'>
									<ArrowDownIcon size={22} weight='bold' className='lg:hidden' />
									<ArrowRightIcon size={22} weight='bold' className='hidden lg:block' />
								</div>
							) : null}
						</li>
					))}
				</ol>

				<IncomeBar />
			</Section>

			{/* ---- Where it must go ---- */}
			{/* Three panels rather than one list. The rungs do not carry the same
			    requirements, and the flat version quietly implied they did. */}
			<Section
				id='distribution'
				lead='Before a council spends anything, the law has already set some of it aside. Pick a level: red bars are the least it must spend on something, gold bars the most it may. Each is a share of its own base, so they do not add up.'
			>

				<div className='mt-12'>
					<LguTabs
						sticky={false}
						tabs={LEVELS.map((level) => ({
							id: level.id,
							label: level.tab,
							panel: <LevelPanel level={level} />,
						}))}
					/>
				</div>
			</Section>

			{/* ---- The calendar ---- */}
			<Section
				id='calendar'
				lead='Every province, city, municipality and barangay passes its budget on the same dates. If the council misses the last one, it can do nothing else until the budget is passed.'
			>
				{/* A timeline, top to bottom. The open dot, on a dashed line, is what
				    happens only if the deadline slips. */}
				<ol className='mt-12 max-w-2xl'>
					{CALENDAR.map((step, index) => {
						const late = step.when.startsWith('+')
						const number = CALENDAR.slice(0, index + 1).filter((s) => !s.when.startsWith('+')).length
						return (
							<li key={step.when} className='relative pb-10 pl-10 last:pb-0'>
								{index < CALENDAR.length - 1 ? (
									<span
										aria-hidden='true'
										className={`absolute bottom-0 left-[7px] top-5 w-0.5 ${
											index === 2 || late ? 'bg-[repeating-linear-gradient(to_bottom,var(--accent)_0_6px,transparent_6px_12px)]' : 'bg-[var(--accent)]'
										}`}
									/>
								) : null}
								<span
									aria-hidden='true'
									className={`absolute left-0 top-1 size-4 rounded-full border-2 border-[var(--accent)] ${
										late ? 'bg-[var(--paper)]' : 'bg-[var(--accent)]'
									}`}
								/>
								<p className='num font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-mute)]'>
									{late ? 'If late' : `Step ${number}`}
								</p>
								<p className='money num mt-2 text-[1.35rem] font-extrabold leading-none tracking-[-0.02em] text-[var(--ink)]'>
									{step.when}
								</p>
								<p className='mt-3 text-[13px] leading-6 text-[var(--ink-2)]'>{step.what}</p>
								<p className='mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
									{step.basis}
								</p>
							</li>
						)
					})}
				</ol>

				<Rise distance={12}>
					<p className='mt-12 border-t border-[var(--rule)] pt-5 text-[13px] leading-7 text-[var(--ink-2)]'>
						<span className='font-semibold text-[var(--ink)]'>The development plan is the thing being funded.</span>{' '}
						A local development council — the chief executive, every punong barangay, and at
						least a quarter of its seats held by NGOs — writes the multi-year plan. The Annual
						Investment Plan comes off it, and the budget is enacted on that plan rather than
						beside it. The 20% development fund above is what pays for it.{' '}
						<span className='font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
							Code s. 343 · IRR arts. 268, 269, 271
						</span>
					</p>
				</Rise>
			</Section>

			</DocLayout>
		</>
	)
}
