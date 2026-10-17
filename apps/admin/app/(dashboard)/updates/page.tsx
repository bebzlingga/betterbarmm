import { changedFields, findCollection, workspaceLabel, type Proposal } from "@betterbarmm/db";
import { CheckCircleIcon, CheckIcon, FileArrowDownIcon, XIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { EmptyState, PageHeader, ago } from "../../_components/ui";
import { requireEditor } from "../../_lib/auth";
import { decideGroup, decideOne } from "./actions";
import { PublishButton } from "./publish-button";

/* What the last fetch found at the sources, waiting for an editor. Nothing
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
  if (p.action === "delete") return <p className="rounded-lg bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--accent)]">The source no longer lists this record. Approving removes it from the site.</p>;
  const fields = p.action === "insert" ? Object.keys(p.after ?? {}) : changedFields(p.before, p.after);
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--rule)]">
      <table className="w-full table-fixed text-left text-[13px]">
        <thead className="bg-[var(--surface-2)]">
          <tr className="text-[10.5px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
            <th className="w-40 px-3 py-2 font-semibold">Field</th>
            {p.action === "update" ? <th className="px-3 py-2 font-semibold">Now on the site</th> : null}
            <th className="px-3 py-2 font-semibold">{p.action === "update" ? "At the source" : "Value"}</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => (
            <tr key={f} className="border-t border-[var(--rule)] align-top">
              <td className="field-mono px-3 py-2 text-[12px] text-[var(--ink-3)]">{f}</td>
              {p.action === "update" ? (
                <td className="break-words bg-[var(--accent-soft)]/40 px-3 py-2 text-[var(--ink-3)] line-through decoration-[var(--accent)]/40">{show(p.before?.[f])}</td>
              ) : null}
              <td className={`break-words px-3 py-2 ${p.action === "update" ? "bg-[var(--good-soft)]/50" : ""}`}>{show(p.after?.[f])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
  const pill = { insert: ["New", "pill-good"], update: ["Changed", "pill-info"], delete: ["Removed", "pill-accent"] } as const;

  return (
    <div>
      <PageHeader
        title="Updates"
        description="What the last fetch found at the sources — Parliament and PhilGEPS. Nothing here is on the site until it is approved; approved updates go live when publishing is next run."
        actions={<PublishButton />}
      />

      <div className="mb-5 inline-flex flex-wrap rounded-lg bg-[var(--surface-2)] p-1">
        {STATUSES.map(([s, label]) => (
          <Link
            key={s}
            href={`/updates?status=${s}`}
            aria-current={s === status ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition ${s === status ? "bg-[var(--surface)] text-[var(--ink)] shadow-[var(--shadow-sm)]" : "text-[var(--ink-3)] hover:text-[var(--ink)]"}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {!proposals.length ? (
        <div className="panel">
          <EmptyState icon={CheckCircleIcon} title={status === "pending" ? "All caught up" : "Nothing here"}>
            {status === "pending" ? "The sources and the site agree, as of the last fetch. Run Fetch updates in GitHub Actions to check again." : null}
          </EmptyState>
        </div>
      ) : null}

      <div className="space-y-6">
        {[...groups].map(([g, items]) => (
          <section key={g} className="panel overflow-hidden">
            <div className="panel-head bg-[var(--surface-2)]">
              <h2 className="panel-title">
                {groupLabel(g)} <span className="pill ml-1.5 tabular-nums">{items.length}</span>
              </h2>
              {status === "pending" && items.length > 1 ? (
                <div className="flex gap-2">
                  <form action={decideGroup.bind(null, g, "rejected")}>
                    <button type="submit" className="btn btn-secondary btn-sm">Reject all</button>
                  </form>
                  <form action={decideGroup.bind(null, g, "approved")}>
                    <button type="submit" className="btn btn-primary btn-sm">
                      <CheckIcon size={13} weight="bold" aria-hidden="true" /> Approve all {items.length}
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
            <ol className="divide-y divide-[var(--rule)]">
              {items.map((p) => (
                <li key={p.id} className="px-[1.125rem] py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        {p.kind === "record" ? (
                          <span className={`pill ${pill[p.action!][1]}`}>{pill[p.action!][0]}</span>
                        ) : (
                          <span className="pill pill-info">
                            <FileArrowDownIcon size={11} aria-hidden="true" /> Dataset
                          </span>
                        )}
                        {p.title || p.key}
                      </p>
                      <p className="mt-1 text-xs text-[var(--ink-3)]">
                        {p.kind === "record" ? `${p.summary} · ` : ""}found {ago(p.created_at)}
                        {p.decided_at ? ` · ${p.status} by ${p.decided_by_email || "an editor"} ${ago(p.decided_at)}` : ""}
                      </p>
                    </div>
                    {status === "pending" ? (
                      <div className="flex gap-2">
                        <form action={decideOne.bind(null, p.id, "rejected")}>
                          <button type="submit" className="btn btn-secondary btn-sm" aria-label="Reject">
                            <XIcon size={13} weight="bold" aria-hidden="true" /> Reject
                          </button>
                        </form>
                        <form action={decideOne.bind(null, p.id, "approved")}>
                          <button type="submit" className="btn btn-primary btn-sm" aria-label="Approve">
                            <CheckIcon size={13} weight="bold" aria-hidden="true" /> Approve
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                  <details className="group mt-3" open={p.kind === "file" || items.length <= 3}>
                    <summary className="cursor-pointer list-none text-xs font-semibold text-[var(--accent)] [&::-webkit-details-marker]:hidden">
                      <span className="group-open:hidden">Show what changed</span>
                      <span className="hidden group-open:inline">Hide what changed</span>
                    </summary>
                    <div className="mt-2.5">
                      <Diff p={p} />
                    </div>
                  </details>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
