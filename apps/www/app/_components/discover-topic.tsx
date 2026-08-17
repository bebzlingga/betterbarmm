import { type DiscoverBarmmDetailCard, type DiscoverBarmmPeopleGroup, type DiscoverBarmmTimelineEvent, type DiscoverBarmmTopic } from './discover-barmm-data'

export function DiscoverTopicBody({ topic }: { topic: DiscoverBarmmTopic }) {
	return (
		<div>
			<div className='max-w-3xl space-y-4 text-base leading-7 text-[var(--ink-2)] sm:text-lg sm:leading-8'>
				{topic.sections.map((section, index) => (
					<p key={index}>{section}</p>
				))}
			</div>

			{topic.timeline ? (
				<div className='mt-16 sm:mt-20 lg:mt-24'>
					<Timeline events={topic.timeline} />
				</div>
			) : null}

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

			<div className='mt-16 border-t border-[var(--rule)] pt-6 sm:mt-20'>
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
	)
}

function Timeline({ events }: { events: DiscoverBarmmTimelineEvent[] }) {
	return (
		<div>
			<div className='border-b border-[var(--rule)] pb-10'>
				<p className='eyebrow'>The story</p>
				<h3 className='mt-4 max-w-4xl text-3xl font-extrabold leading-none tracking-[-0.03em] sm:text-4xl lg:text-5xl'>From the struggle to BARMM.</h3>
				<p className='mt-5 max-w-3xl text-sm leading-6 text-[var(--ink-2)] sm:text-base sm:leading-snug'>A timeline of the milestones that shaped the Bangsamoro — from centuries-old sultanates to the first regular parliamentary election.</p>
			</div>
			<ol className='mt-10 border-l border-[var(--rule)] sm:mt-12'>
				{events.map((event, index) => (
					<li
						key={event.era + event.title}
						className='relative pb-12 pl-6 last:pb-0 sm:pl-10'
					>
						<span
							aria-hidden='true'
							className='absolute left-0 top-1.5 size-2.5 -translate-x-1/2 bg-[var(--accent)]'
						/>
						<div className='flex items-baseline gap-3'>
							<span className='font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]'>{String(index + 1).padStart(2, '0')}</span>
							<p className='font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]'>{event.era}</p>
						</div>
						<h4 className='mt-2 text-lg font-extrabold leading-tight tracking-[-0.02em] sm:text-xl'>{event.title}</h4>
						<p className='mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-2)] sm:text-base sm:leading-7'>{event.description}</p>
					</li>
				))}
			</ol>
		</div>
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
							className={`flex flex-col border-[var(--rule)] py-5 transition hover:bg-[var(--paper-2)] sm:p-6 ${isLastItem ? '' : 'border-b'} ${isTabletLastRow ? 'sm:border-b-0' : 'sm:border-b'} ${isTabletRowEnd ? 'sm:border-r-0' : 'sm:border-r'} ${isDesktopLastRow ? 'lg:border-b-0' : 'lg:border-b'} ${isDesktopRowEnd ? 'lg:border-r-0' : 'lg:border-r'}`}
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
					(BCPCH) is the regional body that documents, preserves, and promotes Bangsamoro cultural heritage. Its Bangsamoro People page groups the region&rsquo;s communities into Islamized ethnolinguistic
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
											className={`flex flex-col border-[var(--rule)] py-5 transition hover:bg-[var(--paper-2)] sm:p-6 ${isLastItem ? '' : 'border-b'} ${isTabletLastRow ? 'sm:border-b-0' : 'sm:border-b'} ${isTabletRowEnd ? 'sm:border-r-0' : 'sm:border-r'} ${isDesktopLastRow ? 'lg:border-b-0' : 'lg:border-b'} ${isDesktopRowEnd ? 'lg:border-r-0' : 'lg:border-r'}`}
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
