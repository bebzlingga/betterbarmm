"use server";

import type { Revision } from "@betterbarmm/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "./auth";

/** The row a revision leaves behind — or, for a deletion, the row it removed. */
// Not exported: every export of a "use server" file is callable from the browser.
function snapshotOf(revision: Revision): Record<string, unknown> {
  return (revision.action === "delete" ? revision.before : revision.after) ?? {};
}

/**
 * Put a record or explainer back to how it was at a revision. Works for a
 * deleted one too: the upsert re-creates it. The restore is itself an edit,
 * so it lands in the history like any other.
 */
export async function restoreRevision(revisionId: number) {
  const { supabase, user } = await requireEditor();
  const { data } = await supabase.from("revisions").select("*").eq("id", revisionId).single();
  if (!data) throw new Error("That revision no longer exists.");
  const revision = data as Revision;
  const row = snapshotOf(revision);

  if (revision.entity === "record") {
    const { error } = await supabase.from("records").upsert({
      workspace: row.workspace,
      collection: row.collection,
      key: row.key,
      title: row.title,
      data: row.data,
      position: row.position,
      updated_by: user.id,
    });
    if (error) throw new Error(error.message);
    const base = `/data/${row.workspace}/${row.collection}`;
    revalidatePath(base);
    redirect(`${base}/edit?key=${encodeURIComponent(String(row.key))}&saved=1`);
  }

  const { error } = await supabase.from("explainers").upsert({
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    category: row.category,
    tags: row.tags,
    status: row.status,
    published_at: row.published_at,
    updated_by: user.id,
  });
  if (error) {
    throw new Error(
      error.code === "23505" ? `Another explainer now uses the slug "${row.slug}"; change it there first.` : error.message,
    );
  }
  revalidatePath("/explainers");
  redirect(`/explainers/${row.id}?saved=1`);
}
