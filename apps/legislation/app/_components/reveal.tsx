'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type RevealProps = {
	children: ReactNode
	/** Extra stagger before the element animates in, in milliseconds. */
	delay?: number
	className?: string
}

/**
 * Fades and lifts its children into view the first time they scroll near the
 * viewport. Motion is CSS-driven (see `[data-reveal]` in globals.css); this only
 * flips `data-shown`. Users with `prefers-reduced-motion`, no JavaScript, or no
 * IntersectionObserver support see the content immediately.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
	const ref = useRef<HTMLDivElement>(null)
	const [shown, setShown] = useState(false)

	useEffect(() => {
		const el = ref.current
		if (!el) return
		if (typeof IntersectionObserver === 'undefined') {
			setShown(true)
			return
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setShown(true)
						observer.disconnect()
						break
					}
				}
			},
			// `threshold: 0` — any part of the element crossing the line is enough.
			// A ratio threshold looks equivalent but silently breaks on anything
			// taller than the viewport: the ratio is measured against the element,
			// so the most a tall section can ever reach is viewport ÷ element. The
			// legislative process page's bill path runs past six screens, which
			// capped it under the old 0.15 and left the section stuck at opacity 0
			// no matter how far you scrolled.
			//
			// The negative bottom margin is what holds the entrance back now: the
			// element has to reach the last tenth of the viewport before it counts
			// as intersecting, which for anything of ordinary height behaves as the
			// ratio did.
			{ threshold: 0, rootMargin: '0px 0px -10% 0px' },
		)

		observer.observe(el)
		return () => observer.disconnect()
	}, [])

	return (
		<div
			ref={ref}
			data-reveal=''
			data-shown={shown ? 'true' : 'false'}
			className={className}
			style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
		>
			{children}
		</div>
	)
}
