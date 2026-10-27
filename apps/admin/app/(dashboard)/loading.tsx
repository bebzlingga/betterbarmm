/* What a dashboard page shows while its rows come back from the database (user decision: skeletons, matching the
   spacing). Built on the page's own measures: `PageHeader`'s title and description lines, then a panel of rows with
   the lists' padding, a title and a meta line, and the small button on the right. The sidebar is the layout's, so it
   stays put.

   A line is as tall as the text it stands for (`1lh` of the same type), with the bar where the letters would be. */
const WIDTHS = [72, 58, 84, 64, 76, 52, 68, 80];

function Line({ className = "", width }: { className?: string; width: string }) {
  return (
    <span className={`flex h-[1lh] items-center ${className}`}>
      <span className="skeleton h-[0.7em]" style={{ width }} />
    </span>
  );
}

export default function Loading() {
  return (
    <div role="status">
      <span className="sr-only">Loading…</span>
      <div aria-hidden="true">
        <header className="mb-8">
          <Line className="text-[1.625rem] leading-tight" width="16rem" />
          <Line className="mt-1.5 text-sm leading-6" width="min(32rem, 90%)" />
        </header>
        <div className="panel divide-y divide-[var(--rule)]">
          {WIDTHS.map((w, i) => (
            <div key={i} className="flex items-start gap-4 px-[1.125rem] py-3.5">
              <div className="min-w-0 flex-1">
                <Line className="text-[0.90625rem] leading-snug" width={`${w}%`} />
                <Line className="mt-1 text-xs" width={`${w / 2}%`} />
              </div>
              <span className="skeleton h-8 w-16 shrink-0 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
