import { Rise, SectionHead, Stagger, StaggerItem } from '@betterbarmm/editorial'
import Link from 'next/link'
import { BallotDiagram } from './_components/ballot-diagram'
import { ElectionShell } from './_components/election-shell'
import { ElectionTimeline, type TimelinePhase } from './_components/election-timeline'
import { Masthead } from './_components/masthead'
import { DistrictSeatBars, MajorityBar, SeatMap } from './_components/parliament-diagram'
import {
	formatDate,
	getElectionViewModel,
	getTimelineViewModel,
	labelize,
} from './_lib/election-data'
import { getResultsViewModel } from './_lib/election-results'

/**
 * One of the three ways into the Parliament.
 *
 * The figure is the heading here rather than a number printed beside one: the
 * whole section is an argument about how eighty seats are divided, and the
 * division is the thing worth setting at display size.
 */
function Track({
	seats,
	total,
	title,
	voterAction,
	color,
	children,
}: {
	seats: number
	total: number
	title: string
	voterAction: string
	color: string
	children: React.ReactNode
}) {
	return (
		<Rise distance={16}>
			{/* A column rather than a row.
			 *
			 * The three ways into the chamber were three full-width bands stacked
			 * down the page, each with its figure in a narrow left track and its
			 * account beside it. Read that way they are three separate arguments
			 * and the reader meets them one at a time — but they are three parts of
			 * one eighty-seat chamber, and the legend directly above already sets
			 * them side by side. Three columns under it continues that reading:
			 * the same three things, in the same order, in the same places.
			 *
			 * The bar over each column is the one from the legend, so a column and
			 * its cell above are visibly the same track. */}
			<article className='flex h-full flex-col border-t border-[var(--rule)] pt-7'>
				<span
					aria-hidden='true'
					className='block h-1.5 w-10'
					style={{ background: color }}
				/>

				<p className='bb-figure-sm mt-5 leading-none' style={{ color }}>
					{seats}
				</p>
				<p className='mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
					of {total} seats
				</p>

				<h3 className='mt-6 text-[19px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
					{title}
				</h3>
				<p className='mt-2 font-mono text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] text-[var(--ink-3)]'>
					{voterAction}
				</p>

				<div className='mt-5'>{children}</div>
			</article>
		</Rise>
	)
}

