import {
	BankIcon,
	BuildingsIcon,
	ChecksIcon,
	CoinsIcon,
	GraduationCapIcon,
	HeartbeatIcon,
	MosqueIcon,
	PlantIcon,
	ScalesIcon,
	SoccerBallIcon,
	TagIcon,
	TrendUpIcon,
	TruckIcon,
	UsersFourIcon,
	UsersThreeIcon,
	WarningIcon,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon } from '@phosphor-icons/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '../_components/page-header'
import { Reveal } from '../_components/reveal'
import { categories } from '../_lib/categories'
import { getCategoryCounts, getDataset } from '../_lib/legislation-data'

export const metadata: Metadata = {
	title: 'About',
	description:
		'What this legislative registry covers, the principles behind it, how it was compiled, what each dataset holds, and precisely where its limits are.',
}

/** One glyph per sector, so the glossary can be scanned by shape. */
const sectorIcons: Record<string, Icon> = {
	health: HeartbeatIcon,
	education: GraduationCapIcon,
	women_children_social_welfare: UsersThreeIcon,
	local_government: BuildingsIcon,
	islamic_culture_heritage: MosqueIcon,
	governance_civil_service: BankIcon,
	environment_agriculture_fisheries: PlantIcon,
	peace_security_justice: ScalesIcon,
	economy_trade_investment: TrendUpIcon,
	infrastructure_transport: TruckIcon,
	elections_districting: ChecksIcon,
	budget_appropriations: CoinsIcon,
	sports_youth: SoccerBallIcon,
	indigenous_settlers: UsersFourIcon,
	disaster_resilience: WarningIcon,
	other: TagIcon,
}

/** What each sector tag is meant to capture, so filters aren't guesswork. */
const sectorDefinitions: Record<string, string> = {
	health:
		'Hospitals, health facilities, medical services, public health programs, and health workforce measures.',
	education:
		'Schools, madaris, scholarships, curriculum, teacher welfare, and higher-education institutions.',
	women_children_social_welfare:
		'Women’s rights, child protection, family welfare, social protection, and assistance programs.',
	local_government:
		'Creation, recognition, or reorganization of local government units and their powers.',
	islamic_culture_heritage:
		'Islamic affairs, Shari’ah institutions, halal, pilgrimage, heritage sites, and cultural identity.',
	governance_civil_service:
		'Bureaucratic structure, civil service rules, administrative codes, and government reorganization.',
	environment_agriculture_fisheries:
		'Land, forestry, farming, fisheries, water, and natural-resource management.',
	peace_security_justice:
		'Peace process, policing, corrections, courts, transitional justice, and decommissioning.',
	economy_trade_investment:
		'Business regulation, investment incentives, cooperatives, tourism, and enterprise development.',
	infrastructure_transport:
		'Roads, bridges, ports, utilities, telecommunications, and public works.',
	elections_districting:
		'Electoral rules, party regulation, parliamentary districts, and apportionment.',
	budget_appropriations:
		'Annual and supplemental budgets, fund transfers, and appropriation authority.',
	sports_youth: 'Youth development, sports programs, and athletic facilities.',
	indigenous_settlers: 'Rights and representation of indigenous peoples and settler communities.',
	disaster_resilience: 'Disaster preparedness, response, rehabilitation, and climate resilience.',
	other: 'Measures that do not fall cleanly into a single sector.',
}

const steps = [
	{
		step: 'Capture',
		rule: 'Records were read from the Bangsamoro Parliament’s own index pages and the BARMM Official Gazette. Each measure keeps its official number, its title as published, and the date the listing recorded — nothing is renumbered or inferred.',
		status: 'Verbatim',
	},
	{
		step: 'Classification',
		rule: 'Sector and measure-type tags were generated from official titles and metadata, not from full texts. They exist to make filtering possible and are the least authoritative part of any record.',
		status: 'Generated',
	},
	{
		step: 'Plain language',
		rule: 'Stage explanations, citizen notes, and summaries were written to make a record understandable at a glance. Where a full PDF was actually read, the record says so.',
		status: 'Reviewed',
	},
	{
		step: 'Cross-linking',
		rule: 'Where the source records an originating bill number or an amendment relationship, those links are preserved so a law can be traced back to the proposal it came from.',
		status: 'Preserved',
	},
	{
		step: 'Gaps',
		rule: 'Coverage windows and missing ranges are carried through to the interface rather than being smoothed over. Every category page states what it does not contain.',
		status: 'Disclosed',
	},
]

/**
 * Blank cells to finish a lattice's last row.
 *
 * Both grids below draw their rules from the cells themselves — each cell its
 * top and left edge — which is what keeps the frame open without hand-counting
 * rows. The cost is that a last row which does not fill leaves the lattice
 * hanging: the rule stops partway across, and it reads as a mistake rather
 * than as the end of the grid.
 *
 * How many blanks that takes depends on the column count, so it differs by
 * breakpoint and cannot be a fixed number. Each blank is rendered once and
 * shown only where it is needed. Counts come from the data, so this has to be
 * computed rather than hard-coded — a single new sector changes every answer.
 */
