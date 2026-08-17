import { Reveal } from './reveal'

/**
 * The standing caveat, shown above the footer on every page.
 *
 * It belongs on all of them rather than on an About page a reader may never
 * open: someone arriving at a single bill from a search result is exactly the
 * person who needs to know these summaries aren't citable, and where to go for
 * the text that is.
 *
 * Two rules rather than a panel. The top one runs the full width of the
 * viewport, so the caveat reads as the page changing register rather than as
 * one more block of content; the bottom one stops at the container, closing
 * the notice against the footer without drawing a second edge-to-edge line
 * immediately below the first.
 */
export function TransparencyNotice() {
	return (
		<Reveal>
			<div className='mt-16 border-t border-[var(--rule-soft)] lg:mt-24'>
				<div className='mx-auto max-w-[88rem] px-6 lg:px-8'>
					<div className='grid gap-8 border-b border-[var(--rule-soft)] py-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16 lg:py-16'>
						<div>
							<h2 className='section-title section-title-sm max-w-3xl'>
								This is a reading aid, not a legal source.
							</h2>

							<p className='copy mt-4 max-w-3xl text-[var(--ink-2)]'>
								Summaries, sector tags, and status explanations here are written from the titles and
								metadata Parliament publishes, with human review — they are here to help you find a
								measure, not to cite one. Read the official document before quoting it, and where
								the registry is incomplete the category page says so.
							</p>
						</div>

						{/* The one action the caveat actually calls for: if you need to
						    cite it, go and read the original. */}
						<a
							href='https://parliament.bangsamoro.gov.ph/'
							target='_blank'
							rel='noreferrer'
							className='btn btn-solid shrink-0 justify-self-start lg:justify-self-end'
						>
							Open the official source
						</a>
					</div>
				</div>
			</div>
		</Reveal>
	)
}
