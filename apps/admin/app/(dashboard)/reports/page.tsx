import type { Report } from "@betterbarmm/db";
import { ArrowSquareOutIcon, CheckIcon, EnvelopeSimpleIcon, FlagIcon, XIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { EmptyState, PageHeader, ago } from "../../_components/ui";
import { requireEditor } from "../../_lib/auth";
import { resolveReport } from "./actions";

const TABS = [
  ["new", "New"],
  ["fixed", "Fixed"],
  ["dismissed", "Not an error"],
] as const;

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { supabase } = await requireEditor();
  const { status: wanted } = await searchParams;
  const status = TABS.some(([s]) => s === wanted) ? wanted! : "new";
  const { data, error } = await supabase.from("reports").select("*").eq("status", status).order("created_at", { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  const reports = (data ?? []) as Report[];
  const host = (u: string) => {
    try {
      const url = new URL(u);
      return `${url.hostname.replace(/^www\./, "")}${url.pathname}`;
    } catch {
      return u;
    }
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Errors readers flagged with “Spotted an error on this page?”. Check each against the source, fix the record if it is wrong, then close it here."
      />
      <div className="mb-5 inline-flex rounded-lg bg-[var(--surface-2)] p-1">
        {TABS.map(([s, label]) => (
          <Link
            key={s}
            href={`/reports?status=${s}`}
            aria-current={s === status ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-[0.8125rem] font-medium transition ${s === status ? "bg-[var(--surface)] text-[var(--ink)] shadow-[var(--shadow-sm)]" : "text-[var(--ink-3)] hover:text-[var(--ink)]"}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {reports.length ? (
        <div className="space-y-4">
          {reports.map((r) => (
            <article key={r.id} className="panel overflow-hidden">
              <div className="panel-head">
                <a href={r.page_url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-1.5 text-[0.8125rem] font-medium hover:text-[var(--accent)]">
                  <span className="truncate">{host(r.page_url)}</span>
                  <ArrowSquareOutIcon size={13} className="shrink-0" aria-hidden="true" />
                </a>
                <span className="shrink-0 text-xs text-[var(--ink-mute)]">{ago(r.created_at)}</span>
              </div>
              <div className="px-[1.125rem] py-4">
                <p className="whitespace-pre-wrap text-[0.90625rem] leading-7">{r.message}</p>
                {r.contact ? (
                  <a href={`mailto:${r.contact}`} className="mt-3 inline-flex items-center gap-1.5 text-[0.8125rem] text-[var(--ink-3)] hover:text-[var(--accent)]">
                    <EnvelopeSimpleIcon size={14} aria-hidden="true" /> {r.contact}
                  </a>
                ) : null}
                {r.status !== "new" ? (
                  <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-3 py-2 text-[0.8125rem] text-[var(--ink-2)]">
                    <strong>{r.status === "fixed" ? "Fixed" : "Not an error"}</strong> by {r.resolved_by_email || "an editor"}
                    {r.resolved_at ? ` ${ago(r.resolved_at)}` : ""}
                    {r.resolution ? `: ${r.resolution}` : ""}
                  </p>
                ) : null}
              </div>
              {r.status === "new" ? (
                <form className="flex flex-wrap items-center gap-2 border-t border-[var(--rule)] bg-[var(--surface-2)] px-[1.125rem] py-3">
                  <input name="resolution" placeholder="What you changed, or why it is right as it is" className="field min-w-[16rem] flex-1" />
                  <button formAction={resolveReport.bind(null, r.id, "dismissed")} className="btn btn-secondary btn-sm">
                    <XIcon size={13} weight="bold" aria-hidden="true" /> Not an error
                  </button>
                  <button formAction={resolveReport.bind(null, r.id, "fixed")} className="btn btn-primary btn-sm">
                    <CheckIcon size={13} weight="bold" aria-hidden="true" /> Fixed
                  </button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="panel">
          <EmptyState icon={FlagIcon} title={status === "new" ? "No reports waiting" : "None here"}>
            {status === "new" ? "Readers file reports from the link at the foot of every page." : null}
          </EmptyState>
        </div>
      )}
    </div>
  );
}
