'use client'

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

/* ============================================================
   Motion primitives

   Every animated thing on the site is built from what is in this file,
   so the whole estate moves with one hand. The rules it encodes:

     · Nothing travels far. 24px is a long move; 60px is a mistake.
     · Nothing is only visible because it moved. Every primitive
       renders its content at rest and animates from there, so a reader
       with JS off, a crawler, or a reduced-motion preference gets the
       page rather than an empty one.
     · Motion in is once. `useInView(..., { once: true })` throughout —
       an element that re-animates every time it crosses the fold reads
       as a loading state, not as an arrival.
     · Scroll-linked motion is continuous; enter motion is discrete.
       Parallax follows the scroll because it is describing depth. A
       fade does not, because it is describing arrival.

   `MotionConfig reducedMotion="user"` in the root layout collapses the
   library's transform animations under the OS preference. Anything in
   here that drives its own loop — the counters, the pointer trackers —
   checks `useReducedMotion()` itself, because the library cannot know
   about a `requestAnimationFrame` we wrote.
   ============================================================ */

/** The site's one easing curve, as motion expects it. */
export const EASE = [0.16, 1, 0.3, 1] as const

/** The one spring, for anything that answers a pointer rather than the scroll. */
export const SPRING = { stiffness: 260, damping: 30, mass: 0.6 } as const

/**
 * Shared in-view settings: fire once, just before the element reaches the fold.
 *
 * The bottom margin is what sets that line. It used to trim 30% off the bottom
 * of the viewport, which meant nothing animated until it had climbed past seven
 * tenths of the window — a reader scrolling at any pace watched blocks sit blank
 * most of the way up the screen and only fill in near the top. Growing the
 * viewport by 15% instead starts the move while the block is still below the
 * fold, so by the time it is on screen it has arrived rather than is arriving.
 *
 * `amount: 0` goes with it: with a slice of the element required as well, a
 * tall section would wait for part of its own height on top of the margin, and
 * on anything a screen deep that lands well past the line this is setting.
 */
export const IN_VIEW = { once: true, amount: 0, margin: '0px 0px 15% 0px' } as const

/* ------------------------------------------------------------
   Arrival
   ------------------------------------------------------------ */

type RiseProps = {
  children: ReactNode
  /** Seconds before the move starts. Use for a hand-tuned pair, not a list. */
  delay?: number
  /** How far it travels, in px. Negative comes down instead of up. */
  distance?: number
  /** Which axis to travel on. */
  axis?: 'y' | 'x'
  className?: string
  as?: 'div' | 'section' | 'li' | 'span' | 'article'
}

/**
 * The default arrival: up and in, once, as the element nears the viewport.
 *
 * This is the one that gets used everywhere. Anything more elaborate should
 * earn it — a page where every block does something different reads as a demo
 * rather than as a document.
 */
