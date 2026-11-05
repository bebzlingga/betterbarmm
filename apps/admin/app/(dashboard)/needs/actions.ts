"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "../../_lib/auth";

/** Approve a posted need (it goes on the site), decline it, or mark an approved one met. */
export async function reviewNeed(id: string, status: "approved" | "declined" | "met", form: FormData) {
  const { supabase, user, profile } = await requireEditor();
  const now = new Date().toISOString();
  const note = String(form.get("note") ?? "").trim().slice(0, 1000);
  const { error } = await supabase
    .from("school_needs")
    .update({
      status,
      // A note left blank keeps the one written at approval.
      ...(note ? { note } : {}),
      ...(status === "met" ? { met_at: now } : { reviewed_by: user.id, reviewed_by_email: profile.email, reviewed_at: now }),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/needs");
  revalidatePath("/", "layout");
}
