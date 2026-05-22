import { Minus, Plus } from "lucide-react";
import { type AgencyRow } from "../_lib/budget-view-model";
import { AutoScrollDetails } from "./auto-scroll-details";

interface BudgetOfficeAllocationTableProps {
  agencies: AgencyRow[];
  total: number;
  label: string;
}

const nonOfficeAllocationIds = new Set([
  "CF",
  "IMPACT",
  "MPBF",
  "PGF",
  "QRF",
  "SAMLMG",
  "SDF",
  "BSFJ",
]);

function allocationShare(value: number, total: number) {
  if (total <= 0 || value <= 0) return "0%";

  return `${Math.max(1, Math.min(100, (value / total) * 100))}%`;
}

function allocationPercent(value: number, total: number) {
  if (total <= 0 || value <= 0) return "0%";

  return `${Math.round((value / total) * 100)}%`;
}

export function budgetShare(value: number, total: number, _label?: string) {
  if (total <= 0 || value <= 0) return "0%";

  const percentage = (value / total) * 100;
  const digits = percentage >= 10 ? 1 : 2;

  return `${percentage.toFixed(digits).replace(/\.0$/, "")}%`;
}

export function compactTableCurrency(value: number) {
  const absValue = Math.abs(value);
  const divisor =
    absValue >= 1_000_000_000
      ? 1_000_000_000
      : absValue >= 1_000_000
        ? 1_000_000
        : absValue >= 1_000
          ? 1_000
          : 1;
  const suffix =
    absValue >= 1_000_000_000
      ? "B"
      : absValue >= 1_000_000
        ? "M"
        : absValue >= 1_000
          ? "K"
          : "";
  const amount = value / divisor;
  const digits = Math.abs(amount) >= 10 || suffix === "" ? 0 : 1;

  return `PHP ${amount.toFixed(digits).replace(/\.0$/, "")}${suffix}`;
}

