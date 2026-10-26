import { EXPLAINER_CATEGORIES, categoryLabel, type Explainer } from "@betterbarmm/db";
import { ArticleIcon, PlusIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { EmptyState, PageHeader, ago } from "../../_components/ui";
import { requireEditor } from "../../_lib/auth";

export default async function ExplainersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; tag?: string }>;
}) {
  const { supabase } = await requireEditor();
  const { status, category, tag } = await searchParams;

  let query = supabase.from("explainers").select("*").order("updated_at", { ascending: false });
  if (status === "draft" || status === "published") query = query.eq("status", status);
  if (category) query = query.eq("category", category);
  if (tag) query = query.contains("tags", [tag]);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const explainers = (data ?? []) as Explainer[];

  const tab = (value: string | undefined, label: string) => {
    const params = new URLSearchParams(Object.entries({ status: value, category, tag }).filter((e): e is [string, string] => Boolean(e[1])));
    const on = (status ?? undefined) === value;
    return (
      <Link
        key={label}
        href={params.size ? `/explainers?${params}` : "/explainers"}
        aria-current={on ? "page" : undefined}
        className={`rounded-md px-3 py-1.5 text-[0.8125rem] font-medium transition ${on ? "bg-[var(--surface)] text-[var(--ink)] shadow-[var(--shadow-sm)]" : "text-[var(--ink-3)] hover:text-[var(--ink)]"}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div>
      <PageHeader
        title="Explainers"
        description="Short articles on www, written in the admin. Published ones appear on the site within a minute."
        actions={
          <Link href="/explainers/new" className="btn btn-primary">
            <PlusIcon size={15} weight="bold" aria-hidden="true" /> New explainer
          </Link>
        }
      />

      <div className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule)] p-3">
          <div className="inline-flex rounded-lg bg-[var(--surface-2)] p-1">
            {tab(undefined, "All")}
            {tab("published", "Published")}
            {tab("draft", "Drafts")}
          </div>
          <form className="flex flex-wrap gap-2">
            {status ? <input type="hidden" name="status" value={status} /> : null}
            <select name="category" defaultValue={category ?? ""} className="field !w-auto">
              <option value="">Any category</option>
              {EXPLAINER_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <input name="tag" defaultValue={tag} placeholder="Tag" className="field !w-36" />
            <button type="submit" className="btn btn-secondary">Filter</button>
          </form>
        </div>

        {explainers.length ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Tags</th>
                  <th>Status</th>
                  <th className="text-right">Updated</th>
                </tr>
              </thead>
              <tbody>
                {explainers.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <Link href={`/explainers/${e.id}`} className="font-medium hover:text-[var(--accent)]">
                        {e.title}
                      </Link>
                      <div className="field-mono mt-0.5 text-[0.71875rem] text-[var(--ink-mute)]">/explainers/{e.slug}</div>
                    </td>
                    <td className="text-[var(--ink-2)]">{categoryLabel(e.category)}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {e.tags.map((t) => (
                          <Link key={t} href={`/explainers?tag=${encodeURIComponent(t)}`} className="pill hover:text-[var(--ink)]">
                            #{t}
                          </Link>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`pill ${e.status === "published" ? "pill-good" : "pill-warn"}`}>
                        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                        {e.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-right text-[var(--ink-3)]">{ago(e.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={ArticleIcon} title={status || category || tag ? "No explainers match" : "No explainers yet"}>
            {status || category || tag ? "Clear a filter to see more." : "Write the first one: it appears on betterbarmm.com/explainers once published."}
          </EmptyState>
        )}
      </div>
    </div>
  );
}
