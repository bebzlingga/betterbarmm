import { formatCurrency } from "@betterbarmm/charts";
import { type SectionCategoryRow } from "../_lib/budget-view-model";

type ChartRow = SectionCategoryRow & {
  isRemainder?: boolean;
};

interface BudgetSectionCategoryChartProps {
  rows: SectionCategoryRow[];
  total: number;
  label: string;
  title?: string;
  description?: string;
  limit?: number;
}

const expenseSegments = [
  {
    key: "personnel",
    label: "PS",
    className: "bg-[var(--positive)]",
  },
  {
    key: "mooe",
    label: "MOOE",
    className: "bg-[var(--ochre)]",
  },
  {
    key: "capital",
    label: "CO",
    className: "bg-[var(--slate)]",
  },
] satisfies {
  key: "personnel" | "mooe" | "capital";
  label: string;
  className: string;
}[];

export function BudgetSectionCategoryChart({
  rows,
  total,
  label,
  title = "Section Category Totals",
  description = "Primary section-category totals from the BARMM budget dataset.",
  limit,
}: BudgetSectionCategoryChartProps) {
  const visibleRows = limit ? rows.slice(0, limit) : rows;
  const hiddenRows = limit ? rows.slice(limit) : [];
  const hiddenTotal = hiddenRows.reduce((sum, row) => sum + row.total, 0);
  const chartRows: ChartRow[] =
    hiddenTotal > 0
      ? [
          ...visibleRows,
          {
            category: "Other section categories",
            description: `${hiddenRows.length} smaller section categories`,
            total: hiddenTotal,
            personnel: hiddenRows.reduce((sum, row) => sum + row.personnel, 0),
            mooe: hiddenRows.reduce((sum, row) => sum + row.mooe, 0),
            capital: hiddenRows.reduce((sum, row) => sum + row.capital, 0),
            entities: hiddenRows.reduce((sum, row) => sum + row.entities, 0),
            basis: rows[0]?.basis,
            isRemainder: true,
          },
        ]
      : visibleRows;
  const maxTotal = Math.max(...chartRows.map((row) => row.total), 0);
  const leadingRows = rows.slice(0, 3);

  return (
    <section className="my-10 border border-[var(--ink)] bg-[var(--paper)] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Section categories</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-normal">
            {title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--ink-3)]">
            {description}
          </p>
        </div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]">
          {label} / {formatCurrency(total)}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
        {expenseSegments.map((segment) => (
          <span
            key={segment.key}
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]"
          >
            <span className={`size-2.5 ${segment.className}`} />
            {segment.label}
          </span>
        ))}
      </div>

      {chartRows.length > 0 ? (
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
          <div className="space-y-5">
            {chartRows.map((row, index) => (
              <div key={row.category}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="max-w-3xl text-sm font-semibold text-[var(--ink)]">
                    {row.category}
                  </p>
                  <p className="num text-sm font-semibold text-[var(--ink-2)]">
                    {formatCurrency(row.total)} / {formatShare(row.total, total)}
                  </p>
                </div>
                <div className="mt-2 grid grid-cols-[3rem_1fr] items-center gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
                    {row.isRemainder ? "+" : `#${index + 1}`}
                  </p>
                  <div className="h-7 border border-[var(--rule)] bg-[var(--rule-soft)]">
                    <div
                      className="flex h-full overflow-hidden"
                      style={{ width: barWidth(row.total, maxTotal) }}
                      aria-label={`${row.category}: ${formatCurrency(row.total)}`}
                    >
                      {expenseSegments.map((segment) => {
                        const value = row[segment.key];

                        return (
                          <span
                            key={segment.key}
                            className={`h-full ${segment.className}`}
                            style={{ width: segmentWidth(value, row.total) }}
                            title={`${segment.label}: ${formatCurrency(value)}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--ink-3)]">
                  {row.entities} reporting {row.entities === 1 ? "unit" : "units"}
                  {row.description ? ` / ${row.description}` : ""}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--rule)] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <p className="eyebrow">Largest shares</p>
            <div className="mt-5 space-y-5">
              {leadingRows.map((row, index) => (
                <div key={row.category} className="border-t border-[var(--rule)] pt-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
                      #{index + 1}
                    </p>
                    <p className="num text-sm font-semibold">
                      {formatShare(row.total, total)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
                    {row.category}
                  </p>
                  <p className="num mt-2 text-xl font-semibold">
                    {formatCurrency(row.total)}
                  </p>
                </div>
              ))}
            </div>
            {rows[0]?.basis ? (
              <p className="mt-6 border-t border-[var(--rule)] pt-4 text-[10px] uppercase tracking-[0.1em] text-[var(--ink-3)]">
                Basis: {rows[0].basis.replaceAll("_", " ")}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-6 border border-[var(--rule)] bg-[var(--paper-2)] p-4">
          <p className="text-sm leading-6 text-[var(--ink-3)]">
            Section-category totals are not available for this fiscal year.
          </p>
        </div>
      )}
    </section>
  );
}

function barWidth(value: number, max: number) {
  if (max <= 0 || value <= 0) return "0%";

  return `${Math.min(100, Math.max(1.5, (value / max) * 100)).toFixed(2)}%`;
}

function segmentWidth(value: number, total: number) {
  if (total <= 0 || value <= 0) return "0%";

  return `${Math.min(100, Math.max(0, (value / total) * 100)).toFixed(2)}%`;
}

function formatShare(value: number, total: number) {
  if (total <= 0 || value <= 0) return "0.0%";

  return `${((value / total) * 100).toFixed(1)}%`;
}