function LatticeBlanks({ cells, columns }: { cells: number; columns: number[] }) {
	const shortBy = (count: number) => (count - (cells % count)) % count
	const perBreakpoint = columns.map(shortBy)
	const most = Math.max(...perBreakpoint, 0)

	// `sm` / `lg` / `xl` in the order the grids declare them. Written as whole
	// literals because Tailwind reads the source, not the rendered string.
	const shown = ['sm:block', 'lg:block', 'xl:block']
	const hidden = ['sm:hidden', 'lg:hidden', 'xl:hidden']

	return (
		<>
			{Array.from({ length: most }, (_, index) => (
				<div
					key={index}
					aria-hidden='true'
					className={`hidden border-l border-t border-[var(--rule)] ${perBreakpoint
						.map((short, level) => (index < short ? shown[level] : hidden[level]))
						.join(' ')}`}
				/>
			))}
		</>
	)
}

export default function AboutPage() {
	const counts = getCategoryCounts()
	const total = Object.values(counts).reduce((sum, count) => sum + count, 0)

	const datasets = categories.map((category) => ({
		category,
		dataset: getDataset(category.slug),
	}))

	// Sector tags are shared across categories, so pool them for the glossary.
	const sectorTally = new Map<string, { label: string; count: number }>()
	for (const { dataset } of datasets) {
		for (const option of dataset.sectors) {
			const existing = sectorTally.get(option.value)
			if (existing) existing.count += option.count
			else sectorTally.set(option.value, { label: option.label, count: option.count })
		}
	}
	const sectors = Array.from(sectorTally.entries()).sort((a, b) => b[1].count - a[1].count)

	return (
		<>
			<PageHeader
				emphasis='brand'
				eyebrow={`${total.toLocaleString()} records indexed`}
				title='Every act, bill, and resolution.'
				titleMuted='Searchable, sourced, and plainly explained.'
				description='Parliament publishes its record across six archives, in legal shorthand, with no way to search between them. This adds nothing new — it puts everything in one place, explains each measure in plain language, and links every entry back to its source.'
			/>

			<section className='mx-auto max-w-[88rem] px-6 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-20'>
				{/* Coverage table */}
				<div>
					<Reveal>
						<div className='mx-auto max-w-3xl text-center'>
							<p className='eyebrow'>Coverage</p>
							<h2 className='section-title mt-4'>What is indexed, and what is not.</h2>
						</div>
					</Reveal>

					{/* Interior rules only: every cell draws its top and left edge, and
					    the grid is nudged a pixel up and left so the outermost of those
					    are clipped away. That keeps the frame open at every breakpoint
					    without hand-counting which cell starts a row or column. */}
					<div className='mt-12 overflow-hidden'>
						<div className='-ml-px -mt-px grid sm:grid-cols-2 lg:grid-cols-3'>
							{categories.map((category, index) => {
								const count = counts[category.slug]

								return (
									<Reveal
										key={category.slug}
										delay={index * 50}
										className='border-l border-t border-[var(--rule)]'
									>
										<Link
											href={category.href}
											className='flex h-full flex-col p-6 transition hover:bg-[var(--paper-2)] lg:p-8'
										>
											<div className='flex items-start justify-between gap-3'>
												<h3 className='item-title'>{category.officialLabel}</h3>
												<span
													className={`badge badge-plain shrink-0 ${count > 0 ? 'badge-done' : 'badge-idle'}`}
												>
													{count > 0 ? 'Indexed' : 'Soon'}
												</span>
											</div>

											{/* A greyed zero rather than a dash — the "Soon" badge above
											    already explains why it is zero, so the number can stay a
											    number and the column keeps its rhythm. */}
											<p
												className={`num mt-5 text-3xl font-semibold leading-none ${
													count > 0 ? 'text-[var(--ink)]' : 'text-[var(--ink-display)]'
												}`}
											>
												{count.toLocaleString()}
											</p>

											<p className='mt-4 text-sm leading-6 text-[var(--ink-3)]'>{category.blurb}</p>
										</Link>
									</Reveal>
								)
							})}
							<LatticeBlanks cells={categories.length} columns={[2, 3]} />
						</div>
					</div>
				</div>

				<Reveal className='mt-28'>
					<div className='mx-auto max-w-3xl text-center'>
						<p className='eyebrow'>Process</p>
						<h2 className='section-title mt-4'>Five steps, in order.</h2>
					</div>
				</Reveal>

				{/* A timeline rather than a list: the steps happen in order, so the
				    numbered nodes and the rule joining them carry that sequence.
				    Each node sits centred over its own column with the connector
				    running out either side, bleeding past the column by the width of
				    the grid gap so the line reads as continuous across the row. The
				    first and last connectors are held in place but hidden, which
				    keeps every numeral on the same centre line. */}
				<div className='mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
					{steps.map((item, index) => (
						<Reveal key={item.step} delay={index * 50}>
							<div className='flex h-full flex-col items-center text-center'>
								{/* The connectors only tell the truth on the five-column row:
								    anywhere the grid wraps, the line at a row's edge runs out
								    into nothing, and stacked on a phone every numeral wears a
								    pair of stray hairlines. So they wait for `xl`, and the row
								    centres its numeral itself until then. */}
								<div className='flex w-full items-center justify-center gap-3'>
									<span
										aria-hidden='true'
										className={`-ml-6 hidden h-px flex-1 bg-[var(--rule)] xl:block ${index === 0 ? 'xl:invisible' : ''}`}
									/>
									<span className='num inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--rule)] bg-[var(--paper)] text-[11px] font-bold text-[var(--ink-3)]'>
										{String(index + 1).padStart(2, '0')}
									</span>
									<span
										aria-hidden='true'
										className={`-mr-6 hidden h-px flex-1 bg-[var(--rule)] xl:block ${index === steps.length - 1 ? 'xl:invisible' : ''}`}
									/>
								</div>

								<p className='item-title font-title mt-5'>{item.step}</p>
								<p className='mt-2.5 text-[13px] leading-6 text-[var(--ink-2)]'>{item.rule}</p>
								<p className='mt-auto pt-4 text-[13px] text-[var(--accent)]'>{item.status}</p>
							</div>
						</Reveal>
					))}
				</div>

				<div className='mt-28'>
					{/* Dataset inventory */}
					<Reveal>
						<div className='mx-auto max-w-3xl text-center'>
							<p className='eyebrow'>Inventory</p>
							<h2 className='section-title mt-4'>Six archives, three captured.</h2>
						</div>
					</Reveal>

					<div className='mt-12 border-t border-[var(--rule)]'>
						{datasets.map(({ category, dataset }, index) => (
							<Reveal key={category.slug} delay={index * 50}>
								<div className='grid gap-4 border-b border-[var(--rule)] py-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_7rem] lg:items-start lg:gap-10'>
									<div className='min-w-0'>
										<Link
											href={category.href}
											className='font-bold leading-snug hover:text-[var(--accent)]'
										>
											{category.officialLabel}
										</Link>
										{/* A coverage range is a figure, not a sentence — "BAA 1–94
										    (2019–2026), complete" — so it takes the interface face
										    rather than the reading one. */}
										<p className='font-title mt-2 text-[13px] text-[var(--ink-3)]'>
											{dataset.metadata.coverage}
										</p>
									</div>

									<div className='min-w-0'>
										{dataset.metadata.knownGaps.length > 0 ? (
											<ul className='grid gap-2'>
												{dataset.metadata.knownGaps.map((gap, gapIndex) => (
													<li key={gapIndex} className='text-sm leading-6 text-[var(--ink-2)]'>
														{gap}
													</li>
												))}
											</ul>
										) : (
											<p className='text-sm leading-6 text-[var(--ink-3)]'>
												No gaps recorded for this dataset.
											</p>
										)}
									</div>

									<p className='num text-2xl font-semibold leading-none lg:text-right'>
										{dataset.records.length > 0 ? dataset.records.length.toLocaleString() : '—'}
									</p>
								</div>
							</Reveal>
						))}
					</div>

					{/* Sector glossary */}
					<div className='mt-28'>
						<Reveal>
							<div className='mx-auto max-w-3xl text-center'>
								<p className='eyebrow'>Sector glossary</p>
								<h2 className='section-title mt-4'>What each tag actually means.</h2>
								<p className='mt-5 text-sm leading-6 text-[var(--ink-3)]'>
									Sectors are analytical labels applied to help you filter — they are not part of
									the official record. A measure can carry more than one. When a tag and the
									official title disagree, the title wins.
								</p>
							</div>
						</Reveal>

						{/* Same interior-rule lattice as the coverage grid above, so the two
					    reference blocks on this page read as one family. */}
						<div className='mt-12 overflow-hidden'>
							<div className='-ml-px -mt-px grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
								{sectors.map(([value, { label, count }], index) => {
									const SectorIcon = sectorIcons[value] ?? TagIcon

									return (
										<Reveal
											key={value}
											delay={Math.min(index, 8) * 40}
											className='border-l border-t border-[var(--rule)]'
										>
											<div className='flex h-full flex-col p-6'>
												<SectorIcon
													size={22}
													weight='duotone'
													aria-hidden='true'
													className='shrink-0 text-[var(--accent)]'
												/>

												<div className='mt-9 flex flex-wrap items-center gap-2'>
													<h3 className='item-title'>{label}</h3>
													<span className='badge badge-plain badge-idle num'>
														{count.toLocaleString()}
													</span>
												</div>
												<p className='mt-3 text-[13px] leading-6 text-[var(--ink-3)]'>
													{sectorDefinitions[value] ??
														'A grouping label applied during classification. Check the official title for the exact scope.'}
												</p>
											</div>
										</Reveal>
									)
								})}
								<LatticeBlanks cells={sectors.length} columns={[2, 3, 4]} />
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}
