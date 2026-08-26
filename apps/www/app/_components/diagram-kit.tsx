'use client'

import { motion, useInView } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { EASE } from '@betterbarmm/editorial'

/* ============================================================
   The drawing kit

   One vocabulary, shared by every diagram on the site: thin
   strokes, right angles, and the rotated square that stands for a
   record everywhere here — timeline markers, marquee dots, the
   method diagrams, the audience cards.

   It lived inside `method-diagram.tsx` while the method was the only
   thing drawn. A second set of diagrams would have meant a second
   copy of these three, and two copies of a vocabulary drift the
   first time one of them is tuned.
   ============================================================ */

const STROKE = {
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/**
 * A drawing that draws itself once, the first time it is scrolled to.
 *
 * `pathLength` normalises every path to 0–1 regardless of its real length, so
 * a 20px tick and a 140px rail finish together without either being measured.
 */
export function Drawn({
  children,
  className = '',
}: {
  children: (drawn: boolean) => ReactNode
  className?: string
}) {
  const ref = useRef<SVGSVGElement>(null)
  const drawn = useInView(ref, { once: true, amount: 0.6 })

  return (
    <svg
      ref={ref}
      viewBox='0 0 160 116'
      aria-hidden='true'
      className={`block h-[116px] w-[160px] overflow-visible ${className}`}
    >
      {children(drawn)}
    </svg>
  )
}

/** A path that travels rather than appears. */
export function Stroke({
  d,
  drawn,
  delay = 0,
  duration = 0.7,
  color = 'var(--ink)',
  width = 1.5,
  dashed = false,
}: {
  d: string
  drawn: boolean
  delay?: number
  duration?: number
  color?: string
  width?: number
  dashed?: boolean
}) {
  return (
    <motion.path
      d={d}
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dashed ? '3 4' : undefined}
      {...STROKE}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={drawn ? { pathLength: 1, opacity: 1 } : undefined}
      transition={{
        pathLength: { duration, delay, ease: EASE },
        opacity: { duration: 0.16, delay },
      }}
    />
  )
}

/** The record mark — a square on its corner, the same shape the timeline uses. */
export function Node({
  x,
  y,
  drawn,
  delay = 0,
  size = 9,
  filled = true,
  color = 'var(--accent)',
}: {
  x: number
  y: number
  drawn: boolean
  delay?: number
  size?: number
  filled?: boolean
  color?: string
}) {
  return (
    <motion.rect
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      transform={`rotate(45 ${x} ${y})`}
      fill={filled ? color : 'var(--paper)'}
      stroke={color}
      strokeWidth={1.5}
      initial={{ scale: 0, opacity: 0 }}
      animate={drawn ? { scale: 1, opacity: 1 } : undefined}
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    />
  )
}
