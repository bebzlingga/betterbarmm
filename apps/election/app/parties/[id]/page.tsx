import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Hero } from '../../_components/hero'
import { Rise, SectionHead } from '@betterbarmm/editorial'
import { ConfidenceBadge } from '../../_components/confidence-badge'
import { PartyMark, PersonAvatar } from '../../_components/marks'
import { ElectionShell } from '../../_components/election-shell'
import {
	dominantStatusLabel,
	formatDate,
	getPartyById,
	getPartyIds,
	groupDistrictCandidates,
} from '../../_lib/election-data'
import { getPartyResult } from '../../_lib/election-results'
import { displayName } from '../../_lib/names'

export function generateStaticParams() {
	return getPartyIds().map((id) => ({ id }))
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>
}): Promise<Metadata> {
	const { id } = await params
	const party = getPartyById(id)
	if (!party) return { title: 'Party not found — BetterBARMM Election' }
	return {
		title: `${party.ballot_name} — BetterBARMM Election`,
		description: party.description ?? party.full_name,
	}
}

export default async function PartyDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	const party = getPartyById(id)

	if (!party) {
		notFound()
	}

	const districtGroups = groupDistrictCandidates(party.district)
	const result = getPartyResult(party.party_id)
	const decimal = new Intl.NumberFormat('en')

	return (
		<ElectionShell>
			{/* ---- The entry ---- */}
			{/* The party's own head on the crimson every page opens on (user decision: the travel look): the way back, its
			    code, bloc and standing as chips, the name, and its mark on a white card on the right. */}
			<Hero
				top={
					<div className='flex flex-wrap items-center gap-2'>
						<Link href='/candidates#parties' className='dv-chip-light'>
							← All parties
						</Link>
						<span className='pg-hero-kicker ml-2'>{party.party_id}</span>
						<span className='dv-chip-light !bg-transparent ring-1 ring-inset ring-white/30 !text-white'>{party.bloc}</span>
						{party.dominantStatus ? <span className='dv-chip-light'>{dominantStatusLabel[party.dominantStatus]}</span> : null}
						<ConfidenceBadge confidence={party.confidence} />
					</div>
				}
				title={party.ballot_name}
				lede={
					<>
						<p className='font-semibold text-white'>{party.full_name}</p>
						{party.description ? <p className='mt-3'>{party.description}</p> : null}
					</>
				}
				side={
					<div className='flex lg:justify-end'>
						<span className='grid place-items-center rounded-[1.75rem] bg-white p-5 shadow-[0_24px_50px_-28px_rgba(0,0,0,0.55)] lg:p-7'>
							<PartyMark partyId={party.party_id} ballotName={party.ballot_name} size={144} />
						</span>
					</div>
				}
			/>

			{/* ---- How it did ---- */}
			{/* First thing under the name, because it is the first thing anyone
			    now wants from a party's page — and a band rather than a section,
			    because the count has a page of its own and this is a pointer to it
			    with the one figure that matters printed on the pointer. */}
			<section className='bb-container section-band'>
				<Rise distance={14}>
					<div className='tv-wash rounded-[var(--dv-r)] p-7 sm:p-10'>
						<div className='flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
							<div>
								<p className='bb-label'>In the count</p>
								<p className='mt-4 max-w-[34em] text-[1rem] leading-[1.5] text-[var(--ink-2)]'>
									{result.disqualified
										? 'Disqualified before the count. The party vote it drew was set aside as invalid, and it holds no seat in the elected Parliament.'
										: result.totalSeats > 0
											? `${party.ballot_name} holds ${result.totalSeats} of the ${result.chamberSeats} seats in the elected Parliament — ${
													result.totalSeats >= result.majorityThreshold
														? 'a majority in its own right'
														: `${result.majorityThreshold - result.totalSeats} short of a majority on its own`
												}.`
											: `${party.ballot_name} won no seat. It stood on the regional ballot and in ${
													party.computedStats.districtCocFilers === 1 ? 'one district' : `${party.computedStats.districtCocFilers} districts`
												}, and the count returned none of them.`}
								</p>
								{result.componentParties.length ? (
									<p className='mt-3 font-mono text-[0.5625rem] font-semibold uppercase leading-5 tracking-[0.14em] text-[var(--ink-3)]'>
										District seats contested through SIAP, Al Ittihad-UKB and BPP
									</p>
								) : null}
							</div>

							<dl className='grid grid-cols-3 gap-7 lg:shrink-0 lg:text-right'>
								{[
									{ value: result.totalSeats, label: 'Seats held' },
									{
										value: result.partyVoteVotes === null ? '—' : decimal.format(result.partyVoteVotes),
										label: 'Party votes',
									},
									{
										value:
											result.partyVoteShare === null ? '—' : `${result.partyVoteShare.toFixed(1)}%`,
										label: 'Of the party vote',
									},
								].map((fact) => (
									<div key={fact.label} className='flex flex-col-reverse'>
										<dt className='mt-2.5 font-mono text-[0.5625rem] font-semibold uppercase leading-tight tracking-[0.14em] text-[var(--ink-3)]'>
											{fact.label}
										</dt>
										<dd className='num text-2xl font-extrabold leading-none text-[var(--ink)]'>
											{fact.value}
										</dd>
									</div>
								))}
							</dl>
						</div>

						{/* Where the seats came from, not who is sitting in them. Thirty-one
						    names run out as a paragraph is a wall nobody reads, and every one
						    of them is on the result page with what they polled beside it —
						    which is a better answer to "who" than a list with no numbers. */}
						{result.seatsByTrack.length ? (
							<div className='mt-8 rounded-2xl bg-[var(--paper)] px-5 py-4'>
								<p className='font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
									Where the seats came from
								</p>
								<p className='mt-3 text-[0.875rem] leading-[1.6] text-[var(--ink-2)]'>
									{result.seatsByTrack
										.map((track) => `${track.seats} ${track.label}`)
										.join(' · ')}
								</p>
							</div>
						) : null}

						<Link
							href='/results'
							className='dv-pill mt-7 bg-[var(--paper)]'
						>
							The full result
						</Link>
					</div>
				</Rise>
			</section>

			{/* ---- Background ---- */}
			{party.background ? (
				<section className='bb-container section-band'>
					{/* The party's own account, under a label rather than a headline.
					    "Where this entry comes from." was a display line about the
					    record's provenance standing over the one paragraph anybody came
					    here to read — the background itself. The provenance is still
					    said, in the badge and in the source line under the prose, which
					    is where a caveat belongs. */}
					<div className='flex flex-wrap items-center justify-between gap-4'>
						<p className='bb-label'>Background</p>
						<ConfidenceBadge confidence='reference' />
					</div>

					{/* One column. The affiliation and the reported figures sat in a
					    sidebar beside this — two short lists that repeated what the badge
					    row at the head of the page and the background itself already say.
					    With them gone the account has the section to itself, which is
					    what it was always the point of.

					    Full width, as asked. Worth knowing: at the container's 88rem a
					    17px line runs past two hundred characters, which is roughly three
					    times the measure prose is comfortable at — say the word and I
					    will cap it. */}
					<Rise distance={14}>
						<div className='mt-10'>
							<p className='text-[1rem] leading-8 text-[var(--ink-2)]'>
								{party.background.background}
							</p>
							{party.background.source_url ? (
								<p className='mt-6 break-words font-mono text-[0.625rem] font-semibold uppercase leading-6 tracking-[0.14em] text-[var(--ink-3)]'>
									Source:{' '}
									<a
										href={party.background.source_url}
										target='_blank'
										rel='noreferrer'
										className='rule-link'
									>
										{party.background.source_url}
									</a>
									{party.background.source_date
										? ` · ${formatDate(party.background.source_date)}`
										: ''}
								</p>
							) : null}
						</div>
					</Rise>
				</section>
			) : null}

			{/* ---- The people running under it ---- */}
			{/* On the page's own paper. It sat on the dark band, which is the
			    treatment this estate keeps for a single figure or a closing ask —
			    a hundred names, two grids and a set of plates on it made the page's
			    longest section its heaviest, and the party colors had to fight the
			    ground to be read. */}
			{/* Closer to the background above it than a full section step. The two
			    are one account of the same party — what it is, then who is standing
			    under it — and with the sidebar and the nominee section gone the page
			    is short enough that a full rhythm between them read as a gap where
			    something had been removed. */}
			{party.sectoral.length > 0 || party.district.length > 0 ? (
				<section className='bb-container section-band scroll-mt-24'>
					<div>
						<SectionHead
							index='02'
							eyebrow='Candidates'
							title='The names carrying'
							titleMuted='this label.'
							lead='Sectoral nominees come from the regional certified list. District filers are working records from reporting on COMELEC filings, and a label reported in a district is not always one of the regional ballot entries.'
						/>

						{party.sectoral.length > 0 ? (
							<div className='mt-12'>
								<div className='flex flex-wrap items-baseline justify-between gap-3'>
									{/* A step down from the display scale, the same one the bloc
									    headings on the candidates page take. These label a list inside
									    a section that already has its own head above it; at
									    `bb-display-sm` they ran to fifty points and read as two more
									    sections opening. */}
									<h3 className='section-title section-title-sm text-[var(--ink)]'>
										Sectoral nominees
									</h3>
									<p className='num font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
										{party.sectoral.length}
									</p>
								</div>

								<div className='mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
									{party.sectoral.map((candidate) => (
										<div
											key={`${candidate.sector}-${candidate.rank_or_number}-${candidate.full_name}`}
											className='tv-card !flex-row items-start gap-4 !p-5'
										>
											<PersonAvatar name={candidate.full_name} partyId={party.party_id} size={44} />
											<div className='min-w-0'>
											<p className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>
												{candidate.sector}
											</p>
											<h4 className='mt-2 text-[1rem] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
												{displayName(candidate.full_name)}
											</h4>
											<p className='mt-2 bb-body text-[var(--ink-2)]'>
												{candidate.organization_or_party}
											</p>
											</div>
										</div>
									))}
								</div>
							</div>
						) : null}

						{party.district.length > 0 ? (
							<div className='mt-14'>
								<div className='flex flex-wrap items-baseline justify-between gap-3'>
									<div className='flex flex-wrap items-center gap-3'>
										<h3 className='section-title section-title-sm text-[var(--ink)]'>
											District filers
										</h3>
										<ConfidenceBadge confidence='working' />
									</div>
									<p className='num font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
										{party.district.length}
									</p>
								</div>

								{/* The gap is the grid's, on both axes. It carried `gap-x` only and
								    left each province to space itself with a top margin that was
								    then cancelled at `lg` — so in two columns the provinces ran
								    into each other, one roster's last filer sitting directly on the
								    next province's rule. */}
								<div className='mt-6 grid gap-5 lg:grid-cols-2'>
									{districtGroups.map((group) => (
										<div key={group.area} className='rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-5 shadow-[0_18px_40px_-34px_rgba(0,0,0,0.45)] sm:p-6'>
											{/* The label needs room under it, like every other small header
											    on the estate. At `pb-2` the province sat on its own rule and
											    the first filer sat on the other side of it, so the three read
											    as one block of type rather than as a heading and a roster. */}
											<div className='flex items-baseline justify-between gap-3 border-b border-[var(--rule)] pb-4'>
												<p className='bb-label'>{group.area}</p>
												<p className='num font-mono text-[0.6875rem] text-[var(--ink-3)]'>
													{group.candidates.length}
												</p>
											</div>

											<div className='mt-2'>
											{group.candidates.map((candidate) => (
												<div
													key={candidate.candidate_id}
													className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[var(--rule-soft)] py-3 last:border-b-0'
												>
													<p className='flex min-w-0 items-center gap-3'>
														<PersonAvatar name={candidate.name_as_reported} partyId={party.party_id} size={36} />
														<span className='min-w-0 break-words text-[0.9375rem] font-semibold leading-snug text-[var(--ink)]'>
															{displayName(candidate.name_as_reported)}
														</span>
													</p>
													<p className='shrink-0 font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
														{candidate.district ?? 'District not reported'}
													</p>
												</div>
											))}
											</div>
										</div>
									))}
								</div>
							</div>
						) : null}
					</div>
				</section>
			) : null}

		</ElectionShell>
	)
}
