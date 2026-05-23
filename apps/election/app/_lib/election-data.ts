import workspaceJson from "../../../../datasets/election/election.min.json";

export type Source = {
  id: string;
  title: string;
  type?: string;
  publisher?: string;
  date?: string;
  date_accessed?: string;
  url?: string;
  citation_note?: string;
  use_in_workspace?: string[];
};

type SeatDistribution = {
  constituency?: string;
  sector?: string;
  seats: number;
  note?: string;
};

type Election = {
  id: string;
  name: string;
  jurisdiction: string;
  election_day: string;
  status: string;
  office: string;
  parliament_structure: {
    total_seats: number;
    party_representative_seats: number;
    single_member_district_seats: number;
    sectoral_or_reserved_seats: number;
    majority_threshold: number;
    source_ids?: string[];
  };
  district_seat_distribution_current_framework: SeatDistribution[];
  sectoral_seat_distribution: SeatDistribution[];
  key_dates: {
    filing_of_cocs_and_nominee_lists: {
      start: string;
      end: string;
    };
    regional_clc_generated: string;
    election_period_start: string;
    campaign_period: {
      start: string;
      end: string;
    };
    election_day: string;
  };
};

export type RegionalParty = {
  party_id: string;
  ballot_name: string;
  full_name: string;
  aliases?: string[];
  category?: string;
  ballot_status?: string;
  description?: string;
  party_representative_seats_vying_for?: number;
  party_representative_nominees_2026?: {
    status?: string;
    note?: string;
    source_id?: string;
  };
  legacy_party_representative_nominees_2025_reference?: {
    status?: string;
    warning?: string;
    source_id?: string;
    nominees?: unknown[];
  };
  sectoral_candidate_links?: Array<{
    sector?: string;
    ballot_name?: string;
    full_name?: string;
    organization_or_party?: string;
  }>;
  district_candidate_ids?: string[];
  district_candidate_ids_affiliate_or_component_party?: string[];
  source_ids?: string[];
};

export type SectoralCandidate = {
  sector: string;
  rank_or_number: number;
  ballot_name: string;
  full_name: string;
  sex?: string;
  organization_or_party?: string;
  linked_party_id?: string | null;
  source_id?: string;
};

export type DistrictCandidate = {
  candidate_id: string;
  name_as_reported: string;
  area: string;
  district: string;
  party_label_as_reported?: string;
  normalized_party_id?: string | null;
  candidate_status?: string;
  notes?: string | null;
  source_id?: string;
};

export type DistrictArea = {
  area: string;
  district_count_in_current_framework: number;
  districts: Array<{
    district: string;
    candidate_ids: string[];
  }>;
};

export type TimelineEvent = {
  date: string;
  label?: string | null;
  event_type?: string;
  title: string;
  description?: string;
  summary?: string | null;
  source_ids?: string[];
  status?: string | null;
};

type ElectionWorkspace = {
  dataset_name: string;
  generated_at: string;
  schema_version?: string;
  project?: string;
  election: Election;
  regional_parties: RegionalParty[];
  sectoral_candidates: SectoralCandidate[];
  district_representative_candidates: {
    status: string;
    candidate_count: number;
    candidates: DistrictCandidate[];
    districts_by_area: DistrictArea[];
    source_id?: string;
  };
  timeline: TimelineEvent[];
  sources: Source[];
  data_quality_summary: Record<string, string>;
  workspace_fields_suggested_for_betterbarmm?: Record<string, string[]>;
};

const workspace = workspaceJson as unknown as ElectionWorkspace;

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

function parseDate(value: string): Date | null {
  if (/^\d{4}-\d{2}$/.test(value)) {
    return new Date(`${value}-01T00:00:00+08:00`);
  }

  if (/^\d{4}$/.test(value)) {
    return null;
  }

  return new Date(value);
}

export function formatDate(value: string): string {
  if (!value) {
    return "Date pending";
  }

  if (value.includes("/")) {
    return value
      .split("/")
      .map((part) => formatDate(part))
      .join(" to ");
  }

  if (/^\d{4}$/.test(value)) {
    return value;
  }

  const parsed = parseDate(value);
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return value;
  }

  if (/^\d{4}-\d{2}$/.test(value)) {
    return monthFormatter.format(parsed);
  }

  return dateFormatter.format(parsed);
}

