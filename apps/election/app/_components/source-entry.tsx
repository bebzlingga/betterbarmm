import { formatDate, labelize, type Source } from "../_lib/election-data";

function reliabilityTone(reliability?: string): string {
  if (!reliability) return "bg-[var(--ink-3)] text-white";
  if (reliability.includes("official")) return "bg-[var(--positive)] text-white";
  if (reliability.includes("reputable")) return "bg-[var(--slate)] text-white";
  return "bg-[var(--ochre)] text-white";
}

export function SourceEntry({ source }: { source: Source }) {
  const kicker = source.display?.kicker ?? labelize(source.type);
  const lead = source.display?.dek ?? source.summary ?? source.description;
  const body = source.display?.body ?? source.content;

  return (
    <article
      id={source.id}
      className="scroll-mt-32 border-t border-[var(--rule)] py-10"
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <p className="eyebrow text-[9px]">{kicker}</p>
        <div className="flex flex-wrap items-center gap-2">
          {source.reliability ? (
            <span
              className={`inline-block px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.12em] ${reliabilityTone(source.reliability)}`}
            >
              {labelize(source.reliability)}
            </span>
          ) : null}
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">
            {source.date ? formatDate(source.date) : labelize(source.type)}
          </p>
        </div>
      </div>

      <h3 className="mt-4 text-xl font-extrabold leading-tight tracking-[-0.025em]">
        {source.display?.title ?? source.title}
      </h3>
      <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">
        {[source.publisher, source.id].filter(Boolean).join(" · ")}
      </p>

      {lead ? (
        <p className="mt-4 max-w-3xl text-sm leading-snug text-[var(--ink-2)] sm:text-base">
          {lead}
        </p>
      ) : null}

      {source.key_points && source.key_points.length > 0 ? (
        <ul className="mt-4 max-w-3xl space-y-2">
          {source.key_points.map((point, index) => (
            <li
              key={index}
              className="flex gap-3 text-sm leading-snug text-[var(--ink-2)]"
            >
              <span className="mt-1.5 h-1 w-3 shrink-0 bg-[var(--accent)]" />
              {point}
            </li>
          ))}
        </ul>
      ) : null}

      {body && body !== lead ? (
        <details className="group mt-4 max-w-3xl">
          <summary className="cursor-pointer list-none font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] transition-colors hover:text-[var(--accent-deep)]">
            <span className="group-open:hidden">Read source note +</span>
            <span className="hidden group-open:inline">Hide source note −</span>
          </summary>
          <p className="mt-3 text-sm leading-snug text-[var(--ink-2)]">{body}</p>
        </details>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
        {source.url ? (
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="rule-link text-xs font-bold"
          >
            Open source ↗
          </a>
        ) : null}
        {source.verification?.status ? (
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
            Verification: {labelize(source.verification.status)}
          </p>
        ) : null}
      </div>
    </article>
  );
}
