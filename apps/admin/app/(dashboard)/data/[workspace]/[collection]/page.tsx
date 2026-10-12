import { findCollection, workspaceLabel } from "@betterbarmm/db";
import { DatabaseIcon, DownloadSimpleIcon, MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState, PageHeader, Pagination, ago } from "../../../../_components/ui";
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
    <div>
      <PageHeader
        crumbs={[{ label: "Data" }, { label: workspaceLabel(workspace) }]}
        title={def.label}
        description={
          <>
            {total.toLocaleString()} records{q ? ` matching “${q}”` : ""} · from{" "}
            <code className="field-mono rounded bg-[var(--surface-3)] px-1.5 py-0.5">{def.source.kind === "dir" ? `${def.source.dir}/` : def.source.file}</code>
          </>
        }
        actions={
          <>
            {/* A plain link: a download is not a page Next should prefetch. */}
            <a href={`${base}/export`} className="btn btn-secondary">
              <DownloadSimpleIcon size={15} aria-hidden="true" /> Export JSON
            </a>
            <Link href={`${base}/edit`} className="btn btn-primary">
              <PlusIcon size={15} weight="bold" aria-hidden="true" /> New record
            </Link>
          </>
        }
      />

      <div className="panel overflow-hidden">
        <form className="flex items-center gap-2 border-b border-[var(--rule)] p-3">
          <div className="relative w-full max-w-md">
            <MagnifyingGlassIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]" aria-hidden="true" />
            <input name="q" defaultValue={q} placeholder="Search title or key" className="field !pl-9" />
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
          {q ? (
            <Link href={base} className="btn btn-ghost">Clear</Link>
          ) : null}
        </form>
        {total === 0 ? (
          <EmptyState icon={DatabaseIcon} title={q ? "Nothing matches" : "No records yet"}>
            {q ? "Try another word, or part of the key." : <>Run <code className="field-mono">bun db:seed</code> to load this collection from its file.</>}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Record</th>
                  <th>Key</th>
                  <th className="text-right">Updated</th>
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map((row) => (
                  <tr key={row.key}>
                    <td className="max-w-[36rem]">
                      <Link href={`${base}/edit?key=${encodeURIComponent(row.key)}`} className="font-medium hover:text-[var(--accent)]">
                        {row.title || row.key}
                      </Link>
                    </td>
                    <td className="field-mono max-w-[16rem] truncate text-[var(--ink-3)]">{row.key}</td>
                    <td className="whitespace-nowrap text-right text-[var(--ink-3)]">{ago(row.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={pageNumber} pages={pages} href={pageHref} />
    </div>
  );
}
