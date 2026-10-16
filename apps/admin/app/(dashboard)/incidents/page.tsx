import { ArrowSquareOutIcon, FlagIcon, MagnifyingGlassIcon, PencilSimpleIcon, PlusIcon, SirenIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import dataset from "../../../../../datasets/accidents/accidents.json";
import verify from "../../../../../datasets/accidents/enrichment/2026-10-16-zy-verify-2.json";
import { EmptyState, PageHeader, Pagination } from "../../_components/ui";
import { requireEditor } from "../../_lib/auth";

/* ============================================================
   Incident Watch: the map's records, as the site shows them

   Read from the published accidents.json, so what is listed here is what
   readers see. accidents.json is built, never edited: "Correct" starts a
   patch in the Corrections collection, keyed by the incident's id, and
   "Add incident" a report in Added by hand. The hourly publish writes them
   to the build's inputs and rebuilds the map.
   ============================================================ */

type Incident = {
  id: string;
  date: string;
  type: string;
  kind: string;
  title: string;
  summary: string;
  province: string;
  municipality: string | null;
  barangay: string | null;
  deaths: number | null;
  injured: number | null;
  missing: number | null;
  placed: "barangay" | "municipality" | "province";
  sources: { outlet: string; url: string }[];
};

const PAGE = 50;
const SITE = "https://betterbarmm.com/accidents";
const incidents = (dataset.incidents as Incident[]).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
// The records no automated reader could check against their articles (blocked or empty pages), as of the last pass.
const UNVERIFIED = new Set((verify as { id: string; verdict: string }[]).filter((p) => p.verdict === "unverified").map((p) => p.id));

const TABS = [
  ["all", "All"],
  ["check", "Needs checking"],
  ["edited", "Corrected"],
] as const;

const place = (a: Incident) => [a.barangay, a.municipality, a.province].filter(Boolean).join(", ");

/** A correction to start from: the fields an editor may change, at their current values. */
function correction(a: Incident) {
  const fields: Record<string, unknown> = { id: a.id, note: "", date: a.date, title: a.title, summary: a.summary, municipality: a.municipality ?? "", barangay: a.barangay ?? "" };
  for (const k of ["deaths", "injured", "missing"] as const) if (a[k] !== null) fields[k] = a[k];
  fields.drop = false;
  return fields;
}

/** A blank incident, in the shape the build reads from reports/. */
function blankIncident(ref: string) {
  return { ref, date: "", type: "shooting", title: "", summary: "", province: "", municipality: "", barangay: "", deaths: 0, injured: 0, missing: 0, vehicles: [], sources: [{ outlet: "", url: "", title: "", date: "" }] };
}

export default async function IncidentsPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; page?: string }> }) {
  const { supabase } = await requireEditor();
  const { tab: wanted, q = "", page = "1" } = await searchParams;
  const tab = TABS.some(([t]) => t === wanted) ? wanted! : "all";

  const [{ data: edits }, { count: added }, { count: openReports }] = await Promise.all([
    supabase.from("records").select("key").eq("workspace", "accidents").eq("collection", "edits"),
    supabase.from("records").select("key", { count: "exact", head: true }).eq("workspace", "accidents").eq("collection", "added"),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "new").ilike("page_url", "%/accidents%"),
  ]);
  const edited = new Set((edits ?? []).map((r) => r.key as string));
  const needsCheck = (a: Incident) => UNVERIFIED.has(a.id) || a.placed === "province";

  const term = q.trim().toLowerCase();
  const shown = incidents.filter(
    (a) =>
      (tab === "all" || (tab === "check" ? needsCheck(a) : edited.has(a.id))) &&
      (!term || `${a.id} ${a.title} ${place(a)} ${a.kind}`.toLowerCase().includes(term)),
  );
  const counts = { all: incidents.length, check: incidents.filter(needsCheck).length, edited: incidents.filter((a) => edited.has(a.id)).length };
  const pages = Math.max(1, Math.ceil(shown.length / PAGE));
  const current = Math.min(Math.max(1, Number(page) || 1), pages);
  const rows = shown.slice((current - 1) * PAGE, current * PAGE);
  const href = (params: Record<string, string>) => `/incidents?${new URLSearchParams({ ...(tab !== "all" ? { tab } : {}), ...(q ? { q } : {}), ...params })}`;

  // The next added incident's key: numbered after those already added, so it is unique without a clock or a dice roll.
  const newRef = `admin-${(added ?? 0) + 1}`;
  const addHref = `/data/accidents/added/edit?${new URLSearchParams({ newkey: newRef, init: JSON.stringify(blankIncident(newRef)) })}`;

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Incident Watch" }]}
        title="Incidents"
        description={
          <>
            {incidents.length} on the map, as last published. Corrections and added incidents go live at the next hourly publish, which rebuilds the map. Type is one of{" "}
            <code className="field-mono">road</code>, <code className="field-mono">sea</code>, <code className="field-mono">flood</code>, <code className="field-mono">fire</code>,{" "}
            <code className="field-mono">shooting</code> or <code className="field-mono">other</code>.
          </>
        }
        actions={
          <>
            {openReports ? (
              <Link href="/reports" className="btn btn-secondary">
                <FlagIcon size={15} aria-hidden="true" /> {openReports} open {openReports === 1 ? "report" : "reports"}
              </Link>
            ) : null}
            <Link href={addHref} className="btn btn-primary">
              <PlusIcon size={15} weight="bold" aria-hidden="true" /> Add incident
            </Link>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg bg-[var(--surface-2)] p-1">
          {TABS.map(([t, label]) => (
            <Link
              key={t}
              href={`/incidents?${new URLSearchParams({ ...(t !== "all" ? { tab: t } : {}), ...(q ? { q } : {}) })}`}
              aria-current={t === tab ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition ${t === tab ? "bg-[var(--surface)] text-[var(--ink)] shadow-[var(--shadow-sm)]" : "text-[var(--ink-3)] hover:text-[var(--ink)]"}`}
            >
              {label} <span className="tabular-nums text-[var(--ink-mute)]">{counts[t]}</span>
            </Link>
          ))}
        </div>
        <form className="flex items-center gap-2">
          {tab !== "all" ? <input type="hidden" name="tab" value={tab} /> : null}
          <div className="relative w-72">
            <MagnifyingGlassIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]" aria-hidden="true" />
            <input name="q" defaultValue={q} placeholder="Title, place or id" className="field !pl-9" />
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>
      </div>

      <div className="panel overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={SirenIcon} title={term ? "Nothing matches" : tab === "edited" ? "No corrections yet" : "Nothing needs checking"}>
            {term ? "Try another word, or part of the id." : null}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Incident</th>
                  <th className="text-right">Dead</th>
                  <th className="text-right">Hurt</th>
                  <th className="text-right" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => {
                  const fix = edited.has(a.id)
                    ? `/data/accidents/edits/edit?key=${encodeURIComponent(a.id)}`
                    : `/data/accidents/edits/edit?${new URLSearchParams({ newkey: a.id, init: JSON.stringify(correction(a)) })}`;
                  return (
                    <tr key={a.id}>
                      <td className="whitespace-nowrap align-top tabular-nums text-[var(--ink-3)]">{a.date}</td>
                      <td className="max-w-[40rem] align-top">
                        <p className="font-medium">{a.title}</p>
                        <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">
                          {a.kind} · {place(a)} · {a.sources.length} {a.sources.length === 1 ? "source" : "sources"}
                        </p>
                        <p className="mt-1.5 flex flex-wrap gap-1.5">
                          {UNVERIFIED.has(a.id) ? <span className="pill pill-warn">Unverified</span> : null}
                          {a.placed === "province" ? <span className="pill pill-warn">No town</span> : null}
                          {edited.has(a.id) ? <span className="pill pill-info">Corrected</span> : null}
                        </p>
                      </td>
                      <td className="align-top text-right tabular-nums">{a.deaths ?? "–"}</td>
                      <td className="align-top text-right tabular-nums">{a.injured ?? "–"}</td>
                      <td className="whitespace-nowrap align-top text-right">
                        <span className="inline-flex gap-1.5">
                          <a href={`${SITE}#${a.id}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" aria-label={`Open “${a.title}” on the site`}>
                            <ArrowSquareOutIcon size={14} aria-hidden="true" />
                          </a>
                          <Link href={fix} className="btn btn-secondary btn-sm">
                            <PencilSimpleIcon size={14} aria-hidden="true" /> {edited.has(a.id) ? "Edit correction" : "Correct"}
                          </Link>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={current} pages={pages} href={(n) => href({ page: String(n) })} />
    </div>
  );
}
