import type { Metadata } from "next";
import { statSync } from "node:fs";
import { join } from "node:path";
import { ConfidenceBadge } from "../_components/confidence-badge";
import { ElectionPageHeader } from "../_components/election-page-header";
import { ElectionShell } from "../_components/election-shell";
import { Reveal } from "../_components/reveal";
import { SectionNav } from "../_components/section-nav";
import { SourceEntry } from "../_components/source-entry";
import {
  type Confidence,
  confidenceMeta,
  getElectionViewModel,
  getSourcesViewModel,
  labelize,
} from "../_lib/election-data";

export const metadata: Metadata = {
  title: "About, sources & data — BetterBARMM Election",
  description:
    "How the 2026 BARMM election workspace is built: methodology, the confidence model, background context, the full source registry, and downloadable raw data.",
};

const datasetRoot = join(process.cwd(), "..", "..", "datasets", "election");

const dataFiles = [
  {
    file: "election.min.json",
    label: "Election workspace",
    detail: "Parties, candidates, districts, timeline, and source registry.",
  },
  {
    file: "barmm_2026_developing_stories.json",
    label: "Developing stories",
    detail: "The moving story lines feeding the homepage timeline.",
  },
  {
    file: "election-supplement.json",
    label: "Background supplement",
    detail: "Researched, individually sourced secondary context.",
  },
];

