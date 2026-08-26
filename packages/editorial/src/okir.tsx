'use client'

import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import {
  OKIR_BLOOM_CORE,
  OKIR_BLOOM_PETAL,
  OKIR_BLOOM_PETALS,
  OKIR_BLOOM_RINGS,
  OKIR_BLOOM_SPOKES,
  OKIR_BLOOM_STUD,
  OKIR_BLOOM_STUDS,
  OKIR_BLOOM_VIEWBOX,
  OKIR_CORNER,
  OKIR_CORNER_VIEWBOX,
  OKIR_RULE_CENTRE,
  OKIR_RULE_LEFT,
  OKIR_RULE_VIEWBOX,
} from './okir-paths'

/* ============================================================
   Okir, drawn

   Every motif here arrives by being drawn rather than by fading in.
   That is not a flourish for its own sake: okir is carved, and a
   carved line has a direction and an order. A stroke that appears
   whole is a printed line; a stroke that travels is a cut one.

   Motion's `pathLength` does the work — it normalises every path to a
   0–1 length, so a 40px curl and a 400px beam finish together without
   anyone measuring either. Under `prefers-reduced-motion` the root
   layout's `MotionConfig reducedMotion="user"` collapses the animation
   and the path is simply present, which is what it is for anyway.

   All of it is `aria-hidden`. None of it carries information.
   ============================================================ */

