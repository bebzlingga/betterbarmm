import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { OkirBloom, Rise, SectionHead } from '@betterbarmm/editorial'
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

	return (
		<ElectionShell>
			{/* ---- The entry ---- */}
			<section className='bb-lattice relative overflow-hidden'>
				<OkirBloom
					variant='tally'
					className='absolute -right-[14%] -top-[38%] size-[min(44rem,86vw)] opacity-[0.15]'
				/>

				<div className='bb-container relative pb-16 pt-14 lg:pb-24 lg:pt-20'>
					<Rise distance={12}>
						<Link
							href='/candidates#parties'
							className='font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-3)] transition hover:text-[var(--accent)]'
						>
							← All parties
						</Link>
					</Rise>

					<Rise delay={0.06} distance={14}>
						<div className='mt-8 flex flex-wrap items-center gap-3'>
							<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brass)]'>
								{party.party_id}
							</p>
							<span aria-hidden='true' className='h-px w-8 bg-[var(--brass-line)]' />
							<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
								{party.bloc}
							</p>
							{party.dominantStatus ? (
								<span className='border border-[var(--accent)] px-2 py-1 font-mono text-[9px] font-semibold uppercase leading-none tracking-[0.14em] text-[var(--accent)]'>
									{dominantStatusLabel[party.dominantStatus]}
								</span>
							) : null}
							<ConfidenceBadge confidence={party.confidence} />
						</div>
					</Rise>

					<Rise delay={0.12} distance={16}>
						<div className='mt-7 flex flex-wrap items-center gap-5'>
							<PartyMark partyId={party.party_id} ballotName={party.ballot_name} size={144} />
							<h1 className='bb-display text-[var(--ink)]'>{party.ballot_name}</h1>
						</div>
					</Rise>

					<Rise delay={0.2} distance={14}>
						<p className='mt-6 max-w-[52rem] text-[16px] font-semibold leading-8 text-[var(--ink)]'>
							{party.full_name}
						</p>
					</Rise>

					{party.description ? (
						<Rise delay={0.26} distance={14}>
							{/* Wider than the estate's reading measure, like the mastheads.
						    This is a sentence read once under a name at display size, not a
						    column somebody settles into; at 34em it stacked into a narrow
						    stripe beside a very large heading. */}
						<p className='mt-5 max-w-[52rem] text-[16px] leading-8 text-[var(--ink-2)]'>
							{party.description}
						</p>
						</Rise>
					) : null}

				</div>

				<div className='bb-weave' aria-hidden='true' />
			</section>

			{/* ---- Background ---- */}
			{party.background ? (
				<section className='bb-container bb-section'>
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
							<p className='text-[16px] leading-8 text-[var(--ink-2)]'>
								{party.background.background}
							</p>
							{party.background.source_url ? (
								<p className='mt-6 break-words font-mono text-[10px] font-semibold uppercase leading-6 tracking-[0.14em] text-[var(--ink-3)]'>
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
			    longest section its heaviest, and the party colours had to fight the
			    ground to be read. */}
			{/* Closer to the background above it than a full section step. The two
			    are one account of the same party — what it is, then who is standing
			    under it — and with the sidebar and the nominee section gone the page
			    is short enough that a full rhythm between them read as a gap where
			    something had been removed. */}
			{party.sectoral.length > 0 || party.district.length > 0 ? (
				<section className='bb-container bb-section-bottom scroll-mt-24 pt-8 lg:pt-12'>
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
									<p className='num font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
										{party.sectoral.length}
									</p>
								</div>

								<div className='mt-6 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3'>
									{party.sectoral.map((candidate) => (
										<div
											key={`${candidate.sector}-${candidate.rank_or_number}-${candidate.full_name}`}
											className='flex items-start gap-4'
										>
											<PersonAvatar name={candidate.full_name} partyId={party.party_id} size={44} />
											<div className='min-w-0'>
											<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>
												{candidate.sector}
											</p>
											<h4 className='mt-2 text-[16px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
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
								<div className='flex flex-wrap items-baseline justify-between gap-3 border-t border-[var(--brass-line)] pt-6'>
									<div className='flex flex-wrap items-center gap-3'>
										<h3 className='section-title section-title-sm text-[var(--ink)]'>
											District filers
										</h3>
										<ConfidenceBadge confidence='working' />
									</div>
									<p className='num font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
										{party.district.length}
									</p>
								</div>

								{/* The gap is the grid's, on both axes. It carried `gap-x` only and
								    left each province to space itself with a top margin that was
								    then cancelled at `lg` — so in two columns the provinces ran
								    into each other, one roster's last filer sitting directly on the
								    next province's rule. */}
								<div className='mt-6 grid gap-x-12 gap-y-12 lg:grid-cols-2'>
									{districtGroups.map((group) => (
										<div key={group.area}>
											{/* The label needs room under it, like every other small header
											    on the estate. At `pb-2` the province sat on its own rule and
											    the first filer sat on the other side of it, so the three read
											    as one block of type rather than as a heading and a roster. */}
											<div className='flex items-baseline justify-between gap-3 border-b border-[var(--rule)] pb-4'>
												<p className='bb-label'>{group.area}</p>
												<p className='num font-mono text-[11px] text-[var(--ink-3)]'>
													{group.candidates.length}
												</p>
											</div>

											<div className='mt-2'>
											{group.candidates.map((candidate) => (
												<div
													key={candidate.candidate_id}
													className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[var(--rule-soft)] py-3'
												>
													<p className='flex min-w-0 items-center gap-3'>
														<PersonAvatar name={candidate.name_as_reported} partyId={party.party_id} size={36} />
														<span className='min-w-0 break-words text-[15px] font-semibold leading-snug text-[var(--ink)]'>
															{displayName(candidate.name_as_reported)}
														</span>
													</p>
													<p className='shrink-0 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
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
