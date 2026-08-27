'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { EASE, IN_VIEW } from '@betterbarmm/editorial'

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
 * This is the older name for what `Rise` in @betterbarmm/editorial now does, kept
 * because it is called from a couple of dozen places across Discover and the
 * LGU directory and a rename would be a diff with no reader on the other end of
 * it. It delegates rather than reimplementing, so both arrive with the same
 * distance, the same duration, and the same curve.
 *
 * The delay stays in milliseconds here — every existing call site passes
 * `delay={90}` — and is converted at the boundary. The trigger line is
 * `IN_VIEW` rather than a local one, so a block does not arrive at a different
 * point on the screen depending on which of the two names wrapped it.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      data-anim=""
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={IN_VIEW}
      transition={{ duration: 0.6, delay: delay / 1000, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
