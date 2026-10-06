'use client'

import { motion, useReducedMotion } from 'motion/react'
import { EASE } from '@betterbarmm/editorial'

/**
 * The masthead background: scattered public data flowing into one record.
 *
 * Round the band, kinds of source — a table, a chart, a map, a database, a
 * ballot, a budget — drawn as bare line glyphs, not cards: they are what the
 * record is made of, not more records. From each a faint line curves in to the
 * hub, and small marks travel along it without stopping. The hub is the site:
 * the one place they all land.
 *
 * It is the band's background rather than a column, so it runs nearly edge to
 * edge. The hub sits right of the headline; the sources that fall behind the
 * type are drawn dimmer so the words stay on top. The 3% inset keeps it off
 * the band's edges, and the hub carries a glow instead of a border.
 *
 * The travel is SMIL (`animateMotion`) rather than JS: it rides the paths
 * themselves, costs nothing per frame, and keeps going without a render loop.
 * Under reduced motion the lines stay and nothing travels on them.
 *
 * `aria-hidden` throughout. The headline already says all of this.
 */

const W = 1400
const H = 620
const CX = 1040
const CY = 310
/** Where a line meets the hub. */
const HUB_R = 84

/** Line glyphs, each drawn in a 48-unit box centred on the origin. */
const GLYPHS = {
  table: (
    <>
      <rect x={-20} y={-16} width={40} height={32} rx={3} />
      <path d='M-20 -5 H20 M-20 6 H20 M-6 -16 V16' />
    </>
  ),
  chart: (
    <>
      <path d='M-20 18 H20' />
      <path d='M-13 18 V4 M-3 18 V-6 M7 18 V-1 M17 18 V-14' strokeWidth={4} />
    </>
  ),
  map: (
    <>
      <path d='M0 20 C-12 6 -14 -2 -14 -6 A14 14 0 0 1 14 -6 C14 -2 12 6 0 20 Z' />
      <circle cx={0} cy={-6} r={5} />
    </>
  ),
  database: (
    <>
      <ellipse cx={0} cy={-13} rx={16} ry={6} />
      <path d='M-16 -13 V13 A16 6 0 0 0 16 13 V-13 M-16 0 A16 6 0 0 0 16 0' />
    </>
  ),
  ballot: (
    <>
      <rect x={-16} y={-18} width={32} height={36} rx={3} />
      <path d='M-8 0 L-2 6 L9 -7' />
    </>
  ),
  budget: (
    <>
      <circle r={18} />
      <path d='M-5 10 V-9 H2 A5 5 0 0 1 2 1 H-5 M-9 -6 H9 M-9 -2 H9' />
    </>
  ),
} as const

/** Each source: its glyph, where it sits, and whether it falls behind the type. */
const SOURCES: { glyph: keyof typeof GLYPHS; x: number; y: number; dim?: boolean }[] = [
  { glyph: 'database', x: 90, y: 60, dim: true },
  { glyph: 'chart', x: 70, y: 570, dim: true },
  { glyph: 'map', x: 760, y: 80 },
  { glyph: 'ballot', x: 780, y: 545 },
  { glyph: 'chart', x: 1330, y: 75 },
  { glyph: 'table', x: 1355, y: 320 },
  { glyph: 'budget', x: 1320, y: 555 },
]

/** One decimal: server and browser disagree in the last digits of trig. */
const r = (n: number) => Math.round(n * 10) / 10

/** A curve from a source to the hub's rim, bowing so the lines don't read as spokes. */
const route = (sx: number, sy: number, i: number) => {
  const a = Math.atan2(sy - CY, sx - CX)
  const tx = CX + Math.cos(a) * HUB_R
  const ty = CY + Math.sin(a) * HUB_R
  const bow = i % 2 ? 60 : -60
  const mx = (sx + tx) / 2 - Math.sin(a) * bow
  const my = (sy + ty) / 2 + Math.cos(a) * bow
  return `M${sx} ${sy} Q${r(mx)} ${r(my)} ${r(tx)} ${r(ty)}`
}

/** Seconds a mark takes from its source to the hub, before distance is counted. */
const TRAVEL = 3.6
/** Marks in flight on each line at once. */
const PER_LINE = 3

