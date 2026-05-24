export function BillsFooter() {
  return (
    <footer className="bb-footer">
      <div className="bb-container">
        <div className="bb-footer-main">
          <div>
            <p className="eyebrow">Legislative transparency</p>
            <h2 className="bb-footer-title mt-3">
              Public laws should be easy to trace.
            </h2>
          </div>
          <p className="bb-footer-copy">
            The BetterBARMM bills workspace organizes Bangsamoro Autonomy Acts with
            source links, dates, categories, authors, and plain-language notes so
            people can follow how legislative records become public law.
          </p>
        </div>
        <p className="bb-footer-note">
          <span className="font-bold text-[var(--ink)]">AI-assisted analysis.</span>{" "}
          Summaries, classifications, and interface copy may be assisted by AI and
          human review. Verify legal details against the official Parliament or
          Gazette source before citation.
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
          <p>
            Inspired by{" "}
            <a
              href="https://bettergov.ph"
              target="_blank"
              rel="noreferrer"
              className="bb-footer-link"
            >
              bettergov.ph
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
