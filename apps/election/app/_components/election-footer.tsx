export function ElectionFooter() {
  return (
    <footer className="border-t border-[var(--ink)] bg-[var(--paper)] py-10 pb-5 text-[var(--ink)]">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid border-b border-[var(--rule)] pb-12 pt-6 sm:pb-16 sm:pt-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
          <div>
            <p className="eyebrow">Election transparency</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-none tracking-[-0.03em] sm:text-4xl lg:pr-20">
              Election records, organized for the public.
            </h2>
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-6 text-[var(--ink-2)] sm:text-base sm:leading-7 lg:mt-0 lg:pl-12">
            The BetterBARMM election workspace organizes the 2026 BARMM
            Parliamentary Elections across regional party entries, district COC
            filers, sectoral candidates, timeline events, and source notes.
          </p>
        </div>
        <p className="mt-8 font-mono text-[9px] uppercase leading-4 tracking-[0.12em] text-[var(--ink-3)] sm:mt-10 sm:text-[10px] sm:tracking-[0.2em]">
          <span className="font-bold text-[var(--ink)]">Working dataset.</span>{" "}
          Verify candidate status, substitutions, and nominee lists against
          COMELEC postings before publication or citation.
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
          <p>Dataset: datasets/election/election.min.json</p>
        </div>
      </div>
    </footer>
  );
}
