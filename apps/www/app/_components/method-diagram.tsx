'use client'

import { motion } from 'motion/react'
import { Drawn, Node, Stroke } from './diagram-kit'

/* ============================================================
   The method, drawn

   Three principles that used to be an icon, a heading, and a
   paragraph. The icon was doing nothing — a duotone database glyph
   beside the words "start with the record" is a picture of the noun,
   not of the claim.

   These are diagrams instead. Each one draws the actual move the
   principle describes: a document becoming a record, a record picking
   up its context, a record being checked and re-checked. They share
   one vocabulary so the three read as a sequence rather than as three
   illustrations — thin strokes, right angles, and the rotated square
   that stands for a record everywhere on this site, from the timeline
   markers to the marquee dots.

   All three are `aria-hidden`. The heading and the paragraph beside
   them carry the meaning; these carry the emphasis.
   ============================================================ */

/**
 * Source-first — three documents collapsing into one record.
 *
 * The three sheets are the PDFs, the datasets, the gazette pages; the rail
 * carries them to the single mark on the right. It draws left to right because
 * that is the direction the claim runs: the record comes *from* the sources,
 * not the other way round.
 */
export function SourceDiagram() {
  return (
    <Drawn>
      {(drawn) => (
        <>
          {/* Three sheets, stacked back to front. */}
          <Stroke d='M14 26 H54 V78 H14 Z' drawn={drawn} delay={0} color='var(--rule)' />
          <Stroke d='M20 20 H60 V72 H20 Z' drawn={drawn} delay={0.1} color='var(--ink-3)' />
          <Stroke d='M26 14 H66 V66 H26 Z' drawn={drawn} delay={0.2} color='var(--ink)' />

          {/* Ruled lines on the front sheet — a page, not a box. */}
          <Stroke d='M34 28 H58' drawn={drawn} delay={0.4} duration={0.35} color='var(--brass)' width={1.2} />
          <Stroke d='M34 38 H58' drawn={drawn} delay={0.47} duration={0.35} color='var(--rule)' width={1.2} />
          <Stroke d='M34 48 H50' drawn={drawn} delay={0.54} duration={0.35} color='var(--rule)' width={1.2} />

          {/* The rail out to the record. */}
          <Stroke d='M66 40 H118' drawn={drawn} delay={0.6} color='var(--brass)' width={1.4} />
          <Node x={130} y={40} drawn={drawn} delay={1.1} size={16} />

          {/* And the trail back, dashed — the source stays openable. */}
          <Stroke
            d='M130 56 V92 H46 V72'
            drawn={drawn}
            delay={1.25}
            duration={0.8}
            color='var(--brass)'
            width={1.2}
            dashed
          />
        </>
      )}
    </Drawn>
  )
}

/**
 * Context — one record picking up what it needs to be read.
 *
 * The mark is at the centre and the annotations arrive around it: the date, the
 * label, the note, the source. Each one is a rule that ends in a small tick, so
 * the diagram reads as a record being annotated rather than as a hub and
 * spokes.
 */
export function ContextDiagram() {
  return (
    <Drawn>
      {(drawn) => (
        <>
          <Node x={80} y={58} drawn={drawn} delay={0} size={18} />

          {/* Four annotations, drawn in reading order rather than clockwise. */}
          <Stroke d='M80 44 V22 H30' drawn={drawn} delay={0.35} color='var(--ink-3)' width={1.2} />
          <Stroke d='M24 22 H14' drawn={drawn} delay={0.7} duration={0.3} color='var(--brass)' width={2} />

          <Stroke d='M94 58 H140' drawn={drawn} delay={0.5} color='var(--ink-3)' width={1.2} />
          <Stroke d='M140 50 V66' drawn={drawn} delay={0.85} duration={0.3} color='var(--brass)' width={2} />

          <Stroke d='M80 72 V94 H34' drawn={drawn} delay={0.65} color='var(--ink-3)' width={1.2} />
          <Stroke d='M28 94 H14' drawn={drawn} delay={1} duration={0.3} color='var(--brass)' width={2} />

          <Stroke d='M66 58 H30 V38' drawn={drawn} delay={0.8} color='var(--ink-3)' width={1.2} />
          <Node x={30} y={30} drawn={drawn} delay={1.15} size={7} filled={false} color='var(--brass)' />
        </>
      )}
    </Drawn>
  )
}

/**
 * Living data — the loop.
 *
 * A closed circuit with the record on it and an arrowhead saying which way it
 * runs. The one thing this has to communicate is that the cycle does not stop:
 * names change, figures are revised, an office-holder leaves. So the ring is
 * the only element on any of the three diagrams that keeps moving after it has
 * drawn — a slow, permanent rotation of the marker around the circuit.
 */
export function LivingDiagram() {
  return (
    <Drawn>
      {(drawn) => (
        <>
          {/* The circuit. Drawn as two arcs so the gap at the top has somewhere
              for the arrowhead to sit. */}
          <Stroke
            d='M80 14 A44 44 0 1 1 79 14'
            drawn={drawn}
            delay={0}
            duration={1.2}
            color='var(--ink-3)'
            width={1.4}
          />

          {/* The arrowhead, at the top of the ring, pointing clockwise. */}
          <Stroke d='M70 8 L80 14 L70 20' drawn={drawn} delay={1} duration={0.35} color='var(--brass)' width={1.8} />

          {/* Three checkpoints on the circuit — filed, checked, revised. */}
          <Node x={124} y={58} drawn={drawn} delay={1.15} size={8} filled={false} color='var(--brass)' />
          <Node x={80} y={102} drawn={drawn} delay={1.25} size={8} filled={false} color='var(--brass)' />
          <Node x={36} y={58} drawn={drawn} delay={1.35} size={8} filled={false} color='var(--brass)' />

          {/* The record itself, going round. It keeps going after the drawing
              has finished, which is the whole claim. */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={drawn ? { opacity: 1, rotate: 360 } : undefined}
            transition={{
              opacity: { duration: 0.4, delay: 1.4 },
              rotate: { duration: 14, repeat: Infinity, ease: 'linear', delay: 1.4 },
            }}
            style={{ transformOrigin: '80px 58px' }}
          >
            <rect
              x={74}
              y={8}
              width={12}
              height={12}
              transform='rotate(45 80 14)'
              fill='var(--accent)'
            />
          </motion.g>
        </>
      )}
    </Drawn>
  )
}
