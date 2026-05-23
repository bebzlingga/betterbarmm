import { DevelopingStoriesTimeline, type DevelopingStoryTimelineItem } from './_components/developing-stories-timeline'
import { ElectionPageHeader } from './_components/election-page-header'
import { ElectionShell } from './_components/election-shell'
import { getDevelopingStoriesViewModel } from './_lib/developing-stories'
import { formatDate, getElectionViewModel, labelize } from './_lib/election-data'

type ElectionViewModel = ReturnType<typeof getElectionViewModel>
type Party = ElectionViewModel['parties'][number]

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
		<div className='max-w-4xl'>
			<p className='eyebrow'>{eyebrow}</p>
			<h2 className='mt-3 text-3xl font-extrabold leading-none tracking-[-0.035em] sm:text-5xl'>{title}</h2>
			<p className='mt-5 text-base leading-snug text-[var(--ink-2)] sm:text-lg sm:leading-8'>{description}</p>
		</div>
	)
}

function PartyCard({ party }: { party: Party }) {
	return (
		<article className='flex min-h-full flex-col border border-[var(--rule)] bg-[var(--paper)] p-6'>
			<div className='flex items-start justify-between gap-0'>
				<p className='eyebrow text-[9px]'>{party.party_id}</p>
				<p className='font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]'>Official entry</p>
			</div>
			<h3 className='mt-5 text-2xl font-extrabold leading-none tracking-[-0.03em]'>{party.ballot_name}</h3>
			<p className='mt-1 text-sm font-semibold leading-snug text-[var(--ink)]'>{party.full_name}</p>
			<p className='mt-3 line-clamp-5 text-sm leading-snug text-[var(--ink-2)]'>{party.description}</p>
			<div className='mt-auto grid grid-cols-3 gap-px pt-5 text-center'>
				<div className='bg-[var(--paper-2)] px-2 py-3'>
					<p className='num text-xl font-extrabold'>{party.computedStats.sectoralCandidates}</p>
					<p className='mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]'>Sectoral</p>
				</div>
				<div className='bg-[var(--paper-2)] px-2 py-3'>
					<p className='num text-xl font-extrabold'>{party.computedStats.districtCocFilers}</p>
					<p className='mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]'>District</p>
				</div>
				<div className='bg-[var(--paper-2)] px-2 py-3'>
					<p className='num text-xl font-extrabold'>{party.computedStats.legacyNominees}</p>
					<p className='mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]'>Legacy</p>
				</div>
			</div>
		</article>
	)
}

function storyYear(date?: string) {
	return date?.match(/\d{4}/)?.[0] ?? 'Now'
}

