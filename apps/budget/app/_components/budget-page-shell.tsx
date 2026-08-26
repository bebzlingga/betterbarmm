import { type ReactNode } from "react";
import { CtaPanel, SiteFooter } from "@betterbarmm/editorial";
import { BudgetNavigation } from "./budget-navigation";
import {
  compactCurrency,
  fiscalYearRange,
  getFullBudgetSelection,
} from "../_lib/budget-view-model";

interface BudgetPageShellProps {
  activeItem: string;
  children: ReactNode;
}

/**
 * Every page in the workspace closes the same way: the one ask on the crimson
 * band, then the estate footer on the dark ground. Both come from
 * `@betterbarmm/editorial`, so this workspace ends exactly as the landing site
 * and the registry do — which is the point of them being shared rather than
 * written out per app.
 */
export function BudgetPageShell({
  activeItem,
  children,
}: BudgetPageShellProps) {
  const compiledTotal = compactCurrency(
    getFullBudgetSelection().budget.total_appropriation,
  );

  return (
    <main className="min-h-screen overflow-x-clip bg-[var(--paper)] text-[var(--ink)]">
      <BudgetNavigation
        fiscalYears={fiscalYearRange}
        compiledTotal={compiledTotal}
        activeItem={activeItem}
      />
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-0 sm:px-8">
        {children}
      </div>

      {/* The project's ask, not this workspace's. Same panel, same words, at
          the foot of every page of every app — one project, said once. */}
      <CtaPanel />

      <SiteFooter
        base="https://betterbarmm.com"
        columns={[
          {
            title: "This workspace",
            links: [
              { href: "https://budget.betterbarmm.com/by-year", label: "By year" },
              { href: "https://budget.betterbarmm.com/offices", label: "Offices" },
              { href: "https://budget.betterbarmm.com/programs", label: "Programmes" },
              { href: "https://budget.betterbarmm.com/data", label: "Data & sources" },
              { href: "https://budget.betterbarmm.com/methodology", label: "Methodology" },
            ],
          },
          {
            title: "Workspaces",
            links: [
              { href: "https://election.betterbarmm.com", label: "Election" },
              { href: "https://legislation.betterbarmm.com", label: "Legislation" },
              { href: "https://betterbarmm.com/discover", label: "Discover BARMM" },
            ],
          },
          {
            title: "Project",
            links: [
              { href: "/about", label: "About" },
              { href: "/contribute", label: "Contribute" },
              { href: "mailto:support@betterbarmm.com", label: "Email us" },
            ],
          },
        ]}
        blurb="Appropriations turned into something you can browse: fiscal years, offices, programmes, expense classes, and the source files behind each line. Every figure traces back to the General Appropriations Act it came from."
        note="Bangsamoro General Appropriations, FY 2020–2026"
        bottomRight="Compiled from the Bangsamoro GAA"
      />
    </main>
  );
}
