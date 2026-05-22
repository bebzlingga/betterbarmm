import { BillsFooter } from "./bills-footer";
import { BillsNavigation, type BillsNavItem } from "./bills-navigation";

type BillsShellProps = {
  activeItem?: BillsNavItem;
  children: React.ReactNode;
};

export function BillsShell({ activeItem, children }: BillsShellProps) {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <BillsNavigation activeItem={activeItem} />
      {children}
      <BillsFooter />
    </main>
  );
}
