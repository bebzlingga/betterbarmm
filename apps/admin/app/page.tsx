import { Button, Card } from "@betterbarmm/ui";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[var(--paper)] px-5 py-8 text-[var(--ink)] sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="border-y border-[var(--ink)] py-8">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Admin dashboard
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-extrabold leading-none tracking-[-0.035em] sm:text-6xl">
            BetterBARMM internal operations
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--ink-2)]">
            Manage metadata, upload governance documents, and review validation
            checks in a dedicated operations workspace.
          </p>
        </header>

        <section className="grid border-y border-[var(--ink)] sm:grid-cols-3">
          <div className="border-r border-[var(--rule)] p-5">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Queues
            </p>
            <p className="mt-2 font-mono text-4xl font-semibold">02</p>
          </div>
          <div className="border-r border-[var(--rule)] p-5">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Review mode
            </p>
            <p className="mt-2 font-mono text-4xl font-semibold">QA</p>
          </div>
          <div className="p-5">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Access
            </p>
            <p className="mt-2 font-mono text-4xl font-semibold">Role</p>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card
            title="Bill metadata"
            description="Track and update bill authors, sponsors, committees, and filing details."
          >
            <Button variant="primary" className="mt-4">
              Open bills manager
            </Button>
          </Card>
          <Card
            title="Budget review"
            description="Review extracted budget JSON and normalize agency names for the public portal."
          >
            <Button variant="secondary" className="mt-4">
              Open budget review
            </Button>
          </Card>
        </div>
      </div>
    </main>
  );
}
