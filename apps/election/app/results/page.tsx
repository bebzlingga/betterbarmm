import type { Metadata } from 'next'
import { Rise, SectionHead, Stagger, StaggerItem } from '@betterbarmm/editorial'
import { ElectionShell } from '../_components/election-shell'
import { Masthead } from '../_components/masthead'
import { PartyMark } from '../_components/marks'
import { OutcomeBar, SeatMap } from '../_components/parliament-diagram'
import { formatDate, getElectionViewModel } from '../_lib/election-data'
import {
	blocColor,
	getResultsViewModel,
	share,
	type ResultCandidate,
	winnerOf,
} from '../_lib/election-results'
import { partyColor } from '../_lib/party-color'

export const metadata: Metadata = {
	title: 'The result — BetterBARMM Election',
	description:
		'How the Bangsamoro voted on 14 September 2026: the 80 seats of the first elected Parliament, every district and reserved seat, the party vote, and the 41-seat line nobody crossed.',
}

/* ============================================================
   The result

   The rest of this workspace was written before a vote had been cast, and it
   stays that way — the ballot is one document and the count is another. This
   page is the second one.

   Its order is the order the fact matters in. The chamber first, because the
   shape of the room is the result; the forty-one-seat line second, because
   nobody reached it and that is the whole story of the next year; then the
   three tracks that filled the room, each with its own numbers, for a reader
   who came to look up one district and one name.
   ============================================================ */

const decimal = new Intl.NumberFormat('en')

const votes = (value: number | null) => (value === null ? '—' : decimal.format(value))
const percent = (value: number | null, places = 1) =>
	value === null ? '—' : `${value.toFixed(places)}%`

/** The party's own color beside its name, where the workspace records one. */
function PartyPlate({ partyId, label }: { partyId: string | null; label: string }) {
	if (!partyId) {
		return (
			<span className='text-[13px] font-semibold leading-none text-[var(--ink-3)]'>{label}</span>
		)
	}

	return (
		<span className='flex min-w-0 items-center gap-2.5'>
			<PartyMark partyId={partyId} ballotName={label} size={22} />
			<span className='truncate text-[13px] font-semibold leading-none text-[var(--ink-2)]'>
				{label}
			</span>
		</span>
	)
}

/**
 * One name in a race, with what it polled.
 *
 * The winner is the loud row and everyone else is the field. Set at one
 * weight the twelve names in a Lanao del Sur district read as a list of
 * equals, which is the one thing a first-past-the-post result is not.
 */
function CandidateRow({
	candidate,
	total,
}: {
	candidate: ResultCandidate
	total: number
}) {
	const color = partyColor(candidate.party_id)

	return (
		<div className='border-t border-[var(--rule-soft)] py-2.5 first:border-t-0'>
			<div className='flex items-baseline justify-between gap-4'>
				<p
					className={`min-w-0 text-[14px] leading-snug ${
						candidate.won
							? 'font-extrabold text-[var(--ink)]'
							: 'font-medium text-[var(--ink-2)]'
					}`}
				>
					{candidate.name}
					{candidate.interim_mp ? (
						<span
							title='Sat in the appointed interim parliament'
							className='ml-2 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'
						>
							Interim MP
						</span>
					) : null}
				</p>
				<p className='num shrink-0 text-[14px] font-semibold leading-none text-[var(--ink)]'>
					{votes(candidate.votes)}
					<span className='ml-2 font-mono text-[10px] font-semibold tracking-[0.1em] text-[var(--ink-3)]'>
						{percent(share(candidate.votes, total))}
					</span>
				</p>
			</div>

			<div className='mt-2 flex items-center gap-3'>
				<span
					aria-hidden='true'
					className='block h-1.5 shrink-0'
					style={{
						width: `${Math.max(share(candidate.votes, total) ?? 0, 0.6)}%`,
						background: candidate.won ? (color ?? 'var(--ink)') : 'var(--rule)',
					}}
				/>
				<span className='truncate font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
					{candidate.party_label}
				</span>
			</div>
		</div>
	)
}

/**
 * A race, folded.
 *
 * Thirty-two districts printed in full is a hundred and thirty rows, and a
 * reader looking for one of them has to scroll past the other thirty-one. The
 * winner and the margin stand open; the field under them is a `<details>`,
 * which costs no script and works before one loads.
 */
