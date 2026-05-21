import { Card } from "@betterbarmm/ui";

const mockBills = [
  {
    number: "HB-001",
    title: "BARMM Education Enhancement Act",
    author: "Rep. Ali",
    status: "Pending Committee",
    committee: "Education",
  },
  {
    number: "SB-003",
    title: "Regional Infrastructure Investment Bill",
    author: "Sen. Sani",
    status: "Second Reading",
    committee: "Public Works",
  },
  {
    number: "HB-018",
    title: "Health Services Expansion Act",
    author: "Rep. Laila",
    status: "Filed",
    committee: "Health",
  },
];

export default function BillsPage() {
  return (
    <main className="min-h-screen bg-[var(--paper)] px-5 py-8 text-[var(--ink)] sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="border-y border-[var(--ink)] py-8">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Bills tracker
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-extrabold leading-none tracking-[-0.035em] sm:text-6xl">
            BARMM legislation and status overview
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--ink-2)]">
            Search, filter, and review bill metadata in a public ledger styled
            for quick scanning and source-backed legislative tracking.
          </p>
        </header>

        <section className="grid border-y border-[var(--ink)] md:grid-cols-3">
          <div className="border-r border-[var(--rule)] p-5">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Indexed bills
            </p>
            <p className="mt-2 font-mono text-4xl font-semibold">
              {mockBills.length}
            </p>
          </div>
          <div className="border-r border-[var(--rule)] p-5">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Committees
            </p>
            <p className="mt-2 font-mono text-4xl font-semibold">03</p>
          </div>
          <div className="p-5">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Current view
            </p>
            <p className="mt-2 font-mono text-4xl font-semibold">Live</p>
          </div>
        </section>

        <div className="grid gap-5">
          {mockBills.map((bill) => (
            <Card
              key={bill.number}
              title={`${bill.number} - ${bill.title}`}
              description={`${bill.author} / ${bill.committee}`}
            >
              <div className="grid gap-4 text-sm text-[var(--ink-2)] sm:grid-cols-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                    Status
                  </p>
                  <p className="mt-1 font-semibold text-[var(--ink)]">
                    {bill.status}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                    Committee
                  </p>
                  <p className="mt-1">{bill.committee}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                    Author
                  </p>
                  <p className="mt-1">{bill.author}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