export function Rise({
  children,
  delay = 0,
  distance = 22,
  axis = 'y',
  className,
  as = 'div',
}: RiseProps) {
  const Tag = motion[as]
  const from = axis === 'y' ? { y: distance } : { x: distance }

  return (
    <Tag
      data-anim=""
      className={className}
      initial={{ opacity: 0, ...from }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={IN_VIEW}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </Tag>
  )
}

/**
 * A group whose children arrive one after another.
 *
 * The stagger is on the parent rather than a delay computed per child, so a
 * list that grows does not need every index recalculated — and the interval
 * stays one number in one place.
 */
export function Stagger({
  children,
  delay = 0,
  gap = 0.08,
  className,
}: {
  children: ReactNode
  delay?: number
  /** Seconds between one child starting and the next. */
  gap?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial="rest"
      whileInView="go"
      viewport={IN_VIEW}
      variants={{ go: { transition: { staggerChildren: gap, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  )
}

/** One child of a `Stagger`. Takes its timing from the parent, not from a prop. */
export function StaggerItem({
  children,
  distance = 18,
  className,
  as = 'div',
}: {
  children: ReactNode
  distance?: number
  className?: string
  as?: 'div' | 'li' | 'span' | 'article'
}) {
  const Tag = motion[as]

  return (
    <Tag
      data-anim=""
      className={className}
      variants={{
        rest: { opacity: 0, y: distance },
        go: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
      }}
    >
      {children}
    </Tag>
  )
}

/* ------------------------------------------------------------
   Display type
   ------------------------------------------------------------ */

/**
 * A headline that arrives one line at a time, from under its own baseline.
 *
 * The clip is on the wrapper and the transform on the child, which is what
 * makes each line look uncovered rather than slid in from somewhere else — the
 * difference between a curtain and a conveyor belt.
 *
 * Lines are given rather than measured. Where a display headline breaks is a
 * typographic decision, not an arithmetic one: left to wrap on its own, the
 * Discover masthead put "the" over a bright horizon and the outlined
 * letterforms vanished into it.
 */
export function LineReveal({
  lines,
  delay = 0,
  gap = 0.09,
  className,
  lineClassName,
  as = 'h1',
}: {
  lines: ReactNode[]
  delay?: number
  gap?: number
  className?: string
  /**
   * Applied to each line — for a per-line colour, or an outlined second line.
   *
   * A string covers every line; an array addresses them one at a time, with a
   * hole where a line takes nothing. It is deliberately not a callback: this is
   * a Client Component and almost every caller is a Server Component, and a
   * function cannot cross that boundary — passing one fails the build at
   * prerender with "Functions cannot be passed directly to Client Components".
   */
  lineClassName?: string | (string | undefined)[]
  as?: 'h1' | 'h2' | 'p' | 'div'
}) {
  const Tag = motion[as]

  // The heading is what gets watched; the lines animate as its children.
  // Watching each line directly does not work, and fails in the worst possible
  // way: a line starts translated a full line-height below where it will end
  // up, so a tall headline near the top of the page is pushed out of the
  // viewport by its own opening transform and can never satisfy its own
  // visibility threshold. It then never animates — and since the mask clips it,
  // the headline is simply absent from the page. The wrapper is never
  // transformed, so its position is always the real one.
  return (
    <Tag
      className={className}
      initial="rest"
      whileInView="go"
      viewport={IN_VIEW}
      variants={{ go: { transition: { staggerChildren: gap, delayChildren: delay } } }}
    >
      {lines.map((line, index) => (
        <span key={index} className="bb-line-mask">
          <motion.span
            data-anim=""
            className={`block ${
              (Array.isArray(lineClassName) ? lineClassName[index] : lineClassName) ?? ''
            }`}
            variants={{
              rest: { y: '108%' },
              go: { y: '0%', transition: { duration: 0.95, ease: EASE } },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/**
 * Short copy that arrives a word at a time.
 *
 * Reserved for a standfirst or a pull quote — a paragraph of body copy done
 * this way is unreadable while it is happening, which is the opposite of what
 * a paragraph is for.
 */
export function WordReveal({
  text,
  delay = 0,
  className,
}: {
  text: string
  delay?: number
  className?: string
}) {
  const words = text.split(' ')

  return (
    <motion.p
      className={className}
      initial="rest"
      whileInView="go"
      viewport={IN_VIEW}
      variants={{ go: { transition: { staggerChildren: 0.022, delayChildren: delay } } }}
    >
      {/* The visible text is split; a single unsplit copy carries the sentence
          to anything that reads the page rather than looking at it. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <motion.span
            key={index}
            data-anim=""
            className="inline-block"
            variants={{
              rest: { opacity: 0, y: 10 },
              go: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
            }}
          >
            {word}
            {index < words.length - 1 ? ' ' : ''}
          </motion.span>
        ))}
      </span>
    </motion.p>
  )
}

/* ------------------------------------------------------------
   Scroll-linked
   ------------------------------------------------------------ */

/**
 * Depth: the element drifts against the scroll while it is on screen.
 *
 * `offset: ['start end', 'end start']` measures the whole time the element is
 * anywhere in the viewport, so the drift is spread over the full pass rather
 * than crammed into the moment it is centred.
 *
 * The travel is deliberately small. Parallax reads as depth up to about 15% of
 * an element's height and as a bug past it — a photograph that visibly slides
 * out of its own frame is not describing distance, it is describing a mistake.
 */
export function Parallax({
  children,
  distance = 60,
  className,
}: {
  children: ReactNode
  /** Total px travelled across the full pass. Negative reverses the direction. */
  distance?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  )
}

/**
 * The same, for a full-bleed photograph inside a fixed-height frame.
 *
 * The image is oversized by `overscan` so there is something to reveal at each
 * end of the travel; without it the drift exposes the frame's own background at
 * the top or the bottom of the pass.
 */
export function ParallaxImage({
  children,
  distance = 80,
  overscan = 1.18,
  className,
}: {
  children: ReactNode
  distance?: number
  overscan?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance])

  return (
    <div ref={ref} className={className}>
      <motion.div
        className="absolute inset-0"
        style={reduced ? undefined : { y, scale: overscan }}
      >
        {children}
      </motion.div>
    </div>
  )
}

/**
 * The reading-progress hairline under the site header.
 *
 * Driven by the document's own scroll rather than by a listener, and smoothed
 * through a spring — a raw scroll value on a trackpad makes the bar twitch,
 * and a bar that twitches reads as broken rather than as precise.
 */
export function ScrollProgress({ className = 'bb-progress' }: { className?: string }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 34, restDelta: 0.001 })

  return <motion.div aria-hidden="true" className={className} style={{ scaleX }} />
}

/**
 * A value that runs 0 → 1 across the time an element is on screen.
 *
 * Exposed rather than kept private because two things need it — the timeline
 * rail's fill and the horizontal chapter strip — and both have to agree with
 * what the reader sees, which they only do if they read the same value.
 */
export function useSectionProgress<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  offset: ['start end' | 'start start' | 'start center', 'end start' | 'end end' | 'end center'] = [
    'start center',
    'end center',
  ],
): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target: ref, offset })
  return scrollYProgress
}

/* ------------------------------------------------------------
   Pointer-tracked
   ------------------------------------------------------------ */

/**
 * A control that leans towards the cursor and springs back when it leaves.
 *
 * Kept to a few pixels. The effect works because it is barely perceptible —
 * the button feels alive rather than looking like it is dodging. Anything past
 * about 10px and the label stops sitting under the pointer that is aiming at
 * it, which makes the control harder to hit, not easier.
 *
 * Pointer type is checked rather than a media query, because a hybrid laptop
 * has both and only one of them has a cursor to lean towards.
 */
export function Magnetic({
  children,
  strength = 0.28,
  className,
}: {
  children: ReactNode
  /** Fraction of the pointer's offset from centre that the element follows. */
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const x = useSpring(useMotionValue(0), SPRING)
  const y = useSpring(useMotionValue(0), SPRING)

  const onMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduced || event.pointerType !== 'mouse') return
      const box = ref.current?.getBoundingClientRect()
      if (!box) return
      x.set((event.clientX - (box.left + box.width / 2)) * strength)
      y.set((event.clientY - (box.top + box.height / 2)) * strength)
    },
    [reduced, strength, x, y],
  )

  const reset = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      className={`inline-flex ${className ?? ''}`}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  )
}

/**
 * A plate that tilts away from the cursor, as though it were lying on a table.
 *
 * The rotation is tiny and the perspective deep, which is what keeps it reading
 * as a physical card rather than as a 3D effect. A steep tilt on a card
 * containing text makes the text harder to read at exactly the moment the
 * reader has pointed at it.
 */
export function Tilt({
  children,
  max = 5,
  className,
}: {
  children: ReactNode
  /** Maximum rotation in degrees, at the corners. */
  max?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), SPRING)
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), SPRING)

  const onMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduced || event.pointerType !== 'mouse') return
      const box = ref.current?.getBoundingClientRect()
      if (!box) return
      px.set((event.clientX - box.left) / box.width - 0.5)
      py.set((event.clientY - box.top) / box.height - 0.5)
    },
    [reduced, px, py],
  )

  const reset = useCallback(() => {
    px.set(0)
    py.set(0)
  }, [px, py])

  return (
    <div ref={ref} className={className} style={{ perspective: 1200 }} onPointerMove={onMove} onPointerLeave={reset}>
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="h-full">
        {children}
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------
   Figures
   ------------------------------------------------------------ */

/**
 * A figure that counts up to its value the first time it scrolls into view.
 *
 * The number is rendered at its final value, so it is correct before any
 * JavaScript runs and correct for anyone who never gets any. The count only
 * replaces it once the element is actually on screen — which also means a
 * reduced-motion reader simply reads the figure.
 *
 * `tabular-nums` on the containing class matters more than it looks: without
 * it the digits change width as they climb and the whole row jitters.
 */
export function Counter({
  value,
  duration = 1.4,
  decimals = 0,
  prefix = '',
  suffix = '',
  /** Group thousands — right for a population, wrong for a year. */
  group = false,
  className,
}: {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  group?: boolean
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })
  const reduced = useReducedMotion()
  const count = useMotionValue(value)
  const [shown, setShown] = useState(value)

  useMotionValueEvent(count, 'change', (latest) => setShown(latest))

  useEffect(() => {
    if (!inView || reduced) return
    count.set(0)
    const controls = animate(count, value, { duration, ease: EASE })
    return () => controls.stop()
  }, [inView, reduced, count, value, duration])

  const text = group
    ? shown.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : shown.toFixed(decimals)

  return (
    <span ref={ref} className={className}>
      {prefix}
      {text}
      {suffix}
    </span>
  )
}

/**
 * A bar segment that grows from its left edge as the bar comes into view.
 *
 * Width is the data and is set by the caller as a style; this only supplies
 * the growing. Scaling rather than animating width keeps every segment on the
 * compositor — a seven-segment bar animating `width` relayouts seven times a
 * frame.
 */
export function BarSegment({
  index = 0,
  className,
  style,
  title,
}: {
  index?: number
  className?: string
  style?: React.CSSProperties
  title?: string
}) {
  return (
    <motion.div
      data-anim=""
      className={className}
      style={style}
      title={title}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.85, delay: 0.1 + index * 0.09, ease: EASE }}
    />
  )
}

/**
 * The rail down a timeline, with a fill that tracks how far the reader has got.
 *
 * `scaleY` off the section's own scroll progress rather than a scroll-driven
 * CSS animation, because the markers beside it have to agree with the fill and
 * a CSS timeline cannot tell them anything.
 */
export function TimelineRail({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const { scrollYProgress } = useScroll({ target, offset: ['start 65%', 'end 80%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  return (
    <div className="bb-rail" aria-hidden="true">
      <motion.div className="bb-rail-fill" style={{ scaleY }} />
    </div>
  )
}
