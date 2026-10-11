"use server";

import { EXPLAINER_CATEGORIES, slugify } from "@betterbarmm/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "../../_lib/auth";

export type ExplainerFormState = { error: string | null };

export async function saveExplainer(
  id: string | null,
  _prev: ExplainerFormState,
  formData: FormData,
): Promise<ExplainerFormState> {
  const { supabase, user } = await requireEditor();

  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const title = text("title");
  const slug = slugify(text("slug") || title);
  const category = text("category");
  const status = text("status") === "published" ? "published" : "draft";
  const tags = [
    ...new Set(
      text("tags")
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];

  if (!title) return { error: "Give the explainer a title." };
  if (!slug) return { error: "The slug needs at least one letter or number." };
  if (!EXPLAINER_CATEGORIES.some((c) => c.value === category)) return { error: "Choose a category." };

  const fields = {
    title,
    slug,
    category,
    status,
    tags,
    summary: text("summary"),
    body: String(formData.get("body") ?? ""),
    updated_by: user.id,
  };

  // Stamp the first publication; keep the date if it is re-saved later.
  let publishedAt: string | null = null;
  if (id) {
    const { data } = await supabase.from("explainers").select("published_at").eq("id", id).single();
    publishedAt = data?.published_at ?? null;
  }
  const published_at = status === "published" ? (publishedAt ?? new Date().toISOString()) : publishedAt;

  const { data, error } = id
    ? await supabase.from("explainers").update({ ...fields, published_at }).eq("id", id).select("id").single()
    : await supabase.from("explainers").insert({ ...fields, published_at }).select("id").single();

  if (error) {
    return {
      error: error.code === "23505" ? `Another explainer already uses the slug "${slug}".` : error.message,
    };
  }

  revalidatePath("/explainers");
  redirect(`/explainers/${data.id}?saved=1`);
}

export async function deleteExplainer(id: string) {
  const { supabase } = await requireEditor();
  const { error } = await supabase.from("explainers").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/explainers");
  redirect("/explainers");
}
