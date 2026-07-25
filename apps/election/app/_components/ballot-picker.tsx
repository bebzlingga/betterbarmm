"use client";

import { useMemo, useState } from "react";
import { type Confidence } from "../_lib/confidence";
import { ConfidenceBadge } from "./confidence-badge";

export type BallotDistrictCandidate = {
  id: string;
  name: string;
  partyId?: string | null;
  partyLabel: string;
  confidence: Confidence;
};

export type BallotArea = {
  area: string;
  seats: number;
  districts: Array<{
    district: string;
    candidates: BallotDistrictCandidate[];
  }>;
};

export type BallotParty = {
  party_id: string;
  ballot_name: string;
  full_name: string;
};

export type BallotSector = {
  sector: string;
  seats: number;
  candidates: Array<{
    name: string;
    organization?: string;
    partyId?: string | null;
  }>;
};

function TrackHeading({
  step,
  seats,
  title,
  scope,
}: {
  step: string;
  seats: number | string;
  title: string;
  scope: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-[var(--ink)] pb-4">
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
          {step} · {scope}
        </p>
        <h3 className="mt-2 text-2xl font-extrabold leading-none tracking-[-0.03em] sm:text-3xl">
          {title}
        </h3>
      </div>
      <p className="num shrink-0 text-4xl font-extrabold leading-none tracking-[-0.04em] sm:text-5xl">
        {seats}
      </p>
    </div>
  );
}

export function BallotPicker({
  areas,
  parties,
  sectors,
}: {
  areas: BallotArea[];
  parties: BallotParty[];
  sectors: BallotSector[];
}) {
  const [areaName, setAreaName] = useState("");
  const [districtName, setDistrictName] = useState("");

  const area = useMemo(
    () => areas.find((a) => a.area === areaName),
    [areas, areaName],
  );
  const district = useMemo(
    () => area?.districts.find((d) => d.district === districtName),
    [area, districtName],
  );

  const sectoralSeats = sectors.reduce((sum, s) => sum + s.seats, 0);

  return (
    <div>
      <div className="grid gap-3 border border-[var(--ink)] bg-[var(--paper-2)] p-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">
            1. Choose your area
          </span>
          <select
            value={areaName}
            onChange={(event) => {
              setAreaName(event.target.value);
              setDistrictName("");
            }}
            className="h-12 w-full appearance-none border border-[var(--ink)] bg-[var(--paper)] px-3 text-sm font-bold text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          >
            <option value="">Select area…</option>
            {areas.map((a) => (
              <option key={a.area} value={a.area}>
                {a.area}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">
            2. Choose your district
          </span>
          <select
            value={districtName}
            disabled={!area}
            onChange={(event) => setDistrictName(event.target.value)}
            className="h-12 w-full appearance-none border border-[var(--ink)] bg-[var(--paper)] px-3 text-sm font-bold text-[var(--ink)] outline-none focus:border-[var(--accent)] disabled:opacity-40"
          >
            <option value="">
              {area ? "Select district…" : "Pick an area first"}
            </option>
            {area?.districts.map((d) => (
              <option key={d.district} value={d.district}>
                {d.district}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!district ? (
        <p className="mt-8 border border-dashed border-[var(--rule)] p-10 text-center text-sm text-[var(--ink-3)]">
          Choose your area and district above to assemble the three ballot
          tracks you will vote on.
        </p>
      ) : (
        <div className="mt-10 space-y-14">
          <div>
            <TrackHeading
              step="Track 1"
              scope="Region-wide"
              title="Party-representative vote"
              seats={40}
            />
            <p className="mt-4 text-sm leading-snug text-[var(--ink-2)]">
              Every BARMM voter chooses one of these 13 regional parties. The
              party vote is the same across the region and decides how the 40
              party-representative seats are shared.
            </p>
            <div className="mt-6 grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-3">
              {parties.map((party) => (
                <a
                  key={party.party_id}
                  href={`/parties/${party.party_id}`}
                  className="bg-[var(--paper)] p-4 transition hover:bg-[var(--paper-2)]"
                >
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                    {party.party_id}
                  </p>
                  <p className="mt-1 text-sm font-bold leading-tight">
                    {party.ballot_name}
                  </p>
                </a>
              ))}
            </div>
          </div>

          <div>
            <TrackHeading
              step="Track 2"
              scope={`${area?.area} · ${district.district}`}
              title="Your district race"
              seats={district.candidates.length}
            />
            <div className="mt-4 flex items-center gap-2">
              <ConfidenceBadge confidence="working" />
              <p className="text-sm text-[var(--ink-2)]">
                Working COC-filer list — verify against the official district
                certified list before Election Day.
              </p>
            </div>
            {district.candidates.length === 0 ? (
              <p className="mt-6 text-sm text-[var(--ink-3)]">
                No district COC filers are recorded yet for this district.
              </p>
            ) : (
              <div className="mt-6 border-t border-[var(--rule)]">
                {district.candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between gap-4 border-b border-[var(--rule)] py-4"
                  >
                    <p className="text-base font-bold leading-tight">
                      {candidate.name}
                    </p>
                    {candidate.partyId ? (
                      <a
                        href={`/parties/${candidate.partyId}`}
                        className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink)] hover:text-[var(--accent)]"
                      >
                        {candidate.partyLabel} →
                      </a>
                    ) : (
                      <p className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">
                        {candidate.partyLabel}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <TrackHeading
              step="Track 3"
              scope="Region-wide"
              title="Sectoral & reserved"
              seats={sectoralSeats}
            />
            <p className="mt-4 text-sm leading-snug text-[var(--ink-2)]">
              Reserved seats guarantee representation for specific sectors. These
              candidates are region-wide, not tied to your district.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {sectors.map((sector) => (
                <div
                  key={sector.sector}
                  className="border border-[var(--rule)] bg-[var(--paper)]"
                >
                  <div className="flex items-center justify-between border-b border-[var(--rule)] p-4">
                    <p className="eyebrow text-[9px]">{sector.sector}</p>
                    <p className="num text-sm font-extrabold">
                      {sector.candidates.length}
                    </p>
                  </div>
                  <div>
                    {sector.candidates.map((candidate, index) => (
                      <div
                        key={`${sector.sector}-${index}-${candidate.name}`}
                        className="border-b border-[var(--rule-soft)] p-4 last:border-b-0"
                      >
                        <p className="text-sm font-bold leading-tight">
                          {candidate.name}
                        </p>
                        {candidate.organization ? (
                          <p className="mt-1 text-xs leading-snug text-[var(--ink-3)]">
                            {candidate.organization}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
