import { formatCurrency } from "@betterbarmm/charts";
import { type AgencyRow, percentOfTotal } from "../_lib/budget-view-model";

interface BudgetAgencyTableProps {
  agencies: AgencyRow[];
  total: number;
  title?: string;
  description?: string;
}

export function BudgetAgencyTable({
  agencies,
  total,
  title = "By Agency",
  description = "Agency rows preserve the dense ledger style: mono amounts, thin rules, hover states, and percentage bars for quick comparison.",
}: BudgetAgencyTableProps) {
  return (
    <section id="objects" className="my-10 scroll-mt-[240px]">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Hierarchy level 02</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-normal">
            {title}
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-[var(--ink-3)]">
          {description}
        </p>
      </div>
      <div className="overflow-x-auto border border-[var(--ink)] bg-[var(--paper)]">
        <table className="min-w-[880px]">
          <thead>
            <tr>
              <th className="border-b border-[var(--ink)] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">
                Object
              </th>
              <th className="border-b border-[var(--ink)] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">
                Category
              </th>
              <th className="border-b border-[var(--ink)] px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">
                Appropriation
              </th>
              <th className="border-b border-[var(--ink)] px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">
                Personnel
              </th>
              <th className="border-b border-[var(--ink)] px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">
                MOOE
              </th>
              <th className="border-b border-[var(--ink)] px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">
                Capital
              </th>
              <th className="border-b border-[var(--ink)] px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">
                Share
              </th>
            </tr>
          </thead>
          <tbody>
            {agencies.map((agency) => (
              <tr key={agency.agency_id}>
                <td className="px-3 py-3">
                  <span className="font-semibold text-[var(--ink)]">
                    {agency.agency_name}
                  </span>
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
                    {agency.agency_id}
                  </span>
                </td>
                <td className="px-3 py-3 text-[var(--ink-2)]">
                  {agency.category ?? "Uncategorized"}
                </td>
                <td className="num px-3 py-3 text-right font-semibold">
                  {formatCurrency(agency.total_appropriation)}
                </td>
                <td className="num px-3 py-3 text-right text-[var(--ink-2)]">
                  {formatCurrency(agency.personnel)}
                </td>
                <td className="num px-3 py-3 text-right text-[var(--ink-2)]">
                  {formatCurrency(agency.mooe)}
                </td>
                <td className="num px-3 py-3 text-right text-[var(--ink-2)]">
                  {formatCurrency(agency.capital)}
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="num font-semibold">
                    {percentOfTotal(agency.total_appropriation, total)}
                  </span>
                  <span className="mt-2 block h-2 bg-[var(--rule-soft)]">
                    <span
                      className="block h-full bg-[var(--accent)]"
                      style={{
                        width: percentOfTotal(agency.total_appropriation, total),
                      }}
                    />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

