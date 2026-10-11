"use client";

import { EXPLAINER_CATEGORIES, slugify, type Explainer } from "@betterbarmm/db";
import { Markdown } from "@betterbarmm/ui";
import { useActionState, useState } from "react";
import { saveExplainer } from "./actions";

export function ExplainerForm({ explainer }: { explainer?: Explainer }) {
  const [state, action, pending] = useActionState(saveExplainer.bind(null, explainer?.id ?? null), {
    error: null,
  });
  const [title, setTitle] = useState(explainer?.title ?? "");
  const [slug, setSlug] = useState(explainer?.slug ?? "");
  const [body, setBody] = useState(explainer?.body ?? "");
  const [preview, setPreview] = useState(false);

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[1fr_18rem]">
      <div className="space-y-5">
        <label className="block">
          <span className="field-label">Title</span>
          <input
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="field text-base"
          />
        </label>
        <label className="block">
          <span className="field-label">Slug</span>
          <input
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={slugify(title) || "made-from-the-title"}
            className="field field-mono"
          />
          <span className="mt-1 block text-xs text-[var(--ink-3)]">
            The address on www: /explainers/{slug || slugify(title) || "…"}
          </span>
        </label>
        <label className="block">
          <span className="field-label">Summary</span>
          <textarea name="summary" rows={2} defaultValue={explainer?.summary} className="field" />
        </label>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="field-label mb-0">Body (Markdown)</span>
            <button type="button" onClick={() => setPreview(!preview)} className="text-xs font-semibold text-[var(--accent)]">
              {preview ? "Edit" : "Preview"}
            </button>
          </div>
          {/* The textarea stays mounted while previewing, so the form still submits its value. */}
          <textarea
            name="body"
            rows={22}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={`field field-mono ${preview ? "hidden" : ""}`}
          />
          {preview ? <Markdown source={body} className="prose-admin panel min-h-64 p-5" /> : null}
          <p className="mt-1 text-xs text-[var(--ink-3)]">
            ## heading, ### subheading, **bold**, *italic*, - list, 1. list, &gt; quote, [link](https://…)
          </p>
        </div>
      </div>

      <aside className="space-y-5">
        <div className="panel space-y-4 p-4">
          <label className="block">
            <span className="field-label">Status</span>
            <select name="status" defaultValue={explainer?.status ?? "draft"} className="field">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label className="block">
            <span className="field-label">Category</span>
            <select name="category" required defaultValue={explainer?.category ?? ""} className="field">
              <option value="" disabled>
                Choose…
              </option>
              {EXPLAINER_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Tags</span>
            <input name="tags" defaultValue={explainer?.tags.join(", ")} placeholder="bills, parliament" className="field" />
            <span className="mt-1 block text-xs text-[var(--ink-3)]">Separate with commas.</span>
          </label>
          {state.error ? (
            <p role="alert" className="text-sm text-[var(--accent)]">
              {state.error}
            </p>
          ) : null}
          <button type="submit" disabled={pending} className="btn btn-primary w-full">
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </aside>
    </form>
  );
}
