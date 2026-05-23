import { BudgetFiscalYearTiles } from "../_components/budget-fiscal-year-tiles";
import { BudgetPageShell } from "../_components/budget-page-shell";
import { BudgetProgramBrowser } from "../_components/budget-program-browser";
import { type BudgetSelectGroup } from "../_components/budget-select-field";
import { titleCase } from "../_components/budget-office-allocation-table";
import {
  buildProgramRows,
  buildYearRows,
  getBudgetSelection,
  type BudgetSearchParams,
  type ProgramRow,
} from "../_lib/budget-view-model";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
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

function uniqueOfficeGroups(programs: ProgramRow[]): BudgetSelectGroup[] {
  const groups = new Map<string, Map<string, string>>();

  for (const program of programs) {
    const groupLabel = officeCategoryLabel(program.office_category);
    const offices = groups.get(groupLabel) ?? new Map<string, string>();

    offices.set(
      program.agency_id,
      `${titleCase(program.agency_name)} (${program.agency_id})`,
    );
    groups.set(groupLabel, offices);
  }

  return Array.from(groups.entries())
    .map(([label, offices]) => ({
      label,
      options: Array.from(offices.entries())
        .map(([value, optionLabel]) => ({
          value,
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

function uniqueCategoryOptions(programs: ProgramRow[]) {
  return Array.from(new Set(programs.map((program) => program.category))).sort(
    (a, b) => a.localeCompare(b),
  );
}

export default async function BudgetProgramsPage({
  searchParams,
}: {
  searchParams: BudgetSearchParams;
}) {
  const params = await searchParams;
  const { budget, toYear, selectedYearLabel } = getBudgetSelection(params);
  const selectedCategory = firstParam(params.category) ?? "";
  const selectedAgencyId = firstParam(params.agency) ?? "";
  const selectedQuery = firstParam(params.q) ?? "";
  const yearRows = buildYearRows();
  const programRows = buildProgramRows(budget).sort(
    (a, b) => b.total - a.total,
  );
  const categoryOptions = uniqueCategoryOptions(programRows);
  const categoryGroups: BudgetSelectGroup[] = [
    {
      label: "Section categories",
      options: categoryOptions.map((category) => ({
        value: category,
        label: category,
      })),
    },
  ];
  const officeGroups = uniqueOfficeGroups(programRows);

  return (
    <BudgetPageShell activeItem="Programs">
      <BudgetFiscalYearTiles
        rows={yearRows}
        selectedYear={toYear}
        flushTop
        hrefBasePath="/programs"
      />

      <BudgetProgramBrowser
        programs={programRows}
        total={budget.total_appropriation}
        label={selectedYearLabel}
        year={toYear}
        categoryGroups={categoryGroups}
        officeGroups={officeGroups}
        initialCategory={selectedCategory}
        initialAgencyId={selectedAgencyId}
        initialQuery={selectedQuery}
      />
    </BudgetPageShell>
  );
}
