"use client";

import { useMemo, useState } from "react";
import { type Confidence } from "../_lib/confidence";
import { ConfidenceBadge } from "./confidence-badge";
import { PersonAvatar } from "./marks";

export type CandidateRow = {
  id: string;
  name: string;
  track: "district" | "sectoral";
  group: string; // area (district) or sector (sectoral)
  district?: string;
  partyId?: string | null;
  partyLabel: string;
  confidence: Confidence;
};

type Option = { value: string; label: string };

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field field-select cursor-pointer appearance-none"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {/* The registry's own caret, drawn rather than typed. The ▼ this
          replaces is a text glyph: it lands at a different size and weight in
          every font a browser might fall back to, and on several platforms it
          arrives as a colour emoji. */}
      <svg
        className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--ink-mute)]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </label>
  );
}

function CandidateRowItem({ row }: { row: CandidateRow }) {
  const rowClass =
    "flex items-center gap-3.5 border-b border-[var(--rule-soft)] py-3 last:border-b-0";

  // The face is the row's anchor. Where there is no portrait on file the plate
  // takes its place at the same size, so the column of names stays a column
  // rather than ragging in and out as photographs come and go.
  const content = (
    <>
      <PersonAvatar name={row.name} partyId={row.partyId} size={40} />

      <div className="min-w-0 flex-1">
        {/* No district chip: every row now sits under the district it filed
            in, and repeating it on the name was the label twice. */}
        <h3 className="item-title item-title-strong break-words transition-colors group-hover:text-[var(--accent)]">
          {row.name}
        </h3>
        <p className="mt-1 break-words font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">
          {row.partyLabel}
        </p>
      </div>

      {row.partyId ? (
        <span
          aria-hidden="true"
          className="shrink-0 font-mono text-sm text-[var(--ink-3)] transition duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
        >
          →
        </span>
      ) : null}
    </>
  );

  if (row.partyId) {
    return (
      <a
        href={`/parties/${row.partyId}`}
        className={`group ${rowClass} transition-colors hover:bg-[var(--paper-2)]`}
      >
        {content}
      </a>
    );
  }

  return <div className={rowClass}>{content}</div>;
}

