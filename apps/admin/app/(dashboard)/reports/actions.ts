"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "../../_lib/auth";

/** Close a reader's report: fixed (say how) or not an error (say why). */
export async function resolveReport(id: string, status: "fixed" | "dismissed", form: FormData) {
  const { supabase, user, profile } = await requireEditor();
  const { error } = await supabase
    .from("reports")
    .update({
      status,
      resolution: String(form.get("resolution") ?? "").trim().slice(0, 2000),
      resolved_by: user.id,
      resolved_by_email: profile.email,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/reports");
  revalidatePath("/", "layout");
}
