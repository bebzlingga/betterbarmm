'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Starts every page at the top.
 *
 * The router does this itself, but not reliably once a page is long: a
 * navigation that begins deep in the roster can land part-way down a shorter
 * page, which reads as a blank screen rather than as a scroll position. This
 * pins the behaviour instead of leaving it to a race — and skips the reset
 * when the URL carries a hash, since that asks for a particular place.
 */
export function ScrollToTop() {
	const pathname = usePathname()

	useEffect(() => {
		if (window.location.hash) return
		window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
	}, [pathname])

	return null
}
