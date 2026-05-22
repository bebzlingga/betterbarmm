import { type ReactNode } from "react";
import { BudgetFooter } from "./budget-footer";
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
      <div className="mx-auto max-w-[1440px] px-4 pb-8 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        {children}
      </div>
      <BudgetFooter />
    </main>
  );
}
