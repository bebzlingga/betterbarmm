'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import { useRef } from 'react'
import type { DiscoverPhoto } from './discover-media'
import { EASE } from '@betterbarmm/editorial'

/**
 * Three photographs of the region, arranged as an overlapping cluster and
 * drifting against each other as the page scrolls.
 *
 * It is the one place on the site where the pictures are doing no work beyond
 * being pictures — there is no caption, no locator, no link. That is the point:
 * a reader arriving cold has to see the place before they will care about its
 * appropriations, and three photographs that move independently read as depth,
 * which a flat grid of three never does.
 *
 * The parallax distances are deliberately unequal and small. Equal distances
 * make the cluster one flat plane sliding; large ones make the plates come
 * apart. The middle plate travels against the other two, which is what sells
 * the near-and-far.
 *
 * `alt=""` throughout. The photographs are decorative here; every one of them
 * appears again inside Discover with its caption, its credit, and its licence.
 */
export function PhotoCluster({
  photos,
  className = '',
}: {
  /** Exactly three: the tall lead, the wide second, and the small third. */
  photos: [DiscoverPhoto, DiscoverPhoto, DiscoverPhoto]
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  const lead = useTransform(scrollYProgress, [0, 1], [34, -34])
  const second = useTransform(scrollYProgress, [0, 1], [-46, 46])
  const third = useTransform(scrollYProgress, [0, 1], [58, -58])

  return (
    // An explicit ratio rather than a height taken from whichever plate happens
    // to be in the flow. Every plate is positioned as a percentage of this box,
    // so the composition is the same at 1024px and at 2560px — the first cut
    // sized the box from the lead plate alone and left the other two resolving
    // their percentages against a height that moved with the crop, which put
    // the third plate off the bottom of the section entirely.
    <div ref={ref} className={`relative aspect-[5/6] w-full ${className}`}>
      {/* The lead. Portrait, because at this size a landscape crop of a mosque
          shows the car park. */}
      <motion.div
        style={reduced ? undefined : { y: lead }}
        initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
        animate={{ opacity: 1, clipPath: 'inset(0% 0 0 0)' }}
        transition={{ duration: 1.1, delay: 0.25, ease: EASE }}
        className='bb-frame bb-drift absolute right-0 top-0 h-[68%] w-[74%]'
      >
        <Image
          src={photos[0].src}
          alt=''
          priority
          sizes='(min-width: 1024px) 28vw, 60vw'
          placeholder='blur'
          className='size-full object-cover'
        />
      </motion.div>

      {/* The second, overlapping the lead's lower-left corner. The overlap is
          what makes it a cluster rather than a column. */}
      <motion.div
        style={reduced ? undefined : { y: second }}
        initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
        animate={{ opacity: 1, clipPath: 'inset(0% 0 0 0)' }}
        transition={{ duration: 1.1, delay: 0.45, ease: EASE }}
        className='bb-frame absolute bottom-[4%] left-0 h-[40%] w-[56%]'
      >
        <Image
          src={photos[1].src}
          alt=''
          sizes='(min-width: 1024px) 20vw, 46vw'
          placeholder='blur'
          className='size-full object-cover'
        />
      </motion.div>

      {/* The third is small, sits off to the right, and travels furthest — the
          one that reads as nearest to the reader. */}
      <motion.div
        style={reduced ? undefined : { y: third }}
        initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
        animate={{ opacity: 1, clipPath: 'inset(0% 0 0 0)' }}
        transition={{ duration: 1.1, delay: 0.65, ease: EASE }}
        className='bb-frame absolute bottom-[13%] right-[4%] hidden h-[22%] w-[30%] sm:block'
      >
        <Image
          src={photos[2].src}
          alt=''
          sizes='(min-width: 1024px) 11vw, 24vw'
          placeholder='blur'
          className='size-full object-cover'
        />
      </motion.div>
    </div>
  )
}
