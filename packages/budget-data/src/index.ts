import { type BudgetProgram, type BudgetYear } from "@betterbarmm/schemas";
import allYearsBudget from "../../../datasets/budget/barmm_fy2020_2026.min.json";

type Amounts = {
  ps?: string | number | null;
  mooe?: string | number | null;
  co?: string | number | null;
  total?: string | number | null;
  personnel_services?: string | number | null;
  maintenance_and_other_operating_expenses?: string | number | null;
  capital_outlays?: string | number | null;
  total_appropriations?: string | number | null;
  [key: string]: string | number | null | undefined;
};

type SourceFile = {
  fiscal_year?: number;
  filename?: string;
  pages?: number;
  sha256?: string;
};

type NewDatasetLineItem = {
  p?: number;
  page?: number;
  name?: string;
  label?: string;
  amount?: string | number | null;
  amounts?: {
    column_guess?: string;
    amount?: string | number | null;
    x1?: number;
  }[];
  personnel_services?: string | number | null;
  maintenance_and_other_operating_expenses?: string | number | null;
  capital_outlays?: string | number | null;
  total?: string | number | null;
  is_total_row?: boolean;
  expense_class?: string;
  path?: string[];
  cost_structure?: string | null;
  raw?: string;
};

export type BudgetOfficeSpecialProvisionSource = {
  title: string;
  description_html: string;
};

type NewDatasetOffice = {
  code?: string;
  name?: string;
  category?: string;
  classification?: string;
  sector?: string[];
  fiscal_year?: number;
  printed_page_start?: number;
  printed_page_end?: number;
  pdf_page_start?: number;
  pdf_page_end?: number;
  total_appropriations?: string | number | null;
  pages?: number[];
  program_items?: NewDatasetLineItem[];
  object_items?: NewDatasetLineItem[];
  performance_pages?: number[];
  appropriations_by_program?: {
    items?: NewDatasetLineItem[];
    totals?: Amounts & {
      personnel_services?: string | number | null;
      maintenance_and_other_operating_expenses?: string | number | null;
      capital_outlays?: string | number | null;
    };
  };
  appropriations_by_object_of_expenditures?: {
    items?: NewDatasetLineItem[];
    totals?: Amounts;
  };
  special_provisions?: unknown;
};

type NewDatasetYear = {
  source_file?: string;
  page_count?: number;
  pages?: number[];
  offices?: Record<string, NewDatasetOffice>;
  special_purpose_funds?: Record<string, NewDatasetOffice>;
  total_budget?: string | number | null;
};

type YearlySummary = {
  overall_appropriation?: string | number | null;
  source_pdf?: string;
  entity_count_extracted?: number;
  growth_vs_previous_year_percent?: string | number | null;
  growth_vs_2020_percent?: string | number | null;
};

type BudgetEntityRow = {
  name?: string;
  program_or_cost_structure_name?: string;
  row_type?: string;
  amounts?: Amounts;
  source_pdf_page?: number;
  source_pages?: SourcePages;
  section_category?: string;
};

type SourcePages =
  | number[]
  | {
      pdf_start_page?: number;
      pdf_end_page?: number;
      printed_start_page?: number;
      printed_end_page?: number;
    };

type BudgetEntityDetail = {
  entity_acronym?: string;
  entity_name?: string;
  entity_category?: string;
  section_category?: string;
  secondary_section_categories?: string[];
  parent?: string | null;
  total?: string | number | null;
  breakdown?: Amounts;
  amounts?: Amounts;
  source_pdf_page?: number;
  source_pages?: SourcePages;
  rows?: BudgetEntityRow[];
  object_items?: NewDatasetLineItem[];
  special_provisions?: BudgetOfficeSpecialProvisionSource[];
};

type DetailedProgramLine = {
  amounts?: Amounts;
  source_pdf_page?: number;
  source_pages?: SourcePages;
  section_category?: string;
};

type DetailedBudgetStructure = {
  summary?: DetailedProgramLine;
  programs_or_purposes?: Record<string, DetailedProgramLine>;
  section_category?: string;
};

type DetailedBudgetEntity = {
  budget_structure?: Record<string, DetailedBudgetStructure>;
  section_category?: string;
  category?: string;
};

type DetailedBudget = {
  by_program_per_year?: Record<string, Record<string, DetailedBudgetEntity>>;
};

type SectionCategoryDetail = {
  official_entity_total?: string | number | null;
  entities?: Record<
    string,
    {
      amount?: string | number | null;
    }
  >;
  program_count?: number;
};

type RawAllYearsBudget = {
  metadata?: {
    dataset_name?: string;
    currency?: string;
    note?: string;
  };
  years?: Record<string, NewDatasetYear>;
  schema_version?: string;
  dataset_name?: string;
  generated_at?: string;
  source_files?: SourceFile[];
  notes?: string[];
  summary_metrics?: {
    years_covered?: number[];
    peak_year?: number;
    peak_appropriation?: string | number | null;
    seven_year_growth_percent?: string | number | null;
  };
  yearly_summary?: Record<string, YearlySummary>;
  budget_details_by_year?: Record<
    string,
    {
      entities?: Record<string, BudgetEntityDetail>;
    }
  >;
  category_program_office_details_per_year?: Record<
    string,
    {
      detail_status?: string;
      section_categories?: Record<string, SectionCategoryDetail>;
    }
  >;
};

