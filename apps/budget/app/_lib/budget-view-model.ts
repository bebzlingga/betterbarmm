import {
  budgetAgencyDetailRowsByYear,
  budgetOfficeSpecialProvisionRowsByYear,
  budgetOfficeTrendEntitiesByYear,
  budgetProgramDetailsByYear,
  budgetSectionCategoryTotalsByYear,
  budgetSourceFiles,
  budgetYears,
  getBudgetYearRange,
  type BudgetProgramDetail,
} from "@betterbarmm/budget-data";

export type BudgetSearchParams = Promise<BudgetSearchParamRecord>;

export type BudgetSearchParamRecord = {
  from?: string | string[];
  to?: string | string[];
  year?: string | string[];
  q?: string | string[];
  agency?: string | string[];
  category?: string | string[];
  class?: string | string[];
  page?: string | string[];
  trend?: string | string[];
};

export const fiscalYearOptions = [...budgetYears].sort((a, b) => a - b);
export const fiscalYearRange =
  fiscalYearOptions[0] === fiscalYearOptions[fiscalYearOptions.length - 1]
    ? String(fiscalYearOptions[0])
    : `${fiscalYearOptions[0]} - ${fiscalYearOptions[fiscalYearOptions.length - 1]}`;
export const latestYear = fiscalYearOptions[fiscalYearOptions.length - 1];
export const earliestYear = fiscalYearOptions[0];
export const sourceFiles = budgetSourceFiles;

