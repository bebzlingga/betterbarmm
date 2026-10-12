import type { Revision } from "@betterbarmm/db";
import { restoreRevision } from "../_lib/history";
import { ConfirmButton } from "./confirm-button";

/** Top-level fields that differ between two objects. */
function changedFields(before: unknown, after: unknown): string[] {
  const a = (before ?? {}) as Record<string, unknown>;
  const b = (after ?? {}) as Record<string, unknown>;
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(
    (k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]),
  );
}

/** What an update changed, in the record's own field names. */
export function describeChange(revision: Revision): string {
  if (revision.action === "insert") return "Created";
  if (revision.action === "delete") return "Deleted";
  const ignore = new Set(["updated_at", "updated_by", "title", "position"]);
  const fields =
    revision.entity === "record"
      ? changedFields(revision.before?.data, revision.after?.data)
      : changedFields(revision.before, revision.after).filter((f) => !ignore.has(f));
  return fields.length ? `Changed ${fields.slice(0, 6).join(", ")}${fields.length > 6 ? ` +${fields.length - 6}` : ""}` : "Saved";
}

export const when = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });

/**
 * A record's or explainer's revisions, newest first. Every revision but the
 * newest can be restored — the newest is what is already there.
 */
export function HistoryPanel({ revisions }: { revisions: Revision[] }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2 className="panel-title">History</h2>
        <span className="pill">{revisions.length}</span>
      </div>
      {revisions.length ? (
        <ol className="relative px-4 py-3 text-sm">
          {revisions.map((revision, i) => (
            <li key={revision.id} className="relative border-l border-[var(--rule)] pb-4 pl-5 last:pb-1">
              <span
                className={`absolute -left-[5px] top-1.5 size-[9px] rounded-full border-2 border-[var(--surface)] ${i === 0 ? "bg-[var(--accent)]" : "bg-[var(--rule-strong)]"}`}
                aria-hidden="true"
              />
              <p className="font-medium">{describeChange(revision)}</p>
              <p className="mt-0.5 text-xs text-[var(--ink-3)]">
                {when(revision.changed_at)} · {revision.changed_by_email || "unknown editor"}
              </p>
              {i > 0 ? (
                <form action={restoreRevision.bind(null, revision.id)} className="mt-2">
                  <ConfirmButton message="Restore this version? The current version stays in the history." variant="secondary">
                    {revision.action === "delete" ? "Restore before deletion" : "Restore this version"}
                  </ConfirmButton>
                </form>
              ) : (
                <span className="pill pill-good mt-2">Current</span>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-4 py-6 text-sm leading-6 text-[var(--ink-3)]">
          No edits yet. Changes made here are recorded from now on; data loaded by <code className="field-mono">bun db:seed</code> is not.
        </p>
      )}
    </section>
  );
}
