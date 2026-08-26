'use client'

import { motion } from 'motion/react'
import { EASE } from '@betterbarmm/editorial'
import type { ReactNode } from 'react'

type RevealProps = {
	children: ReactNode
	/** Extra stagger before the element animates in, in milliseconds. */
	delay?: number
	className?: string
}

/**
 * Fades and lifts its children into view the first time they scroll near the
 * viewport.
 *
 * This is the older name for what `Rise` in `@betterbarmm/editorial` now does,
 * kept because it is called from several dozen places across the registry and a
 * rename would be a diff with no reader on the other end of it. It delegates
 * rather than reimplementing, so the registry and the landing site arrive with
 * the same distance, duration, and curve.
 *
 * `amount: 'some'` matters more here than it looks. A ratio threshold silently
 * breaks on anything taller than the viewport — the ratio is measured against
 * the element, so the most a tall section can ever reach is viewport ÷ element.
 * The legislative process page's bill path runs past six screens, which capped
 * it under a 0.15 threshold and left the section stuck at opacity 0 no matter
 * how far you scrolled. `some` asks only that any part of it has crossed the
 * line.
 *
 * The delay stays in milliseconds — every existing call site passes
 * `delay={80}` — and is converted at the boundary.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
	return (
		<motion.div
			data-anim=''
			className={className}
			initial={{ opacity: 0, y: 22 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 'some', margin: '0px 0px -10% 0px' }}
			transition={{ duration: 0.75, delay: delay / 1000, ease: EASE }}
		>
			{children}
		</motion.div>
	)
}
