interface BudgetYearSelectorProps {
  years: number[];
  selectedYear: number;
}

function yearLinkClass(isActive: boolean) {
  return `grid min-h-11 place-items-center border-r border-[var(--rule)] px-3 text-xs font-semibold transition last:border-r-0 ${
    isActive
      ? "bg-[var(--ink)] text-[var(--paper)]"
      : "text-[var(--ink-3)] hover:bg-[var(--paper-2)] hover:text-[var(--ink)]"
  }`;
}

export function BudgetYearSelector({
  years,
  selectedYear,
}: BudgetYearSelectorProps) {
  const sortedYears = [...years].sort((a, b) => a - b);

  return (
    <div className="mt-5 space-y-4">
      <div className="grid gap-2 lg:grid-cols-[6.5rem_1fr] lg:items-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          Fiscal year
        </p>
        <div className="grid grid-cols-1 border border-[var(--ink)] bg-[var(--paper)] sm:grid-cols-1">
          {sortedYears.map((budgetYear) => (
            <a
              key={budgetYear}
              href={`?year=${budgetYear}`}
              aria-current={budgetYear === selectedYear ? "date" : undefined}
              className={yearLinkClass(budgetYear === selectedYear)}
            >
              {budgetYear}
            </a>
          ))}
        </div>
      </div>

      <p className="text-sm leading-6 text-[var(--ink-3)]">
        Selected year: <span className="font-semibold">FY {selectedYear}</span>.
        Totals reflect the available GAAB lines for this fiscal year.
      </p>
    </div>
  );
}
