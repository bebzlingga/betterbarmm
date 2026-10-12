import type { Revision } from "@betterbarmm/db";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { EmptyState, PageHeader, Pagination, ago, initials } from "../../_components/ui";
import { ConfirmButton } from "../../_components/confirm-button";
import { describeChange, when } from "../../_components/history-panel";
import { requireEditor } from "../../_lib/auth";
import { restoreRevision } from "../../_lib/history";
import { revisionHref, revisionPlace } from "../../_lib/revisions";

const PAGE = 50;

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string; action?: string; page?: string }>;
}) {
  const { supabase } = await requireEditor();
  const { entity, action, page = "1" } = await searchParams;
  const pageNumber = Math.max(1, Number(page) || 1);

  let query = supabase
    .from("revisions")
    .select("*", { count: "exact" })
    .order("changed_at", { ascending: false })
    .range((pageNumber - 1) * PAGE, pageNumber * PAGE - 1);
  if (entity === "record" || entity === "explainer") query = query.eq("entity", entity);
  if (action === "insert" || action === "update" || action === "delete") query = query.eq("action", action);
  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  const revisions = (data ?? []) as Revision[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));
  const pageHref = (n: number) =>
    `/activity?${new URLSearchParams({ ...(entity ? { entity } : {}), ...(action ? { action } : {}), page: String(n) })}`;

  const filterHref = (next: { entity?: string; action?: string }) => {
    const params = new URLSearchParams(Object.entries(next).filter((e): e is [string, string] => Boolean(e[1])));
    return params.size ? `/activity?${params}` : "/activity";
  };
  const chip = (on: boolean, href: string, label: string) => (
    <Link
      key={label}
      href={href}
      aria-current={on ? "page" : undefined}
      className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition ${on ? "bg-[var(--surface)] text-[var(--ink)] shadow-[var(--shadow-sm)]" : "text-[var(--ink-3)] hover:text-[var(--ink)]"}`}
    >
      {label}
    </Link>
  );
  const tone = { insert: "pill-good", update: "pill-info", delete: "pill-accent" } as const;
  const verb = { insert: "Created", update: "Edited", delete: "Deleted" } as const;

  return (
    <div>
      <PageHeader title="Activity" description="Every edit by every editor, newest first. A deleted record or explainer can be restored from here." />

      <div className="panel overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--rule)] p-3">
          <div className="inline-flex rounded-lg bg-[var(--surface-2)] p-1">
            {chip(!entity, filterHref({ action }), "Everything")}
            {chip(entity === "record", filterHref({ entity: "record", action }), "Records")}
            {chip(entity === "explainer", filterHref({ entity: "explainer", action }), "Explainers")}
          </div>
          <div className="inline-flex rounded-lg bg-[var(--surface-2)] p-1">
            {chip(!action, filterHref({ entity }), "Any change")}
            {chip(action === "insert", filterHref({ entity, action: "insert" }), "Created")}
            {chip(action === "update", filterHref({ entity, action: "update" }), "Edited")}
            {chip(action === "delete", filterHref({ entity, action: "delete" }), "Deleted")}
          </div>
        </div>

        {revisions.length ? (
          <ol className="divide-y divide-[var(--rule)]">
            {revisions.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start gap-3 px-[1.125rem] py-3.5 sm:flex-nowrap">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[var(--surface-3)] font-[family-name:var(--font-display)] text-[10.5px] font-semibold text-[var(--ink-2)]" title={r.changed_by_email}>
                  {initials(r.changed_by_email || "?")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    <span className={`pill ${tone[r.action]}`}>{verb[r.action]}</span>
                    {r.action === "delete" ? (
                      <span className="font-medium">{r.title || r.key}</span>
                    ) : (
                      <Link href={revisionHref(r)} className="font-medium hover:text-[var(--accent)]">
                        {r.title || r.key}
                      </Link>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ink-3)]">
                    {revisionPlace(r)}
                    {r.action === "update" ? ` · ${describeChange(r)}` : ""} · {r.changed_by_email || "unknown editor"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-[var(--ink-mute)]" title={when(r.changed_at)}>{ago(r.changed_at)}</span>
                  {r.action === "delete" ? (
                    <form action={restoreRevision.bind(null, r.id)}>
                      <ConfirmButton message="Restore this deleted item?" variant="secondary">
                        Restore
                      </ConfirmButton>
                    </form>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState icon={ClockCounterClockwiseIcon} title="No edits recorded yet">
            Edits made in the admin appear here. Data loaded by <code className="field-mono">bun db:seed</code> is not logged.
          </EmptyState>
        )}
      </div>

      <Pagination page={pageNumber} pages={pages} href={pageHref} newer="Newer" older="Older" />
    </div>
  );
}
