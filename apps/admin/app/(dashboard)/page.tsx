import { COLLECTIONS, WORKSPACES, type Revision } from "@betterbarmm/db";
import Link from "next/link";
import { describeChange, when } from "../_components/history-panel";
import { requireEditor } from "../_lib/auth";
import { revisionHref, revisionPlace } from "../_lib/revisions";

export default async function OverviewPage() {
  const { supabase } = await requireEditor();

  const count = async (query: PromiseLike<{ count: number | null }>) => (await query).count ?? 0;
  const records = () => supabase.from("records").select("*", { count: "exact", head: true });

  const [{ data: syncRows }, { data: recent }] = await Promise.all([
    supabase.from("sync_state").select("name, at"),
    supabase.from("revisions").select("*").order("changed_at", { ascending: false }).limit(10),
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
    COLLECTIONS.map((c, i) => [`${c.workspace}/${c.collection}`, { total: perCollection[2 * i], unpulled: perCollection[2 * i + 1] }]),
  );
  const totalRecords = [...stats.values()].reduce((sum, s) => sum + s.total, 0);
  const totalUnpulled = [...stats.values()].reduce((sum, s) => sum + s.unpulled, 0);

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow">Overview</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Content and data</h1>
      </header>

      {totalUnpulled > 0 ? (
        <div className="panel border-[var(--ochre)] bg-[#fbf5e6] p-4 text-sm">
          <strong>{totalUnpulled.toLocaleString()} record{totalUnpulled === 1 ? "" : "s"} edited since the last pull.</strong>{" "}
          The workspace sites still show the old version. Run <code>bun db:pull</code>, then commit and deploy.
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Published explainers" value={published} href="/explainers?status=published" />
        <Stat label="Draft explainers" value={drafts} href="/explainers?status=draft" />
        <Stat label="Records" value={totalRecords} />
      </section>

      <section className="panel">
        <div className="flex items-center justify-between border-b border-[var(--rule-soft)] px-4 py-3">
          <h2 className="font-semibold">Recent changes</h2>
          <Link href="/activity" className="text-sm text-[var(--accent)] hover:underline">
            All activity →
          </Link>
        </div>
        <ul className="divide-y divide-[var(--rule-soft)] text-sm">
          {((recent ?? []) as Revision[]).map((r) => (
            <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5">
              <span>
                {r.action === "delete" ? (
                  r.title || r.key
                ) : (
                  <Link href={revisionHref(r)} className="hover:underline">
                    {r.title || r.key}
                  </Link>
                )}
                <span className="text-[var(--ink-3)]"> · {describeChange(r)}</span>
              </span>
              <span className="text-xs text-[var(--ink-3)]">
                {revisionPlace(r)} · {r.changed_by_email} · {when(r.changed_at)}
              </span>
            </li>
          ))}
          {!recent?.length ? <li className="px-4 py-4 text-[var(--ink-3)]">No edits yet.</li> : null}
        </ul>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {WORKSPACES.map((workspace) => (
          <div key={workspace.value} className="panel">
            <h2 className="border-b border-[var(--rule-soft)] px-4 py-3 font-semibold">{workspace.label}</h2>
            <table className="table">
              <tbody>
                {COLLECTIONS.filter((c) => c.workspace === workspace.value).map((c) => {
                  const s = stats.get(`${c.workspace}/${c.collection}`) ?? { total: 0, unpulled: 0 };
                  return (
                    <tr key={c.collection}>
                      <td>
                        <Link href={`/data/${c.workspace}/${c.collection}`} className="hover:underline">
                          {c.label}
                        </Link>
                      </td>
                      <td className="text-right">
                        {s.unpulled ? (
                          <span className="pill mr-2 bg-[#fbf5e6] text-[var(--ochre)]">{s.unpulled} unpulled</span>
                        ) : null}
                        <span className="tabular-nums text-[var(--ink-3)]">{s.total.toLocaleString()}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      <p className="text-sm text-[var(--ink-3)]">
        A collection showing 0 has not been seeded yet: run <code>bun db:seed</code> from the repo root.
      </p>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href?: string }) {
  const body = (
    <>
      <p className="text-sm text-[var(--ink-3)]">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value.toLocaleString()}</p>
    </>
  );
  return href ? (
    <Link href={href} className="panel block p-5 hover:border-[var(--rule)]">
      {body}
    </Link>
  ) : (
    <div className="panel p-5">{body}</div>
  );
}
