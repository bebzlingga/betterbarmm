import { UserIcon } from '@phosphor-icons/react/ssr'
import { ElectionPageHeader } from './_components/election-page-header'
import { ElectionShell } from './_components/election-shell'
import { EventTimeline, type EventTimelineItem } from './_components/event-timeline'
import { Reveal } from './_components/reveal'
import { SectionNav } from './_components/section-nav'
import { formatDate, getElectionViewModel, getLatestNews, getTimelineViewModel, labelize } from './_lib/election-data'

function StatCard({ label, value, detail, className = '' }: { label: string; value: string | number; detail: string; className?: string }) {
	return (
		<div className={`border-[var(--rule)] px-4 py-5 sm:px-6 ${className}`}>
			<p className='eyebrow text-[9px]'>{label}</p>
			<p className='num mt-3 text-4xl font-extrabold leading-none tracking-[-0.03em] sm:text-5xl'>{value}</p>
			<p className='mt-3 text-xs leading-snug text-[var(--ink-3)]'>{detail}</p>
		</div>
	)
}

function statBorderClass(index: number) {
	const mobileLeft = index % 2 === 0 ? '' : 'border-l'
	const mdLeft = index % 4 === 0 ? 'md:border-l-0' : 'md:border-l'
	const lgLeft = index === 0 ? 'lg:border-l-0' : 'lg:border-l'

	return [mobileLeft, mdLeft, lgLeft].join(' ')
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
	return (
		<Reveal className='max-w-4xl'>
			<p className='eyebrow'>{eyebrow}</p>
			<h2 className='mt-3 text-3xl font-extrabold leading-none tracking-[-0.035em] sm:text-5xl'>{title}</h2>
			<p className='mt-5 text-base! leading-snug! text-[var(--ink-2)] sm:text-lg sm:leading-8'>{description}</p>
		</Reveal>
	)
}

function ExplainerBlock({
	number,
	title,
	action,
	color = 'var(--accent)',
	children,
}: {
	number: string
	title: string
	action?: string
	color?: string
	children: React.ReactNode
}) {
	return (
		<Reveal>
			<article className='border-t border-[var(--rule)] py-12 sm:py-14'>
				<div className='grid gap-5 sm:grid-cols-[5rem_1fr] md:grid-cols-[7rem_1fr]'>
					<p
						className='num text-5xl font-extrabold leading-none tracking-[-0.04em] sm:text-6xl'
						style={{ color }}
					>
						{number}
					</p>
					<div>
						<div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
							<h3 className='text-2xl font-extrabold leading-none tracking-[-0.035em] sm:text-4xl'>{title}</h3>
							{action ? (
								<span
									className='shrink-0 border-l-2 pl-2 font-mono text-[9px] font-bold uppercase leading-tight tracking-[0.14em] text-[var(--ink-3)]'
									style={{ borderColor: color }}
								>
									{action}
								</span>
							) : null}
						</div>
						<div className='mt-5 space-y-4 text-base leading-snug text-[var(--ink-2)] sm:text-lg sm:leading-8'>{children}</div>
					</div>
				</div>
			</article>
		</Reveal>
	)
}

function storyYear(date?: string) {
	return date?.match(/\d{4}/)?.[0] ?? 'Now'
}

