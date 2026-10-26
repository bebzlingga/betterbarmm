import { COLLECTIONS, WORKSPACES, findCollection, workspaceLabel, type Revision } from "@betterbarmm/db";
import {
  ArrowRightIcon,
  ArrowsClockwiseIcon,
  ArticleIcon,
  BuildingsIcon,
  CheckCircleIcon,
  CheckSquareOffsetIcon,
  ClockCounterClockwiseIcon,
  CloudArrowUpIcon,
  CoinsIcon,
  DatabaseIcon,
  MapTrifoldIcon,
  ScrollIcon,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { describeChange } from "../_components/history-panel";
import { EmptyState, PageHeader, StatCard, ago, initials } from "../_components/ui";
import { requireEditor } from "../_lib/auth";
import { revisionHref, revisionPlace } from "../_lib/revisions";

const WORKSPACE_ICONS = { legislation: ScrollIcon, budget: CoinsIcon, election: CheckSquareOffsetIcon, lgu: BuildingsIcon, travel: MapTrifoldIcon } as const;

export default async function OverviewPage() {
  const { supabase, profile } = await requireEditor();

  const count = async (query: PromiseLike<{ count: number | null }>) => (await query).count ?? 0;
  const records = () => supabase.from("records").select("*", { count: "exact", head: true });

  const [{ data: syncRows }, { data: recent }, { data: waiting }] = await Promise.all([
    supabase.from("sync_state").select("name, at"),
    supabase.from("revisions").select("*").order("changed_at", { ascending: false }).limit(8),
    supabase.from("proposals").select("kind, workspace, collection, file_path, status").in("status", ["pending", "approved"]).limit(5000),
  ]);
  const syncedAt = new Map((syncRows ?? []).map((row) => [row.name as string, row.at as string]));

  const [published, drafts, ...perCollection] = await Promise.all([
    count(supabase.from("explainers").select("*", { count: "exact", head: true }).eq("status", "published")),
    count(supabase.from("explainers").select("*", { count: "exact", head: true }).eq("status", "draft")),
    ...COLLECTIONS.flatMap((c) => {
      const name = `${c.workspace}/${c.collection}`;
      const scoped = () => records().eq("workspace", c.workspace).eq("collection", c.collection);
      const since = syncedAt.get(name);
      return [count(scoped()), since ? count(scoped().gt("updated_at", since)) : Promise.resolve(0)];
    }),
  ]);
  const stats = new Map(
    COLLECTIONS.map((c, i) => [`${c.workspace}/${c.collection}`, { total: perCollection[2 * i]!, unpublished: perCollection[2 * i + 1]! }]),
  );
  const totalRecords = [...stats.values()].reduce((sum, s) => sum + s.total, 0);
  const editsWaiting = [...stats.values()].reduce((sum, s) => sum + s.unpublished, 0);

  // What the last fetch has filed, by where it goes.
  const pending = (waiting ?? []).filter((p) => p.status === "pending");
  const approved = (waiting ?? []).filter((p) => p.status === "approved").length;
  const byGroup = new Map<string, number>();
  for (const p of pending) {
    const g = p.kind === "file" ? (p.file_path as string) : `${p.workspace}/${p.collection}`;
    byGroup.set(g, (byGroup.get(g) ?? 0) + 1);
  }
  const groupLabel = (g: string) => {
    if (!g.includes("/") || g.endsWith(".json")) return g;
    const [w, c] = g.split("/");
    return `${workspaceLabel(w!)} · ${findCollection(w!, c!)?.label ?? c}`;
  };

  const hour = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Manila" }));
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = (profile.name || profile.email.split("@")[0]!).split(/[\s.]/)[0];

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${firstName!.charAt(0).toUpperCase()}${firstName!.slice(1)}`}
        description="What the sources changed overnight, what is waiting to go live, and what editors did last."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ArrowsClockwiseIcon} tone={pending.length ? "accent" : "good"} label="Updates waiting" value={pending.length.toLocaleString()} hint={pending.length ? "Found by the last fetch" : "Sources and site agree"} href="/updates" />
        <StatCard icon={CloudArrowUpIcon} tone={approved + editsWaiting ? "warn" : "good"} label="Waiting to go live" value={(approved + editsWaiting).toLocaleString()} hint="Published when publishing is next run" href="/updates?status=approved" />
        <StatCard icon={DatabaseIcon} tone="info" label="Records" value={totalRecords.toLocaleString()} hint={`In ${COLLECTIONS.length} collections`} />
        <StatCard icon={ArticleIcon} label="Explainers" value={published.toLocaleString()} hint={`${drafts} draft${drafts === 1 ? "" : "s"}`} href="/explainers" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Needs review</h2>
            <Link href="/updates" className="btn btn-ghost btn-sm">
              All updates <ArrowRightIcon size={12} weight="bold" aria-hidden="true" />
            </Link>
          </div>
          {byGroup.size ? (
            <ul className="divide-y divide-[var(--rule)]">
              {[...byGroup].sort((a, b) => b[1] - a[1]).map(([g, n]) => (
                <li key={g} className="flex items-center justify-between gap-3 px-[1.125rem] py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{groupLabel(g)}</p>
                    <p className="text-xs text-[var(--ink-3)]">{n.toLocaleString()} change{n === 1 ? "" : "s"} found at the source</p>
                  </div>
                  <Link href="/updates" className="btn btn-secondary btn-sm">Review</Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={CheckCircleIcon} title="All caught up">
              Nothing from the sources is waiting. Run Fetch updates in GitHub Actions to check them again.
            </EmptyState>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Recent activity</h2>
            <Link href="/activity" className="btn btn-ghost btn-sm">
              All activity <ArrowRightIcon size={12} weight="bold" aria-hidden="true" />
            </Link>
          </div>
          {recent?.length ? (
            <ol className="divide-y divide-[var(--rule)]">
              {(recent as Revision[]).map((r) => (
                <li key={r.id} className="flex items-start gap-3 px-[1.125rem] py-3">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[var(--surface-3)] font-[family-name:var(--font-display)] text-[0.625rem] font-semibold text-[var(--ink-2)]">
                    {initials(r.changed_by_email || "?")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      {r.action === "delete" ? (
                        <span className="font-medium">{r.title || r.key}</span>
                      ) : (
                        <Link href={revisionHref(r)} className="font-medium hover:text-[var(--accent)]">
                          {r.title || r.key}
                        </Link>
                      )}
                    </p>
                    <p className="truncate text-xs text-[var(--ink-3)]">
                      {describeChange(r)} · {revisionPlace(r)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-[var(--ink-mute)]">{ago(r.changed_at)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState icon={ClockCounterClockwiseIcon} title="No edits yet">
              Changes made in the admin are logged here.
            </EmptyState>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="panel-title mb-4">Workspaces</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {WORKSPACES.map((w) => {
            const Glyph = WORKSPACE_ICONS[w.value as keyof typeof WORKSPACE_ICONS] ?? DatabaseIcon;
            const cols = COLLECTIONS.filter((c) => c.workspace === w.value);
            const total = cols.reduce((s, c) => s + (stats.get(`${c.workspace}/${c.collection}`)?.total ?? 0), 0);
            return (
              <div key={w.value} className="panel p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Glyph size={18} weight="fill" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-[0.9375rem] font-semibold">{w.label}</p>
                    <p className="text-xs text-[var(--ink-3)]">{total.toLocaleString()} records</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-0.5">
                  {cols.map((c) => {
                    const s = stats.get(`${c.workspace}/${c.collection}`) ?? { total: 0, unpublished: 0 };
                    return (
                      <li key={c.collection}>
                        <Link href={`/data/${c.workspace}/${c.collection}`} className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-[0.8125rem] hover:bg-[var(--surface-2)]">
                          <span className="truncate text-[var(--ink-2)]">{c.label}</span>
                          <span className="flex shrink-0 items-center gap-2">
                            {s.unpublished ? <span className="pill pill-warn">{s.unpublished} unpublished</span> : null}
                            <span className="tabular-nums text-[var(--ink-3)]">{s.total ? s.total.toLocaleString() : <span className="text-[var(--ink-mute)]">not seeded</span>}</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
