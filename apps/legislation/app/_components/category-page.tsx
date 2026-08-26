import type { CategorySlug } from '../_lib/categories'
import { getDataset } from '../_lib/legislation-data'
import { AwaitingData } from './awaiting-data'
import { PageHeader } from './page-header'
import { RecordBrowser } from './record-browser'

/**
 * Each category's blurb is already written as a claim and a qualifier joined
 * by a dash — "Proposed laws still moving through Parliament — not yet in
 * force." That is exactly the two-tone headline the brand header sets, so it
 * is split rather than rewritten. A blurb without a dash runs as one line.
 *
 * The halves are punctuated as two sentences rather than left hanging on the
 * dash that used to join them: set as a headline, "…all the way through these
 * are the region's laws" reads as one run-on sentence.
 */
function splitHeadline(blurb: string): { title: string; titleMuted?: string } {
	const [claim, ...rest] = blurb.split(/\s+[–—]\s+/)
	if (rest.length === 0) return { title: blurb }

	const qualifier = rest.join(' — ')

	return {
		title: /[.!?]$/.test(claim) ? claim : `${claim}.`,
		titleMuted: qualifier.charAt(0).toUpperCase() + qualifier.slice(1),
	}
}

export function CategoryPage({ slug }: { slug: CategorySlug }) {
	const dataset = getDataset(slug)
	const { category, metadata } = dataset

	const isLive = dataset.records.length > 0
	const headline = splitHeadline(category.blurb)

	return (
		<>
			{/* The kicker states how many records there are, the way the roster and
			    committee pages do — the headline says what they are. */}
			<PageHeader
				emphasis='brand'
				align='left'
				size='compact'
				eyebrow={
					isLive
						? `${metadata.recordCount.toLocaleString()} ${category.label.toLowerCase()}`
						: `${category.officialLabel} — awaiting capture`
				}
				title={headline.title}
				titleMuted={headline.titleMuted}
				description={category.description}
			/>

			{isLive ? (
				<>
					<RecordBrowser dataset={dataset} />

					{metadata.knownGaps.length > 0 ? (
						<section className='bb-container pb-16'>
							<div className='border-t border-[var(--rule)] pt-6'>
								<p className='label label-strong'>Known gaps in this dataset</p>
								<ul className='mt-4 grid gap-2.5 sm:grid-cols-2 sm:gap-x-10'>
									{metadata.knownGaps.map((gap, index) => (
										<li key={index} className='bb-body text-[var(--ink-3)]'>
											{gap}
										</li>
									))}
								</ul>
							</div>
						</section>
					) : null}
				</>
			) : (
				<AwaitingData category={category} gaps={metadata.knownGaps} />
			)}
		</>
	)
}
