import baaDataset from "../../../../datasets/bills/baa.min.json";

export type BillSourceLink = {
  type: string;
  url?: string;
  accessNote?: string;
  fileName?: string;
};

export type BillRecord = {
  id: string;
  baaNumber: number;
  display: string;
  titleShort: string;
  titleOfficial: string;
  dateDisplay: string;
  dateIso?: string;
  year: string;
  category: string;
  principalAuthors: string[];
  coAuthors: string[];
  authorMetadataStatus: string;
  sourceLink?: string;
  sourceLinks: BillSourceLink[];
  fullTextPdfStatus: string;
  readingStatus: string;
  actionType: string;
  actionTypeLabel: string;
  gist: string;
  keyEffects: string[];
  appropriationAmount?: string;
  fiscalYear?: string;
  relatedBaaNumbers: number[];
  implementationNotes: string;
  readingBasis: string;
  confidence: string;
  dataQualityNotes?: string;
};

type RawSourceLink = {
  type?: unknown;
  url?: unknown;
  access_note?: unknown;
  file_name?: unknown;
};

type RawAnalysis = {
  legal_action_type?: unknown;
  comprehensive_gist?: unknown;
  key_effects?: unknown;
  appropriation_amount_if_identified?: unknown;
  fiscal_year_if_identified?: unknown;
  related_baa_numbers?: unknown;
  implementation_or_policy_notes?: unknown;
  reading_basis?: unknown;
  confidence?: unknown;
};

type RawBillRecord = {
  baa_number?: unknown;
  baa_display?: unknown;
  title_short?: unknown;
  title_official?: unknown;
  date_approved_or_enacted?: unknown;
  date_approved_or_enacted_iso?: unknown;
  category?: unknown;
  principal_authors?: unknown;
  co_authors?: unknown;
  author_metadata_status?: unknown;
  source_link?: unknown;
  source_links?: unknown;
  full_text_pdf_status?: unknown;
  reading_status?: unknown;
  analysis?: RawAnalysis;
  data_quality_notes?: unknown;
};

type RawDataset = {
  metadata?: {
    dataset_name?: string;
    generated_at?: string;
    coverage?: string;
    record_count?: number;
    scope_note?: string;
    important_limitations?: string[];
    primary_index_links?: Record<string, string>;
    uploaded_source_files_read?: Array<{
      file_name?: string;
      related_baa_number?: number;
      reading_summary?: string;
      read_status?: string;
    }>;
  };
  records?: Record<string, RawBillRecord> | RawBillRecord[];
};

const rawDataset = baaDataset as RawDataset;

const toStringValue = (value: unknown, fallback = "") =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;

const toStringArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => toStringValue(item))
    .filter((item) => item.length > 0);
};

const toNumberArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
};