export function HeroGraphic({ className = '' }: { className?: string }) {
  const reduced = useReducedMotion()

  return (
    <div
      aria-hidden='true'
      className={`hero-graphic pointer-events-none ${className}`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className='size-full overflow-visible'>
        <defs>
          <radialGradient id='hg-glow'>
            <stop offset='0%' stopColor='var(--brass)' stopOpacity={0.26} />
            <stop offset='100%' stopColor='var(--brass)' stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* ---- The glow the hub sits in ---- */}
        <circle cx={CX} cy={CY} r={300} fill='url(#hg-glow)' />

        {/* ---- The lines in ---- */}
        <g fill='none' stroke='var(--brass)' strokeWidth={1.4} strokeDasharray='2 8' strokeLinecap='round'>
          {SOURCES.map((s, i) => (
            <motion.path
              key={i}
              id={`hg-route-${i}`}
              d={route(s.x, s.y, i)}
              strokeOpacity={s.dim ? 0.18 : 0.35}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.06, ease: EASE }}
            />
          ))}
        </g>

        {/* ---- The sources ---- */}
        {SOURCES.map((s, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 + i * 0.06, ease: EASE }}
          >
            <g
              transform={`translate(${s.x} ${s.y}) scale(1.6)`}
              fill='none'
              stroke='var(--ink-3)'
              strokeOpacity={s.dim ? 0.3 : 0.75}
              strokeWidth={1.6}
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              {GLYPHS[s.glyph]}
            </g>
          </motion.g>
        ))}

        {/* ---- Marks in flight ---- */}
        {reduced
          ? null
          : SOURCES.flatMap((s, i) =>
              Array.from({ length: PER_LINE }, (_, k) => {
                // Longer lines take longer, so the marks keep one pace.
                const dur = r(TRAVEL * (Math.hypot(s.x - CX, s.y - CY) / 420))
                const begin = `${r(1.2 + i * 0.4 + (k * dur) / PER_LINE)}s`
                // Mixed shapes: what arrives is not all one kind of thing.
                const mark =
                  (i + k) % 3 === 0 ? (
                    <circle r={5} />
                  ) : (i + k) % 3 === 1 ? (
                    <rect x={-4.5} y={-4.5} width={9} height={9} rx={1.5} />
                  ) : (
                    <path d='M0 -6 L6 0 L0 6 L-6 0 Z' />
                  )
                const peak = s.dim ? 0.45 : 0.9
                return (
                  <g key={`${i}-${k}`} opacity={0} fill='var(--brass)'>
                    {mark}
                    <animateMotion
                      dur={`${dur}s`}
                      begin={begin}
                      repeatCount='indefinite'
                      calcMode='spline'
                      keyTimes='0;1'
                      keyPoints='0;1'
                      keySplines='0.45 0 0.55 1'
                    >
                      <mpath href={`#hg-route-${i}`} />
                    </animateMotion>
                    <animate
                      attributeName='opacity'
                      dur={`${dur}s`}
                      begin={begin}
                      repeatCount='indefinite'
                      values={`0;${peak};${peak};0`}
                      keyTimes='0;0.12;0.88;1'
                    />
                  </g>
                )
              }),
            )}

        {/* ---- The hub they land in ---- */}
        <motion.g
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
        >
          {/* A slow ring off the hub: something is always arriving. */}
          {reduced ? null : (
            <motion.circle
              cx={CX}
              cy={CY}
              r={HUB_R}
              fill='none'
              stroke='var(--brass)'
              strokeWidth={1.2}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              initial={{ scale: 1, opacity: 0.45 }}
              animate={{ scale: 1.7, opacity: 0 }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut', delay: 1.4 }}
            />
          )}

          <circle
            cx={CX}
            cy={CY}
            r={HUB_R}
            fill='var(--hg-doc)'
            fillOpacity={0.7}
            stroke='var(--brass)'
            strokeOpacity={0.45}
            strokeWidth={1.2}
          />

          {/* The record: a few ruled lines, one of them found. */}
          <g transform={`translate(${CX} ${CY}) scale(1.4)`}>
            <g fill='none' strokeLinecap='round' strokeWidth={2}>
              <path d='M-24 -18 H24' stroke='var(--brass)' strokeWidth={2.5} />
              <path d='M-24 -6 H18' stroke='var(--ink-3)' strokeOpacity={0.4} />
              <path d='M-24 18 H12' stroke='var(--ink-3)' strokeOpacity={0.4} />
            </g>
            <motion.rect
              x={-24}
              y={2}
              width={40}
              height={9}
              rx={1.5}
              fill='var(--hg-mark)'
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'left center' }}
              transition={{ duration: 0.55, delay: 0.9, ease: EASE }}
            />
          </g>
        </motion.g>
      </svg>
    </div>
  )
}
