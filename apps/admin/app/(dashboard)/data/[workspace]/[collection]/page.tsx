import { findCollection, workspaceLabel } from "@betterbarmm/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEditor } from "../../../../_lib/auth";

const PAGE = 50;

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspace: string; collection: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { supabase } = await requireEditor();
  const { workspace, collection } = await params;
  const { q = "", page = "1" } = await searchParams;
  const def = findCollection(workspace, collection);
  if (!def) notFound();

  const pageNumber = Math.max(1, Number(page) || 1);
  let query = supabase
    .from("records")
    .select("key, title, updated_at", { count: "exact" })
    .eq("workspace", workspace)
    .eq("collection", collection)
    .order("position")
    .range((pageNumber - 1) * PAGE, pageNumber * PAGE - 1);
  if (q.trim()) {
    // Commas and parentheses would break PostgREST's or() syntax.
    const term = q.trim().replace(/[,()]/g, " ");
    query = query.or(`title.ilike.*${term}*,key.ilike.*${term}*`);
  }
  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const base = `/data/${workspace}/${collection}`;
  const pageHref = (n: number) => `${base}?${new URLSearchParams({ ...(q ? { q } : {}), page: String(n) })}`;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{workspaceLabel(workspace)}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{def.label}</h1>
          <p className="mt-1 text-sm text-[var(--ink-3)]">
            {total.toLocaleString()} records{q ? ` matching "${q}"` : ""} · from{" "}
            <code>{def.source.kind === "dir" ? `${def.source.dir}/` : def.source.file}</code>
          </p>
        </div>
        <div className="flex gap-2">
          {/* A plain link: a download is not a page Next should prefetch. */}
          <a href={`${base}/export`} className="btn btn-secondary">
            Export JSON
          </a>
          <Link href={`${base}/edit`} className="btn btn-primary">
            New record
          </Link>
        </div>
      </header>

      <form className="flex gap-3">
        <input name="q" defaultValue={q} placeholder="Search title or key" className="field max-w-md" />
        <button type="submit" className="btn btn-secondary">
          Search
        </button>
      </form>

      <div className="panel overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Record</th>
              <th>Key</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr key={row.key}>
                <td>
                  <Link href={`${base}/edit?key=${encodeURIComponent(row.key)}`} className="hover:underline">
                    {row.title || row.key}
                  </Link>
                </td>
                <td className="field-mono break-all text-[var(--ink-3)]">{row.key}</td>
                <td className="whitespace-nowrap text-[var(--ink-3)]">{new Date(row.updated_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {total === 0 ? (
              <tr>
                <td colSpan={3} className="py-10 text-center text-[var(--ink-3)]">
                  {q ? "Nothing matches." : "Empty. Run bun db:seed to load this collection from its file."}
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
              ← Previous
            </Link>
          ) : null}
          <span className="text-[var(--ink-3)]">
            Page {pageNumber} of {pages}
          </span>
          {pageNumber < pages ? (
            <Link href={pageHref(pageNumber + 1)} className="btn btn-secondary">
              Next →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
