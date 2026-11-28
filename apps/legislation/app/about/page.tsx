import {
	ArrowRightIcon,
	BankIcon,
	BuildingsIcon,
	ChatTextIcon,
	CheckCircleIcon,
	DownloadSimpleIcon,
	EyeIcon,
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
	WarningCircleIcon,
	WarningIcon,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon } from '@phosphor-icons/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Head } from '../_components/explainer'
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
		icon: DownloadSimpleIcon,
	},
	{
		step: 'Classification',
		rule: 'Sector and type tags come from titles and metadata, not full texts. They exist to make filtering possible, and are the least authoritative part of a record.',
		status: 'Generated',
		icon: TagIcon,
	},
	{
		step: 'Plain language',
		rule: 'Stage notes and summaries written to be understood at a glance. Where a full PDF was read, the record says so.',
		status: 'Reviewed',
		icon: ChatTextIcon,
	},
	{
		step: 'Gaps',
		rule: 'Coverage windows and missing ranges are carried through, not smoothed over. Every category page states what it does not hold.',
		status: 'Disclosed',
		icon: EyeIcon,
	},
]

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
			// `resolutions` is adopted and proposed together, and journals are
			// not measures, so summing every count would add both in twice over.
			value: (
				counts.acts +
				counts.bills +
				counts['adopted-resolutions'] +
				counts['proposed-resolutions']
			).toLocaleString(),
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

			{/* Three reference blocks in the travel look (user decision): the process as four cards on the paper, the
			    inventory as a card per archive on a warm band, the sector glossary as cards on the paper again. */}
			<section className='bb-container py-[clamp(4.5rem,9vw,8rem)]'>
				<Head
					label='Process'
					title='Four steps, in order'
					lead='How a record gets here from Parliament’s archives, and what each step does to it.'
				/>
				<ol className='mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					{steps.map(({ icon: Glyph, ...item }, index) => (
						<li key={item.step}>
							<Reveal delay={index * 50} className='h-full'>
								<div className='tv-card h-full !p-6 sm:!p-7'>
									<div className='flex items-start justify-between gap-3'>
										<span className='grid size-12 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'>
											<Glyph size={24} weight='duotone' aria-hidden='true' />
										</span>
										<span className='num font-[family-name:var(--font-display)] text-[0.8125rem] font-bold text-[var(--ink-mute)]'>
											{String(index + 1).padStart(2, '0')}
										</span>
									</div>
									<p className='mt-6 font-[family-name:var(--font-display)] text-[1.25rem] font-bold tracking-[-0.015em] text-[var(--ink)]'>{item.step}</p>
									{/* What the step does to the record: a kind, in the brass, not a stage tone. */}
									<span className='badge badge-plain badge-treatment mt-3 w-fit'>{item.status}</span>
									<p className='mt-4 text-[0.9375rem] leading-[1.7] text-[var(--ink-2)]'>{item.rule}</p>
								</div>
							</Reveal>
						</li>
					))}
				</ol>
			</section>

			<section className='tv-wash'>
				<div className='bb-container py-[clamp(4.5rem,9vw,8rem)]'>
					<Head
						label='Inventory'
						title='Six archives, three captured'
						lead='Each archive Parliament publishes, what this registry holds of it, and every gap it knows about.'
					/>
					<div className='mt-10 grid gap-4'>
						{datasets.map(({ category, dataset }, index) => {
							const held = dataset.records.length
							return (
								<Reveal key={category.slug} delay={index * 50}>
									<div className='grid gap-5 rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-6 sm:p-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_8rem] lg:items-start lg:gap-10'>
										<div className='min-w-0'>
											<Link href={category.href} className='reg-archive-title hover:text-[var(--accent)]'>
												{category.officialLabel}
											</Link>
											{/* A coverage range is a figure, not a sentence, so it takes the interface face. */}
											<p className='font-title mt-2 text-[0.8125rem] text-[var(--ink-3)]'>{dataset.metadata.coverage}</p>
											{held > 0 ? (
												<Link href={category.href} className='dv-pill mt-5 !px-3.5 !py-1.5 !text-[0.8125rem]'>
													Browse them <ArrowRightIcon size={13} weight='bold' aria-hidden='true' className='text-[var(--accent)]' />
												</Link>
											) : null}
										</div>

										<div className='min-w-0'>
											{dataset.metadata.knownGaps.length > 0 ? (
												<ul className='grid gap-2.5'>
													{dataset.metadata.knownGaps.map((gap, gapIndex) => (
														<li key={gapIndex} className='flex gap-3 text-[0.9375rem] leading-[1.7] text-[var(--ink-2)]'>
															<WarningCircleIcon size={18} weight='duotone' aria-hidden='true' className='mt-1 shrink-0 text-[var(--brass)]' />
															<span>{gap}</span>
														</li>
													))}
												</ul>
											) : (
												<p className='flex gap-3 text-[0.9375rem] leading-[1.7] text-[var(--ink-3)]'>
													<CheckCircleIcon size={18} weight='duotone' aria-hidden='true' className='mt-1 shrink-0 text-[var(--tone-done-fg)]' />
													No gaps recorded for this dataset.
												</p>
											)}
										</div>

										<div className='lg:text-right'>
											<p className='num font-[family-name:var(--font-display)] text-[2.25rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'>
												{held > 0 ? held.toLocaleString() : '—'}
											</p>
											<p className='mt-1.5 text-[0.75rem] text-[var(--ink-3)]'>{held > 0 ? 'records held' : 'not captured'}</p>
										</div>
									</div>
								</Reveal>
							)
						})}
					</div>
				</div>
			</section>

			<section className='bb-container py-[clamp(4.5rem,9vw,8rem)]'>
				<Head
					label='Sector glossary'
					title='What each tag actually means'
					lead='Sectors are analytical labels applied to help you filter. They are not part of the official record. A measure can carry more than one. When a tag and the official title disagree, the title wins.'
				/>
				<div className='mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
					{sectors.map(([value, { label, count }], index) => {
						const SectorIcon = sectorIcons[value] ?? TagIcon
						return (
							<Reveal key={value} delay={Math.min(index, 8) * 40} className='h-full'>
								<div className='tv-card h-full !p-6'>
									<div className='flex items-start justify-between gap-3'>
										<span className='grid size-11 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_9%,transparent)] text-[var(--accent)]'>
											<SectorIcon size={22} weight='duotone' aria-hidden='true' />
										</span>
										<span className='num rounded-full bg-[var(--paper-2)] px-2.5 py-1 text-[0.75rem] font-semibold text-[var(--ink-2)]'>
											{count.toLocaleString()}
										</span>
									</div>
									<h3 className='mt-5 font-[family-name:var(--font-display)] text-[1.0625rem] font-bold leading-snug tracking-[-0.01em] text-[var(--ink)]'>{label}</h3>
									<p className='mt-2 text-[0.9375rem] leading-[1.7] text-[var(--ink-3)]'>
										{sectorDefinitions[value] ?? 'A grouping label applied during classification. Check the official title for the exact scope.'}
									</p>
								</div>
							</Reveal>
						)
					})}
				</div>
			</section>
		</>
	)
}
