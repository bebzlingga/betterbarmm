import workspaceJson from "../../../../datasets/election/election.min.json";
import supplementJson from "../../../../datasets/election/election-supplement.json";
import { type Confidence, confidenceMeta } from "./confidence";

export { type Confidence, confidenceMeta };

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
  description?: string;
  summary?: string;
  content?: string;
  content_markdown?: string;
  excerpt?: string;
  source_role?: string;
  reliability?: string;
  source_scope?: string;
  content_tags?: string[];
  priority?: number;
  key_points?: string[];
  notes?: string;
  alternate_urls?: string[];
  verification?: {
    status?: string;
    method?: string;
    note?: string;
  };
  display?: {
    kicker?: string;
    title?: string;
    dek?: string;
    body?: string;
  };
};

export type SourceGroup = {
  id: string;
  label: string;
  source_ids: string[];
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

type OtherDistrictParty = {
  label: string;
  normalized_id?: string;
  note?: string;
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
  source_groups?: SourceGroup[];
  other_district_parties_or_labels_not_in_13_regional_party_representative_ballot?: OtherDistrictParty[];
  data_quality_summary: Record<string, string>;
  workspace_fields_suggested_for_betterbarmm?: Record<string, unknown>;
};

// --- Researched supplement (secondary reference, individually sourced) ---

export type PartyBackground = {
  background?: string;
  leaders?: string[];
  affiliation?: string;
  source_url?: string;
  source_date?: string;
  confidence?: string;
};

export type ContextFact = {
  topic: string;
  fact: string;
  source_url?: string;
  source_date?: string;
  confidence?: string;
};

export type SupplementStatistic = {
  label: string;
  value: string;
  as_of?: string;
  source_url?: string;
  confidence?: string;
};

export type KeyFigure = {
  name: string;
  role: string;
  note?: string;
  source_url?: string;
  source_date?: string;
  confidence?: string;
};

type ElectionSupplement = {
  generated_at: string;
  note: string;
  party_backgrounds: Record<string, PartyBackground>;
  key_figures: KeyFigure[];
  context_facts: ContextFact[];
  statistics: SupplementStatistic[];
  timeline_additions: TimelineEvent[];
  sources: Source[];
};

const workspace = workspaceJson as unknown as ElectionWorkspace;
const supplement = supplementJson as unknown as ElectionSupplement;

// --- Confidence model -------------------------------------------------------
// A single, consistent trust signal (defined in ./confidence) that travels with
// each record so readers can tell official ballot data apart from working lists
// and legacy references.

export function resolveDistrictConfidence(
  candidate: DistrictCandidate,
): Confidence {
  // Every district filer is currently coc_filer_unverified_final_status.
  return candidate.candidate_status?.includes("unverified")
    ? "working"
    : "official";
}

// --- Party blocs ------------------------------------------------------------
// Editorial grouping derived from the sourced backgrounds in
// election-supplement.json (affiliation, COMELEC dominant-party designation,
// chief-minister nominee). Presentation layer only — the underlying facts and
// their citations live in the supplement.

export type PartyBloc =
  | "Governing bloc (MILF)"
  | "Opposition coalition"
  | "MNLF-linked"
  | "Other regional parties";

export const blocOrder: PartyBloc[] = [
  "Governing bloc (MILF)",
  "Opposition coalition",
  "MNLF-linked",
  "Other regional parties",
];

export const blocSummary: Record<PartyBloc, string> = {
  "Governing bloc (MILF)":
    "The MILF-led incumbent bloc that has governed the transition authority.",
  "Opposition coalition":
    "The BARMM Grand Coalition, positioned as the main inclusive opposition.",
  "MNLF-linked": "Parties tied to the two Moro National Liberation Front factions.",
  "Other regional parties":
    "New and independent regional parliamentary parties on the ballot.",
};

export const dominantStatusLabel: Record<string, string> = {
  dominant_majority: "COMELEC dominant majority",
  dominant_minority: "COMELEC dominant minority",
};

type PartyPresentation = {
  bloc: PartyBloc;
  dominantStatus?: "dominant_majority" | "dominant_minority";
  cmNominee?: string;
};

const partyPresentation: Record<string, PartyPresentation> = {
  UBJP: {
    bloc: "Governing bloc (MILF)",
    dominantStatus: "dominant_majority",
    cmNominee: "Murad Ebrahim",
  },
  BGC: { bloc: "Opposition coalition" },
  BAPA: { bloc: "MNLF-linked", cmNominee: "Omar Yasser Sema" },
  MAHARDIKA: { bloc: "MNLF-linked", cmNominee: "Tarhata Maglangit" },
  BFP: { bloc: "Other regional parties", dominantStatus: "dominant_minority" },
  BEST: { bloc: "Other regional parties" },
  ABOT: { bloc: "Other regional parties" },
  PBB: { bloc: "Other regional parties" },
  ISAMA: { bloc: "Other regional parties" },
  MORO_AKO: { bloc: "Other regional parties", cmNominee: "Najeeb Taib" },
  RAAYAT: { bloc: "Other regional parties", cmNominee: "Nadia Lorena" },
  PRO_BANGSAMORO: {
    bloc: "Other regional parties",
    cmNominee: "Don Mustapha Loong",
  },
  MUSHAWARA: { bloc: "Other regional parties" },
};

function presentationFor(partyId: string): PartyPresentation {
  return partyPresentation[partyId] ?? { bloc: "Other regional parties" };
}

// --- Formatting helpers -----------------------------------------------------

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

// --- Grouping helpers -------------------------------------------------------

export function groupSectoralCandidates(
  candidates = workspace.sectoral_candidates,
) {
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

export function groupDistrictCandidates(
  candidates = workspace.district_representative_candidates.candidates,
) {
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

// --- Relationship resolution ------------------------------------------------

function sectoralByParty() {
  const map = new Map<string, SectoralCandidate[]>();
  for (const candidate of workspace.sectoral_candidates) {
    if (!candidate.linked_party_id) continue;
    const current = map.get(candidate.linked_party_id) ?? [];
    current.push(candidate);
    map.set(candidate.linked_party_id, current);
  }
  return map;
}

function districtByParty() {
  const map = new Map<string, DistrictCandidate[]>();
  for (const candidate of workspace.district_representative_candidates
    .candidates) {
    if (!candidate.normalized_party_id) continue;
    const current = map.get(candidate.normalized_party_id) ?? [];
    current.push(candidate);
    map.set(candidate.normalized_party_id, current);
  }
  return map;
}

function buildParties() {
  const sectoralMap = sectoralByParty();
  const districtMap = districtByParty();

  return workspace.regional_parties.map((party) => {
    const sectoral = sectoralMap.get(party.party_id) ?? [];
    const district = districtMap.get(party.party_id) ?? [];
    const legacyNominees =
      party.legacy_party_representative_nominees_2025_reference?.nominees
        ?.length ?? 0;
    const background = supplement.party_backgrounds[party.party_id] ?? null;
    const presentation = presentationFor(party.party_id);

    return {
      ...party,
      confidence: "official" as Confidence,
      background,
      bloc: presentation.bloc,
      dominantStatus: presentation.dominantStatus,
      cmNominee: presentation.cmNominee,
      affiliation: background?.affiliation,
      leaders: background?.leaders ?? [],
      sectoral,
      district,
      computedStats: {
        sectoralCandidates: sectoral.length,
        districtCocFilers: district.length,
        legacyNominees,
      },
    };
  });
}

export type PartyView = ReturnType<typeof buildParties>[number];

let partiesCache: PartyView[] | null = null;
function allParties(): PartyView[] {
  if (!partiesCache) partiesCache = buildParties();
  return partiesCache;
}

export function getPartyById(partyId: string): PartyView | undefined {
  return allParties().find(
    (party) => party.party_id.toLowerCase() === partyId.toLowerCase(),
  );
}

export function getPartyIds(): string[] {
  return workspace.regional_parties.map((party) => party.party_id);
}

export function getPartyGroups() {
  const parties = allParties();
  return blocOrder
    .map((bloc) => ({
      bloc,
      summary: blocSummary[bloc],
      parties: parties.filter((party) => party.bloc === bloc),
    }))
    .filter((group) => group.parties.length > 0);
}

// --- Timeline phases --------------------------------------------------------

const phaseByEventType: Record<string, string> = {
  legal_foundation: "Foundations",
  plebiscite: "Foundations",
  transition: "Foundations",
  electoral_code: "Foundations",
  postponement: "Postponements & resets",
  deferment: "Postponements & resets",
  postponement_law: "Postponements & resets",
  court_decision: "Postponements & resets",
  court_ruling: "Postponements & resets",
  appointment: "Postponements & resets",
  legislation: "Postponements & resets",
  comelec_resolution: "Road to Election Day",
  filing_period: "Road to Election Day",
  candidate_list: "Road to Election Day",
  election_period: "Road to Election Day",
  campaign_period: "Road to Election Day",
  milestone: "Road to Election Day",
  election_day: "Road to Election Day",
};

const phaseOrder = [
  "Foundations",
  "Postponements & resets",
  "Road to Election Day",
];

function eventPhase(event: TimelineEvent): string {
  return phaseByEventType[event.event_type ?? ""] ?? "Road to Election Day";
}

/**
 * When an event goes on the axis.
 *
 * A period is written as a range — "2026-05-05/2026-05-07" for the filing
 * window, "2026-07-30/2026-09-12" for the campaign — and it sorts by the day
 * it starts, which is the only reading of a range an axis can use.
 *
 * It used to sort by 1 January of its year, and not by accident: `new Date()`
 * cannot parse a range, so the whole string fell through to the year fallback
 * below. Both periods landed at the head of 2026, which put the campaign
 * period ahead of the deferment in January and the law in March — an axis
 * about a date being moved, telling the story out of order.
 *
 * The fallback stays for the dates that really are only a year — "2019", the
 * 2023 electoral code — where the first of January is a placeholder rather
 * than a claim, and the card prints the bare year.
 */
function timeValue(value: string): number {
  const start = value.includes("/") ? value.split("/")[0].trim() : value;

  const parsed = parseDate(start);
  if (parsed && !Number.isNaN(parsed.getTime())) return parsed.getTime();

  const yearMatch = start.match(/\d{4}/);
  return yearMatch ? new Date(`${yearMatch[0]}-01-01`).getTime() : 0;
}

function fullTimeline(): TimelineEvent[] {
  return [...workspace.timeline, ...supplement.timeline_additions].sort(
    (a, b) => timeValue(a.date) - timeValue(b.date),
  );
}

export function getTimelineViewModel() {
  const events = fullTimeline();

  // A phase is a stretch of time, not a bucket of event types. Taken purely
  // from the type, the 2023 electoral code filed under "Foundations" and the
  // 2021 postponement under "Postponements", which is correct as a
  // classification and wrong as a timeline: drawn along an axis the reader ran
  // forward to 2023, then back to 2021. So the type only proposes a phase, and
  // the story is not allowed to go backwards — once the timeline has entered a
  // later phase, everything after it stays there.
  let furthest = 0;
  const phaseOf = new Map<TimelineEvent, string>();
  for (const event of events) {
    const proposed = phaseOrder.indexOf(eventPhase(event));
    furthest = Math.max(furthest, proposed === -1 ? furthest : proposed);
    phaseOf.set(event, phaseOrder[furthest]);
  }

  const phases = phaseOrder
    .map((phase) => ({
      phase,
      events: events.filter((event) => phaseOf.get(event) === phase),
    }))
    .filter((group) => group.events.length > 0);

  const eventTypes = Array.from(
    new Set(events.map((event) => event.event_type).filter(Boolean)),
  ) as string[];

  return { events, phases, eventTypes, eventPhase };
}

// --- Sources ----------------------------------------------------------------

export function getSourcesViewModel() {
  const sources = workspace.sources;
  const byId = new Map(sources.map((source) => [source.id, source]));

  const groups = (workspace.source_groups ?? []).map((group) => ({
    ...group,
    sources: group.source_ids
      .map((id) => byId.get(id))
      .filter((source): source is Source => Boolean(source)),
  }));

  const grouped = new Set(groups.flatMap((group) => group.source_ids));
  const ungrouped = sources.filter((source) => !grouped.has(source.id));

  return { sources, groups, ungrouped, supplementSources: supplement.sources };
}

export type LatestNewsItem = {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url?: string;
  summary: string;
};

// Most recent reporting, drawn from the news-type sources in both the workspace
// and the researched supplement, newest first.
export function getLatestNews(limit = 10): LatestNewsItem[] {
  return [...workspace.sources, ...supplement.sources]
    .filter((source) => Boolean(source.date) && (source.type ?? "").includes("news"))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, limit)
    .map((source) => ({
      id: source.id,
      title: source.title,
      publisher: source.publisher ?? "",
      date: source.date as string,
      url: source.url,
      summary: source.summary ?? source.description ?? "",
    }));
}

// --- Master view model ------------------------------------------------------

export function getElectionViewModel() {
  const parties = allParties();
  const partyIds = new Set(parties.map((party) => party.party_id));

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
    otherDistrictParties:
      workspace.other_district_parties_or_labels_not_in_13_regional_party_representative_ballot ??
      [],
    dataQuality: Object.entries(workspace.data_quality_summary),
    contextFacts: supplement.context_facts,
    keyFigures: supplement.key_figures,
    supplementStatistics: supplement.statistics,
    supplementNote: supplement.note,
    metadata: {
      datasetName: workspace.dataset_name,
      schemaVersion: workspace.schema_version,
      generatedAt: formatDateTime(workspace.generated_at),
      generatedAtRaw: workspace.generated_at,
      electionDay: formatDate(workspace.election.election_day),
      districtStatus: labelize(
        workspace.district_representative_candidates.status,
      ),
    },
    stats: {
      totalSeats: workspace.election.parliament_structure.total_seats,
      partyRepresentativeSeats:
        workspace.election.parliament_structure.party_representative_seats,
      singleMemberDistrictSeats:
        workspace.election.parliament_structure.single_member_district_seats,
      sectoralOrReservedSeats:
        workspace.election.parliament_structure.sectoral_or_reserved_seats,
      majorityThreshold:
        workspace.election.parliament_structure.majority_threshold,
      regionalParties: workspace.regional_parties.length,
      sectoralCandidates: workspace.sectoral_candidates.length,
      districtCocFilers:
        workspace.district_representative_candidates.candidate_count,
      linkedDistrictCandidates,
      timelineEvents: workspace.timeline.length,
      sources: workspace.sources.length,
    },
  };
}
