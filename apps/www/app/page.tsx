import { Card, HeroSection } from "@betterbarmm/ui";

const portals = [
  {
    title: "Budget Portal",
    description:
      "Annual appropriations, agency programs, source documents, and comparison-ready spending lines.",
    action: "Open budget data",
    href: "/budget",
  },
  {
    title: "Bills Tracker",
    description:
      "Filed bills, committees, authors, status changes, and public legislative history in one index.",
    action: "Track legislation",
    href: "/bills",
  },
  {
    title: "Admin Hub",
    description:
      "Review uploads, normalize agencies, validate extracted records, and prepare public releases.",
    action: "Request access",
    href: "/admin",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <header className="sticky top-0 z-10 border-b border-[var(--ink)] bg-[var(--paper)]">
        <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--rule-soft)] pb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-3)]">
            <span>BARMM transparency infrastructure</span>
            <span>Budgets / Bills / Public records</span>
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

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <HeroSection
          title="BetterBARMM"
          description="A public operating layer for BARMM budgets, legislative work, and source-backed civic data. Built for year-over-year comparisons, document traceability, and fast public review."
          actions={[
            { label: "Explore budget data", href: "/budget" },
            { label: "Track bills", href: "/bills", variant: "secondary" },
          ]}
        />

        <section className="my-8 grid border-y border-[var(--ink)] sm:grid-cols-3">
          <div className="border-b border-[var(--rule)] p-5 sm:border-b-0 sm:border-r">
            <p className="eyebrow">Public apps</p>
            <p className="num mt-2 text-4xl font-semibold">03</p>
            <p className="mt-2 text-sm text-[var(--ink-3)]">
              Independent subdomain workspaces
            </p>
          </div>
          <div className="border-b border-[var(--rule)] p-5 sm:border-b-0 sm:border-r">
            <p className="eyebrow">First release</p>
            <p className="num mt-2 text-4xl font-semibold">2026</p>
            <p className="mt-2 text-sm text-[var(--ink-3)]">
              Budget dataset foundation
            </p>
          </div>
          <div className="p-5">
            <p className="eyebrow">Traceability</p>
            <p className="num mt-2 text-4xl font-semibold">PDF</p>
            <p className="mt-2 text-sm text-[var(--ink-3)]">
              Source-first public records
            </p>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {portals.map((portal, index) => (
            <Card
              key={portal.title}
              title={portal.title}
              description={portal.description}
            >
              <div className="mb-6 h-2 border border-[var(--ink)]">
                <div
                  className="h-full bg-[var(--accent)]"
                  style={{ width: `${62 + index * 13}%` }}
                />
              </div>
              <a
                href={portal.href}
                className={`inline-flex border px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition duration-150 ${
                  index === 0
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--accent)]"
                    : "border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                }`}
              >
                {portal.action}
              </a>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
