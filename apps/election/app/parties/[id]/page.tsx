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
	getSourcesViewModel,
	groupDistrictCandidates,
	type Source,
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

	const { sources } = getSourcesViewModel()
	const sourceById = new Map<string, Source>(sources.map((source) => [source.id, source]))
	const referencedSources = (party.source_ids ?? [])
		.map((sourceId) => sourceById.get(sourceId))
		.filter((source): source is Source => Boolean(source))

	const districtGroups = groupDistrictCandidates(party.district)
	const nominees2026 = party.party_representative_nominees_2026
	const legacy = party.legacy_party_representative_nominees_2025_reference

	const facts = [
		{ value: party.party_representative_seats_vying_for ?? 0, label: 'Seats vying for' },
		{ value: party.computedStats.sectoralCandidates, label: 'Sectoral links' },
		{ value: party.computedStats.districtCocFilers, label: 'District filers' },
	]

	return (
		<ElectionShell>
			{/* ---- The entry ---- */}
			<section className='bb-lattice relative overflow-hidden'>
				<OkirBloom className='absolute -right-[14%] -top-[38%] size-[min(44rem,86vw)] opacity-[0.15]' />

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
							<PartyMark partyId={party.party_id} ballotName={party.ballot_name} size={72} />
							<h1 className='bb-display text-[var(--ink)]'>{party.ballot_name}</h1>
						</div>
					</Rise>

					<Rise delay={0.2} distance={14}>
						<p className='bb-measure mt-6 text-[17px] font-semibold leading-8 text-[var(--ink)]'>
							{party.full_name}
						</p>
					</Rise>

					{party.description ? (
						<Rise delay={0.26} distance={14}>
							<p className='bb-measure mt-5 bb-body text-[var(--ink-2)]'>{party.description}</p>
						</Rise>
					) : null}

					{party.cmNominee ? (
						<Rise delay={0.32} distance={12}>
							<div className='mt-7 inline-flex items-center gap-4 border border-[var(--brass-line)] p-3 pr-5'>
								<PersonAvatar name={party.cmNominee} size={52} />
								<div>
									<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>
										Chief-minister nominee
									</p>
									<p className='mt-1.5 text-[17px] font-bold leading-none text-[var(--ink)]'>
										{party.cmNominee}
									</p>
								</div>
							</div>
						</Rise>
					) : null}

					<Rise delay={0.4} distance={14}>
						<dl className='mt-12 flex flex-wrap gap-x-10 gap-y-6 border-t border-[var(--brass-line)] pt-6'>
							{facts.map((fact) => (
								<div key={fact.label}>
									<dd className='bb-figure-sm text-[var(--ink)]'>{fact.value}</dd>
									<dt className='mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
										{fact.label}
									</dt>
								</div>
							))}
						</dl>
					</Rise>

					{party.aliases && party.aliases.length > 0 ? (
						<Rise delay={0.46} distance={12}>
							<p className='mt-6 font-mono text-[10px] font-semibold uppercase leading-6 tracking-[0.14em] text-[var(--ink-3)]'>
								Also known as: {party.aliases.join(' · ')}
							</p>
						</Rise>
					) : null}
				</div>

				<div className='bb-weave' aria-hidden='true' />
			</section>

			{/* ---- Background ---- */}
			{party.background ? (
				<section className='bb-container bb-section'>
					<SectionHead
						index='01'
						eyebrow='Background'
						title='Where this'
						titleMuted='entry comes from.'
						lead='Gathered from public reporting rather than from the certified list, and marked accordingly.'
						aside={<ConfidenceBadge confidence='reference' />}
					/>

					<div className='mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16'>
						<Rise distance={14}>
							<div>
								<p className='bb-measure bb-body text-[var(--ink-2)]'>
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

						{party.background.affiliation ||
						(party.background.leaders && party.background.leaders.length > 0) ? (
							<Rise delay={0.12} distance={14}>
								<div className='flex flex-col gap-8 border-t border-[var(--brass-line)] pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0'>
									{party.background.affiliation ? (
										<div>
											<p className='bb-label'>Affiliation</p>
											<p className='mt-3 bb-body text-[var(--ink-2)]'>
												{party.background.affiliation}
											</p>
										</div>
									) : null}

									{party.background.leaders && party.background.leaders.length > 0 ? (
										<div>
											<p className='bb-label'>Reported figures</p>
											<ul className='mt-3'>
												{party.background.leaders.map((leader) => (
													<li
														key={leader}
														className='flex items-baseline gap-2.5 border-b border-[var(--rule-soft)] py-2 bb-body text-[var(--ink-2)]'
													>
														<span
															aria-hidden='true'
															className='mt-1.5 size-1.5 shrink-0 rotate-45 bg-[var(--brass)]'
														/>
														<span className='min-w-0 break-words'>{leader}</span>
													</li>
												))}
											</ul>
										</div>
									) : null}
								</div>
							</Rise>
						) : null}
					</div>
				</section>
			) : null}

			{/* ---- Who fills the seats ---- */}
			<section className='bb-container bb-section-bottom'>
				<SectionHead
					index='02'
					eyebrow='Nominees'
					title='Who fills the seats'
					titleMuted='this party wins.'
					lead='Party-representative seats are filled from a list the party files, not from the ballot. Which list is in force is the thing to watch here.'
				/>

				<Rise distance={14}>
					<dl className='mt-12 grid gap-px border border-[var(--rule)] bg-[var(--rule)] md:grid-cols-2'>
						<div className='bg-[var(--paper)] p-6'>
							<dt className='flex flex-wrap items-center gap-2.5'>
								<span className='bb-label'>2026 nominees</span>
								<ConfidenceBadge confidence='working' />
							</dt>
							<dd className='mt-4 bb-body text-[var(--ink-2)]'>
								{nominees2026?.note ??
									'The official 2026 list of nominees has not been imported into this workspace yet.'}
							</dd>
						</div>
						<div className='bg-[var(--paper)] p-6'>
							<dt className='flex flex-wrap items-center gap-2.5'>
								<span className='bb-label'>2025 reference</span>
								<ConfidenceBadge confidence='legacy' />
							</dt>
							<dd className='mt-4 bb-body text-[var(--ink-2)]'>
								{legacy?.warning ?? 'No legacy 2025 nominee list is attached to this party.'}
							</dd>
						</div>
					</dl>
				</Rise>
			</section>

			{/* ---- The people running under it ---- */}
			{party.sectoral.length > 0 || party.district.length > 0 ? (
				<section className='bb-ground bb-grain bb-lattice relative isolate overflow-hidden border-y border-[var(--rule)] py-16 lg:py-24'>
					<div className='bb-container'>
						<SectionHead
							index='03'
							eyebrow='On the ballot'
							title='The names carrying'
							titleMuted='this label.'
							lead='Sectoral nominees come from the regional certified list. District filers are working records from reporting on COMELEC filings, and a label reported in a district is not always one of the regional ballot entries.'
						/>

						{party.sectoral.length > 0 ? (
							<div className='mt-12'>
								<div className='flex flex-wrap items-baseline justify-between gap-3 border-t border-[var(--brass-line)] pt-6'>
									<h3 className='bb-display-sm text-[var(--ink)]'>Sectoral nominees</h3>
									<p className='num font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
										{party.sectoral.length}
									</p>
								</div>

								<div className='mt-6 grid gap-px bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-3'>
									{party.sectoral.map((candidate) => (
										<div
											key={`${candidate.sector}-${candidate.rank_or_number}-${candidate.full_name}`}
											className='flex items-start gap-4 bg-[var(--paper)] p-5'
										>
											<PersonAvatar name={candidate.full_name} size={44} />
											<div className='min-w-0'>
											<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>
												{candidate.sector}
											</p>
											<h4 className='mt-2 text-[17px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
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
										<h3 className='bb-display-sm text-[var(--ink)]'>District filers</h3>
										<ConfidenceBadge confidence='working' />
									</div>
									<p className='num font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
										{party.district.length}
									</p>
								</div>

								<div className='mt-6 grid gap-x-10 lg:grid-cols-2'>
									{districtGroups.map((group) => (
										<div key={group.area} className='mt-8 first:mt-0 lg:mt-0'>
											<div className='flex items-baseline justify-between gap-3 border-b border-[var(--rule)] pb-2'>
												<p className='bb-label'>{group.area}</p>
												<p className='num font-mono text-[11px] text-[var(--ink-3)]'>
													{group.candidates.length}
												</p>
											</div>

											{group.candidates.map((candidate) => (
												<div
													key={candidate.candidate_id}
													className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[var(--rule-soft)] py-3'
												>
													<p className='flex min-w-0 items-center gap-3'>
														<PersonAvatar name={candidate.name_as_reported} size={36} />
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
									))}
								</div>
							</div>
						) : null}
					</div>
				</section>
			) : null}

			{/* ---- Sources ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='04'
					eyebrow='Sources'
					title='What this entry'
					titleMuted='is built on.'
					lead='Every claim on this page traces to one of these records on the registry.'
				/>

				<div className='mt-12 border-t border-[var(--ink)]'>
					{referencedSources.length > 0 ? (
						referencedSources.map((source) => (
							<Rise key={source.id} distance={12}>
								<a
									href={source.url ?? '#'}
									target={source.url ? '_blank' : undefined}
									rel={source.url ? 'noreferrer' : undefined}
									className='group grid gap-x-10 gap-y-1 border-b border-[var(--rule)] py-5 transition-colors hover:bg-[var(--paper-2)] lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_2rem]'
								>
									<p className='min-w-0 break-words font-mono text-[10px] font-semibold uppercase leading-5 tracking-[0.14em] text-[var(--brass)]'>
										{source.id}
									</p>
									<div className='min-w-0'>
										<p className='break-words text-[15px] font-semibold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]'>
											{source.title}
										</p>
										{source.publisher ? (
											<p className='mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
												{source.publisher}
											</p>
										) : null}
									</div>
									{source.url ? (
										<span
											aria-hidden='true'
											className='hidden self-center font-mono text-[var(--ink-3)] transition group-hover:text-[var(--accent)] lg:block'
										>
											↗
										</span>
									) : null}
								</a>
							</Rise>
						))
					) : (
						<p className='py-5 bb-body text-[var(--ink-3)]'>
							No sources are attached to this party record.
						</p>
					)}
				</div>
			</section>
		</ElectionShell>
	)
}
