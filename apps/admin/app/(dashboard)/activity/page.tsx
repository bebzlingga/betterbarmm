import type { Revision } from "@betterbarmm/db";
import Link from "next/link";
import { ConfirmButton } from "../../_components/confirm-button";
import { describeChange, when } from "../../_components/history-panel";
import { requireEditor } from "../../_lib/auth";
import { restoreRevision } from "../../_lib/history";
import { revisionHref, revisionPlace } from "../../_lib/revisions";

const PAGE = 50;

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string; action?: string; page?: string }>;
}) {
  const { supabase } = await requireEditor();
  const { entity, action, page = "1" } = await searchParams;
  const pageNumber = Math.max(1, Number(page) || 1);

  let query = supabase
    .from("revisions")
    .select("*", { count: "exact" })
    .order("changed_at", { ascending: false })
    .range((pageNumber - 1) * PAGE, pageNumber * PAGE - 1);
  if (entity === "record" || entity === "explainer") query = query.eq("entity", entity);
  if (action === "insert" || action === "update" || action === "delete") query = query.eq("action", action);
  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  const revisions = (data ?? []) as Revision[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));
  const pageHref = (n: number) =>
    `/activity?${new URLSearchParams({ ...(entity ? { entity } : {}), ...(action ? { action } : {}), page: String(n) })}`;

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Content</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Activity</h1>
        <p className="mt-1 text-sm text-[var(--ink-3)]">Every edit by every editor. Deleted items can be restored here.</p>
      </header>

      <form className="flex flex-wrap gap-3">
        <select name="entity" defaultValue={entity ?? ""} className="field w-auto">
          <option value="">Records and explainers</option>
          <option value="record">Records</option>
          <option value="explainer">Explainers</option>
        </select>
        <select name="action" defaultValue={action ?? ""} className="field w-auto">
          <option value="">Any change</option>
          <option value="insert">Created</option>
          <option value="update">Edited</option>
          <option value="delete">Deleted</option>
        </select>
        <button type="submit" className="btn btn-secondary">
          Filter
        </button>
      </form>

      <div className="panel overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>When</th>
              <th>What</th>
              <th>Change</th>
              <th>Who</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {revisions.map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap text-[var(--ink-3)]">{when(r.changed_at)}</td>
                <td>
                  {r.action === "delete" ? (
                    <span>{r.title || r.key}</span>
                  ) : (
                    <Link href={revisionHref(r)} className="hover:underline">
                      {r.title || r.key}
                    </Link>
                  )}
                  <div className="text-xs text-[var(--ink-3)]">{revisionPlace(r)}</div>
                </td>
                <td>{describeChange(r)}</td>
                <td className="text-[var(--ink-3)]">{r.changed_by_email}</td>
                <td className="text-right">
                  {r.action === "delete" ? (
                    <form action={restoreRevision.bind(null, r.id)}>
                      <ConfirmButton message="Restore this deleted item?" variant="secondary">
                        Restore
                      </ConfirmButton>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
            {revisions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-[var(--ink-3)]">
                  No edits recorded yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {pages > 1 ? (
        <nav className="flex items-center gap-3 text-sm" aria-label="Pages">
          {pageNumber > 1 ? (
            <Link href={pageHref(pageNumber - 1)} className="btn btn-secondary">
              ← Newer
            </Link>
          ) : null}
          <span className="text-[var(--ink-3)]">
            Page {pageNumber} of {pages}
          </span>
          {pageNumber < pages ? (
            <Link href={pageHref(pageNumber + 1)} className="btn btn-secondary">
              Older →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
