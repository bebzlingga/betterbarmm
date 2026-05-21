const portalCards = [
  {
    title: "Budget Portal",
    description:
      "A fiscal-year view of appropriations, agencies, programs, and source metadata.",
    href: "/budget",
    fill: "78%",
  },
  {
    title: "Bills Tracker",
    description:
      "A public index for bills, committees, authors, statuses, and legislative history.",
    href: "/bills",
    fill: "62%",
  },
  {
    title: "Admin Hub",
    description:
      "A review workspace for uploads, validation checks, and public release operations.",
    href: "/admin",
    fill: "48%",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <header className="sticky top-0 z-10 border-b border-[var(--ink)] bg-[var(--paper)]">
        <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--rule-soft)] pb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-3)]">
            <span>BARMM transparency infrastructure</span>
            <span>Budget / Legislation / Source documents</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-5 pt-4">
            <a
              href="/"
              className="text-3xl font-extrabold leading-none tracking-[-0.03em]"
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

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <section className="border-y border-[var(--ink)] py-10 sm:py-14">
          <p className="eyebrow">Public data platform</p>
          <h1 className="mt-5 max-w-5xl text-6xl font-extrabold leading-[0.92] tracking-[-0.045em] sm:text-8xl">
            BetterBARMM
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--ink-2)]">
            A warm, editorial, source-backed interface for BARMM budgets, bills,
            and public policy records. Designed for quick comparison, dense
            tables, and document traceability.
          </p>
        </section>

        <section className="grid border-b border-[var(--ink)] md:grid-cols-4">
          <div className="border-r border-[var(--rule)] p-5">
            <p className="eyebrow">Apps</p>
            <p className="num mt-2 text-4xl font-semibold">03</p>
            <p className="mt-2 text-sm text-[var(--ink-3)]">
              Independent public workspaces
            </p>
          </div>
          <div className="border-r border-[var(--rule)] p-5">
            <p className="eyebrow">First fiscal year</p>
            <p className="num mt-2 text-4xl font-semibold">2026</p>
            <p className="mt-2 text-sm text-[var(--ink-3)]">
              Budget dataset foundation
            </p>
          </div>
          <div className="border-r border-[var(--rule)] p-5">
            <p className="eyebrow">Records</p>
            <p className="num mt-2 text-4xl font-semibold">PDF</p>
            <p className="mt-2 text-sm text-[var(--ink-3)]">
              Source-first traceability
            </p>
          </div>
          <div className="p-5">
            <p className="eyebrow">Status</p>
            <p className="num mt-2 text-4xl font-semibold">Alpha</p>
            <p className="mt-2 text-sm text-[var(--ink-3)]">
              Early public interface
            </p>
          </div>
        </section>

        <section className="my-8 grid gap-5 lg:grid-cols-3">
          {portalCards.map((card, index) => (
            <a
              key={card.title}
              href={card.href}
              className="border border-[var(--ink)] bg-[var(--paper)] p-6 text-[var(--ink)] transition hover:bg-[var(--paper-2)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">0{index + 1}</p>
                  <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.02em]">
                    {card.title}
                  </h2>
                </div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                  Open
                </span>
              </div>
              <p className="mt-4 min-h-20 text-sm leading-6 text-[var(--ink-2)]">
                {card.description}
              </p>
              <div className="mt-6 h-2 border border-[var(--ink)]">
                <span
                  className="block h-full bg-[var(--accent)]"
                  style={{ width: card.fill }}
                />
              </div>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}
