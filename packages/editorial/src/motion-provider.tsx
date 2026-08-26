'use client'

import { MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * One motion policy for the whole site.
 *
 * `reducedMotion="user"` is the important part: with it set, every animation
 * the library runs checks the OS preference and drops its transform and layout
 * components, keeping only opacity. That is exactly the right collapse — a
 * reader who has asked for less motion still gets a cross-fade rather than a
 * page that snaps between states, and no component has to remember to handle
 * it. The CSS half of the site collapses in its own media query at the foot of
 * `globals.css`.
 *
 * The transition here is the default for anything that does not name its own,
 * so a component with no `transition` prop still moves like the rest of the
 * site rather than on the library's bouncier stock spring.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </MotionConfig>
  )
}
