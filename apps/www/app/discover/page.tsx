import { SiteHeader } from '../_components/site-header'
import { discoverBarmmTopics, type DiscoverBarmmDetailCard, type DiscoverBarmmPeopleGroup } from '../_components/discover-barmm-data'
import { DiscoverHashScroll } from '../_components/discover-hash-scroll'

const historyMilestones = [
	{
		label: 'Identity',
		title: 'A people with a distinct public memory',
		description:
			'The Bangsamoro story starts with communities whose histories, faith traditions, customary institutions, and political aspirations shaped a long demand for meaningful self-governance.',
	},
	{
		label: 'Peace Process',
		title: 'From conflict to negotiated autonomy',
		description: "The region's modern institutions are tied to years of peace negotiations, organizing, public consultation, and the effort to move from armed conflict toward a political settlement.",
	},
	{
		label: '2019',
		title: 'Organic Law, plebiscite, and transition',
		description: 'The Bangsamoro Organic Law was ratified in January 2019. A two-part plebiscite shaped the new region, which replaced ARMM and began the transition into BARMM.',
	},
]

export default function DiscoverBarmmPage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<DiscoverHashScroll />
			<SiteHeader activeItem='discover' />

			<section className='relative overflow-hidden border-b border-[var(--ink)]'>
				<div
					className='absolute inset-0 opacity-70'
					aria-hidden='true'
				>
					<div className='absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_right,var(--rule-soft)_1px,transparent_1px),linear-gradient(to_bottom,var(--rule-soft)_1px,transparent_1px)] bg-[size:72px_72px] sm:bg-[size:96px_96px]' />
				</div>

				<div className='relative mx-auto max-w-7xl px-12 py-16 sm:py-20 lg:py-32'>
					<p className='eyebrow'>Bangsamoro primer</p>
					<h1 className='mt-4 max-w-6xl text-5xl font-extrabold leading-[0.92] tracking-[-0.04em] sm:mt-5 sm:text-7xl md:text-8xl lg:text-[8.5rem] xl:text-[9rem]'>The Story of Bangsamoro.</h1>
					<p className='mt-6 max-w-3xl text-base leading-6 text-[var(--ink-2)] sm:mt-8 sm:text-lg sm:leading-7 lg:text-xl lg:leading-snug'>
						Start with the region: its history, cultures, institutions, and places. This is a growing, source-backed public guide for readers who want context before reading budgets, bills, and source
						records.
					</p>
				</div>
			</section>

			<section className='mx-auto max-w-7xl px-12 py-16 sm:py-20 lg:py-24'>
				<div className='grid border-y border-[var(--ink)] sm:grid-cols-2 lg:grid-cols-4'>
					{discoverBarmmTopics.map((topic, index) => (
						<a
							key={topic.slug}
							href={`#${topic.slug}`}
							className='group border-b border-[var(--rule)] p-5 text-[var(--ink)] transition hover:bg-[var(--paper-2)] last:border-b-0 sm:border-r sm:p-6 sm:[&:nth-child(2n)]:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(4n)]:border-r-0'
						>
							<div className='flex items-center justify-between gap-4'>
								<p className='eyebrow'>
									0{index + 1} / {topic.label}
								</p>
							</div>
							<h2 className='mt-5 text-2xl font-extrabold tracking-[-0.02em]'>{topic.navTitle ?? topic.title}</h2>
							<p className='mt-3 text-sm leading-snug text-[var(--ink-2)] lg:min-h-28'>{topic.description}</p>
						</a>
					))}
				</div>
			</section>

			<section
				id='history'
				className='discover-dark-section scroll-mt-28'
			>
				<div className='mx-auto max-w-7xl px-12 py-20 sm:py-24 lg:py-32'>
					<div className='border-b border-[var(--rule)]'>
						<div className='border-b border-[var(--rule)] pb-16'>
							<p className='eyebrow'>01 / History</p>
							<h2 className='mt-5 max-w-4xl text-4xl font-extrabold leading-none tracking-[-0.03em] sm:text-5xl lg:text-6xl'>A region formed through identity, peace, and public choice.</h2>
							<p className='mt-6 max-w-4xl text-sm leading-6 text-[var(--ink-2)] sm:text-base sm:leading-snug'>
								Before the budgets, offices, laws, and public services, BARMM has a story: a long struggle for recognition, a peace process, an organic law, a public vote, and the work of building
								institutions that can serve a diverse region.
							</p>
						</div>
						<div className='grid lg:grid-cols-3'>
							{historyMilestones.map((milestone, index) => (
								<div
									key={milestone.label}
									className='border-b border-[var(--rule)] p-5 last:border-b-0 sm:p-6 lg:border-b-0 lg:border-r lg:last:border-r-0'
								>
									<p className='inline-block w-fit bg-[var(--accent)] px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-white'>0{index + 1}</p>
									<p className='mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>{milestone.label}</p>
									<h3 className='mt-5 text-2xl font-extrabold leading-tight! tracking-[-0.02em]'>{milestone.title}</h3>
									<p className='mt-2 text-sm leading-snug text-[var(--ink-2)]'>{milestone.description}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			<section>
				{discoverBarmmTopics.slice(1).map((topic, topicIndex) => {
					const isDarkSection = topic.slug === 'people'

					return (
						<section
							key={topic.slug}
							id={topic.slug}
							className={`scroll-mt-28 ${isDarkSection ? 'discover-dark-section' : ''}`}
						>
							<div className={`mx-auto max-w-7xl px-12 py-20 sm:py-24 lg:py-32`}>
								<div className='border-b border-[var(--ink)]'>
									<div className='border-b border-[var(--rule)] pb-10'>
										<p className='eyebrow'>
											0{topicIndex + 2} / {topic.label}
										</p>
										<h2 className='mt-5 max-w-4xl text-4xl font-extrabold leading-none tracking-[-0.03em] sm:text-5xl lg:text-6xl'>{topic.title}</h2>
										<p className='mt-6 max-w-4xl text-sm leading-6 text-[var(--ink-2)] sm:text-base sm:leading-snug'>{topic.description}</p>
									</div>
									<div>
										<div className='grid border-b border-[var(--rule)] py-5 sm:py-6 lg:grid-cols-[0.35fr_1fr] lg:gap-10'>
											<p className='eyebrow'>Source notes</p>
											<p className='mt-4 text-sm leading-6 text-[var(--ink-2)] sm:text-base sm:leading-snug lg:mt-0'>{topic.sections.join(' ')}</p>
										</div>
										{topic.detailCards ? (
											<div className='mt-16 sm:mt-20 lg:mt-24'>
												<DetailCards
													cards={topic.detailCards}
													eyebrow={topic.detailEyebrow}
													title={topic.detailTitle}
													description={topic.detailDescription}
												/>
											</div>
										) : null}
										{topic.peopleGroups ? (
											<div className='mt-16 sm:mt-20 lg:mt-24'>
												<PeopleGroups groups={topic.peopleGroups} />
											</div>
										) : null}

										<div className='border-t border-[var(--rule)] py-5'>
											<p className='text-sm leading-6 text-[var(--ink-2)] sm:leading-snug'>
												<span className='font-semibold text-[var(--ink)]'>References: </span>
												{topic.references.map((reference, index) => (
													<span key={reference.href}>
														{index > 0 ? ', ' : null}
														<a
															href={reference.href}
															target='_blank'
															rel='noreferrer'
															className='rule-link'
														>
															{reference.label}
														</a>
													</span>
												))}
											</p>
										</div>
									</div>
								</div>
							</div>
						</section>
					)
				})}
			</section>
		</main>
	)
}

function DetailCards({
	cards,
	eyebrow = 'What to notice',
	title = 'Places, food, and heritage markers',
	description = 'These cards point to recognizable entry points into BARMM: sacred landmarks, city sites, island landscapes, food traditions, and living craft.',
}: {
	cards: DiscoverBarmmDetailCard[]
	eyebrow?: string
	title?: string
	description?: string
}) {
	const desktopLastRowStart = cards.length - ((cards.length - 1) % 3)
	const tabletLastRowStart = cards.length - ((cards.length - 1) % 2)

	return (
		<div>
			<div className='border-b border-[var(--rule)] pb-10'>
				<p className='eyebrow'>{eyebrow}</p>
				<h3 className='mt-4 max-w-4xl text-3xl font-extrabold leading-none tracking-[-0.03em] sm:text-4xl lg:text-5xl'>{title}</h3>
				<p className='mt-5 max-w-4xl text-sm leading-6 text-[var(--ink-2)] sm:text-base sm:leading-snug'>{description}</p>
			</div>
			<div className='grid sm:grid-cols-2 lg:grid-cols-3'>
				{cards.map((card, index) => {
					const itemNumber = index + 1
					const isLastItem = itemNumber === cards.length
					const isDesktopLastRow = itemNumber >= desktopLastRowStart
					const isDesktopRowEnd = itemNumber % 3 === 0
					const isTabletLastRow = itemNumber >= tabletLastRowStart
					const isTabletRowEnd = itemNumber % 2 === 0

					return (
						<article
							key={`${card.label}-${card.title}`}
							className={`flex flex-col border-[var(--rule)] p-5 transition hover:bg-[var(--paper-2)] sm:p-6 ${isLastItem ? '' : 'border-b'} ${isTabletLastRow ? 'sm:border-b-0' : 'sm:border-b'} ${isTabletRowEnd ? 'sm:border-r-0' : 'sm:border-r'} ${isDesktopLastRow ? 'lg:border-b-0' : 'lg:border-b'} ${isDesktopRowEnd ? 'lg:border-r-0' : 'lg:border-r'}`}
						>
							<p className='eyebrow'>{card.label}</p>
							{card.value ? <p className='mt-5 text-3xl font-extrabold leading-none tracking-[-0.03em] sm:text-4xl'>{card.value}</p> : null}
							<h4 className='mt-5 text-xl font-extrabold leading-tight! tracking-[-0.02em]'>{card.title}</h4>
							<p className='mt-3 text-sm leading-snug text-[var(--ink-2)]'>{card.description}</p>
							{card.href ? (
								<div className='mt-auto pt-6'>
									<a
										href={card.href}
										target='_blank'
										rel='noreferrer'
										className='flex items-center justify-between gap-4 border-t border-[var(--rule-soft)] pt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)] transition hover:text-[var(--accent)]'
									>
										<span>{card.sourceLabel ?? 'Source'}</span>
										<span
											aria-hidden='true'
											className='text-sm leading-none'
										>
											&rarr;
										</span>
									</a>
								</div>
							) : null}
						</article>
					)
				})}
			</div>
		</div>
	)
}

function PeopleGroups({ groups }: { groups: DiscoverBarmmPeopleGroup[] }) {
	return (
		<div>
			<div className='border-b border-[var(--rule)] pb-10'>
				<p className='eyebrow'>People and communities</p>
				<h3 className='mt-4 max-w-4xl text-3xl font-extrabold leading-none tracking-[-0.03em] sm:text-4xl lg:text-5xl'>Groups listed by BCPCH</h3>
				<p className='mt-5 max-w-4xl text-sm leading-6 text-[var(--ink-2)] sm:text-base sm:leading-snug'>
					The{' '}
					<a
						href='https://bcpch.bangsamoro.gov.ph/'
						target='_blank'
						rel='noreferrer'
						className='rule-link'
					>
						Bangsamoro Commission for the Preservation of Cultural Heritage
					</a>{' '}
					(BCPCH) is the regional body that documents, preserves, and promotes Bangsamoro cultural heritage. Its Bangsamoro People page groups the region's communities into Islamized ethnolinguistic
					groups, Indigenous peoples, and settler communities. Each note below is written as a short public guide and points back to BCPCH where a source page is available.
				</p>
			</div>

			{groups.map((group, groupIndex) => {
				const desktopLastRowStart = group.people.length - ((group.people.length - 1) % 3)
				const tabletLastRowStart = group.people.length - ((group.people.length - 1) % 2)

				return (
					<section
						key={group.category}
						className={groupIndex > 0 ? 'border-t border-[var(--rule)]' : ''}
					>
						<div className='grid lg:grid-cols-[0.75fr_1.25fr]'>
							<div className='border-b border-[var(--rule)] py-5 lg:border-b-0 lg:border-r lg:py-6 lg:pr-6'>
								<p className='eyebrow'>{group.category}</p>
								<p className='mt-5 text-sm leading-snug text-[var(--ink-2)]'>{group.description}</p>
							</div>
							<div className='grid sm:grid-cols-2 lg:grid-cols-3'>
								{group.people.map((person, index) => {
									const itemNumber = index + 1
									const isLastItem = itemNumber === group.people.length
									const isDesktopLastRow = itemNumber >= desktopLastRowStart
									const isDesktopRowEnd = itemNumber % 3 === 0
									const isTabletLastRow = itemNumber >= tabletLastRowStart
									const isTabletRowEnd = itemNumber % 2 === 0

									return (
										<article
											key={person.name}
											className={`flex flex-col border-[var(--rule)] p-5 transition hover:bg-[var(--paper-2)] sm:p-6 ${isLastItem ? '' : 'border-b'} ${isTabletLastRow ? 'sm:border-b-0' : 'sm:border-b'} ${isTabletRowEnd ? 'sm:border-r-0' : 'sm:border-r'} ${isDesktopLastRow ? 'lg:border-b-0' : 'lg:border-b'} ${isDesktopRowEnd ? 'lg:border-r-0' : 'lg:border-r'}`}
										>
											<p className='inline-block w-fit self-start bg-[var(--accent)] px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-white'>
												{String(itemNumber).padStart(2, '0')}
											</p>
											<h4 className='mt-5 text-xl font-extrabold tracking-[-0.02em]'>{person.name}</h4>
											<p className='mt-3 text-sm leading-snug text-[var(--ink-2)]'>{person.description}</p>
											{person.href ? (
												<div className='mt-auto pt-6'>
													<a
														href={person.href}
														target='_blank'
														rel='noreferrer'
														className='flex items-center justify-between gap-4 border-t border-[var(--rule-soft)] pt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)] transition hover:text-[var(--accent)]'
													>
														<span>BCPCH source</span>
														<span
															aria-hidden='true'
															className='text-sm leading-none'
														>
															&rarr;
														</span>
													</a>
												</div>
											) : null}
										</article>
									)
								})}
							</div>
						</div>
					</section>
				)
			})}
		</div>
	)
}
