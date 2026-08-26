'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { EASE } from '@betterbarmm/editorial'

/**
 * The masthead artwork: scattered sheets, one record, and the figures it turns
 * into.
 *
 * It replaces three photographs. The photographs were saying "this is the
 * place", which is the right thing for Discover to say and the wrong thing at
 * the front of a records project — a mosque and a sandbar promise a travel
 * guide. This draws what the headline claims instead, in three layers that read
 * left to right and back to front:
 *
 *   · behind, a fan of loose sheets — the record as it is published, across
 *     six archives, in no order
 *   · in the middle, one document, ruled and headed, with a single line picked
 *     out in crimson — the record found
 *   · in front, a small plate of figures rising off it — the record made
 *     usable, which is the sentence beside it
 *
 * Line art rather than a photograph of paper: this is a diagram of what the
 * site does, and a diagram that photographs itself is just a picture of a desk.
 * The brass is the ornament and the furniture; the crimson appears exactly
 * twice, on the line that has been found and the bar it becomes.
 *
 * `aria-hidden` throughout. The headline beside it already says all of this.
 */

/** Ruled lines on a sheet: [y, from, to]. */
const SHEET_RULES: [number, number, number][] = [
  [64, 34, 200],
  [88, 34, 176],
  [112, 34, 200],
  [136, 34, 152],
]

/** The body of the record: [y, from, to]. */
const DOC_RULES: [number, number, number][] = [
  [214, 184, 436],
  [240, 184, 418],
  [266, 184, 436],
  [318, 184, 436],
  [344, 184, 424],
  [370, 184, 352],
  [428, 184, 436],
  [454, 184, 406],
  [480, 184, 330],
]

/** The figures: [x, top]. Each bar is 30 wide and stands on the baseline. */
const BARS: [number, number][] = [
  [76, 598],
  [118, 570],
  [160, 542],
  [202, 508],
]

const BASELINE = 632

export function HeroGraphic({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  // Unequal on purpose. Matched speeds read as one flat plane sliding; it is
  // the difference between them that reads as depth.
  const sheets = useTransform(scrollYProgress, [0, 1], [26, -26])
  const doc = useTransform(scrollYProgress, [0, 1], [-34, 34])
  const plate = useTransform(scrollYProgress, [0, 1], [58, -58])

  /** A stroke that travels rather than appears. */
  const draw = (delay: number, duration = 0.7) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: {
      pathLength: { duration, delay, ease: EASE },
      opacity: { duration: 0.2, delay },
    },
  })

  return (
    <div ref={ref} aria-hidden='true' className={`relative aspect-[5/6] w-full ${className}`}>
      {/* The viewBox is shifted, not the geometry. Content spans x 40–536 of a
          600-wide box, so a plain `0 0 600 720` left a hundred pixels of dead
          air down the right-hand edge and the whole composition read as
          drifting away from the page edge it should be anchored to. Moving the
          window instead keeps every coordinate below readable as itself. */}
      <svg viewBox='-64 0 600 720' className='size-full overflow-visible'>
        {/* ---- The record as published: loose, and more than one ---- */}
        <motion.g style={reduced ? undefined : { y: sheets }}>
          {[
            { x: 196, y: 22, rotate: -8 },
            { x: 302, y: 54, rotate: 5 },
          ].map((sheet, index) => (
            <motion.g
              key={index}
              transform={`translate(${sheet.x} ${sheet.y}) rotate(${sheet.rotate} 117 190)`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15 + index * 0.12, ease: EASE }}
            >
              <path
                d='M0 0 H234 V380 H0 Z'
                fill='var(--paper-2)'
                stroke='var(--rule)'
                strokeWidth={1.5}
              />
              <g stroke='var(--ink-3)' strokeOpacity={0.3} strokeWidth={1.5} strokeLinecap='round'>
                {SHEET_RULES.map(([y, from, to]) => (
                  <path key={y} d={`M${from} ${y} H${to}`} />
                ))}
              </g>
            </motion.g>
          ))}
        </motion.g>

        {/* ---- The record found ---- */}
        <motion.g style={reduced ? undefined : { y: doc }}>
          <motion.path
            d='M150 110 H470 V560 H150 Z'
            fill='var(--paper)'
            stroke='var(--ink)'
            strokeOpacity={0.55}
            strokeWidth={1.8}
            initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0% 0 0 0)' }}
            transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
          />

          <g fill='none' strokeLinecap='round'>
            {/* The letterhead: a brass rule the width of the page, and the
                site's own diamond where a seal would sit. */}
            <motion.path
              d='M184 150 H436'
              stroke='var(--brass)'
              strokeWidth={2.5}
              {...draw(0.62, 0.8)}
            />
            <motion.path
              d='M184 182 H436'
              stroke='var(--brass)'
              strokeOpacity={0.5}
              strokeWidth={1.2}
              {...draw(0.72, 0.8)}
            />

            <g stroke='var(--ink-3)' strokeOpacity={0.38} strokeWidth={2}>
              {DOC_RULES.map(([y, from, to], index) => (
                <motion.path
                  key={y}
                  d={`M${from} ${y} H${to}`}
                  {...draw(0.85 + index * 0.055, 0.5)}
                />
              ))}
            </g>

            {/* The line that was being looked for. It is the only thing in the
                picture that is filled rather than drawn — found, not read. */}
            <motion.path
              d='M184 285 H372 V301 H184 Z'
              fill='var(--accent)'
              stroke='none'
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'left center' }}
              transition={{ duration: 0.7, delay: 1.25, ease: EASE }}
            />

            <motion.path
              d='M184 512 H436'
              stroke='var(--brass)'
              strokeOpacity={0.5}
              strokeWidth={1.2}
              {...draw(1.4, 0.6)}
            />
            <motion.path
              d='M192 528 L204 540 L192 552 L180 540 Z'
              fill='var(--brass)'
              stroke='none'
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              transition={{ duration: 0.5, delay: 1.5, ease: EASE }}
            />
            <motion.path
              d='M220 540 H320'
              stroke='var(--brass)'
              strokeOpacity={0.6}
              strokeWidth={2}
              {...draw(1.55, 0.5)}
            />
          </g>
        </motion.g>

        {/* ---- The record made usable ---- */}
        <motion.g style={reduced ? undefined : { y: plate }}>
          <motion.g
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.05, ease: EASE }}
          >
            <path d='M40 466 H288 V672 H40 Z' fill='var(--paper-2)' stroke='none' />
            <path d='M40 466 H288' stroke='var(--brass)' strokeWidth={2} />

            <g fill='none' stroke='var(--brass)' strokeOpacity={0.55} strokeWidth={2}>
              <motion.path d='M64 498 H136' {...draw(1.3, 0.45)} />
            </g>

            {BARS.map(([x, top], index) => (
              <motion.path
                key={x}
                d={`M${x} ${top} H${x + 30} V${BASELINE} H${x} Z`}
                fill={index === BARS.length - 1 ? 'var(--accent)' : 'var(--brass)'}
                fillOpacity={index === BARS.length - 1 ? 1 : 0.42}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                style={{ transformBox: 'fill-box', transformOrigin: 'bottom center' }}
                transition={{ duration: 0.7, delay: 1.35 + index * 0.1, ease: EASE }}
              />
            ))}

            <motion.path
              d={`M56 ${BASELINE} H272`}
              fill='none'
              stroke='var(--ink)'
              strokeOpacity={0.5}
              strokeWidth={2}
              {...draw(1.3, 0.6)}
            />
          </motion.g>
        </motion.g>
      </svg>
    </div>
  )
}
