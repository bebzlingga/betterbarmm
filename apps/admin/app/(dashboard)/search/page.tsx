import { categoryLabel, findCollection, workspaceLabel, type Explainer } from "@betterbarmm/db";
import Link from "next/link";
import { requireEditor } from "../../_lib/auth";

const LIMIT = 50;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { supabase } = await requireEditor();
  const { q = "" } = await searchParams;
  // Commas and parentheses would break PostgREST's or() syntax.
  const term = q.trim().replace(/[,()]/g, " ");

  const [records, explainers] = term
    ? await Promise.all([
        supabase
          .from("records")
          .select("workspace, collection, key, title")
          .or(`title.ilike.*${term}*,key.ilike.*${term}*`)
          .order("updated_at", { ascending: false })
          .limit(LIMIT),
        supabase
          .from("explainers")
          .select("id, title, slug, category, status")
          .or(`title.ilike.*${term}*,slug.ilike.*${term}*,summary.ilike.*${term}*`)
          .limit(LIMIT),
      ])
    : [{ data: [] }, { data: [] }];

  const recordRows = records.data ?? [];
  const explainerRows = (explainers.data ?? []) as Pick<Explainer, "id" | "title" | "slug" | "category" | "status">[];

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Search</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{term ? `Results for "${q.trim()}"` : "Search everything"}</h1>
        <p className="mt-1 text-sm text-[var(--ink-3)]">
          Matches titles and keys in every collection, and explainer titles and summaries.
        </p>
      </header>

      {term ? (
        <>
          <section className="panel">
            <h2 className="border-b border-[var(--rule-soft)] px-4 py-3 font-semibold">
              Explainers <span className="pill">{explainerRows.length}</span>
            </h2>
            <ul className="divide-y divide-[var(--rule-soft)] text-sm">
              {explainerRows.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <Link href={`/explainers/${e.id}`} className="hover:underline">
                    {e.title}
                  </Link>
                  <span className="text-xs text-[var(--ink-3)]">
                    {categoryLabel(e.category)} · {e.status}
                  </span>
                </li>
              ))}
              {explainerRows.length === 0 ? <li className="px-4 py-3 text-[var(--ink-3)]">None.</li> : null}
            </ul>
          </section>

          <section className="panel">
            <h2 className="border-b border-[var(--rule-soft)] px-4 py-3 font-semibold">
              Records <span className="pill">{recordRows.length === LIMIT ? `${LIMIT}+` : recordRows.length}</span>
            </h2>
            <ul className="divide-y divide-[var(--rule-soft)] text-sm">
              {recordRows.map((r) => (
                <li key={`${r.workspace}/${r.collection}/${r.key}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
                  <Link
                    href={`/data/${r.workspace}/${r.collection}/edit?key=${encodeURIComponent(r.key)}`}
                    className="hover:underline"
                  >
                    {r.title || r.key}
                  </Link>
                  <span className="text-xs text-[var(--ink-3)]">
                    {workspaceLabel(r.workspace)} / {findCollection(r.workspace, r.collection)?.label ?? r.collection}
                  </span>
                </li>
              ))}
              {recordRows.length === 0 ? <li className="px-4 py-3 text-[var(--ink-3)]">None.</li> : null}
            </ul>
            {recordRows.length === LIMIT ? (
              <p className="border-t border-[var(--rule-soft)] px-4 py-3 text-xs text-[var(--ink-3)]">
                Showing the {LIMIT} most recently updated. Narrow the search, or search inside one collection.
              </p>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}
