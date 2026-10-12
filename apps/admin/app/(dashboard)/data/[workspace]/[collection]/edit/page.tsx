import { findCollection, workspaceLabel, type Revision } from "@betterbarmm/db";
import { CheckCircleIcon, TrashIcon } from "@phosphor-icons/react/ssr";
import { notFound } from "next/navigation";
import { ConfirmButton } from "../../../../../_components/confirm-button";
import { HistoryPanel } from "../../../../../_components/history-panel";
import { PageHeader } from "../../../../../_components/ui";
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
    <div>
      <PageHeader
        crumbs={[{ label: "Data" }, { label: workspaceLabel(workspace) }, { label: def.label, href: base }]}
        title={<span className="block max-w-4xl">{title}</span>}
        actions={
          key ? (
            <form action={deleteRecord.bind(null, workspace, collection, key)}>
              <ConfirmButton message={`Delete "${title}"? You can restore it later from Activity.`}>
                <TrashIcon size={15} aria-hidden="true" /> Delete
              </ConfirmButton>
            </form>
          ) : null
        }
      >
        {saved ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--good-soft)] px-3 py-2 text-sm text-[var(--good)]">
            <CheckCircleIcon size={16} weight="fill" aria-hidden="true" /> Saved. It goes live at the next hourly publish.
          </p>
        ) : null}
      </PageHeader>
      <div className={key ? "grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]" : ""}>
        <RecordForm
          key={updatedAt}
          workspace={workspace}
          collection={collection}
          recordKey={key ?? null}
          initial={initial}
        />
        {key ? (
          <div className="xl:sticky xl:top-24">
            <HistoryPanel revisions={revisions} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
