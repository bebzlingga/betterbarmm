import type { Metadata } from 'next'
import { OkirRule, Rise, SectionHead } from '@betterbarmm/editorial'
import { CandidateBrowser, type CandidateRow } from '../_components/candidate-browser'
import { ElectionShell } from '../_components/election-shell'
import { Masthead } from '../_components/masthead'
import { PartyCard } from '../_components/party-card'
import {
	getElectionViewModel,
	getPartyGroups,
	resolveDistrictConfidence,
} from '../_lib/election-data'
import { displayName } from '../_lib/names'

export const metadata: Metadata = {
	title: 'Candidates & parties — BetterBARMM Election',
	description:
		'Everyone running in the 2026 Bangsamoro Parliamentary Election: the 13 parties on the regional ballot and every sectoral nominee and district filer on record, searchable by name, party, and place.',
}

export default function CandidatesPage() {
	const { districtCandidates, parties, sectoralCandidates, stats } = getElectionViewModel()
	const partyGroups = getPartyGroups()

	const districtRows: CandidateRow[] = districtCandidates.map((candidate) => ({
		id: candidate.candidate_id,
		name: displayName(candidate.name_as_reported),
		track: 'district',
		group: candidate.area,
		district: candidate.district,
		partyId: candidate.normalized_party_id ?? null,
		partyLabel: candidate.party_label_as_reported ?? 'Independent',
		confidence: resolveDistrictConfidence(candidate),
	}))
	const sectoralRows: CandidateRow[] = sectoralCandidates.map((candidate) => ({
		id: `sectoral-${candidate.sector}-${candidate.rank_or_number}-${candidate.full_name}`,
		name: displayName(candidate.full_name),
		track: 'sectoral',
		group: candidate.sector,
		partyId: candidate.linked_party_id ?? null,
		partyLabel:
			candidate.organization_or_party ?? candidate.linked_party_id ?? 'No linked party',
		confidence: 'official',
	}))
	const candidateRows = [...sectoralRows, ...districtRows]

	return (
		<ElectionShell>
			<Masthead
				label='Candidates & parties'
				lines={['Everyone', 'on the ballot.']}
				muted={[1]}
				standfirst={`The ${stats.regionalParties} parties every voter in the region chooses from, and every sectoral nominee and district filer this workspace holds a record for — searchable by name, by party, and by the place they are running in.`}
				facts={[
					{ value: stats.regionalParties, label: 'Parties', count: true },
					{ value: candidateRows.length, label: 'Candidates on record', count: true },
					{ value: stats.sectoralCandidates, label: 'Sectoral nominees', count: true },
				]}
			/>

			{/* ---- The parties ---- */}
			<section id='parties' className='bb-container bb-section scroll-mt-24'>
				<SectionHead
					index='01'
					eyebrow={`The party vote · ${stats.regionalParties} entries`}
					title='Thirteen entries,'
					titleMuted='four blocs.'
					lead={`One of these takes your party vote, and the ${stats.partyRepresentativeSeats} party-representative seats are shared out in proportion to how the region votes. Open any entry for its background, its chief-minister nominee, and the candidates running under it.`}
				/>

				<div className='mt-12'>
					{partyGroups.map((group) => (
						<div key={group.bloc} className='mt-12 first:mt-0'>
							<div className='flex flex-col gap-3 border-t border-[var(--brass-line)] pt-6 sm:flex-row sm:items-baseline sm:justify-between'>
								<div className='bb-measure'>
									<h3 className='bb-display-sm text-[var(--ink)]'>{group.bloc}</h3>
									<p className='mt-3 bb-body text-[var(--ink-2)]'>{group.summary}</p>
								</div>
								<p className='num shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
									{group.parties.length} {group.parties.length === 1 ? 'party' : 'parties'}
								</p>
							</div>

							<div className='mt-8 grid gap-px bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-3'>
								{group.parties.map((party) => (
									<PartyCard key={party.party_id} party={party} showDescription />
								))}
							</div>
						</div>
					))}
				</div>

				{/* Said once, here, because it is the reason most of the grid above and
				    the list below carries a lettered plate rather than a face. */}
				<Rise delay={0.1} distance={12}>
					<p className='bb-measure mt-12 border-t border-[var(--rule)] pt-6 bb-body text-[var(--ink-3)]'>
						Emblems and portraits are printed only where the party or the Bangsamoro Parliament has
						published one under a licence that allows it. Everyone else carries a lettered plate —
						a blank on the record, not a missing picture.
					</p>
				</Rise>
			</section>

			<OkirRule className='mx-auto max-w-[88rem] opacity-70' />

			{/* ---- Everyone running ---- */}
			<section id='candidates' className='bb-container bb-section scroll-mt-24'>
				<SectionHead
					index='02'
					eyebrow='Candidate finder'
					title={`${candidateRows.length} names,`}
					titleMuted='one search.'
					lead='Sectoral nominees come from the regional certified list. District filers are working records taken from reporting on COMELEC filings — verify them against the official district list, since filers withdraw and get substituted. Search a name, a party, or a district.'
				/>

				<div className='mt-12'>
					<CandidateBrowser rows={candidateRows} />
				</div>
			</section>
		</ElectionShell>
	)
}