export type BudgetProgramFundAmounts = {
  ps: number;
  mooe: number;
  co: number;
  total: number;
};

export type BudgetProgramObjectItem = {
  name: string;
  amount: number;
  sourcePage?: number;
  objectGroup?: string;
  context?: string[];
};

export type BudgetProgramObjectDistribution = {
  key: string;
  label: string;
  shortLabel: string;
  scope?: string;
  total: number;
  items: BudgetProgramObjectItem[];
};

export type BudgetProgramDetail = {
  program_id: string;
  agency_id: string;
  agency_name: string;
  program_name: string;
  group: string;
  source_pages: number[];
  expense_class_amounts: BudgetProgramFundAmounts;
  object_distributions: BudgetProgramObjectDistribution[];
};

export type BudgetAgencyDetailRow = {
  fiscal_year: number;
  agency_id: string;
  name: string;
  row_type: string;
  personnel_services: number;
  mooe: number;
  capital_outlays: number;
  total: number;
  source_page?: number;
  section_category?: string;
};

export type BudgetSectionCategoryTotal = {
  category: string;
  slug?: string;
  description?: string;
  total: number;
  personnel: number;
  mooe: number;
  capital: number;
  entities: number;
  basis?: string;
};

export type BudgetOfficeSpecialProvisionRow = {
  fiscal_year: number;
  agency_id: string;
  agency_name: string;
  category: string;
  total_appropriation: number;
  source_page?: number;
  special_provisions: BudgetOfficeSpecialProvisionSource[];
};

export type BudgetOfficeTrendEntity = {
  fiscal_year: number;
  agency_id: string;
  agency_name: string;
  office_category: string;
  section_category: string;
  total_appropriation: number;
};

export type BudgetYearSelection = BudgetYear & {
  fiscal_years?: number[];
};

const rawBudget = allYearsBudget as unknown as RawAllYearsBudget;
const detailedBudget = allYearsBudget as unknown as DetailedBudget;
const canonicalDatasetFile = "barmm_fy2020_2026.min.json";

