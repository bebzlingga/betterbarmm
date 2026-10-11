import { EXPLAINER_CATEGORIES, categoryLabel, type Explainer } from "@betterbarmm/db";
import Link from "next/link";
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

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Content</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Explainers</h1>
        </div>
        <Link href="/explainers/new" className="btn btn-primary">
          New explainer
        </Link>
      </header>

      <form className="flex flex-wrap gap-3">
        <select name="status" defaultValue={status ?? ""} className="field w-auto">
          <option value="">Any status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select name="category" defaultValue={category ?? ""} className="field w-auto">
          <option value="">Any category</option>
          {EXPLAINER_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input name="tag" defaultValue={tag} placeholder="Tag" className="field w-40" />
        <button type="submit" className="btn btn-secondary">
          Filter
        </button>
      </form>

      <div className="panel overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Tags</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {explainers.map((e) => (
              <tr key={e.id}>
                <td>
                  <Link href={`/explainers/${e.id}`} className="font-semibold hover:underline">
                    {e.title}
                  </Link>
                  <div className="text-xs text-[var(--ink-3)]">/{e.slug}</div>
                </td>
                <td>{categoryLabel(e.category)}</td>
                <td className="space-x-1">
                  {e.tags.map((t) => (
                    <Link key={t} href={`/explainers?tag=${encodeURIComponent(t)}`} className="pill">
                      {t}
                    </Link>
                  ))}
                </td>
                <td>
                  <span className={`pill ${e.status === "published" ? "pill-live" : ""}`}>{e.status}</span>
                </td>
                <td className="whitespace-nowrap text-[var(--ink-3)]">{new Date(e.updated_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {explainers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-[var(--ink-3)]">
                  No explainers{status || category || tag ? " match these filters" : " yet"}.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
