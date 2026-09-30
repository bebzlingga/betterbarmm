'use client'

import { yearFrom } from '@betterbarmm/budget-data/years'
import { useSearchParams } from 'next/navigation'

/* ============================================================
   The two lines in the footer that name the Act

   The footer is rendered by the layout, which has no query
   string to read — so with the year in `?fy=` it went on saying
   "BAA No. 85 · fiscal year 2026" under a page of FY 2025
   figures, which is the one thing a footer on this workspace
   must not do.

   It takes the Act titles already rendered rather than looking
   them up, so the browser gets two short strings instead of two
   Acts' worth of line items.
   ============================================================ */

export function FooterYear({
	acts,
	prefix,
}: {
	/** Each year's short title, keyed by year, built on the server. */
	acts: Record<string, string>
	/** Set for the "Compiled from …" line; left off for the dateline. */
	prefix?: string
}) {
	const year = yearFrom(useSearchParams().get('fy'))
	const act = acts[String(year)] ?? ''

	return prefix ? <>{`${prefix}${act}`}</> : <>{`${act} · fiscal year ${year}`}</>
}
