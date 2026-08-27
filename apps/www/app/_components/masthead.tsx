// `SectionHead` moved into `@betterbarmm/editorial` when the registry started
// using it too. It is re-exported here so no call site had to change.
export { SectionHead } from '@betterbarmm/editorial'

import { LineReveal, OkirBloom, Rise } from '@betterbarmm/editorial'
import { ScrollCue } from './scroll-cue'

type MastheadProps = {
  /** The small brass label above the headline. States the subject, not the page. */
  label: string
  /**
   * The headline, broken by hand.
   *
   * Where a display line breaks is a typographic decision, not an arithmetic
   * one — left to wrap on its own a 9rem headline puts a two-letter word alone
   * on a line and the shape falls apart. Each entry is one line and arrives on
   * its own.
   */
  lines: string[]
  /**
   * Which of those lines are the qualifier rather than the claim. They take
   * the muted grey, so the eye lands on what matters before reading the rest.
   */
  muted?: number[]
  /** Optional: a page whose first section opens on the same argument omits it. */
  standfirst?: string
  /** Buttons. A page that opens onto a list usually needs none. */
  children?: React.ReactNode
  /** Small figures under the buttons — the size of the thing, in its own units. */
  facts?: { value: string; label: string }[]
  /**
   * Fragment the cue at the foot of the masthead jumps to.
   *
   * A masthead that fills the screen has nothing under it in view, so a reader
   * who lands on one is looking at a headline and an apparently empty page. The
   * cue is what says there is more, and where it starts.
   */
  scrollTo?: string
  scrollLabel?: string
}

/**
 * The top of every page that is not a chapter.
 *
 * It is a masthead rather than a header: a large empty warm ground, one
 * medallion turning behind it at an opacity you have to look for, and the
 * headline arriving line by line out of its own baseline. The rest of the
 * estate opens on a paragraph of 13px grey, which is correct for a filing
 * system and hopeless for a front door.
 *
 * The bloom sits top-right and bleeds off both edges on purpose. A decorative
 * motif fully contained inside the viewport reads as a logo; one that runs off
 * the page reads as a ground the page is printed on.
 */
export function Masthead({
  label,
  lines,
  muted = [],
  standfirst,
  children,
  facts,
  scrollTo,
  scrollLabel = 'Read on',
}: MastheadProps) {
  return (
    /* Four fifths of the screen: enough that the headline opens on nothing but
       itself, and short enough that the edge of what follows is visible without
       scrolling — which is what tells a reader the page continues. `svh` rather
       than `vh` so a phone's collapsing address bar cannot change the height
       mid-scroll. */
    <section className='bb-lattice relative flex min-h-[80svh] items-center overflow-hidden'>
      <OkirBloom className='absolute -right-[14%] -top-[38%] size-[min(46rem,86vw)] opacity-[0.16]' />
      <span
        aria-hidden='true'
        className='bb-glow absolute -right-[10%] -top-[20%] size-[36rem]'
      />

      <div className='bb-container relative w-full pb-16 pt-16 lg:pb-24 lg:pt-24'>
        <Rise distance={14}>
          <p className='bb-label'>{label}</p>
        </Rise>

        <LineReveal
          lines={lines}
          delay={0.08}
          className='bb-display-lg mt-8 text-[var(--ink)]'
          lineClassName={lines.map((_, index) => (muted.includes(index) ? 'bb-mute' : undefined))}
        />

        {standfirst ? (
          <Rise delay={0.35} distance={16}>
            <p className='mt-9 max-w-2xl text-[16px] leading-[var(--leading-body)] text-[var(--ink-2)] sm:text-lg'>
              {standfirst}
            </p>
          </Rise>
        ) : null}

        {children || facts?.length ? (
          <Rise delay={0.45} distance={14}>
            {/* One row on a single brass rule: what to do on the left, the size
                of the thing on the right. They were stacked, which spent two
                bands of the masthead on four buttons and three numbers and put
                a hairline between two things that belong to the same breath. */}
            <div className='mt-12 flex flex-wrap items-center justify-between gap-x-12 gap-y-8 border-t border-[var(--brass-line)] pt-7'>
              {children ? (
                <div className='flex flex-wrap items-center gap-3'>{children}</div>
              ) : null}

              {facts?.length ? (
                /* Divided by space rather than by dots, so the row reads as a
                   set of measurements rather than as a sentence with
                   punctuation. */
                <dl className='flex flex-wrap gap-x-10 gap-y-6'>
                  {facts.map((fact) => (
                    <div key={fact.label}>
                      <dt className='sr-only'>{fact.label}</dt>
                      <dd className='bb-figure-sm text-[var(--ink)]'>{fact.value}</dd>
                      <p className='mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
                        {fact.label}
                      </p>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </Rise>
        ) : null}
        {scrollTo ? (
          <Rise delay={0.7} distance={10}>
            <ScrollCue to={scrollTo} label={scrollLabel} className='mt-16' />
          </Rise>
        ) : null}
      </div>

      {/* The seam into the page proper. A malong's warp, not a 1px rule. */}
      <div className='bb-weave' aria-hidden='true' />
    </section>
  )
}
