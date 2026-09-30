import type { Metadata } from 'next'
import Link from 'next/link'
import { OkirRule, Rise, SectionHead } from '@betterbarmm/editorial'
import { SERVICES, formatNumber, lguData, lguReferences } from '@betterbarmm/lgu-data'
import { LguBreadcrumb, LguMasthead } from '../_components/lgu-parts'
import { LguTabs } from '../_components/lgu-tabs'

export const metadata: Metadata = {
	title: 'How local government works',
	description:
		'Where the money starts, how it reaches a barangay, who approves the budget and by when, and how much of it is spoken for before anyone votes — the chain from national taxes to BARMM to your town, in figures.',
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

/** The chain, top to bottom. Each stage says what it is and what it holds. */
const CHAIN = [
	{
		tier: 'National government',
		amount: '5%',
		amountNote: 'of net national internal revenue',
		what: 'A block grant to BARMM, set by formula rather than negotiated. The National Tax Allotment straight to every LGU — automatic, and with no conditions on it.',
		basis: 'Bangsamoro Organic Law, art. XII',
	},
	{
		tier: 'Bangsamoro Government',
		amount: '₱114.08B',
		amountNote: 'the enacted FY 2026 budget',
		what: 'Runs its own ministries, and passes 40% of its share of national taxes collected inside BARMM down to the units — on top of what it appropriates for local government support.',
		basis: 'Code s. 313',
	},
	{
		tier: 'Province · city · municipality · barangay',
		amount: '3',
		amountNote: 'sources, in order of size',
		what: 'The National Tax Allotment, which is most of it. Bangsamoro transfers. And its own taxes and fees — the only source it actually decides.',
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

const RUNGS = [
	{ level: 'Barangay', count: lguData.totals.barangays, groups: SERVICES.barangay },
	{ level: 'City or municipality', count: lguData.totals.lgus, groups: SERVICES.cityMunicipality },
	{ level: 'Province', count: lguData.totals.provinces, groups: SERVICES.province },
] as const

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

export default function HowItWorksPage() {
	return (
		<>
			<LguMasthead
				brand
				breadcrumb={<LguBreadcrumb trail={[]}>How it works</LguBreadcrumb>}
				kicker='The guide · Bangsamoro'
				name='Where the money starts, and what is left to decide.'
				note='National taxes to BARMM to your barangay, in three steps — then the calendar the budget has to clear, and how much of it the law has already spent.'
			/>

			{/* ---- The chain ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='01'
					eyebrow='The chain'
					size='sm'
					title='Three governments,'
					titleMuted='one flow of money.'
					lead='None of them reports to the one above it. What passes downward is money, not orders.'
				/>

				<ol className='mt-12'>
					{CHAIN.map((stage, index) => (
						<li key={stage.tier} className='relative'>
							<div className='grid gap-x-10 gap-y-4 border-t border-[var(--brass-line)] pt-6 lg:grid-cols-[minmax(0,13rem)_minmax(0,11rem)_minmax(0,1fr)]'>
								<div>
									<p className='num font-mono text-[11px] font-semibold text-[var(--brass)]'>
										{String(index + 1).padStart(2, '0')}
									</p>
									<h3 className='mt-2 text-[15.5px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
										{stage.tier}
									</h3>
								</div>

								<div>
									<p className='money num text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--accent)]'>
										{stage.amount}
									</p>
									<p className='mt-2 text-[11.5px] leading-5 text-[var(--ink-3)]'>
										{stage.amountNote}
									</p>
								</div>

								<div>
									<p className='text-[13.5px] leading-7 text-[var(--ink-2)]'>{stage.what}</p>
									<p className='mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
										{stage.basis}
									</p>
								</div>
							</div>

							{index < CHAIN.length - 1 ? (
								<div aria-hidden='true' className='flex items-center gap-3 py-6 pl-1'>
									<span className='h-10 w-px bg-[var(--brass-line)]' />
									<span className='font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-mute)]'>
										passes down
									</span>
								</div>
							) : (
								<div className='h-10' />
							)}
						</li>
					))}
				</ol>
			</section>

			<OkirRule />

			{/* ---- The calendar ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='02'
					eyebrow='How it is approved'
					size='sm'
					title='Five dates,'
					titleMuted='and one penalty for missing them.'
					lead='The same calendar at every level. A council that misses the last one stops doing anything else.'
				/>

				<ol className='mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-5'>
					{CALENDAR.map((step, index) => (
						<li key={step.when} className='border-t-2 border-[var(--accent)] pt-4'>
							<p className='num font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-mute)]'>
								Step {index + 1}
							</p>
							<p className='money num mt-2 text-[1.35rem] font-extrabold leading-none tracking-[-0.02em] text-[var(--ink)]'>
								{step.when}
							</p>
							<p className='mt-3 text-[12.5px] leading-6 text-[var(--ink-2)]'>{step.what}</p>
							<p className='mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
								{step.basis}
							</p>
						</li>
					))}
				</ol>

				<Rise distance={12}>
					<p className='mt-12 border-t border-[var(--rule)] pt-5 text-[13px] leading-7 text-[var(--ink-2)]'>
						<span className='font-semibold text-[var(--ink)]'>The development plan is the thing being funded.</span>{' '}
						A local development council — the chief executive, every punong barangay, and at
						least a quarter of its seats held by NGOs — writes the multi-year plan. The Annual
						Investment Plan comes off it, and the budget is enacted on that plan rather than
						beside it. The 20% below is what pays for it.{' '}
						<span className='font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
							Code s. 343 · IRR arts. 268, 269, 271
						</span>
					</p>
				</Rise>
			</section>

			{/* ---- Where it must go ---- */}
			{/* Three panels rather than one list. The rungs do not carry the same
			    requirements, and the flat version quietly implied they did. */}
			<section className='bb-container border-t border-[var(--rule)] bb-section'>
				<SectionHead
					index='03'
					eyebrow='The distribution'
					size='sm'
					title='What each rung takes in,'
					titleMuted='and what is already spent.'
					lead='Pick a level. Bars are a share of their own base, named under each — they are not slices of one pie and must not be added up.'
				/>

				<div className='mt-12'>
					<LguTabs
						tabs={LEVELS.map((level) => ({
							id: level.id,
							label: level.tab,
							panel: <LevelPanel level={level} />,
						}))}
					/>
				</div>
			</section>

			{/* ---- What each rung owes you ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='04'
					eyebrow='What it buys'
					size='sm'
					title='Which rung'
					titleMuted='owes you what.'
					lead='Almost every wasted trip to a hall is somebody at the wrong one.'
				/>

				<div className='mt-12 grid gap-x-10 gap-y-12 lg:grid-cols-3'>
					{RUNGS.map((rung) => (
						<div key={rung.level} className='border-t-2 border-[var(--brass)] pt-5'>
							<div className='flex items-baseline justify-between gap-3'>
								<h3 className='text-[15.5px] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
									{rung.level}
								</h3>
								<p className='num text-[13px] font-semibold text-[var(--brass)]'>
									{formatNumber(rung.count)}
								</p>
							</div>

							{rung.groups.map((group) => (
								<div key={group.title} className='mt-5'>
									<h4 className='bb-label'>{group.title}</h4>
									<ul className='mt-2'>
										{group.items.map((item) => (
											<li
												key={item}
												className='border-b border-[var(--rule-soft)] py-2 text-[12.5px] leading-6 text-[var(--ink-3)]'
											>
												{item}
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					))}
				</div>
			</section>

			{/* ---- The gap ---- */}
			<section className='bb-container bb-section-bottom'>
				<Rise distance={14}>
					<div className='border-t border-[var(--brass-line)] pt-8'>
						<h2 className='bb-display-sm max-w-3xl text-[var(--ink)]'>
							What a particular town was given is not published anywhere.
						</h2>
						<p className='mt-5 max-w-3xl text-[13.5px] leading-7 text-[var(--ink-2)]'>
							Not by MILG, and not in the Bangsamoro budget, which funds local government as one
							regional total. It sits in each unit’s own appropriations ordinance. Three places
							hold pieces of it.
						</p>

						<div className='mt-7 flex flex-wrap gap-x-8 gap-y-3 text-[13px]'>
							<a href='https://blgf.gov.ph/' target='_blank' rel='noreferrer' className='rule-link'>
								BLGF — income and expenditure
							</a>
							<a href='https://www.dbm.gov.ph/' target='_blank' rel='noreferrer' className='rule-link'>
								DBM — National Tax Allotment
							</a>
							<a href='https://budget.betterbarmm.com' target='_blank' rel='noreferrer' className='rule-link'>
								The regional budget, year by year
							</a>
						</div>

						<p className='mt-8 text-[12.5px] leading-6 text-[var(--ink-3)]'>
							Every figure here is from{' '}
							<a
								href={lguReferences.localGovernanceCode.href}
								target='_blank'
								rel='noreferrer'
								className='rule-link'
							>
								{lguReferences.localGovernanceCode.label}
							</a>{' '}
							and its{' '}
							<a
								href={lguReferences.implementingRules.href}
								target='_blank'
								rel='noreferrer'
								className='rule-link'
							>
								implementing rules
							</a>
							, cited section by section. How this code differs from the national one is{' '}
							<Link href='/two-codes' className='rule-link'>
								its own page
							</Link>
							.
						</p>
					</div>
				</Rise>
			</section>
		</>
	)
}
