'use client'

import { ArrowUpRightIcon } from '@phosphor-icons/react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { DiscoverPhoto } from './discover-media'

export type StripCard = {
  href: string
  /** The word, at display size — "History", "Government". */
  title: string
  blurb: string
  photo: DiscoverPhoto
  /** What the reader will actually find there. */
  contains?: string[]
}

/**
 * The chapters as a strip that travels sideways while the page scrolls down.
 *
 * The reason it earns the complexity: five chapters stacked vertically is
 * five screens of scrolling before a reader reaches anything else, and five
 * chapters in a grid makes each one a thumbnail. Laid along one axis they stay
 * large, stay in one comparison, and take one screen — and because the
 * horizontal travel is driven by the vertical scroll rather than by a
 * scrollbar, nobody has to discover that the row moves.
 *
 * The mechanism: the section is as tall as the track is wide, plus one
 * viewport. A sticky child pins for exactly that height, and the track's `x`
 * is the section's own scroll progress mapped onto its overflow. Scroll
 * distance in equals travel distance out, so the strip finishes precisely as
 * the section leaves.
 *
 * Two cases opt out and get a plain swipeable row instead. Below `lg` there is
 * not enough width for the pin to be worth a screen of height, and a native
 * horizontal scroll is the better control on a touchscreen anyway. Under
 * `prefers-reduced-motion` a pinned section that moves content sideways is
 * exactly what the preference is asking not to happen.
 */
export function ChapterStrip({
  cards,
  heading,
}: {
  cards: StripCard[]
  /**
   * The section's own head, rendered inside the pinned view.
   *
   * It travels with the strip rather than scrolling away above it. Left outside,
   * the pin holds a screen of five photographs with nothing telling the reader
   * what they are looking at — the heading has already gone past by the time
   * the cards stop.
   */
  heading?: React.ReactNode
}) {
  const shellRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = useState(0)
  const [pinned, setPinned] = useState(false)
  const reduced = useReducedMotion()

  // Whether to pin at all is a browser question, so it is resolved on the
  // client and starts false. Server-rendering the pinned cut would ship a
  // 300vh section to a phone that is never going to use it.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const sync = () => setPinned(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  // How far the track has to travel: its own width, less the window it shows
  // through. Measured rather than computed, because the cards are sized in
  // `clamp()` and only the browser knows what that came out as.
  //
  // The window is the shell, not the track. The track is `width: max-content`,
  // so its own scrollWidth and clientWidth are always equal and measuring the
  // difference between them yields zero at every viewport — which silently
  // disables the pin rather than breaking it, and is a great deal harder to
  // notice than a crash.
  useEffect(() => {
    const track = trackRef.current
    const shell = shellRef.current
    if (!track || !shell) return

    const measure = () => setOverflow(Math.max(0, track.scrollWidth - shell.clientWidth))
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(track)
    observer.observe(shell)
    return () => observer.disconnect()
  }, [cards.length, pinned])

  const active = pinned && !reduced && overflow > 0

  // `useScroll` needs its target mounted on the very first render. The shell
  // below is therefore rendered unconditionally and only its contents switch
  // between the pinned and the swipeable cut — mounting the target inside the
  // pinned branch means it does not exist while `pinned` is still resolving,
  // and motion throws "target ref is defined but not hydrated" on load.
  const { scrollYProgress } = useScroll({
    target: shellRef,
    offset: ['start start', 'end end'],
  })
  // Smoothed, because a raw scroll value on a trackpad makes a wide track
  // shudder — and a shudder across a photograph reads as a dropped frame.
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.0005 })
  const x = useTransform(progress, [0, 1], [0, -overflow])

  const track = (
    <div
      ref={trackRef}
      className={
        active
          ? 'flex w-max gap-6 px-6 lg:px-8'
          : // The un-pinned cut is a real scroller: snap points so a swipe lands
            // on a card, and the scrollbar hidden because the cards themselves
            // are obviously a row.
            'flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] lg:px-8 [&::-webkit-scrollbar]:hidden'
      }
    >
      {cards.map((card, index) => (
        <StripTile key={card.href} card={card} index={index} snap={!active} />
      ))}
    </div>
  )

  return (
    <div
      ref={shellRef}
      // One viewport to pin through, plus the distance the track has to cover.
      // Scroll distance in equals travel distance out, so the strip finishes
      // exactly as the section leaves.
      style={active ? { height: `calc(100svh + ${overflow}px)` } : undefined}
      // The section rhythm belongs to the swipeable cut only. Pinned, the sticky
      // child is a full viewport with its contents centred in it, so there is
      // already better than a hundred pixels of slack above and below the cards
      // before the section even ends — adding the standard padding on top of
      // that put four hundred pixels between the last card and the next
      // heading, which read as the page having lost its place.
      className={
        active ? 'relative -mx-6 lg:-mx-8' : 'bb-section -mx-6 overflow-x-clip lg:-mx-8'
      }
    >
      {active ? (
        <div className="sticky top-0 flex h-svh flex-col justify-center gap-12 overflow-hidden">
          {heading ? <div className="bb-container w-full">{heading}</div> : null}
          <motion.div style={{ x }} className="w-max">
            {track}
          </motion.div>
        </div>
      ) : (
        <>
          {heading ? <div className="bb-container mb-12 w-full">{heading}</div> : null}
          {track}
        </>
      )}
    </div>
  )
}

/**
 * One card in the strip.
 *
 * Portrait rather than landscape: a 4:5 frame at this height shows a person or
 * a building rather than a horizon, and the chapters are about people and
 * buildings. The number is set over the picture at the top-left corner, where
 * a magazine puts a folio.
 */
function StripTile({ card, index, snap }: { card: StripCard; index: number; snap: boolean }) {
  return (
    <Link
      href={card.href}
      className={`group block w-[78vw] max-w-[26rem] shrink-0 sm:w-[22rem] lg:w-[24rem] ${
        snap ? 'snap-start' : ''
      }`}
    >
      <span className='bb-frame bb-zoom relative block aspect-[4/5] w-full'>
        <Image
          src={card.photo.src}
          alt=''
          sizes='(min-width: 1024px) 24rem, 78vw'
          placeholder='blur'
          className='size-full object-cover'
        />

        <span className='bb-locator'>{String(index + 1).padStart(2, '0')}</span>

        {/* The title sits on the picture rather than under it, so a row of five
            reads as five photographs with names on them instead of five
            captions with pictures above them. */}
        <span className='pointer-events-none absolute inset-x-0 bottom-0 z-2 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-6 pt-16'>
          <span className='block text-[26px] font-extrabold leading-none tracking-[-0.035em] text-white'>
            {card.title}
          </span>
          <span className='mt-3 block bb-body text-white/75'>{card.blurb}</span>
        </span>
      </span>

      <span className='mt-4 flex items-center justify-between gap-4 border-t border-[var(--brass-line)] pt-3.5'>
        <span className='flex flex-wrap items-center gap-1.5'>
          {card.contains?.slice(0, 2).map((item) => (
            <span key={item} className='bb-chip'>
              {item}
            </span>
          ))}
        </span>
        <ArrowUpRightIcon
          className='size-5 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
          aria-hidden='true'
        />
      </span>
    </Link>
  )
}
