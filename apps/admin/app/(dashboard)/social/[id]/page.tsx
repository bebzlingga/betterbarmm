import type { SocialPost } from "@betterbarmm/db";
import { ArrowSquareOutIcon, CheckCircleIcon, CheckIcon, HourglassIcon, TrashIcon, WarningCircleIcon } from "@phosphor-icons/react/ssr";
import { notFound } from "next/navigation";
import { ConfirmButton } from "../../../_components/confirm-button";
import { PageHeader, ago } from "../../../_components/ui";
import { facebookConfigured, facebookPageName } from "../../../_lib/facebook";
import { requireEditor } from "../../../_lib/auth";
import { approvePost, deletePost, requestChanges } from "../actions";
import { PostComposer } from "../post-composer";
import { PostPreview, STATUS, whenLabel } from "../post-preview";

const TONE = {
  good: "bg-[var(--good-soft)] text-[var(--good)]",
  warn: "bg-[var(--warn-soft)] text-[var(--warn)]",
  accent: "bg-[var(--accent-soft)] text-[var(--accent)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
} as const;

export default async function PostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; submitted?: string }> }) {
  const { supabase, user, profile } = await requireEditor();
  const { id } = await params;
  const { saved, submitted } = await searchParams;
  const { data } = await supabase.from("social_posts").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const post = data as SocialPost;
  const image = post.image_path ? supabase.storage.from("social").getPublicUrl(post.image_path).data.publicUrl : null;
  const editable = post.status === "draft" || post.status === "failed";
  const approver = profile.role === "admin" || Boolean(profile.can_approve_posts);
  const mayDecide = approver && (post.author_id !== user.id || profile.role === "admin");
  const fb = post.results?.facebook;

  const banner = (tone: "good" | "warn" | "accent" | "info", Glyph: typeof CheckCircleIcon, text: React.ReactNode) => (
    <div className={`mb-6 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ${TONE[tone]}`}>
      <Glyph size={18} weight="fill" className="mt-px shrink-0" aria-hidden="true" />
      <div>{text}</div>
    </div>
  );

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Social", href: "/social" }]}
        title={<span className="flex items-center gap-3">Post <span className={`pill ${STATUS[post.status][1]}`}>{STATUS[post.status][0]}</span></span>}
        description={`By ${post.author_email || "unknown"}, ${ago(post.created_at)}${post.reviewer_email ? ` · reviewed by ${post.reviewer_email}` : ""}`}
        actions={
          editable ? (
            <form action={deletePost.bind(null, post.id)}>
              <ConfirmButton message="Delete this post?">
                <TrashIcon size={15} aria-hidden="true" /> Delete
              </ConfirmButton>
            </form>
          ) : null
        }
      />

      {saved ? banner("good", CheckCircleIcon, "Draft saved.") : null}
      {submitted ? banner("good", CheckCircleIcon, "Submitted. An approver will review it.") : null}
      {post.status === "draft" && post.review_note ? banner("warn", WarningCircleIcon, <><strong>Changes requested</strong> by {post.reviewer_email}: {post.review_note}</>) : null}
      {post.status === "failed" ? banner("accent", WarningCircleIcon, <><strong>Facebook refused it:</strong> {fb?.error ?? "unknown error"}. Fix the post and submit again, or an approver can retry.</>) : null}
      {post.status === "scheduled" ? banner("info", HourglassIcon, <>Scheduled on Facebook for <strong>{whenLabel(post.scheduled_at)}</strong>. To change it now, edit or delete it from the Page&rsquo;s Meta Business Suite.</>) : null}
      {post.status === "posted" ? banner("good", CheckCircleIcon, <>Posted {post.posted_at ? whenLabel(post.posted_at) : ""}.{fb?.url ? <> <a href={fb.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold underline">See it on Facebook <ArrowSquareOutIcon size={12} aria-hidden="true" /></a></> : null}</>) : null}

      {editable ? (
        <PostComposer post={post} imageUrl={image} pageName={facebookPageName()} />
      ) : (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="space-y-6">
            {post.status === "in_review" ? (
              mayDecide ? (
                <section className="panel overflow-hidden">
                  <div className="panel-head">
                    <h2 className="panel-title">Your review</h2>
                    <span className="text-xs text-[var(--ink-3)]">{post.scheduled_at ? `Goes to Facebook's scheduler for ${whenLabel(post.scheduled_at)}` : "Posts as soon as you approve"}</span>
                  </div>
                  <div className="grid gap-5 p-5 md:grid-cols-2">
                    <form action={approvePost.bind(null, post.id)} className="flex flex-col justify-between gap-3 rounded-xl border border-[var(--rule)] p-4">
                      <p className="text-sm text-[var(--ink-2)]">Approve it as it stands. It goes out under BetterBARMM&rsquo;s name.</p>
                      <ConfirmButton message={post.scheduled_at ? "Approve and schedule this post on Facebook?" : "Approve and post this to Facebook now?"} variant="primary">
                        <CheckIcon size={14} weight="bold" aria-hidden="true" /> {post.scheduled_at ? "Approve and schedule" : "Approve and post"}
                      </ConfirmButton>
                      {!facebookConfigured() ? <p className="text-xs text-[var(--warn)]">Facebook is not connected yet; approving will fail until it is.</p> : null}
                    </form>
                    <form action={requestChanges.bind(null, post.id)} className="flex flex-col gap-3 rounded-xl border border-[var(--rule)] p-4">
                      <label className="block">
                        <span className="field-label">Or send it back with a note</span>
                        <textarea name="note" rows={3} className="field" placeholder="What should change?" />
                      </label>
                      <button type="submit" className="btn btn-secondary self-start">Request changes</button>
                    </form>
                  </div>
                </section>
              ) : (
                banner("info", HourglassIcon, approver ? "You wrote this post, so someone else has to approve it." : "Waiting for an approver. Admins can let an editor approve posts on the Editors page.")
              )
            ) : null}
            <section className="panel p-5">
              <p className="eyebrow mb-2">The post</p>
              <p className="whitespace-pre-wrap text-[15px] leading-7">{post.body}</p>
              {post.link ? (
                <a href={post.link} target="_blank" rel="noreferrer" className="mt-3 inline-block break-all text-sm text-[var(--accent)] underline">
                  {post.link}
                </a>
              ) : null}
            </section>
          </div>
          <aside className="xl:sticky xl:top-24">
            <p className="eyebrow mb-2">Preview · Facebook</p>
            <PostPreview pageName={facebookPageName()} when={whenLabel(post.scheduled_at ?? post.posted_at)} body={post.body} image={image} link={post.link} />
          </aside>
        </div>
      )}
    </div>
  );
}
