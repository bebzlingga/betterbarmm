/* ============================================================
   Which fiscal years this workspace holds an Act for

   Its own file, and deliberately free of any data import. The
   year switch runs in the browser — a link has to know whether
   to carry `?fy=` with it — and a client component reaching
   into the package's index for this list would pull both Acts'
   line items into the bundle along with it.
   ============================================================ */

/** Newest first, which is the order the year menu lists them in. */
export const FISCAL_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020] as const

/** The year a page shows when it says nothing about which year it wants. */
export const LATEST_YEAR = FISCAL_YEARS[0]

/** Whether a `?fy=` names a year this workspace actually holds. */
export const isFiscalYear = (fy?: string | number | null): boolean =>
	(FISCAL_YEARS as readonly number[]).includes(Number(fy))

/**
 * The year a `?fy=` asks for, or the latest one.
 *
 * Anything unrecognized falls back rather than throwing: this reads a query
 * string, which is to say it reads whatever anybody types into the address
 * bar, and a budget page is not the place to answer that with a stack trace.
 */
export const yearFrom = (fy?: string | number | null): number =>
	isFiscalYear(fy) ? Number(fy) : LATEST_YEAR
