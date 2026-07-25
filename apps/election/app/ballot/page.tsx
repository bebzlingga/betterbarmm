import type { Metadata } from "next";
import {
  type BallotArea,
  type BallotParty,
  type BallotSector,
  BallotPicker,
} from "../_components/ballot-picker";
import {
  CandidateBrowser,
  type CandidateRow,
} from "../_components/candidate-browser";
import { ElectionPageHeader } from "../_components/election-page-header";
import { ElectionShell } from "../_components/election-shell";
import { PartyCard } from "../_components/party-card";
import { SectionNav } from "../_components/section-nav";
import {
  getElectionViewModel,
  getPartyGroups,
  resolveDistrictConfidence,
} from "../_lib/election-data";

export const metadata: Metadata = {
  title: "Your ballot — BetterBARMM Election",
  description:
    "Everything on the 2026 BARMM ballot in one place: pick your district to see your three tracks, meet the 13 regional parties by bloc, and search every sectoral and district candidate.",
};

export default function BallotPage() {
  const {
    districtAreas,
    districtCandidates,
    election,
    parties,
    sectoralCandidates,
    sectoralGroups,
    stats,
  } = getElectionViewModel();
  const partyGroups = getPartyGroups();

  // --- Ballot picker data ---
  const candidateById = new Map(
    districtCandidates.map((candidate) => [candidate.candidate_id, candidate]),
  );
  const seatByArea = new Map(
    election.district_seat_distribution_current_framework.map((item) => [
      item.constituency,
      item.seats,
    ]),
  );
  const seatBySector = new Map(
    election.sectoral_seat_distribution.map((item) => [item.sector, item.seats]),
  );

  const areas: BallotArea[] = districtAreas.map((area) => ({
    area: area.area,
    seats: seatByArea.get(area.area) ?? 0,
    districts: area.districts.map((district) => ({
      district: district.district,
      candidates: district.candidate_ids
        .map((id) => candidateById.get(id))
        .filter((candidate) => Boolean(candidate))
        .map((candidate) => ({
          id: candidate!.candidate_id,
          name: candidate!.name_as_reported,
          partyId: candidate!.normalized_party_id ?? null,
          partyLabel: candidate!.party_label_as_reported ?? "Independent",
          confidence: resolveDistrictConfidence(candidate!),
        })),
    })),
  }));

  const ballotParties: BallotParty[] = parties.map((party) => ({
    party_id: party.party_id,
    ballot_name: party.ballot_name,
    full_name: party.full_name,
  }));

  const sectors: BallotSector[] = sectoralGroups.map((group) => ({
    sector: group.sector,
    seats: seatBySector.get(group.sector) ?? group.candidates.length,
    candidates: group.candidates.map((candidate) => ({
      name: candidate.full_name,
      organization: candidate.organization_or_party,
      partyId: candidate.linked_party_id ?? null,
    })),
  }));

  // --- Candidate finder data ---
  const districtRows: CandidateRow[] = districtCandidates.map((candidate) => ({
    id: candidate.candidate_id,
    name: candidate.name_as_reported,
    track: "district",
    group: candidate.area,
    district: candidate.district,
    partyId: candidate.normalized_party_id ?? null,
    partyLabel: candidate.party_label_as_reported ?? "Independent",
    confidence: resolveDistrictConfidence(candidate),
  }));
  const sectoralRows: CandidateRow[] = sectoralCandidates.map((candidate) => ({
    id: `sectoral-${candidate.sector}-${candidate.rank_or_number}-${candidate.full_name}`,
    name: candidate.full_name,
    track: "sectoral",
    group: candidate.sector,
    partyId: candidate.linked_party_id ?? null,
    partyLabel:
      candidate.organization_or_party ??
      candidate.linked_party_id ??
      "No linked party",
    confidence: "official",
  }));
  const candidateRows = [...sectoralRows, ...districtRows];

  return (
    <ElectionShell activeItem="ballot">
      <ElectionPageHeader
        eyebrow="Voter guide"
        title="Know your ballot. Choose wisely."
        description="A BARMM voter fills three tracks on one ballot. Pick your district to see exactly what you choose from, then explore the 13 parties and every candidate running."
      />

      <SectionNav
        items={[
          { id: "ballot", label: "My ballot" },
          { id: "parties", label: `Parties · ${stats.regionalParties}` },
          { id: "candidates", label: `Candidates · ${candidateRows.length}` },
        ]}
      />

      <section id="ballot" className="scroll-mt-32 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="max-w-4xl">
            <p className="eyebrow">Step 1 · Your district</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-none tracking-[-0.035em] sm:text-5xl">
              What&rsquo;s on my ballot?
            </h2>
            <p className="mt-5 text-base leading-snug text-[var(--ink-2)] sm:text-lg sm:leading-8">
              Pick your area and district to assemble the three tracks you vote
              on — the region-wide party vote, your local district race, and the
              sectoral or reserved seats.
            </p>
          </div>
          <div className="mt-10">
            <BallotPicker areas={areas} parties={ballotParties} sectors={sectors} />
          </div>
        </div>
      </section>

      <section
        id="parties"
        className="scroll-mt-32 border-t border-[var(--ink)] bg-[var(--paper-2)] py-14 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="max-w-4xl">
            <p className="eyebrow">The parties · {stats.regionalParties} entries</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-none tracking-[-0.035em] sm:text-5xl">
              Know the parties, bloc by bloc.
            </h2>
            <p className="mt-5 text-base leading-snug text-[var(--ink-2)] sm:text-lg sm:leading-8">
              Voters choose one regional party for the party-representative
              track. That vote helps share the {stats.partyRepresentativeSeats}{" "}
              proportional seats. Select a party for its background, sectoral
              links, and district filers.
            </p>
          </div>
          {partyGroups.map((group) => (
            <div key={group.bloc} className="mt-12">
              <div className="flex flex-col gap-2 border-b border-[var(--rule)] pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <h3 className="text-xl font-extrabold leading-none tracking-[-0.03em] sm:text-2xl">
                    {group.bloc}
                  </h3>
                  <p className="mt-2 text-sm leading-snug text-[var(--ink-2)]">
                    {group.summary}
                  </p>
                </div>
                <p className="num shrink-0 font-mono text-sm font-bold text-[var(--ink-3)]">
                  {group.parties.length} part
                  {group.parties.length === 1 ? "y" : "ies"}
                </p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.parties.map((party) => (
                  <PartyCard key={party.party_id} party={party} showDescription />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="candidates"
        className="scroll-mt-32 border-t border-[var(--ink)] py-14 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="max-w-4xl">
            <p className="eyebrow">Candidate finder</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-none tracking-[-0.035em] sm:text-5xl">
              Search {candidateRows.length} sectoral and district candidates.
            </h2>
            <p className="mt-5 text-base leading-snug text-[var(--ink-2)] sm:text-lg sm:leading-8">
              Filter the combined candidate field by track, area or sector, and
              party, or search by name. District filers are working records
              pending official verification; sectoral candidates come from the
              regional certified list.
            </p>
          </div>
          <div className="mt-10">
            <CandidateBrowser rows={candidateRows} />
          </div>
        </div>
      </section>
    </ElectionShell>
  );
}
