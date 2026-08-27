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
import { OkirRule, SectionHead } from '@betterbarmm/editorial'
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
		rule: 'Read from Parliament’s own index pages and the BARMM Official Gazette. Numbers, titles, dates and the link between a bill and the act it became stay as published — nothing is renumbered or inferred.',
		status: 'Verbatim',
	},
	{
		step: 'Classification',
		rule: 'Sector and type tags come from titles and metadata, not full texts. They exist to make filtering possible, and are the least authoritative part of a record.',
		status: 'Generated',
	},
	{
		step: 'Plain language',
		rule: 'Stage notes and summaries written to be understood at a glance. Where a full PDF was read, the record says so.',
		status: 'Reviewed',
	},
	{
		step: 'Gaps',
		rule: 'Coverage windows and missing ranges are carried through, not smoothed over. Every category page states what it does not hold.',
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

	const datasets = categories.map((category) => ({
		category,
		dataset: getDataset(category.slug),
	}))

	// The whole, then one figure per archive in the order the registry lists
	// them, with what the card that used to carry the number said about it.
	//
	// Six across four tracks on purpose. The last row is the two archives that
	// have not been captured at all — a ragged row that lands exactly on the
	// break between what this registry holds and what it does not yet, which
	// says more than an even grid would.
	const archives = [
		{
			label: 'Records indexed',
			value: Object.values(counts)
				.reduce((sum, count) => sum + count, 0)
				.toLocaleString(),
			detail: 'Every measure this registry has captured, across all five archives.',
		},
		...categories.map((category) => ({
			label: category.officialLabel,
			value: counts[category.slug].toLocaleString(),
			detail: counts[category.slug] > 0 ? category.blurb : 'Not yet captured.',
		})),
	]

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
				size='compact'
				eyebrow='What this registry holds'
				title='Every record, in one place.'
				titleMuted='Explained in plain words.'
				description='Parliament publishes its record across six archives, in legal shorthand, with no way to search between them. This adds nothing new — it puts everything in one place, explains each measure in plain language, and links every entry back to its source.'
				/* The size of the thing, under the sentence that claims it. It was a
				   single figure in the kicker above the headline — the one place on
				   the page a reader is least likely to weigh a number, and the page
				   is about what is indexed. The lattice below still holds each
				   archive with its own count, its coverage and its link; this is the
				   total those add to. */
				/* Every archive, counted, under the sentence that claims them. These
				   were a lattice of six cards further down the page; the number was
				   the only thing on a card the inventory below did not already say
				   better, and a page about what is indexed should say how much is
				   indexed in its opening rather than a screen later. An archive with
				   nothing captured still gets its row, at zero — a gap stated is
				   worth more than a gap left out. */
				figures={archives}
			/>

			{/* Three reference blocks, each a section in its own right rather than
			    three headings inside one — so the page keeps the rhythm every other
			    page on the estate is set to, with the okir rule marking the joins.
			    The heads are the shared `SectionHead`: the brass kicker and its
			    numeral, the two-tone display line, centred as this page's heads
			    already were.

			    What is indexed used to open the page as a lattice of six cards, one
			    per archive, each printing a count. Those counts are the masthead's
			    now — they are the size of the thing the page is about, and they
			    belong under the sentence that claims it. What the cards carried
			    besides the number, the inventory below already carried better: each
			    archive with its coverage, its known gaps and its total. */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='01'
					eyebrow='Process'
					title='Four steps,'
					titleMuted='in order.'
					align='center'
				/>

				{/* A timeline rather than a list: the steps happen in order, so the
				    numbered nodes and the rule joining them carry that sequence.
				    Each node sits centred over its own column with the connector
				    running out either side, bleeding past the column by the width of
				    the grid gap so the line reads as continuous across the row. The
				    first and last connectors are held in place but hidden, which
				    keeps every numeral on the same centre line. */}
				<div className='grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4'>
					{steps.map((item, index) => (
						<Reveal key={item.step} delay={index * 50}>
							<div className='flex h-full flex-col items-center text-center'>
								{/* The connectors only tell the truth on the four-column row:
								    anywhere the grid wraps, the line at a row's edge runs out
								    into nothing, and stacked on a phone every numeral wears a
								    pair of stray hairlines. So they wait for `lg`, and the row
								    centres its numeral itself until then. */}
								<div className='flex w-full items-center justify-center gap-3'>
									<span
										aria-hidden='true'
										className={`-ml-6 hidden h-px flex-1 bg-[var(--rule)] lg:block ${index === 0 ? 'lg:invisible' : ''}`}
									/>
									<span className='num inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--rule)] bg-[var(--paper)] text-[11px] font-bold text-[var(--ink-3)]'>
										{String(index + 1).padStart(2, '0')}
									</span>
									<span
										aria-hidden='true'
										className={`-mr-6 hidden h-px flex-1 bg-[var(--rule)] lg:block ${index === steps.length - 1 ? 'lg:invisible' : ''}`}
									/>
								</div>

									<p className='item-title font-title mt-5'>{item.step}</p>

								{/* Under the name rather than at the foot of the column. It is
								    what the step does to the record — the second thing to know
								    about it, not the last — and stranded below a paragraph of
								    varying length it read as a stray word rather than a label.
								    Brass rather than a status tone: these are kinds, and the
								    tones are reserved for stages. */}
								<span className='badge badge-plain badge-treatment mt-3'>{item.status}</span>

								<p className='mt-3 bb-body text-[var(--ink-2)]'>{item.rule}</p>
							</div>
						</Reveal>
					))}
				</div>

			</section>

			<OkirRule className='mx-auto max-w-[88rem] opacity-70' />

			<section className='bb-container bb-section'>
				<SectionHead
					index='02'
					eyebrow='Inventory'
					title='Six archives,'
					titleMuted='three captured.'
					align='center'
				/>

				<div className='border-t border-[var(--rule)]'>
						{datasets.map(({ category, dataset }, index) => (
							<Reveal key={category.slug} delay={index * 50}>
								<div className='grid gap-4 border-b border-[var(--rule)] py-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_7rem] lg:items-start lg:gap-10'>
									<div className='min-w-0'>
										<Link
											href={category.href}
											className='reg-archive-title hover:text-[var(--accent)]'
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
													<li key={gapIndex} className='bb-body text-[var(--ink-2)]'>
														{gap}
													</li>
												))}
											</ul>
										) : (
											<p className='bb-body text-[var(--ink-3)]'>
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
			</section>

			<OkirRule className='mx-auto max-w-[88rem] opacity-70' />

			<section className='bb-container bb-section'>
				<SectionHead
					index='03'
					eyebrow='Sector glossary'
					title='What each tag'
					titleMuted='actually means.'
					lead='Sectors are analytical labels applied to help you filter — they are not part of the official record. A measure can carry more than one. When a tag and the official title disagree, the title wins.'
					align='center'
				/>

				{/* Same interior-rule lattice as the coverage grid above, so the two
				    reference blocks on this page read as one family. */}
				<div className='overflow-hidden'>
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
													{/* Brass at a single weight, not a duotone in the accent.
												    The crimson is the loudest ink the estate has and it is
												    spent on one thing at a time; sixteen of them down a
												    lattice made the glyphs the subject and the definitions
												    the caption. */}
												<SectorIcon
													size={22}
													weight='regular'
													aria-hidden='true'
													className='shrink-0 text-[var(--brass)]'
												/>

												<div className='mt-9 flex flex-wrap items-center gap-2'>
													<h3 className='item-title item-title-strong'>{label}</h3>
													<span className='badge badge-plain badge-idle num'>
														{count.toLocaleString()}
													</span>
												</div>
												<p className='mt-3 bb-body text-[var(--ink-3)]'>
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
			</section>
		</>
	)
}
