/* ============================================================
   One table voice for every list in the workspace

   Every list of offices, sectors, programs and projects is a table
   (user decision), set the way the home page's year-by-year table
   already was: small capitals over the columns, an ink rule under
   the head, hairlines between rows, figures ranged right on one
   edge. Constants rather than a component, so each list keeps its
   own markup and only the classes are shared.
   ============================================================ */

export const TABLE = 'w-full border-collapse text-left'

export const HEAD_ROW = 'border-b border-[var(--ink)]'

const HEAD = 'py-3 align-bottom font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
/** A column heading over words. */
export const TH = `${HEAD} pr-5 sm:pr-10`
/** A column heading over figures: ranged right, like the figures under it. */
export const TH_NUM = `${HEAD} whitespace-nowrap pl-5 text-right sm:pl-10`

export const ROW = 'group border-b border-[var(--rule-soft)] transition-colors duration-150 hover:bg-[var(--paper-2)]'

/** A cell of words. The gap between columns is wide (user decision), halved on a phone so a name keeps its room. */
export const TD = 'py-4 pr-5 align-top sm:pr-10'
/** A cell holding a figure. */
export const TD_NUM = 'money money-light whitespace-nowrap py-4 pl-5 text-right sm:pl-10 align-top text-[0.875rem] text-[var(--ink)]'

/** The small grey line under a name: the area, the office, the kind. */
export const SUB = 'mt-1 block text-[0.75rem] leading-snug text-[var(--ink-3)]'