export default function Page() {
	const { election, metadata, parties, stats, timeline } = getElectionViewModel()
	const { storyTimeline } = getDevelopingStoriesViewModel()
	const developingStories: DevelopingStoryTimelineItem[] = storyTimeline.map((story) => ({
		id: story.id,
		headline: story.headline,
		deck: story.deck,
		statusLabel: labelize(story.status),
		showStatus: story.status !== 'backgrounder_ready',
		tagsLabel: story.tags?.slice(0, 3).join(' / '),
		yearLabel: storyYear(story.displayDate),
		dateLabel: story.displayDate ? formatDate(story.displayDate) : 'Monitoring',
	}))

	const structure = [
		{
			label: 'Party-representative',
			seats: stats.partyRepresentativeSeats,
			detail: 'Regional parliamentary parties compete for proportional seats in the Bangsamoro Parliament.',
		},
		{
			label: 'Single-member districts',
			seats: stats.singleMemberDistrictSeats,
			detail: 'District voters choose representatives from the current district framework.',
		},
		{
			label: 'Sectoral / reserved',
			seats: stats.sectoralOrReservedSeats,
			detail: 'Reserved seats cover sectoral representation including women, youth, settlers, ulama, traditional leaders, and NMIP.',
		},
	]

	const statCards = [
		{
			label: 'Parliament',
			value: stats.totalSeats,
			detail: 'Total seats in the current framework.',
		},
		{
			label: 'Parties',
			value: stats.regionalParties,
			detail: 'Regional party entries on the May 13, 2026 CLC.',
		},
		{
			label: 'District filers',
			value: stats.districtCocFilers,
			detail: 'Working list from district COC filer reporting.',
		},
		{
			label: 'Sectoral',
			value: stats.sectoralCandidates,
			detail: 'Extracted sectoral candidates from the regional CLC.',
		},
		{
			label: 'Majority',
			value: stats.majorityThreshold,
			detail: 'Seats needed for a parliamentary majority.',
		},
		{
			label: 'Sources',
			value: stats.sources,
			detail: 'Source records referenced by the JSON workspace.',
		},
	]

	return (
		<ElectionShell activeItem='overview'>
			<ElectionPageHeader
				eyebrow='Election workspace'
				title='A Better Bangsamoro Begins With Your Vote'
				description={`Explore the parties, districts, sectors, and timeline shaping ${election.name}, and see how each vote helps form the Bangsamoro Parliament on ${metadata.electionDay}.`}
				meta={`Generated ${metadata.generatedAt}`}
			/>

			<section className='border-b border-[var(--ink)]'>
				<div className='mx-auto grid max-w-7xl grid-cols-2 px-2 sm:px-4 md:grid-cols-4 lg:grid-cols-6'>
					{statCards.map((card, index) => (
						<StatCard
							key={card.label}
							className={statBorderClass(index)}
							{...card}
						/>
					))}
				</div>
			</section>

			<section className='border-b border-[var(--ink)] py-14 sm:py-24 lg:py-32'>
				<div className='mx-auto max-w-7xl px-6 sm:px-8'>
					<SectionHeading
						eyebrow='Ballot party entries'
						title='13 regional parliamentary party entries.'
						description='These are the regional parliamentary parties voters choose from for the party-representative seats. The party vote helps decide how the 40 regional party seats are shared in Parliament, while nominee lists determine who can fill the seats a party wins.'
					/>
					<div className='mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{parties.map((party) => (
							<PartyCard
								key={party.party_id}
								party={party}
							/>
						))}
					</div>
				</div>
			</section>

			<section className='border-b border-[var(--ink)] bg-[var(--paper-2)] py-14 sm:py-24 lg:py-32'>
				<div className='mx-auto max-w-7xl px-6 sm:px-8'>
					<div className='grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-start'>
						<div>
							<SectionHeading
								eyebrow='How the election works'
								title='One Parliament, three seat paths.'
								description='The 2026 BARMM Parliamentary Elections fill an 80-seat Parliament through party-representative seats, single-member district seats, and sectoral or reserved seats.'
							/>
							<a
								href='/how-it-works'
								className='mt-4 inline-flex border-b border-[var(--accent)] text-sm font-bold text-[var(--ink)] hover:text-[var(--accent)]'
							>
								Read how election works in BARMM
							</a>
						</div>
						<div className='grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-3'>
							{structure.map((item) => (
								<div
									key={item.label}
									className='bg-[var(--paper)] p-5'
								>
									<p className='num text-5xl font-extrabold leading-none tracking-[-0.04em]'>{item.seats}</p>
									<h3 className='mt-3 text-lg font-extrabold leading-tight tracking-[-0.03em]'>{item.label}</h3>
									<p className='mt-2 text-sm leading-snug text-[var(--ink-2)]'>{item.detail}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			<section className='border-b border-[var(--ink)] py-14 sm:py-24 lg:py-32'>
				<div className='mx-auto grid max-w-7xl gap-16 px-6 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]'>
					<SectionHeading
						eyebrow='Timeline'
						title='From transition to Election Day.'
						description='The dataset keeps postponements, Sulu exclusion notes, districting issues, the RA 12317 reset, filing dates, campaign period, and Election Day in one timeline.'
					/>
					<div className='border-t border-[var(--ink)]'>
						{timeline.slice(-7).map((event) => (
							<article
								key={`${event.date}-${event.title}`}
								className='grid gap-12 border-b border-[var(--rule)] py-5 sm:grid-cols-[9rem_1fr]'
							>
								<p className='mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]'>{formatDate(event.date)}</p>
								<div>
									<h3 className='text-xl font-extrabold leading-tight tracking-[-0.025em]'>{event.title}</h3>
									<p className='mt-2 text-sm leading-snug text-[var(--ink-2)]'>{event.description ?? event.summary ?? labelize(event.status)}</p>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className='bg-[var(--paper-2)] py-14 sm:py-24 lg:py-32'>
				<div className='mx-auto max-w-7xl px-6 sm:px-8'>
					<SectionHeading
						eyebrow='Developing stories'
						title='The election story is still moving.'
						description='Follow the legal resets, district-map disputes, candidate-list updates, and calendar milestones shaping what voters will see before Election Day.'
					/>
				</div>
				<div className='w-full'>
					<DevelopingStoriesTimeline stories={developingStories} />
				</div>
			</section>
		</ElectionShell>
	)
}