function Race({
	title,
	subtitle,
	candidates,
	total,
}: {
	title: string
	subtitle?: string
	candidates: ResultCandidate[]
	total: number
}) {
	const { winners, runnerUp } = winnerOf(candidates)
	const margin =
		winners.length === 1 && runnerUp ? (winners[0].votes ?? 0) - (runnerUp.votes ?? 0) : null

	return (
		<details className='group border-t border-[var(--rule)] py-5'>
			<summary className='flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between'>
				<div className='min-w-0'>
					<p className='font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
						{title}
						{subtitle ? ` · ${subtitle}` : ''}
					</p>
					<p className='mt-2 text-[17px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
						{winners.map((winner) => winner.name).join(', ')}
					</p>
					{/* One plate per party, not per winner. The settler-communities seat
					    returns two members and both are UBJP, which printed the plate
					    and the name twice in a row — the same party stated twice reads
					    as two parties at a glance. */}
					<div className='mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2'>
						{Array.from(new Map(winners.map((winner) => [winner.party_label, winner])).values()).map(
							(winner) => (
								<PartyPlate
									key={winner.party_label}
									partyId={winner.party_id}
									label={winner.party_label}
								/>
							),
						)}
					</div>
				</div>

				<div className='shrink-0 text-left sm:text-right'>
					<p className='num text-[18px] font-extrabold leading-none text-[var(--ink)]'>
						{votes(winners[0]?.votes ?? null)}
					</p>
					<p className='mt-2 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
						{margin === null
							? `${candidates.length} on the ballot`
							: `${decimal.format(margin)} ahead · ${candidates.length} ran`}
					</p>
					<p className='mt-2 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)] group-open:hidden'>
						Show the field
					</p>
				</div>
			</summary>

			<div className='mt-5 border-t border-[var(--brass-line)] pt-3'>
				{candidates.map((candidate) => (
					<CandidateRow key={candidate.name} candidate={candidate} total={total} />
				))}
			</div>
		</details>
	)
}