/** The shared stroke settings. Authored to be stroked; a filled okir smudges. */
const STROKE = {
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

type Drawable = {
  /** Seconds the whole motif takes to draw. */
  duration?: number
  /** Seconds before it starts. */
  delay?: number
  className?: string
}

/**
 * A hook that reports the first time an element scrolls near the viewport,
 * and then stops watching.
 *
 * `once` matters here more than it does for a fade: a rule that redraws itself
 * every time it passes the fold reads as a loading state.
 */
function useDrawn() {
  const ref = useRef<SVGSVGElement>(null)
  // The threshold is deliberately near zero. A bloom is positioned to bleed off
  // two edges of its section, so only a fraction of it is ever on screen — ask
  // for 40% of the element and the medallion never draws at all, which is how
  // the first cut of this shipped with an invisible ornament on every masthead.
  const drawn = useInView(ref, { once: true, amount: 0.02 })
  return { ref, drawn }
}

/**
 * The running rule — a beam with a fern at its centre and a scroll running out
 * to each edge.
 *
 * It replaces a 1px divider at the seam between two sections that both matter.
 * Not every seam gets one: used on all of them it would be wallpaper, and the
 * point of ornament is that it marks something.
 */
export function OkirRule({ duration = 1.6, delay = 0, className = '' }: Drawable) {
  const { ref, drawn } = useDrawn()

  const half = OKIR_RULE_LEFT.map((d, index) => (
    <motion.path
      key={d}
      d={d}
      {...STROKE}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={drawn ? { pathLength: 1, opacity: 1 } : undefined}
      transition={{
        pathLength: { duration: duration * 0.5, delay: delay + 0.25 + index * 0.1, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.2, delay: delay + 0.25 + index * 0.1 },
      }}
    />
  ))

  return (
    // A hairline out to both page edges with the carving centred on it. The
    // rules draw outward from the middle and the motif follows them, so the
    // whole thing reads as one cut travelling along a beam rather than as three
    // elements appearing together.
    <div className={`flex items-center ${className}`} aria-hidden='true'>
      <motion.span
        className='h-px flex-1 origin-right bg-[var(--brass-line)]'
        initial={{ scaleX: 0 }}
        animate={drawn ? { scaleX: 1 } : undefined}
        transition={{ duration: duration * 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      />

      <svg
        ref={ref}
        viewBox={OKIR_RULE_VIEWBOX}
        // The motif keeps its own proportions. Stretched to the page width it
        // squashed to half its height and stopped reading as a carving.
        className='h-11 w-auto shrink-0 text-[var(--brass)]'
      >
        <g stroke='currentColor' strokeWidth={1.4} strokeOpacity={0.8}>
          {half}
          {/* The right half is the left one mirrored about the centre line. */}
          <g transform='translate(360 0) scale(-1 1)'>{half}</g>

          {OKIR_RULE_CENTRE.map((d, index) => (
            <motion.path
              key={d}
              d={d}
              {...STROKE}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={drawn ? { pathLength: 1, opacity: 1 } : undefined}
              transition={{
                pathLength: {
                  duration: duration * 0.45,
                  delay: delay + 0.55 + index * 0.09,
                  ease: [0.16, 1, 0.3, 1],
                },
                opacity: { duration: 0.2, delay: delay + 0.55 + index * 0.09 },
              }}
            />
          ))}
        </g>
      </svg>

      <motion.span
        className='h-px flex-1 origin-left bg-[var(--brass-line)]'
        initial={{ scaleX: 0 }}
        animate={drawn ? { scaleX: 1 } : undefined}
        transition={{ duration: duration * 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

/**
 * The medallion: three rings, a ring of lancet petals, a band of studs, and a
 * diamond at the centre.
 *
 * Positioned absolutely by the caller and held at very low opacity. It exists
 * to give a large empty masthead something happening in it; the moment it is
 * legible enough to read as a picture it is too loud.
 *
 * It also turns, very slowly and forever. A static medallion is a watermark;
 * one that moves a degree every few seconds is a thing the page is doing.
 *
 * Petals draw individually — the ring being laid down one leaf at a time is
 * the whole arrival. The studs and the spokes fade in as two groups instead:
 * there are twenty-four of them, they are four pixels across at this opacity,
 * and animating each one's path length would cost a great deal of frame budget
 * for something no reader could resolve.
 */
export function OkirBloom({
  className = '',
  duration = 3.2,
  delay = 0,
  spin = true,
}: Drawable & { spin?: boolean }) {
  const { ref, drawn } = useDrawn()

  return (
    <motion.svg
      ref={ref}
      viewBox={OKIR_BLOOM_VIEWBOX}
      aria-hidden="true"
      className={`pointer-events-none select-none text-[var(--brass)] ${className}`}
      animate={spin ? { rotate: 360 } : undefined}
      transition={spin ? { duration: 240, repeat: Infinity, ease: 'linear' } : undefined}
    >
      <g stroke="currentColor" strokeWidth={1} {...STROKE}>
        {OKIR_BLOOM_RINGS.map((r, index) => (
          <motion.circle
            key={r}
            cx={200}
            cy={200}
            r={r}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={drawn ? { pathLength: 1, opacity: 1 } : undefined}
            transition={{
              pathLength: { duration: duration * 0.6, delay: delay + index * 0.12, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.3, delay: delay + index * 0.12 },
            }}
          />
        ))}

        {/* The petals, laid down one after another round the circle, so the
            ring is built rather than switched on. */}
        {Array.from({ length: OKIR_BLOOM_PETALS }, (_, petal) =>
          OKIR_BLOOM_PETAL.map((d, index) => (
            <motion.path
              key={`${petal}-${index}`}
              d={d}
              transform={`rotate(${(360 / OKIR_BLOOM_PETALS) * petal} 200 200)`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={drawn ? { pathLength: 1, opacity: 1 } : undefined}
              transition={{
                pathLength: {
                  duration: duration * 0.4,
                  delay: delay + 0.28 + petal * 0.055 + index * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                },
                opacity: { duration: 0.3, delay: delay + 0.28 + petal * 0.055 + index * 0.05 },
              }}
            />
          )),
        )}

        {/* The woven band, and the centre. */}
        <motion.g
          initial={{ opacity: 0, scale: 0.94 }}
          animate={drawn ? { opacity: 1, scale: 1 } : undefined}
          style={{ transformOrigin: '200px 200px' }}
          transition={{ duration: 0.8, delay: delay + 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {Array.from({ length: OKIR_BLOOM_STUDS }, (_, stud) => (
            <path
              key={stud}
              d={OKIR_BLOOM_STUD}
              transform={`rotate(${(360 / OKIR_BLOOM_STUDS) * stud} 200 200)`}
            />
          ))}

          {Array.from({ length: OKIR_BLOOM_SPOKES }, (_, spoke) =>
            OKIR_BLOOM_CORE.map((d, index) => (
              // The centre diamond is drawn once; only the spoke repeats.
              index === 0 && spoke > 0 ? null : (
                <path
                  key={`${spoke}-${index}`}
                  d={d}
                  transform={`rotate(${(360 / OKIR_BLOOM_SPOKES) * spoke} 200 200)`}
                />
              )
            )),
          )}
        </motion.g>
      </g>
    </motion.svg>
  )
}

/**
 * The corner mark — an angle with one scroll turning out of it.
 *
 * Four of them under a rotation frame a panel without giving it a border. Used
 * on the one block per page that carries weight; on every block it would just
 * be a border drawn the long way round.
 */
export function OkirCorner({
  position = 'top-left',
  className = '',
}: {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  className?: string
}) {
  const place = {
    'top-left': 'left-0 top-0',
    'top-right': 'right-0 top-0 rotate-90',
    'bottom-right': 'bottom-0 right-0 rotate-180',
    'bottom-left': 'bottom-0 left-0 -rotate-90',
  }[position]

  return (
    <svg
      viewBox={OKIR_CORNER_VIEWBOX}
      aria-hidden="true"
      className={`pointer-events-none absolute size-9 text-[var(--brass)] ${place} ${className}`}
    >
      <g stroke="currentColor" strokeWidth={1.2} strokeOpacity={0.8} {...STROKE}>
        {OKIR_CORNER.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  )
}

/**
 * All four corners at once, sized to whatever it is dropped into.
 *
 * The parent needs `position: relative`; nothing here sets it, because the
 * element that wants framing is usually already positioned for other reasons
 * and a second `relative` would be silently redundant.
 */
export function OkirFrame({ className = '' }: { className?: string }) {
  return (
    <>
      <OkirCorner position="top-left" className={className} />
      <OkirCorner position="top-right" className={className} />
      <OkirCorner position="bottom-right" className={className} />
      <OkirCorner position="bottom-left" className={className} />
    </>
  )
}
