"use server";

import { findCollection } from "@betterbarmm/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "../../_lib/auth";

export type RecordFormState = { error: string | null };

/**
 * Create or update one record. `existingKey` is null for a new record. The
 * form sends the whole record as JSON in `data`, so every collection shares
 * one action whatever its shape.
 */
export async function saveRecord(
  workspace: string,
  collection: string,
  existingKey: string | null,
  _prev: RecordFormState,
  formData: FormData,
): Promise<RecordFormState> {
  const { supabase, user } = await requireEditor();
  const def = findCollection(workspace, collection);
  if (!def) return { error: "Unknown collection." };

  let data: unknown;
  try {
    data = JSON.parse(String(formData.get("data") ?? ""));
  } catch {
    return { error: "The record is not valid JSON." };
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { error: "A record must be a JSON object." };
  }

  const key = existingKey ?? String(formData.get("key") ?? "").trim();
  if (!key) return { error: "Give the record a key." };

  const row = {
    workspace,
    collection,
    key,
    data,
    title: def.title(data as Record<string, unknown>),
    updated_by: user.id,
  };

  if (existingKey) {
    const { error } = await supabase
      .from("records")
      .update(row)
      .eq("workspace", workspace)
      .eq("collection", collection)
      .eq("key", existingKey);
    if (error) return { error: error.message };
  } else {
    // New records go to the end of the collection, which is where db:pull writes them.
    const { data: last } = await supabase
      .from("records")
      .select("position")
      .eq("workspace", workspace)
      .eq("collection", collection)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = await supabase.from("records").insert({ ...row, position: (last?.position ?? -1) + 1 });
    if (error) {
      return { error: error.code === "23505" ? `A record with the key "${key}" already exists.` : error.message };
    }
  }

  revalidatePath(`/data/${workspace}/${collection}`);
  redirect(`/data/${workspace}/${collection}/edit?key=${encodeURIComponent(key)}&saved=1`);
}

export async function deleteRecord(workspace: string, collection: string, key: string) {
  const { supabase } = await requireEditor();
  const { error } = await supabase
    .from("records")
    .delete()
    .eq("workspace", workspace)
    .eq("collection", collection)
    .eq("key", key);
  if (error) throw new Error(error.message);
  revalidatePath(`/data/${workspace}/${collection}`);
  redirect(`/data/${workspace}/${collection}`);
}
