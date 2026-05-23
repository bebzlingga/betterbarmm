import { ElectionPageHeader } from '../_components/election-page-header'
import { ElectionShell } from '../_components/election-shell'
import { formatDate, getElectionViewModel, labelize } from '../_lib/election-data'

function ExplainerBlock({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
	return (
		<article className='border-t border-[var(--rule)] py-12 sm:py-16'>
			<div className='grid gap-5 sm:grid-cols-[5rem_1fr] md:grid-cols-[7rem_1fr]'>
				<p className='num text-5xl font-extrabold leading-none tracking-[-0.04em] text-[var(--accent)] sm:text-6xl'>{number}</p>
				<div>
					<h2 className='text-2xl font-extrabold leading-none tracking-[-0.035em] sm:text-4xl'>{title}</h2>
					<div className='mt-5 space-y-4 text-base leading-snug text-[var(--ink-2)] sm:text-lg sm:leading-8'>{children}</div>
				</div>
			</div>
		</article>
	)
}

export default function HowItWorksPage() {
	const { election, metadata, stats, dataQuality } = getElectionViewModel()
	const keyDates = election.key_dates

	const dates = [
		{
			label: 'COC and nominee-list filing',
			value: `${formatDate(keyDates.filing_of_cocs_and_nominee_lists.start)} to ${formatDate(keyDates.filing_of_cocs_and_nominee_lists.end)}`,
		},
		{
			label: 'Regional CLC generated',
			value: formatDate(keyDates.regional_clc_generated),
		},
		{
			label: 'Election period starts',
			value: formatDate(keyDates.election_period_start),
		},
		{
			label: 'Campaign period',
			value: `${formatDate(keyDates.campaign_period.start)} to ${formatDate(keyDates.campaign_period.end)}`,
		},
		{
			label: 'Election Day',
			value: metadata.electionDay,
		},
	]

	return (
		<ElectionShell activeItem='how'>
			<ElectionPageHeader
				eyebrow='Election explainer'
				title='How the BARMM parliamentary election works.'
				description='A plain-language guide to the 2026 BARMM Parliamentary Elections: what voters are choosing, how the seats are structured, and which dataset fields need careful handling.'
				meta={`${stats.totalSeats} seats / ${stats.majorityThreshold} majority`}
			/>

			<section className='border-b border-[var(--ink)] py-14 sm:pt-24 sm:pb-20 lg:pt-32'>
				<div className='mx-auto max-w-7xl px-6 sm:px-8'>
					<div className='max-w-4xl'>
						<p className='eyebrow'>The short version</p>
						<h2 className='mt-3 text-3xl font-extrabold leading-none tracking-[-0.035em] sm:text-5xl'>BARMM elects an 80-seat Parliament through three tracks.</h2>
						<p className='mt-5 text-base leading-snug text-[var(--ink-2)] sm:text-lg sm:leading-8'>
							The election fills Members of the Bangsamoro Parliament. The current framework has 40 party-representative seats, 32 single-member district seats, and 8 sectoral or reserved seats. A
							parliamentary majority is 41 seats.
						</p>
					</div>

					<div className='mt-12'>
						<ExplainerBlock
							number='40'
							title='Party-representative seats'
						>
							<p>
								Party-representative seats are the proportional side of the Bangsamoro Parliament. A voter chooses a registered regional parliamentary political party or coalition for this track; the
								vote is for the party, and the party earns seats based on its share of the party-representation vote under the Bangsamoro Electoral Code.
							</p>
							<p>
								Once a party wins seats, those seats are filled from its nominee list. That makes the party ballot entry and the nominee list related but different records: one determines how many
								seats the party receives, while the other identifies the people who can occupy those seats.
							</p>
						</ExplainerBlock>

						<ExplainerBlock
							number='32'
							title='Single-member district seats'
						>
							<p>
								Single-member district seats are the constituency side of the Parliament. A voter chooses one named candidate in the voter's parliamentary district, and the winner represents that
								place in the same 80-member Parliament as party and sectoral representatives.
							</p>
							<p>
								The district vote does not allocate party-representative seats. It gives each apportioned area its own local Member of Parliament, so geographic representation sits beside the
								region-wide party vote.
							</p>
							<div className='mt-12 grid grid-cols-2 gap-px bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-4'>
								{election.district_seat_distribution_current_framework.map((item) => (
									<div
										key={item.constituency}
										className='bg-[var(--paper-2)] px-3 py-5 text-center'
									>
										<p className='num text-2xl font-extrabold leading-none'>{item.seats}</p>
										<h3 className='mt-3 font-mono text-[8px] font-bold uppercase leading-snug tracking-[0.18em] text-[var(--ink-3)]'>{item.constituency}</h3>
									</div>
								))}
							</div>
							{election.district_seat_distribution_current_framework.some((item) => item.note) ? (
								<div className='mt-4 space-y-2 font-mono text-[9px] font-semibold uppercase leading-5 tracking-[0.14em] text-[var(--ink-3)]'>
									{election.district_seat_distribution_current_framework
										.filter((item) => item.note)
										.map((item) => (
											<p key={item.constituency}>
												<span className='text-[var(--ink)]'>{item.constituency}:</span> {item.note}
											</p>
										))}
								</div>
							) : null}
						</ExplainerBlock>

						<ExplainerBlock
							number='8'
							title='Sectoral and reserved seats'
						>
							<p>
								Sectoral and reserved seats are designed to guarantee representation for specific communities and sectors that may not be represented through party or district competition alone. In
								the current framework, the eight seats cover Non-Moro Indigenous Peoples, settler communities, women, youth, traditional leaders, and ulama.
							</p>
							<p>
								This track is organized around the sector being represented rather than an ordinary geographic district. The seat belongs to the sector's representation in Parliament, which is why
								candidates are grouped by sector in the election workspace.
							</p>
							<div className='mt-12 grid grid-cols-2 gap-px bg-[var(--rule)] sm:grid-cols-3 lg:grid-cols-6'>
								{election.sectoral_seat_distribution.map((item) => (
									<div
										key={item.sector}
										className='bg-[var(--paper-2)] px-3 py-5 text-center'
									>
										<p className='num text-2xl font-extrabold leading-none'>{item.seats}</p>
										<h3 className='mt-3 font-mono text-[8px] font-bold uppercase leading-snug tracking-[0.18em] text-[var(--ink-3)]'>{item.sector}</h3>
									</div>
								))}
							</div>
							{election.sectoral_seat_distribution.some((item) => item.note) ? (
								<div className='mt-4 space-y-2 font-mono text-[9px] font-semibold uppercase leading-5 tracking-[0.14em] text-[var(--ink-3)]'>
									{election.sectoral_seat_distribution
										.filter((item) => item.note)
										.map((item) => (
											<p key={item.sector}>
												<span className='text-[var(--ink)]'>{item.sector}:</span> {item.note}
											</p>
										))}
								</div>
							) : null}
						</ExplainerBlock>
					</div>
				</div>
			</section>

			<section className='border-b border-[var(--ink)] bg-[var(--paper-2)] py-14 sm:py-24 lg:py-32'>
				<div className='mx-auto max-w-7xl px-6 sm:px-8'>
					<div>
						<div className='mb-12'>
							<p className='eyebrow'>Government formation</p>
							<h2 className='mt-3 text-3xl font-extrabold leading-none tracking-[-0.035em] sm:text-5xl'>How the Chief Minister is elected.</h2>
							<p className='mt-5 text-base leading-snug text-[var(--ink-2)] sm:text-lg sm:leading-8'>
								BARMM voters elect the Members of Parliament. The Chief Minister is chosen afterward by the Parliament, which is why party, coalition, district, and sectoral seat totals matter after
								Election Day.
							</p>
						</div>

						<div className='grid gap-px border border-[var(--rule)] bg-[var(--rule)] md:grid-cols-3'>
							<article className='bg-[var(--paper)] p-8'>
								<p className='eyebrow text-[9px]'>Step 1</p>
								<h3 className='mt-3 text-2xl font-extrabold leading-none tracking-[-0.03em]'>Voters choose Parliament.</h3>
								<p className='mt-4 text-sm leading-snug text-[var(--ink-2)]'>
									The ballot fills the 80 parliamentary seats. Voters do not directly elect the Chief Minister on a separate executive ballot.
								</p>
							</article>
							<article className='bg-[var(--paper)] p-8'>
								<p className='eyebrow text-[9px]'>Step 2</p>
								<h3 className='mt-3 text-2xl font-extrabold leading-none tracking-[-0.03em]'>Parliament votes.</h3>
								<p className='mt-4 text-sm leading-snug text-[var(--ink-2)]'>
									On the first day of session after the parliamentary election, members elect the Chief Minister by a majority vote of all members. In an 80-seat Parliament, that majority threshold is{' '}
									{stats.majorityThreshold}.
								</p>
							</article>
							<article className='bg-[var(--paper)] p-8'>
								<p className='eyebrow text-[9px]'>Step 3</p>
								<h3 className='mt-3 text-2xl font-extrabold leading-none tracking-[-0.03em]'>Runoff if needed.</h3>
								<p className='mt-4 text-sm leading-snug text-[var(--ink-2)]'>
									If no member wins the required majority in the first round, Parliament holds a runoff between the two members with the highest first-round vote totals.
								</p>
							</article>
						</div>
					</div>

					<p className='mt-8 font-mono text-[10px] font-semibold uppercase leading-5 tracking-[0.16em] text-[var(--ink-3)] border-b border-[var(--rule)] pb-8'>
						Source:{' '}
						<a
							href='https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/92699'
							target='_blank'
							rel='noreferrer'
							className='border-b border-[var(--accent)] text-[var(--ink)] hover:text-[var(--accent)]'
						>
							Republic Act No. 11054, Article VII, Sections 30-35
						</a>
					</p>
				</div>
			</section>

			<section className='py-14 sm:py-24 lg:py-32'>
				<div className='mx-auto grid max-w-7xl gap-12 px-6 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24'>
					<div>
						<p className='eyebrow'>Election calendar</p>
						<h2 className='mt-3 text-3xl font-extrabold leading-none tracking-[-0.035em] sm:text-5xl'>The current schedule points to September 14, 2026.</h2>
						<p className='mt-5 text-base leading-snug text-[var(--ink-2)] sm:text-lg sm:leading-8'>
							The workspace keeps the operational dates close to the source fields so schedule changes can be audited without rewriting the explainer by hand.
						</p>
					</div>
					<div className='border-t border-[var(--ink)] lg:pl-12'>
						{dates.map((item) => (
							<div
								key={item.label}
								className='grid gap-2 border-b border-[var(--rule)] py-5 sm:grid-cols-[13rem_1fr]'
							>
								<p className='font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]'>{item.label}</p>
								<p className=' mt-2 text-xl font-extrabold leading-tight tracking-[-0.025em]'>{item.value}</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</ElectionShell>
	)
}
