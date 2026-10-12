import { changedFields, findCollection, workspaceLabel, type Proposal } from "@betterbarmm/db";
import Link from "next/link";
import { when } from "../../_components/history-panel";
import { requireEditor } from "../../_lib/auth";
import { decideGroup, decideOne } from "./actions";
import { PublishButton } from "./publish-button";

/* What the nightly fetch found at the sources, waiting for an editor. Nothing
   here is on the site until it is approved and published. */

const STATUSES = [
  ["pending", "Waiting"],
  ["approved", "Approved, not yet live"],
  ["published", "Published"],
  ["rejected", "Rejected"],
] as const;

const show = (value: unknown) => {
  if (value == null || value === "") return "—";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 280 ? `${text.slice(0, 280)}…` : text;
};

function Diff({ p }: { p: Proposal }) {
  if (p.kind === "file") return <p className="text-sm text-[var(--ink-2)]">{p.summary}</p>;
  if (p.action === "delete") return <p className="text-sm text-[var(--ink-3)]">The source no longer lists this record. Approving removes it from the site.</p>;
  const fields = p.action === "insert" ? Object.keys(p.after ?? {}) : changedFields(p.before, p.after);
  return (
    <table className="w-full table-fixed text-left text-[13px]">
      <thead>
        <tr className="text-[11px] uppercase tracking-wide text-[var(--ink-mute)]">
          <th className="w-40 py-1 pr-3 font-semibold">Field</th>
          {p.action === "update" ? <th className="py-1 pr-3 font-semibold">Now on the site</th> : null}
          <th className="py-1 font-semibold">{p.action === "update" ? "At the source" : "Value"}</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((f) => (
          <tr key={f} className="border-t border-[var(--rule-soft)] align-top">
            <td className="py-1.5 pr-3 font-mono text-[12px] text-[var(--ink-3)]">{f}</td>
            {p.action === "update" ? <td className="py-1.5 pr-3 break-words text-[var(--ink-3)] line-through decoration-[var(--rule)]">{show(p.before?.[f])}</td> : null}
            <td className="py-1.5 break-words">{show(p.after?.[f])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function UpdatesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { supabase } = await requireEditor();
  const { status: wanted } = await searchParams;
  const status = STATUSES.some(([s]) => s === wanted) ? wanted! : "pending";

  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  const proposals = (data ?? []) as Proposal[];

  // One group per collection, files on their own.
  const groups = new Map<string, Proposal[]>();
  for (const p of proposals) {
    const g = p.kind === "file" ? "files" : `${p.workspace}/${p.collection}`;
    groups.set(g, [...(groups.get(g) ?? []), p]);
  }
  const groupLabel = (g: string) => {
    if (g === "files") return "Whole datasets";
    const [w, c] = g.split("/");
    return `${workspaceLabel(w!)} · ${findCollection(w!, c!)?.label ?? c}`;
  };
  const pill = { insert: "New", update: "Changed", delete: "Removed" } as const;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Content</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Updates</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--ink-3)]">
            What the nightly fetch found at the sources — Parliament, PhilGEPS. Nothing here is on the site until it is
            approved. Approved updates go live at the next publish, within the hour.
          </p>
        </div>
        <PublishButton />
      </header>

      <nav className="flex flex-wrap gap-2 text-sm">
        {STATUSES.map(([s, label]) => (
          <Link
            key={s}
            href={`/updates?status=${s}`}
            aria-current={s === status ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 ${s === status ? "bg-[var(--ink)] font-semibold text-[var(--paper)]" : "bg-[var(--paper-2)] text-[var(--ink-2)]"}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {!proposals.length ? (
        <p className="panel px-4 py-8 text-sm text-[var(--ink-3)]">
          {status === "pending" ? "Nothing waiting. The sources and the site agree." : "Nothing here."}
        </p>
      ) : null}

      {[...groups].map(([g, items]) => (
        <section key={g} className="panel">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule-soft)] px-4 py-3">
            <h2 className="font-semibold">
              {groupLabel(g)} <span className="font-normal text-[var(--ink-3)]">· {items.length}</span>
            </h2>
            {status === "pending" && items.length > 1 ? (
              <div className="flex gap-2">
                <form action={decideGroup.bind(null, g, "approved")}>
                  <button type="submit" className="btn btn-primary">Approve all {items.length}</button>
                </form>
                <form action={decideGroup.bind(null, g, "rejected")}>
                  <button type="submit" className="btn btn-secondary">Reject all</button>
                </form>
              </div>
            ) : null}
          </div>
          <ol className="divide-y divide-[var(--rule-soft)]">
            {items.map((p) => (
              <li key={p.id} className="px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {p.kind === "record" ? <span className="pill mr-2">{pill[p.action!]}</span> : null}
                      {p.title || p.key}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--ink-3)]">
                      {p.kind === "record" ? `${p.summary} · ` : ""}found {when(p.created_at)}
                      {p.decided_at ? ` · ${p.status} by ${p.decided_by_email || "an editor"} ${when(p.decided_at)}` : ""}
                    </p>
                  </div>
                  {status === "pending" ? (
                    <div className="flex gap-2">
                      <form action={decideOne.bind(null, p.id, "approved")}>
                        <button type="submit" className="btn btn-primary">Approve</button>
                      </form>
                      <form action={decideOne.bind(null, p.id, "rejected")}>
                        <button type="submit" className="btn btn-secondary">Reject</button>
                      </form>
                    </div>
                  ) : null}
                </div>
                <details className="mt-2" open={p.kind === "file" || items.length <= 3}>
                  <summary className="cursor-pointer text-xs font-semibold text-[var(--ink-2)]">What changed</summary>
                  <div className="mt-2">
                    <Diff p={p} />
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
