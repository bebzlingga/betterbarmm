export function ElectionFooter() {
  return (
    <footer className="bb-footer">
      <div className="bb-container">
        <div className="bb-footer-main">
          <div>
            <p className="eyebrow">Election transparency</p>
            <h2 className="bb-footer-title mt-3">
              Election records, organized for the public.
            </h2>
          </div>
          <p className="bb-footer-copy">
            The BetterBARMM election workspace organizes the 2026 BARMM
            Parliamentary Elections across regional party entries, district COC
            filers, sectoral candidates, timeline events, and source notes.
          </p>
        </div>
        <p className="bb-footer-note">
          <span className="font-bold text-[var(--ink)]">Working dataset.</span>{" "}
          Verify candidate status, substitutions, and nominee lists against
          COMELEC postings before publication or citation.
        </p>
        <div className="bb-footer-bottom">
          <p>
            2026{" "}
            <a
              href="https://betterbarmm.com"
              target="_blank"
              rel="noreferrer"
              className="bb-footer-link"
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