export default function Page() {
	const { election, metadata, parties, stats } = getElectionViewModel()
	const { phases } = getTimelineViewModel()
	const { outcome, shortfall, turnout } = getResultsViewModel()
	const resultDay = formatDate('2026-09-14')

	const timelinePhases: TimelinePhase[] = phases.map((group) => ({
		phase: group.phase,
		events: group.events.map((event) => ({
			id: `${event.date}-${event.title}`,
			dateLabel: formatDate(event.date),
			kicker: labelize(event.event_type),
			title: event.title,
			body: event.description ?? event.summary ?? '',
			isElectionDay: event.event_type === 'election_day',
		})),
	}))

	const tracks = [
		{
			key: 'party',
			label: 'Party-representative seats',
			seats: stats.partyRepresentativeSeats,
			color: 'var(--accent)',
		},
		{
			key: 'district',
			label: 'Single-member district seats',
			seats: stats.singleMemberDistrictSeats,
			color: 'var(--slate)',
		},
		{
			key: 'sectoral',
			label: 'Sectoral and reserved seats',
			seats: stats.sectoralOrReservedSeats,
			color: 'var(--ochre)',
		},
	]

	return (
		<ElectionShell>
			<Masthead
				label='The 2026 Bangsamoro election'
				lines={['The first regular', 'parliamentary election.']}
				muted={[1]}
				standfirst={`On ${metadata.electionDay} the Bangsamoro elected its own Parliament for the first time — ${stats.totalSeats} members, filled three different ways, after seven years of transition and three postponed dates. No party won the ${stats.majorityThreshold} seats a government needs. This page is how those seats are filled and who was on the ballot; the count itself is on the result page.`}
				facts={[
					{ value: stats.totalSeats, label: 'Seats in Parliament', count: true },
					{ value: stats.majorityThreshold, label: 'Seats for a majority', count: true },
					{ value: stats.regionalParties, label: 'Parties on the ballot', count: true },
				]}
			>
				{/* Brass, not the solid ink button. On the crimson band `bb-btn-solid`
				    is cream with crimson type and fills gold on hover, which puts
				    white type on gold; brass is the cut the estate already uses for
				    the one action on a brand band. */}
				<Link href='/results' className='bb-btn bb-btn-brass'>
					See the result
				</Link>
			</Masthead>

			{/* ---- What happened ---- */}
			{/* The one band on this page written in the past tense, and it comes
			    first because it is the thing a reader arriving today wants.

			    It is deliberately three figures and a sentence rather than a second
			    results page: the count has a page of its own, and a summary that
			    grows here is a second account of the same numbers, drifting apart
			    from the first the moment either is edited. */}
			<section className='bb-container section-band'>
				<Rise distance={14}>
					<div>
						<p className='bb-label'>The count · {resultDay}</p>

						<div className='mt-7 grid gap-x-10 gap-y-8 lg:grid-cols-[1.1fr_1fr] lg:items-end'>
							{/* A step under `bb-lede`. The band sits directly beneath a display
							    masthead and its standfirst; at the lede's two rems it was a third
							    voice at nearly headline size, and the three figures beside it
							    were the quiet half of a row they are the point of. */}
							<p className='max-w-[34em] text-[17px] leading-[1.55] text-pretty text-[var(--ink)]'>
								{outcome.summary}
							</p>

							<dl className='grid grid-cols-3 gap-6'>
								{[
									{ value: `${turnout.turnout_percent}%`, label: 'Turnout' },
									{ value: outcome.largest_party_seats, label: 'BFP, largest bloc' },
									{ value: shortfall, label: 'Short of a majority' },
								].map((fact) => (
									<div key={fact.label} className='flex flex-col-reverse'>
										<dt className='mt-2.5 font-mono text-[9px] font-semibold uppercase leading-tight tracking-[0.14em] text-[var(--ink-3)]'>
											{fact.label}
										</dt>
										<dd className='bb-figure-sm leading-none text-[var(--ink)]'>{fact.value}</dd>
									</div>
								))}
							</dl>
						</div>

						<Link
							href='/results'
							className='mt-8 inline-block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)] transition hover:text-[var(--accent-deep)]'
						>
							Every seat, district and reserved seat →
						</Link>
					</div>
				</Rise>
			</section>

			{/* ---- How the seats are filled ---- */}
			<section className='bb-container section-band'>
				<SectionHead
					index='01'
					eyebrow='How it works'
					title='One Parliament,'
					titleMuted='three ways in.'
					lead={`A voter marks two things and a third is reserved. Together they fill one ${stats.totalSeats}-seat chamber, and any government has to hold ${stats.majorityThreshold} of those seats to form.`}
				/>

				<Rise delay={0.1} distance={14}>
					<div className='mt-12'>
						{/* The threshold is section 02's subject, drawn there as a bar of
						    eighty cells. Printed in this well as well it was the same fact
						    stated twice on one page, the second time without the picture
						    that makes it mean anything. */}
						<SeatMap tracks={tracks} total={stats.totalSeats} />
					</div>
				</Rise>

				<div className='mt-14 grid gap-x-10 gap-y-12 lg:grid-cols-3'>
					<Track
						seats={stats.partyRepresentativeSeats}
						total={stats.totalSeats}
						title='The party vote'
						voterAction='You mark one party'
						color='var(--accent)'
					>
						<p className='bb-body text-[var(--ink-2)]'>
							Every voter in the region sees the same {stats.regionalParties} entries. The vote is
							for the party rather than a person: each one takes a share of these seats in
							proportion to its share of the vote, then fills them from its own nominee list.
						</p>
						<Link
							href='/candidates#parties'
							className='mt-5 inline-block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)] transition hover:text-[var(--accent-deep)]'
						>
							Meet the {stats.regionalParties} parties →
						</Link>
					</Track>

					<Track
						seats={stats.singleMemberDistrictSeats}
						total={stats.totalSeats}
						title='The district vote'
						voterAction='You mark one candidate'
						color='var(--slate)'
					>
						<p className='bb-body text-[var(--ink-2)]'>
							One name wins the seat for the place you are registered in. The seats are not spread
							evenly: Lanao del Sur returns nine of them, and Sulu returns none at all after the
							Supreme Court excluded it from the region for election purposes.
						</p>
						<div className='mt-8'>
							<DistrictSeatBars
								seats={election.district_seat_distribution_current_framework}
								total={stats.singleMemberDistrictSeats}
							/>
						</div>
					</Track>

					<Track
						seats={stats.sectoralOrReservedSeats}
						total={stats.totalSeats}
						title='The reserved seats'
						voterAction='Filled from sector lists'
						color='var(--ochre)'
					>
						<p className='bb-body text-[var(--ink-2)]'>
							These are held for communities that a region-wide count would otherwise leave out.
							The seats are fixed in the Organic Law, and the nominees for them appear on the
							regional certified list.
						</p>
						{/* A list, not a grid of tiles.
						 *
						 * Six bordered cells two across put a one-digit figure in a box of
						 * its own and set the sector's name in nine-point capitals under
						 * it — a lot of furniture around the word "Women" and the number
						 * 1. As rows the six read down in one pass, the counts line up in
						 * a column the eye can add, and it is the same shape the district
						 * seats take in the column beside it. */}
						<Stagger gap={0.04} className='mt-8'>
							<dl className='border-t border-[var(--rule-soft)]'>
								{election.sectoral_seat_distribution.map((item) => (
									<StaggerItem key={item.sector} distance={10}>
										<div className='flex items-baseline justify-between gap-4 border-b border-[var(--rule-soft)] py-2.5'>
											<dt className='min-w-0 text-[13.5px] font-semibold leading-snug text-[var(--ink)]'>
												{item.sector}
											</dt>
											<dd className='num shrink-0 text-[15px] font-bold leading-none text-[var(--ink)]'>
												{item.seats}
											</dd>
										</div>
									</StaggerItem>
								))}
							</dl>
						</Stagger>
					</Track>
				</div>

				<Rise delay={0.1} distance={14}>
					<div className='mt-16'>
						<BallotDiagram
							partyNames={parties.map((party) => party.ballot_name)}
							partyCount={stats.regionalParties}
							districtSeats={stats.singleMemberDistrictSeats}
							reservedSeats={stats.sectoralOrReservedSeats}
							electionDay={metadata.electionDay}
						/>
					</div>
				</Rise>
			</section>

			{/* ---- Government formation ---- */}
			<section className='bb-container section-band'>
				<SectionHead
					index='02'
					eyebrow='After the count'
					title='The chamber elects'
					titleMuted='its own Chief Minister.'
					lead={`Nobody votes for a chief minister on the ballot. The ${stats.totalSeats} members elected on all three tracks do that themselves, on the first day of session — and on ${formatDate(outcome.first_session)} they will be doing it without a party holding a majority.`}
				/>

				<div className='mt-12 grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16'>
					<Rise distance={14}>
						<div>
							<p className='bb-body text-[var(--ink-2)]'>
								A member needs {stats.majorityThreshold} of the {stats.totalSeats} votes — a
								majority of all members, not of those present. If no one reaches it, Parliament
								holds a runoff between the top two. That is why the party vote and the district
								vote end up being the same question: which bloc can get to {stats.majorityThreshold}.
							</p>
							<p className='mt-5 bb-body text-[var(--ink-2)]'>
								The count answered it with a chamber where nobody can. The largest bloc holds{' '}
								{outcome.largest_party_seats}, {shortfall} short, which puts the office in the
								hands of whoever agrees with whom —{' '}
								<Link href='/results' className='rule-link text-[var(--ink)]'>
									the seats, bloc by bloc
								</Link>
								.
							</p>
							<p className='mt-6 font-mono text-[10px] font-semibold uppercase leading-6 tracking-[0.16em] text-[var(--ink-3)]'>
								Source:{' '}
								<a
									href='https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/92699'
									target='_blank'
									rel='noreferrer'
									className='rule-link text-[var(--ink)]'
								>
									RA 11054, Art. VII, Secs. 30–35
								</a>
							</p>
						</div>
					</Rise>

					<Rise delay={0.12} distance={14}>
						<MajorityBar total={stats.totalSeats} majority={stats.majorityThreshold} />
					</Rise>
				</div>
			</section>

			{/* ---- The timeline ---- */}
			{/* The band sits on an inner div, not on the section.
			    
			    A change of ground wants the full rhythm on both edges, and the
			    collapse rule would take the head off this one because the section
			    above it carries a band too. Held one level in, it never matches
			    that rule — and the timeline below still runs full-bleed, because
			    the wrapper pads rather than measures. */}
			<section className='bb-lattice-soft relative isolate overflow-hidden bg-[var(--paper-2)]'>
				<div className='section-band'>
					<div className='bb-container'>
						<SectionHead
							index='03'
							eyebrow='The road to the vote'
							title='Set for 2022.'
							titleMuted='Held in 2026.'
							lead='The law that created the Parliament was signed in 2018. Everything between then and September 2026 is the story of a date being moved — by a pandemic, by Congress, and by the Supreme Court — and then of the date arriving.'
						/>
					</div>

					<div className='mt-14'>
						<ElectionTimeline phases={timelinePhases} />
					</div>
				</div>
			</section>

		</ElectionShell>
	)
}
