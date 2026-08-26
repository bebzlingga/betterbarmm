'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import type { DiscoverPhoto } from './discover-media'
import { EASE, IN_VIEW } from '@betterbarmm/editorial'

/**
 * The attribution mark in the corner of every photograph.
 *
 * Collapsed to a circled "i" until the frame is hovered or the link is focused,
 * then the credit line slides out beside it. Every picture on this site is used
 * under a licence that requires the photographer's name and a link back to the
 * original, and a licence condition is not something to bury in a colophon — so
 * it travels with the image instead.
 */
export function PhotoCredit({ photo }: { photo: DiscoverPhoto }) {
  return (
    <a
      href={photo.source}
      target='_blank'
      rel='noreferrer'
      className='dsc-credit'
      title={`${photo.credit} — ${photo.license}`}
    >
      <span className='dsc-credit-mark' aria-hidden='true'>
        &#9432;
      </span>
      <span className='dsc-credit-body'>
        <span>
          <span>
            {photo.credit} · {photo.license}
          </span>
        </span>
      </span>
      <span className='sr-only'>
        Photo by {photo.credit}, {photo.license}. Open the source file.
      </span>
    </a>
  )
}

type PhotoFrameProps = {
  photo: DiscoverPhoto
  /** Tailwind classes for the frame itself — aspect ratio, spans, position. */
  className?: string
  /** Above-the-fold images should not wait to be scrolled to. */
  priority?: boolean
  sizes?: string
  /** The slow drift. Worth it on a large frame, noise on a thumbnail. */
  kenburns?: boolean
  /** Scale on hover. Set by the parent when the whole card is a link. */
  zoom?: boolean
  /** Stagger in seconds, for a row of frames that should not all wipe in at once. */
  delay?: number
  /** Suppress the corner credit where a caption underneath already carries it. */
  hideCredit?: boolean
  /** Darken the frame so display type can sit over it. */
  scrim?: 'none' | 'soft' | 'full'
  children?: React.ReactNode
}

/**
 * A photograph in a frame that wipes up from its own bottom edge as it arrives,
 * while the image inside settles back from a slight overscale.
 *
 * The two halves are what make it read as a curtain rather than as a fade: the
 * frame fills before the picture stops moving, which is the order a curtain
 * does it in. A single fade on the whole element reads as a slow image load.
 *
 * The clip is on a child, not on the frame itself, and that is not a stylistic
 * choice. An element clipped to `inset(100%)` has no visible area, and an
 * IntersectionObserver watching it reports a ratio of zero however far down the
 * page it is — so an element that hides itself with a clip can never satisfy
 * its own visibility threshold, never animates, and stays invisible forever.
 * The frame is therefore what gets watched, and it is never clipped; the
 * picture inside is what moves.
 *
 * `clipPath` on the wrapper and `scale` on the child are both compositor
 * properties, so a page opening twelve of these at once does not drop frames.
 */
export function PhotoFrame({
  photo,
  className = '',
  priority = false,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  kenburns = false,
  zoom = false,
  delay = 0,
  hideCredit = false,
  scrim = 'none',
  children,
}: PhotoFrameProps) {
  const scrimClass = scrim === 'full' ? ' bb-scrim' : scrim === 'soft' ? ' bb-scrim-soft' : ''

  return (
    <motion.div
      className={`bb-frame${kenburns ? ' bb-drift' : ''}${zoom ? ' bb-zoom' : ''}${scrimClass} ${className}`}
      initial='rest'
      whileInView='go'
      viewport={IN_VIEW}
    >
      <motion.div
        data-anim=''
        className='absolute inset-0'
        variants={{
          rest: { clipPath: 'inset(100% 0 0 0)' },
          go: {
            clipPath: 'inset(0% 0 0 0)',
            transition: { duration: 0.95, delay, ease: EASE },
          },
        }}
      >
        <motion.div
          className='size-full'
          variants={{
            rest: { scale: 1.14 },
            go: { scale: 1, transition: { duration: 1.5, delay, ease: EASE } },
          }}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            priority={priority}
            sizes={sizes}
            placeholder='blur'
            className='size-full object-cover'
          />
        </motion.div>
      </motion.div>

      {/* Anything set over the frame — a locator, a headline, a link's own
          label — follows the wipe rather than sitting there waiting for it.
          The wrapper is static, so the absolutely-positioned children inside
          still resolve against the frame. */}
      {children ? (
        <motion.div
          data-anim=''
          variants={{
            rest: { opacity: 0 },
            go: { opacity: 1, transition: { duration: 0.5, delay: delay + 0.4 } },
          }}
        >
          {children}
        </motion.div>
      ) : null}

      {hideCredit ? null : <PhotoCredit photo={photo} />}
    </motion.div>
  )
}

/**
 * A photograph with its caption under it, the way a picture runs in print: a
 * rule, the caption, then the credit in small type at the end.
 *
 * `place` is set over the frame rather than in the caption — a reader skimming
 * the images wants to know *where* before they want to know what.
 */
export function PhotoFigure({
  photo,
  className = '',
  frameClassName = 'aspect-[4/3]',
  sizes,
  priority,
  delay,
  kenburns,
}: {
  photo: DiscoverPhoto
  className?: string
  frameClassName?: string
  sizes?: string
  priority?: boolean
  /** Seconds. */
  delay?: number
  kenburns?: boolean
}) {
  return (
    <figure className={className}>
      <PhotoFrame
        photo={photo}
        className={frameClassName}
        sizes={sizes}
        priority={priority}
        delay={delay}
        kenburns={kenburns}
        hideCredit
      >
        {photo.place ? <span className='bb-locator'>{photo.place}</span> : null}
      </PhotoFrame>

      {/* Caption and credit on separate lines. Run inline they read as one
          sentence that suddenly shouts a photographer's name — the credit is a
          different kind of statement and wants its own line. */}
      <figcaption className='mt-3 border-t border-[var(--brass-line)] pt-3'>
        <span className='block text-[13px] leading-[var(--leading-body)] text-[var(--ink-2)]'>{photo.caption}</span>
        <a
          href={photo.source}
          target='_blank'
          rel='noreferrer'
          className='mt-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] transition hover:text-[var(--accent)]'
        >
          {photo.credit} · {photo.license}
        </a>
      </figcaption>
    </figure>
  )
}
