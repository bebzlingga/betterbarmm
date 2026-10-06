'use client'

import { useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

/* ============================================================
   What a masthead does when the page moves

   Six workspaces carry a bar across the top and every one of them
   wants the same two behaviours: take a ground once the reader has
   left the top, and get out of the way when they are reading down.
   Only one of them had either, so this is the behaviour lifted out
   of the www header rather than a new idea — the numbers below are
   that header's, unchanged.

   It also publishes `data-header-hidden` on the document element,
   which the shared stylesheet has always read: `--sticky-top` drops
   to 0 when the bar is away, so anything sticking under it follows
   the bar up instead of leaving a band of empty page. That contract
   existed in CSS from the start and only www ever upheld it, which
   meant every sticky element on the other five offset itself by the
   full header height forever, including while the header was gone.
   ============================================================ */

type HeaderScroll = {
	/** The reader has left the top. An overlay bar earns its ground here. */
	past: boolean
	/** The bar is ducked away. Drive a `y: '-100%'` off this. */
	hidden: boolean
}

/**
 * @param held Keep the bar out while something is open — a menu panel that
 *   scrolls away from its own trigger reads as a crash.
 */
export function useHeaderScroll(held = false): HeaderScroll {
	const [past, setPast] = useState(false)
	const [hidden, setHidden] = useState(false)
	const lastY = useRef(0)
	const { scrollY } = useScroll()

	useMotionValueEvent(scrollY, 'change', (y) => {
		setPast(y > 24)

		// Hide going down, reveal coming up. The 6px threshold is what stops a
		// trackpad's one-pixel jitter from flickering the bar, and the bar never
		// hides near the top of the document — there is nothing to reclaim there,
		// and a masthead that ducks away on the first scroll reads as a fault.
		const delta = y - lastY.current
		if (Math.abs(delta) > 6) {
			setHidden(delta > 0 && y > 260 && !held)
			lastY.current = y
		}
	})

	useEffect(() => {
		document.documentElement.dataset.headerHidden = hidden ? 'true' : 'false'
	}, [hidden])

	// A bar unmounting while ducked would leave the flag set, and every sticky
	// element under it pinned to the top of the viewport with nothing above.
	useEffect(() => {
		return () => {
			document.documentElement.dataset.headerHidden = 'false'
		}
	}, [])

	return { past, hidden }
}