export function exactTableCurrency(value: number) {
  return `PHP ${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b([a-z])/g, (letter) => letter.toUpperCase());
}

function isOfficeAllocation(agency: AgencyRow) {
  if (nonOfficeAllocationIds.has(agency.agency_id)) return false;
  if (/fund/i.test(agency.agency_name)) return false;

  return true;
}

function amountForProgram(program: AgencyRow["programs"][number]) {
  return (
    program.total ||
    program.personnel_services + program.mooe + program.capital_outlays
  );
}

function sourceLabelForProgram(program: AgencyRow["programs"][number]) {
  return (
    [
      program.source_file,
      program.source_page ? `p.${program.source_page}` : null,
    ]
      .filter(Boolean)
      .join(" / ") || "Source table"
  );
}

function sourceLabelForDetailRow(row: AgencyRow["detailRows"][number]) {
  return row.source_page ? `P.${row.source_page}` : "Source table";
}

function metaForDetailRow(row: AgencyRow["detailRows"][number]) {
  return [
    row.section_category,
    `FY ${row.fiscal_year}`,
    sourceLabelForDetailRow(row),
  ].filter(Boolean);
}

function detailedSourceLineRows(agency: AgencyRow) {
  return agency.detailRows.filter(
    (row) => row.row_type === "program_or_purpose",
  );
}

function detailedSourceLineCountLabel(count: number) {
  return `${count} detailed source ${count === 1 ? "line" : "lines"}`;
}

function costStructureOrder(name: string) {
  if (/general (administration|administrative).*support/i.test(name)) return 0;
  if (/support to operations/i.test(name)) return 1;
  if (/operations/i.test(name)) return 2;

  return 3;
}

export function BudgetOfficeAllocationTable({
  agencies,
  total,
  label,
}: BudgetOfficeAllocationTableProps) {
  const sortedAgencies = agencies
    .filter(isOfficeAllocation)
    .sort((a, b) => b.total_appropriation - a.total_appropriation);

  return (
    <section className="my-16 sm:my-24">
      <div className="mb-6! flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Office allocation</p>
          <h2 className="num mt-2 text-3xl font-extrabold uppercase tracking-normal sm:text-5xl">
            By Office Allotted Budget
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-5 bg-[var(--positive)]" />
            PS
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-5 bg-[var(--ochre)]" />
            MOOE
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-5 bg-[var(--slate)]" />
            CO
          </span>
        </div>
      </div>

      <div className="overflow-x-auto bg-[var(--paper)]">
        <div className="md:min-w-[860px]">
          {sortedAgencies.map((agency) => {
            const allocationTotal =
              agency.personnel + agency.mooe + agency.capital ||
              agency.total_appropriation;
            const detailedSourceLineCount =
              detailedSourceLineRows(agency).length;

            return (
              <AutoScrollDetails
                key={agency.agency_id}
                name="office-allocation"
                className="group border-b border-[var(--rule-soft)] last:border-b-0"
              >
                <summary className="grid cursor-pointer list-none gap-1 transition hover:bg-[var(--paper-2)] group-open:bg-[var(--ink)] group-open:text-[var(--paper)] group-open:hover:bg-[var(--ink)] md:grid-cols-[minmax(22rem,1fr)_minmax(16rem,30%)] md:items-center [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center px-4 py-4 leading-tight sm:px-6 md:py-3">
                    <span className="mr-5 grid size-4 shrink-0 place-items-center border border-[var(--rule)] text-[var(--accent)] group-open:border-[var(--paper-2)] group-open:text-[var(--paper)]">
                      <Plus
                        className="size-2.5 group-open:hidden"
                        aria-hidden="true"
                      />
                      <Minus
                        className="hidden size-2.5 group-open:block"
                        aria-hidden="true"
                      />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--ink)] group-open:text-[var(--paper)]">
                        {titleCase(agency.agency_name)}{" "}
                        <span className="font-normal uppercase tracking-[0.08em] text-[var(--ink-3)] group-open:text-[var(--paper-2)]">
                          ({agency.agency_id})
                        </span>
                      </p>
                      <p className="mt-1 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-[var(--ink-3)] group-open:text-[var(--paper-2)]">
                        {detailedSourceLineCountLabel(detailedSourceLineCount)}
                      </p>
                    </div>
                  </div>
                  <div className="px-4 pb-4 sm:px-6 md:py-3">
                    <div className="mb-2 flex items-baseline justify-between gap-4">
                      <p className="num text-left text-sm font-semibold leading-tight text-[var(--ink)] group-open:text-[var(--paper)]">
                        {exactTableCurrency(agency.total_appropriation)}
                      </p>
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] group-open:text-[var(--paper-2)]">
                        {budgetShare(agency.total_appropriation, total, label)}
                      </p>
                    </div>
                    <AllocationBar
                      personnel={agency.personnel}
                      mooe={agency.mooe}
                      capital={agency.capital}
                      total={allocationTotal}
                      activeOnOpen
                      compact
                    />
                  </div>
                </summary>
                <OfficeAllocationDetail agency={agency} />
              </AutoScrollDetails>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function AllocationBar({
  personnel,
  mooe,
  capital,
  total,
  detailed = false,
  activeOnOpen = false,
  compact = false,
}: {
  personnel: number;
  mooe: number;
  capital: number;
  total: number;
  detailed?: boolean;
  activeOnOpen?: boolean;
  compact?: boolean;
}) {
  const labels = [
    {
      shortLabel: "PS",
      value: personnel,
      color: "bg-[var(--positive)]",
    },
    {
      shortLabel: "MOOE",
      value: mooe,
      color: "bg-[var(--ochre)]",
    },
    {
      shortLabel: "CO",
      value: capital,
      color: "bg-[var(--slate)]",
    },
  ];

  return (
    <>
      <div
        className={`flex overflow-hidden border border-[var(--ink)] bg-[var(--paper-2)] ${
          compact ? "h-2.5" : "h-4"
        }`}
      >
        <div
          className="h-full bg-[var(--positive)]"
          style={{ width: allocationShare(personnel, total) }}
          title={`PS ${allocationPercent(personnel, total)} / ${compactTableCurrency(personnel)}`}
        />
        <div
          className="h-full bg-[var(--ochre)]"
          style={{ width: allocationShare(mooe, total) }}
          title={`MOOE ${allocationPercent(mooe, total)} / ${compactTableCurrency(mooe)}`}
        />
        <div
          className="h-full bg-[var(--slate)]"
          style={{ width: allocationShare(capital, total) }}
          title={`CO ${allocationPercent(capital, total)} / ${compactTableCurrency(capital)}`}
        />
      </div>
      <div
        className={`mt-0.5 flex flex-wrap justify-between gap-x-2 gap-y-1 font-mono font-semibold uppercase leading-tight tracking-[0.08em] text-[var(--ink-3)] ${
          compact ? "text-[7px]" : "text-[8px]"
        } ${activeOnOpen ? "group-open:text-[var(--paper-2)]" : ""}`}
      >
        {labels.map((label) => (
          <span
            key={label.shortLabel}
            className="inline-flex items-center gap-1.5 whitespace-nowrap"
            title={`${label.shortLabel} ${allocationPercent(label.value, total)} / ${compactTableCurrency(label.value)}`}
          >
            <span className={`h-1 w-2 ${label.color}`} />
            {detailed
              ? `${label.shortLabel} / ${compactTableCurrency(label.value)}`
              : `${compactTableCurrency(label.value)} ${label.shortLabel}`}
          </span>
        ))}
      </div>
    </>
  );
}

function OfficeAllocationDetail({ agency }: { agency: AgencyRow }) {
  const programs = [...agency.programs].sort(
    (a, b) => amountForProgram(b) - amountForProgram(a),
  );
  const detailRows = [...agency.detailRows];
  const costRows = detailRows
    .filter((row) => row.row_type === "cost_structure_summary")
    .sort(
      (a, b) =>
        costStructureOrder(a.name) - costStructureOrder(b.name) ||
        b.total - a.total,
    );
  const purposeRows = detailedSourceLineRows(agency).sort(
    (a, b) => b.total - a.total,
  );

  return (
    <div className="border border-[var(--ink-3)] bg-[var(--paper-2)] px-4 py-5 sm:px-6 lg:px-12 lg:py-6">
      {costRows.length > 0 || purposeRows.length > 0 ? (
        <div className="mt-5 space-y-7">
          <DetailRowGroup
            title="Administrative, support, and operations split"
            description="High-level cost-structure rows from the source table."
            rows={costRows}
          />
          <DetailRowGroup
            title="Program / purpose lines"
            description="Detailed source lines sorted by highest budget."
            rows={purposeRows}
          />
        </div>
      ) : (
        <div className="mt-5 divide-y divide-[var(--rule-soft)] border-y border-[var(--rule)]">
          {programs.map((program) => {
            const programTotal = amountForProgram(program);

            return (
              <div
                key={program.program_id}
                className="grid items-center gap-3 py-5 sm:gap-5 lg:grid-cols-[minmax(18rem,1fr)_13rem_24rem]"
              >
                <div>
                  <p className="text-base font-semibold text-[var(--ink)]">
                    {titleCase(program.program_name)}
                  </p>
                  <div className="mt-2 grid gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-3)] sm:grid-cols-2">
                    <p>{program.program_id}</p>
                    <p>{sourceLabelForProgram(program)}</p>
                  </div>
                </div>
                <p className="num text-left text-sm font-semibold">
                  {exactTableCurrency(programTotal)}
                </p>
                <div>
                  <AllocationBar
                    personnel={program.personnel_services}
                    mooe={program.mooe}
                    capital={program.capital_outlays}
                    total={programTotal}
                    detailed
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DetailRowGroup({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: AgencyRow["detailRows"];
}) {
  if (rows.length === 0) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule)] pb-3">
        <div>
          {/* <p className='font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]'>{title}</p> */}
          <h3 className="uppercase num mt-1">{description}</h3>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)]">
          {rows.length} lines
        </p>
      </div>
      <div className="divide-y divide-[var(--rule-soft)]">
        {rows.map((row, index) => (
          <DetailAllocationRow
            key={`${row.fiscal_year}-${row.row_type}-${row.name}-${row.total}-${index}`}
            row={row}
          />
        ))}
      </div>
    </div>
  );
}

function DetailAllocationRow({
  row,
}: {
  row: AgencyRow["detailRows"][number];
}) {
  return (
    <div className="grid items-center gap-3 py-3 sm:gap-5 lg:grid-cols-[minmax(18rem,1fr)_13rem_24rem]">
      <div className="sm:pr-16">
        <p className="text-sm font-semibold text-[var(--ink)] leading-0 leading-snug!">
          {titleCase(row.name)}
        </p>
        <p className="mt-0.5! text-xs leading-4 text-[var(--ink-3)]">
          {metaForDetailRow(row).join("  ·  ")}
        </p>
      </div>
      <p className="num text-left text-sm font-semibold">
        {exactTableCurrency(row.total)}
      </p>
      <div>
        <AllocationBar
          personnel={row.personnel_services}
          mooe={row.mooe}
          capital={row.capital_outlays}
          total={row.total}
          detailed
        />
      </div>
    </div>
  );
}
