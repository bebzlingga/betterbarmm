import type { Metadata } from 'next'
import { SectionHead } from '@betterbarmm/editorial'
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

/**
 * Figures as words, for the one place a numeral reads wrong.
 *
 * A headline set at display size is the exception to the estate's rule that a
 * figure is printed as a figure: "13 entries." at 5rem looks like a typo. The
 * words are counted from the data rather than written into the heading, so a
 * party joining or a bloc consolidating moves the headline instead of leaving
 * it quietly wrong — which is the failure nobody notices, because a heading
 * that says thirteen does not look broken when there are fourteen.
 */
const COUNT_WORDS = [
	'Zero',
	'One',
	'Two',
	'Three',
	'Four',
	'Five',
	'Six',
	'Seven',
	'Eight',
	'Nine',
	'Ten',
	'Eleven',
	'Twelve',
	'Thirteen',
	'Fourteen',
	'Fifteen',
	'Sixteen',
]

const countWord = (count: number) => COUNT_WORDS[count] ?? String(count)

export default function CandidatesPage() {
	const { districtCandidates, sectoralCandidates, stats } = getElectionViewModel()
	const partyGroups = getPartyGroups()
	const partyCountWord = countWord(stats.regionalParties)
	const blocCountWord = countWord(partyGroups.length).toLowerCase()

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
			{/* An invitation rather than a description, which is what a page a
			    reader arrives at to look someone up should open with.

			    "On the ballot" is doing colloquial work here: the eight reserved
			    seats are filled from a certified list and never printed on the
			    paper, as the home page's ballot diagram says outright. The
			    standfirst below carries that qualification — parties, sectoral
			    nominees and district filers, named separately — so the headline can
			    be the plain phrase people actually use for this. */}
			<Masthead
				label='Candidates & parties'
				lines={['Explore the people', 'on the ballot.']}
				muted={[1]}
				size='lg'
				standfirst={`The ${stats.regionalParties} parties every voter in the region chooses from, and every sectoral nominee and district filer this workspace holds a record for — searchable by name, by party, and by the place they are running in.`}
				/* The registry's own masthead shape: each figure says what it counts
				   and where it came from, because the three routes onto this page are
				   not equally solid and a reader should be able to see that before
				   they search. */
				facts={[
					{
						value: stats.regionalParties,
						label: 'Parties',
						count: true,
						detail: 'On the regional ballot — the same list for every voter in the region.',
					},
					{
						value: candidateRows.length,
						label: 'Names on record',
						count: true,
						detail: 'Everyone this workspace holds a record for, on all three routes.',
					},
					{
						value: stats.sectoralCandidates,
						label: 'Sectoral nominees',
						count: true,
						detail: 'From the regional certified list, for the seats never printed on a ballot.',
					},
					{
						value: districtRows.length,
						label: 'District filers',
						count: true,
						detail: 'Working records from reporting on COMELEC filings — verify against the official list.',
					},
				]}
			/>

			{/* ---- The parties ---- */}
			<section id='parties' className='bb-container bb-section scroll-mt-24'>
				<SectionHead
					index='01'
					eyebrow={`The party vote · ${stats.regionalParties} entries`}
					title={`${partyCountWord} entries,`}
					titleMuted={`${blocCountWord} blocs.`}
					lead={`One of these takes your party vote, and the ${stats.partyRepresentativeSeats} party-representative seats are shared out in proportion to how the region votes. Open any entry for its background, its chief-minister nominee, and the candidates running under it.`}
				/>

				<div className='mt-12'>
					{partyGroups.map((group) => (
						<div key={group.bloc} className='mt-12 first:mt-0'>
							<div className='flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between'>
								<div className='bb-measure'>
									{/* A step down from the display scale. A bloc heading names a
									    group of cards inside a section that already has its own head
									    above it — at `bb-display-sm` it ran to fifty points and read
									    as a second section opening rather than as a label over a
									    grid. `.section-title-sm` is the estate's own step for exactly
									    that: the display face, the same weight, half the size. */}
									<h3 className='section-title section-title-sm text-[var(--ink)]'>
										{group.bloc}
									</h3>
									<p className='mt-3 bb-body text-[var(--ink-2)]'>{group.summary}</p>
								</div>
								<p className='num shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
									{group.parties.length} {group.parties.length === 1 ? 'party' : 'parties'}
								</p>
							</div>

							{/* No frame, no seam, no ground behind the gaps — the space
							    between the cards is what separates them, the way it separates
							    everything else on the page. The one-pixel grid this replaces
							    only read as hairlines while every cell was filled: thirteen
							    parties in three tracks leave two cells empty, and those showed
							    the tinted ground itself as a panel where two cards should be. */}
							<div className='mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3'>
								{group.parties.map((party) => (
									<PartyCard key={party.party_id} party={party} showDescription />
								))}
							</div>
						</div>
					))}
				</div>
			</section>

			{/* ---- Everyone running ---- */}
			{/* Closer to the parties above it. The okir rule that used to mark the
			    join is gone, and with a full section step on both sides of where it
			    was the two blocks read as two pages rather than as a list of parties
			    and then a search across everyone in them. */}
			<section id='candidates' className='bb-container bb-section-bottom scroll-mt-24 pt-8 lg:pt-12'>
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
