import {
  dominantStatusLabel,
  type PartyView,
} from "../_lib/election-data";
import { ConfidenceBadge } from "./confidence-badge";

function StatCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-[var(--paper-2)] px-2 py-3">
      <p className="num text-xl font-extrabold">{value}</p>
      <p className="mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
        {label}
      </p>
    </div>
  );
}

export function PartyCard({
  party,
  showDescription = false,
}: {
  party: PartyView;
  showDescription?: boolean;
}) {
  return (
    <a
      href={`/parties/${party.party_id}`}
      className="group flex min-h-full flex-col border border-[var(--rule)] bg-[var(--paper)] p-6 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--ink)] hover:bg-[var(--paper-2)]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
          {party.party_id}
        </p>
        {party.dominantStatus ? (
          <span className="bg-[var(--accent)] px-2 py-1 font-mono text-[8px] font-bold uppercase leading-none tracking-[0.12em] text-white">
            {dominantStatusLabel[party.dominantStatus]}
          </span>
        ) : (
          <ConfidenceBadge confidence={party.confidence} />
        )}
      </div>

      <h3 className="mt-5 text-2xl font-extrabold leading-none tracking-[-0.03em] transition-colors group-hover:text-[var(--accent)]">
        {party.ballot_name}
      </h3>
      <p className="mt-1 text-sm font-semibold leading-snug text-[var(--ink)]">
        {party.full_name}
      </p>

      {party.affiliation ? (
        <p className="mt-3 line-clamp-1 font-mono text-[9px] font-bold uppercase leading-snug tracking-[0.12em] text-[var(--ink-3)]">
          {party.affiliation}
        </p>
      ) : null}

      {showDescription && party.description ? (
        <p className="mt-3 line-clamp-4 text-sm leading-snug text-[var(--ink-2)]">
          {party.description}
        </p>
      ) : null}

      {party.cmNominee ? (
        <p className="mt-3 text-xs leading-snug text-[var(--ink-2)]">
          <span className="font-bold text-[var(--ink)]">CM nominee: </span>
          {party.cmNominee}
        </p>
      ) : null}

      <div className="mt-auto grid grid-cols-2 gap-px pt-5 text-center">
        <StatCell value={party.computedStats.sectoralCandidates} label="Sectoral links" />
        <StatCell value={party.computedStats.districtCocFilers} label="District filers" />
      </div>
      <p className="mt-4 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--ink-3)] transition group-hover:text-[var(--accent)]">
        View party →
      </p>
    </a>
  );
}
