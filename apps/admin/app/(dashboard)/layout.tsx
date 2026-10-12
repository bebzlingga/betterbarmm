import { COLLECTIONS, WORKSPACES } from "@betterbarmm/db";
import { ArrowSquareOutIcon, ListIcon, MagnifyingGlassIcon, SignOutIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { Sidebar, type NavWorkspace } from "../_components/sidebar";
import { initials } from "../_components/ui";
import { requireEditor } from "../_lib/auth";
import { signOut } from "../login/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile } = await requireEditor();
  // What the nightly fetch found and nobody has looked at yet.
  const [{ count: pending }, { count: reviewPosts }, { count: newReports }] = await Promise.all([
    supabase.from("proposals").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("social_posts").select("id", { count: "exact", head: true }).eq("status", "in_review"),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  const workspaces: NavWorkspace[] = WORKSPACES.map((w) => ({
    value: w.value,
    label: w.label,
    collections: COLLECTIONS.filter((c) => c.workspace === w.value).map((c) => ({ href: `/data/${c.workspace}/${c.collection}`, label: c.label })),
  }));

  const account = (
    <div className="flex items-center gap-2.5 rounded-lg px-1.5 py-1">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--accent)] font-[family-name:var(--font-display)] text-[11px] font-semibold text-[var(--accent-ink)]">
        {initials(profile.name || profile.email)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{profile.name || profile.email}</p>
        <p className="text-[11px] capitalize text-[var(--ink-3)]">{profile.role}</p>
      </div>
      <form action={signOut}>
        <button type="submit" className="btn btn-ghost btn-sm !px-2" aria-label="Sign out" title="Sign out">
          <SignOutIcon size={16} aria-hidden="true" />
        </button>
      </form>
    </div>
  );

  const brand = (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-[var(--accent)] font-[family-name:var(--font-display)] text-[15px] font-bold text-[var(--accent-ink)]">B</span>
      <span className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-[-0.01em]">
        BetterBARMM <span className="font-normal text-[var(--ink-3)]">Admin</span>
      </span>
    </Link>
  );

  const nav = <Sidebar pending={pending ?? 0} reviewPosts={reviewPosts ?? 0} newReports={newReports ?? 0} workspaces={workspaces} isAdmin={profile.role === "admin"} footer={account} />;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-[var(--rule)] bg-[var(--surface-2)] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="px-5 pb-5 pt-5">{brand}</div>
        <div className="min-h-0 flex-1">{nav}</div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--rule)] bg-[color-mix(in_srgb,var(--canvas)_85%,transparent)] px-4 py-3 backdrop-blur sm:px-8">
          {/* On a phone the navigation folds into a sheet under the bar. */}
          <details className="group lg:hidden">
            <summary className="btn btn-ghost btn-sm list-none !px-2 [&::-webkit-details-marker]:hidden" aria-label="Menu">
              <ListIcon size={18} aria-hidden="true" />
            </summary>
            <div className="fixed inset-x-0 top-[3.6rem] bottom-0 z-30 flex flex-col overflow-hidden border-t border-[var(--rule)] bg-[var(--surface-2)] pt-4">{nav}</div>
          </details>
          <div className="lg:hidden">{brand}</div>

          <form action="/search" role="search" className="relative ml-auto w-full max-w-md lg:ml-0">
            <MagnifyingGlassIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]" aria-hidden="true" />
            <input name="q" type="search" placeholder="Search records and explainers" aria-label="Search" className="field !pl-9" />
          </form>

          <a href="https://betterbarmm.com" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm ml-auto hidden sm:inline-flex">
            View site <ArrowSquareOutIcon size={14} aria-hidden="true" />
          </a>
        </header>
        <main className="mx-auto max-w-[80rem] px-4 py-8 sm:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