const formatActionType = (value: string) => {
  if (!value) {
    return "General act";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatDate = (isoValue: string, fallback: string) => {
  if (!isoValue) {
    return fallback || "Date pending";
  }

  const parsed = new Date(`${isoValue}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return fallback || "Date pending";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
};

const recordsSource = Array.isArray(rawDataset.records)
  ? rawDataset.records
  : Object.values(rawDataset.records ?? {});

export const billsMetadata = {
  datasetName:
    rawDataset.metadata?.dataset_name ??
    "Bangsamoro Autonomy Acts catalogue",
  generatedAt: rawDataset.metadata?.generated_at ?? "Source timestamp pending",
  coverage: rawDataset.metadata?.coverage ?? "BAA records",
  recordCount: rawDataset.metadata?.record_count ?? recordsSource.length,
  scopeNote: rawDataset.metadata?.scope_note ?? "",
  importantLimitations: rawDataset.metadata?.important_limitations ?? [],
  primaryIndexLinks: rawDataset.metadata?.primary_index_links ?? {},
  uploadedSourceFilesRead:
    rawDataset.metadata?.uploaded_source_files_read?.map((file) => ({
      fileName: file.file_name ?? "Source file",
      relatedBaaNumber: file.related_baa_number,
      readingSummary: file.reading_summary ?? "",
      readStatus: file.read_status ?? "",
    })) ?? [],
};

export const billRecords: BillRecord[] = recordsSource
  .map((record) => {
    const baaNumber = Number(record.baa_number ?? 0);
    const dateIso = toStringValue(record.date_approved_or_enacted_iso);
    const dateFallback = toStringValue(record.date_approved_or_enacted);
    const actionType = toStringValue(record.analysis?.legal_action_type);

    return {
      id: `baa-${baaNumber}`,
      baaNumber,
      display:
        toStringValue(record.baa_display) ||
        `Bangsamoro Autonomy Act No. ${baaNumber}`,
      titleShort: toStringValue(record.title_short, "Untitled act"),
      titleOfficial: toStringValue(record.title_official, "Official title pending"),
      dateDisplay: formatDate(dateIso, dateFallback),
      dateIso: dateIso || undefined,
      year: dateIso.slice(0, 4) || "Year pending",
      category: toStringValue(record.category, "Uncategorized"),
      principalAuthors: toStringArray(record.principal_authors),
      coAuthors: toStringArray(record.co_authors),
      authorMetadataStatus: toStringValue(
        record.author_metadata_status,
        "Author metadata pending",
      ),
      sourceLink: toStringValue(record.source_link) || undefined,
      sourceLinks: Array.isArray(record.source_links)
        ? record.source_links.map((sourceLink) => {
            const source = sourceLink as RawSourceLink;

            return {
              type: toStringValue(source.type, "source"),
              url: toStringValue(source.url) || undefined,
              accessNote: toStringValue(source.access_note) || undefined,
              fileName: toStringValue(source.file_name) || undefined,
            };
          })
        : [],
      fullTextPdfStatus: toStringValue(
        record.full_text_pdf_status,
        "Full text status pending",
      ),
      readingStatus: toStringValue(record.reading_status, "Reading status pending"),
      actionType,
      actionTypeLabel: formatActionType(actionType),
      gist: toStringValue(record.analysis?.comprehensive_gist, "Summary pending"),
      keyEffects: toStringArray(record.analysis?.key_effects),
      appropriationAmount:
        toStringValue(record.analysis?.appropriation_amount_if_identified) ||
        undefined,
      fiscalYear:
        toStringValue(record.analysis?.fiscal_year_if_identified) || undefined,
      relatedBaaNumbers: toNumberArray(record.analysis?.related_baa_numbers),
      implementationNotes: toStringValue(
        record.analysis?.implementation_or_policy_notes,
        "Implementation notes pending",
      ),
      readingBasis: toStringValue(record.analysis?.reading_basis, "Basis pending"),
      confidence: toStringValue(record.analysis?.confidence, "pending"),
      dataQualityNotes: toStringValue(record.data_quality_notes) || undefined,
    };
  })
  .sort((left, right) => right.baaNumber - left.baaNumber);

export const billsCategories = Array.from(
  new Set(billRecords.map((bill) => bill.category)),
).sort((left, right) => left.localeCompare(right));

export const billsActionTypes = Array.from(
  new Map(
    billRecords.map((bill) => [
      bill.actionType || "general",
      bill.actionTypeLabel,
    ]),
  ),
)
  .map(([value, label]) => ({ value, label }))
  .sort((left, right) => left.label.localeCompare(right.label));

export const billsStats = {
  totalBills: billRecords.length,
  categories: billsCategories.length,
  sourceLinked: billRecords.filter((bill) => bill.sourceLink || bill.sourceLinks.length)
    .length,
  budgetActs: billRecords.filter((bill) =>
    bill.category.toLowerCase().includes("appropriation"),
  ).length,
  latestYear: billRecords[0]?.year ?? "2026",
};

export function getBillsViewModel() {
  return {
    metadata: billsMetadata,
    records: billRecords,
    categories: billsCategories,
    actionTypes: billsActionTypes,
    stats: billsStats,
  };
}
