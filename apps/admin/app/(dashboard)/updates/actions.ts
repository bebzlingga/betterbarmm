"use server";

import { findCollection, type Proposal } from "@betterbarmm/db";
import { revalidatePath } from "next/cache";
import { requireEditor } from "../../_lib/auth";

/**
 * Approve or reject proposals. Approving a record proposal writes it into
 * `records` as the signed-in editor, so the change is logged in their name
 * like any other edit; the publish job then writes it to the site. A file
 * proposal is only marked: the publish job fetches the file itself.
 */
export async function decide(ids: number[], decision: "approved" | "rejected") {
  const { supabase, user, profile } = await requireEditor();
  if (!ids.length) return;

  const { data, error } = await supabase.from("proposals").select("*").in("id", ids).eq("status", "pending");
  if (error) throw new Error(error.message);
  const proposals = (data ?? []) as Proposal[];

  const done: number[] = [];
  for (const p of proposals) {
    if (decision === "approved" && p.kind === "record") {
      const def = findCollection(p.workspace!, p.collection!);
      if (!def) continue;
      const where = { workspace: p.workspace!, collection: p.collection!, key: p.key! };
      const result =
        p.action === "delete"
          ? await supabase.from("records").delete().match(where)
          : p.action === "insert"
            ? await supabase
                .from("records")
                .upsert({ ...where, data: p.after, title: def.title(p.after!), position: p.position ?? 0, updated_by: user.id })
            : await supabase
                .from("records")
                .update({ data: p.after, title: def.title(p.after!), updated_by: user.id })
                .match(where);
      if (result.error) throw new Error(`${p.title}: ${result.error.message}`);
    }
    done.push(p.id);
  }

  if (done.length) {
    const { error: markError } = await supabase
      .from("proposals")
      .update({ status: decision, decided_at: new Date().toISOString(), decided_by: user.id, decided_by_email: profile.email })
      .in("id", done);
    if (markError) throw new Error(markError.message);
  }
  revalidatePath("/updates");
  revalidatePath("/", "layout");
}

export async function decideOne(id: number, decision: "approved" | "rejected") {
  await decide([id], decision);
}

/** Every pending proposal of one collection (or every file proposal, for `files`). */
export async function decideGroup(group: string, decision: "approved" | "rejected") {
  const { supabase } = await requireEditor();
  let query = supabase.from("proposals").select("id").eq("status", "pending");
  if (group === "files") query = query.eq("kind", "file");
  else {
    const [workspace, collection] = group.split("/");
    query = query.eq("kind", "record").eq("workspace", workspace).eq("collection", collection);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  await decide((data ?? []).map((p) => p.id as number), decision);
}

export type PublishState = { message: string | null; ok: boolean };

/**
 * Start the publish job now rather than waiting for its hourly run. Needs a
 * GitHub token with Actions write on the repository (GITHUB_TOKEN and
 * GITHUB_REPOSITORY, e.g. "bebzlingga/betterbarmm", on the admin's Vercel
 * project). Without them the hourly run still publishes.
 */
export async function publishNow(): Promise<PublishState> {
  await requireEditor();
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo) return { ok: false, message: "Publishing on demand is not set up; approved updates go live within the hour." };
  const res = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/publish-updates.yml/dispatches`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    body: JSON.stringify({ ref: "main" }),
  });
  if (!res.ok) return { ok: false, message: `GitHub refused (${res.status}). Approved updates still go live within the hour.` };
  return { ok: true, message: "Publishing started. The sites update in a few minutes." };
}
