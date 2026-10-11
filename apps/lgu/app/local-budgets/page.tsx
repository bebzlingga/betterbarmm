import type { Metadata } from 'next'
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

/* The three sources as 100 squares: shares rounded by largest remainder so
   the grid always holds exactly 100. */
const SQUARES = (() => {
	const raw = INCOME.parts.map((p) => p.share)
	const counts = raw.map(Math.floor)
	const order = raw.map((v, i) => [v - Math.floor(v), i] as const).sort((x, y) => y[0] - x[0])
	for (let k = 0; k < 100 - counts.reduce((t, c) => t + c, 0); k++) counts[order[k][1]]++
	return INCOME.parts.flatMap((p, i) => Array.from({ length: counts[i] }, () => p.color))
})()

/** Where each ₱100 came from: a 10 by 10 grid, one square a peso in a hundred. */
function PerHundred() {
	if (!INCOME.total) return null
	return (
		<figure className='m-0 mt-10 grid items-center gap-10 sm:grid-cols-[16rem_minmax(0,1fr)] sm:gap-14'>
			<div
				className='grid aspect-square w-full max-w-[16rem] grid-cols-10 gap-1'
				role='img'
				aria-label={INCOME.parts.map((p) => `${p.label} ₱${p.share.toFixed(2)} of every ₱100`).join(', ')}
			>
				{SQUARES.map((color, i) => (
					<span key={i} style={{ background: color }} />
				))}
			</div>
			<div>
				<figcaption className='text-[15px] font-semibold text-[var(--ink)]'>
					For every ₱100 a BARMM local government received in FY {INCOME_YEAR}
				</figcaption>
				<ul className='mt-4'>
					{INCOME.parts.map((p) => (
						<li key={p.label} className='flex items-baseline gap-3 border-b border-[var(--rule-soft)] py-3'>
							<span aria-hidden='true' className='size-3 shrink-0 translate-y-[1px]' style={{ background: p.color }} />
							<span className='num w-20 shrink-0 text-[1.25rem] font-extrabold leading-none text-[var(--ink)]'>
								₱{p.share.toFixed(2)}
							</span>
							<span className='text-[14px] text-[var(--ink-2)]'>{p.label}</span>
						</li>
					))}
				</ul>
				<p className='mt-3 text-[12px] leading-5 text-[var(--ink-3)]'>
					All BARMM provinces, cities and municipalities together: {billions(INCOME.total)}. From BLGF’s
					Statements of Receipts and Expenditures; FY {INCOME_YEAR} is preliminary.
				</p>
			</div>
		</figure>
	)
}

/** The three sources, in plain words. */
const SOURCES = [
	{
		name: 'National Tax Allotment',
		from: 'The national government, straight to each province, city, municipality and barangay',
		what: 'Its share of national taxes, set by formula and paid automatically, without passing through the region. At least 20% of it must go to development projects.',
		basis: 'Code ss. 21, 348',
	},
	{
		name: 'Help from the Bangsamoro Government',
		from: 'The region',
		what: 'The region receives its own block grant of 5% of national tax collections, and passes part of its money down: 40% of the national taxes collected inside BARMM, and programs and subsidies on top.',
		basis: 'Organic Law art. XII · Code s. 313',
	},
	{
		name: 'Its own taxes, fees and charges',
		from: 'The people and businesses in the unit',
		what: 'Real property tax, business taxes, permits, fees and market rentals. The only money a local government raises itself.',
		basis: 'Code s. 148',
	},
]

/* What all of BARMM's local governments reported receiving as NTA, year by
   year. The old Maguindanao province, filed apart before its 2022 split, is
   added in; the count of units reporting each year is printed with it. */
const NTA_TREND = finances.years.map((year) => {
	let total = 0
	let units = 0
	for (const table of [finances.units, finances.former]) {
		for (const key of Object.keys(table)) {
			const nta = Number(row({ ...finances, units: table }, key, year)?.nta) || 0
			if (nta) {
				total += nta
				units += 1
			}
		}
	}
	return { year, total, units }
})

