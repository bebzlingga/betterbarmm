import { NEWS_FEEDS, type NewsItem, type NewsRun } from "@betterbarmm/db";
import { ArrowSquareOutIcon, ArrowsClockwiseIcon, EyeIcon, EyeSlashIcon, NewspaperIcon } from "@phosphor-icons/react/ssr";
import { EmptyState, PageHeader, ago } from "../../_components/ui";
import { requireEditor } from "../../_lib/auth";
import { runNow, setHidden } from "./actions";

/* The news the site's Latest news page shows: when it was last read, what
   came in, and a way to keep an off-topic item off the public page. */

const SCHEDULE = "5am, 9am, 12nn, 3pm and 9pm, Manila time";

export default async function NewsPage() {
  const { supabase } = await requireEditor();
  const [{ data: runs }, { data: items, error }] = await Promise.all([
    supabase.from("news_runs").select("*").order("started_at", { ascending: false }).limit(10),
    supabase.from("news_items").select("*").order("published_at", { ascending: false, nullsFirst: false }).limit(200),
  ]);
  if (error) throw new Error(error.message);
  const last = (runs ?? [])[0] as NewsRun | undefined;

  return (
    <div>
      <PageHeader
        title="News"
        description={`Headlines about the Bangsamoro from ${NEWS_FEEDS.length} feeds, read ${SCHEDULE}. Only the headline, outlet, date, link and the outlet's own teaser are kept. Hide anything off-topic.`}
      />

      <section className="panel mb-6">
        <div className="panel-head">
          <span className="text-[13px] font-medium">
            {last ? `Last read ${ago(last.started_at)} · ${last.added} new of ${last.seen}${last.trigger === "manual" ? ` · run by ${last.by_email || "an editor"}` : " · on schedule"}` : "Not read yet"}
          </span>
          <form action={runNow}>
            <button className="btn btn-primary btn-sm">
              <ArrowsClockwiseIcon size={13} weight="bold" aria-hidden="true" /> Run now
            </button>
          </form>
        </div>
        {last?.errors.length ? (
          <p className="border-t border-[var(--rule)] px-[1.125rem] py-3 text-[13px] text-[var(--ink-3)]">
            {last.errors.length} feed{last.errors.length > 1 ? "s" : ""} could not be read: {last.errors.join(" · ")}
          </p>
        ) : null}
        {(runs ?? []).length > 1 ? (
          <ul className="border-t border-[var(--rule)] px-[1.125rem] py-3 text-[12.5px] text-[var(--ink-3)]">
            {(runs as NewsRun[]).slice(1).map((r) => (
              <li key={r.id} className="flex justify-between gap-4 py-0.5">
                <span>{ago(r.started_at)}{r.trigger === "manual" ? ` · ${r.by_email || "manual"}` : ""}</span>
                <span className="tabular-nums">{r.added} new{r.errors.length ? ` · ${r.errors.length} errors` : ""}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {(items ?? []).length ? (
        <div className="panel divide-y divide-[var(--rule)]">
          {(items as NewsItem[]).map((n) => (
            <article key={n.id} className={`flex items-start gap-4 px-[1.125rem] py-3.5 ${n.hidden ? "opacity-50" : ""}`}>
              <div className="min-w-0 flex-1">
                <a href={n.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1.5 text-[14.5px] font-medium leading-snug hover:text-[var(--accent)]">
                  {n.title}
                  <ArrowSquareOutIcon size={13} className="mt-1 shrink-0" aria-hidden="true" />
                </a>
                <p className="mt-1 text-xs text-[var(--ink-mute)]">
                  {n.source}
                  {n.published_at ? ` · ${ago(n.published_at)}` : ""}
                  {n.hidden ? " · hidden" : ""}
                </p>
              </div>
              <form action={setHidden.bind(null, n.id, !n.hidden)}>
                <button className="btn btn-secondary btn-sm" title={n.hidden ? "Show on the site" : "Hide from the site"}>
                  {n.hidden ? <EyeIcon size={13} aria-hidden="true" /> : <EyeSlashIcon size={13} aria-hidden="true" />}
                  {n.hidden ? "Show" : "Hide"}
                </button>
              </form>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel">
          <EmptyState icon={NewspaperIcon} title="No news yet">
            Press Run now, or wait for the next scheduled read.
          </EmptyState>
        </div>
      )}
    </div>
  );
}
