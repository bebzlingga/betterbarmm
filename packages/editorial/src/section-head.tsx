import { LineReveal, Rise } from './motion'

/**
 * The head of a section within a page: kicker, claim, and the sentence that
 * qualifies it, with the claim and the qualifier on one row at wide sizes.
 *
 * Every section on the site opens with one, so a reader scrolling fast always
 * has the same place to look for "what is this block".
 *
 * `align='center'` is for a section that is one statement rather than a column
 * of text — a claim over a chart, with the ways out under it. The two-column
 * split is the wrong shape there: it sets the qualifier beside the claim, and
 * the reader takes them as two things when the second is finishing the first.
 * Centred, the block reads straight down — rule, kicker, claim, qualifier —
 * and the picture underneath it inherits an axis to sit on.
 */
export function SectionHead({
  index,
  eyebrow,
  title,
  titleMuted,
  lead,
  aside,
  align = 'left',
  size = 'md',
  className = '',
}: {
  /** The counter down the page's spine — "01", "02". */
  index: string
  eyebrow: string
  title: string
  /** The second half of a two-tone heading, set in the muted grey. */
  titleMuted?: string
  lead?: string
  /** Anything ranged right on the kicker row — a count, a link to the whole set. */
  aside?: React.ReactNode
  /** `center` stacks the claim and its qualifier on one axis. */
  align?: 'left' | 'center'
  /**
   * One step down the display scale, for a section head that opens onto a
   * figure rather than onto prose. Where the block underneath is a chart or a
   * pair of columns, the head is a caption for it and does not need to be the
   * largest thing on the screen; where it opens onto reading, it does.
   */
  size?: 'md' | 'sm'
  className?: string
}) {
  const centred = align === 'center'

  return (
    <div className={`bb-head-gap ${centred ? 'text-center' : ''} ${className}`}>
      <Rise distance={14}>
        <div className='flex items-baseline justify-between gap-6'>
          {/* Centred, the kicker loses its rule as well as its ranging. The
              brass line hangs a section off the left edge of the grid; over
              centred type it is a full-width bar with two words floating under
              the middle of it, saying the block starts at a corner the type has
              already left. */}
          <div className={`bb-kicker flex-1 ${centred ? 'bb-kicker-plain justify-center' : ''}`}>
            <span>{index}</span>
            <span>{eyebrow}</span>
          </div>
          {aside ? <div className='shrink-0 pt-3'>{aside}</div> : null}
        </div>
      </Rise>

      {/* Two columns only when there is something to put in the second one. A
          head with no lead was still being cut to 1.35fr of the row, so the
          headline broke early and the right-hand half of the page held
          nothing. */}
      <div
        className={`mt-9 grid gap-7 ${
          lead && !centred ? 'lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-16' : ''
        }`}
      >
        <LineReveal
          as='h2'
          lines={titleMuted ? [title, titleMuted] : [title]}
          className={`${size === 'sm' ? 'bb-display-sm' : 'bb-display-md'} text-[var(--ink)]`}
          lineClassName={[undefined, 'bb-mute']}
        />

        {lead ? (
          <Rise delay={0.2} distance={14}>
            <p
              className={`bb-measure bb-body text-[var(--ink-2)] ${
                centred ? 'mx-auto' : 'lg:pb-2'
              }`}
            >
              {lead}
            </p>
          </Rise>
        ) : null}
      </div>
    </div>
  )
}
