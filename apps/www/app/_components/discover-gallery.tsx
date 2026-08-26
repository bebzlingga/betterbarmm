'use client'

import { ArrowLeftIcon, ArrowRightIcon, XIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import type { DiscoverPhoto } from './discover-media'
import { EASE } from '@betterbarmm/editorial'

/**
 * Tile shapes, cycled down each row.
 *
 * Every tile is the same height, so the ratio is what sets its width — and a
 * row of identical widths reads as a filmstrip rather than as a wall. The cycle
 * is 5 long against 3 rows, so the same shape never lands in the same column
 * twice running.
 */
const TILE_RATIOS = ['4 / 3', '1 / 1', '3 / 4', '16 / 10', '1 / 1'] as const

/** Seconds for one full lap, per row. Deliberately unequal — three rows on the
    same clock drift as a block and the wall stops feeling alive. */
const ROW_DURATIONS = [72, 88, 64] as const

/** Which way each row travels: right, left, right. */
const ROW_DIRECTIONS = ['right', 'left', 'right'] as const

/**
 * How many tiles one track must hold before the loop is safe.
 *
 * The seamless loop depends on two identical tracks and a -50% translate, which
 * only hides the join if the pair is wider than the viewport. A chapter with 9
 * photographs deals 3 to a row, and 6 tiles came nowhere near 1440px — the row
 * ran out mid-screen and the wall showed its own end. Repeating the row up to
 * this count fixes it at every gallery size, and a marquee repeating its
 * contents is what a marquee is.
 */
const MIN_TILES_PER_TRACK = 8

/**
 * Deal the photographs into 3 rows, round-robin, then pad each row out.
 *
 * Round-robin rather than in blocks so each row gets a mix of subjects — split
 * into thirds, the top row would be all mosques and the bottom all food.
 * Indices are carried along because the lightbox addresses the original list,
 * and survive the padding so a repeated tile still opens the right photograph.
 */
function dealRows<T>(items: T[], rows = 3): { item: T; index: number }[][] {
  const dealt: { item: T; index: number }[][] = Array.from({ length: rows }, () => [])
  items.forEach((item, index) => dealt[index % rows].push({ item, index }))

  return dealt.map((row) => {
    if (row.length === 0) return row
    const repeats = Math.max(1, Math.ceil(MIN_TILES_PER_TRACK / row.length))
    return Array.from({ length: row.length * repeats }, (_, i) => row[i % row.length])
  })
}

export function DiscoverGallery({ photos }: { photos: DiscoverPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const rows = dealRows(photos)

  const step = useCallback(
    (delta: number) => {
      setOpen((current) =>
        current === null ? null : (current + delta + photos.length) % photos.length,
      )
    },
    [photos.length],
  )

  useEffect(() => {
    if (open === null) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null)
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }

    window.addEventListener('keydown', onKey)
    // The lightbox covers the page; letting the page keep scrolling behind it
    // means closing it drops the reader somewhere they never navigated to.
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, step])

  const current = open === null ? null : photos[open]

  /** One track of tiles. Rendered twice per row to make the loop seamless. */
  const track = (row: { item: DiscoverPhoto; index: number }[], clone: boolean) => (
    <div className='dsc-wall-track' data-clone={clone ? 'true' : 'false'} aria-hidden={clone}>
      {row.map(({ item, index }, position) => (
        <button
          key={`${clone ? 'c' : 'o'}-${position}-${item.source}`}
          type='button'
          // The clone exists only to fill the loop; a screen reader or a Tab
          // press meeting the same 12 photographs twice is noise.
          tabIndex={clone ? -1 : undefined}
          onClick={() => setOpen(index)}
          style={{ '--dsc-ratio': TILE_RATIOS[position % TILE_RATIOS.length] } as React.CSSProperties}
          className='bb-frame bb-zoom dsc-wall-tile group relative'
        >
          <Image
            src={item.src}
            alt={clone ? '' : item.alt}
            sizes='(min-width: 768px) 30vw, 60vw'
            placeholder='blur'
            className='size-full object-cover'
          />

          <span className='pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-black/15 to-transparent p-3 text-left opacity-0 transition duration-500 group-hover:opacity-100 group-focus-visible:opacity-100'>
            <span className='text-[11.5px] font-medium leading-4 text-white'>
              {item.place ? (
                <span className='mb-1 block font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>
                  {item.place}
                </span>
              ) : null}
              {item.caption}
            </span>
          </span>
        </button>
      ))}
    </div>
  )

  return (
    <>
      <div className='dsc-wall'>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className='dsc-wall-row'>
            <div
              className='dsc-wall-mover'
              data-dir={ROW_DIRECTIONS[rowIndex]}
              style={{ '--dsc-wall-duration': `${ROW_DURATIONS[rowIndex]}s` } as React.CSSProperties}
            >
              {track(row, false)}
              {track(row, true)}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {current ? (
          <motion.div
            className='dsc-lightbox'
            role='dialog'
            aria-modal='true'
            aria-label={current.caption}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpen(null)
            }}
          >
            <button
              type='button'
              onClick={() => setOpen(null)}
              aria-label='Close'
              className='absolute right-4 top-4 z-2 flex size-11 items-center justify-center border border-white/25 text-white transition hover:border-[var(--brass)] hover:text-[var(--brass)] sm:right-8 sm:top-8'
            >
              <XIcon className='size-5' aria-hidden='true' />
            </button>

            <motion.figure
              // Keyed on the photograph, so stepping through the set cross-fades
              // one frame into the next rather than swapping the src underneath
              // a static box.
              key={current.source}
              className='flex max-h-full w-full max-w-5xl flex-col'
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <div className='relative min-h-0 flex-1'>
                <Image
                  src={current.src}
                  alt={current.alt}
                  sizes='(min-width: 1024px) 64rem, 100vw'
                  placeholder='blur'
                  className='mx-auto h-auto max-h-[68vh] w-auto max-w-full object-contain'
                />
              </div>

              <figcaption className='mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-white/20 pt-4'>
                <p className='max-w-2xl text-[13.5px] leading-[var(--leading-body)] text-white/90'>
                  {current.place ? (
                    <span className='mr-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>
                      {current.place}
                    </span>
                  ) : null}
                  {current.caption}
                </p>
                <a
                  href={current.source}
                  target='_blank'
                  rel='noreferrer'
                  className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55 transition hover:text-white'
                >
                  {current.credit} · {current.license}
                </a>
              </figcaption>

              <div className='mt-5 flex items-center gap-3'>
                <button
                  type='button'
                  onClick={() => step(-1)}
                  aria-label='Previous photo'
                  className='flex size-10 items-center justify-center border border-white/25 text-white transition hover:border-[var(--brass)] hover:text-[var(--brass)]'
                >
                  <ArrowLeftIcon className='size-4' aria-hidden='true' />
                </button>
                <button
                  type='button'
                  onClick={() => step(1)}
                  aria-label='Next photo'
                  className='flex size-10 items-center justify-center border border-white/25 text-white transition hover:border-[var(--brass)] hover:text-[var(--brass)]'
                >
                  <ArrowRightIcon className='size-4' aria-hidden='true' />
                </button>
                <p className='num ml-2 text-[12px] text-white/50'>
                  {String((open ?? 0) + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
                </p>
              </div>
            </motion.figure>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
