"use client";

import { CalendarBlankIcon, ImageIcon, LinkIcon, PaperPlaneTiltIcon, XIcon } from "@phosphor-icons/react";
import { useActionState, useEffect, useState } from "react";
import { savePost, type PostFormState } from "./actions";
import { LONG, PostPreview, whenLabel } from "./post-preview";

/* Write a post and see it as Facebook will show it. Saves as a draft or goes
   to review; nothing is sent until an approver approves it. */

/** A Date as the value a datetime-local input shows, in Manila time. */
const toLocal = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() + 8 * 3600_000).toISOString().slice(0, 16) : "");

export function PostComposer({
  post,
  imageUrl,
  pageName,
}: {
  post?: { id: string; body: string; link: string | null; scheduled_at: string | null };
  imageUrl: string | null;
  pageName: string;
}) {
  const [state, action, pending] = useActionState<PostFormState, FormData>(savePost.bind(null, post?.id ?? null), { error: null });
  const [body, setBody] = useState(post?.body ?? "");
  const [link, setLink] = useState(post?.link ?? "");
  const [when, setWhen] = useState(toLocal(post?.scheduled_at ?? null));
  const [preview, setPreview] = useState<string | null>(imageUrl);
  const [removed, setRemoved] = useState(false);

  useEffect(() => () => (preview?.startsWith("blob:") ? URL.revokeObjectURL(preview) : undefined), [preview]);

  const minWhen = toLocal(new Date(Date.now() + 20 * 60_000).toISOString());

  return (
    <form action={action} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="panel overflow-hidden">
        <div className="space-y-5 p-5">
          <label className="block">
            <span className="field-label">Post</span>
            <textarea
              name="body"
              rows={9}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What should people know? Link to the record it comes from."
              className="field !text-[0.9375rem]"
              required
            />
            <span className={`mt-1 block text-right text-xs ${body.length > LONG ? "text-[var(--warn)]" : "text-[var(--ink-mute)]"}`}>
              {body.length.toLocaleString()} characters{body.length > LONG ? " · Facebook will fold it behind “See more”" : ""}
            </span>
          </label>

          <label className="block">
            <span className="field-label flex items-center gap-1.5">
              <LinkIcon size={14} aria-hidden="true" /> Link <span className="font-normal text-[var(--ink-mute)]">(optional)</span>
            </span>
            <input name="link" type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://budget.betterbarmm.com/…" className="field" />
          </label>

          <div>
            <span className="field-label flex items-center gap-1.5">
              <ImageIcon size={14} aria-hidden="true" /> Image <span className="font-normal text-[var(--ink-mute)]">(optional, up to 8 MB)</span>
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <input
                name="image"
                type="file"
                accept="image/*"
                className="block text-sm file:mr-3 file:rounded-lg file:border file:border-[var(--rule-strong)] file:bg-[var(--surface)] file:px-3 file:py-1.5 file:text-[0.8125rem] file:font-semibold file:text-[var(--ink)] hover:file:bg-[var(--surface-2)]"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setPreview(f ? URL.createObjectURL(f) : removed ? null : imageUrl);
                }}
              />
              {preview ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setPreview(null);
                    setRemoved(true);
                    const input = document.querySelector<HTMLInputElement>('input[name="image"]');
                    if (input) input.value = "";
                  }}
                >
                  <XIcon size={13} aria-hidden="true" /> Remove image
                </button>
              ) : null}
              <input type="hidden" name="remove_image" value={removed ? "1" : ""} />
            </div>
          </div>

          <label className="block max-w-xs">
            <span className="field-label flex items-center gap-1.5">
              <CalendarBlankIcon size={14} aria-hidden="true" /> Publish at <span className="font-normal text-[var(--ink-mute)]">(Manila time)</span>
            </span>
            <input name="scheduled_at" type="datetime-local" value={when} min={minWhen} onChange={(e) => setWhen(e.target.value)} className="field" />
            <span className="mt-1 block text-xs text-[var(--ink-3)]">Leave blank to post as soon as it is approved.</span>
          </label>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--rule)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-5 py-3 backdrop-blur">
          <p role="alert" className="text-sm text-[var(--accent)]">
            {state.error}
          </p>
          <div className="flex gap-2">
            <button type="submit" name="intent" value="draft" disabled={pending} className="btn btn-secondary">
              Save draft
            </button>
            <button type="submit" name="intent" value="submit" disabled={pending || !body.trim()} className="btn btn-primary">
              <PaperPlaneTiltIcon size={15} aria-hidden="true" /> {pending ? "Saving…" : "Submit for review"}
            </button>
          </div>
        </div>
      </div>

      {/* As Facebook will show it, roughly. */}
      <aside className="xl:sticky xl:top-24">
        <p className="eyebrow mb-2">Preview · Facebook</p>
        <PostPreview pageName={pageName} when={when ? whenLabel(new Date(`${when}:00+08:00`).toISOString()) : "Just now"} body={body} image={preview} link={link || null} />
      </aside>
    </form>
  );
}
