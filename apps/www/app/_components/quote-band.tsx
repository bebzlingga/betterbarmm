'use client'

import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { PhotoCredit } from './discover-figure'
import type { DiscoverPhoto } from './discover-media'
import { EASE } from '@betterbarmm/editorial'

/**
 * A full-bleed photograph with one sentence set over it.
 *
 * It exists to break a long page of argument. Three sections of reasoning in a
 * row is where a reader leaves, and the fix is not a shorter section — it is a
 * moment with no reading in it at all, followed by the one sentence the
 * preceding section was actually about.
 *
 * The picture drifts against the scroll, which is what stops a static band from
 * reading as a banner ad. The travel is small and the image is overscaled to
 * cover it; a photograph that visibly slides out of its own frame is describing
 * a bug, not depth.
 */
export function QuoteBand({
  photo,
  quote,
  attribution,
  height = 'tall',
}: {
  photo: DiscoverPhoto
  quote: string
  /** The line under the quote — what it is a claim about, or where it comes from. */
  attribution?: string
  /** `tall` for a section break, `short` for a seam between two close blocks. */
  height?: 'tall' | 'short'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-9%', '9%'])

  return (
    <section
      ref={ref}
      className={`bb-frame bb-scrim relative w-full overflow-hidden ${
        height === 'tall' ? 'min-h-[26rem] py-28 lg:py-40' : 'min-h-[20rem] bb-section'
      }`}
    >
      {/* No negative z-index here. `.bb-frame` sets `overflow: clip`, which does
          not open a stacking context, so a child at `z-index: -1` paints behind
          the section's own background and the photograph disappears under it —
          leaving the scrim gradient over bare paper, which looks convincingly
          like an image that failed to load. The scrim is a `::after`, so it
          already paints over an ordinary child. */}
      <motion.div
        className='absolute inset-0'
        style={reduced ? undefined : { y, scale: 1.2 }}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes='100vw'
          placeholder='blur'
          className='object-cover'
        />
      </motion.div>

      <div className='bb-container relative z-2'>
        <motion.blockquote
          data-anim=''
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: EASE }}
          className='max-w-4xl'
        >
          {/* The rule is brass rather than white: over a photograph, a white
              rule beside white type reads as part of the same mark, and the
              quote stops having an edge. */}
          <span
            aria-hidden='true'
            className='mb-8 block h-px w-16 bg-[var(--brass)]'
          />
          <p className='bb-over text-[1.6rem] font-extrabold leading-[1.16] tracking-[-0.035em] text-white sm:text-[2.4rem] lg:text-[3rem]'>
            {quote}
          </p>
          {attribution ? (
            <footer className='mt-8 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70'>
              {attribution}
            </footer>
          ) : null}
        </motion.blockquote>
      </div>

      <PhotoCredit photo={photo} />
    </section>
  )
}
