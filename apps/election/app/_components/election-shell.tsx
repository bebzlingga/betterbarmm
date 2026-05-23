import { ElectionFooter } from "./election-footer";
import {
  ElectionNavigation,
  type ElectionNavItem,
} from "./election-navigation";

type ElectionShellProps = {
  activeItem?: ElectionNavItem;
  children: React.ReactNode;
};

export function ElectionShell({ activeItem, children }: ElectionShellProps) {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <ElectionNavigation activeItem={activeItem} />
      {children}
      <ElectionFooter />
    </main>
  );
}