export function formatDateTime(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return dateTimeFormatter.format(parsed);
}

export function labelize(value?: string | null): string {
  if (!value) {
    return "Not specified";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function groupSectoralCandidates(candidates = workspace.sectoral_candidates) {
  const groups = new Map<string, SectoralCandidate[]>();

  for (const candidate of candidates) {
    const current = groups.get(candidate.sector) ?? [];
    current.push(candidate);
    groups.set(candidate.sector, current);
  }

  return Array.from(groups.entries()).map(([sector, items]) => ({
    sector,
    candidates: items,
  }));
}

export function groupDistrictCandidates(candidates = workspace.district_representative_candidates.candidates) {
  const groups = new Map<string, DistrictCandidate[]>();

  for (const candidate of candidates) {
    const current = groups.get(candidate.area) ?? [];
    current.push(candidate);
    groups.set(candidate.area, current);
  }

  return Array.from(groups.entries()).map(([area, items]) => ({
    area,
    candidates: items,
  }));
}

function countSectoralByParty() {
  const counts = new Map<string, number>();

  for (const candidate of workspace.sectoral_candidates) {
    if (!candidate.linked_party_id) {
      continue;
    }

    counts.set(
      candidate.linked_party_id,
      (counts.get(candidate.linked_party_id) ?? 0) + 1,
    );
  }

  return counts;
}

function countDistrictByParty() {
  const counts = new Map<string, number>();

  for (const candidate of workspace.district_representative_candidates.candidates) {
    if (!candidate.normalized_party_id) {
      continue;
    }

    counts.set(
      candidate.normalized_party_id,
      (counts.get(candidate.normalized_party_id) ?? 0) + 1,
    );
  }

  return counts;
}

export function getElectionViewModel() {
  const sectoralByParty = countSectoralByParty();
  const districtByParty = countDistrictByParty();
  const partyIds = new Set(workspace.regional_parties.map((party) => party.party_id));

  const parties = workspace.regional_parties.map((party) => ({
    ...party,
    computedStats: {
      sectoralCandidates: sectoralByParty.get(party.party_id) ?? 0,
      districtCocFilers: districtByParty.get(party.party_id) ?? 0,
      legacyNominees:
        party.legacy_party_representative_nominees_2025_reference?.nominees?.length ??
        0,
    },
  }));

  const linkedDistrictCandidates =
    workspace.district_representative_candidates.candidates.filter((candidate) =>
      candidate.normalized_party_id
        ? partyIds.has(candidate.normalized_party_id)
        : false,
    ).length;

  return {
    workspace,
    election: workspace.election,
    parties,
    sectoralCandidates: workspace.sectoral_candidates,
    sectoralGroups: groupSectoralCandidates(),
    districtCandidates: workspace.district_representative_candidates.candidates,
    districtGroups: groupDistrictCandidates(),
    districtAreas: workspace.district_representative_candidates.districts_by_area,
    timeline: workspace.timeline,
    sources: workspace.sources,
    dataQuality: Object.entries(workspace.data_quality_summary),
    metadata: {
      datasetName: workspace.dataset_name,
      generatedAt: formatDateTime(workspace.generated_at),
      electionDay: formatDate(workspace.election.election_day),
      districtStatus: labelize(workspace.district_representative_candidates.status),
    },
    stats: {
      totalSeats: workspace.election.parliament_structure.total_seats,
      partyRepresentativeSeats:
        workspace.election.parliament_structure.party_representative_seats,
      singleMemberDistrictSeats:
        workspace.election.parliament_structure.single_member_district_seats,
      sectoralOrReservedSeats:
        workspace.election.parliament_structure.sectoral_or_reserved_seats,
      majorityThreshold: workspace.election.parliament_structure.majority_threshold,
      regionalParties: workspace.regional_parties.length,
      sectoralCandidates: workspace.sectoral_candidates.length,
      districtCocFilers: workspace.district_representative_candidates.candidate_count,
      linkedDistrictCandidates,
      timelineEvents: workspace.timeline.length,
      sources: workspace.sources.length,
    },
  };
}