function parseAmount(value: string | number | null | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const parsed = Number(value.replace(/[₱,\s]/g, ""));

  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeTotalBudget(value: string | number | null | undefined) {
  const total = parseAmount(value);

  return total > 0 && total < 1_000_000 ? total * 1_000_000_000 : total;
}

function addAmounts(
  target: BudgetProgramFundAmounts,
  source: Amounts | undefined,
) {
  const normalized = normalizeAmounts(source);

  target.ps += normalized.ps;
  target.mooe += normalized.mooe;
  target.co += normalized.co;
  target.total += normalized.total;

  return target;
}

function normalizeAmounts(
  amounts: Amounts | undefined,
): BudgetProgramFundAmounts {
  return {
    ps: parseAmount(amounts?.ps ?? amounts?.personnel_services),
    mooe: parseAmount(
      amounts?.mooe ?? amounts?.maintenance_and_other_operating_expenses,
    ),
    co: parseAmount(amounts?.co ?? amounts?.capital_outlays),
    total: parseAmount(amounts?.total ?? amounts?.total_appropriations),
  };
}

function sourceFileForYear(year: number) {
  return (
    rawBudget.years?.[String(year)]?.source_file ??
    rawBudget.source_files?.find((file) => file.fiscal_year === year)
      ?.filename ??
    rawBudget.yearly_summary?.[String(year)]?.source_pdf ??
    canonicalDatasetFile
  ).replaceAll("BAA", "GAAB");
}

function sourcePageFor(
  row:
    | BudgetEntityRow
    | BudgetEntityDetail
    | DetailedProgramLine
    | NewDatasetLineItem
    | undefined,
) {
  if (row && "p" in row && row.p) return row.p;
  if (row && "page" in row && row.page) return row.page;
  if (row && "source_pdf_page" in row && row.source_pdf_page)
    return row.source_pdf_page;
  if (row && "source_pages" in row && Array.isArray(row.source_pages))
    return row.source_pages[0];

  if (
    row &&
    "source_pages" in row &&
    row.source_pages &&
    !Array.isArray(row.source_pages)
  ) {
    return row.source_pages.pdf_start_page;
  }

  return undefined;
}

function cleanProgramName(value: string | undefined) {
  const cleaned = (value ?? "")
    .replace(/\u2026+/g, " ")
    .replace(/[.\s]+/g, " ")
    .trim();

  if (!cleaned) return "";
  if (/^hereunder$/i.test(cleaned)) return "";
  if (/^total appropriations$/i.test(cleaned)) return "";

  return cleaned;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugFor(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function agencyIdForOfficeName(name: string) {
  const words = name
    .replace(/[^A-Za-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !/^(of|the|and|for|to|in|on)$/i.test(word));
  const acronym = words.map((word) => word[0]?.toUpperCase()).join("");

  return acronym || slugFor(name).slice(0, 12) || "OFFICE";
}

function normalizeSpecialProvisions(
  value: unknown,
): BudgetOfficeSpecialProvisionSource[] {
  if (!Array.isArray(value)) return [];

  return value
    .map<BudgetOfficeSpecialProvisionSource | null>((item, index) => {
      if (typeof item === "string") {
        const description = item.trim();

        return description
          ? {
              title: `Special Provision ${index + 1}`,
              description_html: escapeHtml(description),
            }
          : null;
      }

      if (!item || typeof item !== "object") return null;

      const record = item as Record<string, unknown>;
      const title =
        typeof record.title === "string" && record.title.trim()
          ? record.title.trim()
          : `Special Provision ${index + 1}`;
      const description =
        typeof record.description_html === "string"
          ? record.description_html.trim()
          : typeof record.description === "string"
            ? escapeHtml(record.description.trim())
            : "";

      return description
        ? {
            title,
            description_html: description,
          }
        : null;
    })
    .filter((item): item is BudgetOfficeSpecialProvisionSource =>
      Boolean(item),
    );
}

function categoryForOfficeName(name: string) {
  if (/basic|higher|technical|education|madaris/i.test(name)) {
    return "Education, Higher Education, Technical Education, and Madaris";
  }
  if (/public works|infrastructure|asset/i.test(name)) {
    return "Infrastructure, Public Works, and Public Assets";
  }
  if (/pilgrimage|cultural|heritage|religious/i.test(name)) {
    return "Culture, Heritage, Religious Affairs, and Bangsamoro Identity";
  }
  if (/cooperatives|social enterprise|livelihood/i.test(name)) {
    return "Cooperatives, Social Enterprise, and Livelihood";
  }
  if (/chief minister|governance|planning|budget/i.test(name)) {
    return "Governance, Legislature, and Public Administration";
  }

  return "Uncategorized / Requires Review";
}

function isCostStructureName(name: string) {
  return /general (administration|administrative).*support|support to operations|^operations$/i.test(
    name,
  );
}

function isTotalLabel(label: string) {
  return /^total\b/i.test(label) || /total appropriations/i.test(label);
}

function expenseClassMetaForKey(key: string | undefined) {
  const normalized = (key ?? "").toLowerCase().replace(/[^a-z]+/g, "_");

  if (normalized === "ps" || normalized === "personnel_services") {
    return {
      key: "ps",
      label: "Personnel Services",
      shortLabel: "PS",
    };
  }

  if (
    normalized === "mooe" ||
    normalized === "maintenance_and_other_operating_expenses"
  ) {
    return {
      key: "mooe",
      label: "Maintenance and Other Operating Expenses",
      shortLabel: "MOOE",
    };
  }

  if (normalized === "co" || normalized === "capital_outlays") {
    return {
      key: "co",
      label: "Capital Outlays",
      shortLabel: "CO",
    };
  }

  return undefined;
}

function objectExpenseClassFor(label: string, explicitKey?: string) {
  if (
    /capital|equipment|buildings?|infrastructure|outlays?|property|plant/i.test(
      label,
    )
  ) {
    return {
      key: "co",
      label: "Capital Outlays",
      shortLabel: "CO",
    };
  }

  if (
    /maintenance and other operating|travell?ing|training|scholarship|supplies|utility|communication|survey|research|professional services|consultancy services|general services|repairs|financial assistance|subsidy|taxes|advertising|printing|publication|representation e?expenses|transportation.*e?expenses|delivery e?expenses|rent|lease|subscription|miscellaneous e?expenses|operating e?expenses/i.test(
      label,
    )
  ) {
    return {
      key: "mooe",
      label: "Maintenance and Other Operating Expenses",
      shortLabel: "MOOE",
    };
  }

  if (
    /salary|wages?|allowance|bonus|cash gift|retirement|life insurance|pag-ibig|philhealth|compensation|personnel|permanent positions|hazard pay|benefits/i.test(
      label,
    )
  ) {
    return {
      key: "ps",
      label: "Personnel Services",
      shortLabel: "PS",
    };
  }

  return (
    expenseClassMetaForKey(explicitKey) ?? {
      key: "mooe",
      label: "Maintenance and Other Operating Expenses",
      shortLabel: "MOOE",
    }
  );
}

function objectDistributionsFromItems(
  items: NewDatasetLineItem[] | undefined,
): BudgetProgramObjectDistribution[] {
  const distributions = new Map<string, BudgetProgramObjectDistribution>();

  for (const item of items ?? []) {
    const name = cleanProgramName(item.label ?? item.name);
    const amount = parseAmount(item.amount ?? item.total);

    if (!name || amount <= 0 || item.is_total_row || isTotalLabel(name)) {
      continue;
    }

    const expenseClass = objectExpenseClassFor(name, item.expense_class);
    const context = [
      "Appropriations by object of expenditures",
      ...(item.path ?? []),
      item.cost_structure,
    ].filter((part): part is string => Boolean(part));
    const distribution = distributions.get(expenseClass.key) ?? {
      ...expenseClass,
      total: 0,
      items: [],
    };

    distribution.total += amount;
    distribution.items.push({
      name,
      amount,
      sourcePage: sourcePageFor(item),
      objectGroup: item.path?.[0] ?? item.cost_structure ?? expenseClass.label,
      context,
    });
    distributions.set(expenseClass.key, distribution);
  }

  return Array.from(distributions.values()).sort((a, b) => b.total - a.total);
}

function breakdownFromObjectItems(
  totals: Amounts | undefined,
  fallbackTotal: number,
): BudgetProgramFundAmounts {
  const normalized = normalizeAmounts(totals);

  return {
    ...normalized,
    total: normalized.total || fallbackTotal,
  };
}

function amountsFromProgramItem(item: NewDatasetLineItem): Amounts {
  const amounts: Amounts = {
    ps: item.personnel_services,
    mooe: item.maintenance_and_other_operating_expenses,
    co: item.capital_outlays,
    total: item.total,
  };

  for (const column of item.amounts ?? []) {
    const expenseClass = expenseClassMetaForKey(column.column_guess);
    const amount = parseAmount(column.amount);

    if (expenseClass?.key === "ps") amounts.ps ??= amount;
    if (expenseClass?.key === "mooe") amounts.mooe ??= amount;
    if (expenseClass?.key === "co") amounts.co ??= amount;
    if (column.column_guess === "total") amounts.total ??= amount;
  }

  return amounts;
}

function rowsFromProgramItems(
  items: NewDatasetLineItem[] | undefined,
  fallbackCategory: string,
  fallbackSourcePage?: number,
): BudgetEntityRow[] {
  return (items ?? [])
    .map<BudgetEntityRow | null>((item) => {
      const label = cleanProgramName(item.name ?? item.label);
      const amounts = amountsFromProgramItem(item);
      const normalizedAmounts = normalizeAmounts(amounts);
      const total =
        normalizedAmounts.total ||
        normalizedAmounts.ps + normalizedAmounts.mooe + normalizedAmounts.co;
      const sourcePage = sourcePageFor(item) ?? fallbackSourcePage;

      if (!label || total <= 0 || item.is_total_row || isTotalLabel(label)) {
        return null;
      }

      return {
        name: label,
        row_type: isCostStructureName(label)
          ? "cost_structure_summary"
          : "program_or_purpose",
        amounts: {
          ...amounts,
          total,
        },
        source_pdf_page: sourcePage,
        source_pages: sourcePage ? [sourcePage] : undefined,
        section_category: fallbackCategory,
      };
    })
    .filter((row): row is BudgetEntityRow => row !== null);
}

function officeTotalFromNewOffice(office: NewDatasetOffice) {
  const directTotal = parseAmount(office.total_appropriations);
  if (directTotal > 0) return directTotal;

  const programTotals = normalizeAmounts(
    office.appropriations_by_program?.totals,
  );
  if (programTotals.total > 0) return programTotals.total;

  const objectTotals = normalizeAmounts(
    office.appropriations_by_object_of_expenditures?.totals,
  );
  if (objectTotals.total > 0) return objectTotals.total;

  const programItems =
    office.appropriations_by_program?.items ?? office.program_items ?? [];
  const objectItems =
    office.appropriations_by_object_of_expenditures?.items ??
    office.object_items ??
    [];
  const candidates = [...programItems, ...objectItems]
    .filter((item) =>
      /total appropriations/i.test(item.label ?? item.name ?? ""),
    )
    .map((item) => parseAmount(item.amount ?? item.total))
    .filter((amount) => amount > 0);
  const allAmounts = [...programItems, ...objectItems]
    .map((item) => parseAmount(item.amount ?? item.total))
    .filter((amount) => amount > 0);

  return Math.max(0, ...candidates, ...allAmounts);
}

function entityDetailFromNewOffice(
  officeKey: string,
  office: NewDatasetOffice,
): BudgetEntityDetail {
  const officeCode = office.code ?? officeKey;
  const officeName = office.name ?? officeKey;
  const sectionCategory =
    office.sector?.join(", ") ??
    office.category ??
    categoryForOfficeName(officeName);
  const total = officeTotalFromNewOffice(office);
  const programBreakdown = breakdownFromObjectItems(
    office.appropriations_by_program?.totals,
    total,
  );
  const objectBreakdown = breakdownFromObjectItems(
    office.appropriations_by_object_of_expenditures?.totals,
    total,
  );
  const breakdown = {
    ps: programBreakdown.ps || objectBreakdown.ps,
    mooe: programBreakdown.mooe || objectBreakdown.mooe,
    co: programBreakdown.co || objectBreakdown.co,
    total: programBreakdown.total || objectBreakdown.total || total,
  };
  const sourcePdfPage = office.pdf_page_start ?? office.pages?.[0];
  const programItems =
    office.appropriations_by_program?.items ?? office.program_items;
  const objectItems =
    office.appropriations_by_object_of_expenditures?.items ??
    office.object_items;

  return {
    entity_acronym: officeCode,
    entity_name: officeName,
    entity_category:
      office.category ?? office.classification ?? sectionCategory,
    section_category: sectionCategory,
    secondary_section_categories: office.sector,
    total,
    breakdown,
    source_pdf_page: sourcePdfPage,
    source_pages: {
      pdf_start_page: sourcePdfPage,
      pdf_end_page: office.pdf_page_end,
      printed_start_page: office.printed_page_start,
      printed_end_page: office.printed_page_end,
    },
    rows: rowsFromProgramItems(programItems, sectionCategory, sourcePdfPage),
    object_items: objectItems,
    special_provisions: normalizeSpecialProvisions(office.special_provisions),
  };
}

function programIdFor(
  year: number,
  agencyId: string,
  name: string,
  index: number,
) {
  const slug = slugFor(name).slice(0, 48);

  return `${year}-${agencyId}-${slug || index + 1}`;
}

function entityAmounts(detail: BudgetEntityDetail | undefined) {
  const directAmounts = detail?.breakdown ?? detail?.amounts;

  if (directAmounts) {
    return {
      ps: directAmounts.ps,
      mooe: directAmounts.mooe,
      co: directAmounts.co,
      total: directAmounts.total ?? detail?.total,
    };
  }

  const totalRow = detail?.rows?.find((row) => row.row_type === "total");

  if (totalRow?.amounts) {
    return {
      ps: totalRow.amounts.ps,
      mooe: totalRow.amounts.mooe,
      co: totalRow.amounts.co,
      total: totalRow.amounts.total ?? detail?.total,
    };
  }

  const costStructureAmounts = (detail?.rows ?? [])
    .filter((row) => row.row_type === "cost_structure_summary")
    .reduce<BudgetProgramFundAmounts>(
      (sum, row) => addAmounts(sum, row.amounts),
      { ps: 0, mooe: 0, co: 0, total: 0 },
    );

  return {
    ...costStructureAmounts,
    total: costStructureAmounts.total || parseAmount(detail?.total),
  };
}

function programRowsFor(detail: BudgetEntityDetail | undefined) {
  const rows = detail?.rows ?? [];
  const programRows = rows.filter(
    (row) =>
      row.row_type === "program_or_purpose" &&
      cleanProgramName(row.name ?? row.program_or_cost_structure_name),
  );

  if (programRows.length > 0) return programRows;

  return rows.filter((row) => row.row_type === "cost_structure_summary");
}

function normalizePrograms(
  year: number,
  agencyId: string,
  agencyName: string,
  detail: BudgetEntityDetail | undefined,
  fallbackAmounts: Amounts,
  sourceFile: string,
) {
  const programs: BudgetProgram[] = [];
  const details: Record<string, BudgetProgramDetail> = {};
  const rows = programRowsFor(detail);
  const programIdCounts = new Map<string, number>();

  function addProgram(
    programName: string,
    amounts: Amounts | undefined,
    group: string,
    sourcePages: number[] = [],
  ) {
    const normalizedAmounts = normalizeAmounts(amounts);
    const programTotal =
      normalizedAmounts.total ||
      normalizedAmounts.ps + normalizedAmounts.mooe + normalizedAmounts.co;

    if (programTotal <= 0) return;

    const baseProgramId = programIdFor(
      year,
      agencyId,
      programName,
      programs.length,
    );
    const duplicateCount = (programIdCounts.get(baseProgramId) ?? 0) + 1;
    programIdCounts.set(baseProgramId, duplicateCount);
    const programId =
      duplicateCount === 1
        ? baseProgramId
        : `${baseProgramId}-${duplicateCount}`;

    programs.push({
      program_id: programId,
      program_name: programName,
      personnel_services: normalizedAmounts.ps,
      mooe: normalizedAmounts.mooe,
      capital_outlays: normalizedAmounts.co,
      total: programTotal,
      source_file: sourceFile,
      source_page: sourcePages[0],
    });

    details[programId] = {
      program_id: programId,
      agency_id: agencyId,
      agency_name: agencyName,
      program_name: programName,
      group,
      source_pages: sourcePages,
      expense_class_amounts: {
        ...normalizedAmounts,
        total: programTotal,
      },
      object_distributions: objectDistributionsFromItems(detail?.object_items),
    };
  }

  rows.forEach((row, index) => {
    const programName =
      cleanProgramName(row.name ?? row.program_or_cost_structure_name) ||
      `${agencyName} line ${index + 1}`;

    addProgram(
      programName,
      row.amounts,
      row.row_type === "cost_structure_summary"
        ? "Cost structure"
        : "Program or purpose",
      [sourcePageFor(row)].filter((page): page is number => Boolean(page)),
    );
  });

  if (programs.length === 0) {
    addProgram(
      `${agencyName} appropriation`,
      fallbackAmounts,
      "Agency total",
      [sourcePageFor(detail)].filter((page): page is number => Boolean(page)),
    );
  }

  return { programs, details };
}

function entitiesForYear(year: number) {
  const newYear = rawBudget.years?.[String(year)];

  if (newYear?.offices) {
    return Object.fromEntries(
      Object.entries(newYear.offices).map(([officeKey, office]) => [
        office.code ?? officeKey,
        entityDetailFromNewOffice(officeKey, office),
      ]),
    );
  }

  return rawBudget.budget_details_by_year?.[String(year)]?.entities ?? {};
}

function trendEntitiesForYear(year: number) {
  const newYear = rawBudget.years?.[String(year)];

  if (newYear?.offices || newYear?.special_purpose_funds) {
    return Object.fromEntries(
      [
        ...Object.entries(newYear.offices ?? {}),
        ...Object.entries(newYear.special_purpose_funds ?? {}),
      ].map(([officeKey, office]) => [
        office.code ?? officeKey,
        entityDetailFromNewOffice(officeKey, office),
      ]),
    );
  }

  return entitiesForYear(year);
}

function totalAppropriationForYear(year: number) {
  const newYearTotal = normalizeTotalBudget(
    rawBudget.years?.[String(year)]?.total_budget,
  );

  if (newYearTotal > 0) return newYearTotal;

  return parseAmount(
    rawBudget.yearly_summary?.[String(year)]?.overall_appropriation,
  );
}

function normalizeBudgetYear(year: number) {
  const sourceFile = sourceFileForYear(year);
  const programDetails: Record<string, BudgetProgramDetail> = {};
  const agencies = Object.entries(entitiesForYear(year)).map(
    ([agencyId, detail]) => {
      const amounts = entityAmounts(detail);
      const normalizedAmounts = normalizeAmounts(amounts);
      const agencyName = detail.entity_name ?? agencyId;
      const normalizedPrograms = normalizePrograms(
        year,
        agencyId,
        agencyName,
        detail,
        amounts,
        sourceFile,
      );

      Object.assign(programDetails, normalizedPrograms.details);

      return {
        agency_id: agencyId,
        agency_name: agencyName,
        category:
          detail.section_category ??
          detail.entity_category ??
          "Uncategorized / Requires Review",
        office_category:
          detail.entity_category ??
          detail.section_category ??
          "Uncategorized / Requires Review",
        total_appropriation:
          normalizedAmounts.total || parseAmount(detail.total),
        personnel_services: normalizedAmounts.ps,
        mooe: normalizedAmounts.mooe,
        capital_outlays: normalizedAmounts.co,
        source_file: sourceFile,
        source_page: sourcePageFor(detail),
        programs: normalizedPrograms.programs,
      };
    },
  );

  return {
    budget: {
      fiscal_year: year,
      act_number: `GAAB FY ${year}`,
      total_appropriation: totalAppropriationForYear(year),
      agencies,
      source_note: rawBudget.notes?.join(" ") ?? rawBudget.metadata?.note,
      generated_at: rawBudget.generated_at,
    } satisfies BudgetYear,
    programDetails,
  };
}

function aggregateBudgetYears(years: number[]): BudgetYearSelection {
  const agencyMap = new Map<string, BudgetYear["agencies"][number]>();

  for (const year of years) {
    const budget = budgetByYear[year];

    for (const agency of budget.agencies) {
      const existing = agencyMap.get(agency.agency_id);

      if (!existing) {
        agencyMap.set(agency.agency_id, {
          ...agency,
          programs: [...agency.programs],
        });
        continue;
      }

      existing.total_appropriation += agency.total_appropriation;
      existing.personnel_services =
        (existing.personnel_services ?? 0) + (agency.personnel_services ?? 0);
      existing.mooe = (existing.mooe ?? 0) + (agency.mooe ?? 0);
      existing.capital_outlays =
        (existing.capital_outlays ?? 0) + (agency.capital_outlays ?? 0);
      existing.programs.push(...agency.programs);
    }
  }

  return {
    fiscal_year: years[years.length - 1] ?? latestBudgetYear,
    fiscal_years: years,
    act_number:
      years.length === 1
        ? `GAAB FY ${years[0]}`
        : `GAAB FY ${years[0]}-${years[years.length - 1]}`,
    total_appropriation: years.reduce(
      (sum, year) => sum + budgetByYear[year].total_appropriation,
      0,
    ),
    agencies: Array.from(agencyMap.values()).sort(
      (a, b) => b.total_appropriation - a.total_appropriation,
    ),
    source_note: rawBudget.notes?.join(" ") ?? rawBudget.metadata?.note,
    generated_at: rawBudget.generated_at,
  };
}

function objectLineItemCount(detail: BudgetEntityDetail | undefined) {
  if (detail?.object_items) return detail.object_items.length;

  return (detail?.rows ?? []).filter((row) => row.row_type !== "total").length;
}

function normalizeObjectSummaryYear(year: number) {
  return Object.fromEntries(
    Object.entries(entitiesForYear(year)).map(([agencyId, detail]) => [
      agencyId,
      {
        name: detail.entity_name ?? agencyId,
        entity_code: detail.entity_acronym ?? agencyId,
        category:
          detail.section_category ??
          detail.entity_category ??
          "Uncategorized / Requires Review",
        amounts: entityAmounts(detail),
        line_item_count: objectLineItemCount(detail),
      },
    ]),
  );
}

function normalizeOfficeSpecialProvisionRowsYear(
  year: number,
): BudgetOfficeSpecialProvisionRow[] {
  return Object.entries(entitiesForYear(year)).map(([agencyId, detail]) => ({
    fiscal_year: year,
    agency_id: detail.entity_acronym ?? agencyId,
    agency_name: detail.entity_name ?? agencyId,
    category:
      detail.section_category ??
      detail.entity_category ??
      "Uncategorized / Requires Review",
    total_appropriation: parseAmount(detail.total),
    source_page: sourcePageFor(detail),
    special_provisions: detail.special_provisions ?? [],
  }));
}

function normalizeOfficeTrendEntitiesYear(
  year: number,
): BudgetOfficeTrendEntity[] {
  return Object.entries(trendEntitiesForYear(year)).map(
    ([agencyId, detail]) => ({
      fiscal_year: year,
      agency_id: detail.entity_acronym ?? agencyId,
      agency_name: detail.entity_name ?? agencyId,
      office_category:
        detail.entity_category ??
        detail.section_category ??
        "Uncategorized / Requires Review",
      section_category:
        detail.section_category ??
        detail.entity_category ??
        "Uncategorized / Requires Review",
      total_appropriation: parseAmount(detail.total),
    }),
  );
}

function normalizeAgencyDetailRows(
  year: number,
  agencyId: string,
  detail: BudgetEntityDetail | undefined,
) {
  const budgetStructureRows = detailRowsFromBudgetStructure(year, agencyId);

  if (budgetStructureRows.length > 0) {
    return dedupeAgencyDetailRows(budgetStructureRows);
  }

  return dedupeAgencyDetailRows(
    (detail?.rows ?? [])
      .map<BudgetAgencyDetailRow | null>((row, index) => {
        const amounts = normalizeAmounts(row.amounts);
        const total = amounts.total || amounts.ps + amounts.mooe + amounts.co;
        const rowType = row.row_type ?? "source_row";

        if (rowType === "total" || total <= 0) return null;

        const cleanName = cleanProgramName(
          row.name ?? row.program_or_cost_structure_name,
        );

        return {
          fiscal_year: year,
          agency_id: agencyId,
          name:
            cleanName ||
            `${rowType === "program_or_purpose" ? "Program / purpose" : "Source"} line ${index + 1}`,
          row_type: rowType,
          personnel_services: amounts.ps,
          mooe: amounts.mooe,
          capital_outlays: amounts.co,
          total,
          source_page: sourcePageFor(row),
          section_category: row.section_category,
        };
      })
      .filter((row): row is BudgetAgencyDetailRow => row !== null),
  );
}

function detailRowsFromBudgetStructure(year: number, agencyId: string) {
  const entity = detailedBudget.by_program_per_year?.[String(year)]?.[agencyId];
  const budgetStructure = entity?.budget_structure;

  if (!budgetStructure) return [];

  return Object.entries(budgetStructure).flatMap<BudgetAgencyDetailRow>(
    ([structureName, structure]) => {
      const rows: BudgetAgencyDetailRow[] = [];
      const summaryRow = detailRowFromLine({
        year,
        agencyId,
        name: structureName,
        rowType: "cost_structure_summary",
        line: structure.summary,
        fallbackCategory:
          structure.section_category ??
          entity.section_category ??
          entity.category,
      });

      if (summaryRow) rows.push(summaryRow);

      for (const [programName, programLine] of Object.entries(
        structure.programs_or_purposes ?? {},
      )) {
        const programRow = detailRowFromLine({
          year,
          agencyId,
          name: programName,
          rowType: "program_or_purpose",
          line: programLine,
          fallbackCategory:
            programLine.section_category ?? structure.section_category,
        });

        if (programRow) rows.push(programRow);
      }

      return rows;
    },
  );
}

function detailRowFromLine({
  year,
  agencyId,
  name,
  rowType,
  line,
  fallbackCategory,
}: {
  year: number;
  agencyId: string;
  name: string;
  rowType: string;
  line: DetailedProgramLine | undefined;
  fallbackCategory?: string;
}) {
  const cleanName = cleanProgramName(name);
  const amounts = normalizeAmounts(line?.amounts);
  const total = amounts.total || amounts.ps + amounts.mooe + amounts.co;

  if (!cleanName || total <= 0) return null;

  return {
    fiscal_year: year,
    agency_id: agencyId,
    name: cleanName,
    row_type: rowType,
    personnel_services: amounts.ps,
    mooe: amounts.mooe,
    capital_outlays: amounts.co,
    total,
    source_page: sourcePageFor(line),
    section_category: line?.section_category ?? fallbackCategory,
  };
}

function dedupeAgencyDetailRows(rows: BudgetAgencyDetailRow[]) {
  const seenRows = new Set<string>();

  return rows.filter((row) => {
    const key = [
      row.row_type,
      row.name,
      row.personnel_services,
      row.mooe,
      row.capital_outlays,
      row.total,
      row.source_page,
    ].join("|");

    if (seenRows.has(key)) return false;
    seenRows.add(key);

    return true;
  });
}

function normalizeSectionCategoryTotals(
  year: number,
): BudgetSectionCategoryTotal[] {
  const yearKey = String(year);
  const entities = entitiesForYear(year);
  const sectionCategories =
    rawBudget.category_program_office_details_per_year?.[yearKey]
      ?.section_categories ?? {};
  const categoryNames = new Set([
    ...Object.keys(sectionCategories),
    ...Object.values(entities)
      .map((detail) => detail.section_category)
      .filter((category): category is string => Boolean(category)),
  ]);

  return Array.from(categoryNames)
    .map<BudgetSectionCategoryTotal | null>((category) => {
      const sectionDetail = sectionCategories[category];
      const entityIds = new Set(Object.keys(sectionDetail?.entities ?? {}));
      const matchingEntities = Object.entries(entities).filter(
        ([agencyId, detail]) =>
          entityIds.has(agencyId) || detail.section_category === category,
      );
      const breakdown = matchingEntities.reduce<BudgetProgramFundAmounts>(
        (sum, [, detail]) => addAmounts(sum, entityAmounts(detail)),
        { ps: 0, mooe: 0, co: 0, total: 0 },
      );
      const total =
        parseAmount(sectionDetail?.official_entity_total) || breakdown.total;

      if (total <= 0) return null;

      return {
        category,
        total,
        personnel: breakdown.ps,
        mooe: breakdown.mooe,
        capital: breakdown.co,
        entities: matchingEntities.length || entityIds.size,
        basis: "official_entity_total",
      };
    })
    .filter((row): row is BudgetSectionCategoryTotal => row !== null)
    .sort((a, b) => b.total - a.total);
}

function yearsFromDataset() {
  const coveredYears =
    Object.keys(rawBudget.years ?? {})
      .map(Number)
      .filter((year) => Number.isFinite(year)).length > 0
      ? Object.keys(rawBudget.years ?? {}).map(Number)
      : (rawBudget.summary_metrics?.years_covered ??
        Object.keys(rawBudget.yearly_summary ?? {}).map(Number));

  return coveredYears
    .filter((year) => Number.isFinite(year))
    .sort((a, b) => b - a);
}

export const budgetYears = yearsFromDataset();
const latestBudgetYear = budgetYears[0] ?? new Date().getFullYear();

const normalizedByYear = Object.fromEntries(
  budgetYears.map((year) => [year, normalizeBudgetYear(year)]),
);

export const budgetByYear: Record<number, BudgetYear> = Object.fromEntries(
  budgetYears.map((year) => [year, normalizedByYear[year].budget]),
);

export const budgetProgramDetailsByYear: Record<
  number,
  Record<string, BudgetProgramDetail>
> = Object.fromEntries(
  budgetYears.map((year) => [year, normalizedByYear[year].programDetails]),
);

export const budgetAgencyDetailRowsByYear: Record<
  number,
  Record<string, BudgetAgencyDetailRow[]>
> = Object.fromEntries(
  budgetYears.map((year) => [
    year,
    Object.fromEntries(
      Object.entries(entitiesForYear(year)).map(([agencyId, detail]) => [
        agencyId,
        normalizeAgencyDetailRows(year, agencyId, detail),
      ]),
    ),
  ]),
);

export const budgetCategories = Array.from(
  new Set(
    budgetYears.flatMap((year) =>
      Object.values(entitiesForYear(year))
        .map((detail) => detail.section_category ?? detail.entity_category)
        .filter((category): category is string => Boolean(category)),
    ),
  ),
).sort();

export const budgetSourceFiles = [
  canonicalDatasetFile,
  ...Object.values(rawBudget.years ?? {})
    .map((year) => year.source_file)
    .filter((file): file is string => Boolean(file)),
  ...(rawBudget.source_files ?? [])
    .map((file) => file.filename)
    .filter((file): file is string => Boolean(file)),
]
  .map((file) => file.replaceAll("BAA", "GAAB"))
  .filter((file, index, files) => files.indexOf(file) === index);

export const budgetSourceDocument = {
  file_name: canonicalDatasetFile,
  title: rawBudget.dataset_name,
  act_number: "FY2020-FY2026",
  act_type: "GAAB",
};

export const budgetNotes = rawBudget.notes ?? [];
export const budgetValidation = {};
export const budgetGeneratedAt = rawBudget.generated_at;
export const budgetObjectSummaryByYear = Object.fromEntries(
  budgetYears.map((year) => [String(year), normalizeObjectSummaryYear(year)]),
);
export const budgetOfficeSpecialProvisionRowsByYear: Record<
  number,
  BudgetOfficeSpecialProvisionRow[]
> = Object.fromEntries(
  budgetYears.map((year) => [
    year,
    normalizeOfficeSpecialProvisionRowsYear(year),
  ]),
);
export const budgetOfficeTrendEntitiesByYear: Record<
  number,
  BudgetOfficeTrendEntity[]
> = Object.fromEntries(
  budgetYears.map((year) => [year, normalizeOfficeTrendEntitiesYear(year)]),
);
export const budgetSectionCategoryTotalsByYear: Record<
  number,
  BudgetSectionCategoryTotal[]
> = Object.fromEntries(
  budgetYears.map((year) => [year, normalizeSectionCategoryTotals(year)]),
);

export function getBudgetYear(year: number) {
  return budgetByYear[year] ?? budgetByYear[latestBudgetYear];
}

export function getBudgetYearRange(fromYear?: number, toYear?: number) {
  const from = fromYear ?? latestBudgetYear;
  const to = toYear ?? from;
  const minYear = Math.min(from, to);
  const maxYear = Math.max(from, to);
  const selectedYears = budgetYears
    .filter((year) => year >= minYear && year <= maxYear)
    .sort((a, b) => a - b);

  if (selectedYears.length <= 1) {
    return getBudgetYear(selectedYears[0] ?? latestBudgetYear);
  }

  return aggregateBudgetYears(selectedYears);
}