function formatBytes(bytes: number) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} KB`;
  return `${bytes} B`;
}

function fileSize(file: string) {
  try {
    return statSync(join(datasetRoot, file)).size;
  } catch {
    return 0;
  }
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Reveal className="max-w-4xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold leading-none tracking-[-0.035em] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-snug text-[var(--ink-2)] sm:text-lg sm:leading-8">
        {description}
      </p>
    </Reveal>
  );
}

export default function AboutPage() {
  const {
    dataQuality,
    stats,
    keyFigures,
    contextFacts,
    supplementStatistics,
    otherDistrictParties,
  } = getElectionViewModel();
  const { groups, ungrouped, supplementSources } = getSourcesViewModel();

  const coverage = [
    { label: "Regional parties", value: stats.regionalParties, detail: "Official party entries." },
    { label: "Sectoral candidates", value: stats.sectoralCandidates, detail: "Grouped by reserved sector." },
    { label: "District COC filers", value: stats.districtCocFilers, detail: "Working district coverage." },
    { label: "Timeline events", value: stats.timelineEvents, detail: "Legal milestones and dates." },
  ];

  const methodology = [
    { label: "Official first", title: "Use controlling records where available.", description: "COMELEC records are the controlling source for official party ballot entries and regional sectoral candidates when the dataset includes them." },
    { label: "Separate tracks", title: "Do not mix the three seat paths.", description: "Party-representative entries, district candidates, and sectoral candidates are kept in separate structures because voters evaluate them differently." },
    { label: "Working status", title: "Flag records that still need verification.", description: "District COC filers are kept as working records until official district certified lists and later substitutions or withdrawals are checked." },
    { label: "Legacy care", title: "Keep old nominee lists out of current results.", description: "Legacy 2025 party nominee lists are preserved only as reference data. They are not presented as final 2026 nominee lists." },
  ];

  const confidenceOrder: Confidence[] = ["official", "working", "legacy", "reference"];

  return (
    <ElectionShell activeItem="about">
      <ElectionPageHeader
        title="How this is built and sourced."
        description="A civic reference for the 2026 BARMM Parliamentary Elections. Everything here is generated from a small set of sourced JSON files — this page covers the background, the method, the sources, and the raw data."
      />

      <SectionNav
        items={[
          { id: "background", label: "Background" },
          { id: "methodology", label: "Methodology" },
          { id: "sources", label: `Sources · ${stats.sources}` },
          { id: "data", label: "Data" },
        ]}
      />

      {/* Background */}
      <section id="background" className="scroll-mt-32 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <SectionIntro
            eyebrow="Coverage & context"
            title="The region beyond the ballot."
            description="Coverage counts from the official workspace, plus background figures gathered from public reporting. Background items are secondary references, individually sourced, and never override official records."
          />
          <div className="mt-12 grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-4">
            {coverage.map((item) => (
              <article key={item.label} className="bg-[var(--paper)] p-6">
                <p className="eyebrow text-[9px]">{item.label}</p>
                <p className="num mt-3 text-4xl font-extrabold leading-none tracking-[-0.03em]">
                  {item.value}
                </p>
                <p className="mt-3 text-sm leading-snug text-[var(--ink-2)]">{item.detail}</p>
              </article>
            ))}
          </div>

          {supplementStatistics.length > 0 ? (
            <div className="mt-12">
              <div className="flex flex-wrap items-center gap-3">
                <p className="eyebrow">The region in numbers</p>
                <ConfidenceBadge confidence="reference" />
              </div>
              <div className="mt-6 grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2">
                {supplementStatistics.map((stat) => (
                  <article key={stat.label} className="bg-[var(--paper)] p-6">
                    <p className="eyebrow text-[9px]">{stat.label}</p>
                    <p className="num mt-3 text-2xl font-extrabold leading-tight tracking-[-0.02em]">
                      {stat.value}
                    </p>
                    {stat.source_url ? (
                      <a
                        href={stat.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)] underline decoration-[var(--rule)] underline-offset-2 hover:text-[var(--accent)]"
                      >
                        Source{stat.as_of ? ` · ${stat.as_of}` : ""}
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {keyFigures.length > 0 ? (
            <div className="mt-12">
              <div className="flex flex-wrap items-center gap-3">
                <p className="eyebrow">Key figures</p>
                <ConfidenceBadge confidence="reference" />
              </div>
              <div className="mt-6 grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-3">
                {keyFigures.map((figure) => (
                  <article key={figure.name} className="bg-[var(--paper)] p-6">
                    <h3 className="text-lg font-extrabold leading-tight tracking-[-0.025em]">
                      {figure.name}
                    </h3>
                    <p className="mt-1 font-mono text-[10px] font-bold uppercase leading-snug tracking-[0.12em] text-[var(--accent)]">
                      {figure.role}
                    </p>
                    {figure.note ? (
                      <p className="mt-3 text-sm leading-snug text-[var(--ink-2)]">{figure.note}</p>
                    ) : null}
                    {figure.source_url ? (
                      <a
                        href={figure.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)] underline decoration-[var(--rule)] underline-offset-2 hover:text-[var(--accent)]"
                      >
                        Source
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {contextFacts.length > 0 ? (
            <div className="mt-12">
              <div className="flex flex-wrap items-center gap-3">
                <p className="eyebrow">The story in brief</p>
                <ConfidenceBadge confidence="reference" />
              </div>
              <div className="mt-6 border-t border-[var(--ink)]">
                {contextFacts.map((fact) => (
                  <article
                    key={fact.topic}
                    className="grid gap-3 border-b border-[var(--rule)] py-6 sm:grid-cols-[14rem_1fr] sm:gap-10"
                  >
                    <p className="font-mono text-[11px] font-bold uppercase leading-snug tracking-[0.12em] text-[var(--accent)]">
                      {fact.topic}
                    </p>
                    <div>
                      <p className="text-sm leading-snug text-[var(--ink-2)] sm:text-base">{fact.fact}</p>
                      {fact.source_url ? (
                        <a
                          href={fact.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)] underline decoration-[var(--rule)] underline-offset-2 hover:text-[var(--accent)]"
                        >
                          Source{fact.source_date ? ` · ${fact.source_date}` : ""}
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Methodology + confidence + quality */}
      <section
        id="methodology"
        className="scroll-mt-32 border-t border-[var(--ink)] bg-[var(--paper-2)] py-14 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <SectionIntro
            eyebrow="Methodology"
            title="How records are selected and labeled."
            description="Prefer official election records, keep source confidence visible, and separate official candidate lists from working or legacy reference data."
          />
          <div className="mt-10 grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-4">
            {methodology.map((item) => (
              <article key={item.label} className="bg-[var(--paper)] p-6">
                <p className="eyebrow text-[9px]">{item.label}</p>
                <h3 className="mt-3 text-xl font-extrabold leading-tight tracking-[-0.03em]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-snug text-[var(--ink-2)]">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-12">
            <p className="eyebrow">Confidence model</p>
            <h3 className="mt-3 text-2xl font-extrabold leading-none tracking-[-0.03em] sm:text-3xl">
              How to read the badges.
            </h3>
            <div className="mt-6 grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-4">
              {confidenceOrder.map((key) => (
                <div key={key} className="bg-[var(--paper)] p-6">
                  <ConfidenceBadge confidence={key} />
                  <p className="mt-3 text-sm leading-snug text-[var(--ink-2)]">
                    {confidenceMeta[key].note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <p className="eyebrow">Quality notes</p>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3">
              {dataQuality.map(([key, value]) => (
                <article
                  key={key}
                  className="border border-[var(--rule)] bg-[var(--paper)] p-5 md:-ml-px md:-mt-px"
                >
                  <p className="eyebrow text-[9px]">{labelize(key)}</p>
                  <p className="mt-3 text-sm leading-snug text-[var(--ink-2)]">{value}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section
        id="sources"
        className="scroll-mt-32 border-t border-[var(--ink)] py-14 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <SectionIntro
            eyebrow="Source registry"
            title="The source list is part of the product."
            description={`Every record traces back to one of these ${stats.sources} sources. Official COMELEC records and statutes are the controlling references; reporting and background carry a reliability rating.`}
          />
          {groups.map((group) => (
            <div key={group.id} className="mt-12">
              <h3 className="text-xl font-extrabold leading-tight tracking-[-0.03em] sm:text-2xl">
                {group.label}
              </h3>
              <div className="mt-2 border-b border-[var(--ink)]">
                {group.sources.map((source) => (
                  <SourceEntry key={source.id} source={source} />
                ))}
              </div>
            </div>
          ))}
          {ungrouped.length > 0 ? (
            <div className="mt-12">
              <h3 className="text-xl font-extrabold leading-tight tracking-[-0.03em] sm:text-2xl">
                Other sources
              </h3>
              <div className="mt-2 border-b border-[var(--ink)]">
                {ungrouped.map((source) => (
                  <SourceEntry key={source.id} source={source} />
                ))}
              </div>
            </div>
          ) : null}
          {supplementSources.length > 0 ? (
            <div className="mt-12">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-extrabold leading-tight tracking-[-0.03em] sm:text-2xl">
                  Background references
                </h3>
                <span className="inline-block bg-[var(--slate)] px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-white">
                  Secondary
                </span>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-snug text-[var(--ink-2)]">
                Additional context gathered from public reporting. Used only for
                background, never to override official records.
              </p>
              <div className="mt-2 border-b border-[var(--ink)]">
                {supplementSources.map((source) => (
                  <SourceEntry key={source.id} source={source} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Data & downloads */}
      <section
        id="data"
        className="scroll-mt-32 border-t border-[var(--ink)] bg-[var(--paper-2)] py-14 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <SectionIntro
            eyebrow="Data & downloads"
            title="The dataset is open."
            description="Everything on this site is generated from these JSON files. Download them, inspect the records, and check each one against its source."
          />
          <div className="mt-10 border-t border-[var(--ink)]">
            {dataFiles.map((item) => (
              <a
                key={item.file}
                href={`/data/download?file=${encodeURIComponent(item.file)}`}
                className="grid gap-2 border-b border-[var(--rule)] py-6 transition hover:bg-[var(--paper)] sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <h3 className="text-lg font-extrabold leading-tight tracking-[-0.02em]">
                    {item.label}
                  </h3>
                  <p className="mt-1 text-sm leading-snug text-[var(--ink-2)]">{item.detail}</p>
                  <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">
                    {item.file} · {formatBytes(fileSize(item.file))}
                  </p>
                </div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                  Download ↓
                </p>
              </a>
            ))}
          </div>

          {otherDistrictParties.length > 0 ? (
            <div className="mt-12">
              <p className="eyebrow">Other district labels</p>
              <p className="mt-3 max-w-3xl text-sm leading-snug text-[var(--ink-2)]">
                District candidates sometimes report a party label that is not one
                of the 13 regional ballot entries — often an independent run or a
                component of the BGC alliance.
              </p>
              <div className="mt-6 grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2">
                {otherDistrictParties.map((party) => (
                  <div key={party.label} className="bg-[var(--paper)] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-extrabold leading-tight tracking-[-0.02em]">
                        {party.label}
                      </h3>
                      {party.normalized_id ? (
                        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
                          {party.normalized_id}
                        </p>
                      ) : null}
                    </div>
                    {party.note ? (
                      <p className="mt-2 text-sm leading-snug text-[var(--ink-2)]">{party.note}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </ElectionShell>
  );
}