export default function ResultsPage() {
	const {
		blocs,
		district,
		districtsByArea,
		outcome,
		proportional,
		sectoral,
		shortfall,
		sources,
		totalSeats,
		tracks,
		turnout,
	} = getResultsViewModel()
	const { stats } = getElectionViewModel()

	const prTotalVotes = proportional.parties.reduce((sum, party) => sum + party.votes, 0)
	const nomineesByParty = proportional.parties
		.filter((party) => party.seats > 0)
		.map((party) => ({
			...party,
			nominees: proportional.elected_nominees.filter(
				(nominee) => nominee.party_id === party.party_id,
			),
		}))

	/* How many parties ended up holding a seat.
	 *
	 * Not how many former members came back, which is the figure that wanted to
	 * go here. The record marks each winner who sat in the appointed interim
	 * parliament and those marks are printed beside their names below, but
	 * adding them up gives thirty-one where the reporting on the same list says
	 * thirty — and a headline figure a source contradicts has no business in a
	 * masthead. The per-name mark is a transcription; the total would be a
	 * claim. */
	const partiesWithSeats = blocs.filter((bloc) => bloc.party_id && bloc.total_seats > 0).length
	const regionalPartyCount = stats.regionalParties

	return (
		<ElectionShell>
			<Masthead
				label='The result · 14 September 2026'
				lines={['Eighty members.', 'No majority.']}
				muted={[1]}
				standfirst={`The Bangsamoro elected its first Parliament on ${formatDate(
					'2026-09-14',
				)} and the Commission on Elections proclaimed all ${totalSeats} members two days later. ${
					outcome.summary
				} Every figure below is on this page because it is on the record — with the source that carries it.`}
				facts={[
					{
						value: percent(turnout.turnout_percent, 2),
						label: 'Turnout',
						detail: `${decimal.format(turnout.votes_cast)} of ${decimal.format(
							turnout.registered_voters,
						)} registered voters — the highest the region has recorded.`,
					},
					{
						value: outcome.largest_party_seats,
						label: 'Largest bloc',
						count: true,
						detail: `BFP, ${shortfall} seats short of the ${outcome.majority_threshold} a Chief Minister needs.`,
					},
					{
						value: partiesWithSeats,
						label: 'Parties with a seat',
						count: true,
						detail: `Of the ${regionalPartyCount} on the regional ballot. The BGC won its district seats through three component parties.`,
					},
				]}
			/>

			{/* ---- The chamber ---- */}
			<section className='bb-container section-band'>
				<SectionHead
					index='01'
					eyebrow='The chamber'
					title='The room,'
					titleMuted='as it was filled.'
					lead={`The same ${totalSeats} seats the ballot was drawn for, now held by the people who won them. The colors here measure a quantity rather than name a party, so they are the workspace's chart colors — each party's own color sits on its plate in the table below.`}
				/>

				<Rise delay={0.1} distance={14}>
					<div className='mt-12'>
						<SeatMap tracks={tracks} total={totalSeats} />
					</div>
				</Rise>

				{/* The table under the figure is where the fourth-largest party gets
				    its numbers. The legend carries three blocs and a remainder,
				    because a key with a one-seat entry in it is a key nobody reads;
				    every bloc has its own line here, with all three tracks broken
				    out — which is the only place a reader can see that UBJP took
				    every reserved seat and still finished second. */}
				<Rise delay={0.16} distance={14}>
					<div className='mt-16 overflow-x-auto'>
						<table className='w-full min-w-[42rem] border-collapse text-left'>
							<thead>
								<tr className='border-b border-[var(--brass-line)]'>
									{['Party', 'Party vote', 'Districts', 'Reserved', 'Seats'].map(
										(heading, index) => (
											<th
												key={heading}
												scope='col'
												className={`pb-3 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)] ${
													index === 0 ? 'text-left' : 'text-right'
												}`}
											>
												{heading}
											</th>
										),
									)}
								</tr>
							</thead>
							<tbody>
								{blocs.map((bloc) => (
									<tr key={bloc.label} className='border-b border-[var(--rule-soft)]'>
										<th scope='row' className='py-3.5 pr-6 text-left font-normal'>
											<span className='flex items-center gap-3'>
												<span
													aria-hidden='true'
													className='block h-6 w-1.5 shrink-0'
													style={{ background: blocColor(bloc.party_id) }}
												/>
												<span className='min-w-0'>
													<span className='block text-[15px] font-bold leading-none text-[var(--ink)]'>
														{bloc.label}
													</span>
													{bloc.district_component_parties.length ? (
														<span className='mt-1.5 block font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
															Districts contested through SIAP, Al Ittihad-UKB and BPP
														</span>
													) : null}
													{bloc.note ? (
														<span className='mt-1.5 block font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
															{bloc.note}
														</span>
													) : null}
												</span>
											</span>
										</th>
										{[
											bloc.party_representative_seats,
											bloc.district_seats,
											bloc.sectoral_seats,
										].map((seats, index) => (
											<td
												key={index}
												className='num py-3.5 text-right text-[15px] font-semibold text-[var(--ink-2)]'
											>
												{seats || '—'}
											</td>
										))}
										<td className='num py-3.5 text-right text-[17px] font-extrabold text-[var(--ink)]'>
											{bloc.total_seats}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Rise>
			</section>

			{/* ---- The line nobody crossed ---- */}
			<section className='bb-container section-band'>
				<SectionHead
					index='02'
					eyebrow='After the count'
					title='Nobody reached'
					titleMuted={`${outcome.majority_threshold}.`}
				/>

				<div className='mt-12 grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16'>
					<Rise distance={14}>
						<OutcomeBar
							blocs={tracks}
							total={totalSeats}
							majority={outcome.majority_threshold}
						/>
					</Rise>

					<Rise delay={0.12} distance={14}>
						<dl className='border-t border-[var(--brass-line)]'>
							{[
								{
									term: 'Chief Minister',
									detail: 'Not yet chosen. The members elect one from among themselves.',
								},
								{
									term: 'First session',
									detail: `The elected Parliament takes office on ${formatDate(
										outcome.first_session,
									)}.`,
								},
								{
									term: 'Shortfall',
									detail: `${shortfall} seats between the largest bloc and a government it could form alone.`,
								},
							].map((row) => (
								<div key={row.term} className='border-b border-[var(--rule-soft)] py-4'>
									<dt className='font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
										{row.term}
									</dt>
									<dd className='mt-2 text-[15px] leading-[1.5] text-[var(--ink-2)]'>
										{row.detail}
									</dd>
								</div>
							))}
						</dl>
					</Rise>
				</div>
			</section>

			{/* ---- The party vote ---- */}
			{/* The band sits on the container inside, not on the section: a change
			    of ground wants the full rhythm on both edges, and the collapse rule
			    would take the head off this one because the section above carries a
			    band too. */}
			<section className='bb-lattice-soft relative isolate overflow-hidden bg-[var(--paper-2)]'>
				<div className='bb-container section-band'>
					<SectionHead
						index='03'
						eyebrow={`The party vote · ${proportional.seats} seats`}
						title='One mark,'
						titleMuted='the whole region.'
						lead={`Every voter in the region chose one party, and these ${proportional.seats} seats were shared out in proportion to the result. Four parties cleared the bar; the other eight took none. ${proportional.invalid_note}`}
					/>

					{/* Side by side: the share of the vote, and the names that share
					    turned into. They answer one question in two halves, and read
					    across rather than down a reader can see the sixteen seats sat
					    against the thirty-six per cent that won them. */}
					<div className='mt-12 grid gap-x-12 gap-y-14 lg:grid-cols-[1fr_1fr]'>
						<Rise distance={14}>
							<div>
								<p className='bb-label'>How the region voted</p>
								<div className='mt-6'>
									{proportional.parties.map((party) => (
										<div
											key={party.label}
											className='border-t border-[var(--rule-soft)] py-3 first:border-t-0'
										>
											<div className='flex items-center justify-between gap-4'>
												<PartyPlate partyId={party.party_id} label={party.label} />
												<p className='num shrink-0 text-[14px] font-semibold leading-none text-[var(--ink)]'>
													{votes(party.votes)}
													<span className='ml-2 font-mono text-[10px] font-semibold tracking-[0.1em] text-[var(--ink-3)]'>
														{percent(share(party.votes, prTotalVotes), 2)}
													</span>
												</p>
											</div>
											<div className='mt-2 flex items-center gap-3'>
												<span
													aria-hidden='true'
													className='block h-1.5 shrink-0'
													style={{
														width: `${Math.max(share(party.votes, prTotalVotes) ?? 0, 0.5)}%`,
														background: party.seats
															? blocColor(party.party_id)
															: 'var(--rule)',
													}}
												/>
												<span className='shrink-0 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
													{party.seats
														? `${party.seats} ${party.seats === 1 ? 'seat' : 'seats'}`
														: 'No seat'}
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
						</Rise>

						<Rise delay={0.12} distance={14}>
							<div>
								<p className='bb-label'>Who takes the seats</p>
								{/* The names the party vote actually sends. A proportional
								    result is a share until somebody's name is on it, and this
								    is the list the parties fill their share from — in their
								    own order, which is the order the nominee list was filed
								    in rather than anything this page decides. */}
								<Stagger gap={0.03} className='mt-6'>
									{nomineesByParty.map((party) => (
										/* The step between parties rides on the `StaggerItem`, not on a
										   wrapper inside it. Inside, the div was the only child of its
										   item and so always `:first-child` — `first:mt-0` matched every
										   block, every party ran straight into the one above it, and
										   raising the margin three times changed nothing at all. Out
										   here the items are siblings, which is what `first:` needs. */
										<StaggerItem key={party.label} distance={10} className='mt-10 first:mt-0'>
											<div>
												<div className='flex items-center justify-between gap-4 border-b border-[var(--brass-line)] pb-3.5'>
													<PartyPlate partyId={party.party_id} label={party.label} />
													<p className='num shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
														{party.nominees.length}{' '}
														{party.nominees.length === 1 ? 'seat' : 'seats'}
													</p>
												</div>
												<ol className='mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2'>
													{party.nominees.map((nominee, index) => (
														<li
															key={nominee.name}
															className='flex items-baseline gap-2.5 text-[13.5px] leading-snug text-[var(--ink-2)]'
														>
															<span className='num shrink-0 font-mono text-[10px] font-semibold text-[var(--ink-3)]'>
																{index + 1}
															</span>
															<span className='min-w-0'>
																{nominee.name}
																{nominee.bta_incumbent ? (
																	<span
																		title='Sat in the appointed interim parliament'
																		className='ml-1.5 font-mono text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'
																	>
																		Interim
																	</span>
																) : null}
															</span>
														</li>
													))}
												</ol>
											</div>
										</StaggerItem>
									))}
								</Stagger>
							</div>
						</Rise>
					</div>
				</div>
			</section>

			{/* ---- The districts ---- */}
			<section className='bb-container section-band'>
				<SectionHead
					index='04'
					eyebrow={`The district vote · ${district.seats} seats`}
					title='Every district,'
					titleMuted='one name each.'
					lead='One name takes the seat for the place you are registered in. Open any district for the full field and what each candidate polled. Sulu returns none of these: the Supreme Court excluded it from the region for election purposes.'
				/>

				<div className='mt-12 grid gap-x-12 gap-y-12 lg:grid-cols-2'>
					{districtsByArea.map((area) => (
						<Rise key={area.area} distance={14}>
							<div>
								<div className='flex items-baseline justify-between gap-4'>
									<h3 className='section-title section-title-sm text-[var(--ink)]'>
										{area.area}
									</h3>
									<p className='num shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
										{area.seats} {area.seats === 1 ? 'seat' : 'seats'}
									</p>
								</div>

								<div className='mt-6'>
									{area.districts.map((item) => (
										<Race
											key={item.label}
											title={`${item.district} district`}
											candidates={item.candidates}
											total={item.total_votes}
										/>
									))}
								</div>
							</div>
						</Rise>
					))}
				</div>

				<p className='mt-12 border-t border-[var(--brass-line)] pt-5 font-mono text-[10px] font-semibold uppercase leading-5 tracking-[0.14em] text-[var(--ink-3)]'>
					{district.seats} district seats · {decimal.format(district.invalid_votes)} invalid or
					unattributed ballots
				</p>
			</section>

			{/* ---- The reserved seats ---- */}
			<section className='bb-container section-band'>
				<SectionHead
					index='05'
					eyebrow={`The reserved seats · ${sectoral.seats} seats`}
					title='Reserved seats,'
					titleMuted='never on the ballot.'
					lead={`These are held for communities a region-wide count would otherwise leave out, and the nominees for them never appear on the ballot paper. ${sectoral.votes_note} Two of the eight are not voted on at all.`}
				/>

				<div className='mt-12 grid gap-x-12 gap-y-4 lg:grid-cols-2'>
					{sectoral.races.map((race) => (
						<Race
							key={race.sector}
							title={race.sector}
							subtitle={`${race.seats} ${race.seats === 1 ? 'seat' : 'seats'}`}
							candidates={race.candidates}
							total={race.candidates.reduce(
								(sum, candidate) => sum + (candidate.votes ?? 0),
								0,
							)}
						/>
					))}

					{/* The two seats no ballot reaches. Printed as a race with no votes
					    beside it, this would read as a race nobody turned out for; it
					    is not a race at all, and the method is the fact. */}
					<Rise distance={14}>
						<div className='border-t border-[var(--rule)] py-5'>
							<p className='font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
								Non-Moro Indigenous Peoples · {sectoral.non_moro_indigenous_peoples.seats} seats
							</p>
							<p className='mt-2 text-[17px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
								{sectoral.non_moro_indigenous_peoples.elected
									.map((member) => member.name)
									.join(', ')}
							</p>
							<p className='mt-2.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
								{sectoral.non_moro_indigenous_peoples.elected
									.map((member) => member.group)
									.join(' · ')}
							</p>
							<p className='mt-4 bb-body text-[var(--ink-2)]'>
								{sectoral.non_moro_indigenous_peoples.method} The two seats rotate between the
								groups: {sectoral.non_moro_indigenous_peoples.rotation.join('; then ')}.
							</p>
						</div>
					</Rise>
				</div>
			</section>

			{/* ---- Where this came from ---- */}
			{/* The band sits on the container inside, not on the section: a change
			    of ground wants the full rhythm on both edges, and the collapse rule
			    would take the head off this one because the section above carries a
			    band too. */}
			<section className='bb-lattice-soft relative isolate overflow-hidden bg-[var(--paper-2)]'>
				<div className='bb-container section-band'>
					<SectionHead
						index='06'
						eyebrow='The record'
						title='Every figure here'
						titleMuted='has a source.'
					/>

					<div className='mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3'>
						{sources.map((source) => (
							<Rise key={source.id} distance={12}>
								<article className='border-t border-[var(--rule)] pt-5'>
									<p className='font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
										{source.publisher} · {formatDate(source.date)}
									</p>
									<h3 className='mt-3 text-[15px] font-bold leading-snug text-[var(--ink)]'>
										{source.title}
									</h3>
									<a
										href={source.url}
										target='_blank'
										rel='noreferrer'
										className='rule-link mt-3 inline-block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]'
									>
										Open the source →
									</a>
								</article>
							</Rise>
						))}
					</div>
				</div>
			</section>
		</ElectionShell>
	)
}
