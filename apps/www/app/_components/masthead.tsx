// `SectionHead` moved into `@betterbarmm/editorial` when the registry started
// using it too. It is re-exported here so no call site had to change.
export { SectionHead } from '@betterbarmm/editorial'

import { PhotoHero, photosFor } from './photo-hero'
import type { DiscoverPhotoKey } from './discover-media'

type MastheadProps = {
  /** The small brass label above the headline. States the subject, not the page. Left out, the headline stands alone. */
  label?: string
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
  /** The headline's type step. `display` is the front page's size. */
  size?: 'display-md' | 'display'
  /** Extra classes on the headline, for a step between the two sizes. */
  headlineClassName?: string
  /** Paint the band in the brand crimson, as the front page's masthead is. */
  brand?: boolean
  /** Drawn behind everything, filling the band: a photograph blended into the ground. */
  backdrop?: React.ReactNode
  /** Before the label and headline, on their left and centred on them: a logo or a seal. */
  aside?: React.ReactNode
  /** The header's photographs; left out, three of the region's chosen by the headline. */
  photos?: DiscoverPhotoKey[]
}

/**
 * The top of every page that is not a chapter, in the travel workspace's look (user decision): the region's
 * photographs turning under a dark wash, the bars clear over them, the headline and its line at the foot. The props
 * are the ones the masthead always took, so no page had to change: the lines run on as one headline (the qualifier
 * still muted), the buttons and figures sit under the line, and `backdrop`, `brand` and the scroll cue are no longer
 * drawn (the photographs and the shorter header replace them).
 */
export function Masthead({
  label,
  lines,
  muted = [],
  standfirst,
  children,
  facts,
  size = 'display-md',
  aside,
  photos,
}: MastheadProps) {
  return (
    <PhotoHero
      photos={photos ?? photosFor(lines.join(' '))}
      kicker={label}
      tall={size === 'display'}
      aside={aside}
      title={lines.map((line, i) => (
        <span key={i} className={muted.includes(i) ? 'text-white/55' : undefined}>
          {i ? ' ' : ''}
          {line}
        </span>
      ))}
      lede={standfirst}
    >
      {children || facts?.length ? (
        <div className='mt-9 flex flex-wrap items-end justify-between gap-x-12 gap-y-8'>
          {children ? <div className='flex flex-wrap items-center gap-3'>{children}</div> : null}
          {facts?.length ? (
            <dl className='flex flex-wrap gap-x-10 gap-y-6'>
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className='sr-only'>{fact.label}</dt>
                  <dd className='font-[family-name:var(--font-display)] text-[clamp(1.5rem,2.6vw,2.125rem)] font-extrabold leading-none tracking-[-0.03em] text-white'>{fact.value}</dd>
                  <p className='mt-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/60'>{fact.label}</p>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      ) : null}
    </PhotoHero>
  )
}
