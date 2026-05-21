const portalCards = [
  {
    label: "Budget",
    title: "Follow the money",
    description:
      "Appropriations, offices, programs, and source files organized for public review.",
    href: "/budget",
    measure: "GAAB FY 2020-2026",
  },
  {
    label: "Bills",
    title: "Track the lawmaking",
    description:
      "Bills, authors, committees, readings, and legislative movement in one public index.",
    href: "/bills",
    measure: "Legislative records",
  },
  {
    label: "Source",
    title: "Check the receipts",
    description:
      "A source-first workspace for documents, validation notes, and release context.",
    href: "/budget/data",
    measure: "PDFs and JSON",
  },
];

const transparencySignals = [
  ["Source", "Every public figure should point back to the document it came from."],
  ["Context", "Numbers need years, offices, categories, and methods beside them."],
  ["Access", "Tables should be searchable, comparable, and usable without permission."],
  ["Memory", "Public records should remain useful after the headline has passed."],
];

const ledgerRows = [
  ["Budget", "114.1B", "Appropriations"],
  ["Programs", "238", "Public lines"],
  ["Offices", "44", "Reporting units"],
  ["Years", "2020-2026", "GAAB archive"],
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <header className="sticky top-0 z-20 border-b border-[var(--ink)] bg-[var(--paper)]">
        <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--rule-soft)] pb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-3)]">
            <span>betterbarmm.com</span>
            <span>Transparency / Public records / Civic data</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-5 pt-4">
            <a
              href="/"
              className="text-3xl font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]"
            >
              <span className="mr-2 bg-[var(--ink)] px-2 py-1 align-[6px] font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--paper)]">
                BARMM
              </span>
              BetterBARMM
            </a>
            <nav className="flex flex-wrap gap-6 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]">
              <a
                className="border-b-2 border-[var(--accent)] pb-1 text-[var(--ink)]"
                href="/"
              >
                Overview
              </a>
              <a className="pb-1 hover:text-[var(--accent)]" href="/budget">
                Budget
              </a>
              <a className="pb-1 hover:text-[var(--accent)]" href="/bills">
                Bills
              </a>
            </nav>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[var(--ink)]">
        <div className="absolute inset-0 opacity-70" aria-hidden="true">
          <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_right,var(--rule-soft)_1px,transparent_1px),linear-gradient(to_bottom,var(--rule-soft)_1px,transparent_1px)] bg-[size:96px_96px]" />
          <div className="absolute right-0 top-20 h-[520px] w-[72%] border-y border-l border-[var(--rule)] bg-[var(--paper)]/70">
            {ledgerRows.map((row, index) => (
              <div
                key={row[0]}
                className="grid grid-cols-[1fr_0.55fr_0.7fr] border-b border-[var(--rule-soft)] px-8 py-7 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink-3)]"
                style={{ transform: `translateX(${index * 18}px)` }}
              >
                <span>{row[0]}</span>
                <span className="num text-[var(--ink)]">{row[1]}</span>
                <span>{row[2]}</span>
              </div>
            ))}
            <div className="mx-8 mt-8 h-4 border border-[var(--ink)]">
              <span className="block h-full w-[72%] bg-[var(--accent)]" />
            </div>
            <div className="mx-8 mt-3 h-4 border border-[var(--ink)]">
              <span className="block h-full w-[54%] bg-[var(--positive)]" />
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
          <p className="eyebrow">Public transparency layer</p>
          <h1 className="mt-5 max-w-6xl text-6xl font-extrabold leading-[0.9] tracking-[-0.045em] sm:text-8xl lg:text-[9.5rem]">
            Make public money readable.
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-[var(--ink-2)] sm:text-xl sm:leading-9">
            BetterBARMM turns budgets, bills, and source documents into civic
            infrastructure: searchable, traceable, and built for anyone who
            wants to understand how government decisions move.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="/budget"
              className="inline-flex border border-[var(--ink)] bg-[var(--ink)] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--paper)] transition hover:bg-[var(--accent)]"
            >
              Open budget portal
            </a>
            <a
              href="/bills"
              className="inline-flex border border-[var(--rule)] bg-[var(--paper)] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Track public bills
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <section className="grid border-y border-[var(--ink)] md:grid-cols-4">
          {transparencySignals.map(([title, description]) => (
            <div
              key={title}
              className="border-b border-[var(--rule)] p-5 md:border-b-0 md:border-r last:md:border-r-0"
            >
              <p className="eyebrow">{title}</p>
              <p className="mt-4 text-sm leading-6 text-[var(--ink-2)]">
                {description}
              </p>
            </div>
          ))}
        </section>

        <section className="py-12">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[var(--ink)] pb-5">
            <div>
              <p className="eyebrow">Public workspaces</p>
              <h2 className="mt-3 text-4xl font-extrabold leading-none tracking-[-0.03em] sm:text-6xl">
                Start with the records.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[var(--ink-3)]">
              Each workspace is designed around the same promise: show the
              public record, explain the method, and keep the trail visible.
            </p>
          </div>

          <div className="grid lg:grid-cols-3">
            {portalCards.map((card, index) => (
              <a
                key={card.title}
                href={card.href}
                className="group border-b border-[var(--rule)] p-6 text-[var(--ink)] transition hover:bg-[var(--paper-2)] lg:border-r lg:last:border-r-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">0{index + 1} / {card.label}</p>
                    <h3 className="mt-4 text-2xl font-extrabold tracking-[-0.02em]">
                      {card.title}
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)] group-hover:text-[var(--ink)]">
                    Open
                  </span>
                </div>
                <p className="mt-4 min-h-20 text-sm leading-6 text-[var(--ink-2)]">
                  {card.description}
                </p>
                <div className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--rule-soft)] pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-3)]">
                  <span>{card.measure}</span>
                  <span>Source-backed</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-[var(--ink)] bg-[var(--paper)] px-5 py-8 text-[var(--ink)] sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="max-w-5xl font-mono text-[10px] uppercase leading-6 tracking-[0.14em] text-[var(--ink-3)] sm:tracking-[0.2em]">
            <span className="font-bold text-[var(--ink)]">
              AI-assisted analysis.
            </span>{" "}
            Public datasets, summaries, and interface copy may be assisted by AI
            and should be reviewed against official sources before citation.
          </p>
          <div className="mt-8 flex flex-col justify-between gap-4 border-t border-[var(--rule)] pt-5 font-mono text-[10px] uppercase leading-6 tracking-[0.16em] text-[var(--ink-3)] sm:flex-row sm:items-center sm:tracking-[0.22em]">
            <p>
              Site by{" "}
              <a
                href="https://bebz.dev"
                target="_blank"
                rel="noreferrer"
                className="border-b border-[var(--accent)] font-bold text-[var(--ink)] hover:text-[var(--accent)]"
              >
                Bebz
              </a>
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
    </main>
  );
}
