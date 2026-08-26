'use client'

import { motion } from 'motion/react'
import { useRef } from 'react'
import type { DiscoverBarmmTimelineEvent } from './discover-barmm-data'
import { PhotoFrame } from './discover-figure'
import { discoverPhotos, type DiscoverPhotoKey } from './discover-media'
import { EASE, Rise, TimelineRail } from '@betterbarmm/editorial'

/**
 * The timeline, as a rail with the events hanging off it.
 *
 * The fill down the rail tracks the scroll, so how far the accent has travelled
 * is how far through six centuries the reader has got. It is driven from the
 * list's own scroll progress rather than by a scroll-driven CSS animation,
 * because the markers beside it have to agree with the fill and a CSS timeline
 * cannot tell them anything.
 *
 * Each marker fills as its own event arrives, which is the part that makes the
 * rail read as being travelled rather than as being coloured in. Eras that have
 * a photograph get one, full width under the paragraph. Not every one does, and
 * that is deliberate: an unbroken column of pictures reads as a slideshow,
 * while an occasional one reads as evidence.
 */
export function Timeline({
  events,
  eraPhotos,
}: {
  events: DiscoverBarmmTimelineEvent[]
  eraPhotos?: Partial<Record<string, DiscoverPhotoKey>>
}) {
  const ref = useRef<HTMLOListElement>(null)

  return (
    <div className='relative'>
      <TimelineRail target={ref} />

      <ol ref={ref}>
        {events.map((event, index) => {
          const key = eraPhotos?.[event.era]
          const photo = key ? discoverPhotos[key] : undefined

          return (
            <li
              key={event.era + event.title}
              className='bb-event relative pb-14 pl-6 last:pb-0 sm:pl-10'
            >
              {/* The marker is its own animation rather than part of the row's,
                  so it lands as the event arrives rather than after it.

                  The centring translate and the 45° turn are animation values
                  rather than left in the class, because an element motion
                  animates gets `transform` written inline, and an inline
                  transform replaces the property whole. With them in CSS the
                  marker lost both the moment it moved: a square, sitting to the
                  right of the rail instead of a diamond centred on it. */}
              <motion.span
                aria-hidden='true'
                className='bb-node'
                initial={{
                  background: 'var(--paper)',
                  borderColor: 'var(--ink-3)',
                  x: '-50%',
                  rotate: 45,
                  scale: 0.8,
                }}
                whileInView={{
                  background: 'var(--accent)',
                  borderColor: 'var(--accent)',
                  x: '-50%',
                  rotate: 45,
                  scale: 1,
                }}
                viewport={{ once: true, amount: 1 }}
                transition={{ duration: 0.5, ease: EASE }}
              />

              <Rise distance={18}>
                {/* Two columns, or three where there is a photograph. An era
                    that has one used to run it under its own paragraph at full
                    measure, which made that event twice the height of its
                    neighbours and broke the rhythm the rail is keeping. In its
                    own column it sits beside the paragraph instead. */}
                <div
                  className={`grid gap-x-10 gap-y-4 ${
                    photo
                      ? 'lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,20rem)]'
                      : 'lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]'
                  }`}
                >
                  <div className='lg:sticky lg:top-24 lg:self-start'>
                    <p className='num text-[11px] font-medium text-[var(--ink-3)]'>
                      {String(index + 1).padStart(2, '0')} / {String(events.length).padStart(2, '0')}
                    </p>
                    <p className='bb-era mt-2'>{event.era}</p>
                  </div>

                  <div className='min-w-0'>
                    <h3 className='text-xl font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)] sm:text-2xl'>
                      {event.title}
                    </h3>
                    <p className='mt-3 max-w-[44em] bb-body text-[var(--ink-2)]'>
                      {event.description}
                    </p>
                  </div>

                  {photo ? (
                    <figure className='mt-4 lg:mt-0 lg:self-start'>
                      <PhotoFrame
                        photo={photo}
                        className='aspect-[4/3]'
                        sizes='(min-width: 1024px) 20rem, 100vw'
                        zoom
                        hideCredit
                      />
                      <figcaption className='mt-2.5 border-t border-[var(--brass-line)] pt-2.5'>
                        <span className='block text-[12.5px] leading-5 text-[var(--ink-3)]'>
                          {photo.caption}
                        </span>
                        <a
                          href={photo.source}
                          target='_blank'
                          rel='noreferrer'
                          className='mt-1.5 block font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] transition hover:text-[var(--accent)]'
                        >
                          {photo.credit} · {photo.license}
                        </a>
                      </figcaption>
                    </figure>
                  ) : null}
                </div>
              </Rise>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
