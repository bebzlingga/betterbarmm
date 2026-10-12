"use server";

import type { Profile, SocialPost } from "@betterbarmm/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { postToFacebook } from "../../_lib/facebook";
import { requireEditor } from "../../_lib/auth";

export type PostFormState = { error: string | null };

/** Admins always; editors an admin has marked as approvers. */
const canApprove = (p: Profile) => p.role === "admin" || Boolean(p.can_approve_posts);

/** "2026-10-13T09:00" typed in the form is Manila time. */
const manila = (local: string) => (local ? new Date(`${local}:00+08:00`) : null);

/**
 * Save a draft, or save and send it for review. A post can be edited while it
 * is a draft or has failed; once in review it is the approver's to decide.
 */
export async function savePost(id: string | null, _prev: PostFormState, form: FormData): Promise<PostFormState> {
  const { supabase, user, profile } = await requireEditor();
  const intent = String(form.get("intent") ?? "draft");
  const body = String(form.get("body") ?? "").trim();
  const link = String(form.get("link") ?? "").trim() || null;
  const scheduledAt = manila(String(form.get("scheduled_at") ?? ""));
  if (!body) return { error: "Write the post first." };
  if (link && !/^https?:\/\//.test(link)) return { error: "A link starts with https://" };
  if (scheduledAt && scheduledAt.getTime() < Date.now() + 15 * 60_000)
    return { error: "A scheduled time has to be at least 15 minutes from now; leave it blank to post when approved." };

  let existing: SocialPost | null = null;
  if (id) {
    const { data } = await supabase.from("social_posts").select("*").eq("id", id).maybeSingle();
    existing = data as SocialPost | null;
    if (!existing) return { error: "That post no longer exists." };
    if (!["draft", "failed"].includes(existing.status)) return { error: "This post is in review or already sent; it can no longer be edited." };
  }

  // A new image replaces the old one; "remove" clears it.
  let imagePath = existing?.image_path ?? null;
  const image = form.get("image");
  if (form.get("remove_image") === "1") imagePath = null;
  if (image instanceof File && image.size) {
    if (!image.type.startsWith("image/")) return { error: "The attachment has to be an image." };
    if (image.size > 8 * 1024 * 1024) return { error: "Images can be up to 8 MB." };
    const path = `${crypto.randomUUID()}/${image.name.replace(/[^\w.-]+/g, "-")}`;
    const up = await supabase.storage.from("social").upload(path, image, { contentType: image.type });
    if (up.error) return { error: `Upload failed: ${up.error.message}` };
    imagePath = path;
  }

  const row = {
    body,
    link,
    image_path: imagePath,
    scheduled_at: scheduledAt?.toISOString() ?? null,
    platforms: ["facebook"],
    status: intent === "submit" ? "in_review" : "draft",
    submitted_at: intent === "submit" ? new Date().toISOString() : null,
    ...(existing ? {} : { author_id: user.id, author_email: profile.email }),
  };
  const { data, error } = existing
    ? await supabase.from("social_posts").update(row).eq("id", existing.id).select("id").single()
    : await supabase.from("social_posts").insert(row).select("id").single();
  if (error) return { error: error.message };

  revalidatePath("/social");
  redirect(`/social/${data.id}?${intent === "submit" ? "submitted" : "saved"}=1`);
}

async function decidable(id: string) {
  const ctx = await requireEditor();
  if (!canApprove(ctx.profile)) throw new Error("Only an approver can decide on posts.");
  const { data } = await ctx.supabase.from("social_posts").select("*").eq("id", id).maybeSingle();
  const post = data as SocialPost | null;
  if (!post) throw new Error("That post no longer exists.");
  // Two people sign off on anything posted in BetterBARMM's name, unless an admin does both.
  if (post.author_id === ctx.user.id && ctx.profile.role !== "admin") throw new Error("Someone else has to approve your own post.");
  return { ...ctx, post };
}

/** Approve and send: now, or to Facebook's scheduler for the time set. */
export async function approvePost(id: string) {
  const { supabase, user, profile, post } = await decidable(id);
  if (!["in_review", "failed"].includes(post.status)) throw new Error("This post is not waiting for approval.");

  const when = post.scheduled_at ? new Date(post.scheduled_at) : null;
  // A time that has slipped too close (or past) while in review posts now.
  const scheduled = when && when.getTime() > Date.now() + 11 * 60_000 ? when : null;
  const imageUrl = post.image_path ? supabase.storage.from("social").getPublicUrl(post.image_path).data.publicUrl : null;
  const facebook = await postToFacebook({ body: post.body, link: post.link, imageUrl, scheduledAt: scheduled });

  const { error } = await supabase
    .from("social_posts")
    .update({
      status: facebook.error ? "failed" : scheduled ? "scheduled" : "posted",
      results: { ...post.results, facebook },
      reviewer_id: user.id,
      reviewer_email: profile.email,
      review_note: "",
      decided_at: new Date().toISOString(),
      posted_at: facebook.error || scheduled ? null : new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/social");
  revalidatePath(`/social/${id}`);
  revalidatePath("/", "layout");
}

/** Send it back to its author with a note. */
export async function requestChanges(id: string, form: FormData) {
  const { supabase, user, profile, post } = await decidable(id);
  if (post.status !== "in_review") throw new Error("This post is not waiting for approval.");
  const note = String(form.get("note") ?? "").trim() || "Changes requested.";
  const { error } = await supabase
    .from("social_posts")
    .update({ status: "draft", review_note: note, reviewer_id: user.id, reviewer_email: profile.email, decided_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/social");
  revalidatePath(`/social/${id}`);
  revalidatePath("/", "layout");
}

export async function deletePost(id: string) {
  const { supabase } = await requireEditor();
  const { data } = await supabase.from("social_posts").select("status, image_path").eq("id", id).maybeSingle();
  if (!data) redirect("/social");
  if (!["draft", "failed"].includes(data.status)) throw new Error("A post in review or already sent cannot be deleted here.");
  await supabase.from("social_posts").delete().eq("id", id);
  if (data.image_path) await supabase.storage.from("social").remove([data.image_path]);
  revalidatePath("/social");
  redirect("/social");
}
