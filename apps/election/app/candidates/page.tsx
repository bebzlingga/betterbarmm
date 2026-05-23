import { ElectionPageHeader } from '../_components/election-page-header'
import { ElectionShell } from '../_components/election-shell'
import { type DistrictCandidate, getElectionViewModel, labelize } from '../_lib/election-data'

type ElectionViewModel = ReturnType<typeof getElectionViewModel>
type Party = ElectionViewModel['parties'][number]

function CandidateMetric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
	return (
		<div className='border-l border-[var(--rule)] px-4 py-5 sm:px-6'>
			<p className='eyebrow text-[9px]'>{label}</p>
			<p className='num mt-3 text-4xl font-extrabold leading-none tracking-[-0.03em]'>{value}</p>
			<p className='mt-3 text-sm leading-snug text-[var(--ink-3)]'>{detail}</p>
		</div>
	)
}

function PartyListCard({ party }: { party: Party }) {
	return (
		<article className='flex min-h-full flex-col border border-[var(--rule)] bg-[var(--paper)] p-6'>
			<div className='flex items-start justify-between gap-4'>
				<p className='eyebrow text-[9px]'>{party.party_id}</p>
				<p className='font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]'>Party list</p>
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

export default function CandidatesPage() {
	const { districtAreas, districtCandidates, metadata, parties, sectoralGroups, stats } = getElectionViewModel()

	const districtCandidateById = new Map(districtCandidates.map((candidate) => [candidate.candidate_id, candidate]))

	return (
		<ElectionShell activeItem='candidates'>
			<ElectionPageHeader
				eyebrow='Candidates'
				title='Candidates and party lists.'
				description='Browse the regional party-list entries, sectoral candidates, and district COC filers organized for the 2026 BARMM Parliamentary Elections.'
				meta={metadata.electionDay}
			/>

			<section className='border-b border-[var(--ink)]'>
				<div className='mx-auto grid max-w-7xl grid-cols-1 px-2 min-[520px]:grid-cols-2 sm:px-4 lg:grid-cols-4'>
					<CandidateMetric
						label='Party lists'
						value={stats.regionalParties}
						detail='Regional parliamentary party entries.'
					/>
					<CandidateMetric
						label='District filers'
						value={stats.districtCocFilers}
						detail='COC filer coverage by district.'
					/>
					<CandidateMetric
						label='Sectoral candidates'
						value={stats.sectoralCandidates}
						detail='Candidates grouped by sector.'
					/>
					<CandidateMetric
						label='Linked district'
						value={stats.linkedDistrictCandidates}
						detail='District filers linked to regional parties.'
					/>
				</div>
			</section>

			<section className='border-b border-[var(--ink)] py-14 sm:py-24 lg:py-32'>
				<div className='mx-auto max-w-7xl px-6 sm:px-8'>
					<div className='max-w-4xl'>
						<p className='eyebrow'>Party lists</p>
						<h2 className='mt-3 text-3xl font-extrabold leading-none tracking-[-0.035em] sm:text-5xl'>Regional parliamentary party entries.</h2>
						<p className='mt-5 text-base leading-snug text-[var(--ink-2)] sm:text-lg sm:leading-8'>
							These are the party-list entries voters choose from for the party-representative track. The party vote helps decide how the 40 regional party seats are shared in Parliament.
						</p>
					</div>
					<div className='mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{parties.map((party) => (
							<PartyListCard
								key={party.party_id}
								party={party}
							/>
						))}
					</div>
				</div>
			</section>

			<section className='border-b border-[var(--ink)] bg-[var(--paper-2)] py-14 sm:py-24 lg:py-32'>
				<div className='mx-auto max-w-7xl px-6 sm:px-8'>
					<div className='max-w-4xl'>
						<p className='eyebrow'>Sectoral candidates</p>
						<h2 className='mt-3 text-3xl font-extrabold leading-none tracking-[-0.035em] sm:text-5xl'>{stats.sectoralCandidates} candidates grouped by sector.</h2>
						<p className='mt-5 text-base leading-snug text-[var(--ink-2)] sm:text-lg sm:leading-8'>
							Sectoral seats are organized around the community or sector being represented, rather than an ordinary geographic district.
						</p>
					</div>
					<div className='mt-12 grid gap-6 lg:grid-cols-2'>
						{sectoralGroups.map((group) => (
							<article
								key={group.sector}
								className='border border-[var(--rule)] bg-[var(--paper)]'
							>
								<div className='border-b border-[var(--rule)] p-5'>
									<p className='eyebrow text-[9px]'>{group.sector}</p>
									<h3 className='mt-2 text-2xl font-extrabold leading-none tracking-[-0.03em]'>
										{group.candidates.length} candidate
										{group.candidates.length === 1 ? '' : 's'}
									</h3>
								</div>
								<div>
									{group.candidates.map((candidate) => (
										<div
											key={`${group.sector}-${candidate.rank_or_number}-${candidate.full_name}`}
											className='border-b border-[var(--rule-soft)] p-5 last:border-b-0'
										>
											<p className='font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]'>
												No. {candidate.rank_or_number} / {candidate.linked_party_id ?? 'No linked party'}
											</p>
											<h4 className='mt-2 text-lg font-extrabold leading-tight tracking-[-0.02em]'>{candidate.full_name}</h4>
											<p className='mt-2 text-sm leading-snug text-[var(--ink-2)]'>{candidate.organization_or_party}</p>
										</div>
									))}
								</div>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className='py-14 sm:py-24 lg:py-32'>
				<div className='mx-auto max-w-7xl px-6 sm:px-8'>
					<div className='max-w-4xl'>
						<p className='eyebrow'>District COC filers</p>
						<h2 className='mt-3 text-3xl font-extrabold leading-none tracking-[-0.035em] sm:text-5xl'>District candidate coverage by area.</h2>
						<p className='mt-5 text-base leading-snug text-[var(--ink-2)] sm:text-lg sm:leading-8'>
							District entries are grouped by area and parliamentary district so voters can scan the local candidate field separately from the party-list and sectoral tracks.
						</p>
					</div>
					<div className='mt-10 grid gap-6 lg:grid-cols-2'>
						{districtAreas.map((area) => (
							<article
								key={area.area}
								className='border border-[var(--rule)] bg-[var(--paper)]'
							>
								<div className='border-b border-[var(--rule)] p-5'>
									<p className='eyebrow text-[9px]'>{area.area}</p>
									<h3 className='mt-2 text-2xl font-extrabold leading-none tracking-[-0.03em]'>
										{area.district_count_in_current_framework} district
										{area.district_count_in_current_framework === 1 ? '' : 's'}
									</h3>
								</div>
								<div>
									{area.districts.map((district) => {
										const candidates = district.candidate_ids.map((id) => districtCandidateById.get(id)).filter((candidate): candidate is DistrictCandidate => Boolean(candidate))

										return (
											<div
												key={`${area.area}-${district.district}`}
												className='border-b border-[var(--rule-soft)] p-5 last:border-b-0'
											>
												<div className='flex items-start justify-between gap-4'>
													<h4 className='text-lg font-extrabold leading-tight tracking-[-0.02em]'>{district.district}</h4>
													<p className='font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]'>
														{candidates.length} filer
														{candidates.length === 1 ? '' : 's'}
													</p>
												</div>
												<div className='mt-4 grid gap-3'>
													{candidates.map((candidate) => (
														<div
															key={candidate.candidate_id}
															className='grid gap-1 border-l border-[var(--rule)] pl-3'
														>
															<p className='text-sm font-bold leading-5'>{candidate.name_as_reported}</p>
															<p className='text-xs leading-5 text-[var(--ink-3)]'>
																{candidate.party_label_as_reported ?? 'Party not reported'} / {labelize(candidate.candidate_status)}
															</p>
														</div>
													))}
												</div>
											</div>
										)
									})}
								</div>
							</article>
						))}
					</div>
				</div>
			</section>
		</ElectionShell>
	)
}