export default function Page() {
	const { election, metadata, stats } = getElectionViewModel()
	const { events } = getTimelineViewModel()
	const timelineItems: EventTimelineItem[] = events.map((event) => ({
		id: `${event.date}-${event.title}`,
		yearLabel: storyYear(event.date),
		dateLabel: formatDate(event.date),
		kicker: labelize(event.event_type),
		title: event.title,
		body: event.description ?? event.summary ?? '',
	}))

	const statCards = [
		{ label: 'Parliament', value: stats.totalSeats, detail: 'Total seats in the current framework.' },
		{ label: 'Parties', value: stats.regionalParties, detail: 'Regional party entries on the May 13, 2026 CLC.' },
		{ label: 'District filers', value: stats.districtCocFilers, detail: 'Working list from district COC filer reporting.' },
		{ label: 'Sectoral', value: stats.sectoralCandidates, detail: 'Extracted sectoral candidates from the regional CLC.' },
		{ label: 'Majority', value: stats.majorityThreshold, detail: 'Seats needed for a parliamentary majority.' },
		{ label: 'Sources', value: stats.sources, detail: 'Source records referenced by the workspace.' },
	]

	const seatPaths = [
		{ key: 'party', seats: stats.partyRepresentativeSeats, label: 'Party-representative', color: 'var(--accent)' },
		{ key: 'district', seats: stats.singleMemberDistrictSeats, label: 'Single-member district', color: 'var(--slate)' },
		{ key: 'sectoral', seats: stats.sectoralOrReservedSeats, label: 'Sectoral & reserved', color: 'var(--ochre)' },
	]
	const seatDots = seatPaths.flatMap((path) => Array.from({ length: path.seats }, () => path.color))
	const latestNews = getLatestNews(10)

	return (
		<ElectionShell activeItem='overview'>
			<ElectionPageHeader
				eyebrow='Election workspace'
				title='A Better Bangsamoro Begins With Your Vote'
				description={`Explore the parties, districts, sectors, and timeline shaping ${election.name}, and see how each vote helps form the Bangsamoro Parliament on ${metadata.electionDay}.`}
				meta={`Generated ${metadata.generatedAt}`}
			/>

			<section className='border-b border-[var(--rule)]'>
				<Reveal>
					<div className='mx-auto grid max-w-7xl grid-cols-2 px-2 sm:px-4 md:grid-cols-4 lg:grid-cols-6'>
						{statCards.map((card, index) => (
							<StatCard
								key={card.label}
								className={statBorderClass(index)}
								{...card}
							/>
						))}
					</div>
				</Reveal>
			</section>

			<section className='border-b border-[var(--rule)] bg-[var(--accent)] text-white'>
				<div className='mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8'>
					<div>
						<p className='font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-soft)]'>Voter guide</p>
						<h2 className='mt-2 text-2xl font-extrabold leading-none tracking-[-0.03em] sm:text-3xl'>See the parties, candidates, and your ballot.</h2>
					</div>
					<a
						href='/ballot'
						className='inline-flex w-fit shrink-0 items-center border border-white px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-[var(--accent)]'
					>
						Open your ballot →
					</a>
				</div>
			</section>

			<SectionNav
				items={[
					{ id: 'how', label: 'How it works' },
					{ id: 'timeline', label: 'Timeline' },
					{ id: 'news', label: 'Latest news' },
				]}
			/>

			<section
				id='how'
				className='scroll-mt-32 border-b border-[var(--rule)] py-16 sm:py-24 lg:py-28'
			>
				<div className='mx-auto max-w-7xl px-6 sm:px-8'>
					<SectionHeading
						eyebrow='How the election works'
						title='One Parliament, three seat paths.'
						description='BARMM elects an 80-seat Parliament through 40 party-representative seats, 32 single-member district seats, and 8 sectoral or reserved seats. A parliamentary majority is 41 seats.'
					/>

					<Reveal className='mt-10 border border-[var(--rule)] bg-[var(--paper-2)] p-6 sm:p-8'>
						<div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1'>
							<p className='font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]'>Composition of the {stats.totalSeats}-seat Parliament</p>
							<p className='font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]'>Majority = {stats.majorityThreshold}</p>
						</div>
						<div
							className='mt-4 flex flex-wrap gap-1'
							role='img'
							aria-label={`${stats.totalSeats}-seat Parliament: ${seatPaths.map((p) => `${p.seats} ${p.label}`).join(', ')}`}
						>
							{seatDots.map((color, index) => (
								<UserIcon
									key={index}
									weight='fill'
									color={color}
									className='size-5 sm:size-6'
								/>
							))}
						</div>
						<div className='mt-5 grid gap-4 sm:grid-cols-3'>
							{seatPaths.map((path) => (
								<div
									key={path.key}
									className='border-t-2 pt-3'
									style={{ borderColor: path.color }}
								>
									<p className='num text-2xl font-extrabold leading-none tracking-[-0.03em]'>
										{path.seats}
										<span className='ml-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]'>of {stats.totalSeats}</span>
									</p>
									<p className='mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]'>{path.label}</p>
								</div>
							))}
						</div>
					</Reveal>

					<div className='mt-10'>
						<ExplainerBlock
							number='40'
							title='Party-representative seats'
							action='You choose one party'
							color='var(--accent)'
						>
							<p>
								A voter chooses one registered regional party or coalition for this track. The vote is for the party, and the party earns seats based on its share of the party-representation vote.
								Once a party wins seats, those seats are filled from its nominee list.
							</p>
						</ExplainerBlock>

						<ExplainerBlock
							number='32'
							title='Single-member district seats'
							action='You choose one candidate'
							color='var(--slate)'
						>
							<p>A voter chooses one named candidate in the voter&rsquo;s parliamentary district. The winner represents that place in the same 80-member Parliament as party and sectoral representatives.</p>
							<div className='mt-6 grid grid-cols-2 gap-px bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-4'>
								{election.district_seat_distribution_current_framework.map((item) => (
									<div
										key={item.constituency}
										className='bg-[var(--paper-2)] px-3 py-5 text-center'
									>
										<p className='num text-2xl font-extrabold leading-none'>{item.seats}</p>
										<h4 className='mt-3 font-mono text-[8px] font-bold uppercase leading-snug tracking-[0.18em] text-[var(--ink-3)]'>{item.constituency}</h4>
									</div>
								))}
							</div>
						</ExplainerBlock>

						<ExplainerBlock
							number='8'
							title='Sectoral and reserved seats'
							action='Reserved seats'
							color='var(--ochre)'
						>
							<p>Reserved seats guarantee representation for specific communities and sectors — Non-Moro Indigenous Peoples, settler communities, women, youth, traditional leaders, and ulama.</p>
							<div className='mt-6 grid grid-cols-2 gap-px bg-[var(--rule)] sm:grid-cols-3 lg:grid-cols-6'>
								{election.sectoral_seat_distribution.map((item) => (
									<div
										key={item.sector}
										className='bg-[var(--paper-2)] px-3 py-5 text-center'
									>
										<p className='num text-2xl font-extrabold leading-none'>{item.seats}</p>
										<h4 className='mt-3 font-mono text-[8px] font-bold uppercase leading-snug tracking-[0.18em] text-[var(--ink-3)]'>{item.sector}</h4>
									</div>
								))}
							</div>
						</ExplainerBlock>
					</div>

					<Reveal className='mt-16 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16'>
						<div>
							<p className='eyebrow'>Government formation</p>
							<h3 className='mt-3 text-2xl font-extrabold leading-none tracking-[-0.035em] sm:text-3xl'>How the Chief Minister is elected.</h3>
							<p className='mt-4 text-base leading-snug text-[var(--ink-2)] sm:leading-8'>
								Voters elect the 80 Members of Parliament. On the first day of session, members elect the Chief Minister by a majority vote of all members ({stats.majorityThreshold}). If no one reaches
								the majority, Parliament holds a runoff between the top two.
							</p>
							<p className='mt-4 font-mono text-[10px] font-semibold uppercase leading-5 tracking-[0.16em] text-[var(--ink-3)]'>
								Source:{' '}
								<a
									href='https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/92699'
									target='_blank'
									rel='noreferrer'
									className='border-b border-[var(--accent)] text-[var(--ink)] transition-colors hover:text-[var(--accent)]'
								>
									RA 11054, Art. VII, Secs. 30-35
								</a>
							</p>
						</div>
						<div className='flex flex-col justify-center'>
							<div className='flex items-baseline justify-between gap-4 border-b border-[var(--rule)] pb-4'>
								<p className='eyebrow'>Parliament vote</p>
								<p className='num text-2xl font-extrabold leading-none tracking-[-0.03em] sm:text-3xl'>
									{stats.majorityThreshold}
									<span className='ml-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]'>of {stats.totalSeats} needed</span>
								</p>
							</div>
							<div
								className='mt-6 flex flex-wrap gap-1'
								role='img'
								aria-label={`${stats.majorityThreshold} of ${stats.totalSeats} parliament seats make up the majority needed to elect the Chief Minister`}
							>
								{Array.from({ length: stats.totalSeats }).map((_, index) => (
									<UserIcon
										key={index}
										weight='fill'
										color={index < stats.majorityThreshold ? 'var(--accent)' : 'var(--rule)'}
										className='size-5 sm:size-6'
									/>
								))}
							</div>
							<div className='mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em]'>
								<span className='flex items-center gap-2'>
									<UserIcon
										weight='fill'
										color='var(--accent)'
										className='size-4 shrink-0'
										aria-hidden='true'
									/>
									Majority to elect ({stats.majorityThreshold})
								</span>
								<span className='flex items-center gap-2 text-[var(--ink-3)]'>
									<UserIcon
										weight='fill'
										color='var(--rule)'
										className='size-4 shrink-0'
										aria-hidden='true'
									/>
									Remaining seats
								</span>
							</div>
							<div className='mt-8 grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2'>
								<div className='bg-[var(--paper)] p-5'>
									<p className='font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]'>If majority</p>
									<p className='mt-2 text-base font-bold leading-snug tracking-[-0.01em]'>A member with {stats.majorityThreshold}+ votes becomes Chief Minister.</p>
								</div>
								<div className='bg-[var(--paper)] p-5'>
									<p className='font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]'>If no majority</p>
									<p className='mt-2 text-base font-bold leading-snug tracking-[-0.01em]'>Parliament holds a runoff between the top two.</p>
								</div>
							</div>
						</div>
					</Reveal>
				</div>
			</section>

			<section
				id='timeline'
				className='scroll-mt-32 bg-[var(--paper-2)] py-16 sm:py-24 lg:py-28'
			>
				<div className='mx-auto max-w-7xl px-6 sm:px-8'>
					<SectionHeading
						eyebrow='Timeline'
						title='From transition to Election Day.'
						description='The legal foundations, the postponements and resets, and the road to the September 14, 2026 vote — all in one place.'
					/>
				</div>
				<div className='w-full'>
					<EventTimeline items={timelineItems} />
				</div>
			</section>

			<section
				id='news'
				className='scroll-mt-32 border-t border-[var(--rule)] py-16 sm:py-24 lg:py-28'
			>
				<div className='mx-auto max-w-7xl px-6 sm:px-8'>
					<SectionHeading
						eyebrow='Latest news'
						title='Follow the election as it unfolds.'
						description='The most recent reporting tracked in this workspace, newest first. Each headline links to the original source.'
					/>
					<div className='mt-10 border-t border-[var(--rule)]'>
						{latestNews.map((item) => (
							<Reveal key={item.id}>
								<a
									href={item.url ?? `/about#${item.id}`}
									target={item.url ? '_blank' : undefined}
									rel={item.url ? 'noreferrer' : undefined}
									className='group flex items-center gap-4 border-b border-[var(--rule)] py-6 transition-colors hover:bg-[var(--paper-2)] sm:gap-6'
								>
									<div className='grid min-w-0 flex-1 gap-2 sm:grid-cols-[10rem_1fr] sm:gap-6'>
										<div className='flex items-baseline gap-3 sm:flex-col sm:gap-1.5'>
											<p className='num font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]'>{formatDate(item.date)}</p>
											{item.publisher ? (
												<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>{item.publisher}</p>
											) : null}
										</div>
										<div className='min-w-0'>
											<h3 className='text-lg font-bold leading-tight tracking-[-0.01em] transition-colors group-hover:text-[var(--accent)] sm:text-xl'>
												{item.title}
											</h3>
											{item.summary ? (
												<p className='mt-1.5 line-clamp-2 text-sm leading-snug text-[var(--ink-2)]'>{item.summary}</p>
											) : null}
										</div>
									</div>
									<span
										aria-hidden='true'
										className='shrink-0 font-mono text-lg text-[var(--ink-3)] transition duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
									>
										→
									</span>
								</a>
							</Reveal>
						))}
					</div>
				</div>
			</section>
		</ElectionShell>
	)
}
