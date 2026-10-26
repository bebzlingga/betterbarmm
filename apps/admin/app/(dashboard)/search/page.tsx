import { categoryLabel, findCollection, workspaceLabel, type Explainer } from "@betterbarmm/db";
import { ArticleIcon, DatabaseIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { EmptyState, PageHeader } from "../../_components/ui";
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

  const section = (Glyph: typeof ArticleIcon, title: string, count: string, rows: React.ReactNode[], footer?: React.ReactNode) => (
    <section className="panel overflow-hidden">
      <div className="panel-head">
        <h2 className="panel-title flex items-center gap-2">
          <Glyph size={16} className="text-[var(--ink-3)]" aria-hidden="true" /> {title}
        </h2>
        <span className="pill tabular-nums">{count}</span>
      </div>
      {rows.length ? <ul className="divide-y divide-[var(--rule)]">{rows}</ul> : <p className="px-[1.125rem] py-4 text-sm text-[var(--ink-3)]">None.</p>}
      {footer}
    </section>
  );

  return (
    <div>
      <PageHeader
        title={term ? `Results for “${q.trim()}”` : "Search"}
        description="Titles and keys in every collection, and explainer titles and summaries."
      >
        <form className="relative mt-5 max-w-xl">
          <MagnifyingGlassIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]" aria-hidden="true" />
          <input name="q" defaultValue={q} placeholder="A bill number, a name, a place…" className="field !min-h-11 !pl-10 !text-[0.9375rem]" autoFocus />
        </form>
      </PageHeader>

      {term ? (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          {section(
            ArticleIcon,
            "Explainers",
            String(explainerRows.length),
            explainerRows.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 px-[1.125rem] py-3">
                <Link href={`/explainers/${e.id}`} className="truncate text-sm font-medium hover:text-[var(--accent)]">
                  {e.title}
                </Link>
                <span className="shrink-0 text-xs text-[var(--ink-3)]">
                  {categoryLabel(e.category)} · {e.status}
                </span>
              </li>
            )),
          )}
          {section(
            DatabaseIcon,
            "Records",
            recordRows.length === LIMIT ? `${LIMIT}+` : String(recordRows.length),
            recordRows.map((r) => (
              <li key={`${r.workspace}/${r.collection}/${r.key}`} className="flex flex-wrap items-center justify-between gap-3 px-[1.125rem] py-3">
                <Link href={`/data/${r.workspace}/${r.collection}/edit?key=${encodeURIComponent(r.key)}`} className="min-w-0 truncate text-sm font-medium hover:text-[var(--accent)]">
                  {r.title || r.key}
                </Link>
                <span className="shrink-0 text-xs text-[var(--ink-3)]">
                  {workspaceLabel(r.workspace)} · {findCollection(r.workspace, r.collection)?.label ?? r.collection}
                </span>
              </li>
            )),
            recordRows.length === LIMIT ? (
              <p className="border-t border-[var(--rule)] px-[1.125rem] py-3 text-xs text-[var(--ink-3)]">
                Showing the {LIMIT} most recently updated. Narrow the search, or search inside one collection.
              </p>
            ) : null,
          )}
        </div>
      ) : (
        <div className="panel">
          <EmptyState icon={MagnifyingGlassIcon} title="Search everything">
            Type a bill or resolution number, a person, a place or a word from a title.
          </EmptyState>
        </div>
      )}
    </div>
  );
}
