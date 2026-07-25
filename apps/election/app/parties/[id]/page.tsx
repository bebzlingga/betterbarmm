import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfidenceBadge } from "../../_components/confidence-badge";
import { ElectionShell } from "../../_components/election-shell";
import {
  dominantStatusLabel,
  formatDate,
  getPartyById,
  getPartyIds,
  getSourcesViewModel,
  groupDistrictCandidates,
  type Source,
} from "../../_lib/election-data";

export function generateStaticParams() {
  return getPartyIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const party = getPartyById(id);
  if (!party) return { title: "Party not found — BetterBARMM Election" };
  return {
    title: `${party.ballot_name} — BetterBARMM Election`,
    description: party.description ?? party.full_name,
  };
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-l border-[var(--rule)] px-4 py-5 sm:px-6">
      <p className="eyebrow text-[9px]">{label}</p>
      <p className="num mt-3 text-4xl font-extrabold leading-none tracking-[-0.03em]">
        {value}
      </p>
    </div>
  );
}

export default async function PartyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const party = getPartyById(id);

  if (!party) {
    notFound();
  }

  const { sources } = getSourcesViewModel();
  const sourceById = new Map<string, Source>(sources.map((s) => [s.id, s]));
  const referencedSources = (party.source_ids ?? [])
    .map((sourceId) => sourceById.get(sourceId))
    .filter((source): source is Source => Boolean(source));

  const districtGroups = groupDistrictCandidates(party.district);
  const nominees2026 = party.party_representative_nominees_2026;
  const legacy = party.legacy_party_representative_nominees_2025_reference;

  return (
    <ElectionShell activeItem="ballot">
      <section className="border-b border-[var(--ink)] py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <a
            href="/ballot#parties"
            className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-3)] transition hover:text-[var(--accent)]"
          >
            ← All parties
          </a>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
              {party.party_id}
            </p>
            <ConfidenceBadge confidence={party.confidence} />
            {party.dominantStatus ? (
              <span className="bg-[var(--accent)] px-2 py-1 font-mono text-[9px] font-bold uppercase leading-none tracking-[0.12em] text-white">
                {dominantStatusLabel[party.dominantStatus]}
              </span>
            ) : null}
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
              {party.bloc}
            </span>
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl md:text-7xl">
            {party.ballot_name}
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-snug text-[var(--ink)] sm:text-xl">
            {party.full_name}
          </p>
          {party.cmNominee ? (
            <p className="mt-4 inline-flex items-center gap-2 border border-[var(--rule)] px-3 py-2 text-sm">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                Chief-minister nominee
              </span>
              <span className="font-bold text-[var(--ink)]">{party.cmNominee}</span>
            </p>
          ) : null}
          {party.description ? (
            <p className="mt-6 max-w-3xl text-base leading-snug text-[var(--ink-2)] sm:text-lg sm:leading-8">
              {party.description}
            </p>
          ) : null}
          {party.aliases && party.aliases.length > 0 ? (
            <p className="mt-4 font-mono text-[10px] font-semibold uppercase leading-5 tracking-[0.14em] text-[var(--ink-3)]">
              Also known as: {party.aliases.join(" · ")}
            </p>
          ) : null}
        </div>
      </section>

      <section className="border-b border-[var(--ink)]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-2 sm:px-4 lg:grid-cols-4">
          <Metric
            label="Seats vying for"
            value={party.party_representative_seats_vying_for ?? 0}
          />
          <Metric
            label="Sectoral links"
            value={party.computedStats.sectoralCandidates}
          />
          <Metric
            label="District filers"
            value={party.computedStats.districtCocFilers}
          />
          <Metric label="Legacy nominees" value={party.computedStats.legacyNominees} />
        </div>
      </section>

      {party.background ? (
        <section className="border-b border-[var(--ink)] bg-[var(--paper-2)] py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="flex items-center gap-3">
              <p className="eyebrow">Background</p>
              <ConfidenceBadge confidence="reference" />
            </div>
            <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
              <div>
                <p className="max-w-3xl text-base leading-snug text-[var(--ink-2)] sm:text-lg sm:leading-8">
                  {party.background.background}
                </p>
                {party.background.source_url ? (
                  <p className="mt-6 break-words text-xs leading-snug text-[var(--ink-3)]">
                    Source:{" "}
                    <a
                      href={party.background.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rule-link"
                    >
                      {party.background.source_url}
                    </a>
                    {party.background.source_date
                      ? ` · ${formatDate(party.background.source_date)}`
                      : ""}
                  </p>
                ) : null}
              </div>
              {party.background.affiliation ||
              (party.background.leaders &&
                party.background.leaders.length > 0) ? (
                <div className="flex flex-col gap-6 border-t border-[var(--rule)] pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                  {party.background.affiliation ? (
                    <div>
                      <p className="eyebrow text-[9px]">Affiliation</p>
                      <p className="mt-2 text-sm leading-snug text-[var(--ink-2)]">
                        {party.background.affiliation}
                      </p>
                    </div>
                  ) : null}
                  {party.background.leaders &&
                  party.background.leaders.length > 0 ? (
                    <div>
                      <p className="eyebrow text-[9px]">Reported figures</p>
                      <ul className="mt-3 space-y-2.5">
                        {party.background.leaders.map((leader) => (
                          <li
                            key={leader}
                            className="flex gap-3 text-sm leading-snug text-[var(--ink-2)]"
                          >
                            <span className="mt-1.5 h-1 w-3 shrink-0 bg-[var(--accent)]" />
                            <span className="min-w-0 break-words">{leader}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-b border-[var(--ink)] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <p className="eyebrow">Party-representative nominees</p>
          <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-[-0.03em] sm:text-4xl">
            Who fills the seats this party wins.
          </h2>
          <div className="mt-8 grid gap-px border border-[var(--rule)] bg-[var(--rule)] md:grid-cols-2">
            <div className="bg-[var(--paper)] p-6">
              <div className="flex items-center gap-2">
                <p className="eyebrow text-[9px]">2026 nominees</p>
                <ConfidenceBadge confidence="working" />
              </div>
              <p className="mt-4 text-sm leading-snug text-[var(--ink-2)]">
                {nominees2026?.note ??
                  "Official 2026 List of Nominees not yet imported into this workspace."}
              </p>
            </div>
            <div className="bg-[var(--paper)] p-6">
              <div className="flex items-center gap-2">
                <p className="eyebrow text-[9px]">2025 legacy reference</p>
                <ConfidenceBadge confidence="legacy" />
              </div>
              <p className="mt-4 text-sm leading-snug text-[var(--ink-2)]">
                {legacy?.warning ??
                  "No legacy 2025 nominee list is attached to this party."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {party.sectoral.length > 0 ? (
        <section className="border-b border-[var(--ink)] bg-[var(--paper-2)] py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <p className="eyebrow">Linked sectoral candidates</p>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-[-0.03em] sm:text-4xl">
              {party.sectoral.length} sectoral candidate
              {party.sectoral.length === 1 ? "" : "s"} tied to this party.
            </h2>
            <div className="mt-8 grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-3">
              {party.sectoral.map((candidate) => (
                <div
                  key={`${candidate.sector}-${candidate.rank_or_number}-${candidate.full_name}`}
                  className="bg-[var(--paper)] p-5"
                >
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                    {candidate.sector}
                  </p>
                  <h3 className="mt-2 text-lg font-extrabold leading-tight tracking-[-0.02em]">
                    {candidate.full_name}
                  </h3>
                  <p className="mt-2 text-sm leading-snug text-[var(--ink-2)]">
                    {candidate.organization_or_party}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {party.district.length > 0 ? (
        <section className="border-b border-[var(--ink)] py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="flex items-center gap-3">
              <p className="eyebrow">Linked district COC filers</p>
              <ConfidenceBadge confidence="working" />
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-[-0.03em] sm:text-4xl">
              {party.district.length} district filer
              {party.district.length === 1 ? "" : "s"} reported under this party.
            </h2>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {districtGroups.map((group) => (
                <article
                  key={group.area}
                  className="flex flex-col border border-[var(--rule)] bg-[var(--paper)]"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-[var(--ink)] bg-[var(--paper-2)] px-5 py-3">
                    <p className="eyebrow text-[9px]">{group.area}</p>
                    <p className="num shrink-0 font-mono text-[10px] font-bold text-[var(--ink-3)]">
                      {group.candidates.length}
                    </p>
                  </div>
                  <div>
                    {group.candidates.map((candidate) => (
                      <div
                        key={candidate.candidate_id}
                        className="border-b border-[var(--rule-soft)] px-5 py-4 transition-colors last:border-b-0 hover:bg-[var(--paper-2)]"
                      >
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <h3 className="break-words text-base font-bold leading-tight">
                            {candidate.name_as_reported}
                          </h3>
                          {candidate.district ? (
                            <span className="shrink-0 bg-[var(--accent)] px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase leading-none tracking-[0.12em] text-white">
                              {candidate.district}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 break-words text-xs leading-snug text-[var(--ink-3)]">
                          {candidate.party_label_as_reported ??
                            "Party not reported"}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <p className="eyebrow">Sources for this party</p>
          <div className="mt-6 border-t border-[var(--rule)]">
            {referencedSources.length > 0 ? (
              referencedSources.map((source) => (
                <a
                  key={source.id}
                  href={`/about#${source.id}`}
                  className="grid gap-x-4 gap-y-1 border-b border-[var(--rule)] py-5 transition hover:bg-[var(--paper-2)] sm:grid-cols-[13rem_1fr]"
                >
                  <p className="min-w-0 break-words font-mono text-[10px] font-bold uppercase leading-5 tracking-[0.14em] text-[var(--ink-3)]">
                    {source.id}
                  </p>
                  <p className="min-w-0 break-words text-sm font-bold leading-snug">
                    {source.title}
                  </p>
                </a>
              ))
            ) : (
              <p className="py-5 text-sm text-[var(--ink-3)]">
                No sources are attached to this party record.
              </p>
            )}
          </div>
        </div>
      </section>
    </ElectionShell>
  );
}
