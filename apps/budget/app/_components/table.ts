/* ============================================================
   One table voice for every list in the workspace

   Every list of offices, sectors, programs and projects is a table
   (user decision), in the travel look (user decision): a rounded
   card, the head on a warm tint, soft rules between rows, figures
   ranged right on one edge (`.bt-table`, globals.css). Constants
   rather than a component, so each list keeps its own markup and
   only the classes are shared.
   ============================================================ */

export const TABLE = 'bt-table w-full text-left'

export const HEAD_ROW = ''

const HEAD = 'py-3.5 align-bottom font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
/** A column heading over words. */
export const TH = `${HEAD} pr-5 sm:pr-10`
/** A column heading over figures: ranged right, like the figures under it. */
export const TH_NUM = `${HEAD} whitespace-nowrap pl-5 text-right sm:pl-10`

export const ROW = 'group transition-colors duration-150 hover:bg-[var(--paper-2)]'

/** Every cell centred on its row (user decision). A cell of words. The gap between columns is wide (user decision), halved on a phone so a name keeps its room. */
export const TD = 'py-4 pr-5 align-middle sm:pr-10'
/** A cell holding a figure. */
export const TD_NUM = 'money money-light whitespace-nowrap py-4 pl-5 text-right sm:pl-10 align-middle text-[0.9375rem] text-[var(--ink)]'

/** The small grey line under a name: the area, the office, the kind. */
export const SUB = 'mt-1 block text-[0.8125rem] leading-snug text-[var(--ink-3)]'
