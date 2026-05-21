import {
  budgetObjectSummaryByYear,
  budgetSourceFiles,
  budgetYears,
} from "@betterbarmm/budget-data";
import { latestYear } from "./budget-view-model";

type ObjectSummaryDetail = {
  name?: string;
  entity_code?: string;
  category?: string;
  amounts?: {
    ps?: string | number | null;
    mooe?: string | number | null;
    co?: string | number | null;
    total?: string | number | null;
  };
  line_item_count?: number;
};

export interface BudgetObjectLine {
  rowNumber: number;
  year: number;
  agencyId: string;
  agency: string;
  entityCodes: string;
  fpap: string;
  operatingUnit: string;
  fund: string;
  expenseClassCode: string;
  expenseClass: string;
  objectId: string;
  objectCode: string;
  objectDescription: string;
  budgetLevel: string;
  amount: number;
  count: number;
  sourceYears: string;
  sourceFiles: string;
}

const expenseClasses = [
  {
    code: "PS",
    label: "Personnel Services",
    amountKey: "ps",
  },
  {
    code: "MOOE",
    label: "Maintenance and Other Operating Expenses",
    amountKey: "mooe",
  },
  {
    code: "CO",
    label: "Capital Outlays",
    amountKey: "co",
  },
] as const;

function parseAmount(value: string | number | null | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function slugFor(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function objectSummariesForYear(year: number) {
  return (budgetObjectSummaryByYear[String(year)] ?? {}) as Record<
    string,
    ObjectSummaryDetail
  >;
}

export const objectFiscalYears = budgetYears
  .filter((year) => Object.keys(objectSummariesForYear(year)).length > 0)
  .sort((a, b) => a - b);

export const defaultObjectYear =
  objectFiscalYears.includes(latestYear) || objectFiscalYears.length === 0
    ? latestYear
    : objectFiscalYears[objectFiscalYears.length - 1];

export function getObjectLinesForYear(year: number) {
  const sourceFiles = budgetSourceFiles.join("; ");
  let rowNumber = 0;

  return Object.entries(objectSummariesForYear(year))
    .flatMap(([agencyId, detail]) => {
      const amounts = detail.amounts ?? {};

      return expenseClasses.flatMap((expenseClass) => {
        const amount = parseAmount(amounts[expenseClass.amountKey]);

        if (amount <= 0) return [];

        rowNumber += 1;

        return [
          {
            rowNumber,
            year,
            agencyId,
            agency: detail.name ?? agencyId,
            entityCodes: detail.entity_code ?? agencyId,
            fpap: "Appropriations by Object of Expenditures",
            operatingUnit: detail.name ?? agencyId,
            fund: detail.category ?? "Uncategorized",
            expenseClassCode: expenseClass.code,
            expenseClass: expenseClass.label,
            objectId: `${agencyId}-${expenseClass.code}`,
            objectCode: `${slugFor(agencyId)}-${expenseClass.code}`,
            objectDescription: expenseClass.label,
            budgetLevel: "object_expenditure_summary",
            amount,
            count: detail.line_item_count ?? 0,
            sourceYears: String(year),
            sourceFiles,
          } satisfies BudgetObjectLine,
        ];
      });
    })
    .sort((a, b) => b.amount - a.amount);
}

export function getObjectYearStats() {
  return objectFiscalYears.map((year) => {
    const summaries = Object.values(objectSummariesForYear(year));
    const rows = getObjectLinesForYear(year);
    const total = summaries.reduce(
      (sum, detail) => sum + parseAmount(detail.amounts?.total),
      0,
    );
    const sourceLineItems = summaries.reduce(
      (sum, detail) => sum + (detail.line_item_count ?? 0),
      0,
    );

    return {
      year,
      total,
      rows: sourceLineItems,
      agencies: summaries.length,
      objects: rows.length,
    };
  });
}

export function getObjectFilterOptions(rows: BudgetObjectLine[]) {
  const agencies = Array.from(
    new Map(
      rows.map((row) => [
        row.agencyId,
        {
          id: row.agencyId,
          label: row.agency,
        },
      ]),
    ).values(),
  ).sort((a, b) => a.label.localeCompare(b.label));

  const classes = Array.from(
    new Map(
      rows.map((row) => [
        row.expenseClassCode,
        {
          id: row.expenseClassCode,
          label: row.expenseClass,
        },
      ]),
    ).values(),
  ).sort((a, b) => a.id.localeCompare(b.id));

  return { agencies, classes };
}

export function filterObjectLines(
  rows: BudgetObjectLine[],
  filters: {
    query?: string;
    agencyId?: string;
    expenseClassCode?: string;
  },
) {
  const query = filters.query?.trim().toLowerCase() ?? "";

  return rows.filter((row) => {
    const matchesQuery =
      !query ||
      [
        row.objectCode,
        row.objectDescription,
        row.agency,
        row.entityCodes,
        row.fpap,
        row.expenseClassCode,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesAgency =
      !filters.agencyId || row.agencyId === filters.agencyId;
    const matchesClass =
      !filters.expenseClassCode ||
      row.expenseClassCode === filters.expenseClassCode;

    return matchesQuery && matchesAgency && matchesClass;
  });
}

export function objectRowsToCsv(rows: BudgetObjectLine[]) {
  const headers = [
    "year",
    "agency_id",
    "agency",
    "entity_codes",
    "fpap",
    "expense_class_code",
    "expense_class",
    "object_code",
    "object_description",
    "amount",
    "source_line_item_count_for_agency",
    "source_files",
  ];
  const escape = (value: string | number) => {
    const text = String(value);

    if (!/[",\n]/.test(text)) return text;
    return `"${text.replaceAll('"', '""')}"`;
  };

  return [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.year,
        row.agencyId,
        row.agency,
        row.entityCodes,
        row.fpap,
        row.expenseClassCode,
        row.expenseClass,
        row.objectCode,
        row.objectDescription,
        row.amount,
        row.count,
        row.sourceFiles,
      ]
        .map(escape)
        .join(","),
    ),
  ].join("\n");
}

