import { needKindLabel, needPosterLabel, type SchoolNeedReview } from "@betterbarmm/db";
import { ArrowSquareOutIcon, CheckIcon, EnvelopeSimpleIcon, GraduationCapIcon, HandHeartIcon, XIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { EmptyState, PageHeader, ago } from "../../_components/ui";
import { requireEditor } from "../../_lib/auth";
import { reviewNeed } from "./actions";

const TABS = [
  ["new", "New"],
  ["approved", "On the site"],
  ["met", "Met"],
  ["declined", "Declined"],
] as const;

const EDUCATION = "https://education.betterbarmm.com";

export default async function NeedsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { supabase } = await requireEditor();
  const { status: wanted } = await searchParams;
  const status = TABS.some(([s]) => s === wanted) ? wanted! : "new";
  const { data, error } = await supabase.from("school_needs").select("*").eq("status", status).order("created_at", { ascending: false }).limit(200);
  // Before 0007_school_needs.sql has been run there is no table to read: say so rather than fail.
  const missing = error?.code === "42P01" || /school_needs/.test(error?.message ?? "");
  if (error && !missing) throw new Error(error.message);
  const needs = (data ?? []) as SchoolNeedReview[];

  return (
    <div>
      <PageHeader
        title="School needs"
        description="What teachers, students and parents say their school needs, posted from the Education workspace. Check each is about a real school and names no child, then approve it for the site or decline it. Mark it met when the need is filled."
      />
      <div className="mb-5 inline-flex rounded-lg bg-[var(--surface-2)] p-1">
        {TABS.map(([s, label]) => (
          <Link
            key={s}
            href={`/needs?status=${s}`}
            aria-current={s === status ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-[0.8125rem] font-medium transition ${s === status ? "bg-[var(--surface)] text-[var(--ink)] shadow-[var(--shadow-sm)]" : "text-[var(--ink-3)] hover:text-[var(--ink)]"}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {missing ? (
        <div className="panel">
          <EmptyState icon={GraduationCapIcon} title="Not switched on yet">
            Run packages/db/migrations/0007_school_needs.sql in the Supabase SQL editor to start taking posts.
          </EmptyState>
        </div>
      ) : needs.length ? (
        <div className="space-y-4">
          {needs.map((n) => (
            <article key={n.id} className="panel overflow-hidden">
              <div className="panel-head">
                <a href={`${EDUCATION}/schools/${n.school_id}`} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-1.5 text-[0.8125rem] font-medium hover:text-[var(--accent)]">
                  <span className="truncate">
                    {n.school_name} · {n.town_name}
                  </span>
                  <ArrowSquareOutIcon size={13} className="shrink-0" aria-hidden="true" />
                </a>
                <span className="shrink-0 text-xs text-[var(--ink-mute)]">{ago(n.created_at)}</span>
              </div>
              <div className="px-[1.125rem] py-4">
                <p className="text-xs text-[var(--ink-3)]">
                  {needKindLabel(n.kind)}
                  {n.quantity ? ` · ${n.quantity}` : ""} · posted by {needPosterLabel(n.poster).toLowerCase()} · school ID {n.school_id}
                </p>
                <h2 className="mt-1 text-[1rem] font-semibold">{n.title}</h2>
                <p className="mt-2 whitespace-pre-wrap text-[0.90625rem] leading-7">{n.details}</p>
                {n.contact ? (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-[0.8125rem] text-[var(--ink-3)]">
                    <EnvelopeSimpleIcon size={14} aria-hidden="true" /> {n.contact} <span className="text-[var(--ink-mute)]">(private)</span>
                  </p>
                ) : null}
                {n.status !== "new" ? (
                  <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-3 py-2 text-[0.8125rem] text-[var(--ink-2)]">
                    <strong>{n.status === "declined" ? "Declined" : n.status === "met" ? "Met" : "Approved"}</strong> by {n.reviewed_by_email || "an editor"}
                    {n.reviewed_at ? ` ${ago(n.reviewed_at)}` : ""}
                    {n.note ? `: ${n.note}` : ""}
                  </p>
                ) : null}
              </div>
              {n.status === "new" || n.status === "approved" ? (
                <form className="flex flex-wrap items-center gap-2 border-t border-[var(--rule)] bg-[var(--surface-2)] px-[1.125rem] py-3">
                  <input
                    name="note"
                    placeholder={n.status === "new" ? "A note for the site, if any: what you checked" : "Who met it, or how"}
                    className="field min-w-[16rem] flex-1"
                  />
                  {n.status === "new" ? (
                    <>
                      <button formAction={reviewNeed.bind(null, n.id, "declined")} className="btn btn-secondary btn-sm">
                        <XIcon size={13} weight="bold" aria-hidden="true" /> Decline
                      </button>
                      <button formAction={reviewNeed.bind(null, n.id, "approved")} className="btn btn-primary btn-sm">
                        <CheckIcon size={13} weight="bold" aria-hidden="true" /> Approve
                      </button>
                    </>
                  ) : (
                    <button formAction={reviewNeed.bind(null, n.id, "met")} className="btn btn-primary btn-sm">
                      <HandHeartIcon size={13} weight="bold" aria-hidden="true" /> Mark met
                    </button>
                  )}
                </form>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="panel">
          <EmptyState icon={GraduationCapIcon} title={status === "new" ? "Nothing waiting" : "None here"}>
            {status === "new" ? "Needs arrive from the Post a need form on the Education workspace." : null}
          </EmptyState>
        </div>
      )}
    </div>
  );
}
