import {
  budget,
  peso,
  percent,
  pesoShort,
  type Sector,
} from "@betterbarmm/budget-data";
import { SectorIcon } from "./sector-icon";

/* ============================================================
   The top of the table as columns

   One panel and one scale. It was briefly two — largest and
   smallest side by side — but the two ends of this table are
   196 times apart, so each panel needed its own scale and a
   paragraph explaining that a bar on one could not be compared
   with a bar on the other. One scale needs no such warning.

   Thirty columns, not all thirty-seven: the tail is a run of
   sectors under ₱100m which at any shared scale are the same
   sub-pixel stub. Even at thirty the last few sit on the 2px
   floor rather than at their true height, which the note under
   the chart says outright — a floor that is not admitted reads
   as a quantity.

   The note is about the sectors and nothing else. It was once
   two thirds about the expense split, which is the home page's
   own section and says nothing about what a column here is.

   The marks are the axis labels (user decision): thirty sector
   names will not fit under thirty columns, and the same glyph
   sits beside the name in the list below. It is never the only
   label — the name and the figure are in each column's
   accessible text and in its hover panel, because a glyph
   alone names nothing to a screen reader.
   ============================================================ */

const SHOWN = 30;

/** The shortest a column may be drawn, so the tail is visible at all. */
const FLOOR = 2;

export function SectorChart({ sectors }: { sectors: Sector[] }) {
  // Sectors the Act gives money to. The one that gets none is left out: a
  // column of zero height is not a comparison, it is a gap in the axis.
  const rows = sectors.filter((sector) => sector.total > 0).slice(0, SHOWN);
  if (rows.length < 2) return null;

  const tallest = rows[0]?.total ?? 1;

  /* The figures the note quotes. `funded` is all thirty-seven, not the thirty
     drawn: "21 of 37 are under a billion" is a claim about the tail, most of
     which is off the right-hand edge of this chart.

     `topThree` is the one figure added across sectors, and it is added in
     order to be refuted — a row tagged both Education and Infrastructure is
     counted under each, so three columns already come to more than the Act
     does. Every other share here is one sector against the Act, which is a
     real share of a real total. */
  const funded = sectors.filter((sector) => sector.total > 0);
  const topThree = funded.slice(0, 3).reduce((sum, one) => sum + one.total, 0);
  const lowest = rows[rows.length - 1];
  const ratio = Math.round(tallest / (lowest?.total ?? 1));
  /* The funded sectors this chart does not draw. They are smaller than its
     shortest column, which is the tail the note has to account for. */
  const offEdge = funded.length - rows.length;

  return (
    <figure className="m-0">
      {/* The head and its rule are gone (user decision) — the columns are
          labeled under themselves and the tallest prints its own figure on
          hover. Kept for anyone who is not looking at the page: a figure with
          no caption is announced as an unnamed group of numbers. */}
      <figcaption className="sr-only">
        The {rows.length} largest sectors, against each other. Tallest{" "}
        {pesoShort(tallest)}.
      </figcaption>

      <div className="overflow-x-auto lg:overflow-x-visible">
        <div className="flex min-w-[48rem] items-end gap-1 sm:gap-1.5">
          {rows.map((sector, index) => {
            const share = (sector.total / tallest) * 100;
            /* One hue stepped down by rank — a sequential ramp, which is what
               color is for when it stands for the same thing the length does.
               Never a second hue: these are thirty of one measure, not thirty
               series. It stops at 0.4 because the last column still has to be
               seen. */
            const shade = 1 - (index / Math.max(1, rows.length - 1)) * 0.6;

            return (
              <div
                key={sector.slug}
                /* Paint order is DOM order, so an early column's panel was
                   going under a later column's bar. Lifting the hovered column
                   lifts its panel with it. */
                className="group/col relative flex min-w-0 flex-1 flex-col items-center hover:z-10"
              >
                <div className="relative h-12 w-full">
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center opacity-0 transition-opacity duration-150 group-hover/col:opacity-100">
                    <p className="whitespace-nowrap bg-[var(--ink)] px-3 py-2 text-center">
                      <span className="block text-[11px] font-semibold leading-tight text-[var(--paper)]">
                        {sector.name}
                      </span>
                      <span className="money mt-0.5 block font-mono text-[10px] text-[var(--paper)] opacity-75">
                        {peso(sector.total)}
                      </span>
                    </p>
                  </div>
                </div>

                <div
                  className="w-full bg-[var(--accent)]"
                  style={{
                    height: `${Math.max(FLOOR, (share / 100) * 176)}px`,
                    opacity: shade,
                  }}
                />

                <SectorIcon
                  slug={sector.slug}
                  weight="duotone"
                  className="mt-4 size-4 shrink-0 text-[var(--accent)] transition duration-300 group-hover/col:text-[var(--ink)]"
                />

                <span className="sr-only">
                  {sector.name}: {peso(sector.total)}.
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-8 border-t border-[var(--rule)] pt-5 text-[13.5px] leading-7 text-[var(--ink-2)]">
        <strong className="font-semibold text-[var(--ink)]">
          The {rows.length} largest, against each other.
        </strong>{" "}
        {/* One expression for the whole note. Interleaving text and braces here
            kept losing the space on one side or the other — JSX trims the
            whitespace that touches an expression, so the paragraph is built as
            a string rather than assembled out of a dozen fragments. */}
        {`${rows[0]?.name} is the tallest at ${pesoShort(rows[0]?.total ?? 0)} — ${percent(((rows[0]?.total ?? 0) / budget.total) * 100)} of everything Parliament appropriated, across ${rows[0]?.count} lines. The shortest drawn here is ${lowest?.name} at ${pesoShort(lowest?.total ?? 0)}, which ${rows[0]?.name} is ${ratio.toLocaleString("en-PH")} times over; ${offEdge} smaller funded sectors fall off the right-hand edge, and the last columns on it stand at the chart's ${FLOOR}px floor rather than at their true length. These columns overlap and can never be added: a line tagged both ${rows[0]?.name} and ${rows[2]?.name} is counted under each, which is why the top three alone come to ${pesoShort(topThree)} — more than the whole Act.`}
      </p>
    </figure>
  );
}