export function compactCurrency(value: number) {
  return `PHP ${(value / 1_000_000_000).toFixed(1)}B`;
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(
      /(^|[\s(/-])([a-z])/g,
      (_match, prefix: string, letter: string) =>
        `${prefix}${letter.toUpperCase()}`,
    );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseYearParam(
  value: string | string[] | undefined,
  fallback: number,
) {
  const parsed = Number(firstParam(value));

  return fiscalYearOptions.includes(parsed) ? parsed : fallback;
}

export function normalizeYearRange(
  params: BudgetSearchParamRecord = {},
  fallbackYear = latestYear,
) {
  const singleYear = parseYearParam(params.year, fallbackYear);

  return {
    fromYear: singleYear,
    toYear: singleYear,
  };
}

export function fiscalYearLabel(fromYear: number, toYear: number) {
  return fromYear === toYear
    ? `FY ${toYear}`
    : `FY ${fromYear} to FY ${toYear}`;
}

export function percentOfTotal(value: number, total: number) {
  if (total <= 0) return "0%";

  const percentage = Math.round((value / total) * 100);
  return `${Math.max(0, Math.min(100, percentage))}%`;
}

function yearsForBudget(budget: ReturnType<typeof getBudgetYearRange>) {
  const fiscalYears =
    "fiscal_years" in budget && Array.isArray(budget.fiscal_years)
      ? budget.fiscal_years
      : undefined;

  return fiscalYears && fiscalYears.length > 0
    ? fiscalYears
    : [budget.fiscal_year];
}

export function getBudgetSelection(params: BudgetSearchParamRecord = {}) {
  const { fromYear, toYear } = normalizeYearRange(params);
  const budget = getBudgetYearRange(fromYear, toYear);

  return {
    budget,
    fromYear,
    toYear,
    selectedYearLabel: fiscalYearLabel(fromYear, toYear),
  };
}

export function getLatestBudgetSelection() {
  const budget = getBudgetYearRange(latestYear, latestYear);

  return {
    budget,
    fromYear: latestYear,
    toYear: latestYear,
    selectedYearLabel: fiscalYearLabel(latestYear, latestYear),
  };
}

export function getFullBudgetSelection() {
  const budget = getBudgetYearRange(earliestYear, latestYear);

  return {
    budget,
    fromYear: earliestYear,
    toYear: latestYear,
    selectedYearLabel: fiscalYearLabel(earliestYear, latestYear),
  };
}

export function buildAgencyRows(budget: ReturnType<typeof getBudgetYearRange>) {
  const years = yearsForBudget(budget);

  return budget.agencies.map((agency) => {
    const personnel =
      agency.personnel_services ??
      agency.programs.reduce(
        (sum, program) => sum + program.personnel_services,
        0,
      );
    const mooe =
      agency.mooe ??
      agency.programs.reduce((sum, program) => sum + program.mooe, 0);
    const capital =
      agency.capital_outlays ??
      agency.programs.reduce(
        (sum, program) => sum + program.capital_outlays,
        0,
      );

    return {
      ...agency,
      personnel,
      mooe,
      capital,
      detailRows: years.flatMap(
        (year) => budgetAgencyDetailRowsByYear[year]?.[agency.agency_id] ?? [],
      ),
    };
  });
}

export type AgencyRow = ReturnType<typeof buildAgencyRows>[number];

export function buildOfficeSpecialProvisionRows(year = latestYear) {
  return [...(budgetOfficeSpecialProvisionRowsByYear[year] ?? [])].sort(
    (a, b) => b.total_appropriation - a.total_appropriation,
  );
}

export type OfficeSpecialProvisionRow = ReturnType<
  typeof buildOfficeSpecialProvisionRows
>[number];

function officeTrendOptionValue(kind: "category" | "office", key: string) {
  return `${kind}:${key}`;
}

function parseOfficeTrendValue(value: string | undefined) {
  const [kind, ...rest] = (value ?? "").split(":");
  const key = rest.join(":");

  if ((kind === "category" || kind === "office") && key) {
    return { kind, key };
  }

  return null;
}

function officeCategoryLabel(category: string) {
  return category === "Special Purpose Fund" ? "Special Funds" : category;
}

function officeCategorySortValue(label: string) {
  const order = [
    "Ministry",
    "Ministry/Executive",
    "Ministry/Parliament",
    "Other Executive Office",
    "Special Funds",
  ];
  const index = order.indexOf(label);

  return index === -1 ? order.length : index;
}

export function buildOfficeTrendSelectGroups() {
  const groups = new Map<string, Map<string, string>>();

  for (const year of fiscalYearOptions) {
    for (const entity of budgetOfficeTrendEntitiesByYear[year] ?? []) {
      const groupLabel = officeCategoryLabel(entity.office_category);
      const offices = groups.get(groupLabel) ?? new Map<string, string>();

      offices.set(
        entity.agency_id,
        `${titleCase(entity.agency_name)} (${entity.agency_id})`,
      );
      groups.set(groupLabel, offices);
    }
  }

  return Array.from(groups.entries())
    .map(([label, offices]) => ({
      label,
      options: Array.from(offices.entries())
        .map(([key, optionLabel]) => ({
          value: officeTrendOptionValue("office", key),
          label: optionLabel,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    }))
    .sort(
      (a, b) =>
        officeCategorySortValue(a.label) - officeCategorySortValue(b.label) ||
        a.label.localeCompare(b.label),
    );
}

export function resolveOfficeTrendValue(value: string | undefined) {
  const groups = buildOfficeTrendSelectGroups();
  const allOptions = groups.flatMap((group) => group.options);
  const fallback = allOptions[0];

  return allOptions.some((option) => option.value === value)
    ? value!
    : (fallback?.value ?? "");
}

export function officeTrendLabelForValue(value: string) {
  const option = buildOfficeTrendSelectGroups()
    .flatMap((group) => group.options)
    .find((item) => item.value === value);

  return option?.label ?? "Budget trend";
}

export function buildOfficeTrendRows(value: string) {
  const selection = parseOfficeTrendValue(value);

  return fiscalYearOptions.map((year) => {
    const entities = budgetOfficeTrendEntitiesByYear[year] ?? [];
    const matchedEntities = selection
      ? entities.filter((entity) =>
          selection.kind === "category"
            ? entity.office_category === selection.key
            : entity.agency_id === selection.key,
        )
      : [];

    return {
      year,
      total: matchedEntities.reduce(
        (sum, entity) => sum + entity.total_appropriation,
        0,
      ),
      entities: matchedEntities.length,
    };
  });
}

export function buildExpenseClasses(agencyRows: AgencyRow[]) {
  return [
    {
      label: "Personnel Services",
      shortLabel: "PS",
      value: agencyRows.reduce((sum, agency) => sum + agency.personnel, 0),
      color: "bg-[var(--positive)]",
      description: "Salaries, wages, and benefits",
    },
    {
      label: "Maintenance and Other Operating Expenses",
      shortLabel: "MOOE",
      value: agencyRows.reduce((sum, agency) => sum + agency.mooe, 0),
      color: "bg-[var(--ochre)]",
      description: "Maintenance, operations, grants, and services",
    },
    {
      label: "Capital Outlays",
      shortLabel: "CO",
      value: agencyRows.reduce((sum, agency) => sum + agency.capital, 0),
      color: "bg-[var(--slate)]",
      description: "Infrastructure, equipment, and long-lived assets",
    },
  ];
}

export function buildProgramRows(
  budget: ReturnType<typeof getBudgetYearRange>,
) {
  const detailsByProgram = Object.assign(
    {},
    ...yearsForBudget(budget).map(
      (year) => budgetProgramDetailsByYear[year] ?? {},
    ),
  ) as NonNullable<(typeof budgetProgramDetailsByYear)[number]>;

  return budget.agencies.flatMap((agency) =>
    agency.programs.map((program) => {
      const detail = detailsByProgram[program.program_id];
      const total =
        program.total ||
        program.personnel_services + program.mooe + program.capital_outlays;

      return {
        ...program,
        total,
        agency_id: agency.agency_id,
        agency_name: agency.agency_name,
        office_category:
          agency.office_category ?? agency.category ?? "Uncategorized",
        category: agency.category ?? "Uncategorized",
        source: [
          program.source_file ?? "Source pending",
          program.source_page ? `p.${program.source_page}` : null,
        ]
          .filter(Boolean)
          .join(" / "),
        detail: buildProgramDetail(program, total, detail),
      };
    }),
  );
}

export type ProgramRow = ReturnType<typeof buildProgramRows>[number];

function buildProgramDetail(
  program: ReturnType<
    typeof getBudgetYearRange
  >["agencies"][number]["programs"][number],
  total: number,
  detail: BudgetProgramDetail | undefined,
) {
  return {
    group: detail?.group ?? "Program",
    sourcePages: detail?.source_pages ?? [],
    expenseClasses: [
      {
        label: "Personnel Services",
        shortLabel: "PS",
        value: program.personnel_services,
        share: percentOfTotal(program.personnel_services, total),
        color: "bg-[var(--slate)]",
        description: "Salaries, wages, and benefits",
      },
      {
        label: "Maintenance and Other Operating Expenses",
        shortLabel: "MOOE",
        value: program.mooe,
        share: percentOfTotal(program.mooe, total),
        color: "bg-[var(--accent)]",
        description: "Operations, grants, services, supplies",
      },
      {
        label: "Capital Outlays",
        shortLabel: "CO",
        value: program.capital_outlays,
        share: percentOfTotal(program.capital_outlays, total),
        color: "bg-[var(--positive)]",
        description: "Equipment, infrastructure, and long-lived assets",
      },
    ].filter((expenseClass) => expenseClass.value > 0),
    objectDistributions: detail?.object_distributions ?? [],
  };
}

export function buildCategoryRows(agencyRows: AgencyRow[]) {
  const categories = new Map<
    string,
    {
      category: string;
      agencies: number;
      total: number;
      personnel: number;
      mooe: number;
      capital: number;
    }
  >();

  for (const agency of agencyRows) {
    const category = agency.category ?? "Uncategorized";
    const row = categories.get(category) ?? {
      category,
      agencies: 0,
      total: 0,
      personnel: 0,
      mooe: 0,
      capital: 0,
    };

    row.agencies += 1;
    row.total += agency.total_appropriation;
    row.personnel += agency.personnel;
    row.mooe += agency.mooe;
    row.capital += agency.capital;
    categories.set(category, row);
  }

  return Array.from(categories.values()).sort((a, b) => b.total - a.total);
}

export function buildSectionCategoryRows(
  budget: ReturnType<typeof getBudgetYearRange>,
) {
  const years = yearsForBudget(budget);

  if (years.length <= 1) {
    return budgetSectionCategoryTotalsByYear[budget.fiscal_year] ?? [];
  }

  const categoryRows = new Map<
    string,
    NonNullable<(typeof budgetSectionCategoryTotalsByYear)[number]>[number]
  >();

  for (const year of years) {
    for (const row of budgetSectionCategoryTotalsByYear[year] ?? []) {
      const existing = categoryRows.get(row.category);

      if (!existing) {
        categoryRows.set(row.category, {
          ...row,
          basis: "summed_official_entity_total",
        });
        continue;
      }

      existing.total += row.total;
      existing.personnel += row.personnel;
      existing.mooe += row.mooe;
      existing.capital += row.capital;
      existing.entities += row.entities;
    }
  }

  return Array.from(categoryRows.values()).sort((a, b) => b.total - a.total);
}

export type SectionCategoryRow = ReturnType<
  typeof buildSectionCategoryRows
>[number];

export function buildYearRows() {
  return fiscalYearOptions.map((year) => {
    const budget = getBudgetYearRange(year, year);
    const agencies = buildAgencyRows(budget);
    const programs = buildProgramRows(budget);
    const expenses = buildExpenseClasses(agencies);
    const largestClass = expenses.reduce(
      (largest, item) => (item.value > largest.value ? item : largest),
      expenses[0],
    );

    return {
      year,
      actNumber: budget.act_number,
      total: budget.total_appropriation,
      agencies: agencies.length,
      programs: programs.length,
      personnel: expenses[0].value,
      mooe: expenses[1].value,
      capital: expenses[2].value,
      largestClass:
        budget.total_appropriation > 0 ? largestClass.shortLabel : "None",
    };
  });
}
