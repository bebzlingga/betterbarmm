import { LineReveal, Magnetic, Rise } from './motion'
import { OkirBloom, OkirFrame } from './okir'

/**
 * The one loud block per page.
 *
 * No margin above it. It is a full-bleed band in a different colour, and the
 * colour change is what separates it from the section before — a margin as
 * well only doubled the gap, so the panel's own padding then read as a third
 * one and the ask ended up four hundred pixels below the thing it follows.
 *
 * Every page on the site ends on the same ask — send a correction, send a
 * source — and it is the only moment the crimson is used as a ground rather
 * than as an accent. That is what makes it work: on a page of warm paper and
 * hairlines, a full-bleed crimson band with a brass medallion turning behind it
 * is unmissable precisely because nothing else on the page is trying to be.
 *
 * The okir corners frame it instead of a border. A border would say "panel";
 * the corners say "this one is carved", which is nearer what is meant.
 *
 * The copy defaults to the project's ask, not to the workspace's. A reader
 * meeting this at the foot of an election page and again at the foot of a bill
 * page is meeting the same project twice, and it should say so — the earlier
 * cut wrote a bespoke line per app, which made one project read as four.
 */
export function CtaPanel({
  label = 'Get involved',
  lines = ['Public records get better', 'when people check them.'],
  standfirst = 'Spotted an error, or have a document worth adding? Every correction and every source makes the record stronger — and the official source is always right where we are wrong.',
  children,
  tone = 'crimson',
}: {
  label?: string
  /** Broken by hand — see `LineReveal`. */
  lines?: string[]
  standfirst?: string
  children?: React.ReactNode
  /**
   * The crimson is the site's closing statement. The dark cut is for a page
   * that has already used the crimson higher up, so the foot does not repeat
   * a note the reader has just heard.
   */
  tone?: 'crimson' | 'dark'
}) {
  return (
    <section
      className={`${
        tone === 'crimson' ? 'bb-crimson' : 'bb-ground'
      } bb-grain bb-lattice relative isolate overflow-hidden`}
    >
      <OkirBloom
        className='absolute -bottom-[46%] -left-[12%] size-[min(36rem,76vw)] opacity-[0.18]'
        spin
      />
      <span
        aria-hidden='true'
        className='bb-glow bb-glow-crimson absolute left-1/2 top-[-34%] size-[36rem] -translate-x-1/2 opacity-40'
      />

      {/* Centred on the axis. This is the one block on a page that is asking
          rather than telling, and a centred column reads as an address to the
          reader where a left-ranged one reads as another section of the
          document. It is also the only block here with nothing beneath it to
          share an edge with, so there is no column for it to line up against. */}
      <div className='bb-container bb-section relative z-2'>
        <div className='mx-auto max-w-3xl text-center'>
          <Rise distance={14}>
            <p className='bb-label justify-center'>{label}</p>
          </Rise>

          <LineReveal
            as='h2'
            lines={lines}
            delay={0.06}
            className='bb-display-md mt-7 text-[var(--ink)]'
          />

          <Rise delay={0.3} distance={14}>
            <p className='bb-measure mx-auto mt-8 bb-body text-[var(--ink-2)]'>
              {standfirst}
            </p>
          </Rise>

          <Rise delay={0.4} distance={14}>
            <div className='mt-11 flex flex-wrap items-center justify-center gap-3'>
              {children ?? (
                <>
                  <CtaAction>
                    <a href='https://betterbarmm.com/contribute' className='bb-btn bb-btn-brass'>
                      Contribute
                    </a>
                  </CtaAction>
                  <CtaAction>
                    <a href='https://betterbarmm.com/about' className='bb-btn bb-btn-ghost'>
                      About the project
                    </a>
                  </CtaAction>
                </>
              )}
            </div>
          </Rise>
        </div>
      </div>

      {/* Held a little in from the edges — a corner mark flush to the bleed
          reads as a rendering artefact rather than as ornament. */}
      <OkirFrame className='m-5 opacity-70 lg:m-8' />
    </section>
  )
}

/**
 * A magnetic wrapper for a button inside the panel.
 *
 * Exported alongside rather than baked in, because the panel takes arbitrary
 * children — a page might close on one button, or on a button and a mail link,
 * and only the caller knows which of them should lean.
 */
export function CtaAction({ children }: { children: React.ReactNode }) {
  return <Magnetic strength={0.24}>{children}</Magnetic>
}
