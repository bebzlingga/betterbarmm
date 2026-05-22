export function BillsFooter() {
  return (
    <footer className="border-t border-[var(--ink)] bg-[var(--paper)] py-10 pb-5 text-[var(--ink)]">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid border-b border-[var(--rule)] pb-12 pt-6 sm:pb-16 sm:pt-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
          <div>
            <p className="eyebrow">Legislative transparency</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-none tracking-[-0.03em] sm:text-4xl lg:pr-20">
              Public laws should be easy to trace.
            </h2>
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-6 text-[var(--ink-2)] sm:text-base sm:leading-7 lg:mt-0 lg:pl-12">
            The BetterBARMM bills workspace organizes Bangsamoro Autonomy Acts with
            source links, dates, categories, authors, and plain-language notes so
            people can follow how legislative records become public law.
          </p>
        </div>
        <p className="mt-8 font-mono text-[9px] uppercase leading-4 tracking-[0.12em] text-[var(--ink-3)] sm:mt-10 sm:text-[10px] sm:tracking-[0.2em]">
          <span className="font-bold text-[var(--ink)]">AI-assisted analysis.</span>{" "}
          Summaries, classifications, and interface copy may be assisted by AI and
          human review. Verify legal details against the official Parliament or
          Gazette source before citation.
        </p>
        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-[var(--rule)] pt-5 font-mono text-[9px] uppercase leading-5 tracking-[0.14em] text-[var(--ink-3)] sm:mt-9 sm:flex-row sm:items-center sm:text-[10px] sm:leading-6 sm:tracking-[0.22em]">
          <p>
            2026{" "}
            <a
              href="https://betterbarmm.com"
              target="_blank"
              rel="noreferrer"
              className="border-b border-[var(--accent)] font-bold text-[var(--ink)] hover:text-[var(--accent)]"
            >
              betterbarmm.com
            </a>{" "}
            - All content is public domain unless otherwise specified.
          </p>
          <p>
            Inspired by{" "}
            <a
              href="https://bettergov.ph"
              target="_blank"
              rel="noreferrer"
              className="border-b border-[var(--accent)] font-bold text-[var(--ink)] hover:text-[var(--accent)]"
            >
              bettergov.ph
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