export function CandidateBrowser({ rows }: { rows: CandidateRow[] }) {
  const [track, setTrack] = useState("");
  const [group, setGroup] = useState("");
  const [party, setParty] = useState("");
  const [query, setQuery] = useState("");

  const areaOptions = useMemo(
    () =>
      Array.from(
        new Set(rows.filter((r) => r.track === "district").map((r) => r.group)),
      )
        .sort()
        .map((value) => ({ value, label: value })),
    [rows],
  );
  const sectorOptions = useMemo(
    () =>
      Array.from(
        new Set(rows.filter((r) => r.track === "sectoral").map((r) => r.group)),
      )
        .sort()
        .map((value) => ({ value, label: value })),
    [rows],
  );
  const partyOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.partyId).filter(Boolean) as string[]))
        .sort()
        .map((value) => ({ value, label: value })),
    [rows],
  );

  const groupOptions =
    track === "sectoral"
      ? sectorOptions
      : track === "district"
        ? areaOptions
        : [...sectorOptions, ...areaOptions];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (track && row.track !== track) return false;
      if (group && row.group !== group) return false;
      if (party && row.partyId !== party) return false;
      if (q) {
        const haystack =
          `${row.name} ${row.partyLabel} ${row.group} ${row.district ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [rows, track, group, party, query]);

  // Sectors group as they always did. District filers group by the district
  // they filed in, not by the province: a province is an administrative label,
  // a district is the actual contest — one seat, and the two to six people
  // running for it. Grouped by province, "Lanao del Sur · 36" told a reader
  // nothing about which of the nine races any of those names was in.
  const sectoralSections = useMemo(() => {
    const map = new Map<string, CandidateRow[]>();
    for (const row of filtered) {
      if (row.track !== "sectoral") continue;
      map.set(row.group, [...(map.get(row.group) ?? []), row]);
    }
    return Array.from(map.entries())
      .map(([sector, sectorRows]) => ({ sector, rows: sectorRows }))
      .sort((a, b) => a.sector.localeCompare(b.sector));
  }, [filtered]);

  const districtAreas = useMemo(() => {
    const areas = new Map<string, Map<string, CandidateRow[]>>();
    for (const row of filtered) {
      if (row.track !== "district") continue;
      const districts = areas.get(row.group) ?? new Map<string, CandidateRow[]>();
      const key = row.district ?? "District not reported";
      districts.set(key, [...(districts.get(key) ?? []), row]);
      areas.set(row.group, districts);
    }
    return Array.from(areas.entries())
      .map(([area, districts]) => ({
        area,
        count: Array.from(districts.values()).reduce((sum, list) => sum + list.length, 0),
        districts: Array.from(districts.entries())
          .map(([district, districtRows]) => ({ district, rows: districtRows }))
          // "1st" through "9th", then "District I" and "District II" — a plain
          // string sort puts the 10th before the 2nd, so the leading number is
          // what gets compared where there is one.
          .sort((a, b) => {
            const numberOf = (value: string) => Number(value.match(/\d+/)?.[0] ?? Number.NaN);
            const left = numberOf(a.district);
            const right = numberOf(b.district);
            if (!Number.isNaN(left) && !Number.isNaN(right)) return left - right;
            return a.district.localeCompare(b.district);
          }),
      }))
      .sort((a, b) => a.area.localeCompare(b.area));
  }, [filtered]);

  const districtCount = filtered.filter((r) => r.track === "district").length;
  const sectoralCount = filtered.filter((r) => r.track === "sectoral").length;
  const hasFilters = Boolean(track || group || party || query);

  return (
    <div>
      {/* Hairlines rather than a filled panel, and the estate's own controls
          inside them. This bar was built to itself — a tinted box, fields
          outlined in full ink, a typed caret — while the registry next door
          uses one field primitive for every search and select on the site. The
          two workspaces are one site and a reader crosses between them. */}
      <div className="grid gap-3 border-y border-[var(--brass-line)] py-5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <label className="relative block">
          <span className="sr-only">Search candidates</span>
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--ink-mute)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a name, party, or district…"
            className="field field-search"
          />
        </label>
        <Select
          label="All tracks"
          value={track}
          options={[
            { value: "district", label: "District" },
            { value: "sectoral", label: "Sectoral" },
          ]}
          onChange={(value) => {
            setTrack(value);
            setGroup("");
          }}
        />
        <Select
          label={track === "sectoral" ? "All sectors" : "All areas"}
          value={group}
          options={groupOptions}
          onChange={setGroup}
        />
        <Select
          label="All parties"
          value={party}
          options={partyOptions}
          onChange={setParty}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <p className="meta-sm">
          <span className="num text-[var(--ink)]">{filtered.length}</span> of {rows.length}
          <span className="text-[var(--ink-mute)]">
            {" · "}
            {sectoralCount} sectoral · {districtCount} district
          </span>
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setTrack("");
              setGroup("");
              setParty("");
              setQuery("");
            }}
            className="label text-[var(--accent)] transition-colors hover:text-[var(--accent-deep)]"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 border-t border-[var(--ink)] py-12 text-center text-sm text-[var(--ink-3)]">
          No candidates match these filters.
        </p>
      ) : (
        <div className="mt-6">
          {sectoralSections.length > 0 ? (
            <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
              {sectoralSections.map((section) => (
                <div key={`sector-${section.sector}`}>
                  <div className="flex items-center justify-between gap-3 border-b border-[var(--ink)] pb-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <h3 className="item-title item-title-strong truncate">{section.sector}</h3>
                      <ConfidenceBadge confidence={section.rows[0].confidence} />
                    </div>
                    <p className="num shrink-0 font-mono text-xs font-bold text-[var(--ink-3)]">
                      {section.rows.length}
                    </p>
                  </div>
                  <div className="mt-1">
                    {section.rows.map((row) => (
                      <CandidateRowItem key={row.id} row={row} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {districtAreas.map((area, index) => (
            <div
              key={`area-${area.area}`}
              className={index === 0 && sectoralSections.length === 0 ? "" : "mt-14"}
            >
              {/* The province is a heading over its own races rather than a
                  container for a hundred names. */}
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[var(--ink)] pb-2">
                <h3 className="item-title item-title-lg item-title-strong text-[var(--ink)]">
                  {area.area}
                </h3>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  {area.districts.length} {area.districts.length === 1 ? "district" : "districts"} ·{" "}
                  {area.count} filed
                </p>
              </div>

              <div className="mt-6 grid gap-x-10 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
                {area.districts.map((district) => (
                  <div key={`${area.area}-${district.district}`}>
                    <div className="flex items-baseline justify-between gap-3 border-b border-[var(--brass-line)] pb-2">
                      <h4 className="truncate font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]">
                        {district.district}
                      </h4>
                      {/* Every district returns one member, so the count is the
                          size of the contest for that seat. */}
                      <p className="num shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">
                        {district.rows.length} for 1 seat
                      </p>
                    </div>
                    <div className="mt-1">
                      {district.rows.map((row) => (
                        <CandidateRowItem key={row.id} row={row} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
