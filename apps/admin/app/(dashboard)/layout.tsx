import { COLLECTIONS, WORKSPACES } from "@betterbarmm/db";
import Link from "next/link";
import { Sidebar, type NavGroup } from "../_components/sidebar";
import { requireEditor } from "../_lib/auth";
import { signOut } from "../login/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireEditor();

  const groups: NavGroup[] = [
    {
      label: "Content",
      items: [
        { href: "/", label: "Overview" },
        { href: "/explainers", label: "Explainers" },
        { href: "/activity", label: "Activity" },
      ],
    },
    ...WORKSPACES.map((workspace) => ({
      label: workspace.label,
      items: COLLECTIONS.filter((c) => c.workspace === workspace.value).map((c) => ({
        href: `/data/${c.workspace}/${c.collection}`,
        label: c.label,
      })),
    })),
    ...(profile.role === "admin"
      ? [{ label: "Settings", items: [{ href: "/editors", label: "Editors" }] }]
      : []),
  ];

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
      {/* On small screens the navigation folds into a disclosure above the page. */}
      <aside className="border-b border-[var(--rule-soft)] bg-[var(--paper-2)] lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/" className="font-[family-name:var(--font-display)] text-lg font-bold">
            BetterBARMM <span className="text-[var(--accent)]">Admin</span>
          </Link>
        </div>
        <details className="px-2 pb-4 lg:hidden">
          <summary className="cursor-pointer px-3 py-1 text-sm font-semibold">Menu</summary>
          <div className="pt-3">
            <Sidebar groups={groups} />
          </div>
        </details>
        <div className="hidden px-2 pb-8 lg:block">
          <Sidebar groups={groups} />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex items-center justify-end gap-4 border-b border-[var(--rule-soft)] px-5 py-3 text-sm sm:px-8">
          <form action="/search" role="search" className="mr-auto w-full max-w-sm">
            <input name="q" type="search" placeholder="Search records and explainers" aria-label="Search" className="field" />
          </form>
          <span className="hidden whitespace-nowrap text-[var(--ink-3)] sm:inline">
            {profile.name || profile.email} · <span className="pill">{profile.role}</span>
          </span>
          <form action={signOut}>
            <button type="submit" className="btn btn-secondary">
              Sign out
            </button>
          </form>
        </header>
        <main className="px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
