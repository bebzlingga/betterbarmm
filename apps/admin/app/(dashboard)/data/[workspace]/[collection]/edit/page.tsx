import { findCollection, workspaceLabel, type Revision } from "@betterbarmm/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "../../../../../_components/confirm-button";
import { HistoryPanel } from "../../../../../_components/history-panel";
import { requireEditor } from "../../../../../_lib/auth";
import { deleteRecord } from "../../../actions";
import { RecordForm } from "../../../record-form";

/**
 * Edit a record (`?key=…`) or create one (no key). The key travels as a query
 * parameter rather than a path segment because keys contain slashes and URLs.
 */
export default async function EditRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspace: string; collection: string }>;
  searchParams: Promise<{ key?: string; saved?: string }>;
}) {
  const { supabase } = await requireEditor();
  const { workspace, collection } = await params;
  const { key, saved } = await searchParams;
  const def = findCollection(workspace, collection);
  if (!def) notFound();

  let initial: Record<string, unknown>;
  let title = "New record";
  let updatedAt = "";
  let revisions: Revision[] = [];
  if (key) {
    const { data: history } = await supabase
      .from("revisions")
      .select("*")
      .eq("entity", "record")
      .eq("workspace", workspace)
      .eq("collection", collection)
      .eq("key", key)
      .order("changed_at", { ascending: false })
      .limit(30);
    revisions = (history ?? []) as Revision[];
    const { data } = await supabase
      .from("records")
      .select("data, title, updated_at")
      .eq("workspace", workspace)
      .eq("collection", collection)
      .eq("key", key)
      .maybeSingle();
    if (!data) notFound();
    initial = data.data;
    title = data.title || key;
    updatedAt = data.updated_at;
  } else {
    // A new record starts with the same fields as the first one, emptied.
    const { data } = await supabase
      .from("records")
      .select("data")
      .eq("workspace", workspace)
      .eq("collection", collection)
      .order("position")
      .limit(1)
      .maybeSingle();
    initial = Object.fromEntries(
      Object.entries((data?.data ?? {}) as Record<string, unknown>).map(([k, v]) => [
        k,
        typeof v === "number" ? 0 : typeof v === "boolean" ? false : Array.isArray(v) ? [] : v && typeof v === "object" ? {} : "",
      ]),
    );
  }

  const base = `/data/${workspace}/${collection}`;
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href={base} className="text-sm text-[var(--ink-3)] hover:underline">
            ← {workspaceLabel(workspace)} / {def.label}
          </Link>
          <h1 className="mt-2 max-w-4xl text-2xl font-bold tracking-tight">{title}</h1>
          {saved ? <p className="mt-1 text-sm text-[var(--positive)]">Saved.</p> : null}
        </div>
        {key ? (
          <form action={deleteRecord.bind(null, workspace, collection, key)}>
            <ConfirmButton message={`Delete "${title}"? You can restore it later from Activity.`}>Delete</ConfirmButton>
          </form>
        ) : null}
      </header>
      <RecordForm
        key={updatedAt}
        workspace={workspace}
        collection={collection}
        recordKey={key ?? null}
        initial={initial}
      />
      {key ? <HistoryPanel revisions={revisions} /> : null}
    </div>
  );
}
