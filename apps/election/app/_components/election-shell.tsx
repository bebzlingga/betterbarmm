import { CtaPanel, SiteFooter } from "@betterbarmm/editorial";
import {
  ElectionNavigation,
  type ElectionNavItem,
} from "./election-navigation";

type ElectionShellProps = {
  activeItem?: ElectionNavItem;
  children: React.ReactNode;
};

/**
 * Every page in the workspace closes the same way: the one ask on the crimson
 * band, then the estate footer on the dark ground. Both come from
 * `@betterbarmm/editorial`, so this workspace ends exactly as the landing site
 * and the registry do — which is the point of them being shared rather than
 * written out per app.
 */
export function ElectionShell({ activeItem, children }: ElectionShellProps) {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <ElectionNavigation activeItem={activeItem} />
      {children}

      {/* The project's ask, not this workspace's. Same panel, same words, at
          the foot of every page of every app — one project, said once. */}
      <CtaPanel />

      <SiteFooter
        base="https://betterbarmm.com"
        columns={[
          {
            title: "This workspace",
            links: [
              { href: "https://election.betterbarmm.com/", label: "Overview" },
              { href: "https://election.betterbarmm.com/ballot", label: "Your ballot" },
              { href: "https://election.betterbarmm.com/about", label: "About" },
            ],
          },
          {
            title: "Workspaces",
            links: [
              { href: "https://legislation.betterbarmm.com", label: "Legislation" },
              { href: "https://budget.betterbarmm.com", label: "Budget" },
              { href: 'https://lgu.betterbarmm.com', label: 'Local government' },
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
        blurb="Public elections deserve public records. This gathers the 2026 BARMM Parliamentary Elections — regional parties, district COC filers, sectoral candidates, the timeline, and the sources behind each entry — into one place you can read, question, and trace back to where it came from."
        note="The 2026 Bangsamoro Parliamentary Elections"
        bottomRight="Dataset: datasets/election/election.min.json"
      />
    </main>
  );
}
