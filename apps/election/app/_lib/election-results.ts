/* ============================================================
   What happened on 14 September 2026

   The rest of this workspace describes a ballot: who was on it, how the
   seats are filled, and why the date moved four times. This file carries the
   other half — the count itself, as the COMELEC Regional Board of Canvassers
   proclaimed it two days later.

   It is a separate dataset and a separate module on purpose. `election.min.json`
   is a pre-election record and stays one; nothing here edits a candidate list
   after the fact, which is exactly the kind of quiet rewriting a public record
   should not do. A reader comparing the two sees the ballot and the result as
   two documents, because that is what they are.
   ============================================================ */

import resultsJson from "../../../../datasets/election/election-results.json";
import type { Confidence } from "./confidence";
import type { TimelineEvent } from "./election-data";

export type ResultCandidate = {
  name: string;
  party_id: string | null;
  party_label: string;
  votes: number | null;
  won: boolean;
  /** Sat in the appointed interim parliament before the election. */
  interim_mp: boolean;
};

export type PartyTotal = {
  party_id: string | null;
  label: string;
  party_representative_votes: number;
  party_representative_seats: number;
  district_votes: number;
  district_seats: number;
  sectoral_votes: number | null;
  sectoral_seats: number;
  total_seats: number;
  /** The BGC contested the districts through these; its bloc line is their sum. */
  district_component_parties: string[];
  note?: string;
};

export type PartyLine = {
  party_id: string | null;
  label: string;
  votes: number;
  seats: number;
};

export type DistrictResult = {
  area: string;
  district: string;
  label: string;
  total_votes: number;
  candidates: ResultCandidate[];
};

export type SectorRace = {
  sector: string;
  seats: number;
  invalid_votes: number | null;
  candidates: ResultCandidate[];
};

export type ResultSource = {
  id: string;
  title: string;
  publisher: string;
  type: string;
  url: string;
  date: string;
};

type ElectionResults = {
  schema_version: string;
  dataset_name: string;
  generated_at: string;
  election_id: string;
  election_day: string;
  status: string;
  confidence: Confidence;
  note: string;
  turnout: {
    registered_voters: number;
    votes_cast: number;
    turnout_percent: number;
    source_id: string;
  };
  outcome: {
    majority_threshold: number;
    largest_party_id: string;
    largest_party_seats: number;
    hung_parliament: boolean;
    chief_minister: string | null;
    first_session: string;
    summary: string;
    source_ids: string[];
  };
  party_totals: PartyTotal[];
  proportional_representation: {
    seats: number;
    invalid_votes: number;
    invalid_note: string;
    parties: PartyLine[];
    elected_nominees: Array<{
      name: string;
      party_id: string;
      bta_incumbent: boolean;
    }>;
    source_ids: string[];
  };
  district_representation: {
    seats: number;
    invalid_votes: number;
    parties: PartyLine[];
    districts: DistrictResult[];
    source_ids: string[];
  };
  sectoral_representation: {
    seats: number;
    votes_note: string;
    parties: PartyLine[];
    races: SectorRace[];
    non_moro_indigenous_peoples: {
      seats: number;
      method: string;
      elected: Array<{ name: string; group: string }>;
      rotation: string[];
      source_ids: string[];
    };
    source_ids: string[];
  };
  sources: ResultSource[];
};

const results = resultsJson as unknown as ElectionResults;

/**
 * The color a bloc takes in the seat figures.
 *
 * Not the party's own color, and the reason is in `party-color.ts`: those are
 * identity, they never encode a quantity, and three of them — BFP, BGC and Pro
 * Bangsamoro — are the same navy within a few points of each other. Printed as
 * a chamber that is forty-seven seats the eye cannot separate, which is most of
 * the Parliament.
 *
 * So the figures take the estate's three chart colors, which were picked to
 * hold apart from each other and were measured under protanopia when the home
 * page's three tracks were set. The party's own color still appears on its
 * plate in the table below, beside its name, doing the job it is for.
 */
const BLOC_COLORS: Record<string, string> = {
  BFP: "var(--slate)",
  UBJP: "var(--accent)",
  BGC: "var(--ochre)",
};

const OTHERS_COLOR = "var(--ink-3)";

export function blocColor(partyId: string | null): string {
  return (partyId && BLOC_COLORS[partyId]) || OTHERS_COLOR;
}

/**
 * Seats in the chamber, largest bloc first.
 *
 * The order is the order the hemicycle is laid out in, so the arc reads from
 * the largest party on the left to the single seats on the right rather than
 * scattering a bloc through the room.
 */
function seatedBlocs(): PartyTotal[] {
  return [...results.party_totals].sort((a, b) => b.total_seats - a.total_seats);
}

// The count's own four dates, in the shape the axis on the home page reads.
// They are derived from the result rather than researched alongside it, which
// is why they sit with the results module rather than in the supplement.
const resultsTimeline: TimelineEvent[] = [
  {
    date: "2026-08-26",
    event_type: "sectoral_selection",
    title: "Non-Moro Indigenous Peoples choose their two members",
    description:
      "The Regional Inter-Tribal Convention in Cotabato City selected the two reserved Non-Moro Indigenous Peoples representatives by traditional process rather than by ballot.",
    source_ids: ["mindanews_nmip", "inquirer_nmip"],
  },
  {
    date: "2026-09-15",
    event_type: "proclamation",
    title: "All 32 district winners proclaimed",
    description:
      "District boards of canvassers proclaimed the winners in every parliamentary district the day after the vote.",
    source_ids: ["comelec_coc_results"],
  },
  {
    date: "2026-09-16",
    event_type: "proclamation",
    title: "The first elected Parliament is proclaimed",
    description:
      "After midnight, the COMELEC Regional Board of Canvassers proclaimed all 80 members. No party reached the 41 seats a Chief Minister needs.",
    source_ids: ["bio_proclaimed", "afp_hung_parliament"],
  },
  {
    date: "2026-10-30",
    event_type: "first_session",
    title: "The elected Parliament takes office",
    description:
      "The 80 members begin their term and elect a Chief Minister from among themselves.",
    source_ids: ["bio_proclaimed"],
  },
];

