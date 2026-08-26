'use client'

import { useRef } from 'react'
import { Rise, TimelineRail } from '@betterbarmm/editorial'

export type Step = {
  title: string
  description: string
}

/**
 * A numbered sequence on a rail whose fill tracks how far down it the reader
 * has got.
 *
 * A list of four things is a list; a list of four things in an order is a
 * procedure, and the rail is what says which of the two you are looking at. It
 * is used for the reader's guide on About and the ways to help on Contribute —
 * both are sequences, and both used to be four grey paragraphs with 01 to 04
 * in front of them.
 *
 * The fill is driven from the section's own scroll rather than by a
 * scroll-driven CSS animation, so the markers on the rail can agree with it.
 * Where a browser has no way to run the fill, the rail is simply a line, which
 * is what it was before.
 */
export function StepList({
  steps,
  layout = 'rail',
}: {
  steps: Step[]
  /**
   * `grid` drops the rail and lays the steps out two by two.
   *
   * For a sequence a reader does not have to walk in order to get value from —
   * four things to keep in mind while reading, rather than four moves to make
   * one after another. The numbers still carry the order; the rail is what
   * insists on it, and down a full-width column of four it also spent a screen
   * and a half saying so.
   */
  layout?: 'rail' | 'grid'
}) {
  const ref = useRef<HTMLOListElement>(null)

  if (layout === 'grid') {
    return (
      // Interior rules, the way the workspace grid draws them: a hairline over
      // every cell and one down the middle, with nothing closing the outside.
      // The first column keeps the container's own left edge, so the steps line
      // up with the section head above them rather than sitting inside it.
      <ol className='grid border-t border-[var(--rule)] sm:grid-cols-2'>
        {steps.map((step, index) => (
          <li
            key={step.title}
            className='flex flex-col border-b border-[var(--rule)] py-7 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(odd)]:pr-9 sm:[&:nth-child(even)]:pl-9'
          >
            <Rise delay={index * 0.05} distance={16}>
              <p className='num text-[13px] font-semibold text-[var(--brass)]'>
                {String(index + 1).padStart(2, '0')}
              </p>

              <h3 className='mt-4 text-[1.15rem] font-extrabold leading-snug tracking-[-0.025em] text-[var(--ink)] sm:text-[1.3rem]'>
                {step.title}
              </h3>
              <p className='mt-3 bb-body text-[var(--ink-2)]'>{step.description}</p>
            </Rise>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <ol ref={ref} className='relative'>
      <TimelineRail target={ref} />

      {steps.map((step, index) => (
        <li key={step.title} className='bb-event relative pb-12 pl-7 last:pb-0 sm:pl-12'>
          <Rise delay={index * 0.05} distance={16}>
            <span className='bb-node' aria-hidden='true' />

            <div className='grid gap-x-10 gap-y-3 lg:grid-cols-[minmax(0,4rem)_minmax(0,1fr)]'>
              <p className='num text-[13px] font-semibold text-[var(--brass)]'>
                {String(index + 1).padStart(2, '0')}
              </p>

              <div className='min-w-0'>
                <h3 className='text-[1.15rem] font-extrabold leading-snug tracking-[-0.025em] text-[var(--ink)] sm:text-[1.3rem]'>
                  {step.title}
                </h3>
                <p className='mt-3 max-w-2xl bb-body text-[var(--ink-2)]'>
                  {step.description}
                </p>
              </div>
            </div>
          </Rise>
        </li>
      ))}
    </ol>
  )
}
