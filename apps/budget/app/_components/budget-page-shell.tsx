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
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <BudgetNavigation
        fiscalYears={fiscalYearRange}
        compiledTotal={compiledTotal}
        activeItem={activeItem}
      />
      <div className="mx-auto max-w-[1440px] px-5 pb-8 pt-[180px]">
        {children}
      </div>
      <BudgetFooter />
    </main>
  );
}