/** The post-election events, for the axis the home page draws. */
export function getResultTimelineEvents(): TimelineEvent[] {
  return resultsTimeline;
}

export function getResultsViewModel() {
  const blocs = seatedBlocs();
  const { outcome, turnout } = results;
  const sourcesById = new Map(results.sources.map((source) => [source.id, source]));

  // The legend carries three blocs and one remainder. Four single- and
  // double-seat entries each with their own color is a key nobody reads; the
  // table under the figure gives every one of them its own line and its own
  // numbers, which is where a reader looks for the fourth-largest anything.
  const named = blocs.filter((bloc) => bloc.party_id && BLOC_COLORS[bloc.party_id]);
  const others = blocs.filter((bloc) => !bloc.party_id || !BLOC_COLORS[bloc.party_id]);
  const othersSeats = others.reduce((sum, bloc) => sum + bloc.total_seats, 0);

  const tracks = [
    ...named.map((bloc) => ({
      key: bloc.party_id ?? bloc.label,
      label: bloc.label,
      seats: bloc.total_seats,
      color: blocColor(bloc.party_id),
    })),
    ...(othersSeats
      ? [
          {
            key: "others",
            label: `${others.map((bloc) => bloc.label).join(", ")}`,
            seats: othersSeats,
            color: OTHERS_COLOR,
          },
        ]
      : []),
  ];

  const totalSeats = blocs.reduce((sum, bloc) => sum + bloc.total_seats, 0);

  return {
    results,
    confidence: results.confidence,
    note: results.note,
    status: results.status,
    turnout,
    outcome,
    blocs,
    tracks,
    totalSeats,
    /** How far the largest bloc falls short of governing on its own. */
    shortfall: outcome.majority_threshold - outcome.largest_party_seats,
    proportional: results.proportional_representation,
    district: results.district_representation,
    sectoral: results.sectoral_representation,
    sources: results.sources,
    sourceById: (id: string) => sourcesById.get(id),
    /** Districts in the order the areas appear, each with its winner first. */
    districtsByArea: groupDistricts(results.district_representation.districts),
    metadata: {
      electionDay: results.election_day,
      generatedAt: results.generated_at,
      datasetName: results.dataset_name,
    },
  };
}

function groupDistricts(districts: DistrictResult[]) {
  const groups = new Map<string, DistrictResult[]>();

  for (const district of districts) {
    const current = groups.get(district.area) ?? [];
    current.push(district);
    groups.set(district.area, current);
  }

  return Array.from(groups.entries()).map(([area, items]) => ({
    area,
    seats: items.length,
    districts: items.map((district) => ({
      ...district,
      candidates: [...district.candidates].sort(
        (a, b) => (b.votes ?? 0) - (a.votes ?? 0),
      ),
    })),
  }));
}

/**
 * How one party did, for its own page.
 *
 * Every entry on the regional ballot gets an answer here, including the eight
 * that took nothing and the one that was disqualified — "no seats" is a result
 * and a page that simply omits it is a page that looks like it has not been
 * updated.
 */
export function getPartyResult(partyId: string) {
  const total = results.party_totals.find((party) => party.party_id === partyId);
  const partyVote = results.proportional_representation.parties.find(
    (party) => party.party_id === partyId,
  );

  const districtWins = results.district_representation.districts
    .flatMap((district) => district.candidates)
    .filter((candidate) => candidate.won && candidate.party_id === partyId);
  const sectoralWins = results.sectoral_representation.races
    .flatMap((race) => race.candidates)
    .filter((candidate) => candidate.won && candidate.party_id === partyId);

  const prTotalVotes = results.proportional_representation.parties.reduce(
    (sum, party) => sum + party.votes,
    0,
  );

  return {
    disqualified: partyId === "MORO_AKO",
    totalSeats: total?.total_seats ?? districtWins.length + sectoralWins.length,
    seatsByTrack: total
      ? [
          { label: "from the party vote", seats: total.party_representative_seats },
          { label: "district seats", seats: total.district_seats },
          { label: "reserved seats", seats: total.sectoral_seats },
        ].filter((track) => track.seats > 0)
      : [],
    partyVoteVotes: partyVote?.votes ?? null,
    partyVoteSeats: partyVote?.seats ?? 0,
    partyVoteShare: partyVote ? (partyVote.votes / prTotalVotes) * 100 : null,
    districtWins,
    sectoralWins,
    componentParties: total?.district_component_parties ?? [],
    majorityThreshold: results.outcome.majority_threshold,
    chamberSeats: results.party_totals.reduce(
      (sum, party) => sum + party.total_seats,
      0,
    ),
  };
}

/** The winner of a race, and by how much. */
export function winnerOf(candidates: ResultCandidate[]) {
  const ranked = [...candidates].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
  const winners = ranked.filter((candidate) => candidate.won);
  const runnerUp = ranked.find((candidate) => !candidate.won) ?? null;

  return { winners, runnerUp, ranked };
}

export function share(votes: number | null, total: number): number | null {
  if (!votes || !total) return null;
  return (votes / total) * 100;
}
