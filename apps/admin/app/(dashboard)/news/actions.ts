"use server";

import { runNewsFetch } from "@betterbarmm/db";
import { revalidatePath } from "next/cache";
import { requireEditor } from "../../_lib/auth";

/** Read the feeds now, as the editor; Fetch news in GitHub Actions does the same when run. */
export async function runNow() {
  const { supabase, profile } = await requireEditor();
  await runNewsFetch(supabase, "manual", profile.email);
  revalidatePath("/news");
}

/** Keep an off-topic item off the public page, or bring it back. */
export async function setHidden(id: string, hidden: boolean) {
  const { supabase } = await requireEditor();
  const { error } = await supabase.from("news_items").update({ hidden }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/news");
}
