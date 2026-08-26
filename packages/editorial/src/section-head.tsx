import { LineReveal, Rise } from './motion'

/**
 * The head of a section within a page: kicker, claim, and the sentence that
 * qualifies it, with the claim and the qualifier on one row at wide sizes.
 *
 * Every section on the site opens with one, so a reader scrolling fast always
 * has the same place to look for "what is this block".
 */
export function SectionHead({
  index,
  eyebrow,
  title,
  titleMuted,
  lead,
  aside,
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
  className?: string
}) {
  return (
    <div className={`bb-head-gap ${className}`}>
      <Rise distance={14}>
        <div className='flex items-baseline justify-between gap-6'>
          <div className='bb-kicker flex-1'>
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
          lead ? 'lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-16' : ''
        }`}
      >
        <LineReveal
          as='h2'
          lines={titleMuted ? [title, titleMuted] : [title]}
          className='bb-display-md text-[var(--ink)]'
          lineClassName={[undefined, 'bb-mute']}
        />

        {lead ? (
          <Rise delay={0.2} distance={14}>
            <p className='bb-measure bb-body text-[var(--ink-2)] lg:pb-2'>{lead}</p>
          </Rise>
        ) : null}
      </div>
    </div>
  )
}
