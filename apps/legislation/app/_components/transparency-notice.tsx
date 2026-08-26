import { getRegistryScale } from '../_lib/legislation-data'
import { Reveal } from './reveal'

/**
 * The standing caveat, shown above the footer on every page.
 *
 * It belongs on all of them rather than on an About page a reader may never
 * open: someone arriving at a single bill from a search result is exactly the
 * person who needs to know these summaries aren't citable, and where to go for
 * the text that is.
 *
 * The caveat is stated in figures rather than left as a claim. "This is a
 * reading aid" is the sort of line every site carries and nobody reads; the
 * gap between what the registry lists and what it has actually read is the
 * same warning made specific.
 *
 * Those figures were a three-column band, and at full width it sprawled — two
 * lines of caption under each number, a button stranded in the empty half of
 * the row, and the whole thing taller than the footer beneath it. They are a
 * sentence now. Three numbers and their captions say the same thing as one
 * sentence containing the three numbers, and the sentence is a quarter of the
 * height. A closing note before a footer should be read in one pass.
 *
 * Two rules rather than a panel. The top one runs the full width of the
 * viewport, so the caveat reads as the page changing register rather than as
 * one more block of content; the bottom one stops at the container, closing
 * the notice against the footer.
 */
export function TransparencyNotice() {
	const scale = getRegistryScale()

	return (
		<Reveal>
			<div className='mt-16 border-t border-[var(--rule-soft)] lg:mt-24'>
				<div className='bb-container'>
					<div className='border-b border-[var(--rule-soft)] py-12 lg:py-14'>
						{/* Held to a reading measure rather than the page column. The block
						    is one short paragraph, and run across 88rem it read as a caption
						    stretched to fill a row. */}
						<div className='max-w-3xl'>
							{/* Two-tone, the way the page mastheads set a headline: the dark
							    half carries what this is, the grey half the qualifier. */}
							<h2 className='section-title section-title-sm'>
								This is a reading aid,{' '}
								<span className='text-[var(--ink-display)]'>not a legal source.</span>
							</h2>

							{/* The figures inline. A number in the middle of the sentence that
							    explains it needs no caption; the same number in a column does,
							    and the caption is what made the block sprawl. */}
							<p className='copy mt-4 text-[var(--ink-2)]'>
								Every measure Parliament lists is here &mdash;{' '}
								<Figure>{scale.listed.toLocaleString()}</Figure> of them, covering{' '}
								<Figure>{scale.years}</Figure>. Of those,{' '}
								<Figure>{scale.read.toLocaleString()}</Figure>{' '}
								have been read from their own
								documents and quote them section by section. The rest carry what Parliament&rsquo;s
								index says, and every record tells you which it is.
							</p>

							<p className='meta-sm mt-4'>
								Summaries, sector tags and status explanations are ours, not Parliament&rsquo;s.
								Read the official document before quoting it.
							</p>

							{/* The action and the date on one line: the caveat calls for one
							    thing, and when it was compiled is the only other fact a reader
							    needs to weigh it. */}
							<div className='mt-8 flex flex-wrap items-center gap-x-6 gap-y-3'>
								<a
									href='https://parliament.bangsamoro.gov.ph/'
									target='_blank'
									rel='noreferrer'
									className='bb-btn bb-btn-solid'
								>
									Open the official source
								</a>
								<p className='meta-sm'>Compiled {readableDate(scale.compiledOn)}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Reveal>
	)
}

/** A number set in the tabular face, mid-sentence. */
function Figure({ children }: { children: React.ReactNode }) {
	return <span className='num font-semibold text-[var(--ink)]'>{children}</span>
}

/**
 * The compile date as prose. The registry stores it as `2026-08-14`, which is
 * right for a data field and wrong in the middle of a sentence — set in copy it
 * breaks across a line at its own hyphens. Fixed locale and time zone so the
 * string is the same wherever it renders.
 */
function readableDate(iso: string): string {
	const parsed = new Date(`${iso}T00:00:00Z`)

	if (Number.isNaN(parsed.getTime())) return iso

	return parsed.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	})
}