function NtaTrend() {
	const top = Math.max(...NTA_TREND.map((y) => y.total))
	return (
		<figure className='m-0 mt-14'>
			<figcaption className='text-[15px] font-semibold text-[var(--ink)]'>
				National Tax Allotment received by BARMM’s local governments, by year
			</figcaption>
			<div className='mt-6 grid h-52 items-end gap-1.5 sm:gap-3' style={{ gridTemplateColumns: `repeat(${NTA_TREND.length}, minmax(0, 1fr))` }}>
				{NTA_TREND.map(({ year, total }) => (
					<div key={year} className='flex h-full flex-col items-center justify-end'>
						<span className='num mb-1.5 whitespace-nowrap text-[9.5px] text-[var(--ink-2)] sm:text-[12px]'>
							{(total / 1e9).toFixed(1)}B
						</span>
						<div
							className='w-full max-w-14'
							style={{
								height: `calc(${(total / top) * 100}% - 1.5rem)`,
								background: 'linear-gradient(to top, color-mix(in oklab, var(--accent) 35%, transparent), var(--accent))',
							}}
							title={`FY ${year}: ₱${total.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`}
						/>
					</div>
				))}
			</div>
			<div className='grid gap-1.5 border-t border-[var(--rule)] pt-2 sm:gap-3' style={{ gridTemplateColumns: `repeat(${NTA_TREND.length}, minmax(0, 1fr))` }}>
				{NTA_TREND.map(({ year }) => (
					<span key={year} className='num text-center text-[10.5px] text-[var(--ink-3)] sm:text-[12px]'>
						<span className='sm:hidden'>’{String(year).slice(2)}</span>
						<span className='hidden sm:inline'>{year}</span>
					</span>
				))}
			</div>
			<p className='mt-4 text-[12px] leading-5 text-[var(--ink-3)]'>
				In billions of pesos, as each unit reported it to BLGF; between {Math.min(...NTA_TREND.map((y) => y.units))} and{' '}
				{Math.max(...NTA_TREND.map((y) => y.units))} units reported in a year. The jump in 2022 is the Mandanas
				ruling, which widened the national taxes the allotment is cut from. FY {INCOME_YEAR} is preliminary.
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
				lead='A local government has three sources of money. Nearly all of it comes from one: its share of national taxes, paid straight to it by the national government.'
			>
				<PerHundred />

				<ol className='mt-12'>
					{SOURCES.map((source, index) => (
						<li key={source.name} className='grid gap-x-8 gap-y-2 border-t border-[var(--rule)] py-6 md:grid-cols-[14rem_minmax(0,1fr)]'>
							<div>
								<p className='num font-mono text-[11px] font-semibold text-[var(--brass)]'>{String(index + 1).padStart(2, '0')}</p>
								<h3 className='mt-1 text-[16px] font-extrabold leading-snug tracking-[-0.01em] text-[var(--ink)]'>{source.name}</h3>
								<p className='mt-1 text-[12.5px] leading-5 text-[var(--ink-3)]'>From {source.from.charAt(0).toLowerCase() + source.from.slice(1)}</p>
							</div>
							<div>
								<p className='text-[15px] leading-7 text-[var(--ink-2)]'>{source.what}</p>
								<p className='mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-mute)]'>{source.basis}</p>
							</div>
						</li>
					))}
				</ol>

				<NtaTrend />
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
				{/* A timeline: across on a wide screen, down on a phone. The open dot,
				    on a dashed line, is what happens only if the deadline slips. */}
				<ol className='mt-12 xl:grid xl:grid-cols-5 xl:gap-x-8'>
					{CALENDAR.map((step, index) => {
						const late = step.when.startsWith('+')
						const number = CALENDAR.slice(0, index + 1).filter((s) => !s.when.startsWith('+')).length
						return (
							<li key={step.when} className='relative pb-10 pl-10 last:pb-0 xl:pb-0 xl:pl-0 xl:pt-12'>
								{index < CALENDAR.length - 1 ? (
									<span
										aria-hidden='true'
										className={`absolute bottom-0 left-[7px] top-5 w-0.5 xl:-right-8 xl:bottom-auto xl:left-4 xl:top-[7px] xl:h-0.5 xl:w-auto ${
											index === 2 || late ? 'bg-[repeating-linear-gradient(to_bottom,var(--accent)_0_6px,transparent_6px_12px)] xl:bg-[repeating-linear-gradient(to_right,var(--accent)_0_6px,transparent_6px_12px)]' : 'bg-[var(--accent)]'
										}`}
									/>
								) : null}
								<span
									aria-hidden='true'
									className={`absolute left-0 top-1 size-4 rounded-full border-2 border-[var(--accent)] xl:top-0 ${
										late ? 'bg-[var(--paper)]' : 'bg-[var(--accent)]'
									}`}
								/>
								<p className='num font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-mute)]'>
									{late ? 'If late' : `Step ${number}`}
								</p>
								<p className='money num mt-2 text-[1.05rem] font-extrabold leading-none tracking-[-0.02em] text-[var(--ink)]'>
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
