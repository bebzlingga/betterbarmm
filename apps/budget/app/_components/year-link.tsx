'use client'

import { LATEST_YEAR, isFiscalYear } from '@betterbarmm/budget-data/years'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { ComponentProps } from 'react'

/* ============================================================
   A link that stays in the year it was clicked in

   The year is a query parameter, so every internal link has to
   carry it or a reader reading FY 2025 lands back in FY 2026 on
   the first thing they click. Done here rather than by handing
   a `year` down to each list and rewriting each `href`: there
   are twenty-six of those and the failure is silent — a link
   that forgot the year looks exactly like a link that never had
   one, and the page it opens is a real page with real figures
   from the wrong Act.

   It reads the year off the URL rather than taking it as a
   prop, so a component can render a link without knowing there
   is a year at all.

   Imports from `budget-data/years`, which holds the list and no
   data. Reaching into the package's index for it would put both
   Acts' line items in the browser bundle.
   ============================================================ */

/**
 * The year to carry, as a bare string, or `''` on the default year.
 *
 * Only a year this workspace holds, and never the latest one — that is what a
 * bare URL already means, and `?fy=2026` on every link would put a parameter in
 * the address bar that changes nothing. Anything else is dropped rather than
 * passed along, so a typed-in `?fy=1999` does not propagate itself through the
 * whole site.
 */
export function useCarriedYear(): string {
	const fy = useSearchParams().get('fy')
	return isFiscalYear(fy) && Number(fy) !== LATEST_YEAR ? String(fy) : ''
}

/**
 * A path with the reader's year kept on it.
 *
 * Exported because a link is not the only way off a page: the finder pushes a
 * route, and both browsers rewrite the address bar as the reader types. Those
 * built their own URLs and dropped `?fy=` while doing it, which put someone
 * reading FY 2021 back in FY 2026 for typing a letter into a search box.
 */
/**
 * The year to carry, read off the address bar at the moment it is needed.
 *
 * `useCarriedYear` subscribes a component to the query string, which Next
 * requires behind a Suspense boundary. The finder wraps the whole page, so a
 * boundary there would defer every route's content — and it does not render
 * anything from the year, it only needs the destination of a click that has
 * already happened. Reading it at that moment costs nothing and keeps the
 * shell prerenderable.
 */
export function carriedYearNow(): string {
	if (typeof window === 'undefined') return ''
	const fy = new URLSearchParams(window.location.search).get('fy')
	return isFiscalYear(fy) && Number(fy) !== LATEST_YEAR ? String(fy) : ''
}

export function withYear(href: string, fy: string): string {
	if (!fy) return href
	return `${href}${href.includes('?') ? '&' : '?'}fy=${fy}`
}

export function YearLink({
	href,
	...rest
}: Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
	return <Link href={withYear(href, useCarriedYear())} {...rest} />
}
