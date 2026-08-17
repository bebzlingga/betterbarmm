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
			{ threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
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
